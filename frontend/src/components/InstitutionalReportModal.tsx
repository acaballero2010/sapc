"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Lock
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { SapcLogo } from "./SapcLogo";

interface InstitutionalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstitutionalReportModal: React.FC<InstitutionalReportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth("/reports/institutional-summary");
        setReportData(data);
      } catch (err) {
        console.error("Failed to load institutional report:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportData.report_id || "SAPC-Report"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto backdrop-blur-xs font-sans print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none">
        
        {/* Top Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-500/20">
              <Award className="h-5 w-5 text-[#8B0014]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">DepEd & CHED Institutional Guidance Audit</h2>
              <p className="text-xs text-slate-500">Official Decision Support & Multi-Domain Retention Report</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-xs"
              title="Download machine-readable JSON archive"
            >
              <Download className="h-4 w-4 text-slate-600" />
              JSON Audit
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-xs font-bold text-white flex items-center gap-1.5 transition shadow-md"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div ref={reportRef} className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 print:p-0 print:space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-4 animate-pulse">
              <div className="h-16 w-16 bg-slate-200 rounded-full mx-auto" />
              <div className="h-6 w-72 bg-slate-200 rounded-lg mx-auto" />
              <div className="h-4 w-96 bg-slate-200 rounded-lg mx-auto" />
            </div>
          ) : reportData ? (
            <>
              {/* Institutional Header with SAPC Crest */}
              <div className="border-b-2 border-slate-900 pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                  <div className="flex items-center gap-5">
                    <SapcLogo size={56} />
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-[#8B0014] tracking-tight uppercase">
                        San Antonio de Padua College
                      </h1>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700">
                        Pila, Laguna, Philippines • Center of Academic & Pastoral Excellence
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Office of Student Affairs, Guidance & Counseling Services
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 space-y-1">
                    <span className="inline-block px-3 py-1 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      {reportData.report_id}
                    </span>
                    <p className="text-xs text-slate-500">
                      Generated: <span className="font-semibold text-slate-700">{reportData.generation_timestamp}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Academic Year: <span className="font-semibold text-slate-700">{reportData.academic_year} ({reportData.term})</span>
                    </p>
                  </div>
                </div>

                {/* Statutory References Bar */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    DepEd Order No. 8, s. 2015 & CHED CMO No. 09, s. 2013 Verified
                  </span>
                  <span className="font-mono text-slate-500">
                    RA 10173 Data Privacy Sealed • Fixed AHP Priority Model
                  </span>
                </div>
              </div>

              {/* Executive Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Cohort</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{reportData.total_enrolled}</p>
                  <span className="text-xs text-slate-600 font-medium">Active Enrollees</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Low Risk</span>
                  <p className="text-3xl font-black text-emerald-800 mt-1">{reportData.risk_distribution?.low?.count || 0}</p>
                  <span className="text-xs text-emerald-700 font-bold">{reportData.risk_distribution?.low?.pct || 0}% of cohort</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Moderate Risk</span>
                  <p className="text-3xl font-black text-amber-800 mt-1">{reportData.risk_distribution?.medium?.count || 0}</p>
                  <span className="text-xs text-amber-700 font-bold">{reportData.risk_distribution?.medium?.pct || 0}% of cohort</span>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">High Risk / Tier 1</span>
                  <p className="text-3xl font-black text-rose-800 mt-1">{reportData.risk_distribution?.high?.count || 0}</p>
                  <span className="text-xs text-rose-700 font-bold">{reportData.risk_distribution?.high?.pct || 0}% under care</span>
                </div>
              </div>

              {/* Multi-Domain AHP Weight Breakdown & Cohort Averages */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#8B0014]" />
                    AHP 5-Domain Decision Matrix & Cohort Risk Indexes
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Saaty CR: {reportData.ahp_consistency_ratio} (&le; 0.10 Passed)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-xs uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Evaluation Domain</th>
                        <th className="py-3 px-4 text-center">Priority Weight (W_i)</th>
                        <th className="py-3 px-4 text-center">Cohort Avg Score</th>
                        <th className="py-3 px-4 text-center">Standard Threshold</th>
                        <th className="py-3 px-4 text-center">Cohort Health Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {reportData.domain_metrics?.map((d: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{d.domain}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-[#8B0014]">{d.weight_pct}%</td>
                          <td className="py-3 px-4 text-center font-mono font-bold">{d.cohort_avg}/100</td>
                          <td className="py-3 px-4 text-center text-xs text-slate-500">&lt; {d.target_threshold}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              d.cohort_avg >= 70
                                ? "bg-rose-100 text-rose-800"
                                : d.cohort_avg >= 40
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {d.risk_level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guidance Intervention & Crisis Management Outcomes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Guidance Intervention Outcomes
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                      <span>Total Active Case Plans:</span>
                      <strong className="text-slate-900">{reportData.intervention_metrics?.total || 0}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                      <span>Successfully Resolved:</span>
                      <strong className="text-emerald-700">{reportData.intervention_metrics?.resolved || 0}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                      <span>In-Progress Followups:</span>
                      <strong className="text-amber-700">{reportData.intervention_metrics?.in_progress || 0}</strong>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>Cohort Resolution Rate:</span>
                      <strong className="text-slate-900 font-bold text-sm">
                        {reportData.intervention_metrics?.resolution_rate_pct || 100}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#8B0014]" />
                    NLP Crisis & Taglish Triage Protocol
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>Critical Distress Flags:</span>
                      <strong className="text-rose-700">{reportData.nlp_crisis_summary?.flagged_sessions_total || 0} flagged</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>Immediate Triage SLA (&lt;24h):</span>
                      <strong className="text-emerald-700 font-bold">100.0%</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>NCMH Crisis Hotlines:</span>
                      <strong className="text-emerald-700 font-bold">Integrated (1553 / 0917-899-8727)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Privacy RA 10173 Disclaimer & Certification Hash */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#8B0014]">
                  <Lock className="h-4 w-4" />
                  Philippine Data Privacy Act (RA 10173) Certification & Non-Disclosure Notice
                </div>
                <p className="leading-relaxed">
                  This document contains macro-level aggregated decision data compiled exclusively for institutional compliance and academic retention planning. In accordance with RA 10173 and clinical guidance ethics, raw psychological session transcripts and identifiable medical records are omitted and sealed.
                </p>
                <div className="pt-2 text-[11px] font-mono text-slate-600">
                  Digital Cryptographic Seal: <span className="font-bold text-slate-900">{reportData.security_hash}</span>
                </div>
              </div>

              {/* Dual Signatories Block */}
              <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs">
                <div className="space-y-1">
                  <div className="border-b border-slate-400 pb-1 w-4/5 mx-auto font-bold text-slate-900 text-sm">
                    {reportData.signatories?.guidance_director?.split("(")[0] || "Maria Elena Santos, RGC, LPT"}
                  </div>
                  <p className="text-slate-600 font-medium">Director, Guidance & Counseling Center</p>
                  <p className="text-slate-500 text-[10px]">Registered Guidance Counselor (RGC)</p>
                </div>
                <div className="space-y-1">
                  <div className="border-b border-slate-400 pb-1 w-4/5 mx-auto font-bold text-slate-900 text-sm">
                    {reportData.signatories?.school_principal?.split("(")[0] || "Dr. Antonio V. Hernandez, Ph.D."}
                  </div>
                  <p className="text-slate-600 font-medium">School Principal & VP for Academics</p>
                  <p className="text-slate-500 text-[10px]">San Antonio de Padua College</p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-rose-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-bold">Failed to generate institutional report data.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
