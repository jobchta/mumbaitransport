import { showToast } from './ui.js';

let mapInstance;
let directionsService;
let directionsRenderer;
let trafficLayer, transitLayer, bicyclingLayer;
let fromAutocomplete, toAutocomplete;

/**
 * Initialize Google Maps
 */
function initGoogleMaps() {
    try {
        console.log('🗺️ Initializing Google Maps...');

        if (!window.google || !window.google.maps) {
            console.error('❌ Google Maps API not loaded');
            showMapError('Google Maps API not loaded. Please refresh the page.');
            return;
        }

        const defaultCenter = { lat: 19.0760, lng: 72.8777 };
        const mapContainer = document.getElementById('map');

        if (mapContainer) {
            mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading map...</div>';
            mapContainer.style.display = 'block';
            mapContainer.style.background = 'rgba(0,0,0,0.1)';
        }

        mapInstance = new google.maps.Map(mapContainer, {
            zoom: 12,
            center: defaultCenter,
            styles: [
                { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
                { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }, { lightness: 13 }] },
                { featureType: 'administrative', elementType: 'geometry.fill', stylers: [{ color: '#000000' }] },
                { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#144b53' }, { lightness: 14 }, { weight: 1.4 }] },
                { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#08304b' }] },
                { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0c4152' }, { lightness: 5 }] },
                { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#000000' }] },
                { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0b434f' }, { lightness: 25 }] },
                { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#000000' }] },
                { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#0b3d51' }, { lightness: 16 }] },
                { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#000000' }] },
                { featureType: 'transit', elementType: 'all', stylers: [{ color: '#146474' }] },
                { featureType: 'transit.station', elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
                { featureType: 'water', elementType: 'all', stylers: [{ color: '#021019' }] }
            ],
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU, position: google.maps.ControlPosition.TOP_RIGHT },
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true,
            gestureHandling: 'greedy',
            clickableIcons: true,
            disableDoubleClickZoom: false
        });

        initializeMapLayers();
        initializeMapControls();
        initializeMapEvents();

        new google.maps.places.PlacesService(mapInstance);
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#6366f1',
                strokeWeight: 6,
                strokeOpacity: 0.8
            }
        });

        initAutocomplete();

        google.maps.event.addListenerOnce(mapInstance, 'tilesloaded', function() {
            console.log('✅ Google Maps tiles loaded successfully');
            if (mapContainer) {
                mapContainer.style.background = 'transparent';
            }
            showToast('Map loaded successfully!', 'success');
        });

        console.log('✅ Google Maps initialized successfully');

    } catch (error) {
        console.error('❌ Error initializing Google Maps:', error);
        showMapError('Error loading maps. Please check your connection.');
    }
}

function initializeMapLayers() {
    trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(null);

    transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(mapInstance);

    bicyclingLayer = new google.maps.BicyclingLayer();
    bicyclingLayer.setMap(null);

    console.log('🗺️ Map layers initialized');
}

function initializeMapControls() {
    const controlDiv = document.createElement('div');
    controlDiv.style.cssText = 'background-color: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); cursor: pointer; margin-bottom: 22px; text-align: center; padding: 8px;';
    controlDiv.title = 'Click to toggle layers';
    controlDiv.innerHTML = `
        <div style="color: white; font-weight: 600; margin-bottom: 8px;">Map Layers</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="display: flex; align-items: center; cursor: pointer; color: rgba(255,255,255,0.8);"><input type="checkbox" id="traffic-toggle" style="margin-right: 5px;"><i class="fas fa-traffic-light" style="margin-right: 5px;"></i>Traffic</label>
            <label style="display: flex; align-items: center; cursor: pointer; color: rgba(255,255,255,0.8);"><input type="checkbox" id="transit-toggle" checked style="margin-right: 5px;"><i class="fas fa-train" style="margin-right: 5px;"></i>Transit</label>
            <label style="display: flex; align-items: center; cursor: pointer; color: rgba(255,255,255,0.8);"><input type="checkbox" id="bicycling-toggle" style="margin-right: 5px;"><i class="fas fa-bicycle" style="margin-right: 5px;"></i>Bicycling</label>
        </div>`;

    mapInstance.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

    setTimeout(() => {
        document.getElementById('traffic-toggle').addEventListener('change', e => toggleLayer(trafficLayer, e.target.checked, 'Traffic'));
        document.getElementById('transit-toggle').addEventListener('change', e => toggleLayer(transitLayer, e.target.checked, 'Transit'));
        document.getElementById('bicycling-toggle').addEventListener('change', e => toggleLayer(bicyclingLayer, e.target.checked, 'Bicycling'));
    }, 100);

    console.log('🎛️ Custom map controls added');
}

function toggleLayer(layer, show, name) {
    layer.setMap(show ? mapInstance : null);
    showToast(`${name} layer ${show ? 'enabled' : 'disabled'}`, 'info');
}

function initializeMapEvents() {
    mapInstance.addListener('click', (event) => {
        console.log('📍 Map clicked at:', event.latLng.lat(), event.latLng.lng());
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: event.latLng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                const fromInput = document.getElementById('from');
                if (fromInput && !fromInput.value) {
                    fromInput.value = results[0].formatted_address;
                    showToast('Location selected from map', 'info');
                }
            }
        });
    });
}

function showMapError(message) {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.7); text-align: center; padding: 1rem;"><i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;"></i><h4 style="margin-bottom: 0.5rem; color: #ef4444;">Map Unavailable</h4><p style="margin-bottom: 1rem;">${message}</p><button id="retryMapBtn" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;"><i class="fas fa-refresh"></i> Retry</button></div>`;
        mapContainer.style.display = 'block';
        mapContainer.style.background = 'rgba(0,0,0,0.1)';
        document.getElementById('retryMapBtn').addEventListener('click', retryMapLoad);
    }
    showToast(message, 'error');
}

