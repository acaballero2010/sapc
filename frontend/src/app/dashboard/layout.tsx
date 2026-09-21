"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ChatbotModal } from "@/components/ChatbotModal";
import { SensitivitySimulator } from "@/components/SensitivitySimulator";
import { RoleOnboardingWizard } from "@/components/RoleOnboardingWizard";
import { UserMenuPopover } from "@/components/UserMenuPopover";
import { GlobalNotificationDrawer } from "@/components/GlobalNotificationDrawer";
import { CommandPalette } from "@/components/CommandPalette";
import { DatasetArchiveModal } from "@/components/DatasetArchiveModal";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

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

      const handleOpenCommand = () => setIsCommandOpen(true);
      const handleOpenArchive = () => setIsArchiveOpen(true);

      window.addEventListener("sapc:open-command-palette", handleOpenCommand);
      window.addEventListener("sapc:open-dataset-archive", handleOpenArchive);
      return () => {
        window.removeEventListener("sapc:open-command-palette", handleOpenCommand);
        window.removeEventListener("sapc:open-dataset-archive", handleOpenArchive);
      };
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-clip transition-colors duration-200">
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#8B0014] fixed top-0 left-0 right-0 z-50 shadow-xs" />

      <div className="flex flex-1 pt-1.5 min-w-0">
        {/* Sidebar Component */}
        <Sidebar
          onOpenChat={() => setIsChatOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenAccount={() => router.push("/dashboard/profile")}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Main Content Area offset by Sidebar width on lg screens */}
        <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
          
          {/* Top Global Dashboard Header Bar */}
          <header className="sticky top-1.5 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs gap-3 transition-colors duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center h-8 w-8 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#8B0014] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition shadow-2xs shrink-0"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label="Toggle sidebar"
              >
                {isCollapsed
                  ? <PanelLeftOpen className="h-4 w-4" />
                  : <PanelLeftClose className="h-4 w-4" />}
              </button>
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/40 text-[#8B0014] dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 capitalize flex items-center gap-1.5 shadow-2xs shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {user?.role ? `${user.role.replace("_", " ")} Portal` : "SAPC Portal"}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden xl:inline font-medium truncate">
                San Antonio de Padua College • IntellySys DSS
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Search Spotlight Trigger */}
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-2xs cursor-pointer"
                title="Open Global Search (Ctrl + K)"
              >
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  ⌘K
                </kbd>
              </button>

              {/* Rich user menu popover — includes notification bell + avatar dropdown */}
              <UserMenuPopover
                onOpenAccount={() => router.push("/dashboard/profile")}
                onOpenChat={() => setIsChatOpen(true)}
                onOpenNotifications={() => setIsNotifOpen(true)}
                notifCount={3}
              />
            </div>
          </header>

          <main className="flex-1 min-w-0 max-w-full w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          {/* Institutional Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-200">
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>© 2026 San Antonio de Padua College (SAPC) — IntellySys Decision Support System</p>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Compliant with Republic Act No. 10173 (Philippine Data Privacy Act)</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenArchive={() => setIsArchiveOpen(true)}
      />

      <DatasetArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
      />

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

      <GlobalNotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigateTab={(tab) => {
          window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab } }));
        }}
      />
    </div>
  );
}
