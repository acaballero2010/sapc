"use client";

import React from "react";
import { useAuth, RoleType } from "@/lib/auth-context";
import { 
  GraduationCap, 
  Bot,
  Layers
} from "lucide-react";

interface NavbarProps {
  onOpenChat?: () => void;
  onOpenSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenChat, 
  onOpenSimulator
}) => {
  const { user, switchRole } = useAuth();

  const rolesList: { role: RoleType; label: string; icon: string }[] = [
    { role: "guidance_counselor", label: "Counselor", icon: "🧠" },
    { role: "teacher", label: "Teacher/Adviser", icon: "📚" },
    { role: "admin", label: "Admin", icon: "⚙️" },
    { role: "student", label: "Student", icon: "🎓" },
    { role: "parent", label: "Parent", icon: "👨‍👩‍👦" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">SAPC IntellySys</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                DSS v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">San Antonio de Padua College • Multi-Criteria DSS</p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* AHP Simulator Button */}
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Interactive AHP Sensitivity Simulation"
            >
              <Layers className="h-4 w-4 text-indigo-400" />
              <span className="hidden md:inline">AHP Simulator</span>
            </button>
          )}

          {/* AI Guidance Chatbot Button */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:brightness-110 transition"
            >
              <Bot className="h-4 w-4" />
              <span>AI Guidance Chatbot</span>
            </button>
          )}

          {/* Role Switcher (For Evaluation & Multi-role Demo) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className="text-[11px] font-semibold text-slate-400 px-2 hidden lg:inline">Role:</span>
            <select
              value={user?.role || "guidance_counselor"}
              onChange={(e) => switchRole(e.target.value as RoleType)}
              className="bg-slate-950 text-slate-200 text-xs font-medium rounded px-2.5 py-1 border border-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {rolesList.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Avatar / Role Info */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="h-8 w-8 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-300">
              {user?.full_name ? user.full_name.charAt(0) : "U"}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.full_name?.split(" ")[0]}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
