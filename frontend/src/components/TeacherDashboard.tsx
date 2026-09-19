"use client";

import React, { useState, useEffect } from "react";
import { Search, BookOpen, HeartHandshake, Eye } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import { SassCsvUploader } from "./SassCsvUploader";
import { StudentDetailModal } from "./StudentDetailModal";
import { TeacherReferralModal } from "./TeacherReferralModal";

const DEFAULT_TEACHER_STUDENTS = [
  {
    id: 1,
    first_name: "Joshua",
    last_name: "Dimaculangan",
    lrn: "109238475612",
    section_name: "Grade 11 - St. Augustine (STEM)",
    adviser_name: "Mr. Roberto Santos, LPT",
    latest_risk_score: 69.8,
    latest_risk_tier: "high",
    primary_risk_driver: "Academic & Attendance Deficit"
  },
  {
    id: 2,
    first_name: "Angelica",
    last_name: "Dela Cruz",
    lrn: "109238475613",
    section_name: "Grade 11 - St. Augustine (STEM)",
    adviser_name: "Mr. Roberto Santos, LPT",
    latest_risk_score: 45.2,
    latest_risk_tier: "medium",
    primary_risk_driver: "Financial & Tuition Status"
  },
  {
    id: 3,
    first_name: "Mark Kenneth",
    last_name: "Bautista",
    lrn: "109238475614",
    section_name: "Grade 11 - St. Augustine (STEM)",
    adviser_name: "Mr. Roberto Santos, LPT",
    latest_risk_score: 18.4,
    latest_risk_tier: "low",
    primary_risk_driver: "Academic Honors Track"
  },
  {
    id: 7,
    first_name: "Christian Dave",
    last_name: "Villanueva",
    lrn: "109238475618",
    section_name: "Grade 11 - St. Augustine (STEM)",
    adviser_name: "Mr. Roberto Santos, LPT",
    latest_risk_score: 63.5,
    latest_risk_tier: "medium",
    primary_risk_driver: "Pre-Calculus Performance"
  },
  {
    id: 8,
    first_name: "Princess Mae",
    last_name: "Alcantara",
    lrn: "109238475619",
    section_name: "Grade 11 - St. Augustine (STEM)",
    adviser_name: "Mr. Roberto Santos, LPT",
    latest_risk_score: 22.1,
    latest_risk_tier: "low",
    primary_risk_driver: "Consistent Attendance"
  }
];

export const TeacherDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>(DEFAULT_TEACHER_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [referralStudent, setReferralStudent] = useState<any | null>(null);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [_isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth("/students");
      if (data && Array.isArray(data) && data.length > 0) {
        setStudents(data);
      } else {
        setStudents(DEFAULT_TEACHER_STUDENTS);
      }
    } catch (err) {
      console.warn("Using default teacher roster due to API offline status:", err);
      setStudents(DEFAULT_TEACHER_STUDENTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-8 pb-12 font-sans animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="h-64 rounded-3xl bg-slate-200" />
      </div>
    );
  }

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.lrn.includes(search)
  );

  return (
    <div className="space-y-8 pb-12 font-sans min-w-0">
      {/* Teacher Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B0014] via-[#6D0010] to-[#4A000A] p-6 sm:p-8 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-300" />
                Class Adviser Portal
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• Academic Ingestion & Risk Monitoring</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Advisory Class Management
            </h1>
            <p className="text-sm sm:text-base text-rose-100 mt-2 leading-relaxed font-normal">
              Track student academic standings, ingest SASS quarterly grades, and monitor AHP failure risk indicators with full privacy safeguards.
            </p>
          </div>
        </div>
      </div>

      {/* SASS Ingestion Component */}
      <div id="uploader" className="scroll-mt-24 min-w-0">
        <SassCsvUploader onSuccess={loadData} />
      </div>

      {/* Advisory Class Roster */}
      <div id="roster" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 scroll-mt-24 min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Assigned Advisory Students</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Class roster and current failure risk categorization</p>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or LRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">Student</th>
                <th className="py-3.5 px-4 whitespace-nowrap">LRN</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Section</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Composite Risk</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Primary Factor</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="text-slate-800 hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm sm:text-base whitespace-nowrap">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-xs sm:text-sm font-semibold whitespace-nowrap">{s.lrn}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium text-xs sm:text-sm whitespace-nowrap">{s.section_name}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="md" />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold whitespace-nowrap inline-block">
                      {s.primary_risk_driver || "Academic"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReferralStudent(s);
                          setIsReferralOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 hover:border-amber-400 transition font-bold text-xs flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                        title="Submit formal referral ticket to Guidance Counselor"
                      >
                        <HeartHandshake className="h-3.5 w-3.5 text-[#8B0014]" />
                        <span>Refer to Guidance</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setIsDetailOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white transition font-bold text-xs shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Profile</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <TeacherReferralModal
        student={referralStudent}
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
