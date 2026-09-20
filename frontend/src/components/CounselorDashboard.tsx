"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Search, 
  CheckCircle,
  GraduationCap,
  Award,
  HeartHandshake,
  PlusCircle,
  CheckCircle2,
  ChevronDown,
  Layers,
  Brain,
  MessageSquare,
  Activity,
  Calendar,
  Bell,
  Sparkles,
  ThumbsUp,
  Download,
  BarChart3,
  FileText,
  UserCheck,
  Sliders,
  ShieldCheck,
  PhoneCall,
  FileSpreadsheet,
  Volume2,
  VolumeX
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { playTone } from "@/lib/audio-alert";
import { RiskBadge } from "./RiskBadge";
import { StudentDetailModal } from "./StudentDetailModal";
import { InterventionModal } from "./InterventionModal";
import { InstitutionalReportModal } from "./InstitutionalReportModal";
import { ParentAlertModal } from "./ParentAlertModal";
import { CohortTrendAnalytics } from "./CohortTrendAnalytics";
import { MultiDomainIngestionHub } from "./MultiDomainIngestionHub";
import { AHPDataVisualizer } from "./AHPDataVisualizer";
import { SAPC_500_STUDENTS, SAPC_COHORT_SUMMARY } from "@/data/students500";
import type { StudentRecord } from "@/data/students500";
import { 
  getActiveStudentDataset, 
  computeCohortAggregates, 
  exportActiveDatasetToCSV 
} from "@/lib/dataset-store";

// Tab types for all 20 Counselor modules
export type CounselorTabType = 
  | "dashboard"
  | "crisis_alerts"
  | "crisis_detail"
  | "students"
  | "student_profile"
  | "student_progress"
  | "chat_history"
  | "assessments"
  | "interventions"
  | "intervention_detail"
  | "intervention_approvals"
  | "risk_reviews"
  | "intervention_analytics"
  | "validate_recommendations"
  | "recommendation_feedback"
  | "referrals"
  | "sessions"
  | "analytics"
  | "reports"
  | "notifications";

interface FlaggedAlert {
  id: number;
  student_id: number;
  student_name: string;
  grade_section: string;
  aggregate_distress_score: number;
  severity: "urgent" | "moderate" | "watchlist";
  keyword_detected: string;
  flag_reason: string;
  transcript_snippet: string;
  consent_status: "Consented" | "Pending Consent" | "Parent Notified";
  started_at: string;
  family_phone: string;
  previous_flags_count: number;
  actions_taken: string[];
}


interface InterventionCarePlan {
  id: number;
  student_id: number;
  student_name: string;
  title: string;
  description: string;
  target_domain: string;
  status: string;
  action_items: string;
  scheduled_followup?: string;
  goals?: string;
  session_notes?: string;
  outcome_rating?: number;
  assigned_counselor?: string;
  proposed_by?: string;
  risk_adjustment_proposed?: string;
}

interface TeacherReferralItem {
  id: string;
  student_id: number;
  student_name: string;
  lrn: string;
  section: string;
  referring_teacher: string;
  concern_type: string;
  urgency: "crisis" | "priority" | "routine" | string;
  observations: string;
  attempted_interventions: string[];
  created_at: string;
  status: "pending_review" | "accepted" | "in_progress" | "declined";
}

interface CounselingSessionItem {
  id: string;
  student_id: number;
  student_name: string;
  time: string;
  date: string;
  type: "1-on-1 Crisis Check-in" | "Academic Anxiety Counseling" | "Parent-Student Case Conference" | "Routine Follow-up";
  status: "Confirmed" | "Completed" | "Pending Acknowledgment" | "Rescheduled";
  room: string;
  notes: string;
}

const DEFAULT_ANALYTICS = SAPC_COHORT_SUMMARY;
const DEFAULT_STUDENTS = SAPC_500_STUDENTS;

const DEFAULT_FLAGGED_ALERTS: FlaggedAlert[] = [
  {
    id: 101,
    student_id: 1,
    student_name: "Joshua Dimaculangan",
    grade_section: "Grade 11 - St. Augustine (STEM)",
    aggregate_distress_score: 88,
    severity: "urgent",
    keyword_detected: "gusto ko na sumuko / I want to give up",
    flag_reason: "Student expressed severe academic helplessness, panic over impending midterms, and chronic insomnia.",
    transcript_snippet: "Student: 'Sobrang bigat na po ng Chem at Calc. Hindi ko na po kaya, gusto ko na sumuko... parang burden lang ako sa magulang ko.'\nAI Bot: 'Naiintindihan ko na mabigat ang nararamdaman mo, Joshua. Nandito ako para makinig at hindi ka nag-iisa. Pwede ba kitang ikonekta kay Ma'am Maria Theresa Cruz sa Guidance Office para matulungan ka?'\nStudent: 'Opo, kailangan ko po ng tulong.'",
    consent_status: "Consented",
    started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    family_phone: "0917-892-3401 (Mother)",
    previous_flags_count: 2,
    actions_taken: ["AI Consent Modal Verified", "Guidance Center Emergency Notification Dispatched", "Parent Phone Alert Queued"]
  },
  {
    id: 102,
    student_id: 4,
    student_name: "Samantha Nicole Reyes",
    grade_section: "Grade 11 - St. Thomas (HUMSS)",
    aggregate_distress_score: 79,
    severity: "moderate",
    keyword_detected: "walang gana / feeling numb",
    flag_reason: "Expressed prolonged sleep deprivation, depressive mood, and family distress regarding parental separation.",
    transcript_snippet: "Student: 'Ilang gabi na akong hindi makatulog. Wala na akong gana pumasok at magpasa ng requirements.'\nAI Bot: 'Ramdam ko ang hirap ng pinagdadaanan mo, Samantha. Mahalaga ang kalusugan mo. Gusto mo bang mag-schedule tayo ng check-in with Guidance?'\nStudent: 'Pag-iisipan ko po pero sige ipaalam mo na rin kay Ma'am.'",
    consent_status: "Consented",
    started_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    family_phone: "0918-234-5678 (Guardian)",
    previous_flags_count: 1,
    actions_taken: ["AI Empathy Response Sent", "Added to Moderate Priority Care Queue"]
  },
  {
    id: 103,
    student_id: 7,
    student_name: "Christian Dave Villanueva",
    grade_section: "Grade 11 - St. Augustine (STEM)",
    aggregate_distress_score: 62,
    severity: "watchlist",
    keyword_detected: "laging pagod / exhausted",
    flag_reason: "Reported difficulty balancing part-time night shift work with daytime academic schedule.",
    transcript_snippet: "Student: 'Pagod na pagod ako pumasok araw-araw galing sa trabaho ng gabi.'\nAI Bot: 'Nakakahanga ang kasipagan mo, Christian, pero mahalaga ang pahinga. May study support resources tayo sa guidance.'",
    consent_status: "Pending Consent",
    started_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    family_phone: "0920-456-7890 (Father)",
    previous_flags_count: 0,
    actions_taken: ["Watchlist Entry Created"]
  }
];

