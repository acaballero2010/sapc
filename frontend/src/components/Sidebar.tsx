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
  Sparkles,
  Settings
} from "lucide-react";
import { useAuth, RoleType } from "@/lib/auth-context";
import { SapcLogo } from "./SapcLogo";

interface SidebarProps {
  onOpenChat?: () => void;
  onOpenSimulator?: () => void;
  onOpenOnboarding?: () => void;
  onOpenAccount?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenChat, onOpenSimulator, onOpenOnboarding, onOpenAccount }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      name: "Guidance Counselor",
      href: "/dashboard/guidance",
      icon: Brain,
      role: "guidance_counselor" as RoleType,
      badge: "Crisis Triage"
    },
    {
      name: "Class Adviser",
      href: "/dashboard/teacher",
      icon: BookOpen,
      role: "teacher" as RoleType,
      badge: "SASS Portal"
    },
    {
      name: "Student Portal",
      href: "/dashboard/student",
      icon: GraduationCap,
      role: "student" as RoleType,
      badge: "Wellness"
    },
    {
      name: "Parent Portal",
      href: "/dashboard/parent",
      icon: Users,
      role: "parent" as RoleType,
      badge: "Progress"
    },
    {
      name: "Admin Control",
      href: "/dashboard/admin",
      icon: Sliders,
      role: "admin" as RoleType,
      badge: "AHP Matrix"
    }
  ];

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
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3.5">
            <SapcLogo size={44} showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                  SAPC <span className="text-[#8B0014]">IntellySys</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                San Antonio de Padua College
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Role Dashboards
            </span>
            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={async () => {
                      await switchRole(item.role);
                      setIsOpen(false);
                      router.push(item.href);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition ${
                      isActive
                        ? "bg-[#8B0014] text-white shadow-xs"
                        : "text-slate-800 hover:text-slate-950 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? "text-amber-300" : "text-slate-600"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick DSS Tools */}
          <div>
            <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              DSS Tools & Support
            </span>
            <div className="space-y-2">
              {onOpenSimulator && (
                <button
                  onClick={() => {
                    onOpenSimulator();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 text-[#D97706]" />
                    <span>AHP Simulator</span>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                    What-If
                  </span>
                </button>
              )}

              {onOpenChat && (
                <button
                  onClick={() => {
                    onOpenChat();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#8B0014] hover:bg-[#6D0010] shadow-2xs transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Bot className="h-4 w-4 text-white" />
                    <span>AI Counselor</span>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </button>
              )}

              {onOpenOnboarding && (
                <button
                  onClick={() => {
                    onOpenOnboarding();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition"
                >
                  <div className="flex items-center gap-2 text-amber-950 font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-[#8B0014]" />
                    <span>Role Tour & Guide</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-extrabold">3-Step</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Profile & Footer Security Note */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <button
            type="button"
            onClick={() => {
              if (onOpenAccount) onOpenAccount();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between gap-3 bg-white hover:bg-rose-50/70 p-3 rounded-2xl border border-slate-200 hover:border-[#8B0014]/40 shadow-2xs transition group text-left"
            title="Click to manage account settings"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border border-amber-400/70 flex items-center justify-center font-extrabold text-white text-sm shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#8B0014] truncate transition-colors">
                  {user?.full_name || "User Account"}
                </p>
                <p className="text-xs text-slate-500 font-medium capitalize truncate">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-[#8B0014]/10 text-slate-400 group-hover:text-[#8B0014] transition shrink-0">
              <Settings className="h-4 w-4" />
            </div>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>RA 10173 Privacy Protected</span>
          </div>
        </div>
      </aside>
    </>
  );
};
