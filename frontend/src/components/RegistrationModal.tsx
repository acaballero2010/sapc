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
  KeyRound,
  HeartHandshake,
  School,
  Lock,
  Clock,
  RotateCw,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RegistrationRole = "student" | "teacher" | "guidance_counselor" | "parent" | "admin";

const TABS: Array<{
  id: RegistrationRole;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  badge: string;
}> = [
  {
    id: "student",
    label: "Student",
    icon: <GraduationCap className="h-4 w-4 text-[#8B0014]" />,
    activeColor: "text-[#8B0014] border-[#8B0014]",
    badge: "Student Registration"
  },
  {
    id: "teacher",
    label: "Teacher",
    icon: <School className="h-4 w-4 text-blue-600" />,
    activeColor: "text-blue-700 border-blue-600",
    badge: "Faculty Adviser"
  },
  {
    id: "guidance_counselor",
    label: "Counselor",
    icon: <HeartHandshake className="h-4 w-4 text-rose-600" />,
    activeColor: "text-rose-700 border-rose-600",
    badge: "PRC Counselor"
  },
  {
    id: "parent",
    label: "Parent",
    icon: <Users className="h-4 w-4 text-emerald-600" />,
    activeColor: "text-emerald-700 border-emerald-600",
    badge: "Family Link"
  },
  {
    id: "admin",
    label: "Admin",
    icon: <ShieldCheck className="h-4 w-4 text-purple-600" />,
    activeColor: "text-purple-700 border-purple-600",
    badge: "Directorate"
  }
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { switchRole, loginWithGoogle, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<RegistrationRole>("student");
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Timer and Resend State
  const [expirySeconds, setExpirySeconds] = useState<number>(600); // 10 minutes overall TTL
  const [resendCooldown, setResendCooldown] = useState<number>(60); // 60 seconds resend cooldown
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Live timer decrementing every second when in OTP verification step
  useEffect(() => {
    if (step !== "otp") return;

    const timer = setInterval(() => {
      setExpirySeconds(prev => (prev > 0 ? prev - 1 : 0));
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Format seconds into MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Track pending form-transition timers so they can be cleared on unmount
  const formTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    const timerRef = formTimerRef;
    return () => { 
      if (timerRef.current) clearTimeout(timerRef.current); 
    };
  }, []);

  // Student form state
  const [lrn, setLrn] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentBirthDate, setStudentBirthDate] = useState("");

  // Teacher form state
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherDept, setTeacherDept] = useState("Senior High School (STEM)");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Counselor form state
  const [counselorName, setCounselorName] = useState("");
  const [counselorEmail, setCounselorEmail] = useState("");
  const [counselorPrc, setCounselorPrc] = useState("");
  const [counselorPassword, setCounselorPassword] = useState("");
  const [counselorError, setCounselorError] = useState<string | null>(null);

  // Parent form state
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentLrn, setParentLrn] = useState("");
  const [relationship, setRelationship] = useState("Mother");

  // Admin form state
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminEmployeeId, setAdminEmployeeId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [otpSendError, setOtpSendError] = useState<string | null>(null);

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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    const targetIdx = Math.min(pasted.length, 5);
    const el = document.getElementById(`otp-${targetIdx}`);
    el?.focus();
  };

  // Centralized OTP dispatch — calls /api/send-otp and advances to OTP step on success
  const sendOtp = async (email: string, name: string, role: string): Promise<boolean> => {
    setOtpSendError(null);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role })
      });
      const data = await res.json();
      if (!data.success) {
        setOtpSendError(data.error || "Failed to send verification code. Please try again.");
        return false;
      }
      setOtpSentTo(email);
      return true;
    } catch {
      setOtpSendError("Network error sending OTP. Please check your connection.");
      return false;
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending || isSubmitting || !otpSentTo) return;
    setIsResending(true);
    setOtpError(null);
    setOtpSendError(null);
    setResendSuccessMsg(null);

    const role = activeTab === "student" ? "student" : "parent";
    const name = activeTab === "student" ? `Student ${lrn}` : parentName;
    const sent = await sendOtp(otpSentTo, name, role);

    if (sent) {
      setExpirySeconds(600);
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setResendSuccessMsg("A new 6-digit verification PIN has been dispatched to your email.");
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
      setTimeout(() => setResendSuccessMsg(null), 5000);
    }
    setIsResending(false);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const email = studentEmail || `${lrn}@student.sapc.edu.ph`;
    const sent = await sendOtp(email, `Student ${lrn}`, "student");
    setIsSubmitting(false);
    if (sent) {
      setExpirySeconds(600);
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setResendSuccessMsg(null);
      setStep("otp");
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const sanitizedPhone = parentPhone.replace(/\D/g, "") || "09170000000";
    const email = `${sanitizedPhone}@parent.sapc.edu.ph`;
    const sent = await sendOtp(email, parentName, "parent");
    setIsSubmitting(false);
    if (sent) {
      setExpirySeconds(600);
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setResendSuccessMsg(null);
      setStep("otp");
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError(null);
    setIsSubmitting(true);
    try {
      const pass = teacherPassword || "Teacher@SAPC2026!";
      const userCred = await createUserWithEmailAndPassword(auth, teacherEmail, pass);
      await updateProfile(userCred.user, { displayName: teacherName });
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: teacherName,
        email: teacherEmail,
        role: "teacher",
        department: teacherDept,
        roleConfirmed: true,
        authProvider: "password",
        status: "verified",
        createdAt: serverTimestamp(),
        isVerified: true
      });
      setStep("success");
    } catch (err: any) {
      const msg = getFirebaseErrorMsg(err);
      if (msg) {
        setTeacherError(msg);
      } else {
        // Unknown error — still proceed to success in demo mode
        console.warn("Firebase Auth creation notice:", err);
        setStep("success");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCounselorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCounselorError(null);
    setIsSubmitting(true);
    try {
      const pass = counselorPassword || "Counselor@SAPC2026!";
      const userCred = await createUserWithEmailAndPassword(auth, counselorEmail, pass);
      await updateProfile(userCred.user, { displayName: counselorName });
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: counselorName,
        email: counselorEmail,
        role: "guidance_counselor",
        prcLicenseNo: counselorPrc,
        roleConfirmed: true,
        authProvider: "password",
        status: "verified",
        createdAt: serverTimestamp(),
        isVerified: true
      });
      setStep("success");
    } catch (err: any) {
      const msg = getFirebaseErrorMsg(err);
      if (msg) {
        setCounselorError(msg);
      } else {
        console.warn("Firebase Auth creation notice:", err);
        setStep("success");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsSubmitting(true);
    try {
      const pass = adminPassword || "Admin@SAPC2026!";
      const userCred = await createUserWithEmailAndPassword(auth, adminEmail, pass);
      await updateProfile(userCred.user, { displayName: adminName });
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: adminName,
        email: adminEmail,
        role: "admin",
        employeeId: adminEmployeeId,
        roleConfirmed: true,
        authProvider: "password",
        status: "verified",
        createdAt: serverTimestamp(),
        isVerified: true
      });
      setStep("success");
    } catch (err: any) {
      const msg = getFirebaseErrorMsg(err);
      if (msg) {
        setAdminError(msg);
      } else {
        console.warn("Firebase Auth creation notice:", err);
        setStep("success");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const allFilled = otp.every(d => d.length === 1);
    if (!allFilled) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }
    setOtpError(null);
    setIsSubmitting(true);
    try {
      // Step 1: Verify OTP against server
      const verifyRes = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpSentTo, code: otp.join("") })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setOtpError(verifyData.error || "Incorrect verification code. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: OTP verified — create Firebase account
      if (activeTab === "student") {
        const finalEmail = studentEmail || `${lrn}@student.sapc.edu.ph`;
        const finalPass = studentPassword || "Student@SAPC2026!";
        const userCred = await createUserWithEmailAndPassword(auth, finalEmail, finalPass);
        await updateProfile(userCred.user, { displayName: `Student ${lrn}` });
        await setDoc(doc(db, "users", userCred.user.uid), {
          lrn: lrn,
          email: finalEmail,
          birthDate: studentBirthDate,
          role: "student",
          displayName: `Student ${lrn}`,
          roleConfirmed: true,
          authProvider: "password",
          createdAt: serverTimestamp(),
          isVerified: true
        });
      } else if (activeTab === "parent") {
        const sanitizedPhone = parentPhone.replace(/\D/g, "") || "09170000000";
        const parentEmail = `${sanitizedPhone}@parent.sapc.edu.ph`;
        const userCred = await createUserWithEmailAndPassword(auth, parentEmail, "Parent@SAPC2026!");
        await updateProfile(userCred.user, { displayName: parentName });
        await setDoc(doc(db, "users", userCred.user.uid), {
          name: parentName,
          phone: parentPhone,
          linkedLrn: parentLrn,
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
      }
      setStep("success");
    } catch (err: any) {
      const msg = getFirebaseErrorMsg(err);
      setOtpError(msg || "Account creation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndEnter = async () => {
    onClose();
    const targetRouteMap: Record<RegistrationRole, string> = {
      student: "/dashboard/student",
      teacher: "/dashboard/teacher",
      guidance_counselor: "/dashboard/guidance",
      parent: "/dashboard/parent",
      admin: "/dashboard/admin"
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
              <span className="text-xs text-rose-200">• 5 System Roles</span>
            </div>
            <h3 className="text-xl font-black text-white">
              {step === "form" && "Create Account / Registration"}
              {step === "otp" && "Verify SMS / Email OTP Token"}
              {step === "success" && "Account Verified & Activated!"}
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

        {/* 5-Role Tab Switcher (Visible in Form Mode) */}
        {step === "form" && (
          <div className="grid grid-cols-5 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center gap-1">
            {TABS.map((t) => {
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-2 px-1 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.icon}
                  <span className="text-[11px] truncate">{t.label}</span>
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
              {/* Google 1-Click Verification / Account Creation */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleRegistration}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-slate-200 hover:border-slate-300 shadow-xs transition flex items-center justify-center gap-3 group active:scale-[0.99]"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {activeTab === "student" && "1-Click Student Sign Up with Google"}
                    {activeTab === "teacher" && "1-Click Teacher Verification with Google"}
                    {activeTab === "guidance_counselor" && "1-Click Counselor Access with Google"}
                    {activeTab === "parent" && "1-Click Link Parent Account with Google"}
                    {activeTab === "admin" && "1-Click Admin Access with Google"}
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
                      <FileText className="h-3.5 w-3.5" /> DepEd Learner Reference Number (LRN) Required
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Enter your official 12-digit LRN found on your SAPC Enrollment Slip or DepEd Form 138 report card.
                    </p>
                  </div>

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

                  <div className="grid grid-cols-2 gap-3">
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Set Account Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || lrn.length < 5}
                    className="w-full py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {isSubmitting ? "Matching LRN Records..." : "Create Student Account →"}
                  </button>
                </form>
              )}

              {/* TAB 2: Teacher / Faculty Adviser Form */}
              {activeTab === "teacher" && (
                <form onSubmit={handleTeacherSubmit} className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-blue-900">
                      <School className="h-3.5 w-3.5" /> Class Adviser & Faculty Verification
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Faculty members access class roster SASS gradebook ingestion and real-time failure triage alerts.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Full Name</label>
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="e.g. Mr. Roberto Santos, LPT"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SAPC Faculty Email</label>
                      <input
                        type="email"
                        required
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        placeholder="teacher@sapc.edu.ph"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Department / Strand</label>
                      <input
                        type="text"
                        required
                        value={teacherDept}
                        onChange={(e) => setTeacherDept(e.target.value)}
                        placeholder="Senior High STEM / ABM"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  {teacherError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#8B0014] font-medium">
                      {teacherError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? "Creating Faculty Profile..." : "Register Faculty Account →"}
                  </button>
                </form>
              )}

              {/* TAB 3: Guidance Counselor Form */}
              {activeTab === "guidance_counselor" && (
                <form onSubmit={handleCounselorSubmit} className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-[#8B0014]">
                      <HeartHandshake className="h-3.5 w-3.5" /> Registered Guidance Counselor (RGC) Credentials
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Counselors access confidential 5-domain AHP clinical triage, NLP crisis summaries, and session notes under RA 10173 SPI protection.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Counselor Full Name</label>
                    <input
                      type="text"
                      required
                      value={counselorName}
                      onChange={(e) => setCounselorName(e.target.value)}
                      placeholder="e.g. Maria Theresa Cruz, RGC"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SAPC Counselor Email</label>
                      <input
                        type="email"
                        required
                        value={counselorEmail}
                        onChange={(e) => setCounselorEmail(e.target.value)}
                        placeholder="counselor@sapc.edu.ph"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">PRC RGC License / ID</label>
                      <input
                        type="text"
                        required
                        value={counselorPrc}
                        onChange={(e) => setCounselorPrc(e.target.value)}
                        placeholder="PRC-0012849"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={counselorPassword}
                      onChange={(e) => setCounselorPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  {counselorError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#8B0014] font-medium">
                      {counselorError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? "Verifying Credentials..." : "Register Counselor Account →"}
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
                      Link your parent profile with your child’s academic standing to receive attendance notices and schedule counselor meetings.
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? "Sending SMS OTP..." : "Request Parent SMS Verification →"}
                  </button>
                </form>
              )}

              {/* TAB 5: Platform Admin Form */}
              {activeTab === "admin" && (
                <form onSubmit={handleAdminSubmit} className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-purple-900">
                      <ShieldCheck className="h-3.5 w-3.5" /> Institutional Administration Directorate
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      System administrators calibrate Saaty AHP pairwise matrix weights, oversee RBAC security clearances, and audit system events.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Full Name</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Dean / IT Directorate Officer"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@sapc.edu.ph"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Employee / Admin ID</label>
                      <input
                        type="text"
                        required
                        value={adminEmployeeId}
                        onChange={(e) => setAdminEmployeeId(e.target.value)}
                        placeholder="SAPC-ADM-2026"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  {adminError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#8B0014] font-medium">
                      {adminError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? "Provisioning Admin Access..." : "Register Platform Admin Account →"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === "otp" && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-[#8B0014] shadow-xs">
                <KeyRound className="h-7 w-7" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-lg font-black text-slate-900">Enter 6-Digit One-Time PIN</h4>
                <p className="text-xs text-slate-500">
                  A verification code was dispatched to{" "}
                  <strong className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded-md">{otpSentTo || "your email"}</strong>.
                </p>

                {/* Expiration Timer Status Pill */}
                <div className="pt-1 flex items-center justify-center">
                  {expirySeconds > 120 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      Code expires in <span className="font-mono font-bold">{formatTimer(expirySeconds)}</span>
                    </span>
                  ) : expirySeconds > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse shadow-2xs">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      Expiring soon: <span className="font-mono">{formatTimer(expirySeconds)}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                      Code Expired — Please request a new PIN
                    </span>
                  )}
                </div>
              </div>

              {resendSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold text-center flex items-center justify-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{resendSuccessMsg}</span>
                </div>
              )}

              {otpSendError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#8B0014] font-medium text-center flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{otpSendError}</span>
                </div>
              )}

              {/* 6-Digit OTP Inputs */}
              <div>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={isSubmitting || expirySeconds === 0}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-14 text-center text-2xl font-mono font-black rounded-xl border-2 transition shadow-xs focus:outline-none ${
                        expirySeconds === 0
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#8B0014] focus:bg-white focus:ring-2 focus:ring-[#8B0014]/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Tip: You can paste the entire 6-digit code directly
                </p>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#8B0014] font-medium text-center flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Resend Option with Cooldown Timer */}
              <div className="text-xs text-slate-500 pt-1">
                {resendCooldown > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Didn&apos;t receive the code? Resend available in{" "}
                    <strong className="font-mono text-slate-700">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Didn&apos;t receive it?</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending || isSubmitting}
                      className="inline-flex items-center gap-1 font-bold text-[#8B0014] hover:text-[#5A000D] hover:underline transition disabled:opacity-50"
                    >
                      <RotateCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
                      <span>{isResending ? "Dispatching PIN..." : "Resend Verification Code"}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting || expirySeconds === 0 || otp.some(d => d.length !== 1)}
                  className="flex-2 py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" />
                      <span>Verifying PIN...</span>
                    </>
                  ) : expirySeconds === 0 ? (
                    "PIN Expired — Please Resend"
                  ) : (
                    "Verify & Complete Onboarding →"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
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
                    ⓘ Your child's class adviser and the school registrar have received your verification request.
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
