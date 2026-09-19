"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calculator, 
  TrendingDown, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  HeartPulse, 
  X 
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface AcademicRecoverySimulatorProps {
  studentId?: number | null;
  studentName?: string;
  initialAcademicScore?: number;
  initialCompositeScore?: number;
  initialRiskTier?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const AcademicRecoverySimulator: React.FC<AcademicRecoverySimulatorProps> = ({
  studentId,
  studentName,
  initialAcademicScore: _initialAcademicScore = 65.0,
  initialCompositeScore = 52.4,
  initialRiskTier = "medium",
  isOpen = true,
  onClose,
  isModal = false
}) => {
  // Simulator state
  const [targetGpa, setTargetGpa] = useState<number>(85.0);
  const [targetAbsences, setTargetAbsences] = useState<number>(1);
  const [targetFailing, setTargetFailing] = useState<number>(0);
  const [targetIncomplete, setTargetIncomplete] = useState<number>(0);
  const [mentalHealthBoost, setMentalHealthBoost] = useState<boolean>(true);
  const [financialAidBoost, setFinancialAidBoost] = useState<boolean>(false);

  // Live simulation results
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const runSimulation = useCallback(async () => {
    try {
      const payload: any = {
        student_id: studentId || undefined,
        target_gpa: targetGpa,
        target_absences: targetAbsences,
        target_failing_count: targetFailing,
        target_incomplete_count: targetIncomplete,
        simulated_mental_health: mentalHealthBoost ? 15.0 : undefined,
        simulated_financial: financialAidBoost ? 15.0 : undefined
      };

      const res = await fetchWithAuth("/risk/simulate-recovery", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setSimulationResult(res);
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  }, [studentId, targetGpa, targetAbsences, targetFailing, targetIncomplete, mentalHealthBoost, financialAidBoost]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const applyPreset = (preset: "pass" | "honors" | "balanced") => {
    if (preset === "pass") {
      setTargetGpa(78.0);
      setTargetAbsences(2);
      setTargetFailing(0);
      setTargetIncomplete(0);
      setMentalHealthBoost(false);
      setFinancialAidBoost(false);
    } else if (preset === "honors") {
      setTargetGpa(92.0);
      setTargetAbsences(0);
      setTargetFailing(0);
      setTargetIncomplete(0);
      setMentalHealthBoost(true);
      setFinancialAidBoost(true);
    } else if (preset === "balanced") {
      setTargetGpa(85.0);
      setTargetAbsences(1);
      setTargetFailing(0);
      setTargetIncomplete(0);
      setMentalHealthBoost(true);
      setFinancialAidBoost(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "high":
        return { bg: "bg-rose-50/80 border-rose-200 text-rose-900", badge: "bg-rose-600 text-white" };
      case "medium":
        return { bg: "bg-amber-50/80 border-amber-200 text-amber-900", badge: "bg-[#D97706] text-white" };
      case "low":
      default:
        return { bg: "bg-emerald-50/80 border-emerald-200 text-emerald-900", badge: "bg-emerald-700 text-white" };
    }
  };

  const currentComposite = simulationResult?.current_composite_score ?? initialCompositeScore;
  const simulatedComposite = simulationResult?.simulated_composite_score ?? 28.5;
  const currentTier = simulationResult?.current_risk_tier ?? initialRiskTier;
  const simulatedTier = simulationResult?.simulated_risk_tier ?? "low";
  const pointsDrop = simulationResult?.risk_reduction_points ?? Math.max(0, currentComposite - simulatedComposite);
  const pctDrop = simulationResult?.risk_reduction_pct ?? 45.6;

  const currentStyles = getTierColor(currentTier);
  const simulatedStyles = getTierColor(simulatedTier);

  const content = (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-400/20 text-[#8B0014] border border-amber-400/40 shadow-xs">
            <Calculator className="h-6 w-6 text-[#8B0014]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                &quot;What-If&quot; Academic Recovery &amp; Goal Simulator
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                AHP DSS Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {studentName ? `Simulating recovery trajectory for ${studentName}` : "Dynamically calculate required GPA & attendance targets to achieve Low Risk status"}
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-0.5">Target Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset("pass")}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition shadow-2xs"
          >
            Pass Standard
          </button>
          <button
            type="button"
            onClick={() => applyPreset("balanced")}
            className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-950 transition shadow-2xs"
          >
            ★ Balanced Goal
          </button>
          <button
            type="button"
            onClick={() => applyPreset("honors")}
            className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-950 transition shadow-2xs"
          >
            Academic Honors
          </button>
        </div>
      </div>

      {/* Live Comparison Delta Hero - Uniform Height and Styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        {/* Baseline Card */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${currentStyles.bg} flex flex-col justify-between text-center relative shadow-xs min-h-[175px]`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block opacity-75">Current Baseline Risk</span>
            <p className="text-3xl sm:text-4xl font-black mt-1 text-slate-900">{currentComposite.toFixed(1)}%</p>
          </div>
          <div className="py-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase shadow-2xs ${currentStyles.badge}`}>
              {currentTier} Risk Standing
            </span>
          </div>
          <span className="text-[11px] font-semibold opacity-75 block text-slate-700">
            Academic Sub-score: {simulationResult?.current_academic_score?.toFixed(1) || "65.0"}%
          </span>
        </div>

        {/* Transition Indicator */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white flex flex-col justify-between text-center shadow-lg min-h-[175px] border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              Projected Impact
            </span>
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 tracking-tight">
              -{pointsDrop.toFixed(1)} <span className="text-base font-semibold text-slate-300">pts</span>
            </p>
          </div>
          <div className="py-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              {pctDrop}% Total Risk Reduction
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-300 block">
            Trajectory: <strong className="text-white uppercase">{currentTier}</strong> → <strong className="text-emerald-400 uppercase">{simulatedTier}</strong>
          </span>
        </div>

        {/* Simulated Outcome Card */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${simulatedStyles.bg} flex flex-col justify-between text-center relative shadow-xs min-h-[175px]`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block opacity-75">Simulated Target Score</span>
            <p className="text-3xl sm:text-4xl font-black mt-1 text-slate-900">{simulatedComposite.toFixed(1)}%</p>
          </div>
          <div className="py-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase shadow-2xs ${simulatedStyles.badge}`}>
              {simulatedTier} Risk Target
            </span>
          </div>
          <span className="text-[11px] font-semibold opacity-75 block text-slate-700">
            Projected Academic: {simulationResult?.simulated_academic_score?.toFixed(1) || "0.0"}%
          </span>
        </div>
      </div>

      {/* Interactive Controls & Target Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/90 p-5 sm:p-7 rounded-3xl border border-slate-200">
        
        {/* Left: Academic Parameter Sliders */}
        <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-rose-50 text-[#8B0014] border border-rose-200">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                1. Academic Standing & Attendance Goals
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">Set grading targets and attendance parameters</p>
            </div>
          </div>

          {/* GPA Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <label className="text-slate-700">Projected Quarter GPA Target:</label>
              <span className="font-mono text-base font-black text-[#8B0014] bg-slate-50 px-3 py-0.5 rounded-lg border border-slate-200">
                {targetGpa.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="65.0"
              max="98.0"
              step="0.5"
              value={targetGpa}
              onChange={(e) => setTargetGpa(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8B0014]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>65.0 (Remedial)</span>
              <span>75.0 (Passing)</span>
              <span>85.0 (Dean&apos;s List)</span>
              <span>98.0 (Highest Honors)</span>
            </div>
          </div>

          {/* Absences Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <label className="text-slate-700">Max Projected Absences:</label>
              <span className="font-mono text-base font-black text-amber-800 bg-slate-50 px-3 py-0.5 rounded-lg border border-slate-200">
                {targetAbsences} {targetAbsences === 1 ? "day" : "days"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={targetAbsences}
              onChange={(e) => setTargetAbsences(parseInt(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>0–2 days (Full Credit)</span>
              <span>3–5 days (Moderate)</span>
              <span>&gt;5 days (High Risk)</span>
            </div>
          </div>

          {/* Failing Subjects */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <label className="text-slate-700">Target Failing Subjects:</label>
              <span className="font-mono text-base font-black text-rose-700 bg-slate-50 px-3 py-0.5 rounded-lg border border-slate-200">
                {targetFailing} {targetFailing === 1 ? "subject" : "subjects"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetFailing(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    targetFailing === num
                      ? "bg-[#8B0014] text-white border-[#8B0014] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {num === 0 ? "0 (All Clear)" : `${num} Failed`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Holistic & Non-Academic Enablers */}
        <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-amber-50 text-[#D97706] border border-amber-200">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  2. Guidance &amp; Pastoral Care Enablers
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">Holistic counseling and institutional support interventions</p>
              </div>
            </div>

            {/* Mental Health Support Toggle */}
            <label className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">Guidance Consultation & Stress Coping</span>
                  <span className="text-[11px] text-slate-500 block">Personal wellness counseling and examination mentorship</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={mentalHealthBoost}
                onChange={(e) => setMentalHealthBoost(e.target.checked)}
                className="h-5 w-5 rounded text-[#8B0014] focus:ring-[#8B0014] cursor-pointer shrink-0"
              />
            </label>

            {/* Financial Aid Toggle - Philippine Peso Icon */}
            <label className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold flex items-center justify-center text-xs shrink-0">
                  ₱
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">Tuition Assistance & Payment Relief</span>
                  <span className="text-[11px] text-slate-500 block">SAPC scholarship aid and flexible installment plans</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={financialAidBoost}
                onChange={(e) => setFinancialAidBoost(e.target.checked)}
                className="h-5 w-5 rounded text-[#8B0014] focus:ring-[#8B0014] cursor-pointer shrink-0"
              />
            </label>
          </div>

          {/* Milestone Target Checklists */}
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2">
            <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Target Achievement Checklist:
            </span>
            <ul className="space-y-1.5 text-xs text-emerald-950">
              {simulationResult?.required_milestones?.map((m: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="leading-snug">{m}</span>
                </li>
              )) || (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Maintain GPA ≥ 75.0 with zero unexcused absences.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto backdrop-blur-xs font-sans">
        <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 my-auto">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      {content}
    </div>
  );
};
