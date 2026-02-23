<script>
  let from = '';
  let to = '';

  // Google Maps logic removed to eliminate costs.

  function findRoutes() {
    alert('Routing is currently unavailable (Map disabled).');
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

    <button type="submit" class="btn btn-primary btn-full btn-large">
      <i class="fas fa-route"></i>
      <span>Find Routes</span>
    </button>
  </form>

  <div class="map-container" style="display: flex; align-items: center; justify-content: center; height: 300px;">
    <p style="color: rgba(255,255,255,0.7);">Map unavailable</p>
  </div>
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

  .btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }

  .map-container {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    position: relative;
    margin-top: 1.5rem;
  }
</style>
