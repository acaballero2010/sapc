"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, googleProvider } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  linkWithPopup,
  unlink
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";

import { getActiveFacultyRecords, getActiveStudentDataset, getActiveParentRecords } from "./dataset-store";

export type RoleType = "admin" | "guidance_counselor" | "teacher" | "parent" | "student";

// ============================================================================
// GAP-04 Fix: Session Cookie Helpers
// The middleware (middleware.ts) can read cookies but not localStorage.
// We write a lightweight, base64-encoded session cookie alongside the
// existing localStorage items so the edge middleware can enforce RBAC
// on every server render before the page component hydrates.
// ============================================================================
const SESSION_COOKIE_NAME = "sapc_session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function setSessionCookie(role: RoleType, fullName: string): void {
  if (typeof document === "undefined") return;
  const payload = btoa(JSON.stringify({ role, name: fullName, iat: Date.now() }));
  // SameSite=Strict prevents CSRF; Secure should be added in production via env flag
  const secure = process.env.NEXT_PUBLIC_APP_ENV === "production" ? ";secure" : "";
  document.cookie = `${SESSION_COOKIE_NAME}=${payload};path=/;max-age=${SESSION_COOKIE_MAX_AGE};samesite=strict${secure}`;
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=;path=/;max-age=0;samesite=strict`;
}

/**
 * Strips undefined values from an object to ensure Firestore operations (setDoc, updateDoc) never fail.
 * Firestore strictly rejects 'undefined' but accepts null or missing keys.
 */
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Automatically calls /api/auth/set-claims with the user's ID token,
 * setting role, lrn, linked_lrns on their Firebase Auth token, and forces a token refresh.
 */
export async function syncCustomClaims(firebaseUser: any, targetRole?: RoleType): Promise<void> {
  if (!firebaseUser) return;
  try {
    const rawToken = await firebaseUser.getIdToken();
    const res = await fetch("/api/auth/set-claims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rawToken}`,
      },
      body: JSON.stringify({ role: targetRole }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (!data?.localDev) {
        // Force refresh JWT to receive updated custom claims
        await firebaseUser.getIdToken(true);
      }
    }
  } catch (err) {
    console.warn("[SAPC Auth] Custom claims sync notice:", err);
  }
}


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
  phone?: string;
  guardian_name?: string;
  guardian_contact?: string;
  bio?: string;
  mustChangePassword?: boolean;
  googleLinked?: boolean;
  /** MODEL-02: Parent accounts may be linked to multiple children */
  linked_lrns?: string[];
  /** MODEL-03: Teacher accounts may have multiple advisory sections */
  advisory_sections?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  serverError: string | null;
  login: (username: string, password: string, targetRole?: RoleType) => Promise<UserProfile>;
  loginWithGoogle: (targetRole?: RoleType) => Promise<{ user: UserProfile; isNewUser: boolean } | null | void>;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
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

