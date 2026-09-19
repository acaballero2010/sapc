"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Users, AlertCircle, FileSpreadsheet, Search, Eye, PlusCircle } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import { SassCsvUploader } from "./SassCsvUploader";
import { StudentDetailModal } from "./StudentDetailModal";

export const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    loadData();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.lrn.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Teacher Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Class Adviser Portal
              </span>
              <span className="text-xs text-slate-400">• Academic Ingestion & Risk Monitoring</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Advisory Class Management</h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Track student academic standings, ingest SASS quarterly grades, and monitor AHP failure risk indicators.
            </p>
          </div>
        </div>
      </div>

      {/* SASS Ingestion Component */}
      <SassCsvUploader onSuccess={loadData} />

      {/* Advisory Class Roster */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Assigned Advisory Students</h3>
            <p className="text-xs text-slate-400">Class roster and current failure risk categorization</p>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search student or LRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3">Student</th>
                <th className="pb-3">LRN</th>
                <th className="pb-3">Section</th>
                <th className="pb-3">Composite Risk</th>
                <th className="pb-3">Primary Factor</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="text-slate-300 hover:bg-slate-850/40 transition">
                  <td className="py-3 font-semibold text-white">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="py-3 font-mono text-slate-400">{s.lrn}</td>
                  <td className="py-3 text-slate-400">{s.section_name}</td>
                  <td className="py-3">
                    <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="md" />
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                      {s.primary_risk_driver || "Academic"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setIsDetailOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition font-semibold"
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
