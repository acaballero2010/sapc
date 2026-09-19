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
  Eye,
  Repeat,
  Compass,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight
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
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showRolePreview, setShowRolePreview] = useState(true);

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
        name: "Triage & Risk Monitor",
        href: "/dashboard/guidance#triage-overview",
        icon: Brain,
        badge: "AHP Synthesis"
      },
      {
        name: "NLP Crisis Alerts Queue",
        href: "/dashboard/guidance#alerts-queue",
        icon: AlertTriangle,
        badge: "Live Signals"
      },
      {
        name: "Teacher Referral Queue",
        href: "/dashboard/guidance#teacher-referrals",
        icon: HeartHandshake,
        badge: "Faculty Ingest"
      },
      {
        name: "Student Cohort Registry",
        href: "/dashboard/guidance#students-roster",
        icon: Users,
        badge: "1,250 Monitored"
      },
      {
        name: "Trend & Retention Analytics",
        href: "/dashboard/guidance#trend-analytics",
        icon: TrendingUp,
        badge: "Longitudinal"
      },
      {
        name: "Active Care Protocols",
        href: "/dashboard/guidance#active-interventions",
        icon: ShieldCheck,
        badge: "Case Plans"
      }
    ],
    teacher: [
      {
        name: "Class Roster & SASS Grades",
        href: "/dashboard/teacher",
        icon: BookOpen,
        badge: "Advisory"
      },
      {
        name: "1-Click Guidance Referral",
        href: "/dashboard/teacher",
        icon: HeartHandshake,
        badge: "Submit Case"
      },
      {
        name: "SASS CSV Batch Ingestion",
        href: "/dashboard/teacher",
        icon: Layers,
        badge: "DepEd SASS"
      }
    ],
    student: [
      {
        name: "My Holistic Wellness",
        href: "/dashboard/student",
        icon: GraduationCap,
        badge: "5 Domains"
      },
      {
        name: "Academic Standing & GPA",
        href: "/dashboard/student",
        icon: BookOpen,
        badge: "Quarter 2"
      },
      {
        name: "Daily Mood Check-in",
        href: "/dashboard/student",
        icon: HeartHandshake,
        badge: "Daily"
      },
      {
        name: "AHP Academic Simulator",
        href: "/dashboard/student",
        icon: Layers,
        badge: "What-If"
      }
    ],
    parent: [
      {
        name: "Child Academic Progress",
        href: "/dashboard/parent",
        icon: Users,
        badge: "SASS Live"
      },
      {
        name: "Attendance & Health Tracking",
        href: "/dashboard/parent",
        icon: Activity,
        badge: "Quarter 1"
      },
      {
        name: "Guidance Advisories",
        href: "/dashboard/parent",
        icon: Brain,
        badge: "Counselor"
      }
    ],
    admin: [
      {
        name: "AHP Pairwise Criteria Matrix",
        href: "/dashboard/admin",
        icon: Sliders,
        badge: "Weight Engine"
      },
      {
        name: "System Audit & RA 10173 Logs",
        href: "/dashboard/admin",
        icon: ShieldCheck,
        badge: "Compliance"
      },
      {
        name: "Campus User Accounts",
        href: "/dashboard/admin",
        icon: Users,
        badge: "5 Roles"
      }
    ]
  };

  // Demo evaluator role list
  const evaluatorRoles: Array<{ role: RoleType; name: string; icon: string; path: string }> = [
    { role: "guidance_counselor", name: "Guidance Counselor", icon: "🧠", path: "/dashboard/guidance" },
    { role: "teacher", name: "Class Adviser", icon: "📚", path: "/dashboard/teacher" },
    { role: "student", name: "Student Portal", icon: "🎓", path: "/dashboard/student" },
    { role: "parent", name: "Parent Portal", icon: "👨‍👩‍👦", path: "/dashboard/parent" },
    { role: "admin", name: "Admin Control", icon: "⚙️", path: "/dashboard/admin" }
  ];

  const currentWorkspaceItems = roleWorkspaces[currentRole] || roleWorkspaces.guidance_counselor;
  const currentRoleInfo = roleTitles[currentRole] || roleTitles.guidance_counselor;

  const handleNavigation = (item: { href: string }) => {
    setIsOpen(false);
    const [targetPath, hash] = item.href.split("#");
    if (pathname === targetPath && hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
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
              className="hidden lg:flex items-center justify-center h-8 w-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-[#8B0014] text-slate-600 border border-slate-200 transition shadow-2xs mt-1"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className={`flex-1 overflow-y-auto space-y-6 ${isCollapsed ? "px-2 py-4" : "px-4 py-5"}`}>
          {/* Section 1: Role Workspace Navigation */}
          <div>
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-3 mb-2.5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Workspace Navigation
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  Role Verified
                </span>
              </div>
            ) : (
              <div className="w-full h-px bg-slate-200 my-2" />
            )}

            <nav className="space-y-1">
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
                        ? "justify-center p-2.5 text-slate-700 hover:text-[#8B0014] hover:bg-rose-50/80" 
                        : "justify-between px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-100/90"
                    }`}
                  >
                    <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                      <Icon className={`h-4 w-4 text-[#8B0014] group-hover:scale-110 transition-transform shrink-0`} />
                      {!isCollapsed && (
                        <span className="truncate font-bold text-slate-800 group-hover:text-slate-950">{item.name}</span>
                      )}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 group-hover:bg-amber-100 text-slate-600 group-hover:text-amber-900 border border-slate-200 transition shrink-0 ml-1">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section 2: DSS Tools & Support */}
          <div>
            {!isCollapsed && (
              <span className="px-3 text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                DSS Tools & Support
              </span>
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
                      ? "justify-center p-2.5 bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-300"
                      : "justify-between px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                    <Layers className="h-4 w-4 text-[#D97706]" />
                    {!isCollapsed && <span>AHP Simulator</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                      What-If
                    </span>
                  )}
                </button>
              )}

              {onOpenChat && (
                <button
                  onClick={() => {
                    onOpenChat();
                    setIsOpen(false);
                  }}
                  title="AI Counselor & Guidance Assistant"
                  className={`w-full flex items-center rounded-xl text-white bg-[#8B0014] hover:bg-[#6D0010] shadow-2xs transition ${
                    isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2 text-xs sm:text-sm font-bold"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                    <Bot className="h-4 w-4 text-white" />
                    {!isCollapsed && <span>AI Counselor</span>}
                  </div>
                  {!isCollapsed && <MessageSquare className="h-3.5 w-3.5 text-amber-300" />}
                </button>
              )}

              {onOpenOnboarding && (
                <button
                  onClick={() => {
                    onOpenOnboarding();
                    setIsOpen(false);
                  }}
                  title="Role Tour & Walkthrough Guide"
                  className={`w-full flex items-center rounded-xl transition ${
                    isCollapsed
                      ? "justify-center p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#8B0014]"
                      : "justify-between px-3 py-2 text-xs font-bold text-slate-700 bg-amber-50/70 hover:bg-amber-100 border border-amber-300/80"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} text-amber-950 font-bold`}>
                    <Compass className="h-3.5 w-3.5 text-[#8B0014]" />
                    {!isCollapsed && <span>Role Tour & Guide</span>}
                  </div>
                  {!isCollapsed && <span className="text-[10px] text-amber-800 font-extrabold">3-Step</span>}
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Role Preview (Evaluator Switcher for Demos) */}
          <div className="pt-2 border-t border-slate-200">
            <div className={`bg-slate-50 border border-slate-200/90 rounded-2xl ${isCollapsed ? "p-2 space-y-1.5 text-center" : "p-3 space-y-2.5"}`}>
              {!isCollapsed && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <Eye className="h-3.5 w-3.5 text-[#8B0014]" />
                    <span>Role Preview</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 shadow-2xs">
                    Demo Switcher
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-1">
                {evaluatorRoles.map((item) => {
                  const isCurrent = currentRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      title={`Switch to ${item.name}`}
                      onClick={async () => {
                        await switchRole(item.role);
                        setIsOpen(false);
                        router.push(item.path);
                      }}
                      className={`w-full flex items-center rounded-lg transition ${
                        isCollapsed
                          ? `justify-center p-2 text-sm ${isCurrent ? "bg-[#8B0014] text-white shadow-xs" : "hover:bg-white text-slate-700"}`
                          : `justify-between px-2.5 py-1.5 text-xs font-bold ${
                              isCurrent
                                ? "bg-[#8B0014] text-white shadow-2xs"
                                : "text-slate-700 hover:bg-white hover:text-slate-950 border border-transparent hover:border-slate-200"
                            }`
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2 min-w-0"}`}>
                        <span className="text-xs shrink-0">{item.icon}</span>
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && isCurrent && (
                        <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded shrink-0">
                          Active
                        </span>
                      )}
                      {!isCollapsed && !isCurrent && (
                        <Repeat className="h-3 w-3 text-slate-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
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
              isCollapsed ? "justify-center p-2 bg-white hover:bg-rose-50/70" : "justify-between gap-3 bg-white hover:bg-rose-50/70 p-3"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 min-w-0"}`}>
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="h-9 w-9 rounded-xl object-cover border border-amber-400/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border border-amber-400/70 flex items-center justify-center font-extrabold text-white text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
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
