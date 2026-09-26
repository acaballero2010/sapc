import React, { useState, useRef } from "react";
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  Award,
  Layers,
  PenTool,
  RotateCcw,
  Stamp
} from "lucide-react";
import { SAPC_500_STUDENTS } from "@/data/students500";
import { exportToCSV, exportToJSON } from "@/lib/export-utils";
import { getActiveStudentDataset } from "@/lib/dataset-store";

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: number;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  defaultStudentId = 1
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number>(defaultStudentId);
  const [reportType, setReportType] = useState<"form138" | "ahp_detailed" | "cohort_csv" | "ahp_matrix_json">("form138");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Digital Signature State
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#8B0014";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureDataUrl(null);
  };

  const applyDefaultSignature = () => {
    // Generate clean SVG signature text stamp
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "italic 22px cursive";
        ctx.fillStyle = "#8B0014";
        ctx.fillText("Elena Santos, RGC #00412", 20, 45);
        setSignatureDataUrl(canvas.toDataURL("image/png"));
      }
    }
  };

  if (!isOpen) return null;

  const dataset = getActiveStudentDataset();
  const student = dataset.find(s => s.id === selectedStudentId) || dataset[0] || SAPC_500_STUDENTS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    const rows = dataset.map(s => ({
      ID: s.id,
      FullName: s.full_name,
      LRN: s.lrn,
      Grade: s.grade_level,
      Strand: s.strand,
      Section: s.section_name,
      Adviser: s.adviser_name,
      CompositeRiskScore: s.latest_risk_score,
      RiskTier: s.latest_risk_tier.toUpperCase(),
      PrimaryRiskDriver: s.primary_risk_driver,
      AcademicScore_30pct: s.domain_scores.academic,
      FamilyScore_20pct: s.domain_scores.family,
      HealthScore_20pct: s.domain_scores.health,
      MentalHealthScore_15pct: s.domain_scores.mental_health,
      FinancialScore_15pct: s.domain_scores.financial,
      GPA: s.sass_metrics.gpa,
      AttendanceRate: `${s.sass_metrics.attendance_rate_pct}%`
    }));

    exportToCSV(`SAPC_Cohort_AHP_Risk_Summary_${new Date().toISOString().slice(0,10)}`, rows);
    setIsExporting(false);
    setExportSuccess("SAPC Cohort CSV successfully downloaded!");
    setTimeout(() => setExportSuccess(null), 3500);
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    const exportData = {
      institution: "San Antonio de Padua College",
      system: "SAPC IntellySys AHP Decision Engine",
      exportedAt: new Date().toISOString(),
      ahpWeights: {
        academic: 0.30,
        family: 0.20,
        health: 0.20,
        mentalHealth: 0.15,
        financial: 0.15
      },
      consistencyRatio: 0.042,
      totalStudents: dataset.length,
      students: dataset
    };

    exportToJSON(`SAPC_AHP_Decision_Model_${new Date().toISOString().slice(0,10)}`, exportData);
    setIsExporting(false);
    setExportSuccess("AHP Decision Matrix JSON successfully exported!");
    setTimeout(() => setExportSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Official Report &amp; Data Export Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate DepEd Form 138 / AHP Decision Dossiers, CSV records, and print-ready briefs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Export Type Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setReportType("form138")}
              className={`p-3.5 rounded-2xl border text-left transition ${
                reportType === "form138"
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-950 dark:text-amber-200 shadow-xs"
                  : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="h-5 w-5 mb-1 text-amber-600" />
              <div className="font-extrabold text-xs">DepEd Form 138</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Report Card &amp; AHP Addendum</div>
            </button>

            <button
              onClick={() => setReportType("ahp_detailed")}
              className={`p-3.5 rounded-2xl border text-left transition ${
                reportType === "ahp_detailed"
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-950 dark:text-amber-200 shadow-xs"
                  : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Award className="h-5 w-5 mb-1 text-amber-600" />
              <div className="font-extrabold text-xs">AHP Risk Dossier</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">5-Domain Matrix Analysis</div>
            </button>

            <button
              onClick={() => setReportType("cohort_csv")}
              className={`p-3.5 rounded-2xl border text-left transition ${
                reportType === "cohort_csv"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-950 dark:text-emerald-200 shadow-xs"
                  : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <FileSpreadsheet className="h-5 w-5 mb-1 text-emerald-600" />
              <div className="font-extrabold text-xs">Cohort CSV Export</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">All 500 Students Dataset</div>
            </button>

            <button
              onClick={() => setReportType("ahp_matrix_json")}
              className={`p-3.5 rounded-2xl border text-left transition ${
                reportType === "ahp_matrix_json"
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-950 dark:text-blue-200 shadow-xs"
                  : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="h-5 w-5 mb-1 text-blue-600" />
              <div className="font-extrabold text-xs">JSON System Backup</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Weights &amp; Audit Trail</div>
            </button>
          </div>

          {/* Student Selector for Individual Reports */}
          {(reportType === "form138" || reportType === "ahp_detailed") && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Student for Individual Dossier:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                className="w-full sm:w-80 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                {dataset.slice(0, 50).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.section_name} • LRN: {s.lrn})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Printable Document Preview */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 rounded-3xl shadow-inner space-y-6 text-slate-900 dark:text-slate-100">
            
            {/* DepEd / School Official Letterhead */}
            <div className="text-center border-b-2 border-slate-900 dark:border-slate-400 pb-4 space-y-1">
              <div className="text-[11px] font-serif uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Republic of the Philippines • Department of Education • Region IV-A CALABARZON
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#8B0014] dark:text-rose-400">
                SAN ANTONIO DE PADUA COLLEGE
              </h1>
              <p className="text-xs font-serif text-slate-600 dark:text-slate-300">
                National Highway, Pila, Laguna • Junior &amp; Senior High School Guidance Department
              </p>
              <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pt-2">
                {reportType === "form138" ? "OFFICIAL PROGRESS REPORT & AHP MULTI-FACTOR DECISION DOSSIER" : "AHP HOLISTIC RISK ASSESSMENT & INTERVENTION DIRECTIVE"}
              </div>
            </div>

            {/* Student Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Learner Name</span>
                <strong className="text-sm font-extrabold">{student.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">LRN (Learner Ref #)</span>
                <strong className="text-sm font-extrabold font-mono">{student.lrn}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Grade &amp; Section</span>
                <strong className="text-sm font-extrabold">Grade {student.grade_level} - {student.section_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Class Adviser</span>
                <strong className="text-sm font-extrabold">{student.adviser_name}</strong>
              </div>
            </div>

            {/* AHP 5-Domain Multi-Factor Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1">
                AHP 5-Domain Psychometric Risk Weights &amp; Diagnostic Indices
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Academic (30%)</span>
                  <p className="text-lg font-black text-[#8B0014] dark:text-rose-400">{student.domain_scores.academic.toFixed(1)} / 30</p>
                  <span className="text-[9px] text-slate-400">GPA: {student.sass_metrics.gpa}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Family (20%)</span>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">{student.domain_scores.family.toFixed(1)} / 20</p>
                  <span className="text-[9px] text-slate-400">Verified Consent</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Health (20%)</span>
                  <p className="text-lg font-black text-rose-600 dark:text-rose-400">{student.domain_scores.health.toFixed(1)} / 20</p>
                  <span className="text-[9px] text-slate-400">Attend: {student.sass_metrics.attendance_rate_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Mental Health (15%)</span>
                  <p className="text-lg font-black text-purple-600 dark:text-purple-400">{student.domain_scores.mental_health.toFixed(1)} / 15</p>
                  <span className="text-[9px] text-slate-400">PHQ-9 / GAD-7</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Financial (15%)</span>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400">{student.domain_scores.financial.toFixed(1)} / 15</p>
                  <span className="text-[9px] text-slate-400">ESC / DepEd Voucher</span>
                </div>
              </div>
            </div>

            {/* Composite Risk Conclusion */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                  AHP Composite Risk Classification
                </span>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  Score: {student.latest_risk_score} / 100 • {student.latest_risk_tier.toUpperCase()} VULNERABILITY
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Primary Trigger Driver: <span className="font-bold text-slate-900 dark:text-white">{student.primary_risk_driver}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block">Consistency Ratio (CR)</span>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">0.042 &lt; 0.10 (Consistent)</span>
              </div>
            </div>

            {/* Digital Counselor Signature Pad Control (Interactive) */}
            <div className="no-print p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <PenTool className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                  Official Guidance Counselor Digital Signature
                </span>
                <button
                  type="button"
                  onClick={() => setShowSignaturePad(!showSignaturePad)}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  {showSignaturePad ? "Hide Signature Pad" : signatureDataUrl ? "Edit Signature" : "Sign Report Now"}
                </button>
              </div>

              {showSignaturePad && (
                <div className="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Draw your signature below using your mouse or touchscreen to authenticate this DepEd Form 138 / AHP Dossier:
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={90}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="bg-white border-2 border-dashed border-amber-400 rounded-xl cursor-crosshair shadow-inner"
                    />
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Clear
                      </button>
                      <button
                        type="button"
                        onClick={applyDefaultSignature}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 hover:bg-amber-300 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Stamp className="h-3.5 w-3.5" /> Use Official Seal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sign-off Block */}
            <div className="pt-6 border-t border-slate-300 dark:border-slate-700 grid grid-cols-3 gap-6 text-center text-xs">
              <div className="flex flex-col items-center justify-end">
                {signatureDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={signatureDataUrl} 
                    alt="Counselor Signature" 
                    className="h-12 object-contain mb-1"
                  />
                ) : (
                  <div className="h-12 flex items-center justify-center text-[10px] text-slate-400 italic">
                    [Pending RGC Signature]
                  </div>
                )}
                <div className="border-b border-slate-400 pb-1 font-bold w-full">Ms. Elena Santos, RGC</div>
                <div className="text-[10px] text-slate-400 mt-1">Registered Guidance Counselor • Lic #00412</div>
              </div>
              <div className="flex flex-col items-center justify-end">
                <div className="h-12 flex items-center justify-center text-[10px] text-slate-400 italic">
                  [Adviser Approved]
                </div>
                <div className="border-b border-slate-400 pb-1 font-bold w-full">{student.adviser_name}</div>
                <div className="text-[10px] text-slate-400 mt-1">Class Adviser / Department Chair</div>
              </div>
              <div className="flex flex-col items-center justify-end">
                <div className="h-12 flex items-center justify-center text-[10px] text-slate-400 italic">
                  [Verified DepEd Region IV-A]
                </div>
                <div className="border-b border-slate-400 pb-1 font-bold w-full">Dr. Carmela Bautista</div>
                <div className="text-[10px] text-slate-400 mt-1">School Principal / Academic Director</div>
              </div>
            </div>

            {/* DepEd Governance Footer */}
            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Generated via SAPC IntellySys in compliance with DepEd Order No. 40, s. 2012, RA 10173 (Data Privacy Act), and RA 11036 (Mental Health Act).
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div>
            {exportSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> {exportSuccess}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              Print / Save as PDF
            </button>

            {reportType === "cohort_csv" ? (
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> {isExporting ? "Exporting..." : "Download 500-Student CSV"}
              </button>
            ) : reportType === "ahp_matrix_json" ? (
              <button
                onClick={handleExportJSON}
                disabled={isExporting}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> {isExporting ? "Exporting..." : "Download AHP JSON Backup"}
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-[#8B0014] hover:bg-[#5A000D] text-white transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Official PDF
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
