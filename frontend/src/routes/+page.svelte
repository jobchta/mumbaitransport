<script>
  import { onMount } from 'svelte';
  import Plan from '$lib/components/Plan.svelte';
  import { db } from '$lib/firebase';
  import { collection, addDoc, getDocs } from 'firebase/firestore';

  let commutes = [];
  let newCommuteName = '';

  onMount(() => {
    // Only load saved commutes; Plan.svelte handles Maps boot via Worker-injected script
    loadCommutes();
  });

  async function saveCommute() {
    // Read current values from Plan.svelte inputs by ID to avoid duplicate state
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const from = fromInput?.value?.trim() || '';
    const to = toInput?.value?.trim() || '';

    if (!from || !to || !newCommuteName) {
      alert('Please enter commute name and select both locations');
      return;
    }

    try {
      await addDoc(collection(db, 'commutes'), {
        name: newCommuteName,
        from,
        to,
        createdAt: new Date()
      });
      alert('Commute saved!');
      newCommuteName = '';
      await loadCommutes();
    } catch (error) {
      console.error('Error saving commute:', error);
      alert('Error saving commute. Please try again.');
    }
  }

  async function loadCommutes() {
    try {
      const querySnapshot = await getDocs(collection(db, 'commutes'));
      commutes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading commutes:', error);
      alert('Error loading commutes.');
    }
  }
</script>

<div class="hero">
  <h1 class="hero-title">Navigate Mumbai</h1>
  <p class="hero-subtitle">Plan your journeys with station-based metro fares and reliable transit routes across Mumbai</p>

  <div class="cta-buttons">
    <button class="cta-button cta-primary" on:click={() => {}}>
      <i class="fas fa-route"></i> Plan Your Journey
    </button>
    <button class="cta-button cta-secondary" on:click={() => {}}>
      <i class="fas fa-map-marked-alt"></i> View Network Map
    </button>
    <button class="cta-button cta-secondary" on:click={() => {}}>
      <i class="fas fa-bookmark"></i> Bookmark This Page
    </button>
  </div>
</div>

<div class="my-commutes">
  <h2>My Commutes</h2>
  <div class="commute-form">
    <input type="text" bind:value={newCommuteName} placeholder="Commute name" />
    <button on:click={saveCommute}>Save Commute</button>
  </div>
  <div class="commutes-list">
    {#each commutes as commute}
      <div class="commute-item">
        <h3>{commute.name}</h3>
        <p>{commute.from} → {commute.to}</p>
      </div>
    {/each}
  </div>
</div>

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

  .my-commutes {
    margin: 2rem 0;
  }

  .my-commutes h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: white;
  }

  .commute-form {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .commute-form input {
    flex: 1;
    padding: 0.75rem;
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    color: white;
  }

  .commute-form button {
    padding: 0.75rem 1.5rem;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  .commutes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .commute-item {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1rem;
  }

  .commute-item h3 {
    color: white;
    margin-bottom: 0.25rem;
  }

  .commute-item p {
    color: rgba(255, 255, 255, 0.8);
  }
</style>