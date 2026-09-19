"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Search, 
  Eye, 
  CheckCircle,
  GraduationCap,
  Award,
  HeartHandshake,
  Clock
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import { StudentDetailModal } from "./StudentDetailModal";
import { InterventionModal } from "./InterventionModal";
import { InstitutionalReportModal } from "./InstitutionalReportModal";
import { ParentAlertModal } from "./ParentAlertModal";
import { CohortTrendAnalytics } from "./CohortTrendAnalytics";

const DEFAULT_ANALYTICS = {
  total_students: 1250,
  high_risk_count: 48,
  medium_risk_count: 185,
  low_risk_count: 1017,
  average_composite_score: 24.2
};

const DEFAULT_STUDENTS = [
  {
    id: 1,
    first_name: "Joshua",
    last_name: "Dimaculangan",
    lrn: "109238475612",
    section_name: "Grade 11 - St. Augustine (STEM)",
    adviser_name: "Mr. Roberto Santos, LPT",
    latest_risk_score: 69.8,
    latest_risk_tier: "high",
    primary_risk_driver: "Mental Health & Academic"
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
    primary_risk_driver: "Financial Overdue"
  },
  {
    id: 3,
    first_name: "Mark Kenneth",
    last_name: "Bautista",
    lrn: "109238475614",
    section_name: "Grade 12 - St. Thomas (ABM)",
    adviser_name: "Ms. Jennifer Lim, LPT",
    latest_risk_score: 18.4,
    latest_risk_tier: "low",
    primary_risk_driver: "Academic Stability"
  },
  {
    id: 4,
    first_name: "Samantha Nicole",
    last_name: "Reyes",
    lrn: "109238475615",
    section_name: "Grade 11 - St. Lorenzo (HUMSS)",
    adviser_name: "Mr. Carlos Dizon, LPT",
    latest_risk_score: 74.2,
    latest_risk_tier: "high",
    primary_risk_driver: "Family Crisis & Absenteeism"
  },
  {
    id: 5,
    first_name: "John Carlo",
    last_name: "Mendoza",
    lrn: "109238475616",
    section_name: "Grade 12 - St. Thomas (ABM)",
    adviser_name: "Ms. Jennifer Lim, LPT",
    latest_risk_score: 38.6,
    latest_risk_tier: "low",
    primary_risk_driver: "General Stability"
  },
  {
    id: 6,
    first_name: "Bea Patricia",
    last_name: "Ramos",
    lrn: "109238475617",
    section_name: "Grade 11 - St. Lorenzo (HUMSS)",
    adviser_name: "Mr. Carlos Dizon, LPT",
    latest_risk_score: 58.0,
    latest_risk_tier: "medium",
    primary_risk_driver: "Physical Health / Migraines"
  },
  {
    id: 7,
    first_name: "Christian Dave",
    last_name: "Villanueva",
    lrn: "109238475618",
    section_name: "Grade 11 - San Pedro Calungsod (GAS)",
    adviser_name: "Ms. Ma. Teresa Garcia, LPT",
    latest_risk_score: 63.5,
    latest_risk_tier: "medium",
    primary_risk_driver: "Academic Deficit"
  },
  {
    id: 8,
    first_name: "Princess Mae",
    last_name: "Alcantara",
    lrn: "109238475619",
    section_name: "Grade 11 - San Pedro Calungsod (GAS)",
    adviser_name: "Ms. Ma. Teresa Garcia, LPT",
    latest_risk_score: 22.1,
    latest_risk_tier: "low",
    primary_risk_driver: "Academic Stability"
  }
];

