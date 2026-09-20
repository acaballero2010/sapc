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
  GraduationCap,
  ShieldCheck
} from "lucide-react";
import { SapcLogo } from "@/components/SapcLogo";
import { useAuth, RoleType } from "@/lib/auth-context";
import { GoogleRoleSelectionModal } from "@/components/GoogleRoleSelectionModal";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleRoleModalOpen, setIsGoogleRoleModalOpen] = useState(false);
  const [googleUserName, setGoogleUserName] = useState("SAPC Member");

  const ROLE_ROUTES: Record<RoleType, string> = {
    guidance_counselor: "/dashboard/guidance",
    teacher: "/dashboard/teacher",
    student: "/dashboard/student",
    parent: "/dashboard/parent",
    admin: "/dashboard/admin"
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const targetRole: RoleType = 
        email.includes("admin") ? "admin" :
        email.includes("teacher") ? "teacher" :
        email.includes("parent") ? "parent" :
        email.includes("counselor") ? "guidance_counselor" : "student";
      await login(email, password, targetRole);
      router.push(ROLE_ROUTES[targetRole] || "/dashboard/student");
    } catch (err: any) {
      // Show error — do NOT redirect on failed authentication
      const msg = err?.message || "Authentication failed. Please check your credentials and try again.";
      setErrorMessage(msg.includes("OfflineError") || msg.includes("offline") 
        ? "Could not reach the authentication server. Please check your connection."
        : "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (role?: RoleType) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const targetRole = role || "student";
      const res = await loginWithGoogle(targetRole);
      if (res && res.isNewUser && !role) {
        setGoogleUserName(res.user.full_name || "SAPC Member");
        setIsGoogleRoleModalOpen(true);
      } else if (res && res.user) {
        router.push(ROLE_ROUTES[res.user.role] || "/dashboard/student");
      } else {
        router.push(ROLE_ROUTES[targetRole] || "/dashboard/student");
      }
    } catch (err: any) {
      // Surface the error to the user; do NOT silently redirect to dashboard
      const code = err?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // User dismissed the popup — not an error, just reset
        setErrorMessage(null);
      } else if (code === "auth/unauthorized-domain") {
        setErrorMessage("Google Sign-In is not configured for this domain. Please use email/password login.");
      } else {
        setErrorMessage("Google Sign-In failed. Please try again or use email/password login.");
      }
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
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden space-y-6">
          {/* Top Institutional Accent Strip */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#8B0014] via-amber-400 to-[#8B0014]" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-[#8B0014]/10 border border-[#8B0014]/20 flex items-center justify-center">
                <SapcLogo size={38} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Sign In to Portal
                </h1>
                <p className="text-xs text-slate-500 font-medium">SAPC Institutional Authentication</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>RA 10173</span>
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#8B0014] font-medium">
              {errorMessage}
            </div>
          )}

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
                  placeholder="e.g. counselor@sapc.edu.ph or 12-digit LRN"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs font-bold text-slate-400 uppercase">
              <span className="bg-white px-3 tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleGoogleSignIn()}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google Institutional Single Sign-On</span>
          </button>

          {/* Registration Link */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#8B0014] transition"
            >
              <GraduationCap className="h-4 w-4 text-[#8B0014]" />
              <span>New student, parent, or faculty? <strong className="text-[#8B0014] underline">Create Account →</strong></span>
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
