"use client";

import React, { useState } from "react";
import { X, Layers } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";

interface SensitivitySimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensitivitySimulator: React.FC<SensitivitySimulatorProps> = ({ isOpen, onClose }) => {
  const [scores, setScores] = useState({
    academic: 75,
    mental_health: 60,
    financial: 45,
    family: 40,
    health: 20
  });

  const weights = {
    academic: 0.30,
    family: 0.20,
    health: 0.20,
    mental_health: 0.15,
    financial: 0.15
  };

  if (!isOpen) return null;

  const composite = (
    scores.academic * weights.academic +
    scores.family * weights.family +
    scores.health * weights.health +
    scores.mental_health * weights.mental_health +
    scores.financial * weights.financial
  );

  const roundedScore = Math.min(100, Math.max(0, Math.round(composite * 10) / 10));
  const tier = roundedScore >= 70 ? "high" : roundedScore >= 40 ? "medium" : "low";

  const contributions = {
    Academic: (scores.academic * weights.academic).toFixed(1),
    Family: (scores.family * weights.family).toFixed(1),
    Health: (scores.health * weights.health).toFixed(1),
    "Mental Health": (scores.mental_health * weights.mental_health).toFixed(1),
    Financial: (scores.financial * weights.financial).toFixed(1)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706]">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AHP Sensitivity & What-If Simulator</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Explore how shifts in academic & non-academic factors impact composite failure risk
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Result Banner */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider block">Simulated AHP Outcome</span>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">{roundedScore.toFixed(1)}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
                <RiskBadge score={roundedScore} tier={tier} size="lg" />
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 text-left sm:text-right sm:max-w-xs">
              <span className="text-[#8B0014] font-extrabold block">AHP Matrix Formula:</span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Composite = 0.30(Acad) + 0.20(Fam) + 0.20(Hlth) + 0.15(MH) + 0.15(Fin)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sliders */}
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between mb-1.5 font-bold">
                  <span className="text-slate-900">Academic Risk (30.0%)</span>
                  <span className="text-[#8B0014]">{scores.academic} / 100 (+{contributions.Academic} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.academic}
                  onChange={(e) => setScores({ ...scores, academic: Number(e.target.value) })}
                  className="w-full accent-[#8B0014] h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-bold">
                  <span className="text-slate-900">Family Instability (20.0%)</span>
                  <span className="text-amber-700">{scores.family} / 100 (+{contributions.Family} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.family}
                  onChange={(e) => setScores({ ...scores, family: Number(e.target.value) })}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-bold">
                  <span className="text-slate-900">Health Vulnerability (20.0%)</span>
                  <span className="text-rose-700">{scores.health} / 100 (+{contributions.Health} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.health}
                  onChange={(e) => setScores({ ...scores, health: Number(e.target.value) })}
                  className="w-full accent-rose-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-bold">
                  <span className="text-slate-900">Mental Health Distress (15.0%)</span>
                  <span className="text-rose-600">{scores.mental_health} / 100 (+{contributions["Mental Health"]} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.mental_health}
                  onChange={(e) => setScores({ ...scores, mental_health: Number(e.target.value) })}
                  className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-bold">
                  <span className="text-slate-900">Financial Strain (15.0%)</span>
                  <span className="text-amber-700">{scores.financial} / 100 (+{contributions.Financial} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.financial}
                  onChange={(e) => setScores({ ...scores, financial: Number(e.target.value) })}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-3 flex flex-wrap gap-2.5">
                <button
                  onClick={() => setScores({ academic: 20, mental_health: 15, financial: 10, family: 15, health: 10 })}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition"
                >
                  Preset: Low Risk
                </button>
                <button
                  onClick={() => setScores({ academic: 55, mental_health: 50, financial: 75, family: 40, health: 30 })}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition"
                >
                  Preset: Medium Risk
                </button>
                <button
                  onClick={() => setScores({ academic: 85, mental_health: 85, financial: 60, family: 70, health: 40 })}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition"
                >
                  Preset: High Risk
                </button>
              </div>
            </div>

            {/* Simulated Radar Chart */}
            <div className="flex flex-col items-center justify-center bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs">
              <DomainRadarChart scores={scores} studentName="Simulated Risk Profile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