const DEFAULT_INTERVENTIONS: InterventionCarePlan[] = [
  {
    id: 201,
    student_id: 1,
    student_name: "Joshua Dimaculangan",
    title: "Academic Remediation & Anxiety Management Protocol",
    description: "Peer tutoring in Pre-Calculus with weekly guidance counseling check-ins for test anxiety.",
    target_domain: "Mental Health & Academic",
    status: "Active",
    action_items: JSON.stringify([
      { id: "task-101", text: "Pre-Calculus diagnostic test with Ms. Santos", assignee: "Subject Teacher", priority: "high", due_timeline: "Within 3 Days", completed: true },
      { id: "task-102", text: "Bi-weekly 1-on-1 counseling session for test anxiety", assignee: "Guidance Counselor", priority: "high", due_timeline: "Ongoing (Weekly)", completed: false },
      { id: "task-103", text: "Assigned peer tutor (Kyle Mercado - Grade 12 STEM)", assignee: "Class Adviser", priority: "medium", due_timeline: "Within 1 Week", completed: true },
      { id: "task-104", text: "Parent consultation on quiet evening study space", assignee: "Parent / Guardian", priority: "routine", due_timeline: "Within 2 Weeks", completed: false }
    ]),
    scheduled_followup: new Date(Date.now() + 86400000 * 3).toISOString(),
    goals: "Reduce GAD-7 anxiety score from 14 to <7, stabilize Pre-Calculus grade above 78.0",
    session_notes: "Joshua was open about feeling overwhelmed by expectations as first in family to take STEM.",
    outcome_rating: 4,
    assigned_counselor: "Maria Theresa Cruz, RGC"
  },
  {
    id: 202,
    student_id: 4,
    student_name: "Samantha Nicole Reyes",
    title: "Family Support & Attendance Recovery Plan",
    description: "Coordination with guardian and flexible modular submission arrangement for missed HUMSS deadlines.",
    target_domain: "Family & Attendance",
    status: "Active",
    action_items: JSON.stringify([
      { id: "task-201", text: "Formal case conference with guardian at Guidance Center", assignee: "Guidance Counselor", priority: "high", due_timeline: "Within 3 Days", completed: true },
      { id: "task-202", text: "Execute Attendance Recovery Commitment Contract", assignee: "Parent / Guardian", priority: "high", due_timeline: "Within 5 Days", completed: false },
      { id: "task-203", text: "Daily morning attendance tracking by adviser", assignee: "Class Adviser", priority: "medium", due_timeline: "Ongoing", completed: false }
    ]),
    scheduled_followup: new Date(Date.now() + 86400000 * 5).toISOString(),
    goals: "Restore 95% attendance standing and submit pending creative writing portfolios",
    session_notes: "Guardian confirmed emotional stress at home. Flexible timeline granted.",
    outcome_rating: 3,
    assigned_counselor: "Maria Theresa Cruz, RGC"
  },
  {
    id: 203,
    student_id: 3,
    student_name: "Angelica Dela Cruz",
    title: "Emergency Tuition Subsidy & Financial Aid Referral",
    description: "Endorsement to SAPC Alumni Foundation assistance grant for delayed installment payments.",
    target_domain: "Financial Assistance",
    status: "Completed",
    action_items: JSON.stringify([
      { id: "task-301", text: "Endorse scholarship application to Alumni Foundation", assignee: "Guidance Counselor", priority: "high", due_timeline: "Completed", completed: true },
      { id: "task-302", text: "Accounting promissory note approval", assignee: "Scholarship / Finance Office", priority: "high", due_timeline: "Completed", completed: true },
      { id: "task-303", text: "Final voucher release & enrollment clearance", assignee: "Scholarship / Finance Office", priority: "medium", due_timeline: "Completed", completed: true }
    ]),
    scheduled_followup: new Date(Date.now() - 86400000 * 2).toISOString(),
    goals: "Clear financial arrears to enable examination permits",
    session_notes: "Grant approved. Student cleared for 2nd quarter examinations.",
    outcome_rating: 5,
    assigned_counselor: "Maria Theresa Cruz, RGC"
  }
];

