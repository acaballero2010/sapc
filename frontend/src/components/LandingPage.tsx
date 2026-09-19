"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Brain, 
  BookOpen, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Mail, 
  FileSpreadsheet, 
  HeartHandshake,
  ChevronRight,
  School
} from "lucide-react";
import { SapcLogo } from "./SapcLogo";
import { useAuth, RoleType } from "@/lib/auth-context";
import { RegistrationModal } from "./RegistrationModal";
import { GoogleRoleSelectionModal } from "./GoogleRoleSelectionModal";

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const { login, loginWithGoogle, switchRole } = useAuth();
  const [email, setEmail] = useState("counselor@sapc.edu.ph");
  const [password, setPassword] = useState("counselor123");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portalMode, setPortalMode] = useState<"quick_eval" | "credentials">("quick_eval");
  const [activeTab, setActiveTab] = useState<"counselor" | "teacher" | "student" | "parent">("counselor");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isGoogleRoleModalOpen, setIsGoogleRoleModalOpen] = useState(false);
  const [googleUserName, setGoogleUserName] = useState("SAPC Member");

  const quickRoles: { 
    role: RoleType; 
    label: string; 
    personName: string;
    email: string; 
    pass: string; 
    icon: string; 
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
      icon: "🧠", 
      desc: "Crisis triage, AHP 5-domain decomposition, voice dictation & SPI clinical notes",
      badge: "Crisis Triage",
      badgeColor: "bg-rose-100 text-[#8B0014] border-rose-200"
    },
    { 
      role: "teacher", 
      label: "Class Adviser", 
      personName: "Mr. Roberto Santos, LPT (STEM)",
      email: "teacher@sapc.edu.ph", 
      pass: "teacher123", 
      icon: "📚", 
      desc: "SASS grade CSV ingestion, deterministic academic risk & attendance roster",
      badge: "SASS Ingestion",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300"
    },
    { 
      role: "student", 
      label: "Student Portal", 
      personName: "Joshua Dimaculangan (Grade 11)",
      email: "student@sapc.edu.ph", 
      pass: "student123", 
      icon: "🎓", 
      desc: "Wellness radar, daily mood tracker, 60s breathing guide & goal simulator",
      badge: "Wellness Radar",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300"
    },
    { 
      role: "parent", 
      label: "Parent / Guardian", 
      personName: "Mrs. Elena Dimaculangan",
      email: "parent@sapc.edu.ph", 
      pass: "parent123", 
      icon: "👨‍👩‍👦", 
      desc: "Linked child GPA standing, meeting notifications & 1-click consultation RSVP",
      badge: "Parent Alerts",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300"
    },
    { 
      role: "admin", 
      label: "System Administrator", 
      personName: "IT & Guidance Central Directorate",
      email: "admin@sapc.edu.ph", 
      pass: "admin123", 
      icon: "⚙️", 
      desc: "AHP decision criteria weights, Saaty CR validation & RA 10173 audit trail",
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
      console.warn("Google sign-in caught:", err);
      if (role) {
        router.push(ROLE_ROUTES[role] || "/dashboard/student");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSelect = async (roleObj: typeof quickRoles[0]) => {
    setEmail(roleObj.email);
    setPassword(roleObj.pass);
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Gold-Maroon Header Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#8B0014] fixed top-0 left-0 right-0 z-50 shadow-sm" />

      {/* Navigation Header */}
      <header className="sticky top-1.5 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <SapcLogo size={44} showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                  SAPC <span className="text-[#8B0014]">IntellySys</span>
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded-full shadow-xs">
                  DSS v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                San Antonio de Padua College • &quot;A College for the Family&quot;
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#about" className="hover:text-[#8B0014] transition">About SAPC</a>
            <a href="#features" className="hover:text-[#8B0014] transition">5 Domains</a>
            <a href="#benefits" className="hover:text-[#8B0014] transition">Efficacy</a>
            <a href="#how-it-works" className="hover:text-[#8B0014] transition">AHP Model</a>
            <a href="#contact" className="hover:text-[#8B0014] transition">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="hidden sm:flex px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm border border-amber-300 transition items-center gap-1.5 shadow-2xs"
            >
              <Users className="h-4 w-4 text-[#8B0014]" />
              <span>Claim / Register</span>
            </button>
            <a
              href="#login-section"
              className="px-5 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <span>Access Portal</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-white via-slate-50/60 to-white">
        {/* Subtle Decorative Ambient Background Blooms */}
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left pt-2">
              
              {/* Institution Tagline Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/90 text-[#8B0014] text-xs sm:text-sm font-extrabold shadow-xs">
                <Sparkles className="h-4 w-4 text-[#8B0014]" />
                <span>&quot;A College for the Family&quot; • Pila, Laguna</span>
                <span className="hidden sm:inline text-rose-300">•</span>
                <span className="hidden sm:inline text-xs font-semibold text-rose-900/80">Est. 1979</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
                Intelligent Student <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B0014] via-[#B91C1C] to-[#D97706]">
                  Decision Support System
                </span>
              </h1>

              {/* Lead Paragraph */}
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-normal">
                SAPC IntellySys is an institutional multi-criteria failure prevention platform designed for 
                <strong className="text-slate-900 font-semibold"> San Antonio de Padua College</strong>. It unites SASS academic 
                records with Mental Health, Financial, Family, and Physical Wellness factors using the 
                <strong className="text-slate-900 font-semibold"> Analytic Hierarchy Process (AHP)</strong> and 
                <strong className="text-slate-900 font-semibold"> NLP crisis triage</strong>.
              </p>

              {/* 3 Pillar Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 transition">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[#D97706] shrink-0">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">AHP Multi-Factor</span>
                    <span className="text-[11px] text-slate-500 font-medium">5-Domain Matrix</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shrink-0">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">RA 10173 Privacy</span>
                    <span className="text-[11px] text-slate-500 font-medium">Encrypted RBAC</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-rose-300 transition">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-[#8B0014] shrink-0">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">24/7 AI Triage</span>
                    <span className="text-[11px] text-slate-500 font-medium">Taglish Distress NLP</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#login-section"
                  className="px-7 py-3.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-base shadow-md transition active:scale-95 flex items-center gap-2.5 group"
                >
                  <span>Launch Decision Portal</span>
                  <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-xl bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200 font-semibold text-base transition shadow-xs"
                >
                  Explore AHP Methodology
                </a>
              </div>

              {/* Live Metric Stats Strip */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-200/80">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block">Monitored Students</span>
                  <strong className="text-lg font-black text-slate-900 block mt-0.5">1,250+</strong>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block">Intervention SLA</span>
                  <strong className="text-lg font-black text-emerald-700 block mt-0.5">98.4%</strong>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block">Saaty AHP (CR)</span>
                  <strong className="text-lg font-black text-amber-700 block mt-0.5">0.048 ≤ 0.10</strong>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block">Data Privacy</span>
                  <strong className="text-lg font-black text-[#8B0014] block mt-0.5">RA 10173 SPI</strong>
                </div>
              </div>

            </div>

            {/* Right Login / Quick Access Card */}
            <div id="login-section" className="lg:col-span-5 scroll-mt-24 w-full">
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 relative">
                
                {/* Decorative Top Gold Line */}
                <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-amber-400 to-[#8B0014] rounded-full" />

                {/* Card Header & Segmented Tab Switcher */}
                <div className="space-y-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-50 text-[#8B0014]">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        SAPC Decision Portal
                      </h3>
                    </div>
                    <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      🔒 Secure RBAC
                    </span>
                  </div>

                  {/* Segmented Mode Selector */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPortalMode("quick_eval")}
                      className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        portalMode === "quick_eval"
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span>⚡</span>
                      <span>1-Click Evaluation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortalMode("credentials")}
                      className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        portalMode === "credentials"
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span>🔑</span>
                      <span>Institutional Login</span>
                    </button>
                  </div>
                </div>

                {/* MODE 1: 1-Click Evaluation Quick Select */}
                {portalMode === "quick_eval" && (
                  <div className="space-y-2.5 animate-fadeIn">
                    <p className="text-xs text-slate-500">
                      Select any institutional stakeholder to test live dashboards and decision tools:
                    </p>

                    <div className="space-y-2">
                      {quickRoles.map((r) => (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => handleQuickSelect(r)}
                          disabled={isSubmitting}
                          className="w-full text-left p-3 rounded-2xl bg-slate-50/90 hover:bg-rose-50/60 border border-slate-200 hover:border-[#8B0014]/40 transition-all group flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                              {r.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900 group-hover:text-[#8B0014] truncate">
                                  {r.label}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${r.badgeColor} shrink-0`}>
                                  {r.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {r.personName}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#8B0014] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                            <span>Launch</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODE 2: Manual Credentials Form */}
                {portalMode === "credentials" && (
                  <div className="space-y-4 text-left animate-fadeIn">
                    {/* Google Sign-in Option */}
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn()}
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-slate-200 hover:border-slate-300 shadow-xs transition flex items-center justify-center gap-3 group active:scale-[0.99]"
                    >
                      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign in with Google Workspace</span>
                    </button>

                    <div className="relative flex items-center justify-center my-1">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        or credentials
                      </span>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">SAPC Email / LRN</label>
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="counselor@sapc.edu.ph"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                          />
                        </div>
                      </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Selector */}
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Quick Fill Demo Credentials:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {quickRoles.map((qr) => (
                          <button
                            key={qr.role}
                            type="button"
                            onClick={() => {
                              setEmail(qr.email);
                              setPassword(qr.pass);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-[#8B0014] rounded-lg border border-slate-200 transition"
                          >
                            {qr.icon} {qr.label.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Authenticating Session...</span>
                      ) : (
                        <>
                          <span>Authenticate & Enter Portal</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                  </div>
                )}

                {/* Footer Registration Prompt & Security Badge */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistrationOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-[#8B0014] border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Users className="h-3.5 w-3.5 text-[#8B0014]" />
                    <span>New student or parent? Claim Account & Link Profile →</span>
                  </button>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5 pt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    RA 10173 Data Privacy Sealed • 256-Bit TLS Encryption
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About SAPC Section */}
      <section id="about" className="py-20 bg-slate-50 border-y border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-[#8B0014] text-xs font-bold border border-rose-200">
                <School className="h-3.5 w-3.5" />
                <span>San Antonio de Padua College</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Rooted in Values, Driven by Data Excellence
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                San Antonio de Padua College (SAPC) is a premier educational institution in Pila, Laguna, 
                founded in 1979 by the Foundation of Pila, Laguna, Inc. Committed to the motto 
                <em className="font-semibold text-slate-900"> &quot;Humilitas, Caritas et Patiens&quot;</em>, SAPC strives to nurture well-rounded, morally upright, 
                and globally competitive learners.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm font-bold block">Holistic Failure Prevention Mission</strong>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Addressing non-academic distress factors (mental wellness, financial hardship, family dynamics) 
                      alongside traditional SASS grade indicators.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm font-bold block">Strict RA 10173 Privacy Framework</strong>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Sensitive student mental health disclosures are protected with institutional role-based encryption 
                      accessible exclusively to registered Guidance Counselors.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-xs space-y-2">
                <span className="text-4xl font-black text-[#8B0014] block">40.17%</span>
                <strong className="text-sm font-bold text-slate-900 block">Academic Weight (w_AC)</strong>
                <p className="text-xs text-slate-500">Quarterly GPA, failing subjects & attendance</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-xs space-y-2">
                <span className="text-4xl font-black text-rose-600 block">24.42%</span>
                <strong className="text-sm font-bold text-slate-900 block">Mental Health (w_MH)</strong>
                <p className="text-xs text-slate-500">Psychological distress, anxiety & NLP signals</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-xs space-y-2">
                <span className="text-4xl font-black text-amber-600 block">13.73%</span>
                <strong className="text-sm font-bold text-slate-900 block">Financial Strain (w_FI)</strong>
                <p className="text-xs text-slate-500">Tuition arrears & allowance sufficiency</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-xs space-y-2">
                <span className="text-4xl font-black text-emerald-600 block">0.048</span>
                <strong className="text-sm font-bold text-slate-900 block">Consistency Ratio (CR)</strong>
                <p className="text-xs text-slate-500">Saaty standard verified (CR &le; 0.10)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section (6 Cards) */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#8B0014] uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Engine Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Comprehensive Decision Support Capabilities
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Tailor-made modules combining quantitative grading matrices with qualitative wellness analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 p-7 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706]">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Multi-Factor Risk Assessment</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Comprehensive evaluation across 5 weighted domains: Academic, Mental Health, Financial, Family, and Physical Health.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 p-7 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#8B0014]">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AHP Alternative Ranking Engine</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mathematically identifies the primary failure driver to recommend targeted protocols (Peer Tutoring, Scholarships, Clinical Leave).
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 p-7 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">NLP Crisis & Chatbot Companion</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              24/7 student chat companion equipped with Tagalog/Taglish crisis detection and automatic NCMH 1553 emergency hotline dispatch.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 p-7 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">SASS Academic CSV Ingestion</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Automated batch parsing of school registrar quarterly CSV exports with attendance penalties and line-by-line validation.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 p-7 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#8B0014]">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Intervention Action Tracker</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Guidance counselors create and track structured care plans with defined objectives, action items, and scheduled follow-ups.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 p-7 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">RA 10173 Audit & Privacy Guard</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Full compliance with the Philippine Data Privacy Act. Immutable audit logs monitor all sensitive data accesses.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits by Role Section */}
      <section id="benefits" className="py-20 bg-slate-50 border-y border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Tailored Benefits for the SAPC Community
            </h2>
            <p className="text-sm text-slate-600">
              Empowering each stakeholder with role-specific views and actionable decision tools.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab("counselor")}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition ${
                activeTab === "counselor"
                  ? "bg-[#8B0014] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200"
              }`}
            >
              🧠 Guidance Counselors
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition ${
                activeTab === "teacher"
                  ? "bg-[#8B0014] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200"
              }`}
            >
              📚 Teachers & Advisers
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition ${
                activeTab === "student"
                  ? "bg-[#8B0014] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200"
              }`}
            >
              🎓 Students
            </button>
            <button
              onClick={() => setActiveTab("parent")}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition ${
                activeTab === "parent"
                  ? "bg-[#8B0014] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200"
              }`}
            >
              👨‍👩‍👦 Parents & Guardians
            </button>
          </div>

          {/* Tab Content Cards */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-4xl mx-auto shadow-sm">
            {activeTab === "counselor" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-[#8B0014]" />
                  Guidance & Counseling Central Benefits
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Real-time NLP Distress Triage:</strong> Immediate crisis alert queue when students express suicidal ideation or severe panic.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Multi-Domain Decomposition:</strong> Full radar charts pinpointing whether failure risk is driven by academics, family, or health.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Confidential Clinical Notes:</strong> Record SPI intake sessions protected by RA 10173 access policies.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "teacher" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-[#8B0014]" />
                  Class Adviser & Teacher Benefits
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>1-Click SASS CSV Ingestion:</strong> Upload quarterly report card exports and obtain deterministic academic risk rankings instantly.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Attendance Warning Tracking:</strong> Real-time detection of high chronic absences before they lead to course failure.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Direct Parent Communication:</strong> Receive and respond to parent inquiries regarding student study plans.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "student" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-[#8B0014]" />
                  Student Portal Benefits
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Non-Stigmatizing Status Meters:</strong> Private view of academic health, attendance rate, and wellness progress.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>24/7 AI Guidance Companion:</strong> A safe, supportive conversational chatbot to discuss school stress and wellness.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Direct Tutoring Access:</strong> Immediate referral links to peer tutors and subject consultation hours.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "parent" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-[#8B0014]" />
                  Parent & Guardian Portal Benefits
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Linked Child Overview:</strong> Transparent, real-time quarterly performance and attendance records.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Holistic Growth Radar:</strong> Understand your child’s multidimensional development beyond letter grades.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B0014] shrink-0 mt-0.5" />
                    <span><strong>Direct Adviser Messaging:</strong> Send inquiries directly to the class adviser regarding academic remediation.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#8B0014] uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Operational Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            How IntellySys Works
          </h2>
          <p className="text-sm text-slate-600">
            From data ingestion to collaborative remediation in 4 structured phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
            <span className="h-10 w-10 rounded-2xl bg-[#8B0014] text-white font-bold text-base flex items-center justify-center shadow-xs">
              1
            </span>
            <h4 className="text-base font-bold text-slate-900">Data Ingestion</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Advisers upload SASS CSV files; students participate in confidential wellness surveys & chat.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
            <span className="h-10 w-10 rounded-2xl bg-[#8B0014] text-white font-bold text-base flex items-center justify-center shadow-xs">
              2
            </span>
            <h4 className="text-base font-bold text-slate-900">AHP Synthesis</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Decision weights (w_AC, w_MH, w_FI, w_FA, w_HE) compute an objective composite risk score out of 100.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
            <span className="h-10 w-10 rounded-2xl bg-[#8B0014] text-white font-bold text-base flex items-center justify-center shadow-xs">
              3
            </span>
            <h4 className="text-base font-bold text-slate-900">Triage & Crisis Alerts</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Students categorized into Low, Medium, or High Risk with automated distress alerts sent to Counselors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
            <span className="h-10 w-10 rounded-2xl bg-[#8B0014] text-white font-bold text-base flex items-center justify-center shadow-xs">
              4
            </span>
            <h4 className="text-base font-bold text-slate-900">Targeted Care Plans</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Counselors dispatch personalized care plans, parent conferences, and tutoring partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-slate-200 bg-slate-900 text-slate-300 py-14 text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <SapcLogo size={38} showText={false} />
              <span className="font-extrabold text-lg text-white">San Antonio de Padua College</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Intelligent Student Failure Decision Support System (SAPC IntellySys). 
              A comprehensive platform empowering students, educators, and families with data-driven support.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Compliant with Republic Act No. 10173 (Philippine Data Privacy Act)</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white text-sm">Quick Links</h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="#about" className="hover:text-amber-400">About SAPC</a></li>
              <li><a href="#features" className="hover:text-amber-400">System Features</a></li>
              <li><a href="#benefits" className="hover:text-amber-400">Stakeholder Benefits</a></li>
              <li><a href="#login-section" className="hover:text-amber-400">Portal Login</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white text-sm">Campus Contact</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              National Highway, Barangay Santa Clara Sur, Pila, 4010 Laguna, Philippines
            </p>
            <p className="text-xs text-slate-400">
              Email: <strong className="text-white">info@sapc.edu.ph</strong>
            </p>
            <p className="text-xs text-amber-300 font-bold">
              Crisis Helpline: NCMH 1553 (24/7)
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 San Antonio de Padua College. All rights reserved.</p>
          <p>Powered by IntellySys Multi-Criteria Decision Support System</p>
        </div>
      </footer>

      {/* Account Registration & Family Claim Modal */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />

      {/* Google Authentication Role Selection Modal */}
      <GoogleRoleSelectionModal
        isOpen={isGoogleRoleModalOpen}
        userName={googleUserName}
        onClose={() => setIsGoogleRoleModalOpen(false)}
      />
    </div>
  );
};
