// src/config/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// @firebase/auth's react-native dist exports getReactNativePersistence; require directly
// so Metro resolves to the RN build (the 'firebase/auth' TS types don't expose this export).
let auth: ReturnType<typeof getAuth>;
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { getReactNativePersistence } = require('@firebase/auth') as any;
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  console.log('[Firebase] Auth initialized with AsyncStorage persistence');
} catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  console.warn('[Firebase] initializeAuth fallback (already initialized or no persistence):', msg);
  auth = getAuth(app);
}

export { auth };
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
