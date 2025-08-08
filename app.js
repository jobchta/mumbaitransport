class MumbaiTransportApp {
    constructor() {
        // Your Mapbox access token is now integrated.
        this.MAPBOX_TOKEN = 'pk.eyJ1IjoibXVtYmFpdHJhbnNwb3J0IiwiYSI6ImNtZTJsOHNzNDB0aHQya3NhMHYxcTZrOGcifQ.Ji9ZGxj4ohb8DjRI9F3TIA';
        this.map = null;
        this.userLocationMarker = null;

        this.dom = {
            themeToggle: document.getElementById('theme-toggle'),
            offlineBanner: document.getElementById('offline-banner'),
            updatesList: document.getElementById('updates-list'),
            routePlannerBtn: document.getElementById('route-planner-btn'),
            routeModal: document.getElementById('route-planner-modal'),
            modalCloseBtn: document.getElementById('modal-close-btn'),
            routeForm: document.getElementById('route-form'),
            routeResults: document.getElementById('route-results'),
            locateUserBtn: document.getElementById('locate-user-btn'),
        };

        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.initMap();
        this.startLiveUpdates();
        this.checkOnlineStatus();
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.dom.themeToggle.querySelector('i').className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    setupEventListeners() {
        this.dom.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.dom.themeToggle.querySelector('i').className = newTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });

        window.addEventListener('online', () => this.checkOnlineStatus());
        window.addEventListener('offline', () => this.checkOnlineStatus());

        this.dom.routePlannerBtn.addEventListener('click', () => this.dom.routeModal.classList.add('active'));
        this.dom.modalCloseBtn.addEventListener('click', () => this.dom.routeModal.classList.remove('active'));
        this.dom.routeForm.addEventListener('submit', (e) => this.handleRouteSearch(e));
        this.dom.locateUserBtn.addEventListener('click', () => this.locateUser());
    }

    checkOnlineStatus() {
        this.dom.offlineBanner.classList.toggle('show', !navigator.onLine);
    }

    initMap() {
        mapboxgl.accessToken = this.MAPBOX_TOKEN;
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/standard',
            center: [72.8777, 19.0760], // Mumbai coordinates
            zoom: 11
        });

        this.map.on('load', () => {
            this.map.setConfigProperty('basemap', 'showPlaceLabels', true);
            this.map.setConfigProperty('basemap', 'showPointOfInterestLabels', true);
        });
    }

    locateUser() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                const userCoords = [longitude, latitude];

                this.map.flyTo({ center: userCoords, zoom: 15 });

                if (this.userLocationMarker) {
                    this.userLocationMarker.setLngLat(userCoords);
                } else {
                    const el = document.createElement('div');
                    el.className = 'fa-solid fa-person';
                    el.style.color = 'dodgerblue';
                    el.style.fontSize = '24px';
                    el.style.textShadow = '0 0 5px white';

                    this.userLocationMarker = new mapboxgl.Marker(el)
                        .setLngLat(userCoords)
                        .addTo(this.map);
                }
            }, error => {
                console.error("Error getting location:", error);
                this.addUpdate('Could not retrieve your location.', 'error');
            });
        }
    }

    async geocodeLocation(query) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.MAPBOX_TOKEN}&proximity=72.8777,19.0760&limit=1`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                return data.features[0].center; // Returns [longitude, latitude]
            } else {
                throw new Error('Location not found.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    async handleRouteSearch(e) {
        e.preventDefault();
        this.dom.routeResults.innerHTML = '<p>Finding best routes...</p>';

        const startQuery = e.target.elements['start-location'].value;
        const endQuery = e.target.elements['end-location'].value;

        try {
            const [startCoords, endCoords] = await Promise.all([
                this.geocodeLocation(startQuery),
                this.geocodeLocation(endQuery)
            ]);

            const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords.join(',')};${endCoords.join(',')}?geometries=geojson&access_token=${this.MAPBOX_TOKEN}`;
            const response = await fetch(directionsUrl);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                this.renderRouteResults(route);
                this.drawRouteOnMap(route.geometry);
            } else {
                throw new Error('No routes found.');
            }

        } catch (error) {
            this.dom.routeResults.innerHTML = `<p style="color: var(--error);">Error: ${error.message}</p>`;
        }
    }

    drawRouteOnMap(geometry) {
        if (this.map.getSource('route')) {
            this.map.removeLayer('route');
            this.map.removeSource('route');
        }

        this.map.addSource('route', {
            'type': 'geojson',
            'data': { 'type': 'Feature', 'properties': {}, 'geometry': geometry }
        });

        this.map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': { 'line-color': '#5E6AD2', 'line-width': 6, 'line-opacity': 0.8 }
        });

        const bounds = new mapboxgl.LngLatBounds(geometry.coordinates[0], geometry.coordinates[0]);
        for (const coord of geometry.coordinates) {
            bounds.extend(coord);
        }
        this.map.fitBounds(bounds, { padding: 60 });
    }

    renderRouteResults(route) {
        this.dom.routeResults.innerHTML = '';
        const option = document.createElement('div');
        option.className = 'route-option';

        const duration = Math.round(route.duration / 60);
        const distance = (route.distance / 1000).toFixed(1);

        const iconHtml = `<div class="route-icon" style="background: var(--primary);"><i class="fa-solid fa-car"></i></div>`;

        option.innerHTML = `
            <div class="route-header">
                <div class="route-summary">${iconHtml}</div>
                <div class="route-info">
                    <div class="route-duration">${duration} min</div>
                    <div class="route-distance">${distance} km</div>
                </div>
            </div>
        `;
        this.dom.routeResults.appendChild(option);
    }

    addUpdate(message, type = 'info') {
        const iconMap = { info: 'fa-circle-info', warning: 'fa-triangle-exclamation', error: 'fa-circle-exclamation', success: 'fa-circle-check', bus: 'fa-bus', train: 'fa-train-subway', metro: 'fa-train-tram' };
        const colorMap = { info: 'var(--info)', warning: 'var(--warning)', error: 'var(--error)', success: 'var(--success)', bus: 'var(--primary)', train: 'var(--success)', metro: '#8B5CF6' };
        const update = document.createElement('div');
        update.className = 'update-item';
        update.innerHTML = `
            <div class="update-icon" style="background:${colorMap[type]}"><i class="fa-solid ${iconMap[type]}"></i></div>
            <div class="update-content">
                <div class="update-text">${message}</div>
                <div class="update-time"><i class="fa-regular fa-clock"></i> ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
        this.dom.updatesList.prepend(update);
        if (this.dom.updatesList.children.length > 5) { this.dom.updatesList.lastChild.remove(); }
    }

    startLiveUpdates() {
        const sampleUpdates = [
            { msg: "Harbour Line trains delayed by 8 mins due to signal failure.", type: "train" },
            { msg: "New BEST electric buses launched on Route A-9.", type: "bus" },
            { msg: "Monsoon schedule updated for Ferry services.", type: "info" },
            { msg: "Ghatkopar Metro Station closed for maintenance on Sunday.", type: "metro" }
        ];
        this.addUpdate("Welcome to MumbaiTransport! All systems operational.", "success");
        let index = 0;
        setInterval(() => {
            const { msg, type } = sampleUpdates[index];
            this.addUpdate(msg, type);
            index = (index + 1) % sampleUpdates.length;
        }, 12000);
    }
}

document.addEventListener('DOMContentLoaded', () => new MumbaiTransportApp());
