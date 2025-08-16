// Cloudflare Worker: Proxy /portal/* to GitHub Pages origin without recursion
export default {
  async fetch(request, env, ctx) {
    const incomingUrl = new URL(request.url);

    // Only handle /portal path; optionally redirect / to /portal/
    if (incomingUrl.pathname === '/') {
      return Response.redirect(new URL('/portal/', incomingUrl), 302);
    }

    // CORS preflight if needed (not typical for navigations)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    if (!incomingUrl.pathname.startsWith('/portal')) {
      return new Response('Not Found', { status: 404 });
    }

    // Strip /portal prefix
    let upstreamPath = incomingUrl.pathname.replace(/^\/portal/, '');
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

    // Optional CORS for XHR requests from other origins (not needed for normal nav)
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