export const CounselorDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<CounselorTabType>("dashboard");
  const [selectedNavCategory, setSelectedNavCategory] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isAudioAlertsEnabled, setIsAudioAlertsEnabled] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // State Datasets
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    if (typeof window !== "undefined") {
      return getActiveStudentDataset();
    }
    return DEFAULT_STUDENTS;
  });
  const [_analytics, setAnalytics] = useState<any | null>(DEFAULT_ANALYTICS);
  const [flaggedSessions] = useState<FlaggedAlert[]>(DEFAULT_FLAGGED_ALERTS);
  const [interventions] = useState<InterventionCarePlan[]>(DEFAULT_INTERVENTIONS);
  const [selectedAlert, setSelectedAlert] = useState<FlaggedAlert>(DEFAULT_FLAGGED_ALERTS[0]);

  const cohortStats = useMemo(() => computeCohortAggregates(students), [students]);

  // Modals & Sub-views
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [interventionStudent, setInterventionStudent] = useState<StudentRecord | null>(null);
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showIngestionHub, setShowIngestionHub] = useState(false);
  const [parentAlertStudent, setParentAlertStudent] = useState<StudentRecord | null>(null);
  const [isParentAlertOpen, setIsParentAlertOpen] = useState(false);

  // Search & Filtering States
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterStrand, setFilterStrand] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // 11. Proposed Interventions Approvals Queue
  const [proposedInterventions, setProposedInterventions] = useState([
    {
      id: "PROP-001",
      studentId: 7,
      studentName: "Christian Dave Villanueva",
      proposedBy: "Mr. Roberto Santos, LPT (Adviser)",
      type: "Math & Chemistry Remediation + Working Student Schedule Adjustment",
      rationale: "Student has failing Q1 chemistry marks due to night-shift work fatigue.",
      status: "Pending Counselor Approval",
      date: "2026-09-19"
    },
    {
      id: "PROP-002",
      studentId: 5,
      studentName: "Kyle Mercado",
      proposedBy: "Mrs. Elena Bautista (Parent)",
      type: "Peer Mentorship Leadership Counseling",
      rationale: "Parent requested guidance coaching for senior high leadership burnout.",
      status: "Pending Counselor Approval",
      date: "2026-09-18"
    }
  ]);

  // 12. Risk Score Adjustment Reviews Queue
  const [riskReviews, setRiskReviews] = useState([
    {
      id: "REV-101",
      studentId: 3,
      studentName: "Angelica Dela Cruz",
      proposedBy: "Mr. Roberto Santos, LPT",
      currentScore: 74.5,
      proposedScore: 32.0,
      currentTier: "high",
      proposedTier: "low",
      evidence: "Completed Alumni Foundation financial assistance grant and passed Q2 remediation with 88.0 average.",
      status: "Pending Review"
    },
    {
      id: "REV-102",
      studentId: 8,
      studentName: "Princess Mae Alcantara",
      proposedBy: "Guidance Staff",
      currentScore: 42.0,
      proposedScore: 21.5,
      currentTier: "medium",
      proposedTier: "low",
      evidence: "100% attendance recorded in past 45 school days and family health stabilized.",
      status: "Pending Review"
    }
  ]);

  // 14. Validate AHP Recommendations
  const [ahpRecommendations, setAhpRecommendations] = useState([
    {
      id: "REC-01",
      studentName: "Joshua Dimaculangan",
      domain: "Mental Health & Academic",
      recommendation: "Prescribe GAD-7 mindfulness relaxation exercises and assign Grade 12 STEM peer tutor for factoring and limits.",
      culturalFit: "High",
      approved: true
    },
    {
      id: "REC-02",
      studentName: "Samantha Nicole Reyes",
      domain: "Family & Attendance",
      recommendation: "Hold collaborative case conference with aunt and provide asynchronous modular worksheets.",
      culturalFit: "High",
      approved: true
    },
    {
      id: "REC-03",
      studentName: "Christian Dave Villanueva",
      domain: "Physical Health & Financial",
      recommendation: "Refer to SAPC Working Student Work-Study Assistance to reduce external graveyard shift hours.",
      culturalFit: "Pending Review",
      approved: false
    }
  ]);

  // 15. Recommendation Feedback
  const [recommendationFeedback] = useState([
    {
      id: "FB-01",
      studentName: "Angelica Dela Cruz",
      intervention: "Alumni Scholarship Endorsement",
      rating: 5,
      comment: "Super helpful po! Na-clear agad yung exam permit ko at nakapag-aral ako nang walang kaba.",
      userType: "Student"
    },
    {
      id: "FB-02",
      studentName: "Joshua Dimaculangan",
      intervention: "Peer Tutoring with Kyle Mercado",
      rating: 4,
      comment: "Mas naiintindihan ko na po yung Pre-Calculus pag kapwa student nagpapaliwanag.",
      userType: "Student"
    }
  ]);

  // 16. Teacher Referrals
  const [teacherReferrals] = useState<TeacherReferralItem[]>([
    {
      id: "REF-001",
      student_id: 1,
      student_name: "Joshua Dimaculangan",
      lrn: "109238475001",
      section: "Grade 11 - STEM (St. Augustine)",
      referring_teacher: "Mr. Roberto Santos, LPT",
      concern_type: "Academic Deterioration & Multiple Failing Marks",
      urgency: "crisis",
      observations: "Student missed 11 classes this quarter and broke down in tears during Pre-Calculus midterm exam.",
      attempted_interventions: ["1-on-1 Teacher-Student Conference", "Peer Tutoring Assigned"],
      created_at: "2026-09-18 14:30",
      status: "pending_review"
    },
    {
      id: "REF-002",
      student_id: 4,
      student_name: "Samantha Nicole Reyes",
      lrn: "109238475004",
      section: "Grade 11 - HUMSS (St. Thomas)",
      referring_teacher: "Mrs. Clara Buenaflor, LPT",
      concern_type: "Prolonged Unexcused Absences & Family Distress",
      urgency: "priority",
      observations: "Student reports staying awake late due to family crisis at home. Incomplete requirements.",
      attempted_interventions: ["Adviser Phone Call to Guardian"],
      created_at: "2026-09-16 09:15",
      status: "in_progress"
    }
  ]);

  // 17. Counseling Sessions Schedule
  const [sessionsList, setSessionsList] = useState<CounselingSessionItem[]>([
    {
      id: "SESS-101",
      student_id: 1,
      student_name: "Joshua Dimaculangan",
      date: "Today, 10:30 AM",
      time: "10:30 AM - 11:15 AM",
      type: "1-on-1 Crisis Check-in",
      status: "Confirmed",
      room: "Guidance Consultation Room A",
      notes: "Follow-up on GAD-7 score and test anxiety coping strategies."
    },
    {
      id: "SESS-102",
      student_id: 4,
      student_name: "Samantha Nicole Reyes",
      date: "Today, 02:00 PM",
      time: "02:00 PM - 03:00 PM",
      type: "Parent-Student Case Conference",
      status: "Confirmed",
      room: "Guidance Conference Room",
      notes: "Attendance contract signing with guardian and class adviser."
    },
    {
      id: "SESS-103",
      student_id: 7,
      student_name: "Christian Dave Villanueva",
      date: "Tomorrow, 09:00 AM",
      time: "09:00 AM - 09:45 AM",
      type: "Academic Anxiety Counseling",
      status: "Pending Acknowledgment",
      room: "Guidance Consultation Room B",
      notes: "Working student schedule load re-balancing consultation."
    }
  ]);
  const [newSessionStudentId, setNewSessionStudentId] = useState<number>(1);
  const [newSessionType, setNewSessionType] = useState<string>("1-on-1 Crisis Check-in");
  const [newSessionTime, setNewSessionTime] = useState<string>("11:00 AM");

  // 20. Notifications Feed
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Urgent NLP Crisis Flag", desc: "Joshua Dimaculangan triggered crisis keyword detection via AI chatbot.", time: "2 hours ago", unread: true, type: "crisis" },
    { id: 2, title: "Teacher Referral Submitted", desc: "Mr. Roberto Santos referred Christian Dave Villanueva for Chemistry failure.", time: "4 hours ago", unread: true, type: "referral" },
    { id: 3, title: "Parent Acknowledgment Received", desc: "Mrs. Reyes confirmed attendance for 2:00 PM case conference.", time: "5 hours ago", unread: false, type: "parent" },
    { id: 4, title: "Intervention Milestone Logged", desc: "Angelica Dela Cruz completed Alumni Foundation grant clearance.", time: "Yesterday", unread: false, type: "intervention" }
  ]);

  // Navigation Syncing
  const handleTabChange = useCallback((tab: CounselorTabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        setStudents(getActiveStudentDataset());
      }
      const [analyticsRes, studentsRes] = await Promise.all([
        fetchWithAuth("/analytics/summary").catch(() => null),
        fetchWithAuth("/students").catch(() => null)
      ]);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (studentsRes && Array.isArray(studentsRes) && studentsRes.length > 0) {
        setStudents(studentsRes);
      }
    } catch (err) {
      console.warn("Using default counselor dataset:", err);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadData();

    if (typeof window !== "undefined") {
      const handleDatasetUpdated = () => {
        setStudents(getActiveStudentDataset());
      };
      window.addEventListener("sapc:dataset-updated", handleDatasetUpdated);

      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as CounselorTabType;
      if (urlTab) setActiveTab(urlTab);

      const handleCustomNav = (e: CustomEvent<{ tab?: CounselorTabType; hash?: string }>) => {
        if (e.detail?.tab) setActiveTab(e.detail.tab);
      };
      window.addEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
      return () => {
        window.removeEventListener("sapc:dataset-updated", handleDatasetUpdated);
        window.removeEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
      };
    }
  }, [loadData]);

  // Filtered Students Roster
  const filteredStudents = useMemo(() => {
    return students.filter((s: StudentRecord) => {
      const q = search.toLowerCase();
      const matchesSearch =
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.lrn.includes(search) ||
        (Boolean(s.section_name) && s.section_name.toLowerCase().includes(q));
      const matchesTier = filterTier === "all" || s.latest_risk_tier === filterTier;
      const matchesStrand = filterStrand === "all" || (s.strand && s.strand.toUpperCase() === filterStrand.toUpperCase());
      const matchesDomain = filterDomain === "all" || (s.primary_risk_driver && s.primary_risk_driver.toLowerCase().includes(filterDomain.toLowerCase()));
      const matchesSection = filterSection === "all" || s.section_name === filterSection;
      return matchesSearch && matchesTier && matchesStrand && matchesDomain && matchesSection;
    });
  }, [students, search, filterTier, filterStrand, filterDomain, filterSection]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Navigation Items
  const CATEGORIES = [
    { id: "all", label: "All Modules (20)" },
    { id: "crisis", label: "Crisis Response & Triage (3)", tabIds: ["dashboard", "crisis_alerts", "crisis_detail"] },
    { id: "casework", label: "Student Profiles & Screenings (5)", tabIds: ["students", "student_profile", "student_progress", "chat_history", "assessments"] },
    { id: "care", label: "Interventions & Approvals (5)", tabIds: ["interventions", "intervention_detail", "intervention_approvals", "risk_reviews", "intervention_analytics"] },
    { id: "collab", label: "Referrals & Sessions (4)", tabIds: ["validate_recommendations", "recommendation_feedback", "referrals", "sessions"] },
    { id: "insights", label: "Analytics & Reports (3)", tabIds: ["analytics", "reports", "notifications"] }
  ];

  const TAB_ITEMS: Array<{ id: CounselorTabType; label: string; icon: any; badge?: string; category: string }> = [
    { id: "dashboard", label: "Command Center", icon: Brain, badge: "Live", category: "crisis" },
    { id: "crisis_alerts", label: "Crisis Alerts Queue", icon: AlertTriangle, badge: `${flaggedSessions.filter(f => f.severity === "urgent").length} Urgent`, category: "crisis" },
    { id: "crisis_detail", label: "Crisis Case Deep-Dive", icon: ShieldAlert, category: "crisis" },
    { id: "students", label: "Student Registry", icon: Users, badge: `${students.length}`, category: "casework" },
    { id: "student_profile", label: "Counselor Case File", icon: UserCheck, category: "casework" },
    { id: "student_progress", label: "Longitudinal Progress", icon: TrendingUp, category: "casework" },
    { id: "chat_history", label: "Consented Chat Logs", icon: MessageSquare, category: "casework" },
    { id: "assessments", label: "PHQ-9 / GAD-7 Screenings", icon: Activity, badge: "Standardized", category: "casework" },
    { id: "interventions", label: "Master Care Plans", icon: ShieldCheck, badge: `${interventions.filter(i => i.status === "Active" || i.status === "in_progress").length}`, category: "care" },
    { id: "intervention_detail", label: "Intervention Record", icon: FileText, category: "care" },
    { id: "intervention_approvals", label: "Proposed Approvals", icon: CheckCircle2, badge: `${proposedInterventions.length}`, category: "care" },
    { id: "risk_reviews", label: "Risk Adjustment Reviews", icon: Sliders, badge: `${riskReviews.length}`, category: "care" },
    { id: "intervention_analytics", label: "Intervention Analytics", icon: BarChart3, category: "care" },
    { id: "validate_recommendations", label: "Validate Recommendations", icon: Sparkles, category: "collab" },
    { id: "recommendation_feedback", label: "Feedback Loop", icon: ThumbsUp, category: "collab" },
    { id: "referrals", label: "Faculty Referrals", icon: HeartHandshake, badge: `${teacherReferrals.length}`, category: "collab" },
    { id: "sessions", label: "Counseling Schedule", icon: Calendar, badge: `${sessionsList.length}`, category: "collab" },
    { id: "analytics", label: "5-Domain Cohort Analytics", icon: TrendingUp, category: "insights" },
    { id: "reports", label: "DepEd / CHED Reports", icon: Award, category: "insights" },
    { id: "notifications", label: "Alerts & Messages", icon: Bell, badge: `${notifications.filter(n => n.unread).length}`, category: "insights" }
  ];

  const visibleTabs = selectedNavCategory === "all"
    ? TAB_ITEMS
    : TAB_ITEMS.filter(t => t.category === selectedNavCategory);

  const selectedStudentObj = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const selectedIntervention = useMemo(() => {
    return interventions.find(i => i.student_id === selectedStudentId) || interventions[0];
  }, [interventions, selectedStudentId]);

  const handleSelectSectionFromAnalytics = (sectionName: string) => {
    setFilterSection(sectionName);
    setActiveTab("students");
  };

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

  return (
    <div className="space-y-5 sm:space-y-7 pb-16 font-sans w-full max-w-full overflow-hidden px-1 sm:px-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Top Banner - Institutional Maroon & Gold (Tablet & Mobile Optimized) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-5 sm:p-7 md:p-8 shadow-md text-white border-t-4 border-amber-400">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-amber-300" />
                San Antonio de Padua College
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• Guidance &amp; Counseling Central</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Guidance Counselor Command &amp; Triage Portal
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-rose-50/95 leading-relaxed font-normal">
              Empowering proactive multi-domain failure prevention with AI crisis detection, psychometric screening analytics (PHQ-9/GAD-7), and validated intervention casework.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 xl:pt-0">
            <button
              onClick={() => setShowIngestionHub((prev) => !prev)}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 ${
                showIngestionHub 
                  ? "bg-amber-400 text-amber-950 ring-2 ring-white" 
                  : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
              }`}
            >
              <Layers className="h-4 w-4 text-amber-300" />
              <span>{showIngestionHub ? "Close Ingestion Hub" : "Multi-Domain Data Hub"}</span>
            </button>

            <button
              onClick={() => exportActiveDatasetToCSV(students, "Guidance_Active_Cohort_Dataset.csv")}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2"
              title="Export complete 5-domain cohort dataset to CSV"
            >
              <Download className="h-4 w-4 text-amber-300" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Award className="h-4 w-4 text-[#8B0014]" />
              <span>DepEd / CHED Report</span>
            </button>

            <div className="bg-black/35 backdrop-blur-md border border-white/25 rounded-2xl p-3 sm:p-4 text-center shadow-lg min-w-[130px]">
              <span className="text-[10px] sm:text-xs text-amber-200 font-extrabold uppercase tracking-wider block">Cohort Risk Avg</span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#FBBF24] mt-0.5">
                {cohortStats.avgRiskScore ? Number(cohortStats.avgRiskScore).toFixed(1) : "0.0"}
                <span className="text-xs font-bold text-slate-300 ml-1">/ 100</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Domain Ingestion Hub Section */}
      {showIngestionHub && (
        <div id="data-ingestion-hub" className="scroll-mt-24 transition-all duration-300">
          <MultiDomainIngestionHub defaultDomain="mental_health" onSuccess={loadData} />
        </div>
      )}

      {/* Analytics KPI Metric Cards (Tablet & Mobile Friendly Grid) */}
      <div id="triage-overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 scroll-mt-24">
        {/* Total Monitored */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Total Monitored</span>
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-none">{cohortStats.total}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">Students</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Across all SAPC grade levels</span>
        </div>

        {/* High Risk */}
        <div className="bg-white border-2 border-rose-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-rose-700 uppercase tracking-wider">High Risk (70-100)</span>
            <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-rose-600 leading-none">{cohortStats.highRiskCount}</span>
            <span className="text-xs sm:text-sm font-bold text-rose-700">({cohortStats.highRiskPct}%)</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-rose-700 font-bold">Requires Priority Care Plan</span>
        </div>

        {/* Medium Risk */}
        <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-amber-800 uppercase tracking-wider">Medium Risk (40-69.9)</span>
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#D97706] leading-none">{cohortStats.mediumRiskCount}</span>
            <span className="text-xs sm:text-sm font-bold text-amber-800">({cohortStats.mediumRiskPct}%)</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-amber-800 font-bold">Active Remediation Protocol</span>
        </div>

        {/* Low Risk */}
        <div className="bg-white border-2 border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-emerald-800 uppercase tracking-wider">Low Risk (0-39.9)</span>
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 leading-none">{cohortStats.lowRiskCount}</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-800">({cohortStats.lowRiskPct}%)</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold">Standard Guidance Tracking</span>
        </div>
      </div>

      {/* Navigation Hub: Category Switcher + Tabs */}
      <div className="space-y-2.5">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedNavCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedNavCategory(cat.id);
                  if (cat.id !== "all" && cat.tabIds && !cat.tabIds.includes(activeTab)) {
                    handleTabChange(cat.tabIds[0] as CounselorTabType);
                  }
                }}
                className={`min-h-[34px] px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  isCatActive
                    ? "bg-[#8B0014] text-white shadow-2xs ring-2 ring-rose-200"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Mobile / Tablet Quick Select Dropdown */}
        <div className="block xl:hidden bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
            Current Counselor Module:
          </label>
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value as CounselorTabType)}
              className="w-full min-h-[44px] p-2.5 pr-10 rounded-xl border border-slate-300 bg-slate-50 font-bold text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
            >
              {TAB_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} {item.badge ? `(${item.badge})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Categorized Navigation Tabs Bar (Scrollable Pill Strip on Desktop/Tablet) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs font-bold">
            {visibleTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
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
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. COMMAND CENTER (dashboard) */}
      {/* ========================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Urgent Crisis Triage Action Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-rose-900 to-rose-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border-2 border-rose-500/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 animate-ping" />
                  <h3 className="text-lg sm:text-xl font-black text-white">Live NLP Crisis Detection Alerts</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/30 border border-rose-400/50 text-xs font-black text-rose-200">
                  {flaggedSessions.filter(f => f.severity === "urgent").length} Urgent Cases Awaiting Intake
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                Chatbot natural language processing flags distress keywords in real time. Counselors can immediately inspect transcripts, launch care plans, or summon emergency parent conferences.
              </p>

              <div className="space-y-3 pt-2">
                {flaggedSessions.map((alert) => (
                  <div key={alert.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          alert.severity === "urgent" ? "bg-rose-500 text-white" : "bg-amber-400 text-slate-900"
                        }`}>
                          {alert.severity}
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-white">{alert.student_name}</h4>
                        <span className="text-xs text-rose-200">({alert.grade_section})</span>
                      </div>
                      <p className="text-xs text-rose-100/80 font-mono">Keyword: &quot;{alert.keyword_detected}&quot;</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setSelectedStudentId(alert.student_id);
                          handleTabChange("crisis_detail");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white text-rose-950 font-extrabold text-xs hover:bg-rose-100 transition shadow-xs"
                      >
                        Deep Dive
                      </button>
                      <button
                        onClick={() => {
                          const targetStudent = students.find(s => s.id === alert.student_id) || students[0];
                          setInterventionStudent(targetStudent);
                          setIsInterventionOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-extrabold text-xs hover:bg-amber-300 transition shadow-xs"
                      >
                        + Care Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Scheduled Sessions Widget */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#8B0014]" />
                  Today&apos;s Sessions ({sessionsList.length})
                </h3>
                <button
                  onClick={() => handleTabChange("sessions")}
                  className="text-xs font-bold text-[#8B0014] hover:underline"
                >
                  Manage All →
                </button>
              </div>

              <div className="space-y-3">
                {sessionsList.slice(0, 3).map((sess) => (
                  <div key={sess.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">{sess.student_name}</span>
                      <span className="text-[11px] font-bold text-[#8B0014]">{sess.time}</span>
                    </div>
                    <p className="text-xs text-slate-600">{sess.type}</p>
                    <span className="text-[10px] text-slate-400 block">{sess.room}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleTabChange("assessments")}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-between"
                >
                  <span>Review Clinical Assessments (PHQ-9)</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => handleTabChange("intervention_approvals")}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-between"
                >
                  <span>Pending Intervention Approvals ({proposedInterventions.length})</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Roster Triage Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Highest Priority Student Cases</h3>
                <p className="text-xs sm:text-sm text-slate-500">Students with highest AHP composite risk scores needing immediate counselor check-in</p>
              </div>
              <button
                onClick={() => handleTabChange("students")}
                className="px-4 py-2 rounded-xl bg-[#8B0014] text-white text-xs font-bold hover:bg-[#6D0010] transition self-start sm:self-auto"
              >
                View Full Student Registry ({students.length}) →
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-600">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">LRN</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">AHP Risk</th>
                    <th className="py-3 px-4">Primary Factor</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.first_name} {s.last_name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{s.lrn}</td>
                      <td className="py-3 px-4 text-xs text-slate-700">{s.section_name}</td>
                      <td className="py-3 px-4"><RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="sm" /></td>
                      <td className="py-3 px-4 text-xs font-semibold text-amber-800">{s.primary_risk_driver || "Academic"}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            setIsDetailOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#8B0014] text-white text-xs font-bold"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            handleTabChange("student_profile");
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200"
                        >
                          Case File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CRISIS ALERTS QUEUE (crisis_alerts) */}
      {/* ========================================================= */}
      {activeTab === "crisis_alerts" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <AlertTriangle className="h-6 w-6 text-rose-600" />
                  Real-Time NLP Crisis Notifications &amp; Triage Queue
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Color-coded crisis flags: Red (Urgent / Suicidal Ideation), Orange (Moderate / Self-Harm), Yellow (Watchlist)
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsAudioAlertsEnabled(prev => !prev);
                    showToast(!isAudioAlertsEnabled ? "Audio Chime Alerts Enabled" : "Audio Chime Alerts Muted");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                    isAudioAlertsEnabled 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                      : "bg-slate-100 text-slate-500 border-slate-300"
                  }`}
                  title="Toggle Audio Notifications for Urgent Distress Flags"
                >
                  {isAudioAlertsEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-600" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
                  <span>{isAudioAlertsEnabled ? "Audio Chime On" : "Muted"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTone("crisis");
                    showToast("Playing Level 1 Crisis Audio Synthesizer Chime");
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 transition flex items-center gap-1 cursor-pointer"
                  title="Test Urgent Audio Chime"
                >
                  Test Alarm 🚨
                </button>

                <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-extrabold text-xs">
                  {flaggedSessions.length} Monitored Alerts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {flaggedSessions.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-3xl border-2 transition space-y-3.5 flex flex-col justify-between ${
                    alert.severity === "urgent"
                      ? "bg-rose-50/50 border-rose-300 hover:border-rose-400"
                      : alert.severity === "moderate"
                      ? "bg-amber-50/50 border-amber-300 hover:border-amber-400"
                      : "bg-yellow-50/50 border-yellow-300 hover:border-yellow-400"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        alert.severity === "urgent"
                          ? "bg-rose-600 text-white"
                          : alert.severity === "moderate"
                          ? "bg-amber-500 text-white"
                          : "bg-yellow-500 text-slate-950"
                      }`}>
                        {alert.severity} Priority
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Distress: {alert.aggregate_distress_score}/100
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">{alert.student_name}</h4>
                    <p className="text-xs text-slate-600 font-medium">{alert.grade_section}</p>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Trigger Phrase Detected:</span>
                      <p className="font-mono text-rose-800 font-bold">&quot;{alert.keyword_detected}&quot;</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {alert.flag_reason}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Consent: <strong className="text-emerald-700">{alert.consent_status}</strong></span>
                      <span>Prev Alerts: {alert.previous_flags_count}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setSelectedStudentId(alert.student_id);
                          handleTabChange("crisis_detail");
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition text-center"
                      >
                        Deep Dive Case
                      </button>
                      <button
                        onClick={() => {
                          const targetStudent = students.find(s => s.id === alert.student_id) || students[0];
                          setInterventionStudent(targetStudent);
                          setIsInterventionOpen(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-[#8B0014] text-white text-xs font-bold hover:bg-[#6D0010] transition text-center"
                      >
                        + Care Plan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CRISIS ALERT DETAIL (crisis_detail) */}
      {/* ========================================================= */}
      {activeTab === "crisis_detail" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <button
                  onClick={() => handleTabChange("crisis_alerts")}
                  className="text-xs font-bold text-slate-500 hover:text-[#8B0014] mb-2 flex items-center gap-1"
                >
                  ← Back to Crisis Alerts Queue
                </button>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-rose-600" />
                  Crisis Incident Case File: {selectedAlert.student_name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">{selectedAlert.grade_section} • Incident ID #{selectedAlert.id}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const st = students.find(s => s.id === selectedAlert.student_id) || students[0];
                    setParentAlertStudent(st);
                    setIsParentAlertOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 transition flex items-center gap-1.5"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Notify Parent / Guardian</span>
                </button>
                <button
                  onClick={() => {
                    const st = students.find(s => s.id === selectedAlert.student_id) || students[0];
                    setInterventionStudent(st);
                    setIsInterventionOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8B0014] text-white text-xs font-bold hover:bg-[#6D0010] transition"
                >
                  Launch Immediate Protocol
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Full Transcript */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">Consented Chatbot Context &amp; NLP Transcript</h4>
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-line leading-relaxed border border-slate-800">
                  {selectedAlert.transcript_snippet}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">Timeline of Response Actions</h4>
                  <div className="space-y-2">
                    {selectedAlert.actions_taken.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student Risk Profile & Family Contacts */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">Emergency Case Overview</h4>
                
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Distress Level:</span>
                    <span className="font-extrabold text-rose-700">{selectedAlert.aggregate_distress_score} / 100 ({selectedAlert.severity})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Consent Status:</span>
                    <span className="font-bold text-emerald-700">{selectedAlert.consent_status}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Family Contact:</span>
                    <span className="font-bold text-slate-900">{selectedAlert.family_phone}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Previous Flags:</span>
                    <span className="font-bold text-slate-900">{selectedAlert.previous_flags_count} incidents</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Detected At:</span>
                    <span className="font-bold text-slate-900">{new Date(selectedAlert.started_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedStudentId(selectedAlert.student_id);
                      handleTabChange("student_profile");
                    }}
                    className="w-full py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-100 transition text-center shadow-2xs"
                  >
                    View Comprehensive Student Case File →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. STUDENTS REGISTRY (students) */}
      {/* ========================================================= */}
      {activeTab === "students" && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name, LRN, section..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#8B0014]"
                />
              </div>

              <select
                value={filterTier}
                onChange={(e) => {
                  setFilterTier(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold"
              >
                <option value="all">All Risk Tiers</option>
                <option value="high">High Risk (70-100)</option>
                <option value="medium">Medium Risk (40-69.9)</option>
                <option value="low">Low Risk (0-39.9)</option>
              </select>

              <select
                value={filterStrand}
                onChange={(e) => {
                  setFilterStrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold"
              >
                <option value="all">All Strands</option>
                <option value="STEM">STEM</option>
                <option value="HUMSS">HUMSS</option>
                <option value="ABM">ABM</option>
                <option value="TVL">TVL</option>
                <option value="JHS">Junior High</option>
              </select>

              <select
                value={filterDomain}
                onChange={(e) => {
                  setFilterDomain(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold"
              >
                <option value="all">All Risk Domains</option>
                <option value="Academic">Academic (30%)</option>
                <option value="Family">Family (20%)</option>
                <option value="Health">Physical Health (20%)</option>
                <option value="Mental">Mental Health (15%)</option>
                <option value="Financial">Financial (15%)</option>
              </select>
            </div>

            {(filterTier !== "all" || filterStrand !== "all" || filterDomain !== "all" || filterSection !== "all" || search) && (
              <button
                onClick={() => {
                  setFilterTier("all");
                  setFilterStrand("all");
                  setFilterDomain("all");
                  setFilterSection("all");
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="text-xs text-[#8B0014] font-bold hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Student Roster Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-600">
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">LRN</th>
                    <th className="py-3.5 px-4">Section / Adviser</th>
                    <th className="py-3.5 px-4">AHP Composite Risk</th>
                    <th className="py-3.5 px-4">Primary Factor</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                        No students match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{s.first_name} {s.last_name}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{s.lrn}</td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="font-semibold text-slate-900 block">{s.section_name}</span>
                          <span className="text-[11px] text-slate-500">{s.adviser_name}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="md" />
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-amber-900">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                            {s.primary_risk_driver || "Academic"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudentId(s.id);
                              setIsDetailOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition"
                          >
                            Modal View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudentId(s.id);
                              handleTabChange("student_profile");
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition"
                          >
                            Counselor File
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-600 font-medium">
                Showing {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-bold px-2">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. STUDENT PROFILE (student_profile) */}
      {/* ========================================================= */}
      {activeTab === "student_profile" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#8B0014] text-white font-black text-xl flex items-center justify-center">
                  {selectedStudentObj.first_name[0]}{selectedStudentObj.last_name[0]}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {selectedStudentObj.first_name} {selectedStudentObj.last_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    LRN: {selectedStudentObj.lrn} • {selectedStudentObj.section_name} • Adviser: {selectedStudentObj.adviser_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTabChange("student_progress")}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Track Longitudinal Progress →
                </button>
                <button
                  onClick={() => {
                    setInterventionStudent(selectedStudentObj);
                    setIsInterventionOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8B0014] text-white text-xs font-bold hover:bg-[#6D0010] transition"
                >
                  + Add Intervention
                </button>
              </div>
            </div>

            {/* 5-Domain AHP Breakdown for Selected Student */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-black uppercase text-blue-800 block">Academic (30%)</span>
                <p className="text-lg font-black text-blue-950 mt-1">74.2 / 100</p>
                <span className="text-[10px] text-blue-700">Pre-Calc / Chem alert</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-black uppercase text-amber-800 block">Family (20%)</span>
                <p className="text-lg font-black text-amber-950 mt-1">38.0 / 100</p>
                <span className="text-[10px] text-amber-700">Moderate support</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] font-black uppercase text-rose-800 block">Physical Health (20%)</span>
                <p className="text-lg font-black text-rose-950 mt-1">45.0 / 100</p>
                <span className="text-[10px] text-rose-700">Sleep deprivation</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] font-black uppercase text-purple-800 block">Mental Health (15%)</span>
                <p className="text-lg font-black text-purple-950 mt-1">82.0 / 100</p>
                <span className="text-[10px] text-purple-700">PHQ-9: 14 (Moderate)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-black uppercase text-emerald-800 block">Financial (15%)</span>
                <p className="text-lg font-black text-emerald-950 mt-1">20.0 / 100</p>
                <span className="text-[10px] text-emerald-700">Regular standing</span>
              </div>
            </div>

            {/* Assessment Records & History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#8B0014]" />
                  Standardized Screenings Recorded
                </h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">PHQ-9 Depression Screener</p>
                      <span className="text-[11px] text-slate-500">Taken: Sep 12, 2026</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-black">Score: 14 (Moderate)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">GAD-7 Anxiety Index</p>
                      <span className="text-[11px] text-slate-500">Taken: Sep 12, 2026</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-black">Score: 16 (Severe)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">Perceived Stress Scale (PSS-10)</p>
                      <span className="text-[11px] text-slate-500">Taken: Aug 28, 2026</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-950 font-black">Score: 24 (High)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#8B0014]" />
                  Counseling Notes &amp; Consented Disclosures
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p className="font-bold text-slate-900">Clinical Impression by Maria Theresa Cruz, RGC:</p>
                  <p>
                    Student demonstrates high cognitive potential but exhibits acute performance anxiety during STEM examinations. Family expectations as first-generation college applicant create significant internal pressure.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleTabChange("chat_history")}
                      className="text-xs font-bold text-[#8B0014] hover:underline"
                    >
                      Inspect Consented AI Chat Logs →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. STUDENT PROGRESS (student_progress) */}
      {/* ========================================================= */}
      {activeTab === "student_progress" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-[#8B0014]" />
                  Longitudinal 4-Quarter Risk Trajectory &amp; Intervention Delta
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Case: {selectedStudentObj.first_name} {selectedStudentObj.last_name} ({selectedStudentObj.section_name})
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                Post-Intervention Delta: -16.4% Risk
              </span>
            </div>

            {/* 4-Quarter Trajectory Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500 block">Q1 Historical</span>
                <p className="text-2xl font-black text-slate-900 mt-1">82.4</p>
                <span className="text-[10px] font-bold text-rose-700">Initial High Risk</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-black uppercase text-amber-800 block">Q2 Current</span>
                <p className="text-2xl font-black text-[#D97706] mt-1">66.0</p>
                <span className="text-[10px] font-bold text-amber-800">Peer Tutoring Active</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-black uppercase text-emerald-800 block">Q3 Projected</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">48.5</p>
                <span className="text-[10px] font-bold text-emerald-700">Target Low Risk</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-black uppercase text-blue-800 block">Q4 Projected</span>
                <p className="text-2xl font-black text-blue-900 mt-1">32.0</p>
                <span className="text-[10px] font-bold text-blue-700">Full Stabilization</span>
              </div>
            </div>

            {/* Interactive Multi-Modal Data Visualizer */}
            <AHPDataVisualizer 
              studentName={`${selectedStudentObj.first_name} ${selectedStudentObj.last_name}`}
              domainScores={{
                academic: selectedStudentObj.domain_scores?.academic ?? 28.5,
                family: selectedStudentObj.domain_scores?.family ?? 18.0,
                health: selectedStudentObj.domain_scores?.health ?? 16.5,
                mental: selectedStudentObj.domain_scores?.mental_health ?? 14.0,
                financial: selectedStudentObj.domain_scores?.financial ?? 12.0
              }}
            />

            {/* Effectiveness Analysis Narrative */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
              <h4 className="font-extrabold text-sm text-slate-900">Intervention Effectiveness Evaluation:</h4>
              <p>
                Following the implementation of peer tutoring with Kyle Mercado and 2 counseling sessions on testing anxiety, the student&apos;s academic distress component decreased by 18.2 points, while GAD-7 anxiety dropped from 16 to 11.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CHAT HISTORY (chat_history) */}
      {/* ========================================================= */}
      {activeTab === "chat_history" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-[#8B0014]" />
                  Consented AI Chatbot Disclosures &amp; Emotional Pattern History
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Explicit RA 10173 consent verified for Guidance Counselor session preparation
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                Student Consent Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Emotion Trends */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black uppercase text-slate-600">Emotional Frequency Analysis</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Academic Overwhelm</span>
                    <strong className="text-rose-700">45%</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full w-[45%]" />
                  </div>

                  <div className="flex justify-between pt-2">
                    <span>Sleep Anxiety</span>
                    <strong className="text-amber-700">30%</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[30%]" />
                  </div>

                  <div className="flex justify-between pt-2">
                    <span>Family Expectations</span>
                    <strong className="text-purple-700">25%</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-[25%]" />
                  </div>
                </div>
              </div>

              {/* Chat Log Preview */}
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-600">Filtered Sensitive Conversational Extracts</h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <strong className="text-slate-800">Student: Joshua Dimaculangan</strong>
                      <span>Sep 18, 2026 - 11:22 PM</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      &quot;Hindi ko alam paano sasabihin sa parents ko na bumagsak ako sa Chem exam. Baka hindi na nila ako suportahan sa STEM.&quot;
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                    <div className="flex justify-between text-[11px] text-rose-800">
                      <strong className="text-[#8B0014]">AI Bot System Response:</strong>
                      <span>Sep 18, 2026 - 11:23 PM</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      &quot;Likas na matakot Joshua, pero isang exam lang ito at marami pang pagkakataon bumawi. Gusto mo ba tulungan kitang mag-prepare paano ito kakausapin sa guidance counselor?&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. ASSESSMENTS (assessments) */}
      {/* ========================================================= */}
      {activeTab === "assessments" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-[#8B0014]" />
                  Standardized Psychometric Screeners (PHQ-9, GAD-7, PSS)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Scored and clinically interpreted results with diagnostic interpretation guides
                </p>
              </div>
              <button
                onClick={() => showToast("Exporting clinical screener dataset to CSV...")}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Export Screeners</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <h4 className="font-black text-rose-950 text-sm">PHQ-9 Depression Screener</h4>
                <p className="text-xs text-rose-800 font-medium">Cohort Positive Rate: 4.8% (24 students requiring clinical evaluation)</p>
                <span className="text-[11px] text-slate-600 block">Interpretation: Score 0-4 None, 5-9 Mild, 10-14 Moderate, 15-19 Moderately Severe, 20-27 Severe.</span>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="font-black text-amber-950 text-sm">GAD-7 Anxiety Scale</h4>
                <p className="text-xs text-amber-800 font-medium">Cohort Positive Rate: 8.2% (41 students experiencing academic anxiety)</p>
                <span className="text-[11px] text-slate-600 block">Interpretation: Score 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-21 Severe Anxiety.</span>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <h4 className="font-black text-purple-950 text-sm">Perceived Stress (PSS-10)</h4>
                <p className="text-xs text-purple-800 font-medium">High Stress Index: 12.0% in Senior High STEM/HUMSS</p>
                <span className="text-[11px] text-slate-600 block">Interpretation: Score 0-13 Low, 14-26 Moderate, 27-40 High Perceived Stress.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. INTERVENTIONS MASTER (interventions) */}
      {/* ========================================================= */}
      {activeTab === "interventions" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-[#8B0014]" />
                  Master Intervention Caseload Tracker ({interventions.length})
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Active care plans, multi-stakeholder assignments, and resolution statuses
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const st = students.find(s => s.latest_risk_tier === "high") || students[0];
                    setInterventionStudent(st);
                    setIsInterventionOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#8B0014] text-white font-extrabold text-xs sm:text-sm hover:bg-[#6D0010] transition flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>+ Create Care Plan</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {interventions.map((plan) => (
                <div key={plan.id} className="p-5 sm:p-6 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-3.5 hover:shadow-md transition flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-base text-slate-900">{plan.student_name}</h4>
                        <span className="text-xs text-[#8B0014] font-bold">{plan.target_domain}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                        plan.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{plan.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{plan.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Counselor: <strong className="text-slate-800">{plan.assigned_counselor}</strong></span>
                    <button
                      onClick={() => {
                        setSelectedStudentId(plan.student_id);
                        handleTabChange("intervention_detail");
                      }}
                      className="font-bold text-[#8B0014] hover:underline"
                    >
                      View Record →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. INTERVENTION DETAIL (intervention_detail) */}
      {/* ========================================================= */}
      {activeTab === "intervention_detail" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <button
                  onClick={() => handleTabChange("interventions")}
                  className="text-xs font-bold text-slate-500 hover:text-[#8B0014] mb-2 flex items-center gap-1"
                >
                  ← Back to Master Interventions
                </button>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Intervention Documentation Record: {selectedIntervention?.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">Student: {selectedIntervention?.student_name} • Domain: {selectedIntervention?.target_domain}</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                Status: {selectedIntervention?.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">Goals &amp; Milestones</h4>
                <p className="leading-relaxed">{selectedIntervention?.goals}</p>
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">Assigned Counselor:</span>
                  <p className="font-bold text-slate-900">{selectedIntervention?.assigned_counselor}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">Clinical Session Notes &amp; Observations</h4>
                <p className="leading-relaxed">{selectedIntervention?.session_notes}</p>
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">Outcome Effectiveness Rating:</span>
                  <p className="font-bold text-amber-600">★ ★ ★ ★ ☆ ({selectedIntervention?.outcome_rating} / 5)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. INTERVENTION APPROVALS (intervention_approvals) */}
      {/* ========================================================= */}
      {activeTab === "intervention_approvals" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-[#8B0014]" />
                  Proposed Interventions Approval Queue
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Review, approve, or modify proposed intervention plans submitted by class advisers and parents
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-extrabold text-xs">
                {proposedInterventions.length} Awaiting Counselor Review
              </span>
            </div>

            <div className="space-y-4">
              {proposedInterventions.map((prop) => (
                <div key={prop.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-black">{prop.id}</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{prop.studentName}</h4>
                      <span className="text-xs text-slate-500">by {prop.proposedBy}</span>
                    </div>
                    <p className="text-xs font-bold text-[#8B0014]">{prop.type}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{prop.rationale}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setProposedInterventions(prev => prev.filter(p => p.id !== prop.id));
                        showToast(`Approved intervention proposal for ${prop.studentName}`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      ✓ Approve Plan
                    </button>
                    <button
                      onClick={() => showToast(`Opening feedback dialog for ${prop.studentName}`)}
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                    >
                      Modify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. RISK ADJUSTMENT REVIEWS (risk_reviews) */}
      {/* ========================================================= */}
      {activeTab === "risk_reviews" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="h-6 w-6 text-[#8B0014]" />
                  Risk Score Adjustment &amp; De-escalation Reviews
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Validate teacher-proposed risk score de-escalations based on documented remediation evidence
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-extrabold text-xs">
                {riskReviews.length} De-escalation Proposals
              </span>
            </div>

            <div className="space-y-4">
              {riskReviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{rev.studentName}</h4>
                      <p className="text-xs text-slate-500">Proposed by: {rev.proposedBy}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="text-rose-700 font-black">Current: {rev.currentScore} ({rev.currentTier})</span>
                      <span>→</span>
                      <span className="text-emerald-700 font-black">Proposed: {rev.proposedScore} ({rev.proposedTier})</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-500">Documented Evidence:</span>
                    <p className="text-slate-700">{rev.evidence}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setRiskReviews(prev => prev.filter(r => r.id !== rev.id));
                        showToast(`Validated and applied risk de-escalation for ${rev.studentName}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition"
                    >
                      Validate &amp; Lower Risk Score
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. INTERVENTION ANALYTICS (intervention_analytics) */}
      {/* ========================================================= */}
      {activeTab === "intervention_analytics" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-[#8B0014]" />
                  Intervention Effectiveness &amp; Success Rate Metrics
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Data-driven insights on intervention types, resolution durations, and risk tier reductions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500">Average Resolution Time</span>
                <p className="text-3xl font-black text-slate-900">14.2 Days</p>
                <span className="text-[11px] text-emerald-600 font-bold">↓ 3.1 days faster than last term</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500">Peer Tutoring Success Rate</span>
                <p className="text-3xl font-black text-emerald-600">92.4%</p>
                <span className="text-[11px] text-slate-600">Grade recovery above 78.0</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500">Counseling Retention Impact</span>
                <p className="text-3xl font-black text-[#8B0014]">98.6%</p>
                <span className="text-[11px] text-slate-600">Enrolled without dropout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 14. VALIDATE RECOMMENDATIONS (validate_recommendations) */}
      {/* ========================================================= */}
      {activeTab === "validate_recommendations" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                  Validate AHP-Generated Recommendations (Quality Control)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Review machine-recommended actions before releasing them to student and adviser dashboards
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {ahpRecommendations.map((rec) => (
                <div key={rec.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-black text-[10px]">{rec.domain}</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{rec.studentName}</h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{rec.recommendation}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setAhpRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, approved: true } : r));
                        showToast(`Approved recommendation for ${rec.studentName}`);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        rec.approved ? "bg-emerald-100 text-emerald-800" : "bg-[#8B0014] text-white hover:bg-[#6D0010]"
                      }`}
                    >
                      {rec.approved ? "✓ Approved" : "Approve & Release"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 15. RECOMMENDATION FEEDBACK (recommendation_feedback) */}
      {/* ========================================================= */}
      {activeTab === "recommendation_feedback" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <ThumbsUp className="h-6 w-6 text-[#8B0014]" />
                  Stakeholder Recommendation Feedback Loop
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Continuous feedback from students and teachers on which interventions achieved desired outcomes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendationFeedback.map((fb) => (
                <div key={fb.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{fb.studentName}</h4>
                      <span className="text-[11px] text-slate-500">{fb.intervention}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-black text-xs">
                      ★ {fb.rating}.0 / 5.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200">
                    &quot;{fb.comment}&quot;
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 block text-right">Source: {fb.userType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 16. REFERRALS (referrals) */}
      {/* ========================================================= */}
      {activeTab === "referrals" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="h-6 w-6 text-[#8B0014]" />
                  Teacher-Submitted Faculty Referral Triage Queue
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Intake queue of behavioral, academic, and emotional concerns flagged by subject teachers and advisers
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-extrabold text-xs">
                {teacherReferrals.length} Pending Referrals
              </span>
            </div>

            <div className="space-y-4">
              {teacherReferrals.map((ref) => (
                <div key={ref.id} className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] uppercase">{ref.urgency}</span>
                        <h4 className="font-extrabold text-base text-slate-900">{ref.student_name}</h4>
                        <span className="text-xs text-slate-500">({ref.section})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Referred by: <strong>{ref.referring_teacher}</strong> on {ref.created_at}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs self-start sm:self-auto">
                      {ref.concern_type}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong>Teacher Observations:</strong> {ref.observations}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        const st = students.find(s => s.id === ref.student_id) || students[0];
                        setInterventionStudent(st);
                        setIsInterventionOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition"
                    >
                      Accept Referral &amp; Open Care Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 17. SESSIONS (sessions) */}
      {/* ========================================================= */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-[#8B0014]" />
                  Counseling Schedule &amp; Case Conference Manager
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Organize 1-on-1 crisis sessions, parent conferences, and attendance tracking
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={newSessionStudentId}
                  onChange={(e) => setNewSessionStudentId(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {students.slice(0, 20).map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
                <select
                  value={newSessionType}
                  onChange={(e) => setNewSessionType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="1-on-1 Crisis Check-in">1-on-1 Crisis Check-in</option>
                  <option value="Academic Anxiety Counseling">Academic Anxiety Counseling</option>
                  <option value="Family Care Conference">Family Care Conference</option>
                  <option value="Financial Aid Consultation">Financial Aid Consultation</option>
                </select>
                <input
                  type="text"
                  value={newSessionTime}
                  onChange={(e) => setNewSessionTime(e.target.value)}
                  placeholder="e.g. 11:00 AM"
                  className="px-3 py-2 w-28 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const student = students.find(s => s.id === newSessionStudentId) || students[0];
                    const newSess: CounselingSessionItem = {
                      id: `SESS-${Date.now()}`,
                      student_id: newSessionStudentId,
                      student_name: `${student.first_name} ${student.last_name}`,
                      date: "Today",
                      time: newSessionTime || "11:00 AM",
                      type: newSessionType as any,
                      status: "Confirmed",
                      room: "Guidance Consultation Room A",
                      notes: "Scheduled via Counselor Portal"
                    };
                    setSessionsList(prev => [newSess, ...prev]);
                    showToast("Session successfully booked and calendar invitation sent!");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#8B0014] text-white font-extrabold text-xs sm:text-sm hover:bg-[#6D0010] transition flex items-center gap-2 shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>+ Book Session</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sessionsList.map((sess) => (
                <div key={sess.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-black text-[11px]">{sess.time}</span>
                      <span className="text-xs font-bold text-emerald-700">{sess.status}</span>
                    </div>
                    <h4 className="font-extrabold text-base text-slate-900">{sess.student_name}</h4>
                    <p className="text-xs font-bold text-[#8B0014]">{sess.type}</p>
                    <p className="text-xs text-slate-500">{sess.room}</p>
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 mt-2">{sess.notes}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
                    <button
                      onClick={() => showToast(`Marked session ${sess.id} as completed`)}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      ✓ Mark Completed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 18. ANALYTICS (analytics) */}
      {/* ========================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-[#8B0014]" />
                  System-Wide 5-Domain Cohort Insights &amp; Vulnerability Matrix
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Aggregate distribution across Academic (30%), Family (20%), Health (20%), Mental Health (15%), and Financial (15%)
                </p>
              </div>
            </div>

            <CohortTrendAnalytics onSelectSection={handleSelectSectionFromAnalytics} />
            
            <div className="pt-4 border-t border-slate-100">
              <AHPDataVisualizer 
                studentName="Grade 10 & 11 Cohort (AHP Holistic Aggregate)"
                domainScores={{ academic: 28.2, family: 17.8, health: 16.1, mental: 13.9, financial: 11.5 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 19. REPORTS (reports) */}
      {/* ========================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Award className="h-6 w-6 text-[#8B0014]" />
                  Institutional DepEd &amp; CHED Compliance Report Generator
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Generate official student risk summaries, intervention outcomes, and program efficacy documents
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#8B0014] text-white">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">Standardized CSV Data Export</h4>
                    <p className="text-xs text-slate-500">Full 500-student multi-domain risk indicators &amp; scores</p>
                  </div>
                </div>
                <button
                  onClick={() => showToast("Downloading SAPC_Cohort_Risk_Report.csv...")}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition text-center"
                >
                  Download Complete CSV Spreadsheet
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-400 text-slate-950">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">DepEd Formatted PDF Summary</h4>
                    <p className="text-xs text-slate-500">Executive summary for school administration &amp; board</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition text-center"
                >
                  Launch Institutional PDF Report Generator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 20. NOTIFICATIONS (notifications) */}
      {/* ========================================================= */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Bell className="h-6 w-6 text-[#8B0014]" />
                  Counselor Real-Time Alert &amp; Message Feed
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  New crisis flags, teacher referrals, parent responses, and session updates
                </p>
              </div>
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                  showToast("All notifications marked as read");
                }}
                className="text-xs font-bold text-[#8B0014] hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    notif.unread ? "bg-rose-50/60 border-rose-200" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {notif.unread && <span className="w-2 h-2 rounded-full bg-rose-600" />}
                      <h4 className="font-extrabold text-sm text-slate-900">{notif.title}</h4>
                      <span className="text-[11px] text-slate-400">• {notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-600">{notif.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                    {notif.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Philippine Regulatory Safeguards Footer Bar (RA 10173 / RA 11036 / DepEd DO 40) */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-slate-300 p-4 sm:p-5 border border-slate-800 text-xs flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
              <span>National &amp; Institutional Governance Sealed</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                100% Compliant
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              RA 10173 (Data Privacy Act) • RA 11036 (Mental Health Act) • DepEd Order No. 40, s. 2012 (Child Protection Policy)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("sapc:toggle-command-palette"))}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/15"
          >
            <Search className="h-3.5 w-3.5 text-amber-400" />
            <span>Search / Defense Scenarios (Ctrl+K)</span>
          </button>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Mobile / Rapid Emergency Access */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => handleTabChange("crisis_alerts")}
          className="px-4 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 transition active:scale-95 border-2 border-amber-400"
          title="Jump to Crisis Triage Queue"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          <span>Crisis Queue ({flaggedSessions.filter(f => f.severity === "urgent").length})</span>
        </button>
      </div>

      {/* Modals */}
      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCreateIntervention={(s: any) => {
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
