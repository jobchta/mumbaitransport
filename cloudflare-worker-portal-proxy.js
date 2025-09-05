// Cloudflare Worker: portal proxy to GitHub Pages
// FIX: redirect `/portal` -> `/portal/` so relative URLs resolve correctly
// Route to bind in Cloudflare: mumbaitransport.in/portal*  (and/or your workers.dev test URL)
// Upstream: https://jobchta.github.io/mumbaitransport

export default {
  async fetch(request, env, ctx) {
    const incomingUrl = new URL(request.url);
    const pathname = incomingUrl.pathname || "/";

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // API passthroughs (keep as-is if you use them)
    // JSON GTFS endpoint (expects env to provide *_JSON_URL)
    if (pathname.startsWith("/api/gtfs/json/")) return handleGtfsJson(request, env);
    // Protobuf GTFS passthrough (returns application/x-protobuf)
    if (pathname.startsWith("/api/gtfs/")) return handleGtfsApi(request, env);
    // Google proxy with key injection via env
    if (pathname.startsWith("/api/google/")) return handleGoogleApi(request, env);

    // Root -> /portal/
    if (pathname === "/") {
      return Response.redirect(new URL("/portal/", incomingUrl), 302);
    }

    // CRITICAL FIX:
    // When URL is exactly "/portal" (no trailing slash), browsers resolve relative URLs from "/"
    // causing /src/... requests (404). Redirect to "/portal/" so relative URLs load as /portal/src/...
    if (pathname === "/portal") {
      return Response.redirect(new URL("/portal/", incomingUrl), 301);
    }

    // Only serve under /portal
    if (!pathname.startsWith("/portal")) {
      return new Response("Not Found", { status: 404 });
    }

    // Map /portal/* -> upstream root /*
    let upstreamPath = pathname.replace(/^\/portal/, "") || "/";
    if (upstreamPath === "/") upstreamPath = "/index.html";

    // Build upstream URL to GitHub Pages
    const upstreamUrl = new URL(
      `https://jobchta.github.io/mumbaitransport${upstreamPath}${incomingUrl.search}`
    );

    // Prepare request to upstream
    const init = {
      method: request.method,
      headers: new Headers(request.headers),
      redirect: "follow"
    };

    // Remove hop-by-hop headers
    [
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailer",
      "transfer-encoding",
      "upgrade",
      "accept-encoding",
      "content-length",
      "host",
      "cf-connecting-ip",
      "cf-ipcountry",
      "cf-ray",
      "cf-visitor",
      "x-forwarded-proto",
      "x-forwarded-for",
      "__cfRLUnblockHandlers"
    ].forEach((h) => init.headers.delete(h));

    // Avoid __cfRLUnblockHandlers conflicts
    if (!init.headers.get("CF-Bypass")) init.headers.set("CF-Bypass", "true");

    const upstreamReq =
      request.method === "GET" || request.method === "HEAD"
        ? new Request(upstreamUrl.toString(), init)
        : new Request(upstreamUrl.toString(), request);

    // Cache assets longer
    const isAsset = /\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|json|txt|xml|map|woff2?)$/i.test(
      upstreamPath
    );
    const cf = isAsset ? { cacheEverything: true, cacheTtl: 3600 } : { cacheEverything: true, cacheTtl: 120 };

    const upstreamRes = await fetch(upstreamReq, { redirect: "follow", cf });
    const headers = new Headers(upstreamRes.headers);

    // If HTML, inject Google Maps JS with key stored in Worker env (never in repo)
    const contentType = headers.get("content-type") || "";
    const shouldInject = contentType.includes("text/html") || upstreamPath.endsWith(".html");
    if (shouldInject) {
      const apiKey = env.GOOGLE_MAPS_API_KEY || env.GMAPS_JS_KEY || "";
      // Never expose if not configured
      const mapsScript = apiKey
        ? `<script async defer src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps"></script>`
        : "";

      const html = await upstreamRes.text();
      let out = html;
      if (mapsScript) {
        if (html.includes("<!-- MAPS_JS_INJECTED_BY_WORKER -->")) {
          out = html.replace("<!-- MAPS_JS_INJECTED_BY_WORKER -->", mapsScript);
        } else if (html.includes("</head>")) {
          out = html.replace("</head>", `${mapsScript}\n</head>`);
        }
      }
      const injHeaders = new Headers(headers);
      injHeaders.set("content-type", "text/html; charset=utf-8");
      return new Response(out, { status: upstreamRes.status, statusText: upstreamRes.statusText, headers: injHeaders });
    }

    // Guess content-type if missing
    if (!headers.get("content-type")) {
      const guessed = guessContentType(upstreamPath);
      if (guessed) headers.set("content-type", guessed);
    }

    // Reflect CORS
    const origin = request.headers.get("Origin");
    if (origin) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", (headers.get("Vary") ? headers.get("Vary") + ", " : "") + "Origin");
      headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      const reqHeaders = request.headers.get("Access-Control-Request-Headers");
      if (reqHeaders) headers.set("Access-Control-Allow-Headers", reqHeaders);
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers
    });
  }
};

// ---------- Helpers below (same as your current worker, kept minimal) ----------

