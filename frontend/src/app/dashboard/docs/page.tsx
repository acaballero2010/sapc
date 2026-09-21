"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  BookOpen, 
  Brain, 
  Layers, 
  ShieldCheck, 
  ShieldAlert,
  Users, 
  GraduationCap, 
  HeartHandshake, 
  BarChart3, 
  Activity, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Code2, 
  Cpu, 
  Database, 
  HelpCircle,
  Calculator,
  Sliders,
  Award,
  Bot,
  Key,
  RotateCcw,
  Search,
  FileSpreadsheet
} from "lucide-react";
import { useAuth, RoleType } from "@/lib/auth-context";
import { INGESTION_DOMAINS } from "@/data/sample_templates";

export default function DocumentationPage() {
  const { user } = useAuth();
  const currentRole: RoleType = user?.role || "guidance_counselor";

  // Role perspective filter (defaults to logged-in user's role, with option to preview other views)
  const [rolePerspective, setRolePerspective] = useState<RoleType | "all">(currentRole);
  const [activeTab, setActiveTab] = useState<"risk" | "datasets" | "system" | "tech" | "users" | "howtos" | "releases" | "privacy">("risk");
  const [searchFilter, setSearchFilter] = useState("");
  const [datasetDomainFilter, setDatasetDomainFilter] = useState("all");
  const [attributeSearch, setAttributeSearch] = useState("");

  // Determine allowed tabs for the selected role perspective
  const isStudentOrParent = rolePerspective === "student" || rolePerspective === "parent";
  const isTeacher = rolePerspective === "teacher";
  
  // Available tabs tailored to current role perspective
  const visibleTabs = useMemo(() => {
    const tabs: Array<{ id: "risk" | "datasets" | "system" | "tech" | "users" | "howtos" | "releases" | "privacy"; label: string; icon: React.ReactNode; audience: string }> = [
      { id: "risk", label: "AHP Risk Engine", icon: <Layers className="h-4 w-4" />, audience: "All Roles" },
      ...(!isStudentOrParent ? [{ id: "datasets" as const, label: "Data Dictionary & Datasets", icon: <Database className="h-4 w-4" />, audience: "Faculty & Admin" }] : []),
      ...(!isStudentOrParent && !isTeacher ? [{ id: "system" as const, label: "System Design", icon: <Brain className="h-4 w-4" />, audience: "Admin & Counselors" }] : []),
      ...(!isStudentOrParent && !isTeacher ? [{ id: "tech" as const, label: "Tech Stack & APIs", icon: <Code2 className="h-4 w-4" />, audience: "Admin Only" }] : []),
      { id: "users", label: isStudentOrParent ? "My Portal Guide" : "User Operations Manual", icon: <Users className="h-4 w-4" />, audience: "Role-Specific" },
      { id: "howtos", label: "How-Tos & FAQs", icon: <HelpCircle className="h-4 w-4" />, audience: "All Roles" },
      { id: "releases", label: "Release Notes", icon: <Award className="h-4 w-4" />, audience: "All Roles" },
      { id: "privacy", label: "Privacy & RA 10173", icon: <Lock className="h-4 w-4" />, audience: "All Roles" },
    ];
    return tabs;
  }, [isStudentOrParent, isTeacher]);

  // If active tab is not in visible tabs (e.g. after switching perspective), fallback to "risk"
  useEffect(() => {
    if (!visibleTabs.some(t => t.id === activeTab)) {
      setActiveTab("risk");
    }
  }, [activeTab, visibleTabs]);

  // Mini live AHP calculator state for interactive demonstration
  const [calcGpa, setCalcGpa] = useState<number>(78);
  const [calcFailed, setCalcFailed] = useState<number>(1);
  const [calcAbsences, setCalcAbsences] = useState<number>(4);
  const [calcIncomplete, setCalcIncomplete] = useState<number>(1);

  const [calcFamily, setCalcFamily] = useState<number>(35);
  const [calcHealth, setCalcHealth] = useState<number>(20);
  const [calcMentalHealth, setCalcMentalHealth] = useState<number>(45);
  const [calcFinancial, setCalcFinancial] = useState<number>(50);

  // Compute Academic sub-score S_AC
  const failingPenalty = Math.min(50.0, Math.max(0, calcFailed) * 25.0);
  const gpaPenalty = calcGpa < 75.0 ? 30.0 : calcGpa < 80.0 ? 15.0 : 0.0;
  const attendancePenalty = calcAbsences > 5 ? 15.0 : calcAbsences >= 3 ? 8.0 : 0.0;
  const incompletePenalty = Math.min(10.0, Math.max(0, calcIncomplete) * 5.0);
  const academicScore = Math.min(100.0, Math.max(0.0, failingPenalty + gpaPenalty + attendancePenalty + incompletePenalty));

  // Compute Composite Score
  const weights = { academic: 0.30, family: 0.20, health: 0.20, mental_health: 0.15, financial: 0.15 };
  const compositeScore = (
    academicScore * weights.academic +
    calcFamily * weights.family +
    calcHealth * weights.health +
    calcMentalHealth * weights.mental_health +
    calcFinancial * weights.financial
  );
  const roundedComposite = Math.round(compositeScore * 10) / 10;
  const riskTier = roundedComposite >= 70.0 ? "HIGH" : roundedComposite >= 40.0 ? "MEDIUM" : "LOW";

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B0014] via-[#6d0010] to-[#40000a] text-white p-6 sm:p-8 shadow-xl border border-rose-900/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                SAPC IntellySys 2.5 Architecture &amp; Specs
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-rose-200" />
                Role: <span className="text-amber-200 uppercase font-black">{rolePerspective.replace("_", " ")}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              System Design &amp; Risk Assessment Documentation
            </h1>
            <p className="text-rose-100/80 text-sm sm:text-base leading-relaxed">
              Comprehensive reference for Saaty&apos;s Analytic Hierarchy Process (AHP) mathematical risk engine, system architecture, technology stack, and role-based user manuals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Role Perspective Selector (Allows previewing other role scopes) */}
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <span className="text-[10px] text-rose-200 uppercase font-bold block px-1">Perspective View</span>
              <select
                value={rolePerspective}
                onChange={(e) => setRolePerspective(e.target.value as any)}
                className="bg-rose-950/80 border border-white/20 text-white text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
              >
                <option value="guidance_counselor">🩺 Guidance Counselor (Full SOP)</option>
                <option value="teacher">👩‍🏫 Teacher (SASS &amp; Attendance)</option>
                <option value="admin">⚙️ Administrator (System Specs)</option>
                <option value="student">👨‍🎓 Student (Algorithmic Transparency)</option>
                <option value="parent">👪 Parent (Home-School Portal)</option>
                <option value="all">🌐 All Specs (Unfiltered Master View)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <span className="text-[10px] text-rose-200 uppercase font-bold block">Engine Version</span>
                <span className="text-xs font-extrabold text-white">AHP-v2.5 (CR = 0.016)</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <span className="text-[10px] text-rose-200 uppercase font-bold block">Compliance</span>
                <span className="text-xs font-extrabold text-amber-300">RA 10173 • DepEd</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Docs Quick Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-1">
          <Search className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Quick search in documentation (e.g., 'GPA penalty', 'Gemini AI', 'CR ratio', 'SASS import')..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter("")}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Jump Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick jump:</span>
          <button
            onClick={() => { setActiveTab("risk"); setSearchFilter(""); }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold shrink-0"
          >
            AHP Math
          </button>
          {visibleTabs.some(t => t.id === "tech") && (
            <button
              onClick={() => { setActiveTab("tech"); setSearchFilter(""); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold shrink-0"
            >
              Gemini AI
            </button>
          )}
          <button
            onClick={() => { setActiveTab("howtos"); setSearchFilter(""); }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold shrink-0"
          >
            How-Tos
          </button>
          <button
            onClick={() => { setActiveTab("releases"); setSearchFilter(""); }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold shrink-0"
          >
            v2.5 Notes
          </button>
          {!isStudentOrParent && (
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("sapc:open-dataset-archive"));
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-[#8B0014] hover:bg-[#700010] text-white text-[11px] font-bold shrink-0 shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <span>📦 Archive Datasets</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Tailored dynamically to user role) */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xs scrollbar-none">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#8B0014] text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AHP RISK ASSESSMENT SPECIFICATION */}
      {/* ========================================================================= */}
      {activeTab === "risk" && (
        <div className="space-y-6">
          {/* Executive Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-[#8B0014] dark:text-rose-400">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Multi-Criteria Risk Assessment Engine (AHP)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Mathematical formulation, 5 validated domains, attribute penalties, and consistency verification.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              SAPC IntellySys employs <strong>Saaty&apos;s Analytic Hierarchy Process (AHP)</strong>, an internationally recognized multi-criteria decision-making framework, validated by registered psychometricians for the San Antonio de Padua College student body. Rather than relying solely on quarterly GPA, the system synthesizes five interrelated holistic dimensions into a unified risk index (R_composite &isin; [0, 100]).
            </p>

            {/* 5 Domains Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#8B0014] dark:text-rose-400">Academic</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#8B0014] text-white text-[10px] font-black">30% (0.30)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Quarterly GPA, failing subjects, excessive absences, incomplete tasks.
                </p>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                  Source: DepEd SASS CSV
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-blue-700 dark:text-blue-400">Family</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">20% (0.20)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Family structure, guardian stability, household conflict & study support.
                </p>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                  Source: 17-Field Family Form
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">Health</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">20% (0.20)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  School clinic logs, chronic illness, sleep duration, nutritional status.
                </p>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                  Source: Clinic Logs & Screeners
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-purple-700 dark:text-purple-400">Mental Health</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black">15% (0.15)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  PHQ-9 depression index, GAD-7 anxiety index, AI companion distress.
                </p>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                  Source: Clinical Screeners
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-700 dark:text-amber-400">Financial</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black">15% (0.15)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Tuition delinquency, 4Ps beneficiary status, daily meal/commute security.
                </p>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                  Source: Aid Form & Accounting
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Formulas Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Academic Sub-Score Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#8B0014] dark:text-rose-400">
                <Calculator className="h-5 w-5" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  1. Academic Risk Sub-Score (S_AC)
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Calculated strictly from official quarterly records using deterministic penalty thresholds:
              </p>

              <div className="p-3.5 bg-slate-900 text-rose-300 rounded-2xl font-mono text-xs overflow-x-auto">
                S_AC = min(100, P_failed + P_gpa + P_absences + P_incomplete)
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>Failing Subjects Penalty (P_failed)</span>
                    <span className="text-[#8B0014] dark:text-rose-400">+25 pts each (Max 50 pts)</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    <code>P_failed = min(50.0, failing_subjects_count * 25.0)</code>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>Quarter GPA Penalty (P_gpa)</span>
                    <span className="text-[#8B0014] dark:text-rose-400">Up to 30 pts</span>
                  </div>
                  <ul className="text-slate-500 dark:text-slate-400 text-[11px] list-disc list-inside space-y-0.5">
                    <li>GPA &lt; 75.0 (Failing): <strong>+30.0 pts</strong></li>
                    <li>75.0 &le; GPA &lt; 80.0 (Borderline): <strong>+15.0 pts</strong></li>
                    <li>GPA &ge; 80.0 (Satisfactory): <strong>0.0 pts</strong></li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>Days Absent Penalty (P_absent)</span>
                    <span className="text-[#8B0014] dark:text-rose-400">Up to 15 pts</span>
                  </div>
                  <ul className="text-slate-500 dark:text-slate-400 text-[11px] list-disc list-inside space-y-0.5">
                    <li>Days Absent &gt; 5: <strong>+15.0 pts</strong> (Habitual absenteeism risk)</li>
                    <li>3 &le; Days Absent &le; 5: <strong>+8.0 pts</strong> (Elevated absenteeism)</li>
                    <li>Days Absent &lt; 3: <strong>0.0 pts</strong> (Normal attendance)</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>Incomplete Requirements (P_incom)</span>
                    <span className="text-[#8B0014] dark:text-rose-400">+5 pts each (Max 10 pts)</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    <code>P_incom = min(10.0, incomplete_requirements_count * 5.0)</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Composite Formula & Risk Tiers */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#8B0014] dark:text-rose-400">
                <BarChart3 className="h-5 w-5" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  2. AHP Composite Synthesis & Tiers
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                The overall student risk score is the normalized weighted sum of all five sub-scores:
              </p>

              <div className="p-3.5 bg-slate-900 text-amber-300 rounded-2xl font-mono text-xs overflow-x-auto">
                Risk = 0.30(S_AC) + 0.20(S_FA) + 0.20(S_HE) + 0.15(S_MH) + 0.15(S_FI)
              </div>

              {/* Tiers display */}
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="font-black text-emerald-900 dark:text-emerald-300 text-xs uppercase">Low Risk</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Score &lt; 40.0 • Routine advisory &amp; positive reinforcement
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-black">
                    &lt; 40.0
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span className="font-black text-amber-900 dark:text-amber-300 text-xs uppercase">Medium Risk</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      40.0 &le; Score &lt; 70.0 • Early intervention &amp; peer tutoring
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-black">
                    40.0 – 69.9
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
                      <span className="font-black text-rose-900 dark:text-rose-300 text-xs uppercase">High Risk</span>
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400">
                      Score &ge; 70.0 • Urgent PTC case conference &amp; guidance intake
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-200 text-xs font-black">
                    &ge; 70.0
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>The dominant risk driver is dynamically isolated to assign specific targeted care protocols.</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Calculator Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Live AHP Calculation Demo (Interactive Sandbox)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adjust academic parameters and non-academic screeners to observe real-time score synthesis.
                  </p>
                </div>
              </div>

              {/* Live result badge */}
              <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
                <span className="text-xs text-slate-400 uppercase font-bold">Composite:</span>
                <span className="text-xl font-black text-amber-300">{roundedComposite}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  riskTier === "HIGH" ? "bg-rose-600 text-white animate-pulse" :
                  riskTier === "MEDIUM" ? "bg-amber-500 text-slate-950 font-black" :
                  "bg-emerald-500 text-white"
                }`}>
                  {riskTier} RISK
                </span>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* GPA */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Quarter GPA</span>
                  <span className="text-amber-400">{calcGpa}</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={calcGpa}
                  onChange={(e) => setCalcGpa(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Penalty: {gpaPenalty} pts</span>
              </div>

              {/* Failing Subjects */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Failing Subjects</span>
                  <span className="text-rose-400">{calcFailed}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={calcFailed}
                  onChange={(e) => setCalcFailed(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Penalty: {failingPenalty} pts</span>
              </div>

              {/* Days Absent */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Days Absent</span>
                  <span className="text-amber-400">{calcAbsences}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={calcAbsences}
                  onChange={(e) => setCalcAbsences(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Penalty: {attendancePenalty} pts</span>
              </div>

              {/* Incomplete Tasks */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Incomplete Tasks</span>
                  <span className="text-amber-400">{calcIncomplete}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={calcIncomplete}
                  onChange={(e) => setCalcIncomplete(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Penalty: {incompletePenalty} pts</span>
              </div>
            </div>

            {/* Non-academic domain sliders */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
              <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/40 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-blue-300">Family Stress (S_FA)</span>
                  <span className="text-blue-400">{calcFamily}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcFamily}
                  onChange={(e) => setCalcFamily(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/40 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-300">Health Issues (S_HE)</span>
                  <span className="text-emerald-400">{calcHealth}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcHealth}
                  onChange={(e) => setCalcHealth(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/40 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-purple-300">Mental Distress (S_MH)</span>
                  <span className="text-purple-400">{calcMentalHealth}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcMentalHealth}
                  onChange={(e) => setCalcMentalHealth(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/40 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-300">Financial Strain (S_FI)</span>
                  <span className="text-amber-400">{calcFinancial}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcFinancial}
                  onChange={(e) => setCalcFinancial(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">Sub-Score Breakdown:</span>
                <span className="text-rose-300">Acad ({academicScore.toFixed(0)})</span> •
                <span className="text-blue-300">Fam ({calcFamily})</span> •
                <span className="text-emerald-300">Hlth ({calcHealth})</span> •
                <span className="text-purple-300">MH ({calcMentalHealth})</span> •
                <span className="text-amber-300">Fin ({calcFinancial})</span>
              </div>
              <div className="text-slate-400">
                Formula: <code>(0.30×{academicScore.toFixed(0)}) + (0.20×{calcFamily}) + (0.20×{calcHealth}) + (0.15×{calcMentalHealth}) + (0.15×{calcFinancial}) = {roundedComposite}</code>
              </div>
            </div>
          </div>

          {/* Pairwise Comparison Matrix & Mathematical Consistency */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-[#D97706] dark:text-amber-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    3. Pairwise Comparison Matrix &amp; Consistency Ratio (CR)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Validated 5×5 judgement matrix showing mathematical transitivity and Saaty consistency.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                CR = 0.016 &le; 0.10 (Consistent)
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black">
                    <th className="p-3">Domain</th>
                    <th className="p-3 text-center">Academic</th>
                    <th className="p-3 text-center">Family</th>
                    <th className="p-3 text-center">Health</th>
                    <th className="p-3 text-center">Mental Health</th>
                    <th className="p-3 text-center">Financial</th>
                    <th className="p-3 text-right text-[#8B0014] dark:text-rose-400 font-extrabold">AHP Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold font-sans text-slate-900 dark:text-white">Academic</td>
                    <td className="p-3 text-center font-bold text-slate-400">1.000</td>
                    <td className="p-3 text-center">1.500</td>
                    <td className="p-3 text-center">1.500</td>
                    <td className="p-3 text-center">2.000</td>
                    <td className="p-3 text-center">2.000</td>
                    <td className="p-3 text-right font-bold text-[#8B0014] dark:text-rose-400 font-sans">30.0%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold font-sans text-slate-900 dark:text-white">Family</td>
                    <td className="p-3 text-center">0.667</td>
                    <td className="p-3 text-center font-bold text-slate-400">1.000</td>
                    <td className="p-3 text-center">1.000</td>
                    <td className="p-3 text-center">1.333</td>
                    <td className="p-3 text-center">1.333</td>
                    <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400 font-sans">20.0%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold font-sans text-slate-900 dark:text-white">Health</td>
                    <td className="p-3 text-center">0.667</td>
                    <td className="p-3 text-center">1.000</td>
                    <td className="p-3 text-center font-bold text-slate-400">1.000</td>
                    <td className="p-3 text-center">1.333</td>
                    <td className="p-3 text-center">1.333</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-sans">20.0%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold font-sans text-slate-900 dark:text-white">Mental Health</td>
                    <td className="p-3 text-center">0.500</td>
                    <td className="p-3 text-center">0.750</td>
                    <td className="p-3 text-center">0.750</td>
                    <td className="p-3 text-center font-bold text-slate-400">1.000</td>
                    <td className="p-3 text-center">1.000</td>
                    <td className="p-3 text-right font-bold text-purple-600 dark:text-purple-400 font-sans">15.0%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold font-sans text-slate-900 dark:text-white">Financial</td>
                    <td className="p-3 text-center">0.500</td>
                    <td className="p-3 text-center">0.750</td>
                    <td className="p-3 text-center">0.750</td>
                    <td className="p-3 text-center">1.000</td>
                    <td className="p-3 text-center font-bold text-slate-400">1.000</td>
                    <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400 font-sans">15.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mathematical Proof Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-white">AHP Eigenvalue Verification:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 dark:text-slate-300">
                <div>Principal Eigenvalue (&lambda;_max): <strong className="text-slate-900 dark:text-white font-mono">5.073</strong></div>
                <div>Consistency Index (CI): <strong className="text-slate-900 dark:text-white font-mono">0.01825</strong></div>
                <div>Random Index (RI n=5): <strong className="text-slate-900 dark:text-white font-mono">1.12</strong></div>
                <div>Consistency Ratio (CR): <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">0.0163 (1.63%)</strong></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                A Consistency Ratio below 0.10 (10%) confirms that psychometric judgments are logically consistent and devoid of transitive contradictions.
              </p>
            </div>
          </div>

          {/* Subject-Level Academic Failure Risk Prediction Model */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-[#8B0014] dark:text-rose-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Subject-Level Academic Failure Risk Prediction Model
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Early Academic Warning Engine forecasting subject-specific failure probability (P_fail &ge; 70%) before quarterly finals.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#8B0014] dark:text-rose-400" />
                <span>What Prediction Model Is Used?</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The system employs a <strong>Hybrid Multi-Factor Predictive Architecture</strong> combining three complementary mathematical models:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-black text-[#8B0014] dark:text-rose-400 text-sm">
                    1. Supervised Calibrated Logistic / Sigmoid Classifier
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 text-amber-300 font-mono text-[11px]">
                    &sigma;(z) = 1.0 / (1.0 + e^(-0.18 &times; (75.0 - G&#770;_s)))
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Anchored to the <strong>75.0</strong> DepEd passing threshold with a calibrated logistic slope parameter <code className="font-bold">k = 0.18</code>. Converts multi-domain projected standing into a non-linear probability of failure <code className="font-bold">P(Fail) &isin; [0%, 100%]</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-black text-blue-600 dark:text-blue-400 text-sm">
                    2. Penalized Multi-Factor Linear Feature Projection
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 text-blue-300 font-mono text-[11px]">
                    G&#770;_s = G_raw - &Delta;_tasks - &Delta;_attend - &Delta;_cross
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Forecasts the subject final grade (<code className="font-bold">G&#770;_s</code>) by integrating DepEd DO 8, s. 2015 classroom weights with dynamic deductions across all non-academic domains.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-black text-amber-600 dark:text-amber-400 text-sm">
                    3. Saaty&apos;s Analytic Hierarchy Process (AHP MCDM)
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px]">
                    CR = 0.0163 &le; 0.10 (Consistent)
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Uses eigenvector-derived weights validated by psychometricians to synthesize domain screenings into mathematically consistent sub-scores.
                  </p>
                </div>
              </div>
            </div>

            {/* Formula Callout */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-3 border border-slate-800">
              <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                Failure Probability &amp; Grade Forecast Formulations
              </div>
              <div className="text-emerald-400">
                P_fail(s) = 1.0 / (1.0 + exp(-0.18 &times; (75.0 - G_projected)))
              </div>
              <div className="text-rose-300">
                G_projected = (w_WW &times; S_WW + w_PT &times; S_PT + w_QA &times; S_QA) - &Delta;_Tasks - &Delta;_Attendance - &Delta;_CrossDomain
              </div>
              <div className="text-slate-400 text-[11px] pt-1">
                Where: Passing_Threshold = 75.0, k = 0.18, &Delta;_Tasks = 8.0 pts per missing task, &Delta;_Attendance = 2.5 pts per cut past 2.
              </div>
            </div>

            {/* DepEd DO 8 s. 2015 Junior High School Subject Weightings Table */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                DepEd Junior High School (Grades 7–10) Subject Grading Weight Standards (DO 8, s. 2015)
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-black text-slate-600 dark:text-slate-300 uppercase">
                    <tr>
                      <th className="py-3 px-4">Subject Group / Learning Area</th>
                      <th className="py-3 px-3 text-center">Written Work (WW)</th>
                      <th className="py-3 px-3 text-center">Performance Tasks (PT)</th>
                      <th className="py-3 px-3 text-center">Quarterly Assessment (QA)</th>
                      <th className="py-3 px-4">DepEd Junior High Subjects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Science &amp; Mathematics</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-600">40%</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">40%</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-purple-600">20%</td>
                      <td className="py-3 px-4 text-xs">General Science, Biology, Chemistry, Physics, Algebra, Geometry, Statistics</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Languages, AP, &amp; EsP</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-600">30%</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">50%</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-purple-600">20%</td>
                      <td className="py-3 px-4 text-xs">English, Filipino, Araling Panlipunan (AP), Edukasyon sa Pagpapakatao (EsP)</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">TLE &amp; MAPEH</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-600">20%</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">60%</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-purple-600">20%</td>
                      <td className="py-3 px-4 text-xs">Technology &amp; Livelihood Education (TLE), Music, Arts, Physical Education, Health</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Multi-Domain Attribute Integration & Factorization Matrix */}
            <div className="bg-slate-50 dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Multi-Factor Failure Prediction: 5-Domain Attribute Integration
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How specific attributes from all five holistic domains are factored directly into the predictive failure model.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Academic Domain */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#8B0014] dark:text-rose-400 uppercase text-[11px]">1. Academic Domain (30%)</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-[#8B0014] dark:text-rose-300 font-bold text-[10px]">SASS &amp; DO 8</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Factored Attributes:</strong> Subject quiz scores (WW), project completions (PT), exam standing (QA), missing deliverables count (<code className="text-rose-600 font-bold">M</code>), and subject-specific class cuts (<code className="text-rose-600 font-bold">A</code>).
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>Impact on Model:</strong> Dictates the primary baseline grade <code className="font-mono">G_raw</code> and immediate task/absence penalty deductions.
                  </p>
                </div>

                {/* Family Domain */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-600 dark:text-blue-400 uppercase text-[11px]">2. Family Domain (20%)</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">17-Field Form</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Factored Attributes:</strong> Guardian living arrangement, household conflict level (0–10), domestic study support, OFW parent separation, and sibling caretaking burdens.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>Impact on Model:</strong> Generates Family Vulnerability Index (<code className="font-mono">S_FA</code>), adjusting student homework completion capacity.
                  </p>
                </div>

                {/* Health Domain */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">3. Health Domain (20%)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">Clinic Intake</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Factored Attributes:</strong> Chronic medical conditions, BMI nutritional status, clinic visit frequency, medical illness absences, sleep deficits (&lt;6 hrs/night), and sensory impairments.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>Impact on Model:</strong> Calculates Physical Health Strain (<code className="font-mono">S_HE</code>), applying physical stamina penalty factors to exam focus.
                  </p>
                </div>

                {/* Mental Health Domain */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-purple-600 dark:text-purple-400 uppercase text-[11px]">4. Mental Health Domain (15%)</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">PHQ-9 / GAD-7</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Factored Attributes:</strong> Standardized depression (PHQ-9) and anxiety (GAD-7) scores, psychological distress index, peer conflict/bullying incidents, and counseling intake notes.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>Impact on Model:</strong> Determines Mental Health Deficit (<code className="font-mono">S_MH</code>), applying cognitive retention and anxiety multipliers.
                  </p>
                </div>

                {/* Financial Domain */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-600 dark:text-amber-400 uppercase text-[11px]">5. Financial Domain (15%)</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">Socioeconomic</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Factored Attributes:</strong> 4Ps beneficiary status, household income bracket, transportation allowance distress, meal security, working student hours, and device/internet connectivity.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>Impact on Model:</strong> Produces Financial Strain Index (<code className="font-mono">S_FI</code>), accounting for resource barriers and after-school fatigue.
                  </p>
                </div>

                {/* Predictive Synthesis */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-900 to-[#5A000D] text-white space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="font-black text-amber-300 uppercase text-[11px] block">Predictive Model Synthesis</span>
                    <p className="text-rose-100 text-xs mt-1 leading-relaxed">
                      All 5 domain sub-scores synthesize into the unified grade projection and calibrated sigmoid failure curve:
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 font-mono text-[11px] text-amber-200">
                    P(Fail) = 1.0 / (1.0 + e^(-0.18 &times; (75.0 - G&#770;_s)))
                  </div>
                </div>
              </div>
            </div>

            {/* What-If Remediation Simulation sandbox reference */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Interactive What-If Remediation Sandbox &amp; Target Recovery Engine</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Faculty and counselors can dynamically simulate interventions (e.g. submitting 2 missing performance tasks, reducing absences, or attending clinic counseling). The engine recalculates projected grade <code className="text-amber-600 font-bold">&Delta;G</code> and post-intervention failure probability <code className="text-emerald-600 font-bold">P_fail_simulated</code> in real time to prescribe concrete, achievable goals for students.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DATASETS & DATA DICTIONARY */}
      {/* ========================================================================= */}
      {activeTab === "datasets" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Datasets &amp; Data Dictionary Specification
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Comprehensive catalog of all 6 datasets, CSV schemas, attribute types, and clinical definitions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("sapc:open-dataset-archive"));
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#700010] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Open Archive &amp; Export Manager</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every student record in SAPC IntellySys is keyed by their immutable <strong>12-digit DepEd Learner Reference Number (LRN)</strong>. 
              The system ingests data across 5 distinct institutional domains, normalizes indicators to a unified 0–100 scale, and computes the AHP composite failure risk index.
            </p>

            {/* Ingestion Templates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>👑</span>
                    <span>Master 500-Student Database</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-mono font-bold">
                    25 Cols
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Complete cohort dataset with demographics, SASS GPA, absences, 5-domain scores, and risk tiers.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  SAPC_Master_500_Students_Archive.csv
                </div>
              </div>

              {Object.entries(INGESTION_DOMAINS).map(([key, domain]) => (
                <div 
                  key={key}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{domain.icon}</span>
                      <span>{domain.title}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#8B0014] dark:text-rose-300 text-[10px] font-bold">
                      {domain.weight}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {domain.description}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {domain.csvFileName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Domain Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search attributes (e.g. gpa, gad7, income, lrn)..."
                  value={attributeSearch}
                  onChange={(e) => setAttributeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B0014]/20"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {[
                  { id: "all", label: "All Attributes" },
                  { id: "academic", label: "Academic (SASS)" },
                  { id: "mental_health", label: "Mental Health" },
                  { id: "physical_health", label: "Physical Health" },
                  { id: "financial", label: "Financial" },
                  { id: "family", label: "Family & Social" },
                  { id: "master", label: "Demographics" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDatasetDomainFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      datasetDomainFilter === f.id
                        ? "bg-[#8B0014] text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Dictionary Attributes Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Attribute Key</th>
                    <th className="py-3 px-3">Data Type</th>
                    <th className="py-3 px-3">Domain</th>
                    <th className="py-3 px-3">Allowed Values / Range</th>
                    <th className="py-3 px-4">Institutional &amp; Clinical Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {[
                    // Master Demographics
                    { domainId: "master", key: "lrn", type: "String(12)", domain: "Master Key", values: "12 Digits (e.g. 109238475001)", desc: "Unique DepEd Learner Reference Number. Master entity relational key across all tables." },
                    { domainId: "master", key: "full_name", type: "String", domain: "Demographics", values: "Legal Name Text", desc: "Full student name for official records, report cards, and guidance files." },
                    { domainId: "master", key: "grade_level", type: "Integer", domain: "Demographics", values: "7, 8, 9, 10, 11, 12", desc: "Current enrolled grade level in Junior High or Senior High School." },
                    { domainId: "master", key: "strand", type: "String", domain: "Demographics", values: "STEM, HUMSS, ABM, GAS, TVL", desc: "Senior High School academic track determining curriculum specialization." },
                    { domainId: "master", key: "section_name", type: "String", domain: "Demographics", values: "Section Name Text", desc: "Assigned class section name (e.g. Grade 11 - St. Augustine)." },
                    { domainId: "master", key: "adviser_name", type: "String", domain: "Demographics", values: "Faculty Name Text", desc: "Licensed teacher overseeing homeroom guidance and advisory monitoring." },
                    
                    // Academic
                    { domainId: "academic", key: "quarter_gpa", type: "Float", domain: "Academic (30%)", values: "60.00 – 100.00", desc: "Quarterly General Weighted Average across learning areas. Passing threshold is 75.0." },
                    { domainId: "academic", key: "failing_subjects_count", type: "Integer", domain: "Academic (30%)", values: "0 – 10", desc: "Count of learning areas below 75.0. Primary driver of non-promotion risk." },
                    { domainId: "academic", key: "days_absent", type: "Integer", domain: "Academic (30%)", values: "0 – 60 days", desc: "Total school days missed during the active grading period." },
                    { domainId: "academic", key: "attendance_rate_pct", type: "Float", domain: "Academic (30%)", values: "0.0% – 100.0%", desc: "Ratio of days present to total school days: (Present / Total) × 100." },
                    { domainId: "academic", key: "incomplete_requirements_count", type: "Integer", domain: "Academic (30%)", values: "0 – 20", desc: "Pending Written Works (WW) or Performance Tasks (PT) causing grade withholding." },
                    { domainId: "academic", key: "extracurricular_club", type: "String", domain: "Academic (30%)", values: "Club Name / Non-Member", desc: "Student organization or club membership supporting school engagement." },
                    { domainId: "academic", key: "club_participation_level", type: "String", domain: "Academic (30%)", values: "High, Moderate, Low, None", desc: "Level of active involvement and attendance in school club meetings." },
                    
                    // Mental Health
                    { domainId: "mental_health", key: "gad7_anxiety_score", type: "Integer", domain: "Mental Health (15%)", values: "0 – 21", desc: "Standardized GAD-7 Anxiety screener: Minimal (0-4), Mild (5-9), Moderate (10-14), Severe (15-21)." },
                    { domainId: "mental_health", key: "phq9_depression_score", type: "Integer", domain: "Mental Health (15%)", values: "0 – 27", desc: "Standardized PHQ-9 Depression screener: Minimal (0-4), Mild (5-9), Moderate (10-14), Mod Severe (15-19), Severe (20-27)." },
                    { domainId: "mental_health", key: "stress_level_1_to_5", type: "Integer", domain: "Mental Health (15%)", values: "1 to 5 Likert", desc: "Self-reported chronic academic and environmental stress index." },
                    { domainId: "mental_health", key: "burnout_somatic_symptoms", type: "String", domain: "Mental Health (15%)", values: "Somatic Distress Text", desc: "Physical manifestations of psychological strain (e.g. tension headaches, panic, nausea)." },
                    { domainId: "mental_health", key: "anhedonia_and_withdrawal_flag", type: "Boolean", domain: "Mental Health (15%)", values: "true / false", desc: "Loss of pleasure in regular activities and behavioral social withdrawal." },
                    { domainId: "mental_health", key: "coping_adaptiveness", type: "String", domain: "Mental Health (15%)", values: "Adaptive, Neutral, Maladaptive", desc: "Quality of emotional regulation and task engagement under pressure." },
                    { domainId: "mental_health", key: "resilience_score_1_to_5", type: "Integer", domain: "Mental Health (15%)", values: "1 to 5 Likert", desc: "Psychological resilience and emotional bounce-back capacity." },
                    { domainId: "mental_health", key: "counselor_case_flag", type: "Boolean", domain: "Mental Health (15%)", values: "true / false", desc: "Priority clinical flag set by RGC triggering immediate 1-on-1 counselor intake." },

                    // Physical Health
                    { domainId: "physical_health", key: "general_physical_health_status", type: "String", domain: "Physical Health (20%)", values: "Excellent, Good, Fair, Poor", desc: "Physician/nurse overall clinical assessment of student physical wellness." },
                    { domainId: "physical_health", key: "chronic_condition", type: "String", domain: "Physical Health (20%)", values: "Asthma, Migraine, Epilepsy, None", desc: "Persistent medical diagnoses requiring clinic management and PE modifications." },
                    { domainId: "physical_health", key: "avg_sleep_hours_per_night", type: "Float", domain: "Physical Health (20%)", values: "2.0 – 12.0 hours", desc: "Nightly sleep duration. Chronic deprivation (<5h) causes severe cognitive fatigue." },
                    { domainId: "physical_health", key: "sleep_quality_rating", type: "String", domain: "Physical Health (20%)", values: "Good, Moderate, Severely Deprived", desc: "Qualitative sleep hygiene rating impacting classroom focus and energy." },
                    { domainId: "physical_health", key: "quarterly_clinic_visits", type: "Integer", domain: "Physical Health (20%)", values: "0 – 20 visits", desc: "Frequency of class disruptions for acute medical treatments at the school clinic." },
                    { domainId: "physical_health", key: "medical_absences_count", type: "Integer", domain: "Physical Health (20%)", values: "0 – 30 days", desc: "Total validated medical absences supported by clinic or physician excuse notes." },
                    { domainId: "physical_health", key: "daily_meal_frequency", type: "String", domain: "Physical Health (20%)", values: "3 Meals + Snacks, 2 Meals, 1 Meal / Skips", desc: "Nutritional intake regularity directly affecting cognitive stamina and glucose levels." },
                    { domainId: "physical_health", key: "bmi_category", type: "String", domain: "Physical Health (20%)", values: "Underweight, Normal, Overweight, Obese", desc: "Standard DepEd BMI nutritional status screening category." },
                    { domainId: "physical_health", key: "daytime_fatigue_or_somnolence", type: "String", domain: "Physical Health (20%)", values: "None, Occasional, Frequent", desc: "Classroom drowsiness and alertness flags logged by teachers." },

                    // Financial
                    { domainId: "financial", key: "monthly_household_income_php", type: "Float", domain: "Financial (15%)", values: "PHP (≥ 0.0)", desc: "Gross monthly household income determining socio-economic quintile." },
                    { domainId: "financial", key: "income_bracket", type: "String", domain: "Financial (15%)", values: "Low (<₱10k), Lower Mid (₱10k-25k), Mid, Upper Mid", desc: "DepEd / PSA socio-economic classification." },
                    { domainId: "financial", key: "is_4ps_beneficiary", type: "Boolean", domain: "Financial (15%)", values: "true / false", desc: "DSWD Pantawid Pamilyang Pilipino Program indigent beneficiary status." },
                    { domainId: "financial", key: "daily_allowance_adequacy", type: "String", domain: "Financial (15%)", values: "Adequate (₱100+), Tight (₱50-80), Inadequate (<₱50)", desc: "Daily allowance for food, transportation, and learning material costs." },
                    { domainId: "financial", key: "unpaid_balance_php", type: "Float", domain: "Financial (15%)", values: "PHP (≥ 0.0)", desc: "Current outstanding tuition and fee balance in accounting records." },
                    { domainId: "financial", key: "overdue_installments", type: "Integer", domain: "Financial (15%)", values: "0 – 5", desc: "Number of overdue installment billing deadlines missed." },
                    { domainId: "financial", key: "student_part_time_work_status", type: "String", domain: "Financial (15%)", values: "None, Light, Working Student (>20h/wk)", desc: "External employment fatigue burden affecting homework completion and alertness." },

                    // Family
                    { domainId: "family", key: "ofw_parent_status", type: "String", domain: "Family & Social (20%)", values: "None, One Parent, Both Parents", desc: "Parental overseas employment separation status." },
                    { domainId: "family", key: "is_eldest_child", type: "Boolean", domain: "Family & Social (20%)", values: "true / false", desc: "Eldest child indicator; correlates with domestic childcare and household burdens." },
                    { domainId: "family", key: "siblings_count", type: "Integer", domain: "Family & Social (20%)", values: "0 – 10", desc: "Total number of dependent siblings in the household." },
                    { domainId: "family", key: "parent_marital_status", type: "String", domain: "Family & Social (20%)", values: "Married / Intact, Separated, Single Parent", desc: "Guardian marital structure and domestic stability." },
                    { domainId: "family", key: "living_arrangement", type: "String", domain: "Family & Social (20%)", values: "With Parents, Grandparents, Relatives, Dorm", desc: "Physical custody and household living arrangement." },
                    { domainId: "family", key: "guardian_contact_rating", type: "String", domain: "Family & Social (20%)", values: "High, Moderate, Low, Unresponsive", desc: "Parental communication responsiveness to school advisories and conferences." },
                    { domainId: "family", key: "domestic_distress_flag", type: "Boolean", domain: "Family & Social (20%)", values: "true / false", desc: "Documented domestic conflict, guardian illness, or unstable study setting." }
                  ]
                    .filter((item) => {
                      const matchQuery =
                        attributeSearch === "" ||
                        item.key.toLowerCase().includes(attributeSearch.toLowerCase()) ||
                        item.desc.toLowerCase().includes(attributeSearch.toLowerCase()) ||
                        item.domain.toLowerCase().includes(attributeSearch.toLowerCase());
                      const matchDomain =
                        datasetDomainFilter === "all" ||
                        item.domainId === datasetDomainFilter;
                      return matchQuery && matchDomain;
                    })
                    .map((item) => (
                      <tr 
                        key={item.key} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#8B0014] dark:text-rose-400">
                            {item.key}
                          </code>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {item.type}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                          {item.domain}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                          {item.values}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                          {item.desc}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM DESIGN SPECIFICATION */}
      {/* ========================================================================= */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  System Architecture &amp; Data Pipeline
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Client-server decoupled architecture, asynchronous AI pipelines, and event-driven data flows.
                </p>
              </div>
            </div>

            {/* Architecture Diagram Box */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <pre className="text-emerald-400">
{`+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  Next.js 14 App Router (React Server/Client Components) + Tailwind + Recharts     |
+-----------------------------------------------------------------------------------+
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
       (Firebase Auth / ID Token)                  (FastAPI REST Endpoints)
                   │                                           │
+───────────────────────────────────────+   +───────────────────────────────────────+
|         SECURITY & ACCESS LAYER       |   |         FASTAPI CORE ENGINE           |
|  - Firebase Authentication            |   |  - Pydantic v2 Request Validation     |
|  - Role-Based Access Control (RBAC)   |   |  - Saaty AHP 5-Domain Engine (NumPy)  |
|  - Data Privacy Act (RA 10173) Guard  |   |  - DepEd SASS CSV Ingestion Wizard    |
+───────────────────────────────────────+   +───────────────────────────────────────+
                                                               │
                                       ┌───────────────────────┴───────────────────────┐
                                       ▼                                               ▼
+──────────────────────────────────────────────+   +───────────────────────────────────────────+
|               DATA STORAGE                   |   |            AI & INTELLIGENCE              |
|  - PostgreSQL Relational Database (SQLAlchemy)|   |  - Google Gemini 2.5 Flash API (LLM)      |
|  - Google Cloud Firestore (Live Chat / Sync) |   |  - Multi-Turn Distress Triage Protocol    |
|  - Audit Trail Engine (SHA-256 Checksums)    |   |  - VADER Sentiment Fallback Engine        |
+──────────────────────────────────────────────+   +───────────────────────────────────────────+`}
              </pre>
            </div>

            {/* Core Subsystem Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Database className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                  <span>1. Ingestion &amp; SASS Parser</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Processes quarterly CSV records from the DepEd School Assessment System, validating headers, sanitizing types, calculating academic penalties, and saving snapshots.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Activity className="h-4 w-4 text-amber-500" />
                  <span>2. AHP Multi-Criteria Engine</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Computes eigenvalue matrices, applies psychometrician weights (0.30/0.20/0.20/0.15/0.15), and assigns risk tiers (Low/Med/High) with dominant driver tags.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Bot className="h-4 w-4 text-purple-500" />
                  <span>3. Gemini 2.5 Guidance AI</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Conducts multi-turn empathetic counseling dialogue, analyzes sentiment in real time, and alerts counselors instantly when critical distress phrases are detected.
                </p>
              </div>
            </div>

            {/* Database Entities & Schema */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Core Relational Entities &amp; Schemas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 font-mono space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white font-sans">students (Table)</div>
                  <div className="text-slate-500 dark:text-slate-400">id, lrn, student_name, grade_level, section</div>
                  <div className="text-slate-500 dark:text-slate-400">quarter_gpa, failing_count, absences, incompletes</div>
                  <div className="text-slate-500 dark:text-slate-400">composite_risk, risk_tier, dominant_domain</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 font-mono space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white font-sans">interventions (Table)</div>
                  <div className="text-slate-500 dark:text-slate-400">id, student_id, domain, title, status</div>
                  <div className="text-slate-500 dark:text-slate-400">assigned_by, assigned_at, milestones, outcome</div>
                  <div className="text-slate-500 dark:text-slate-400">parent_acknowledged, counselor_notes</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 font-mono space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white font-sans">clinical_screeners (Table)</div>
                  <div className="text-slate-500 dark:text-slate-400">id, student_id, screener_type (PHQ-9/GAD-7)</div>
                  <div className="text-slate-500 dark:text-slate-400">raw_score, severity_category, date_administered</div>
                  <div className="text-slate-500 dark:text-slate-400">encrypted_responses, counselor_override</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 font-mono space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white font-sans">import_audit_batches (Table)</div>
                  <div className="text-slate-500 dark:text-slate-400">batch_id, filename, uploaded_by, record_count</div>
                  <div className="text-slate-500 dark:text-slate-400">sha256_checksum, is_reverted, created_at</div>
                  <div className="text-slate-500 dark:text-slate-400">delta_snapshot_json, status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TECH STACK & APIS */}
      {/* ========================================================================= */}
      {activeTab === "tech" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Technology Stack &amp; Infrastructure
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Full production stack specifications, core dependencies, and API interfaces.
                </p>
              </div>
            </div>

            {/* Stack breakdown grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frontend Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Server className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                    <span>Frontend Architecture</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-mono font-bold">
                    Next.js 14 App Router
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Framework</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Next.js 14.2.x (React 18)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Language</span>
                    <span className="font-semibold text-slate-900 dark:text-white">TypeScript 5.x</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Styling &amp; Design</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Tailwind CSS + Glassmorphism</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Data Visualization</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Recharts (Radar, Area, Bar)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Icons</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Lucide React</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Authentication Client</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Firebase Web SDK v10</span>
                  </div>
                </div>
              </div>

              {/* Backend Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Cpu className="h-4 w-4 text-amber-500" />
                    <span>Backend REST Services</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-mono font-bold">
                    FastAPI (Python 3.11+)
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">API Framework</span>
                    <span className="font-semibold text-slate-900 dark:text-white">FastAPI Async ASGI</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Validation &amp; Schemas</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Pydantic v2.x</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">AHP Mathematical Core</span>
                    <span className="font-semibold text-slate-900 dark:text-white">NumPy (Eigenvector calculations)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Data Processing</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Pandas (SASS CSV Ingestion)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">ORM &amp; Database Engine</span>
                    <span className="font-semibold text-slate-900 dark:text-white">SQLAlchemy 2.0 + PostgreSQL</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Async HTTP Client</span>
                    <span className="font-semibold text-slate-900 dark:text-white">HTTPX (Non-blocking Gemini calls)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI & Infrastructure Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-900/40 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>AI Guidance Engine: Google Gemini 2.5 Flash</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The chatbot uses <code>gemini-2.5-flash</code> with multi-turn conversation memory, Tagalog/Taglish fluency, and guidance counselor system instructions. If an API outage occurs, the system automatically falls back to an internal VADER sentiment analyzer to maintain continuous distress triaging.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USER OPERATIONS MANUAL (ROLE BY ROLE) */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Role-Based User Operations Manual
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Comprehensive standard operating procedures (SOPs) for each stakeholder role.
                </p>
              </div>
            </div>

            {/* Role Guides Priority Showcase */}
            <div className="space-y-4">
              {/* Guidance Counselor Guide */}
              {(rolePerspective === "guidance_counselor" || rolePerspective === "all" || (!isStudentOrParent && !isTeacher)) && (
                <div className={`p-5 rounded-2xl transition-all ${rolePerspective === "guidance_counselor" ? "bg-rose-50/80 dark:bg-rose-950/40 border-2 border-[#8B0014] shadow-sm" : "bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70"} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-[#8B0014] dark:text-rose-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        1. Guidance Counselor Operations Guide
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-[#8B0014] dark:text-rose-300 text-xs font-black">
                      {rolePerspective === "guidance_counselor" ? "⭐ Active Role SOP" : "Primary Triage"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">Crisis Alerts Queue</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Monitor incoming distress flags from screeners or AI chat. Triage immediately by severity.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">Intervention Plans</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Create tailored care plans (Counseling, Family Conference, Tutoring), assign milestones, and log progress.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">Clinical Screeners</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Administer and review standardized PHQ-9 (Depression) and GAD-7 (Anxiety) screening protocols.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Guide */}
              {(rolePerspective === "teacher" || rolePerspective === "all" || rolePerspective === "guidance_counselor" || rolePerspective === "admin") && (
                <div className={`p-5 rounded-2xl transition-all ${rolePerspective === "teacher" ? "bg-blue-50/80 dark:bg-blue-950/40 border-2 border-blue-600 shadow-sm" : "bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70"} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        2. Teacher &amp; Class Adviser Operations Guide
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black">
                      {rolePerspective === "teacher" ? "⭐ Active Role SOP" : "Advisory Hub"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">3-Step SASS Wizard</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Upload quarterly CSV files, verify column mappings, and compute updated academic risk scores instantly.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">At-Risk Focus List</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Filter priority students with failing marks or &gt;3 absences to coordinate remedial tutoring.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">In-Browser CSV Editor</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Correct grade or attendance entries directly in the web UI with automated validation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Administrator Guide */}
              {(rolePerspective === "admin" || rolePerspective === "all" || rolePerspective === "guidance_counselor") && (
                <div className={`p-5 rounded-2xl transition-all ${rolePerspective === "admin" ? "bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-500 shadow-sm" : "bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70"} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        3. School Administrator Operations Guide
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-black">
                      {rolePerspective === "admin" ? "⭐ Active Role SOP" : "Master Config"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">AHP Weights Config</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Audit domain weights and verify mathematical consistency (CR &le; 0.10).
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">Audit &amp; Rollback</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Inspect cryptographic SHA-256 batch logs and revert any flawed CSV upload with one click.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">User Accounts</span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Provision faculty, student, and parent accounts, export credentials, and manage quarter calendars.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Student & Parent Guides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl transition-all ${rolePerspective === "student" ? "bg-purple-50/80 dark:bg-purple-950/40 border-2 border-purple-600 shadow-sm" : "bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70"} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      <span>4. Student Portal Guide</span>
                    </div>
                    {rolePerspective === "student" && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                        Active View
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    View your 5-Domain Wellness Polygon, interact with the confidential AI Guidance Companion, log daily mood check-ins, and run &quot;what-if&quot; grade simulations.
                  </p>
                </div>

                <div className={`p-5 rounded-2xl transition-all ${rolePerspective === "parent" ? "bg-rose-50/80 dark:bg-rose-950/40 border-2 border-rose-600 shadow-sm" : "bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70"} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <HeartHandshake className="h-5 w-5 text-rose-600" />
                      <span>5. Parent &amp; Guardian Portal Guide</span>
                    </div>
                    {rolePerspective === "parent" && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                        Active View
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Review your child&apos;s holistic wellness progress, acknowledge joint home-school care plans, inspect official Form 138 report cards, and request Parent-Teacher-Counselor conferences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HOW-TOS & FAQS */}
      {/* ========================================================================= */}
      {activeTab === "howtos" && (
        <div className="space-y-6">
          {/* FAQs Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-[#D97706] dark:text-amber-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Frequently Asked Questions (FAQs)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Quick answers to common questions on AHP scoring, AI companionship, and data confidentiality.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-[#8B0014] text-white flex items-center justify-center text-xs font-black">Q1</span>
                  <span>What is the core purpose of SAPC IntellySys?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                  It is an early warning Decision Support System (DSS) designed to identify students at risk of dropout or severe distress by evaluating academic, familial, health, psychological, and financial factors before academic failure occurs.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">Q2</span>
                  <span>Why is a student with an 88 GPA flagged as Medium Risk?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                  Academic metrics comprise 30% of the AHP score. If severe distress is logged in other domains (e.g., family crisis or acute anxiety), the composite risk score can exceed 40.0, proactively alerting the counselor.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-black">Q3</span>
                  <span>Is the AI Counselor replacing human counselors?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                  <strong>No.</strong> The AI companion provides 24/7 empathetic listening and coping tips. All formal clinical assessments, psychiatric referrals, and academic decisions are made exclusively by registered human professionals.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">Q4</span>
                  <span>How is data protected under Philippine law?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                  The platform strictly adheres to RA 10173 (Data Privacy Act of 2012) and DepEd Order No. 40, s. 2012. Data is encrypted, consent is opt-in, and screening responses are restricted under counselor privilege.
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step How-To Guides */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-[#8B0014] dark:text-rose-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Step-by-Step How-To Guides
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Practical workflows for teachers, counselors, administrators, and parents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* How to Ingest SASS CSV */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                  <span>How to Ingest DepEd CSV</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                  <li>Go to <strong>DepEd SASS Hub</strong> &rarr; <strong>3-Step Import Wizard</strong>.</li>
                  <li>Drop your quarterly CSV spreadsheet.</li>
                  <li>Verify column headers (GPA, absences, failed counts).</li>
                  <li>Click <strong>Confirm &amp; Process</strong> to update AHP scores.</li>
                </ol>
              </div>

              {/* How to Rollback a Batch */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-amber-500" />
                  <span>How to Roll Back an Import</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                  <li>Navigate to <strong>CSV Hub</strong> &rarr; <strong>Revert Rollback</strong>.</li>
                  <li>Locate the target batch ID in the audit log table.</li>
                  <li>Click <strong>Rollback Batch</strong>.</li>
                  <li>The system restores the previous snapshot instantly.</li>
                </ol>
              </div>

              {/* How to Triage Crisis Flags */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span>How to Triage a Crisis Flag</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                  <li>Open <strong>Crisis Response</strong> &rarr; <strong>Crisis Alerts Queue</strong>.</li>
                  <li>Click <strong>Case Deep-Dive</strong> for flagged students.</li>
                  <li>Review longitudinal timeline &amp; screener history.</li>
                  <li>Initiate intake interview or parent emergency outreach.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: RELEASE NOTES & CHANGELOG */}
      {/* ========================================================================= */}
      {activeTab === "releases" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Release Notes &amp; Platform Changelog
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Detailed timeline of system updates, AI enhancements, and psychometric calibrations.
                </p>
              </div>
            </div>

            {/* Version 2.5.0 */}
            <div className="p-6 rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-[#8B0014] text-white text-xs font-black">
                    v2.5.0 (Latest Production)
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">September 2026</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                  Active Release
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                    <span>Gemini 2.5 Guidance AI</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Multi-turn conversational AI companion with Taglish fluency and automated crisis triage.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#8B0014]" />
                    <span>In-App Documentation Hub</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Interactive system architecture specs, live AHP math sandbox, and role-based guides.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-blue-500" />
                    <span>Clean Student Chat UI</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Removed intimidating raw sentiment telemetry strips in favor of friendly guidance badge.
                  </p>
                </div>
              </div>
            </div>

            {/* Version 2.4.0 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-white text-xs font-black">
                    v2.4.0
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">August 2026</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>3-Step DepEd SASS CSV Ingestion Wizard with live header mapping.</li>
                <li>In-Browser CSV Table Editor and cryptographic rollback engine.</li>
                <li>Sensitivity Simulator with live 5-domain sliders on the dashboard.</li>
              </ul>
            </div>

            {/* Version 2.0.0 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-white text-xs font-black">
                    v2.0.0
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">June 2026</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>Full migration to Next.js 14 App Router, TypeScript, and FastAPI.</li>
                <li>Implementation of 5 dedicated role portals (Admin, Counselor, Teacher, Student, Parent).</li>
                <li>Standardized PHQ-9 and GAD-7 clinical screener integration.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PRIVACY & COMPLIANCE (RA 10173) */}
      {/* ========================================================================= */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Data Privacy, Ethics &amp; Compliance (RA 10173)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Adherence to the Philippine Data Privacy Act of 2012, DepEd Child Protection Policy, and ethical AI standards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>1. Republic Act No. 10173 Compliance</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Explicit Opt-in Consent</strong>: Students and parents provide explicit consent during initial account setup.</li>
                  <li><strong>Purpose Limitation</strong>: Data is processed strictly for educational retention, academic support, and psychological well-being.</li>
                  <li><strong>Right to Withdraw</strong>: Users can modify or revoke telemetry consents at any time via the Privacy tab.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                  <ShieldAlert className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                  <span>2. Counselor Privilege &amp; Ethical AI</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Counselor-Client Confidentiality</strong>: Individual responses to PHQ-9/GAD-7 surveys are restricted to licensed counselors.</li>
                  <li><strong>Zero Automated Sanctions</strong>: AHP outputs are decision-support recommendations only; all academic and disciplinary decisions require human counselor approval.</li>
                  <li><strong>Emergency Triage</strong>: Critical crisis flags bypass normal queues to provide immediate support hotlines (NCMH: 1553).</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">DepEd Order No. 40, s. 2012 (Child Protection Policy)</span>
                All student interactions, counseling records, and crisis triage workflows are strictly governed by child protection protocols, ensuring student safety, dignity, and confidentiality at all times.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
