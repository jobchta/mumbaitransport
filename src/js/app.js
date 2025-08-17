/**
 * Mumbai Transport App - Main JavaScript
 * Handles core functionality, tab navigation, and app initialization
 */

// Global Variables
let map;
let directionsService;
let directionsRenderer;
let placesService;
let fromAutocomplete;
let toAutocomplete;

/**
 * Initialize the application
 */
function initApp() {
    console.log('🚀 Initializing Mumbai Transport App...');
    
    // Initialize components
    initTabNavigation();
    initThemeToggle();
    initFormHandlers();
    initMapResize();
    
    // Initialize language manager
    if (window.languageManager) {
        window.languageManager.updateLanguage();
    }
    
    console.log('✅ App initialized successfully');
}

/**
 * Initialize tab navigation system
 */
function initTabNavigation() {
    console.log('📱 Initializing tab navigation...');
    
    // Add map resize functionality for plan tab when it becomes active
    const planRadio = document.getElementById('plan-radio');
    if (planRadio) {
        planRadio.addEventListener('change', () => {
            if (planRadio.checked && typeof google !== 'undefined' && map) {
                setTimeout(() => {
                    google.maps.event.trigger(map, 'resize');
                    console.log('🗺️ Map resized for plan tab');
                }, 100);
            }
        });
    }
    
    // Add click handlers for transport mode tabs
    const modeTabs = document.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            modeTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            const mode = tab.getAttribute('data-mode');
            console.log(`🚇 Transport mode selected: ${mode}`);
        });
    });
    
    console.log('✅ Tab navigation initialized');
}

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('mumbai-transport-theme', newTheme);
            
            // Update icon
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'ph ph-moon' : 'ph ph-sun';
            }
            
            console.log(`🌙 Theme changed to: ${newTheme}`);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('mumbai-transport-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'ph ph-moon' : 'ph ph-sun';
            }
        }
    }
}

/**
 * Initialize form handlers
 */
function initFormHandlers() {
    // Journey form submission
    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleJourneyForm();
        });
    }
    
    // Location swap functionality
    const swapButton = document.getElementById('swap-locations');
    if (swapButton) {
        swapButton.addEventListener('click', () => {
            const fromInput = document.getElementById('from');
            const toInput = document.getElementById('to');
            
            if (fromInput && toInput) {
                const temp = fromInput.value;
                fromInput.value = toInput.value;
                toInput.value = temp;
                console.log('🔄 Locations swapped');
            }
        });
    }
    
    // Departure time selector
    const departureTimeSelect = document.getElementById('departure-time');
    const timeSelector = document.getElementById('time-selector');
    
    if (departureTimeSelect && timeSelector) {
        departureTimeSelect.addEventListener('change', () => {
            const value = departureTimeSelect.value;
            if (value === 'depart' || value === 'arrive') {
                timeSelector.style.display = 'block';
            } else {
                timeSelector.style.display = 'none';
            }
        });
    }
}

/**
 * Handle journey form submission
 */
function handleJourneyForm() {
    const from = document.getElementById('from')?.value;
    const to = document.getElementById('to')?.value;
    
    if (!from || !to) {
        showToast('Please enter both from and to locations', 'error');
        return;
    }
    
    console.log(`🗺️ Planning route from ${from} to ${to}`);
    showToast('Finding routes...', 'success');
    
    // Simulate route finding
    setTimeout(() => {
        const routeResults = document.getElementById('route-results');
        if (routeResults) {
            routeResults.style.display = 'block';
        }
        showToast('Routes found!', 'success');
    }, 2000);
}

/**
 * Initialize map resize functionality
 */
function initMapResize() {
    // Resize map when window is resized
    window.addEventListener('resize', () => {
        if (typeof google !== 'undefined' && map) {
            google.maps.event.trigger(map, 'resize');
        }
    });
}

/**
 * Initialize Google Maps
 */
function initMap() {
    console.log('🗺️ Initializing Google Maps...');
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.warn('⚠️ Map container not found');
        return;
    }

    map = new google.maps.Map(mapElement, {
        center: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
        zoom: 12,
        styles: [
            {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'on' }]
            }
        ]
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    placesService = new google.maps.places.PlacesService(map);

    console.log('✅ Google Maps initialized');
}

/**
 * Initialize PWA features
 */
function initPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./src/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    }
    
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('📱 Install prompt ready');
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('📱 App installed successfully');
        deferredPrompt = null;
    });
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning)
 */
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

/**
 * Utility functions for components
 */
function buyTicket(line) {
    console.log(`🎫 Buying ticket for ${line}`);
    showToast(`Redirecting to ticket purchase for ${line}...`, 'success');
}

function checkFare(line) {
    console.log(`💰 Checking fare for ${line}`);
    showToast(`Fare information for ${line}`, 'success');
}

function openWhatsApp(type) {
    const messages = {
        metro: 'Hello, I need help with Mumbai Metro services.',
        ticket: 'Hello, I have an issue with my metro ticket.',
        refund: 'Hello, I would like to request a refund for my ticket.'
    };
    
    const message = encodeURIComponent(messages[type] || 'Hello, I need help with Mumbai Transport.');
    const url = `https://wa.me/919876543210?text=${message}`;
    window.open(url, '_blank');
}

function signInWithGoogle() {
    console.log('🔐 Signing in with Google...');
    showToast('Google Sign-In coming soon!', 'warning');
}

function connectUber() {
    console.log('🚗 Connecting Uber...');
    showToast('Uber integration coming soon!', 'warning');
}

function connectOla() {
    console.log('🚗 Connecting Ola...');
    showToast('Ola integration coming soon!', 'warning');
}

function selectRide(type) {
    console.log(`🚗 Selected ride type: ${type}`);
    showToast(`${type} selected for comparison`, 'success');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM loaded, initializing application...');
    
    initPWA();
    initApp();
    
    // Show welcome message
    showToast('Mumbai Transport Hub loaded successfully!', 'success');
});

// Export functions for global use
window.showToast = showToast;
window.initMap = initMap;
window.buyTicket = buyTicket;
window.checkFare = checkFare;
window.openWhatsApp = openWhatsApp;
window.signInWithGoogle = signInWithGoogle;
window.connectUber = connectUber;
window.connectOla = connectOla;
window.selectRide = selectRide;
