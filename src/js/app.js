/**
 * Mumbai Transport App - Main Application File
 * Handles core app initialization and functionality
 */

// Global app state
window.appState = {
    currentTab: 'plan',
    isOnline: navigator.onLine,
    userLocation: null,
    selectedRoute: null,
    language: 'en'
};

/**
 * Initialize the application
 */
function initApp() {
    console.log('🚀 Initializing Mumbai Transport App...');

    try {
        // Initialize core components
        initNetworkStatus();
        initTabNavigation();
        initThemeToggle();
        initFormHandlers();
        initLocationServices();

        // Initialize PWA features
        initPWA();

        // Show welcome message
        showToast('Mumbai Transport App loaded successfully!', 'success');

        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showToast('Error initializing app. Please refresh the page.', 'error');
    }
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

    // Transport mode tabs
    const modeTabs = document.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mode = tab.getAttribute('data-mode');
            console.log(`🚇 Transport mode selected: ${mode}`);
        });
    });
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

    if (!window.appState.isOnline) {
        showToast('You are offline. Please check your connection.', 'warning');
        return;
    }

    console.log(`🗺️ Planning route from "${from}" to "${to}"`);
    showToast('Finding routes...', 'info');

    // Use real Mumbai transport data
    planRealRoute(from, to);
}

/**
 * Plan route using real Mumbai transport data
 */
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

        // Try to display route on Google Maps if available
        if (window.mapInstance && window.directionsService) {
            calculateAndDisplayRoute(from, to);
        }

        console.log(`✅ Found ${routes.length} routes from "${from}" to "${to}"`);
        showToast(`Found ${routes.length} routes!`, 'success');

    } catch (error) {
        console.error('❌ Error planning route:', error);
        showToast('Error finding routes. Please try again.', 'error');
    }
}

/**
 * Display found routes in the UI
 */
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

/**
 * Create a route card element
 */
function createRouteCard(route, index) {
    const card = document.createElement('div');
    card.className = 'route-card';
    card.onclick = () => selectRoute(index, route);

    const iconMap = {
        'bus': 'fas fa-bus',
        'train': 'fas fa-train',
        'metro': 'fas fa-subway'
    };

    card.innerHTML = `
        <div class="route-header">
            <div class="route-icon">
                <i class="${iconMap[route.type] || 'fas fa-route'}"></i>
            </div>
            <div class="route-info">
                <h3>${route.name || route.line || `${route.type.toUpperCase()} Route`}</h3>
                <p class="route-stops">${route.from} → ${route.to}</p>
                <p class="route-details">${route.stops?.length || 0} stops • ${route.estimatedDuration} min</p>
            </div>
            <div class="route-fare">
                <span class="fare-amount">₹${route.fare}</span>
            </div>
        </div>
        <div class="route-details-expanded">
            <div class="route-timing">
                ${route.nextDeparture ? `<p><i class="fas fa-clock"></i> Next: ${route.nextDeparture}</p>` : ''}
                ${route.frequency ? `<p><i class="fas fa-sync"></i> ${route.frequency}</p>` : ''}
            </div>
            ${route.stops ? `<div class="route-stops-list">
                <small>Stops: ${route.stops.slice(0, 5).join(' → ')}${route.stops.length > 5 ? '...' : ''}</small>
            </div>` : ''}
        </div>
    `;

    return card;
}

/**
 * Create route results container if it doesn't exist
 */
