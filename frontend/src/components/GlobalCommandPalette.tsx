"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Users, 
  AlertTriangle, 
  PhoneCall, 
  BookOpen, 
  Calendar, 
  Activity, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  X,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Brain,
  Sliders,
  Mail,
  Copy,
  Check,
  Building,
  UserCheck,
  RotateCcw
} from "lucide-react";
import type { StudentRecord } from "@/data/students500";
import { useAuth } from "@/lib/auth-context";
import { getActiveStudentDataset, getIngestionHistory } from "@/lib/dataset-store";

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (student: StudentRecord) => void;
  onNavigateTab?: (tabName: string, role?: string) => void;
}

export interface CampusAccountItem {
  id: string | number;
  name: string;
  email: string;
  role: "admin" | "guidance_counselor" | "teacher" | "parent" | "student";
  roleLabel: string;
  departmentOrSection: string;
  initialPassword?: string;
  status: "Active" | "Pending" | "Verified";
  linkedStudent?: string;
  phone?: string;
}

export const MASTER_CAMPUS_ACCOUNTS: CampusAccountItem[] = [
  // Institutional Staff & Leadership
  {
    id: "ACC-ADM-001",
    name: "Dr. Remedios Santos, Ed.D.",
    email: "admin@sapc.edu.ph",
    role: "admin",
    roleLabel: "Platform Administrator / Dean",
    departmentOrSection: "Academic Affairs & Decision Governance",
    initialPassword: "admin123",
    status: "Active"
  },
  {
    id: "ACC-RGC-001",
    name: "Maria Theresa Cruz, RGC",
    email: "counselor@sapc.edu.ph",
    role: "guidance_counselor",
    roleLabel: "Registered Guidance Counselor (Lead RGC)",
    departmentOrSection: "Guidance Central (Counseling Office)",
    initialPassword: "counselor123",
    status: "Active"
  },
  // Faculty & Advisers
  {
    id: "ACC-FAC-001",
    name: "Mr. Roberto Santos, LPT",
    email: "teacher.santos@sapc.edu.ph",
    role: "teacher",
    roleLabel: "Senior High Faculty (Class Adviser)",
    departmentOrSection: "Grade 11 - St. Augustine (STEM)",
    initialPassword: "teacher123",
    status: "Active"
  },
  {
    id: "ACC-FAC-002",
    name: "Mrs. Clara Buenaflor, LPT",
    email: "teacher.buenaflor@sapc.edu.ph",
    role: "teacher",
    roleLabel: "Senior High Faculty (Class Adviser)",
    departmentOrSection: "Grade 11 - St. Thomas (HUMSS)",
    initialPassword: "teacher123",
    status: "Active"
  },
  {
    id: "ACC-FAC-003",
    name: "Mr. Arnold Dizon, LPT",
    email: "teacher.dizon@sapc.edu.ph",
    role: "teacher",
    roleLabel: "Senior High Faculty (Class Adviser)",
    departmentOrSection: "Grade 11 - St. Clare (ABM)",
    initialPassword: "teacher123",
    status: "Active"
  },
  {
    id: "ACC-FAC-004",
    name: "Prof. Annalyn Cruz, LPT",
    email: "teacher.cruz@sapc.edu.ph",
    role: "teacher",
    roleLabel: "Senior High Faculty (Class Adviser)",
    departmentOrSection: "Grade 12 - St. Jude (ABM)",
    initialPassword: "teacher123",
    status: "Active"
  },
  // Parents & Guardians
  {
    id: "ACC-PAR-001",
    name: "Mrs. Elena Dimaculangan",
    email: "parent.dimaculangan@gmail.com",
    role: "parent",
    roleLabel: "Parent / Primary Guardian",
    departmentOrSection: "Linked: Joshua Dimaculangan (109238475001)",
    phone: "+63 917 555 0192",
    linkedStudent: "Joshua Dimaculangan",
    status: "Verified"
  },
  {
    id: "ACC-PAR-002",
    name: "Mr. Arthur Reyes",
    email: "arthur.reyes@yahoo.com",
    role: "parent",
    roleLabel: "Parent / Guardian",
    departmentOrSection: "Linked: Samantha Nicole Reyes (109238475004)",
    phone: "+63 918 332 9481",
    linkedStudent: "Samantha Nicole Reyes",
    status: "Verified"
  },
  {
    id: "ACC-PAR-003",
    name: "Carmen Dimaculangan",
    email: "parent@sapc.edu.ph",
    role: "parent",
    roleLabel: "Parent / Guardian",
    departmentOrSection: "Linked: Joshua Dimaculangan (STEM)",
    initialPassword: "parent123",
    status: "Active"
  }
];

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
  onNavigateTab
}) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "accounts" | "students" | "modules" | "ingestion" | "scenarios" | "hotlines">("all");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const { user } = useAuth();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent("sapc:toggle-command-palette"));
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Demo Scenarios Preset
  const DEMO_SCENARIOS = [
    {
      id: "scen-1",
      title: "Scenario 1: STEM Midterm Exam Panic & GAD-7 Anxiety Spike",
      studentName: "Joshua Dimaculangan",
      studentId: 1,
      tag: "Crisis Triage",
      desc: "Student broke down after Pre-Calculus midterm exam. High distress detected by chatbot with GAD-7 score of 16.",
      tab: "crisis_detail",
      role: "guidance_counselor"
    },
    {
      id: "scen-2",
      title: "Scenario 2: Working Student Night Shift Fatigue & Chemistry Remediation",
      studentName: "Christian Dave Villanueva",
      studentId: 7,
      tag: "Teacher Referral",
      desc: "Subject teacher flagged falling grades due to night-shift BPO work. Flexible asynchronous worksheets needed.",
      tab: "referrals",
      role: "guidance_counselor"
    },
    {
      id: "scen-3",
      title: "Scenario 3: Financial Arrears Clearance & Risk De-escalation",
      studentName: "Angelica Dela Cruz",
      studentId: 3,
      tag: "De-escalation",
      desc: "Alumni Foundation tuition grant cleared exam permit; teacher submitted proposal to lower risk tier from High to Low.",
      tab: "risk_reviews",
      role: "guidance_counselor"
    },
    {
      id: "scen-4",
      title: "Scenario 4: Family Support & Attendance Recovery Contract",
      studentName: "Samantha Nicole Reyes",
      studentId: 4,
      tag: "Parent Conference",
      desc: "Scheduled 2:00 PM case conference with guardian to sign DepEd attendance recovery agreement.",
      tab: "sessions",
      role: "guidance_counselor"
    }
  ];

  // Quick Modules List
  const SYSTEM_MODULES = [
    // Guidance Modules
    { name: "Counselor Command Center", tab: "dashboard", role: "guidance_counselor", icon: Brain, cat: "Counselor" },
    { name: "Crisis Alerts & Triage Queue", tab: "crisis_alerts", role: "guidance_counselor", icon: AlertTriangle, cat: "Counselor" },
    { name: "Standardized Screenings (PHQ-9 / GAD-7)", tab: "assessments", role: "guidance_counselor", icon: Activity, cat: "Counselor" },
    { name: "Master Care Plans Caseload", tab: "interventions", role: "guidance_counselor", icon: ShieldCheck, cat: "Counselor" },
    { name: "Intervention Risk De-escalation Reviews", tab: "risk_reviews", role: "guidance_counselor", icon: TrendingUp, cat: "Counselor" },
    { name: "AHP 5-Domain Criteria Weights & Sensitivity Simulator", tab: "analytics", role: "guidance_counselor", icon: Sliders, cat: "Counselor" },
    { name: "DepEd / CHED Institutional Risk Report", tab: "reports", role: "guidance_counselor", icon: GraduationCap, cat: "Counselor" },
    // Teacher Modules
    { name: "Teacher Import Wizard", tab: "import_wizard", role: "teacher", icon: FileSpreadsheet, cat: "Teacher" },
    { name: "Advisory Gradebook & SASS Warning Matrix", tab: "gradebook", role: "teacher", icon: BookOpen, cat: "Teacher" },
    { name: "Parent Conference Scheduler", tab: "parent_conferences", role: "teacher", icon: Calendar, cat: "Teacher" },
    // Admin Modules
    { name: "Admin Command Center", tab: "dashboard", role: "admin", icon: Brain, cat: "Admin" },
    { name: "Master Ingestion Hub", tab: "import_wizard", role: "admin", icon: Layers, cat: "Admin" },
    { name: "Campus User Accounts Directory", tab: "teachers", role: "admin", icon: Users, cat: "Admin" },
    { name: "Grading Terms & Quarter Calendar", tab: "quarter_management", role: "admin", icon: Calendar, cat: "Admin" },
    { name: "Ingestion Audit Trail & Rollback", tab: "import_history", role: "admin", icon: ShieldCheck, cat: "Admin" },
    { name: "Emergency Rollback Engine", tab: "revert_import", role: "admin", icon: RotateCcw, cat: "Admin" }
  ];

  // Philippine Crisis Hotlines
  const EMERGENCY_HOTLINES = [
    { name: "National Center for Mental Health (NCMH) Crisis Hotline", number: "1553 / 0917-899-USAP (8727)", note: "24/7 Toll-Free Suicide & Crisis Hotline (RA 11036)" },
    { name: "Hopeline Philippines Crisis Line", number: "(02) 8804-4673 / 0917-558-4673", note: "DepEd / DOH Accredited Youth Crisis Support" },
    { name: "SAPC Guidance Emergency Desk", number: "Local 108 / guidance@sapc.edu.ph", note: "San Antonio de Padua College Student Wellness Office" },
    { name: "Bantay Bata Child Helpline", number: "163", note: "DepEd Child Protection Policy (DO 40, s. 2012)" }
  ];

  const q = query.trim().toLowerCase();
  const studentDataset = getActiveStudentDataset();
  const ingestionBatches = getIngestionHistory();

  // 1. Filter Campus Accounts
  const isAccountQuery = q.includes("account") || q.includes("campus") || q.includes("staff") || q.includes("teacher") || q.includes("counselor") || q.includes("admin") || q.includes("parent") || q.includes("user") || q.includes("email") || q.includes("login");

  const filteredAccounts = !q 
    ? MASTER_CAMPUS_ACCOUNTS.slice(0, 6)
    : MASTER_CAMPUS_ACCOUNTS.filter(acc => 
        isAccountQuery ||
        acc.name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.role.toLowerCase().includes(q) ||
        acc.roleLabel.toLowerCase().includes(q) ||
        acc.departmentOrSection.toLowerCase().includes(q) ||
        (acc.linkedStudent && acc.linkedStudent.toLowerCase().includes(q))
      );

  // 2. Filter Students
  const filteredStudents = !q 
    ? studentDataset.slice(0, 5) 
    : studentDataset.filter(s => 
        s.full_name.toLowerCase().includes(q) ||
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.lrn.includes(query.trim()) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.section_name && s.section_name.toLowerCase().includes(q))
      ).slice(0, 6);

  // 3. Filter Ingestion Batches
  const filteredBatches = !q
    ? ingestionBatches.slice(0, 3)
    : ingestionBatches.filter(b => 
        b.id.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        b.importedBy.toLowerCase().includes(q) ||
        b.domain.toLowerCase().includes(q)
      );

  // 4. Filter Modules
  const filteredModules = !q 
    ? SYSTEM_MODULES.slice(0, 6) 
    : SYSTEM_MODULES.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.cat.toLowerCase().includes(q) ||
        m.tab.toLowerCase().includes(q)
      );

  // 5. Filter Scenarios
  const filteredScenarios = !q 
    ? DEMO_SCENARIOS 
    : DEMO_SCENARIOS.filter(s => s.title.toLowerCase().includes(q) || s.studentName.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));

  const copyAccountSlip = (acc: CampusAccountItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sapc.edu.ph";
    const slip = `=====================================\nSAN ANTONIO DE PADUA COLLEGE (SAPC)\nCampus Institutional Account Slip\n=====================================\nFull Name: ${acc.name}\nDesignation: ${acc.roleLabel}\nDepartment / Advisory: ${acc.departmentOrSection}\nInstitutional Email: ${acc.email}\nInitial Password: ${acc.initialPassword || "password123"}\nLogin Portal: ${origin}/login\n=====================================`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(slip);
      setCopiedId(acc.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="h-5 w-5 text-[#8B0014] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search Campus accounts, emails, staff, students, LRNs, modules, or defense scenarios (e.g. 'teacher.santos', 'counselor@sapc.edu.ph', 'Joshua')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 font-bold placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black font-mono text-slate-500 bg-white border border-slate-300 rounded-md shadow-2xs">
              ESC to close
            </kbd>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-slate-100 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: "all", label: "All Master Results" },
            { id: "accounts", label: `Campus Accounts & Staff (${filteredAccounts.length})` },
            { id: "students", label: `Students & LRNs (${filteredStudents.length})` },
            { id: "ingestion", label: `Ingestion & Audit Batches (${filteredBatches.length})` },
            { id: "modules", label: "Dashboard Modules" },
            { id: "scenarios", label: "Defense Scenarios (4)" },
            { id: "hotlines", label: "Emergency Hotlines" }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === c.id
                  ? "bg-[#8B0014] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Content Results Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* SECTION 1: Campus Accounts & Staff Directory */}
          {(activeCategory === "all" || activeCategory === "accounts") && filteredAccounts.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-[#8B0014] tracking-wider flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-[#8B0014]" />
                  Campus User Accounts &amp; Institutional Credentials ({filteredAccounts.length}):
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Click to copy onboarding login credentials
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAccounts.map((acc) => {
                  const isCopied = copiedId === acc.id;
                  const roleBadgeColor = acc.role === "admin" 
                    ? "bg-purple-100 text-purple-900 border-purple-200"
                    : acc.role === "guidance_counselor"
                    ? "bg-rose-100 text-[#8B0014] border-rose-200"
                    : acc.role === "teacher"
                    ? "bg-blue-100 text-blue-900 border-blue-200"
                    : "bg-amber-100 text-amber-900 border-amber-200";

                  return (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-2xl bg-white hover:bg-rose-50/30 border border-slate-200 hover:border-rose-300 transition space-y-2 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${roleBadgeColor}`}>
                            {acc.role.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {acc.id}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm">{acc.name}</h4>
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <strong className="text-slate-800">{acc.email}</strong>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {acc.departmentOrSection}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          PW: <code className="font-bold text-slate-700">{acc.initialPassword || "••••••••"}</code>
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyAccountSlip(acc)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-500" />}
                            <span>{isCopied ? "Copied!" : "Copy Slip"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigateTab) onNavigateTab("teachers");
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#8B0014] font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>Manage</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: Students Case Files (500 Student Roster) */}
          {(activeCategory === "all" || activeCategory === "students") && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-600" />
                Student Profiles &amp; LRN Registry ({filteredStudents.length} matches):
              </span>
              <div className="space-y-1.5">
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (onSelectStudent) onSelectStudent(s);
                      if (onNavigateTab) onNavigateTab(user?.role === "teacher" ? "students" : "student_profile");
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center text-white shrink-0 ${
                        s.latest_risk_tier === "high" ? "bg-rose-600" : s.latest_risk_tier === "medium" ? "bg-amber-500" : "bg-emerald-600"
                      }`}>
                        {s.latest_risk_score.toFixed(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {s.first_name} {s.last_name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">({s.email || `student${s.id}@sapc.edu.ph`})</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          LRN: {s.lrn} • {s.section_name} • Driver: {s.primary_risk_driver || "Academic"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        s.latest_risk_tier === "high" ? "bg-rose-100 text-rose-800" : s.latest_risk_tier === "medium" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {s.latest_risk_tier} Risk
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#8B0014] group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: Ingestion Batches & Snapshot Rollbacks */}
          {(activeCategory === "all" || activeCategory === "ingestion") && filteredBatches.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-600" />
                Ingestion Batches &amp; Rollback Snapshots:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredBatches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab("import_history");
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 transition cursor-pointer space-y-1 shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        {b.successRate}
                      </span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-xs truncate">{b.type}</p>
                    <p className="text-[10px] text-slate-500">{b.count} rows • {b.importedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Presentation & Defense Scenarios */}
          {(activeCategory === "all" || activeCategory === "scenarios") && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase text-[#8B0014] tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Curated Presentation &amp; Defense Scenarios:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredScenarios.map((scen) => (
                  <div
                    key={scen.id}
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab(scen.tab);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 transition cursor-pointer space-y-1.5 shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-black text-[10px]">
                        {scen.tag}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-amber-800 group-hover:translate-x-1 transition" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs">{scen.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{scen.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: Dashboard Modules */}
          {(activeCategory === "all" || activeCategory === "modules") && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-slate-600" />
                Quick Navigation to Platform Portals:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredModules.map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (onNavigateTab) onNavigateTab(m.tab);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 transition cursor-pointer flex items-center gap-2.5 shadow-2xs group"
                    >
                      <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-[#8B0014] group-hover:text-white transition text-slate-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-xs truncate">{m.name}</p>
                        <span className="text-[10px] text-slate-400">{m.cat} Portal</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 6: Emergency Crisis Hotlines */}
          {(activeCategory === "all" || activeCategory === "hotlines") && (
            <div className="space-y-2.5 bg-rose-50/80 p-4 rounded-2xl border border-rose-200">
              <span className="text-[11px] font-black uppercase text-rose-900 tracking-wider flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-rose-700" />
                Institutional &amp; National Emergency Hotlines (RA 11036 / DepEd DO 40):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {EMERGENCY_HOTLINES.map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white border border-rose-200 space-y-0.5">
                    <p className="font-extrabold text-slate-900 text-xs">{h.name}</p>
                    <p className="font-mono text-rose-700 font-black text-xs">{h.number}</p>
                    <span className="text-[10px] text-slate-500 block">{h.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>San Antonio de Padua College • Multi-Domain Early Warning Decision Support</span>
          <span>Press <strong>Ctrl + K</strong> anytime</span>
        </div>
      </div>
    </div>
  );
};
