"use client";

import React, { useState, useEffect } from "react";
import { Sliders, ShieldCheck, Settings, Award } from "lucide-react";
import { AuditLogViewer } from "./AuditLogViewer";
import { InstitutionalReportModal } from "./InstitutionalReportModal";
import { CohortTrendAnalytics } from "./CohortTrendAnalytics";

export const AdminDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-8 pb-12 font-sans animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="h-64 rounded-3xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-8 sm:p-9 shadow-md text-white border-t-4 border-amber-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-amber-300" />
                System Administration
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• Security, AHP Matrix & RA 10173 Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              SAPC IntellySys Central Control
            </h1>
            <p className="text-sm sm:text-base text-rose-50/95 mt-2 leading-relaxed max-w-3xl font-normal">
              Configure decision engine criteria weights, manage role boundaries, and audit data access trails.
            </p>
          </div>
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0 self-start md:self-center"
          >
            <Award className="h-4 w-4 text-[#8B0014]" />
            DepEd / CHED Report
          </button>
        </div>
      </div>

      {/* AHP Model Configuration Card */}
      <div id="ahp-matrix" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] shadow-xs">
            <Sliders className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">AHP Decision Criteria Weights (Fixed Priority Vector)</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Analytic Hierarchy Process model weights established for San Antonio de Padua College
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Academic Domain</span>
            <p className="text-2xl sm:text-3xl font-black text-[#8B0014] mt-2">40.17%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">Weight: 0.4017</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Mental Health</span>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">24.42%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">Weight: 0.2442</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Financial Strain</span>
            <p className="text-2xl sm:text-3xl font-black text-[#D97706] mt-2">13.73%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">Weight: 0.1373</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Family Factors</span>
            <p className="text-2xl sm:text-3xl font-black text-[#D97706] mt-2">13.73%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">Weight: 0.1373</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Physical Health</span>
            <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">7.94%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">Weight: 0.0794</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            <strong className="text-slate-900">Consistency Ratio (CR):</strong> <span className="text-emerald-700 font-bold">0.048</span> (Passes Saaty standard: CR ≤ 0.10)
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5" /> Validated Decision Model
          </span>
        </div>
      </div>

      {/* Longitudinal Multi-Semester Trends & Retention Health */}
      <div id="trend-analytics" className="scroll-mt-24">
        <CohortTrendAnalytics />
      </div>

      {/* RA 10173 Audit Log Viewer */}
      <div id="audit-logs" className="scroll-mt-24">
        <AuditLogViewer />
      </div>

      <InstitutionalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
