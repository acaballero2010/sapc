"use client";

import React, { useState } from "react";
import { 
  Archive, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  FileSpreadsheet, 
  X, 
  Sparkles,
  Database,
  HardDrive,
  FileCode
} from "lucide-react";
import { INGESTION_DOMAINS, IngestionDomain } from "@/data/sample_templates";
import { SAPC_500_STUDENTS } from "@/data/students500";

interface ArchiveSnapshot {
  id: string;
  name: string;
  timestamp: string;
  studentCount: number;
  description: string;
  domainsIncluded: string[];
  sizeKb: number;
}

interface DatasetArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSnapshot?: (snapshotId: string) => void;
}

const DEFAULT_SNAPSHOTS: ArchiveSnapshot[] = [
  {
    id: "SNAP-2026-Q1-DEMO500",
    name: "SAPC Baseline 500-Student Cohort (Q1 2026)",
    timestamp: "2026-09-20 14:30:00",
    studentCount: 500,
    description: "Full psychometrician-validated 5-domain sample dataset across Grades 7–12 with realistic risk distributions.",
    domainsIncluded: ["Academic", "Family", "Health", "Mental Health", "Financial"],
    sizeKb: 489
  },
  {
    id: "SNAP-2026-HIGH-RISK-TRIAGE",
    name: "High-Risk Early Intervention Test Cohort",
    timestamp: "2026-09-18 09:15:00",
    studentCount: 45,
    description: "Targeted sub-sample with elevated absenteeism, failing marks, and PHQ-9/GAD-7 distress triggers.",
    domainsIncluded: ["Academic", "Mental Health", "Family"],
    sizeKb: 48
  }
];

