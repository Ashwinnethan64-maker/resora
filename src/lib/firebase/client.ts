import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your_') &&
  !firebaseConfig.projectId.includes('your_')
);

// Fallback dummy config to prevent module crashes if variables are not yet injected
const effectiveConfig = isFirebaseConfigured
  ? firebaseConfig
  : {
      apiKey: 'AIzaSyPlaceholderKeyForResoraFirebaseBoot123',
      authDomain: 'resora-placeholder.firebaseapp.com',
      projectId: 'resora-placeholder',
      storageBucket: 'resora-placeholder.appspot.com',
      messagingSenderId: '123456789012',
      appId: '1:123456789012:web:placeholder12345',
    };

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(effectiveConfig);
export const auth: Auth = getAuth(app);

// Explicitly ensure browser local persistence for mobile OAuth redirect & refresh continuity
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Auth] Persistence initialization notice:', err);
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app };
