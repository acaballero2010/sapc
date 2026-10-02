import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

/**
 * Server-side Firebase Admin SDK initialization.
 * Safe for Next.js App Router API routes and server actions.
 */
function getFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    return existingApps[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "sapc-intellysys-ph";

  if (serviceAccountKey) {
    try {
      const parsedKey = typeof serviceAccountKey === "string" && serviceAccountKey.trim().startsWith("{")
        ? JSON.parse(serviceAccountKey)
        : JSON.parse(Buffer.from(serviceAccountKey, "base64").toString("utf-8"));

      return initializeApp({
        credential: cert(parsedKey),
        projectId: parsedKey.project_id || projectId,
      });
    } catch (err) {
      console.warn("[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to default credentials:", err);
    }
  }

  // Fallback to Application Default Credentials (e.g. on Firebase App Hosting / Cloud Run / GCP)
  return initializeApp({
    projectId,
  });
}

export const hasAdminCredentials = (): boolean => {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.K_SERVICE || // Google Cloud Run
    process.env.FUNCTION_NAME || // Google Cloud Functions
    process.env.GAE_ENV // Google App Engine
  );
};

export const adminApp: App = getFirebaseAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);

