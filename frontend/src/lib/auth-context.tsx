"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "./api";
import { auth, db, googleProvider } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { getActiveFacultyRecords, getActiveStudentDataset, getActiveParentRecords } from "./dataset-store";

export type RoleType = "admin" | "guidance_counselor" | "teacher" | "parent" | "student";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: RoleType;
  student_id?: number | null;
  firebaseUid?: string;
  avatar_url?: string | null;
  section?: string;
  grade_level?: string;
  lrn?: string;
  strand?: string;
  department?: string;
  employee_id?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  serverError: string | null;
  login: (username: string, password: string, targetRole?: RoleType) => Promise<UserProfile>;
  loginWithGoogle: (targetRole?: RoleType) => Promise<{ user: UserProfile; isNewUser: boolean } | null | void>;
  switchRole: (role: RoleType) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void> | void;
  logout: () => void;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Recovers a permanently saved avatar for the specified user email from localStorage
 * or custom profile caches, falling back to any provided default.
 */
export const getPersistedAvatar = (email?: string | null, fallbackAvatar?: string | null): string | null => {
  if (typeof window !== "undefined") {
    if (email) {
      const perUserKey = `sapc_avatar_${email.toLowerCase().trim()}`;
      const saved = localStorage.getItem(perUserKey);
      if (saved !== null && saved !== "") {
        return saved;
      }
    }
    try {
      const customSaved = localStorage.getItem("sapc_custom_profile");
      if (customSaved) {
        const parsed = JSON.parse(customSaved);
        if (parsed?.avatar_url && (!email || parsed.email?.toLowerCase() === email.toLowerCase())) {
          return parsed.avatar_url;
        }
      }
    } catch {}
  }
  return fallbackAvatar || null;
};

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
    name: "Erika Bautista",
    student_id: 1 
  },
  parent: { 
    email: "parent@sapc.edu.ph", 
    pass: "parent123", 
    name: "Mrs. Elena Bautista",
    student_id: 1 
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginWithCredentials = async (
    identifier: string,
    pass: string,
    targetRoleHint?: RoleType
  ): Promise<UserProfile> => {
    setIsLoading(true);
    setServerError(null);

    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (pass || "").trim();

    if (!cleanId || !cleanPass) {
      setIsLoading(false);
      throw new Error("Please enter both your email/username and password.");
    }

    // -------------------------------------------------------------------------
    // 1. Attempt Firebase Authentication (if online and valid Firebase user)
    // -------------------------------------------------------------------------
    let firebaseUser: any = null;

    try {
      const isEmail = cleanId.includes("@");
      const emailForFb = isEmail ? cleanId : `${cleanId}@sapc.edu.ph`;
      const fbCred = await signInWithEmailAndPassword(auth, emailForFb, cleanPass);
      firebaseUser = fbCred.user;
    } catch {
      // Firebase auth error (not registered in Firebase or offline or invalid password)
    }

    if (firebaseUser) {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        const role = (userData?.role || targetRoleHint || "student") as RoleType;
        const avatar = getPersistedAvatar(firebaseUser.email || cleanId, userData?.avatar_url || firebaseUser.photoURL || null);
        const profile: UserProfile = {
          id: 1,
          email: firebaseUser.email || cleanId,
          full_name: firebaseUser.displayName || userData?.name || userData?.displayName || cleanId.split("@")[0],
          role: role,
          student_id: userData?.student_id || (role === "student" || role === "parent" ? 1 : null),
          firebaseUid: firebaseUser.uid,
          avatar_url: avatar
        };

        const tokenStr = `token_${role}_${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem("sapc_token", tokenStr);
          localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
          localStorage.setItem("sapc_user", JSON.stringify(profile));
        }

        setUser(profile);
        setToken(tokenStr);
        setServerError(null);
        setIsLoading(false);
        return profile;
      } catch (docErr) {
        console.warn("Firestore user profile fetch notice:", docErr);
      }
    }

    // -------------------------------------------------------------------------
    // 2. Attempt FastAPI backend endpoint (if server is active)
    // -------------------------------------------------------------------------
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const formData = new URLSearchParams();
      formData.append("username", cleanId);
      formData.append("password", cleanPass);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const avatar = getPersistedAvatar(data.email, data.avatar_url || null);
        const profile: UserProfile = {
          id: 1,
          email: data.email,
          full_name: data.full_name,
          role: data.role as RoleType,
          student_id: data.student_id,
          avatar_url: avatar
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("sapc_token", data.access_token);
          localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
          localStorage.setItem("sapc_user", JSON.stringify(profile));
        }

        setToken(data.access_token);
        setUser(profile);
        setServerError(null);
        setIsLoading(false);
        return profile;
      }
    } catch {
      // Backend not running / connection timed out
    }

    // -------------------------------------------------------------------------
    // 3. Strict Institutional Roster & Preset Authentication Check
    // -------------------------------------------------------------------------

    // A. Check Default Demo Profiles (Admin, Counselor, Teacher, Student, Parent)
    for (const [roleKey, demo] of Object.entries(DEMO_PROFILES) as [RoleType, typeof DEMO_PROFILES[RoleType]][]) {
      const demoEmail = demo.email.toLowerCase();
      const demoRole = roleKey.toLowerCase();
      const demoPrefix = demoEmail.split("@")[0];

      const isIdentifierMatch = 
        cleanId === demoEmail || 
        cleanId === demoRole || 
        cleanId === demoPrefix ||
        (roleKey === "admin" && (cleanId === "system.admin@sapc.edu.ph" || cleanId === "administrator")) ||
        (roleKey === "guidance_counselor" && (cleanId === "guidance@sapc.edu.ph" || cleanId === "guidance"));

      if (isIdentifierMatch) {
        // Password MUST match demo.pass
        if (cleanPass !== demo.pass) {
          setIsLoading(false);
          throw new Error("Invalid email or password. Please try again.");
        }

        const avatar = getPersistedAvatar(demo.email, null);
        const profile: UserProfile = {
          id: demo.student_id || 1,
          email: demo.email,
          full_name: demo.name,
          role: roleKey,
          student_id: demo.student_id || null,
          section: roleKey === "teacher" ? "Grade 10 - St. Augustine" : undefined,
          department: roleKey === "guidance_counselor" ? "Guidance & Counseling Center" : roleKey === "teacher" ? "Senior High STEM" : undefined,
          avatar_url: avatar
        };

        const tokenStr = `token_${roleKey}_${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem("sapc_token", tokenStr);
          localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
          localStorage.setItem("sapc_user", JSON.stringify(profile));
        }

        setUser(profile);
        setToken(tokenStr);
        setServerError(null);
        setIsLoading(false);
        return profile;
      }
    }

    // B. Check Faculty & Counselor Roster
    const facultyRoster = typeof window !== "undefined" ? getActiveFacultyRecords() : [];
    const matchedFaculty = facultyRoster.find(f => 
      (f.email && f.email.toLowerCase() === cleanId) ||
      (f.employee_id && f.employee_id.toLowerCase() === cleanId)
    );

    if (matchedFaculty) {
      const expectedPass = matchedFaculty.initial_password || (
        matchedFaculty.role === "guidance_counselor" || matchedFaculty.role === "counselor" ? "counselor123" : "teacher123"
      );

      if (cleanPass !== expectedPass) {
        setIsLoading(false);
        throw new Error("Invalid email or password. Please try again.");
      }

      const facultyRole: RoleType = 
        matchedFaculty.role === "guidance_counselor" || matchedFaculty.role === "counselor" ? "guidance_counselor" :
        matchedFaculty.role === "admin" ? "admin" : "teacher";

      const avatar = getPersistedAvatar(matchedFaculty.email, null);
      const profile: UserProfile = {
        id: 1,
        email: matchedFaculty.email,
        full_name: matchedFaculty.name,
        role: facultyRole,
        section: matchedFaculty.section,
        department: matchedFaculty.department,
        employee_id: matchedFaculty.employee_id,
        avatar_url: avatar
      };

      const tokenStr = `token_${facultyRole}_${Date.now()}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_token", tokenStr);
        localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
        localStorage.setItem("sapc_user", JSON.stringify(profile));
      }

      setUser(profile);
      setToken(tokenStr);
      setServerError(null);
      setIsLoading(false);
      return profile;
    }

    // C. Check Student Dataset (500 Students by LRN or Email)
    const studentRoster = typeof window !== "undefined" ? getActiveStudentDataset() : [];
    const matchedStudent = studentRoster.find(s => 
      String(s.lrn) === cleanId ||
      (s.email && s.email.toLowerCase() === cleanId) ||
      cleanId === `${s.lrn}@sapc.edu.ph` ||
      cleanId === `student.${s.lrn}@sapc.edu.ph` ||
      cleanId === `${s.lrn}@student.sapc.edu.ph`
    );

    if (matchedStudent) {
      const expectedPass = "student123";
      if (cleanPass !== expectedPass) {
        setIsLoading(false);
        throw new Error("Invalid email or password. Please try again.");
      }

      const studentEmail = matchedStudent.email || `${matchedStudent.lrn}@sapc.edu.ph`;
      const avatar = getPersistedAvatar(studentEmail, null);
      const profile: UserProfile = {
        id: matchedStudent.id,
        email: studentEmail,
        full_name: matchedStudent.full_name,
        role: "student",
        student_id: matchedStudent.id,
        section: matchedStudent.section_name,
        strand: matchedStudent.strand,
        avatar_url: avatar
      };

      const tokenStr = `token_student_${Date.now()}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_token", tokenStr);
        localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
        localStorage.setItem("sapc_user", JSON.stringify(profile));
      }

      setUser(profile);
      setToken(tokenStr);
      setServerError(null);
      setIsLoading(false);
      return profile;
    }

    // D. Check Parent Records
    const parentRoster = typeof window !== "undefined" ? getActiveParentRecords() : [];
    const matchedParent = parentRoster.find(p => 
      (p.email && p.email.toLowerCase() === cleanId) ||
      cleanId === `parent.${p.linkedLRN}@sapc.edu.ph` ||
      cleanId === `parent_${p.linkedLRN}` ||
      cleanId === p.phone?.replace(/\D/g, "")
    );

    if (matchedParent) {
      const expectedPass = matchedParent.initialPassword || "parent2026";
      if (cleanPass !== expectedPass && cleanPass !== "parent123") {
        setIsLoading(false);
        throw new Error("Invalid email or password. Please try again.");
      }

      const parentEmail = matchedParent.email || `parent.${matchedParent.linkedLRN}@sapc.edu.ph`;
      const avatar = getPersistedAvatar(parentEmail, null);
      const profile: UserProfile = {
        id: 1,
        email: parentEmail,
        full_name: matchedParent.name,
        role: "parent",
        student_id: 1,
        avatar_url: avatar
      };

      const tokenStr = `token_parent_${Date.now()}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_token", tokenStr);
        localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
        localStorage.setItem("sapc_user", JSON.stringify(profile));
      }

      setUser(profile);
      setToken(tokenStr);
      setServerError(null);
      setIsLoading(false);
      return profile;
    }

    // E. Check locally registered accounts (sapc_registered_accounts)
    if (typeof window !== "undefined") {
      try {
        const rawAccounts = localStorage.getItem("sapc_registered_accounts");
        if (rawAccounts) {
          const registeredList = JSON.parse(rawAccounts);
          if (Array.isArray(registeredList)) {
            const matchedReg = registeredList.find((acc: any) => 
              acc.email?.toLowerCase() === cleanId ||
              (acc.lrn && String(acc.lrn) === cleanId)
            );
            if (matchedReg) {
              if (cleanPass !== matchedReg.password) {
                setIsLoading(false);
                throw new Error("Invalid email or password. Please try again.");
              }

              const avatar = getPersistedAvatar(matchedReg.email, matchedReg.avatar_url || null);
              const profile: UserProfile = {
                id: matchedReg.student_id || 1,
                email: matchedReg.email,
                full_name: matchedReg.name || matchedReg.full_name,
                role: (matchedReg.role || "student") as RoleType,
                student_id: matchedReg.student_id || null,
                avatar_url: avatar
              };

              const tokenStr = `token_${profile.role}_${Date.now()}`;
              localStorage.setItem("sapc_token", tokenStr);
              localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
              localStorage.setItem("sapc_user", JSON.stringify(profile));

              setUser(profile);
              setToken(tokenStr);
              setServerError(null);
              setIsLoading(false);
              return profile;
            }
          }
        }
      } catch (err) {
        console.warn("Could not check registered accounts:", err);
      }
    }

    // -------------------------------------------------------------------------
    // 4. No Valid Match -> STRICT REJECTION
    // -------------------------------------------------------------------------
    setIsLoading(false);
    throw new Error("Invalid email or password. Please try again.");
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
        let studentId: number | null = null;

        if (userDoc.exists()) {
          const docData = userDoc.data();
          role = (targetRole || docData?.role || "student") as RoleType;
          studentId = docData?.student_id || null;
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

        const avatar = getPersistedAvatar(fbUser.email, fbUser.photoURL || null);
        const profile: UserProfile = {
          id: 1,
          email: fbUser.email || "",
          full_name: fbUser.displayName || "Google User",
          role: role,
          student_id: studentId,
          firebaseUid: fbUser.uid,
          avatar_url: avatar
        };

        const tokenStr = `token_${role}_${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem("sapc_token", tokenStr);
          localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
          localStorage.setItem("sapc_user", JSON.stringify(profile));
        }

        setUser(profile);
        setServerError(null);
        return { user: profile, isNewUser };
      }
      return null;
    } catch (err: any) {
      // Re-throw so the caller (login page) can display an appropriate error message
      // instead of silently creating a demo session for a failed auth attempt.
      console.warn("Google Sign-In error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    let currentEmail = user?.email;
    setUser((prev) => {
      if (!prev) return null;
      currentEmail = prev.email || currentEmail;
      const updated = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_custom_profile", JSON.stringify(updated));
        localStorage.setItem("sapc_user", JSON.stringify(updated));

        // If avatar_url was explicitly updated
        if (updates.avatar_url !== undefined) {
          const emailKey = (updated.email || currentEmail || "").toLowerCase().trim();
          if (emailKey) {
            if (updates.avatar_url) {
              localStorage.setItem(`sapc_avatar_${emailKey}`, updates.avatar_url);
            } else {
              localStorage.removeItem(`sapc_avatar_${emailKey}`);
            }
          }
          // Also sync with sapc_registered_accounts if present
          try {
            const rawAccounts = localStorage.getItem("sapc_registered_accounts");
            if (rawAccounts) {
              const accounts = JSON.parse(rawAccounts);
              if (Array.isArray(accounts)) {
                const idx = accounts.findIndex((a: any) => a.email?.toLowerCase() === emailKey);
                if (idx !== -1) {
                  accounts[idx].avatar_url = updates.avatar_url;
                  localStorage.setItem("sapc_registered_accounts", JSON.stringify(accounts));
                }
              }
            }
          } catch {}
        }
      }
      return updated;
    });

    if (auth.currentUser) {
      try {
        if (updates.avatar_url !== undefined || updates.full_name) {
          await updateProfile(auth.currentUser, {
            ...(updates.full_name ? { displayName: updates.full_name } : {}),
            ...(updates.avatar_url !== undefined ? { photoURL: updates.avatar_url || "" } : {})
          });
        }
      } catch (authErr) {
        console.warn("Firebase Auth profile update notice:", authErr);
      }

      if (db) {
        try {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            ...updates,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.warn("Firestore profile update notice:", err);
        }
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
    // Clear state first to prevent any re-renders showing stale data
    setToken(null);
    setUser(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signout notice:", err);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("sapc_token");
      localStorage.removeItem("sapc_custom_profile");
      localStorage.removeItem("sapc_user");
      localStorage.removeItem("sapc_last_chat_topic");
      localStorage.removeItem("sapc_crisis_alerts");
      // Hard redirect — bypasses Next.js router cache so login page loads fresh
      window.location.replace("/login");
    }
  };

  const retryConnection = async () => {
    await switchRole(user?.role || "guidance_counselor");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // A real Firebase session exists — restore it from Firestore
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();
          const customSaved = typeof window !== "undefined" ? localStorage.getItem("sapc_custom_profile") : null;
          const parsed = customSaved ? JSON.parse(customSaved) : null;

          const avatar = getPersistedAvatar(fbUser.email, parsed?.avatar_url || userData?.avatar_url || fbUser.photoURL || null);

          const restoredUser: UserProfile = {
            id: 1,
            email: fbUser.email || "",
            full_name: parsed?.full_name || userData?.name || fbUser.displayName || fbUser.email?.split("@")[0] || "Authenticated User",
            role: (userData?.role || "student") as RoleType,
            // Read student_id from Firestore document rather than always using 1
            student_id: userData?.student_id || parsed?.student_id || null,
            firebaseUid: fbUser.uid,
            avatar_url: avatar
          };
          setUser(restoredUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("sapc_user", JSON.stringify(restoredUser));
          }
          setIsLoading(false);
        } catch {
          // Firestore read failed — keep whatever state we have, still unblock loading
          setIsLoading(false);
        }
      } else {
        // No active Firebase session — check if there is an explicit saved custom session in localStorage
        if (typeof window !== "undefined") {
          const savedToken = localStorage.getItem("sapc_token");
          const customSaved = localStorage.getItem("sapc_custom_profile");
          if (savedToken && customSaved) {
            try {
              const parsed = JSON.parse(customSaved);
              const avatar = getPersistedAvatar(parsed?.email, parsed?.avatar_url);
              parsed.avatar_url = avatar;
              setUser(parsed);
              setToken(savedToken);
            } catch {
              setUser(null);
              setToken(null);
            }
          } else {
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        serverError,
        login: async (identifier, pass, targetRole) => loginWithCredentials(identifier, pass, targetRole),
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
