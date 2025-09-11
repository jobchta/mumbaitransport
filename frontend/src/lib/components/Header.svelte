<script>
  export let toggleTheme;
  import { base } from '$app/paths';
</script>

<div class="header">
  <div class="header-container">
    <a href="{base}/" class="logo">
      <div class="logo-icon">
        <i class="fas fa-subway"></i>
      </div>
      <span class="logo-text">Mumbai Transit</span>
    </a>

    <div class="header-right">
      <!-- Language Selector -->
      <div class="language-selector">
        <button class="language-btn" id="language-btn">
          <i class="fas fa-globe"></i>
          <span id="current-language">English</span>
          <i class="fas fa-caret-down"></i>
        </button>
        <div class="language-dropdown" id="language-dropdown">
          <div class="language-option active" data-lang="en">
            <span>🇺🇸</span>
            <span>English</span>
          </div>
          <div class="language-option" data-lang="hi">
            <span>🇮🇳</span>
            <span>हिंदी (Hindi)</span>
          </div>
          <div class="language-option" data-lang="mr">
            <span>🇮🇳</span>
            <span>मराठी (Marathi)</span>
          </div>
        </div>
      </div>

      <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle dark mode">
        <i class="fas fa-sun"></i>
      </button>
    </div>
  </div>
</div>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-decoration: none;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
    background: var(--gradient-primary);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: var(--shadow-glow);
    position: relative;
    overflow: hidden;
  }

  .logo-icon::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .language-selector {
    position: relative;
  }

  .language-btn {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .language-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .language-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--gray-900);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0.5rem;
    margin-top: 0.5rem;
    min-width: 200px;
    display: none;
    z-index: 1000;
    box-shadow: var(--shadow-intense);
  }

  .language-dropdown.show {
    display: block;
  }

  .language-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .language-option:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .language-option.active {
    background: rgba(99, 102, 241, 0.2);
  }

  .theme-toggle {
    background: var(--glass-light);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .theme-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 768px) {
    .header-container {
      padding: 1rem;
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>