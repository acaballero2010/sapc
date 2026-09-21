/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, 
  Brain, 
  GraduationCap, 
  Users, 
  Sliders, 
  Bot, 
  Layers, 
  Menu, 
  X, 
  ShieldCheck, 
  ShieldAlert,
  Settings, 
  AlertTriangle, 
  HeartHandshake, 
  TrendingUp, 
  Activity, 
  Compass, 
  User, 
  UserCheck,
  UserPlus,
  BarChart3, 
  MessageSquare, 
  Calendar,
  FileText,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  Award,
  Bell,
  Building,
  RotateCcw,
  Edit,
  HelpCircle,
  Download,
  FileSpreadsheet,
  Key,
  Percent,
  Eye,
  HeartPulse,
  Wallet,
  Lock,
  Heart
} from "lucide-react";
import { useAuth, RoleType } from "@/lib/auth-context";
import { SapcLogo } from "./SapcLogo";

interface SidebarProps {
  onOpenChat?: () => void;
  onOpenSimulator?: () => void;
  onOpenOnboarding?: () => void;
  onOpenAccount?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

export interface NavGroup {
  category: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenChat, 
  onOpenSimulator, 
  onOpenOnboarding, 
  onOpenAccount,
  isCollapsed = false,
  onToggleCollapse: _onToggleCollapse
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  useEffect(() => {
    const updateActiveTab = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab") || "dashboard";
        setCurrentTab(tab);
      }
    };
    updateActiveTab();

    const handleNavigate = (e: any) => {
      if (e.detail?.tab) {
        setCurrentTab(e.detail.tab);
      }
    };

