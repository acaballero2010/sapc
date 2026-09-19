"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "./api";

export type RoleType = "admin" | "guidance_counselor" | "teacher" | "parent" | "student";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: RoleType;
  student_id?: number | null;
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

const DEMO_CREDENTIALS: Record<RoleType, { email: string; pass: string }> = {
  guidance_counselor: { email: "counselor@sapc.edu.ph", pass: "counselor123" },
  teacher: { email: "teacher@sapc.edu.ph", pass: "teacher123" },
  admin: { email: "admin@sapc.edu.ph", pass: "admin123" },
  student: { email: "student@sapc.edu.ph", pass: "student123" },
  parent: { email: "parent@sapc.edu.ph", pass: "parent123" }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginWithCredentials = async (email: string, pass: string) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", pass);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });

      if (!res.ok) {
        throw new Error(`Authentication failed with status ${res.status}`);
      }

      const data = await res.json();
      localStorage.setItem("sapc_token", data.access_token);
      setToken(data.access_token);
      setUser({
        id: 1,
        email: data.email,
        full_name: data.full_name,
        role: data.role as RoleType,
        student_id: data.student_id
      });
      setServerError(null);
    } catch (err: any) {
      console.error("Backend connection error:", err);
      setServerError(err.message || "Failed to connect to FastAPI backend at http://localhost:8000");
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: RoleType) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await loginWithCredentials(creds.email, creds.pass);
    }
  };

  const logout = () => {
    localStorage.removeItem("sapc_token");
    setToken(null);
    setUser(null);
  };

  const retryConnection = async () => {
    await switchRole("guidance_counselor");
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await switchRole("guidance_counselor");
      } catch (e: any) {
        setServerError("Could not reach backend API. Ensure FastAPI is running on port 8000.");
        setIsLoading(false);
      }
    };
    initAuth();
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
        <div className="bg-rose-950 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Backend Warning:</span>
            <span>{serverError}</span>
          </div>
          <button
            onClick={retryConnection}
            className="px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-800 text-white font-semibold transition"
          >
            Retry Connection
          </button>
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
