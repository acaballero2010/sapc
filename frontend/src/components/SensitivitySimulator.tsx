"use client";

import React, { useState } from "react";
import { X, Layers, Sliders, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
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
    academic: 0.4017,
    mental_health: 0.2442,
    financial: 0.1373,
    family: 0.1373,
    health: 0.0794
  };

  if (!isOpen) return null;

  const composite = (
    scores.academic * weights.academic +
    scores.mental_health * weights.mental_health +
    scores.financial * weights.financial +
    scores.family * weights.family +
    scores.health * weights.health
  );

  const roundedScore = Math.min(100, Math.max(0, Math.round(composite * 10) / 10));
  const tier = roundedScore >= 70 ? "high" : roundedScore >= 40 ? "medium" : "low";

  const contributions = {
    Academic: (scores.academic * weights.academic).toFixed(1),
    "Mental Health": (scores.mental_health * weights.mental_health).toFixed(1),
    Financial: (scores.financial * weights.financial).toFixed(1),
    Family: (scores.family * weights.family).toFixed(1),
    Health: (scores.health * weights.health).toFixed(1)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AHP Sensitivity & What-If Simulator</h3>
              <p className="text-xs text-slate-400">
                Explore how shifts in academic & non-academic factors impact composite failure risk
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Result Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Simulated AHP Outcome</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-black text-white">{roundedScore.toFixed(1)}</span>
                <span className="text-xs text-slate-500">/ 100</span>
                <RiskBadge score={roundedScore} tier={tier} size="lg" />
              </div>
            </div>
            <div className="text-xs text-slate-400 text-right sm:max-w-xs">
              <span className="text-indigo-400 font-bold">AHP Matrix Formula:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Composite = 0.4017(Acad) + 0.2442(MH) + 0.1373(Fin) + 0.1373(Fam) + 0.0794(Hlth)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sliders */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-300">Academic Risk (40.17%)</span>
                  <span className="font-bold text-blue-400">{scores.academic} / 100 (+{contributions.Academic} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.academic}
                  onChange={(e) => setScores({ ...scores, academic: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-300">Mental Health Distress (24.42%)</span>
                  <span className="font-bold text-purple-400">{scores.mental_health} / 100 (+{contributions["Mental Health"]} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.mental_health}
                  onChange={(e) => setScores({ ...scores, mental_health: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-300">Financial Strain (13.73%)</span>
                  <span className="font-bold text-emerald-400">{scores.financial} / 100 (+{contributions.Financial} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.financial}
                  onChange={(e) => setScores({ ...scores, financial: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-300">Family Instability (13.73%)</span>
                  <span className="font-bold text-amber-400">{scores.family} / 100 (+{contributions.Family} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.family}
                  onChange={(e) => setScores({ ...scores, family: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-300">Health Vulnerability (7.94%)</span>
                  <span className="font-bold text-rose-400">{scores.health} / 100 (+{contributions.Health} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.health}
                  onChange={(e) => setScores({ ...scores, health: Number(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setScores({ academic: 20, mental_health: 15, financial: 10, family: 15, health: 10 })}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] font-semibold"
                >
                  Preset: Low Risk
                </button>
                <button
                  onClick={() => setScores({ academic: 55, mental_health: 50, financial: 75, family: 40, health: 30 })}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] font-semibold"
                >
                  Preset: Medium Risk
                </button>
                <button
                  onClick={() => setScores({ academic: 85, mental_health: 85, financial: 60, family: 70, health: 40 })}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] font-semibold"
                >
                  Preset: High Risk
                </button>
              </div>
            </div>

            {/* Simulated Radar Chart */}
            <div className="flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <DomainRadarChart scores={scores} studentName="Simulated Risk Profile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
