"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "./api";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export type RoleType = "admin" | "guidance_counselor" | "teacher" | "parent" | "student";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: RoleType;
  student_id?: number | null;
  firebaseUid?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  serverError: string | null;
  login: (username: string, password?: string) => Promise<void>;
  switchRole: (role: RoleType) => Promise<void>;
  logout: () => void;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILES: Record<RoleType, { email: string; pass: string; name: string; student_id?: number }> = {
  guidance_counselor: { 
    email: "counselor@sapc.edu.ph", 
    pass: "counselor123", 
    name: "Maria Theresa Cruz, RGC (Guidance Counselor)" 
  },
  teacher: { 
    email: "teacher@sapc.edu.ph", 
    pass: "teacher123", 
    name: "Mr. Roberto Santos (STEM Adviser)" 
  },
  admin: { 
    email: "admin@sapc.edu.ph", 
    pass: "admin123", 
    name: "Administrator (SAPC IT & Guidance)" 
  },
  student: { 
    email: "student@sapc.edu.ph", 
    pass: "student123", 
    name: "Joshua Dimaculangan (Grade 11 STEM)",
    student_id: 1 
  },
  parent: { 
    email: "parent@sapc.edu.ph", 
    pass: "parent123", 
    name: "Mrs. Elena Dimaculangan (Parent)",
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

    // 1. Attempt Firebase Authentication First
    let firebaseUser: any = null;
    try {
      const fbCred = await signInWithEmailAndPassword(auth, email, pass);
      firebaseUser = fbCred.user;
    } catch (fbErr: any) {
      console.log("Firebase direct auth note:", fbErr.message);
    }

    // 2. Attempt FastAPI backend if available
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", pass);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });

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
    } catch (err: any) {
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
    setUser({
      id: 1,
      email: email || profile.email,
      full_name: profile.name,
      role: fallbackRole,
      student_id: profile.student_id || null
    });

    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    setServerError(
      isLocal
        ? "FastAPI backend at http://localhost:8000 is offline. Run 'npm run dev' to start both servers."
        : "Cloud Demo Mode: Running with embedded client simulation. Connect a production FastAPI backend via NEXT_PUBLIC_API_URL."
    );
    setIsLoading(false);
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
          setUser({
            id: 1,
            email: fbUser.email || "",
            full_name: fbUser.displayName || userData?.name || fbUser.email?.split("@")[0] || "Authenticated User",
            role: (userData?.role || "student") as RoleType,
            student_id: 1,
            firebaseUid: fbUser.uid
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
        login: async (email, pass = "counselor123") => loginWithCredentials(email, pass),
        switchRole,
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
