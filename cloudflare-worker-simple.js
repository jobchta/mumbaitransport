// Simple Cloudflare Worker for Mumbai Transport
// Serves the main website directly

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // API endpoints
    if (pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }

    // Serve static files
    return serveStaticFile(pathname);
  }
};

// Handle API requests
async function handleAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    if (pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Mumbai Transport API is running'
      });
    }

    if (pathname.startsWith('/api/tickets/')) {
      const line = pathname.split('/')[3];
      return jsonResponse({
        success: true,
        line: line,
        message: 'Ticket data for ' + line,
        available: true,
        price: '₹10-40'
      });
    }

    if (pathname.startsWith('/api/fares/')) {
      const line = pathname.split('/')[3];
      return jsonResponse({
        success: true,
        line: line,
        fares: [
          { distance: '0-3 km', fare: 10 },
          { distance: '3-12 km', fare: 20 },
          { distance: '12-27 km', fare: 30 },
          { distance: '27+ km', fare: 40 }
        ]
      });
    }

    if (pathname === '/api/rides/compare') {
      return jsonResponse({
        success: true,
        rides: [
          { type: 'metro', duration: '25 min', fare: '₹30' },
          { type: 'bus', duration: '45 min', fare: '₹15' }
        ]
      });
    }

    return jsonResponse({ error: 'API endpoint not found' }, 404);

  } catch (error) {
    return jsonResponse({ error: 'API error', details: error.message }, 500);
  }
}

