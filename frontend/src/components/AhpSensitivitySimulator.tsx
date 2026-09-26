"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sliders,
  Sparkles,
  RotateCcw,
  Check,
  AlertTriangle,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  getActiveStudentDataset,
  saveStudentDataset,
  DEFAULT_AHP_WEIGHTS,
} from "@/lib/dataset-store";
import { useToast } from "@/lib/toast-context";

interface AhpSensitivitySimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export function AhpSensitivitySimulator({
  isOpen,
  onClose,
  onApplied,
}: AhpSensitivitySimulatorProps) {
  const { success, info } = useToast();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dataset = useMemo(() => getActiveStudentDataset(), [isOpen]);

  const [weights, setWeights] = useState<{
    academic: number;
    family: number;
    health: number;
    mental_health: number;
    financial: number;
  }>({
    academic: DEFAULT_AHP_WEIGHTS.academic,
    family: DEFAULT_AHP_WEIGHTS.family,
    health: DEFAULT_AHP_WEIGHTS.health,
    mental_health: DEFAULT_AHP_WEIGHTS.mental_health,
    financial: DEFAULT_AHP_WEIGHTS.financial,
  });

  const totalWeight = useMemo(() => {
    return Number(
      (
        weights.academic +
        weights.family +
        weights.health +
        weights.mental_health +
        weights.financial
      ).toFixed(2)
    );
  }, [weights]);

  // Simulation computation
  const simulationResults = useMemo(() => {
    if (!dataset || dataset.length === 0) return { baselineCounts: {}, simCounts: {}, shiftedStudents: [] };

    // Baseline counts
    const baselineCounts: Record<string, number> = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    dataset.forEach((s) => {
      const tier = s.latest_risk_tier;
      const band = tier === "high" ? (s.latest_risk_score >= 60 ? "Critical" : "High") : tier === "medium" ? "Moderate" : "Low";
      baselineCounts[band] = (baselineCounts[band] || 0) + 1;
    });

    // Simulated recalculation
    const norm = totalWeight > 0 ? totalWeight : 1;
    const simWeights = {
      academic: weights.academic / norm,
      family: weights.family / norm,
      health: weights.health / norm,
      mental_health: weights.mental_health / norm,
      financial: weights.financial / norm,
    };

    const simCounts: Record<string, number> = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    const shiftedStudents: Array<{
      id: number;
      name: string;
      lrn: string;
      oldScore: number;
      newScore: number;
      oldBand: string;
      newBand: string;
      diff: number;
    }> = [];

    dataset.forEach((s) => {
      // Inverted domain scores where high value = risk
      const acadRisk = 100 - (s.domain_scores?.academic ?? 80);
      const famRisk = 100 - (s.domain_scores?.family ?? 80);
      const healthRisk = 100 - (s.domain_scores?.health ?? 80);
      const mentalRisk = 100 - (s.domain_scores?.mental_health ?? 80);
      const finRisk = 100 - (s.domain_scores?.financial ?? 80);

      const simScore =
        acadRisk * simWeights.academic +
        famRisk * simWeights.family +
        healthRisk * simWeights.health +
        mentalRisk * simWeights.mental_health +
        finRisk * simWeights.financial;

      let newBand = "Low";
      if (simScore >= 60) newBand = "Critical";
      else if (simScore >= 45) newBand = "High";
      else if (simScore >= 30) newBand = "Moderate";

      simCounts[newBand] = (simCounts[newBand] || 0) + 1;

      const tier = s.latest_risk_tier;
      const oldBand = tier === "high" ? (s.latest_risk_score >= 60 ? "Critical" : "High") : tier === "medium" ? "Moderate" : "Low";
      const oldScore = s.latest_risk_score ?? 0;
      const diff = Math.abs(simScore - oldScore);

      if (newBand !== oldBand || diff > 5) {
        shiftedStudents.push({
          id: s.id,
          name: s.full_name,
          lrn: s.lrn,
          oldScore: Math.round(oldScore),
          newScore: Math.round(simScore),
          oldBand,
          newBand,
          diff: Math.round(simScore - oldScore),
        });
      }
    });

    shiftedStudents.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    return { baselineCounts, simCounts, shiftedStudents: shiftedStudents.slice(0, 8) };
  }, [dataset, weights, totalWeight]);

  if (!isOpen) return null;

  const handleNormalize = () => {
    if (totalWeight === 0) return;
    setWeights({
      academic: Number((weights.academic / totalWeight).toFixed(2)),
      family: Number((weights.family / totalWeight).toFixed(2)),
      health: Number((weights.health / totalWeight).toFixed(2)),
      mental_health: Number((weights.mental_health / totalWeight).toFixed(2)),
      financial: Number((weights.financial / totalWeight).toFixed(2)),
    });
    info("Weights Normalized", "Total sensitivity weights re-scaled to 1.0 (100%).");
  };

  const handleReset = () => {
    setWeights({
      academic: DEFAULT_AHP_WEIGHTS.academic,
      family: DEFAULT_AHP_WEIGHTS.family,
      health: DEFAULT_AHP_WEIGHTS.health,
      mental_health: DEFAULT_AHP_WEIGHTS.mental_health,
      financial: DEFAULT_AHP_WEIGHTS.financial,
    });
    info("Weights Reset", "Restored standard institutional AHP baseline parameters.");
  };

  const handleApply = () => {
    // Recalculate and commit to dataset
    const norm = totalWeight > 0 ? totalWeight : 1;
    const simWeights = {
      academic: weights.academic / norm,
      family: weights.family / norm,
      health: weights.health / norm,
      mental_health: weights.mental_health / norm,
      financial: weights.financial / norm,
    };

    const updated = dataset.map((s) => {
      const acadRisk = 100 - (s.domain_scores?.academic ?? 80);
      const famRisk = 100 - (s.domain_scores?.family ?? 80);
      const healthRisk = 100 - (s.domain_scores?.health ?? 80);
      const mentalRisk = 100 - (s.domain_scores?.mental_health ?? 80);
      const finRisk = 100 - (s.domain_scores?.financial ?? 80);

      const simScore =
        acadRisk * simWeights.academic +
        famRisk * simWeights.family +
        healthRisk * simWeights.health +
        mentalRisk * simWeights.mental_health +
        finRisk * simWeights.financial;

      let newTier: "low" | "medium" | "high" = "low";
      if (simScore >= 45) newTier = "high";
      else if (simScore >= 30) newTier = "medium";

      return {
        ...s,
        latest_risk_score: Math.round(simScore),
        latest_risk_tier: newTier,
      };
    });

    saveStudentDataset(updated, true);
    success("New Weights Applied", `Recalculated risk priorities for all ${dataset.length} students.`);
    if (onApplied) onApplied();
    onClose();
  };

  const domainConfigs = [
    { key: "academic", label: "Academic Domain (GWA & DepEd SF9)", color: "accent-blue-500", desc: "Weight assigned to subject failures & quarterly trends" },
    { key: "family", label: "Family Support (Parent Engagement)", color: "accent-emerald-500", desc: "Weight assigned to home environment & parent responsiveness" },
    { key: "health", label: "Physical Health & Clinic Records", color: "accent-purple-500", desc: "Weight assigned to chronic absences & clinic visits" },
    { key: "mental_health", label: "Mental Wellbeing & SASS Stress", color: "accent-amber-500", desc: "Weight assigned to anxiety, isolation, and counseling notes" },
    { key: "financial", label: "Financial Security (Tuition & Grant)", color: "accent-pink-500", desc: "Weight assigned to tuition arrears & transportation burden" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-900/10 via-slate-50 to-amber-900/10 dark:from-red-950/40 dark:via-slate-900 dark:to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-800 text-white shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                AHP Multi-Domain Sensitivity Simulator
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 font-extrabold">
                  Interactive Sandbox
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust criteria weights to dynamically simulate institutional risk shifts across all {dataset.length} students.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Total Weight Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span>Total Weight:</span>
              <span className={`px-2 py-0.5 rounded-md font-mono text-xs ${Math.abs(totalWeight - 1.0) < 0.01 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"}`}>
                {(totalWeight * 100).toFixed(0)}% ({totalWeight.toFixed(2)})
              </span>
              {Math.abs(totalWeight - 1.0) >= 0.01 && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Normalization recommended
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNormalize}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Auto-Normalize to 100%
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domainConfigs.map((dom) => {
              const val = weights[dom.key as keyof typeof weights];
              return (
                <div
                  key={dom.key}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-red-300 dark:hover:border-red-900/50 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {dom.label}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-red-700 dark:text-red-400">
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    {dom.desc}
                  </p>

                  <input
                    type="range"
                    min="0.05"
                    max="0.70"
                    step="0.01"
                    value={val}
                    onChange={(e) =>
                      setWeights((prev) => ({
                        ...prev,
                        [dom.key]: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-700"
                  />
                </div>
              );
            })}
          </div>

          {/* Risk Band Projection Cards */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Real-Time Cohort Risk Distribution Projection
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { band: "Critical", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50" },
                { band: "High", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50" },
                { band: "Moderate", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900/50" },
                { band: "Low", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50" },
              ].map(({ band, color, bg }) => {
                const baseCount = simulationResults.baselineCounts[band] || 0;
                const simCount = simulationResults.simCounts[band] || 0;
                const diff = simCount - baseCount;

                return (
                  <div key={band} className={`p-3 rounded-xl border ${bg} flex flex-col justify-between`}>
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {band} Risk
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-xl font-extrabold ${color}`}>
                        {simCount}
                      </span>
                      <span className="text-xs text-slate-400">/ {dataset.length}</span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Baseline: {baseCount} (
                      <span className={diff > 0 ? "text-rose-500 font-bold" : diff < 0 ? "text-emerald-500 font-bold" : "text-slate-400"}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                      )
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Shifted Students Table */}
          {simulationResults.shiftedStudents.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Sample Students Most Impacted by Weight Shift
              </h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">LRN</th>
                      <th className="py-2.5 px-3">Previous Risk</th>
                      <th className="py-2.5 px-3">Simulated Risk</th>
                      <th className="py-2.5 px-3 text-right">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {simulationResults.shiftedStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {s.name}
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                          {s.lrn}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {s.oldBand} ({s.oldScore}%)
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.newBand === "Critical" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : s.newBand === "High" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                            {s.newBand} ({s.newScore}%)
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-xs">
                          <span className={s.diff > 0 ? "text-rose-600" : "text-emerald-600"}>
                            {s.diff > 0 ? `+${s.diff}%` : `${s.diff}%`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>DepEd DO 8, s. 2015 & RA 10173 Compliant Calculation Model</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-800 hover:bg-red-700 shadow-md shadow-red-900/20 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              Apply as Active Institutional Baseline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
