// Cloudflare Worker to proxy MMRCL Aqua Line map for iframe embedding
// Deploy this as a separate worker and use the URL in the portal

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Serve a simple HTML wrapper for the map
  if (url.pathname === '/') {
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mumbai Metro Aqua Line - Interactive Map</title>
    <style>
        body { margin: 0; padding: 0; height: 100vh; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
        .header { 
            position: fixed; top: 0; left: 0; right: 0; 
            background: linear-gradient(135deg, #00a3e0, #0078d4); 
            color: white; padding: 10px 15px; z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px; font-weight: 500;
        }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .map-container { margin-top: 60px; height: calc(100vh - 60px); }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚇 Mumbai Metro Aqua Line 3</h1>
        <p>Interactive route map and station information</p>
    </div>
    <div class="map-container">
        <iframe src="https://mmrcl.com/en/map" 
                allowfullscreen 
                allow="geolocation; microphone; camera; midi; encrypted-media">
        </iframe>
    </div>
</body>
</html>`, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }
  
  return new Response('Not Found', { status: 404 })
}
