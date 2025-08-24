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
      // Special handling for compare endpoint (doesn't need user auth in routing)
      if (pathname === '/api/rides/compare') {
        return handleFareComparison(request, env);
      }
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
      case 'callback':
        return handleUberCallback(request, env);
      case 'estimate':
        return handleUberEstimate(request, env, user);
      case 'request':
        return handleUberRequest(request, env, user);
      default:
        return json({ error: 'Unknown Uber action. Use: connect | callback | estimate | request' }, 400, request);
    }
  }
  
  async function handleOlaApi(request, env, user, action) {
    switch (action) {
      case 'connect':
        return handleOlaConnect(request, env, user);
      case 'callback':
        return handleOlaCallback(request, env);
      case 'estimate':
        return handleOlaEstimate(request, env, user);
      case 'request':
        return handleOlaRequest(request, env, user);
      default:
        return json({ error: 'Unknown Ola action. Use: connect | callback | estimate | request' }, 400, request);
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
  
  // --- Uber API Functions (Real Implementation) ---
  async function handleUberConnect(request, env, user) {
    try {
      const UBER_CLIENT_ID = env.UBER_CLIENT_ID;
      const UBER_REDIRECT_URI = env.UBER_REDIRECT_URI || `${new URL(request.url).origin}/api/rides/uber/callback`;
      
      if (!UBER_CLIENT_ID) {
        return json({ error: 'Uber API not configured' }, 500, request);
      }

      // Generate OAuth URL for Uber
      const scopes = ['profile', 'request', 'request_receipt'];
      const state = crypto.randomUUID();
      
      // Store state for verification
      if (env.USER_DATA_KV) {
        await env.USER_DATA_KV.put(`uber_state:${user.sub}`, state, { expirationTtl: 600 });
      }

      const authUrl = new URL('https://login.uber.com/oauth/v2/authorize');
      authUrl.searchParams.set('client_id', UBER_CLIENT_ID);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', UBER_REDIRECT_URI);
      authUrl.searchParams.set('scope', scopes.join(' '));
      authUrl.searchParams.set('state', state);

      return json({
        success: true,
        authUrl: authUrl.toString(),
        message: 'Redirect user to this URL to connect Uber account'
      }, 200, request);

    } catch (error) {
      console.error('Uber connect error:', error);
      return json({ error: 'Failed to initiate Uber connection' }, 500, request);
    }
  }
  
  async function handleUberEstimate(request, env, user) {
    try {
      const { start_latitude, start_longitude, end_latitude, end_longitude } = await request.json();
      
      if (!start_latitude || !start_longitude || !end_latitude || !end_longitude) {
        return json({ error: 'Missing required coordinates' }, 400, request);
      }

      // Get user's Uber access token
      const userData = await getUserData(user.sub, env);
      const uberToken = userData?.connectedAccounts?.uber?.accessToken;
      
      if (!uberToken) {
        return json({ error: 'Uber account not connected' }, 401, request);
      }

      // Call Uber Price Estimates API
      const estimateUrl = new URL('https://api.uber.com/v1.2/estimates/price');
      estimateUrl.searchParams.set('start_latitude', start_latitude);
      estimateUrl.searchParams.set('start_longitude', start_longitude);
      estimateUrl.searchParams.set('end_latitude', end_latitude);
      estimateUrl.searchParams.set('end_longitude', end_longitude);

      const response = await fetch(estimateUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${uberToken}`,
          'Accept-Language': 'en_IN',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Uber API error: ${response.status}`);
      }

      const estimates = await response.json();
      
      // Transform to our format
      const transformedEstimates = estimates.prices?.map(price => ({
        service: price.display_name,
        estimate: price.estimate,
        low_estimate: price.low_estimate,
        high_estimate: price.high_estimate,
        currency_code: price.currency_code,
        duration: price.duration,
        distance: price.distance,
        surge_multiplier: price.surge_multiplier || 1.0
      })) || [];

      return json({
        success: true,
        provider: 'uber',
        estimates: transformedEstimates,
        timestamp: new Date().toISOString()
      }, 200, request);

    } catch (error) {
      console.error('Uber estimate error:', error);
      return json({ error: 'Failed to get Uber estimates' }, 500, request);
    }
  }
  
  async function handleUberRequest(request, env, user) {
    try {
      const { start_latitude, start_longitude, end_latitude, end_longitude, product_id } = await request.json();
      
      if (!start_latitude || !start_longitude || !end_latitude || !end_longitude || !product_id) {
        return json({ error: 'Missing required parameters' }, 400, request);
      }

      // Get user's Uber access token
      const userData = await getUserData(user.sub, env);
      const uberToken = userData?.connectedAccounts?.uber?.accessToken;
      
      if (!uberToken) {
        return json({ error: 'Uber account not connected' }, 401, request);
      }

      // Request ride via Uber API
      const response = await fetch('https://api.uber.com/v1.2/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${uberToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_latitude,
          start_longitude,
          end_latitude,
          end_longitude,
          product_id
        })
      });

      if (!response.ok) {
        throw new Error(`Uber request error: ${response.status}`);
      }

      const rideRequest = await response.json();

      return json({
        success: true,
        provider: 'uber',
        request_id: rideRequest.request_id,
        status: rideRequest.status,
        eta: rideRequest.eta,
        driver: rideRequest.driver,
        vehicle: rideRequest.vehicle,
        location: rideRequest.location
      }, 200, request);

    } catch (error) {
      console.error('Uber request error:', error);
      return json({ error: 'Failed to request Uber ride' }, 500, request);
    }
  }
  
  // --- Ola API Functions (Real Implementation) ---
  async function handleOlaConnect(request, env, user) {
    try {
      const OLA_CLIENT_ID = env.OLA_CLIENT_ID;
      const OLA_REDIRECT_URI = env.OLA_REDIRECT_URI || `${new URL(request.url).origin}/api/rides/ola/callback`;
      
      if (!OLA_CLIENT_ID) {
        return json({ error: 'Ola API not configured' }, 500, request);
      }

      // Generate OAuth URL for Ola
      const scopes = ['profile', 'booking'];
      const state = crypto.randomUUID();
      
      // Store state for verification
      if (env.USER_DATA_KV) {
        await env.USER_DATA_KV.put(`ola_state:${user.sub}`, state, { expirationTtl: 600 });
      }

      const authUrl = new URL('https://accounts.olacabs.com/oauth2/authorize');
      authUrl.searchParams.set('client_id', OLA_CLIENT_ID);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', OLA_REDIRECT_URI);
      authUrl.searchParams.set('scope', scopes.join(' '));
      authUrl.searchParams.set('state', state);

      return json({
        success: true,
        authUrl: authUrl.toString(),
        message: 'Redirect user to this URL to connect Ola account'
      }, 200, request);

    } catch (error) {
      console.error('Ola connect error:', error);
      return json({ error: 'Failed to initiate Ola connection' }, 500, request);
    }
  }
  
  async function handleOlaEstimate(request, env, user) {
    try {
      const { pickup_lat, pickup_lng, drop_lat, drop_lng } = await request.json();
      
      if (!pickup_lat || !pickup_lng || !drop_lat || !drop_lng) {
        return json({ error: 'Missing required coordinates' }, 400, request);
      }

      // Get user's Ola access token
      const userData = await getUserData(user.sub, env);
      const olaToken = userData?.connectedAccounts?.ola?.accessToken;
      
      if (!olaToken) {
        return json({ error: 'Ola account not connected' }, 401, request);
      }

      // Call Ola Fare Estimate API
      const response = await fetch('https://devapi.olacabs.com/v1/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${olaToken}`,
          'Content-Type': 'application/json',
          'X-APP-TOKEN': env.OLA_APP_TOKEN
        },
        body: JSON.stringify({
          pickup_lat,
          pickup_lng,
          drop_lat,
          drop_lng
        })
      });

      if (!response.ok) {
        throw new Error(`Ola API error: ${response.status}`);
      }

      const products = await response.json();
      
      // Transform to our format
      const transformedEstimates = products.categories?.map(category => ({
        service: category.display_name,
        estimate: `₹${category.fare_breakup?.total_fare || 'N/A'}`,
        low_estimate: category.fare_breakup?.minimum_fare,
        high_estimate: category.fare_breakup?.maximum_fare,
        currency_code: 'INR',
        duration: category.eta,
        distance: category.distance,
        surge_multiplier: category.surge_multiplier || 1.0
      })) || [];

      return json({
        success: true,
        provider: 'ola',
        estimates: transformedEstimates,
        timestamp: new Date().toISOString()
      }, 200, request);

    } catch (error) {
      console.error('Ola estimate error:', error);
      return json({ error: 'Failed to get Ola estimates' }, 500, request);
    }
  }
  
  async function handleOlaRequest(request, env, user) {
    try {
      const { pickup_lat, pickup_lng, drop_lat, drop_lng, category } = await request.json();
      
      if (!pickup_lat || !pickup_lng || !drop_lat || !drop_lng || !category) {
        return json({ error: 'Missing required parameters' }, 400, request);
      }

      // Get user's Ola access token
      const userData = await getUserData(user.sub, env);
      const olaToken = userData?.connectedAccounts?.ola?.accessToken;
      
      if (!olaToken) {
        return json({ error: 'Ola account not connected' }, 401, request);
      }

      // Request ride via Ola API
      const response = await fetch('https://devapi.olacabs.com/v1/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${olaToken}`,
          'Content-Type': 'application/json',
          'X-APP-TOKEN': env.OLA_APP_TOKEN
        },
        body: JSON.stringify({
          pickup_lat,
          pickup_lng,
          drop_lat,
          drop_lng,
          category
        })
      });

      if (!response.ok) {
        throw new Error(`Ola request error: ${response.status}`);
      }

      const booking = await response.json();

      return json({
        success: true,
        provider: 'ola',
        booking_id: booking.booking_id,
        status: booking.status,
        eta: booking.eta,
        driver: booking.driver_details,
        vehicle: booking.vehicle_details,
        otp: booking.otp
      }, 200, request);

    } catch (error) {
      console.error('Ola request error:', error);
      return json({ error: 'Failed to request Ola ride' }, 500, request);
    }
  }

  // --- OAuth Callback Handlers ---
  async function handleUberCallback(request, env) {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (!code || !state) {
        return json({ error: 'Missing authorization code or state' }, 400, request);
      }

      // Verify state and get user
      const authToken = getCookieValue(request, 'auth_token');
      if (!authToken) {
        return json({ error: 'Authentication required' }, 401, request);
      }

      const user = await verifyUserToken(authToken, env);
      if (!user) {
        return json({ error: 'Invalid authentication' }, 401, request);
      }

      // Verify state matches
      const storedState = await env.USER_DATA_KV?.get(`uber_state:${user.sub}`);
      if (storedState !== state) {
        return json({ error: 'Invalid state parameter' }, 400, request);
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://login.uber.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: env.UBER_CLIENT_ID,
          client_secret: env.UBER_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: env.UBER_REDIRECT_URI || `${new URL(request.url).origin}/api/rides/uber/callback`
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokens = await tokenResponse.json();

      // Update user data with Uber connection
      const userData = await getUserData(user.sub, env);
      if (userData) {
        userData.connectedAccounts.uber = {
          connected: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          connectedAt: new Date().toISOString()
        };
        await env.USER_DATA_KV.put(`user:${user.sub}`, JSON.stringify(userData));
      }

      // Clean up state
      await env.USER_DATA_KV?.delete(`uber_state:${user.sub}`);

      return json({
        success: true,
        message: 'Uber account connected successfully'
      }, 200, request);

    } catch (error) {
      console.error('Uber callback error:', error);
      return json({ error: 'Failed to connect Uber account' }, 500, request);
    }
  }

  async function handleOlaCallback(request, env) {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (!code || !state) {
        return json({ error: 'Missing authorization code or state' }, 400, request);
      }

      // Verify state and get user
      const authToken = getCookieValue(request, 'auth_token');
      if (!authToken) {
        return json({ error: 'Authentication required' }, 401, request);
      }

      const user = await verifyUserToken(authToken, env);
      if (!user) {
        return json({ error: 'Invalid authentication' }, 401, request);
      }

      // Verify state matches
      const storedState = await env.USER_DATA_KV?.get(`ola_state:${user.sub}`);
      if (storedState !== state) {
        return json({ error: 'Invalid state parameter' }, 400, request);
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://accounts.olacabs.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: env.OLA_CLIENT_ID,
          client_secret: env.OLA_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: env.OLA_REDIRECT_URI || `${new URL(request.url).origin}/api/rides/ola/callback`
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokens = await tokenResponse.json();

      // Update user data with Ola connection
      const userData = await getUserData(user.sub, env);
      if (userData) {
        userData.connectedAccounts.ola = {
          connected: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          connectedAt: new Date().toISOString()
        };
        await env.USER_DATA_KV.put(`user:${user.sub}`, JSON.stringify(userData));
      }

      // Clean up state
      await env.USER_DATA_KV?.delete(`ola_state:${user.sub}`);

      return json({
        success: true,
        message: 'Ola account connected successfully'
      }, 200, request);

    } catch (error) {
      console.error('Ola callback error:', error);
      return json({ error: 'Failed to connect Ola account' }, 500, request);
    }
  }

  // --- Combined Fare Comparison ---
  async function handleFareComparison(request, env) {
    try {
      const authToken = getCookieValue(request, 'auth_token');
      if (!authToken) {
        return json({ error: 'Authentication required' }, 401, request);
      }

      const user = await verifyUserToken(authToken, env);
      if (!user) {
        return json({ error: 'Invalid authentication' }, 401, request);
      }

      const { start_latitude, start_longitude, end_latitude, end_longitude } = await request.json();
      
      if (!start_latitude || !start_longitude || !end_latitude || !end_longitude) {
        return json({ error: 'Missing required coordinates' }, 400, request);
      }

      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        providers: {}
      };

      // Get Uber estimates
      try {
        const uberEstimate = await handleUberEstimate(
          new Request(request.url, {
            method: 'POST',
            body: JSON.stringify({ start_latitude, start_longitude, end_latitude, end_longitude })
          }),
          env,
          user
        );
        const uberData = await uberEstimate.json();
        if (uberData.success) {
          results.providers.uber = uberData;
        }
      } catch (error) {
        results.providers.uber = { error: 'Uber estimates unavailable' };
      }

      // Get Ola estimates
      try {
        const olaEstimate = await handleOlaEstimate(
          new Request(request.url, {
            method: 'POST',
            body: JSON.stringify({
              pickup_lat: start_latitude,
              pickup_lng: start_longitude,
              drop_lat: end_latitude,
              drop_lng: end_longitude
            })
          }),
          env,
          user
        );
        const olaData = await olaEstimate.json();
        if (olaData.success) {
          results.providers.ola = olaData;
        }
      } catch (error) {
        results.providers.ola = { error: 'Ola estimates unavailable' };
      }

      return json(results, 200, request);

    } catch (error) {
      console.error('Fare comparison error:', error);
      return json({ error: 'Failed to compare fares' }, 500, request);
    }
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