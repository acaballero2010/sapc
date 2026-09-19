"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  BookOpen, 
  HeartHandshake, 
  PhoneCall,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";
import { AcademicRecoverySimulator } from "./AcademicRecoverySimulator";
import { DailyMoodCheckin } from "./DailyMoodCheckin";

interface StudentDashboardProps {
  onOpenChat: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [student, setStudent] = useState<any | null>(null);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [_interventions, setInterventions] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
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
        console.error("Failed to load student dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-8 pb-12 font-sans animate-pulse">
        <div className="h-48 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-64 rounded-3xl bg-slate-200" />
          <div className="h-64 rounded-3xl bg-slate-200 col-span-2" />
        </div>
      </div>
    );
  }

  const domainScores = {
    academic: riskData?.academic_score || 20,
    mental_health: riskData?.mental_health_score || 15,
    financial: riskData?.financial_score || 15,
    family: riskData?.family_score || 15,
    health: riskData?.health_score || 10
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B0014] via-[#6D0010] to-[#4A000A] p-8 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-amber-300" />
              {user?.role === "parent" ? "Parent & Guardian Portal" : "Student Success Portal"}
            </span>
            <span className="text-xs sm:text-sm text-rose-100 font-semibold">• San Antonio de Padua College</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Welcome, {user?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-sm sm:text-base text-rose-100 mt-2 leading-relaxed font-normal">
            Holistic academic progress, guidance support, and confidential student wellness resources.
          </p>
        </div>

        <button
          onClick={onOpenChat}
          className="px-6 py-3.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-md transition self-start md:self-auto active:scale-95 shrink-0"
        >
          <Bot className="h-5 w-5 text-white" />
          <span>Talk with AI Counselor</span>
          <Sparkles className="h-4 w-4 text-amber-200" />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400/80 flex items-center justify-center text-white font-black text-2xl shadow-xs">
              {student ? student.first_name[0] : "S"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {student ? `${student.first_name} ${student.last_name}` : "Joshua Dimaculangan"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">LRN: {student?.lrn}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-sm text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Section:</span>
              <span className="font-bold text-slate-900">{student?.section_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Adviser:</span>
              <span className="font-bold text-slate-900">{student?.adviser_name}</span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-slate-200 items-center">
              <span className="text-slate-500 font-medium">Current Standing:</span>
              <RiskBadge score={riskData?.composite_risk_score} tier={riskData?.risk_tier} size="sm" />
            </div>
          </div>
        </div>

        {/* 5-Domain Radar Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
          <h4 className="text-xs sm:text-sm font-bold text-[#8B0014] uppercase tracking-wider mb-2">
            Holistic Domain Wellness Radar
          </h4>
          <DomainRadarChart scores={domainScores} studentName={student?.first_name} />
        </div>

        {/* Support Hotline Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#8B0014] uppercase tracking-wider mb-3 flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-[#8B0014]" />
              SAPC Student Care Services
            </h4>
            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900">Guidance & Counseling Center</p>
                <p className="text-xs text-slate-500 mt-0.5">Room 204, Bldg A • Mon-Fri 8AM-5PM</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900">Peer Tutoring & Academic Circle</p>
                <p className="text-xs text-slate-500 mt-0.5">Math, Science, & Subject Mentorship</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-center gap-3">
            <PhoneCall className="h-5 w-5 shrink-0 text-[#D97706]" />
            <span>NCMH Crisis Hotline: <strong className="text-slate-900 font-extrabold text-sm">1553</strong> (Toll-Free 24/7)</span>
          </div>
        </div>
      </div>

      {/* Daily Student Wellness Pulse */}
      <DailyMoodCheckin
        studentId={student?.id}
        onCheckinSuccess={async () => {
          if (student?.id) {
            const rRes = await fetchWithAuth(`/risk/student/${student.id}`);
            setRiskData(rRes);
          }
        }}
      />

      {/* Academic Records */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-[#8B0014]" />
          Academic Subject Standing
        </h3>
        {academicRecords.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No academic records loaded.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-5">Grading Period</th>
                  <th className="py-4 px-5">GPA / Grade</th>
                  <th className="py-4 px-5">Attendance Rate</th>
                  <th className="py-4 px-5">Absences</th>
                  <th className="py-4 px-5">Incompletes</th>
                  <th className="py-4 px-5 text-right">Academic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicRecords.map((r) => (
                  <tr key={r.id} className="text-slate-800 hover:bg-slate-50 transition">
                    <td className="py-4 px-5 font-bold text-slate-900">
                      SY {r.school_year} ({r.semester} Semester)
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-base font-extrabold ${r.gpa < 75 ? "text-rose-600" : "text-emerald-600"}`}>
                        {r.gpa.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-800">{r.attendance_rate}%</td>
                    <td className="py-4 px-5 text-slate-600">{r.absences_count} days</td>
                    <td className="py-4 px-5 text-slate-600">{r.incomplete_subjects_count}</td>
                    <td className="py-4 px-5 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        r.gpa >= 75 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                          : "bg-rose-50 text-rose-800 border border-rose-200"
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

      {/* What-If Academic Recovery Simulator */}
      <AcademicRecoverySimulator
        studentId={student?.id}
        studentName={student ? `${student.first_name} ${student.last_name}` : undefined}
        initialAcademicScore={riskData?.academic_score || 65.0}
        initialCompositeScore={riskData?.composite_risk_score || 52.4}
        initialRiskTier={riskData?.risk_tier || "medium"}
      />
    </div>
  );
};
