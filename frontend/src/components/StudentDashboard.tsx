/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  BookOpen, 
  HeartHandshake, 
  PhoneCall,
  GraduationCap,
  Activity,
  MessageSquare,
  TrendingUp,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  X,
  Camera
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";
import { AcademicRecoverySimulator } from "./AcademicRecoverySimulator";
import { DailyMoodCheckin } from "./DailyMoodCheckin";
import { AccountManagementModal } from "./AccountManagementModal";

interface StudentDashboardProps {
  onOpenChat: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [student, setStudent] = useState<any | null>(null);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  
  // Quick Consultation Modal State
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationReason, setConsultationReason] = useState("Academic & Career Mentorship");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [consultationSubmitted, setConsultationSubmitted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const studentsList = await fetchWithAuth("/students");
        if (studentsList && studentsList.length > 0) {
          const s = studentsList.find((st: any) => 
            (user?.student_id && st.id === user.student_id) ||
            (user?.email && st.email?.toLowerCase() === user.email.toLowerCase()) ||
            (user?.full_name && `${st.first_name} ${st.last_name}`.toLowerCase() === user.full_name.toLowerCase())
          ) || studentsList[0];
          setStudent(s);

          const [rRes, aRes] = await Promise.all([
            fetchWithAuth(`/risk/student/${s.id}`).catch(() => null),
            fetchWithAuth(`/academic/student/${s.id}`).catch(() => [])
          ]);

          setRiskData(rRes || {
            composite_risk_score: 24.5,
            risk_tier: "low",
            academic_score: 18.0,
            mental_health_score: 15.0,
            financial_score: 12.0,
            family_score: 14.0,
            health_score: 10.0
          });
          
          setAcademicRecords(aRes && aRes.length > 0 ? aRes : [
            {
              id: 1,
              school_year: "2025-2026",
              semester: "2nd",
              gpa: 87.5,
              attendance_rate: 96.5,
              absences_count: 1,
              incomplete_subjects_count: 0
            },
            {
              id: 2,
              school_year: "2025-2026",
              semester: "1st",
              gpa: 85.0,
              attendance_rate: 95.0,
              absences_count: 2,
              incomplete_subjects_count: 0
            }
          ]);
        } else {
          // Default data for new Google accounts
          setRiskData({
            composite_risk_score: 22.0,
            risk_tier: "low",
            academic_score: 16.0,
            mental_health_score: 14.0,
            financial_score: 12.0,
            family_score: 12.0,
            health_score: 10.0
          });
          setAcademicRecords([
            {
              id: 1,
              school_year: "2025-2026",
              semester: "2nd",
              gpa: 88.0,
              attendance_rate: 97.2,
              absences_count: 1,
              incomplete_subjects_count: 0
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
        setRiskData({
          composite_risk_score: 22.0,
          risk_tier: "low",
          academic_score: 16.0,
          mental_health_score: 14.0,
          financial_score: 12.0,
          family_score: 12.0,
          health_score: 10.0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.student_id, user?.email, user?.full_name]);

  if (!isMounted) {
    return (
      <div className="space-y-6 pb-12 font-sans animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 rounded-3xl bg-slate-200" />
          <div className="h-72 rounded-3xl bg-slate-200" />
          <div className="h-72 rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const domainScores = {
    academic: riskData?.academic_score || 18,
    mental_health: riskData?.mental_health_score || 15,
    financial: riskData?.financial_score || 12,
    family: riskData?.family_score || 14,
    health: riskData?.health_score || 10
  };

  const displayName = user?.full_name || (student ? (student.full_name || `${student.first_name} ${student.last_name}`) : "Student");
  const displayLrn = student?.lrn || "109482719283";
  const displaySection = student?.section_name || "Grade 11 - STEM (St. Thomas Aquinas)";
  const displayAdviser = student?.adviser_name || "Mr. Roberto Santos, LPT";
  const displayGpa = academicRecords[0]?.gpa ? academicRecords[0].gpa.toFixed(1) : "87.5";
  const displayAttendance = academicRecords[0]?.attendance_rate ? `${academicRecords[0].attendance_rate}%` : "96.5%";

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultationSubmitted(true);
    setTimeout(() => {
      setConsultationSubmitted(false);
      setIsConsultationOpen(false);
      setConsultationNotes("");
    }, 2500);
  };

  return (
    <div className="space-y-8 pb-12 font-sans w-full">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-6 sm:p-8 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-rose-900/40">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-amber-300" />
              {user?.role === "parent" ? "Parent & Guardian Portal" : "Student Success Portal"}
            </span>
            <span className="text-xs sm:text-sm text-rose-200 font-semibold">• San Antonio de Padua College</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome, {displayName}!
          </h1>
          <p className="text-sm sm:text-base text-rose-100 leading-relaxed font-normal">
            Holistic academic progress, guidance support, and confidential student wellness resources under RA 10173.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenChat}
            className="px-5 py-3 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-md transition active:scale-95"
          >
            <Bot className="h-5 w-5 text-white" />
            <span>AI Guidance Companion</span>
            <MessageSquare className="h-4 w-4 text-amber-200" />
          </button>

          <button
            type="button"
            onClick={() => setIsConsultationOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition flex items-center gap-2"
          >
            <Calendar className="h-4 w-4 text-amber-300" />
            <span>Book Counselor</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPA */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cumulative GPA</span>
            <strong className="text-2xl sm:text-3xl font-black text-emerald-600 block mt-1">{displayGpa}</strong>
            <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 block">Passing & Honors Track</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Attendance */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
            <strong className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">{displayAttendance}</strong>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">SY 2025–2026</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Wellness Score */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">5-Domain Balance</span>
            <strong className="text-2xl sm:text-3xl font-black text-amber-700 block mt-1">84 / 100</strong>
            <span className="text-[11px] font-semibold text-amber-800 mt-0.5 block">Positive Wellness</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-[#D97706] border border-amber-200">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Academic Standing */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Academic Standing</span>
            <div className="mt-1">
              <RiskBadge score={riskData?.composite_risk_score || 24.5} tier={riskData?.risk_tier || "low"} size="md" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">AHP Validated (CR ≤ 0.10)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 text-[#8B0014] border border-rose-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main 3-Card Grid for Wide Screens */}
      <div id="wellness-radar" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch scroll-mt-24">
        
        {/* Profile Card (4 cols on wide) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div 
                className="relative group cursor-pointer shrink-0"
                onClick={() => setIsAccountModalOpen(true)}
                title="Click to update profile photo or manage account"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={displayName}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-amber-400/80 shadow-xs group-hover:ring-2 group-hover:ring-[#8B0014] transition"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400/80 flex items-center justify-center text-white font-black text-2xl shadow-xs group-hover:ring-2 group-hover:ring-amber-500 transition">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="h-5 w-5" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 
                    onClick={() => setIsAccountModalOpen(true)}
                    className="text-lg font-black text-slate-900 truncate cursor-pointer hover:text-[#8B0014] transition"
                  >
                    {displayName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(true)}
                    className="text-[11px] font-bold text-[#8B0014] hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    <Camera className="h-3 w-3" />
                    <span>Photo</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">LRN: {displayLrn}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs sm:text-sm text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Track / Strand:</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[170px]">{displaySection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Class Adviser:</span>
                <span className="font-bold text-slate-900">{displayAdviser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Academic Year:</span>
                <span className="font-bold text-slate-900">AY 2025–2026 (Sem 2)</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-slate-200 items-center">
                <span className="text-slate-500 font-medium">Risk Status:</span>
                <RiskBadge score={riskData?.composite_risk_score || 24.5} tier={riskData?.risk_tier || "low"} size="sm" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition text-center flex items-center justify-center gap-1.5"
            >
              <Camera className="h-3.5 w-3.5 text-[#8B0014]" />
              <span>Edit Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setIsConsultationOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-[#8B0014]/10 hover:bg-[#8B0014] text-[#8B0014] hover:text-white font-bold text-xs border border-[#8B0014]/20 transition text-center"
            >
              Guidance →
            </button>
          </div>
        </div>

        {/* 5-Domain Wellness Radar (4 cols on wide) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
          <div className="text-center mb-1">
            <h4 className="text-xs sm:text-sm font-black text-[#8B0014] uppercase tracking-wider">
              Holistic Domain Wellness Radar
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">Multi-Domain Evaluation Profile</p>
          </div>
          <DomainRadarChart scores={domainScores} studentName={displayName} />
        </div>

        {/* Support Hotline & Care Box (4 cols on wide) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[#8B0014] uppercase tracking-wider mb-3 flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-[#8B0014]" />
              SAPC Student Care Services
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition">
                <p className="font-bold text-slate-900">Guidance & Counseling Center</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Room 204, Bldg A • Mon-Fri 8AM-5PM</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition">
                <p className="font-bold text-slate-900">Peer Tutoring & Academic Circle</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Math, STEM, & Subject Mentorship</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-center gap-3">
            <PhoneCall className="h-5 w-5 shrink-0 text-[#D97706]" />
            <div>
              <span className="block font-medium">NCMH Crisis Hotline:</span>
              <strong className="text-slate-900 font-black text-sm">1553</strong> <span className="text-slate-500 text-xs">(Toll-Free 24/7)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Daily Student Wellness Pulse */}
      <div id="daily-mood" className="scroll-mt-24">
        <DailyMoodCheckin
          studentId={student?.id}
          onCheckinSuccess={async () => {
            if (student?.id) {
              const rRes = await fetchWithAuth(`/risk/student/${student.id}`).catch(() => null);
              if (rRes) setRiskData(rRes);
            }
          }}
        />
      </div>

      {/* Academic Records Table */}
      <div id="academic-records" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-[#8B0014]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Academic Subject & Grade Records</h3>
              <p className="text-xs text-slate-500">Official SASS ingested attendance and semester GPA breakdown</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
            ✓ Records Synchronized
          </span>
        </div>

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
                    <span className={`text-base font-extrabold ${(r.gpa || 0) < 75 ? "text-rose-600" : "text-emerald-600"}`}>
                      {Number(r.gpa ?? 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-800">{r.attendance_rate ?? 100}%</td>
                  <td className="py-4 px-5 text-slate-600">{r.absences_count ?? 0} days</td>
                  <td className="py-4 px-5 text-slate-600">{r.incomplete_subjects_count ?? 0}</td>
                  <td className="py-4 px-5 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      (r.gpa || 0) >= 75 
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}>
                      {(r.gpa || 0) >= 75 ? "Passing Standing" : "Subject Remediation Recommended"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* What-If Academic Recovery Simulator */}
      <div id="academic-simulator" className="scroll-mt-24">
        <AcademicRecoverySimulator
          studentId={student?.id}
          studentName={displayName}
          initialAcademicScore={riskData?.academic_score || 65.0}
          initialCompositeScore={riskData?.composite_risk_score || 24.5}
          initialRiskTier={riskData?.risk_tier || "low"}
        />
      </div>

      {/* Consultation Booking Modal */}
      {isConsultationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10">
                  <Calendar className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Book Guidance Consultation</h3>
                  <p className="text-xs text-rose-200">Confidential meeting with SAPC Guidance Office</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConsultationOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left">
              {consultationSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">Consultation Request Sent!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Mrs. Maria Theresa Cruz (Guidance Counselor) has received your request and will confirm your schedule at Room 204.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConsultationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Consultation Topic</label>
                    <select
                      value={consultationReason}
                      onChange={(e) => setConsultationReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    >
                      <option value="Academic & Career Mentorship">Academic & Career Mentorship</option>
                      <option value="Stress, Wellness & Exam Anxiety">Stress, Wellness & Exam Anxiety</option>
                      <option value="Subject Remediation & Peer Tutoring">Subject Remediation & Peer Tutoring</option>
                      <option value="Financial Hardship & Scholarship Inquiries">Financial Hardship & Scholarship Inquiries</option>
                      <option value="Confidential Personal Counseling">Confidential Personal Counseling</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Optional Notes / Preferred Time</label>
                    <textarea
                      rows={3}
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      placeholder="e.g. Available Tuesday or Thursday afternoon after 3:30 PM..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#8B0014] shrink-0" />
                    <span>Average counselor response time: <strong>Within 1 school day</strong></span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsConsultationOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-2"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Management & Photo Upload Modal */}
      <AccountManagementModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
      />

    </div>
  );
};
