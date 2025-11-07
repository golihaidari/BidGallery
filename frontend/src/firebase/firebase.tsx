import {initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import firebaseConfig from "../../firebase.config.json";

/*const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};*/


// Initialize Firebase only if it hasn’t been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Auth instance
const auth = getAuth(app);

export { app, auth };
