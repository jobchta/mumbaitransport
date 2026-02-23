/**
 * Mumbai Transport App - Static Version (No Backend Required)
 * This version works on GitHub Pages, Netlify, and Cloudflare
 */

// NOTE: Google Maps and Realtime map features removed to eliminate costs.

/* Accurate station-based metro fares (Sept 2025) provided by operator/user */
const FARES_2025 = {
  line1: { '1': 10, '2': 20, '3': 20, '4': 30, '5': 40, '6': 40, '7': 40, '8+': 40 },         // MMOPL Line 1 cap ₹40
  line2a:{ '1': 10, '2': 20, '3': 30, '4': 40, '5': 50, '6': 60, '7': 70, '8+': 80 },         // MMMOCL
  line7: { '1': 10, '2': 20, '3': 30, '4': 40, '5': 50, '6': 60, '7': 70, '8+': 80 },         // MMMOCL
  line3: { note: 'Aqua Line (MMRCL) – fares to be confirmed; show official link instead' }     // MMRCL (underground) – placeholder
};
const FARES_LAST_VERIFIED = '2025-09';

/* Aqua Line (Line 3) and related network info – Sept 2025 (provided) */
const AQUA_INFO = {
  "lines": {
    "line3_aqua": {
      "name": "Aqua Line (Aarey-Cuffe Parade)",
      "status": "Partially operational since October 2024",
      "length_km": 33.5,
      "type": "Underground",
      "stations_count": 27,
      "timings": {
        "first_train": "5:30 AM",
        "last_train": "11:30 PM",
        "frequency_peak": "3.5 minutes",
        "frequency_offpeak": "7-10 minutes"
      },
      "operational_sections": {
        "phase1": {
          "route": "Aarey to BKC",
          "opened": "October 2024",
          "stations": [
            "Aarey JVLR", "SEEPZ", "MIDC-Andheri", "Marol Naka",
            "CSMIA Airport T2", "Sahar Road", "CSMIA Airport T1",
            "Santacruz", "Bandra Colony", "Bandra-Kurla Complex"
          ]
        },
        "phase2": {
          "route": "BKC to Worli",
          "opened": "May 2025",
          "stations": [
            "Dharavi", "Shitladevi Temple", "Dadar",
            "Siddhivinayak Temple", "Worli"
          ]
        },
        "phase3": {
          "route": "Worli to Cuffe Parade",
          "expected": "August 2025",
          "stations": [
            "Acharya Atre Chowk", "Science Museum", "Mahalakshmi",
            "Mumbai Central", "Grant Road", "Girgaon", "Kalbadevi",
            "CSMT", "Hutatma Chowk", "Churchgate", "Vidhan Bhavan", "Cuffe Parade"
          ]
        }
      },
      "key_interchanges": [
        { "station": "Marol Naka", "connects": "Line 1" },
        { "station": "BKC", "connects": "Line 2B (planned)" },
        { "station": "CSMIA Airport T1/T2", "connects": "Airport" },
        { "station": "Dadar", "connects": "Western & Central Railway" },
        { "station": "Mumbai Central", "connects": "Western Railway" },
        { "station": "CSMT", "connects": "Central Railway, Harbour Line" }
      ]
    },
    "line7_red": {
      "name": "Red Line (Dahisar East-Gundavali)",
      "status": "Operational since January 2023",
      "length_km": 16.4,
      "type": "Elevated",
      "stations_count": 14,
      "timings": {
        "first_train": "6:00 AM",
        "last_train": "10:30 PM",
        "frequency_peak": "10-12 minutes",
        "frequency_offpeak": "15 minutes"
      },
      "stations": [
        { "code": "DHE", "name": "Dahisar (East)", "zone": "Western", "interchange": "Line 2A" },
        { "code": "OVA", "name": "Ovaripada", "zone": "Western", "interchange": null },
        { "code": "NAP", "name": "National Park", "zone": "Western", "interchange": null },
        { "code": "DEV", "name": "Devipada", "zone": "Western", "interchange": null },
        { "code": "MAG", "name": "Magathane", "zone": "Western", "interchange": null },
        { "code": "POI", "name": "Poisar", "zone": "Western", "interchange": null },
        { "code": "AKU", "name": "Akurli", "zone": "Western", "interchange": null },
        { "code": "KUR", "name": "Kurar", "zone": "Western", "interchange": null },
        { "code": "DIN", "name": "Dindoshi", "zone": "Western", "interchange": null },
        { "code": "AAR", "name": "Aarey", "zone": "Western", "interchange": null },
        { "code": "GOE", "name": "Goregaon (East)", "zone": "Eastern", "interchange": null },
        { "code": "JOE", "name": "Jogeshwari (East)", "zone": "Eastern", "interchange": null },
        { "code": "SHA", "name": "Shankarwadi", "zone": "Eastern", "interchange": null },
        { "code": "GUN", "name": "Gundavali (Andheri East)", "zone": "Eastern", "interchange": null }
      ]
    }
  },
  "under_construction": {
    "line2b_yellow_extension": {
      "name": "Yellow Line Extension (Andheri West-Mandale)",
      "expected_opening": "December 2025-2027",
      "length_km": 23.6,
      "stations_count": 20,
      "key_stations": ["ESIC Nagar", "Bandra", "BKC", "Kurla East", "Chembur", "Mankhurd", "Mandale"]
    },
    "line7a_red_extension": {
      "name": "Red Line Airport Extension (Andheri East-CSIA T2)",
      "expected_opening": "2025-2026",
      "length_km": 3.17,
      "stations_count": 2,
      "stations": ["Airport Colony", "CSIA Terminal 2"]
    },
    "line9_red_north": {
      "name": "Red Line North Extension (Dahisar East-Mira Bhayandar)",
      "expected_opening": "2025-2026",
      "length_km": 11.4,
      "stations_count": 7,
      "stations": ["Pandurang Wadi", "Miragaon", "Kashigaon", "Sai Baba Nagar", "Meditya Nagar", "Shaheed Bhaghat Singh Garden", "Subhash Chandra Bose Ground"]
    }
  },
  "payment_methods": {
    "single_journey_token": "₹10-80 based on distance",
    "mumbai1_smart_card": "5-10% discount, ₹100-3000 recharge",
    "whatsapp_ticketing": "Available via 86526 35500",
    "mobile_app": "QR code tickets via Mumbai Metro app",
    "contactless_payment": "UPI, cards accepted at all stations"
  },
  "updated_date": "September 2025",
  "source": "MMRDA, MMRC, Reliance Mumbai Metro official data"
};
/* Build UI-friendly fare array for modal/table from FARES_2025 map */
function buildFareArrayFromMap(lineKey) {
  const map = FARES_2025[lineKey];
  if (!map || typeof map !== 'object') return [];
  const rows = [];
  for (let i = 1; i <= 7; i++) {
    const k = String(i);
    if (Object.prototype.hasOwnProperty.call(map, k)) {
      rows.push({ stations: `${i} ${i === 1 ? 'station' : 'stations'}`, fare: map[k] });
    }
  }
  if (Object.prototype.hasOwnProperty.call(map, '8+')) {
    rows.push({ stations: '8+ stations', fare: map['8+'] });
  }
  return rows;
}

