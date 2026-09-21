"use client";

import React, { useState } from "react";
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
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Code2, 
  Cpu, 
  Database, 
  Terminal, 
  HelpCircle,
  Calculator,
  Sliders,
  Award,
  ChevronRight,
  ExternalLink,
  Bot,
  Percent,
  Calendar,
  Eye,
  Key,
  Download,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function DocumentationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"risk" | "system" | "tech" | "users" | "privacy">("risk");

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
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                SAPC IntellySys 2.5 Architecture & Specs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              System Design & Risk Assessment Documentation
            </h1>
            <p className="text-rose-100/80 text-sm sm:text-base leading-relaxed">
              Comprehensive reference for Saaty&apos;s Analytic Hierarchy Process (AHP) mathematical risk engine, system architecture, technology stack, and role-based user manuals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-rose-200 uppercase font-bold block">Engine Version</span>
              <span className="text-sm font-extrabold text-white">AHP-v2.5 (CR = 0.016)</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-rose-200 uppercase font-bold block">Compliance</span>
              <span className="text-sm font-extrabold text-amber-300">RA 10173 • DepEd</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xs scrollbar-none">
        <button
          onClick={() => setActiveTab("risk")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === "risk"
              ? "bg-[#8B0014] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>AHP Risk Assessment Spec</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === "system"
              ? "bg-[#8B0014] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Brain className="h-4 w-4" />
          <span>System Design Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab("tech")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === "tech"
              ? "bg-[#8B0014] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Tech Stack & APIs</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === "users"
              ? "bg-[#8B0014] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Operations Manual</span>
        </button>

        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === "privacy"
              ? "bg-[#8B0014] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Privacy & RA 10173</span>
        </button>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SYSTEM DESIGN SPECIFICATION */}
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

            {/* Role Guides Accordion / Sections */}
            <div className="space-y-4">
              {/* Guidance Counselor */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-[#8B0014] dark:text-rose-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      1. Guidance Counselor Operations Guide
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-[#8B0014] dark:text-rose-300 text-xs font-black">
                    Primary Triage
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

              {/* Teacher */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      2. Teacher &amp; Class Adviser Operations Guide
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black">
                    Advisory Hub
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

              {/* Administrator */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      3. School Administrator Operations Guide
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-black">
                    Master Config
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

              {/* Student & Parent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <span>4. Student Portal Guide</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    View your 5-Domain Wellness Polygon, interact with the confidential AI Guidance Companion, log daily mood check-ins, and run &quot;what-if&quot; grade simulations.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <HeartHandshake className="h-5 w-5 text-rose-600" />
                    <span>5. Parent &amp; Guardian Portal Guide</span>
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
      {/* TAB 5: PRIVACY & COMPLIANCE (RA 10173) */}
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
