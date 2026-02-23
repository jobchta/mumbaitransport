import { writable } from 'svelte/store';

// Firebase auth removed to eliminate costs.
// This is now a simple store without backend integration.

export const user = writable(null);

export function login(email, password) {
  // Stub
  console.log('Login stub called');
  return Promise.resolve();
}

export function logout() {
  user.set(null);
  return Promise.resolve();
}

export function register(email, password) {
  // Stub
  console.log('Register stub called');
  return Promise.resolve();
}
