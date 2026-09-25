"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Printer,
  FileText,
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  School,
  User,
} from "lucide-react";
import { StudentRecord, getActiveStudentDataset } from "@/lib/dataset-store";
import { useToast } from "@/lib/toast-context";

interface DepEdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent?: StudentRecord | null;
}

export function DepEdFormModal({
  isOpen,
  onClose,
  selectedStudent,
}: DepEdFormModalProps) {
  const { success } = useToast();
  const dataset = useMemo(() => getActiveStudentDataset(), [isOpen]);
  const [activeForm, setActiveForm] = useState<"SF9" | "SF10">("SF9");
  const [studentId, setStudentId] = useState<string>(
    selectedStudent ? String(selectedStudent.id) : (dataset[0] ? String(dataset[0].id) : "")
  );

  const student = useMemo(() => {
    return dataset.find((s) => String(s.id) === String(studentId)) || dataset[0];
  }, [dataset, studentId]);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
    success("Print Triggered", `Generated DepEd ${activeForm} for ${student.full_name}.`);
  };

  const gwa = student.sass_metrics?.gpa || student.domain_scores?.academic || 85;
  const gradeLevel = student.grade_level || 11;
  const trackStrand = student.strand ? `Academic - ${student.strand.toUpperCase()}` : "Academic - STEM";

  // Synthesize subject grades according to DepEd SHS curriculum
  const subjects = [
    { code: "CORE-01", name: "Oral Communication in Context", q1: Math.round(gwa - 1), q2: Math.round(gwa + 1), final: Math.round(gwa), status: gwa >= 75 ? "PASSED" : "FAILED" },
    { code: "CORE-02", name: "General Mathematics", q1: Math.round(gwa - 3), q2: Math.round(gwa - 2), final: Math.round(gwa - 2.5), status: gwa - 2.5 >= 75 ? "PASSED" : "FAILED" },
    { code: "CORE-03", name: "Earth and Life Science", q1: Math.round(gwa + 2), q2: Math.round(gwa), final: Math.round(gwa + 1), status: "PASSED" },
    { code: "CORE-04", name: "Personal Development", q1: Math.round(gwa + 1), q2: Math.round(gwa + 2), final: Math.round(gwa + 1.5), status: "PASSED" },
    { code: "APPL-01", name: "Empowerment Technologies (ICT)", q1: Math.round(gwa + 3), q2: Math.round(gwa + 2), final: Math.round(gwa + 2.5), status: "PASSED" },
    { code: "SPEC-01", name: "Pre-Calculus / Specialized Subject", q1: Math.round(gwa - 4), q2: Math.round(gwa - 3), final: Math.round(gwa - 3.5), status: gwa - 3.5 >= 75 ? "PASSED" : "FAILED" },
    { code: "SPEC-02", name: "Basic Calculus / Strand Elective", q1: Math.round(gwa - 2), q2: Math.round(gwa - 1), final: Math.round(gwa - 1.5), status: gwa - 1.5 >= 75 ? "PASSED" : "FAILED" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-800 text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                DepEd Official Progress & Record Card Generator
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 font-extrabold">
                  DO 8, s. 2015
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Official Department of Education standard formatting with AHP multi-domain guidance insights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Form Toggle */}
            <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setActiveForm("SF9")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeForm === "SF9" ? "bg-white dark:bg-slate-700 text-red-800 dark:text-red-300 shadow-sm" : "text-slate-600 dark:text-slate-400"}`}
              >
                SF9 (Report Card)
              </button>
              <button
                onClick={() => setActiveForm("SF10")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeForm === "SF10" ? "bg-white dark:bg-slate-700 text-red-800 dark:text-red-300 shadow-sm" : "text-slate-600 dark:text-slate-400"}`}
              >
                SF10 (Permanent Record)
              </button>
            </div>

            {/* Student Picker */}
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              {dataset.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} (LRN: {s.lrn})
                </option>
              ))}
            </select>

            {/* Print Trigger */}
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-red-800 hover:bg-red-700 flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950 print:p-0 print:bg-white text-slate-900">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-4 text-[12px] leading-snug">
            {/* DepEd Official Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-16 h-16 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  DEPED
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-semibold text-slate-600">
                    Republic of the Philippines • Department of Education
                  </h4>
                  <h3 className="text-sm font-black uppercase text-red-900 tracking-tight">
                    Region IV-A CALABARZON • Division of Laguna
                  </h3>
                  <h2 className="text-base font-black uppercase tracking-wide text-slate-900 mt-0.5">
                    SAN ANTONIO DE PADUA COLLEGE
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    National Highway, Pila, Laguna • School ID: 402511
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border border-red-800 flex items-center justify-center text-[10px] font-bold text-red-800">
                  SAPC
                </div>
              </div>
              <div className="mt-2 inline-block px-4 py-1 bg-slate-900 text-white font-extrabold uppercase tracking-wider text-xs rounded">
                {activeForm === "SF9"
                  ? "School Form 9 - Senior High School Learner's Progress Report (SF9-SHS)"
                  : "School Form 10 - Senior High School Learner's Permanent Academic Record (SF10-SHS)"}
              </div>
            </div>

            {/* Learner Information Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-5 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Learner Name:</span>
                <span className="font-bold text-slate-900">{student.full_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">LRN:</span>
                <span className="font-bold text-slate-900">{student.lrn}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Grade & Section:</span>
                <span className="font-bold text-slate-900">Grade {gradeLevel} - {student.section_name || "St. Anthony"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Track & Strand:</span>
                <span className="font-bold text-slate-900">{trackStrand}</span>
              </div>
            </div>

            {/* Academic Performance Table */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center justify-between">
                <span>Report on Learning Progress and Achievement (DepEd DO 8, s. 2015)</span>
                <span className="text-[10px] font-normal text-slate-500 font-mono">School Year 2025–2026</span>
              </h3>
              <table className="w-full border-collapse border border-slate-300 text-center text-[11px]">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="border border-slate-300 py-1.5 px-3 text-left">Subjects / Learning Areas</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-14">Q1</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-14">Q2</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-20">Final Grade</th>
                    <th className="border border-slate-300 py-1.5 px-3 w-24">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => (
                    <tr key={sub.code} className="hover:bg-slate-50">
                      <td className="border border-slate-300 py-1 px-3 text-left font-medium">
                        <span className="text-[9px] text-slate-500 font-mono mr-1.5">[{sub.code}]</span>
                        {sub.name}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 font-mono">{sub.q1}</td>
                      <td className="border border-slate-300 py-1 px-2 font-mono">{sub.q2}</td>
                      <td className="border border-slate-300 py-1 px-2 font-mono font-bold">{sub.final}</td>
                      <td className="border border-slate-300 py-1 px-3">
                        <span className={`font-bold ${sub.final >= 75 ? "text-emerald-700" : "text-rose-700"}`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="border border-slate-300 py-2 px-3 text-left uppercase text-slate-800">
                      General Weighted Average (GWA)
                    </td>
                    <td className="border border-slate-300 py-2 px-2 font-mono" colSpan={2}>
                      -
                    </td>
                    <td className="border border-slate-300 py-2 px-2 font-mono text-sm text-red-900 font-black">
                      {gwa.toFixed(2)}
                    </td>
                    <td className="border border-slate-300 py-2 px-3 text-emerald-700 font-black">
                      {gwa >= 75 ? "PROMOTED" : "REMEDIAL REQUIRED"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SAPC IntellySys Multi-Domain AHP Early Warning Insights */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-red-900 mb-2 flex items-center justify-between">
                <span>SAPC IntellySys Multi-Domain AHP Non-Academic Assessment Profile</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${student.latest_risk_tier === "high" ? "bg-rose-100 text-rose-800" : student.latest_risk_tier === "medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                  Risk Cohort: {student.latest_risk_tier || "Low"} ({student.latest_risk_score ?? 15}%)
                </span>
              </h3>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block font-sans">Academic Domain</span>
                  <span className="font-bold text-xs text-blue-700">{student.domain_scores?.academic ?? 80}%</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block font-sans">Family Support</span>
                  <span className="font-bold text-xs text-emerald-700">{student.domain_scores?.family ?? 85}%</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block font-sans">Physical Health</span>
                  <span className="font-bold text-xs text-purple-700">{student.domain_scores?.health ?? 90}%</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block font-sans">Mental Wellbeing</span>
                  <span className="font-bold text-xs text-amber-700">{student.domain_scores?.mental_health ?? 75}%</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block font-sans">Financial Stability</span>
                  <span className="font-bold text-xs text-pink-700">{student.domain_scores?.financial ?? 80}%</span>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-600 italic">
                Counselor Diagnostic Summary: Student maintains acceptable baseline engagement. Non-academic indicators suggest monitored support for exam readiness and routine attendance check-ins.
              </p>
            </div>

            {/* Official Signatures Block */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-center text-[10px]">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold">
                  MRS. MA. CRISTINA DELA CRUZ, LPT
                </div>
                <span className="text-slate-500">Class Adviser / Homeroom Teacher</span>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold">
                  MR. ALEXANDER SANTOS, RGC
                </div>
                <span className="text-slate-500">Registered Guidance Counselor</span>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold">
                  DR. EDUARDO M. RAMOS, Ph.D.
                </div>
                <span className="text-slate-500">High School Principal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
