"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Brain, 
  BookOpen, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Bot, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  HeartHandshake,
  ChevronRight,
  ChevronLeft,
  School,
  Activity,
  Award,
  FileSpreadsheet
} from "lucide-react";
import { SapcLogo } from "./SapcLogo";
import { RegistrationModal } from "./RegistrationModal";
import { GoogleRoleSelectionModal } from "./GoogleRoleSelectionModal";

export const LandingPage: React.FC = () => {
  const _router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<"counselor" | "teacher" | "student" | "parent">("counselor");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isGoogleRoleModalOpen, setIsGoogleRoleModalOpen] = useState(false);
  const [googleUserName] = useState("SAPC Member");

  const slides = [
    {
      id: "ahp-synthesis",
      tag: '"A College for the Family" • Pila, Laguna • Est. 1979',
      tagIcon: <GraduationCap className="h-4 w-4 text-amber-500" />,
      tagColor: "bg-amber-50 text-amber-900 border-amber-300",
      headline: "Intelligent Student Decision Support System",
      headlineGradient: "from-[#8B0014] via-[#B91C1C] to-[#D97706]",
      subhead: "Multi-Criteria Failure Prevention Powered by the Analytic Hierarchy Process (AHP)",
      description: "SAPC IntellySys is an institutional decision support platform uniting quarterly SASS academic metrics with Mental Health, Financial, Family, and Physical Wellness factors to calculate calibrated composite failure risk before grades decline.",
      pillars: [
        { label: "AHP Multi-Factor", sub: "5-Domain Synthesis", icon: <Layers className="h-4.5 w-4.5 text-[#D97706]" />, bg: "bg-amber-50 border-amber-200" },
        { label: "Saaty Rigor", sub: "CR = 0.048 ≤ 0.10", icon: <Award className="h-4.5 w-4.5 text-emerald-600" />, bg: "bg-emerald-50 border-emerald-200" },
        { label: "RA 10173 Privacy", sub: "Encrypted RBAC", icon: <ShieldCheck className="h-4.5 w-4.5 text-[#8B0014]" />, bg: "bg-rose-50 border-rose-200" }
      ],
      primaryCta: { label: "Access Decision Portal", href: "/login" },
      secondaryCta: { label: "Explore 5 Domains", href: "#features" },
      previewType: "ahp_matrix"
    },
    {
      id: "ai-counselor",
      tag: "24/7 AI Guidance Counselor • Tagalog / Taglish NLP",
      tagIcon: <Bot className="h-4 w-4 text-rose-600" />,
      tagColor: "bg-rose-50 text-[#8B0014] border-rose-300",
      headline: "Real-Time Mental Health & Crisis Triage Engine",
      headlineGradient: "from-rose-700 via-pink-600 to-amber-600",
      subhead: "Autonomous PHQ-9 & GAD-7 Distress Signal Detection and Counselor Escalation",
      description: "Empowering SAPC students with a safe, confidential Taglish AI guidance companion that detects clinical distress indicators in conversational dialogue and instantly triages priority case files to registered counselors.",
      pillars: [
        { label: "Taglish NLP Triage", sub: "Crisis Escalation", icon: <Bot className="h-4.5 w-4.5 text-rose-600" />, bg: "bg-rose-50 border-rose-200" },
        { label: "PHQ-9 / GAD-7", sub: "Clinical Screener", icon: <Activity className="h-4.5 w-4.5 text-purple-600" />, bg: "bg-purple-50 border-purple-200" },
        { label: "SPI Confidentiality", sub: "Counselor Case File", icon: <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />, bg: "bg-emerald-50 border-emerald-200" }
      ],
      primaryCta: { label: "Launch AI Counselor", href: "/login" },
      secondaryCta: { label: "Guidance Workflow", href: "/login" },
      previewType: "nlp_triage"
    },
    {
      id: "sass-adviser",
      tag: "Class Adviser Ecosystem • DepEd / CHED SASS Ingestion",
      tagIcon: <School className="h-4 w-4 text-amber-600" />,
      tagColor: "bg-amber-50 text-amber-900 border-amber-300",
      headline: "SASS Grade Ingestion & 1-Click Faculty Referrals",
      headlineGradient: "from-amber-700 via-[#8B0014] to-red-600",
      subhead: "Streamline Quarterly Advisory Class Monitoring and Instant Guidance Endorsements",
      description: "Teachers and strand advisers effortlessly upload SASS quarterly CSV grade sheets to compute deterministic academic risk, track attendance deficits, and dispatch 1-click confidential student referrals to the guidance department.",
      pillars: [
        { label: "CSV Ingestion", sub: "Quarterly SASS Sync", icon: <BookOpen className="h-4.5 w-4.5 text-amber-700" />, bg: "bg-amber-50 border-amber-200" },
        { label: "1-Click Referral", sub: "Faculty to Counselor", icon: <HeartHandshake className="h-4.5 w-4.5 text-[#8B0014]" />, bg: "bg-rose-50 border-rose-200" },
        { label: "Absence Tracker", sub: "Early Warning Alert", icon: <Activity className="h-4.5 w-4.5 text-blue-600" />, bg: "bg-blue-50 border-blue-200" }
      ],
      primaryCta: { label: "Class Adviser Portal", href: "/login" },
      secondaryCta: { label: "Register as Faculty", href: "/register" },
      previewType: "teacher_roster"
    },
    {
      id: "stakeholder-ecosystem",
      tag: "4 Dedicated Institutional Roles • Connected Campus",
      tagIcon: <Users className="h-4 w-4 text-blue-600" />,
      tagColor: "bg-blue-50 text-blue-900 border-blue-300",
      headline: "Empowering Students, Parents, Faculty & Administration",
      headlineGradient: "from-blue-700 via-indigo-700 to-[#8B0014]",
      subhead: "Unified Portals: Student Wellness Radars, Parent SMS Alerts & Longitudinal Trends",
      description: "Connecting the entire SAPC family in a unified multi-role portal: students track wellness goals, parents receive automated consultation alerts, teachers manage advisory classes, and counselors deliver proactive care plans.",
      pillars: [
        { label: "4 Role Portals", sub: "Tailored Dashboards", icon: <Users className="h-4.5 w-4.5 text-blue-600" />, bg: "bg-blue-50 border-blue-200" },
        { label: "Parent Progress", sub: "SMS & Consultation", icon: <HeartHandshake className="h-4.5 w-4.5 text-emerald-600" />, bg: "bg-emerald-50 border-emerald-200" },
        { label: "Longitudinal Trends", sub: "Multi-Term Analytics", icon: <Layers className="h-4.5 w-4.5 text-purple-600" />, bg: "bg-purple-50 border-purple-200" }
      ],
      primaryCta: { label: "Create Account", href: "/register" },
      secondaryCta: { label: "Sign In to Portal", href: "/login" },
      previewType: "roles_grid"
    }
  ];

  // Auto-advance carousel every 6 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Fixed Sticky Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs transition-all">
        {/* Top Gold-Maroon Header Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#8B0014]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-3.5 hover:opacity-90 transition group cursor-pointer"
            title="Return to Home"
          >
            <SapcLogo size={44} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight group-hover:text-[#8B0014] transition-colors">
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
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#about" className="hover:text-[#8B0014] transition">About</a>
            <a href="#features" className="hover:text-[#8B0014] transition">Features</a>
            <a href="#contact" className="hover:text-[#8B0014] transition">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/register"
              className="hidden sm:flex px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm border border-amber-300 transition items-center gap-1.5 shadow-2xs"
            >
              <Users className="h-4 w-4 text-[#8B0014]" />
              <span>Create Account</span>
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <span>Access Portal</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Carousel Section with Header Offset */}
      <section 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-b from-white via-slate-50/70 to-white"
      >
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Sliding Track Viewport */}
          <div className="overflow-hidden w-full">
            <div 
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div 
                  key={slide.id}
                  className="w-full shrink-0 min-w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center min-h-[460px] px-1"
                >
                  {/* Left Hero Text */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    
                    {/* Slide Badge */}
                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-extrabold shadow-xs ${slide.tagColor}`}>
                      {slide.tagIcon}
                      <span>{slide.tag}</span>
                    </div>

                    {/* Main Headline */}
                    <div className="space-y-2">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.14]">
                        {slide.headline.split(" ").slice(0, 3).join(" ")}{" "}
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.headlineGradient} block sm:inline`}>
                          {slide.headline.split(" ").slice(3).join(" ")}
                        </span>
                      </h1>
                      <p className="text-sm sm:text-base font-bold text-[#8B0014]">
                        {slide.subhead}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl font-normal">
                      {slide.description}
                    </p>

                    {/* 3 Pillar Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {slide.pillars.map((pil, pIdx) => (
                        <div 
                          key={pIdx}
                          className={`flex items-center gap-3 bg-white p-3.5 rounded-2xl border shadow-2xs transition hover:shadow-xs ${pil.bg}`}
                        >
                          <div className="p-2 rounded-xl bg-white/80 border border-slate-200/80 shrink-0 shadow-2xs">
                            {pil.icon}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">{pil.label}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{pil.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3.5">
                      <Link
                        href={slide.primaryCta.href}
                        className="px-6 py-3.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm sm:text-base shadow-md transition active:scale-95 flex items-center gap-2.5 group"
                      >
                        <span>{slide.primaryCta.label}</span>
                        <ChevronRight className="h-4 w-4 text-white group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <Link
                        href={slide.secondaryCta.href}
                        className="px-5 py-3.5 rounded-xl bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200 font-semibold text-sm sm:text-base transition shadow-xs"
                      >
                        {slide.secondaryCta.label}
                      </Link>
                    </div>

                  </div>

                  {/* Right Showcase Card */}
                  <div className="lg:col-span-5 w-full">
                    <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
                      
                      {/* Decorative Top Accent Bar */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#D97706] via-[#8B0014] to-amber-400" />

                      {/* SHOWCASE 1: AHP Multi-Domain Matrix */}
                      {slide.previewType === "ahp_matrix" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                                <Layers className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-extrabold text-sm text-slate-900">AHP Calibrated Criteria Weights</h3>
                                <span className="text-[11px] text-slate-500">Saaty Eigenvector Vector Synthesis</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              CR: 0.048
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 text-[#8B0014]" /> Academic Domain (w_AC)
                              </span>
                              <strong className="text-[#8B0014] font-black">40.17% (0.4017)</strong>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Brain className="h-3.5 w-3.5 text-rose-600" /> Mental Health Domain (w_MH)
                              </span>
                              <strong className="text-rose-700 font-black">24.42% (0.2442)</strong>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-amber-600" /> Financial Overdue Domain (w_FI)
                              </span>
                              <strong className="text-amber-800 font-black">13.73% (0.1373)</strong>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-blue-600" /> Family Support Domain (w_FA)
                              </span>
                              <strong className="text-blue-800 font-black">13.73% (0.1373)</strong>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-emerald-600" /> Physical Wellness Domain (w_HE)
                              </span>
                              <strong className="text-emerald-800 font-black">7.94% (0.0794)</strong>
                            </div>
                          </div>

                          <Link
                            href="/login"
                            className="w-full py-2.5 px-4 rounded-xl bg-[#8B0014] hover:bg-[#700010] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>Simulate AHP What-If Scenarios</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* SHOWCASE 2: NLP Crisis Triage */}
                      {slide.previewType === "nlp_triage" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                                <Bot className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-extrabold text-sm text-slate-900">Taglish Guidance Dialogue</h3>
                                <span className="text-[11px] text-slate-500">Clinical Screener & Crisis Detection</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                              Distress: 88/100
                            </span>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            <div className="p-3 rounded-2xl bg-slate-100 text-slate-800 self-start max-w-[90%]">
                              <span className="font-bold text-slate-900 block mb-0.5">Student (Joshua):</span>
                              &quot;Sobrang nahihirapan na po ako sa Chemistry at Pre-Cal. Hindi na po ako makatulog sa gabi.&quot;
                            </div>
                            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 self-end">
                              <span className="font-bold text-[#8B0014] block mb-0.5">SAPC Guidance AI:</span>
                              &quot;Naiintindihan ko, Joshua. Normal makaramdam ng overwhelm. Naka-flag na ito sa guidance counselor para matulungan ka sa academic support plan.&quot;
                            </div>
                          </div>

                          <Link
                            href="/login"
                            className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>Open Counselor Triage Queue</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* SHOWCASE 3: Teacher Advisory & Ingestion */}
                      {slide.previewType === "teacher_roster" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                                <School className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-extrabold text-sm text-slate-900">Advisory Class Roster</h3>
                                <span className="text-[11px] text-slate-500">Grade 11 - St. Augustine (STEM)</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              42 Students
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                              <div>
                                <strong className="text-slate-900 block">Joshua Dimaculangan</strong>
                                <span className="text-[11px] text-slate-500">LRN: 109238475612 • 2 Failing Marks</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
                                High Risk (69.8)
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                              <div>
                                <strong className="text-slate-900 block">Angelica Dela Cruz</strong>
                                <span className="text-[11px] text-slate-500">LRN: 109238475613 • Tuition Overdue</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">
                                Medium Risk (45.2)
                              </span>
                            </div>
                          </div>

                          <Link
                            href="/login"
                            className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>Ingest SASS CSV & Refer Students</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* SHOWCASE 4: 5 Roles Grid */}
                      {slide.previewType === "roles_grid" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                                <Users className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-extrabold text-sm text-slate-900">4 Institutional Role Portals</h3>
                                <span className="text-[11px] text-slate-500">Select any role to explore live</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                              Live Access
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <Link 
                              href="/login"
                              className="p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 flex items-center justify-between transition group"
                            >
                              <span className="font-extrabold text-slate-900">🧠 Guidance Counselor (Crisis Triage)</span>
                              <span className="text-[#8B0014] font-bold group-hover:translate-x-0.5 transition">Login →</span>
                            </Link>
                            <Link 
                              href="/login"
                              className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 flex items-center justify-between transition group"
                            >
                              <span className="font-extrabold text-slate-900">📚 Class Adviser (SASS Ingestion)</span>
                              <span className="text-amber-800 font-bold group-hover:translate-x-0.5 transition">Login →</span>
                            </Link>
                            <Link 
                              href="/login"
                              className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 flex items-center justify-between transition group"
                            >
                              <span className="font-extrabold text-slate-900">🎓 Student Portal (Wellness Radar)</span>
                              <span className="text-emerald-800 font-bold group-hover:translate-x-0.5 transition">Login →</span>
                            </Link>
                            <Link 
                              href="/login"
                              className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 flex items-center justify-between transition group"
                            >
                              <span className="font-extrabold text-slate-900">👨‍👩‍👦 Parent / Guardian (Progress Alerts)</span>
                              <span className="text-blue-800 font-bold group-hover:translate-x-0.5 transition">Login →</span>
                            </Link>
                          </div>

                          <Link
                            href="/register"
                            className="w-full py-2.5 px-4 rounded-xl bg-[#8B0014] hover:bg-[#700010] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>Create New Student or Faculty Account</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Carousel Dot Indicators & Controls */}
          <div className="flex items-center justify-center gap-4 mt-8 pt-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              aria-label="Previous Slide"
              className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-[#8B0014] border border-slate-200 hover:border-rose-200 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx
                      ? "w-8 bg-[#8B0014] shadow-xs"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              aria-label="Next Slide"
              className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-[#8B0014] border border-slate-200 hover:border-rose-200 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-xs space-y-2 hover:border-[#8B0014]/40 transition">
                <span className="text-4xl font-black text-[#8B0014] block">1,250+</span>
                <strong className="text-sm font-bold text-slate-900 block">Students Monitored</strong>
                <p className="text-xs text-slate-500">Across Senior High School & College strands</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-xs space-y-2 hover:border-emerald-400 transition">
                <span className="text-4xl font-black text-emerald-600 block">98.4%</span>
                <strong className="text-sm font-bold text-slate-900 block">Early Intervention Resolution</strong>
                <p className="text-xs text-slate-500">Timely proactive academic & wellness care plans</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-xs space-y-2 hover:border-emerald-400 transition">
                <span className="text-4xl font-black text-emerald-600 block">100%</span>
                <strong className="text-sm font-bold text-slate-900 block">RA 10173 Privacy Sealed</strong>
                <p className="text-xs text-slate-500">Encrypted role-based access for student data protection</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-xs space-y-2 hover:border-blue-400 transition">
                <span className="text-4xl font-black text-blue-600 block">24/7</span>
                <strong className="text-sm font-bold text-slate-900 block">Guidance Support</strong>
                <p className="text-xs text-slate-500">Real-time student companion & crisis counselor alerts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section (6 Cards) */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-[#8B0014] border border-rose-200 shadow-2xs mb-2">
            Engine Architecture
          </div>
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
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-[#8B0014] border border-rose-200 shadow-2xs mb-2">
            Operational Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            How IntellySys Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
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
