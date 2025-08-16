// Cloudflare Worker: Proxy /portal/* to GitHub Pages origin without recursion
export default {
  async fetch(request, env, ctx) {
    const incomingUrl = new URL(request.url);
    const pathname = incomingUrl.pathname || '/';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // API: Authentication endpoints
    if (pathname.startsWith('/api/auth/')) {
      return handleAuthApi(request, env);
    }

    // API: User data endpoints
    if (pathname.startsWith('/api/user/')) {
      return handleUserApi(request, env);
    }

    // API: Ride-hailing endpoints
    if (pathname.startsWith('/api/rides/')) {
      return handleRidesApi(request, env);
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
  
  // --- Authentication API handlers ---
  async function handleAuthApi(request, env) {
    const url = new URL(request.url);
    const path = url.pathname; // /api/auth/{action}
    const action = path.split('/').filter(Boolean)[2] || '';
  
    switch (action) {
      case 'google':
        return handleGoogleAuth(request, env);
      case 'logout':
        return handleLogout(request, env);
      case 'verify':
        return handleVerifyToken(request, env);
      default:
        return json({ error: 'Unknown auth action. Use: google | logout | verify' }, 400, request);
    }
  }
  
  async function handleGoogleAuth(request, env) {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, request);
    }
  
    try {
      const { credential } = await request.json();
      
      if (!credential) {
        return json({ error: 'Missing Google credential' }, 400, request);
      }
  
      // Verify Google JWT token
      const googleUser = await verifyGoogleToken(credential, env);
      if (!googleUser) {
        return json({ error: 'Invalid Google token' }, 401, request);
      }
  
      // Generate our own JWT for the user
      const userToken = await generateUserToken(googleUser, env);
      
      // Store/update user in database
      await storeUser(googleUser, env);
  
      const headers = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': `auth_token=${userToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/`
      });
  
      const origin = request.headers.get('Origin');
      if (origin) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Credentials', 'true');
        headers.set('Vary', 'Origin');
      }
  
      return new Response(JSON.stringify({
        success: true,
        user: {
          id: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture
        }
      }), { status: 200, headers });
  
    } catch (error) {
      console.error('Google auth error:', error);
      return json({ error: 'Authentication failed' }, 500, request);
    }
  }
  
  async function handleLogout(request, env) {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    });
  
    const origin = request.headers.get('Origin');
    if (origin) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Credentials', 'true');
      headers.set('Vary', 'Origin');
    }
  
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  }
  
  async function handleVerifyToken(request, env) {
    try {
      const authToken = getCookieValue(request, 'auth_token');
      if (!authToken) {
        return json({ error: 'No auth token' }, 401, request);
      }
  
      const user = await verifyUserToken(authToken, env);
      if (!user) {
        return json({ error: 'Invalid token' }, 401, request);
      }
  
      return json({ success: true, user }, 200, request);
    } catch (error) {
      return json({ error: 'Token verification failed' }, 401, request);
    }
  }
  
  // --- User Data API handlers ---
  async function handleUserApi(request, env) {
    const url = new URL(request.url);
    const path = url.pathname; // /api/user/{action}
    const action = path.split('/').filter(Boolean)[2] || '';
  
    // Verify authentication for all user endpoints
    const authToken = getCookieValue(request, 'auth_token');
    if (!authToken) {
      return json({ error: 'Authentication required' }, 401, request);
    }
  
    const user = await verifyUserToken(authToken, env);
    if (!user) {
      return json({ error: 'Invalid authentication' }, 401, request);
    }
  
    switch (action) {
      case 'profile':
        return handleUserProfile(request, env, user);
      case 'preferences':
        return handleUserPreferences(request, env, user);
      case 'locations':
        return handleUserLocations(request, env, user);
      default:
        return json({ error: 'Unknown user action. Use: profile | preferences | locations' }, 400, request);
    }
  }
  
  async function handleUserProfile(request, env, user) {
    if (request.method === 'GET') {
      const userData = await getUserData(user.sub, env);
      return json({ success: true, user: userData }, 200, request);
    }
    
    if (request.method === 'PUT') {
      const updates = await request.json();
      const updatedUser = await updateUserData(user.sub, updates, env);
      return json({ success: true, user: updatedUser }, 200, request);
    }
  
    return json({ error: 'Method not allowed' }, 405, request);
  }
  
  async function handleUserPreferences(request, env, user) {
    if (request.method === 'GET') {
      const preferences = await getUserPreferences(user.sub, env);
      return json({ success: true, preferences }, 200, request);
    }
    
    if (request.method === 'PUT') {
      const preferences = await request.json();
      await updateUserPreferences(user.sub, preferences, env);
      return json({ success: true }, 200, request);
    }
  
    return json({ error: 'Method not allowed' }, 405, request);
  }
  
  async function handleUserLocations(request, env, user) {
    if (request.method === 'GET') {
      const locations = await getUserLocations(user.sub, env);
      return json({ success: true, locations }, 200, request);
    }
    
    if (request.method === 'POST') {
      const location = await request.json();
      await addUserLocation(user.sub, location, env);
      return json({ success: true }, 200, request);
    }
  
    if (request.method === 'DELETE') {
      const { locationId } = await request.json();
      await deleteUserLocation(user.sub, locationId, env);
      return json({ success: true }, 200, request);
    }
  
    return json({ error: 'Method not allowed' }, 405, request);
  }
  
  // --- Ride-hailing API handlers ---
  async function handleRidesApi(request, env) {
    const url = new URL(request.url);
    const path = url.pathname; // /api/rides/{provider}/{action}
    const parts = path.split('/').filter(Boolean);
    const provider = parts[2] || '';
    const action = parts[3] || '';
  
    // Verify authentication for ride endpoints
    const authToken = getCookieValue(request, 'auth_token');
    if (!authToken) {
      return json({ error: 'Authentication required' }, 401, request);
    }
  
    const user = await verifyUserToken(authToken, env);
    if (!user) {
      return json({ error: 'Invalid authentication' }, 401, request);
    }
  
    switch (provider) {
      case 'uber':
        return handleUberApi(request, env, user, action);
      case 'ola':
        return handleOlaApi(request, env, user, action);
      default:
        return json({ error: 'Unknown provider. Use: uber | ola' }, 400, request);
    }
  }
  
  async function handleUberApi(request, env, user, action) {
    switch (action) {
      case 'connect':
        return handleUberConnect(request, env, user);
      case 'estimate':
        return handleUberEstimate(request, env, user);
      case 'request':
        return handleUberRequest(request, env, user);
      default:
        return json({ error: 'Unknown Uber action. Use: connect | estimate | request' }, 400, request);
    }
  }
  
  async function handleOlaApi(request, env, user, action) {
    switch (action) {
      case 'connect':
        return handleOlaConnect(request, env, user);
      case 'estimate':
        return handleOlaEstimate(request, env, user);
      case 'request':
        return handleOlaRequest(request, env, user);
      default:
        return json({ error: 'Unknown Ola action. Use: connect | estimate | request' }, 400, request);
    }
  }
  
  // --- Authentication Helper Functions ---
  async function verifyGoogleToken(credential, env) {
    try {
      // Verify Google JWT token with Google's public keys
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      const tokenInfo = await response.json();
      
      if (tokenInfo.error) {
        return null;
      }
  
      // Verify the token is for our app
      if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
        return null;
      }
  
      return tokenInfo;
    } catch (error) {
      console.error('Google token verification failed:', error);
      return null;
    }
  }
  
  async function generateUserToken(googleUser, env) {
    const payload = {
      sub: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    };
  
    // Simple JWT signing (in production, use proper JWT library)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadStr = btoa(JSON.stringify(payload));
    const signature = await signJWT(`${header}.${payloadStr}`, env.JWT_SECRET);
    
    return `${header}.${payloadStr}.${signature}`;
  }
  
  async function verifyUserToken(token, env) {
    try {
      const [header, payload, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = await signJWT(`${header}.${payload}`, env.JWT_SECRET);
      if (signature !== expectedSignature) {
        return null;
      }
  
      const user = JSON.parse(atob(payload));
      
      // Check expiration
      if (user.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
  
      return user;
    } catch (error) {
      return null;
    }
  }
  
  async function signJWT(data, secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }
  
  // --- Database Helper Functions (using KV for simplicity) ---
  async function storeUser(googleUser, env) {
    const userData = {
      id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        defaultTransportModes: ['metro', 'bus'],
        savedLocations: []
      },
      connectedAccounts: {
        uber: { connected: false },
        ola: { connected: false }
      }
    };
  
    if (env.USER_DATA_KV) {
      await env.USER_DATA_KV.put(`user:${googleUser.sub}`, JSON.stringify(userData));
    }
    
    return userData;
  }
  
  async function getUserData(userId, env) {
    if (!env.USER_DATA_KV) return null;
    
    const userData = await env.USER_DATA_KV.get(`user:${userId}`);
    return userData ? JSON.parse(userData) : null;
  }
  
  async function updateUserData(userId, updates, env) {
    if (!env.USER_DATA_KV) return null;
    
    const existing = await getUserData(userId, env);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await env.USER_DATA_KV.put(`user:${userId}`, JSON.stringify(updated));
    
    return updated;
  }
  
  async function getUserPreferences(userId, env) {
    const userData = await getUserData(userId, env);
    return userData?.preferences || {};
  }
  
  async function updateUserPreferences(userId, preferences, env) {
    const userData = await getUserData(userId, env);
    if (!userData) return;
    
    userData.preferences = { ...userData.preferences, ...preferences };
    userData.updatedAt = new Date().toISOString();
    
    await env.USER_DATA_KV.put(`user:${userId}`, JSON.stringify(userData));
  }
  
  async function getUserLocations(userId, env) {
    const preferences = await getUserPreferences(userId, env);
    return preferences.savedLocations || [];
  }
  
  async function addUserLocation(userId, location, env) {
    const userData = await getUserData(userId, env);
    if (!userData) return;
    
    if (!userData.preferences.savedLocations) {
      userData.preferences.savedLocations = [];
    }
    
    userData.preferences.savedLocations.push({
      id: crypto.randomUUID(),
      ...location,
      createdAt: new Date().toISOString()
    });
    
    userData.updatedAt = new Date().toISOString();
    await env.USER_DATA_KV.put(`user:${userId}`, JSON.stringify(userData));
  }
  
  async function deleteUserLocation(userId, locationId, env) {
    const userData = await getUserData(userId, env);
    if (!userData) return;
    
    if (userData.preferences.savedLocations) {
      userData.preferences.savedLocations = userData.preferences.savedLocations.filter(
        loc => loc.id !== locationId
      );
      userData.updatedAt = new Date().toISOString();
      await env.USER_DATA_KV.put(`user:${userId}`, JSON.stringify(userData));
    }
  }
  
  // --- Uber API Functions (Placeholder - will implement with real API) ---
  async function handleUberConnect(request, env, user) {
    // TODO: Implement Uber OAuth flow
    return json({ error: 'Uber connection not yet implemented' }, 501, request);
  }
  
  async function handleUberEstimate(request, env, user) {
    // TODO: Implement Uber fare estimation
    return json({ error: 'Uber estimates not yet implemented' }, 501, request);
  }
  
  async function handleUberRequest(request, env, user) {
    // TODO: Implement Uber ride request
    return json({ error: 'Uber ride request not yet implemented' }, 501, request);
  }
  
  // --- Ola API Functions (Placeholder - will implement with real API) ---
  async function handleOlaConnect(request, env, user) {
    // TODO: Implement Ola OAuth flow
    return json({ error: 'Ola connection not yet implemented' }, 501, request);
  }
  
  async function handleOlaEstimate(request, env, user) {
    // TODO: Implement Ola fare estimation
    return json({ error: 'Ola estimates not yet implemented' }, 501, request);
  }
  
  async function handleOlaRequest(request, env, user) {
    // TODO: Implement Ola ride request
    return json({ error: 'Ola ride request not yet implemented' }, 501, request);
  }
  
  // --- Utility Functions ---
  function getCookieValue(request, name) {
    const cookies = request.headers.get('Cookie');
    if (!cookies) return null;
    
    const cookie = cookies.split(';').find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
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