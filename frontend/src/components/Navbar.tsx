import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  FileText,
  ChevronDown,
  LogOut,
  ShieldCheck,
  UserCircle,
  BarChart3,
  BookOpen,
  Upload,
  Users
} from "lucide-react";
import { SapcLogo } from "./SapcLogo";
import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { GlobalNotificationDrawer } from "./GlobalNotificationDrawer";
import { EmailSmsConfigModal } from "./EmailSmsConfigModal";
import { ParentConsultationModal } from "./ParentConsultationModal";
import { ReportExportModal } from "./ReportExportModal";
import { AcademicCalendarModal } from "./AcademicCalendarModal";
import { AccountManagementModal } from "./AccountManagementModal";
import { getActiveNotifications, AppNotification } from "@/lib/dataset-store";

interface NavbarProps {
  onOpenChat?: () => void;
  onOpenSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenChat, 
  onOpenSimulator
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEmailSmsOpen, setIsEmailSmsOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return typeof window !== "undefined" ? getActiveNotifications(user?.role) : [];
  });
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(getActiveNotifications(user?.role));
    };
    setNotifications(getActiveNotifications(user?.role));
    window.addEventListener("sapc:notifications-updated", handleNotifUpdate);
    return () => window.removeEventListener("sapc:notifications-updated", handleNotifUpdate);
  }, [user?.role]);

  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.read && !n.is_read).length;
  }, [notifications]);

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

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const rolesList: { role: RoleType; label: string; icon: string }[] = [
    { role: "guidance_counselor", label: "Counselor Portal", icon: "🧠" },
    { role: "teacher", label: "Teacher / Adviser", icon: "📚" },
    { role: "admin", label: "Administrator", icon: "⚙️" },
    { role: "student", label: "Student View", icon: "🎓" },
    { role: "parent", label: "Parent View", icon: "👨‍👩‍👦" }
  ];

  const currentRoleObj = rolesList.find((r) => r.role === user?.role) || {
    role: user?.role || "student",
    label: (user?.role || "student").replace("_", " "),
    icon: "🎓"
  };

  const handleNavigateTab = (tabName: string, _role?: string) => {
    if (typeof window !== "undefined") {
      const adminTabs = ["teachers", "create_user", "parents", "pending_registrations", "export_credentials", "import_wizard", "import_history", "revert_import", "quarter_management", "platform_settings"];
      if (adminTabs.includes(tabName) && !window.location.pathname.includes("/dashboard/admin") && user?.role === "admin") {
        router.push(`/dashboard/admin?tab=${tabName}`);
        return;
      }

      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab: tabName } }));
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
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </span>
              )}
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
            {(user?.role === "admin" || user?.role === "guidance_counselor") && (
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

            {/* Verified Role Badge */}
            <div className="flex items-center bg-amber-50/80 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700 rounded-xl px-3 py-1.5 shadow-2xs text-xs font-bold text-amber-950 dark:text-amber-200 gap-1.5">
              <span>{currentRoleObj.icon}</span>
              <span className="font-extrabold capitalize">{currentRoleObj.label}</span>
            </div>

            {/* User Avatar / Role Info Dropdown */}
            <div ref={userMenuRef} className="relative hidden sm:block pl-2.5 border-l border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsUserMenuOpen((p) => !p)}
                className="flex items-center gap-2.5 group cursor-pointer"
                title="User menu"
              >
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="avatar" className="h-9 w-9 rounded-full border-2 border-amber-400/80 object-cover shadow-xs" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400/80 flex items-center justify-center text-xs font-black text-white shadow-xs group-hover:border-amber-500 transition">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px]">{user?.full_name?.split(" ")[0]}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize">{user?.role?.replace("_", " ")}</p>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-150 hidden md:block ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Panel */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User header */}
                  <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      {currentRoleObj.icon} {currentRoleObj.label}
                    </span>
                  </div>

                  {/* Common: My Account */}
                  <div className="py-1.5">
                    <button
                      onClick={() => { setIsUserMenuOpen(false); router.push("/dashboard/profile"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4 text-slate-400" />
                      My Account &amp; Profile
                    </button>

                    {/* Admin / Counselor only */}
                    {(user?.role === "admin" || user?.role === "guidance_counselor") && (
                      <>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); setIsEmailSmsOpen(true); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Mail className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                          Email &amp; SMS Gateway
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); setIsExportOpen(true); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <FileText className="h-4 w-4 text-[#D97706]" />
                          Export Reports
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleNavigateTab("dataset"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Upload className="h-4 w-4 text-indigo-500" />
                          Manage Dataset
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleNavigateTab("accounts"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Users className="h-4 w-4 text-emerald-500" />
                          Manage Users
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => { setIsUserMenuOpen(false); handleNavigateTab("admin"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <ShieldCheck className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                            Admin Dashboard
                          </button>
                        )}
                      </>
                    )}

                    {/* Teacher only */}
                    {user?.role === "teacher" && (
                      <>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleNavigateTab("analytics"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <BarChart3 className="h-4 w-4 text-indigo-500" />
                          Class Analytics
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleNavigateTab("students"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <BookOpen className="h-4 w-4 text-emerald-500" />
                          Student Records
                        </button>
                      </>
                    )}

                    {/* Student only */}
                    {user?.role === "student" && (
                      <button
                        onClick={() => { setIsUserMenuOpen(false); handleNavigateTab("profile"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        My Academic Profile
                      </button>
                    )}

                    {/* Parent only */}
                    {user?.role === "parent" && (
                      <>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); setIsConsultationOpen(true); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <HeartHandshake className="h-4 w-4 text-rose-500" />
                          Book Consultation
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleNavigateTab("profile"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          Child&apos;s Progress
                        </button>
                      </>
                    )}

                    {/* Calendar — all roles */}
                    <button
                      onClick={() => { setIsUserMenuOpen(false); setIsCalendarOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Academic Calendar
                    </button>

                    {/* Theme toggle inside menu */}
                    <button
                      onClick={() => { setIsUserMenuOpen(false); toggleTheme(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      {resolvedTheme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-400" />}
                      {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-slate-100 dark:border-slate-800 py-1.5">
                    <button
                      onClick={() => { setIsUserMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
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
        role={user?.role}
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

      <AccountManagementModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
};
