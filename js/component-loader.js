// Component Loader for Mumbai Transport App
class ComponentLoader {
    constructor() {
        this.components = {};
        this.loadedComponents = new Set();
    }

    // Load a component from file
    async loadComponent(name, targetElement) {
        if (this.loadedComponents.has(name)) {
            return this.components[name];
        }

        try {
            const response = await fetch(`components/${name}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${name}`);
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

    // Load all components
    async loadAllComponents() {
        const components = ['header', 'tab-navigation', 'plan-tab', 'tickets-tab', 'compare-tab'];
        
        for (const component of components) {
            await this.loadComponent(component);
        }

        console.log('✅ All components loaded');
    }

    // Insert component into DOM
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

    // Initialize the app with components
    async initialize() {
        console.log('🚀 Initializing component loader...');
        
        await this.loadAllComponents();
        
        // Insert components into their respective containers
        this.insertComponent('header', '#header-container');
        this.insertComponent('tab-navigation', '#tab-navigation-container');
        this.insertComponent('plan-tab', '#plan-tab-container');
        this.insertComponent('tickets-tab', '#tickets-tab-container');
        this.insertComponent('compare-tab', '#compare-tab-container');
        
        console.log('✅ App initialized with components');
    }
}

// Global component loader instance
window.componentLoader = new ComponentLoader();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.componentLoader.initialize();
});
