/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatbotModal } from "@/components/ChatbotModal";
import { SensitivitySimulator } from "@/components/SensitivitySimulator";
import { RoleOnboardingWizard } from "@/components/RoleOnboardingWizard";
import { AccountManagementModal } from "@/components/AccountManagementModal";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, User, Compass, Bot, PanelLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const showTour = sessionStorage.getItem("sapc_show_tour");
      if (showTour === "true") {
        setIsOnboardingOpen(true);
        sessionStorage.removeItem("sapc_show_tour");
      }

      // Check saved sidebar state or auto-collapse for 1024px viewports
      const saved = localStorage.getItem("sapc_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      } else if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true);
      }
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sapc_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-clip">
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#8B0014] fixed top-0 left-0 right-0 z-50 shadow-xs" />

      <div className="flex flex-1 pt-1.5 min-w-0">
        {/* Sidebar Component */}
        <Sidebar
          onOpenChat={() => setIsChatOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Main Content Area offset by Sidebar width on lg screens */}
        <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
          
          {/* Top Global Dashboard Header Bar */}
          <header className="sticky top-1.5 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs gap-3 transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 text-[#8B0014] border border-rose-200 capitalize flex items-center gap-1.5 shadow-2xs shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {user?.role ? `${user.role.replace("_", " ")} Portal` : "SAPC Portal"}
              </span>
              <span className="text-xs text-slate-400 hidden xl:inline font-medium truncate">
                San Antonio de Padua College • IntellySys DSS
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition shadow-2xs"
              >
                <Bot className="h-4 w-4 text-[#8B0014]" />
                <span>AI Guidance</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="hidden md:flex items-center gap-2 h-9 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 text-xs font-bold transition shadow-2xs"
              >
                <Compass className="h-4 w-4 text-[#8B0014]" />
                <span>Tour</span>
              </button>

              {/* Clickable Profile Trigger */}
              <button
                type="button"
                onClick={() => setIsAccountOpen(true)}
                className="flex items-center gap-2.5 h-9 pl-1.5 pr-3.5 rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200 hover:border-[#8B0014]/40 transition group shadow-2xs"
                title="Click to manage account settings and institution logo"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="h-6 w-6 rounded-lg object-cover border border-amber-400/80 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#8B0014] to-[#5A000D] border border-amber-400/80 flex items-center justify-center text-white text-[11px] font-extrabold shadow-xs shrink-0">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#8B0014] leading-tight truncate max-w-[120px]">
                    {user?.full_name || "Account"}
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium leading-none mt-0.5">Manage Profile →</p>
                </div>
              </button>
            </div>
          </header>

          <main className="flex-1 min-w-0 max-w-full w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          {/* Institutional Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs sm:text-sm text-slate-500 mt-auto">
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>© 2026 San Antonio de Padua College (SAPC) — IntellySys Decision Support System</p>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Compliant with Republic Act No. 10173 (Philippine Data Privacy Act)</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Modals */}
      <ChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <SensitivitySimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {user && (
        <RoleOnboardingWizard
          role={user.role}
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />
      )}

      <AccountManagementModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />
    </div>
  );
}
