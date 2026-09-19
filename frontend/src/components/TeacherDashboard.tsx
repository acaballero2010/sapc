"use client";

import React, { useState, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import { SassCsvUploader } from "./SassCsvUploader";
import { StudentDetailModal } from "./StudentDetailModal";

export const TeacherDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [_isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth("/students");
      setStudents(data);
    } catch (err) {
      console.error("Failed to load teacher students:", err);
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
    <div className="space-y-8 pb-12 font-sans">
      {/* Teacher Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B0014] via-[#6D0010] to-[#4A000A] p-8 shadow-lg text-white">
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
      <SassCsvUploader onSuccess={loadData} />

      {/* Advisory Class Roster */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
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
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-5">Student</th>
                <th className="py-4 px-5">LRN</th>
                <th className="py-4 px-5">Section</th>
                <th className="py-4 px-5">Composite Risk</th>
                <th className="py-4 px-5">Primary Factor</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="text-slate-800 hover:bg-slate-50 transition">
                  <td className="py-4 px-5 font-bold text-slate-900 text-base">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-600 text-xs sm:text-sm font-semibold">{s.lrn}</td>
                  <td className="py-4 px-5 text-slate-700 font-medium">{s.section_name}</td>
                  <td className="py-4 px-5">
                    <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="md" />
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                      {s.primary_risk_driver || "Academic"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setIsDetailOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white transition font-bold text-xs shadow-xs"
                    >
                      View Academic Profile
                    </button>
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
    </div>
  );
};
