// Service Worker redirect to actual service worker in src/
// This file exists to satisfy browser requests for sw.js in root
importScripts('./src/sw.js');