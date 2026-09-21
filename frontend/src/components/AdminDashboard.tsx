"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Sliders, 
  ShieldCheck, 
  Award, 
  Users, 
  Search, 
  CheckCircle2, 
  Activity, 
  Layers, 
  GraduationCap, 
  Calendar, 
  RotateCcw, 
  UserPlus, 
  UserCheck, 
  BookOpen, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  Bell, 
  HelpCircle, 
  Edit, 
  Building,
  Upload,
  ImageIcon,
  Trash2,
  ShieldAlert,
  Key,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Copy,
  KeyRound,
  Check,
  Lock,
  Info
} from "lucide-react";
import { SapcLogo } from "./SapcLogo";
import { InstitutionalReportModal } from "./InstitutionalReportModal";
import { CohortTrendAnalytics } from "./CohortTrendAnalytics";
import { MultiDomainIngestionHub } from "./MultiDomainIngestionHub";
import { CounselorKnowledgeHubModal } from "./CounselorKnowledgeHubModal";
import { RiskBadge } from "./RiskBadge";
import { 
  getActiveStudentDataset, 
  saveStudentDataset, 
  computeCohortAggregates, 
  exportActiveDatasetToCSV,
  importFullCohortCSV,
  getActiveRiskWeights,
  saveRiskWeights,
  recalculateAHPForDataset,
  subscribeToStudentDataset,
  loadStudentDatasetFromFirestore
} from "@/lib/dataset-store";
import { useDragScroll } from "@/lib/useDragScroll";
import type { StudentRecord } from "@/data/students500";

// Tab types for all Admin Modules
export type AdminTabType = 
  | "dashboard"
  | "platform_settings"
  | "import_wizard"
  | "import_history"
  | "revert_import"
  | "students"
  | "create_student"
  | "student_profile"
  | "teachers"
  | "create_user"
  | "parents"
  | "pending_registrations"
  | "quarter_management"
  | "risk_config"
  | "interventions"
  | "intervention_suggestions"
  | "reports"
  | "notifications"
  | "knowledge_base"
  | "verify_assessments"
  | "export_credentials"
  | "export_import_history"
  | "audit_logs"
  | "data_integrity"
  | "system_health"
  | "admin_actions";

