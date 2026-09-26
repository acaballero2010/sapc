"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
  Award,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  GraduationCap,
  Sparkles,
  CheckCircle,
  FileText,
  Bell,
  HeartPulse,
  Info,
  ShieldAlert,
  Wallet,
  Home,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { SAPC_500_STUDENTS, StudentRecord } from "@/data/students500";
import { useDragScroll } from "@/lib/useDragScroll";
import { RiskBadge } from "./RiskBadge";
import { AHPDataVisualizer } from "./AHPDataVisualizer";
import { DepEdFormModal } from "./DepEdFormModal";
import { 
  getActiveStudentDataset, 
  updateStudentRecord, 
  getActiveInterventions, 
  getActiveNotifications, 
  scheduleCounselingSession, 
  addAppNotification, 
  AppNotification, 
  InterventionCarePlan 
} from "@/lib/dataset-store";

export type ParentTabType = 
  | "dashboard"
  | "child_progress"
  | "interventions"
  | "acknowledge_intervention"
  | "family_assessment"
  | "financial_assessment"
  | "crisis_alerts"
  | "schedule_meeting"
  | "academic_reports"
  | "attendance"
  | "wellness"
  | "notifications"
  | "resources"
  | "announcements"
  | "messages";

export const ParentDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ParentTabType>("dashboard");
  const [selectedNavCategory, setSelectedNavCategory] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasStudentConsent, setHasStudentConsent] = useState<boolean>(true);
  const [studentDataset, setStudentDataset] = useState<StudentRecord[]>(() => getActiveStudentDataset());
  const [interventionsList, setInterventionsList] = useState<InterventionCarePlan[]>(() => getActiveInterventions());
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>(() => getActiveNotifications());
  const [isDepEdFormOpen, setIsDepEdFormOpen] = useState(false);
  const catDrag = useDragScroll<HTMLDivElement>();
  const tabsDrag = useDragScroll<HTMLDivElement>();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pre-linked children for parent demo
  const LINKED_CHILDREN = useMemo(() => [
    {
      id: 1,
      name: "Joshua Dimaculangan",
      lrn: "109238475001",
      section: "Grade 11 - St. Augustine (STEM)",
      adviser: "Mr. Roberto Santos, LPT",
      counselor: "Maria Theresa Cruz, RGC",
      avatar: "JD"
    },
    {
      id: 4,
      name: "Samantha Nicole Reyes",
      lrn: "109238475004",
      section: "Grade 11 - St. Thomas (HUMSS)",
      adviser: "Mrs. Clara Buenaflor, LPT",
      counselor: "Maria Theresa Cruz, RGC",
      avatar: "SR"
    },
    {
      id: 3,
      name: "Angelica Dela Cruz",
      lrn: "109238475003",
      section: "Grade 11 - St. Clare (ABM)",
      adviser: "Mr. Roberto Santos, LPT",
      counselor: "Maria Theresa Cruz, RGC",
      avatar: "AD"
    }
  ], []);

  const currentChild = useMemo(() => {
    return studentDataset.find(s => s.id === selectedStudentId) || studentDataset[0] || SAPC_500_STUDENTS[0];
  }, [studentDataset, selectedStudentId]);

  const currentChildInfo = useMemo(() => {
    return LINKED_CHILDREN.find(c => c.id === selectedStudentId) || LINKED_CHILDREN[0];
  }, [LINKED_CHILDREN, selectedStudentId]);

  const childInterventions = useMemo(() => {
    return interventionsList.filter(i => i.student_id === selectedStudentId);
  }, [interventionsList, selectedStudentId]);

  const childNotifications = useMemo(() => {
    return notificationsList.filter(n => !n.student_id || n.student_id === selectedStudentId || n.audience === "all" || n.audience === "parent");
  }, [notificationsList, selectedStudentId]);

  // Categories for 15 Tabs
  const CATEGORIES = useMemo(() => [
    { id: "all", label: "All Parent Tools (15)" },
    { id: "overview", label: "Progress & Academics (4)", tabIds: ["dashboard", "child_progress", "academic_reports", "attendance"] },
    { id: "care", label: "Care & Interventions (4)", tabIds: ["interventions", "acknowledge_intervention", "wellness", "crisis_alerts"] },
    { id: "surveys", label: "Family & Financial Forms (2)", tabIds: ["family_assessment", "financial_assessment"] },
    { id: "connect", label: "Meetings & Messaging (5)", tabIds: ["schedule_meeting", "messages", "notifications", "resources", "announcements"] }
  ], []);

  const TAB_ITEMS: Array<{ id: ParentTabType; label: string; icon: any; badge?: string; category: string }> = [
    { id: "dashboard", label: "Family Overview", icon: Users, badge: "Home", category: "overview" },
    { id: "child_progress", label: "Child's Wellness Journey", icon: TrendingUp, badge: "Consent", category: "overview" },
    { id: "academic_reports", label: "Report Card (Form 138)", icon: BookOpen, badge: "Grades", category: "overview" },
    { id: "attendance", label: "Attendance & Patterns", icon: Calendar, badge: "96.5%", category: "overview" },
    { id: "interventions", label: "Active Care Plans", icon: ShieldCheck, badge: "1 Active", category: "care" },
    { id: "acknowledge_intervention", label: "Acknowledge Home Support", icon: CheckCircle2, badge: "Action Required", category: "care" },
    { id: "wellness", label: "Areas Needing Support", icon: HeartPulse, category: "care" },
    { id: "crisis_alerts", label: "Crisis Notifications", icon: AlertTriangle, badge: "Actionable", category: "care" },
    { id: "family_assessment", label: "Family Environment Form", icon: Home, badge: "Confidential", category: "surveys" },
    { id: "financial_assessment", label: "Financial & 4Ps Survey", icon: Wallet, badge: "Optional", category: "surveys" },
    { id: "schedule_meeting", label: "Schedule Consultation", icon: HeartHandshake, category: "connect" },
    { id: "messages", label: "Direct Teacher Chat", icon: MessageSquare, badge: "Threaded", category: "connect" },
    { id: "notifications", label: "Parent Inbox", icon: Bell, badge: "3 New", category: "connect" },
    { id: "resources", label: "Parenting & Health Guides", icon: FileText, category: "connect" },
    { id: "announcements", label: "School Events & Memos", icon: Sparkles, category: "connect" }
  ];

  const visibleTabs = selectedNavCategory === "all"
    ? TAB_ITEMS
    : TAB_ITEMS.filter(t => t.category === selectedNavCategory);

  // 4. Formal Acknowledgment Checklist
  const [acknowledgments, setAcknowledgments] = useState([
    {
      id: "ACK-01",
      title: "Provide a Quiet Study Space & 8-Hour Sleep Schedule",
      originator: "Maria Theresa Cruz, RGC (Guidance Counselor)",
      protocol: "Academic Anxiety & Insomnia Remediation Protocol",
      parentActionRequired: "Ensure household lights are dimmed after 10:00 PM and student has a dedicated distraction-free study table for STEM homework.",
      dateAssigned: "Sep 18, 2026",
      isAcknowledged: true,
      acknowledgedDate: "Sep 19, 2026 08:30 AM"
    },
    {
      id: "ACK-02",
      title: "Supervise Tuesday & Thursday Peer Tutoring with Kyle Mercado",
      originator: "Mr. Roberto Santos, LPT (Class Adviser)",
      protocol: "Pre-Calculus Core Factoring & Limits Support",
      parentActionRequired: "Confirm student attends 4:30 PM library peer-review sessions before commuting home.",
      dateAssigned: "Sep 19, 2026",
      isAcknowledged: false,
      acknowledgedDate: null
    }
  ]);

  // 5. Family Assessment Form
  const [familyData, setFamilyData] = useState({
    parentingStyle: "Authoritative (Supportive with Clear Expectations)",
    homeEnvironment: "Peaceful / Adequate Space",
    familyStressors: "Managing rising transportation expenses and sibling tuition",
    familySupportLevel: "High - Parents available during evenings",
    culturalValues: "High emphasis on academic success as first-generation college applicant"
  });

  // 6. Financial Assessment Form
  const [financialData, setFinancialData] = useState({
    monthlyIncomeBracket: "₱25,000 - ₱45,000 (Middle Income)",
    is4PsBeneficiary: "No",
    hasExternalScholarship: "No - Inquiring about Alumni Foundation Grant",
    paymentArrangement: "Quarterly Installment Plan",
    financialConcerns: "Occasional delays in exam permit clearance during midterms"
  });

  // 8. Meeting Scheduler
  const [requestedMeetings, setRequestedMeetings] = useState([
    {
      id: "REQ-01",
      type: "Guidance Counselor 1-on-1 Consultation",
      staff: "Maria Theresa Cruz, RGC",
      date: "Sep 22, 2026",
      time: "02:00 PM - 02:45 PM",
      reason: "Discuss child's recent GAD-7 anxiety progress and exam preparation tips.",
      status: "Confirmed by Guidance"
    },
    {
      id: "REQ-02",
      type: "Subject Teacher Conference",
      staff: "Mr. Roberto Santos, LPT (Pre-Calculus)",
      date: "Sep 25, 2026",
      time: "03:30 PM - 04:00 PM",
      reason: "Follow up on modular quiz performance.",
      status: "Pending Teacher Confirmation"
    }
  ]);
  const [newMeetingType, setNewMeetingType] = useState("Guidance Counselor 1-on-1 Consultation");
  const [newMeetingDate, setNewMeetingDate] = useState("2026-09-24");
  const [newMeetingTime, setNewMeetingTime] = useState("10:30 AM");
  const [newMeetingReason, setNewMeetingReason] = useState("");

  // 15. Threaded Messages
  const [chatThreads, setChatThreads] = useState([
    {
      id: 1,
      contact: "Mr. Roberto Santos (Class Adviser)",
      role: "Class Adviser",
      unread: false,
      messages: [
        { sender: "Mr. Santos", text: "Good afternoon Mrs. Dimaculangan, just wanted to let you know Joshua got 18/20 on today's Chemistry quiz.", time: "Yesterday, 3:15 PM", isSelf: false },
        { sender: "You", text: "Thank you so much Sir! We made sure he slept early as agreed during the care plan meeting.", time: "Yesterday, 4:02 PM", isSelf: true }
      ]
    },
    {
      id: 2,
      contact: "Maria Theresa Cruz, RGC",
      role: "Guidance Counselor",
      unread: true,
      messages: [
        { sender: "Ma'am Cruz", text: "Hello! We will see you for our scheduled check-in on Tuesday at 2:00 PM.", time: "Today, 9:30 AM", isSelf: false }
      ]
    }
  ]);
  const [activeThreadId, setActiveThreadId] = useState<number>(1);
  const [inputChat, setInputChat] = useState("");

  const activeThread = useMemo(() => {
    return chatThreads.find(t => t.id === activeThreadId) || chatThreads[0];
  }, [chatThreads, activeThreadId]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    setChatThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          messages: [
            ...t.messages,
            { sender: "You", text: inputChat.trim(), time: "Just now", isSelf: true }
          ]
        };
      }
      return t;
    }));
    setInputChat("");
    showToast("Message sent to school staff.");
  };

  useEffect(() => {
    const handleDatasetUpdate = () => {
      setStudentDataset(getActiveStudentDataset());
    };
    const handleInterventionsUpdate = () => {
      setInterventionsList(getActiveInterventions());
    };
    const handleNotificationsUpdate = () => {
      setNotificationsList(getActiveNotifications());
    };

    window.addEventListener("sapc_student_dataset_updated", handleDatasetUpdate);
    window.addEventListener("sapc_interventions_updated", handleInterventionsUpdate);
    window.addEventListener("sapc:notifications-updated", handleNotificationsUpdate);
    window.addEventListener("sapc:referrals-updated", handleNotificationsUpdate);
    window.addEventListener("sapc:sessions-updated", handleNotificationsUpdate);

    return () => {
      window.removeEventListener("sapc_student_dataset_updated", handleDatasetUpdate);
      window.removeEventListener("sapc_interventions_updated", handleInterventionsUpdate);
      window.removeEventListener("sapc:notifications-updated", handleNotificationsUpdate);
      window.removeEventListener("sapc:referrals-updated", handleNotificationsUpdate);
      window.removeEventListener("sapc:sessions-updated", handleNotificationsUpdate);
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as ParentTabType;
      if (urlTab) setActiveTab(urlTab);

      const handleCustomNav = (e: CustomEvent<{ tab?: ParentTabType; source?: string }>) => {
        if (e.detail?.source === "tab_click") return;
        if (e.detail?.tab) setActiveTab(e.detail.tab);
      };
      window.addEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
      return () => window.removeEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
    }
  }, []);

  // Auto-scroll active tab and category into view smoothly when activeTab changes
  useEffect(() => {
    if (!isMounted) return;

    const parentCat = CATEGORIES.find(
      (c) => c.id !== "all" && c.tabIds?.includes(activeTab)
    );

    if (
      selectedNavCategory !== "all" &&
      parentCat &&
      !CATEGORIES.find((c) => c.id === selectedNavCategory)?.tabIds?.includes(activeTab)
    ) {
      setSelectedNavCategory("all");
    }

    const timer = setTimeout(() => {
      const activeTabEl = document.getElementById(`parent-tab-${activeTab}`);
      if (activeTabEl && tabsDrag.ref.current) {
        activeTabEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }

      const targetCatId = selectedNavCategory === "all" ? (parentCat?.id || "all") : selectedNavCategory;
      const activeCatEl = document.getElementById(`parent-cat-${targetCatId}`);
      if (activeCatEl && catDrag.ref.current) {
        activeCatEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeTab, selectedNavCategory, isMounted, CATEGORIES, catDrag.ref, tabsDrag.ref]);

  const handleTabChange = useCallback((tab: ParentTabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab, source: "tab_click" } }));
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6 pb-12 font-sans animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl bg-slate-200" />
          <div className="h-64 rounded-3xl bg-slate-200 lg:col-span-2" />
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

      {/* Top Banner - Institutional Maroon & Gold (Mobile / Tablet Optimized) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-5 sm:p-7 md:p-8 shadow-md text-white border-t-4 border-amber-400">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-amber-300" />
                San Antonio de Padua College
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• Parent &amp; Family Engagement Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Parent Partnership &amp; Student Wellness Portal
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-rose-50/95 leading-relaxed font-normal">
              Transparent, consent-based updates on your child&apos;s academic standing, attendance habits, home support care plans, and guidance counselor collaborations.
            </p>
          </div>

          {/* Child Switcher Selector */}
          <div className="bg-black/35 backdrop-blur-md border border-white/25 rounded-2xl p-3.5 sm:p-4 shadow-lg min-w-[240px] space-y-2">
            <span className="text-[10px] sm:text-xs text-amber-200 font-extrabold uppercase tracking-wider block">
              Viewing Child Profile:
            </span>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(Number(e.target.value));
                  showToast(`Viewing data for ${LINKED_CHILDREN.find(c => c.id === Number(e.target.value))?.name}`);
                }}
                className="w-full min-h-[40px] px-3 pr-8 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {LINKED_CHILDREN.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({child.section.split(" ")[0]} {child.section.split(" ")[1]})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 gap-2">
              <span className="text-slate-300 truncate">LRN: {currentChildInfo.lrn}</span>
              <button
                onClick={() => setIsDepEdFormOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-400/90 hover:bg-amber-300 text-amber-950 font-bold text-[10px] flex items-center gap-1 shadow-sm transition"
              >
                <Award className="w-3 h-3" />
                <span>DepEd SF9</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards (Plain Language for Families) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Support Level */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Overall Status</span>
            <RiskBadge score={currentChild.latest_risk_score} tier={currentChild.latest_risk_tier} size="sm" />
          </div>
          <div className="my-1.5">
            <p className="text-sm sm:text-base font-extrabold text-slate-900">
              {currentChild.latest_risk_tier === "high" ? "Needs Attention" : currentChild.latest_risk_tier === "medium" ? "Active Support" : "On Track"}
            </p>
            <span className="text-[11px] text-slate-500">
              {currentChild.latest_risk_tier === "high" ? "School care plan active" : "Doing well in class"}
            </span>
          </div>
        </div>

        {/* GPA */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Average Grade</span>
            <Award className="h-4 w-4 text-[#8B0014]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentChild.sass_metrics?.gpa ? Number(currentChild.sass_metrics.gpa).toFixed(1) : "88.5"}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">✓ Passing Grade Status</span>
        </div>

        {/* Attendance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Attendance</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-900">96.5%</span>
            <span className="text-xs font-bold text-slate-400">(1 Absent)</span>
          </div>
          <span className="text-[11px] font-bold text-blue-700">Regular school attendance</span>
        </div>

        {/* Action Needed */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Parent Actions</span>
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-800">
              {acknowledgments.filter(a => !a.isAcknowledged).length}
            </span>
            <span className="text-xs font-bold text-slate-400">Pending</span>
          </div>
          <span className="text-[11px] font-bold text-amber-800">1 Plan Acknowledgment Due</span>
        </div>
      </div>

      {/* Navigation Hub: Category Switcher + Tabs */}
      <div className="space-y-2.5">
        {/* Category Filter Chips with Scroll Controls */}
        <div className="relative flex items-center">
          {catDrag.canScrollLeft && (
            <button
              type="button"
              onClick={() => catDrag.scrollBy(-220)}
              className="flex absolute -left-2 z-10 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer"
              title="Scroll categories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div 
            ref={catDrag.ref}
            {...catDrag.events}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth pb-1 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing w-full"
          >
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedNavCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`parent-cat-${cat.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedNavCategory(cat.id);
                    if (cat.id !== "all" && cat.tabIds && !cat.tabIds.includes(activeTab)) {
                      handleTabChange(cat.tabIds[0] as ParentTabType);
                    }
                  }}
                  className={`min-h-[34px] px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 cursor-pointer ${
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

          {catDrag.canScrollRight && (
            <button
              type="button"
              onClick={() => catDrag.scrollBy(220)}
              className="flex absolute -right-2 z-10 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer"
              title="Scroll categories right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categorized Navigation Tabs Bar (Scrollable Pill Strip with Left/Right Buttons) */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center">
          {tabsDrag.canScrollLeft && (
            <button
              type="button"
              onClick={() => tabsDrag.scrollBy(-260)}
              className="flex absolute left-2 z-10 h-8 w-8 rounded-xl bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer backdrop-blur-xs"
              title="Scroll modules left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div 
            ref={tabsDrag.ref}
            {...tabsDrag.events}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth px-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing text-xs font-bold w-full"
          >
            {visibleTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`parent-tab-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
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
              title="Scroll modules right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. FAMILY DASHBOARD (dashboard) */}
      {/* ========================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Explanation for Parents */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">What Your Child&apos;s Status Means</h3>
                  <p className="text-xs text-slate-500">Simple explanation of our school early guidance support tiers</p>
                </div>
                <RiskBadge score={currentChild.latest_risk_score} tier={currentChild.latest_risk_tier} size="md" />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-amber-950 text-sm">
                  {currentChild.latest_risk_tier === "high" 
                    ? "🟡 Active Support Protocol (High Care Tier)"
                    : currentChild.latest_risk_tier === "medium"
                    ? "🟡 Moderate Guidance Tracking"
                    : "🟢 Low Risk — Satisfactory Progress"
                  }
                </p>
                <p>
                  At San Antonio de Padua College, our system looks at 5 areas: class grades, attendance, family support, physical health, and emotional well-being. A high score simply means the school has activated extra tutoring and check-ins to make sure your child succeeds.
                </p>
              </div>

              {/* Quick Action Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => handleTabChange("acknowledge_intervention")}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">Acknowledge Home Care Plan</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
                  </div>
                  <p className="text-[11px] text-slate-500">1 action item needs parent confirmation</p>
                </div>

                <div
                  onClick={() => handleTabChange("schedule_meeting")}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">Request Staff Consultation</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
                  </div>
                  <p className="text-[11px] text-slate-500">Book meeting with Adviser or Guidance</p>
                </div>
              </div>
            </div>

            {/* Emergency Contacts & Guidance Desk */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-[#8B0014]" />
                School Contact Hotline
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Class Adviser:</span>
                  <p className="font-extrabold text-slate-900">{currentChildInfo.adviser}</p>
                  <span className="text-[11px] text-slate-500">Room 302 • adviser@sapc.edu.ph</span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-rose-800 uppercase">Guidance &amp; Counseling:</span>
                  <p className="font-extrabold text-rose-950">{currentChildInfo.counselor}</p>
                  <span className="text-[11px] text-rose-800">Local 108 • guidance@sapc.edu.ph</span>
                </div>
              </div>

              <button
                onClick={() => handleTabChange("messages")}
                className="w-full py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition text-center"
              >
                Send Message via Portal →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CHILD PROGRESS (child_progress) */}
      {/* ========================================================= */}
      {activeTab === "child_progress" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-[#8B0014]" />
                  Child&apos;s Wellness &amp; Academic Journey
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Consent-based longitudinal tracking to respect student privacy under RA 10173
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Student Consent:</span>
                <button
                  onClick={() => {
                    setHasStudentConsent(prev => !prev);
                    showToast(hasStudentConsent ? "Consent revoked by student demo toggle" : "Consent granted for parent viewing");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    hasStudentConsent ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
                >
                  {hasStudentConsent ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{hasStudentConsent ? "Active Consent (Visible)" : "Consent Pending"}</span>
                </button>
              </div>
            </div>

            {hasStudentConsent ? (
              <div className="space-y-6">
                {/* 4-Quarter Trend Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-500">Quarter 1</span>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">82.4 Score</p>
                    <span className="text-[10px] text-rose-700 font-bold">Exam Panic Flagged</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-black uppercase text-amber-800">Quarter 2 (Now)</span>
                    <p className="text-xl sm:text-2xl font-black text-[#D97706] mt-1">66.0 Score</p>
                    <span className="text-[10px] text-amber-800 font-bold">Improving (-16.4%)</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-black uppercase text-emerald-800">Quarter 3 (Target)</span>
                    <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">48.5 Score</p>
                    <span className="text-[10px] text-emerald-700 font-bold">Remediation Clear</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] font-black uppercase text-blue-800">Quarter 4 (Goal)</span>
                    <p className="text-xl sm:text-2xl font-black text-blue-900 mt-1">32.0 Score</p>
                    <span className="text-[10px] text-blue-700 font-bold">Full Mastery</span>
                  </div>
                </div>

                {/* Interactive Multi-Modal Data Visualizer */}
                <AHPDataVisualizer 
                  studentName={`${currentChild.full_name} (Child's Wellness Matrix)`}
                  domainScores={{ 
                    academic: currentChild.domain_scores?.academic ?? 28.5, 
                    family: currentChild.domain_scores?.family ?? 18.0, 
                    health: currentChild.domain_scores?.health ?? 16.5, 
                    mental: currentChild.domain_scores?.mental_health ?? 14.0, 
                    financial: currentChild.domain_scores?.financial ?? 12.0 
                  }}
                />

                {/* Plain-Language 5-Domain Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      What&apos;s Improving Well:
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Attendance is at a high 96.5%. Chemistry quiz scores have recovered to 82/100 after participating in tutoring.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-amber-600" />
                      What Needs Family Attention:
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Pre-Calculus test anxiety and late-night study fatigue. Ensuring proper rest before exam days will make a major difference.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 space-y-2">
                <Lock className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="font-bold text-sm">Detailed Wellness Journey is Protected</p>
                <p className="text-xs text-slate-400">Student consent has not been toggled for this demo session.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. INTERVENTIONS TRANSPARENCY (interventions) */}
      {/* ========================================================= */}
      {activeTab === "interventions" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-[#8B0014]" />
                Active School Care Plans &amp; Support Protocols
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Full transparency on what the school is doing to help your child succeed
              </p>
            </div>

            <div className="space-y-4">
              {childInterventions.length > 0 ? (
                childInterventions.map((plan) => (
                  <div key={plan.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 rounded bg-[#8B0014] text-white font-black text-[10px]">Care Protocol</span>
                        <h4 className="font-extrabold text-base text-slate-900 mt-1">{plan.title}</h4>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                        plan.status === "completed" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : plan.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        Status: {plan.status === "in-progress" ? "In Progress" : plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{plan.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Assigned Counselor / Adviser:</span>
                        <strong>{plan.assigned_by || currentChildInfo.counselor}</strong>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Target Domain:</span>
                        <strong className="capitalize">{plan.domain || "Academic & Wellness"}</strong>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Follow-Up / Due Date:</span>
                        <strong>{plan.due_date || "Continuous Monitoring"}</strong>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded bg-[#8B0014] text-white font-black text-[10px]">Active Protocol</span>
                      <h4 className="font-extrabold text-base text-slate-900 mt-1">Pre-Calculus Tutoring &amp; Exam Anxiety Coping</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      Status: In Progress
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Assigned Handlers:</span>
                      <strong>Mr. Santos (Adviser) &amp; Ma&apos;am Cruz (Counselor)</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Peer Tutor:</span>
                      <strong>Kyle Mercado (Grade 12 STEM)</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Expected Outcome:</span>
                      <strong>Grade recovery above 78.0 &amp; lower GAD-7 anxiety</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ACKNOWLEDGE INTERVENTIONS (acknowledge_intervention) */}
      {/* ========================================================= */}
      {activeTab === "acknowledge_intervention" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                Formal Parent Role Acknowledgment System
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Confirm your role in supporting home habits recommended by teachers and counselors
              </p>
            </div>

            <div className="space-y-4">
              {acknowledgments.map((ack) => (
                <div key={ack.id} className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{ack.title}</h4>
                      <p className="text-xs text-slate-500">Originator: {ack.originator}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ack.isAcknowledged ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}>
                      {ack.isAcknowledged ? "✓ Acknowledged" : "Action Required"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong>Parent Responsibility:</strong> {ack.parentActionRequired}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400">Date Assigned: {ack.dateAssigned}</span>
                    {!ack.isAcknowledged ? (
                      <button
                        onClick={() => {
                          setAcknowledgments(prev => prev.map(a => a.id === ack.id ? { ...a, isAcknowledged: true, acknowledgedDate: new Date().toLocaleString() } : a));
                          showToast("You have formally acknowledged your home support commitment.");
                        }}
                        className="px-4 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs transition cursor-pointer"
                      >
                        ✓ I Acknowledge &amp; Confirm My Role
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold">Confirmed on {ack.acknowledgedDate}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. FAMILY ASSESSMENT (family_assessment) */}
      {/* ========================================================= */}
      {activeTab === "family_assessment" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Home className="h-6 w-6 text-[#8B0014]" />
                Family Environment &amp; Home Context Questionnaire
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Help counselors understand home factors directly from the source (protected by RA 10173)
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Parenting &amp; Communication Style at Home:</label>
                <input
                  type="text"
                  value={familyData.parentingStyle}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, parentingStyle: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Home Study Environment:</label>
                <input
                  type="text"
                  value={familyData.homeEnvironment}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, homeEnvironment: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Current Family Stressors or Concerns:</label>
                <input
                  type="text"
                  value={familyData.familyStressors}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, familyStressors: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const isHigh = familyData.familySupportLevel.toLowerCase().includes("high") || familyData.parentingStyle.toLowerCase().includes("authoritative");
                  const updatedSupportScore = isHigh ? 88.0 : 70.0;
                  
                  updateStudentRecord(currentChild.id, {
                    family_support_score: updatedSupportScore
                  });

                  addAppNotification({
                    studentId: currentChild.id,
                    studentName: currentChild.full_name,
                    title: "Family Environment Questionnaire Updated",
                    body: `Parent submitted updated home context data for ${currentChild.full_name}.`,
                    type: "parent",
                    targetRole: "counselor",
                    priority: "low"
                  });

                  showToast("Family assessment updated securely and synced with student file.");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition cursor-pointer"
              >
                Save Family Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. FINANCIAL ASSESSMENT (financial_assessment) */}
      {/* ========================================================= */}
      {activeTab === "financial_assessment" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Wallet className="h-6 w-6 text-emerald-600" />
                Financial Assistance &amp; 4Ps Beneficiary Information
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Optional survey to help the school endorse your family for emergency tuition subsidies and grants
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Household Monthly Income Bracket:</label>
                <input
                  type="text"
                  value={financialData.monthlyIncomeBracket}
                  onChange={(e) => setFinancialData(prev => ({ ...prev, monthlyIncomeBracket: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Pantawid Pamilyang Pilipino Program (4Ps) Beneficiary Status:</label>
                <input
                  type="text"
                  value={financialData.is4PsBeneficiary}
                  onChange={(e) => setFinancialData(prev => ({ ...prev, is4PsBeneficiary: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Current Tuition Payment Arrangement:</label>
                <input
                  type="text"
                  value={financialData.paymentArrangement}
                  onChange={(e) => setFinancialData(prev => ({ ...prev, paymentArrangement: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const isLow = financialData.is4PsBeneficiary.toLowerCase() === "yes" || financialData.monthlyIncomeBracket.includes("Below");
                  const updatedRiskScore = isLow ? 75.0 : 35.0;

                  updateStudentRecord(currentChild.id, {
                    financial_risk_score: updatedRiskScore
                  });

                  addAppNotification({
                    studentId: currentChild.id,
                    studentName: currentChild.full_name,
                    title: "Parent Financial Survey Submitted",
                    body: `Financial survey submitted for ${currentChild.full_name} (4Ps: ${financialData.is4PsBeneficiary}).`,
                    type: "parent",
                    targetRole: "counselor",
                    priority: "medium"
                  });

                  showToast("Financial data saved. Guidance office will assess for scholarship endorsement.");
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                Submit Financial Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CRISIS NOTIFICATIONS (crisis_alerts) */}
      {/* ========================================================= */}
      {activeTab === "crisis_alerts" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-rose-600" />
                Immediate Crisis Alert Notifications (With Consent)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Actionable crisis context, school actions taken, and recommended next steps for parents
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200 space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-900 text-sm">Notice of High Academic Distress Detected</span>
                <span className="text-[11px] text-rose-700 font-bold">Sep 18, 2026 - 11:25 PM</span>
              </div>
              <p className="leading-relaxed">
                <strong>What happened:</strong> During an AI wellness chat, Joshua expressed feeling overwhelmed by STEM midterm exams and sleep deprivation, and requested Guidance Counselor support.
              </p>
              <p className="leading-relaxed">
                <strong>What the school did:</strong> Guidance Counselor Maria Theresa Cruz dispatched a counseling invite and arranged peer tutoring with Kyle Mercado.
              </p>
              <div className="p-3 bg-white rounded-2xl border border-rose-200 space-y-1">
                <strong className="text-slate-900">What parent should do:</strong>
                <p>Ensure a calm conversation at home, reassure child that struggling with difficult exams is normal, and attend our scheduled check-in.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. SCHEDULE MEETING (schedule_meeting) */}
      {/* ========================================================= */}
      {activeTab === "schedule_meeting" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <HeartHandshake className="h-6 w-6 text-[#8B0014]" />
                Request Parent-Teacher or Counselor Consultations
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Select your preferred dates and times to consult regarding your child&apos;s progress
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-3 text-xs">
                <h4 className="font-extrabold text-slate-900 text-sm">Book New Appointment:</h4>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Consultation Type:</label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Guidance Counselor 1-on-1 Consultation">Guidance Counselor 1-on-1 Consultation</option>
                    <option value="Class Adviser Progress Meeting">Class Adviser Progress Meeting</option>
                    <option value="Subject Teacher Consultation (Pre-Calculus)">Subject Teacher Consultation (Pre-Calculus)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Preferred Date:</label>
                    <input
                      type="date"
                      value={newMeetingDate}
                      onChange={(e) => setNewMeetingDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Preferred Time:</label>
                    <input
                      type="text"
                      value={newMeetingTime}
                      onChange={(e) => setNewMeetingTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Specific Concern / Agenda:</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what you would like to discuss..."
                    value={newMeetingReason}
                    onChange={(e) => setNewMeetingReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const req = {
                      id: `REQ-${Date.now()}`,
                      type: newMeetingType,
                      staff: "Guidance Office",
                      date: newMeetingDate,
                      time: newMeetingTime,
                      reason: newMeetingReason || "General progress check-in",
                      status: "Confirmed by Guidance"
                    };
                    setRequestedMeetings(prev => [req, ...prev]);

                    scheduleCounselingSession({
                      student_id: currentChild.id,
                      student_name: currentChild.full_name,
                      date: newMeetingDate,
                      time: newMeetingTime,
                      counselor: "Maria Theresa Cruz, RGC",
                      topic: `${newMeetingType}: ${newMeetingReason || "Parent consultation"}`,
                      status: "Confirmed",
                      notes: `Parent consultation requested for ${currentChild.full_name}.`,
                      format: "in-person"
                    });

                    addAppNotification({
                      studentId: currentChild.id,
                      studentName: currentChild.full_name,
                      title: `Parent Meeting Requested: ${newMeetingType}`,
                      body: `Parent of ${currentChild.full_name} requested consultation on ${newMeetingDate} at ${newMeetingTime}.`,
                      type: "session",
                      targetRole: "counselor",
                      priority: "medium"
                    });

                    setNewMeetingReason("");
                    showToast("Consultation request scheduled and dispatched to counselor triage queue.");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition cursor-pointer"
                >
                  Submit Meeting Request
                </button>
              </div>

              {/* Status List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">Existing Consultation Requests:</h4>
                <div className="space-y-2">
                  {requestedMeetings.map((m) => (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900">{m.type}</strong>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">{m.status}</span>
                      </div>
                      <p className="text-slate-600">{m.date} ({m.time}) • {m.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. ACADEMIC REPORTS (academic_reports) */}
      {/* ========================================================= */}
      {activeTab === "academic_reports" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-[#8B0014]" />
                  Simplified Parent Grade Report (Form 138)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Easy-to-understand progress indicators with layman explanations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { subject: "Pre-Calculus", grade: 80, remark: "Remediated (Passed)", note: "Recovered from 72 in Q1" },
                { subject: "General Chemistry 1", grade: 82, remark: "Passed", note: "Solid laboratory output" },
                { subject: "Oral Communication", grade: 90, remark: "Very Satisfactory", note: "Excellent class speeches" },
                { subject: "Komunikasyon", grade: 88, remark: "Satisfactory", note: "Consistently on time" },
                { subject: "Earth & Life Science", grade: 85, remark: "Satisfactory", note: "Good modular projects" },
                { subject: "P.E. and Health", grade: 94, remark: "Outstanding", note: "Active participation" }
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900">{s.subject}</span>
                    <span className="text-base font-black text-[#8B0014]">{s.grade}</span>
                  </div>
                  <span className="text-emerald-700 font-bold block">{s.remark}</span>
                  <p className="text-slate-500 text-[11px]">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. ATTENDANCE (attendance) */}
      {/* ========================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Attendance Log &amp; Pattern Analysis
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Punctuality records with Monday/Friday absence pattern alerts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <h4 className="font-black text-blue-950 text-sm">Attendance Pattern Summary</h4>
                <p className="leading-relaxed text-slate-700">
                  Joshua has maintained a <strong>96.5% attendance standing</strong>. No chronic absence patterns detected (e.g. no habitual Monday tardiness).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 text-sm">Excuse Slip Status</h4>
                <p className="text-slate-600">1 medical excuse slip on Aug 28, 2026 was verified by the school clinic.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. WELLNESS (wellness) */}
      {/* ========================================================= */}
      {activeTab === "wellness" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-purple-600" />
                Gentle Wellness &amp; Emotional Health Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Presented gently as areas where your child might need understanding and support
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs text-slate-700">
              <h4 className="font-black text-purple-950 text-sm">Guidance Counselor Observation</h4>
              <p className="leading-relaxed">
                Your child experiences elevated stress prior to major mathematics and science exams. Guidance recommends praising effort and consistency over numerical perfection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. NOTIFICATIONS (notifications) */}
      {/* ========================================================= */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Bell className="h-6 w-6 text-[#8B0014]" />
                Centralized Parent Communications Inbox
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {childNotifications.length > 0 ? (
                childNotifications.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{n.title}</strong>
                        {n.priority === "high" && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[9px]">Urgent</span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px]">{n.created_at}</span>
                    </div>
                    <p className="text-slate-600">{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No new notifications at this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. RESOURCES (resources) */}
      {/* ========================================================= */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#8B0014]" />
                Parenting Guides, Mental Health &amp; Scholarship Assistance
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm">Managing Senior High Anxiety</strong>
                <p className="text-slate-600">DepEd guide on active listening and positive reinforcement.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm">SAPC Alumni Scholarship</strong>
                <p className="text-slate-600">Tuition subsidy application guidelines for families in need.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm">Healthy Sleep for Teens</strong>
                <p className="text-slate-600">Practical tips for screen curfew and sleep hygiene.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 14. ANNOUNCEMENTS (announcements) */}
      {/* ========================================================= */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-500" />
                School-Wide &amp; Grade-Level Announcements
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <strong className="text-amber-950 text-sm">Senior High School Intramurals 2026</strong>
                <span className="text-amber-800">Oct 20-22, 2026</span>
              </div>
              <p className="text-slate-700">Parents are welcome to attend the opening sports festival ceremonies.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 15. MESSAGES (messages) */}
      {/* ========================================================= */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-[#8B0014]" />
                Direct Threaded Chat with Teachers &amp; Counselors
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Thread list */}
              <div className="space-y-2">
                {chatThreads.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer text-xs ${
                      t.id === activeThreadId ? "bg-rose-50 border-rose-300 font-bold" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <p className="text-slate-900">{t.contact}</p>
                    <span className="text-slate-400 text-[10px]">{t.role}</span>
                  </div>
                ))}
              </div>

              {/* Chat Window */}
              <div className="md:col-span-2 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 max-h-[300px] overflow-y-auto">
                  {activeThread.messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${
                        m.isSelf ? "bg-[#8B0014] text-white ml-auto" : "bg-white border border-slate-200 text-slate-800 mr-auto shadow-2xs"
                      }`}
                    >
                      <div className={`flex justify-between text-[10px] ${m.isSelf ? "text-amber-200" : "text-slate-400"}`}>
                        <strong>{m.sender}</strong>
                        <span>{m.time}</span>
                      </div>
                      <p className="mt-0.5">{m.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputChat}
                    onChange={(e) => setInputChat(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#8B0014]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DepEd SF9 / SF10 Official Form Modal */}
      <DepEdFormModal
        isOpen={isDepEdFormOpen}
        onClose={() => setIsDepEdFormOpen(false)}
        selectedStudent={currentChild}
      />
    </div>
  );
};
