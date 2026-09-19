"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, RefreshCw } from "lucide-react";
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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#8B0014]">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">SASS Academic CSV Ingestion Pipeline</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Parses quarterly GPA, attendance & failing counts to compute deterministic Academic Risk (S_AC)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <a
            href="/samples/sapc_500_students_sass_cohort.csv"
            download="SAPC_500_Students_Cohort_SASS.csv"
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs shadow-2xs transition flex items-center gap-1.5"
          >
            <span>📥 Download 500-Student SASS Cohort (.csv)</span>
          </a>
          <button
            onClick={downloadSampleTemplate}
            className="text-xs font-bold text-[#8B0014] hover:text-[#6D0010] underline underline-offset-4 px-2"
          >
            Sample Template
          </button>
        </div>
      </div>

      {/* Target Academic Period Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Year</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full bg-white border border-slate-200 text-sm font-semibold text-slate-900 rounded-xl p-3 focus:outline-none focus:border-[#8B0014] transition"
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Grading Quarter</label>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="w-full bg-white border border-slate-200 text-sm font-semibold text-slate-900 rounded-xl p-3 focus:outline-none focus:border-[#8B0014] transition"
          >
            <option value="Q1">1st Quarter (Q1)</option>
            <option value="Q2">2nd Quarter (Q2)</option>
            <option value="Q3">3rd Quarter (Q3)</option>
            <option value="Q4">4th Quarter (Q4 / Final)</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 hover:border-[#8B0014] rounded-2xl p-8 text-center transition bg-slate-50/50">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="sass-csv-input"
        />
        <label htmlFor="sass-csv-input" className="cursor-pointer flex flex-col items-center gap-3">
          <UploadCloud className="h-10 w-10 text-slate-400 hover:text-[#8B0014] transition" />
          <span className="text-base font-bold text-slate-900">
            {file ? file.name : "Click or drag & drop SASS CSV export here"}
          </span>
          <span className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Required columns: student_id, student_name, grade_level, section, quarter_gpa, failing_subjects_count, days_absent, incomplete_requirements_count
          </span>
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <span className="font-bold text-slate-900">{file.name}</span>
            <span className="text-slate-500 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8B0014] hover:bg-[#6D0010] text-white flex items-center gap-2 transition disabled:opacity-50 shadow-xs"
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
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
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-900 space-y-2.5">
          <div className="flex items-center gap-2.5 font-bold text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          {validationErrors.length > 0 && (
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-xs text-rose-800">
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
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 font-bold text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>SASS Ingestion Completed Successfully (Batch #{result.batch_id})</span>
          </div>
          <p className="text-slate-700">
            Ingested <strong className="text-slate-900 font-bold">{result.successful_imports}</strong> student records for{" "}
            <strong className="text-emerald-800 font-bold">{academicYear} {quarter}</strong>.
          </p>

          {result.details && result.details.length > 0 && (
            <div className="mt-2 pt-3 border-t border-emerald-200 max-h-48 overflow-y-auto space-y-2">
              {result.details.map((d: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm text-slate-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
                  <span className="font-medium">{d.student_name} (ID: {d.student_id})</span>
                  <span className="font-mono text-[#D97706] font-bold">
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
