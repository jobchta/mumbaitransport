<script>
  import { onMount } from 'svelte';
  let from = '';
  let to = '';
  let routes = [];
  let loading = false;
  let map;
  let directionsService;
  let directionsRenderer;

  // Wait for Worker-injected Maps JS to call window.initGoogleMaps or for google to be present
  onMount(() => {
    if (typeof window !== 'undefined') {
      if (window.google && window.google.maps) {
        initGoogleMaps();
      } else {
        // Define global callback used by injected script (and app.html stub)
        window.initGoogleMaps = () => {
          try { initGoogleMaps(); } catch (e) { console.error('initGoogleMaps error', e); }
        };
        // Also listen for our custom event if app.html fired it
        document.addEventListener('maps-ready', () => {
          if (!map && window.google && window.google.maps) initGoogleMaps();
        });
      }
    }
  });

  function initGoogleMaps() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    map = new google.maps.Map(mapElement, {
      center: { lat: 19.0760, lng: 72.8777 },
      zoom: 12,
      disableDefaultUI: false,
      zoomControl: true,
      fullscreenControl: true
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: { strokeColor: '#6366f1', strokeOpacity: 0.9, strokeWeight: 6 }
    });

    initPlacesAutocomplete();
  }

  function initPlacesAutocomplete() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');

    if (fromInput) {
      const fromAutocomplete = new google.maps.places.Autocomplete(fromInput, {
        componentRestrictions: { country: 'in' },
        fields: ['place_id', 'name', 'formatted_address', 'geometry'],
        types: ['geocode', 'establishment']
      });
      fromAutocomplete.addListener('place_changed', () => {
        const place = fromAutocomplete.getPlace();
        if (place.place_id) {
          from = place.name || fromInput.value || '';
        }
      });
    }

    if (toInput) {
      const toAutocomplete = new google.maps.places.Autocomplete(toInput, {
        componentRestrictions: { country: 'in' },
        fields: ['place_id', 'name', 'formatted_address', 'geometry'],
        types: ['geocode', 'establishment']
      });
      toAutocomplete.addListener('place_changed', () => {
        const place = toAutocomplete.getPlace();
        if (place.place_id) {
          to = place.name || toInput.value || '';
        }
      });
    }
  }

  async function findRoutes() {
    if (!from || !to) {
      alert('Please enter both from and to locations');
      return;
    }
    if (!directionsService || !directionsRenderer) {
      if (window.google && window.google.maps) {
        initGoogleMaps();
      } else {
        alert('Map not ready. Please wait a moment and try again.');
        return;
      }
    }

    loading = true;
    routes = [];

    const request = {
      origin: from,
      destination: to,
      travelMode: google.maps.TravelMode.TRANSIT,
      transitOptions: {
        modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAIN, google.maps.TransitMode.SUBWAY],
        routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
      },
      provideRouteAlternatives: true
    };

    directionsService.route(request, (response, status) => {
      loading = false;
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
        routes = response.routes || [];
      } else {
        // Fallback: DRIVING
        directionsService.route(
          { origin: from, destination: to, travelMode: google.maps.TravelMode.DRIVING, provideRouteAlternatives: true },
          (drResp, drStatus) => {
            if (drStatus === google.maps.DirectionsStatus.OK) {
              directionsRenderer.setDirections(drResp);
              routes = drResp.routes || [];
              alert('Public transit unavailable; showing driving route.');
            } else {
              alert('Could not calculate route. Try different locations.');
            }
          }
        );
      }
    });
  }

  function swapLocations() {
    [from, to] = [to, from];
  }
</script>

<div class="plan-tab">
  <div class="transport-modes">
    <button class="micro-btn active" on:click={() => {}} data-mode="all">
      <i class="fas fa-shuffle"></i>
      <span>All</span>
    </button>
    <button class="micro-btn" on:click={() => {}} data-mode="metro">
      <i class="fas fa-train"></i>
      <span>Metro</span>
    </button>
    <button class="micro-btn" on:click={() => {}} data-mode="bus">
      <i class="fas fa-bus"></i>
      <span>Bus</span>
    </button>
    <button class="micro-btn" on:click={() => {}} data-mode="train">
      <i class="fas fa-train"></i>
      <span>Train</span>
    </button>
  </div>

  <form on:submit|preventDefault={findRoutes}>
    <div class="form-group">
      <label for="from">From</label>
      <div class="input-wrapper">
        <i class="fas fa-map-pin input-icon"></i>
        <input type="text" id="from" bind:value={from} placeholder="Current location or address" />
      </div>
    </div>

    <div class="form-group">
      <label for="to">To</label>
      <div class="input-wrapper">
        <i class="fas fa-map-pin input-icon"></i>
        <input type="text" id="to" bind:value={to} placeholder="Destination" />
        <button type="button" class="location-swap" on:click={swapLocations} aria-label="Swap locations">
          <i class="fas fa-arrows-up-down"></i>
        </button>
      </div>
    </div>

    <button type="submit" class="btn btn-primary btn-full btn-large" disabled={loading}>
      <i class="fas fa-route"></i>
      {#if loading}
        <span>Finding routes...</span>
      {:else}
        <span>Find Routes</span>
      {/if}
    </button>
  </form>

  {#if routes.length > 0}
    <div class="routes-section">
      <h3>Available Routes</h3>
      {#each routes as route}
        <div class="route-card">
          <div class="route-info">
            <h4>{route.summary}</h4>
            <p>Duration: {route.legs[0].duration.text}</p>
            <p>Distance: {route.legs[0].distance.text}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div id="map" class="map-container"></div>
</div>

<style>
  .plan-tab {
    padding: 1rem;
  }

  .transport-modes {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .micro-btn {
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.4);
    color: var(--primary-light);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .micro-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 1rem;
    color: rgba(255, 255, 255, 0.6);
    z-index: 1;
  }

  .form-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
  }

  .location-swap {
    position: absolute;
    right: 1rem;
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    z-index: 1;
  }

  .location-swap:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(180deg);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    width: 100%;
    justify-content: center;
  }

  .btn-primary {
    background: var(--gradient-primary);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }

  .routes-section {
    margin-top: 2rem;
  }

  .routes-section h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: white;
  }

  .route-card {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .route-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: var(--primary);
  }

  .route-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .route-info h4 {
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .route-info p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }

  .map-container {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    position: relative;
    min-height: 300px;
    margin-top: 1.5rem;
  }

  #map {
    width: 100%;
    height: 100%;
    min-height: 300px;
    border-radius: 16px;
  }
</style>