// Serve static files
function serveStaticFile(pathname) {
  let path = pathname;
  if (path === '/' || path === '') {
    path = '/index.html';
  }

  // Remove leading slash
  path = path.substring(1);

  // Basic file serving
  const staticFiles = {
    'index.html': getIndexHTML(),
    'src/js/app.js': getAppJS(),
    'src/styles/style.css': getStyleCSS(),
    'src/sw.js': getServiceWorker(),
    'src/manifest.json': getManifest()
  };

  const content = staticFiles[path];

  if (!content) {
    return new Response('File not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  let contentType = 'text/plain';
  if (path.endsWith('.html')) contentType = 'text/html';
  else if (path.endsWith('.js')) contentType = 'application/javascript';
  else if (path.endsWith('.css')) contentType = 'text/css';
  else if (path.endsWith('.json')) contentType = 'application/json';

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': contentType + '; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// Helper function for JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

// Static file contents
function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Mumbai Transport - Plan journeys, buy tickets, compare rides">
    <meta name="theme-color" content="#0ea5e9">
    <title>Mumbai Transport</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="src/styles/style.css">

    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD4VXgebBaqOojiujAPYIP8Qv-iYPSFVWw&libraries=places"></script>
</head>
<body>
    <header class="header">
        <div class="header-container">
            <a href="#" class="logo">
                <div class="logo-icon"><i class="fas fa-subway"></i></div>
                <span class="logo-text">Mumbai Transit</span>
            </a>
            <div class="header-right">
                <div class="language-selector">
                    <button class="language-btn" id="language-btn">
                        <i class="fas fa-globe"></i>
                        <span id="current-language">English</span>
                        <i class="fas fa-caret-down"></i>
                    </button>
                    <div class="language-dropdown" id="language-dropdown">
                        <div class="language-option active" data-lang="en">
                            <span>🇺🇸</span><span>English</span>
                        </div>
                        <div class="language-option" data-lang="hi">
                            <span>🇮🇳</span><span>हिंदी (Hindi)</span>
                        </div>
                        <div class="language-option" data-lang="mr">
                            <span>🇮🇳</span><span>मराठी (Marathi)</span>
                        </div>
                    </div>
                </div>
                <button class="theme-toggle" id="theme-toggle">
                    <i class="fas fa-sun"></i>
                </button>
            </div>
        </div>
    </header>

    <section class="hero">
        <h1 class="hero-title">Navigate Mumbai</h1>
        <p class="hero-subtitle">Experience the future of urban mobility with AI-powered routing</p>

        <div class="cta-buttons">
            <button class="cta-button cta-primary" onclick="handlePlanJourney()">
                <i class="fas fa-route"></i> Plan Your Journey
            </button>
            <button class="cta-button cta-secondary" onclick="handleViewMap()">
                <i class="fas fa-map-marked-alt"></i> View Network Map
            </button>
            <button class="cta-button cta-secondary" onclick="handleBookmark()">
                <i class="fas fa-bookmark"></i> Bookmark This Page
            </button>
        </div>
    </section>

    <input type="radio" name="tabs" id="plan-radio" checked>
    <input type="radio" name="tabs" id="tickets-radio">
    <input type="radio" name="tabs" id="compare-radio">

    <main class="dashboard app-content">
        <div class="tab-content" id="plan-tab">
            <div class="section-header">
                <h2 class="section-title">Plan Your Journey</h2>
                <div class="section-line"></div>
            </div>

            <div class="transport-modes">
                <button class="micro-btn active" onclick="filterTransportMode('all')">
                    <i class="fas fa-shuffle"></i><span>All</span>
                </button>
                <button class="micro-btn" onclick="filterTransportMode('metro')">
                    <i class="fas fa-train"></i><span>Metro</span>
                </button>
                <button class="micro-btn" onclick="filterTransportMode('bus')">
                    <i class="fas fa-bus"></i><span>Bus</span>
                </button>
                <button class="micro-btn" onclick="filterTransportMode('train')">
                    <i class="fas fa-train"></i><span>Train</span>
                </button>
            </div>

            <form id="journey-form">
                <div class="form-group">
                    <label class="form-label" for="from">From</label>
                    <div class="input-wrapper">
                        <i class="fas fa-map-pin input-icon"></i>
                        <input type="text" id="from" class="form-input" placeholder="Current location">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="to">To</label>
                    <div class="input-wrapper">
                        <i class="fas fa-map-pin input-icon"></i>
                        <input type="text" id="to" class="form-input" placeholder="Destination">
                        <button type="button" class="location-swap" onclick="swapLocations()">
                            <i class="fas fa-arrows-up-down"></i>
                        </button>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-full">
                    <i class="fas fa-route"></i> Find Routes
                </button>
            </form>

            <div id="map" class="map-container"></div>
        </div>

        <div class="tab-content" id="tickets-tab">
            <div class="section-header">
                <h2 class="section-title">Metro Tickets & Fares</h2>
                <div class="section-line"></div>
            </div>

            <div class="metro-lines">
                <div class="metro-line">
                    <div class="line-info">
                        <div class="line-color" style="background: #1e40af;"></div>
                        <div class="line-details">
                            <h3>Line 1 – Blue Line</h3>
                            <p>Versova ↔ Ghatkopar (11.4 km, 12 stations)</p>
                        </div>
                    </div>
                    <div class="line-actions">
                        <button class="btn btn-secondary" onclick="buyTicket('line1')">
                            <i class="fas fa-ticket"></i> Buy Ticket
                        </button>
                        <button class="btn btn-outline" onclick="checkFare('line1')">
                            <i class="fas fa-indian-rupee-sign"></i> Check Fare
                        </button>
                    </div>
                </div>
            </div>

            <div class="fare-info">
                <div class="section-header">
                    <h2 class="section-title">Current Fares</h2>
                    <div class="section-line"></div>
                </div>
                <div class="fare-grid">
                    <div class="fare-card"><div class="fare-amount">₹10</div><div class="fare-distance">0-3 km</div></div>
                    <div class="fare-card"><div class="fare-amount">₹20</div><div class="fare-distance">3-12 km</div></div>
                    <div class="fare-card"><div class="fare-amount">₹30</div><div class="fare-distance">12-27 km</div></div>
                    <div class="fare-card"><div class="fare-amount">₹40</div><div class="fare-distance">27+ km</div></div>
                </div>
            </div>
        </div>

        <div class="tab-content" id="compare-tab">
            <div class="section-header">
                <h2 class="section-title">Compare Rides</h2>
                <div class="section-line"></div>
            </div>

            <div class="ride-comparison">
                <div class="comparison-card">
                    <div class="ride-option">
                        <div class="ride-icon"><i class="fas fa-train"></i></div>
                        <div class="ride-details">
                            <h3>Metro</h3>
                            <div class="ride-metrics">
                                <span class="metric"><i class="fas fa-clock"></i> 25 min</span>
                                <span class="metric"><i class="fas fa-indian-rupee-sign"></i> ₹30</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="selectRide('metro')">Select</button>
                    </div>
                </div>

                <div class="comparison-card">
                    <div class="ride-option">
                        <div class="ride-icon"><i class="fas fa-bus"></i></div>
                        <div class="ride-details">
                            <h3>Bus</h3>
                            <div class="ride-metrics">
                                <span class="metric"><i class="fas fa-clock"></i> 45 min</span>
                                <span class="metric"><i class="fas fa-indian-rupee-sign"></i> ₹15</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="selectRide('bus')">Select</button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <nav class="bottom-tab-bar">
        <label for="plan-radio" class="tab-item">
            <i class="fas fa-route"></i><span>Plan</span>
        </label>
        <label for="tickets-radio" class="tab-item">
            <i class="fas fa-ticket"></i><span>Tickets</span>
        </label>
        <label for="compare-radio" class="tab-item">
            <i class="fas fa-scale-balanced"></i><span>Compare</span>
        </label>
    </nav>

    <script src="src/js/app.js"></script>

    <script>
        function buyTicket(line) { alert('Buy ticket for ' + line + ' would be processed here.'); }
        function checkFare(line) { alert('Fare check for ' + line + ' would be shown here.'); }
        function selectRide(ride) { alert('You selected ' + ride + ' as your preferred mode of transport.'); }
        function handlePlanJourney() { switchTab('plan'); showToast('Switched to journey planning', 'info'); }
        function handleViewMap() { switchTab('plan'); showToast('Network map displayed', 'info'); }
        function handleBookmark() { showToast('To bookmark: Press Ctrl+D (Windows/Linux) or Cmd+D (Mac)', 'info'); }
        function filterTransportMode(mode) { showToast('Showing ' + mode + ' routes', 'info'); }
        function swapLocations() { showToast('Locations swapped', 'info'); }
    </script>
</body>
</html>`;
}

function getAppJS() {
  return `// Mumbai Transport App
window.appState = { currentTab: 'plan', isOnline: navigator.onLine };

function initApp() {
    console.log('🚀 Initializing Mumbai Transport App...');
    initNetworkStatus();
    initTabNavigation();
    initThemeToggle();
    initFormHandlers();
    showToast('Mumbai Transport App loaded successfully!', 'success');
}

function initNetworkStatus() {
    window.addEventListener('online', () => {
        window.appState.isOnline = true;
        showToast('You are back online', 'success');
    });
    window.addEventListener('offline', () => {
        window.appState.isOnline = false;
        showToast('You are offline. Some features may not work.', 'warning');
    });
}

function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-item');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('for')?.replace('-radio', '') ||
                            button.querySelector('span')?.textContent?.toLowerCase();
            if (targetTab) switchTab(targetTab);
        });
    });

    const radioButtons = document.querySelectorAll('input[name="tabs"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const tabName = e.target.id.replace('-radio', '');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    window.appState.currentTab = tabName;
    const radioButton = document.getElementById(tabName + '-radio');
    if (radioButton) radioButton.checked = true;

    document.querySelectorAll('.tab-item').forEach(item => {
        const itemTab = item.getAttribute('for')?.replace('-radio', '') ||
                        item.querySelector('span')?.textContent?.toLowerCase();
        if (itemTab === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    console.log('📱 Switched to tab: ' + tabName);
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        loadSavedTheme();
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mumbai-transport-theme', newTheme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    console.log('🎨 Theme changed to: ' + newTheme);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('mumbai-transport-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
}

function initFormHandlers() {
    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.addEventListener('submit', handleJourneyForm);
    }
}

function handleJourneyForm(event) {
    event.preventDefault();
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const from = fromInput?.value?.trim();
    const to = toInput?.value?.trim();

    if (!from || !to) {
        showToast('Please enter both departure and destination locations', 'error');
        return;
    }
    console.log('🗺️ Planning route from "' + from + '" to "' + to + '"');
    showToast('Finding routes...', 'info');
}

function showToast(message, type = 'info') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'toast-close';
    closeBtn.onclick = () => toast.remove();
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', initApp);
console.log('📱 Mumbai Transport App script loaded');`;
}

function getStyleCSS() {
  return `/* Mumbai Transport App */
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --primary: #6366f1; --primary-light: #818cf8; --secondary: #8b5cf6;
  --accent: #06b6d4; --success: #10b981; --warning: #f59e0b; --error: #ef4444;
  --white: #ffffff; --gray-900: #0f172a; --glass-light: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.15); --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-dark: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
}
body {
  font-family: 'Inter', sans-serif; background: var(--gradient-dark); color: var(--white);
  line-height: 1.6; min-height: 100vh; overflow-x: hidden;
}
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
}
.header-container { max-width: 1400px; margin: 0 auto; padding: 1rem 2rem;
  display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 1rem; text-decoration: none; }
