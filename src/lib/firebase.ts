import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
} from 'firebase/auth';

// ─────────────────────────────────────────────
// Firebase Config
// Replace with your own Firebase project config
// from https://console.firebase.google.com
// ─────────────────────────────────────────────

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Only initialize if configured
const app = isConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not configured');
    return signInWithPopup(auth, googleProvider);
};

export const signOut = async () => {
    if (!auth) throw new Error('Firebase not configured');
    return firebaseSignOut(auth);
};

export { auth, isConfigured };