/* Compute single-journey fare by stations for a given line */
function fareByStations(lineKey, stations) {
  const map = FARES_2025[lineKey];
  if (!map || map.note) return NaN; // unsupported (e.g., Line 3 pending)
  const s = Math.max(1, Math.floor(Number(stations) || 1));
  if (s >= 8) return map['8+'];
  const val = map[String(s)];
  return typeof val === 'number' ? val : NaN;
}
// Global app state
window.appState = {
    currentTab: 'plan',
    isOnline: navigator.onLine,
    userLocation: null,
    selectedRoute: null,
    language: 'en',
    // Static data for when backend is not available
    staticData: {
        fares: {
            'line1': {
                name: 'Line 1 (Versova-Andheri-Ghatkopar)',
                fares: buildFareArrayFromMap('line1')
            },
            'line2a': {
                name: 'Line 2A (Dahisar East-DN Nagar)',
                fares: buildFareArrayFromMap('line2a')
            },
            'line3': {
                name: 'Line 3 (Cuffe Parade-Bandra)',
                fares: buildFareArrayFromMap('line3')
            },
            'line7': {
                name: 'Line 7 (Dahisar-Andheri)',
                fares: buildFareArrayFromMap('line7')
            }
        },
        routes: []
    }
};

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
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

/**
 * Initialize network status monitoring
 */
function initNetworkStatus() {
    window.addEventListener('online', () => {
        window.appState.isOnline = true;
        showToast('You are back online', 'success');
        console.log('📱 Network: Online');
    });

    window.addEventListener('offline', () => {
        window.appState.isOnline = false;
        showToast('You are offline. Some features may not work.', 'warning');
        console.log('📱 Network: Offline');
    });
}

/**
 * Initialize tab navigation
 */
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

/**
 * Switch to a specific tab
 */
function switchTab(tabName) {
    window.appState.currentTab = tabName;

    // Update radio buttons
    const radioButton = document.getElementById(`${tabName}-radio`);
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

    // Toggle any sections that should only show on the Tickets tab
    try {
        const ticketsOnly = document.querySelectorAll('.tickets-only');
        ticketsOnly.forEach(el => {
            el.style.display = (tabName === 'tickets') ? '' : 'none';
        });
    } catch {}

    console.log(`📱 Switched to tab: ${tabName}`);
}

/**
 * Initialize theme toggle
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        loadSavedTheme();
    }
}

/**
 * Toggle between light and dark theme
 */
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

    console.log(`🎨 Theme changed to: ${newTheme}`);
}

/**
 * Load saved theme from localStorage
 */
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