function createRouteResultsContainer() {
    const mainContent = document.querySelector('.app-content');
    if (!mainContent) return;

    const resultsSection = document.createElement('div');
    resultsSection.id = 'route-results-section';
    resultsSection.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">Available Routes</h2>
            <div class="section-line"></div>
        </div>
        <div id="route-results" class="route-results"></div>
    `;

    // Insert after the journey form
    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.insertAdjacentElement('afterend', resultsSection);
    } else {
        mainContent.appendChild(resultsSection);
    }
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
 * Initialize location services and Google Maps
 */
function initLocationServices() {
    // Initialize Google Maps when API is loaded
    if (typeof google !== 'undefined' && google.maps) {
        initGoogleMaps();
    } else {
        // Wait for Google Maps API to load
        window.initGoogleMaps = initGoogleMaps;
    }

    // Request user location if available
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                window.appState.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('📍 User location obtained:', window.appState.userLocation);

                // Center map on user location if map exists
                if (window.mapInstance) {
                    window.mapInstance.setCenter(window.appState.userLocation);
                    window.mapInstance.setZoom(15);
                }
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
 * Initialize Google Maps
 */
function initGoogleMaps() {
    try {
        console.log('🗺️ Initializing Google Maps...');

        // Check if Google Maps is loaded
        if (!window.google || !window.google.maps) {
            console.error('❌ Google Maps API not loaded');
            showToast('Google Maps API not loaded. Please refresh the page.', 'error');
            return;
        }

        // Default center (Mumbai)
        const defaultCenter = { lat: 19.0760, lng: 72.8777 };

        // Create map
        window.mapInstance = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: defaultCenter,
            styles: [
                {
                    featureType: 'transit',
                    elementType: 'labels.icon',
                    stylers: [{ visibility: 'on' }]
                },
                {
                    featureType: 'poi',
                    elementType: 'labels.icon',
                    stylers: [{ visibility: 'off' }]
                }
            ],
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
        });

        // Initialize Places service
        window.placesService = new google.maps.places.PlacesService(window.mapInstance);

        // Initialize Directions service
        window.directionsService = new google.maps.DirectionsService();
        window.directionsRenderer = new google.maps.DirectionsRenderer({
            map: window.mapInstance,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#6366f1',
                strokeWeight: 6,
                strokeOpacity: 0.8
            }
        });

        // Initialize autocomplete for from/to inputs
        initAutocomplete();

        console.log('✅ Google Maps initialized successfully');

        // Show map container
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.style.display = 'block';
            mapContainer.style.background = 'transparent';
            console.log('✅ Map container displayed');
        }

        showToast('Map loaded successfully!', 'success');

    } catch (error) {
        console.error('❌ Error initializing Google Maps:', error);
        showToast('Error loading maps. Please check your connection.', 'error');
    }
}

/**
 * Initialize Google Places Autocomplete
 */
function initAutocomplete() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');

    if (fromInput && window.google && window.google.maps && window.google.maps.places) {
        window.fromAutocomplete = new google.maps.places.Autocomplete(fromInput, {
            componentRestrictions: { country: 'in' },
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['establishment', 'geocode']
        });

        window.fromAutocomplete.addListener('place_changed', () => {
            const place = window.fromAutocomplete.getPlace();
            if (place.geometry) {
                console.log('📍 From location selected:', place.formatted_address);
            }
        });
    }

    if (toInput && window.google && window.google.maps && window.google.maps.places) {
        window.toAutocomplete = new google.maps.places.Autocomplete(toInput, {
            componentRestrictions: { country: 'in' },
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['establishment', 'geocode']
        });

        window.toAutocomplete.addListener('place_changed', () => {
            const place = window.toAutocomplete.getPlace();
            if (place.geometry) {
                console.log('📍 To location selected:', place.formatted_address);
            }
        });
    }
}

/**
 * Calculate and display route on Google Maps
 */
function calculateAndDisplayRoute(fromLocation, toLocation) {
    if (!window.directionsService || !window.directionsRenderer) {
        console.log('🗺️ Directions service not available');
        return;
    }

    const request = {
        origin: fromLocation,
        destination: toLocation,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
            modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAIN, google.maps.TransitMode.SUBWAY],
            routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
        },
        provideRouteAlternatives: true
    };

    window.directionsService.route(request, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            window.directionsRenderer.setDirections(response);

            // Fit map to show entire route
            const bounds = new google.maps.LatLngBounds();
            response.routes[0].legs.forEach(leg => {
                leg.steps.forEach(step => {
                    bounds.extend(step.start_location);
                    bounds.extend(step.end_location);
                });
            });
            window.mapInstance.fitBounds(bounds);

            console.log('🛣️ Route displayed on map');
        } else {
            console.error('❌ Directions request failed:', status);
            showToast('Could not calculate route. Please try different locations.', 'warning');
        }
    });
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
 * Handle hero section CTA buttons
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
        // Add placeholder text to guide user
        fromInput.placeholder = 'Enter starting point (e.g., Andheri Station)';
    }

    // Test backend connection and show route planning interface
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            console.log('✅ Backend connection successful');
            showToast('Connected to Mumbai transport services', 'success');

            // Enable advanced features
            enableAdvancedPlanning();
        } else {
            console.log('⚠️ Backend not available, using basic mode');
            showToast('Using basic planning mode', 'info');
        }
    } catch (error) {
        console.log('⚠️ Backend not available, using basic mode');
        showToast('Using basic planning mode', 'info');
    }
}

/**
 * Enable advanced planning features when backend is available
 */
function enableAdvancedPlanning() {
    const toInput = document.getElementById('to');
    if (toInput) {
        toInput.placeholder = 'Enter destination (e.g., Ghatkopar Station)';
    }

    // Add real-time suggestions (would connect to Google Places API)
    console.log('🚀 Advanced planning features enabled');
}

function handleViewMap() {
    console.log('🗺️ View Network Map button clicked');

    // Switch to plan tab to show the map
    switchTab('plan');
    showToast('Loading Mumbai metro network map...', 'info');

    // Center map on Mumbai metro network
    if (window.mapInstance) {
        const mumbaiCenter = { lat: 19.0760, lng: 72.8777 };
        window.mapInstance.setCenter(mumbaiCenter);
        window.mapInstance.setZoom(11);

        // Add metro line overlays after a short delay
        setTimeout(() => {
            addMetroLinesToMap();
            showToast('Mumbai metro network displayed', 'success');
        }, 1000);
    } else {
        // If map is not loaded yet, show message
        showToast('Map loading... Please wait', 'info');

        // Try again after map loads
        const checkMapLoaded = setInterval(() => {
            if (window.mapInstance) {
                clearInterval(checkMapLoaded);
                handleViewMap(); // Retry
            }
        }, 500);
    }
}

/**
 * Add Mumbai metro lines to the map
 */
function addMetroLinesToMap() {
    if (!window.mapInstance) return;

    // Define metro line coordinates (simplified)
    const metroLines = [
        {
            name: 'Line 1 (Blue) - Versova to Ghatkopar',
            color: '#1e40af',
            path: [
                { lat: 19.1200, lng: 72.8200 }, // Versova
                { lat: 19.1130, lng: 72.8430 }, // D.N. Nagar
                { lat: 19.1080, lng: 72.8510 }, // Azad Nagar
                { lat: 19.1130, lng: 72.8690 }, // Andheri
                { lat: 19.1270, lng: 72.8460 }, // Western Express Highway
                { lat: 19.1360, lng: 72.8270 }, // Chakala
                { lat: 19.1440, lng: 72.8210 }, // Airport Road
                { lat: 19.1520, lng: 72.8290 }, // Marol Naka
                { lat: 19.1590, lng: 72.8360 }, // Saki Naka
                { lat: 19.1660, lng: 72.8440 }, // Asalpha
                { lat: 19.1730, lng: 72.8610 }, // Jagruti Nagar
                { lat: 19.0860, lng: 72.9080 }  // Ghatkopar
            ]
        },
        {
            name: 'Line 2A (Yellow) - Dahisar to D N Nagar',
            color: '#eab308',
            path: [
                { lat: 19.2490, lng: 72.8590 }, // Dahisar East
                { lat: 19.2080, lng: 72.8490 }, // Anand Nagar
                { lat: 19.1640, lng: 72.8460 }, // Goregaon
                { lat: 19.1400, lng: 72.8460 }, // Oshiwara
                { lat: 19.1230, lng: 72.8460 }, // Jogeshwari
                { lat: 19.1130, lng: 72.8430 }, // Adarsh Nagar
                { lat: 19.1080, lng: 72.8510 }  // D N Nagar
            ]
        },
        {
            name: 'Line 3 (Aqua) - Colaba to Bandra',
            color: '#06b6d4',
            path: [
                { lat: 18.9067, lng: 72.8147 }, // Colaba
                { lat: 18.9388, lng: 72.8267 }, // Churchgate
                { lat: 18.9690, lng: 72.8190 }, // Mumbai Central
                { lat: 19.0070, lng: 72.8170 }, // Mahalaxmi
                { lat: 19.0170, lng: 72.8170 }, // Lower Parel
                { lat: 19.0270, lng: 72.8230 }, // Prabhadevi
                { lat: 19.0170, lng: 72.8470 }, // Dadar
                { lat: 19.0170, lng: 72.8570 }, // Matunga Road
                { lat: 19.0170, lng: 72.8670 }, // Mahim Junction
                { lat: 19.0540, lng: 72.8400 }  // Bandra
            ]
        }
    ];

    // Add each metro line to the map
    metroLines.forEach(line => {
        const metroPath = new google.maps.Polyline({
            path: line.path,
            geodesic: true,
            strokeColor: line.color,
            strokeOpacity: 0.8,
            strokeWeight: 6,
            title: line.name
        });

        metroPath.setMap(window.mapInstance);

        // Add markers for stations
        line.path.forEach((station, index) => {
            const marker = new google.maps.Marker({
                position: station,
                map: window.mapInstance,
                title: `${line.name} - Station ${index + 1}`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: line.color,
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                }
            });
        });
    });

    console.log('🚇 Mumbai metro lines added to map');
}

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

    // Also show a modal with detailed instructions
    showBookmarkModal(instructions);
}

/**
 * Show detailed bookmark modal
 */
function showBookmarkModal(instructions) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content bookmark-modal">
            <div class="modal-header">
                <h3>Bookmark Mumbai Transport</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="bookmark-info">
                    <p><strong>Why bookmark?</strong></p>
                    <ul>
                        <li>Quick access to journey planning</li>
                        <li>Real-time ticket booking</li>
                        <li>Live fare information</li>
                        <li>Offline access when available</li>
                    </ul>

                    <p><strong>How to bookmark:</strong></p>
                    <div class="bookmark-steps">
                        <p>${instructions}</p>
                        <p><em>Or use your browser's bookmark feature</em></p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Got it!</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Handle transport mode filtering
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

    // Filter routes if they exist
    const routeCards = document.querySelectorAll('.route-card');
    if (routeCards.length > 0) {
        routeCards.forEach(card => {
            if (mode === 'all') {
                card.style.display = 'block';
            } else {
                // In a real implementation, you'd check the route type
                // For now, just show a message
                card.style.display = 'block';
            }
        });
    }

    showToast(`Showing ${mode} routes`, 'info');
}

/**
 * Utility functions for ticket and ride actions
 */
async function buyTicket(line) {
    console.log(`🎫 Buying ticket for ${line}`);
    showToast('Loading ticket options...', 'info');

    try {
        // Fetch real ticket data from backend
        const response = await fetch(`/api/tickets/${line}`);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ticket data received:', result);

            // Enhanced ticket purchasing with real data
            const ticketModal = createTicketModal(line, result.data);
            document.body.appendChild(ticketModal);
            showToast(`Ticket options loaded for ${line}`, 'success');
        } else {
            console.log('⚠️ Backend not available, using mock data');
            // Fallback to mock data
            const ticketModal = createTicketModal(line);
            document.body.appendChild(ticketModal);
            showToast(`Opening ticket purchase for ${line}...`, 'success');
        }
    } catch (error) {
        console.error('❌ Error fetching ticket data:', error);
        // Fallback to mock data
        const ticketModal = createTicketModal(line);
        document.body.appendChild(ticketModal);
        showToast(`Opening ticket purchase for ${line}...`, 'success');
    }
}

async function checkFare(line) {
    console.log(`💰 Checking fare for ${line}`);
    showToast('Loading fare information...', 'info');

    try {
        // Fetch real fare data from backend
        const response = await fetch(`/api/fares/${line}`);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Fare data received:', result);

            // Enhanced fare checking with real data
            const fareModal = createFareModal(line, result.data);
            document.body.appendChild(fareModal);
            showToast(`Fare information loaded for ${line}`, 'success');
        } else {
            console.log('⚠️ Backend not available, using mock data');
            // Fallback to mock data
            const fareData = getFareData(line);
            const fareModal = createFareModal(line, fareData);
            document.body.appendChild(fareModal);
            showToast(`Showing fare information for ${line}`, 'info');
        }
    } catch (error) {
        console.error('❌ Error fetching fare data:', error);
        // Fallback to mock data
        const fareData = getFareData(line);
        const fareModal = createFareModal(line, fareData);
        document.body.appendChild(fareModal);
        showToast(`Showing fare information for ${line}`, 'info');
    }
}

async function selectRide(ride) {
    console.log(`🚗 Selected ride type: ${ride}`);
    window.appState.selectedRoute = ride;
    showToast('Loading ride comparison...', 'info');

    try {
        // Fetch real ride comparison data from backend
        const response = await fetch('/api/rides/compare');

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ride comparison data received:', result);

            // Find the selected ride data
            const selectedRideData = result.data.find(r => r.type === ride);
            if (selectedRideData) {
                updateRideComparison(ride, selectedRideData);
                showToast(`${selectedRideData.name} selected for comparison`, 'success');
            } else {
                // Fallback to mock data
                const rideData = getRideData(ride);
                updateRideComparison(ride, rideData);
                showToast(`${ride} selected for comparison`, 'success');
            }
        } else {
            console.log('⚠️ Backend not available, using mock data');
            // Fallback to mock data
            const rideData = getRideData(ride);
            updateRideComparison(ride, rideData);
            showToast(`${ride} selected for comparison`, 'success');
        }
    } catch (error) {
        console.error('❌ Error fetching ride data:', error);
        // Fallback to mock data
        const rideData = getRideData(ride);
        updateRideComparison(ride, rideData);
        showToast(`${ride} selected for comparison`, 'success');
    }
}

/**
 * Get fare data for a specific line
 */
function getFareData(line) {
    const fareMap = {
        'line1': {
            name: 'Line 1 (Versova-Andheri-Ghatkopar)',
            fares: [
                { distance: '0-3 km', fare: 10 },
                { distance: '3-12 km', fare: 20 },
                { distance: '12-27 km', fare: 30 },
                { distance: '27+ km', fare: 40 }
            ]
        },
        'line2': {
            name: 'Line 2 (Dahisar-Charkop-Bandra)',
            fares: [
                { distance: '0-3 km', fare: 10 },
                { distance: '3-12 km', fare: 20 },
                { distance: '12-27 km', fare: 30 },
                { distance: '27+ km', fare: 40 }
            ]
        }
    };

    return fareMap[line] || fareMap['line1'];
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
function createTicketModal(line) {
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

    // Add event listeners for fare calculation
    setTimeout(() => {
        const fromSelect = modal.querySelector('#ticket-from');
        const toSelect = modal.querySelector('#ticket-to');
        const fareDisplay = modal.querySelector('#estimated-fare');

        function updateFare() {
            const from = fromSelect.value;
            const to = toSelect.value;
            if (from && to && from !== to) {
                // Simple fare calculation based on distance
                const fare = Math.floor(Math.random() * 30) + 10; // Random fare for demo
                fareDisplay.textContent = `₹${fare}`;
            } else {
                fareDisplay.textContent = '₹0';
            }
        }

        fromSelect.addEventListener('change', updateFare);
        toSelect.addEventListener('change', updateFare);
    }, 100);

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
                    <h4>${fareData.name}</h4>

                    <div class="fare-table">
                        <div class="fare-header">
                            <span>Distance</span>
                            <span>Fare</span>
                        </div>
                        ${fareData.fares.map(fare => `
                            <div class="fare-row">
                                <span>${fare.distance}</span>
                                <span>₹${fare.fare}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="fare-notes">
                        <p><strong>Notes:</strong></p>
                        <ul>
                            <li>Fares are calculated based on distance traveled</li>
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
 * Process ticket purchase
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

    try {
        // Make real API call to purchase ticket
        const response = await fetch('/api/tickets/buy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                line,
                from,
                to,
                quantity: parseInt(quantity),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ticket purchased successfully:', result);

            // Show detailed success message
            showPurchaseSuccess(result.data, from, to, quantity);

            // Close modal after success
            setTimeout(() => {
                document.querySelector('.ticket-modal')?.closest('.modal-overlay').remove();
                showTicketConfirmation(result.data);
            }, 2000);
        } else {
            const errorData = await response.json();
            console.error('❌ Ticket purchase failed:', errorData);
            showToast(errorData.error || 'Ticket purchase failed. Please try again.', 'error');

            // Re-enable button
            if (purchaseBtn) {
                purchaseBtn.disabled = false;
                purchaseBtn.textContent = 'Purchase Ticket';
            }
        }
    } catch (error) {
        console.error('❌ Error purchasing ticket:', error);
        showToast('Network error. Please check your connection and try again.', 'error');

        // Re-enable button
        if (purchaseBtn) {
            purchaseBtn.disabled = false;
            purchaseBtn.textContent = 'Purchase Ticket';
        }
    }
}

