/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
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
  Settings, 
  AlertTriangle, 
  HeartHandshake, 
  TrendingUp, 
  Activity, 
  Compass, 
  PanelLeftClose, 
  PanelLeftOpen, 
  User, 
  BarChart3, 
  MessageSquare, 
  Calendar 
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

export const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenChat, 
  onOpenSimulator, 
  onOpenOnboarding, 
  onOpenAccount,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const currentRole: RoleType = user?.role || "guidance_counselor";

  // Role titles for brand tag
  const roleTitles: Record<RoleType, { title: string; subtitle: string; icon: string }> = {
    guidance_counselor: { title: "Guidance & Counseling", subtitle: "Multi-Factor Crisis Triage", icon: "🧠" },
    teacher: { title: "Class Adviser Portal", subtitle: "SASS & Guidance Referrals", icon: "📚" },
    student: { title: "Student Wellness Portal", subtitle: "5-Domain Holistic Profile", icon: "🎓" },
    parent: { title: "Parent & Family Portal", subtitle: "Student Progress & Advisories", icon: "👨‍👩‍👦" },
    admin: { title: "Administrative Control", subtitle: "AHP Weights & Audit Logs", icon: "⚙️" }
  };

  // Dedicated Workspace navigation items per role
  const roleWorkspaces: Record<RoleType, Array<{ name: string; href: string; icon: any; badge?: string }>> = {
    guidance_counselor: [
      {
        name: "Command Center",
        href: "/dashboard/guidance?tab=dashboard#triage-overview",
        icon: Brain,
        badge: "Overview"
      },
      {
        name: "Crisis Alerts Queue",
        href: "/dashboard/guidance?tab=crisis_alerts#alerts-queue",
        icon: AlertTriangle,
        badge: "Urgent"
      },
      {
        name: "Faculty Referrals",
        href: "/dashboard/guidance?tab=referrals#teacher-referrals",
        icon: HeartHandshake,
        badge: "Triage"
      },
      {
        name: "Student Roster",
        href: "/dashboard/guidance?tab=students#students-roster",
        icon: Users,
        badge: "Cohort"
      },
      {
        name: "Interventions & Approvals",
        href: "/dashboard/guidance?tab=interventions#active-interventions",
        icon: ShieldCheck,
        badge: "Caseload"
      },
      {
        name: "Counseling Sessions",
        href: "/dashboard/guidance?tab=sessions#sessions-schedule",
        icon: Calendar,
        badge: "Schedule"
      },
      {
        name: "Cohort Analytics",
        href: "/dashboard/guidance?tab=analytics#trend-analytics",
        icon: TrendingUp,
        badge: "AHP 5-Domain"
      }
    ],
    teacher: [
      {
        name: "Class Overview",
        href: "/dashboard/teacher?tab=dashboard#advisory-overview",
        icon: BarChart3,
        badge: "Overview"
      },
      {
        name: "Advisory Class Roster",
        href: "/dashboard/teacher?tab=students#roster",
        icon: Users,
        badge: "Students"
      },
      {
        name: "At-Risk Priority Focus",
        href: "/dashboard/teacher?tab=at_risk#at-risk-view",
        icon: AlertTriangle,
        badge: "Priority"
      },
      {
        name: "CSV Import Wizard",
        href: "/dashboard/teacher?tab=import_wizard#uploader",
        icon: Layers,
        badge: "DepEd SASS"
      },
      {
        name: "Interventions & Care",
        href: "/dashboard/teacher?tab=interventions#interventions-view",
        icon: ShieldCheck,
        badge: "Care Plans"
      },
      {
        name: "Digital Class Record",
        href: "/dashboard/teacher?tab=class_record#class-record-view",
        icon: BookOpen,
        badge: "Grades"
      },
      {
        name: "Messages & Referrals",
        href: "/dashboard/teacher?tab=messages#messages-view",
        icon: MessageSquare,
        badge: "Counselor"
      }
    ],
    student: [
      {
        name: "Student Profile",
        href: "/dashboard/student?tab=profile#student-profile",
        icon: User,
        badge: "Primary"
      },
      {
        name: "Holistic Wellness",
        href: "/dashboard/student?tab=progress#wellness-radar",
        icon: GraduationCap,
        badge: "5 Domains"
      },
      {
        name: "Academic Standing & GPA",
        href: "/dashboard/student?tab=grades#academic-records",
        icon: BookOpen,
        badge: "Grades"
      },
      {
        name: "Attendance Tracker",
        href: "/dashboard/student?tab=attendance#attendance-tracker",
        icon: Activity,
        badge: "DepEd"
      },
      {
        name: "Daily Mood & Screeners",
        href: "/dashboard/student?tab=mental_assessment#daily-mood",
        icon: HeartHandshake,
        badge: "Screeners"
      },
      {
        name: "Academic Simulator",
        href: "/dashboard/student?tab=forecast#academic-simulator",
        icon: Layers,
        badge: "What-If"
      }
    ],
    parent: [
      {
        name: "Parent Overview",
        href: "/dashboard/parent?tab=dashboard#parent-overview",
        icon: Users,
        badge: "Overview"
      },
      {
        name: "Child Progress & Wellness",
        href: "/dashboard/parent?tab=child_progress#progress-tracker",
        icon: TrendingUp,
        badge: "Consent"
      },
      {
        name: "Academic Reports",
        href: "/dashboard/parent?tab=academic_reports#grades-report",
        icon: BookOpen,
        badge: "Form 138"
      },
      {
        name: "Attendance Record",
        href: "/dashboard/parent?tab=attendance#attendance-history",
        icon: Activity,
        badge: "Patterns"
      },
      {
        name: "Care Interventions",
        href: "/dashboard/parent?tab=interventions#active-care",
        icon: ShieldCheck,
        badge: "Support"
      },
      {
        name: "Schedule Meeting",
        href: "/dashboard/parent?tab=schedule_meeting#consultation",
        icon: Calendar,
        badge: "PTC"
      },
      {
        name: "Adviser Messages",
        href: "/dashboard/parent?tab=messages#direct-chat",
        icon: MessageSquare,
        badge: "Direct"
      }
    ],
    admin: [
      {
        name: "System Command Center",
        href: "/dashboard/admin?tab=dashboard#admin-overview",
        icon: Users,
        badge: "Overview"
      },
      {
        name: "AHP Risk Configuration",
        href: "/dashboard/admin?tab=risk_config#weights-config",
        icon: Sliders,
        badge: "Weights"
      },
      {
        name: "Campus User Accounts",
        href: "/dashboard/admin?tab=teachers#campus-users",
        icon: Users,
        badge: "Directory"
      },
      {
        name: "Quarter Management",
        href: "/dashboard/admin?tab=quarter_management#calendar",
        icon: Calendar,
        badge: "Calendar"
      },
      {
        name: "Master Ingestion Hub",
        href: "/dashboard/admin?tab=import_wizard#master-import",
        icon: Layers,
        badge: "Master"
      },
      {
        name: "RA 10173 Audit Logs",
        href: "/dashboard/admin?tab=import_history#audit-logs",
        icon: ShieldCheck,
        badge: "Compliance"
      }
    ]
  };

  const currentWorkspaceItems = roleWorkspaces[currentRole] || roleWorkspaces.guidance_counselor;
  const currentRoleInfo = roleTitles[currentRole] || roleTitles.guidance_counselor;

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
        className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-slate-200 bg-white ${isCollapsed ? "flex flex-col items-center gap-3" : ""}`}>
          <div className="flex items-center justify-between w-full">
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : "min-w-0"}`}>
              <SapcLogo size={isCollapsed ? 36 : 42} showText={false} />
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                      SAPC <span className="text-[#8B0014]">IntellySys</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    San Antonio de Padua College
                  </p>
                </div>
              )}
            </div>

            {/* Collapse Toggle on Desktop */}
            {onToggleCollapse && !isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Collapse Sidebar for widescreen view"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Current Role Banner Badge */}
          {!isCollapsed ? (
            <div className="mt-3 px-3 py-2 bg-gradient-to-r from-rose-50 to-amber-50/60 border border-rose-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{currentRoleInfo.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#8B0014] truncate leading-tight">
                    {currentRoleInfo.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {currentRoleInfo.subtitle}
                  </p>
                </div>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active Verified Session" />
            </div>
          ) : (
            <div className="relative group flex items-center justify-center">
              <div 
                className="h-10 w-10 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 flex items-center justify-center text-lg shadow-2xs cursor-default"
                title={`${currentRoleInfo.title} (${currentRoleInfo.subtitle})`}
              >
                {currentRoleInfo.icon}
              </div>
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>
          )}

          {/* Expand Button when Collapsed */}
          {isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-[#8B0014] text-slate-600 border border-slate-200 transition shadow-2xs"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className={`flex-1 overflow-y-auto space-y-5 ${isCollapsed ? "px-2.5 py-4" : "px-4 py-5"}`}>
          {/* Section 1: Role Workspace Navigation */}
          <div>
            {!isCollapsed ? (
              <span className="px-3 text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                Workspace Navigation
              </span>
            ) : (
              <div className="w-8 h-px bg-slate-200 mx-auto my-1" />
            )}

            <nav className="space-y-1.5">
              {currentWorkspaceItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.name}-${idx}`}
                    type="button"
                    onClick={() => handleNavigation(item)}
                    title={item.name}
                    className={`w-full flex items-center rounded-xl transition group text-left ${
                      isCollapsed 
                        ? "justify-center h-11 w-11 mx-auto text-slate-700 hover:text-[#8B0014] hover:bg-rose-50 border border-transparent hover:border-rose-200 shadow-2xs" 
                        : "px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-100/90"
                    }`}
                  >
                    <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                      <Icon className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} text-[#8B0014] group-hover:scale-110 transition-transform shrink-0`} />
                      {!isCollapsed && (
                        <span className="font-bold text-slate-800 group-hover:text-slate-950 leading-snug">{item.name}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section 2: DSS Tools & Support */}
          <div>
            {!isCollapsed ? (
              <span className="px-3 text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                DSS Tools & Support
              </span>
            ) : (
              <div className="w-8 h-px bg-slate-200 mx-auto my-1" />
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
                      ? "justify-center h-11 w-11 mx-auto bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300"
                      : "px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                    <Layers className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} text-[#D97706] shrink-0`} />
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
                      ? "justify-center h-11 w-11 mx-auto bg-rose-50 hover:bg-rose-100 text-[#8B0014] border border-rose-200" 
                      : "px-3 py-2.5 text-xs sm:text-sm font-bold text-rose-950 bg-rose-50/70 hover:bg-rose-100/90 border border-rose-200/90"
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                    <Bot className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} text-[#8B0014] shrink-0`} />
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
                      ? "justify-center h-11 w-11 mx-auto bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#8B0014]"
                      : "px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-amber-50/70 hover:bg-amber-100 border border-amber-300/80"
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"} text-amber-950 font-bold`}>
                    <Compass className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} text-[#8B0014] shrink-0`} />
                    {!isCollapsed && <span className="truncate font-bold">Role Tour & Guide</span>}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Profile & Footer Security Note */}
        <div className={`border-t border-slate-200 bg-slate-50 ${isCollapsed ? "p-2 space-y-2 text-center" : "p-4 space-y-3"}`}>
          <button
            type="button"
            onClick={() => {
              if (onOpenAccount) onOpenAccount();
              setIsOpen(false);
            }}
            title={isCollapsed ? `Manage ${user?.full_name || "Account"}` : "Click to manage account settings"}
            className={`w-full flex items-center rounded-2xl border border-slate-200 hover:border-[#8B0014]/40 shadow-2xs transition group text-left ${
              isCollapsed ? "justify-center h-12 w-12 mx-auto bg-white hover:bg-rose-50/70 p-0" : "justify-between gap-3 bg-white hover:bg-rose-50/70 p-3"
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
                  <p className="text-sm font-bold text-slate-900 group-hover:text-[#8B0014] truncate transition-colors">
                    {user?.full_name || "User Account"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium capitalize truncate">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-[#8B0014]/10 text-slate-400 group-hover:text-[#8B0014] transition shrink-0">
                <Settings className="h-4 w-4" />
              </div>
            )}
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>RA 10173 Privacy Protected</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
