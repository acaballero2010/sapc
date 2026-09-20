"use client";

import React from "react";
import { useAuth, RoleType } from "@/lib/auth-context";
import { 
  Bot,
  Layers,
  MessageSquare
} from "lucide-react";
import { SapcLogo } from "./SapcLogo";

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
    { role: "guidance_counselor", label: "Counselor Portal", icon: "🧠" },
    { role: "teacher", label: "Teacher / Adviser", icon: "📚" },
    { role: "admin", label: "Administrator", icon: "⚙️" },
    { role: "student", label: "Student View", icon: "🎓" },
    { role: "parent", label: "Parent View", icon: "👨‍👩‍👦" }
  ];

  const canPreviewRoles = user?.role === "admin" || user?.role === "guidance_counselor";
  const currentRoleObj = rolesList.find((r) => r.role === user?.role) || {
    role: user?.role || "student",
    label: (user?.role || "student").replace("_", " "),
    icon: "🎓"
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Accent Gold & Maroon Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#8B0014]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-4">
          <SapcLogo size={44} showText={false} />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                SAPC <span className="text-[#8B0014]">IntellySys</span>
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold tracking-wide bg-amber-50 text-amber-800 border border-amber-300 rounded-full shadow-xs">
                DepEd / CHED Accredited
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              San Antonio de Padua College • Multi-Factor Decision Support
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-3">
          {/* AHP Simulator Button */}
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition shadow-xs"
              title="Interactive AHP Sensitivity Simulation"
            >
              <Layers className="h-4 w-4 text-[#D97706]" />
              <span className="hidden md:inline">AHP Simulator</span>
            </button>
          )}

          {/* AI Guidance Chatbot Button */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#8B0014] hover:bg-[#6D0010] text-white shadow-xs transition active:scale-95"
            >
              <Bot className="h-4 w-4 text-white" />
              <span className="flex items-center gap-1.5">
                AI Companion <MessageSquare className="h-3.5 w-3.5 text-amber-300" />
              </span>
            </button>
          )}

          {/* Role Switcher for Admin/Counselor, or Fixed Badge for Students/Parents/Teachers */}
          {canPreviewRoles ? (
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-xs">
              <span className="text-xs font-bold text-[#8B0014] px-2 hidden lg:inline">Role:</span>
              <select
                value={user?.role || "guidance_counselor"}
                onChange={(e) => switchRole(e.target.value as RoleType)}
                className="bg-white text-slate-900 text-xs sm:text-sm font-semibold rounded-lg px-3 py-1.5 border border-slate-200 focus:outline-none focus:border-[#8B0014] transition cursor-pointer"
              >
                {rolesList.map((r) => (
                  <option key={r.role} value={r.role} className="bg-white text-slate-900">
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center bg-amber-50/70 border border-amber-300/80 rounded-xl px-3 py-1.5 shadow-2xs text-xs font-bold text-amber-950 gap-1.5">
              <span>{currentRoleObj.icon}</span>
              <span className="font-extrabold capitalize">{currentRoleObj.label}</span>
            </div>
          )}

          {/* User Avatar / Role Info */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400/80 flex items-center justify-center text-sm font-black text-white shadow-xs">
              {user?.full_name ? user.full_name.charAt(0) : "U"}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 truncate max-w-[140px]">{user?.full_name?.split(" ")[0]}</p>
              <p className="text-xs text-slate-500 font-medium capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