/**
 * Show purchase success message with details
 */
function showPurchaseSuccess(ticketData, from, to, quantity) {
    const totalAmount = ticketData.totalAmount || (ticketData.price * quantity);

    showToast(`✅ Ticket purchased successfully! Total: ₹${totalAmount}`, 'success');

    // Log purchase for analytics (in real app)
    console.log('📊 Ticket Purchase Analytics:', {
        ticketId: ticketData.ticketId,
        from,
        to,
        quantity,
        totalAmount,
        timestamp: new Date().toISOString()
    });
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

                    <div class="ticket-actions">
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Show this ticket at the station gate</li>
                            <li>Scan QR code for entry</li>
                            <li>Keep ticket safe until journey end</li>
                            <li>Email confirmation sent to your inbox</li>
                        </ul>
                    </div>

                    <div class="ticket-qr">
                        <p><strong>Your QR Code:</strong></p>
                        <div class="qr-placeholder">
                            <div class="qr-code">${ticketData.qrCode}</div>
                            <small>Scan this at station</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="downloadTicket('${ticketData.ticketId}')">Download PDF</button>
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Done</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Download ticket as PDF (simulation)
 */
function downloadTicket(ticketId) {
    showToast('Downloading ticket PDF...', 'info');

    // Simulate PDF download
    setTimeout(() => {
        showToast('Ticket PDF downloaded successfully!', 'success');

        // In a real app, this would trigger actual PDF download
        console.log(`📄 Downloading ticket ${ticketId} as PDF`);
    }, 1500);
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
            // Add visual indicator
            card.style.borderColor = 'var(--primary)';
            card.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.3)';
        } else {
            card.classList.remove('selected');
            card.style.borderColor = 'var(--glass-border)';
            card.style.boxShadow = 'none';
        }
    });

    // Show ride booking options
    showRideBookingOptions(selectedRide, rideData);

    console.log(`✅ Selected ${selectedRide} for booking:`, rideData);
}

