import { writable } from 'svelte/store';
import { auth } from './firebase';

export const user = writable(null);

auth.onAuthStateChanged((userRecord) => {
  if (userRecord) {
    user.set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName
    });
  } else {
    user.set(null);
  }
});

export function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

export function logout() {
  return auth.signOut();
}

export function register(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}