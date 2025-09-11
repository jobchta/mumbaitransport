<script>
  import { onMount } from 'svelte';

  const lines = [
    { id: 'line1', name: 'Line 1 (Versova-Andheri-Ghatkopar)', color: '#FF6B35', stations: 12, status: '12 stations • Operational: 5:30 AM - 12:00 AM' },
    { id: 'line2a', name: 'Line 2A (Dahisar East-DN Nagar)',     color: '#10B981', stations: 17, status: '17 stations • Operational: 5:30 AM - 12:00 AM' },
    { id: 'line3', name: 'Line 3 (Cuffe Parade-Bandra)',         color: '#3B82F6', stations: 16, status: '16 stations • Operational: 5:30 AM - 12:00 AM' },
    { id: 'line7', name: 'Line 7 (Dahisar-Andheri)',             color: '#8B5CF6', stations: 14, status: '14 stations • Operational: 5:30 AM - 12:00 AM' }
  ];

  let selectedLine = lines[0];
  let stations = 1;
  let qty = 1;

  function fareForStations(n) {
    const s = Math.max(1, Math.min(100, Number(n) || 1));
    // Metro fares are station-based: 1..7 => ₹10..₹70, 8+ => ₹80
    return Math.min(s, 8) * 10;
  }

  $: singleFare = fareForStations(stations);
  $: totalFare = singleFare * Math.max(1, Number(qty) || 1);

  function buyTicket(line) {
    selectedLine = line;
    // In a real app, proceed to provider deep link; for now, show computed fare summary
    alert(`Selected ${line.name}\nStations: ${stations}\nTickets: ${qty}\nEstimated total: ₹${totalFare}`);
  }

  function checkFare(line) {
    selectedLine = line;
    // Focus calculator section
    const el = document.getElementById('station-fare-calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  <div class="fare-info" id="station-fare-calculator">
    <div class="section-header">
      <h2 class="section-title">Station-based Metro Fares</h2>
      <div class="section-line"></div>
    </div>

    <div class="calc-grid">
      <div class="calc-card">
        <label class="calc-label">Line</label>
        <select class="calc-input" bind:value={selectedLine}>
          {#each lines as l}
            <option value={l}>{l.name}</option>
          {/each}
        </select>
        <small class="muted">Total stations on {selectedLine.name}: {selectedLine.stations}</small>
      </div>

      <div class="calc-card">
        <label class="calc-label">Number of stations you travel</label>
        <input class="calc-input" type="number" min="1" max="100" bind:value={stations} />
        <small class="muted">Fares are per journey and based on station count, not kilometers.</small>
      </div>

      <div class="calc-card">
        <label class="calc-label">Tickets</label>
        <input class="calc-input" type="number" min="1" max="10" bind:value={qty} />
      </div>

      <div class="calc-card result">
        <div class="fare-amount">₹{singleFare}</div>
        <div class="fare-distance">{stations} {stations == 1 ? 'station' : 'stations'} • per ticket</div>
        <div class="total">Total: ₹{totalFare}</div>
      </div>
    </div>

    <div class="fare-grid">
      <div class="fare-card"><div class="fare-amount">₹10</div><div class="fare-distance">1 station</div></div>
      <div class="fare-card"><div class="fare-amount">₹20</div><div class="fare-distance">2 stations</div></div>
      <div class="fare-card"><div class="fare-amount">₹30</div><div class="fare-distance">3 stations</div></div>
      <div class="fare-card"><div class="fare-amount">₹40</div><div class="fare-distance">4 stations</div></div>
      <div class="fare-card"><div class="fare-amount">₹50</div><div class="fare-distance">5 stations</div></div>
      <div class="fare-card"><div class="fare-amount">₹60</div><div class="fare-distance">6 stations</div></div>
      <div class="fare-card"><div class="fare-amount">₹70</div><div class="fare-distance">7 stations</div></div>
      <div class="fare-card"><div class="fare-amount">₹80</div><div class="fare-distance">8+ stations</div></div>
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

  .calc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .calc-card {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1rem;
  }

  .calc-card.result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .calc-label {
    display: block;
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
  }

  .calc-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    color: white;
  }

  .muted {
    display: block;
    margin-top: 0.5rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
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

  .total {
    margin-top: 0.5rem;
    font-weight: 700;
    color: white;
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