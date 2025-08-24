/**
 * Mumbai Transport App - Enhanced with Advanced Features
 * Real-time tracking, AI optimization, live traffic, and powerful functionality
 */

// Global Variables
let map;
let directionsService;
let directionsRenderer;
let currentPosition;
let realTimeData = {};
let aiOptimizer;
let liveTrafficData = {};

// Enhanced App Initialization
function initApp() {
    console.log('🚀 Enhanced Mumbai Transport App loaded');
    
    // Initialize all systems
    // initializeMap() is called by the component loader after the map container is loaded.
    initRealTimeTracking();
    initAIOptimizer();
    initLiveTraffic();
    initTabNavigation();
    initThemeToggle();
    initTicketsTab();
    initFormHandlers();
    initMapResize();
    initPWA();
    initNotifications();
    initOfflineSupport();
    
    // Start real-time updates
    startRealTimeUpdates();
}

// Advanced Map with Real-time Features
window.initializeMap = function() {
    console.log('🗺️ Initializing Advanced Google Maps...');
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.warn('⚠️ Map container not found');
        return;
    }

    // Enhanced map options
    map = new google.maps.Map(mapElement, {
        center: { lat: 19.0760, lng: 72.8777 },
        zoom: 12,
        styles: getCustomMapStyle(),
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: '#0ea5e9',
            strokeWeight: 4,
            strokeOpacity: 0.8
        }
    });
    directionsRenderer.setMap(map);

    // Add real-time traffic layer
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    // Add transit layer
    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);

    // Get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(currentPosition);
                addUserMarker(currentPosition);
                updateNearbyStations(currentPosition);
            },
            (error) => {
                console.warn('Location access denied:', error);
                showToast('Location access needed for better experience', 'warning');
            }
        );
    }
}

// Real-time Tracking System
function initRealTimeTracking() {
    console.log('📍 Initializing Real-time Tracking...');
    
    // Simulate real-time vehicle tracking
    setInterval(() => {
        updateVehiclePositions();
        updateStationStatus();
        updateCrowdingLevels();
    }, 30000); // Update every 30 seconds
}

// AI Route Optimizer
function initAIOptimizer() {
    console.log('🤖 Initializing AI Route Optimizer...');
    
    aiOptimizer = {
        // Multi-criteria optimization
        optimizeRoute: function(origin, destination, preferences = {}) {
            const criteria = {
                time: preferences.time || 0.4,
                cost: preferences.cost || 0.3,
                comfort: preferences.comfort || 0.2,
                reliability: preferences.reliability || 0.1
            };

            // Get multiple route options
            return this.getRouteOptions(origin, destination)
                .then(routes => this.scoreRoutes(routes, criteria))
                .then(scoredRoutes => this.selectBestRoute(scoredRoutes));
        },

        getRouteOptions: function(origin, destination) {
            const modes = ['TRANSIT', 'DRIVING', 'WALKING', 'BICYCLING'];
            const promises = modes.map(mode => 
                this.getDirections(origin, destination, mode)
            );
            return Promise.all(promises);
        },

        scoreRoutes: function(routes, criteria) {
            return routes.map(route => ({
                ...route,
                score: this.calculateScore(route, criteria)
            })).sort((a, b) => b.score - a.score);
        },

        calculateScore: function(route, criteria) {
            const duration = route.duration || 0;
            const cost = route.cost || 0;
            const comfort = route.comfort || 0.5;
            const reliability = route.reliability || 0.8;

            return (
                criteria.time * (1 / (1 + duration / 60)) +
                criteria.cost * (1 / (1 + cost / 100)) +
                criteria.comfort * comfort +
                criteria.reliability * reliability
            );
        },

        getDirections: function(origin, destination, mode) {
            return new Promise((resolve, reject) => {
                directionsService.route({
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode[mode],
                    provideRouteAlternatives: true
                }, (result, status) => {
                    if (status === 'OK') {
                        resolve({
                            mode: mode,
                            duration: result.routes[0].legs[0].duration.value,
                            distance: result.routes[0].legs[0].distance.value,
                            cost: this.estimateCost(mode, result.routes[0].legs[0].distance.value),
                            comfort: this.estimateComfort(mode),
                            reliability: this.estimateReliability(mode),
                            route: result.routes[0]
                        });
                    } else {
                        reject(status);
                    }
                });
            });
        },

        estimateCost: function(mode, distance) {
            const costs = {
                'TRANSIT': Math.max(10, distance / 1000 * 2),
                'DRIVING': distance / 1000 * 15,
                'WALKING': 0,
                'BICYCLING': 0
            };
            return costs[mode] || 0;
        },

        estimateComfort: function(mode) {
            const comfort = {
                'TRANSIT': 0.7,
                'DRIVING': 0.9,
                'WALKING': 0.6,
                'BICYCLING': 0.5
            };
            return comfort[mode] || 0.5;
        },

        estimateReliability: function(mode) {
            const reliability = {
                'TRANSIT': 0.8,
                'DRIVING': 0.9,
                'WALKING': 1.0,
                'BICYCLING': 0.9
            };
            return reliability[mode] || 0.8;
        }
    };
}

