import React from "react";
import { Sliders, ShieldCheck } from "lucide-react";
import { AuditLogViewer } from "./AuditLogViewer";

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            System Administration
          </span>
          <span className="text-xs text-slate-400">• Security, AHP Matrix & RA 10173 Compliance</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">SAPC IntellySys Central Control</h1>
        <p className="text-xs text-slate-300 max-w-2xl mt-1">
          Configure decision engine criteria weights, manage role boundaries, and audit data access trails.
        </p>
      </div>

      {/* AHP Model Configuration Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AHP Decision Criteria Weights (Fixed Priority Vector)</h3>
            <p className="text-xs text-slate-400">Analytic Hierarchy Process model weights established for San Antonio de Padua College</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400">Academic Domain</span>
            <p className="text-xl font-bold text-blue-400 mt-1">40.17%</p>
            <span className="text-[10px] text-slate-500">Weight: 0.4017</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400">Mental Health</span>
            <p className="text-xl font-bold text-purple-400 mt-1">24.42%</p>
            <span className="text-[10px] text-slate-500">Weight: 0.2442</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400">Financial Strain</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">13.73%</p>
            <span className="text-[10px] text-slate-500">Weight: 0.1373</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400">Family Factors</span>
            <p className="text-xl font-bold text-amber-400 mt-1">13.73%</p>
            <span className="text-[10px] text-slate-500">Weight: 0.1373</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400">Physical Health</span>
            <p className="text-xl font-bold text-rose-400 mt-1">7.94%</p>
            <span className="text-[10px] text-slate-500">Weight: 0.0794</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span>
            <strong>Consistency Ratio (CR):</strong> 0.048 (Passes Saaty standard: CR &lt; 0.10)
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> Validated Model
          </span>
        </div>
      </div>

      {/* RA 10173 Audit Log Viewer */}
      <AuditLogViewer />
    </div>
  );
};