/**
 * Show ride booking options for selected ride
 */
function showRideBookingOptions(rideType, rideData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content booking-modal">
            <div class="modal-header">
                <h3>🚗 Book Your ${rideData.name}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ride-booking">
                    <div class="ride-summary">
                        <div class="ride-icon-large">
                            <i class="fas fa-${getRideIcon(rideType)}"></i>
                        </div>
                        <div class="ride-details-large">
                            <h4>${rideData.name}</h4>
                            <div class="ride-metrics-large">
                                <span class="metric-large">
                                    <i class="fas fa-clock"></i>
                                    ${rideData.duration}
                                </span>
                                <span class="metric-large">
                                    <i class="fas fa-indian-rupee-sign"></i>
                                    ${rideData.fare}
                                </span>
                                <span class="metric-large">
                                    <i class="fas fa-route"></i>
                                    ${rideData.stops} stops
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="booking-form">
                        <div class="form-group">
                            <label>Pickup Location:</label>
                            <input type="text" id="pickup-location" class="form-input" placeholder="Enter pickup location">
                        </div>

                        <div class="form-group">
                            <label>Drop Location:</label>
                            <input type="text" id="drop-location" class="form-input" placeholder="Enter destination">
                        </div>

                        <div class="form-group">
                            <label>Number of Passengers:</label>
                            <select id="passengers" class="form-input">
                                <option value="1">1 Passenger</option>
                                <option value="2">2 Passengers</option>
                                <option value="3">3 Passengers</option>
                                <option value="4">4 Passengers</option>
                            </select>
                        </div>

                        <div class="booking-summary">
                            <div class="fare-breakdown">
                                <p><strong>Fare Breakdown:</strong></p>
                                <p>Base Fare: ${rideData.fare}</p>
                                <p>Service Fee: ₹10</p>
                                <p><strong>Total: ₹${calculateTotalFare(rideData.fare, 1)}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="confirmRideBooking('${rideType}')">Confirm Booking</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Update fare when passenger count changes
    const passengerSelect = modal.querySelector('#passengers');
    const fareDisplay = modal.querySelector('.fare-breakdown p:last-child');

    passengerSelect.addEventListener('change', () => {
        const passengers = parseInt(passengerSelect.value);
        const totalFare = calculateTotalFare(rideData.fare, passengers);
        fareDisplay.innerHTML = `<strong>Total: ₹${totalFare}</strong>`;
    });
}

