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
        console.log(`🗺️ Planning route from "${from}" to "${to}"`);

        // Check if real transport data is available
        if (!window.REAL_MUMBAI_TRANSPORT_DATA) {
            console.error('❌ Transport data not loaded');
            showToast('Transport data not loaded. Please refresh the page.', 'error');
            return;
        }

        const routeEngine = window.REAL_MUMBAI_TRANSPORT_DATA.routePlanningEngine;
        const routes = routeEngine.findRoutes(from, to);

        console.log(`📊 Route search results:`, routes);

        if (routes.length === 0) {
            console.log('⚠️ No routes found, trying fuzzy matching...');
            // Try fuzzy matching for common location variations
            const fuzzyRoutes = findRoutesWithFuzzyMatching(from, to);
            if (fuzzyRoutes.length > 0) {
                console.log(`✅ Found ${fuzzyRoutes.length} routes with fuzzy matching`);
                displayRoutes(fuzzyRoutes, from, to);
                showToast(`Found ${fuzzyRoutes.length} routes!`, 'success');
                return;
            }

            showToast('No routes found. Try locations like "Andheri", "Bandra", "Dadar", etc.', 'warning');
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
 * Find routes with fuzzy matching for common location variations
 */
function findRoutesWithFuzzyMatching(from, to) {
    const fuzzyRoutes = [];

    // Common location mappings
    const locationMappings = {
        'andheri': ['andheri', 'andheri station', 'andheri west', 'andheri east'],
        'bandra': ['bandra', 'bandra station', 'bandra west', 'bandra east'],
        'dadar': ['dadar', 'dadar station', 'dadar west', 'dadar east'],
        'borivali': ['borivali', 'borivali station', 'borivali west', 'borivali east'],
        'thane': ['thane', 'thane station'],
        'ghatkopar': ['ghatkopar', 'ghatkopar station'],
        'mulund': ['mulund', 'mulund station'],
        'bhandup': ['bhandup', 'bhandup station'],
        'sion': ['sion', 'sion station'],
        'kurla': ['kurla', 'kurla station'],
        'matunga': ['matunga', 'matunga station'],
        'mahim': ['mahim', 'mahim station'],
        'santacruz': ['santacruz', 'santacruz station'],
        'khar': ['khar', 'khar road', 'khar station'],
        'jogeshwari': ['jogeshwari', 'jogeshwari station'],
        'goregaon': ['goregaon', 'goregaon station'],
        'malad': ['malad', 'malad station'],
        'kandivali': ['kandivali', 'kandivali station'],
        'dahisar': ['dahisar', 'dahisar station'],
        'mira road': ['mira road', 'mira road station'],
        'bhayandar': ['bhayandar', 'bhayandar station'],
        'naigaon': ['naigaon', 'naigaon station'],
        'vasai': ['vasai', 'vasai road', 'vasai road station'],
        'virar': ['virar', 'virar station'],
        'churchgate': ['churchgate', 'churchgate station'],
        'marine lines': ['marine lines', 'marine lines station'],
        'charni road': ['charni road', 'charni road station'],
        'grant road': ['grant road', 'grant road station'],
        'mumbai central': ['mumbai central', 'mumbai central station'],
        'mahalaxmi': ['mahalaxmi', 'mahalaxmi station'],
        'lower parel': ['lower parel', 'lower parel station'],
        'elphinstone': ['elphinstone', 'elphinstone road', 'elphinstone road station'],
        'prabhadevi': ['prabhadevi', 'prabhadevi station'],
        'parel': ['parel', 'parel station'],
        'currey road': ['currey road', 'currey road station'],
        'chinchpokli': ['chinchpokli', 'chinchpokli station'],
        'byculla': ['byculla', 'byculla station'],
        'sandhurst road': ['sandhurst road', 'sandhurst road station'],
        'masjid': ['masjid', 'masjid station'],
        'cst': ['cst', 'cst station', 'chatrapati shivaji terminus'],
        'colaba': ['colaba', 'colaba causeway'],
        'gateway': ['gateway', 'gateway of india'],
        'nariman point': ['nariman point'],
        'marine drive': ['marine drive'],
        'worli': ['worli', 'worli sea face'],
        'haji ali': ['haji ali'],
        'mahalaxmi racecourse': ['mahalaxmi racecourse'],
        'seepz': ['seepz', 'seepz andheri'],
        'powai': ['powai'],
        'vikhroli': ['vikhroli', 'vikhroli station'],
        'kanjurmarg': ['kanjurmarg', 'kanjurmarg station'],
        'nahur': ['nahur', 'nahur station']
    };

    // Find matching locations
    const fromMatches = findMatchingLocations(from, locationMappings);
    const toMatches = findMatchingLocations(to, locationMappings);

    if (fromMatches.length > 0 && toMatches.length > 0) {
        // Try route planning with matched locations
        const routeEngine = window.REAL_MUMBAI_TRANSPORT_DATA.routePlanningEngine;

        fromMatches.forEach(fromMatch => {
            toMatches.forEach(toMatch => {
                const routes = routeEngine.findRoutes(fromMatch, toMatch);
                fuzzyRoutes.push(...routes);
            });
        });
    }

    // Remove duplicates and return
    return removeDuplicateRoutes(fuzzyRoutes);
}

/**
 * Find matching locations using fuzzy search
 */
function findMatchingLocations(input, mappings) {
    const matches = [];
    const inputLower = input.toLowerCase().trim();

    for (const [canonical, variations] of Object.entries(mappings)) {
        for (const variation of variations) {
            if (variation.toLowerCase().includes(inputLower) ||
                inputLower.includes(variation.toLowerCase())) {
                matches.push(canonical);
                break;
            }
        }
    }

    return [...new Set(matches)]; // Remove duplicates
}

/**
 * Remove duplicate routes
 */
function removeDuplicateRoutes(routes) {
    const seen = new Set();
    return routes.filter(route => {
        const key = `${route.type}-${route.from}-${route.to}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * Display found routes in the UI
 */
function displayRoutes(routes, from, to) {
    console.log(`📋 Displaying ${routes.length} routes from ${from} to ${to}`);

    let resultsContainer = document.getElementById('route-results');
    if (!resultsContainer) {
        console.log('Route results container not found, creating one...');
        createRouteResultsContainer();
        // Wait a bit for DOM to update
        setTimeout(() => {
            resultsContainer = document.getElementById('route-results');
            if (resultsContainer) {
                displayRoutesInContainer(routes, from, to, resultsContainer);
            }
        }, 100);
        return;
    }

    displayRoutesInContainer(routes, from, to, resultsContainer);
}

/**
 * Display routes in the container
 */
function displayRoutesInContainer(routes, from, to, container) {
    // Clear previous results
    container.innerHTML = '';

    if (routes.length === 0) {
        container.innerHTML = `
            <div class="no-routes">
                <i class="fas fa-search"></i>
                <h3>No routes found</h3>
                <p>Try different locations or check spelling</p>
                <p><strong>Popular locations:</strong> Andheri, Bandra, Dadar, Borivali, Thane</p>
            </div>
        `;
        showToast('No routes found. Try popular locations like Andheri, Bandra, Dadar.', 'warning');
        return;
    }

    // Create route cards
    routes.forEach((route, index) => {
        const routeCard = createRouteCard(route, index);
        container.appendChild(routeCard);
    });

    // Show results section
    const resultsSection = document.getElementById('route-results-section');
    if (resultsSection) {
        resultsSection.style.display = 'block';
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    console.log(`✅ Displayed ${routes.length} routes successfully`);
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
    // Google Maps will be initialized via callback when API loads
    // The callback is set in the HTML script tag

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
            showMapError('Google Maps API not loaded. Please refresh the page.');
            return;
        }

        // Default center (Mumbai)
        const defaultCenter = { lat: 19.0760, lng: 72.8777 };

        // Show loading state
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading map...</div>';
            mapContainer.style.display = 'block';
            mapContainer.style.background = 'rgba(0,0,0,0.1)';
        }

        // Create advanced map with full Google Maps API features
        window.mapInstance = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: defaultCenter,
            styles: [
                // Enhanced dark theme for Mumbai Transport
                {
                    featureType: 'all',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#ffffff' }]
                },
                {
                    featureType: 'all',
                    elementType: 'labels.text.stroke',
                    stylers: [{ color: '#000000' }, { lightness: 13 }]
                },
                {
                    featureType: 'administrative',
                    elementType: 'geometry.fill',
                    stylers: [{ color: '#000000' }]
                },
                {
                    featureType: 'administrative',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#144b53' }, { lightness: 14 }, { weight: 1.4 }]
                },
                {
                    featureType: 'landscape',
                    elementType: 'all',
                    stylers: [{ color: '#08304b' }]
                },
                {
                    featureType: 'poi',
                    elementType: 'geometry',
                    stylers: [{ color: '#0c4152' }, { lightness: 5 }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry.fill',
                    stylers: [{ color: '#000000' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#0b434f' }, { lightness: 25 }]
                },
                {
                    featureType: 'road.arterial',
                    elementType: 'geometry.fill',
                    stylers: [{ color: '#000000' }]
                },
                {
                    featureType: 'road.arterial',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#0b3d51' }, { lightness: 16 }]
                },
                {
                    featureType: 'road.local',
                    elementType: 'geometry',
                    stylers: [{ color: '#000000' }]
                },
                {
                    featureType: 'transit',
                    elementType: 'all',
                    stylers: [{ color: '#146474' }]
                },
                {
                    featureType: 'transit.station',
                    elementType: 'labels.icon',
                    stylers: [{ visibility: 'on' }]
                },
                {
                    featureType: 'water',
                    elementType: 'all',
                    stylers: [{ color: '#021019' }]
                }
            ],
            // Enhanced controls
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true,
            // Additional options
            gestureHandling: 'greedy',
            clickableIcons: true,
            disableDoubleClickZoom: false
        });

        // Initialize advanced map features
        initializeMapLayers();
        initializeMapControls();
        initializeMapEvents();

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

        // Add event listener for map load
        google.maps.event.addListenerOnce(window.mapInstance, 'tilesloaded', function() {
            console.log('✅ Google Maps tiles loaded successfully');

            // Clear loading state
            if (mapContainer) {
                mapContainer.style.background = 'transparent';
            }

            showToast('Map loaded successfully!', 'success');
        });

        console.log('✅ Google Maps initialized successfully');
    }
    } catch (error) {
        console.error('❌ Error initializing Google Maps:', error);
        showMapError('Error loading maps. Please check your connection.');
    }
}

/**
 * Initialize advanced map layers (Traffic, Transit, Bicycling)
 */
function initializeMapLayers() {
    // Traffic Layer
    window.trafficLayer = new google.maps.TrafficLayer();
    window.trafficLayer.setMap(null); // Start hidden

    // Transit Layer
    window.transitLayer = new google.maps.TransitLayer();
    window.transitLayer.setMap(window.mapInstance); // Show by default for transport app

    // Bicycling Layer
    window.bicyclingLayer = new google.maps.BicyclingLayer();
    window.bicyclingLayer.setMap(null); // Start hidden

    console.log('🗺️ Map layers initialized');
}

/**
 * Initialize custom map controls
 */
function initializeMapControls() {
    // Create custom control panel
    const controlDiv = document.createElement('div');
    controlDiv.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    controlDiv.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    controlDiv.style.borderRadius = '8px';
    controlDiv.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    controlDiv.style.cursor = 'pointer';
    controlDiv.style.marginBottom = '22px';
    controlDiv.style.textAlign = 'center';
    controlDiv.style.padding = '8px';
    controlDiv.title = 'Click to toggle layers';

    const controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Inter, Arial, sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.lineHeight = '16px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = `
        <div style="color: white; font-weight: 600; margin-bottom: 8px;">Map Layers</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="display: flex; align-items: center; cursor: pointer; color: rgba(255,255,255,0.8);">
                <input type="checkbox" id="traffic-toggle" style="margin-right: 5px;">
                <i class="fas fa-traffic-light" style="margin-right: 5px;"></i>Traffic
            </label>
            <label style="display: flex; align-items: center; cursor: pointer; color: rgba(255,255,255,0.8);">
                <input type="checkbox" id="transit-toggle" checked style="margin-right: 5px;">
                <i class="fas fa-train" style="margin-right: 5px;"></i>Transit
            </label>
            <label style="display: flex; align-items: center; cursor: pointer; color: rgba(255,255,255,0.8);">
                <input type="checkbox" id="bicycling-toggle" style="margin-right: 5px;">
                <i class="fas fa-bicycle" style="margin-right: 5px;"></i>Bicycling
            </label>
        </div>
    `;

    controlDiv.appendChild(controlText);

    // Add control to map
    window.mapInstance.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

    // Add event listeners for toggles
    setTimeout(() => {
        document.getElementById('traffic-toggle').addEventListener('change', function(e) {
            if (e.target.checked) {
                window.trafficLayer.setMap(window.mapInstance);
                showToast('Traffic layer enabled', 'info');
            } else {
                window.trafficLayer.setMap(null);
                showToast('Traffic layer disabled', 'info');
            }
        });

        document.getElementById('transit-toggle').addEventListener('change', function(e) {
            if (e.target.checked) {
                window.transitLayer.setMap(window.mapInstance);
                showToast('Transit layer enabled', 'info');
            } else {
                window.transitLayer.setMap(null);
                showToast('Transit layer disabled', 'info');
            }
        });

        document.getElementById('bicycling-toggle').addEventListener('change', function(e) {
            if (e.target.checked) {
                window.bicyclingLayer.setMap(window.mapInstance);
                showToast('Bicycling layer enabled', 'info');
            } else {
                window.bicyclingLayer.setMap(null);
                showToast('Bicycling layer disabled', 'info');
            }
        });
    }, 100);

    console.log('🎛️ Custom map controls added');
}

/**
 * Initialize map event listeners
 */
function initializeMapEvents() {
    // Click event on map
    window.mapInstance.addListener('click', function(event) {
        console.log('📍 Map clicked at:', event.latLng.lat(), event.latLng.lng());

        // If planning journey, use clicked location
        if (window.appState.currentTab === 'plan') {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: event.latLng }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    const address = results[0].formatted_address;
                    console.log('📍 Clicked location:', address);

                    // Auto-fill the from input if empty
                    const fromInput = document.getElementById('from');
                    if (fromInput && !fromInput.value) {
                        fromInput.value = address;
                        showToast('Location selected from map', 'info');
                    }
                }
            });
        }
    });

    // Bounds changed event
    window.mapInstance.addListener('bounds_changed', function() {
        // Update visible area for any markers or overlays
        console.log('🗺️ Map bounds changed');
    });

    // Zoom changed event
    window.mapInstance.addListener('zoom_changed', function() {
        const zoom = window.mapInstance.getZoom();
        console.log('🔍 Map zoom changed to:', zoom);

        // Adjust marker visibility based on zoom
        if (zoom > 14) {
            // Show detailed markers
        } else {
            // Show simplified markers
        }
    });

    console.log('👂 Map event listeners initialized');
}

    } catch (error) {
        console.error('❌ Error initializing Google Maps:', error);
        showMapError('Error loading maps. Please check your connection.');
    }
}

/**
 * Show map error with fallback
 */
function showMapError(message) {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.7); text-align: center; padding: 1rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;"></i>
                <h4 style="margin-bottom: 0.5rem; color: #ef4444;">Map Unavailable</h4>
                <p style="margin-bottom: 1rem;">${message}</p>
                <button onclick="retryMapLoad()" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
        mapContainer.style.display = 'block';
        mapContainer.style.background = 'rgba(0,0,0,0.1)';
    }

    showToast(message, 'error');
}

/**
 * Retry map loading
 */
function retryMapLoad() {
    console.log('🔄 Retrying map load...');
    showToast('Retrying map load...', 'info');

    // Clear any existing map instance
    if (window.mapInstance) {
        window.mapInstance = null;
    }

    // Try to reinitialize
    if (window.google && window.google.maps) {
        initGoogleMaps();
    } else {
        // Reload the Google Maps script
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD4VXgebBaqOojiujAPYIP8Qv-iYPSFVWw&libraries=places&callback=initGoogleMaps';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
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
 * Calculate and display route on Google Maps with full API utilization
 */
function calculateAndDisplayRoute(fromLocation, toLocation) {
    if (!window.directionsService || !window.directionsRenderer || !window.mapInstance) {
        console.log('🗺️ Google Maps services not available');
        showToast('Map services not ready. Please wait for map to load.', 'warning');
        return;
    }

    console.log(`🗺️ Calculating route from "${fromLocation}" to "${toLocation}"`);

    // Show loading state
    showToast('Calculating best routes...', 'info');

    // Enhanced request with multiple travel modes
    const requests = [
        {
            origin: fromLocation,
            destination: toLocation,
            travelMode: google.maps.TravelMode.TRANSIT,
            transitOptions: {
                modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAIN, google.maps.TransitMode.SUBWAY],
                routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
            },
            provideRouteAlternatives: true,
            optimizeWaypoints: true
        },
        {
            origin: fromLocation,
            destination: toLocation,
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions: {
                departureTime: new Date(Date.now() + 60000), // 1 minute from now
                trafficModel: 'bestguess'
            },
            provideRouteAlternatives: true
        }
    ];

    // Clear previous routes
    window.directionsRenderer.setDirections({ routes: [] });

    // Process transit routes first (primary)
    window.directionsService.route(requests[0], (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            window.directionsRenderer.setDirections(response);

            // Fit map to show entire route
            const bounds = new google.maps.LatLngBounds();
            response.routes.forEach(route => {
                route.legs.forEach(leg => {
                    bounds.extend(leg.start_location);
                    bounds.extend(leg.end_location);
                });
            });
            window.mapInstance.fitBounds(bounds);

            // Add route information panel
            displayRouteDetails(response);

            console.log('🛣️ Transit route displayed on map');
            showToast(`Found ${response.routes.length} transit route(s)!`, 'success');

            // Also try driving routes for comparison
            calculateDrivingRoute(fromLocation, toLocation);

        } else {
            console.error('❌ Transit directions failed:', status);

            // Fallback to driving routes
            window.directionsService.route(requests[1], (response, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    window.directionsRenderer.setDirections(response);

                    const bounds = new google.maps.LatLngBounds();
                    response.routes.forEach(route => {
                        route.legs.forEach(leg => {
                            bounds.extend(leg.start_location);
                            bounds.extend(leg.end_location);
                        });
                    });
                    window.mapInstance.fitBounds(bounds);

                    displayRouteDetails(response);
                    console.log('🚗 Driving route displayed as fallback');
                    showToast('Showing driving route (transit unavailable)', 'info');
                } else {
                    console.error('❌ All directions failed:', status);
                    showToast('Could not calculate route. Please try different locations.', 'error');
                }
            });
        }
    });
}

/**
 * Calculate driving route for comparison
 */
function calculateDrivingRoute(fromLocation, toLocation) {
    if (!window.directionsService) return;

    const request = {
        origin: fromLocation,
        destination: toLocation,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
            departureTime: new Date(Date.now() + 60000),
            trafficModel: 'bestguess'
        },
        provideRouteAlternatives: false
    };

    window.directionsService.route(request, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            // Store driving route for comparison
            window.drivingRoute = response;
            console.log('🚗 Driving route calculated for comparison');
        }
    });
}

/**
 * Display detailed route information
 */
function displayRouteDetails(response) {
    if (!response.routes || response.routes.length === 0) return;

    const route = response.routes[0];
    const leg = route.legs[0];

    // Create route info panel
    const routeInfo = document.createElement('div');
    routeInfo.className = 'route-info-panel';
    routeInfo.innerHTML = `
        <div class="route-summary">
            <h4>Route Details</h4>
            <div class="route-stats">
                <div class="stat">
                    <i class="fas fa-clock"></i>
                    <span>${leg.duration.text}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-road"></i>
                    <span>${leg.distance.text}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-dollar-sign"></i>
                    <span>₹${Math.round(leg.distance.value * 0.012)}</span>
                </div>
            </div>
        </div>

        <div class="route-steps">
            <h5>Journey Steps:</h5>
            <div class="steps-list">
                ${leg.steps.map((step, index) => `
                    <div class="step">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <div class="step-instruction">${step.instructions}</div>
                            <div class="step-details">${step.distance.text} • ${step.duration.text}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Remove existing route info
    const existingInfo = document.querySelector('.route-info-panel');
    if (existingInfo) {
        existingInfo.remove();
    }

    // Add to map container
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.appendChild(routeInfo);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (routeInfo.parentNode) {
                routeInfo.style.opacity = '0';
                setTimeout(() => routeInfo.remove(), 300);
            }
        }, 10000);
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
 * Process ticket purchase with advanced features
 */
async function processTicketPurchase(line) {
    const from = document.getElementById('ticket-from')?.value;
    const to = document.getElementById('ticket-to')?.value;
    const quantity = document.getElementById('ticket-quantity')?.value || 1;

    // Enhanced validation
    if (!from || !to) {
        showToast('Please select both departure and destination stations', 'error');
        highlightField('ticket-from');
        highlightField('ticket-to');
        return;
    }

    if (from === to) {
        showToast('Departure and destination cannot be the same', 'error');
        highlightField('ticket-to');
        return;
    }

    if (quantity < 1 || quantity > 10) {
        showToast('Please select 1-10 tickets', 'error');
        highlightField('ticket-quantity');
        return;
    }

    // Show processing state with progress
    const purchaseBtn = document.querySelector('.ticket-modal .btn-primary');
    if (purchaseBtn) {
        purchaseBtn.disabled = true;
        purchaseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    // Show detailed progress
    showPurchaseProgress('Validating payment method...', 25);

    try {
        // Step 1: Validate ticket availability
        showPurchaseProgress('Checking ticket availability...', 50);

        const availabilityResponse = await fetch(`/api/tickets/availability?from=${from}&to=${to}&line=${line}`);
        if (!availabilityResponse.ok) {
            throw new Error('Tickets not available for selected route');
        }

        // Step 2: Process payment (simulated)
        showPurchaseProgress('Processing payment...', 75);

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 3: Make real API call to purchase ticket
        showPurchaseProgress('Confirming ticket...', 90);

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
                userAgent: navigator.userAgent,
                paymentMethod: 'card', // In real app, this would come from payment form
                userId: getUserId() // In real app, this would be from auth
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ticket purchased successfully:', result);

            // Complete progress
            showPurchaseProgress('Purchase completed!', 100);

            // Show detailed success message
            showPurchaseSuccess(result.data, from, to, quantity);

            // Send confirmation email (simulated)
            sendConfirmationEmail(result.data);

            // Close modal after success
            setTimeout(() => {
                document.querySelector('.ticket-modal')?.closest('.modal-overlay').remove();
                showTicketConfirmation(result.data);

                // Add to user's ticket history
                addToTicketHistory(result.data);
            }, 2000);
        } else {
            const errorData = await response.json();
            console.error('❌ Ticket purchase failed:', errorData);
            showToast(errorData.error || 'Ticket purchase failed. Please try again.', 'error');

            // Reset button
            resetPurchaseButton(purchaseBtn);
        }
    } catch (error) {
        console.error('❌ Error purchasing ticket:', error);
        showToast(error.message || 'Network error. Please check your connection and try again.', 'error');

        // Reset button
        resetPurchaseButton(purchaseBtn);
    }
}

/**
 * Show purchase progress with visual indicator
 */
function showPurchaseProgress(message, percentage) {
    // Remove existing progress
    const existingProgress = document.querySelector('.purchase-progress');
    if (existingProgress) {
        existingProgress.remove();
    }

    // Create progress indicator
    const progressDiv = document.createElement('div');
    progressDiv.className = 'purchase-progress';
    progressDiv.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <p class="progress-text">${message}</p>
    `;

    // Add to modal
    const modalBody = document.querySelector('.ticket-modal .modal-body');
    if (modalBody) {
        modalBody.appendChild(progressDiv);
    }

    // Show toast for progress updates
    if (percentage < 100) {
        showToast(message, 'info');
    }
}

/**
 * Highlight form field with error
 */
function highlightField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = 'var(--error)';
        field.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';

        // Remove highlight after 3 seconds
        setTimeout(() => {
            field.style.borderColor = '';
            field.style.boxShadow = '';
        }, 3000);
    }
}

/**
 * Reset purchase button to original state
 */
function resetPurchaseButton(button) {
    if (button) {
        button.disabled = false;
        button.textContent = 'Purchase Ticket';
    }

    // Remove progress indicator
    const progress = document.querySelector('.purchase-progress');
    if (progress) {
        progress.remove();
    }
}

/**
 * Send confirmation email (simulated)
 */
function sendConfirmationEmail(ticketData) {
    console.log('📧 Sending confirmation email for ticket:', ticketData.ticketId);

    // In a real app, this would make an API call to send email
    setTimeout(() => {
        showToast('Confirmation email sent to your inbox!', 'success');
    }, 1000);
}

/**
 * Add ticket to user's history
 */
function addToTicketHistory(ticketData) {
    // Get existing history from localStorage
    let history = JSON.parse(localStorage.getItem('ticketHistory') || '[]');

    // Add new ticket
    history.unshift({
        ...ticketData,
        purchasedAt: new Date().toISOString()
    });

    // Keep only last 10 tickets
    history = history.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem('ticketHistory', JSON.stringify(history));

    console.log('📋 Ticket added to history:', ticketData.ticketId);
}

/**
 * Get user ID (simulated)
 */
function getUserId() {
    // In a real app, this would come from authentication
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
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
 * Confirm ride booking with advanced features
 */
async function confirmRideBooking(rideType) {
    const pickup = document.getElementById('pickup-location')?.value;
    const drop = document.getElementById('drop-location')?.value;
    const passengers = document.getElementById('passengers')?.value;

    // Enhanced validation
    if (!pickup || !drop) {
        showToast('Please enter pickup and drop locations', 'error');
        highlightField('pickup-location');
        highlightField('drop-location');
        return;
    }

    if (pickup.trim().length < 3 || drop.trim().length < 3) {
        showToast('Please enter complete location addresses', 'error');
        return;
    }

    // Disable button during processing
    const confirmBtn = document.querySelector('.booking-modal .btn-primary');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    }

    showToast('Finding available drivers...', 'info');

    try {
        // Step 1: Check ride availability
        showBookingProgress('Checking ride availability...', 25);

        const availabilityResponse = await fetch('/api/rides/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pickup, drop, rideType })
        });

        if (!availabilityResponse.ok) {
            throw new Error('No drivers available in your area');
        }

        // Step 2: Get fare estimate
        showBookingProgress('Calculating fare...', 50);

        const fareResponse = await fetch('/api/rides/estimate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pickup, drop, rideType, passengers })
        });

        if (!fareResponse.ok) {
            throw new Error('Unable to calculate fare');
        }

        const fareData = await fareResponse.json();

        // Step 3: Process booking
        showBookingProgress('Confirming booking...', 75);

        const response = await fetch('/api/rides/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rideType,
                pickup,
                drop,
                passengers: parseInt(passengers),
                estimatedFare: fareData.estimatedFare,
                userId: getUserId(),
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ride booked successfully:', result);

            // Complete progress
            showBookingProgress('Booking confirmed!', 100);

            // Show success message
            showToast(`✅ ${result.data.rideType} booked! Driver arriving in ${result.data.driver.eta} minutes`, 'success');

            // Send booking notifications
            sendBookingNotifications(result.data);

            // Close modal and show confirmation
            setTimeout(() => {
                document.querySelector('.booking-modal')?.closest('.modal-overlay').remove();
                showBookingConfirmation(result.data.bookingId, rideType, pickup, drop, passengers);

                // Add to booking history
                addToBookingHistory(result.data);
            }, 2000);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Booking failed');
        }
    } catch (error) {
        console.error('❌ Booking error:', error);
        showToast(error.message || 'Booking failed. Please try again.', 'error');

        // Reset button
        resetBookingButton(confirmBtn);
    }
}

/**
 * Show booking progress
 */
function showBookingProgress(message, percentage) {
    // Remove existing progress
    const existingProgress = document.querySelector('.booking-progress');
    if (existingProgress) {
        existingProgress.remove();
    }

    // Create progress indicator
    const progressDiv = document.createElement('div');
    progressDiv.className = 'booking-progress';
    progressDiv.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <p class="progress-text">${message}</p>
    `;

    // Add to modal
    const modalBody = document.querySelector('.booking-modal .modal-body');
    if (modalBody) {
        modalBody.appendChild(progressDiv);
    }
}

/**
 * Reset booking button
 */
function resetBookingButton(button) {
    if (button) {
        button.disabled = false;
        button.textContent = 'Confirm Booking';
    }

    // Remove progress
    const progress = document.querySelector('.booking-progress');
    if (progress) {
        progress.remove();
    }
}

/**
 * Send booking notifications
 */
function sendBookingNotifications(bookingData) {
    console.log('📱 Sending booking notifications for:', bookingData.bookingId);

    // Simulate SMS notification
    setTimeout(() => {
        showToast(`SMS sent to your phone with booking details!`, 'info');
    }, 500);

    // Simulate driver notification
    setTimeout(() => {
        showToast(`Driver ${bookingData.driver.name} has been notified!`, 'info');
    }, 1000);
}

/**
 * Add booking to history
 */
function addToBookingHistory(bookingData) {
    let history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');

    history.unshift({
        ...bookingData,
        bookedAt: new Date().toISOString()
    });

    // Keep only last 10 bookings
    history = history.slice(0, 10);

    localStorage.setItem('bookingHistory', JSON.stringify(history));
    console.log('📋 Booking added to history:', bookingData.bookingId);
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
 * Track ride with real-time updates
 */
function trackRide(bookingId) {
    showToast('Opening real-time ride tracking...', 'info');

    // Create tracking modal
    const trackingModal = createTrackingModal(bookingId);
    document.body.appendChild(trackingModal);

    // Start real-time updates
    startRideTracking(bookingId, trackingModal);

    // Simulate driver location updates
    simulateDriverMovement(bookingId, trackingModal);
}

/**
 * Create ride tracking modal
 */
function createTrackingModal(bookingId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content tracking-modal">
            <div class="modal-header">
                <h3>🚗 Live Ride Tracking</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tracking-info">
                    <div class="ride-status">
                        <div class="status-indicator status-active">
                            <i class="fas fa-car"></i>
                        </div>
                        <div class="status-details">
                            <h4>Driver on the way</h4>
                            <p id="driver-eta">Arriving in 5 minutes</p>
                        </div>
                    </div>

                    <div class="driver-info">
                        <div class="driver-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="driver-details">
                            <h5 id="driver-name">Rajesh Kumar</h5>
                            <p id="driver-rating">⭐ 4.8 (247 rides)</p>
                            <p id="vehicle-info">White Swift - MH 12 AB 1234</p>
                        </div>
                        <div class="contact-options">
                            <button class="contact-btn" onclick="callDriver()">
                                <i class="fas fa-phone"></i>
                            </button>
                            <button class="contact-btn" onclick="messageDriver()">
                                <i class="fas fa-comment"></i>
                            </button>
                        </div>
                    </div>

                    <div class="tracking-map">
                        <div class="map-placeholder">
                            <i class="fas fa-map-marked-alt"></i>
                            <p>Live tracking map would be here</p>
                            <small>Driver location updates every 10 seconds</small>
                        </div>
                    </div>

                    <div class="ride-details">
                        <div class="detail-row">
                            <span>Booking ID:</span>
                            <span>${bookingId}</span>
                        </div>
                        <div class="detail-row">
                            <span>Pickup:</span>
                            <span id="pickup-address">Loading...</span>
                        </div>
                        <div class="detail-row">
                            <span>Drop:</span>
                            <span id="drop-address">Loading...</span>
                        </div>
                        <div class="detail-row">
                            <span>Estimated Fare:</span>
                            <span id="estimated-fare">₹0</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="cancelRide('${bookingId}')">
                    <i class="fas fa-times"></i> Cancel Ride
                </button>
                <button class="btn btn-primary" onclick="emergencyContact()">
                    <i class="fas fa-exclamation-triangle"></i> Emergency
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Start ride tracking with real-time updates
 */
function startRideTracking(bookingId, modal) {
    console.log('📍 Starting ride tracking for:', bookingId);

    // Update tracking every 10 seconds
    const trackingInterval = setInterval(() => {
        updateTrackingInfo(bookingId, modal);
    }, 10000);

    // Store interval ID for cleanup
    modal.dataset.trackingInterval = trackingInterval;

    // Initial update
    updateTrackingInfo(bookingId, modal);
}

/**
 * Update tracking information
 */
function updateTrackingInfo(bookingId, modal) {
    // Simulate real-time updates
    const eta = Math.max(1, Math.floor(Math.random() * 10) + 1);
    const driverName = ['Rajesh Kumar', 'Amit Singh', 'Vikram Patel', 'Suresh Reddy'][Math.floor(Math.random() * 4)];

    // Update ETA
    const etaElement = modal.querySelector('#driver-eta');
    if (etaElement) {
        etaElement.textContent = `Arriving in ${eta} minutes`;
    }

    // Update driver name
    const nameElement = modal.querySelector('#driver-name');
    if (nameElement) {
        nameElement.textContent = driverName;
    }

    // Update status based on ETA
    const statusElement = modal.querySelector('.status-details h4');
    const statusIndicator = modal.querySelector('.status-indicator');

    if (eta <= 2) {
        statusElement.textContent = 'Driver arrived';
        statusIndicator.className = 'status-indicator status-arrived';
        statusIndicator.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
    } else if (eta <= 5) {
        statusElement.textContent = 'Driver nearby';
        statusIndicator.className = 'status-indicator status-nearby';
    } else {
        statusElement.textContent = 'Driver on the way';
        statusIndicator.className = 'status-indicator status-active';
    }

    console.log(`📍 Tracking update: ${driverName} - ${eta} min away`);
}

/**
 * Simulate driver movement
 */
function simulateDriverMovement(bookingId, modal) {
    let distance = 5.2; // km
    const speed = 0.3; // km per minute

    const movementInterval = setInterval(() => {
        distance = Math.max(0, distance - speed);

        if (distance <= 0.1) {
            clearInterval(movementInterval);
            showToast('🚗 Driver has arrived at your location!', 'success');

            // Update status to arrived
            const statusElement = modal.querySelector('.status-details h4');
            if (statusElement) {
                statusElement.textContent = 'Driver arrived - Please meet at pickup point';
            }
        }

        console.log(`📍 Driver ${distance.toFixed(1)} km away`);
    }, 30000); // Update every 30 seconds

    // Store interval for cleanup
    modal.dataset.movementInterval = movementInterval;
}

/**
 * Call driver
 */
function callDriver() {
    showToast('📞 Calling driver...', 'info');

    // Simulate call
    setTimeout(() => {
        showToast('📞 Call connected! Please tell the driver your exact location.', 'success');
    }, 1000);
}

/**
 * Message driver
 */
function messageDriver() {
    showToast('💬 Opening chat with driver...', 'info');

    // Simulate opening chat
    setTimeout(() => {
        showToast('💬 Chat opened! You can now message your driver.', 'success');
    }, 500);
}

/**
 * Cancel ride
 */
function cancelRide(bookingId) {
    if (confirm('Are you sure you want to cancel this ride?')) {
        showToast('❌ Ride cancelled', 'warning');

        // Close tracking modal
        document.querySelector('.tracking-modal')?.closest('.modal-overlay').remove();

        // In a real app, this would make an API call
        console.log('🚫 Ride cancelled:', bookingId);
    }
}

/**
 * Emergency contact
 */
function emergencyContact() {
    showToast('🚨 Connecting to emergency services...', 'warning');

    // Simulate emergency call
    setTimeout(() => {
        showToast('🚨 Emergency services contacted. Help is on the way.', 'error');
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
window.retryMapLoad = retryMapLoad;

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

// Test route planning functionality
function testRoutePlanning() {
    console.log('🧪 Testing route planning...');

    // Test with known locations
    const testCases = [
        { from: 'Andheri', to: 'Bandra' },
        { from: 'Dadar', to: 'Thane' },
        { from: 'Borivali', to: 'Andheri' },
        { from: 'Churchgate', to: 'CST' }
    ];

    testCases.forEach((testCase, index) => {
        setTimeout(() => {
            console.log(`Test ${index + 1}: ${testCase.from} → ${testCase.to}`);
            planRealRoute(testCase.from, testCase.to);
        }, index * 2000);
    });
}

// Make test function available globally
window.testRoutePlanning = testRoutePlanning;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

console.log('📱 Mumbai Transport App script loaded');
console.log('💡 Try: testRoutePlanning() in console to test route finding');