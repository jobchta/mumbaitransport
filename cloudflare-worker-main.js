// Cloudflare Worker: Serve Mumbai Transport website directly
// This serves the main website at the root domain

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

    // API endpoints - proxy to backend
    if (pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }

    // Serve static files from KV or inline
    return serveStaticFile(pathname);
  }
};

// Handle API requests
async function handleAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // For now, return mock responses for API endpoints
    // In production, you'd proxy these to your backend

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
        message: `Ticket data for ${line}`,
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
  // Normalize path
  let path = pathname;
  if (path === '/' || path === '') {
    path = '/index.html';
  }

  // Remove leading slash
  path = path.substring(1);

  // Basic file serving - in production you'd use KV storage
  const staticFiles = {
    'index.html': getIndexHTML(),
    'src/js/app.js': getAppJS(),
    'src/styles/style.css': getStyleCSS(),
    'real_mumbai_transport_data.js': getTransportData(),
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

  // Determine content type
  let contentType = 'text/plain';
  if (path.endsWith('.html')) contentType = 'text/html';
  else if (path.endsWith('.js')) contentType = 'application/javascript';
  else if (path.endsWith('.css')) contentType = 'text/css';
  else if (path.endsWith('.json')) contentType = 'application/json';

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': `${contentType}; charset=utf-8`,
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

// Static file contents (you'd normally store these in KV)
function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="Mumbai Transport - Plan journeys, buy tickets, compare rides">
    <meta name="theme-color" content="#0ea5e9">
    <title>Mumbai Transport</title>

    <!-- PWA Configuration -->
    <link rel="manifest" href="src/manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Mumbai Transport">
    <link rel="apple-touch-icon" href="src/assets/icons/icon-192x192.png">

    <!-- External Dependencies -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Application Styles -->
    <link rel="stylesheet" href="src/styles/style.css">

    <!-- Google Maps API -->
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD4VXgebBaqOojiujAPYIP8Qv-iYPSFVWw&libraries=places"></script>
</head>
<body>
    <!-- Animated Background -->
    <div class="background-animation">
        <div class="floating-orb orb-1"></div>
        <div class="floating-orb orb-2"></div>
        <div class="floating-orb orb-3"></div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="header-container">
            <a href="#" class="logo">
                <div class="logo-icon">
                    <i class="fas fa-subway"></i>
                </div>
                <span class="logo-text">Mumbai Transit</span>
            </a>

            <div class="header-right">
                <!-- Language Selector -->
                <div class="language-selector">
                    <button class="language-btn" id="language-btn">
                        <i class="fas fa-globe"></i>
                        <span id="current-language">English</span>
                        <i class="fas fa-caret-down"></i>
                    </button>
                    <div class="language-dropdown" id="language-dropdown">
                        <div class="language-option active" data-lang="en">
                            <span>🇺🇸</span>
                            <span>English</span>
                        </div>
                        <div class="language-option" data-lang="hi">
                            <span>🇮🇳</span>
                            <span>हिंदी (Hindi)</span>
                        </div>
                        <div class="language-option" data-lang="mr">
                            <span>🇮🇳</span>
                            <span>मराठी (Marathi)</span>
                        </div>
                    </div>
                </div>

                <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
                    <i class="fas fa-sun"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <h1 class="hero-title">Navigate Mumbai</h1>
        <p class="hero-subtitle">Experience the future of urban mobility with AI-powered routing and real-time insights</p>

        <div class="cta-buttons">
            <button class="cta-button cta-primary" id="planJourneyBtn" onclick="handlePlanJourney()">
                <i class="fas fa-route"></i> Plan Your Journey
            </button>
            <button class="cta-button cta-secondary" id="viewMapBtn" onclick="handleViewMap()">
                <i class="fas fa-map-marked-alt"></i> View Network Map
            </button>
            <button class="cta-button cta-secondary" id="bookmarkBtn" onclick="handleBookmark()">
                <i class="fas fa-bookmark"></i> Bookmark This Page
            </button>
        </div>
    </section>

    <!-- Hidden Radio Inputs for CSS-Only Tab Control -->
    <input type="radio" name="tabs" id="plan-radio" class="tab-radio" checked>
    <input type="radio" name="tabs" id="tickets-radio" class="tab-radio">
    <input type="radio" name="tabs" id="compare-radio" class="tab-radio">

    <!-- Dashboard -->
    <main class="dashboard app-content">
        <!-- Plan Tab -->
        <div class="tab-content" id="plan-tab">
            <div class="section-header">
                <h2 class="section-title">Plan Your Journey</h2>
                <div class="section-line"></div>
            </div>

            <!-- Transport Modes -->
            <div class="transport-modes">
                <button class="micro-btn active" data-mode="all" onclick="filterTransportMode('all')">
                    <i class="fas fa-shuffle"></i>
                    <span>All</span>
                </button>
                <button class="micro-btn" data-mode="metro" onclick="filterTransportMode('metro')">
                    <i class="fas fa-train"></i>
                    <span>Metro</span>
                </button>
                <button class="micro-btn" data-mode="bus" onclick="filterTransportMode('bus')">
                    <i class="fas fa-bus"></i>
                    <span>Bus</span>
                </button>
                <button class="micro-btn" data-mode="train" onclick="filterTransportMode('train')">
                    <i class="fas fa-train"></i>
                    <span>Train</span>
                </button>
            </div>

            <!-- Journey Form -->
            <form id="journey-form">
                <div class="form-group">
                    <label class="form-label" for="from">From</label>
                    <div class="input-wrapper">
                        <i class="fas fa-map-pin input-icon"></i>
                        <input type="text" id="from" class="form-input" placeholder="Current location or address">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="to">To</label>
                    <div class="input-wrapper">
                        <i class="fas fa-map-pin input-icon"></i>
                        <input type="text" id="to" class="form-input" placeholder="Destination">
                        <button type="button" class="location-swap" id="swap-locations">
                            <i class="fas fa-arrows-up-down"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-full btn-large">
                    <i class="fas fa-route"></i>
                    Find Routes
                </button>
            </form>

            <!-- Map Container -->
            <div id="map" class="map-container" style="height: 300px; margin-top: 1.5rem;"></div>
        </div>

        <!-- Tickets Tab -->
        <div class="tab-content" id="tickets-tab">
            <div class="section-header">
                <h2 class="section-title">Metro Tickets & Fares</h2>
                <div class="section-line"></div>
            </div>

            <!-- Metro Lines -->
            <div class="metro-lines">
                <div class="metro-line">
                    <div class="line-info">
                        <div class="line-color" style="background: #1e40af;"></div>
                        <div class="line-details">
                            <h3>Line 1 – Blue Line</h3>
                            <p>Versova ↔ Ghatkopar (11.4 km, 12 stations)</p>
                            <small>MMRDA • Operational</small>
                        </div>
                    </div>
                    <div class="line-actions">
                        <button class="btn btn-secondary" onclick="buyTicket('line1')">
                            <i class="fas fa-ticket"></i>
                            Buy Ticket
                        </button>
                        <button class="btn btn-outline" onclick="checkFare('line1')">
                            <i class="fas fa-indian-rupee-sign"></i>
                            Check Fare
                        </button>
                    </div>
                </div>

                <div class="metro-line">
                    <div class="line-info">
                        <div class="line-color" style="background: #eab308;"></div>
                        <div class="line-details">
                            <h3>Line 2A – Yellow Line</h3>
                            <p>Dahisar East ↔ D N Nagar (18.6 km, 17 stations)</p>
                            <small>MMRDA • Operational</small>
                        </div>
                    </div>
                    <div class="line-actions">
                        <button class="btn btn-secondary" onclick="buyTicket('line2a')">
                            <i class="fas fa-ticket"></i>
                            Buy Ticket
                        </button>
                        <button class="btn btn-outline" onclick="checkFare('line2a')">
                            <i class="fas fa-indian-rupee-sign"></i>
                            Check Fare
                        </button>
                    </div>
                </div>

                <div class="metro-line">
                    <div class="line-info">
                        <div class="line-color" style="background: #06b6d4;"></div>
                        <div class="line-details">
                            <h3>Line 3 – Aqua Line</h3>
                            <p>Colaba ↔ Aarey (33.5 km, 27 stations)</p>
                            <small>MMRC & DMRC • Partially operational</small>
                        </div>
                    </div>
                    <div class="line-actions">
                        <button class="btn btn-secondary" onclick="buyTicket('line3')">
                            <i class="fas fa-ticket"></i>
                            Buy Ticket
                        </button>
                        <button class="btn btn-outline" onclick="checkFare('line3')">
                            <i class="fas fa-indian-rupee-sign"></i>
                            Check Fare
                        </button>
                    </div>
                </div>

                <div class="metro-line">
                    <div class="line-info">
                        <div class="line-color" style="background: #dc2626;"></div>
                        <div class="line-details">
                            <h3>Line 7 – Red Line</h3>
                            <p>Dahisar East ↔ Andheri East (16.5 km)</p>
                            <small>MMRDA • Operational</small>
                        </div>
                    </div>
                    <div class="line-actions">
                        <button class="btn btn-secondary" onclick="buyTicket('line7')">
                            <i class="fas fa-ticket"></i>
                            Buy Ticket
                        </button>
                        <button class="btn btn-outline" onclick="checkFare('line7')">
                            <i class="fas fa-indian-rupee-sign"></i>
                            Check Fare
                        </button>
                    </div>
                </div>
            </div>

            <!-- Fare Information -->
            <div class="fare-info">
                <div class="section-header">
                    <h2 class="section-title">Current Fares</h2>
                    <div class="section-line"></div>
                </div>
                <div class="fare-grid">
                    <div class="fare-card">
                        <div class="fare-amount">₹10</div>
                        <div class="fare-distance">0-3 km</div>
                    </div>
                    <div class="fare-card">
                        <div class="fare-amount">₹20</div>
                        <div class="fare-distance">3-12 km</div>
                    </div>
                    <div class="fare-card">
                        <div class="fare-amount">₹30</div>
                        <div class="fare-distance">12-27 km</div>
                    </div>
                    <div class="fare-card">
                        <div class="fare-amount">₹40</div>
                        <div class="fare-distance">27+ km</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Compare Tab -->
        <div class="tab-content" id="compare-tab">
            <div class="section-header">
                <h2 class="section-title">Compare Rides</h2>
                <div class="section-line"></div>
            </div>

            <!-- Ride Comparison -->
            <div class="ride-comparison">
                <div class="comparison-card">
                    <div class="ride-option">
                        <div class="ride-icon">
                            <i class="fas fa-train"></i>
                        </div>
                        <div class="ride-details">
                            <h3>Metro</h3>
                            <div class="ride-metrics">
                                <span class="metric">
                                    <i class="fas fa-clock"></i>
                                    25 min
                                </span>
                                <span class="metric">
                                    <i class="fas fa-indian-rupee-sign"></i>
                                    ₹30
                                </span>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="selectRide('metro')">
                            Select
                        </button>
                    </div>
                </div>

                <div class="comparison-card">
                    <div class="ride-option">
                        <div class="ride-icon">
                            <i class="fas fa-bus"></i>
                        </div>
                        <div class="ride-details">
                            <h3>Bus</h3>
                            <div class="ride-metrics">
                                <span class="metric">
                                    <i class="fas fa-clock"></i>
                                    45 min
                                </span>
                                <span class="metric">
                                    <i class="fas fa-indian-rupee-sign"></i>
                                    ₹15
                                </span>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="selectRide('bus')">
                            Select
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Install Prompt Button (hidden by default) -->
    <button id="installBtn" class="install-btn" style="display: none;">
        <i class="fas fa-download"></i>
        Install App
    </button>

    <!-- Bottom Tab Bar -->
    <nav class="bottom-tab-bar">
        <label for="plan-radio" class="tab-item">
            <i class="fas fa-route"></i>
            <span>Plan</span>
        </label>
        <label for="tickets-radio" class="tab-item">
            <i class="fas fa-ticket"></i>
            <span>Tickets</span>
        </label>
        <label for="compare-radio" class="tab-item">
            <i class="fas fa-scale-balanced"></i>
            <span>Compare</span>
        </label>
    </nav>

    <!-- Service Worker -->
    <script src="src/sw.js"></script>

    <!-- Real Mumbai Transport Data -->
    <script src="real_mumbai_transport_data.js"></script>

    <!-- App Scripts -->
    <script src="src/js/app.js"></script>
    <script src="src/js/language-manager.js"></script>

    <script>
        // Initialize app when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Mumbai Transport App loaded');

            // Initialize core functionality
            initApp();

            // Initialize language manager
            if (window.languageManager) {
                window.languageManager.updateLanguage();
            }


        });

        // Functions for ticket and ride actions
        function buyTicket(line) {
            alert(\`Buy ticket for \${line} would be processed here.\`);
        }

        function checkFare(line) {
            alert(\`Fare check for \${line} would be shown here.\`);
        }

        function selectRide(ride) {
            alert(\`You selected \${ride} as your preferred mode of transport.\`);
        }
    </script>
</body>
</html>`;
}

function getAppJS() {
  return `// Mumbai Transport App - Main Application File
// Global app state
window.appState = {
    currentTab: 'plan',
    isOnline: navigator.onLine,
    userLocation: null,
    selectedRoute: null,
    language: 'en'
};

// Initialize the application
function initApp() {
    console.log('🚀 Initializing Mumbai Transport App...');

    try {
        // Initialize core components
        initNetworkStatus();
        initTabNavigation();
        initThemeToggle();
        initFormHandlers();
        initLocationServices();

        // Show welcome message
        showToast('Mumbai Transport App loaded successfully!', 'success');

        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showToast('Error initializing app. Please refresh the page.', 'error');
    }
}

// Initialize network status monitoring
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

// Initialize tab navigation
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('for')?.replace('-radio', '') ||
                            button.querySelector('span')?.textContent?.toLowerCase();

            if (targetTab) {
                switchTab(targetTab);
            }
        });
    });

    // Handle radio button changes
    const radioButtons = document.querySelectorAll('input[name="tabs"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const tabName = e.target.id.replace('-radio', '');
            switchTab(tabName);
        });
    });
}

// Switch to a specific tab
function switchTab(tabName) {
    window.appState.currentTab = tabName;

    // Update radio buttons
    const radioButton = document.getElementById(\`\${tabName}-radio\`);
    if (radioButton) {
        radioButton.checked = true;
    }

    // Update visual indicators
    document.querySelectorAll('.tab-item').forEach(item => {
        const itemTab = item.getAttribute('for')?.replace('-radio', '') ||
                        item.querySelector('span')?.textContent?.toLowerCase();
        if (itemTab === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    console.log(\`📱 Switched to tab: \${tabName}\`);
}

// Initialize theme toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        loadSavedTheme();
    }
}

// Toggle between light and dark theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mumbai-transport-theme', newTheme);

    // Update toggle button icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    console.log(\`🎨 Theme changed to: \${newTheme}\`);
}

// Load saved theme from localStorage
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

// Initialize form handlers
function initFormHandlers() {
    // Journey form
    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.addEventListener('submit', handleJourneyForm);
    }

    // Location swap
    const swapButton = document.getElementById('swap-locations');
    if (swapButton) {
        swapButton.addEventListener('click', swapLocations);
    }
}

// Handle journey form submission
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

    console.log(\`🗺️ Planning route from "\${from}" to "\${to}"\`);
    showToast('Finding routes...', 'info');

    // Use real Mumbai transport data
    planRealRoute(from, to);
}

// Plan route using real Mumbai transport data
function planRealRoute(from, to) {
    try {
        // Check if real transport data is available
        if (!window.REAL_MUMBAI_TRANSPORT_DATA) {
            showToast('Transport data not loaded. Please refresh the page.', 'error');
            return;
        }

        const routeEngine = window.REAL_MUMBAI_TRANSPORT_DATA.routePlanningEngine;
        const routes = routeEngine.findRoutes(from, to);

        if (routes.length === 0) {
            showToast('No direct routes found. Try different locations or check spelling.', 'warning');
            return;
        }

        // Display routes
        displayRoutes(routes, from, to);

        console.log(\`✅ Found \${routes.length} routes from "\${from}" to "\${to}"\`);
        showToast(\`Found \${routes.length} routes!\`, 'success');

    } catch (error) {
        console.error('❌ Error planning route:', error);
        showToast('Error finding routes. Please try again.', 'error');
    }
}

// Display found routes in the UI
function displayRoutes(routes, from, to) {
    const resultsContainer = document.getElementById('route-results');
    if (!resultsContainer) {
        console.log('Route results container not found, creating one...');
        createRouteResultsContainer();
        return;
    }

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Create route cards
    routes.forEach((route, index) => {
        const routeCard = createRouteCard(route, index);
        resultsContainer.appendChild(routeCard);
    });

    // Show results section
    const resultsSection = document.getElementById('route-results-section');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
}

// Create a route card element
function createRouteCard(route, index) {
    const card = document.createElement('div');
    card.className = 'route-card';
    card.onclick = () => selectRoute(index, route);

    const iconMap = {
        'bus': 'fas fa-bus',
        'train': 'fas fa-train',
        'metro': 'fas fa-subway'
    };

    card.innerHTML = \`
        <div class="route-header">
            <div class="route-icon">
                <i class="\${iconMap[route.type] || 'fas fa-route'}"></i>
            </div>
            <div class="route-info">
                <h3>\${route.name || route.line || \`\${route.type.toUpperCase()} Route\`}</h3>
                <p class="route-stops">\${route.from} → \${route.to}</p>
                <p class="route-details">\${route.stops?.length || 0} stops • \${route.estimatedDuration} min</p>
            </div>
            <div class="route-fare">
                <span class="fare-amount">₹\${route.fare}</span>
            </div>
        </div>
    \`;

    return card;
}

// Create route results container if it doesn't exist
function createRouteResultsContainer() {
    const mainContent = document.querySelector('.app-content');
    if (!mainContent) return;

    const resultsSection = document.createElement('div');
    resultsSection.id = 'route-results-section';
    resultsSection.innerHTML = \`
        <div class="section-header">
            <h2 class="section-title">Available Routes</h2>
            <div class="section-line"></div>
        </div>
        <div id="route-results" class="route-results"></div>
    \`;

    // Insert after the journey form
    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.insertAdjacentElement('afterend', resultsSection);
    } else {
        mainContent.appendChild(resultsSection);
    }
}

// Swap from and to locations
function swapLocations() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');

    if (fromInput && toInput) {
        const temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;
        console.log('🔄 Locations swapped');
        showToast('Locations swapped', 'info');
    }
}

// Initialize location services and Google Maps
function initLocationServices() {
    // Initialize Google Maps when API is loaded
    if (typeof google !== 'undefined' && google.maps) {
        initGoogleMaps();
    } else {
        // Wait for Google Maps API to load
        window.initGoogleMaps = initGoogleMaps;
    }
}

// Initialize Google Maps
function initGoogleMaps() {
    try {
        // Default center (Mumbai)
        const defaultCenter = { lat: 19.0760, lng: 72.8777 };

        // Create map
        window.mapInstance = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: defaultCenter,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
        });

        console.log('✅ Google Maps initialized successfully');

        // Show map container
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.style.display = 'block';
        }

        showToast('Map loaded successfully!', 'success');

    } catch (error) {
        console.error('❌ Error initializing Google Maps:', error);
        showToast('Error loading maps. Please check your connection.', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // Create new toast
    const toast = document.createElement('div');
    toast.className = \`toast toast-\${type}\`;
    toast.textContent = message;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'toast-close';
    closeBtn.onclick = () => toast.remove();
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Utility functions for ticket and ride actions
function buyTicket(line) {
    console.log(\`🎫 Buying ticket for \${line}\`);
    showToast(\`Redirecting to ticket purchase for \${line}...\`, 'success');
}

function checkFare(line) {
    console.log(\`💰 Checking fare for \${line}\`);
    showToast(\`Fare information for \${line}\`, 'info');
}

function selectRide(ride) {
    console.log(\`🚗 Selected ride type: \${ride}\`);
    window.appState.selectedRoute = ride;
    showToast(\`\${ride} selected for comparison\`, 'success');
}

// Hero section button handlers
function handlePlanJourney() {
    console.log('🗺️ Plan Your Journey button clicked');
    switchTab('plan');
    showToast('Switched to journey planning', 'info');

    // Focus on the from input
    const fromInput = document.getElementById('from');
    if (fromInput) {
        fromInput.focus();
    }
}

function handleViewMap() {
    console.log('🗺️ View Network Map button clicked');
    switchTab('plan');
    showToast('Network map displayed', 'info');

    // Center map on Mumbai if available
    if (window.mapInstance) {
        const mumbaiCenter = { lat: 19.0760, lng: 72.8777 };
        window.mapInstance.setCenter(mumbaiCenter);
        window.mapInstance.setZoom(11);
    }
}

function handleBookmark() {
    console.log('🔖 Bookmark button clicked');

    if (window.safari) {
        showToast('To bookmark: Press Ctrl+D (Windows/Linux) or Cmd+D (Mac)', 'info');
    } else {
        showToast('To bookmark: Press Ctrl+D (Windows/Linux) or Cmd+D (Mac)', 'info');
    }
}

// Transport mode filtering
function filterTransportMode(mode) {
    console.log(\`🚇 Filtering by transport mode: \${mode}\`);

    // Update active button state
    const modeButtons = document.querySelectorAll('.micro-btn');
    modeButtons.forEach(button => {
        if (button.getAttribute('data-mode') === mode) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Store current filter
    window.appState.transportMode = mode;

    showToast(\`Showing \${mode} routes\`, 'info');
}

// Select route
function selectRoute(index, route = null) {
    console.log(\`🛣️ Selecting route \${index}...\`);

    // Store selected route
    window.appState.selectedRoute = route || { index };

    // Highlight selected route card
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    showToast(\`Route \${index + 1} selected\`, 'success');
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

console.log('📱 Mumbai Transport App script loaded');`;
}

function getStyleCSS() {
  return `/* Mumbai Transport App - Complete Modern Styles */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #6366f1;
    --primary-light: #818cf8;
    --secondary: #8b5cf6;
    --accent: #06b6d4;
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    --white: #ffffff;
    --gray-50: #f8fafc;
    --gray-800: #1e293b;
    --gray-900: #0f172a;
    --glass-light: rgba(255, 255, 255, 0.08);
    --glass-border: rgba(255, 255, 255, 0.15);
    --shadow-glow: 0 0 40px rgba(99, 102, 241, 0.3);
    --shadow-intense: 0 25px 50px rgba(0, 0, 0, 0.5);
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --gradient-accent: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --gradient-dark: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
}

body {
    font-family: 'Inter', sans-serif;
    background: var(--gradient-dark);
    color: var(--white);
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
}

/* Animated Background */
.background-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
}

.floating-orb {
    position: absolute;
    border-radius: 50%;
    animation: float 20s infinite ease-in-out;
    filter: blur(60px);
    opacity: 0.4;
}

.orb-1 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
    top: 20%;
    left: 10%;
    animation-delay: 0s;
}

.orb-2 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
    top: 60%;
    right: 20%;
    animation-delay: -7s;
}

.orb-3 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
    bottom: 10%;
    left: 50%;
    animation-delay: -14s;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(100px, -50px) rotate(90deg); }
    50% { transform: translate(-50px, -100px) rotate(180deg); }
    75% { transform: translate(-100px, 50px) rotate(270deg); }
}

/* Header with Glassmorphism */
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-decoration: none;
}

.logo-icon {
    width: 50px;
    height: 50px;
    background: var(--gradient-primary);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: var(--shadow-glow);
}

.logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.language-selector {
    position: relative;
}

.language-btn {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.language-btn:hover {
    background: rgba(255, 255, 255, 0.15);
}

.language-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--gray-900);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0.5rem;
    margin-top: 0.5rem;
    min-width: 200px;
    display: none;
    z-index: 1000;
    box-shadow: var(--shadow-intense);
}

.language-dropdown.show {
    display: block;
}

.language-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.language-option:hover {
    background: rgba(255, 255, 255, 0.1);
}

.language-option.active {
    background: rgba(99, 102, 241, 0.2);
}

.theme-toggle {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.theme-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
}

/* Hero Section with Visual Impact */
.hero {
    padding: 120px 2rem 80px;
    text-align: center;
    position: relative;
}

.hero-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    background: linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1.5rem;
    line-height: 1.1;
}

.hero-subtitle {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

/* CTA Buttons */
.cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;
}

.cta-button {
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.cta-primary {
    background: var(--gradient-primary);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.cta-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
}

.cta-secondary {
    background: transparent;
    color: white;
    border: 2px solid var(--glass-border);
    backdrop-filter: blur(10px);
}

.cta-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--primary-light);
}

/* Dashboard Grid with Modern Cards */
.dashboard {
    padding: 0 2rem 80px;
    max-width: 1400px;
    margin: 0 auto;
}

.section-header {
    display: flex;
    align-items: center;
    gap: