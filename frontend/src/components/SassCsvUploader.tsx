"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, RefreshCw } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface SassCsvUploaderProps {
  onSuccess?: () => void;
}

export const SassCsvUploader: React.FC<SassCsvUploaderProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetchWithAuth("/academic/sass-import", {
        method: "POST",
        body: formData
      });
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to import SASS CSV");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "lrn,first_name,last_name,school_year,semester,quarter,gpa,failed_subjects,incomplete_subjects,attendance_rate,absences,tardiness\n" +
      "109238475612,Joshua,Dimaculangan,2025-2026,1st,Final,73.5,2,1,78.0,11,5\n" +
      "109238475613,Angelica,Dela Cruz,2025-2026,1st,Final,81.0,0,1,88.5,5,2\n" +
      "109238475614,Mark Anthony,Reyes,2025-2026,1st,Final,92.5,0,0,98.0,1,0\n" +
      "109238475615,Bea,Villanueva,2025-2026,1st,Final,76.0,1,0,82.0,8,4\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SAPC_SASS_Academic_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">SASS Academic Data Ingestion</h3>
            <p className="text-xs text-slate-400">Import student grades, attendance & absences to trigger AHP calculations</p>
          </div>
        </div>
        <button
          onClick={downloadSampleTemplate}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
        >
          Download CSV Template
        </button>
      </div>

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
          <span className="text-xs text-slate-500">Supports .csv with LRN, GPA, Absences, Incompletes</span>
        </label>
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-white">{file.name}</span>
            <span className="text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Processing AHP Model...</span>
              </>
            ) : (
              <span>Process & Update Scores</span>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-200">
          <div className="flex items-center gap-2 font-bold text-emerald-400 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Ingestion Successful (Batch #{result.batch_id})</span>
          </div>
          <p className="text-slate-300">
            Processed <strong className="text-white">{result.total_processed}</strong> records with{" "}
            <strong className="text-emerald-400">{result.successful_imports}</strong> students updated.
          </p>
        </div>
      )}
    </div>
  );
};