// Live Traffic Integration
function initLiveTraffic() {
    console.log('🚦 Initializing Live Traffic System...');
    
    // Simulate live traffic data
    setInterval(() => {
        updateTrafficConditions();
        updateTransitDelays();
        updateRoadClosures();
    }, 60000); // Update every minute
}

// Enhanced Form Handlers
function initFormHandlers() {
    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.addEventListener('submit', handleAdvancedJourneyForm);
    }

    // Location swap functionality
    const swapButton = document.getElementById('swap-locations');
    if (swapButton) {
        swapButton.addEventListener('click', swapLocations);
    }

    // Transport mode selection
    const modeTabs = document.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => selectTransportMode(tab.dataset.mode));
    });
}

// Advanced Journey Planning
async function handleAdvancedJourneyForm(event) {
    event.preventDefault();
    
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    
    if (!from || !to) {
        showToast('Please enter both locations', 'error');
        return;
    }

    showToast('🤖 AI is optimizing your route...', 'info');
    
    try {
        // Get AI-optimized route
        const optimizedRoute = await aiOptimizer.optimizeRoute(from, to, {
            time: 0.4,
            cost: 0.3,
            comfort: 0.2,
            reliability: 0.1
        });

        // Display route
        displayOptimizedRoute(optimizedRoute);
        
        // Show route comparison
        showRouteComparison(from, to);
        
        showToast('✅ Route optimized successfully!', 'success');
    } catch (error) {
        console.error('Route optimization failed:', error);
        showToast('Route planning failed. Please try again.', 'error');
    }
}

// Display Optimized Route
function displayOptimizedRoute(route) {
    if (route && route.route) {
        directionsRenderer.setDirections({
            routes: [route.route]
        });
        
        // Update route info
        updateRouteInfo(route);
        
        // Show real-time updates
        startRouteTracking(route);
    }
}

// Real-time Route Tracking
function startRouteTracking(route) {
    const trackingInterval = setInterval(() => {
        // Update ETA based on real-time conditions
        updateETA(route);
        
        // Check for delays
        checkForDelays(route);
        
        // Update crowding information
        updateCrowdingInfo(route);
    }, 30000);
    
    // Store interval for cleanup
    route.trackingInterval = trackingInterval;
}

// Enhanced Tab Navigation
function initTabNavigation() {
    console.log('📱 Initializing Enhanced Tab Navigation...');
    
    // Add smooth transitions
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.transition = 'opacity 0.3s ease-in-out';
    });
    
    // Add tab change animations
    const radioButtons = document.querySelectorAll('.tab-radio');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                animateTabChange(radio.id);
            }
        });
    });
}

// Advanced Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleAdvancedTheme);
    }
}

// Enhanced Theme System
function toggleAdvancedTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        icon.className = 'ph ph-sun';
        localStorage.setItem('theme', 'light');
        showToast('☀️ Switched to light theme', 'success');
    } else {
        body.classList.add('dark-theme');
        icon.className = 'ph ph-moon';
        localStorage.setItem('theme', 'dark');
        showToast('🌙 Switched to dark theme', 'success');
    }
    
    // Update map style
    updateMapTheme();
}

