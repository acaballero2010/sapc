"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  BarChart3, 
  Clock,
  GraduationCap,
  Activity,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import type { StudentRecord } from "@/data/students500";
import { getActiveStudentDataset, computeCohortAggregates } from "@/lib/dataset-store";

interface TermTrendPoint {
  term: string;
  academic_year: string;
  quarter: string;
  total_students: number;
  low_risk_pct: number;
  medium_risk_pct: number;
  high_risk_pct: number;
  average_composite_score: number;
  average_gpa: number;
  intervention_resolution_rate: number;
  domain_averages: {
    academic: number;
    mental_health: number;
    financial: number;
    family: number;
    health: number;
  };
}

interface SectionComparison {
  section_id: number;
  section_name: string;
  grade_level: string;
  adviser_name: string;
  total_students: number;
  average_composite_risk: number;
  high_risk_count: number;
  retention_health: string;
}

interface LongitudinalTrendsResponse {
  multi_term_progression: TermTrendPoint[];
  section_benchmarks: SectionComparison[];
  retention_gain_pct: number;
  total_dropouts_prevented: number;
  early_interception_sla_pct: number;
  avg_risk_reduction_pts: number;
}

// Dynamically compute exact section benchmarks from active cohort
const buildDynamicSectionBenchmarks = (students: StudentRecord[] = getActiveStudentDataset()): SectionComparison[] => {
  const map = new Map<string, { total: number; high: number; avgSum: number; adviser: string; grade: string }>();
  students.forEach((s) => {
    if (!map.has(s.section_name)) {
      map.set(s.section_name, {
        total: 0,
        high: 0,
        avgSum: 0,
        adviser: s.adviser_name,
        grade: s.grade_level >= 11 ? `Grade ${s.grade_level}` : `Grade ${s.grade_level}`
      });
    }
    const stat = map.get(s.section_name)!;
    stat.total += 1;
    if (s.latest_risk_tier === "high") stat.high += 1;
    stat.avgSum += s.latest_risk_score;
  });

  return Array.from(map.entries()).map(([secName, stat], idx) => {
    const avgRisk = parseFloat((stat.avgSum / (stat.total || 1)).toFixed(1));
    let health = "Optimal";
    if (avgRisk < 20) health = "Exemplary";
    else if (avgRisk >= 28 || stat.high >= 5) health = "Monitored";
    return {
      section_id: idx + 1,
      section_name: secName,
      grade_level: stat.grade,
      adviser_name: stat.adviser,
      total_students: stat.total,
      average_composite_risk: avgRisk,
      high_risk_count: stat.high,
      retention_health: health
    };
  });
};

const DEFAULT_TRENDS: LongitudinalTrendsResponse = {
  multi_term_progression: [
    {
      term: "SY 24-25 Sem 1",
      academic_year: "2024-2025",
      quarter: "Q2",
      total_students: 1210,
      low_risk_pct: 68.2,
      medium_risk_pct: 22.4,
      high_risk_pct: 9.4,
      average_composite_score: 34.8,
      average_gpa: 84.6,
      intervention_resolution_rate: 76.5,
      domain_averages: {
        academic: 28.5,
        mental_health: 24.0,
        financial: 18.2,
        family: 16.5,
        health: 12.0
      }
    },
    {
      term: "SY 24-25 Sem 2",
      academic_year: "2024-2025",
      quarter: "Q4",
      total_students: 1225,
      low_risk_pct: 71.5,
      medium_risk_pct: 20.8,
      high_risk_pct: 7.7,
      average_composite_score: 31.4,
      average_gpa: 86.2,
      intervention_resolution_rate: 82.0,
      domain_averages: {
        academic: 24.2,
        mental_health: 21.5,
        financial: 16.0,
        family: 15.0,
        health: 10.5
      }
    },
    {
      term: "SY 25-26 Sem 1",
      academic_year: "2025-2026",
      quarter: "Q2",
      total_students: 1250,
      low_risk_pct: 74.0,
      medium_risk_pct: 19.5,
      high_risk_pct: 6.5,
      average_composite_score: 28.6,
      average_gpa: 87.8,
      intervention_resolution_rate: 88.4,
      domain_averages: {
        academic: 20.8,
        mental_health: 18.4,
        financial: 14.5,
        family: 13.2,
        health: 9.0
      }
    },
    {
      term: "SY 25-26 Sem 2 (Current)",
      academic_year: "2025-2026",
      quarter: "Q3",
      total_students: 500,
      low_risk_pct: 60.0,
      medium_risk_pct: 28.0,
      high_risk_pct: 12.0,
      average_composite_score: 26.2,
      average_gpa: 89.1,
      intervention_resolution_rate: 94.2,
      domain_averages: {
        academic: 16.5,
        mental_health: 15.2,
        financial: 12.0,
        family: 11.5,
        health: 8.0
      }
    }
  ],
  section_benchmarks: buildDynamicSectionBenchmarks(),
  retention_gain_pct: 14.2,
  total_dropouts_prevented: 48,
  early_interception_sla_pct: 98.4,
  avg_risk_reduction_pts: 12.6
};