/**
 * Initialize form handlers
 */
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

/**
 * Handle journey form submission
 */
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

    console.log(`🗺️ Planning route from "${from}" to "${to}"`);
    showToast('Routing is currently unavailable (Map disabled).', 'info');

    // Routing removed to avoid Google Maps costs
}

/**
 * Swap from and to locations
 */
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

/**
 * Initialize location services
 */
function initLocationServices() {
    // Request user location if available
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                window.appState.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('📍 User location obtained:', window.appState.userLocation);
            },
            (error) => {
                console.log('📍 Location access denied:', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }
}

/**
 * Initialize PWA features
 */
function initPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('src/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    }

    // Handle install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('📱 Install prompt ready');

        // Show install button if it exists
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });

    window.addEventListener('appinstalled', () => {
        console.log('📱 App installed successfully');
        deferredPrompt = null;

        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    });

    // Handle install button click
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });
    }
}

/**
 * Initialize the application (Static Version)
 */
function initApp() {
    console.log('🚀 Initializing Mumbai Transport App (Static Version)...');

    try {
        // Initialize core components
        initNetworkStatus();
        initTabNavigation();
        initThemeToggle();
        initFormHandlers();
        initLocationServices();

        // Initialize PWA features
        initPWA();

        // Force-remove any stale static "Available Routes" section
        const stale = document.getElementById('route-results-section');
        if (stale) stale.remove();

        // Also clear any existing route results containers
        const routeResults = document.getElementById('route-results');
        if (routeResults) {
            routeResults.innerHTML = '';
        }

        // Initialize Station-based Metro Fare Calculator if present (no framework)
        try {
            const lineSel = document.getElementById('calc-line');
            const stationsInput = document.getElementById('calc-stations');
            const qtyInput = document.getElementById('calc-qty');
            const singleEl = document.getElementById('calc-single');
            const perEl = document.getElementById('calc-per');
            const totalEl = document.getElementById('calc-total');

            function calcFare(n) {
                n = Math.max(1, Math.min(100, parseInt(n || '1', 10)));
                return Math.min(n, 8) * 10; // 1..8+ stations => ₹10..₹80
            }
            function updateCalc() {
                if (!stationsInput || !qtyInput || !singleEl || !perEl || !totalEl) return;
                const s = Math.max(1, Math.min(100, parseInt(stationsInput.value || '1', 10)));
                const q = Math.max(1, Math.min(10, parseInt(qtyInput.value || '1', 10)));
                const lineKey = (lineSel && lineSel.value) || 'line2a';
                let single = fareByStations(lineKey, s);
                if (!isFinite(single)) {
                  // Fallback for unsupported lines (e.g., Line 3 until slabs confirmed)
                  single = Math.min(s, 8) * 10;
                }
                singleEl.textContent = `₹${single}`;
                perEl.textContent = `${s} ${s === 1 ? 'station' : 'stations'} • per ticket`;
                totalEl.textContent = `Total: ₹${single * q}`;
            }
            [lineSel, stationsInput, qtyInput].forEach(el => el && el.addEventListener('input', updateCalc));
            updateCalc();
            // Expose for other handlers
            window.updateStationFareCalc = updateCalc;
        } catch (e) { console.log('fare calc init error', e); }

        // Show welcome message
        showToast('Mumbai Transport App loaded successfully!', 'success');

        console.log('✅ App initialized successfully (Static Mode)');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showToast('Error initializing app. Please refresh the page.', 'error');
    }
}

/**
 * Handle hero section CTA buttons (Static Version)
 */
async function handlePlanJourney() {
    console.log('🗺️ Plan Your Journey button clicked');

    // Switch to plan tab
    switchTab('plan');
    showToast('Ready to plan your journey!', 'info');

    // Focus on the from input for immediate use
    const fromInput = document.getElementById('from');
    if (fromInput) {
        fromInput.focus();
        fromInput.placeholder = 'Enter starting point (e.g., Andheri Station)';
    }

    

    console.log('✅ Journey planning interface ready');
}

// showAvailableRoutes function removed

/**
 * Handle View Map button (Static Version)
 */
function handleViewMap() {
    console.log('🗺️ View Network Map button clicked');

    // Switch to plan tab to show the map
    switchTab('plan');
    showToast('Map feature is currently disabled.', 'warning');
}

/**
 * Handle Bookmark button (Static Version)
 */