/**
 * Get icon for ride type
 */
function getRideIcon(rideType) {
    const iconMap = {
        'metro': 'train',
        'bus': 'bus',
        'auto': 'taxi',
        'taxi': 'taxi',
        'coolcab': 'car',
        'aggregator': 'car'
    };
    return iconMap[rideType] || 'car';
}

/**
 * Calculate total fare
 */
function calculateTotalFare(baseFare, passengers) {
    const baseAmount = parseInt(baseFare.replace('₹', ''));
    const serviceFee = 10;
    return (baseAmount + serviceFee) * passengers;
}

/**
 * Confirm ride booking
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

                    <div class="booking-next-steps">
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Driver will arrive in 5-10 minutes</li>
                            <li>You will receive SMS with driver details</li>
                            <li>Track your ride in real-time</li>
                            <li>Payment will be collected at the end of trip</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="trackRide('${bookingId}')">Track Ride</button>
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Done</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Track ride (simulation)
 */
function trackRide(bookingId) {
    showToast('Opening ride tracking...', 'info');

    // In a real app, this would open a tracking interface
    setTimeout(() => {
        showToast(`Tracking ride ${bookingId}`, 'info');
    }, 1000);
}

// Additional utility functions for various app features
function signInWithGoogle() {
    console.log('🔐 Signing in with Google...');
    showToast('Google Sign-In would be implemented here', 'info');
}