    window.addEventListener("sapc:navigate-tab", handleNavigate);
    window.addEventListener("popstate", updateActiveTab);
    return () => {
      window.removeEventListener("sapc:navigate-tab", handleNavigate);
      window.removeEventListener("popstate", updateActiveTab);
    };
  }, [pathname]);

  const currentRole: RoleType = user?.role || "guidance_counselor";

  // Dedicated Workspace navigation items per role grouped logically
  const roleWorkspaces: Record<RoleType, NavGroup[]> = {
    guidance_counselor: [
      {
        category: "Crisis Response & Triage",
        items: [
          { name: "Command Center", href: "/dashboard/guidance?tab=dashboard#triage-overview", icon: Brain, badge: "LIVE" },
          { name: "Crisis Alerts Queue", href: "/dashboard/guidance?tab=crisis_alerts#alerts-queue", icon: AlertTriangle, badge: "1 URGENT" },
          { name: "Crisis Case Deep-Dive", href: "/dashboard/guidance?tab=crisis_detail#crisis-detail-view", icon: ShieldAlert }
        ]
      },
      {
        category: "Student Profiles & Screenings",
        items: [
          { name: "Student Registry", href: "/dashboard/guidance?tab=students#students-roster", icon: Users, badge: "3" },
          { name: "Counselor Case File", href: "/dashboard/guidance?tab=student_profile#case-file-view", icon: UserCheck },
          { name: "Longitudinal Progress", href: "/dashboard/guidance?tab=student_progress#progress-view", icon: TrendingUp },
          { name: "Consented Chat Logs", href: "/dashboard/guidance?tab=chat_history#chat-logs-view", icon: MessageSquare },
          { name: "PHQ-9 / GAD-7 Screenings", href: "/dashboard/guidance?tab=assessments#screenings-view", icon: Activity, badge: "STANDARDIZED" }
        ]
      },
      {
        category: "Interventions & Care",
        items: [
          { name: "Master Care Plans", href: "/dashboard/guidance?tab=interventions#active-interventions", icon: ShieldCheck, badge: "CASELOAD" },
          { name: "Intervention Record", href: "/dashboard/guidance?tab=intervention_detail#intervention-record-view", icon: FileText },
          { name: "Proposed Approvals", href: "/dashboard/guidance?tab=intervention_approvals#approvals-view", icon: CheckCircle2, badge: "APPROVALS" },
          { name: "Risk Adjustment Reviews", href: "/dashboard/guidance?tab=risk_reviews#risk-reviews-view", icon: Sliders },
          { name: "Intervention Analytics", href: "/dashboard/guidance?tab=intervention_analytics#analytics-view", icon: BarChart3 }
        ]
      },
      {
        category: "Referrals & Sessions",
        items: [
          { name: "Validate Recommendations", href: "/dashboard/guidance?tab=validate_recommendations#validate-view", icon: Sparkles },
          { name: "Recommendation Feedback", href: "/dashboard/guidance?tab=recommendation_feedback#feedback-view", icon: ThumbsUp },
          { name: "Faculty Referrals", href: "/dashboard/guidance?tab=referrals#teacher-referrals", icon: HeartHandshake, badge: "TRIAGE" },
          { name: "Counseling Schedule", href: "/dashboard/guidance?tab=sessions#sessions-schedule", icon: Calendar, badge: "SCHEDULE" }
        ]
      },
      {
        category: "Analytics & Reports",
        items: [
          { name: "5-Domain Cohort Analytics", href: "/dashboard/guidance?tab=analytics#trend-analytics", icon: TrendingUp, badge: "AHP 5-DOMAIN" },
          { name: "DepEd / CHED Reports", href: "/dashboard/guidance?tab=reports#reports-view", icon: Award },
          { name: "Alerts & Messages", href: "/dashboard/guidance?tab=notifications#notifications-view", icon: Bell }
        ]
      }
    ],
    teacher: [
      {
        category: "Advisory & Roster",
        items: [
          { name: "Class Overview", href: "/dashboard/teacher?tab=dashboard#advisory-overview", icon: BarChart3, badge: "HEALTH" },
          { name: "Advisory Class Roster", href: "/dashboard/teacher?tab=students#roster", icon: Users, badge: "40" },
          { name: "At-Risk Priority Focus", href: "/dashboard/teacher?tab=at_risk#at-risk-view", icon: AlertTriangle, badge: "PRIORITY" },
          { name: "Student Profile", href: "/dashboard/teacher?tab=student_profile#profile-view", icon: Eye },
          { name: "Longitudinal Progress", href: "/dashboard/teacher?tab=student_progress#progress-view", icon: TrendingUp }
        ]
      },
      {
        category: "CSV Ingestion Hub",
        items: [
          { name: "3-Step Import Wizard", href: "/dashboard/teacher?tab=import_wizard#uploader", icon: Layers, badge: "DEPED SASS" },
          { name: "Bulk Enrollment", href: "/dashboard/teacher?tab=import_students#bulk-enrollment", icon: UserCheck },
          { name: "Bulk Grades Input", href: "/dashboard/teacher?tab=import_grades#grades-input", icon: BookOpen },
          { name: "Bulk Attendance", href: "/dashboard/teacher?tab=import_attendance#attendance-input", icon: Percent },
          { name: "Import History", href: "/dashboard/teacher?tab=import_history#history-view", icon: ShieldCheck },
          { name: "Revert Rollback", href: "/dashboard/teacher?tab=revert_import#revert-view", icon: RotateCcw },
          { name: "In-Browser CSV Editor", href: "/dashboard/teacher?tab=csv_editor#editor-view", icon: FileSpreadsheet }
        ]
      },
      {
        category: "Interventions & Care",
        items: [
          { name: "Master Care Plans", href: "/dashboard/teacher?tab=interventions#interventions-view", icon: ShieldCheck, badge: "ACTIVE" },
          { name: "AI Suggestions", href: "/dashboard/teacher?tab=suggestions#suggestions-view", icon: Sparkles },
          { name: "Log Progress Milestones", href: "/dashboard/teacher?tab=log_progress#milestone-view", icon: Edit },
          { name: "Complete Intervention", href: "/dashboard/teacher?tab=complete_intervention#closeout-view", icon: CheckCircle2 }
        ]
      },
      {
        category: "DepEd Records & Messages",
        items: [
          { name: "DepEd Class Record", href: "/dashboard/teacher?tab=class_record#class-record-view", icon: FileText, badge: "FORM 137" },
          { name: "Attendance Calendar", href: "/dashboard/teacher?tab=attendance_record#calendar-view", icon: Calendar },
          { name: "Teacher Alerts", href: "/dashboard/teacher?tab=notifications#notifications-view", icon: Bell },
          { name: "Export Credentials", href: "/dashboard/teacher?tab=export_credentials#credentials-view", icon: Key },
          { name: "Messages & Referrals", href: "/dashboard/teacher?tab=messages#messages-view", icon: MessageSquare, badge: "THREADS" }
        ]
      }
    ],
    student: [
      {
        category: "Academics & Trajectory",
        items: [
          { name: "Student Profile", href: "/dashboard/student?tab=profile#student-profile", icon: User, badge: "ID & LRN" },
          { name: "Holistic Wellness Radar", href: "/dashboard/student?tab=progress#wellness-radar", icon: GraduationCap, badge: "5 DOMAINS" },
          { name: "Academic Standing & GPA", href: "/dashboard/student?tab=grades#academic-records", icon: BookOpen, badge: "FORM 138" },
          { name: "Attendance Record", href: "/dashboard/student?tab=attendance#attendance-tracker", icon: Activity, badge: "TRACKER" },
          { name: "Academic Simulator", href: "/dashboard/student?tab=forecast#academic-simulator", icon: Layers, badge: "WHAT-IF" }
        ]
      },
      {
        category: "5-Domain Screenings",
        items: [
          { name: "Mental Health & Mood", href: "/dashboard/student?tab=mental_assessment#daily-mood", icon: HeartPulse, badge: "PHQ-9/GAD-7" },
          { name: "Physical Health & Sleep", href: "/dashboard/student?tab=health_assessment#health-assessment", icon: Heart, badge: "SCREENER" },
          { name: "Family & Social Context", href: "/dashboard/student?tab=family_assessment#family-assessment", icon: Users, badge: "17 FIELDS" },
          { name: "Financial & Aid Status", href: "/dashboard/student?tab=financial_assessment#financial-assessment", icon: Wallet, badge: "AID" }
        ]
      },
      {
        category: "Care Plans & Privacy",
        items: [
          { name: "Assigned Care Protocols", href: "/dashboard/student?tab=interventions#assigned-interventions", icon: ShieldCheck, badge: "ACTION PLAN" },
          { name: "AI Action Suggestions", href: "/dashboard/student?tab=recommendations#recommendations-view", icon: Sparkles, badge: "SUGGESTIONS" },
          { name: "Multi-Quarter Trajectory", href: "/dashboard/student?tab=trends#trends-view", icon: TrendingUp },
          { name: "Messages & Advisories", href: "/dashboard/student?tab=notifications#notifications-view", icon: Bell },
          { name: "Data Privacy & Consents", href: "/dashboard/student?tab=privacy#privacy-consents", icon: Lock, badge: "RA 10173" }
        ]
      }
    ],
    parent: [
      {
        category: "Progress & Academics",
        items: [
          { name: "Family Overview", href: "/dashboard/parent?tab=dashboard#parent-overview", icon: Users, badge: "HOME" },
          { name: "Child's Wellness Journey", href: "/dashboard/parent?tab=child_progress#progress-tracker", icon: TrendingUp, badge: "CONSENT" },
          { name: "Report Card (Form 138)", href: "/dashboard/parent?tab=academic_reports#grades-report", icon: BookOpen, badge: "GRADES" },
          { name: "Attendance & Patterns", href: "/dashboard/parent?tab=attendance#attendance-history", icon: Calendar, badge: "96.5%" }
        ]
      },
      {
        category: "Care & Interventions",
        items: [
          { name: "Active Care Plans", href: "/dashboard/parent?tab=interventions#active-care", icon: ShieldCheck, badge: "1 ACTIVE" },
          { name: "Acknowledge Home Support", href: "/dashboard/parent?tab=acknowledge_intervention#acknowledge-view", icon: CheckCircle2, badge: "ACTION REQ" },
          { name: "Wellness & Domain Health", href: "/dashboard/parent?tab=wellness#wellness-view", icon: HeartPulse, badge: "5 DOMAINS" },
          { name: "Urgent Crisis Alerts", href: "/dashboard/parent?tab=crisis_alerts#crisis-view", icon: AlertTriangle, badge: "MONITORED" }
        ]
      },
      {
        category: "Family & Financial Forms",
        items: [
          { name: "Family Context Survey", href: "/dashboard/parent?tab=family_assessment#family-form", icon: Users, badge: "17 FIELDS" },
          { name: "Financial & Aid Status", href: "/dashboard/parent?tab=financial_assessment#financial-form", icon: Wallet, badge: "GRANT SUPPORT" }
        ]
      },
      {
        category: "Meetings & Messaging",
        items: [
          { name: "Request PTC Meeting", href: "/dashboard/parent?tab=schedule_meeting#consultation", icon: Calendar, badge: "PTC" },
          { name: "Teacher & Counselor Chat", href: "/dashboard/parent?tab=messages#direct-chat", icon: MessageSquare, badge: "DIRECT" },
          { name: "School Alerts & Notices", href: "/dashboard/parent?tab=notifications#notifications-view", icon: Bell },
          { name: "Family Resources", href: "/dashboard/parent?tab=resources#resources-view", icon: FileText, badge: "GUIDES" },
          { name: "Campus Announcements", href: "/dashboard/parent?tab=announcements#announcements-view", icon: Award, badge: "EVENTS" }
        ]
      }
    ],
    admin: [
      {
        category: "System & Platform Config",
        items: [
          { name: "System Command Center", href: "/dashboard/admin?tab=dashboard#admin-overview", icon: Users, badge: "MASTER" },
          { name: "Platform & Campus Logo", href: "/dashboard/admin?tab=platform_settings#platform-settings", icon: Building, badge: "ADMIN ONLY" },
          { name: "AHP 5-Domain Risk Config", href: "/dashboard/admin?tab=risk_config#weights", icon: Sliders, badge: "WEIGHTS" },
          { name: "Quarter Calendar", href: "/dashboard/admin?tab=quarter_management#calendar", icon: Calendar, badge: "Q2 ACTIVE" },
          { name: "Broadcast Announcements", href: "/dashboard/admin?tab=notifications#notifications-view", icon: Bell },
          { name: "Knowledge Base & FAQs", href: "/dashboard/admin?tab=knowledge_base#knowledge-view", icon: HelpCircle }
        ]
      },
      {
        category: "Master Ingestion & Rollback",
        items: [
          { name: "Master Import Wizard", href: "/dashboard/admin?tab=import_wizard#master-import", icon: Layers, badge: "DEPED SASS" },
          { name: "Import Audit History", href: "/dashboard/admin?tab=import_history#audit-logs", icon: ShieldCheck, badge: "LOGS" },
          { name: "Rollback & Revert Engine", href: "/dashboard/admin?tab=revert_import#rollback", icon: RotateCcw, badge: "EMERGENCY" },
          { name: "Verify Screeners", href: "/dashboard/admin?tab=verify_assessments#verify-view", icon: Activity },
          { name: "Export Ingestion Logs", href: "/dashboard/admin?tab=export_import_history#export-view", icon: FileSpreadsheet }
        ]
      },
      {
        category: "Student Master Registry",
        items: [
          { name: "Master Student Registry", href: "/dashboard/admin?tab=students#roster", icon: BookOpen, badge: "500" },
          { name: "Create Single Student", href: "/dashboard/admin?tab=create_student#create-student", icon: UserPlus },
          { name: "Student Override Editor", href: "/dashboard/admin?tab=student_profile#student-editor", icon: Edit }
        ]
      },
      {
        category: "Campus Accounts & Security",
        items: [
          { name: "Teacher Accounts Roster", href: "/dashboard/admin?tab=teachers#teachers", icon: GraduationCap, badge: "4 ACTIVE" },
          { name: "Create Campus Account", href: "/dashboard/admin?tab=create_user#create", icon: Key },
          { name: "Parent Accounts & Links", href: "/dashboard/admin?tab=parents#parents-view", icon: Users },
          { name: "Pending Registrations", href: "/dashboard/admin?tab=pending_registrations#pending-view", icon: UserCheck, badge: "DUE" },
          { name: "Bulk Export Credentials", href: "/dashboard/admin?tab=export_credentials#export-credentials", icon: Download }
        ]
      },
      {
        category: "Interventions & Reports",
        items: [
          { name: "System-Wide Interventions", href: "/dashboard/admin?tab=interventions#interventions-view", icon: ShieldAlert },
          { name: "Bulk Recommendations", href: "/dashboard/admin?tab=intervention_suggestions#suggestions-view", icon: Sparkles },
          { name: "DepEd / CHED Reports", href: "/dashboard/admin?tab=reports#reports-view", icon: Award }
        ]
      }
    ]
  };

  const currentWorkspaceGroups = roleWorkspaces[currentRole] || roleWorkspaces.guidance_counselor;

  const handleNavigation = (item: { href: string }) => {
    setIsOpen(false);
    const [pathWithQuery, hash] = item.href.split("#");
    const [targetPath, queryString] = pathWithQuery.split("?");
    const currentNorm = (pathname || "").replace(/\/$/, "");
    const targetNorm = (targetPath || "").replace(/\/$/, "");

    const urlParams = new URLSearchParams(queryString || "");
    const requestedTab = urlParams.get("tab");

    if (currentNorm === targetNorm) {
      if (requestedTab) {
        setCurrentTab(requestedTab);
        window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab: requestedTab, hash } }));
        const newUrl = `${targetPath}?tab=${requestedTab}${hash ? `#${hash}` : ""}`;
        window.history.pushState({}, "", newUrl);
      }
      if (hash) {
        if (hash === "referral-action") {
          window.dispatchEvent(new CustomEvent("sapc:open-teacher-referral"));
          const el = document.getElementById("roster");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.add("ring-4", "ring-amber-400/50");
            setTimeout(() => el.classList.remove("ring-4", "ring-amber-400/50"), 2000);
          }
        }, 60);
        return;
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    router.push(item.href);
  };

  const isItemActive = (item: { href: string }) => {
    const [itemPath, itemQuery] = item.href.split("?");
    const itemUrlParams = new URLSearchParams(itemQuery?.split("#")[0] || "");
    const itemTab = itemUrlParams.get("tab") || "dashboard";

    const currentNorm = (pathname || "").replace(/\/$/, "");
    const targetNorm = (itemPath || "").replace(/\/$/, "");

    if (currentNorm !== targetNorm) return false;

    const activeTabNormalized = currentTab || "dashboard";
    return itemTab === activeTabNormalized;
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#8B0014] text-white shadow-2xl border-2 border-amber-400"
        aria-label="Toggle Navigation Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${isCollapsed ? "flex flex-col items-center gap-3" : ""}`}>
          <div className="flex items-center justify-between w-full">
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : "min-w-0"}`}>
              <SapcLogo size={isCollapsed ? 36 : 42} showText={false} />
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                      SAPC <span className="text-[#8B0014] dark:text-rose-400">IntellySys</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    San Antonio de Padua College
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className={`flex-1 overflow-y-auto space-y-5 ${isCollapsed ? "px-2 py-4" : "px-3.5 py-4"}`}>
          {/* Section 1: Role Workspace Navigation Grouped */}
          <div className="space-y-4">
            {currentWorkspaceGroups.map((group, gIdx) => (
              <div key={`${group.category}-${gIdx}`} className="space-y-1">
                {!isCollapsed ? (
                  <div className="px-2.5 pt-1 pb-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {group.category}
                    </span>
                  </div>
                ) : gIdx > 0 ? (
                  <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 mx-auto my-2" />
                ) : null}

                <nav className="space-y-1">
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);
                    return (
                      <button
                        key={`${item.name}-${idx}`}
                        type="button"
                        onClick={() => handleNavigation(item)}
                        title={item.name}
                        className={`w-full flex items-center rounded-xl transition group text-left cursor-pointer ${
                          isCollapsed 
                            ? active
                              ? "justify-center h-10 w-10 mx-auto bg-rose-50 dark:bg-rose-950/70 border-2 border-[#8B0014] dark:border-rose-500 text-[#8B0014] dark:text-rose-300 shadow-xs"
                              : "justify-center h-10 w-10 mx-auto text-slate-700 dark:text-slate-300 hover:text-[#8B0014] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 border border-transparent hover:border-rose-200 dark:hover:border-slate-700 shadow-2xs" 
                            : active
                              ? "px-3 py-2 text-xs font-extrabold bg-rose-50/90 dark:bg-rose-950/70 border-l-4 border-l-[#8B0014] dark:border-l-rose-500 border-y border-r border-rose-200/90 dark:border-rose-900/80 text-[#8B0014] dark:text-rose-200 shadow-xs"
                              : "px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/80 border border-transparent"
                        }`}
                      >
                        <div className={`flex items-center min-w-0 flex-1 ${isCollapsed ? "justify-center" : "gap-2"}`}>
                          <Icon className={`${isCollapsed ? "h-4.5 w-4.5" : "h-4 w-4"} ${
                            active ? "text-[#8B0014] dark:text-rose-400 scale-105" : "text-slate-400 dark:text-slate-500 group-hover:text-[#8B0014] dark:group-hover:text-rose-400"
                          } transition-transform shrink-0`} />
                          {!isCollapsed && (
                            <span className={`leading-snug truncate text-xs ${active ? "font-black" : "font-semibold"}`}>{item.name}</span>
                          )}
                        </div>
                        {!isCollapsed && item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider shrink-0 transition-colors ${
                              item.badge.includes("URGENT")
                                ? "bg-rose-600 text-white animate-pulse shadow-2xs"
                                : item.badge === "LIVE"
                                ? "bg-emerald-500 text-white"
                                : item.badge === "3" || item.badge === "500"
                                ? "bg-amber-400 text-amber-950 font-black"
                                : active
                                ? "bg-rose-200/90 dark:bg-rose-900/90 text-[#8B0014] dark:text-rose-200 font-bold"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {!isCollapsed && !item.badge && active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0014] dark:bg-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Section 2: DSS Tools & Support */}
          <div>
            {!isCollapsed ? (
              <span className="px-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                DSS Tools & Support
              </span>
            ) : (
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 mx-auto my-1" />
            )}
            <div className="space-y-1.5">
              {onOpenSimulator && (
                <button
                  onClick={() => {
                    onOpenSimulator();
                    setIsOpen(false);
                  }}
                  title="AHP Academic Simulator"
                  className={`w-full flex items-center rounded-xl transition shadow-2xs ${
                    isCollapsed
                      ? "justify-center h-11 w-11 mx-auto bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60"
                      : "px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                    <Layers className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} text-[#D97706] dark:text-amber-400 shrink-0`} />
                    {!isCollapsed && <span className="truncate font-bold">AHP Simulator</span>}
                  </div>
                </button>
              )}

              {onOpenChat && (
                <button
                  onClick={() => {
                    onOpenChat();
                    setIsOpen(false);
                  }}
                  title="AI Counselor & Guidance Assistant"
                  className={`w-full flex items-center rounded-xl transition shadow-2xs ${
                    isCollapsed 
                      ? "justify-center h-11 w-11 mx-auto bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-[#8B0014] dark:text-rose-300 border border-rose-200 dark:border-rose-900/60" 
                      : "px-3 py-2.5 text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100/90 dark:hover:bg-rose-900/50 border border-rose-200/90 dark:border-rose-900/60"
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                    <Bot className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} text-[#8B0014] dark:text-rose-400 shrink-0`} />
                    {!isCollapsed && <span className="truncate font-bold">AI Counselor</span>}
                  </div>
                </button>
              )}

              {onOpenOnboarding && (
                <button
                  onClick={() => {
                    onOpenOnboarding();
                    setIsOpen(false);
                  }}
                  title="Role Tour & Walkthrough Guide"
                  className={`w-full flex items-center rounded-xl transition shadow-2xs ${
                    isCollapsed
                      ? "justify-center h-11 w-11 mx-auto bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700/60 text-[#8B0014] dark:text-rose-300"
                      : "px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-300/80 dark:border-amber-800/60"
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"} text-amber-950 dark:text-amber-200 font-bold`}>
                    <Compass className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} text-[#8B0014] dark:text-rose-400 shrink-0`} />
                    {!isCollapsed && <span className="truncate font-bold">Role Tour & Guide</span>}
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  router.push("/dashboard/docs");
                  setIsOpen(false);
                }}
                title="System Design, Tech Stack & Risk Specs Documentation"
                className={`w-full flex items-center rounded-xl transition shadow-2xs ${
                  isCollapsed
                    ? pathname === "/dashboard/docs"
                      ? "justify-center h-11 w-11 mx-auto bg-rose-50 dark:bg-rose-950/70 border-2 border-[#8B0014] dark:border-rose-500 text-[#8B0014] dark:text-rose-300"
                      : "justify-center h-11 w-11 mx-auto bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    : pathname === "/dashboard/docs"
                    ? "px-3 py-2.5 text-xs sm:text-sm font-bold bg-rose-50 dark:bg-rose-950/60 text-[#8B0014] dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                    : "px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                  <BookOpen className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} text-[#8B0014] dark:text-rose-400 shrink-0`} />
                  {!isCollapsed && <span className="truncate font-bold">System &amp; Risk Docs</span>}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile & Footer Security Note */}
        <div className={`border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 ${isCollapsed ? "p-2 space-y-2 text-center" : "p-4 space-y-3"}`}>
          <button
            type="button"
            onClick={() => {
              if (onOpenAccount) {
                onOpenAccount();
              } else {
                router.push("/dashboard/profile");
              }
              setIsOpen(false);
            }}
            title={isCollapsed ? `Manage ${user?.full_name || "Account"}` : "Click to manage account settings"}
            className={`w-full flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#8B0014]/40 dark:hover:border-rose-500/40 shadow-2xs transition group text-left ${
              isCollapsed ? "justify-center h-12 w-12 mx-auto bg-white dark:bg-slate-800 hover:bg-rose-50/70 dark:hover:bg-slate-700 p-0" : "justify-between gap-3 bg-white dark:bg-slate-800 hover:bg-rose-50/70 dark:hover:bg-slate-700 p-3"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 min-w-0"}`}>
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className={`${isCollapsed ? "h-9 w-9" : "h-9 w-9"} rounded-xl object-cover border border-amber-400/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform`}
                />
              ) : (
                <div className={`${isCollapsed ? "h-9 w-9" : "h-9 w-9"} rounded-xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border border-amber-400/70 flex items-center justify-center font-extrabold text-white text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform`}>
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              {!isCollapsed && (
                <div className="overflow-hidden min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#8B0014] dark:group-hover:text-rose-400 truncate transition-colors">
                    {user?.full_name || "User Account"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize truncate">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-[#8B0014]/10 dark:group-hover:bg-rose-950/50 text-slate-400 dark:text-slate-300 group-hover:text-[#8B0014] dark:group-hover:text-rose-400 transition shrink-0">
                <Settings className="h-4 w-4" />
              </div>
            )}
          </button>

        </div>
      </aside>
    </>
  );
};
