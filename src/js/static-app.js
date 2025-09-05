/**
 * Mumbai Transport App - Static Version (No Backend Required)
 * This version works on GitHub Pages, Netlify, and Cloudflare
 */

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
                fares: [
                    { distance: '0-3 km', fare: 10 },
                    { distance: '3-12 km', fare: 20 },
                    { distance: '12-27 km', fare: 30 },
                    { distance: '27+ km', fare: 40 }
                ]
            }
        },
        routes: [
            {
                name: 'Versova to Andheri',
                type: 'metro',
                from: 'Versova',
                to: 'Andheri',
                fare: 20,
                duration: '15 min',
                stops: ['Versova', 'D.N. Nagar', 'Azad Nagar', 'Andheri']
            },
            {
                name: 'Andheri to Ghatkopar',
                type: 'metro',
                from: 'Andheri',
                to: 'Ghatkopar',
                fare: 30,
                duration: '25 min',
                stops: ['Andheri', 'Vile Parle', 'Santacruz', 'Khar Road', 'Bandra', 'Mahim', 'Matunga Road', 'Dadar', 'Prabhadevi', 'Lower Parel', 'Mahalaxmi', 'Mumbai Central', 'Grant Road', 'Charni Road', 'Marine Lines', 'Churchgate']
            }
        ]
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
    showToast('Finding routes...', 'info');

    // Show available routes
    showAvailableRoutes();
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

    // Show available routes
    showAvailableRoutes();

    console.log('✅ Journey planning interface ready');
}

function showAvailableRoutes() {
    const routes = window.appState.staticData.routes;

    if (routes.length > 0) {
        showToast(`Found ${routes.length} available routes!`, 'success');

        // Display routes in the UI
        displayRoutes(routes.map(route => ({
            ...route,
            name: route.name,
            line: route.name,
            from: route.from,
            to: route.to,
            fare: route.fare,
            estimatedDuration: route.duration,
            stops: route.stops
        })), 'Static Route', 'Static Destination');
    }
}

/**
 * Handle View Map button (Static Version)
 */
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
 * Handle ticket purchasing (Static Version)
 */
async function buyTicket(line) {
    console.log(`🎫 Buying ticket for ${line}`);
    showToast('Loading ticket options...', 'info');

    // Use static data instead of API call
    const ticketData = window.appState.staticData.fares[line];
    if (ticketData) {
        const ticketModal = createTicketModal(line, { data: ticketData });
        document.body.appendChild(ticketModal);
        showToast(`Ticket options loaded for ${line}`, 'success');
    } else {
        // Fallback to basic modal
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
        const fareData = getFareData(line);
        const fareModal = createFareModal(line, fareData);
        document.body.appendChild(fareModal);
        showToast(`Showing fare information for ${line}`, 'info');
    }
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

/**
 * Display routes in the UI
 */
function displayRoutes(routes, from, to) {
    console.log(`📋 Displaying ${routes.length} routes from ${from} to ${to}`);

    let resultsContainer = document.getElementById('route-results');
    if (!resultsContainer) {
        console.log('Route results container not found, creating one...');
        createRouteResultsContainer();
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
    container.innerHTML = '';

    if (routes.length === 0) {
        container.innerHTML = `
            <div class="no-routes">
                <i class="fas fa-search"></i>
                <h3>No routes found</h3>
                <p>Try different locations or check spelling</p>
            </div>
        `;
        return;
    }

    routes.forEach((route, index) => {
        const routeCard = createRouteCard(route, index);
        container.appendChild(routeCard);
    });

    const resultsSection = document.getElementById('route-results-section');
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                <p class="route-details">${route.stops?.length || 0} stops • ${route.estimatedDuration || route.duration}</p>
            </div>
            <div class="route-fare">
                <span class="fare-amount">₹${route.fare}</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Create route results container
 */
function createRouteResultsContainer() {
    const planTab = document.getElementById('plan-tab');
    if (!planTab) return;

    const resultsSection = document.createElement('div');
    resultsSection.id = 'route-results-section';
    resultsSection.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">Available Routes</h2>
            <div class="section-line"></div>
        </div>
        <div id="route-results" class="route-results"></div>
    `;

    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.insertAdjacentElement('afterend', resultsSection);
    } else {
        planTab.appendChild(resultsSection);
    }
}

/**
 * Select a route
 */
function selectRoute(index, route = null) {
    console.log(`🛣️ Selecting route ${index}...`);
    window.appState.selectedRoute = route || { index };

    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    showToast(`Route ${index + 1} selected`, 'success');
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
                            <span>Distance</span>
                            <span>Fare</span>
                        </div>
                        ${(fareData.data ? fareData.data.fares : fareData.fares).map(fare => `
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

/**
 * Add metro lines to map (placeholder)
 */
function addMetroLinesToMap() {
    console.log('🚇 Adding Mumbai metro lines to map (placeholder)');
    showToast('Metro network overlay added to map', 'success');
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
window.selectRoute = selectRoute;
window.displayRoutes = displayRoutes;
window.createRouteCard = createRouteCard;
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

  const $mode = modal.querySelector('#fc-mode');
  const $km   = modal.querySelector('#fc-km');
  const $night= modal.querySelector('#fc-night');
  const $out  = modal.querySelector('#fc-result');
  const $bd   = modal.querySelector('#fc-breakdown');

  function recompute() {
    const m = $mode.value;
    const k = parseFloat($km.value || '0');
    const n = !!$night.checked;
    const r = REGULATED_RATES[m];
    const fare = calculateRegulatedFare(m, k, n);
    $out.textContent = toINR(fare);
    $bd.textContent = `Base ${toINR(r.base)} + ${toINR(r.perKm)}/km beyond ${r.initialKm} km${n ? ' (+25% night)' : ''}`;
  }
  [$mode,$km,$night].forEach(el => el.addEventListener('input', recompute));
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