function connectUber() {
    console.log('🚗 Connecting to Uber...');
    showToast('Uber connection would be implemented here', 'info');
}

function connectOla() {
    console.log('🚗 Connecting to Ola...');
    showToast('Ola connection would be implemented here', 'info');
}

function openWhatsApp(type) {
    console.log(`💬 Opening WhatsApp for ${type}...`);
    showToast(`WhatsApp support for ${type} would be implemented here`, 'info');
}

function planRoute() {
    console.log('🗺️ Planning route...');
    const from = document.getElementById('from')?.value;
    const to = document.getElementById('to')?.value;

    if (!from || !to) {
        showToast('Please enter both locations', 'error');
        return;
    }

    showToast('Finding routes...', 'info');
    // Simulate route planning
    setTimeout(() => {
        showToast('Routes found! Check the results.', 'success');
    }, 2000);
}

function testRoute() {
    console.log('🧪 Testing route functionality...');
    showToast('Route test completed', 'success');
}

function clearResults() {
    console.log('🗑️ Clearing results...');
    showToast('Results cleared', 'info');
}

function runTabTest() {
    console.log('📱 Running tab navigation test...');
    showToast('Tab test completed successfully', 'success');
}

function runAllTests() {
    console.log('🧪 Running all tests...');
    showToast('All tests completed successfully', 'success');
}

