<script>
  import { onMount } from 'svelte';

  let selectedRide = '';
  let rideData = null;

  const rides = {
    metro: {
      name: 'Metro',
      duration: '25 min',
      fare: '₹30',
      stops: 8,
      frequency: 'Every 3-5 min'
    },
    bus: {
      name: 'Bus',
      duration: '45 min',
      fare: '₹15',
      stops: 12,
      frequency: 'Every 10-15 min'
    }
  };

  function selectRide(ride) {
    selectedRide = ride;
    rideData = rides[ride];
  }
</script>

<div class="compare-tab">
  <div class="section-header">
    <h2 class="section-title">Compare Rides</h2>
    <div class="section-line"></div>
  </div>

  <div class="ride-comparison">
    <div class="comparison-card" class:selected={selectedRide === 'metro'} on:click={() => selectRide('metro')}>
      <div class="ride-option">
        <div class="ride-icon">
          <i class="fas fa-train"></i>
        </div>
        <div class="ride-details">
          <h3>Metro</h3>
          <div class="ride-metrics">
            <span class="metric">
              <i class="fas fa-clock"></i>
              25 min
            </span>
            <span class="metric">
              <i class="fas fa-indian-rupee-sign"></i>
              ₹30
            </span>
          </div>
        </div>
        <button class="btn btn-primary" on:click|stopPropagation={() => selectRide('metro')}>
          Select
        </button>
      </div>
    </div>

    <div class="comparison-card" class:selected={selectedRide === 'bus'} on:click={() => selectRide('bus')}>
      <div class="ride-option">
        <div class="ride-icon">
          <i class="fas fa-bus"></i>
        </div>
        <div class="ride-details">
          <h3>Bus</h3>
          <div class="ride-metrics">
            <span class="metric">
              <i class="fas fa-clock"></i>
              45 min
            </span>
            <span class="metric">
              <i class="fas fa-indian-rupee-sign"></i>
              ₹15
            </span>
          </div>
        </div>
        <button class="btn btn-primary" on:click|stopPropagation={() => selectRide('bus')}>
          Select
        </button>
      </div>
    </div>
  </div>

  {#if rideData}
    <div class="selected-ride-info">
      <h3>Selected: {rideData.name}</h3>
      <p>Duration: {rideData.duration}</p>
      <p>Fare: {rideData.fare}</p>
      <p>Stops: {rideData.stops}</p>
      <p>Frequency: {rideData.frequency}</p>
    </div>
  {/if}
</div>

<style>
  .compare-tab {
    padding: 1rem;
  }

  .ride-comparison {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .comparison-card {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .comparison-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: var(--primary);
  }

  .comparison-card.selected {
    border-color: var(--primary);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  }

  .ride-option {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .ride-icon {
    width: 48px;
    height: 48px;
    background: var(--gradient-primary);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    flex-shrink: 0;
  }

  .ride-details {
    flex: 1;
  }

  .ride-details h3 {
    margin-bottom: 0.5rem;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .ride-metrics {
    display: flex;
    gap: 1rem;
  }

  .metric {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
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
  }

  .btn-primary {
    background: var(--gradient-primary);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  }

  .selected-ride-info {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 1rem;
  }

  .selected-ride-info h3 {
    color: var(--primary);
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .selected-ride-info p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.5rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  .section-line {
    flex: 1;
    height: 2px;
    background: var(--gradient-primary);
    border-radius: 1px;
  }
</style>