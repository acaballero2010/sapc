"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calculator, 
  TrendingDown, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  HeartPulse, 
  DollarSign, 
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
        return { bg: "bg-rose-50 border-rose-200 text-rose-800", badge: "bg-rose-600 text-white" };
      case "medium":
        return { bg: "bg-amber-50 border-amber-200 text-amber-800", badge: "bg-[#D97706] text-white" };
      case "low":
      default:
        return { bg: "bg-emerald-50 border-emerald-200 text-emerald-800", badge: "bg-emerald-700 text-white" };
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
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                AHP DSS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {studentName ? `Simulating recovery trajectory for ${studentName}` : "Dynamically calculate required GPA & attendance targets to achieve Low Risk status"}
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1">Presets:</span>
          <button
            onClick={() => applyPreset("pass")}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition shadow-xs"
          >
            Pass Standard
          </button>
          <button
            onClick={() => applyPreset("balanced")}
            className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition shadow-xs"
          >
            ★ Balanced Goal
          </button>
          <button
            onClick={() => applyPreset("honors")}
            className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 transition shadow-xs"
          >
            Academic Honors
          </button>
        </div>
      </div>

      {/* Live Comparison Delta Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Baseline Card */}
        <div className={`p-5 rounded-2xl border ${currentStyles.bg} text-center space-y-1 relative`}>
          <span className="text-xs font-bold uppercase tracking-wider block opacity-80">Current Composite Risk</span>
          <p className="text-3xl sm:text-4xl font-black">{currentComposite.toFixed(1)}%</p>
          <div className="pt-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${currentStyles.badge}`}>
              {currentTier} Risk
            </span>
          </div>
          <span className="text-[11px] opacity-75 block mt-2">Academic Risk S_AC: {simulationResult?.current_academic_score?.toFixed(1) || "65.0"}%</span>
        </div>

        {/* Transition Indicator */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-center space-y-2 shadow-lg">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1">
            <TrendingDown className="h-4 w-4 text-emerald-400" />
            Projected Impact
          </span>
          <p className="text-3xl font-black text-emerald-400">
            -{pointsDrop.toFixed(1)} <span className="text-sm font-semibold text-slate-300">pts</span>
          </p>
          <div className="text-xs font-medium text-slate-300">
            <strong className="text-white">{pctDrop}%</strong> total risk reduction
          </div>
        </div>

        {/* Simulated Outcome Card */}
        <div className={`p-5 rounded-2xl border ${simulatedStyles.bg} text-center space-y-1 relative`}>
          <span className="text-xs font-bold uppercase tracking-wider block opacity-80">Simulated Target Score</span>
          <p className="text-3xl sm:text-4xl font-black">{simulatedComposite.toFixed(1)}%</p>
          <div className="pt-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${simulatedStyles.badge}`}>
              {simulatedTier} Risk Target
            </span>
          </div>
          <span className="text-[11px] opacity-75 block mt-2">Projected S_AC: {simulationResult?.simulated_academic_score?.toFixed(1) || "0.0"}%</span>
        </div>
      </div>

      {/* Interactive Controls & Target Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
        
        {/* Left: Academic Parameter Sliders */}
        <div className="space-y-5">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#8B0014]" />
            1. Target Academic Parameters (S_AC Ingestion)
          </h4>

          {/* GPA Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <label className="text-slate-700">Projected Quarter GPA:</label>
              <span className="font-mono text-base font-black text-[#8B0014] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
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
              <span>98.0 (Highest)</span>
            </div>
          </div>

          {/* Absences Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <label className="text-slate-700">Max Projected Absences:</label>
              <span className="font-mono text-base font-black text-amber-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
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
              <span>0-2 days (0 penalty)</span>
              <span>3-5 days (+8 pts)</span>
              <span>&gt;5 days (+15 pts)</span>
            </div>
          </div>

          {/* Failing Subjects */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <label className="text-slate-700">Failing Subjects Count:</label>
              <span className="font-mono text-base font-black text-rose-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {targetFailing} {targetFailing === 1 ? "subject" : "subjects"}
              </span>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetFailing(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    targetFailing === num
                      ? "bg-[#8B0014] text-white border-[#8B0014] shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {num === 0 ? "0 (All Cleared)" : `${num} Failed`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Holistic & Non-Academic Enablers */}
        <div className="space-y-5">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-[#8B0014]" />
            2. Pastoral & Guidance Interventions (AHP Factors)
          </h4>

          {/* Mental Health Support Toggle */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Guidance & Counseling Intake</span>
                  <span className="text-[11px] text-slate-500">Reduces S_MH risk domain from elevated to 15.0 pts</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={mentalHealthBoost}
                onChange={(e) => setMentalHealthBoost(e.target.checked)}
                className="h-5 w-5 rounded text-[#8B0014] focus:ring-[#8B0014] cursor-pointer"
              />
            </div>
          </div>

          {/* Financial Aid Toggle */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Scholarship & Staggered Tuition</span>
                  <span className="text-[11px] text-slate-500">Reduces S_FN financial strain from elevated to 15.0 pts</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={financialAidBoost}
                onChange={(e) => setFinancialAidBoost(e.target.checked)}
                className="h-5 w-5 rounded text-[#8B0014] focus:ring-[#8B0014] cursor-pointer"
              />
            </div>
          </div>

          {/* Milestone Target Checklists */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Target Achievement Checklist:
            </span>
            <ul className="space-y-1.5 text-xs text-emerald-950">
              {simulationResult?.required_milestones?.map((m: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
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