// Advanced Notifications
function initNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('🔔 Notifications enabled');
            }
        });
    }
}

// Offline Support
function initOfflineSupport() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('src/sw.js')
            .then(registration => {
                console.log('📱 Service Worker registered');
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

// Real-time Updates
function startRealTimeUpdates() {
    setInterval(() => {
        updateLiveData();
        updateNotifications();
        updateOfflineStatus();
    }, 10000); // Update every 10 seconds
}

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function addUserMarker(position) {
    new google.maps.Marker({
        position: position,
        map: map,
        title: 'Your Location',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#0ea5e9"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(24, 24)
        }
    });
}

function getCustomMapStyle() {
    return [
        {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{ color: '#0ea5e9' }]
        },
        {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{ color: '#0ea5e9' }]
        }
    ];
}

// Data for Metro Lines
const metroLineData = [
    {
        id: 'line1',
        name: 'Line 1 (Versova-Andheri-Ghatkopar)',
        operational: '5:30 AM - 12:00 AM',
        color: '#FF6B35',
        fares: { min: 10, max: 40 }
    },
    {
        id: 'line2a',
        name: 'Line 2A (Dahisar-DN Nagar)',
        operational: '6:00 AM - 11:30 PM',
        color: '#4ECDC4',
        fares: { min: 10, max: 50 }
    },
    {
        id: 'line7',
        name: 'Line 7 (Dahisar East-Andheri East)',
        operational: '6:00 AM - 11:30 PM',
        color: '#45B7D1',
        fares: { min: 10, max: 60 }
    }
];

// Initialize Tickets Tab
function initTicketsTab() {
    const container = document.querySelector('.metro-lines');
    if (!container) return;

    container.innerHTML = ''; // Clear existing static content
    metroLineData.forEach(line => {
        const lineElement = document.createElement('div');
        lineElement.className = 'metro-line';
        lineElement.innerHTML = `
            <div class="line-info">
                <div class="line-color" style="background: ${line.color};"></div>
                <div class="line-details">
                    <h3>${line.name}</h3>
                    <p>Operational: ${line.operational}</p>
                </div>
            </div>
            <div class="line-actions">
                <button class="btn btn-secondary" data-line-id="${line.id}" data-action="buy">
                    <i class="ph ph-ticket"></i>
                    Buy Ticket
                </button>
                <button class="btn btn-outline" data-line-id="${line.id}" data-action="fare">
                    <i class="ph ph-currency-inr"></i>
                    Check Fare
                </button>
            </div>
        `;
        container.appendChild(lineElement);
    });

    // Add event listeners
    container.addEventListener('click', function(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const lineId = button.dataset.lineId;
        const action = button.dataset.action;

        if (action === 'buy') {
            buyTicket(lineId);
        } else if (action === 'fare') {
            checkFare(lineId);
        }
    });
}

// Enhanced Ticket Functions
function buyTicket(lineId) {
    const line = metroLineData.find(l => l.id === lineId);
    showToast(`🎫 Opening ticket booking for ${line.name}...`, 'info');
    // Simulate ticket booking process
    setTimeout(() => {
        showToast('✅ Ticket booked successfully!', 'success');
        sendNotification('Ticket Booked', `Your ticket for ${line.name} has been confirmed.`);
    }, 2000);
}

function checkFare(lineId) {
    const line = metroLineData.find(l => l.id === lineId);
    if (line && line.fares) {
        showToast(`💰 Fare for ${line.name}: ₹${line.fares.min} - ₹${line.fares.max}`, 'info');
    } else {
        showToast('Fare information not available.', 'error');
    }
}

// Enhanced Ride Functions
function selectRide(type) {
    showToast(`🚗 ${type.charAt(0).toUpperCase() + type.slice(1)} selected!`, 'success');
    // Simulate ride booking
    setTimeout(() => {
        showToast('🎉 Ride confirmed! Driver arriving in 5 minutes.', 'success');
        sendNotification('Ride Confirmed', `Your ${type} ride has been confirmed.`);
    }, 1500);
}