function handleBookmark() {
    console.log('🔖 Bookmark button clicked');

    // Try to add to browser bookmarks
    if (window.sidebar && window.sidebar.addPanel) {
        // Firefox
        window.sidebar.addPanel('Mumbai Transport', window.location.href, '');
        showToast('Page bookmarked successfully!', 'success');
    } else if (window.external && ('AddFavorite' in window.external)) {
        // IE
        window.external.AddFavorite(window.location.href, 'Mumbai Transport');
        showToast('Page bookmarked successfully!', 'success');
    } else {
        // Modern browsers - try Web Share API first
        if (navigator.share && navigator.canShare) {
            const shareData = {
                title: 'Mumbai Transport - Plan Your Mumbai Journey',
                text: 'Official app for planning journeys, buying tickets, and comparing rides in Mumbai',
                url: window.location.href
            };

            if (navigator.canShare(shareData)) {
                navigator.share(shareData)
                    .then(() => showToast('Shared successfully!', 'success'))
                    .catch(() => showBookmarkInstructions());
            } else {
                showBookmarkInstructions();
            }
        } else {
            showBookmarkInstructions();
        }
    }
}

/**
 * Handle transport mode filtering (Static Version)
 */
function filterTransportMode(mode) {
    console.log(`🚇 Filtering by transport mode: ${mode}`);

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

    showToast(`Showing ${mode} routes (Static)`, 'info');
}

/**
 * Handle ticket purchasing (Static Version)
 */
async function buyTicket(line) {
    console.log(`🎫 Buying ticket for ${line}`);
    // Direct official booking links (no framework, no tokens)
    const LINKS = {
        line1: 'https://wa.me/919670008889',      // MMOPL Line 1 WhatsApp
        line2a: 'https://wa.me/918652635500',     // MMMOCL Lines 2A & 7 WhatsApp
        line7: 'https://wa.me/918652635500',      // MMMOCL Lines 2A & 7 WhatsApp
        line3: 'https://mmrcl.com/en/map'         // MMRCL info/booking/map
    };
    const target = LINKS[line];
    if (target) {
        try { window.open(target, '_blank', 'noopener'); } catch {}
        showToast('Opening official ticketing...', 'info');
        return;
    }

    // Fallback to static modal
    showToast('Loading ticket options...', 'info');
    const ticketData = window.appState.staticData.fares[line];
    if (ticketData) {
        const ticketModal = createTicketModal(line, { data: ticketData });
        document.body.appendChild(ticketModal);
        showToast(`Ticket options loaded for ${line}`, 'success');
    } else {
        const ticketModal = createTicketModal(line);
        document.body.appendChild(ticketModal);
        showToast(`Opening ticket purchase for ${line}...`, 'success');
    }
}

/**
 * Handle fare checking (Static Version)
 */
async function checkFare(line) {
    console.log(`💰 Checking fare for ${line}`);
    showToast('Loading fare information...', 'info');

    // Use static data instead of API call
    const fareData = window.appState.staticData.fares[line];
    if (fareData) {
        const fareModal = createFareModal(line, { data: fareData });
        document.body.appendChild(fareModal);
        showToast(`Fare information loaded for ${line}`, 'success');
    } else {
        // Fallback to mock data
        const f = getFareData(line);
        const fareModal = createFareModal(line, f);
        document.body.appendChild(fareModal);
        showToast(`Showing fare information for ${line}`, 'info');
    }

    // Also guide users to the station-based calculator (no framework)
    try {
        // Switch to Tickets tab
        const ticketsRadio = document.getElementById('tickets-radio');
        if (ticketsRadio) {
            ticketsRadio.checked = true;
            switchTab('tickets');
        }
        // Select line in calculator if present
        const lineSel = document.getElementById('calc-line');
        if (lineSel) {
            lineSel.value = line;
            lineSel.dispatchEvent(new Event('input', { bubbles: true }));
        }
        // Scroll into view
        const calc = document.getElementById('station-fare-calculator');
        if (calc) {
            calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Ensure the totals reflect current inputs
            if (typeof window.updateStationFareCalc === 'function') window.updateStationFareCalc();
        }
    } catch (e) {}
}

/**
 * Handle ride selection (Static Version)
 */
async function selectRide(ride) {
    console.log(`🚗 Selected ride type: ${ride}`);
    window.appState.selectedRoute = ride;
    showToast('Loading ride comparison...', 'info');

    // Use static ride data
    const rideData = getRideData(ride);
    updateRideComparison(ride, rideData);
    showToast(`${ride} selected for comparison`, 'success');
}

/**
 * Process ticket purchase (Static Version)
 */
async function processTicketPurchase(line) {
    const from = document.getElementById('ticket-from')?.value;
    const to = document.getElementById('ticket-to')?.value;
    const quantity = document.getElementById('ticket-quantity')?.value || 1;

    // Validate inputs
    if (!from || !to) {
        showToast('Please select both departure and destination stations', 'error');
        return;
    }

    if (from === to) {
        showToast('Departure and destination cannot be the same', 'error');
        return;
    }

    if (quantity < 1 || quantity > 10) {
        showToast('Please select 1-10 tickets', 'error');
        return;
    }

    // Show processing state
    const purchaseBtn = document.querySelector('.ticket-modal .btn-primary');
    if (purchaseBtn) {
        purchaseBtn.disabled = true;
        purchaseBtn.textContent = 'Processing...';
    }

    showToast(`Processing ${quantity} ticket(s) from ${from} to ${to}...`, 'info');

    // Simulate processing (no real API call)
    setTimeout(() => {
        const ticketId = `TKT${Date.now()}`;
        const ticketData = {
            ticketId: ticketId,
            totalAmount: Math.floor(Math.random() * 30) + 10, // Random fare for demo
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            qrCode: `QR${ticketId}`
        };

        // Show detailed success message
        showPurchaseSuccess(ticketData, from, to, quantity);

        // Close modal after success
        setTimeout(() => {
            document.querySelector('.ticket-modal')?.closest('.modal-overlay').remove();
            showTicketConfirmation(ticketData);
        }, 2000);
    }, 2000);
}

