"use client";

import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  PieChart as PieIcon, 
  ShieldCheck, 
  Sparkles
} from "lucide-react";

interface AHPDataVisualizerProps {
  domainScores?: {
    academic: number;
    family: number;
    health: number;
    mental: number;
    financial: number;
  };
  studentName?: string;
  quarterTrajectory?: Array<{ quarter: string; riskScore: number; gpa: number; attendance: number }>;
}

export const AHPDataVisualizer: React.FC<AHPDataVisualizerProps> = ({
  domainScores = { academic: 28.5, family: 18.0, health: 16.5, mental: 14.0, financial: 12.0 },
  studentName = "Joshua Dimaculangan",
  quarterTrajectory = [
    { quarter: "Q1 Diagnostic", riskScore: 82.4, gpa: 76.5, attendance: 91.2 },
    { quarter: "Q2 Midterm", riskScore: 66.0, gpa: 82.0, attendance: 96.5 },
    { quarter: "Q3 Target", riskScore: 48.5, gpa: 86.0, attendance: 98.0 },
    { quarter: "Q4 Goal", riskScore: 32.0, gpa: 89.5, attendance: 99.0 }
  ]
}) => {
  const [activeVizTab, setActiveVizTab] = useState<"radar" | "trajectory" | "sections" | "cohort_breakdown">("radar");

  // Radar Data (AHP 5 Domains scaled to 100)
  const radarData = [
    { domain: "Academic (30%)", score: (domainScores.academic / 30) * 100, fullMark: 100 },
    { domain: "Family (20%)", score: (domainScores.family / 20) * 100, fullMark: 100 },
    { domain: "Health (20%)", score: (domainScores.health / 20) * 100, fullMark: 100 },
    { domain: "Mental (15%)", score: (domainScores.mental / 15) * 100, fullMark: 100 },
    { domain: "Financial (15%)", score: (domainScores.financial / 15) * 100, fullMark: 100 }
  ];

  // Section Cohort Vulnerability Data
  const sectionRiskData = [
    { section: "Grade 11 - STEM", avgRisk: 42.5, highCount: 4, color: "#8B0014" },
    { section: "Grade 11 - HUMSS", avgRisk: 38.0, highCount: 3, color: "#D97706" },
    { section: "Grade 11 - ABM", avgRisk: 31.2, highCount: 2, color: "#10B981" },
    { section: "Grade 11 - TVL", avgRisk: 46.8, highCount: 5, color: "#8B0014" },
    { section: "Grade 12 - STEM", avgRisk: 29.4, highCount: 1, color: "#10B981" },
    { section: "Grade 12 - HUMSS", avgRisk: 34.5, highCount: 2, color: "#D97706" }
  ];

  // Cohort Risk Tier Donut Distribution
  const cohortDonutData = [
    { name: "Low Risk (0-39.9)", value: 438, color: "#10B981" },
    { name: "Medium Risk (40-69.9)", value: 48, color: "#D97706" },
    { name: "High Risk (70-100)", value: 14, color: "#8B0014" }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#8B0014]" />
            Multi-Domain Predictive Analytics &amp; Visualizations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analytic Hierarchy Process (AHP) composite modeling for {studentName} &amp; SAPC cohort
          </p>
        </div>

        {/* Visualizer Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto overflow-x-auto [scrollbar-width:none]">
          <button
            onClick={() => setActiveVizTab("radar")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeVizTab === "radar" ? "bg-white text-[#8B0014] shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PieIcon className="h-3.5 w-3.5" />
            <span>5-Domain Radar</span>
          </button>
          <button
            onClick={() => setActiveVizTab("trajectory")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeVizTab === "trajectory" ? "bg-white text-[#8B0014] shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Risk Trajectory</span>
          </button>
          <button
            onClick={() => setActiveVizTab("sections")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeVizTab === "sections" ? "bg-white text-[#8B0014] shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Section Comparison</span>
          </button>
          <button
            onClick={() => setActiveVizTab("cohort_breakdown")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeVizTab === "cohort_breakdown" ? "bg-white text-[#8B0014] shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Cohort Tiers</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="min-h-[300px] sm:min-h-[340px] flex items-center justify-center">
        {/* 1. 5-Domain Radar Chart */}
        {activeVizTab === "radar" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
            <div className="lg:col-span-2 h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: "#334155", fontSize: 11, fontWeight: "bold" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Radar name="Student Risk" dataKey="score" stroke="#8B0014" fill="#8B0014" fillOpacity={0.4} />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)} / 100`, "Risk Score"]}
                    contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #cbd5e1" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AHP Domain Breakdown:
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Weighted synthesis according to the <strong>30% Academic, 20% Family, 20% Health, 15% Mental, 15% Financial</strong> decision matrix.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Academic (30%):</span>
                  <strong className="text-blue-900">{domainScores.academic} / 30 pts</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Family Dynamics (20%):</span>
                  <strong className="text-amber-900">{domainScores.family} / 20 pts</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Physical Health (20%):</span>
                  <strong className="text-rose-900">{domainScores.health} / 20 pts</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Mental Health (15%):</span>
                  <strong className="text-purple-900">{domainScores.mental} / 15 pts</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Financial Strain (15%):</span>
                  <strong className="text-emerald-900">{domainScores.financial} / 15 pts</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 4-Quarter Trajectory Area Chart */}
        {activeVizTab === "trajectory" && (
          <div className="w-full space-y-3">
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quarterTrajectory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B0014" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B0014" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" tick={{ fontSize: 11, fontWeight: "bold" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #cbd5e1" }} />
                  <Area type="monotone" dataKey="riskScore" name="AHP Risk Score" stroke="#8B0014" fillOpacity={1} fill="url(#colorRisk)" />
                  <Area type="monotone" dataKey="gpa" name="Academic GPA" stroke="#10B981" fillOpacity={1} fill="url(#colorGpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs font-bold pt-2">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8B0014]" />
                <span>AHP Risk Score (Decreasing = Improvement)</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Academic GPA (Increasing = Success)</span>
              </span>
            </div>
          </div>
        )}

        {/* 3. Section Bar Comparison */}
        {activeVizTab === "sections" && (
          <div className="w-full space-y-3">
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionRiskData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="section" tick={{ fontSize: 11, fontWeight: "bold" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [name === "avgRisk" ? `${val}/100 Risk Avg` : `${val} Students`, name === "avgRisk" ? "Average Risk" : "High Risk Count"]}
                    contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #cbd5e1" }} 
                  />
                  <Bar dataKey="avgRisk" name="Average Section Risk" radius={[8, 8, 0, 0]}>
                    {sectionRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-slate-500">Section-level average risk comparison across senior high tracks.</p>
          </div>
        )}

        {/* 4. Cohort Donut Distribution */}
        {activeVizTab === "cohort_breakdown" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cohortDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cohortDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #cbd5e1" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="font-black text-slate-900 text-sm">500 Monitored Students Breakdown:</h4>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                  <span className="font-bold text-emerald-950">🟢 Low Risk (0 - 39.9)</span>
                  <strong className="text-emerald-800 text-sm">438 (87.6%)</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center">
                  <span className="font-bold text-amber-950">🟡 Medium Risk (40 - 69.9)</span>
                  <strong className="text-amber-800 text-sm">48 (9.6%)</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex justify-between items-center">
                  <span className="font-bold text-rose-950">🔴 High Risk Tier (70 - 100)</span>
                  <strong className="text-rose-800 text-sm">14 (2.8%)</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
