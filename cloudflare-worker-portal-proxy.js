// Cloudflare Worker: Proxy /portal/* to GitHub Pages origin without recursion
export default {
  async fetch(request, env, ctx) {
    const incomingUrl = new URL(request.url);
    const pathname = incomingUrl.pathname || '/';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // API: GTFS Realtime proxy/decoder endpoints
    if (pathname.startsWith('/api/gtfs/')) {
      return handleGtfsApi(request, env);
    }

    // API: Google Transit proxies (secure key injection)
    if (pathname.startsWith('/api/google/')) {
      return handleGoogleApi(request, env);
    }
 
    // Redirect root to app shell
    if (pathname === '/') {
      return Response.redirect(new URL('/portal/', incomingUrl), 302);
    }

    // Portal proxy only
    if (!pathname.startsWith('/portal')) {
      return new Response('Not Found', { status: 404 });
    }

    // Strip /portal prefix for upstream
    let upstreamPath = pathname.replace(/^\/portal/, '');
    if (upstreamPath === '' || upstreamPath === '/') {
      upstreamPath = '/index.html';
    }

    const upstreamUrl = new URL(`https://jobchta.github.io/mumbaitransport${upstreamPath}${incomingUrl.search}`);

    // Build subrequest
    const init = {
      method: request.method,
      headers: new Headers(request.headers),
      redirect: 'follow',
    };

    // Remove hop-by-hop and problematic headers
    const hopHeaders = [
      'connection','keep-alive','proxy-authenticate','proxy-authorization',
      'te','trailer','transfer-encoding','upgrade','accept-encoding',
      'content-length','host','cf-connecting-ip','cf-ipcountry','cf-ray','cf-visitor','x-forwarded-proto','x-forwarded-for'
    ];
    hopHeaders.forEach(h => init.headers.delete(h));

    let upstreamReq;
    if (request.method === 'GET' || request.method === 'HEAD') {
      upstreamReq = new Request(upstreamUrl.toString(), init);
    } else {
      upstreamReq = new Request(upstreamUrl.toString(), request);
    }

    // Cache static assets aggressively
    const isAsset = /\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|json|txt|xml|map|woff2?)$/i.test(upstreamPath);
    const cf = isAsset ? { cacheEverything: true, cacheTtl: 3600 } : { cacheEverything: true, cacheTtl: 120 };

    const upstreamRes = await fetch(upstreamReq, { redirect: 'follow', cf });

    // Clone headers and adjust for portal path
    const headers = new Headers(upstreamRes.headers);

    // Ensure correct content type falls back if missing
    if (!headers.get('content-type')) {
      const guessed = guessContentType(upstreamPath);
      if (guessed) headers.set('content-type', guessed);
    }

    // CORS for XHR/fetch requests
    const origin = request.headers.get('Origin');
    if (origin) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Vary', (headers.get('Vary') ? headers.get('Vary') + ', ' : '') + 'Origin');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      const reqHeaders = request.headers.get('Access-Control-Request-Headers');
      if (reqHeaders) headers.set('Access-Control-Allow-Headers', reqHeaders);
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers,
    });
  }
}

// --- GTFS API handlers ---
async function handleGtfsApi(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'gtfs', '{agency}', '{feed}']
  const agency = parts[2] || '';
  const feed = parts[3] || '';

  if (!agency || !feed) {
    return json({ error: 'Bad request: expected /api/gtfs/{agency}/{feed}' }, 400, request);
  }

  // Resolve upstream endpoint from environment (secure)
  // Expected secrets (examples):
  //   BEST_VEHICLE_POSITIONS_URL, BEST_TRIP_UPDATES_URL, BEST_ALERTS_URL
  //   TRAINS_VEHICLE_POSITIONS_URL, ...
  //   METRO_VEHICLE_POSITIONS_URL, ...
  const key = `${agency}_${feed}`.toUpperCase() + '_URL';
  const upstream = env[key];

  if (!upstream) {
    return json({ error: `Endpoint not configured for ${agency}/${feed}`, hint: `Set secret ${key}` }, 501, request);
  }

  // Optional auth header/token names per agency can be provided as secrets
  // e.g., BEST_AUTH_HEADER='x-api-key', BEST_AUTH_VALUE='xxxxx'
  const authHeaderName = env[`${agency.toUpperCase()}_AUTH_HEADER`];
  const authHeaderValue = env[`${agency.toUpperCase()}_AUTH_VALUE`];

  const upstreamInit = {
    method: 'GET',
    headers: new Headers(),
    cf: { cacheEverything: true, cacheTtl: 30 },
  };
  if (authHeaderName && authHeaderValue) {
    upstreamInit.headers.set(authHeaderName, authHeaderValue);
  }

  // Fetch protobuf feed
  const resp = await fetch(upstream, upstreamInit);
  if (!resp.ok) {
    return json({ error: 'Upstream error', status: resp.status }, 502, request);
  }

  // For now, return raw protobuf with CORS and short cache; decoding will be enabled after feed URLs are provided.
  // NOTE: We can upgrade to server-side decoding using protobufjs with a compiled GTFS-RT schema.
  const headers = new Headers({
    'Content-Type': 'application/x-protobuf',
    'Cache-Control': 'public, max-age=30',
  });
  const origin = request.headers.get('Origin');
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(resp.body, { status: 200, headers });
}