const DEFAULT_FLAGGED = [
  {
    id: 101,
    student_id: 1,
    student_name: "Joshua Dimaculangan",
    aggregate_distress_score: 88,
    flag_reason: "Student expressed severe academic helplessness and panic over impending midterms ('Hindi ko na po kaya, gusto ko na sumuko').",
    started_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 102,
    student_id: 4,
    student_name: "Samantha Nicole Reyes",
    aggregate_distress_score: 79,
    flag_reason: "Expressed prolonged sleep deprivation and family distress regarding parental separation.",
    started_at: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

const DEFAULT_INTERVENTIONS = [
  {
    id: 201,
    student_name: "Joshua Dimaculangan",
    title: "Academic Remediation & Anxiety Management Protocol",
    description: "Peer tutoring in Pre-Calculus with weekly guidance counseling check-ins for test anxiety.",
    target_domain: "Mental Health & Academic",
    status: "in_progress",
    scheduled_followup: new Date(Date.now() + 86400000 * 3).toISOString()
  },
  {
    id: 202,
    student_name: "Samantha Nicole Reyes",
    title: "Family Support & Attendance Recovery Plan",
    description: "Coordination with guardian and flexible modular submission arrangement for missed HUMSS deadlines.",
    target_domain: "Family & Attendance",
    status: "in_progress",
    scheduled_followup: new Date(Date.now() + 86400000 * 5).toISOString()
  },
  {
    id: 203,
    student_name: "Angelica Dela Cruz",
    title: "Emergency Tuition Subsidy & Financial Aid Referral",
    description: "Endorsement to SAPC Alumni Foundation assistance grant for delayed installment payments.",
    target_domain: "Financial",
    status: "completed",
    scheduled_followup: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const CounselorDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [analytics, setAnalytics] = useState<any | null>(DEFAULT_ANALYTICS);
  const [students, setStudents] = useState<any[]>(DEFAULT_STUDENTS);
  const [flaggedSessions, setFlaggedSessions] = useState<any[]>(DEFAULT_FLAGGED);
  const [interventions, setInterventions] = useState<any[]>(DEFAULT_INTERVENTIONS);
  const [teacherReferrals, setTeacherReferrals] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [interventionStudent, setInterventionStudent] = useState<any | null>(null);
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [parentAlertStudent, setParentAlertStudent] = useState<any | null>(null);
  const [isParentAlertOpen, setIsParentAlertOpen] = useState(false);
  const [_isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, studentsRes, flaggedRes, interventionsRes] = await Promise.all([
        fetchWithAuth("/analytics/cohort-summary"),
        fetchWithAuth("/students"),
        fetchWithAuth("/chatbot/flagged-alerts"),
        fetchWithAuth("/risk/interventions")
      ]);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (studentsRes && Array.isArray(studentsRes) && studentsRes.length > 0) setStudents(studentsRes);
      if (flaggedRes && Array.isArray(flaggedRes)) setFlaggedSessions(flaggedRes);
      if (interventionsRes && Array.isArray(interventionsRes) && interventionsRes.length > 0) setInterventions(interventionsRes);

      // Load Teacher Referrals
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sapc_teacher_referrals");
        if (stored) {
          try {
            setTeacherReferrals(JSON.parse(stored));
          } catch {
            setTeacherReferrals([]);
          }
        } else {
          // Default initial teacher referral for demonstration
          const initialReferral = [
            {
              id: "ref-seed-01",
              student_id: 1,
              student_name: "Joshua Dimaculangan",
              lrn: "109238475612",
              section: "Grade 11 - St. Augustine (STEM)",
              referring_teacher: "Mr. Roberto Santos, LPT (Class Adviser)",
              concern_type: "Academic Deterioration & Multiple Failing Marks",
              urgency: "priority",
              observations: "Student missed 11 classes this quarter and has failing marks in Chemistry and Pre-Calculus. Appeared distressed and isolated during group project meetings.",
              attempted_interventions: ["1-on-1 Teacher-Student Conference", "Peer Tutoring Offered"],
              created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
              status: "pending_review"
            }
          ];
          setTeacherReferrals(initialReferral);
          localStorage.setItem("sapc_teacher_referrals", JSON.stringify(initialReferral));
        }
      }
    } catch (err) {
      console.warn("Using default counselor mock data due to API offline status:", err);
      setAnalytics(DEFAULT_ANALYTICS);
      setStudents(DEFAULT_STUDENTS);
      setFlaggedSessions(DEFAULT_FLAGGED);
      setInterventions(DEFAULT_INTERVENTIONS);
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="h-28 rounded-3xl bg-slate-200" />
          <div className="h-28 rounded-3xl bg-slate-200" />
          <div className="h-28 rounded-3xl bg-slate-200" />
          <div className="h-28 rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.lrn.includes(search);
    const matchesTier = filterTier === "all" || s.latest_risk_tier?.toLowerCase() === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Top Banner - Institutional Maroon & Gold */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-8 sm:p-9 shadow-md text-white border-t-4 border-amber-400">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-amber-300" />
                San Antonio de Padua College
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• Guidance & Counseling Central</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Multi-Factor Failure Prevention Portal
            </h1>
            <p className="text-sm sm:text-base text-rose-50/95 leading-relaxed font-normal">
              Real-time Analytic Hierarchy Process (AHP) composite risk synthesis uniting SASS academic indicators with Mental Health, Financial, Family, and Physical Wellness factors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Award className="h-4 w-4 text-[#8B0014]" />
              DepEd / CHED Report
            </button>

            <div className="bg-black/35 backdrop-blur-md border border-white/25 rounded-2xl p-4 sm:p-5 text-center shadow-lg min-w-[150px]">
              <span className="text-xs text-amber-200 font-extrabold uppercase tracking-wider block">Cohort Risk Avg</span>
              <p className="text-2xl sm:text-3xl font-black text-[#FBBF24] mt-0.5">
                {analytics?.average_composite_score ? Number(analytics.average_composite_score).toFixed(2) : "0.00"}
                <span className="text-xs font-bold text-slate-300 ml-1">/ 100</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Monitored */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Monitored</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-slate-900">{analytics?.total_students || 0}</p>
            <span className="text-xs text-slate-500 font-medium block mt-1">Across all SAPC grade levels</span>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white border-2 border-rose-200/80 rounded-2xl p-5 shadow-xs hover:border-rose-400 transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700">High Risk (70-100)</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-rose-600">{analytics?.high_risk_count || 0}</p>
            <span className="text-xs text-rose-700 font-semibold block mt-1">Requires Priority Care Plan</span>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-5 shadow-xs hover:border-amber-400 transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">Medium Risk (40-69.9)</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-[#D97706]">{analytics?.medium_risk_count || 0}</p>
            <span className="text-xs text-amber-800 font-semibold block mt-1">Active Remediation Protocol</span>
          </div>
        </div>

        {/* Low Risk */}
        <div className="bg-white border-2 border-emerald-200/80 rounded-2xl p-5 shadow-xs hover:border-emerald-400 transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Low Risk (0-39.9)</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-emerald-600">{analytics?.low_risk_count || 0}</p>
            <span className="text-xs text-emerald-700 font-semibold block mt-1">Standard Guidance Tracking</span>
          </div>
        </div>
      </div>

      {/* Urgent NLP Distress Alerts Queue (RA 10173 Protected) */}
      {flaggedSessions.length > 0 && (
        <div className="bg-white border-l-4 border-l-rose-600 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">NLP Distress & Wellness Alert Queue</h3>
                <p className="text-xs text-slate-500">Real-time Tagalog/Taglish crisis signals flagged by AI guidance chatbot</p>
              </div>
              <span className="px-3 py-1 text-xs font-black bg-rose-600 text-white rounded-full shadow-xs">
                {flaggedSessions.length} Urgent
              </span>
            </div>
            <span className="text-xs font-bold text-rose-900 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto">
              🔒 RA 10173 SPI Sensitive
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {flaggedSessions.map((session) => (
              <div
                key={session.id}
                className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-rose-300 transition shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-extrabold text-slate-900 text-base">{session.student_name}</span>
                    <span className="text-rose-800 font-black bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-md text-xs">
                      Distress: {session.aggregate_distress_score}/100
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                    <strong className="text-rose-700 font-bold">Trigger:</strong> {session.flag_reason}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-rose-100">
                  <span className="text-xs text-slate-500 font-medium" suppressHydrationWarning>
                    {new Date(session.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedStudentId(session.student_id);
                      setIsDetailOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#8B0014] hover:bg-[#6D0010] text-white flex items-center gap-2 transition shadow-xs"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Open Case File</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Guidance Referrals Queue */}
      {teacherReferrals.length > 0 && (
        <div className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Class Adviser & Faculty Referral Queue</h3>
                <p className="text-xs text-slate-500">Direct student referrals submitted by subject teachers and advisers for guidance intervention</p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-black bg-amber-500 text-white rounded-full shadow-xs self-start sm:self-auto">
              {teacherReferrals.length} Pending Referrals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherReferrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-amber-50/40 border border-amber-200/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:shadow-xs transition"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-slate-900 text-base">
                        {ref.student_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        LRN: {ref.lrn} • {ref.section}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      ref.urgency === "crisis"
                        ? "bg-rose-600 text-white"
                        : ref.urgency === "priority"
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-600 text-white"
                    }`}>
                      {ref.urgency === "crisis" ? "🔴 Urgent / Crisis" : ref.urgency === "priority" ? "🟡 Priority" : "🟢 Routine"}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200/60 text-xs text-slate-700 space-y-1">
                    <strong className="text-amber-900 font-bold block">Reason: {ref.concern_type}</strong>
                    <p className="text-slate-600 leading-relaxed italic">
                      &quot;{ref.observations}&quot;
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Adviser: <strong className="text-slate-700">{ref.referring_teacher}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(ref.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/40">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(ref.student_id);
                      setIsDetailOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#8B0014] hover:bg-[#6D0010] text-white flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Open Case & Intake</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Student Roster & Risk Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
              <span>Student Cohort Risk Roster</span>
              <span className="text-xs font-bold text-[#8B0014] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                {filteredStudents.length} Students Monitored
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Multi-criteria decision weights calibrated to SAPC guidance standards
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filter */}
            <div className="relative">
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:bg-white focus:border-[#8B0014] transition cursor-pointer"
              >
                <option value="all">All Risk Tiers</option>
                <option value="high">High Risk Only</option>
                <option value="medium">Medium Risk Only</option>
                <option value="low">Low Risk Only</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or LRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-extrabold text-xs uppercase tracking-wider">
                <th className="py-4 px-5">Student Name</th>
                <th className="py-4 px-5">LRN</th>
                <th className="py-4 px-5">Section / Adviser</th>
                <th className="py-4 px-5">AHP Composite Risk</th>
                <th className="py-4 px-5">Primary Factor</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="text-slate-800 hover:bg-slate-50/80 transition">
                  <td className="py-4 px-5 font-bold text-slate-900 text-base">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-600 text-xs sm:text-sm font-semibold">{s.lrn}</td>
                  <td className="py-4 px-5 text-slate-700">
                    <div className="font-semibold text-sm text-slate-900">{s.section_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.adviser_name}</div>
                  </td>
                  <td className="py-4 px-5">
                    <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="md" />
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                      {s.primary_risk_driver || "Academic"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setIsDetailOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white transition font-bold text-xs shadow-xs"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setParentAlertStudent(s);
                        setIsParentAlertOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition font-bold text-xs"
                      title="Send instant SMS/Email meeting invite to parent"
                    >
                      ✉ Notify Parent
                    </button>
                    <button
                      onClick={() => {
                        setInterventionStudent(s);
                        setIsInterventionOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition font-bold text-xs"
                    >
                      + Care Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Longitudinal Multi-Term Progression & Retention Matrix */}
      <CohortTrendAnalytics />

      {/* Active Interventions Board */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Active Intervention Protocols</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track student remediation, counseling meetings, and guidance progress
            </p>
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#8B0014] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {interventions.length} Plans Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interventions.map((p) => (
            <div key={p.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 hover:border-slate-300 transition shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-[180px]">{p.student_name}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  p.status === "in_progress" 
                    ? "bg-amber-100 text-amber-900 border border-amber-200" 
                    : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                }`}>
                  {p.status.replace("_", " ")}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">{p.description}</p>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Domain: <strong className="text-slate-800 font-semibold">{p.target_domain}</strong></span>
                <span suppressHydrationWarning>Followup: {p.scheduled_followup ? new Date(p.scheduled_followup).toLocaleDateString() : "Pending"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCreateIntervention={(s) => {
          setIsDetailOpen(false);
          setInterventionStudent(s);
          setIsInterventionOpen(true);
        }}
      />

      <InterventionModal
        student={interventionStudent}
        isOpen={isInterventionOpen}
        onClose={() => setIsInterventionOpen(false)}
        onSuccess={loadData}
      />

      <InstitutionalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <ParentAlertModal
        student={parentAlertStudent}
        isOpen={isParentAlertOpen}
        onClose={() => setIsParentAlertOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
