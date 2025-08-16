# Mumbai Transport Portal — Operations Runbook

Purpose: maintain a single, accurate source of truth so any agent can understand, operate, and extend the live /portal app without guesswork.

Status: Production
- Public entrypoint: https://mumbaitransport.in/portal/
- App scope: /portal/
- Origin: GitHub Pages (static) proxied via Cloudflare Worker
- Repo: main branch (automation deploys Worker via GitHub Actions if configured)
- PWA: Installed experience, offline fallback, SW scoped to /portal/

--------------------------------------------------------------------------------

Architecture (high level)

1) Browser (user)
   - Loads the app shell at /portal/
   - Uses Google Maps JS for map rendering and UI
   - For routing: calls our Worker proxy /api/google/* (REST-first) and auto-falls back to JS DirectionsService on failure
   - Service Worker provides network-first for HTML, cache-first for static, and an offline fallback

2) Cloudflare Worker (edge)
   - Reverse proxies /portal/* to the GitHub Pages origin (prevents recursion and removes hop-by-hop headers)
   - Hosts secure Google API proxy endpoints under /api/google/*
   - Scaffolds GTFS Realtime fetch endpoints /api/gtfs/{agency}/{feed}
   - Adds CORS, short edge caching for APIs, and strong caching for static assets

3) GitHub Pages (origin)
   - Serves the static assets (HTML, JS, CSS, icons, manifest) consumed via the Worker

--------------------------------------------------------------------------------

Key Files (click to open)
- Worker (edge):
  - [cloudflare-worker-portal-proxy.js](../../cloudflare-worker-portal-proxy.js:1)
  - [wrangler.toml](../../wrangler.toml:1)
- Frontend (root):
  - [index.html](../../index.html:1)
  - [sw.js](../../sw.js:1)
  - [offline.html](../../offline.html:1)
  - [manifest.json](../../manifest.json:1)
  - Icons: [./icons/*](../../icons/icon-192x192.png) (192, 512, and other sizes)
- Upstream copies (reference only; do not deploy from here):
  - [./_upstream/index.html](../../_upstream/index.html:1)
  - [./_upstream/sw.js](../../_upstream/sw.js:1)
  - [./_upstream/offline.html](../../_upstream/offline.html:1)
  - [./_upstream/cloudflare-worker-portal-proxy.js](../../_upstream/cloudflare-worker-portal-proxy.js:1)
  - [./_upstream/manifest.json](../../_upstream/manifest.json:1)

--------------------------------------------------------------------------------

Cloudflare Worker (portal proxy + secure API)

File: [cloudflare-worker-portal-proxy.js](../../cloudflare-worker-portal-proxy.js:1)
- Purpose:
  - Proxy /portal/* to GitHub Pages origin safely (no recursion; strips hop-by-hop headers)
  - Provide secure server-side Google API proxies under /api/google/* (Directions, Places, Distance Matrix)
  - Scaffold GTFS-RT pass-through endpoints under /api/gtfs/{agency}/{feed}
  - Add CORS for XHR/fetch and sensible edge caching

Google proxies (REST):
- /api/google/directions → injects GOOGLE_MAPS_API_KEY, defaults: mode=transit, region=in, language=en-IN, units=metric, alternatives=true, departure_time=now
- /api/google/places?endpoint={nearbysearch/details/textsearch}/json → injects key, region/language defaults
- /api/google/distance-matrix → injects key, defaults to transit, region=in, language=en-IN, units=metric
Reference implementation: [handleGoogleApi()](../../cloudflare-worker-portal-proxy.js:152)

GTFS Realtime scaffolding:
- /api/gtfs/{agency}/{feed}
- Looks up env secret <AGENCY>_<FEED>_URL; optional <AGENCY>_AUTH_HEADER / <AGENCY>_AUTH_VALUE
- Returns raw protobuf with short cache; decoding can be added later

Required Worker secrets (example):
- GOOGLE_MAPS_API_KEY = <server-side key restricted to Directions/Places/DistanceMatrix>
- BEST_VEHICLE_POSITIONS_URL, BEST_TRIP_UPDATES_URL, BEST_ALERTS_URL (+ optional BEST_AUTH_HEADER, BEST_AUTH_VALUE)
- TRAINS_* and METRO_* (same pattern) when available

wrangler config:
- [wrangler.toml](../../wrangler.toml:1) includes route mumbaitransport.in/portal*

Deploy flow (Worker):
- CI GitHub Actions (wrangler-action) can auto-deploy on push to main
- Or manual: wrangler publish (with CF_ACCOUNT_ID, CF_API_TOKEN)

--------------------------------------------------------------------------------

Frontend (app shell, routing, PWA)

Entry: [index.html](../../index.html:1)
- Routing accuracy:
  - REST-first Directions via our Worker: /api/google/directions with place_id when available
  - Auto-fallback to JS DirectionsService if REST call fails
  - See calculateAndDisplayRoute(): [index.html](../../index.html:1868)
- Google Maps load:
  - JS API loaded with callback=initMap to avoid race (“google is not defined”)
  - Map options no longer include a mapId, so theme styles via setOptions({styles}) are valid
  - Map init: [index.html](../../index.html:2192)
- Service Worker registration (scope):
  - Explicit registration scope is /portal/ so root builders cannot hijack scope
  - Code also unregisters any non-/portal/ SW registrations on first run
  - See SW registration block: [index.html](../../index.html:2435)
- Manifest:
  - Manifest path must resolve under /portal/ (served via Worker)
  - One correct link in head: <link rel="manifest" href="/portal/manifest.json"> recommended
  - Manifest file contents: [manifest.json](../../manifest.json:1) (start_url=/portal/, scope=/portal/)
- Icons:
  - Ensure icons exist under /icons and match manifest entries (192 and 512 at minimum)

PWA files:
- Service Worker: [sw.js](../../sw.js:1)
  - Strategy: network-first for HTML (fresh content), cache-first for same-origin static, and default network
  - Offline fallback: [offline.html](../../offline.html:1)
- Manifest: [manifest.json](../../manifest.json:1)
  - start_url=/portal/, scope=/portal/
  - icons=./icons/icon-192x192.png, ./icons/icon-512x512.png (and others present)
- Offline page: [offline.html](../../offline.html:1)
  - Simple CTA: Retry and link back to /portal/ app shell

--------------------------------------------------------------------------------

Google Cloud Console (key hardening)

Create two keys:
1) Frontend (Maps JS)
   - Restrict to HTTP referrers: mumbaitransport.in, www.mumbaitransport.in
   - API restrictions: Maps JavaScript API only

2) Backend (Worker REST)
   - Store as Cloudflare secret: GOOGLE_MAPS_API_KEY
   - API restrictions: Directions API, Places API, Distance Matrix API
   - No HTTP referrer restrictions (server-side) — if using IP allowlisting, add Cloudflare egress, note it can be dynamic per PoP

Rotate legacy/exposed keys:
- Search repo history for old inline keys; rotate and remove

--------------------------------------------------------------------------------

Deploy, cache, and smoke tests

Deploy (typical):
- Push to main → CI deploys Worker (if configured)
- Purge Cloudflare cache for /portal/* to avoid stale HTML (Cloudflare dashboard → Caching → Purge)
- Open site: https://mumbaitransport.in/portal/

Smoke test checklist:
- Head:
  - No manifest 404 in console
  - Link rel="manifest" resolved to /portal/manifest.json
  - Icons load (192/512) — no “invalid image” warnings
- Service Worker:
  - Registered scope is https://mumbaitransport.in/portal/ (not root)
  - Offline works: enable airplane mode → index requests fallback to offline.html
- Maps:
  - No “google is not defined”
  - No “styles cannot be set when a mapId is present”
  - Routing draws after entering From/To
- Routing:
  - REST-first to /api/google/directions (inspect Network)
  - If REST fails, fallback triggers JS DirectionsService and still draws
  - UI displays route cards with duration/departure/walking distance
- Installability:
  - Manifest recognized, icons valid, can Add to Home Screen on Android
  - On iOS, bookmarking guidance appears (install banner as needed)

--------------------------------------------------------------------------------

Troubleshooting (common issues)

1) “google is not defined”
   - Cause: Script race
   - Fix: Ensure Google Maps script includes callback=initMap and initMap is globally defined
   - Ref: [index.html](../../index.html:31), [initMap](../../index.html:2192)

2) Manifest 404
   - Cause: Wrong path (root) instead of /portal/
   - Fix: Keep only one manifest link referencing /portal/manifest.json
   - Ref: [manifest.json](../../manifest.json:1)

3) SW conflicts (wrong scope)
   - Cause: SW registered at root by other builders
   - Fix: Register with scope: /portal/ and optionally unregister other scopes
   - Ref: [index.html](../../index.html:2435)

4) Icons missing/invalid
   - Ensure icons exist and match manifest paths
   - Ref: [icons/](../../icons/icon-192x192.png), [manifest.json](../../manifest.json:1)

5) Directions REST failing
   - Inspect Network for /api/google/directions; check Worker logs/secrets
   - Ensure GOOGLE_MAPS_API_KEY set in Cloudflare
   - Temporary fallback should render via JS DirectionsService

6) “A Map’s styles property cannot be set when a mapId is present”
   - Remove mapId from map options and set styles via setOptions

7) Places Autocomplete warnings (deprecation notice)
   - Migration: switch to google.maps.places.PlaceAutocompleteElement
   - Not a blocker; issue is purely advisory for new customers

8) GTFS endpoints
   - If returning 501, provide env secrets (AGENCY_FEED_URL). Add optional auth header/value if needed

--------------------------------------------------------------------------------

Operations

Purge Cloudflare cache for /portal/*:
- Dashboard → Caching → Purge cache → “Purge by URL” → https://mumbaitransport.in/portal/*
- Or API (replace values):
  curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
       -H "Authorization: Bearer API_TOKEN" -H "Content-Type: application/json" \
       --data '{"files":["https://mumbaitransport.in/portal/"]}'

Manual Worker deploy (if CI unavailable):
- wrangler login
- wrangler publish

Secrets management:
- wrangler secret put GOOGLE_MAPS_API_KEY
- Optional GTFS: wrangler secret put BEST_VEHICLE_POSITIONS_URL (and others)
- For agency auth: wrangler secret put BEST_AUTH_HEADER, wrangler secret put BEST_AUTH_VALUE

--------------------------------------------------------------------------------

Future work (tracked)

- Replace legacy Autocomplete with PlaceAutocompleteElement for compliance
- GTFS-RT decoding server-side (Protocol Buffers → JSON) under /api/gtfs/*
- Fares UI consolidation (Tickets section), bottom tab bar-only shell, and iOS polish passes
- Lock down Worker routes with additional guardrails if needed

--------------------------------------------------------------------------------

Quick references

- Worker proxy & Google proxies: [cloudflare-worker-portal-proxy.js](../../cloudflare-worker-portal-proxy.js:1)
- App shell & routing fallback: [index.html](../../index.html:1868)
- PWA SW: [sw.js](../../sw.js:1)
- Offline fallback: [offline.html](../../offline.html:1)
- Manifest: [manifest.json](../../manifest.json:1)
- Wrangler config: [wrangler.toml](../../wrangler.toml:1)
- Upstream references: [./_upstream](../../_upstream/README.md:1)