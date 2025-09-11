<script>
  import Header from '$lib/components/Header.svelte';
  import Plan from '$lib/components/Plan.svelte';
  import Tickets from '$lib/components/Tickets.svelte';
  import Compare from '$lib/components/Compare.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let currentTab = 'plan';
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

  function switchTab(tab) {
    currentTab = tab;
  }
</script>

<svelte:head>
  <title>Mumbai Transport</title>
  <meta name="description" content="Mumbai Transport - Plan journeys, buy tickets, compare rides" />
</svelte:head>

<Header {toggleTheme} />

<main class="dashboard app-content">
  {#if currentTab === 'plan'}
    <Plan />
  {:else if currentTab === 'tickets'}
    <Tickets />
  {:else if currentTab === 'compare'}
    <Compare />
  {/if}
</main>

<nav class="bottom-tab-bar">
  <button on:click={() => switchTab('plan')} class:active={currentTab === 'plan'}>
    <i class="fas fa-route"></i>
    <span>Plan</span>
  </button>
  <button on:click={() => switchTab('tickets')} class:active={currentTab === 'tickets'}>
    <i class="fas fa-ticket"></i>
    <span>Tickets</span>
  </button>
  <button on:click={() => switchTab('compare')} class:active={currentTab === 'compare'}>
    <i class="fas fa-scale-balanced"></i>
    <span>Compare</span>
  </button>
</nav>

<style>
  @import '../app.css';
</style>