interface CohortTrendAnalyticsProps {
  onSelectSection?: (sectionName: string, tier?: string) => void;
}

export const CohortTrendAnalytics: React.FC<CohortTrendAnalyticsProps> = ({ onSelectSection }) => {
  const [data, setData] = useState<LongitudinalTrendsResponse>(() => {
    const students = getActiveStudentDataset();
    const aggs = computeCohortAggregates(students);
    const updatedProgression = [...DEFAULT_TRENDS.multi_term_progression];
    updatedProgression[updatedProgression.length - 1] = {
      ...updatedProgression[updatedProgression.length - 1],
      total_students: aggs.total,
      low_risk_pct: aggs.lowRiskPct,
      medium_risk_pct: aggs.mediumRiskPct,
      high_risk_pct: aggs.highRiskPct,
      average_composite_score: aggs.avgRiskScore,
      average_gpa: aggs.avgGpa,
      domain_averages: {
        academic: aggs.domainAverages.academic,
        mental_health: aggs.domainAverages.mental_health,
        financial: aggs.domainAverages.financial,
        family: aggs.domainAverages.family,
        health: aggs.domainAverages.health
      }
    };
    return {
      ...DEFAULT_TRENDS,
      multi_term_progression: updatedProgression,
      section_benchmarks: buildDynamicSectionBenchmarks(students)
    };
  });
  const [loading, setLoading] = useState(false);
  const [selectedTermIdx, setSelectedTermIdx] = useState<number>(DEFAULT_TRENDS.multi_term_progression.length - 1);
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [viewMetric, setViewMetric] = useState<"risk_distribution" | "domain_breakdown" | "gpa_resolution">("risk_distribution");

  const syncWithActiveDataset = () => {
    const students = getActiveStudentDataset();
    const aggs = computeCohortAggregates(students);
    setData(prev => {
      const updatedProgression = [...prev.multi_term_progression];
      updatedProgression[updatedProgression.length - 1] = {
        ...updatedProgression[updatedProgression.length - 1],
        total_students: aggs.total,
        low_risk_pct: aggs.lowRiskPct,
        medium_risk_pct: aggs.mediumRiskPct,
        high_risk_pct: aggs.highRiskPct,
        average_composite_score: aggs.avgRiskScore,
        average_gpa: aggs.avgGpa,
        domain_averages: {
          academic: aggs.domainAverages.academic,
          mental_health: aggs.domainAverages.mental_health,
          financial: aggs.domainAverages.financial,
          family: aggs.domainAverages.family,
          health: aggs.domainAverages.health
        }
      };
      return {
        ...prev,
        multi_term_progression: updatedProgression,
        section_benchmarks: buildDynamicSectionBenchmarks(students)
      };
    });
  };

  useEffect(() => {
    syncWithActiveDataset();
    const loadTrends = async () => {
      try {
        const res = await fetchWithAuth("/analytics/longitudinal-trends");
        if (res && res.multi_term_progression?.length) {
          setData(res);
          setSelectedTermIdx(res.multi_term_progression.length - 1);
        }
      } catch {
        syncWithActiveDataset();
      } finally {
        setLoading(false);
      }
    };
    loadTrends();

    const handleDatasetUpdate = () => {
      syncWithActiveDataset();
    };
    window.addEventListener("sapc:dataset-updated", handleDatasetUpdate);
    return () => window.removeEventListener("sapc:dataset-updated", handleDatasetUpdate);
  }, []);

  if (loading || !data) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const currentTerm = selectedTermIdx !== null ? data.multi_term_progression[selectedTermIdx] : data.multi_term_progression[data.multi_term_progression.length - 1];

  const filteredSections = data.section_benchmarks.filter((sec) => {
    if (gradeFilter === "all") return true;
    return sec.grade_level.toLowerCase().includes(gradeFilter.toLowerCase());
  });

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-7">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-rose-100 text-[#8B0014] border border-rose-200 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" /> Longitudinal AI Insights
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Multi-Semester Cohort Analytics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Retention Trajectory & AHP Impact Measurement
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluating multi-year risk reduction and early intervention efficacy across San Antonio de Padua College cohorts.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-start lg:self-center border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMetric("risk_distribution")}
            className={`px-3.5 py-2 rounded-xl transition ${
              viewMetric === "risk_distribution" 
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Risk Stratification
          </button>
          <button
            onClick={() => setViewMetric("domain_breakdown")}
            className={`px-3.5 py-2 rounded-xl transition ${
              viewMetric === "domain_breakdown" 
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Domain Breakdown
          </button>
          <button
            onClick={() => setViewMetric("gpa_resolution")}
            className={`px-3.5 py-2 rounded-xl transition ${
              viewMetric === "gpa_resolution" 
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            GPA & Resolution Rate
          </button>
        </div>
      </div>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Retention Gain */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Retention Gain</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black text-emerald-700">+{data.retention_gain_pct}%</p>
              <span className="text-xs font-bold text-emerald-700">YoY improvement</span>
            </div>
            <span className="text-xs text-emerald-800/90 font-medium block mt-1">Institutional stay rate</span>
          </div>
        </div>

        {/* Dropouts Prevented */}
        <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Dropouts Intercepted</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black text-[#8B0014]">{data.total_dropouts_prevented}</p>
              <span className="text-xs font-bold text-amber-900">Students Saved</span>
            </div>
            <span className="text-xs text-amber-900/90 font-medium block mt-1">Via AHP early warning</span>
          </div>
        </div>

        {/* Early Interception SLA */}
        <div className="bg-gradient-to-br from-rose-50 to-white border-2 border-rose-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">Intervention SLA</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black text-rose-700">{data.early_interception_sla_pct}%</p>
              <span className="text-xs font-bold text-rose-700">Target: &gt;95%</span>
            </div>
            <span className="text-xs text-rose-800/90 font-medium block mt-1">&lt;48hr care plan response</span>
          </div>
        </div>

        {/* Avg Risk Reduction */}
        <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Risk Reduction</span>
            <div className="p-2 rounded-xl bg-slate-200/80 text-slate-800">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black text-slate-900">-{data.avg_risk_reduction_pts}</p>
              <span className="text-xs font-bold text-emerald-700">points drop</span>
            </div>
            <span className="text-xs text-slate-600 font-medium block mt-1">Across monitored cohorts</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Progression Visualization */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#8B0014]" />
              {viewMetric === "risk_distribution" && "Cohort Risk Stratification Trend (Quarter-over-Quarter)"}
              {viewMetric === "domain_breakdown" && "Multi-Domain Average Vulnerability Trajectory"}
              {viewMetric === "gpa_resolution" && "Academic GPA vs. Intervention Resolution Rate"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any semester below to inspect granular cohort telemetry
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            {viewMetric === "risk_distribution" && (
              <div className="flex items-center gap-4 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Low Risk</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Medium Risk</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> High Risk</span>
              </div>
            )}
            {viewMetric === "gpa_resolution" && (
              <div className="flex items-center gap-4 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8B0014] inline-block" /> Average GPA (%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Resolution Rate (%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Bars / Progressions */}
        {viewMetric === "risk_distribution" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {data.multi_term_progression.map((termPoint, idx) => {
              const isSelected = selectedTermIdx === idx;
              return (
                <button
                  key={termPoint.term}
                  onClick={() => setSelectedTermIdx(idx)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected 
                      ? "bg-white border-2 border-[#8B0014] shadow-md scale-[1.02]" 
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div>
                    <span className={`text-xs font-extrabold uppercase tracking-wider block ${isSelected ? "text-[#8B0014]" : "text-slate-500"}`}>
                      {termPoint.term}
                    </span>
                    <div className="mt-2 text-xl font-black text-slate-900">
                      {termPoint.average_composite_score}
                      <span className="text-[10px] font-bold text-slate-400 ml-1">avg risk</span>
                    </div>
                  </div>

                  {/* Stacked Risk Bar */}
                  <div className="my-3 space-y-1.5">
                    <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-100 shadow-inner">
                      <div 
                        style={{ width: `${termPoint.low_risk_pct}%` }} 
                        className="bg-emerald-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-black text-white"
                        title={`Low Risk: ${termPoint.low_risk_pct}%`}
                      >
                        {termPoint.low_risk_pct > 20 ? `${Math.round(termPoint.low_risk_pct)}%` : ""}
                      </div>
                      <div 
                        style={{ width: `${termPoint.medium_risk_pct}%` }} 
                        className="bg-amber-400 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-black text-amber-950"
                        title={`Medium Risk: ${termPoint.medium_risk_pct}%`}
                      >
                        {termPoint.medium_risk_pct > 20 ? `${Math.round(termPoint.medium_risk_pct)}%` : ""}
                      </div>
                      <div 
                        style={{ width: `${termPoint.high_risk_pct}%` }} 
                        className="bg-rose-600 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-black text-white"
                        title={`High Risk: ${termPoint.high_risk_pct}%`}
                      >
                        {termPoint.high_risk_pct > 15 ? `${Math.round(termPoint.high_risk_pct)}%` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-rose-600 font-bold">High: {termPoint.high_risk_pct}%</span>
                    <span className="text-emerald-700 font-bold">Low: {termPoint.low_risk_pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {viewMetric === "domain_breakdown" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {Object.entries({
              academic: { name: "Academic Risk (S_AC)", color: "text-[#8B0014]", bg: "bg-rose-50", border: "border-rose-200" },
              mental_health: { name: "Mental Health (S_MH)", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
              financial: { name: "Financial Strain (S_FN)", color: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" },
              family: { name: "Family Factors (S_FM)", color: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" },
              health: { name: "Physical Health (S_PH)", color: "text-slate-800", bg: "bg-slate-50", border: "border-slate-200" }
            }).map(([key, meta]) => {
              const startVal = data.multi_term_progression[0].domain_averages[key as keyof typeof data.multi_term_progression[0]['domain_averages']] || 0;
              const endVal = data.multi_term_progression[data.multi_term_progression.length - 1].domain_averages[key as keyof typeof data.multi_term_progression[0]['domain_averages']] || 0;
              const delta = (startVal - endVal).toFixed(1);

              return (
                <div key={key} className={`p-5 rounded-2xl border ${meta.border} bg-white shadow-2xs space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{meta.name}</span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800">
                      -{delta} pts
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">{endVal}</span>
                      <span className="text-xs text-slate-400 ml-1">/ 100</span>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                      Started: {startVal}
                    </span>
                  </div>

                  {/* Visual Step Bar */}
                  <div className="flex items-center gap-1.5 pt-2">
                    {data.multi_term_progression.map((t, i) => {
                      const val = t.domain_averages[key as keyof typeof t['domain_averages']];
                      return (
                        <div key={i} className="flex-1 space-y-1 text-center">
                          <div className="h-12 bg-slate-100 rounded-md overflow-hidden flex flex-col justify-end p-0.5">
                            <div 
                              style={{ height: `${Math.min(100, Math.max(10, val))}%` }} 
                              className="bg-[#8B0014]/80 rounded-xs w-full"
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 block truncate">{t.quarter}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMetric === "gpa_resolution" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* GPA Progression */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Cohort Average GPA Growth</h4>
                  <p className="text-xs text-slate-500">Continuous institutional academic recovery</p>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  +8.4% Net Gain
                </span>
              </div>
              <div className="space-y-2 pt-2">
                {data.multi_term_progression.map((t) => (
                  <div key={t.term} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 w-28 shrink-0">{t.term}</span>
                    <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(t.average_gpa / 100) * 100}%` }} 
                        className="bg-gradient-to-r from-[#8B0014] to-rose-600 h-full rounded-full"
                      />
                    </div>
                    <span className="text-xs font-black text-slate-900 w-12 text-right">{t.average_gpa}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Intervention Plan Resolution Rate</h4>
                  <p className="text-xs text-slate-500">Guidance counselor & student compliance closure</p>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  97.0% Current
                </span>
              </div>
              <div className="space-y-2 pt-2">
                {data.multi_term_progression.map((t) => (
                  <div key={t.term} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 w-28 shrink-0">{t.term}</span>
                    <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${t.intervention_resolution_rate}%` }} 
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full"
                      />
                    </div>
                    <span className="text-xs font-black text-emerald-800 w-12 text-right">{t.intervention_resolution_rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Term Detail Drawer */}
        {currentTerm && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">Selected Term Snapshot:</span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                  {currentTerm.term} (AY {currentTerm.academic_year})
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Monitored Cohort Size: <strong className="text-slate-800">{currentTerm.total_students} Students</strong> • Average GPA: <strong className="text-slate-800">{currentTerm.average_gpa}%</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                Low: {currentTerm.low_risk_pct}% ({Math.round((currentTerm.low_risk_pct / 100) * currentTerm.total_students)} studs)
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                Med: {currentTerm.medium_risk_pct}% ({Math.round((currentTerm.medium_risk_pct / 100) * currentTerm.total_students)} studs)
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
                High: {currentTerm.high_risk_pct}% ({Math.round((currentTerm.high_risk_pct / 100) * currentTerm.total_students)} studs)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Benchmark & Retention Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#8B0014]" />
              Section & Strand Retention Matrix (Current Semester)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative cohort risk across STEM, ABM, and HUMSS strands
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Grade:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-900 font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#8B0014] cursor-pointer"
            >
              <option value="all">All Grades</option>
              <option value="grade 11">Grade 11 Only</option>
              <option value="grade 12">Grade 12 Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-extrabold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Section & Strand</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Class Adviser</th>
                <th className="py-3.5 px-4 text-center">Class Size</th>
                <th className="py-3.5 px-4 text-center">Avg Risk</th>
                <th className="py-3.5 px-4 text-center">High Risk Qty</th>
                <th className="py-3.5 px-4 text-right">Retention Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSections.map((sec) => (
                <tr 
                  key={sec.section_id} 
                  onClick={() => onSelectSection?.(sec.section_name, sec.high_risk_count > 0 ? "high" : "all")}
                  className="text-slate-800 hover:bg-rose-50/70 transition cursor-pointer group"
                  title={`Click to view ${sec.section_name} students (${sec.high_risk_count} high-risk)`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-[#8B0014] transition-colors">
                    <div className="flex items-center gap-2">
                      <span>{sec.section_name}</span>
                      <span className="text-[10px] text-rose-700 font-extrabold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <span>View</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600 text-xs">
                    {sec.grade_level}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs sm:text-sm">
                    {sec.adviser_name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 text-xs sm:text-sm">
                    {sec.total_students}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono font-bold text-xs text-slate-900">
                      {sec.average_composite_risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSection?.(sec.section_name, "high");
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black transition hover:scale-105 shadow-2xs ${
                        sec.high_risk_count > 0 
                          ? "bg-rose-600 hover:bg-rose-700 text-white" 
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                      title="Filter high risk students in this section"
                    >
                      {sec.high_risk_count} {sec.high_risk_count > 0 ? "⚠️" : ""}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                        sec.retention_health === "Exemplary"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : sec.retention_health === "Optimal"
                          ? "bg-amber-50 text-amber-900 border border-amber-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}>
                        {sec.retention_health}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#8B0014] group-hover:translate-x-0.5 transition shrink-0" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
