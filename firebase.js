import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

/**
 * Firebase Project Configuration
 * These keys connect the app to your specific Firebase project.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};


/**
 * Initialize Firebase
 * If no app is already initialized, we start it here.
 */
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Auth and Firestore instances for use throughout the app
const auth = firebase.auth();
const db = firebase.firestore();

/**
 * Firestore Custom Settings
 * experimentalAutoDetectLongPolling: true ensures stable connection on all networks.
 * merge: true prevents errors during Hot Reloads (Fast Refresh).
 */
try {
  db.settings({
    experimentalAutoDetectLongPolling: true,
    merge: true,
  });
} catch (e) {
  // Silence the warning if settings are already applied during refresh
}

export { auth, db };