export const AdminDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTabType>("dashboard");
  const [selectedNavCategory, setSelectedNavCategory] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Live Student Dataset
  const [students, setStudents] = useState<StudentRecord[]>([]);

  useEffect(() => {
    // 1. Initial state from local store
    setStudents(getActiveStudentDataset());

    // 2. Load latest from Firestore cloud
    loadStudentDatasetFromFirestore().then((all) => {
      if (all && all.length > 0) setStudents(all);
    });

    // 3. Real-time multi-user subscription
    const unsubscribe = subscribeToStudentDataset((all) => {
      setStudents(all);
    });

    const handleDatasetUpdate = () => {
      setStudents(getActiveStudentDataset());
    };
    window.addEventListener("sapc:dataset-updated", handleDatasetUpdate);
    return () => {
      window.removeEventListener("sapc:dataset-updated", handleDatasetUpdate);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const cohortStats = useMemo(() => computeCohortAggregates(students), [students]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Modals & Sub-views
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showIngestionHub, setShowIngestionHub] = useState(false);
  const [isKnowledgeHubOpen, setIsKnowledgeHubOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const catDrag = useDragScroll();
  const tabsDrag = useDragScroll();

  // 13. Risk Config Weights State (Psychometrician Validated AHP 5-Domain)
  const [riskWeights, setRiskWeights] = useState(() => getActiveRiskWeights());

  const totalWeight = useMemo(() => {
    return Number((riskWeights.academic + riskWeights.family + riskWeights.health + riskWeights.mental + riskWeights.financial).toFixed(1));
  }, [riskWeights]);

  // Handle live AHP recalculation
  const handleSaveAndRecalculateAHP = () => {
    if (totalWeight !== 100.0) {
      showToast("Weights must equal exactly 100.0% before saving.");
      return;
    }
    saveRiskWeights(riskWeights);
    const recalculated = recalculateAHPForDataset(students, riskWeights);
    saveStudentDataset(recalculated, true);
    setStudents(recalculated);
    showToast(`Successfully recalculated AHP risk scores across ${recalculated.length} students with Cloud sync.`);
  };

  // Handle full CSV import
  const handleFullCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const result = await importFullCohortCSV(content);
          if (result.success) {
            showToast(`Imported and synced ${result.count} students from ${file.name} to Cloud Firestore.`);
          } else {
            showToast(`Import Error: ${result.error}`);
          }
        } catch {
          showToast("Failed to parse CSV file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Platform Settings & Institutional Branding (Campus Logo)
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sapc_custom_logo");
    }
    return null;
  });
  const [institutionName, setInstitutionName] = useState("San Antonio de Padua College");
  const [campusTagline, setCampusTagline] = useState("Foundation of Pila, Laguna, Inc. • IntellySys DSS");
  const [campusAddress, setCampusAddress] = useState("National Highway, Pila, Laguna 4010 Philippines");
  const [depEdSchoolId, setDepEdSchoolId] = useState("402681");
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const handleInstitutionalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast("Logo file size must be less than 4MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        localStorage.setItem("sapc_custom_logo", result);
        setCustomLogo(result);
        window.dispatchEvent(new Event("sapc_logo_updated"));
        showToast("Campus institutional logo updated across all platform portals!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetInstitutionalLogo = () => {
    localStorage.removeItem("sapc_custom_logo");
    setCustomLogo(null);
    window.dispatchEvent(new Event("sapc_logo_updated"));
    if (logoInputRef.current) logoInputRef.current.value = "";
    showToast("Campus logo reset to official SAPC 1979 crest.");
  };

  // 12. Quarter Calendar Config
  const [quarterConfig, setQuarterConfig] = useState([
    { id: "Q1", label: "1st Quarter (Diagnostic Period)", start: "2026-08-01", end: "2026-10-15", status: "Completed", isCurrent: false },
    { id: "Q2", label: "2nd Quarter (Midterm Remediation)", start: "2026-10-16", end: "2026-12-18", status: "Active Now", isCurrent: true },
    { id: "Q3", label: "3rd Quarter (Post-Holiday Recovery)", start: "2027-01-05", end: "2027-03-20", status: "Upcoming", isCurrent: false },
    { id: "Q4", label: "4th Quarter (Final Clearance & Retention)", start: "2027-03-22", end: "2027-05-30", status: "Upcoming", isCurrent: false }
  ]);

  // Campus Users & Faculty Directory
  const [campusUsers, setCampusUsers] = useState([
    { id: 1, name: "Maria Theresa Cruz, RGC", email: "counselor@sapc.edu.ph", role: "guidance_counselor", section: "Guidance Central (Lead RGC)", initialPassword: "counselor123", status: "Active" },
    { id: 2, name: "Mr. Roberto Santos, LPT", email: "teacher.santos@sapc.edu.ph", role: "teacher", section: "Grade 11 - St. Augustine (STEM)", initialPassword: "teacher123", status: "Active" },
    { id: 3, name: "Mrs. Clara Buenaflor, LPT", email: "teacher.buenaflor@sapc.edu.ph", role: "teacher", section: "Grade 11 - St. Thomas (HUMSS)", initialPassword: "teacher123", status: "Active" },
    { id: 4, name: "Mr. Arnold Dizon, LPT", email: "teacher.dizon@sapc.edu.ph", role: "teacher", section: "Grade 11 - St. Clare (ABM)", initialPassword: "teacher123", status: "Active" },
    { id: 5, name: "Prof. Annalyn Cruz, LPT", email: "teacher.cruz@sapc.edu.ph", role: "teacher", section: "Grade 12 - St. Jude (ABM)", initialPassword: "teacher123", status: "Active" },
    { id: 6, name: "Dr. Remedios Santos, Ed.D.", email: "admin@sapc.edu.ph", role: "admin", section: "Academic Affairs & Decision Governance", initialPassword: "admin123", status: "Active" }
  ]);

  // 11. Pending Registrations & Parent Linkage Verification Queue
  const [pendingRegistrations, setPendingRegistrations] = useState([
    { 
      id: "REG-201", 
      name: "Mrs. Elena Dimaculangan", 
      email: "parent.dimaculangan@gmail.com", 
      phone: "+63 917 555 0192", 
      role: "parent", 
      relationship: "Mother / Primary Guardian", 
      linkedStudent: "Joshua Dimaculangan", 
      linkedLRN: "109238475001",
      section: "Grade 11 - St. Augustine (STEM)",
      verificationDoc: "PSA Birth Certificate Attached (Verified)", 
      date: "2026-09-19" 
    },
    { 
      id: "REG-202", 
      name: "Mr. Arthur Reyes", 
      email: "arthur.reyes@yahoo.com", 
      phone: "+63 918 332 9481", 
      role: "parent", 
      relationship: "Father", 
      linkedStudent: "Samantha Nicole Reyes", 
      linkedLRN: "109238475004",
      section: "Grade 11 - St. Thomas (HUMSS)",
      verificationDoc: "Guardian ID & Authorization Form", 
      date: "2026-09-20" 
    },
    { 
      id: "REG-203", 
      name: "Prof. Annalyn Cruz, LPT", 
      email: "annalyn.cruz@sapc.edu.ph", 
      phone: "+63 920 119 2847", 
      role: "teacher", 
      relationship: "Faculty Adviser", 
      linkedStudent: "Grade 12 - St. Jude (ABM)", 
      linkedLRN: "N/A (Faculty)",
      section: "Grade 12 - St. Jude (ABM)",
      verificationDoc: "Faculty Appointment PRC License", 
      date: "2026-09-18" 
    }
  ]);

  const copyFacultySlip = (teacher: typeof campusUsers[0]) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sapc.edu.ph";
    const slip = `=====================================\nSAN ANTONIO DE PADUA COLLEGE (SAPC)\nFaculty & Adviser Portal Credentials\n=====================================\nFaculty Name: ${teacher.name}\nAssigned Advisory: ${teacher.section}\nInstitutional Email: ${teacher.email}\nDefault Initial Password: ${teacher.initialPassword || "teacher123"}\nSign-in Portal: ${origin}/login\n\n* Security Notice: Please sign in and update your password under Profile > Security Settings.\n=====================================`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(slip);
      showToast(`Copied onboarding credentials slip for ${teacher.name}!`);
    }
  };

  // 3. Import History Log
  const [importHistory] = useState([
    { id: "IMP-901", type: "DepEd SASS Grades Batch", importedBy: "Mr. Roberto Santos", count: 45, successRate: "100%", date: "2026-09-18 14:15", canRollback: true },
    { id: "IMP-902", type: "PHQ-9 Mental Health Screenings", importedBy: "Maria Theresa Cruz", count: 120, successRate: "98.4%", date: "2026-09-16 09:30", canRollback: true },
    { id: "IMP-903", type: "Master 500-Student Enrollment Roster", importedBy: "Dr. Remedios Santos", count: 500, successRate: "100%", date: "2026-08-15 10:00", canRollback: false }
  ]);

  // Categories for 22 Tabs
  const CATEGORIES = useMemo(() => [
    { id: "all", label: "All Master Controls (22)" },
    { id: "governance", label: "System & Platform Config (6)", tabIds: ["dashboard", "platform_settings", "risk_config", "quarter_management", "knowledge_base", "notifications"] },
    { id: "ingestion", label: "Master Ingestion & Rollback (5)", tabIds: ["import_wizard", "import_history", "revert_import", "verify_assessments", "export_import_history"] },
    { id: "students", label: "Student Master Registry (3)", tabIds: ["students", "create_student", "student_profile"] },
    { id: "users", label: "Campus Accounts & Security (5)", tabIds: ["teachers", "create_user", "parents", "pending_registrations", "export_credentials"] },
    { id: "compliance", label: "Interventions & Reports (3)", tabIds: ["interventions", "intervention_suggestions", "reports"] }
  ], []);

  const TAB_ITEMS: Array<{ id: AdminTabType; label: string; icon: any; badge?: string; category: string }> = [
    { id: "dashboard", label: "System Command Center", icon: Users, badge: "Master", category: "governance" },
    { id: "platform_settings", label: "Platform & Campus Logo", icon: Building, badge: "Admin Only", category: "governance" },
    { id: "risk_config", label: "AHP 5-Domain Risk Config", icon: Sliders, badge: "Weights", category: "governance" },
    { id: "quarter_management", label: "Quarter Management", icon: Calendar, badge: "Q2 Active", category: "governance" },
    { id: "import_wizard", label: "Master Import Wizard", icon: Layers, badge: "DepEd SASS", category: "ingestion" },
    { id: "import_history", label: "Import Audit History", icon: ShieldCheck, badge: `${importHistory.length}`, category: "ingestion" },
    { id: "revert_import", label: "Rollback & Revert Engine", icon: RotateCcw, badge: "Emergency", category: "ingestion" },
    { id: "students", label: "Master Student Registry", icon: BookOpen, badge: `${cohortStats.total || 500}`, category: "students" },
    { id: "create_student", label: "Create Single Student", icon: UserPlus, category: "students" },
    { id: "student_profile", label: "Student Override Editor", icon: Edit, category: "students" },
    { id: "teachers", label: "Teacher Accounts Roster", icon: GraduationCap, badge: "4 Active", category: "users" },
    { id: "create_user", label: "Create Campus Account", icon: Key, category: "users" },
    { id: "parents", label: "Parent Accounts & Links", icon: Users, category: "users" },
    { id: "pending_registrations", label: "Pending Registrations", icon: UserCheck, badge: `${pendingRegistrations.length} Due`, category: "users" },
    { id: "interventions", label: "System-Wide Interventions", icon: ShieldAlert, category: "compliance" },
    { id: "intervention_suggestions", label: "Bulk Recommendations", icon: Sparkles, category: "compliance" },
    { id: "reports", label: "DepEd / CHED Reports", icon: Award, category: "compliance" },
    { id: "notifications", label: "Broadcast Announcements", icon: Bell, category: "governance" },
    { id: "knowledge_base", label: "Knowledge Base & FAQs", icon: HelpCircle, category: "governance" },
    { id: "verify_assessments", label: "Verify Submitted Screeners", icon: Activity, category: "ingestion" },
    { id: "export_credentials", label: "Bulk Export Credentials", icon: Download, category: "users" },
    { id: "export_import_history", label: "Export Ingestion Logs", icon: FileSpreadsheet, category: "ingestion" }
  ];

  const visibleTabs = selectedNavCategory === "all"
    ? TAB_ITEMS
    : TAB_ITEMS.filter(t => t.category === selectedNavCategory);

  const selectedStudentObj = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students.slice(0, 10);
    const q = searchQuery.toLowerCase();
    return students.filter(s => 
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.lrn.includes(searchQuery) ||
      (s.section_name && s.section_name.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [students, searchQuery]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as AdminTabType;
      if (urlTab) setActiveTab(urlTab);

      const handleCustomNav = (e: CustomEvent<{ tab?: AdminTabType; source?: string }>) => {
        if (e.detail?.source === "tab_click") return;
        if (e.detail?.tab) setActiveTab(e.detail.tab);
      };
      window.addEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
      return () => window.removeEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
    }
  }, []);

  // Auto-scroll active tab and category into view smoothly when activeTab changes
  useEffect(() => {
    if (!isMounted) return;

    const parentCat = CATEGORIES.find(
      (c) => c.id !== "all" && c.tabIds?.includes(activeTab)
    );

    if (
      selectedNavCategory !== "all" &&
      parentCat &&
      !CATEGORIES.find((c) => c.id === selectedNavCategory)?.tabIds?.includes(activeTab)
    ) {
      setSelectedNavCategory("all");
    }

    const timer = setTimeout(() => {
      const activeTabEl = document.getElementById(`admin-tab-${activeTab}`);
      if (activeTabEl && tabsDrag.ref.current) {
        activeTabEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }

      const targetCatId = selectedNavCategory === "all" ? (parentCat?.id || "all") : selectedNavCategory;
      const activeCatEl = document.getElementById(`admin-cat-${targetCatId}`);
      if (activeCatEl && catDrag.ref.current) {
        activeCatEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeTab, selectedNavCategory, isMounted, CATEGORIES, catDrag.ref, tabsDrag.ref]);

  const handleTabChange = useCallback((tab: AdminTabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab, source: "tab_click" } }));
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6 pb-12 font-sans animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-7 pb-16 font-sans w-full max-w-full overflow-hidden px-1 sm:px-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Top Banner - Institutional Maroon & Gold (Mobile / Tablet Optimized) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-5 sm:p-7 md:p-8 shadow-md text-white border-t-4 border-amber-400">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                San Antonio de Padua College
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• System Administration &amp; Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Master System &amp; AHP Decision Governance
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-rose-50/95 leading-relaxed font-normal">
              Configure institutional AHP risk criteria weights, oversee DepEd SASS batch ingestion, manage campus user accounts, and enforce immutable RA 10173 audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsKnowledgeHubOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-purple-600/85 hover:bg-purple-600 text-white border border-purple-400/40 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
              title="Train and personalize the AI Counselor Knowledge Base"
            >
              <BrainCircuit className="h-4 w-4 text-purple-200" />
              <span>AI Training Hub</span>
            </button>

            <button
              onClick={() => handleTabChange("risk_config")}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Sliders className="h-4 w-4 text-[#8B0014]" />
              <span>Configure AHP Weights</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-extrabold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <Award className="h-4 w-4 text-amber-300" />
              <span>Executive Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* System KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <Users className="h-4 w-4 text-[#8B0014]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{cohortStats.total}</span>
            <span className="text-xs font-bold text-slate-400">Students</span>
          </div>
          <span className="text-[11px] text-slate-500">Across {cohortStats.sectionBreakdown.length || 12} Sections (JHS &amp; SHS)</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-rose-700 uppercase tracking-wider">High Risk / Tier 1</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">{cohortStats.highRiskCount}</span>
            <span className="text-xs font-bold text-slate-400">({cohortStats.highRiskPct}%)</span>
          </div>
          <span className="text-[11px] font-bold text-rose-700">Priority Guidance Interventions</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">AHP Consistency</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">0.048</span>
            <span className="text-xs font-bold text-slate-400">CR</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">✓ Saaty Valid (CR &le; 0.10)</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Cohort Risk Avg</span>
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-800">{cohortStats.avgRiskScore}</span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <span className="text-[11px] font-bold text-amber-800">Mean 5-Domain Vulnerability</span>
        </div>
      </div>

      {/* Navigation Hub: Category Switcher + Tabs */}
      <div className="space-y-2.5">
        {/* Category Filter Chips with Scroll Controls */}
        <div className="relative flex items-center">
          {catDrag.canScrollLeft && (
            <button
              type="button"
              onClick={() => catDrag.scrollBy(-220)}
              className="flex absolute -left-2 z-10 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer"
              title="Scroll categories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div 
            ref={catDrag.ref}
            {...catDrag.events}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth pb-1 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none w-full"
          >
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedNavCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`admin-cat-${cat.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedNavCategory(cat.id);
                    if (cat.id !== "all" && cat.tabIds && !cat.tabIds.includes(activeTab)) {
                      handleTabChange(cat.tabIds[0] as AdminTabType);
                    }
                  }}
                  className={`min-h-[34px] px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 cursor-pointer ${
                    isCatActive
                      ? "bg-[#8B0014] text-white shadow-2xs ring-2 ring-rose-200"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {catDrag.canScrollRight && (
            <button
              type="button"
              onClick={() => catDrag.scrollBy(220)}
              className="flex absolute -right-2 z-10 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer"
              title="Scroll categories right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categorized Navigation Tabs Bar (Scrollable Pill Strip with Left/Right Buttons) */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center">
          {tabsDrag.canScrollLeft && (
            <button
              type="button"
              onClick={() => tabsDrag.scrollBy(-260)}
              className="flex absolute left-2 z-10 h-8 w-8 rounded-xl bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer backdrop-blur-xs"
              title="Scroll modules left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div 
            ref={tabsDrag.ref}
            {...tabsDrag.events}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth px-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none text-xs font-bold w-full"
          >
            {visibleTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-tab-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#8B0014] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                      isActive ? "bg-amber-400 text-amber-950" : "bg-slate-200 text-slate-700"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {tabsDrag.canScrollRight && (
            <button
              type="button"
              onClick={() => tabsDrag.scrollBy(260)}
              className="flex absolute right-2 z-10 h-8 w-8 rounded-xl bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer backdrop-blur-xs"
              title="Scroll modules right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SYSTEM COMMAND CENTER (dashboard) */}
      {/* ========================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Longitudinal Matrix */}
              <CohortTrendAnalytics onSelectSection={() => handleTabChange("students")} />
            </div>

            {/* Recent Audit Activities */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#8B0014]" />
                System Activity &amp; Audit Trail
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-slate-900">AHP Weights Verification</strong>
                    <span className="text-slate-400 text-[10px]">Just now</span>
                  </div>
                  <p className="text-slate-600">CR = 0.048 verified for 30/20/20/15/15 vector.</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-slate-900">DepEd SASS Ingestion</strong>
                    <span className="text-slate-400 text-[10px]">2 hrs ago</span>
                  </div>
                  <p className="text-slate-600">Mr. Santos uploaded 45 STEM Grade 11 grades.</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-slate-900">De-escalation Approval</strong>
                    <span className="text-slate-400 text-[10px]">Yesterday</span>
                  </div>
                  <p className="text-slate-600">Angelica Dela Cruz risk score lowered to 32.0.</p>
                </div>
              </div>

              <button
                onClick={() => handleTabChange("import_history")}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition text-center"
              >
                View Full Audit Logs →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1.5 PLATFORM & INSTITUTIONAL BRANDING (platform_settings) */}
      {/* ========================================================= */}
      {activeTab === "platform_settings" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Building className="h-6 w-6 text-[#8B0014]" />
                  Institutional Branding &amp; Platform Configuration
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Manage official campus emblem, institutional identifiers, and platform-wide DSS branding
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-[#8B0014] border border-rose-200 self-start sm:self-auto">
                Admin Exclusive Control
              </span>
            </div>

            {/* Campus Logo & Emblem Customization */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[#8B0014]" />
                  Official Campus Seal &amp; Institutional Logo
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  This emblem appears across all user portals (Counselor, Faculty, Administrator, Student, Parent), generated PDF reports, and navigation headers.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Logo Preview */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Live Emblem Preview</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                    <SapcLogo size={72} />
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="text-xs font-black text-slate-800">
                      {customLogo ? "Custom Institutional Logo" : "Official SAPC 1979 Crest"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {customLogo ? "Active override saved in platform storage" : "Default San Antonio de Padua College seal"}
                    </p>
                  </div>
                </div>

                {/* Upload & Reset Controls */}
                <div className="lg:col-span-8 space-y-4">
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleInstitutionalLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                    <span className="font-extrabold block">Institutional Emblem Guidelines:</span>
                    <ul className="list-disc pl-4 space-y-1 text-amber-900">
                      <li>Recommended dimensions: Square (512x512px) or circular emblem for optimal crispness.</li>
                      <li>Accepted formats: PNG (transparent background recommended), JPG, WebP, or SVG.</li>
                      <li>Maximum upload size: 4.0 MB.</li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Upload className="h-4 w-4 text-amber-300" />
                      <span>Upload New Institutional Logo</span>
                    </button>

                    {customLogo && (
                      <button
                        type="button"
                        onClick={handleResetInstitutionalLogo}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                        <span>Reset to Default SAPC Crest</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Institution Metadata Form */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-base font-extrabold text-slate-900">
                Institutional Identification &amp; Accredited Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700">Official Institution Name</label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700">DepEd / CHED School ID</label>
                  <input
                    type="text"
                    value={depEdSchoolId}
                    onChange={(e) => setDepEdSchoolId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700">Campus System Tagline</label>
                  <input
                    type="text"
                    value={campusTagline}
                    onChange={(e) => setCampusTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700">Campus Postal Address</label>
                  <input
                    type="text"
                    value={campusAddress}
                    onChange={(e) => setCampusAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast("Institutional configuration saved successfully.")}
                  className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition shadow-xs cursor-pointer"
                >
                  Save Platform Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. RISK CONFIG (risk_config) - THE MOST IMPORTANT ADMIN PAGE */}
      {/* ========================================================= */}
      {activeTab === "risk_config" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="h-6 w-6 text-[#8B0014]" />
                  AHP 5-Domain Criteria Weights &amp; Threshold Configuration
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Configure the master risk calculation weights based on the psychometrician interview standard
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-black ${
                  totalWeight === 100.0 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}>
                  Total: {totalWeight}% ({totalWeight === 100.0 ? "Valid 100%" : "Must Equal 100%"})
                </span>
              </div>
            </div>

            {/* Sliders for 5 Domains */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-blue-950 text-sm">1. Academic Factor</span>
                  <span className="font-mono text-base font-black text-blue-900">{riskWeights.academic}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={riskWeights.academic}
                  onChange={(e) => setRiskWeights(prev => ({ ...prev, academic: Number(e.target.value) }))}
                  className="w-full accent-[#8B0014] cursor-pointer"
                />
                <p className="text-slate-600 text-[11px]">SASS grades, quizzes, exam marks, and quarterly GPA trends.</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-amber-950 text-sm">2. Family Dynamics</span>
                  <span className="font-mono text-base font-black text-amber-900">{riskWeights.family}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={riskWeights.family}
                  onChange={(e) => setRiskWeights(prev => ({ ...prev, family: Number(e.target.value) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-slate-600 text-[11px]">Parental support, home stability, and attendance cooperation.</p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-rose-950 text-sm">3. Physical Health</span>
                  <span className="font-mono text-base font-black text-rose-900">{riskWeights.health}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={riskWeights.health}
                  onChange={(e) => setRiskWeights(prev => ({ ...prev, health: Number(e.target.value) }))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <p className="text-slate-600 text-[11px]">Clinic visits, chronic illnesses, and sleep deprivation indicators.</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-purple-950 text-sm">4. Mental Health</span>
                  <span className="font-mono text-base font-black text-purple-900">{riskWeights.mental}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={riskWeights.mental}
                  onChange={(e) => setRiskWeights(prev => ({ ...prev, mental: Number(e.target.value) }))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-slate-600 text-[11px]">Standardized PHQ-9, GAD-7, and NLP chatbot distress detection.</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-emerald-950 text-sm">5. Financial Strain</span>
                  <span className="font-mono text-base font-black text-emerald-900">{riskWeights.financial}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={riskWeights.financial}
                  onChange={(e) => setRiskWeights(prev => ({ ...prev, financial: Number(e.target.value) }))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-slate-600 text-[11px]">Tuition arrears, 4Ps status, and working student employment burden.</p>
              </div>
            </div>

            {/* Threshold Configuration */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">Risk Tier Classification Boundaries:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-emerald-700 font-bold block">🟢 Low Risk Tier</span>
                  <p className="font-mono text-slate-900 font-bold">0.0 to 39.9</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-amber-800 font-bold block">🟡 Medium Risk Tier</span>
                  <p className="font-mono text-slate-900 font-bold">40.0 to 69.9</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-rose-700 font-bold block">🔴 High Risk Tier</span>
                  <p className="font-mono text-slate-900 font-bold">70.0 to 100.0</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const baselineWeights = { academic: 30.0, family: 20.0, health: 20.0, mental: 15.0, financial: 15.0 };
                  setRiskWeights(baselineWeights);
                  saveRiskWeights(baselineWeights);
                  const recalculated = recalculateAHPForDataset(students, baselineWeights);
                  saveStudentDataset(recalculated);
                  setStudents(recalculated);
                  showToast("Reset to Psychometrician Standard (30/20/20/15/15) and recalculated cohort.");
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                Reset to Psychometrician Baseline
              </button>
              <button
                type="button"
                onClick={handleSaveAndRecalculateAHP}
                className="px-5 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Sliders className="h-3.5 w-3.5 text-amber-300" />
                <span>Save &amp; Recalculate School Cohort</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. QUARTER MANAGEMENT (quarter_management) */}
      {/* ========================================================= */}
      {activeTab === "quarter_management" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-[#8B0014]" />
                  School Year Structure &amp; Quarter Calendar Controls
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Configure active grading terms, examination clearance deadlines, and diagnostic ingestion windows
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {quarterConfig.map((q) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    q.isCurrent ? "bg-amber-50/70 border-amber-300" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">{q.id}</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{q.label}</h4>
                      {q.isCurrent && (
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 font-black text-[10px] uppercase">Active Now</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">Timeline: {q.start} to {q.end}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!q.isCurrent && (
                      <button
                        onClick={() => {
                          setQuarterConfig(prev => prev.map(item => ({
                            ...item,
                            isCurrent: item.id === q.id,
                            status: item.id === q.id ? "Active Now" : "Configured"
                          })));
                          showToast(`Set ${q.id} as the current active grading quarter.`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                      >
                        Set as Active Quarter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MASTER IMPORT WIZARD (import_wizard) */}
      {/* ========================================================= */}
      {activeTab === "import_wizard" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="h-6 w-6 text-[#8B0014]" />
                Master Multi-Domain Data Ingestion Hub
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                System-wide access to upload and match CSV dataset columns for any grade, section, or domain
              </p>
            </div>

            <MultiDomainIngestionHub defaultDomain="academic" />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. IMPORT AUDIT HISTORY (import_history) */}
      {/* ========================================================= */}
      {activeTab === "import_history" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-[#8B0014]" />
                System-Wide Ingestion Audit Trail &amp; Import Logs
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-600">
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Import Type</th>
                    <th className="py-3 px-4">Imported By</th>
                    <th className="py-3 px-4">Records Count</th>
                    <th className="py-3 px-4">Success Rate</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {importHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{h.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{h.type}</td>
                      <td className="py-3 px-4 text-slate-600">{h.importedBy}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{h.count} rows</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">{h.successRate}</td>
                      <td className="py-3 px-4 text-slate-500">{h.date}</td>
                      <td className="py-3 px-4 text-right">
                        {h.canRollback && (
                          <button
                            onClick={() => {
                              setSelectedNavCategory("ingestion");
                              handleTabChange("revert_import");
                            }}
                            className="text-xs font-bold text-rose-700 hover:underline"
                          >
                            Rollback
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ROLLBACK & REVERT ENGINE (revert_import) */}
      {/* ========================================================= */}
      {activeTab === "revert_import" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <RotateCcw className="h-6 w-6 text-rose-600" />
                Emergency Ingestion Undo &amp; Rollback Safeguards
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Safely revert erroneous bulk imports with multi-factor audit confirmation
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-rose-50/60 border border-rose-200 space-y-3 text-xs text-slate-700">
              <h4 className="font-black text-rose-950 text-sm">Emergency Rollback Queue:</h4>
              <p className="leading-relaxed">
                If an adviser mistakenly imported an outdated grade sheet, click <strong>Rollback Batch</strong> to restore previous records without database corruption.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showToast("Simulated rollback: Batch IMP-901 reverted to pre-import state.")}
                  className="px-4 py-2 rounded-xl bg-rose-700 text-white font-bold text-xs hover:bg-rose-800 transition"
                >
                  Rollback Batch IMP-901 (45 STEM Grades)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MASTER STUDENTS REGISTRY (students) */}
      {/* ========================================================= */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Master Student Database ({cohortStats.total} Students)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Full administrative access across all {cohortStats.sectionBreakdown.length || 12} sections with dynamic AHP scoring
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => exportActiveDatasetToCSV(students)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-slate-600" />
                  <span>Export Active CSV</span>
                </button>

                <label className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-[#8B0014]" />
                  <span>Import / Re-Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFullCSVUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => handleTabChange("create_student")}
                  className="px-4 py-2 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition"
                >
                  + Add Single Student
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, LRN, section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#8B0014]"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-600">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">LRN</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">AHP Score</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.first_name} {s.last_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{s.lrn}</td>
                      <td className="py-3 px-4 text-slate-700">{s.section_name}</td>
                      <td className="py-3 px-4"><RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="sm" /></td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            handleTabChange("student_profile");
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200"
                        >
                          Override / Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. CREATE STUDENT (create_student) */}
      {/* ========================================================= */}
      {activeTab === "create_student" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-[#8B0014]" />
                Manually Enroll Single Student Record
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">For mid-term transferees, late enrollees, or special track admissions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">First Name:</label>
                <input type="text" placeholder="e.g. Juan" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Last Name:</label>
                <input type="text" placeholder="e.g. Dela Cruz" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Learner Reference Number (LRN - 12 Digits):</label>
                <input type="text" placeholder="109238475..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Advisory Section:</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                  <option value="Grade 11 - St. Augustine (STEM)">Grade 11 - St. Augustine (STEM)</option>
                  <option value="Grade 11 - St. Thomas (HUMSS)">Grade 11 - St. Thomas (HUMSS)</option>
                  <option value="Grade 11 - St. Clare (ABM)">Grade 11 - St. Clare (ABM)</option>
                  <option value="Grade 12 - St. Jude (ABM)">Grade 12 - St. Jude (ABM)</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => showToast("New student registered successfully.")}
                  className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition"
                >
                  Enroll Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. STUDENT OVERRIDE PROFILE (student_profile) */}
      {/* ========================================================= */}
      {activeTab === "student_profile" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <button
                  onClick={() => handleTabChange("students")}
                  className="text-xs font-bold text-slate-500 hover:text-[#8B0014] mb-2 block"
                >
                  ← Back to Student Registry
                </button>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Admin Data Override: {selectedStudentObj.first_name} {selectedStudentObj.last_name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">LRN: {selectedStudentObj.lrn} • {selectedStudentObj.section_name}</p>
              </div>
              <RiskBadge score={selectedStudentObj.latest_risk_score} tier={selectedStudentObj.latest_risk_tier} size="md" />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900">Data Correction &amp; Manual Override:</h4>
              <p className="text-slate-600 leading-relaxed">
                System administrators can override erroneous grade inputs or reset AHP calculation caches if an adviser uploaded corrupted CSV records.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => showToast(`Triggered AHP score re-computation for ${selectedStudentObj.first_name}`)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                >
                  Force Recalculate AHP Risk Score
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. TEACHER ACCOUNTS & CREDENTIALS DIRECTORY (teachers) */}
      {/* ========================================================= */}
      {activeTab === "teachers" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-[#8B0014]" />
                  Faculty &amp; Class Adviser Accounts Directory
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Provisioned institutional accounts, advisory section assignments, and default temporary passwords
                </p>
              </div>
              <button
                onClick={() => handleTabChange("create_user")}
                className="px-4 py-2 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Provision Faculty User</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold block">Administrator Faculty Hand-Off Guide:</span>
                <p className="leading-relaxed text-amber-800">
                  Below are the pre-configured accounts for faculty and homeroom advisers. You can copy individual onboarding slips to give to teachers during faculty orientation. Teachers will use their default password on initial login and can update it under <strong>Profile &gt; Security Settings</strong>.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600 text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Faculty Name</th>
                    <th className="py-3.5 px-4">Assigned Section / Track</th>
                    <th className="py-3.5 px-4">Institutional Email</th>
                    <th className="py-3.5 px-3">Initial Password</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {campusUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 font-extrabold block">{u.name}</strong>
                        <span className="text-xs text-slate-500 capitalize">{u.role.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {u.section}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-bold">
                          {u.initialPassword || "teacher123"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyFacultySlip(u)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#8B0014] hover:text-white text-slate-800 font-bold text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Copy Onboarding Credential Slip"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Slip</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast(`Password reset link dispatched to ${u.email}`)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                            title="Dispatch password reset token"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. CREATE CAMPUS USER (create_user) */}
      {/* ========================================================= */}
      {activeTab === "create_user" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Key className="h-6 w-6 text-[#8B0014]" />
                Provision New Campus User Account
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">Create login credentials for Teachers, Counselors, Parents, or Students</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name:</label>
                <input type="text" placeholder="e.g. Maria Clara Santos, LPT" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Institutional Email:</label>
                <input type="email" placeholder="user@sapc.edu.ph" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Role:</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                  <option value="teacher">Teacher / Class Adviser</option>
                  <option value="guidance_counselor">Guidance Counselor</option>
                  <option value="parent">Parent / Guardian</option>
                  <option value="student">Student</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Section / Department:</label>
                <input type="text" placeholder="e.g. Grade 11 - St. Augustine (STEM)" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => showToast("User created with default onboarding credentials.")}
                  className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition"
                >
                  Create Account &amp; Send Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. PENDING REGISTRATIONS & PARENT LINKAGE QUEUE */}
      {/* ========================================================= */}
      {activeTab === "pending_registrations" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-[#8B0014]" />
                  Parent Linkage &amp; Security Verification Queue
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Verify parent-student legal guardianship before granting access to confidential academic &amp; wellness records (DepEd DO 40 / RA 10173)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 self-start sm:self-auto">
                {pendingRegistrations.length} Pending Approvals
              </span>
            </div>

            <div className="space-y-3">
              {pendingRegistrations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No pending parent or faculty registrations in queue.
                </div>
              ) : (
                pendingRegistrations.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{p.name}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            p.role === "parent" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {p.role}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          <strong>Contact:</strong> {p.email} • {p.phone}
                        </p>
                        <p className="text-slate-700">
                          <strong>Target Child / Student:</strong> <span className="font-bold text-[#8B0014]">{p.linkedStudent}</span> (LRN: {p.linkedLRN})
                        </p>
                        <p className="text-slate-600">
                          <strong>Relationship / Track:</strong> {p.relationship} • {p.section}
                        </p>
                        <p className="text-slate-500 text-[11px] flex items-center gap-1 pt-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Document Status: <strong>{p.verificationDoc}</strong> (Requested {p.date})</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => {
                            setPendingRegistrations(prev => prev.filter(item => item.id !== p.id));
                            showToast(`Approved & linked student records for ${p.name}`);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve &amp; Link</span>
                        </button>
                        <button
                          onClick={() => {
                            setPendingRegistrations(prev => prev.filter(item => item.id !== p.id));
                            showToast(`Declined registration for ${p.name}`);
                          }}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. PARENT DIRECTORY (parents) */}
      {/* ========================================================= */}
      {activeTab === "parents" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-[#8B0014]" />
                  Verified Parent &amp; Guardian Directory
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Approved parent accounts linked to enrolled students with multi-channel SMS/Email notification bindings
                </p>
              </div>
              <button
                onClick={() => handleTabChange("pending_registrations")}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5"
              >
                <UserCheck className="h-4 w-4" />
                <span>View Approvals Queue ({pendingRegistrations.length})</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600 text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Parent / Guardian</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Linked Student &amp; LRN</th>
                    <th className="py-3.5 px-3">Relationship</th>
                    <th className="py-3.5 px-3 text-center">Linkage Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 font-extrabold block">Mrs. Elena Dimaculangan</strong>
                      <span className="text-xs text-slate-500">PTCA Representative</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      parent@sapc.edu.ph • +63 917 555 0192
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-[#8B0014] font-bold block">Joshua Dimaculangan</strong>
                      <span className="font-mono text-xs text-slate-500">LRN: 109238475001 • Grade 11 STEM</span>
                    </td>
                    <td className="py-3.5 px-3">Mother</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Verified &amp; Linked
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => showToast("Parent consultation details dispatched.")}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                      >
                        Contact
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 font-extrabold block">Mr. Arthur Reyes</strong>
                      <span className="text-xs text-slate-500">Guardian</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      arthur.reyes@yahoo.com • +63 918 332 9481
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-[#8B0014] font-bold block">Samantha Nicole Reyes</strong>
                      <span className="font-mono text-xs text-slate-500">LRN: 109238475004 • Grade 11 HUMSS</span>
                    </td>
                    <td className="py-3.5 px-3">Father</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Verified &amp; Linked
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => showToast("Parent consultation details dispatched.")}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                      >
                        Contact
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. KNOWLEDGE BASE & ALL REMAINING VIEWS (Fallbacks) */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 13. REPORTS, EXPORTS & KNOWLEDGE BASE */}
      {/* ========================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Award className="h-6 w-6 text-[#8B0014]" />
                  Official DepEd &amp; CHED Institutional Guidance Reports
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Generate compliance documents, multi-domain audit summaries, and accredited retention reports
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition flex items-center gap-1.5 shadow-xs"
                >
                  <Award className="h-4 w-4 text-amber-300" />
                  <span>Generate Official Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportActiveDatasetToCSV(students, "DepEd_Compliance_SAPC_Cohort.csv")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4 text-slate-600" />
                  <span>Export SASS CSV</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 block">DepEd Form 137 / 138 Sync</span>
                <p className="text-slate-600">Quarterly scholastic academic achievement and attendance summary.</p>
                <button onClick={() => exportActiveDatasetToCSV(students, "DepEd_Form_138_Sync.csv")} className="text-[#8B0014] font-bold hover:underline block pt-1">Download DepEd Format →</button>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 block">AHP Longitudinal Retention Audit</span>
                <p className="text-slate-600">Multi-semester risk tier progression and early dropout prevention data.</p>
                <button onClick={() => setIsReportOpen(true)} className="text-[#8B0014] font-bold hover:underline block pt-1">Open Audit Modal →</button>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 block">Mental Health &amp; Crisis Log Report</span>
                <p className="text-slate-600">DepEd Child Protection &amp; Mental Health Act RA 11036 compliance summary.</p>
                <button onClick={() => showToast("Mental Health compliance log exported.")} className="text-[#8B0014] font-bold hover:underline block pt-1">Export RA 11036 Log →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "export_credentials" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Download className="h-6 w-6 text-[#8B0014]" />
                  Bulk Export Campus Credentials &amp; Cohort Roster
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">Secure credential distribution for faculty, guidance staff, and parent accounts</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-3">
              <span className="font-extrabold text-amber-950 block">Active Student Cohort Export ({cohortStats.total} Records)</span>
              <p className="text-amber-900 leading-relaxed">
                Download the complete 5-domain dataset with LRNs, advisory sections, composite risk scores, and granular scores. You can modify this spreadsheet and re-upload it via the Master Import Wizard or Student Registry to test custom scenarios.
              </p>
              <button
                type="button"
                onClick={() => exportActiveDatasetToCSV(students)}
                className="px-4 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition flex items-center gap-2 shadow-xs"
              >
                <Download className="h-4 w-4 text-amber-300" />
                <span>Download Complete 5-Domain Cohort CSV ({cohortStats.total} Rows)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "parents" || activeTab === "interventions" || activeTab === "intervention_suggestions" || activeTab === "notifications" || activeTab === "knowledge_base" || activeTab === "verify_assessments" || activeTab === "export_import_history") && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">
                {activeTab.replace(/_/g, " ")} Module
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">San Antonio de Padua College administrative oversight console</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed font-medium">
                Administrative tools active for {activeTab.replace(/_/g, " ")}. All operations are logged under the immutable RA 10173 audit trail.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => showToast(`Operation executed for ${activeTab}`)}
                  className="px-4 py-2 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition"
                >
                  Execute Administrative Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Report Modal */}
      <InstitutionalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <CounselorKnowledgeHubModal
        isOpen={isKnowledgeHubOpen}
        onClose={() => setIsKnowledgeHubOpen(false)}
        currentUserRole="admin"
        currentUserName="System Administrator"
      />
    </div>
  );
};
