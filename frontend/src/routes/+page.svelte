<script>
  import { onMount } from 'svelte';
  import Plan from '/components/Plan.svelte';

  // Firebase integration removed to eliminate costs.

  onMount(() => {
    // No backend loading
  });
</script>

<div class="hero">
  <h1 class="hero-title">Navigate Mumbai</h1>
  <p class="hero-subtitle">Plan your journeys with station-based metro fares</p>

  <div class="cta-buttons">
    <button class="cta-button cta-primary" on:click={() => {}}>
      <i class="fas fa-route"></i> Plan Your Journey
    </button>
    <!-- Map button removed -->
    <!-- <button class="cta-button cta-secondary" on:click={() => {}}>
      <i class="fas fa-map-marked-alt"></i> View Network Map
    </button> -->
    <button class="cta-button cta-secondary" on:click={() => {}}>
      <i class="fas fa-bookmark"></i> Bookmark This Page
    </button>
  </div>
</div>

<!-- "My Commutes" section removed -->

<Plan />

<style>
  .hero {
    padding: 120px 2rem 80px;
    text-align: center;
    position: relative;
  }

  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .cta-button {
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cta-primary {
    background: var(--gradient-primary);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  }

  .cta-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
  }

  .cta-secondary {
    background: transparent;
    color: white;
    border: 2px solid var(--glass-border);
    backdrop-filter: blur(10px);
  }

  .cta-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--primary-light);
  }
</style>
