import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, serverTimestamp, Unsubscribe } from "firebase/firestore";

export const LOGO_STORAGE_KEY = "sapc_custom_logo";
const BRANDING_DOC_PATH = "system_settings";
const BRANDING_DOC_ID = "branding";

/**
 * Compresses an image file for optimal storage in Cloud Firestore (max dimension 320px, PNG transparency preserved).
 */
export async function compressLogoImage(file: File, maxDim = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use PNG to preserve alpha transparency of school crests
        const compressedDataUrl = canvas.toDataURL("image/png", 0.9);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Retrieves the currently active custom logo from client localStorage cache.
 */
export function getActiveCustomLogo(): string | null {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(LOGO_STORAGE_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Persists the custom logo locally and synchronizes it to Firebase Cloud Firestore for real-time cross-device sync.
 */
export async function saveCustomLogo(logoData: string | null): Promise<void> {
  // 1. Save locally and dispatch local event for immediate responsive UI update
  if (typeof window !== "undefined") {
    try {
      if (logoData) {
        localStorage.setItem(LOGO_STORAGE_KEY, logoData);
      } else {
        localStorage.removeItem(LOGO_STORAGE_KEY);
      }
      window.dispatchEvent(new CustomEvent("sapc_logo_updated", { detail: logoData }));
    } catch (e) {
      console.warn("Failed to write logo to localStorage:", e);
    }
  }

  // 2. Synchronize to Firebase Firestore
  if (db) {
    try {
      const docRef = doc(db, BRANDING_DOC_PATH, BRANDING_DOC_ID);
      await setDoc(docRef, {
        customLogo: logoData || null,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log("[Branding] Logo successfully synchronized to Cloud Firestore.");
    } catch (err) {
      console.error("[Branding Error] Cloud sync failed:", err);
    }
  }
}

/**
 * Real-time subscription to cloud branding updates.
 * Updates localStorage and invokes callback whenever another admin updates the logo on another device.
 */
export function subscribeCustomLogo(callback: (logo: string | null) => void): () => void {
  // Initial callback with cached value
  const initial = getActiveCustomLogo();
  callback(initial);

  // Local window event listener
  const handleLocalUpdate = (e: Event) => {
    const customEvt = e as CustomEvent;
    const val = customEvt.detail !== undefined ? customEvt.detail : getActiveCustomLogo();
    callback(val);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("sapc_logo_updated", handleLocalUpdate);
  }

  // Firebase real-time onSnapshot listener
  let unsubscribeFirestore: Unsubscribe | null = null;
  if (db) {
    try {
      const docRef = doc(db, BRANDING_DOC_PATH, BRANDING_DOC_ID);
      unsubscribeFirestore = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const remoteLogo: string | null = data?.customLogo || null;
          const currentLocal = getActiveCustomLogo();

          if (remoteLogo !== currentLocal) {
            if (typeof window !== "undefined") {
              if (remoteLogo) {
                localStorage.setItem(LOGO_STORAGE_KEY, remoteLogo);
              } else {
                localStorage.removeItem(LOGO_STORAGE_KEY);
              }
            }
            callback(remoteLogo);
          }
        }
      }, (err) => {
        // Graceful fallback to localStorage cache on permission or offline states
        if (err?.code !== "permission-denied") {
          console.debug("[Branding] Remote sync fallback:", err?.message || err);
        }
      });
    } catch (e) {
      console.debug("[Branding] Local-only branding mode active:", e);
    }
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("sapc_logo_updated", handleLocalUpdate);
    }
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}
