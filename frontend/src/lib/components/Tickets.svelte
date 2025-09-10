<script>
  import { onMount } from 'svelte';
  let lines = [
    {
      name: 'Line 1 (Versova-Andheri-Ghatkopar)',
      color: '#FF6B35',
      status: '12 stations • Operational: 5:30 AM - 12:00 AM'
    },
    {
      name: 'Line 2A (Dahisar East-DN Nagar)',
      color: '#10B981',
      status: '17 stations • Operational: 5:30 AM - 12:00 AM'
    },
    {
      name: 'Line 3 (Cuffe Parade-Bandra)',
      color: '#3B82F6',
      status: '16 stations • Operational: 5:30 AM - 12:00 AM'
    },
    {
      name: 'Line 7 (Dahisar-Andheri)',
      color: '#8B5CF6',
      status: '14 stations • Operational: 5:30 AM - 12:00 AM'
    }
  ];

  function buyTicket(line) {
    // Simulate ticket purchase
    alert(`Buying ticket for ${line.name}`);
  }

  function checkFare(line) {
    // Simulate fare check
    alert(`Checking fare for ${line.name}`);
  }
</script>

<div class="tickets-tab">
  <div class="section-header">
    <h2 class="section-title">Metro Tickets & Fares</h2>
    <div class="section-line"></div>
  </div>

  <div class="metro-lines">
    {#each lines as line}
      <div class="metro-line">
        <div class="line-info">
          <div class="line-color" style="background: {line.color};"></div>
          <div class="line-details">
            <h3>{line.name}</h3>
            <p>{line.status}</p>
          </div>
        </div>
        <div class="line-actions">
          <button class="btn btn-secondary" on:click={() => buyTicket(line)}>
            <i class="fas fa-ticket"></i>
            Buy Ticket
          </button>
          <button class="btn btn-outline" on:click={() => checkFare(line)}>
            <i class="fas fa-indian-rupee-sign"></i>
            Check Fare
          </button>
        </div>
      </div>
    {/each}
  </div>

  <div class="fare-info">
    <div class="section-header">
      <h2 class="section-title">Current Fares</h2>
      <div class="section-line"></div>
    </div>
    <div class="fare-grid">
      <div class="fare-card">
        <div class="fare-amount">₹10</div>
        <div class="fare-distance">1 station</div>
      </div>
      <div class="fare-card">
        <div class="fare-amount">₹20</div>
        <div class="fare-distance">2 stations</div>
      </div>
      <div class="fare-card">
        <div class="fare-amount">₹30</div>
        <div class="fare-distance">3 stations</div>
      </div>
      <div class="fare-card">
        <div class="fare-amount">₹40</div>
        <div class="fare-distance">4 stations</div>
      </div>
      <div class="fare-card">
        <div class="fare-amount">₹50</div>
        <div class="fare-distance">5 stations</div>
      </div>
      <div class="fare-card">
        <div class="fare-amount">₹60</div>
        <div class="fare-distance">6 stations</div>
      </div>
      <div class="fare-card">
        <div class="fare-amount">₹70</div>
        <div class="fare-distance">7 stations</div>
      </div>
      <div class="fare-card">
        <div class="fare-amount">₹80</div>
        <div class="fare-distance">8+ stations</div>
      </div>
    </div>
  </div>
</div>

<style>
  .tickets-tab {
    padding: 1rem;
  }

  .metro-lines {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .metro-line {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(10px);
  }

  .line-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .line-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }

  .line-details h3 {
    margin-bottom: 0.25rem;
    color: white;
  }

  .line-details p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .line-actions {
    display: flex;
    gap: 0.5rem;
  }

  .fare-info {
    margin-top: 2rem;
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

  .fare-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .fare-card {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    backdrop-filter: blur(10px);
  }

  .fare-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
  }

  .fare-distance {
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

  .btn-secondary {
    background: var(--gradient-secondary);
    color: white;
  }

  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  }

  .btn-outline {
    background: transparent;
    border: 1px solid var(--glass-border);
    color: rgba(255, 255, 255, 0.8);
  }

  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.1);
  }
</style>