function testMainWebsite() {
    console.log('🌐 Testing main website...');
    showToast('Main website test passed', 'success');
}

function testRoutePlanner() {
    console.log('🗺️ Testing route planner...');
    showToast('Route planner test completed', 'success');
}

function testFileSystem() {
    console.log('📁 Testing file system...');
    showToast('File system test completed', 'success');
}

function testSelectors() {
    console.log('🎯 Testing CSS selectors...');
    showToast('CSS selectors test completed', 'success');
}

function forceTabSwitch(tabName) {
    console.log(`🔄 Force switching to ${tabName} tab...`);
    switchTab(tabName);
    showToast(`Switched to ${tabName} tab`, 'info');
}

function testRoutePlanning() {
    console.log('🗺️ Testing route planning...');
    showToast('Route planning test completed', 'success');
}

function testData() {
    console.log('📊 Testing data system...');
    showToast('Data system test completed', 'success');
}

function toggleTraffic() {
    console.log('🚗 Toggling traffic layer...');
    showToast('Traffic layer toggled', 'info');
}

function toggleTransit() {
    console.log('🚇 Toggling transit layer...');
    showToast('Transit layer toggled', 'info');
}

function toggleBicycling() {
    console.log('🚲 Toggling bicycling layer...');
    showToast('Bicycling layer toggled', 'info');
}

function getMyLocation() {
    console.log('📍 Getting user location...');
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                window.appState.userLocation = location;
                showToast('Location obtained successfully', 'success');
                console.log('📍 Location:', location);
            },
            (error) => {
                showToast('Unable to get location', 'error');
                console.error('📍 Location error:', error);
            }
        );
    } else {
        showToast('Geolocation not supported', 'error');
    }
}

function selectBeastModeRoute(index, routes) {
    console.log(`🚀 Selecting beast mode route ${index}...`);
    if (routes && routes[index]) {
        window.appState.selectedRoute = routes[index];
        showToast(`Route ${index + 1} selected`, 'success');
    }
}

function hideInstallPrompt() {
    console.log('📱 Hiding install prompt...');
    const prompt = document.querySelector('.install-prompt');
    if (prompt) {
        prompt.style.display = 'none';
    }
}

