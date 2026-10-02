"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  School,
  Lock,
  ExternalLink
} from "lucide-react";
import { SapcLogo } from "@/components/SapcLogo";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function RegisterPage() {
  const [claimEmail, setClaimEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClaimAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = claimEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid institutional or personal email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        `Account claim link dispatched! An activation and password setup email has been sent to ${email}. Please check your inbox (or spam folder) to set your permanent password.`
      );
      setClaimEmail("");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") {
        setErrorMessage(
          `The email "${email}" has not been pre-provisioned by the SAPC Registrar yet. Please verify your email with your Class Adviser or Campus Administrator.`
        );
      } else {
        setErrorMessage(
          err?.message || "Failed to dispatch activation email. Please contact the SAPC Registrar."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#2D0005] to-[#120003] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans text-slate-100">
      {/* Top Header */}
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
          href="/login"
          className="text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition"
        >
          <span>Sign In to Portal →</span>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl w-full mx-auto my-6 sm:my-8 space-y-6">
        {/* Policy Announcement Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#8B0014]/10 border border-[#8B0014]/20 text-[#8B0014] flex items-center justify-center">
                <School className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Account Onboarding &amp; Activation
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Official Institutional Registrar Protocol • RA 10173 Sealed
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>DepEd Verified</span>
            </span>
          </div>

          {/* Institutional Policy Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Lock className="h-4 w-4 text-[#8B0014] shrink-0" />
              <span>Direct Self-Registration is Closed</span>
            </div>
            <p className="text-amber-900/90 text-xs">
              To guarantee student data privacy, prevent duplicate records, and ensure DepEd SF-9 accuracy, all student, parent, faculty, and counselor accounts are <strong>pre-provisioned exclusively by the SAPC Registrar &amp; Campus IT</strong>.
            </p>
          </div>

          {/* 3-Step Access Protocol */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              How to Access Your Pre-Created Account:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="inline-flex h-6 w-6 rounded-full bg-[#8B0014] text-white items-center justify-center font-black text-xs">1</span>
                <p className="font-bold text-slate-900">Check Your Credentials</p>
                <p className="text-slate-500 text-[11px] leading-snug">
                  Locate your official credential slip issued by your Class Adviser or Admissions Office.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="inline-flex h-6 w-6 rounded-full bg-[#8B0014] text-white items-center justify-center font-black text-xs">2</span>
                <p className="font-bold text-slate-900">Sign In to Portal</p>
                <p className="text-slate-500 text-[11px] leading-snug">
                  Login using your email or 12-digit DepEd LRN and your issued temporary password.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="inline-flex h-6 w-6 rounded-full bg-[#8B0014] text-white items-center justify-center font-black text-xs">3</span>
                <p className="font-bold text-slate-900">Link Google SSO</p>
                <p className="text-slate-500 text-[11px] leading-snug">
                  Change your password and optionally link your Google Account for 1-click logins.
                </p>
              </div>
            </div>
          </div>

          {/* Account Claim / Password Reset Form */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">First-time login or forgot temporary password?</h3>
              <p className="text-xs text-slate-500">
                Enter the email address registered with the SAPC Registrar to receive an instant account activation link.
              </p>
            </div>

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleClaimAccount} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={claimEmail}
                  onChange={(e) => setClaimEmail(e.target.value)}
                  placeholder="e.g. kalyepos26@gmail.com or name@sapc.edu.ph"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#8B0014] hover:bg-[#700010] text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <span>{isSubmitting ? "Dispatching..." : "Send Activation Link"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-xl font-black text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md transition flex items-center justify-center gap-2 group"
            >
              <span>Already Have Temporary Credentials? Sign In Here</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Registrar Helpdesk Contact */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-rose-100/90 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="h-5 w-5 text-amber-300 shrink-0" />
            <div>
              <p className="font-bold text-white">Need registrar assistance with account provisioning?</p>
              <p className="text-[11px] text-rose-200/80">Campus Admissions Office • St. Anthony Hall, 1st Floor</p>
            </div>
          </div>
          <a
            href="mailto:registrar@sapc.edu.ph"
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs transition inline-flex items-center gap-1.5"
          >
            <span>Contact Registrar</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-xl mx-auto text-center text-xs text-rose-200/60 pb-2">
        San Antonio de Padua College • Multi-Factor Decision Support System • RA 10173 Data Privacy Sealed
      </div>
    </div>
  );
}