.logo-icon { width: 50px; height: 50px; background: var(--gradient-primary);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1.5rem; }
.logo-text { font-size: 1.5rem; font-weight: 800; background: var(--gradient-primary);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero { padding: 120px 2rem 80px; text-align: center; }
.hero-title { font-size: clamp(3rem, 8vw, 6rem); font-weight: 900;
  background: linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #06b6d4 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem; }
.cta-buttons { display: flex; justify-content: center; gap: 1.5rem; margin-top: 2rem; }
.cta-button { padding: 1rem 2rem; border-radius: 50px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s ease; }
.cta-primary { background: var(--gradient-primary); color: white; border: none;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
.cta-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6); }
.cta-secondary { background: transparent; color: white; border: 2px solid var(--glass-border); }
.cta-secondary:hover { background: rgba(255, 255, 255, 0.1); }
.dashboard { padding: 0 2rem 80px; max-width: 1400px; margin: 0 auto; }
.section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
.section-title { font-size: 2rem; font-weight: 700; color: white; }
.section-line { flex: 1; height: 2px; background: var(--gradient-primary); border-radius: 1px; }
.transport-modes { display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
.micro-btn { background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4);
  color: var(--primary-light); border-radius: 20px; padding: 0.5rem 1rem; font-size: 0.85rem;
  cursor: pointer; transition: all 0.3s ease; }
.micro-btn.active { background: var(--primary); border-color: var(--primary); color: white; }
.form-group { margin-bottom: 1.5rem; }
.form-input { width: 100%; padding: 1rem; background: var(--glass-light);
  border: 1px solid var(--glass-border); border-radius: 12px; color: white; }
.btn { padding: 0.75rem 1.5rem; border-radius: 12px; cursor: pointer; border: none;
  display: flex; align-items: center; gap: 0.5rem; }
.btn-primary { background: var(--gradient-primary); color: white; }
.btn-full { width: 100%; justify-content: center; }
.metro-lines { display: flex; flex-direction: column; gap: 1rem; }
.metro-line { background: var(--glass-light); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 1.5rem; display: flex; justify-content: space-between; }
.line-actions { display: flex; gap: 0.5rem; }
.fare-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; }
.fare-card { background: var(--glass-light); border: 1px solid var(--glass-border);
  border-radius: 12px; padding: 1rem; text-align: center; }
