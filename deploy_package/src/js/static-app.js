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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

console.log('📱 Mumbai Transport App (Static Version) script loaded');