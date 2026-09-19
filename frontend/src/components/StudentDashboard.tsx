"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  BookOpen, 
  HeartHandshake, 
  PhoneCall
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";

interface StudentDashboardProps {
  onOpenChat: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [student, setStudent] = useState<any | null>(null);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [_interventions, setInterventions] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const studentsList = await fetchWithAuth("/students");
        if (studentsList && studentsList.length > 0) {
          const s = studentsList[0];
          setStudent(s);

          const [rRes, aRes, iRes] = await Promise.all([
            fetchWithAuth(`/risk/student/${s.id}`),
            fetchWithAuth(`/academic/student/${s.id}`),
            fetchWithAuth(`/risk/interventions?student_id=${s.id}`)
          ]);

          setRiskData(rRes);
          setAcademicRecords(aRes);
          setInterventions(iRes);
        }
      } catch (err) {
        console.error("Failed to load student portal:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const domainScores = {
    academic: riskData?.academic_score || 20,
    mental_health: riskData?.mental_health_score || 15,
    financial: riskData?.financial_score || 15,
    family: riskData?.family_score || 15,
    health: riskData?.health_score || 10
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {user?.role === "parent" ? "Parent & Guardian Portal" : "Student Success Portal"}
            </span>
            <span className="text-xs text-slate-400">• San Antonio de Padua College</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome, {user?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Holistic academic progress, guidance support, and confidential student wellness resources.
          </p>
        </div>

        <button
          onClick={onOpenChat}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition self-start md:self-auto"
        >
          <Bot className="h-4 w-4" />
          <span>Talk with AI Counselor Companion</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-300 font-bold text-lg">
              {student ? student.first_name[0] : "S"}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {student ? `${student.first_name} ${student.last_name}` : "Joshua Dimaculangan"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">LRN: {student?.lrn}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Section:</span>
              <span className="font-semibold text-white">{student?.section_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Adviser:</span>
              <span className="font-semibold text-white">{student?.adviser_name}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-850">
              <span className="text-slate-500">Current Standing:</span>
              <RiskBadge score={riskData?.composite_risk_score} tier={riskData?.risk_tier} size="sm" />
            </div>
          </div>
        </div>

        {/* 5-Domain Radar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center justify-center">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            Holistic Domain Wellness Radar
          </h4>
          <DomainRadarChart scores={domainScores} studentName={student?.first_name} />
        </div>

        {/* Support Hotline Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-rose-400" />
              SAPC Student Care Services
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <p className="font-semibold text-white">Guidance & Counseling Center</p>
                <p className="text-[11px] text-slate-400">Room 204, Bldg A • Mon-Fri 8AM-5PM</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <p className="font-semibold text-white">Peer Tutoring Program</p>
                <p className="text-[11px] text-slate-400">Math & Science Mentorship</p>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
            <PhoneCall className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>NCMH Crisis Hotline: <strong>1553</strong> (Toll-Free 24/7)</span>
          </div>
        </div>
      </div>

      {/* Academic Records */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          Academic Subject Standing
        </h3>
        {academicRecords.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No academic records loaded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3">Grading Period</th>
                  <th className="pb-3">GPA / Grade</th>
                  <th className="pb-3">Attendance Rate</th>
                  <th className="pb-3">Absences</th>
                  <th className="pb-3">Incompletes</th>
                  <th className="pb-3 text-right">Academic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {academicRecords.map((r) => (
                  <tr key={r.id} className="text-slate-300">
                    <td className="py-3 font-semibold text-white">
                      SY {r.school_year} ({r.semester} Semester)
                    </td>
                    <td className="py-3">
                      <span className={`font-bold ${r.gpa < 75 ? "text-rose-400" : "text-emerald-400"}`}>
                        {r.gpa.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3">{r.attendance_rate}%</td>
                    <td className="py-3">{r.absences_count} days</td>
                    <td className="py-3">{r.incomplete_subjects_count}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.gpa >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {r.gpa >= 75 ? "Passing Standing" : "Subject Remediation Recommended"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
