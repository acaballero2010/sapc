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
  Clock,
  PlusCircle,
  CheckCircle2,
  Target,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import { StudentDetailModal } from "./StudentDetailModal";
import { InterventionModal } from "./InterventionModal";
import { InstitutionalReportModal } from "./InstitutionalReportModal";
import { ParentAlertModal } from "./ParentAlertModal";
import { CohortTrendAnalytics } from "./CohortTrendAnalytics";
import { SAPC_500_STUDENTS, SAPC_COHORT_SUMMARY } from "@/data/students500";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_ANALYTICS = SAPC_COHORT_SUMMARY;
const DEFAULT_STUDENTS = SAPC_500_STUDENTS;

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
    student_id: 1,
    student_name: "Joshua Dimaculangan",
    title: "Academic Remediation & Anxiety Management Protocol",
    description: "Peer tutoring in Pre-Calculus with weekly guidance counseling check-ins for test anxiety.",
    target_domain: "Mental Health & Academic",
    status: "in_progress",
    action_items: JSON.stringify([
      { id: "task-101", text: "Pre-Calculus diagnostic test with Ms. Santos", assignee: "Subject Teacher", priority: "high", due_timeline: "Within 3 Days", completed: true },
      { id: "task-102", text: "Bi-weekly 1-on-1 counseling session for test anxiety", assignee: "Guidance Counselor", priority: "high", due_timeline: "Ongoing (Weekly)", completed: false },
      { id: "task-103", text: "Assigned peer tutor (Kyle Mercado - Grade 12 STEM)", assignee: "Class Adviser", priority: "medium", due_timeline: "Within 1 Week", completed: true },
      { id: "task-104", text: "Parent consultation on quiet evening study space", assignee: "Parent / Guardian", priority: "routine", due_timeline: "Within 2 Weeks", completed: false }
    ]),
    scheduled_followup: new Date(Date.now() + 86400000 * 3).toISOString()
  },
  {
    id: 202,
    student_id: 4,
    student_name: "Samantha Nicole Reyes",
    title: "Family Support & Attendance Recovery Plan",
    description: "Coordination with guardian and flexible modular submission arrangement for missed HUMSS deadlines.",
    target_domain: "Family & Attendance",
    status: "in_progress",
    action_items: JSON.stringify([
      { id: "task-201", text: "Formal case conference with guardian at Guidance Center", assignee: "Guidance Counselor", priority: "high", due_timeline: "Within 3 Days", completed: true },
      { id: "task-202", text: "Execute Attendance Recovery Commitment Contract", assignee: "Parent / Guardian", priority: "high", due_timeline: "Within 5 Days", completed: false },
      { id: "task-203", text: "Daily morning attendance tracking by adviser", assignee: "Class Adviser", priority: "medium", due_timeline: "Ongoing", completed: false }
    ]),
    scheduled_followup: new Date(Date.now() + 86400000 * 5).toISOString()
  },
  {
    id: 203,
    student_id: 3,
    student_name: "Angelica Dela Cruz",
    title: "Emergency Tuition Subsidy & Financial Aid Referral",
    description: "Endorsement to SAPC Alumni Foundation assistance grant for delayed installment payments.",
    target_domain: "Financial Assistance",
    status: "resolved",
    action_items: JSON.stringify([
      { id: "task-301", text: "Endorse scholarship application to Alumni Foundation", assignee: "Guidance Counselor", priority: "high", due_timeline: "Completed", completed: true },
      { id: "task-302", text: "Accounting promissory note approval", assignee: "Scholarship / Finance Office", priority: "high", due_timeline: "Completed", completed: true },
      { id: "task-303", text: "Final voucher release & enrollment clearance", assignee: "Scholarship / Finance Office", priority: "medium", due_timeline: "Completed", completed: true }
    ]),
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
  const [filterStrand, setFilterStrand] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [interventionStudent, setInterventionStudent] = useState<any | null>(null);
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [parentAlertStudent, setParentAlertStudent] = useState<any | null>(null);
  const [isParentAlertOpen, setIsParentAlertOpen] = useState(false);
  const [_isLoading, setIsLoading] = useState(true);

  // Care Plan Interactive States
  const [carePlanFilterStatus, setCarePlanFilterStatus] = useState<string>("all");
  const [carePlanFilterDomain, setCarePlanFilterDomain] = useState<string>("all");
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<number, boolean>>({ 201: true, 202: true });

  const handleSelectSectionFromAnalytics = (sectionName: string, tier: string = "all") => {
    setFilterSection(sectionName);
    setFilterTier(tier);
    setFilterStrand("all");
    setSearch("");
    setCurrentPage(1);

    // Smooth scroll to the student roster
    setTimeout(() => {
      const rosterElement = document.getElementById("students-roster");
      if (rosterElement) {
        rosterElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const parseActionItems = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback: parse lines into tasks
        return raw.split("\n").filter(l => l.trim()).map((line, idx) => ({
          id: `task-${idx}`,
          text: line.replace(/^-\s*(\[[ xX]\]\s*)?/, ""),
          assignee: "Guidance Counselor",
          priority: "medium",
          due_timeline: "Standard",
          completed: line.includes("[x]") || line.includes("[X]")
        }));
      }
    }
    return [];
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, studentsRes, flaggedRes, interventionsRes] = await Promise.all([
        fetchWithAuth("/analytics/cohort-summary").catch(() => null),
        fetchWithAuth("/students").catch(() => null),
        fetchWithAuth("/chatbot/flagged-alerts").catch(() => null),
        fetchWithAuth("/risk/interventions").catch(() => null)
      ]);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (studentsRes && Array.isArray(studentsRes) && studentsRes.length > 0) setStudents(studentsRes);
      if (flaggedRes && Array.isArray(flaggedRes)) setFlaggedSessions(flaggedRes);

      // Load Interventions from localStorage merged with API or default mock
      let combinedInterventions = DEFAULT_INTERVENTIONS;
      if (interventionsRes && Array.isArray(interventionsRes) && interventionsRes.length > 0) {
        combinedInterventions = interventionsRes;
      }
      if (typeof window !== "undefined") {
        const storedPlans = localStorage.getItem("sapc_interventions");
        if (storedPlans) {
          try {
            const localList = JSON.parse(storedPlans);
            if (Array.isArray(localList) && localList.length > 0) {
              const existingIds = new Set(localList.map((p: any) => p.id));
              combinedInterventions = [...localList, ...combinedInterventions.filter((p: any) => !existingIds.has(p.id))];
            }
          } catch {
            // Ignore parse error
          }
        }
      }
      setInterventions(combinedInterventions);

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

  const handleTogglePlanTask = async (planId: number, taskId: string) => {
    setInterventions((prev) => {
      const updated = prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const currentTasks = parseActionItems(plan.action_items);
        const updatedTasks = currentTasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const serialized = JSON.stringify(updatedTasks);

        // Async sync to backend and localStorage
        fetchWithAuth(`/risk/interventions/${planId}`, {
          method: "PATCH",
          body: JSON.stringify({ action_items: serialized })
        }).catch(() => {});

        return { ...plan, action_items: serialized };
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_interventions", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleUpdatePlanStatus = async (planId: number, newStatus: string) => {
    setInterventions((prev) => {
      const updated = prev.map((plan) =>
        plan.id === planId ? { ...plan, status: newStatus } : plan
      );
      fetchWithAuth(`/risk/interventions/${planId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      }).catch(() => {});

      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_interventions", JSON.stringify(updated));
      }
      return updated;
    });
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleCarePlanUpdate = (e: any) => {
      const newOrUpdatedPlan = e.detail;
      if (newOrUpdatedPlan) {
        setInterventions((prev) => {
          const exists = prev.some((p) => p.id === newOrUpdatedPlan.id);
          if (exists) {
            return prev.map((p) => (p.id === newOrUpdatedPlan.id ? newOrUpdatedPlan : p));
          }
          return [newOrUpdatedPlan, ...prev];
        });
      } else {
        loadData();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("sapc_interventions_updated", handleCarePlanUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("sapc_interventions_updated", handleCarePlanUpdate);
      }
    };
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
      s.lrn.includes(search) ||
      (s.section_name && s.section_name.toLowerCase().includes(search.toLowerCase()));
    const matchesTier = filterTier === "all" || s.latest_risk_tier?.toLowerCase() === filterTier;
    const matchesStrand = filterStrand === "all" || s.strand === filterStrand;
    const matchesSection = filterSection === "all" || s.section_name === filterSection;
    return matchesSearch && matchesTier && matchesStrand && matchesSection;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-8 pb-12 font-sans min-w-0">
      {/* Top Banner - Institutional Maroon & Gold */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-6 sm:p-9 shadow-md text-white border-t-4 border-amber-400">
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
      <div id="triage-overview" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 scroll-mt-24">
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
        <div id="alerts-queue" className="bg-white border-l-4 border-l-rose-600 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 scroll-mt-24">
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
        <div id="teacher-referrals" className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 scroll-mt-24">
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
      <div id="students-roster" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 scroll-mt-24 min-w-0 overflow-hidden">
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

          <div className="flex flex-wrap items-center gap-3">
            {/* Section Filter */}
            <div className="relative">
              <select
                value={filterSection}
                onChange={(e) => {
                  setFilterSection(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full sm:w-auto text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 pr-8 focus:outline-none transition cursor-pointer border ${
                  filterSection !== "all" 
                    ? "bg-rose-50 border-rose-300 text-rose-950 font-bold" 
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-[#8B0014]"
                }`}
              >
                <option value="all">All Sections</option>
                <option value="Grade 11 - St. Augustine (STEM)">Grade 11 - St. Augustine (STEM)</option>
                <option value="Grade 11 - St. Lorenzo (HUMSS)">Grade 11 - St. Lorenzo (HUMSS)</option>
                <option value="Grade 11 - St. Clare (ABM)">Grade 11 - St. Clare (ABM)</option>
                <option value="Grade 11 - St. Pedro Calungsod (TVL-ICT)">Grade 11 - St. Pedro Calungsod (TVL)</option>
                <option value="Grade 12 - St. Thomas Aquinas (STEM)">Grade 12 - St. Thomas Aquinas (STEM)</option>
                <option value="Grade 12 - St. Teresa of Avila (HUMSS)">Grade 12 - St. Teresa of Avila (HUMSS)</option>
                <option value="Grade 12 - St. Jude (ABM)">Grade 12 - St. Jude (ABM)</option>
                <option value="Grade 12 - St. Vincent (TVL-HE)">Grade 12 - St. Vincent (TVL)</option>
                <option value="Grade 10 - St. Francis">Grade 10 - St. Francis (JHS)</option>
                <option value="Grade 9 - St. Benedict">Grade 9 - St. Benedict (JHS)</option>
                <option value="Grade 8 - St. Dominic">Grade 8 - St. Dominic (JHS)</option>
                <option value="Grade 7 - St. Ignatius">Grade 7 - St. Ignatius (JHS)</option>
              </select>
            </div>

            {/* Strand Filter */}
            <div className="relative">
              <select
                value={filterStrand}
                onChange={(e) => {
                  setFilterStrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:bg-white focus:border-[#8B0014] transition cursor-pointer"
              >
                <option value="all">All Academic Strands</option>
                <option value="STEM">STEM (Senior High)</option>
                <option value="HUMSS">HUMSS (Senior High)</option>
                <option value="ABM">ABM (Senior High)</option>
                <option value="TVL">TVL (Senior High)</option>
                <option value="JHS">Junior High (Grades 7-10)</option>
              </select>
            </div>

            {/* Risk Tier Filter */}
            <div className="relative">
              <select
                value={filterTier}
                onChange={(e) => {
                  setFilterTier(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Active Filter Banner when redirected from Section Matrix */}
        {(filterSection !== "all" || filterTier !== "all" || filterStrand !== "all" || search !== "") && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/90 rounded-2xl px-4 py-3 text-xs text-slate-800 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-[#8B0014] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                Active Table View:
              </span>
              {filterSection !== "all" && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-[#8B0014] font-bold shadow-2xs">
                  Section: {filterSection}
                </span>
              )}
              {filterTier !== "all" && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black shadow-2xs uppercase text-[10px]">
                  {filterTier} Risk
                </span>
              )}
              {filterStrand !== "all" && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold">
                  Strand: {filterStrand}
                </span>
              )}
              {search && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold">
                  Search: &quot;{search}&quot;
                </span>
              )}
              <span className="text-slate-500 font-medium ml-1">
                ({filteredStudents.length} matching students)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFilterSection("all");
                setFilterTier("all");
                setFilterStrand("all");
                setSearch("");
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs transition shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>✕ Reset All Filters</span>
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-extrabold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">Student Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">LRN</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Section / Adviser</th>
                <th className="py-3.5 px-4 whitespace-nowrap">AHP Composite Risk</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Primary Factor</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="text-slate-800 hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm sm:text-base whitespace-nowrap">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-xs sm:text-sm font-semibold whitespace-nowrap">{s.lrn}</td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <div className="font-semibold text-xs sm:text-sm text-slate-900">{s.section_name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.adviser_name}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="md" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold whitespace-nowrap inline-block">
                        {s.primary_risk_driver || "Academic"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setIsDetailOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white transition font-bold text-xs shadow-xs"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setParentAlertStudent(s);
                          setIsParentAlertOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition font-bold text-xs"
                        title="Send instant SMS/Email meeting invite to parent"
                      >
                        ✉ Notify
                      </button>
                      <button
                        onClick={() => {
                          setInterventionStudent(s);
                          setIsInterventionOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition font-bold text-xs"
                      >
                        + Care Plan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Showing <strong className="text-slate-900">{filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredStudents.length)}</strong> of <strong className="text-slate-900">{filteredStudents.length}</strong> Students Monitored
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1 transition shadow-2xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-xs text-slate-800 border border-slate-200">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1 transition shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Longitudinal Multi-Term Progression & Retention Matrix */}
      <div id="trend-analytics" className="scroll-mt-24">
        <CohortTrendAnalytics onSelectSection={handleSelectSectionFromAnalytics} />
      </div>

      {/* Active Interventions Board */}
      <div id="active-interventions" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-[#8B0014] border border-rose-200">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Active Intervention Care Plans & Protocols
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Multi-stakeholder task checklists, progress tracking, and scheduled follow-ups
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                // Open for first high-risk student or first available student
                const highRiskStudent = students.find(s => s.latest_risk_tier === "high") || students[0];
                if (highRiskStudent) {
                  setInterventionStudent(highRiskStudent);
                  setIsInterventionOpen(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition shadow-xs"
            >
              <PlusCircle className="h-4 w-4 text-amber-300" />
              <span>+ Create Care Plan</span>
            </button>
            <span className="text-xs sm:text-sm font-bold text-[#8B0014] bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
              {interventions.length} Plans Active
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#8B0014]" /> Filter Protocols:
            </span>

            <select
              value={carePlanFilterStatus}
              onChange={(e) => setCarePlanFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#8B0014]"
            >
              <option value="all">All Statuses ({interventions.length})</option>
              <option value="in_progress">🟡 In Progress</option>
              <option value="pending">⚪ Pending Intake</option>
              <option value="resolved">🟢 Resolved</option>
              <option value="escalated">🔴 Escalated</option>
            </select>

            <select
              value={carePlanFilterDomain}
              onChange={(e) => setCarePlanFilterDomain(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#8B0014]"
            >
              <option value="all">All Target Domains</option>
              <option value="Academic">Academic Remediation</option>
              <option value="Mental Health">Mental Health / Counseling</option>
              <option value="Financial">Financial Assistance</option>
              <option value="Family">Family / Attendance</option>
              <option value="Health">Health Clinic Support</option>
            </select>
          </div>

          {(carePlanFilterStatus !== "all" || carePlanFilterDomain !== "all") && (
            <button
              type="button"
              onClick={() => {
                setCarePlanFilterStatus("all");
                setCarePlanFilterDomain("all");
              }}
              className="text-xs text-[#8B0014] font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Care Plans Grid */}
        {(() => {
          const filteredPlans = interventions.filter((p) => {
            const matchesStatus =
              carePlanFilterStatus === "all" ||
              p.status?.toLowerCase() === carePlanFilterStatus.toLowerCase();
            const matchesDomain =
              carePlanFilterDomain === "all" ||
              (p.target_domain && p.target_domain.toLowerCase().includes(carePlanFilterDomain.toLowerCase()));
            return matchesStatus && matchesDomain;
          });

          if (filteredPlans.length === 0) {
            return (
              <div className="py-12 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 space-y-2">
                <Target className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="font-bold text-sm">No care plans match the selected filters.</p>
                <p className="text-xs text-slate-400">Try choosing a different status or domain filter above.</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredPlans.map((p) => {
                const planTasks = parseActionItems(p.action_items);
                const completedCount = planTasks.filter((t) => t.completed).length;
                const totalTasks = planTasks.length;
                const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
                const isExpanded = expandedPlanIds[p.id] ?? true;

                return (
                  <div
                    key={p.id}
                    className="bg-slate-50/70 p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-slate-300 hover:bg-slate-50 transition shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Student info, domain & status dropdown */}
                      <div className="flex flex-wrap items-start justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (p.student_id) {
                                  setSelectedStudentId(p.student_id);
                                  setIsDetailOpen(true);
                                }
                              }}
                              className="font-black text-slate-900 text-base hover:text-[#8B0014] text-left transition"
                            >
                              {p.student_name}
                            </button>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                              ID #{p.student_id || p.id}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 block mt-0.5 font-medium">
                            Domain: <strong className="text-[#8B0014]">{p.target_domain}</strong>
                          </span>
                        </div>

                        {/* Interactive Status Selector */}
                        <div className="relative">
                          <select
                            value={p.status}
                            onChange={(e) => handleUpdatePlanStatus(p.id, e.target.value)}
                            className={`text-xs font-black rounded-xl px-3 py-1.5 border focus:outline-none transition cursor-pointer shadow-2xs ${
                              p.status === "resolved"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : p.status === "escalated"
                                ? "bg-rose-50 text-rose-800 border-rose-300"
                                : p.status === "pending"
                                ? "bg-slate-100 text-slate-800 border-slate-300"
                                : "bg-amber-50 text-amber-900 border-amber-300"
                            }`}
                          >
                            <option value="in_progress">🟡 In Progress</option>
                            <option value="pending">⚪ Pending Review</option>
                            <option value="resolved">🟢 Resolved / Goal Met</option>
                            <option value="escalated">🔴 Escalated</option>
                          </select>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{p.description}</p>
                      </div>

                      {/* Progress Bar */}
                      {totalTasks > 0 && (
                        <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Task Execution Progress:
                            </span>
                            <span className="text-[11px] text-slate-900">
                              {completedCount} of {totalTasks} ({progressPct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                progressPct === 100
                                  ? "bg-emerald-500"
                                  : progressPct > 50
                                  ? "bg-amber-500"
                                  : "bg-[#8B0014]"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Items Checklist */}
                      {totalTasks > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                              Assigned Responsibilities:
                            </span>
                            {totalTasks > 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedPlanIds((prev) => ({
                                    ...prev,
                                    [p.id]: !isExpanded
                                  }))
                                }
                                className="text-[11px] font-bold text-[#8B0014] hover:underline flex items-center gap-0.5"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Compact View</span>
                                    <ChevronUp className="h-3 w-3" />
                                  </>
                                ) : (
                                  <>
                                    <span>View All ({totalTasks})</span>
                                    <ChevronDown className="h-3 w-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            {(isExpanded ? planTasks : planTasks.slice(0, 2)).map((task: any) => (
                              <div
                                key={task.id}
                                onClick={() => handleTogglePlanTask(p.id, task.id)}
                                className={`p-2.5 rounded-xl border transition flex items-start gap-2.5 cursor-pointer shadow-2xs ${
                                  task.completed
                                    ? "bg-emerald-50/50 border-emerald-200 text-slate-400"
                                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {task.completed ? (
                                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-slate-400 hover:text-[#8B0014]" />
                                  )}
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <p className={`text-xs font-semibold leading-tight ${task.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                                    {task.text}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-0.5">
                                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                                      {task.assignee}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded font-extrabold uppercase ${
                                        task.priority === "high"
                                          ? "bg-rose-100 text-rose-800"
                                          : task.priority === "medium"
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {task.priority}
                                    </span>
                                    <span className="text-slate-400">
                                      • {task.due_timeline}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Follow-up: <strong className="text-slate-700">{p.scheduled_followup ? new Date(p.scheduled_followup).toLocaleDateString() : "Pending"}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.student_id && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(p.student_id);
                              setIsDetailOpen(true);
                            }}
                            className="text-xs font-bold text-[#8B0014] hover:underline"
                          >
                            Open Student Case →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
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