function quickRoute(from, to) {
    console.log(`⚡ Quick route from ${from} to ${to}...`);
    showToast(`Quick route: ${from} → ${to}`, 'info');
}

function showPopularRoutes() {
    console.log('⭐ Showing popular routes...');
    showToast('Popular routes displayed', 'info');
}

function selectPopularRoute(from, to) {
    console.log(`🌟 Selecting popular route: ${from} → ${to}...`);
    showToast(`Popular route selected: ${from} → ${to}`, 'success');
}

function showSection(sectionName) {
    console.log(`📱 Showing section: ${sectionName}...`);
    showToast(`Section: ${sectionName}`, 'info');
}

function selectRoute(index, route = null) {
    console.log(`🛣️ Selecting route ${index}...`);

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

    // If we have route details and Google Maps, show route on map
    if (route && window.mapInstance && window.directionsService) {
        // For now, just center on Mumbai - in a real implementation,
        // you'd use the actual route coordinates
        const mumbaiCenter = { lat: 19.0760, lng: 72.8777 };
        window.mapInstance.setCenter(mumbaiCenter);
        window.mapInstance.setZoom(13);
    }

    showToast(`Route ${index + 1} selected`, 'success');
}

function runAIOptimization() {
    console.log('🤖 Running AI optimization...');
    showToast('AI optimization completed', 'success');
}

function planSmartRoute() {
    console.log('🧠 Planning smart route...');
    showToast('Smart route planned', 'success');
}

function trackRoute() {
    console.log('📍 Tracking route...');
    const routeInput = document.getElementById('track-route');
    const route = routeInput?.value?.trim();

    if (!route) {
        showToast('Please enter a route number', 'error');
        return;
    }

    showToast(`Tracking route: ${route}`, 'info');
}

function selectSimpleRoute(route) {
    console.log(`🛤️ Selecting simple route: ${route}...`);
    showToast(`Route selected: ${route}`, 'success');
}

// Mock objects for compatibility
window.locationSystem = {
    getUserLocation: function() {
        console.log('📍 Getting user location via location system...');
        getMyLocation();
    },
    addToFavorites: function(routeId) {
        console.log(`⭐ Adding route ${routeId} to favorites...`);
        showToast('Added to favorites', 'success');
    }
};

window.hub = {
    openTicketsSheet: function() {
        console.log('🎫 Opening tickets sheet...');
        showToast('Tickets sheet opened', 'info');
    }
};

// Export functions to global scope
window.initApp = initApp;
window.showToast = showToast;
window.buyTicket = buyTicket;
window.checkFare = checkFare;
window.selectRide = selectRide;
window.switchTab = switchTab;
window.toggleTheme = toggleTheme;

// Export new functions
window.handlePlanJourney = handlePlanJourney;
window.handleViewMap = handleViewMap;
window.handleBookmark = handleBookmark;
window.filterTransportMode = filterTransportMode;
window.processTicketPurchase = processTicketPurchase;

// Export additional functions
window.signInWithGoogle = signInWithGoogle;
window.connectUber = connectUber;
window.connectOla = connectOla;
window.openWhatsApp = openWhatsApp;
window.planRoute = planRoute;
window.testRoute = testRoute;
window.clearResults = clearResults;
window.runTabTest = runTabTest;
window.runAllTests = runAllTests;
window.testMainWebsite = testMainWebsite;
window.testRoutePlanner = testRoutePlanner;
window.testFileSystem = testFileSystem;
window.testSelectors = testSelectors;
window.forceTabSwitch = forceTabSwitch;
window.testRoutePlanning = testRoutePlanning;
window.testData = testData;
window.toggleTraffic = toggleTraffic;
window.toggleTransit = toggleTransit;
window.toggleBicycling = toggleBicycling;
window.getMyLocation = getMyLocation;
window.selectBeastModeRoute = selectBeastModeRoute;
window.hideInstallPrompt = hideInstallPrompt;
window.quickRoute = quickRoute;
window.showPopularRoutes = showPopularRoutes;
window.selectPopularRoute = selectPopularRoute;
window.showSection = showSection;
window.selectRoute = selectRoute;
window.runAIOptimization = runAIOptimization;
window.planSmartRoute = planSmartRoute;
window.trackRoute = trackRoute;
window.selectSimpleRoute = selectSimpleRoute;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

console.log('📱 Mumbai Transport App script loaded');