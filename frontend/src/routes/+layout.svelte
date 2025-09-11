<script>
  import '../app.css';
  import Header from '../lib/components/Header.svelte';
  import { onMount } from 'svelte';
  let isDark = true;

  onMount(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('mumbai-transport-theme');
    isDark = savedTheme !== 'light';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  });

  function toggleTheme() {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('mumbai-transport-theme', isDark ? 'dark' : 'light');
  }
</script>

<Header {toggleTheme} />
<main>
  <slot />
</main>