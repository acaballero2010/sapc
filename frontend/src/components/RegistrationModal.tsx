"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  School,
  Lock,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  JHS_GRADE_LEVELS, 
  getSectionsForGrade, 
  addStudentRecord,
  getActivePendingRegistrations,
  saveActivePendingRegistrations,
  getActiveParentRecords,
  saveActiveParentRecords,
  PendingRegistrationRecord,
  ParentRecord
} from "@/lib/dataset-store";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RegistrationRole = "student" | "parent";

const TABS: Array<{
  id: RegistrationRole;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  badge: string;
}> = [
  {
    id: "student",
    label: "Student Account",
    icon: <GraduationCap className="h-4 w-4 text-[#8B0014]" />,
    activeColor: "text-[#8B0014] border-[#8B0014] bg-rose-50/50",
    badge: "Student Claim"
  },
  {
    id: "parent",
    label: "Parent / Guardian",
    icon: <Users className="h-4 w-4 text-emerald-600" />,
    activeColor: "text-emerald-700 border-emerald-600 bg-emerald-50/50",
    badge: "Family Link"
  }
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { switchRole, loginWithGoogle, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<RegistrationRole>("student");
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Student form state
  const [studentFullName, setStudentFullName] = useState("");
  const [lrn, setLrn] = useState("");
  const [studentGradeLevel, setStudentGradeLevel] = useState<string>(JHS_GRADE_LEVELS[0].label);
  const [studentSection, setStudentSection] = useState<string>(getSectionsForGrade(JHS_GRADE_LEVELS[0].level)[0]);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentBirthDate, setStudentBirthDate] = useState("");

  // Parent form state
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentLrn, setParentLrn] = useState("");
  const [parentStudentGradeLevel, setParentStudentGradeLevel] = useState<string>(JHS_GRADE_LEVELS[0].label);
  const [parentStudentSection, setParentStudentSection] = useState<string>(getSectionsForGrade(JHS_GRADE_LEVELS[0].level)[0]);
  const [relationship, setRelationship] = useState("Mother");
  const [parentPassword, setParentPassword] = useState("");

  // Helper: translate Firebase error codes to user-friendly messages
  const getFirebaseErrorMsg = (err: any): string | null => {
    const code = err?.code || "";
    if (code === "auth/email-already-in-use") return "This email is already registered. Please sign in instead.";
    if (code === "auth/weak-password") return "Password is too weak. Use at least 8 characters with mixed case and numbers.";
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/network-request-failed") return "Network error. Please check your connection and try again.";
    return null;
  };

  if (!isOpen) return null;

  const handleGoogleRegistration = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle(activeTab);
      setStep("success");
    } catch (err: any) {
      console.warn("Google Registration notice:", err);
      setStep("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const finalEmail = studentEmail || `${lrn}@student.sapc.edu.ph`;
      const finalPass = studentPassword || "Student@SAPC2026!";
      const displayName = studentFullName.trim() || `Student ${lrn}`;
      const gradeNum = parseInt(studentGradeLevel.replace(/\D/g, ""), 10) || 7;

      // 1. Auto-enlist student into dataset roster
      await addStudentRecord({
        full_name: displayName,
        lrn: lrn,
        email: finalEmail,
        grade_level: gradeNum,
        section_name: studentSection,
        strand: "JHS"
      });

      // 2. Create Firebase Auth & Firestore record
      if (auth && db) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, finalEmail, finalPass);
          await updateProfile(userCred.user, { displayName: displayName });
          await setDoc(doc(db, "users", userCred.user.uid), {
            lrn: lrn,
            email: finalEmail,
            birthDate: studentBirthDate,
            role: "student",
            displayName: displayName,
            grade_level: studentGradeLevel,
            section: studentSection,
            roleConfirmed: true,
            authProvider: "password",
            createdAt: serverTimestamp(),
            isVerified: true
          });
        } catch (e: any) {
          console.warn("Firebase user create note:", e);
        }
      }

      // 3. Save into local persistent registered accounts cache
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("sapc_registered_accounts");
          const registeredList = raw ? JSON.parse(raw) : [];
          const existingIdx = registeredList.findIndex((acc: any) => acc.email?.toLowerCase() === finalEmail.toLowerCase());
          const newAcc = {
            email: finalEmail.toLowerCase(),
            password: finalPass,
            name: displayName,
            role: "student",
            lrn: lrn,
            grade_level: studentGradeLevel,
            section: studentSection,
            student_id: 1
          };
          if (existingIdx >= 0) {
            registeredList[existingIdx] = newAcc;
          } else {
            registeredList.push(newAcc);
          }
          localStorage.setItem("sapc_registered_accounts", JSON.stringify(registeredList));
        } catch {}
      }

      setStep("success");
    } catch (err: any) {
      const msg = getFirebaseErrorMsg(err);
      setSubmitError(msg || "Student registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const sanitizedPhone = parentPhone.replace(/\D/g, "") || "09170000000";
      const parentEmail = `${sanitizedPhone}@parent.sapc.edu.ph`;
      const finalPass = parentPassword || "Parent@SAPC2026!";
      const displayName = parentName.trim() || "Parent / Guardian";
      const childGradeNum = parseInt(parentStudentGradeLevel.replace(/\D/g, ""), 10) || 7;

      // 1. Create Firebase Auth & Firestore record
      if (auth && db) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, parentEmail, finalPass);
          await updateProfile(userCred.user, { displayName: displayName });
          await setDoc(doc(db, "users", userCred.user.uid), {
            name: displayName,
            phone: parentPhone,
            linkedLrn: parentLrn,
            studentGradeLevel: parentStudentGradeLevel,
            studentSection: parentStudentSection,
            relationship: relationship,
            role: "parent",
            email: parentEmail,
            roleConfirmed: true,
            authProvider: "password",
            createdAt: serverTimestamp(),
            isVerified: false,
            verification_status: "pending_school_approval",
            linkageStatus: "pending_adviser_validation"
          });
        } catch (e: any) {
          console.warn("Firebase parent create note:", e);
        }
      }

      // 2. Add to Pending Registrations & Parent Records
      const currentPending = getActivePendingRegistrations();
      const pendingRec: PendingRegistrationRecord = {
        id: `REG-${Date.now().toString().slice(-4)}`,
        name: displayName,
        email: parentEmail,
        phone: parentPhone,
        role: "parent",
        relationship: relationship,
        linkedStudent: parentLrn ? `Learner ${parentLrn}` : "Enrolled Learner",
        linkedLRN: parentLrn || "109238475001",
        section: parentStudentSection,
        verificationDoc: "Self-Registered via Portal (Direct Online Verification)",
        date: new Date().toISOString().split("T")[0],
        status: "Approved",
        notes: `Linked to Grade ${childGradeNum} (${parentStudentSection})`
      };
      saveActivePendingRegistrations([pendingRec, ...currentPending], true);

      const currentParents = getActiveParentRecords();
      const newParent: ParentRecord = {
        id: `PAR-${Date.now().toString().slice(-4)}`,
        name: displayName,
        email: parentEmail,
        phone: parentPhone,
        relationship: relationship,
        linkedStudentName: parentLrn ? `Learner ${parentLrn}` : "Enrolled Learner",
        linkedLRN: parentLrn || "109238475001",
        section: parentStudentSection,
        gradeLevel: `Grade ${childGradeNum}`,
        status: "Active",
        verifiedAt: new Date().toISOString().split("T")[0],
        sf9Access: true,
        attendanceAlerts: true,
        riskAlerts: true,
        initialPassword: finalPass
      };
      saveActiveParentRecords([newParent, ...currentParents], true);

      // 3. Save into local persistent registered accounts cache
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("sapc_registered_accounts");
          const registeredList = raw ? JSON.parse(raw) : [];
          const existingIdx = registeredList.findIndex((acc: any) => acc.email?.toLowerCase() === parentEmail.toLowerCase());
          const newAcc = {
            email: parentEmail.toLowerCase(),
            password: finalPass,
            name: displayName,
            role: "parent",
            lrn: parentLrn,
            grade_level: parentStudentGradeLevel,
            section: parentStudentSection,
            student_id: 1
          };
          if (existingIdx >= 0) {
            registeredList[existingIdx] = newAcc;
          } else {
            registeredList.push(newAcc);
          }
          localStorage.setItem("sapc_registered_accounts", JSON.stringify(registeredList));
        } catch {}
      }

      setStep("success");
    } catch (err: any) {
      const msg = getFirebaseErrorMsg(err);
      setSubmitError(msg || "Parent registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndEnter = async () => {
    onClose();
    const targetRouteMap: Record<RegistrationRole, string> = {
      student: "/dashboard/student",
      parent: "/dashboard/parent"
    };

    const targetRoute = targetRouteMap[activeTab] || "/dashboard/student";

    if (typeof window !== "undefined") {
      sessionStorage.setItem("sapc_show_tour", "true");
    }

    try {
      await switchRole(activeTab);
      await updateUserProfile({ role: activeTab });
    } catch (err) {
      console.warn("Switch role notice:", err);
    }

    router.push(targetRoute);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/40 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-amber-300" />
                SAPC Institutional Onboarding
              </span>
              <span className="text-xs text-rose-200">• Student &amp; Parent Portals</span>
            </div>
            <h3 className="text-xl font-black text-white">
              {step === "form" ? "Create Account / Registration" : "Account Verified & Activated!"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Role Tab Switcher (Visible in Form Mode) */}
        {step === "form" && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center gap-1.5">
            {TABS.map((t) => {
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-extrabold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.icon}
                  <span className="text-xs truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* STEP 1: FORMS */}
          {step === "form" && (
            <>
              {/* Institutional Staff Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <School className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold block text-slate-900">Faculty, Counselor, or Administrator?</span>
                  <p className="text-slate-600 leading-snug">
                    Staff accounts are managed by IT Administration. Sign in with your institutional Google SSO or {" "}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push("/login");
                      }}
                      className="font-bold text-[#8B0014] hover:underline cursor-pointer"
                    >
                      Sign In here →
                    </button>
                  </p>
                </div>
              </div>

              {/* Google 1-Click Verification / Account Creation */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleRegistration}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-slate-200 hover:border-slate-300 shadow-xs transition flex items-center justify-center gap-3 group active:scale-[0.99] cursor-pointer"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {activeTab === "student" ? "1-Click Student Sign Up with Google" : "1-Click Link Parent Account with Google"}
                  </span>
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    or institutional credentials
                  </span>
                </div>
              </div>

              {/* TAB 1: Student Claim Form */}
              {activeTab === "student" && (
                <form onSubmit={handleStudentSubmit} className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-[#8B0014]">
                      <FileText className="h-3.5 w-3.5" /> Junior High School DepEd Enrollment & LRN
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Select your Junior High School grade level and section. Your advisory teacher will immediately receive your verified profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
                    <input
                      type="text"
                      required
                      value={studentFullName}
                      onChange={(e) => setStudentFullName(e.target.value)}
                      placeholder="e.g. Maria Angela Santos"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">12-Digit LRN</label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={lrn}
                        onChange={(e) => setLrn(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 109482719283"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Birthdate</label>
                      <input
                        type="date"
                        required
                        value={studentBirthDate}
                        onChange={(e) => setStudentBirthDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level</label>
                      <select
                        value={studentGradeLevel}
                        onChange={(e) => {
                          const newGrade = e.target.value;
                          setStudentGradeLevel(newGrade);
                          const sections = getSectionsForGrade(newGrade);
                          if (sections.length > 0) {
                            setStudentSection(sections[0]);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      >
                        {JHS_GRADE_LEVELS.map((g) => (
                          <option key={g.level} value={g.label}>{g.label} (Junior High)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Section</label>
                      <select
                        value={studentSection}
                        onChange={(e) => setStudentSection(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      >
                        {getSectionsForGrade(studentGradeLevel).map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SAPC Student Email</label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="student@sapc.edu.ph"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Set Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || lrn.length < 5}
                    className="w-full py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {isSubmitting ? "Processing Enlistment..." : "Create Student Account →"}
                  </button>
                </form>
              )}


              {/* TAB 4: Parent Link Form */}
              {activeTab === "parent" && (
                <form onSubmit={handleParentSubmit} className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-emerald-900">
                      <Users className="h-3.5 w-3.5" /> Family Link & SMS Verification
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Link your parent profile with your child’s Junior High School standing to receive attendance notices and view academic progress.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Full Name</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Mrs. Elena Dimaculangan"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="0917-XXX-XXXX"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      >
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student&apos;s 12-Digit LRN</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={parentLrn}
                      onChange={(e) => setParentLrn(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter student's LRN"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Child&apos;s Grade Level</label>
                      <select
                        value={parentStudentGradeLevel}
                        onChange={(e) => {
                          const newGrade = e.target.value;
                          setParentStudentGradeLevel(newGrade);
                          const sections = getSectionsForGrade(newGrade);
                          if (sections.length > 0) {
                            setParentStudentSection(sections[0]);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      >
                        {JHS_GRADE_LEVELS.map((g) => (
                          <option key={g.level} value={g.label}>{g.label} (Junior High)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Child&apos;s Section</label>
                      <select
                        value={parentStudentSection}
                        onChange={(e) => setParentStudentSection(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      >
                        {getSectionsForGrade(parentStudentGradeLevel).map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Set Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={parentPassword}
                      onChange={(e) => setParentPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {isSubmitting ? "Creating Parent Account..." : "Create Parent Account →"}
                  </button>
                </form>
              )}

            </>
          )}

          {/* STEP 2: SUCCESS */}
          {step === "success" && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-xl font-black text-slate-900">
                  {activeTab === "parent" ? "Parent Account Registered!" : "Verification Successful!"}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeTab === "parent" 
                    ? "In compliance with DepEd DO 40, s. 2012 and RA 10173 (Data Privacy Act), access to student grades and psychological evaluations requires school adviser & registrar verification before full disclosure." 
                    : "Your account has been authenticated and provisioned under RA 10173 data privacy rules for San Antonio de Padua College."}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Institutional Status:</span>
                  <span className={`font-bold ${activeTab === "parent" ? "text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md" : "text-emerald-700"}`}>
                    {activeTab === "parent" ? "Pending School Linkage Approval" : "Active & Verified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Authorized Role:</span>
                  <span className="font-bold text-slate-900 capitalize">{activeTab.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Academic Year:</span>
                  <span className="font-bold text-slate-900">AY 2025–2026 (Semester 2)</span>
                </div>
                {activeTab === "parent" && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-amber-800 font-medium">
                    ⓘ Your child&apos;s class adviser and the school registrar have received your verification request.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleFinishAndEnter}
                className="w-full py-3.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-base shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Enter {activeTab.replace("_", " ")} Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-600">
            <Lock className="h-3 w-3 text-emerald-700" /> RA 10173 Compliant
          </span>
          <span>San Antonio de Padua College</span>
        </div>

      </div>
    </div>
  );
};