.fare-amount { font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.25rem; }
.ride-comparison { display: flex; flex-direction: column; gap: 1rem; }
.comparison-card { background: var(--glass-light); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 1.5rem; }
.tab-radio { display: none; }
.tab-content { display: none; }
#plan-radio:checked ~ .app-content #plan-tab,
#tickets-radio:checked ~ .app-content #tickets-tab,
#compare-radio:checked ~ .app-content #compare-radio { display: block; }
.bottom-tab-bar { position: fixed; bottom: 0; left: 0; right: 0;
  background: rgba(15, 23, 42, 0.9); display: flex; justify-content: space-around;
  padding: 0.75rem; z-index: 900; }
.toast { position: fixed; top: 100px; right: 20px; background: var(--gray-900);
  border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem 1.5rem;
  color: white; z-index: 10000; }
@media (max-width: 768px) {
  .cta-buttons { flex-direction: column; }
  .metro-line { flex-direction: column; }
}`;
}

function getServiceWorker() {
  return `// Service Worker for Mumbai Transport PWA
const CACHE_NAME = 'mumbai-transport-v1';
const urlsToCache = [
  '/',
  '/src/styles/style.css',
  '/src/js/app.js',
  '/src/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});`;
}

function getManifest() {
  return `{
  "name": "Mumbai Transport",
  "short_name": "MumbaiTransit",
  "description": "Plan journeys, buy tickets, compare rides in Mumbai",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/src/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/src/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`;
}