// Notification System
function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body });
    }
}

// Missing Helper Functions
function updateVehiclePositions() {
    // Simulate real-time vehicle tracking
    console.log('🚌 Updating vehicle positions...');
}

function updateStationStatus() {
    // Simulate station status updates
    console.log('🚉 Updating station status...');
}

function updateCrowdingLevels() {
    // Simulate crowding level updates
    console.log('👥 Updating crowding levels...');
}

function updateTrafficConditions() {
    // Simulate traffic condition updates
    console.log('🚦 Updating traffic conditions...');
}

function updateTransitDelays() {
    // Simulate transit delay updates
    console.log('⏰ Updating transit delays...');
}

function updateRoadClosures() {
    // Simulate road closure updates
    console.log('🚧 Updating road closures...');
}

function updateNearbyStations(position) {
    // Find and display nearby stations
    console.log('📍 Finding nearby stations...');
}

function updateRouteInfo(route) {
    // Update route information display
    const routeInfo = document.createElement('div');
    routeInfo.className = 'route-info';
    routeInfo.innerHTML = `
        <div class="route-summary">
            <h3>Optimized Route</h3>
            <div class="route-details">
                <span><i class="ph ph-clock"></i> ${Math.round(route.duration / 60)} min</span>
                <span><i class="ph ph-currency-inr"></i> ₹${Math.round(route.cost)}</span>
                <span><i class="ph ph-map-pin"></i> ${Math.round(route.distance / 1000)} km</span>
            </div>
        </div>
    `;
    
    const mapContainer = document.getElementById('map');
    if (mapContainer && mapContainer.parentNode) {
        mapContainer.parentNode.insertBefore(routeInfo, mapContainer);
    }
}

function showRouteComparison(from, to) {
    // Show route comparison modal
    console.log('📊 Showing route comparison...');
}

function updateETA(route) {
    // Update estimated time of arrival
    console.log('⏱️ Updating ETA...');
}

function checkForDelays(route) {
    // Check for delays on the route
    console.log('⚠️ Checking for delays...');
}

function updateCrowdingInfo(route) {
    // Update crowding information
    console.log('👥 Updating crowding info...');
}

function animateTabChange(tabId) {
    // Animate tab change
    const tabContent = document.querySelector(`#${tabId.replace('-radio', '-tab')}`);
    if (tabContent) {
        tabContent.style.opacity = '0';
        setTimeout(() => {
            tabContent.style.opacity = '1';
        }, 150);
    }
}

function updateMapTheme() {
    // Update map theme based on current theme
    if (map) {
        const isDark = document.body.classList.contains('dark-theme');
        const style = isDark ? getDarkMapStyle() : getCustomMapStyle();
        map.setOptions({ styles: style });
    }
}

function getDarkMapStyle() {
    return [
        {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }]
        },
        {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }]
        },
        {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }]
        },
        {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{ color: '#0ea5e9' }]
        },
        {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{ color: '#0ea5e9' }]
        }
    ];
}

function swapLocations() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    
    if (fromInput && toInput) {
        const temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;
        showToast('🔄 Locations swapped', 'success');
    }
}

function selectTransportMode(mode) {
    const modeTabs = document.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => tab.classList.remove('active'));
    
    const selectedTab = document.querySelector(`[data-mode="${mode}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        showToast(`🚇 ${mode.charAt(0).toUpperCase() + mode.slice(1)} mode selected`, 'success');
    }
}

function updateLiveData() {
    // Update live data feeds
    console.log('📡 Updating live data...');
}

function updateNotifications() {
    // Check for new notifications
    console.log('🔔 Checking notifications...');
}

function updateOfflineStatus() {
    // Update offline status
    if (!navigator.onLine) {
        showToast('📱 You are offline. Some features may be limited.', 'warning');
    }
}

// App is initialized by component-loader.js after components are loaded.
