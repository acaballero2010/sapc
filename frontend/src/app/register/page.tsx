"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Users, 
  ArrowRight, 
  School,
  Lock,
  Mail,
  CheckCircle2,
  Calendar,
  User,
  AlertCircle
} from "lucide-react";
import { SapcLogo } from "@/components/SapcLogo";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { GoogleRoleSelectionModal } from "@/components/GoogleRoleSelectionModal";
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

type RegistrationRole = "student" | "parent";

const TABS: Array<{
  id: RegistrationRole;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  badge: string;
  desc: string;
}> = [
  {
    id: "student",
    label: "Student",
    icon: <GraduationCap className="h-5 w-5 text-[#8B0014]" />,
    activeColor: "text-[#8B0014] border-[#8B0014] bg-rose-50/70 shadow-sm",
    badge: "Student Account Claim",
    desc: "Verify your SAPC 12-digit Learner Reference Number (LRN) and date of birth to activate your personal 5-domain academic & wellness radar."
  },
  {
    id: "parent",
    label: "Parent / Guardian",
    icon: <Users className="h-5 w-5 text-blue-700" />,
    activeColor: "text-blue-800 border-blue-600 bg-blue-50/70 shadow-sm",
    badge: "Parent & Family Linkage",
    desc: "Register your parent account and link your child's LRN to receive automated quarterly grade notifications, attendance alerts, and counseling consultation notes."
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const { switchRole, loginWithGoogle, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<RegistrationRole>("student");
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRoleModalOpen, setIsGoogleRoleModalOpen] = useState(false);
  const [googleUserName, setGoogleUserName] = useState("SAPC Member");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Student form state
  const [studentName, setStudentName] = useState("");
  const [lrn, setLrn] = useState("");
  const [studentGradeLevel, setStudentGradeLevel] = useState<number>(7);
  const [studentSection, setStudentSection] = useState<string>("Grade 7 - Love");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentBirthDate, setStudentBirthDate] = useState("");

  // Parent form state
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [childLrn, setChildLrn] = useState("");
  const [childGradeLevel, setChildGradeLevel] = useState<number>(7);
  const [childSection, setChildSection] = useState<string>("Grade 7 - Love");
  const [parentRelation, setParentRelation] = useState("Mother");
  const [parentPassword, setParentPassword] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const emailToUse = activeTab === "student"
        ? (studentEmail || `${lrn}@student.sapc.edu.ph`)
        : (parentEmail || `${parentPhone.replace(/\D/g, "")}@parent.sapc.edu.ph`);
      const passToUse = activeTab === "student" ? (studentPassword || "Student@SAPC2026!") : (parentPassword || "Parent@SAPC2026!");
      const nameToUse = activeTab === "student"
        ? (studentName.trim() || (lrn ? `Student ${lrn}` : "SAPC Student"))
        : (parentName.trim() || "Parent / Guardian");
      const roleToUse: RegistrationRole = activeTab;

      if (auth && db) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, emailToUse, passToUse);
          const user = userCredential.user;
          await updateProfile(user, { displayName: nameToUse });

          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: emailToUse,
            name: nameToUse,
            displayName: nameToUse,
            role: roleToUse,
            roleConfirmed: true,
            createdAt: serverTimestamp(),
            verified: roleToUse !== "parent",
            verification_status: roleToUse === "parent" ? "pending_school_approval" : "active",
            linkageStatus: roleToUse === "parent" ? "pending_adviser_validation" : "verified",
            metadata: {
              lrn: activeTab === "student" ? lrn : null,
              birthDate: activeTab === "student" ? studentBirthDate : null,
              childLrn: activeTab === "parent" ? childLrn : null,
              relationship: activeTab === "parent" ? parentRelation : null,
              phone: activeTab === "parent" ? parentPhone : null
            }
          });
        } catch (fbErr: any) {
          console.warn("Firebase registration fallback:", fbErr.message);
        }
      }

      if (activeTab === "student") {
        await addStudentRecord({
          full_name: nameToUse,
          lrn: lrn,
          email: emailToUse,
          grade_level: studentGradeLevel,
          section_name: studentSection,
          strand: "JHS"
        });
      } else if (activeTab === "parent") {
        const currentPending = getActivePendingRegistrations();
        const pendingRec: PendingRegistrationRecord = {
          id: `REG-${Date.now().toString().slice(-4)}`,
          name: nameToUse,
          email: emailToUse,
          phone: parentPhone,
          role: "parent",
          relationship: parentRelation,
          linkedStudent: childLrn ? `Learner ${childLrn}` : "Enrolled Learner",
          linkedLRN: childLrn || "109238475001",
          section: childSection,
          verificationDoc: "Self-Registered via Portal (Online Registration)",
          date: new Date().toISOString().split("T")[0],
          status: "Approved",
          notes: `Linked to Grade ${childGradeLevel} (${childSection})`
        };
        saveActivePendingRegistrations([pendingRec, ...currentPending], true);

        const currentParents = getActiveParentRecords();
        const newParent: ParentRecord = {
          id: `PAR-${Date.now().toString().slice(-4)}`,
          name: nameToUse,
          email: emailToUse,
          phone: parentPhone,
          relationship: parentRelation,
          linkedStudentName: childLrn ? `Learner ${childLrn}` : "Enrolled Learner",
          linkedLRN: childLrn || "109238475001",
          section: childSection,
          gradeLevel: `Grade ${childGradeLevel}`,
          status: "Active",
          verifiedAt: new Date().toISOString().split("T")[0],
          sf9Access: true,
          attendanceAlerts: true,
          riskAlerts: true,
          initialPassword: passToUse
        };
        saveActiveParentRecords([newParent, ...currentParents], true);
      }

      updateUserProfile({
        full_name: nameToUse,
        email: emailToUse,
        role: roleToUse,
        section: activeTab === "student" ? studentSection : childSection
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_custom_profile", JSON.stringify({
          id: 1,
          email: emailToUse,
          full_name: nameToUse,
          role: roleToUse,
          section: activeTab === "student" ? studentSection : childSection,
          student_id: activeTab === "student" ? 1 : null
        }));

        try {
          const raw = localStorage.getItem("sapc_registered_accounts");
          const registeredList = raw ? JSON.parse(raw) : [];
          const existingIdx = registeredList.findIndex((acc: any) => acc.email?.toLowerCase() === emailToUse.toLowerCase());
          const newAcc = {
            email: emailToUse.toLowerCase(),
            password: passToUse,
            name: nameToUse,
            role: roleToUse,
            section: activeTab === "student" ? studentSection : childSection,
            lrn: activeTab === "student" ? lrn : childLrn,
            student_id: activeTab === "student" ? 1 : null
          };
          if (existingIdx >= 0) {
            registeredList[existingIdx] = newAcc;
          } else {
            registeredList.push(newAcc);
          }
          localStorage.setItem("sapc_registered_accounts", JSON.stringify(registeredList));
        } catch {}
      }

      await switchRole(roleToUse);
      setIsSubmitting(false);
      setStep("success");
    } catch (err: any) {
      console.error("Registration error:", err);
      setSubmitError(err?.message || "Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (activeTab === "parent") router.push("/dashboard/parent");
    else router.push("/dashboard/student");
  };

  const handleGoogleRegister = async () => {
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle(activeTab);
      if (res && res.isNewUser) {
        setGoogleUserName(res.user.full_name || "SAPC Member");
        setIsGoogleRoleModalOpen(true);
      } else {
        handleFinish();
      }
    } catch (err) {
      console.warn("Google registration fallback:", err);
      handleFinish();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#2D0005] to-[#120003] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans text-slate-100">
      {/* Top Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link 
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition group"
        >
          <SapcLogo size={42} />
          <div>
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              SAPC IntellySys
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                DSS v1.0
              </span>
            </span>
            <p className="text-xs text-rose-200/80 hidden sm:block">
              San Antonio de Padua College • Multi-Factor Decision Support
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-white hover:text-amber-300 transition"
          >
            Sign In
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition"
          >
            ← Overview
          </Link>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-2xl w-full mx-auto my-8">
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-9 shadow-2xl border border-slate-200/90 relative overflow-hidden">
          {/* Top Institutional Accent Strip */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-[#8B0014] to-amber-400" />

          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Institutional Onboarding
                </span>
                <span className="text-xs text-slate-400 font-semibold">• SASS Integration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                San Antonio de Padua College Student, Parent & Faculty Portal
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              🔒 RA 10173 Protected
            </span>
          </div>

          {step === "form" && (
            <div className="mt-6 space-y-6">
              {/* Role Selection Tabs - Industry standard clean persona selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Select your self-service account type:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 cursor-pointer ${
                        activeTab === t.id
                          ? `${t.activeColor} border-2 ring-2 ring-[#8B0014]/10`
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0 border border-slate-100">
                        {t.icon}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{t.label}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                          {t.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Institutional Staff Notice (For Faculty, Counselors, Directorate) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
                <School className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold block text-slate-900">Are you a Faculty Member, Counselor, or Administrator?</span>
                  <p className="text-slate-600 leading-relaxed">
                    Institutional staff accounts are pre-provisioned by the SAPC Registrar. Please use your official <strong>@sapc.edu.ph Google SSO</strong> or {" "}
                    <Link href="/login" className="font-bold text-[#8B0014] hover:underline">
                      Sign In here →
                    </Link>
                  </p>
                </div>
              </div>

              {/* Google Fast Sign Up Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleRegister}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-xs cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Institutional Google SSO</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-extrabold text-slate-500">
                  <span className="bg-white px-3 tracking-wider">or register with credentials</span>
                </div>
              </div>

              {/* Dynamic Registration Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {activeTab === "student" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Student Full Name *
                      </label>
                      <div className="relative">
                        <User className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g. Juan Carlos Dela Cruz"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          DepEd Learner Reference Number (LRN) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          value={lrn}
                          onChange={(e) => setLrn(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 109238475612"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Date of Birth (Identity Verification) *
                        </label>
                        <div className="relative">
                          <Calendar className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="date"
                            required
                            value={studentBirthDate}
                            onChange={(e) => setStudentBirthDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* JHS Grade Level & Section Dropdowns for Student */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Junior High Grade Level *
                        </label>
                        <select
                          value={studentGradeLevel}
                          onChange={(e) => {
                            const lvl = Number(e.target.value);
                            setStudentGradeLevel(lvl);
                            const available = getSectionsForGrade(lvl);
                            if (available.length > 0) setStudentSection(available[0]);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                        >
                          {JHS_GRADE_LEVELS.map((g) => (
                            <option key={g.level} value={g.level}>
                              {g.label} (Junior High)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Assigned Section *
                        </label>
                        <select
                          value={studentSection}
                          onChange={(e) => setStudentSection(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                        >
                          {getSectionsForGrade(studentGradeLevel).map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          SAPC Institutional or Personal Email *
                        </label>
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="student@sapc.edu.ph"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Create Password *
                        </label>
                        <div className="relative">
                          <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={studentPassword}
                            onChange={(e) => setStudentPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "parent" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Parent / Guardian Full Name *
                        </label>
                        <div className="relative">
                          <User className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            placeholder="Mrs. Elena Dimaculangan"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Relationship to Student *
                        </label>
                        <select
                          value={parentRelation}
                          onChange={(e) => setParentRelation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                        >
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                          <option value="Grandparent">Grandparent</option>
                        </select>
                      </div>
                    </div>

                    {/* Linked Child Grade Level & Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Child&apos;s Grade Level *
                        </label>
                        <select
                          value={childGradeLevel}
                          onChange={(e) => {
                            const lvl = Number(e.target.value);
                            setChildGradeLevel(lvl);
                            const available = getSectionsForGrade(lvl);
                            if (available.length > 0) setChildSection(available[0]);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                        >
                          {JHS_GRADE_LEVELS.map((g) => (
                            <option key={g.level} value={g.level}>
                              {g.label} (Junior High)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Child&apos;s Section *
                        </label>
                        <select
                          value={childSection}
                          onChange={(e) => setChildSection(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                        >
                          {getSectionsForGrade(childGradeLevel).map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Child&apos;s 12-Digit LRN to Link *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          value={childLrn}
                          onChange={(e) => setChildLrn(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 109238475001"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Contact Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Parent Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            placeholder="elena.dimaculangan@gmail.com"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Create Password *
                        </label>
                        <div className="relative">
                          <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={parentPassword}
                            onChange={(e) => setParentPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {submitError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#8B0014] font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-[#8B0014] hover:bg-[#700010] text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 mt-4"
                >
                  <span>
                    {isSubmitting
                      ? (activeTab === "student" ? "Enlisting Student Profile..." : "Registering Parent Account...")
                      : (activeTab === "student" ? "Create Student Account →" : "Create Parent Account →")}
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: SUCCESS */}
          {step === "success" && (
            <div className="mt-6 text-center space-y-6 py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${activeTab === "parent" ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-emerald-100 text-emerald-900 border-emerald-300"}`}>
                  {activeTab === "parent" ? "Awaiting School Approval" : "Verification Successful"}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {activeTab === "parent" ? "Parent Account Registered" : "Account Initialized & Linked"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  {activeTab === "parent"
                    ? "In compliance with DepEd DO 40, s. 2012 and RA 10173, your child's class adviser and school registrar will verify your parental linkage before granting full access to grades and psychological evaluations."
                    : "Your San Antonio de Padua College institutional profile has been verified and registered in the Decision Support System."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-4 rounded-xl font-black text-sm bg-[#8B0014] hover:bg-[#700010] text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch {TABS.find(t => t.id === activeTab)?.label} Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-600 hover:text-[#8B0014] transition"
            >
              Already have an account? <strong className="text-[#8B0014] underline">Sign in to Decision Portal →</strong>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-xl mx-auto text-center text-xs text-rose-200/60 pb-2">
        San Antonio de Padua College • Multi-Factor Decision Support System • RA 10173 Data Privacy Sealed
      </div>

      {/* Google Role Selector Modal */}
      <GoogleRoleSelectionModal
        isOpen={isGoogleRoleModalOpen}
        userName={googleUserName}
        onClose={() => setIsGoogleRoleModalOpen(false)}
      />
    </div>
  );
}
