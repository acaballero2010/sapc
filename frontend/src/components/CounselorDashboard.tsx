"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Search, 
  Eye, 
  CheckCircle
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import { StudentDetailModal } from "./StudentDetailModal";
import { InterventionModal } from "./InterventionModal";

export const CounselorDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [flaggedSessions, setFlaggedSessions] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [interventionStudent, setInterventionStudent] = useState<any | null>(null);
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);
  const [_isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, studentsRes, flaggedRes, interventionsRes] = await Promise.all([
        fetchWithAuth("/analytics/cohort-summary"),
        fetchWithAuth("/students"),
        fetchWithAuth("/chatbot/flagged-alerts"),
        fetchWithAuth("/risk/interventions")
      ]);
      setAnalytics(analyticsRes);
      setStudents(studentsRes);
      setFlaggedSessions(flaggedRes);
      setInterventions(interventionsRes);
    } catch (err) {
      console.error("Failed to load counselor data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.lrn.includes(search);
    const matchesTier = filterTier === "all" || s.latest_risk_tier?.toLowerCase() === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Decision Support System
              </span>
              <span className="text-xs text-slate-400">• Guidance Counselor Central</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Multi-Factor Failure Prevention Portal</h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Real-time AHP composite risk matrix synthesizing SASS academic indicators with qualitative Health, Mental Health, Financial, and Family data.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Cohort Risk Avg</span>
              <p className="text-xl font-black text-indigo-400">{analytics?.average_composite_score || 0} / 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Monitored</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{analytics?.total_students || 0}</p>
          <span className="text-[11px] text-slate-500">Across all SAPC levels</span>
        </div>

        <div className="bg-slate-900/80 border border-rose-500/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">High Risk (70-100)</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{analytics?.high_risk_count || 0}</p>
          <span className="text-[11px] text-rose-400/80">Requires Priority Action</span>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Medium Risk (40-69.9)</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{analytics?.medium_risk_count || 0}</p>
          <span className="text-[11px] text-amber-400/80">Active Remediation</span>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Low Risk (0-39.9)</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{analytics?.low_risk_count || 0}</p>
          <span className="text-[11px] text-emerald-400/80">Standard Monitoring</span>
        </div>
      </div>

      {/* Urgent NLP Distress Alerts Queue (RA 10173 Protected) */}
      {flaggedSessions.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">NLP Distress & Suicide Prevention Alerts</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                {flaggedSessions.length} Urgent
              </span>
            </div>
            <span className="text-xs text-rose-300 font-medium">RA 10173 SPI Sensitive</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flaggedSessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-950/70 border border-rose-500/20 rounded-xl p-3.5 flex flex-col justify-between gap-3 hover:border-rose-500/50 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white">{session.student_name}</span>
                    <span className="text-rose-400 font-bold">Distress Score: {session.aggregate_distress_score}/100</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    <strong>Trigger:</strong> {session.flag_reason}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500">
                    {new Date(session.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedStudentId(session.student_id);
                      setIsDetailOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 transition"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Open Case File</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Student Roster & Risk Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Student Cohort Risk Roster</h3>
            <p className="text-xs text-slate-400">Multi-criteria decision scores updated via AHP model</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Risk Tiers</option>
              <option value="high">High Risk Only</option>
              <option value="medium">Medium Risk Only</option>
              <option value="low">Low Risk Only</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search name or LRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">LRN</th>
                <th className="pb-3">Section / Adviser</th>
                <th className="pb-3">AHP Composite Risk</th>
                <th className="pb-3">Primary Risk Factor</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="text-slate-300 hover:bg-slate-850/40 transition">
                  <td className="py-3 font-semibold text-white">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="py-3 font-mono text-slate-400">{s.lrn}</td>
                  <td className="py-3 text-slate-400">
                    <div>{s.section_name}</div>
                    <div className="text-[10px] text-slate-500">{s.adviser_name}</div>
                  </td>
                  <td className="py-3">
                    <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="md" />
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                      {s.primary_risk_driver || "Academic"}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setIsDetailOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition font-semibold"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setInterventionStudent(s);
                        setIsInterventionOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                      + Care Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Interventions Board */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Active Intervention Protocols</h3>
            <p className="text-xs text-slate-400">Track student remediation and counseling progress</p>
          </div>
          <span className="text-xs font-semibold text-indigo-400">{interventions.length} Plans Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interventions.map((p) => (
            <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white truncate max-w-[160px]">{p.student_name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  p.status === "in_progress" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-300"
                }`}>
                  {p.status.replace("_", " ")}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{p.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">{p.description}</p>
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
                <span>Domain: {p.target_domain}</span>
                <span>Followup: {p.scheduled_followup ? new Date(p.scheduled_followup).toLocaleDateString() : "Pending"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCreateIntervention={(s) => {
          setIsDetailOpen(false);
          setInterventionStudent(s);
          setIsInterventionOpen(true);
        }}
      />

      <InterventionModal
        student={interventionStudent}
        isOpen={isInterventionOpen}
        onClose={() => setIsInterventionOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
