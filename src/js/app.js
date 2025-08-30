import { planRoute } from './api.js';
import { showToast, displayRoutes, initTabNavigation, initThemeToggle, handlePlanJourney, handleViewMap, handleBookmark, selectRouteUI } from './ui.js';
import { initGoogleMaps, calculateAndDisplayRoute } from './map.js';
import { initPWA } from './pwa.js';

/**
 * Mumbai Transport App - Main Application File
 * Handles core app initialization and functionality
 */

// Global app state
export const appState = {
    currentTab: 'plan',
    isOnline: navigator.onLine,
    userLocation: null,
    routes: [], // To store the routes from the API
    selectedRoute: null,
    language: 'en'
};

/**
 * Initialize the application
 */
function initApp() {
    console.log('🚀 Initializing Mumbai Transport App...');

    try {
        // Initialize UI components and pass state-updating callbacks
        initTabNavigation((newTab) => {
            appState.currentTab = newTab;
        });
        initThemeToggle();
        initFormHandlers();
        initCTAButtons();
        initRouteCardListener();

        // Initialize PWA features
        initPWA();

        // Initialize network status monitoring
        initNetworkStatus();

        showToast('Mumbai Transport App loaded successfully!', 'success');
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showToast('Error initializing app. Please refresh the page.', 'error');
    }
}

function initFormHandlers() {
    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.addEventListener('submit', handleJourneyForm);
    }
    const swapButton = document.getElementById('swap-locations');
    if (swapButton) {
        swapButton.addEventListener('click', () => {
            const fromInput = document.getElementById('from');
            const toInput = document.getElementById('to');
            const temp = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = temp;
            showToast('Locations swapped', 'info');
        });
    }
}

function initCTAButtons() {
    document.getElementById('planJourneyBtn')?.addEventListener('click', handlePlanJourney);
    document.getElementById('viewMapBtn')?.addEventListener('click', handleViewMap);
    document.getElementById('bookmarkBtn')?.addEventListener('click', handleBookmark);
}

function initRouteCardListener() {
    const resultsContainer = document.getElementById('route-results-section');
    resultsContainer?.addEventListener('click', (event) => {
        const card = event.target.closest('.route-card');
        if (card) {
            const routeIndex = parseInt(card.dataset.routeIndex, 10);
            appState.selectedRoute = appState.routes[routeIndex];
            selectRouteUI(routeIndex);
        }
    });
}

/**
 * Handle journey form submission
 */
async function handleJourneyForm(event) {
    event.preventDefault();

    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');

    const from = fromInput?.value?.trim();
    const to = toInput?.value?.trim();

    if (!from || !to) {
        showToast('Please enter both departure and destination locations', 'error');
        return;
    }

    if (!appState.isOnline) {
        showToast('You are offline. Please check your connection.', 'warning');
        return;
    }

    console.log(`🗺️ Planning route from "${from}" to "${to}"`);
    showToast('Finding routes...', 'info');

    try {
        const routes = await planRoute(from, to);
        appState.routes = routes; // Store routes in state
        console.log(`📊 Route search results:`, routes);

        if (routes.length === 0) {
            showToast('No routes found. Try different locations.', 'warning');
        } else {
            showToast(`Found ${routes.length} routes!`, 'success');
        }

        displayRoutes(routes, from, to);

        if (routes.length > 0) {
            calculateAndDisplayRoute(routes[0].from, routes[0].to);
        }
    } catch (error) {
        console.error('❌ Error planning route:', error);
        showToast('Error finding routes. Please try again.', 'error');
    }
}

/**
 * Initialize network status monitoring
 */
function initNetworkStatus() {
    window.addEventListener('online', () => {
        appState.isOnline = true;
        showToast('You are back online', 'success');
    });

    window.addEventListener('offline', () => {
        appState.isOnline = false;
        showToast('You are offline. Some features may not work.', 'warning');
    });
}


// Make the map initialization function available globally for the Google Maps script
window.initGoogleMaps = initGoogleMaps;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);