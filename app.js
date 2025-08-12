document.addEventListener('DOMContentLoaded', () => {
  // Initialize the map
  const map = L.map('map').setView([19.0760, 72.8777], 12); // Centered on Mumbai

  // Add a tile layer from OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Basic bottom sheet interaction
  const bottomSheet = document.getElementById('bottom-sheet');
  const sheetHeader = document.querySelector('.sheet-header');

  sheetHeader.addEventListener('click', () => {
    bottomSheet.classList.toggle('sheet-hidden');
  });

  // Commute Hub interaction
  const commuteHub = document.getElementById('commute-hub');
  const commuteBtn = document.querySelector('.nav-btn[data-action="commute"]');
  const closeCommuteHubBtn = document.getElementById('close-commute-hub');
  const addCommuteBtn = document.getElementById('add-commute-btn');

  commuteBtn.addEventListener('click', () => {
    commuteHub.classList.remove('page-hidden');
    commuteHub.classList.add('commute-hub-visible');
  });

  closeCommuteHubBtn.addEventListener('click', () => {
    commuteHub.classList.add('page-hidden');
    commuteHub.classList.remove('commute-hub-visible');
  });

  addCommuteBtn.addEventListener('click', () => {
    console.log('Add new commute clicked');
  });

  // Route Planner interaction
  const routePlanner = document.getElementById('route-planner');
  const routesBtn = document.querySelector('.nav-btn[data-action="routes"]');
  const closeRoutePlannerBtn = document.getElementById('close-route-planner');
  const findRouteBtn = document.getElementById('find-route-btn');

  routesBtn.addEventListener('click', () => {
    routePlanner.classList.remove('page-hidden');
    routePlanner.classList.add('route-planner-visible');
  });

  closeRoutePlannerBtn.addEventListener('click', () => {
    routePlanner.classList.add('page-hidden');
    routePlanner.classList.remove('route-planner-visible');
  });

  findRouteBtn.addEventListener('click', () => {
    console.log('Find route clicked');
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
});
