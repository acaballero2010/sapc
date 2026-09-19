"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  GraduationCap,
  Users,
  School,
  HeartHandshake,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { SapcLogo } from "@/components/SapcLogo";
import { useAuth, RoleType } from "@/lib/auth-context";
import { GoogleRoleSelectionModal } from "@/components/GoogleRoleSelectionModal";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, switchRole } = useAuth();
  const [email, setEmail] = useState("counselor@sapc.edu.ph");
  const [password, setPassword] = useState("counselor123");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRoleModalOpen, setIsGoogleRoleModalOpen] = useState(false);
  const [googleUserName, setGoogleUserName] = useState("SAPC Member");

  const quickRoles: { 
    role: RoleType; 
    label: string; 
    personName: string;
    email: string; 
    pass: string; 
    icon: React.ReactNode;
    desc: string; 
    badge: string;
    badgeColor: string;
  }[] = [
    { 
      role: "guidance_counselor", 
      label: "Guidance Counselor", 
      personName: "Maria Theresa Cruz, RGC",
      email: "counselor@sapc.edu.ph", 
      pass: "counselor123", 
      icon: <HeartHandshake className="h-5 w-5 text-[#8B0014]" />, 
      desc: "Crisis triage, AHP 5-domain decomposition & SPI clinical notes",
      badge: "Crisis Triage",
      badgeColor: "bg-rose-100 text-[#8B0014] border-rose-200"
    },
    { 
      role: "teacher", 
      label: "Class Adviser", 
      personName: "Mr. Roberto Santos, LPT (STEM)",
      email: "teacher@sapc.edu.ph", 
      pass: "teacher123", 
      icon: <School className="h-5 w-5 text-amber-700" />, 
      desc: "SASS grade CSV ingestion, deterministic academic risk & faculty referrals",
      badge: "SASS Ingestion",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300"
    },
    { 
      role: "student", 
      label: "Student Portal", 
      personName: "Joshua Dimaculangan (Grade 11)",
      email: "student@sapc.edu.ph", 
      pass: "student123", 
      icon: <GraduationCap className="h-5 w-5 text-emerald-600" />, 
      desc: "Wellness radar, daily mood tracker & goal simulator",
      badge: "Wellness Radar",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300"
    },
    { 
      role: "parent", 
      label: "Parent / Guardian", 
      personName: "Mrs. Elena Dimaculangan",
      email: "parent@sapc.edu.ph", 
      pass: "parent123", 
      icon: <Users className="h-5 w-5 text-blue-600" />, 
      desc: "Linked child GPA standing, consultation alerts & attendance tracking",
      badge: "Parent Alerts",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300"
    },
    { 
      role: "admin", 
      label: "System Administrator", 
      personName: "IT & Guidance Central Directorate",
      email: "admin@sapc.edu.ph", 
      pass: "admin123", 
      icon: <ShieldCheck className="h-5 w-5 text-purple-600" />, 
      desc: "AHP decision criteria weights, Saaty CR validation & audit trail",
      badge: "Audit & Matrix",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-300"
    }
  ];

  const ROLE_ROUTES: Record<RoleType, string> = {
    guidance_counselor: "/dashboard/guidance",
    teacher: "/dashboard/teacher",
    student: "/dashboard/student",
    parent: "/dashboard/parent",
    admin: "/dashboard/admin"
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      const targetRole: RoleType = 
        email.includes("admin") ? "admin" :
        email.includes("teacher") ? "teacher" :
        email.includes("student") ? "student" :
        email.includes("parent") ? "parent" : "guidance_counselor";
      router.push(ROLE_ROUTES[targetRole] || "/dashboard/guidance");
    } catch {
      router.push("/dashboard/guidance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (role?: RoleType) => {
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle(role);
      if (res && res.isNewUser) {
        setGoogleUserName(res.user.full_name || "SAPC Member");
        setIsGoogleRoleModalOpen(true);
      } else if (res && res.user) {
        router.push(ROLE_ROUTES[res.user.role] || "/dashboard/student");
      } else if (role) {
        router.push(ROLE_ROUTES[role] || "/dashboard/student");
      }
    } catch (err) {
      console.warn("Google sign-in fallback:", err);
      if (role) {
        router.push(ROLE_ROUTES[role] || "/dashboard/student");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSignIn = async (roleObj: typeof quickRoles[0]) => {
    setIsSubmitting(true);
    try {
      await switchRole(roleObj.role);
      router.push(ROLE_ROUTES[roleObj.role] || "/dashboard/guidance");
    } catch {
      router.push(ROLE_ROUTES[roleObj.role] || "/dashboard/guidance");
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

        <Link
          href="/"
          className="text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition"
        >
          ← Return to Overview
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl w-full mx-auto my-6">
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden space-y-6">
          {/* Top Institutional Accent Strip */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#8B0014] via-amber-400 to-[#8B0014]" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-[#8B0014]/10 border border-[#8B0014]/20 flex items-center justify-center">
                <SapcLogo size={36} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  SAPC Decision Portal
                </h1>
                <p className="text-xs text-slate-500 font-medium">San Antonio de Padua College Authentication</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              🔒 RA 10173 RBAC
            </span>
          </div>

          {/* Primary Form: Institutional Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Institutional Email or LRN
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sapc.edu.ph or 12-digit LRN"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-slate-400 italic">Default: role123</span>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-black text-sm bg-[#8B0014] hover:bg-[#700010] text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Authenticating Session..." : "Sign In to SAPC Portal"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </button>
          </form>

          {/* Google SSO Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleGoogleSignIn()}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google Institutional Single Sign-On</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase font-black text-slate-500">
              <span className="bg-white px-3 tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Instant Evaluator Demo Access</span>
              </span>
            </div>
          </div>

          {/* Fast Evaluator 1-Click Role Logins */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-700">
                1-Click Sign-In by Institutional Role:
              </span>
              <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                5 Roles Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickRoles.map((qr) => (
                <button
                  key={qr.role}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickSignIn(qr)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#8B0014] bg-white hover:bg-rose-50/50 transition flex items-center justify-between group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 shrink-0 group-hover:scale-105 transition">
                      {qr.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs text-slate-900 group-hover:text-[#8B0014] block truncate">
                        {qr.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {qr.personName.split(" ")[0]} {qr.personName.split(" ")[1]}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-[#8B0014] shrink-0 flex items-center">
                    Sign In <ChevronRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Registration Link */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#8B0014] transition"
            >
              <GraduationCap className="h-4 w-4 text-[#8B0014]" />
              <span>New student, parent, or faculty? <strong className="text-[#8B0014] underline">Claim Account & Register →</strong></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
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
