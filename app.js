// Mumbai Transport App - Core JavaScript
console.log('🚀 Mumbai Transport App loaded');

// Global variables
let map;
let directionsService;
let directionsRenderer;
let placesService;
let fromAutocomplete;
let toAutocomplete;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM loaded, initializing app...');
    
    // Initialize tab navigation
    initTabNavigation();
    
    // Initialize PWA features
    initPWA();
    
    // Show welcome message
    showToast('Mumbai Transport Hub loaded successfully!', 'success');
});

// Tab navigation - CSS-only system is used, no JavaScript needed
function initTabNavigation() {
    console.log('📱 CSS-only tab navigation system active');
    
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
}

// PWA initialization
function initPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
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
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('📱 App installed successfully');
        deferredPrompt = null;
    });
}

// Toast notification system
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

// Route planning function
function planRoute() {
    const from = document.getElementById('from')?.value;
    const to = document.getElementById('to')?.value;
    
    if (!from || !to) {
        showToast('Please enter both locations', 'error');
        return;
    }
    
    if (!directionsService || !directionsRenderer) {
        showToast('Maps not ready yet. Please wait...', 'error');
        return;
    }
    
    const request = {
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.TRANSIT
    };
    
    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            showToast('Route found!', 'success');
        } else {
            showToast('Could not find route. Try different locations.', 'error');
        }
    });
}

// Get current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showToast('Geolocation not supported by this browser.', 'error');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    document.getElementById('from').value = results[0].formatted_address;
                    showToast('Current location set!', 'success');
                } else {
                    showToast('Could not get address for current location.', 'error');
                }
            });
        },
        (error) => {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    showToast('Location access denied.', 'error');
                    break;
                case error.POSITION_UNAVAILABLE:
                    showToast('Location information unavailable.', 'error');
                    break;
                case error.TIMEOUT:
                    showToast('Location request timed out.', 'error');
                    break;
                default:
                    showToast('An unknown error occurred.', 'error');
                    break;
            }
        }
    );
}

// Export functions for use in HTML
window.planRoute = planRoute;
window.getCurrentLocation = getCurrentLocation;
window.showToast = showToast;
