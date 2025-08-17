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
            return null;
        }
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
            this.insertComponent('tickets-tab', '#tickets-tab-container');
            this.insertComponent('compare-tab', '#compare-tab-container');
            
            console.log('✅ Application initialized with components');
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
    window.componentLoader.initialize();
});