/**
 * Confirm ride booking (Static Version)
 */
function confirmRideBooking(rideType) {
    const pickup = document.getElementById('pickup-location')?.value;
    const drop = document.getElementById('drop-location')?.value;
    const passengers = document.getElementById('passengers')?.value;

    if (!pickup || !drop) {
        showToast('Please enter pickup and drop locations', 'error');
        return;
    }

    // Disable button during processing
    const confirmBtn = document.querySelector('.booking-modal .btn-primary');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Booking...';
    }

    showToast('Processing your booking...', 'info');

    // Simulate booking process
    setTimeout(() => {
        const bookingId = `BK${Date.now()}`;
        showToast(`✅ Booking confirmed! ID: ${bookingId}`, 'success');

        // Close modal and show confirmation
        document.querySelector('.booking-modal')?.closest('.modal-overlay').remove();
        showBookingConfirmation(bookingId, rideType, pickup, drop, passengers);
    }, 2000);
}

// Static route display functions removed - using Google Directions only

/**
 * Show bookmark instructions for different browsers
 */
function showBookmarkInstructions() {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let instructions = '';

    if (isMobile) {
        if (isMac) {
            instructions = 'Tap the share button, then "Add to Home Screen"';
        } else {
            instructions = 'Tap the menu (⋮), then "Add to Home screen"';
        }
    } else {
        if (isMac) {
            instructions = 'Press Cmd+D to bookmark this page';
        } else {
            instructions = 'Press Ctrl+D to bookmark this page';
        }
    }

    showToast(instructions, 'info');
}

/**
 * Get fare data for a specific line
 */
function getFareData(line) {
    const names = {
        line1: 'Line 1 (Versova-Andheri-Ghatkopar)',
        line2a: 'Line 2A (Dahisar East-DN Nagar)',
        line3: 'Line 3 (Cuffe Parade-Bandra)',
        line7: 'Line 7 (Dahisar-Andheri)'
    };
    const key = names[line] ? line : 'line1';
    return {
        name: names[key],
        fares: buildFareArrayFromMap(key)
    };
}

/**
 * Get ride data for comparison
 */
function getRideData(ride) {
    const rideMap = {
        'metro': {
            name: 'Metro',
            duration: '25 min',
            fare: '₹30',
            stops: 8,
            frequency: 'Every 3-5 min'
        },
        'bus': {
            name: 'Bus',
            duration: '45 min',
            fare: '₹15',
            stops: 12,
            frequency: 'Every 10-15 min'
        }
    };

    return rideMap[ride] || rideMap['metro'];
}

/**
 * Create ticket purchase modal
 */
