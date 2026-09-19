"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Brain, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Sliders, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  Lock, 
  Mail, 
  FileSpreadsheet, 
  HeartHandshake,
  Activity,
  ChevronRight,
  School,
  Check
} from "lucide-react";
import { SapcLogo } from "./SapcLogo";
import { useAuth, RoleType } from "@/lib/auth-context";

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const { login, switchRole, serverError, retryConnection } = useAuth();
  const [email, setEmail] = useState("counselor@sapc.edu.ph");
  const [password, setPassword] = useState("counselor123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"counselor" | "teacher" | "student" | "parent">("counselor");

  const quickRoles: { role: RoleType; label: string; email: string; pass: string; icon: string; desc: string; badge: string }[] = [
    { 
      role: "guidance_counselor", 
      label: "Guidance Counselor", 
      email: "counselor@sapc.edu.ph", 
      pass: "counselor123", 
      icon: "🧠", 
      desc: "Full crisis triage, AHP 5-domain decomposition & SPI notes",
      badge: "Crisis Triage"
    },
    { 
      role: "teacher", 
      label: "Class Adviser", 
      email: "teacher@sapc.edu.ph", 
      pass: "teacher123", 
      icon: "📚", 
      desc: "SASS grade ingestion, academic risk & attendance roster",
      badge: "SASS Ingestion"
    },
    { 
      role: "student", 
      label: "Student Portal", 
      email: "student@sapc.edu.ph", 
      pass: "student123", 
      icon: "🎓", 
      desc: "Holistic wellness radar, tutoring resources & 24/7 AI chat",
      badge: "Wellness"
    },
    { 
      role: "parent", 
      label: "Parent / Guardian", 
      email: "parent@sapc.edu.ph", 
      pass: "parent123", 
      icon: "👨‍👩‍👦", 
      desc: "Linked child GPA standing, attendance alerts & adviser messaging",
      badge: "Progress"
    },
    { 
      role: "admin", 
      label: "System Administrator", 
      email: "admin@sapc.edu.ph", 
      pass: "admin123", 
      icon: "⚙️", 
      desc: "AHP decision criteria matrix weights & RA 10173 audit trail",
      badge: "Audit & Config"
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
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
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Gold-Maroon Header Strip */}
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
                San Antonio de Padua College • "A College for the Family"
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#about" className="hover:text-[#8B0014] transition">About SAPC</a>
            <a href="#features" className="hover:text-[#8B0014] transition">Features</a>
            <a href="#benefits" className="hover:text-[#8B0014] transition">Benefits</a>
            <a href="#how-it-works" className="hover:text-[#8B0014] transition">How It Works</a>
            <a href="#contact" className="hover:text-[#8B0014] transition">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
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
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[#8B0014] text-xs sm:text-sm font-bold shadow-xs">
                <Sparkles className="h-4 w-4 text-[#8B0014]" />
                <span>"A College for the Family" • Pila, Laguna</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
                Intelligent Student <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B0014] via-[#B91C1C] to-[#D97706]">
                  Decision Support System
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-normal">
                SAPC IntellySys is an institutional multi-criteria decision engine designed for 
                <strong className="text-slate-900 font-semibold"> San Antonio de Padua College</strong>. It unites SASS academic 
                records with Mental Health, Financial, Family, and Physical Wellness indicators using the 
                <strong className="text-slate-900 font-semibold"> Analytic Hierarchy Process (AHP)</strong> and 
                <strong className="text-slate-900 font-semibold"> NLP crisis triage</strong>.
              </p>

              {/* Key Highlights Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="p-2 rounded-xl bg-amber-50 text-[#D97706]">
                    <Layers className="h-4 w-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">AHP Multi-Factor</span>
                    <span className="text-[11px] text-slate-500">5-Domain Matrix</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">RA 10173 Privacy</span>
                    <span className="text-[11px] text-slate-500">Encrypted Role Access</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <div className="p-2 rounded-xl bg-rose-50 text-[#8B0014]">
                    <Bot className="h-4 w-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">24/7 AI Counselor</span>
                    <span className="text-[11px] text-slate-500">Taglish Crisis Triage</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                <a
                  href="#login-section"
                  className="px-7 py-3.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-base shadow-sm transition active:scale-95 flex items-center gap-2.5"
                >
                  <span>Launch Decision Portal</span>
                  <ChevronRight className="h-5 w-5 text-white" />
                </a>
                <a
                  href="#features"
                  className="px-6 py-3.5 rounded-xl bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200 font-semibold text-base transition shadow-xs"
                >
                  Explore 5-Domain Engine
                </a>
              </div>
            </div>

            {/* Right Login / Quick Access Card */}
            <div id="login-section" className="lg:col-span-5 scroll-mt-24">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative">
                {/* Card Top Banner */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-[#8B0014]" />
                      Sign In to SAPC Portal
                    </h3>
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Secure RBAC
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Select an evaluation role below for 1-click instant login or enter institutional credentials.
                  </p>
                </div>

                {/* 1-Click Role Quick Access */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#8B0014] uppercase tracking-wider block">
                    ⚡ 1-Click Role Access (Evaluation Demo)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickRoles.slice(0, 4).map((r) => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => handleQuickSelect(r)}
                        className="text-left p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200 hover:border-rose-300 transition group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 group-hover:text-[#8B0014]">
                            <span>{r.icon}</span>
                            <span>{r.label}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 group-hover:text-slate-700 mt-1 line-clamp-1">
                          {r.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect(quickRoles[4])}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200 hover:border-rose-300 transition group flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-[#8B0014]">
                      <span>⚙️</span>
                      <span>System Administrator Portal</span>
                    </div>
                    <span className="text-xs text-[#8B0014] font-bold">AHP Matrix & Audit →</span>
                  </button>
                </div>

                {/* Form Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase">or credentials</span>
                  <div className="border-t border-slate-200 w-full" />
                </div>

                {/* Manual Credentials Form */}
                <form onSubmit={handleLogin} className="space-y-4 text-left">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Authenticating Session..." : "Enter Decision Support System"}
                  </button>
                </form>

                {serverError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                    <span>{serverError}</span>
                    <button onClick={retryConnection} className="underline font-bold text-amber-900">Retry</button>
                  </div>
                )}
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
                <em className="font-semibold text-slate-900"> "Humilitas, Caritas et Patiens"</em>, SAPC strives to nurture well-rounded, morally upright, 
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
    </div>
  );
};
