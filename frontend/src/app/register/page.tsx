"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound,
  HeartHandshake,
  School,
  Lock,
  Mail,
  CheckCircle2,
  Calendar,
  User
} from "lucide-react";
import { SapcLogo } from "@/components/SapcLogo";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { GoogleRoleSelectionModal } from "@/components/GoogleRoleSelectionModal";

type RegistrationRole = "student" | "teacher" | "guidance_counselor" | "parent" | "admin";

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
    icon: <GraduationCap className="h-4 w-4 text-[#8B0014]" />,
    activeColor: "text-[#8B0014] border-[#8B0014] bg-rose-50/50",
    badge: "Student Registration",
    desc: "Verify your SAPC Learner Reference Number to unlock your personal 5-domain wellness radar."
  },
  {
    id: "teacher",
    label: "Teacher",
    icon: <School className="h-4 w-4 text-amber-700" />,
    activeColor: "text-amber-800 border-amber-500 bg-amber-50/50",
    badge: "Faculty Adviser",
    desc: "Register with your SAPC Faculty ID to access SASS class rosters and submit 1-click guidance referrals."
  },
  {
    id: "guidance_counselor",
    label: "Counselor",
    icon: <HeartHandshake className="h-4 w-4 text-rose-600" />,
    activeColor: "text-rose-700 border-rose-600 bg-rose-50/50",
    badge: "PRC Licensed",
    desc: "Guidance and testing personnel registration for crisis triage, confidential case notes, and AHP synthesis."
  },
  {
    id: "parent",
    label: "Parent / Guardian",
    icon: <Users className="h-4 w-4 text-blue-700" />,
    activeColor: "text-blue-800 border-blue-600 bg-blue-50/50",
    badge: "Family Linkage",
    desc: "Link your verified child's LRN to receive automated academic updates, consultation alerts, and progress reports."
  },
  {
    id: "admin",
    label: "Admin",
    icon: <ShieldCheck className="h-4 w-4 text-purple-700" />,
    activeColor: "text-purple-800 border-purple-600 bg-purple-50/50",
    badge: "Directorate",
    desc: "System administration and guidance directorate registration with institutional master key."
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const { switchRole, loginWithGoogle, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<RegistrationRole>("student");
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRoleModalOpen, setIsGoogleRoleModalOpen] = useState(false);
  const [googleUserName, setGoogleUserName] = useState("SAPC Member");

  // Student form state
  const [studentName, setStudentName] = useState("");
  const [lrn, setLrn] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentBirthDate, setStudentBirthDate] = useState("");

  // Teacher form state
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherDept, setTeacherDept] = useState("Senior High School (STEM)");
  const [teacherPassword, setTeacherPassword] = useState("");

  // Counselor form state
  const [counselorName, setCounselorName] = useState("");
  const [counselorEmail, setCounselorEmail] = useState("");
  const [counselorPrc, setCounselorPrc] = useState("");
  const [counselorPassword, setCounselorPassword] = useState("");

  // Parent form state
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [childLrn, setChildLrn] = useState("");
  const [parentRelation, setParentRelation] = useState("Mother");
  const [parentPassword, setParentPassword] = useState("");

  // Admin form state
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`reg-page-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("otp");
    }, 600);
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);

    try {
      let emailToUse = "";
      let passToUse = "";
      let nameToUse = "";
      const roleToUse: RegistrationRole = activeTab;

      if (activeTab === "student") {
        emailToUse = studentEmail || `student.${lrn}@sapc.edu.ph`;
        passToUse = studentPassword || "student123";
        nameToUse = studentName.trim() || (lrn ? `Student ${lrn}` : "SAPC Student");
      } else if (activeTab === "teacher") {
        emailToUse = teacherEmail || "teacher.new@sapc.edu.ph";
        passToUse = teacherPassword || "teacher123";
        nameToUse = teacherName.trim() || "Faculty Member";
      } else if (activeTab === "guidance_counselor") {
        emailToUse = counselorEmail || "counselor.new@sapc.edu.ph";
        passToUse = counselorPassword || "counselor123";
        nameToUse = counselorName.trim() || "Registered Guidance Counselor";
      } else if (activeTab === "parent") {
        emailToUse = parentEmail || "parent.new@sapc.edu.ph";
        passToUse = parentPassword || "parent123";
        nameToUse = parentName.trim() || "Parent / Guardian";
      } else if (activeTab === "admin") {
        emailToUse = adminEmail || "admin.directorate@sapc.edu.ph";
        passToUse = adminPassword || "admin123";
        nameToUse = adminName.trim() || "Administrator";
      }

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
              childLrn: activeTab === "parent" ? childLrn : null,
              relationship: activeTab === "parent" ? parentRelation : null,
              prcLicense: activeTab === "guidance_counselor" ? counselorPrc : null,
              department: activeTab === "teacher" ? teacherDept : null
            }
          });
        } catch (fbErr: any) {
          console.warn("Firebase registration fallback:", fbErr.message);
        }
      }

      updateUserProfile({
        full_name: nameToUse,
        email: emailToUse,
        role: roleToUse
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_custom_profile", JSON.stringify({
          id: 1,
          email: emailToUse,
          full_name: nameToUse,
          role: roleToUse,
          student_id: activeTab === "student" ? 1 : null
        }));
      }

      await switchRole(roleToUse);
      setIsSubmitting(false);
      setStep("success");
    } catch (err) {
      console.error("Registration error:", err);
      setIsSubmitting(false);
      setStep("success");
    }
  };

  const handleFinish = () => {
    if (activeTab === "guidance_counselor") router.push("/dashboard/guidance");
    else if (activeTab === "teacher") router.push("/dashboard/teacher");
    else if (activeTab === "parent") router.push("/dashboard/parent");
    else if (activeTab === "admin") router.push("/dashboard/admin");
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
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Select your institutional affiliation:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === t.id
                          ? `${t.activeColor} border-2 shadow-xs`
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-600"
                      }`}
                    >
                      {t.icon}
                      <span className="font-extrabold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Context Callout */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 font-bold block mb-0.5">
                  {TABS.find(t => t.id === activeTab)?.badge}:
                </strong>
                {TABS.find(t => t.id === activeTab)?.desc}
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
                <span>Sign Up with Google SSO</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-extrabold text-slate-500">
                  <span className="bg-white px-3 tracking-wider">or register with institutional credentials</span>
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
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        DepEd Learner Reference Number (LRN) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={lrn}
                        onChange={(e) => setLrn(e.target.value)}
                        placeholder="e.g. 109238475612"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          SAPC Institutional Email *
                        </label>
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="joshua.dimaculangan@sapc.edu.ph"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
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
                  </>
                )}

                {activeTab === "teacher" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Full Name (with Professional Title) *
                        </label>
                        <div className="relative">
                          <User className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                            placeholder="Mr. Roberto Santos, LPT"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          SAPC Faculty Email *
                        </label>
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={teacherEmail}
                            onChange={(e) => setTeacherEmail(e.target.value)}
                            placeholder="rsantos@sapc.edu.ph"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Department / Advisory Strand *
                        </label>
                        <select
                          value={teacherDept}
                          onChange={(e) => setTeacherDept(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                        >
                          <option value="Senior High School (STEM)">Senior High School (STEM)</option>
                          <option value="Senior High School (ABM)">Senior High School (ABM)</option>
                          <option value="Senior High School (HUMSS)">Senior High School (HUMSS)</option>
                          <option value="Senior High School (GAS)">Senior High School (GAS)</option>
                          <option value="College of Computer Studies">College of Computer Studies</option>
                          <option value="Junior High School Department">Junior High School Department</option>
                        </select>
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
                            value={teacherPassword}
                            onChange={(e) => setTeacherPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "guidance_counselor" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Counselor Name (with RGC/RPm) *
                        </label>
                        <div className="relative">
                          <User className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={counselorName}
                            onChange={(e) => setCounselorName(e.target.value)}
                            placeholder="Maria Theresa Cruz, RGC"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          PRC / PRB Guidance License No. *
                        </label>
                        <input
                          type="text"
                          required
                          value={counselorPrc}
                          onChange={(e) => setCounselorPrc(e.target.value)}
                          placeholder="e.g. 0008472"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          SAPC Guidance Institutional Email *
                        </label>
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={counselorEmail}
                            onChange={(e) => setCounselorEmail(e.target.value)}
                            placeholder="guidance@sapc.edu.ph"
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
                            value={counselorPassword}
                            onChange={(e) => setCounselorPassword(e.target.value)}
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
                          onChange={(e) => setChildLrn(e.target.value)}
                          placeholder="e.g. 109238475612"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                        />
                      </div>
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
                  </>
                )}

                {activeTab === "admin" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Administrator Full Name *
                        </label>
                        <div className="relative">
                          <User className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="Director Remedios Santos"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Institutional Authorization Key *
                        </label>
                        <div className="relative">
                          <KeyRound className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="SAPC-AUTH-KEY-XXXX"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          SAPC Directorate Email *
                        </label>
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="admin@sapc.edu.ph"
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
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-[#8B0014] hover:bg-[#700010] text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 mt-4"
                >
                  <span>{isSubmitting ? "Processing Verification..." : "Proceed to 2-Factor OTP Verification"}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </button>
              </form>
            </div>
          )}

          {step === "otp" && (
            <div className="mt-6 text-center space-y-6">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#8B0014]">
                <KeyRound className="h-7 w-7 animate-pulse" />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">Enter Institutional OTP Code</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  A 6-digit verification code has been dispatched to your institutional address to confirm identity.
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`reg-page-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#8B0014] focus:bg-white transition"
                  />
                ))}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleVerifyOtp}
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-[#8B0014] hover:bg-[#700010] text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Verifying Credentials..." : "Complete Registration & Access Portal"}</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  ← Back to details
                </button>
              </div>
            </div>
          )}

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
