"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  HeartHandshake, 
  Filter,
  Eye,
  GraduationCap,
  Sparkles,
  Users
} from "lucide-react";

interface HeatmapStudent {
  id: string;
  name: string;
  lrn: string;
  gpa: number;
  absences: number;
  academic: number;
  family: number;
  health: number;
  mentalHealth: number;
  financial: number;
  composite: number;
  dominant: string;
}

const MOCK_HEATMAP_STUDENTS: HeatmapStudent[] = [
  { id: "1", name: "Juan Dela Cruz", lrn: "109283748291", gpa: 72.5, absences: 6, academic: 80, family: 70, health: 65, mentalHealth: 85, financial: 75, composite: 76.5, dominant: "Mental Health" },
  { id: "2", name: "Maria Santos", lrn: "109283748292", gpa: 79.0, absences: 4, academic: 45, family: 40, health: 25, mentalHealth: 75, financial: 60, composite: 54.0, dominant: "Mental Health" },
  { id: "3", name: "Carlo Aquino", lrn: "109283748294", gpa: 82.0, absences: 2, academic: 30, family: 85, health: 40, mentalHealth: 50, financial: 65, composite: 53.5, dominant: "Family" },
  { id: "4", name: "Elena Rodriguez", lrn: "109283748295", gpa: 84.5, absences: 1, academic: 15, family: 30, health: 20, mentalHealth: 35, financial: 80, composite: 32.5, dominant: "Financial" },
  { id: "5", name: "Jose Rizal", lrn: "109283748293", gpa: 94.0, absences: 0, academic: 0, family: 20, health: 15, mentalHealth: 10, financial: 25, composite: 14.5, dominant: "Healthy" },
  { id: "6", name: "Bea Alonzo", lrn: "109283748296", gpa: 76.0, absences: 5, academic: 55, family: 60, health: 70, mentalHealth: 60, financial: 40, composite: 58.5, dominant: "Health" },
  { id: "7", name: "Kathryn Bernardo", lrn: "109283748297", gpa: 89.0, absences: 1, academic: 10, family: 15, health: 10, mentalHealth: 25, financial: 20, composite: 15.5, dominant: "Healthy" },
  { id: "8", name: "Daniel Padilla", lrn: "109283748298", gpa: 74.0, absences: 7, academic: 75, family: 50, health: 45, mentalHealth: 60, financial: 55, composite: 61.5, dominant: "Academic" }
];

export const SectionRiskHeatmap: React.FC = () => {
  const [students, setStudents] = useState<HeatmapStudent[]>(MOCK_HEATMAP_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"composite" | "gpa" | "absences" | "name">("composite");
  const [referredId, setReferredId] = useState<string | null>(null);

  const getCellColor = (score: number) => {
    if (score >= 70) return "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900/60 font-bold";
    if (score >= 40) return "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-900/60 font-medium";
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40";
  };

  const handleRefer = (id: string, name: string) => {
    setReferredId(id);
    setTimeout(() => setReferredId(null), 3000);
  };

  const filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.lrn.includes(searchQuery))
    .sort((a, b) => {
      if (sortBy === "composite") return b.composite - a.composite;
      if (sortBy === "gpa") return a.gpa - b.gpa;
      if (sortBy === "absences") return b.absences - a.absences;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#8B0014] dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Section 5-Domain Wellness &amp; Risk Heatmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grade 10 - St. Anthony • Holistic cross-domain risk distribution
            </p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8B0014]"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="composite">Sort by Risk Score (High to Low)</option>
            <option value="gpa">Sort by GPA (Lowest First)</option>
            <option value="absences">Sort by Absences (Highest First)</option>
            <option value="name">Sort Alphabetically</option>
          </select>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="font-bold text-slate-500">Risk Intensity:</span>
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-emerald-500/20 border border-emerald-400" />
          <span className="text-slate-600 dark:text-slate-400">Low (&lt;40)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-amber-500/30 border border-amber-400" />
          <span className="text-slate-600 dark:text-slate-400">Medium (40–69)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-rose-500/30 border border-rose-400" />
          <span className="text-slate-600 dark:text-slate-400">High (&ge;70)</span>
        </div>
      </div>

      {/* Heatmap Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px]">
              <th className="p-3">Student Name</th>
              <th className="p-3 text-center">GPA</th>
              <th className="p-3 text-center">Absences</th>
              <th className="p-3 text-center">Academic (30%)</th>
              <th className="p-3 text-center">Family (20%)</th>
              <th className="p-3 text-center">Health (20%)</th>
              <th className="p-3 text-center">Mental Health (15%)</th>
              <th className="p-3 text-center">Financial (15%)</th>
              <th className="p-3 text-center font-extrabold text-[#8B0014] dark:text-rose-400">Composite</th>
              <th className="p-3 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                  <div className="text-[10px] text-slate-400">LRN: {s.lrn}</div>
                </td>
                <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                  {s.gpa.toFixed(1)}
                </td>
                <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                  {s.absences}d
                </td>

                {/* 5 Domain Heatmap Cells */}
                <td className="p-2 text-center">
                  <div className={`py-1 px-2 rounded-lg font-mono ${getCellColor(s.academic)}`}>
                    {s.academic}
                  </div>
                </td>
                <td className="p-2 text-center">
                  <div className={`py-1 px-2 rounded-lg font-mono ${getCellColor(s.family)}`}>
                    {s.family}
                  </div>
                </td>
                <td className="p-2 text-center">
                  <div className={`py-1 px-2 rounded-lg font-mono ${getCellColor(s.health)}`}>
                    {s.health}
                  </div>
                </td>
                <td className="p-2 text-center">
                  <div className={`py-1 px-2 rounded-lg font-mono ${getCellColor(s.mentalHealth)}`}>
                    {s.mentalHealth}
                  </div>
                </td>
                <td className="p-2 text-center">
                  <div className={`py-1 px-2 rounded-lg font-mono ${getCellColor(s.financial)}`}>
                    {s.financial}
                  </div>
                </td>

                {/* Composite Risk Score Badge */}
                <td className="p-3 text-center">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                    s.composite >= 70 ? "bg-rose-600 text-white" :
                    s.composite >= 40 ? "bg-amber-500 text-slate-950 font-bold" :
                    "bg-emerald-500 text-white"
                  }`}>
                    {s.composite.toFixed(1)}
                  </span>
                </td>

                {/* Quick Action Button */}
                <td className="p-3 text-right">
                  {referredId === s.id ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Referred!
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRefer(s.id, s.name)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-[#8B0014] dark:text-rose-300 font-bold text-[11px] border border-rose-200 dark:border-rose-900 transition flex items-center gap-1 ml-auto cursor-pointer"
                      title="Generate instant Guidance Counselor Referral"
                    >
                      <HeartHandshake className="h-3.5 w-3.5" />
                      <span>Refer</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