// --- Google Transit proxies (Directions / Places / Distance Matrix) ---
async function handleGoogleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname; // /api/google/{service}
  const service = path.split('/').filter(Boolean)[2] || '';

  const API_KEY = env.GOOGLE_MAPS_API_KEY;
  if (!API_KEY) {
    return json({ error: 'Missing GOOGLE_MAPS_API_KEY secret in Worker env' }, 500, request);
  }

  let upstream;
  const params = new URLSearchParams(url.search);

  // Inject secure key (overrides any client-provided key)
  params.set('key', API_KEY);

  switch (service) {
    case 'directions': {
      const base = env.GOOGLE_TRANSIT_BASE_URL || 'https://maps.googleapis.com/maps/api/directions/json';
      // Ensure transit defaults suitable for Mumbai if not provided
      if (!params.has('mode')) params.set('mode', 'transit');
      if (!params.has('region')) params.set('region', 'in');
      if (!params.has('language')) params.set('language', 'en-IN');
      if (!params.has('units')) params.set('units', 'metric');
      if (!params.has('alternatives')) params.set('alternatives', 'true');
      if (!params.has('departure_time')) params.set('departure_time', 'now');
      upstream = `${base}?${params.toString()}`;
      break;
    }
    case 'places': {
      // Support /api/google/places?endpoint=nearbysearch/json&...
      const endpoint = params.get('endpoint') || 'nearbysearch/json';
      params.delete('endpoint');
      if (!params.has('region')) params.set('region', 'in');
      if (!params.has('language')) params.set('language', 'en-IN');
      const base = env.GOOGLE_PLACES_BASE_URL || 'https://maps.googleapis.com/maps/api/place';
      upstream = `${base}/${endpoint}?${params.toString()}`;
      break;
    }
    case 'distance-matrix': {
      const base = env.GOOGLE_DISTANCE_MATRIX_BASE_URL || 'https://maps.googleapis.com/maps/api/distancematrix/json';
      if (!params.has('mode')) params.set('mode', 'transit');
      if (!params.has('region')) params.set('region', 'in');
      if (!params.has('language')) params.set('language', 'en-IN');
      if (!params.has('units')) params.set('units', 'metric');
      upstream = `${base}?${params.toString()}`;
      break;
    }
    default:
      return json({ error: 'Unknown Google API service. Use directions | places | distance-matrix' }, 400, request);
  }

  const resp = await fetch(upstream, {
    method: 'GET',
    cf: { cacheEverything: true, cacheTtl: 30 },
  });

  const cors = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=30',
  });
  const origin = request.headers.get('Origin');
  if (origin) {
    cors.set('Access-Control-Allow-Origin', origin);
    cors.set('Vary', 'Origin');
  }

  return new Response(resp.body, { status: resp.status, headers: cors });
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  const acrh = request.headers.get('Access-Control-Request-Headers') || 'Content-Type';
  const acrm = request.headers.get('Access-Control-Request-Method') || 'GET';
  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': acrh,
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method',
  });
}

function json(obj, status, request) {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  const origin = request.headers.get('Origin');
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(obj), { status: status || 200, headers });
}

function guessContentType(path) {
  const ext = (path.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'html': return 'text/html; charset=utf-8';
    case 'css': return 'text/css; charset=utf-8';
    case 'js': return 'application/javascript; charset=utf-8';
    case 'json': return 'application/json; charset=utf-8';
    case 'svg': return 'image/svg+xml';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'ico': return 'image/x-icon';
    case 'xml': return 'application/xml; charset=utf-8';
    case 'txt': return 'text/plain; charset=utf-8';
    case 'woff': return 'font/woff';
    case 'woff2': return 'font/woff2';
    default: return '';
  }
}