function createTicketModal(line, ticketData = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content ticket-modal">
            <div class="modal-header">
                <h3>Buy Metro Ticket</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ticket-info">
                    <h4>${getFareData(line).name}</h4>
                    <p>Select your journey details:</p>

                    <div class="ticket-form">
                        <div class="form-group">
                            <label>From Station:</label>
                            <select id="ticket-from" class="form-input">
                                <option value="">Select departure station</option>
                                <option value="versova">Versova</option>
                                <option value="andheri">Andheri</option>
                                <option value="ghatkopar">Ghatkopar</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>To Station:</label>
                            <select id="ticket-to" class="form-input">
                                <option value="">Select destination station</option>
                                <option value="versova">Versova</option>
                                <option value="andheri">Andheri</option>
                                <option value="ghatkopar">Ghatkopar</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Number of Tickets:</label>
                            <input type="number" id="ticket-quantity" class="form-input" value="1" min="1" max="10">
                        </div>

                        <div class="fare-display">
                            <p>Estimated Fare: <span id="estimated-fare">₹0</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="processTicketPurchase('${line}')">Purchase Ticket</button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Create fare information modal
 */
function createFareModal(line, fareData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content fare-modal">
            <div class="modal-header">
                <h3>Fare Information</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="fare-info">
                    <h4>${fareData.data ? fareData.data.name : fareData.name}</h4>

                    <div class="fare-table">
                        <div class="fare-header">
                            <span>Stations</span>
                            <span>Fare</span>
                        </div>
                        ${(fareData.data ? fareData.data.fares : fareData.fares).map(fare => `
                            <div class="fare-row">
                                <span>${fare.stations || fare.distance}</span>
                                <span>₹${fare.fare}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="fare-notes">
                        <p><strong>Notes:</strong></p>
                        <ul>
                            <li>Fares last verified: 2025-09</li>
                            <li>Metro fares are calculated by number of stations traveled</li>
                            <li>Children under 5 travel free</li>
                            <li>Senior citizens (60+) get 50% discount</li>
                            <li>Student concessions available with valid ID</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Show purchase success message
 */
function showPurchaseSuccess(ticketData, from, to, quantity) {
    const totalAmount = ticketData.totalAmount || 30;
    showToast(`✅ Ticket purchased successfully! Total: ₹${totalAmount}`, 'success');
}

/**
 * Show ticket confirmation modal
 */
function showTicketConfirmation(ticketData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content confirmation-modal">
            <div class="modal-header">
                <h3>🎫 Ticket Confirmed!</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ticket-confirmation">
                    <div class="ticket-details">
                        <p><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
                        <p><strong>Valid Until:</strong> ${new Date(ticketData.validUntil).toLocaleString()}</p>
                        <p><strong>QR Code:</strong> ${ticketData.qrCode}</p>
                        <p><strong>Total Amount:</strong> ₹${ticketData.totalAmount}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Done</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Update ride comparison display
 */
function updateRideComparison(selectedRide, rideData) {
    const comparisonCards = document.querySelectorAll('.comparison-card');

    comparisonCards.forEach(card => {
        const rideType = card.querySelector('.ride-details h3')?.textContent?.toLowerCase();
        if (rideType === selectedRide) {
            card.classList.add('selected');
            card.style.borderColor = 'var(--primary, #6366f1)';
            card.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.3)';
        } else {
            card.classList.remove('selected');
            card.style.borderColor = 'var(--glass-border, rgba(255,255,255,0.1))';
            card.style.boxShadow = 'none';
        }
    });

    console.log(`✅ Selected ${selectedRide} for booking:`, rideData);
}

/**
 * Show booking confirmation
 */
function showBookingConfirmation(bookingId, rideType, pickup, drop, passengers) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content confirmation-modal">
            <div class="modal-header">
                <h3>🎫 Booking Confirmed!</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="booking-confirmation">
                    <div class="booking-details">
                        <p><strong>Booking ID:</strong> ${bookingId}</p>
                        <p><strong>Ride Type:</strong> ${rideType.charAt(0).toUpperCase() + rideType.slice(1)}</p>
                        <p><strong>From:</strong> ${pickup}</p>
                        <p><strong>To:</strong> ${drop}</p>
                        <p><strong>Passengers:</strong> ${passengers}</p>
                        <p><strong>Status:</strong> <span class="status-confirmed">Confirmed</span></p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Done</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Export functions to global scope
window.initApp = initApp;
window.showToast = showToast;
window.buyTicket = buyTicket;
window.checkFare = checkFare;
window.selectRide = selectRide;
window.switchTab = switchTab;
window.toggleTheme = toggleTheme;
window.handlePlanJourney = handlePlanJourney;
window.handleViewMap = handleViewMap;
window.handleBookmark = handleBookmark;
window.filterTransportMode = filterTransportMode;
window.processTicketPurchase = processTicketPurchase;
window.confirmRideBooking = confirmRideBooking;
// Static route functions removed
window.getFareData = getFareData;
window.getRideData = getRideData;
window.updateRideComparison = updateRideComparison;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

console.log('📱 Mumbai Transport App (Static Version) script loaded');
/* === Additions: Regulated Fare Calculator (Sept 2025) + Better Metro Fare === */

/* Govt regulated fares (Sept 2025) */
const REGULATED_RATES = {
  auto:    { base: 26, perKm: 17.14, nightPct: 25, initialKm: 1.5 },
  taxi:    { base: 31, perKm: 20.66, nightPct: 25, initialKm: 1.5 },
  coolcab: { base: 48, perKm: 37.20, nightPct: 25, initialKm: 1.5 }
};

/* Calculate regulated fare with 1.5 km base and optional night surcharge */
function calculateRegulatedFare(mode, km, isNight) {
  const r = REGULATED_RATES[mode];
  if (!r) return 0;
  const d = Math.max(0, parseFloat(km || 0));
  const beyond = Math.max(0, d - r.initialKm);
  let total = r.base + beyond * r.perKm;
  if (isNight) total *= (1 + r.nightPct / 100);
  return Math.round(total);
}

/* Simple number -> INR */
function toINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

/* Modal: Cab & Auto Fare Calculator */
function openFareCalculator() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content fare-modal">
      <div class="modal-header">
        <h3>Cab & Auto Fare Calculator (Mumbai – Sept 2025)</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="fare-info">
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
            <div class="form-group">
              <label>Mode</label>
              <select id="fc-mode" class="form-input">
                <option value="auto">Auto‑Rickshaw</option>
                <option value="taxi">Kaali‑Peeli Taxi</option>
                <option value="coolcab">Cool Cab (AC)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Distance (km)</label>
              <input id="fc-km" type="number" min="0" step="0.1" value="5" class="form-input"/>
            </div>
            <div class="form-group" style="display:flex;align-items:center;gap:8px;">
              <input id="fc-night" type="checkbox"/>
              <label for="fc-night" style="margin:0;">Night (12am–5am) +25%</label>
            </div>
          </div>

          <div class="fare-grid" style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
            <div class="fare-card">
              <div class="fare-amount" id="fc-result">₹0</div>
              <div class="fare-distance" id="fc-breakdown">Base + per‑km (beyond 1.5 km)</div>
            </div>
          </div>

          <div class="fare-notes" style="margin-top:8px;">
            <p><strong>Notes:</strong></p>
            <ul>
              <li>Auto min ₹26, Taxi min ₹31, Cool Cab min ₹48 (covers first 1.5 km).</li>
              <li>Beyond 1.5 km: per‑km as per regulation. Night surcharge +25% (12am–5am).</li>
              <li>App cabs (Uber/Ola) are dynamic; new policy caps surge ≤1.5× base.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const  = modal.querySelector('#fc-mode');
  const    = modal.querySelector('#fc-km');
  const = modal.querySelector('#fc-night');
  const   = modal.querySelector('#fc-result');
  const    = modal.querySelector('#fc-breakdown');

  function recompute() {
    const m = .value;
    const k = parseFloat(.value || '0');
    const n = !!.checked;
    const r = REGULATED_RATES[m];
    const fare = calculateRegulatedFare(m, k, n);
    .textContent = toINR(fare);
    .textContent = `Base ${toINR(r.base)} + ${toINR(r.perKm)}/km beyond ${r.initialKm} km${n ? ' (+25% night)' : ''}`;
  }
  [,,].forEach(el => el.addEventListener('input', recompute));
  recompute();
}

/* Inject a button into Tickets tab to open calculator */
function injectCabAutoCalculatorButton() {
  const ticketsTab = document.querySelector('#tickets-tab');
  if (!ticketsTab) return;
  if (document.getElementById('cab-auto-calc-btn')) return;

  const wrap = document.createElement('div');
  wrap.style.marginTop = '12px';
  wrap.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Cabs & Autos</h2>
      <div class="section-line"></div>
    </div>
    <button id="cab-auto-calc-btn" class="btn btn-outline">
      <i class="fas fa-indian-rupee-sign"></i> Cab & Auto Fare Calculator
    </button>
  `;
  ticketsTab.appendChild(wrap);
  wrap.querySelector('#cab-auto-calc-btn').addEventListener('click', openFareCalculator);
}

/* More realistic Metro ticket fare inside ticket modal (slab based) */
(function overrideTicketModal() {
  // Slab: 0–3 = 10, 3–12 = 20, 12–27 = 30, 27+ = 40
  function metroFareFromDistance(km) {
    const d = Math.max(0, km);
    if (d <= 3) return 10;
    if (d <= 12) return 20;
    if (d <= 27) return 30;
    return 40;
  }
  // Approx distances between demo stations
  const METRO_DISTANCES = {
    versova:   { andheri: 4.0, ghatkopar: 16.0 },
    andheri:   { versova: 4.0, ghatkopar: 12.0 },
    ghatkopar: { versova: 16.0, andheri: 12.0 }
  };

  // Override existing createTicketModal with slab-based fare calc
  const originalCreateTicketModal = window.createTicketModal;
  window.createTicketModal = function(line) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content ticket-modal">
        <div class="modal-header">
          <h3>Buy Metro Ticket</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="ticket-info">
            <h4>Line: ${line?.toUpperCase?.() || 'Metro'}</h4>
            <p>Select your journey details:</p>

            <div class="ticket-form">
              <div class="form-group">
                <label>From Station:</label>
                <select id="ticket-from" class="form-input">
                  <option value="">Select departure station</option>
                  <option value="versova">Versova</option>
                  <option value="andheri">Andheri</option>
                  <option value="ghatkopar">Ghatkopar</option>
                </select>
              </div>

              <div class="form-group">
                <label>To Station:</label>
                <select id="ticket-to" class="form-input">
                  <option value="">Select destination station</option>
                  <option value="versova">Versova</option>
                  <option value="andheri">Andheri</option>
                  <option value="ghatkopar">Ghatkopar</option>
                </select>
              </div>

              <div class="form-group">
                <label>Number of Tickets:</label>
                <input type="number" id="ticket-quantity" class="form-input" value="1" min="1" max="10">
              </div>

              <div class="fare-display">
                <p>Estimated Fare: <span id="estimated-fare">₹0</span></p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="processTicketPurchase('${line}')">Purchase Ticket</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const fromSelect = modal.querySelector('#ticket-from');
    const toSelect   = modal.querySelector('#ticket-to');
    const qtyInput   = modal.querySelector('#ticket-quantity');
    const fareOut    = modal.querySelector('#estimated-fare');

    function updateFare() {
      const from = fromSelect.value;
      const to   = toSelect.value;
      const qty  = Math.max(1, parseInt(qtyInput.value || '1', 10));
      if (!from || !to || from === to) { fareOut.textContent = '₹0'; return; }
      const d = (METRO_DISTANCES[from] && METRO_DISTANCES[from][to]) || 0;
      const single = metroFareFromDistance(d);
      fareOut.textContent = toINR(single * qty);
    }
    [fromSelect, toSelect, qtyInput].forEach(el => el.addEventListener('input', updateFare));
    updateFare();

    return modal;
  };

  // keep reference for safety
  window._originalCreateTicketModal = originalCreateTicketModal;
})();

/* Ensure the button appears after DOM & initial JS setup */
document.addEventListener('DOMContentLoaded', () => {
  try { injectCabAutoCalculatorButton(); } catch(e) { console.log('inject calc btn error', e); }
});

/* === Aqua Line (Line 3) info modal + safe interceptor (no framework) === */
function createAquaInfoModal() {
  try {
    const info = (typeof AQUA_INFO === 'object' && AQUA_INFO.lines && AQUA_INFO.lines.line3_aqua) ? AQUA_INFO.lines.line3_aqua : null;
    const timings = info?.timings || {};
    const phases = info?.operational_sections || {};
    const interchanges = info?.key_interchanges || [];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const body = `
      <div class="fare-info">
        <h4>${info?.name || 'Aqua Line (Line 3)'}</h4>
        <p style="margin:6px 0; opacity:0.85;">
          ${info?.status || 'Partially operational'} • ${info?.type || ''} • ${info?.stations_count || ''} stations • ${info?.length_km || ''} km
        </p>

        <div class="fare-notes" style="margin:8px 0;">
          <p><strong>Timings:</strong> ${timings.first_train || ''} – ${timings.last_train || ''} • Peak ${timings.frequency_peak || ''} • Off-peak ${timings.frequency_offpeak || ''}</p>
        </div>

        <div class="fare-notes" style="margin:8px 0;">
          <p><strong>Operational Sections:</strong></p>
          <ul style="margin-left:18px; line-height:1.4;">
            ${phases.phase1 ? `<li><strong>${phases.phase1.route}</strong> (${phases.phase1.opened}) — ${phases.phase1.stations.join(', ')}</li>` : ''}
            ${phases.phase2 ? `<li><strong>${phases.phase2.route}</strong> (${phases.phase2.opened}) — ${phases.phase2.stations.join(', ')}</li>` : ''}
            ${phases.phase3 ? `<li><strong>${phases.phase3.route}</strong> (${phases.phase3.expected}) — ${phases.phase3.stations.join(', ')}</li>` : ''}
          </ul>
        </div>

        <div class="fare-notes" style="margin:8px 0;">
          <p><strong>Key Interchanges:</strong> ${interchanges.map(i => `${i.station} (${i.connects})`).join(', ')}</p>
        </div>

        <div style="margin-top:10px;">
          <a class="btn btn-outline" href="https://mmrcl.com/en/map" target="_blank" rel="noopener">Open MMRCL Map &amp; Info</a>
        </div>

        <div class="fare-notes" style="margin-top:10px;">
          <p><strong>Notes:</strong></p>
          <ul style="margin-left:18px; line-height:1.4;">
            <li>Fares for Aqua Line are published by MMRCL. Verify at the official site.</li>
            <li>Information last updated: ${AQUA_INFO?.updated_date || 'September 2025'}</li>
            <li>Source: ${AQUA_INFO?.source || 'Official operator data'}</li>
          </ul>
        </div>
      </div>
    `;

    modal.innerHTML = `
      <div class="modal-content fare-modal">
        <div class="modal-header">
          <h3>Line Information</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          ${body}
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        </div>
      </div>
    `;

    return modal;
  } catch (e) {
    console.log('createAquaInfoModal error', e);
    const m = document.createElement('div');
    m.className = 'modal-overlay';
    m.innerHTML = `
      <div class="modal-content fare-modal">
        <div class="modal-header">
          <h3>Line Information</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <p>Could not load Aqua Line information. Please check the official site.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        </div>
      </div>
    `;
    return m;
  }
}

/* Intercept checkFare only for Aqua (Line 3), keep original behavior for others */
(function patchCheckFareForAqua(){
  try {
    const original = window.checkFare;
    if (typeof original !== 'function') return;

    window.checkFare = async function(line) {
      try {
        if (line === 'line3') {
          const modal = createAquaInfoModal();
          document.body.appendChild(modal);
          showToast && showToast('Aqua Line information loaded', 'success');
          return;
        }
      } catch (e) {
        console.log('Aqua interceptor error', e);
      }
      return original.apply(this, arguments);
    };
  } catch (e) {
    console.log('patchCheckFareForAqua error', e);
  }
})();
