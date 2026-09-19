"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "./api";
import { auth, db, googleProvider } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type RoleType = "admin" | "guidance_counselor" | "teacher" | "parent" | "student";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: RoleType;
  student_id?: number | null;
  firebaseUid?: string;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  serverError: string | null;
  login: (username: string, password?: string, targetRole?: RoleType) => Promise<void>;
  loginWithGoogle: (targetRole?: RoleType) => Promise<{ user: UserProfile; isNewUser: boolean } | null | void>;
  switchRole: (role: RoleType) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void> | void;
  logout: () => void;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILES: Record<RoleType, { email: string; pass: string; name: string; student_id?: number }> = {
  guidance_counselor: { 
    email: "counselor@sapc.edu.ph", 
    pass: "counselor123", 
    name: "Maria Theresa Cruz, RGC" 
  },
  teacher: { 
    email: "teacher@sapc.edu.ph", 
    pass: "teacher123", 
    name: "Prof. Ernesto Bautista" 
  },
  admin: { 
    email: "admin@sapc.edu.ph", 
    pass: "admin123", 
    name: "Dr. Remedios Santos, Ed.D." 
  },
  student: { 
    email: "student@sapc.edu.ph", 
    pass: "student123", 
    name: "Joshua Dimaculangan",
    student_id: 1 
  },
  parent: { 
    email: "parent@sapc.edu.ph", 
    pass: "parent123", 
    name: "Mrs. Elena Dimaculangan",
    student_id: 1 
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginWithCredentials = async (email: string, pass: string, targetRole?: RoleType) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // 1. Attempt Firebase Authentication First
      let firebaseUser: any = null;
      try {
        const fbCred = await signInWithEmailAndPassword(auth, email, pass);
        firebaseUser = fbCred.user;
      } catch (fbErr: any) {
        console.log("Firebase direct auth note:", fbErr.message);
      }

      // 2. Attempt FastAPI backend if available with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", pass);

        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (typeof window !== "undefined") {
            localStorage.setItem("sapc_token", data.access_token);
          }
          setToken(data.access_token);
          setUser({
            id: 1,
            email: data.email,
            full_name: data.full_name,
            role: data.role as RoleType,
            student_id: data.student_id,
            firebaseUid: firebaseUser?.uid
          });
          setServerError(null);
          return;
        }
      } catch {
        clearTimeout(timeoutId);
        // Backend FastAPI not running
      }

      // 3. If Firebase user logged in, check Firestore profile
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();
          const role = (userData?.role || targetRole || "student") as RoleType;
          setUser({
            id: 1,
            email: firebaseUser.email || email,
            full_name: firebaseUser.displayName || userData?.name || email.split("@")[0],
            role: role,
            student_id: 1,
            firebaseUid: firebaseUser.uid
          });
          setServerError(null);
          return;
        } catch (docErr) {
          console.warn("Firestore user profile fetch notice:", docErr);
        }
      }

      // 4. Seamless demo fallback
      const fallbackRole = targetRole || (
        email.includes("teacher") ? "teacher" :
        email.includes("student") ? "student" :
        email.includes("parent") ? "parent" :
        email.includes("admin") ? "admin" : "guidance_counselor"
      );
      const profile = DEMO_PROFILES[fallbackRole];

      let storedName = profile.name;
      if (typeof window !== "undefined") {
        const savedCustom = localStorage.getItem("sapc_custom_profile");
        if (savedCustom) {
          try {
            const parsed = JSON.parse(savedCustom);
            if (parsed && (parsed.email === email || parsed.role === fallbackRole)) {
              storedName = parsed.full_name || storedName;
            }
          } catch {
            // keep fallback
          }
        }
      }

      // If custom non-demo email entered, format from email
      if (email && !email.includes("student@sapc.edu.ph") && email.includes("@")) {
        const localPart = email.split("@")[0].replace(/[._-]/g, " ");
        const capitalized = localPart.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        if (capitalized.length > 2) {
          storedName = capitalized;
        }
      }

      const demoUser: UserProfile = {
        id: 1,
        email: email || profile.email,
        full_name: storedName,
        role: fallbackRole,
        student_id: profile.student_id || null
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_token", `demo_token_${fallbackRole}_${Date.now()}`);
        localStorage.setItem("sapc_custom_profile", JSON.stringify(demoUser));
      }

      setUser(demoUser);
      setToken(`demo_token_${fallbackRole}_${Date.now()}`);
      setServerError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (targetRole?: RoleType): Promise<{ user: UserProfile; isNewUser: boolean } | null> => {
    setIsLoading(true);
    setServerError(null);
    try {
      const fbCred = await signInWithPopup(auth, googleProvider);
      const fbUser = fbCred.user;
      if (fbUser) {
        const userRef = doc(db, "users", fbUser.uid);
        const userDoc = await getDoc(userRef);
        let role: RoleType = targetRole || "student";
        let isNewUser = false;

        if (userDoc.exists()) {
          const docData = userDoc.data();
          role = (targetRole || docData?.role || "student") as RoleType;
          isNewUser = !docData?.roleConfirmed && !targetRole;
          if (targetRole) {
            await setDoc(userRef, { role: targetRole, roleConfirmed: true, updatedAt: serverTimestamp() }, { merge: true });
          }
        } else {
          isNewUser = !targetRole;
          await setDoc(userRef, {
            email: fbUser.email,
            name: fbUser.displayName || "Google User",
            role: role,
            roleConfirmed: !!targetRole,
            authProvider: "google",
            createdAt: serverTimestamp(),
            isVerified: true
          });
        }

        const profile: UserProfile = {
          id: 1,
          email: fbUser.email || "",
          full_name: fbUser.displayName || "Google User",
          role: role,
          student_id: 1,
          firebaseUid: fbUser.uid,
          avatar_url: fbUser.photoURL || null
        };

        setUser(profile);
        setServerError(null);
        return { user: profile, isNewUser };
      }
      return null;
    } catch (err: any) {
      console.warn("Google Sign-In note:", err);
      const fallbackRole = targetRole || "student";
      const profileData = DEMO_PROFILES[fallbackRole];
      const fallbackProfile: UserProfile = {
        id: 1,
        email: profileData.email,
        full_name: profileData.name,
        role: fallbackRole,
        student_id: 1,
        avatar_url: null
      };
      setUser(fallbackProfile);
      return { user: fallbackProfile, isNewUser: false };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_custom_profile", JSON.stringify(updated));
      }
      return updated;
    });

    if (auth.currentUser && db) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          ...updates,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn("Firestore profile update notice:", err);
      }
    }
  };

  const switchRole = async (role: RoleType) => {
    const creds = DEMO_PROFILES[role];
    if (creds) {
      await loginWithCredentials(creds.email, creds.pass, role);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signout notice:", err);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("sapc_token");
      localStorage.removeItem("sapc_custom_profile");
    }
    setToken(null);
    setUser(null);
  };

  const retryConnection = async () => {
    await switchRole(user?.role || "guidance_counselor");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          const userData = userDoc.data();
          const customSaved = typeof window !== "undefined" ? localStorage.getItem("sapc_custom_profile") : null;
          const parsed = customSaved ? JSON.parse(customSaved) : null;

          setUser({
            id: 1,
            email: fbUser.email || "",
            full_name: parsed?.full_name || userData?.name || fbUser.displayName || fbUser.email?.split("@")[0] || "Authenticated User",
            role: (userData?.role || "student") as RoleType,
            student_id: 1,
            firebaseUid: fbUser.uid,
            avatar_url: parsed?.avatar_url || userData?.avatar_url || fbUser.photoURL || null
          });
        } catch {
          // Keep current user state
        }
      }
      setIsLoading(false);
    });

    // Default to counselor for instant demo readiness
    if (!user) {
      switchRole("guidance_counselor");
    }

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        serverError,
        login: async (email, pass = "counselor123", targetRole) => loginWithCredentials(email, pass, targetRole),
        loginWithGoogle,
        switchRole,
        updateUserProfile,
        logout,
        retryConnection
      }}
    >
      {serverError && (
        <div className="bg-gradient-to-r from-[#7B0012] to-[#380008] border-b border-amber-400/40 text-rose-100 px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-300">⚡ SAPC IntellySys:</span>
            <span className="text-rose-50">{serverError}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={retryConnection}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-[11px] transition shadow-xs"
            >
              Retry
            </button>
            <button
              onClick={() => setServerError(null)}
              className="px-2 py-1 rounded-lg bg-black/20 hover:bg-black/40 text-rose-200 hover:text-white font-bold text-[11px] transition"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
