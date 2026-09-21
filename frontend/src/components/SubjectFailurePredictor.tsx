"use client";

import React, { useState, useMemo } from "react";
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  Sliders, 
  Brain, 
  Search, 
  Filter, 
  Download, 
  Sparkles, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  HelpCircle,
  ChevronRight,
  ArrowRight,
  RefreshCcw,
  Check,
  X
} from "lucide-react";
import { getActiveStudentDataset } from "@/lib/dataset-store";
import { SAPC_500_STUDENTS, StudentRecord } from "@/data/students500";
import { 
  SUBJECT_REGISTRY, 
  SubjectMetadata, 
  StudentSubjectPrediction, 
  calculateSubjectFailurePrediction, 
  simulateRemediationOutcome 
} from "@/lib/subject-prediction";

export function SubjectFailurePredictor() {
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    return typeof window !== "undefined" ? getActiveStudentDataset() : SAPC_500_STUDENTS;
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      setStudents(getActiveStudentDataset());
    };
    window.addEventListener("sapc:dataset-updated", handleUpdate);
    return () => window.removeEventListener("sapc:dataset-updated", handleUpdate);
  }, []);
  
  // Selection states
  const [selectedStrand, setSelectedStrand] = useState<string>("STEM");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>("STEM-CALC");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [riskTierFilter, setRiskTierFilter] = useState<"ALL" | "CRITICAL_RISK" | "MODERATE_RISK" | "ON_TRACK">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // "What-If" Remediation Simulator Modal State
  const [simulatingStudent, setSimulatingStudent] = useState<StudentSubjectPrediction | null>(null);
  const [tasksToSubmit, setTasksToSubmit] = useState<number>(2);
  const [tutoringHours, setTutoringHours] = useState<number>(3);
  const [examImprovement, setExamImprovement] = useState<number>(5);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Available subjects for selected strand
  const strandSubjects = useMemo(() => {
    return SUBJECT_REGISTRY.filter(s => s.strand === selectedStrand || s.strand === "JHS");
  }, [selectedStrand]);

  // Current active subject metadata
  const currentSubjectMeta = useMemo(() => {
    return SUBJECT_REGISTRY.find(s => s.code === selectedSubjectCode) || strandSubjects[0] || SUBJECT_REGISTRY[0];
  }, [selectedSubjectCode, strandSubjects]);

  // Available unique sections in dataset
  const availableSections = useMemo(() => {
    const sections = Array.from(new Set(students.map(s => s.section_name))).filter(Boolean);
    return sections.sort();
  }, [students]);

  // Compute predictions for all students
  const predictions = useMemo(() => {
    return students.map(st => calculateSubjectFailurePrediction(st, currentSubjectMeta.code));
  }, [students, currentSubjectMeta]);

  // Filtered predictions
  const filteredPredictions = useMemo(() => {
    return predictions.filter(p => {
      const matchSection = selectedSection === "all" || p.section_name === selectedSection;
      const matchTier = riskTierFilter === "ALL" || p.risk_tier === riskTierFilter;
      const matchSearch = searchQuery === "" || 
        p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lrn.includes(searchQuery) ||
        p.section_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSection && matchTier && matchSearch;
    }).sort((a, b) => b.failure_probability_pct - a.failure_probability_pct);
  }, [predictions, selectedSection, riskTierFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = predictions.length;
    const critical = predictions.filter(p => p.risk_tier === "CRITICAL_RISK").length;
    const moderate = predictions.filter(p => p.risk_tier === "MODERATE_RISK").length;
    const onTrack = predictions.filter(p => p.risk_tier === "ON_TRACK").length;
    const avgGrade = total > 0 ? predictions.reduce((acc, p) => acc + p.projected_final_grade, 0) / total : 0;
    const passingRate = total > 0 ? ((onTrack / total) * 100) : 0;

    return {
      total,
      critical,
      moderate,
      onTrack,
      avgGrade: avgGrade.toFixed(1),
      passingRate: passingRate.toFixed(1)
    };
  }, [predictions]);

  // Simulation calculation
  const simulationResult = useMemo(() => {
    if (!simulatingStudent) return null;
    return simulateRemediationOutcome(simulatingStudent, tasksToSubmit, tutoringHours, examImprovement);
  }, [simulatingStudent, tasksToSubmit, tutoringHours, examImprovement]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "Student ID", "Student Name", "LRN", "Grade & Section", "Subject", 
      "Written Work Avg", "Performance Task Avg", "Exam Standing", "Missing Tasks", "Subject Absences",
      "Projected Final Grade", "Failure Probability %", "Risk Tier", "Primary Drivers"
    ];

    const rows = filteredPredictions.map(p => [
      p.student_id,
      `"${p.student_name}"`,
      p.lrn,
      `"${p.section_name}"`,
      `"${p.subject_name}"`,
      p.written_work_avg,
      p.performance_task_avg,
      p.quarterly_assessment_score,
      p.missing_tasks_count,
      p.subject_absences_count,
      p.projected_final_grade,
      `${p.failure_probability_pct}%`,
      p.risk_tier,
      `"${p.risk_drivers.join("; ")}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SAPC_Subject_Failure_Prediction_${currentSubjectMeta.code}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenSimulator = (student: StudentSubjectPrediction) => {
    setSimulatingStudent(student);
    setTasksToSubmit(student.missing_tasks_count > 0 ? student.missing_tasks_count : 1);
    setTutoringHours(3);
    setExamImprovement(5);
    setActionSuccessMsg(null);
  };

  const handleSaveActionPlan = () => {
    setActionSuccessMsg(`Remedial Action Plan successfully recorded and dispatched to Class Adviser & ${simulatingStudent?.student_name}.`);
    setTimeout(() => {
      setActionSuccessMsg(null);
      setSimulatingStudent(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-[#5a000e] text-white p-6 sm:p-8 shadow-xl border border-rose-900/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Early Academic Warning Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[11px] font-bold">
                DepEd DO 8, s. 2015 Compliant
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Subject-Level Failure Risk Predictor
            </h2>
            <p className="text-rose-100/80 text-xs sm:text-sm leading-relaxed">
              Predictive machine-learning algorithm forecasting individual subject failure risk (Projected Grade &lt; 75.0) before quarterly finals using formative task velocity, period cuts, and cross-domain cognitive load multipliers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="h-4 w-4 text-amber-300" />
              <span>Export Roster (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Critical Risk (&ge;70%)</span>
            <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
            {metrics.critical}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Requires immediate 1-on-1 diagnostic
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-950/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Moderate Risk (40-69%)</span>
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <TrendingDown className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.moderate}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Task makeup window recommended
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-950/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">On Track / Passing</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.onTrack}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Passing rate: <strong className="text-emerald-600">{metrics.passingRate}%</strong>
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Projected Cohort Avg</span>
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.avgGrade}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Target passing benchmark: &ge; 75.0
          </p>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Strand Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Academic Strand
            </label>
            <select
              value={selectedStrand}
              onChange={(e) => {
                setSelectedStrand(e.target.value);
                const nextSubjs = SUBJECT_REGISTRY.filter(s => s.strand === e.target.value || s.strand === "JHS");
                if (nextSubjs.length > 0) setSelectedSubjectCode(nextSubjs[0].code);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-[#8B0014] focus:outline-none"
            >
              <option value="STEM">🔬 STEM (Science, Tech &amp; Math)</option>
              <option value="ABM">📊 ABM (Accountancy &amp; Business)</option>
              <option value="HUMSS">✍️ HUMSS (Humanities &amp; Social Sciences)</option>
              <option value="JHS">🎒 Junior High School (Grade 10)</option>
            </select>
          </div>

          {/* Subject Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Subject Focus
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-[#8B0014] focus:outline-none"
            >
              {strandSubjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Class Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-[#8B0014] focus:outline-none"
            >
              <option value="all">🌐 All Sections ({availableSections.length})</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Risk Level Filter
            </label>
            <select
              value={riskTierFilter}
              onChange={(e) => setRiskTierFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-[#8B0014] focus:outline-none"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL_RISK">🔴 Critical Risk (&ge;70%)</option>
              <option value="MODERATE_RISK">🟡 Moderate Risk (40-69%)</option>
              <option value="ON_TRACK">🟢 On Track (&lt;40%)</option>
            </select>
          </div>
        </div>

        {/* Search Input & Weight Formula Legend */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name, LRN, or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-bold text-slate-700 dark:text-slate-300">{currentSubjectMeta.name} Weights:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">WW: {(currentSubjectMeta.weight_ww * 100).toFixed(0)}%</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">PT: {(currentSubjectMeta.weight_pt * 100).toFixed(0)}%</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">QA: {(currentSubjectMeta.weight_qa * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Ranked Predictions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              At-Risk Student Ranking ({filteredPredictions.length} students)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Sorted by highest failure likelihood
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <th className="py-3 px-4">Student &amp; LRN</th>
                <th className="py-3 px-3">Grade &amp; Section</th>
                <th className="py-3 px-3">Formative Standings</th>
                <th className="py-3 px-3 text-center">Projected Grade</th>
                <th className="py-3 px-4">Failure Likelihood</th>
                <th className="py-3 px-4">Key Risk Drivers</th>
                <th className="py-3 px-4 text-right">Intervention Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPredictions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students matching the current subject and risk filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPredictions.map((pred) => {
                  const isCritical = pred.risk_tier === "CRITICAL_RISK";
                  const isModerate = pred.risk_tier === "MODERATE_RISK";

                  return (
                    <tr 
                      key={pred.student_id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {pred.student_name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          LRN: {pred.lrn}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {pred.section_name}
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Grade {pred.grade_level} • {pred.strand}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${pred.written_work_avg < 75 ? "bg-red-50 text-red-600 dark:bg-red-950/50" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                            WW: {pred.written_work_avg}%
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${pred.performance_task_avg < 75 ? "bg-red-50 text-red-600 dark:bg-red-950/50" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                            PT: {pred.performance_task_avg}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                          {pred.missing_tasks_count > 0 && (
                            <span className="text-red-500 font-bold mr-2">
                              ⚠️ {pred.missing_tasks_count} missing tasks
                            </span>
                          )}
                          {pred.subject_absences_count > 0 && (
                            <span>{pred.subject_absences_count} absences</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className={`text-base font-black ${isCritical ? "text-red-600 dark:text-red-400" : isModerate ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {pred.projected_final_grade}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          [{pred.confidence_interval_95[0]} - {pred.confidence_interval_95[1]}]
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className={isCritical ? "text-red-600 dark:text-red-400" : isModerate ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}>
                            {pred.failure_probability_pct}% Fail Risk
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {pred.risk_badge}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCritical ? "bg-red-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${pred.failure_probability_pct}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xs">
                          {pred.risk_drivers.slice(0, 2).map((driver, idx) => (
                            <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#8B0014] shrink-0" />
                              <span className="truncate">{driver}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenSimulator(pred)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#8B0014] hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer shadow-2xs"
                        >
                          <Sliders className="h-3.5 w-3.5 text-amber-500" />
                          <span>Simulate / Prescribe</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* "WHAT-IF" REMEDIATION SIMULATOR MODAL */}
      {/* ========================================================================= */}
      {simulatingStudent && simulationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-600">
                  <Sliders className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    &quot;What-If&quot; Remediation Simulator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {simulatingStudent.student_name} ({simulatingStudent.lrn}) • {simulatingStudent.subject_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSimulatingStudent(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Before vs After Metric Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Current Forecast</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-red-600">{simulatingStudent.projected_final_grade}</span>
                  <span className="text-xs font-bold text-red-500">({simulatingStudent.failure_probability_pct}% Fail Risk)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {simulatingStudent.missing_tasks_count} missing requirements • Low quiz standing
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Simulated Outcome</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600">{simulationResult.projected_grade}</span>
                  <span className="text-xs font-bold text-emerald-600">({simulationResult.failure_probability_pct}% Fail Risk)</span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+{simulationResult.grade_gain} pts gain (-{simulationResult.risk_reduction_pct}% risk reduction)</span>
                </div>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">1. Missing Performance Tasks to Submit:</span>
                  <span className="text-[#8B0014] font-black">{tasksToSubmit} tasks</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={tasksToSubmit}
                  onChange={(e) => setTasksToSubmit(parseInt(e.target.value, 10))}
                  className="w-full accent-[#8B0014] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Recovers -8.0 pts penalty per submitted task</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">2. Weekly Remedial Tutoring Sessions:</span>
                  <span className="text-blue-600 font-black">{tutoringHours} hours/week</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={tutoringHours}
                  onChange={(e) => setTutoringHours(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Boosts Written Work quiz accuracy by +2.5% per hour</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">3. Final Exam Target Score Lift:</span>
                  <span className="text-purple-600 font-black">+{examImprovement} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={examImprovement}
                  onChange={(e) => setExamImprovement(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Simulates guided exam review and problem set coaching</span>
              </div>
            </div>

            {/* Prescribed Action Plan Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Prescribed Interventions to Dispatch:
              </span>
              <div className="space-y-1.5 text-xs">
                {simulatingStudent.recommended_actions.map((act, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {actionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <Check className="h-4 w-4" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSimulatingStudent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActionPlan}
                className="px-5 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#700010] text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Lock &amp; Prescribe Action Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
