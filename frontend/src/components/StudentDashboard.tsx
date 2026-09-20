"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  BookOpen, 
  HeartHandshake, 
  GraduationCap,
  Activity, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  X, 
  Flame, 
  User, 
  Users, 
  DollarSign, 
  HeartPulse, 
  Bell, 
  Lock, 
  BarChart3, 
  LineChart as LucideLineChart, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Info, 
  Shield, 
  Edit3, 
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SAPC_500_STUDENTS } from "@/data/students500";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";
import { AcademicRecoverySimulator } from "./AcademicRecoverySimulator";
import { AccountManagementModal } from "./AccountManagementModal";
import { useDragScroll } from "@/lib/useDragScroll";

interface StudentDashboardProps {
  onOpenChat: () => void;
}

type TabType = 
  | "profile"
  | "progress" 
  | "grades" 
  | "attendance" 
  | "mental_assessment" 
  | "health_assessment" 
  | "family_assessment" 
  | "financial_assessment" 
  | "interventions" 
  | "recommendations" 
  | "trends" 
  | "forecast" 
  | "notifications" 
  | "privacy";

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  // Default first tab is Student Profile
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const tabsDrag = useDragScroll<HTMLDivElement>();
  const [student, setStudent] = useState<any | null>(null);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  
  // 1-Click Micro Mood Check-in State
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [microSubmittedEmoji, setMicroSubmittedEmoji] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(12);

  // Quick Consultation Modal State
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationReason, setConsultationReason] = useState("Academic & Career Mentorship");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [consultationSubmitted, setConsultationSubmitted] = useState(false);

  // Assessment Form States
  const [phq9Scores, setPhq9Scores] = useState<Record<number, number>>({ 0: 1, 1: 1, 2: 1, 3: 1, 4: 0, 5: 0, 6: 1, 7: 0, 8: 0 });
  const [gad7Scores, setGad7Scores] = useState<Record<number, number>>({ 0: 1, 1: 1, 2: 0, 3: 1, 4: 0, 5: 0, 6: 0 });
  const [assessmentSuccessMsg, setAssessmentSuccessMsg] = useState<string | null>(null);

  // Physical Health Form States
  const [healthForm, setHealthForm] = useState({
    chronicConditions: ["Asthma (Mild)"],
    mealFrequency: "3 Regular Meals",
    skipsBreakfast: "Rarely",
    waterIntake: "1.5 - 2.0 Liters",
    sleepHours: 6.5,
    sleepQuality: 3,
    daytimeFatigue: "Sometimes",
    exerciseDays: 2
  });

  // Family Form States (17 Fields)
  const [familyForm, setFamilyForm] = useState({
    householdSize: 5,
    isEldest: true,
    ofwStatus: "Father Abroad (Middle East)",
    maritalStatus: "Married",
    livingArrangement: "Living with Mother & Siblings",
    primaryCaregiver: "Mother",
    fatherEducation: "College Graduate",
    motherEducation: "College Graduate",
    guardianResponsiveness: "Always Responsive",
    ptaAttendance: "Regular Attendance",
    familyConflictLevel: 2,
    is4Ps: false,
    caregivingBurdenHours: 3,
    internetAccessAtHome: "High-Speed Fiber",
    studySpaceQuietness: "Moderately Quiet",
    siblingsInSchool: 2,
    familySupportIndex: 4
  });

  // Financial Form States
  const [financialForm, setFinancialForm] = useState({
    incomeBracket: "₱20,000 - ₱40,000",
    is4Ps: false,
    breadwinnerOccupation: "OFW Technical Technician",
    financialStressLevel: 3,
    primaryStressor: "Daily Transportation & Project Supplies",
    dailyAllowanceAdequacy: "Just Enough (₱150/day)",
    isWorkingStudent: false,
    weeklyWorkHours: 0,
    scholarshipType: "DepEd ESC Voucher Grant",
    tuitionInstallmentStatus: "Current / Up to Date"
  });

  // Privacy Consents State (RA 10173)
  const [privacyConsents, setPrivacyConsents] = useState({
    crisisAlertCounselor: true,
    chatbotHistoryCounselor: true,
    parentAdvisorySharing: true,
    academicRemediationConsent: true
  });

  // Interventions Action Items Checklist
  const [interventionTasks, setInterventionTasks] = useState([
    { id: "task-1", text: "Pre-Calculus diagnostic test with Ms. Santos", completed: true, dueDate: "Sept 10, 2026" },
    { id: "task-2", text: "Bi-weekly 1-on-1 counseling session for test anxiety", completed: false, dueDate: "Sept 24, 2026" },
    { id: "task-3", text: "Assigned peer tutor (Kyle Mercado - Grade 12 STEM)", completed: true, dueDate: "Sept 15, 2026" },
    { id: "task-4", text: "Submit revised Trigonometry Problem Set 2", completed: false, dueDate: "Oct 02, 2026" }
  ]);

  // Tab Navigation synchronization with URL params and Custom Events
  useEffect(() => {
    const handleUrlSync = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const tabFromQuery = params.get("tab") as TabType | null;
      const hash = window.location.hash.replace("#", "");

      const validTabs: TabType[] = [
        "profile", "progress", "grades", "attendance", "mental_assessment",
        "health_assessment", "family_assessment", "financial_assessment",
        "interventions", "recommendations", "trends", "forecast", "notifications", "privacy"
      ];

      if (tabFromQuery && validTabs.includes(tabFromQuery)) {
        setActiveTab(tabFromQuery);
      } else if (hash) {
        if (hash === "student-profile") setActiveTab("profile");
        else if (hash === "wellness-radar" || hash === "quarterly-trajectory") setActiveTab("progress");
        else if (hash === "academic-records") setActiveTab("grades");
        else if (hash === "attendance-tracker") setActiveTab("attendance");
        else if (hash === "daily-mood" || hash === "mental-health-screeners") setActiveTab("mental_assessment");
        else if (hash === "health-assessment") setActiveTab("health_assessment");
        else if (hash === "family-assessment") setActiveTab("family_assessment");
        else if (hash === "financial-assessment") setActiveTab("financial_assessment");
        else if (hash === "assigned-interventions") setActiveTab("interventions");
        else if (hash === "recommendations-view") setActiveTab("recommendations");
        else if (hash === "trends-view") setActiveTab("trends");
        else if (hash === "academic-simulator") setActiveTab("forecast");
        else if (hash === "notifications-view") setActiveTab("notifications");
        else if (hash === "privacy-consents") setActiveTab("privacy");
      }

      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.add("ring-4", "ring-amber-400/50");
            setTimeout(() => el.classList.remove("ring-4", "ring-amber-400/50"), 2000);
          }
        }, 100);
      }
    };

    handleUrlSync();

    const handleCustomNav = (e: CustomEvent<{ tab?: TabType; hash?: string }>) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
      if (e.detail?.hash) {
        setTimeout(() => {
          const el = document.getElementById(e.detail.hash!);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.add("ring-4", "ring-amber-400/50");
            setTimeout(() => el.classList.remove("ring-4", "ring-amber-400/50"), 2000);
          }
        }, 100);
      }
    };

    window.addEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
    window.addEventListener("popstate", handleUrlSync);
    window.addEventListener("hashchange", handleUrlSync);

    return () => {
      window.removeEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
      window.removeEventListener("popstate", handleUrlSync);
      window.removeEventListener("hashchange", handleUrlSync);
    };
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Auto-scroll active tab into view smoothly when activeTab changes
  useEffect(() => {
    if (!isMounted) return;

    const timer = setTimeout(() => {
      const activeTabEl = document.getElementById(`student-tab-${activeTab}`);
      if (activeTabEl && tabsDrag.ref.current) {
        activeTabEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeTab, isMounted, tabsDrag.ref]);

  useEffect(() => {
    setIsMounted(true);
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const studentsList = (await fetchWithAuth("/students").catch(() => null)) || SAPC_500_STUDENTS;
        if (studentsList && studentsList.length > 0) {
          const s = studentsList.find((st: any) => 
            (user?.student_id && st.id === user.student_id) ||
            (user?.email && st.email?.toLowerCase() === user.email.toLowerCase()) ||
            (user?.full_name && `${st.first_name} ${st.last_name}`.toLowerCase() === user.full_name.toLowerCase())
          ) || {
            id: user?.student_id || 1,
            first_name: user?.full_name ? user.full_name.split(" ")[0] : "Joshua",
            last_name: user?.full_name && user.full_name.split(" ").length > 1 ? user.full_name.split(" ").slice(1).join(" ") : "Dimaculangan",
            full_name: user?.full_name || "Joshua Dimaculangan",
            lrn: "109238475999",
            grade_level: 11,
            strand: "STEM",
            section_name: "Grade 11 - St. Augustine (STEM)",
            adviser_name: "Mr. Roberto Santos, LPT",
            email: user?.email || "student@sapc.edu.ph"
          };
          setStudent(s);

          const [rRes, aRes] = await Promise.all([
            fetchWithAuth(`/risk/student/${s.id}`).catch(() => null),
            fetchWithAuth(`/academic/student/${s.id}`).catch(() => [])
          ]);

          setRiskData(rRes || {
            composite_risk_score: s.latest_risk_score || 24.5,
            risk_tier: s.latest_risk_tier || "low",
            academic_score: s.domain_scores?.academic || 18.0,
            family_score: s.domain_scores?.family || 14.0,
            health_score: s.domain_scores?.health || 12.0,
            mental_health_score: s.domain_scores?.mental_health || 15.0,
            financial_score: s.domain_scores?.financial || 10.0
          });
          
          setAcademicRecords(aRes && aRes.length > 0 ? aRes : [
            {
              id: 1,
              school_year: "2025-2026",
              semester: "1st Semester",
              quarter: "Q1",
              gpa: s.sass_metrics?.gpa || 88.5,
              attendance_rate: 96.5,
              absences_count: s.sass_metrics?.days_absent || 1,
              incomplete_subjects_count: s.sass_metrics?.incomplete_requirements_count || 0
            }
          ]);
        }
      } catch (err) {
        console.warn("Student dashboard loaded in local mode:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.student_id, user?.email, user?.full_name]);

  if (!isMounted) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-12 font-sans animate-pulse px-2 sm:px-0">
        <div className="h-40 sm:h-44 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 sm:h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const domainScores = {
    academic: riskData?.academic_score || 18.0,
    family: riskData?.family_score || 14.0,
    health: riskData?.health_score || 12.0,
    mental_health: riskData?.mental_health_score || 15.0,
    financial: riskData?.financial_score || 10.0
  };

  const displayName = user?.full_name || (student ? (student.full_name || `${student.first_name} ${student.last_name}`) : "Student");
  const displayLrn = student?.lrn || "109482719283";
  const displaySection = student?.section_name || "Grade 11 - STEM (St. Augustine)";
  const displayAdviser = student?.adviser_name || "Mr. Roberto Santos, LPT";
  const displayGpa = academicRecords[0]?.gpa ? academicRecords[0].gpa.toFixed(1) : "88.5";
  const displayAttendance = academicRecords[0]?.attendance_rate ? `${academicRecords[0].attendance_rate}%` : "96.5%";

  // Detailed Subjects & Components for Grades Page
  const SUBJECTS_BREAKDOWN = [
    { code: "STEM-101", title: "General Mathematics", teacher: "Ms. Elena Ramos", ww: 88, pt: 92, qe: 86, q1: 89, q2: 90, final: 89.5, status: "passing" },
    { code: "STEM-102", title: "Pre-Calculus", teacher: "Mr. Roberto Santos", ww: 74, pt: 78, qe: 73, q1: 76, q2: 78, final: 77.0, status: "borderline" },
    { code: "STEM-103", title: "General Chemistry 1", teacher: "Dr. Maria Gomez", ww: 85, pt: 89, qe: 84, q1: 87, q2: 88, final: 87.5, status: "passing" },
    { code: "CORE-101", title: "Oral Communication in Context", teacher: "Mr. Carlos Cruz", ww: 91, pt: 94, qe: 90, q1: 92, q2: 93, final: 92.5, status: "passing" },
    { code: "CORE-102", title: "Komunikasyon at Pananaliksik", teacher: "Gng. Teresa Santos", ww: 86, pt: 90, qe: 85, q1: 88, q2: 89, final: 88.5, status: "passing" },
    { code: "PE-101", title: "Physical Education & Health 1", teacher: "Coach Mark Morales", ww: 95, pt: 96, qe: 94, q1: 95, q2: 96, final: 95.5, status: "passing" },
    { code: "CORE-103", title: "Disaster Readiness & Risk Reduction", teacher: "Engr. Paul Valdez", ww: 84, pt: 86, qe: 82, q1: 85, q2: 86, final: 85.5, status: "passing" }
  ];

  // Calculate psychometric test totals
  const totalPhq9 = Object.values(phq9Scores).reduce((a, b) => a + b, 0);
  const totalGad7 = Object.values(gad7Scores).reduce((a, b) => a + b, 0);

  const getPhq9Interpretation = (score: number) => {
    if (score <= 4) return { label: "Minimal Depression", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score <= 9) return { label: "Mild Depression", color: "text-amber-800 bg-amber-50 border-amber-200" };
    if (score <= 14) return { label: "Moderate Depression", color: "text-orange-800 bg-orange-50 border-orange-200" };
    return { label: "Moderately Severe / Severe", color: "text-rose-800 bg-rose-50 border-rose-200" };
  };

  const getGad7Interpretation = (score: number) => {
    if (score <= 4) return { label: "Minimal Anxiety", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score <= 9) return { label: "Mild Anxiety", color: "text-amber-800 bg-amber-50 border-amber-200" };
    if (score <= 14) return { label: "Moderate Anxiety", color: "text-orange-800 bg-orange-50 border-orange-200" };
    return { label: "Severe Anxiety", color: "text-rose-800 bg-rose-50 border-rose-200" };
  };

  const handleQuickMicroCheckin = async (score: number, emoji: string, label: string) => {
    const timestampIso = new Date().toISOString();
    setMicroSubmittedEmoji(emoji);
    setCheckedInToday(true);
    setCurrentStreak((prev) => prev + 1);

    const entry = {
      id: `checkin-${score}-${student?.id || 1}`,
      student_id: student?.id || 1,
      mood_score: score,
      mood_emoji: emoji,
      energy_level: score >= 4 ? 4 : 2,
      primary_stressor: score <= 2 ? "Exams / Deadlines" : "None / Peaceful",
      reflection_note: `1-Click quick check-in: Feeling ${label}`,
      created_at: timestampIso
    };

    try {
      await fetchWithAuth("/assessments/mood-checkin", {
        method: "POST",
        body: JSON.stringify(entry)
      }).catch(() => null);

      if (typeof window !== "undefined") {
        const localKey = student?.id ? `sapc_mood_history_${student.id}` : "sapc_mood_history";
        const stored = localStorage.getItem(localKey);
        const currentHistory = stored ? JSON.parse(stored) : { streak_days: currentStreak, recent_checkins: [] };
        const updatedRecent = [entry, ...(currentHistory.recent_checkins || [])];
        localStorage.setItem(localKey, JSON.stringify({
          ...currentHistory,
          streak_days: currentStreak + 1,
          recent_checkins: updatedRecent
        }));
        window.dispatchEvent(new CustomEvent("sapc:mood-checkin-updated", { detail: entry }));
      }
    } catch {}
  };

  const handleAssessmentSubmit = (type: string) => {
    setAssessmentSuccessMsg(`Successfully saved and updated your ${type} screening profile.`);
    setTimeout(() => setAssessmentSuccessMsg(null), 3500);
  };

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultationSubmitted(true);
    setTimeout(() => {
      setConsultationSubmitted(false);
      setIsConsultationOpen(false);
      setConsultationNotes("");
    }, 2500);
  };

  const toggleTask = (id: string) => {
    setInterventionTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const TAB_ITEMS: Array<{ id: TabType; label: string; icon: any; badge?: string }> = [
    { id: "profile", label: "Student Profile", icon: User, badge: "Primary" },
    { id: "progress", label: "My Progress & Radar", icon: BarChart3 },
    { id: "grades", label: "Grades & Components", icon: BookOpen },
    { id: "attendance", label: "Attendance Tracker", icon: Activity },
    { id: "mental_assessment", label: "Mental Health (PHQ-9/GAD-7)", icon: HeartHandshake },
    { id: "health_assessment", label: "Physical Health", icon: HeartPulse },
    { id: "family_assessment", label: "Family (17 Fields)", icon: Users },
    { id: "financial_assessment", label: "Financial Aid & Stress", icon: DollarSign },
    { id: "interventions", label: "Assigned Interventions", icon: CheckSquare },
    { id: "recommendations", label: "Recommendations", icon: Sparkles },
    { id: "trends", label: "Trends & Anomalies", icon: LucideLineChart },
    { id: "forecast", label: "Predictive Forecast", icon: TrendingUp },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy Consents", icon: Lock }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 font-sans w-full max-w-full overflow-hidden px-1 sm:px-0">
      {/* Top Banner Header (Mobile-First responsive layout) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-5 sm:p-7 md:p-8 shadow-xl text-white flex flex-col xl:flex-row xl:items-center justify-between gap-5 border border-rose-900/40">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300" />
              Student Portal
            </span>
            <span className="text-[11px] sm:text-xs text-rose-200 font-semibold">• San Antonio de Padua College</span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
            Welcome, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-rose-100/90 leading-relaxed font-normal">
            Holistic academic monitoring, standardized mental health screeners, and proactive guidance care plans under RA 10173.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 xl:pt-0">
          <button
            type="button"
            onClick={onOpenChat}
            className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
          >
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white shrink-0" />
            <span>AI Guidance</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConsultationOpen(true)}
            className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-300 shrink-0" />
            <span>Book Counselor</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Metric Cards (Responsive 2-col to 4-col) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">AHP Composite Risk</span>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">{Number(riskData?.composite_risk_score || 24.5).toFixed(1)}</span>
            <RiskBadge score={riskData?.composite_risk_score || 24.5} tier={riskData?.risk_tier || "low"} size="sm" />
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">5-Domain Weighted (30% Acad)</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">General GPA</span>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-xl sm:text-3xl font-black text-[#8B0014]">{displayGpa}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Passed
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">Passing: 75.0</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Quarter Attendance</span>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-xl sm:text-3xl font-black text-emerald-600">{displayAttendance}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Optimal
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">1 Excused Absence</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Active Care Plan</span>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-xl sm:text-3xl font-black text-amber-700">2 Actions</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              In Progress
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">Peer Tutoring &amp; Check-ins</span>
        </div>
      </div>

      {/* Mobile Selector Dropdown for Small Screens */}
      <div className="block lg:hidden bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
          Select Student Portal View:
        </label>
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value as TabType)}
            className="w-full p-3 pr-10 rounded-xl border border-slate-300 bg-slate-50 font-bold text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
          >
            {TAB_ITEMS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} {item.id === "profile" ? "⭐ (Default)" : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Categorized Navigation Tabs Bar (Scrollable Pill Strip) */}
      <div className="relative bg-white border border-slate-200 rounded-3xl p-2 sm:p-2.5 shadow-sm flex items-center">
        {tabsDrag.canScrollLeft && (
          <button
            type="button"
            onClick={() => tabsDrag.scrollBy(-260)}
            className="flex absolute left-2 z-10 h-8 w-8 rounded-xl bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer backdrop-blur-xs"
            title="Scroll tabs left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div 
          ref={tabsDrag.ref}
          {...tabsDrag.events}
          className="flex items-center gap-1.5 overflow-x-auto scroll-smooth px-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing text-xs font-bold w-full"
        >
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`student-tab-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-2xl whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#8B0014] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                    isActive ? "bg-amber-400 text-amber-950" : "bg-slate-200 text-slate-700"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tabsDrag.canScrollRight && (
          <button
            type="button"
            onClick={() => tabsDrag.scrollBy(260)}
            className="flex absolute right-2 z-10 h-8 w-8 rounded-xl bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer backdrop-blur-xs"
            title="Scroll tabs right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {assessmentSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{assessmentSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1 (PRIMARY): STUDENT PROFILE & EMERGENCY CONTACTS */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div id="student-profile" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-3xl bg-gradient-to-tr from-[#8B0014] to-[#B91C1C] p-0.5 shadow-md shrink-0">
                <div className="h-full w-full bg-white rounded-[22px] flex items-center justify-center text-[#8B0014] font-black text-xl sm:text-2xl">
                  {displayName.charAt(0)}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{displayName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Student
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  LRN: <span className="font-mono text-slate-800 font-bold">{displayLrn}</span> • {displaySection}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition self-stretch sm:self-auto"
            >
              <Edit3 className="h-4 w-4 text-[#8B0014]" />
              <span>Edit Contact Info</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            {/* Academic Placement Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#8B0014]" /> Institutional Academic Registry
              </span>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Grade &amp; Track:</span>
                  <strong className="text-slate-900">Grade 11 • Senior High (STEM Track)</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Class Section:</span>
                  <strong className="text-slate-900">{displaySection}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Class Adviser:</span>
                  <strong className="text-slate-900">{displayAdviser}</strong>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500 font-medium">Institutional Email:</span>
                  <strong className="text-slate-900 truncate max-w-[200px]">{user?.email || "student@sapc.edu.ph"}</strong>
                </div>
              </div>
            </div>

            {/* Emergency Contact & Guardian Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600" /> Parent / Guardian &amp; Emergency Contact
              </span>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Primary Guardian:</span>
                  <strong className="text-slate-900">Mrs. Teresa Dimaculangan (Mother)</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Emergency Mobile:</span>
                  <strong className="text-slate-900 font-mono">+63 917 555 0192</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Home Residence:</span>
                  <strong className="text-slate-900">San Pedro, Laguna, Philippines</strong>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500 font-medium">Data Privacy Compliance:</span>
                  <strong className="text-emerald-700 font-bold flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> RA 10173 Sealed
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-3">
            <Info className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Registrar Verification Notice:</strong>
              Official records (Name, LRN, and Section) are synchronized with DepEd LIS &amp; SAPC SASS. For corrections in official transcript details, kindly submit a request through the Registrar Window in Bldg A.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY PROGRESS & RADAR */}
      {/* ========================================================================= */}
      {activeTab === "progress" && (
        <div id="wellness-radar" className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* 5-Domain Radar & Sub-scores */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">5-Domain Holistic Risk Radar</h3>
                  <p className="text-xs text-slate-500">Psychometrician-validated weights: Acad 30%, Fam 20%, Health 20%, Mental 15%, Fin 15%</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
                  Low Vulnerability
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="h-56 sm:h-64 w-full">
                  <DomainRadarChart scores={domainScores} studentName={displayName} />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#8B0014]" /> Academic (w_AC: 30%)
                    </span>
                    <strong className="text-slate-900 text-sm">{domainScores.academic.toFixed(1)} / 100</strong>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" /> Family Support (w_FA: 20%)
                    </span>
                    <strong className="text-slate-900 text-sm">{domainScores.family.toFixed(1)} / 100</strong>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-rose-600" /> Physical Health (w_HE: 20%)
                    </span>
                    <strong className="text-slate-900 text-sm">{domainScores.health.toFixed(1)} / 100</strong>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 text-rose-500" /> Mental Health (w_MH: 15%)
                    </span>
                    <strong className="text-slate-900 text-sm">{domainScores.mental_health.toFixed(1)} / 100</strong>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-amber-600" /> Financial (w_FI: 15%)
                    </span>
                    <strong className="text-slate-900 text-sm">{domainScores.financial.toFixed(1)} / 100</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Quarter Historical Progression & Trajectory */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Quarterly Trajectory</h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    -8.0 pts Improving
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Q1 Actual Risk:</span>
                    <span className="text-slate-900 font-extrabold">32.5 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "32.5%" }} />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <span className="text-slate-500">Q2 Current Risk:</span>
                    <span className="text-emerald-700 font-extrabold">24.5 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "24.5%" }} />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <span className="text-slate-500">Q3 Target:</span>
                    <span className="text-blue-700 font-extrabold">18.0 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "18.0%" }} />
                  </div>
                </div>

                <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <strong className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Next Quarter Outlook:
                  </strong>
                  <p className="leading-relaxed">
                    Continuing regular tutoring and maintaining 96%+ attendance will position you in honors standing.
                  </p>
                </div>
              </div>

              {/* 1-Click Micro Mood Check-in */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500" /> Streak: {currentStreak} Days
                  </span>
                  {checkedInToday && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Logged Today
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center gap-1 pt-1">
                  {[
                    { score: 1, emoji: "😭", label: "Very Low" },
                    { score: 2, emoji: "😔", label: "Stressed" },
                    { score: 3, emoji: "😐", label: "Okay" },
                    { score: 4, emoji: "😊", label: "Good" },
                    { score: 5, emoji: "🤩", label: "Great" }
                  ].map((m) => (
                    <button
                      key={m.score}
                      type="button"
                      onClick={() => handleQuickMicroCheckin(m.score, m.emoji, m.label)}
                      className={`min-h-[44px] min-w-[44px] text-2xl p-2 rounded-xl transition hover:scale-125 flex items-center justify-center ${
                        microSubmittedEmoji === m.emoji ? "bg-amber-200 ring-2 ring-amber-500" : "hover:bg-slate-200"
                      }`}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Recovery Simulator */}
          <div id="academic-simulator" className="scroll-mt-24">
            <AcademicRecoverySimulator
              studentId={student?.id || 1}
              studentName={displayName}
              initialAcademicScore={domainScores.academic}
              initialCompositeScore={riskData?.composite_risk_score || 24.5}
              initialRiskTier={riskData?.risk_tier || "low"}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GRADES & COMPONENT BREAKDOWN */}
      {/* ========================================================================= */}
      {activeTab === "grades" && (
        <div id="academic-records" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">DepEd Subject Grades &amp; Components</h3>
              <p className="text-xs text-slate-500">Written Work (25%), Performance Tasks (50%), Quarterly Exam (25%)</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                🟢 Passed (&ge;80)
              </span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                🟡 Borderline (75-79)
              </span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                🔴 Remedial (&lt;75)
              </span>
            </div>
          </div>

          {/* Mobile-Friendly Stacked Subject Cards */}
          <div className="grid grid-cols-1 md:hidden gap-3.5">
            {SUBJECTS_BREAKDOWN.map((sbj, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{sbj.title}</h4>
                    <span className="text-xs text-slate-500">{sbj.code} • {sbj.teacher}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                    sbj.status === "passing" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {sbj.final} ({sbj.status === "passing" ? "Passed" : "Borderline"})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-200/60">
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">WW (25%)</span>
                    <strong className="text-slate-800">{sbj.ww}</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">PT (50%)</span>
                    <strong className="text-slate-800">{sbj.pt}</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">QE (25%)</span>
                    <strong className="text-slate-800">{sbj.qe}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Table on Tablet & Desktop */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Subject &amp; Faculty</th>
                  <th className="py-3.5 px-3 text-center">Written Work (25%)</th>
                  <th className="py-3.5 px-3 text-center">Perf. Task (50%)</th>
                  <th className="py-3.5 px-3 text-center">Quarter Exam (25%)</th>
                  <th className="py-3.5 px-3 text-center">Q1</th>
                  <th className="py-3.5 px-3 text-center">Q2</th>
                  <th className="py-3.5 px-3 text-center">Final Grade</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {SUBJECTS_BREAKDOWN.map((sbj, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{sbj.title}</div>
                      <div className="text-xs text-slate-500">{sbj.code} • {sbj.teacher}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700">{sbj.ww} / 100</td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700">{sbj.pt} / 100</td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700">{sbj.qe} / 100</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">{sbj.q1}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">{sbj.q2}</td>
                    <td className="py-3.5 px-3 text-center font-black text-[#8B0014] text-base">{sbj.final}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        sbj.status === "passing" 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {sbj.status === "passing" ? "Passed" : "Borderline"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ATTENDANCE TRACKER */}
      {/* ========================================================================= */}
      {activeTab === "attendance" && (
        <div id="attendance-tracker" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Attendance Tracker</h3>
              <p className="text-xs text-slate-500">Starts at 100.0% and decreases per unexcused/excused school day absence</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-black text-emerald-600 block">96.5%</span>
              <span className="text-xs text-slate-500 font-semibold">1 Absence / 45 School Days</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">August</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">100.0%</p>
              <span className="text-[10px] sm:text-[11px] text-slate-400">0 Absences</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">September</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">95.2%</p>
              <span className="text-[10px] sm:text-[11px] text-slate-400">1 Excused</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">October</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">97.5%</p>
              <span className="text-[10px] sm:text-[11px] text-slate-400">0 Absences</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">November</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">100.0%</p>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MENTAL HEALTH (PHQ-9 / GAD-7) */}
      {/* ========================================================================= */}
      {activeTab === "mental_assessment" && (
        <div id="daily-mood" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 sm:space-y-8 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Psychometric Screening (PHQ-9 &amp; GAD-7)</h3>
              <p className="text-xs text-slate-500">Standardized clinical instruments for emotional wellbeing</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded-full self-start sm:self-auto">
              🔒 RA 10173 Protected
            </span>
          </div>

          {/* PHQ-9 */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">PHQ-9: Depression Screener</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border self-start sm:self-auto ${getPhq9Interpretation(totalPhq9).color}`}>
                Score: {totalPhq9}/27 ({getPhq9Interpretation(totalPhq9).label})
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {[
                "1. Little interest or pleasure in doing school activities / hobbies",
                "2. Feeling down, depressed, or hopeless",
                "3. Trouble falling or staying asleep, or sleeping too much",
                "4. Feeling tired or having little energy during classes",
                "5. Poor appetite or overeating",
                "6. Feeling bad about yourself — or that you are a failure",
                "7. Trouble concentrating on schoolwork or reading",
                "8. Moving or speaking noticeably slowly, or being unusually fidgety",
                "9. Thoughts that you would be better off not around (Crisis Protocol Watch)"
              ].map((q, idx) => (
                <div key={idx} className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-slate-800 font-medium">{q}</span>
                  <div className="grid grid-cols-4 sm:flex items-center gap-1.5 shrink-0">
                    {[0, 1, 2, 3].map((optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => setPhq9Scores({ ...phq9Scores, [idx]: optIdx })}
                        className={`min-h-[40px] px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                          phq9Scores[idx] === optIdx
                            ? "bg-[#8B0014] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {optIdx}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GAD-7: Generalized Anxiety Screener */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">GAD-7: Anxiety &amp; Exam Distress Screener</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border self-start sm:self-auto ${getGad7Interpretation(totalGad7).color}`}>
                Score: {totalGad7}/21 ({getGad7Interpretation(totalGad7).label})
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {[
                "1. Feeling nervous, anxious, or on edge before tests",
                "2. Not being able to stop or control worrying about grades",
                "3. Worrying too much about different school subjects",
                "4. Trouble relaxing during study breaks or weekends",
                "5. Being so restless that it is hard to sit still in class",
                "6. Becoming easily annoyed or irritable with classmates",
                "7. Feeling afraid, as if something awful might happen"
              ].map((q, idx) => (
                <div key={idx} className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-slate-800 font-medium">{q}</span>
                  <div className="grid grid-cols-4 sm:flex items-center gap-1.5 shrink-0">
                    {[0, 1, 2, 3].map((optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => setGad7Scores({ ...gad7Scores, [idx]: optIdx })}
                        className={`min-h-[40px] px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                          gad7Scores[idx] === optIdx
                            ? "bg-[#8B0014] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {optIdx}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleAssessmentSubmit("Mental Health (PHQ-9 / GAD-7)")}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-black text-sm shadow-md transition"
            >
              Save Psychometric Screening
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PHYSICAL HEALTH */}
      {/* ========================================================================= */}
      {activeTab === "health_assessment" && (
        <div id="health-assessment" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Physical Health Screening</h3>
              <p className="text-xs text-slate-500">Sleep patterns, nutrition habits, and chronic conditions</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded-full self-start sm:self-auto">
              SAPC School Clinic Log
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">Chronic Health Conditions</label>
                <div className="space-y-2">
                  {["Asthma", "Migraine / Tension Headaches", "Severe Allergies", "Gastritis", "Anemia", "None"].map((cond, i) => (
                    <label key={i} className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={healthForm.chronicConditions.includes(cond)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setHealthForm({ ...healthForm, chronicConditions: [...healthForm.chronicConditions, cond] });
                          } else {
                            setHealthForm({ ...healthForm, chronicConditions: healthForm.chronicConditions.filter(c => c !== cond) });
                          }
                        }}
                        className="h-4 w-4 rounded text-[#8B0014] focus:ring-[#8B0014]"
                      />
                      <span>{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">Average Daily Sleep (Hours)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.5"
                    value={healthForm.sleepHours}
                    onChange={(e) => setHealthForm({ ...healthForm, sleepHours: Number(e.target.value) })}
                    className="flex-1 accent-[#8B0014] h-3"
                  />
                  <span className="font-extrabold text-[#8B0014] text-base w-16 text-right">{healthForm.sleepHours} hrs</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">Nutrition &amp; Meal Quality</label>
                <select
                  value={healthForm.mealFrequency}
                  onChange={(e) => setHealthForm({ ...healthForm, mealFrequency: e.target.value })}
                  className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
                >
                  <option>3 Regular Balanced Meals</option>
                  <option>2 Meals (Skips Breakfast Regularly)</option>
                  <option>Irregular Meals (High Fast Food Intake)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">Daytime Fatigue / Drowsiness</label>
                <select
                  value={healthForm.daytimeFatigue}
                  onChange={(e) => setHealthForm({ ...healthForm, daytimeFatigue: e.target.value })}
                  className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
                >
                  <option>Rarely / Never</option>
                  <option>Sometimes (1-2 times a week)</option>
                  <option>Frequent (Nearly every afternoon)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleAssessmentSubmit("Physical Health")}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-black text-sm shadow-md transition"
            >
              Save Health Profile
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: FAMILY (17 FIELDS) */}
      {/* ========================================================================= */}
      {activeTab === "family_assessment" && (
        <div id="family-assessment" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">17-Field Family &amp; Social Environment Form</h3>
              <p className="text-xs text-slate-500">Panganay burden, OFW parental absence, and household stability</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded-full self-start sm:self-auto">
              🔒 Confidential Form
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="font-bold text-slate-800 block mb-1">1. Eldest Child (Panganay Burden)</label>
              <select
                value={familyForm.isEldest ? "yes" : "no"}
                onChange={(e) => setFamilyForm({ ...familyForm, isEldest: e.target.value === "yes" })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option value="yes">Yes (Eldest Child - Sibling Caretaking)</option>
                <option value="no">No (Middle / Youngest Child)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">2. OFW Parent Status</label>
              <select
                value={familyForm.ofwStatus}
                onChange={(e) => setFamilyForm({ ...familyForm, ofwStatus: e.target.value })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option>Father Abroad (Middle East/Asia)</option>
                <option>Mother Abroad (Domestic/Healthcare)</option>
                <option>Both Parents Abroad</option>
                <option>Neither (Both in Philippines)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">3. Parental Marital Status</label>
              <select
                value={familyForm.maritalStatus}
                onChange={(e) => setFamilyForm({ ...familyForm, maritalStatus: e.target.value })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option>Married &amp; Living Together</option>
                <option>Separated / Annulled</option>
                <option>Single Parent Household</option>
                <option>Widowed</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">4. Living Arrangement</label>
              <select
                value={familyForm.livingArrangement}
                onChange={(e) => setFamilyForm({ ...familyForm, livingArrangement: e.target.value })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option>Living with Both Parents</option>
                <option>Living with Mother &amp; Siblings</option>
                <option>Living with Relatives</option>
                <option>Boarding House</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">5. Household Size</label>
              <input
                type="number"
                value={familyForm.householdSize}
                onChange={(e) => setFamilyForm({ ...familyForm, householdSize: Number(e.target.value) })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">6. 4Ps Beneficiary Household</label>
              <select
                value={familyForm.is4Ps ? "yes" : "no"}
                onChange={(e) => setFamilyForm({ ...familyForm, is4Ps: e.target.value === "yes" })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option value="no">No (Non-4Ps)</option>
                <option value="yes">Yes (Registered DSWD 4Ps)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleAssessmentSubmit("17-Field Family Predictors")}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-black text-sm shadow-md transition"
            >
              Save Family Profile
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: FINANCIAL AID & STRESS */}
      {/* ========================================================================= */}
      {activeTab === "financial_assessment" && (
        <div id="financial-assessment" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Financial Aid &amp; Economic Strain</h3>
              <p className="text-xs text-slate-500">Subjective financial stress and allowance evaluation</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full self-start sm:self-auto">
              SAPC Financial Desk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Household Income Bracket</label>
                <select
                  value={financialForm.incomeBracket}
                  onChange={(e) => setFinancialForm({ ...financialForm, incomeBracket: e.target.value })}
                  className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
                >
                  <option>Under ₱15,000 (Low Income / Vulnerable)</option>
                  <option>₱15,000 - ₱30,000 (Lower Middle)</option>
                  <option>₱30,000 - ₱60,000 (Middle Income)</option>
                  <option>Above ₱60,000 (Upper Middle / Secure)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Subjective Financial Stress Level (1-5)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={financialForm.financialStressLevel}
                    onChange={(e) => setFinancialForm({ ...financialForm, financialStressLevel: Number(e.target.value) })}
                    className="flex-1 accent-amber-600 h-3"
                  />
                  <span className="font-extrabold text-amber-700 text-base w-12 text-right">{financialForm.financialStressLevel}/5</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Daily Baon &amp; Allowance Adequacy</label>
                <select
                  value={financialForm.dailyAllowanceAdequacy}
                  onChange={(e) => setFinancialForm({ ...financialForm, dailyAllowanceAdequacy: e.target.value })}
                  className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
                >
                  <option>Comfortable (&ge;₱200/day)</option>
                  <option>Just Enough (₱120 - ₱180/day)</option>
                  <option>Inadequate (&lt;₱100/day - Skips Lunch)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleAssessmentSubmit("Financial Aid & Stress")}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-black text-sm shadow-md transition"
            >
              Save Financial Profile
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: ASSIGNED INTERVENTIONS */}
      {/* ========================================================================= */}
      {activeTab === "interventions" && (
        <div id="assigned-interventions" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Assigned Guidance Interventions</h3>
              <p className="text-xs text-slate-500">Collaborative care plan with Guidance Counselor</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full self-start sm:self-auto">
              2 Active Protocols
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">Protocol 1: Pre-Calculus Peer Tutoring</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 self-start sm:self-auto">
                  In Progress
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Assigned to Grade 12 STEM Honor Student Kyle Mercado for weekly trigonometry problem solving.
              </p>

              <div className="space-y-2 pt-2">
                {interventionTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className="min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-amber-400 transition"
                  >
                    <div className="flex items-center gap-3">
                      {t.completed ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400 shrink-0" />
                      )}
                      <span className={`text-xs sm:text-sm font-semibold ${t.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {t.text}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono shrink-0 ml-2">{t.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: RECOMMENDATIONS */}
      {/* ========================================================================= */}
      {activeTab === "recommendations" && (
        <div id="recommendations-view" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Personalized AHP Recommendations</h3>
              <p className="text-xs text-slate-500">Automated recommendations tailored to your profile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#8B0014] text-xs sm:text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0" /> Academic Domain (Weight 30%)
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Focus on Pre-Calculus Trigonometric identities. Schedule 30-minute pacing sessions with Mr. Roberto Santos on Wednesday afternoons.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-extrabold text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                <HeartPulse className="h-4 w-4 shrink-0" /> Physical Health Domain (Weight 20%)
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Maintain 7+ hours of sleep before exam days. Drink at least 2 liters of water daily to prevent stress-induced migraine flare-ups.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 11: TRENDS & ANOMALIES */}
      {/* ========================================================================= */}
      {activeTab === "trends" && (
        <div id="trends-view" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Risk Trends &amp; Anomaly Detection</h3>
              <p className="text-xs text-slate-500">Multi-semester domain tracking</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">Q1 Academic Baseline</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">86.0 GPA</p>
              <span className="text-[11px] text-slate-400">Risk Score: 32.5</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">Q2 Current Standing</span>
              <p className="text-xl sm:text-2xl font-black text-[#8B0014]">88.5 GPA</p>
              <span className="text-[11px] text-emerald-700 font-bold">Risk: 24.5 (-8.0)</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500">Anomaly Detection</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">None Flagged</p>
              <span className="text-[11px] text-slate-400">Steady recovery</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 12: PREDICTIVE FORECAST */}
      {/* ========================================================================= */}
      {activeTab === "forecast" && (
        <div id="forecast-view" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Predictive Failure Risk Forecast</h3>
              <p className="text-xs text-slate-500">Comparing current trajectory vs. post-intervention simulated recovery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Trajectory A: Without Intervention</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700">38.5 / 100</div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Medium Risk Tier
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-2">
              <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">Trajectory B: Active Care Plan</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">14.2 / 100</div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Low Risk Tier (-24.3 pts)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 13: NOTIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === "notifications" && (
        <div id="notifications-view" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Student Notifications</h3>
              <p className="text-xs text-slate-500">Guidance notices and academic updates</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">
              4 Notices
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Peer Tutoring Schedule Confirmation",
                sender: "Maria Theresa Cruz, RGC (Guidance Counselor)",
                time: "Yesterday, 3:30 PM",
                desc: "Your weekly Pre-Calculus tutoring session with Kyle Mercado is set for Wednesday at 4:00 PM in Room 204."
              },
              {
                title: "Q1 Final Grade Report Release",
                sender: "SAPC Registrar Office",
                time: "Sept 18, 2026",
                desc: "Quarter 1 official report cards have been released. Your General Weighted Average is 88.50 (Passed)."
              },
              {
                title: "Parent Acknowledgment Received",
                sender: "Parent Portal Notification",
                time: "Sept 19, 2026",
                desc: "Your parent/guardian acknowledged the Q1 Grade Advisory Report via SMS verification."
              }
            ].map((n, i) => (
              <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 text-xs sm:text-sm font-extrabold">{n.title}</span>
                  <span className="text-slate-400 font-medium">{n.time}</span>
                </div>
                <span className="text-[11px] sm:text-xs text-[#8B0014] font-bold block">{n.sender}</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-0.5">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 14: PRIVACY CONSENTS (RA 10173) */}
      {/* ========================================================================= */}
      {activeTab === "privacy" && (
        <div id="privacy-consents" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">RA 10173 Privacy Consent Center</h3>
              <p className="text-xs text-slate-500">Manage data sharing permissions</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full self-start sm:self-auto">
              🔒 Statutory Protection
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="min-h-[44px] p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="max-w-xl">
                <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">Crisis &amp; Counselor Alerts</strong>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Allow automatic priority notifications to Counselor during severe distress signals.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacyConsents.crisisAlertCounselor}
                onChange={(e) => setPrivacyConsents({ ...privacyConsents, crisisAlertCounselor: e.target.checked })}
                className="h-5 w-5 rounded text-[#8B0014] focus:ring-[#8B0014] shrink-0"
              />
            </div>

            <div className="min-h-[44px] p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="max-w-xl">
                <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">Chatbot Topic History Access</strong>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Allow counselor to view discussion topics for 1-on-1 counseling continuity.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacyConsents.chatbotHistoryCounselor}
                onChange={(e) => setPrivacyConsents({ ...privacyConsents, chatbotHistoryCounselor: e.target.checked })}
                className="h-5 w-5 rounded text-[#8B0014] focus:ring-[#8B0014] shrink-0"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleAssessmentSubmit("Privacy Consent Preferences")}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-black text-sm shadow-md transition"
            >
              Update Preferences
            </button>
          </div>
        </div>
      )}

      {/* Book Counselor Modal */}
      {isConsultationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in font-sans">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-5 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-900">Schedule Guidance Consultation</h3>
              <button onClick={() => setIsConsultationOpen(false)} className="text-slate-400 hover:text-slate-700 p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {consultationSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <h4 className="text-base sm:text-lg font-bold text-slate-900">Appointment Requested!</h4>
                <p className="text-xs text-slate-500">Registered Guidance Counselor Maria Theresa Cruz, RGC will confirm your slot in Room 204.</p>
              </div>
            ) : (
              <form onSubmit={handleConsultationSubmit} className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Reason for Consultation</label>
                  <select
                    value={consultationReason}
                    onChange={(e) => setConsultationReason(e.target.value)}
                    className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    <option>Academic &amp; Career Mentorship</option>
                    <option>Pre-Calculus Tutoring Assistance</option>
                    <option>Stress, Anxiety &amp; Emotional Wellness</option>
                    <option>Family / Home Concerns</option>
                    <option>Financial Aid &amp; Scholarship Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Preferred Time / Notes</label>
                  <textarea
                    rows={3}
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    placeholder="e.g. Wednesday afternoon free period after 3:00 PM..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 min-h-[44px] py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm shadow-md transition"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConsultationOpen(false)}
                    className="w-full sm:w-auto min-h-[44px] py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Account Profile Management Modal */}
      {isAccountModalOpen && (
        <AccountManagementModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
        />
      )}
    </div>
  );
};
