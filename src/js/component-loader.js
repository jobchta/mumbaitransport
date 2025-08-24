/**
 * Component Loader for Mumbai Transport App
 * Handles dynamic loading and management of HTML components
 */
class ComponentLoader {
    constructor() {
        this.components = {};
        this.loadedComponents = new Set();
        this.componentPaths = {
            'header': 'src/components/header.html',
            'tab-navigation': 'src/components/tab-navigation.html',
            'plan-tab': 'src/components/plan-tab.html',
            'tickets-tab': 'src/components/tickets-tab.html',
            'compare-tab': 'src/components/compare-tab.html'
        };
    }

    /**
     * Load a component from file
     * @param {string} name - Component name
     * @param {HTMLElement} targetElement - Target element to insert component
     * @returns {Promise<string|null>} - Component HTML or null if failed
     */
    async loadComponent(name, targetElement = null) {
        if (this.loadedComponents.has(name)) {
            return this.components[name];
        }

        try {
            const path = this.componentPaths[name];
            if (!path) {
                throw new Error(`Component path not found: ${name}`);
            }

            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${name} (${response.status})`);
            }

            const html = await response.text();
            this.components[name] = html;
            this.loadedComponents.add(name);

            if (targetElement) {
                targetElement.innerHTML = html;
            }

            console.log(`✅ Component loaded: ${name}`);
            return html;
        } catch (error) {
            console.error(`❌ Error loading component ${name}:`, error);
            // Return fallback HTML for critical components
            return this.getFallbackHTML(name);
        }
    }

    /**
     * Get fallback HTML for components
     * @param {string} name - Component name
     * @returns {string} - Fallback HTML
     */
    getFallbackHTML(name) {
        const fallbacks = {
            'header': `
                <header class="app-header">
                    <div class="header-content">
                        <div class="header-left">
                            <h1 class="app-title">Mumbai Transport</h1>
                            <p class="app-subtitle">Plan • Book • Travel</p>
                        </div>
                        <div class="header-right">
                            <button class="theme-toggle" id="theme-toggle">
                                <i class="ph ph-sun"></i>
                            </button>
                        </div>
                    </div>
                </header>
            `,
            'tab-navigation': `
                <input type="radio" name="tabs" id="plan-radio" class="tab-radio" checked>
                <input type="radio" name="tabs" id="tickets-radio" class="tab-radio">
                <input type="radio" name="tabs" id="compare-radio" class="tab-radio">
                <nav class="bottom-tab-bar">
                    <label for="plan-radio" class="tab-button">
                        <i class="ph ph-route"></i>
                        <span>Plan</span>
                    </label>
                    <label for="tickets-radio" class="tab-button">
                        <i class="ph ph-ticket"></i>
                        <span>Tickets</span>
                    </label>
                    <label for="compare-radio" class="tab-button">
                        <i class="ph ph-scales"></i>
                        <span>Compare</span>
                    </label>
                </nav>
            `,
            'plan-tab': `
                <div class="tab-content" id="plan-tab">
                    <div class="section-title">Plan Your Journey</div>
                    <div class="transport-modes">
                        <button class="mode-tab active" data-mode="all">
                            <i class="ph ph-shuffle"></i>
                            <span>All</span>
                        </button>
                        <button class="mode-tab" data-mode="metro">
                            <i class="ph ph-train"></i>
                            <span>Metro</span>
                        </button>
                        <button class="mode-tab" data-mode="bus">
                            <i class="ph ph-bus"></i>
                            <span>Bus</span>
                        </button>
                        <button class="mode-tab" data-mode="train">
                            <i class="ph ph-train-regional"></i>
                            <span>Train</span>
                        </button>
                    </div>
                    <form id="journey-form">
                        <div class="form-group">
                            <label class="form-label" for="from">From</label>
                            <div class="input-wrapper">
                                <i class="ph ph-map-pin input-icon"></i>
                                <input type="text" id="from" class="form-input" placeholder="Current location or address">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="to">To</label>
                            <div class="input-wrapper">
                                <i class="ph ph-map-pin-line input-icon"></i>
                                <input type="text" id="to" class="form-input" placeholder="Destination">
                                <button type="button" class="location-swap" id="swap-locations">
                                    <i class="ph ph-arrows-down-up"></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full btn-large">
                            <i class="ph ph-route"></i>
                            Find Routes
                        </button>
                    </form>
                    <div id="map" class="map-container" style="height: 300px; margin-top: 1rem;"></div>
                </div>
            `,
            'tickets-tab': `
                <div class="tab-content" id="tickets-tab">
                    <div class="section-title">Metro Tickets & Fares</div>
                    <div class="metro-lines">
                        <div class="metro-line">
                            <div class="line-info">
                                <div class="line-color" style="background: #FF6B35;"></div>
                                <div class="line-details">
                                    <h3>Line 1 (Versova-Andheri-Ghatkopar)</h3>
                                    <p>Operational: 5:30 AM - 12:00 AM</p>
                                </div>
                            </div>
                            <div class="line-actions">
                                <button class="btn btn-secondary" onclick="buyTicket('line1')">
                                    <i class="ph ph-ticket"></i>
                                    Buy Ticket
                                </button>
                                <button class="btn btn-outline" onclick="checkFare('line1')">
                                    <i class="ph ph-currency-inr"></i>
                                    Check Fare
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="fare-info">
                        <div class="section-title">Current Fares</div>
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
            `,
            'compare-tab': `
                <div class="tab-content" id="compare-tab">
                    <div class="section-title">Compare Rides</div>
                    <div class="ride-comparison">
                        <div class="comparison-card">
                            <div class="ride-option">
                                <div class="ride-icon">
                                    <i class="ph ph-train"></i>
                                </div>
                                <div class="ride-details">
                                    <h3>Metro</h3>
                                    <div class="ride-metrics">
                                        <span class="metric">
                                            <i class="ph ph-clock"></i>
                                            25 min
                                        </span>
                                        <span class="metric">
                                            <i class="ph ph-currency-inr"></i>
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
                                    <i class="ph ph-bus"></i>
                                </div>
                                <div class="ride-details">
                                    <h3>Bus</h3>
                                    <div class="ride-metrics">
                                        <span class="metric">
                                            <i class="ph ph-clock"></i>
                                            45 min
                                        </span>
                                        <span class="metric">
                                            <i class="ph ph-currency-inr"></i>
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
            `
        };
        
        return fallbacks[name] || `<div>Component ${name} not found</div>`;
    }

    /**
     * Load all components
     * @returns {Promise<void>}
     */
    async loadAllComponents() {
        const componentNames = Object.keys(this.componentPaths);
        
        console.log('📦 Loading components:', componentNames);
        
        for (const component of componentNames) {
            await this.loadComponent(component);
        }

        console.log('✅ All components loaded successfully');
    }

    /**
     * Insert component into DOM
     * @param {string} name - Component name
     * @param {string} targetSelector - CSS selector for target element
     */
    insertComponent(name, targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
            console.error(`❌ Target element not found: ${targetSelector}`);
            return;
        }

        const component = this.components[name];
        if (component) {
            targetElement.innerHTML = component;
            console.log(`✅ Component inserted: ${name} into ${targetSelector}`);
        } else {
            console.error(`❌ Component not found: ${name}`);
        }
    }

    /**
     * Initialize the application with all components
     * @returns {Promise<void>}
     */
    async initialize() {
        console.log('🚀 Initializing component loader...');
        
        try {
        await this.loadAllComponents();
        
        // Insert components into their respective containers
        this.insertComponent('header', '#header-container');
        this.insertComponent('tab-navigation', '#tab-navigation-container');
        this.insertComponent('plan-tab', '#plan-tab-container');

        // Initialize the map only after its container is loaded
        if (window.google && window.google.maps) {
            if (window.initializeMap) {
                window.initializeMap();
            }
        }

        this.insertComponent('tickets-tab', '#tickets-tab-container');
        this.insertComponent('compare-tab', '#compare-tab-container');
        
            console.log('✅ Application initialized with components');
            
            // Trigger any initialization functions
            if (window.initApp) {
                window.initApp();
            }
        } catch (error) {
            console.error('❌ Failed to initialize components:', error);
        }
    }

    /**
     * Get component by name
     * @param {string} name - Component name
     * @returns {string|null} - Component HTML or null
     */
    getComponent(name) {
        return this.components[name] || null;
    }

    /**
     * Check if component is loaded
     * @param {string} name - Component name
     * @returns {boolean} - True if loaded
     */
    isComponentLoaded(name) {
        return this.loadedComponents.has(name);
    }
}

// Global component loader instance
window.componentLoader = new ComponentLoader();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, starting component loader...');
    window.componentLoader.initialize();
});
