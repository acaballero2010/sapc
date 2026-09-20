import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ---------------------------------------------------------------------------
// Firebase config — sourced exclusively from environment variables.
// Do NOT add hardcoded credential fallbacks here.
// See .env.example for the required variable names.
// ---------------------------------------------------------------------------
const REQUIRED_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

// Validate on server-side (build / SSR). Silently skip on client where
// process.env is inlined by Next.js at build time.
if (typeof window === "undefined") {
  const missing = REQUIRED_KEYS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `[firebase.ts] Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
      `Copy .env.example to .env.local and fill in your Firebase project credentials.`
    );
  }
}

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// SSR-safe singleton — prevents re-initialisation on hot-reload
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