async function handleGtfsApi(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const agency = parts[2] || "";
  const feed = parts[3] || "";
  if (!agency || !feed) {
    return json({ error: "Bad request: expected /api/gtfs/{agency}/{feed}" }, 400, request);
  }
  const key = `${agency}_${feed}`.toUpperCase() + "_URL";
  const upstream = env[key];
  if (!upstream) {
    return json({ error: `Endpoint not configured for ${agency}/${feed}`, hint: `Set secret ${key}` }, 501, request);
  }
  const authHeaderName = env[`${agency.toUpperCase()}_AUTH_HEADER`];
  const authHeaderValue = env[`${agency.toUpperCase()}_AUTH_VALUE`];
  const upstreamInit = { method: "GET", headers: new Headers(), cf: { cacheEverything: true, cacheTtl: 30 } };
  if (authHeaderName && authHeaderValue) upstreamInit.headers.set(authHeaderName, authHeaderValue);
  const resp = await fetch(upstream, upstreamInit);
  if (!resp.ok) return json({ error: "Upstream error", status: resp.status }, 502, request);

  const headers = new Headers({ "Content-Type": "application/x-protobuf", "Cache-Control": "public, max-age=30" });
  const origin = request.headers.get("Origin");
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(resp.body, { status: 200, headers });
}

async function handleGoogleApi(request, env) {
  const url = new URL(request.url);
  const service = url.pathname.split("/").filter(Boolean)[2] || "";
  const API_KEY = env.GOOGLE_MAPS_API_KEY;
  if (!API_KEY) return json({ error: "Missing GOOGLE_MAPS_API_KEY secret in Worker env" }, 500, request);

  const params = new URLSearchParams(url.search);
  params.set("key", API_KEY);
  let upstream;
  switch (service) {
    case "directions": {
      const base = env.GOOGLE_TRANSIT_BASE_URL || "https://maps.googleapis.com/maps/api/directions/json";
      if (!params.has("mode")) params.set("mode", "transit");
      if (!params.has("region")) params.set("region", "in");
      if (!params.has("departure_time")) params.set("departure_time", "now");
      upstream = `${base}?${params.toString()}`;
      break;
    }
    case "places": {
      const endpoint = params.get("endpoint") || "nearbysearch/json";
      params.delete("endpoint");
      const base = env.GOOGLE_PLACES_BASE_URL || "https://maps.googleapis.com/maps/api/place";
      upstream = `${base}/${endpoint}?${params.toString()}`;
      break;
    }
    case "distance-matrix": {
      const base = env.GOOGLE_DISTANCE_MATRIX_BASE_URL || "https://maps.googleapis.com/maps/api/distancematrix/json";
      if (!params.has("mode")) params.set("mode", "transit");
      if (!params.has("region")) params.set("region", "in");
      upstream = `${base}?${params.toString()}`;
      break;
    }
    default:
      return json({ error: "Unknown Google API service. Use directions | places | distance-matrix" }, 400, request);
  }
  const resp = await fetch(upstream, { method: "GET", cf: { cacheEverything: true, cacheTtl: 30 } });
  const cors = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=30" });
  const origin = request.headers.get("Origin");
  if (origin) {
    cors.set("Access-Control-Allow-Origin", origin);
    cors.set("Vary", "Origin");
  }
  return new Response(resp.body, { status: resp.status, headers: cors });
}

/**
 * JSON GTFS passthrough. Expects env secrets like:
 *  - MMRDA_METRO_JSON_URL
 *  - BEST_BUS_JSON_URL
 * Optionally:
 *  - MMRDA_AUTH_HEADER / MMRDA_AUTH_VALUE
 */
async function handleGtfsJson(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean); // ['api','gtfs','json','{agency}','{feed}']
  const agency = (parts[3] || "").toUpperCase();
  const feed   = (parts[4] || "").toUpperCase();

  if (!agency || !feed) {
    return json({ error: "Bad request: expected /api/gtfs/json/{agency}/{feed}" }, 400, request);
  }

  const key = `${agency}_${feed}_JSON_URL`;
  const upstream = env[key];
  if (!upstream) {
    return json({ error: `JSON endpoint not configured for ${agency}/${feed}`, hint: `Set secret ${key}` }, 501, request);
  }

  const authHeaderName  = env[`${agency}_AUTH_HEADER`];
  const authHeaderValue = env[`${agency}_AUTH_VALUE`];

  const upstreamInit = {
    method: "GET",
    headers: new Headers(),
    cf: { cacheEverything: true, cacheTtl: 15 }
  };
  if (authHeaderName && authHeaderValue) {
    upstreamInit.headers.set(authHeaderName, authHeaderValue);
  }

  const resp = await fetch(upstream, upstreamInit);
  if (!resp.ok) {
    return json({ error: "Upstream error", status: resp.status }, 502, request);
  }

  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=15"
  });
  const origin = request.headers.get("Origin");
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(resp.body, { status: 200, headers });
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  const acrh = request.headers.get("Access-Control-Request-Headers") || "Content-Type";
  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": acrh,
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin, Access-Control-Request-Headers, Access-Control-Request-Method"
  });
}

function json(obj, status, request) {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
  const origin = request.headers.get("Origin");
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(obj), { status: status || 200, headers });
}

function guessContentType(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
  switch (ext) {
    case "html": return "text/html; charset=utf-8";
    case "css": return "text/css; charset=utf-8";
    case "js": return "application/javascript; charset=utf-8";
    case "json": return "application/json; charset=utf-8";
    case "svg": return "image/svg+xml";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "webp": return "image/webp";
    case "ico": return "image/x-icon";
    case "xml": return "application/xml; charset=utf-8";
    case "txt": return "text/plain; charset=utf-8";
    case "woff": return "font/woff";
    case "woff2": return "font/woff2";
    default: return "";
  }
}