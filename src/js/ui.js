import { addMetroLinesToMap, mapInstance } from './map.js';

/**
 * This module will handle all DOM manipulation, UI updates, and event listeners.
 */

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'toast-close';
    closeBtn.onclick = () => toast.remove();
    toast.appendChild(closeBtn);
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

/**
 * Initialize tab navigation
 * @param {function} onTabSwitch - Callback function to be called when a tab is switched.
 */
export function initTabNavigation(onTabSwitch) {
    const tabButtons = document.querySelectorAll('.tab-item');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('for')?.replace('-radio', '');
            if (targetTab) {
                switchTab(targetTab);
                onTabSwitch(targetTab);
            }
        });
    });
}

/**
 * Switch to a specific tab (visuals only)
 */
export function switchTab(tabName) {
    const radioButton = document.getElementById(`${tabName}-radio`);
    if (radioButton) {
        radioButton.checked = true;
    }
    document.querySelectorAll('.tab-item').forEach(item => {
        const itemTab = item.getAttribute('for')?.replace('-radio', '');
        item.classList.toggle('active', itemTab === tabName);
    });
    console.log(`📱 Switched to tab: ${tabName}`);
}


/**
 * Initialize theme toggle
 */
export function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        loadSavedTheme();
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mumbai-transport-theme', newTheme);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    console.log(`🎨 Theme changed to: ${newTheme}`);
}

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
 * Display found routes in the UI
 */
export function displayRoutes(routes, from, to) {
    console.log(`📋 Displaying ${routes.length} routes from ${from} to ${to}`);
    let resultsContainer = document.getElementById('route-results');
    if (!resultsContainer) {
        createRouteResultsContainer();
        resultsContainer = document.getElementById('route-results');
    }
    displayRoutesInContainer(routes, from, to, resultsContainer);
}

function displayRoutesInContainer(routes, from, to, container) {
    container.innerHTML = '';
    if (routes.length === 0) {
        container.innerHTML = `<div class="no-routes"><i class="fas fa-search"></i><h3>No routes found</h3><p>Try different locations or check spelling</p></div>`;
        showToast('No routes found. Try popular locations like Andheri, Bandra, Dadar.', 'warning');
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
    console.log(`✅ Displayed ${routes.length} routes successfully`);
}

function createRouteCard(route, index) {
    const card = document.createElement('div');
    card.className = 'route-card';
    card.dataset.routeIndex = index;
    const iconMap = { bus: 'fas fa-bus', train: 'fas fa-train', metro: 'fas fa-subway' };
    card.innerHTML = `
        <div class="route-header">
            <div class="route-icon"><i class="${iconMap[route.type] || 'fas fa-route'}"></i></div>
            <div class="route-info">
                <h3>${route.name || route.line || `${route.type.toUpperCase()} Route`}</h3>
                <p class="route-stops">${route.from} → ${route.to}</p>
                <p class="route-details">${route.stops?.length || 0} stops • ${route.estimatedDuration} min</p>
            </div>
            <div class="route-fare"><span class="fare-amount">₹${route.fare}</span></div>
        </div>`;
    return card;
}

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
        <div id="route-results" class="route-results"></div>`;
    const journeyForm = document.getElementById('journey-form');
    if (journeyForm) {
        journeyForm.insertAdjacentElement('afterend', resultsSection);
    } else {
        mainContent.appendChild(resultsSection);
    }
}

export function handlePlanJourney() {
    switchTab('plan');
    showToast('Ready to plan your journey!', 'info');
    const fromInput = document.getElementById('from');
    if (fromInput) {
        fromInput.focus();
    }
}

export function handleViewMap() {
    switchTab('plan');
    showToast('Loading Mumbai metro network map...', 'info');
    if (mapInstance) {
        const mumbaiCenter = { lat: 19.0760, lng: 72.8777 };
        mapInstance.setCenter(mumbaiCenter);
        mapInstance.setZoom(11);
        setTimeout(() => {
            addMetroLinesToMap();
            showToast('Mumbai metro network displayed', 'success');
        }, 1000);
    } else {
        showToast('Map loading... Please wait', 'info');
    }
}

export function handleBookmark() {
    showToast('Press Ctrl+D or Cmd+D to bookmark this page.', 'info');
}

export function selectRouteUI(index) {
    console.log(`🛣️ Selecting route ${index}...`);
    document.querySelectorAll('.route-card').forEach((card, i) => {
        card.classList.toggle('selected', i === index);
    });
    showToast(`Route ${index + 1} selected`, 'success');
}
