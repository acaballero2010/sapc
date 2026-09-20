import React, { useState, useEffect } from "react";
import { useAuth, RoleType } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useLanguage, SupportedLanguage } from "@/lib/language-context";
import { 
  Bot,
  Layers,
  MessageSquare,
  Search,
  Bell,
  Mail,
  HeartHandshake,
  Moon,
  Sun,
  Globe,
  Calendar,
  FileText
} from "lucide-react";
import { SapcLogo } from "./SapcLogo";
import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { GlobalNotificationDrawer } from "./GlobalNotificationDrawer";
import { EmailSmsConfigModal } from "./EmailSmsConfigModal";
import { ParentConsultationModal } from "./ParentConsultationModal";
import { ReportExportModal } from "./ReportExportModal";
import { AcademicCalendarModal } from "./AcademicCalendarModal";

interface NavbarProps {
  onOpenChat?: () => void;
  onOpenSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenChat, 
  onOpenSimulator
}) => {
  const { user, switchRole } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEmailSmsOpen, setIsEmailSmsOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const handleToggleCommand = () => setIsCommandPaletteOpen((prev) => !prev);
    const handleToggleNotif = () => setIsNotificationsOpen((prev) => !prev);
    const handleToggleConsult = () => setIsConsultationOpen(true);
    const handleToggleEmailSms = () => setIsEmailSmsOpen(true);
    const handleToggleExport = () => setIsExportOpen(true);
    const handleToggleCalendar = () => setIsCalendarOpen(true);

    window.addEventListener("sapc:toggle-command-palette", handleToggleCommand);
    window.addEventListener("sapc:toggle-notifications", handleToggleNotif);
    window.addEventListener("sapc:open-consultation-modal", handleToggleConsult);
    window.addEventListener("sapc:open-emailsms-modal", handleToggleEmailSms);
    window.addEventListener("sapc:open-export-modal", handleToggleExport);
    window.addEventListener("sapc:open-calendar-modal", handleToggleCalendar);

    return () => {
      window.removeEventListener("sapc:toggle-command-palette", handleToggleCommand);
      window.removeEventListener("sapc:toggle-notifications", handleToggleNotif);
      window.removeEventListener("sapc:open-consultation-modal", handleToggleConsult);
      window.removeEventListener("sapc:open-emailsms-modal", handleToggleEmailSms);
      window.removeEventListener("sapc:open-export-modal", handleToggleExport);
      window.removeEventListener("sapc:open-calendar-modal", handleToggleCalendar);
    };
  }, []);

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

  const handleNavigateTab = (tabName: string, targetRole?: string) => {
    if (targetRole && targetRole !== user?.role) {
      switchRole(targetRole as RoleType);
    }
    window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab: tabName } }));
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabName);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs transition-colors duration-200">
        {/* Top Accent Gold & Maroon Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#8B0014]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4">
            <SapcLogo size={44} showText={false} />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                  SAPC <span className="text-[#8B0014] dark:text-rose-400">IntellySys</span>
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold tracking-wide bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-full shadow-xs">
                  DepEd / CHED Accredited
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t.brand_subtitle}
              </p>
            </div>
          </div>

          {/* Global Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 shadow-2xs">
              <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                title="Select Language (EN / FIL / CEB)"
              >
                <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🇺🇸 English</option>
                <option value="fil" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🇵🇭 Filipino</option>
                <option value="ceb" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🇵🇭 Cebuano</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-amber-300 transition cursor-pointer"
              title={resolvedTheme === "dark" ? t.light_mode : t.dark_mode}
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Academic Calendar Button */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Academic Calendar & Case Conference Schedule"
            >
              <Calendar className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
              <span className="hidden md:inline">{t.calendar}</span>
            </button>

            {/* Export Reports Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Official DepEd Form 138 & AHP Export Dossier"
            >
              <FileText className="h-4 w-4 text-[#D97706]" />
              <span className="hidden lg:inline">{t.export_reports}</span>
            </button>

            {/* Spotlight Command Search Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700 transition shadow-2xs group cursor-pointer"
              title="Global Search & Defense Scenarios (Ctrl+K)"
            >
              <Search className="h-4 w-4 text-[#8B0014] dark:text-rose-400 group-hover:scale-110 transition" />
              <span className="hidden md:inline">{t.quick_search}</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-2xs">
                Ctrl+K
              </kbd>
            </button>

            {/* Notification Bell Trigger */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title={t.notifications}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* Book Consultation Modal Trigger */}
            <button
              onClick={() => setIsConsultationOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
              title="Schedule Parent-School Consultation"
            >
              <HeartHandshake className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
              <span>{t.book_consultation}</span>
            </button>

            {/* Email / SMS Gateway Config (for Admins / Counselors) */}
            {canPreviewRoles && (
              <button
                onClick={() => setIsEmailSmsOpen(true)}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                title="Resend Email & SMS Gateway Configuration"
              >
                <Mail className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                <span>{t.email_sms_gateway}</span>
              </button>
            )}

            {/* AHP Simulator Button */}
            {onOpenSimulator && (
              <button
                onClick={onOpenSimulator}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 transition shadow-xs cursor-pointer"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#8B0014] hover:bg-[#6D0010] text-white shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Bot className="h-4 w-4 text-white" />
                <span className="flex items-center gap-1.5">
                  AI Companion <MessageSquare className="h-3.5 w-3.5 text-amber-300" />
                </span>
              </button>
            )}

            {/* Role Switcher */}
            {canPreviewRoles ? (
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 shadow-xs">
                <span className="text-xs font-bold text-[#8B0014] dark:text-rose-400 px-2 hidden lg:inline">Role:</span>
                <select
                  value={user?.role || "guidance_counselor"}
                  onChange={(e) => switchRole(e.target.value as RoleType)}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#8B0014] transition cursor-pointer"
                >
                  {rolesList.map((r) => (
                    <option key={r.role} value={r.role} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {r.icon} {r.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center bg-amber-50/70 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700 rounded-xl px-3 py-1.5 shadow-2xs text-xs font-bold text-amber-950 dark:text-amber-200 gap-1.5">
                <span>{currentRoleObj.icon}</span>
                <span className="font-extrabold capitalize">{currentRoleObj.label}</span>
              </div>
            )}

            {/* User Avatar / Role Info */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2.5 border-l border-slate-200 dark:border-slate-700">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400/80 flex items-center justify-center text-xs font-black text-white shadow-xs">
                {user?.full_name ? user.full_name.charAt(0) : "U"}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{user?.full_name?.split(" ")[0]}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize">{user?.role?.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals & Slide-over Drawers */}
      <GlobalCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={handleNavigateTab}
      />

      <GlobalNotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={handleNavigateTab}
      />

      <EmailSmsConfigModal
        isOpen={isEmailSmsOpen}
        onClose={() => setIsEmailSmsOpen(false)}
      />

      <ParentConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />

      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <AcademicCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </>
  );
};