// SAPC Demo & Institutional Default Accounts
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
    name: "Mrs. Teresa Dimaculangan",
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

    const cleanInput = (identifier || "").trim();
    const cleanId = cleanInput.toLowerCase();
    const cleanPass = (pass || "").trim();

    if (!cleanId || !cleanPass) {
      setIsLoading(false);
      throw new Error("Please enter both your email/username and password.");
    }

    // -------------------------------------------------------------------------
    // 1. Resolve Identifier to Official Institutional Email & Known Profile
    // -------------------------------------------------------------------------
    let emailForAuth = cleanId;
    let knownName: string | null = null;
    let knownRole: RoleType | null = targetRoleHint || null;
    let knownStudentId: number | null = null;
    let knownLrn: string | null = null;
    let knownLinkedLrns: string[] = [];
    let knownSection: string | undefined = undefined;
    let knownGradeLevel: string | undefined = undefined;
    let knownDepartment: string | undefined = undefined;

    if (cleanId === "admin" || cleanId === "administrator" || cleanId === "admin@sapc.edu.ph" || cleanId === "system.admin@sapc.edu.ph") {
      emailForAuth = "admin@sapc.edu.ph";
      knownRole = "admin";
      knownName = "Dr. Remedios Santos, Ed.D.";
      knownDepartment = "Office of the Vice President for Academic Affairs";
    } else if (cleanId === "counselor" || cleanId === "guidance" || cleanId === "counselor@sapc.edu.ph" || cleanId === "guidance@sapc.edu.ph") {
      emailForAuth = "counselor@sapc.edu.ph";
      knownRole = "guidance_counselor";
      knownName = "Maria Theresa Cruz, RGC";
      knownDepartment = "Guidance & Counseling Center";
    } else if (cleanId === "teacher" || cleanId === "teacher@sapc.edu.ph") {
      emailForAuth = "teacher@sapc.edu.ph";
      knownRole = "teacher";
      knownName = "Prof. Ernesto Bautista";
      knownSection = "Grade 10 - St. Augustine";
      knownDepartment = "Senior High STEM / Junior High Science";
    } else if (cleanId === "student" || cleanId === "student@sapc.edu.ph" || cleanId === "student1" || cleanId === "108543120001" || cleanId === "109238475612") {
      emailForAuth = "student@sapc.edu.ph";
      knownRole = "student";
      knownName = "Joshua Dimaculangan";
      knownLrn = "109238475612";
      knownStudentId = 1;
      knownSection = "Grade 7 - St. Anthony";
      knownGradeLevel = "7";
      knownDepartment = "Junior High School";
    } else if (cleanId === "parent" || cleanId === "parent@sapc.edu.ph") {
      emailForAuth = "parent@sapc.edu.ph";
      knownRole = "parent";
      knownName = "Mrs. Elena Dimaculangan";
      knownLinkedLrns = ["109238475612", "108543120001"];
      knownStudentId = 1;
    } else if (/^\d{12}$/.test(cleanId) && targetRoleHint === "parent") {
      // 12-digit LRN entered on Parent Login
      const parentRoster = typeof window !== "undefined" ? getActiveParentRecords() : [];
      const matchedParent = parentRoster.find(p => p.linkedLRN === cleanId || p.linkedLRNs?.includes(cleanId));
      if (matchedParent) {
        emailForAuth = matchedParent.email;
        knownName = matchedParent.name;
        knownRole = "parent";
        knownSection = matchedParent.section || undefined;
        knownGradeLevel = matchedParent.gradeLevel || undefined;
        knownLinkedLrns = matchedParent.linkedLRNs || [cleanId];
      } else {
        emailForAuth = `parent.${cleanId}@parent.sapc.edu.ph`;
        knownRole = "parent";
        knownLinkedLrns = [cleanId];
      }
    } else if (/^\d{12}$/.test(cleanId)) {
      // 12-digit LRN provided
      const studentRoster = typeof window !== "undefined" ? getActiveStudentDataset() : [];
      const match = studentRoster.find(s => String(s.lrn).trim() === cleanId);
      if (match) {
        emailForAuth = match.email || `${match.lrn}@student.sapc.edu.ph`;
        knownName = match.full_name;
        knownRole = "student";
        knownStudentId = match.id;
        knownLrn = String(match.lrn);
        knownSection = match.section_name || undefined;
        knownGradeLevel = match.grade_level ? String(match.grade_level) : undefined;
        knownDepartment = match.grade_level && match.grade_level >= 11 ? (match.strand || "Senior High School") : "Junior High School";
      } else {
        emailForAuth = `${cleanId}@student.sapc.edu.ph`;
        knownRole = "student";
        knownLrn = cleanId;
      }
    } else {
      // Email or username provided: check all institutional rosters
      const studentRoster = typeof window !== "undefined" ? getActiveStudentDataset() : [];
      const matchedStudent = studentRoster.find(s => 
        (s.email && s.email.toLowerCase() === cleanId) || 
        String(s.lrn).trim() === cleanId
      );
      if (matchedStudent) {
        emailForAuth = matchedStudent.email || cleanId;
        knownName = matchedStudent.full_name;
        knownRole = "student";
        knownStudentId = matchedStudent.id;
        knownLrn = String(matchedStudent.lrn);
        knownSection = matchedStudent.section_name || undefined;
        knownGradeLevel = matchedStudent.grade_level ? String(matchedStudent.grade_level) : undefined;
        knownDepartment = matchedStudent.grade_level && matchedStudent.grade_level >= 11 ? (matchedStudent.strand || "Senior High School") : "Junior High School";
      } else {
        const facultyRoster = typeof window !== "undefined" ? getActiveFacultyRecords() : [];
        const matchedFaculty = facultyRoster.find(f => 
          (f.email && f.email.toLowerCase() === cleanId) ||
          (f.employee_id && f.employee_id.toLowerCase() === cleanId) ||
          (f.email && f.email.toLowerCase().startsWith(cleanId))
        );
        if (matchedFaculty) {
          emailForAuth = matchedFaculty.email;
          knownName = matchedFaculty.name;
          knownRole = (matchedFaculty.role === "counselor" ? "guidance_counselor" : matchedFaculty.role) as RoleType;
          knownSection = matchedFaculty.section || undefined;
          knownDepartment = matchedFaculty.department || undefined;
        } else {
          const parentRoster = typeof window !== "undefined" ? getActiveParentRecords() : [];
          const matchedParent = parentRoster.find(p => p.email && p.email.toLowerCase() === cleanId);
          if (matchedParent) {
            emailForAuth = matchedParent.email;
            knownName = matchedParent.name;
            knownRole = "parent";
            knownSection = matchedParent.section || undefined;
            knownGradeLevel = matchedParent.gradeLevel || undefined;
            if (matchedParent.linkedLRNs && matchedParent.linkedLRNs.length > 0) {
              knownLinkedLrns = matchedParent.linkedLRNs;
            } else if (matchedParent.linkedLRN) {
              knownLinkedLrns = [String(matchedParent.linkedLRN)];
            }
          } else if (!cleanId.includes("@")) {
            emailForAuth = `${cleanId}@sapc.edu.ph`;
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. Strict Firebase Authentication (signInWithEmailAndPassword)
    // -------------------------------------------------------------------------
    let firebaseUser: any = null;

    try {
      const fbCred = await signInWithEmailAndPassword(auth, emailForAuth, cleanPass);
      firebaseUser = fbCred.user;
    } catch (fbErr: any) {
      const errCode = fbErr?.code || "";

      // If user does not exist in Firebase Auth yet, verify if credentials match known institutional roster
      if (errCode === "auth/user-not-found" || errCode === "auth/invalid-credential" || errCode === "auth/invalid-email") {
        // A. Match against DEMO institutional accounts
        const matchedDemo = Object.values(DEMO_PROFILES).find(d => d.email.toLowerCase() === emailForAuth.toLowerCase());
        const isDemoMatch = matchedDemo && cleanPass === matchedDemo.pass;

        // B. Match against Faculty roster
        const facultyRoster = typeof window !== "undefined" ? getActiveFacultyRecords() : [];
        const matchedFaculty = facultyRoster.find(f => f.email && f.email.toLowerCase() === emailForAuth.toLowerCase());
        const expectedFacultyPass = matchedFaculty ? (matchedFaculty.initial_password || (matchedFaculty.role === "counselor" ? "counselor123" : "teacher123")) : null;
        const isFacultyMatch = matchedFaculty && cleanPass === expectedFacultyPass;

        // C. Match against Student roster
        const studentRoster = typeof window !== "undefined" ? getActiveStudentDataset() : [];
        const matchedStudent = studentRoster.find(s => s.email && s.email.toLowerCase() === emailForAuth.toLowerCase());
        const isStudentMatch = matchedStudent && (cleanPass === "student123" || cleanPass === "password123");

        // D. Match against Parent roster
        const parentRoster = typeof window !== "undefined" ? getActiveParentRecords() : [];
        const matchedParent = parentRoster.find(p => p.email && p.email.toLowerCase() === emailForAuth.toLowerCase());
        const expectedParentPass = matchedParent?.initialPassword || "parent123";
        const isParentMatch = matchedParent && (cleanPass === expectedParentPass || cleanPass === "parent123");

        // E. Match against local registered accounts cache
        let matchedReg: any = null;
        if (typeof window !== "undefined") {
          try {
            const rawReg = localStorage.getItem("sapc_registered_accounts");
            if (rawReg) {
              const regList = JSON.parse(rawReg);
              matchedReg = Array.isArray(regList) ? regList.find((r: any) => r.email?.toLowerCase() === emailForAuth.toLowerCase() && r.password === cleanPass) : null;
            }
          } catch {}
        }

        if (isDemoMatch || isFacultyMatch || isStudentMatch || isParentMatch || matchedReg) {
          try {
            const cred = await createUserWithEmailAndPassword(auth, emailForAuth, cleanPass);
            firebaseUser = cred.user;
            const provName = knownName || matchedFaculty?.name || matchedStudent?.full_name || matchedParent?.name || matchedReg?.name || (matchedDemo ? matchedDemo.name : "SAPC User");
            await updateProfile(firebaseUser, { displayName: provName });
          } catch (createErr: any) {
            console.warn("Auto-provisioning in Firebase Auth failed:", createErr);
          }
        }
      }

      if (!firebaseUser) {
        setIsLoading(false);
        throw new Error("Invalid email or password. Please verify your credentials or register an account.");
      }
    }

    // -------------------------------------------------------------------------
    // 3. Authenticated Session Established: Resolve Firestore User Profile
    // -------------------------------------------------------------------------
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : null;

      const emailLower = (firebaseUser.email || emailForAuth).toLowerCase();

      let rosterMatchRole: RoleType | null = null;
      if (typeof window !== "undefined") {
        const facultyList = getActiveFacultyRecords();
        const fMatch = facultyList.find(f => f.email && f.email.toLowerCase() === emailLower);
        if (fMatch) {
          rosterMatchRole = fMatch.role as RoleType;
        } else {
          const parentList = getActiveParentRecords();
          const pMatch = parentList.find(p => p.email && p.email.toLowerCase() === emailLower);
          if (pMatch || emailLower.startsWith("parent.") || emailLower.includes("@parent.")) {
            rosterMatchRole = "parent";
          }
        }
      }

      const inferredRole: RoleType = 
        knownRole ||
        targetRoleHint ||
        rosterMatchRole ||
        (emailLower.includes("admin@") || cleanId === "admin" ? "admin" :
        emailLower.includes("counselor@") || cleanId === "counselor" ? "guidance_counselor" :
        emailLower.includes("teacher@") || cleanId === "teacher" ? "teacher" :
        emailLower.includes("parent@") || cleanId === "parent" || emailLower.includes("@parent.") ? "parent" : "student");
      
      const role = (userData?.role || inferredRole) as RoleType;
      let lrn = userData?.lrn || userData?.metadata?.lrn || knownLrn || null;
      let linked_lrns = userData?.linked_lrns || (userData?.metadata?.childLrn ? [userData.metadata.childLrn] : knownLinkedLrns);

      // Hydrate student / faculty / parent specific fields from roster if missing
      let studentId: number | null = userData?.student_id || knownStudentId || null;
      let resolvedSection: string | null = userData?.section || knownSection || null;
      let resolvedGradeLevel: string | null = userData?.grade_level || knownGradeLevel || null;
      let resolvedDepartment: string | null = userData?.department || knownDepartment || null;
      let resolvedName: string = userData?.name || userData?.displayName || userData?.full_name || knownName || firebaseUser.displayName || emailLower.split("@")[0];

      if (role === "student") {
        const studentRoster = typeof window !== "undefined" ? getActiveStudentDataset() : [];
        let match = null;
        if (lrn) {
          match = studentRoster.find(s => String(s.lrn).trim() === String(lrn).trim());
        }
        if (!match && emailLower) {
          match = studentRoster.find(s => s.email && s.email.toLowerCase() === emailLower);
        }
        if (match) {
          if (!studentId) studentId = match.id;
          if (!lrn) lrn = String(match.lrn);
          if (!resolvedSection) resolvedSection = match.section_name || null;
          if (!resolvedGradeLevel) resolvedGradeLevel = match.grade_level ? String(match.grade_level) : null;
          if (!resolvedDepartment) resolvedDepartment = match.grade_level && match.grade_level >= 11 ? (match.strand || "Senior High School") : "Junior High School";
          if (!resolvedName || resolvedName === emailLower.split("@")[0]) resolvedName = match.full_name;
        }
        // ONLY the institutional demo student account (student@sapc.edu.ph) maps to student #1
        if (!studentId && emailLower === "student@sapc.edu.ph") {
          studentId = 1;
        }
      } else if (role === "teacher" || role === "guidance_counselor") {
        const facultyRoster = typeof window !== "undefined" ? getActiveFacultyRecords() : [];
        const match = facultyRoster.find(f => f.email && f.email.toLowerCase() === emailLower);
        if (match) {
          if (!resolvedSection) resolvedSection = match.section || null;
          if (!resolvedDepartment) resolvedDepartment = match.department || null;
          if (!resolvedName || resolvedName === emailLower.split("@")[0]) resolvedName = match.name;
        }
      } else if (role === "parent") {
        const parentRoster = typeof window !== "undefined" ? getActiveParentRecords() : [];
        const match = parentRoster.find(p => p.email && p.email.toLowerCase() === emailLower);
        if (match) {
          if (!resolvedName || resolvedName === emailLower.split("@")[0]) resolvedName = match.name;
          if (!resolvedSection) resolvedSection = match.section || null;
          if (!resolvedGradeLevel) resolvedGradeLevel = match.gradeLevel || null;
          if (!linked_lrns || linked_lrns.length === 0) {
            if (match.linkedLRNs && match.linkedLRNs.length > 0) {
              linked_lrns = match.linkedLRNs;
            } else if (match.linkedLRN) {
              linked_lrns = [String(match.linkedLRN)];
            }
          }
        }
      }

      // Persist / update Firestore document if missing
      if (!userDoc.exists()) {
        await setDoc(userDocRef, sanitizeFirestorePayload({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: resolvedName,
          displayName: resolvedName,
          full_name: resolvedName,
          role: role,
          roleConfirmed: true,
          student_id: studentId,
          lrn: lrn,
          linked_lrns: linked_lrns || [],
          primary_lrn: lrn || (linked_lrns && linked_lrns.length > 0 ? linked_lrns[0] : null),
          section: resolvedSection,
          grade_level: resolvedGradeLevel,
          department: resolvedDepartment,
          verified: true,
          verification_status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }), { merge: true });
      }

      const avatar = getPersistedAvatar(firebaseUser.email, userData?.avatar_url || firebaseUser.photoURL || null);
      const fullName = resolvedName || (role === "admin" ? "Dr. Remedios Santos, Ed.D." : emailLower.split("@")[0]);

      const profile: UserProfile = {
        id: studentId || (role === "student" && emailLower === "student@sapc.edu.ph" ? 1 : Date.now()),
        email: firebaseUser.email || emailForAuth,
        full_name: fullName,
        role: role,
        student_id: studentId,
        firebaseUid: firebaseUser.uid,
        avatar_url: avatar,
        lrn: lrn || undefined,
        linked_lrns: linked_lrns || [],
        section: resolvedSection || undefined,
        grade_level: resolvedGradeLevel || undefined,
        department: resolvedDepartment || undefined,
        phone: userData?.phone,
        guardian_name: userData?.guardian_name,
        guardian_contact: userData?.guardian_contact,
        bio: userData?.bio,
        mustChangePassword: userData?.mustChangePassword,
        googleLinked: userData?.googleLinked
      };

      const tokenStr = await firebaseUser.getIdToken();
      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_token", tokenStr);
        localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
        localStorage.setItem("sapc_user", JSON.stringify(profile));
      }
      // GAP-04: Set middleware-readable session cookie
      setSessionCookie(role, profile.full_name);

      // Sync custom claims to Firebase Auth token for Firestore security rules
      await syncCustomClaims(firebaseUser, role);

      setUser(profile);
      setToken(tokenStr);
      setServerError(null);
      setIsLoading(false);
      return profile;
    } catch (err: any) {
      console.error("Firestore user profile resolution notice:", err);
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (targetRole?: RoleType): Promise<{ user: UserProfile; isNewUser: boolean } | null> => {
    setIsLoading(true);
    setServerError(null);
    try {
      const fbCred = await signInWithPopup(auth, googleProvider);
      const fbUser = fbCred.user;
      if (fbUser) {
        const emailLower = (fbUser.email || "").toLowerCase();

        // 1. Check if user document already exists in Firestore
        const userRef = doc(db, "users", fbUser.uid);
        const userDoc = await getDoc(userRef);
        let docData = userDoc.exists() ? userDoc.data() : null;

        // If not found by UID, check if pre-provisioned by email
        if (!docData && emailLower) {
          try {
            const emailQuery = query(collection(db, "users"), where("email", "==", emailLower));
            const querySnap = await getDocs(emailQuery);
            if (!querySnap.empty) {
              docData = querySnap.docs[0].data();
            }
          } catch (e) {
            console.warn("Firestore email query notice:", e);
          }
        }

        // 2. Check institutional rosters
        const isDemo = Object.values(DEMO_PROFILES).some(d => d.email.toLowerCase() === emailLower);
        const facultyRoster = typeof window !== "undefined" ? getActiveFacultyRecords() : [];
        const matchedFaculty = facultyRoster.find(f => f.email && f.email.toLowerCase() === emailLower);
        const studentRoster = typeof window !== "undefined" ? getActiveStudentDataset() : [];
        const matchedStudent = studentRoster.find(s => s.email && s.email.toLowerCase() === emailLower);
        const parentRoster = typeof window !== "undefined" ? getActiveParentRecords() : [];
        const matchedParent = parentRoster.find(p => p.email && p.email.toLowerCase() === emailLower);

        // ENFORCE POLICY: User must be pre-provisioned!
        if (!docData && !isDemo && !matchedFaculty && !matchedStudent && !matchedParent) {
          await signOut(auth);
          throw new Error(`The Google account "${emailLower}" is not enrolled in the SAPC portal. Public registration is closed. Please request an account invitation from the SAPC Registrar or Platform Administrator.`);
        }

        const role: RoleType = (docData?.role || targetRole || (matchedFaculty ? (matchedFaculty.role === "counselor" ? "guidance_counselor" : matchedFaculty.role) : (matchedParent ? "parent" : "student"))) as RoleType;
        const studentId: number | null = docData?.student_id || matchedStudent?.id || (role === "student" && emailLower === "student@sapc.edu.ph" ? 1 : null);
        const lrn: string | null = docData?.lrn || matchedStudent?.lrn || (matchedParent ? matchedParent.linkedLRN : null);
        const section: string | null = docData?.section || matchedStudent?.section_name || matchedFaculty?.section || (matchedParent ? matchedParent.section : null);
        const gradeLevel: string | null = docData?.grade_level || (matchedStudent ? `Grade ${matchedStudent.grade_level}` : null);
        const fullName: string = docData?.full_name || docData?.name || matchedFaculty?.name || matchedStudent?.full_name || matchedParent?.name || fbUser.displayName || emailLower.split("@")[0];

        // Link Google credential to official Firestore profile
        await setDoc(userRef, sanitizeFirestorePayload({
          uid: fbUser.uid,
          email: fbUser.email,
          full_name: fullName,
          name: fullName,
          displayName: fullName,
          role: role,
          roleConfirmed: true,
          student_id: studentId,
          lrn: lrn || null,
          section: section || null,
          grade_level: gradeLevel || null,
          phone: docData?.phone || matchedFaculty?.phone || matchedParent?.phone || null,
          guardian_name: docData?.guardian_name || null,
          guardian_contact: docData?.guardian_contact || null,
          department: docData?.department || matchedFaculty?.department || null,
          googleLinked: true,
          authProvider: "google",
          isVerified: true,
          updatedAt: serverTimestamp(),
          ...(userDoc.exists() ? {} : { createdAt: serverTimestamp() })
        }), { merge: true });

        const avatar = getPersistedAvatar(fbUser.email, docData?.avatar_url || fbUser.photoURL || null);
        const profile: UserProfile = {
          id: studentId || (role === "student" && emailLower === "student@sapc.edu.ph" ? 1 : Date.now()),
          email: fbUser.email || "",
          full_name: fullName,
          role: role,
          student_id: studentId,
          firebaseUid: fbUser.uid,
          avatar_url: avatar,
          lrn: lrn || undefined,
          section: section || undefined,
          grade_level: gradeLevel || undefined,
          phone: docData?.phone || matchedFaculty?.phone || matchedParent?.phone,
          guardian_name: docData?.guardian_name,
          guardian_contact: docData?.guardian_contact,
          department: docData?.department || matchedFaculty?.department,
          bio: docData?.bio,
          googleLinked: true,
          mustChangePassword: docData?.mustChangePassword
        };

        const tokenStr = await fbUser.getIdToken();
        if (typeof window !== "undefined") {
          localStorage.setItem("sapc_token", tokenStr);
          localStorage.setItem("sapc_custom_profile", JSON.stringify(profile));
          localStorage.setItem("sapc_user", JSON.stringify(profile));
        }
        setSessionCookie(role, profile.full_name);
        await syncCustomClaims(fbUser, role);

        setUser(profile);
        setToken(tokenStr);
        setServerError(null);
        return { user: profile, isNewUser: false };
      }
      return null;
    } catch (err: any) {
      console.warn("Google Sign-In notice:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const linkGoogleAccount = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error("No active user session found.");
    try {
      const res = await linkWithPopup(auth.currentUser, googleProvider);
      if (res?.user && db) {
        await setDoc(doc(db, "users", res.user.uid), {
          googleLinked: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      setUser(prev => prev ? { ...prev, googleLinked: true } : null);
    } catch (err: any) {
      console.error("Link Google error:", err);
      throw err;
    }
  };

  const unlinkGoogleAccount = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error("No active user session found.");
    try {
      await unlink(auth.currentUser, "google.com");
      if (db) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          googleLinked: false,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      setUser(prev => prev ? { ...prev, googleLinked: false } : null);
    } catch (err: any) {
      console.error("Unlink Google error:", err);
      throw err;
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
          await setDoc(doc(db, "users", auth.currentUser.uid), sanitizeFirestorePayload({
            ...updates,
            updatedAt: serverTimestamp()
          }), { merge: true });
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
    // GAP-04: Clear the middleware session cookie
    clearSessionCookie();
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
        // A genuine Firebase Auth session exists — restore it from Firestore
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : null;
          const customSaved = typeof window !== "undefined" ? localStorage.getItem("sapc_custom_profile") : null;
          const parsed = customSaved ? JSON.parse(customSaved) : null;

          const avatar = getPersistedAvatar(fbUser.email, parsed?.avatar_url || userData?.avatar_url || fbUser.photoURL || null);

          const emailLower = (fbUser.email || "").toLowerCase();
          const inferredRole: RoleType = 
            emailLower.includes("admin@") || emailLower === "admin" ? "admin" :
            emailLower.includes("counselor@") ? "guidance_counselor" :
            emailLower.includes("teacher@") ? "teacher" :
            emailLower.includes("parent@") ? "parent" : "student";
          const resolvedRole = (userData?.role || parsed?.role || inferredRole) as RoleType;

          const lrn = userData?.lrn || userData?.metadata?.lrn || parsed?.lrn || null;
          const linked_lrns = userData?.linked_lrns || (userData?.metadata?.childLrn ? [userData.metadata.childLrn] : (parsed?.linked_lrns || []));

          // Resolve student_id accurately: do not blindly default to 1!
          let studentId: number | null = userData?.student_id || parsed?.student_id || null;
          if (!studentId && resolvedRole === "student") {
            const studentRoster = typeof window !== "undefined" ? getActiveStudentDataset() : [];
            if (lrn) {
              const match = studentRoster.find(s => String(s.lrn).trim() === String(lrn).trim());
              if (match) studentId = match.id;
            }
            if (!studentId && emailLower) {
              const match = studentRoster.find(s => s.email && s.email.toLowerCase() === emailLower);
              if (match) studentId = match.id;
            }
            // Only institutional demo student account maps to student #1
            if (!studentId && emailLower === "student@sapc.edu.ph") {
              studentId = 1;
            }
          }
          if (!studentId && resolvedRole === "parent" && emailLower === "parent@sapc.edu.ph") {
            studentId = 1;
          }

          const restoredUser: UserProfile = {
            id: studentId || (resolvedRole === "student" && emailLower === "student@sapc.edu.ph" ? 1 : Date.now()),
            email: fbUser.email || "",
            full_name: userData?.name || userData?.displayName || userData?.full_name || parsed?.full_name || fbUser.displayName || (resolvedRole === "admin" ? "Dr. Remedios Santos, Ed.D." : fbUser.email?.split("@")[0]) || "Authenticated User",
            role: resolvedRole,
            student_id: studentId,
            lrn: lrn || undefined,
            linked_lrns: linked_lrns,
            section: userData?.section || parsed?.section,
            grade_level: userData?.grade_level || parsed?.grade_level,
            department: userData?.department || parsed?.department,
            phone: userData?.phone || parsed?.phone,
            guardian_name: userData?.guardian_name || parsed?.guardian_name,
            guardian_contact: userData?.guardian_contact || parsed?.guardian_contact,
            bio: userData?.bio || parsed?.bio,
            mustChangePassword: userData?.mustChangePassword,
            googleLinked: userData?.googleLinked,
            firebaseUid: fbUser.uid,
            avatar_url: avatar
          };

          const tokenStr = await fbUser.getIdToken();
          setToken(tokenStr);
          setUser(restoredUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("sapc_token", tokenStr);
            localStorage.setItem("sapc_custom_profile", JSON.stringify(restoredUser));
            localStorage.setItem("sapc_user", JSON.stringify(restoredUser));
          }
          // GAP-04: Ensure session cookie matches restored role for middleware
          setSessionCookie(resolvedRole, restoredUser.full_name);
          // Ensure token has up-to-date role claims in the background
          syncCustomClaims(fbUser, restoredUser.role).catch(() => {});
          setIsLoading(false);
        } catch (err) {
          console.warn("Firestore session restore notice:", err);
          setIsLoading(false);
        }
      } else {
        // No active Firebase Auth session: clear stale state
        setUser(null);
        setToken(null);
        clearSessionCookie();
        if (typeof window !== "undefined") {
          localStorage.removeItem("sapc_token");
          localStorage.removeItem("sapc_custom_profile");
          localStorage.removeItem("sapc_user");
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
        linkGoogleAccount,
        unlinkGoogleAccount,
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
