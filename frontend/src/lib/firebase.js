import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Firebase configuration - REPLACE WITH YOUR OWN PROJECT VALUES
const firebaseConfig = {
  apiKey: "AIzaSyDUMMY_API_KEY", // Replace with your API key
  authDomain: "mumbai-transport.firebaseapp.com", // Replace with your auth domain
  projectId: "mumbai-transport", // Replace with your project ID
  storageBucket: "mumbai-transport.appspot.com", // Replace with your storage bucket
  messagingSenderId: "123456789", // Replace with your sender ID
  appId: "1:123456789:web:DUMMY_APP_ID" // Replace with your app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Export for use in components
export { app };