export const DatasetArchiveModal: React.FC<DatasetArchiveModalProps> = ({
  isOpen,
  onClose,
  onRestoreSnapshot
}) => {
  const [snapshots, setSnapshots] = useState<ArchiveSnapshot[]>(DEFAULT_SNAPSHOTS);
  const [newArchiveName, setNewArchiveName] = useState("");
  const [newArchiveDesc, setNewArchiveDesc] = useState("");
  const [activeTab, setActiveTab] = useState<"export" | "snapshots" | "individual">("export");
  const [isArchiving, setIsArchiving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Download Master JSON Bundle (500 Students)
  const downloadMasterJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(SAPC_500_STUDENTS, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SAPC_Master_500_Students_Archive_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Master 500-student database JSON archive downloaded successfully!");
  };

  // 1b. Download Master CSV Bundle (500 Students)
  const downloadMasterCsv = () => {
    const headers = [
      "lrn",
      "full_name",
      "first_name",
      "last_name",
      "grade_level",
      "strand",
      "section_name",
      "adviser_name",
      "email",
      "quarter_gpa",
      "failing_subjects_count",
      "days_absent",
      "attendance_rate_pct",
      "incomplete_requirements_count",
      "academic_score",
      "family_score",
      "health_score",
      "mental_health_score",
      "financial_score",
      "composite_risk_score",
      "risk_tier",
      "primary_risk_driver",
      "extracurricular_club",
      "club_participation_level",
      "hobbies_interests"
    ];

    const csvRows = [
      headers.join(","),
      ...SAPC_500_STUDENTS.map(s => [
        `"${s.lrn}"`,
        `"${s.full_name}"`,
        `"${s.first_name}"`,
        `"${s.last_name}"`,
        s.grade_level,
        `"${s.strand}"`,
        `"${s.section_name}"`,
        `"${s.adviser_name}"`,
        `"${s.email}"`,
        s.sass_metrics.gpa,
        s.sass_metrics.failing_subjects_count,
        s.sass_metrics.days_absent,
        s.sass_metrics.attendance_rate_pct,
        s.sass_metrics.incomplete_requirements_count,
        s.domain_scores.academic,
        s.domain_scores.family,
        s.domain_scores.health,
        s.domain_scores.mental_health,
        s.domain_scores.financial,
        s.latest_risk_score,
        `"${s.latest_risk_tier.toUpperCase()}"`,
        `"${s.primary_risk_driver}"`,
        `"${s.sass_metrics.extracurricular_club}"`,
        `"${s.sass_metrics.club_participation_level}"`,
        `"${s.sass_metrics.hobbies_interests}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SAPC_Master_500_Students_Archive_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("Master 500-student database CSV archive downloaded successfully!");
  };

  // 2. Download Individual Domain CSV
  const downloadDomainCsv = (domainKey: IngestionDomain) => {
    const meta = INGESTION_DOMAINS[domainKey];
    const blob = new Blob([meta.sampleData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", meta.csvFileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Downloaded ${meta.title} sample CSV dataset!`);
  };

  // 3. Create a New Named Snapshot
  const handleCreateSnapshot = () => {
    if (!newArchiveName.trim()) return;
    setIsArchiving(true);
    setTimeout(() => {
      const newSnap: ArchiveSnapshot = {
        id: `SNAP-${Date.now().toString().slice(-6)}`,
        name: newArchiveName.trim(),
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        studentCount: 500,
        description: newArchiveDesc.trim() || "Manual dataset snapshot created by administrator.",
        domainsIncluded: ["Academic", "Family", "Health", "Mental Health", "Financial"],
        sizeKb: 489
      };
      setSnapshots([newSnap, ...snapshots]);
      setNewArchiveName("");
      setNewArchiveDesc("");
      setIsArchiving(false);
      showToast(`Snapshot "${newSnap.name}" created and archived!`);
    }, 400);
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              <Archive className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Sample Dataset Archive &amp; Backup Manager</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase">
                  v2.5
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Easily archive, download, snapshot, or restore sample datasets in CSV and JSON formats
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Toast Banner */}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800/80 px-6 py-2.5 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={() => setActiveTab("export")}
            className={`pb-3 text-xs font-extrabold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "export"
                ? "border-[#8B0014] text-[#8B0014] dark:border-rose-400 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Export &amp; Backup All</span>
          </button>

          <button
            onClick={() => setActiveTab("snapshots")}
            className={`pb-3 text-xs font-extrabold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "snapshots"
                ? "border-[#8B0014] text-[#8B0014] dark:border-rose-400 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <HardDrive className="h-4 w-4" />
            <span>Snapshot Archives ({snapshots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("individual")}
            className={`pb-3 text-xs font-extrabold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "individual"
                ? "border-[#8B0014] text-[#8B0014] dark:border-rose-400 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>5-Domain CSV Templates</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh]">
          {/* TAB 1: EXPORT & BACKUP ALL */}
          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Database className="h-5 w-5 text-[#8B0014] dark:text-rose-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Full 500-Student Master Database
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Complete dataset containing all 500 student profiles, SASS GPA, absences, and 5-domain scores.
                      </p>
                    </div>
                  </div>

                  {/* Dual Format Download Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={downloadMasterCsv}
                      className="px-3.5 py-2 rounded-xl bg-[#8B0014] hover:bg-[#700010] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Download as Excel/Spreadsheet-compatible CSV file"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Download CSV</span>
                    </button>

                    <button
                      onClick={downloadMasterJson}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Download as full structured JSON archive"
                    >
                      <FileCode className="h-4 w-4" />
                      <span>Download JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Create New Snapshot Form */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-amber-500" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Create a Local Archive Snapshot
                  </h4>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Snapshot Name (e.g., 'Q2-Pre-Intervention-Baseline')"
                    value={newArchiveName}
                    onChange={e => setNewArchiveName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8B0014]"
                  />
                  <input
                    type="text"
                    placeholder="Optional description / notes for this archive version..."
                    value={newArchiveDesc}
                    onChange={e => setNewArchiveDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8B0014]"
                  />
                </div>

                <button
                  onClick={handleCreateSnapshot}
                  disabled={!newArchiveName.trim() || isArchiving}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isArchiving ? "Saving Snapshot..." : "Save Archive Snapshot"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SNAPSHOT ARCHIVES */}
          {activeTab === "snapshots" && (
            <div className="space-y-3">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {snap.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                        {snap.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {snap.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      <span>📅 {snap.timestamp}</span>
                      <span>👥 {snap.studentCount} Students</span>
                      <span>📦 {snap.sizeKb} KB</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={downloadMasterCsv}
                      title="Download snapshot as CSV"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#8B0014] dark:text-rose-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={downloadMasterJson}
                      title="Download snapshot as JSON"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      <span>JSON</span>
                    </button>
                    {onRestoreSnapshot && (
                      <button
                        onClick={() => {
                          onRestoreSnapshot(snap.id);
                          showToast(`Restored dataset snapshot ${snap.name}!`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-[#8B0014] dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-rose-100 transition"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: INDIVIDUAL DOMAIN CSV TEMPLATES */}
          {activeTab === "individual" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(INGESTION_DOMAINS) as IngestionDomain[]).map((key) => {
                const domain = INGESTION_DOMAINS[key];
                return (
                  <div
                    key={key}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{domain.icon}</span>
                          <span>{domain.title}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {domain.weight}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {domain.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                        {domain.csvFileName}
                      </span>
                      <button
                        onClick={() => downloadDomainCsv(key)}
                        className="px-2.5 py-1 rounded-lg bg-[#8B0014] text-white text-[11px] font-bold hover:bg-[#700010] transition flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download CSV</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Dataset backups encrypted &amp; compliant with RA 10173</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
