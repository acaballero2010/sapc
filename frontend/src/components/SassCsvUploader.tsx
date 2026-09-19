"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, RefreshCw, Calendar, AlertTriangle } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface SassCsvUploaderProps {
  onSuccess?: () => void;
}

export const SassCsvUploader: React.FC<SassCsvUploaderProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [quarter, setQuarter] = useState("Q1");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
      setValidationErrors([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setResult(null);
    setValidationErrors([]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("academic_year", academicYear);
    formData.append("quarter", quarter);

    try {
      const res = await fetchWithAuth("/academic/upload-sass", {
        method: "POST",
        body: formData
      });
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      let parsedMsg = err.message || "Failed to upload SASS CSV";
      try {
        const errorObj = typeof err.message === "string" ? JSON.parse(err.message) : err;
        if (errorObj.errors && Array.isArray(errorObj.errors)) {
          setValidationErrors(errorObj.errors);
          parsedMsg = `CSV validation failed with ${errorObj.errors.length} error(s).`;
        }
      } catch {
        // regular string error
      }
      setError(parsedMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "student_id,student_name,grade_level,section,quarter_gpa,failing_subjects_count,days_absent,incomplete_requirements_count\n" +
      "109238475612,Joshua Dimaculangan,Grade 11,Grade 11 - St. Augustine (STEM),71.5,2,7,1\n" +
      "109238475613,Angelica Dela Cruz,Grade 11,Grade 11 - St. Augustine (STEM),78.0,0,4,1\n" +
      "109238475614,Mark Anthony Reyes,Grade 12,Grade 12 - St. Thomas (ABM),94.5,0,0,0\n" +
      "109238475615,Bea Villanueva,Grade 11,Grade 11 - St. Augustine (STEM),74.0,1,6,2\n" +
      "109238475616,Christian Garcia,Grade 12,Grade 12 - St. Thomas (ABM),88.0,0,2,0\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SAPC_SASS_Academic_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">SASS Academic CSV Ingestion Pipeline</h3>
            <p className="text-xs text-slate-400">
              Parses quarterly GPA, attendance & failing counts to compute deterministic Academic Risk ($S_&#123;AC&#125;$)
            </p>
          </div>
        </div>
        <button
          onClick={downloadSampleTemplate}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 self-start sm:self-auto"
        >
          Download SASS CSV Template
        </button>
      </div>

      {/* Target Academic Period Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Academic Year</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Grading Quarter</label>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="Q1">1st Quarter (Q1)</option>
            <option value="Q2">2nd Quarter (Q2)</option>
            <option value="Q3">3rd Quarter (Q3)</option>
            <option value="Q4">4th Quarter (Q4 / Final)</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-6 text-center transition bg-slate-950/40">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="sass-csv-input"
        />
        <label htmlFor="sass-csv-input" className="cursor-pointer flex flex-col items-center gap-2">
          <UploadCloud className="h-9 w-9 text-slate-400 hover:text-indigo-400 transition" />
          <span className="text-sm font-medium text-slate-300">
            {file ? file.name : "Click or drag & drop SASS CSV export here"}
          </span>
          <span className="text-xs text-slate-500">
            Required columns: student_id, student_name, grade_level, section, quarter_gpa, failing_subjects_count, days_absent, incomplete_requirements_count
          </span>
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-white">{file.name}</span>
            <span className="text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition disabled:opacity-50 shadow"
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Validating & Processing AHP Risk...</span>
              </>
            ) : (
              <span>Upload & Calculate Academic Risk</span>
            )}
          </button>
        </div>
      )}

      {/* Validation Error Box */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          {validationErrors.length > 0 && (
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-rose-200">
              {validationErrors.map((vErr, i) => (
                <li key={i}>
                  Line {vErr.line} [{vErr.field}]: {vErr.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Success Output Summary */}
      {result && result.success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>SASS Ingestion Completed Successfully (Batch #{result.batch_id})</span>
          </div>
          <p className="text-slate-300">
            Ingested <strong className="text-white">{result.successful_imports}</strong> student records for{" "}
            <strong className="text-emerald-300">{academicYear} {quarter}</strong>.
          </p>

          {result.details && result.details.length > 0 && (
            <div className="mt-2 pt-2 border-t border-emerald-500/20 max-h-40 overflow-y-auto space-y-1">
              {result.details.map((d: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/40 px-2 py-1 rounded">
                  <span>{d.student_name} (ID: {d.student_id})</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    S_AC: {d.academic_risk_score.toFixed(1)}/100 → Composite: {d.composite_risk_score.toFixed(1)} ({d.risk_tier})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