function retryMapLoad() {
    console.log('🔄 Retrying map load...');
    showToast('Retrying map load...', 'info');
    if (window.google && window.google.maps) {
        initGoogleMaps();
    } else {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD4VXgebBaqOojiujAPYIP8Qv-iYPSFVWw&libraries=places&callback=initGoogleMaps';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }
}

function initAutocomplete() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');

    if (fromInput && window.google && window.google.maps && window.google.maps.places) {
        fromAutocomplete = new google.maps.places.Autocomplete(fromInput, { componentRestrictions: { country: 'in' }, fields: ['formatted_address', 'geometry', 'name'], types: ['establishment', 'geocode'] });
        fromAutocomplete.addListener('place_changed', () => {
            const place = fromAutocomplete.getPlace();
            if (place.geometry) console.log('📍 From location selected:', place.formatted_address);
        });
    }

    if (toInput && window.google && window.google.maps && window.google.maps.places) {
        toAutocomplete = new google.maps.places.Autocomplete(toInput, { componentRestrictions: { country: 'in' }, fields: ['formatted_address', 'geometry', 'name'], types: ['establishment', 'geocode'] });
        toAutocomplete.addListener('place_changed', () => {
            const place = toAutocomplete.getPlace();
            if (place.geometry) console.log('📍 To location selected:', place.formatted_address);
        });
    }
}

function calculateAndDisplayRoute(fromLocation, toLocation) {
    if (!directionsService || !directionsRenderer) {
        showToast('Map services not ready. Please wait for map to load.', 'warning');
        return;
    }

    showToast('Calculating best routes...', 'info');

    directionsService.route({
        origin: fromLocation,
        destination: toLocation,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: { modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAIN, google.maps.TransitMode.SUBWAY] },
        provideRouteAlternatives: true
    }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);
            const bounds = new google.maps.LatLngBounds();
            response.routes.forEach(route => route.legs.forEach(leg => {
                bounds.extend(leg.start_location);
                bounds.extend(leg.end_location);
            }));
            mapInstance.fitBounds(bounds);
            displayRouteDetails(response);
            showToast(`Found ${response.routes.length} transit route(s)!`, 'success');
        } else {
            showToast('Could not calculate route. Please try different locations.', 'error');
        }
    });
}

function displayRouteDetails(response) {
    if (!response.routes || response.routes.length === 0) return;
    const leg = response.routes[0].legs[0];
    const routeInfo = document.createElement('div');
    routeInfo.className = 'route-info-panel';
    routeInfo.innerHTML = `<div class="route-summary"><h4>Route Details</h4><div class="route-stats"><div class="stat"><i class="fas fa-clock"></i><span>${leg.duration.text}</span></div><div class="stat"><i class="fas fa-road"></i><span>${leg.distance.text}</span></div></div></div>`;
    const existingInfo = document.querySelector('.route-info-panel');
    if (existingInfo) existingInfo.remove();
    document.getElementById('map').appendChild(routeInfo);
}

function addMetroLinesToMap() {
    if (!mapInstance) return;
    const metroLines = [
        { name: 'Line 1 (Blue)', color: '#1e40af', path: [{ lat: 19.1200, lng: 72.8200 }, { lat: 19.0860, lng: 72.9080 }] },
        { name: 'Line 2A (Yellow)', color: '#eab308', path: [{ lat: 19.2490, lng: 72.8590 }, { lat: 19.1080, lng: 72.8510 }] }
    ];
    metroLines.forEach(line => new google.maps.Polyline({ path: line.path, geodesic: true, strokeColor: line.color, strokeOpacity: 0.8, strokeWeight: 6 }).setMap(mapInstance));
    console.log('🚇 Mumbai metro lines added to map');
}

export { initGoogleMaps, calculateAndDisplayRoute, addMetroLinesToMap, mapInstance };
