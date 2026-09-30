"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  RotateCcw,
  User
} from "lucide-react";
import type { StudentRecord } from "@/data/students500";
import { useAuth } from "@/lib/auth-context";
import { 
  getActiveStudentDataset, 
  getActiveFacultyRecords, 
  getActiveParentRecords, 
  getIngestionHistory,
  FacultyRecord,
  ParentRecord
} from "@/lib/dataset-store";

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (student: StudentRecord) => void;
  onNavigateTab?: (tabName: string, role?: string) => void;
}

export interface UnifiedPersonItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "guidance_counselor" | "teacher" | "parent" | "student";
  roleLabel: string;
  identifier: string; // LRN or Employee ID
  departmentOrSection: string;
  initialPassword?: string;
  status: string;
  phone?: string;
  linkedStudent?: string;
  riskTier?: "low" | "medium" | "high";
  riskScore?: number;
  originalStudentRecord?: StudentRecord;
  originalFacultyRecord?: FacultyRecord;
  originalParentRecord?: ParentRecord;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
  onNavigateTab
}) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "people" | "students" | "faculty" | "parents" | "modules" | "ingestion" | "scenarios" | "hotlines"
  >("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { user } = useAuth();

  // 1. Live dataset state
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [parentRecords, setParentRecords] = useState<ParentRecord[]>([]);

  // Refresh live datasets on open or dataset event
  useEffect(() => {
    if (!isOpen) return;

    const refreshData = () => {
      setStudents(getActiveStudentDataset());
      setFacultyList(getActiveFacultyRecords());
      setParentRecords(getActiveParentRecords());
    };

    refreshData();
    window.addEventListener("sapc:dataset-updated", refreshData);
    window.addEventListener("sapc:faculty-updated", refreshData);
    window.addEventListener("sapc:parent-records-updated", refreshData);

    return () => {
      window.removeEventListener("sapc:dataset-updated", refreshData);
      window.removeEventListener("sapc:faculty-updated", refreshData);
      window.removeEventListener("sapc:parent-records-updated", refreshData);
    };
  }, [isOpen]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
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

  // Demo Defense Scenarios
  const DEMO_SCENARIOS = useMemo(() => [
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
  ], []);

  // Quick Navigation Modules
  const SYSTEM_MODULES = useMemo(() => [
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
    { name: "Provision New Campus User", tab: "create_user", role: "admin", icon: UserCheck, cat: "Admin" },
    { name: "Grading Terms & Quarter Calendar", tab: "quarter_management", role: "admin", icon: Calendar, cat: "Admin" },
    { name: "Ingestion Audit Trail & Rollback", tab: "import_history", role: "admin", icon: ShieldCheck, cat: "Admin" },
    { name: "Emergency Rollback Engine", tab: "revert_import", role: "admin", icon: RotateCcw, cat: "Admin" }
  ], []);

  // Emergency Crisis Hotlines
  const EMERGENCY_HOTLINES = useMemo(() => [
    { name: "National Center for Mental Health (NCMH) Crisis Hotline", number: "1553 / 0917-899-USAP (8727)", note: "24/7 Toll-Free Suicide & Crisis Hotline (RA 11036)" },
    { name: "Hopeline Philippines Crisis Line", number: "(02) 8804-4673 / 0917-558-4673", note: "DepEd / DOH Accredited Youth Crisis Support" },
    { name: "SAPC Guidance Emergency Desk", number: "Local 108 / guidance@sapc.edu.ph", note: "San Antonio de Padua College Student Wellness Office" },
    { name: "Bantay Bata Child Helpline", number: "163", note: "DepEd Child Protection Policy (DO 40, s. 2012)" }
  ], []);

  // 2. Build Unified People List across Students, Faculty, Admins, and Parents
  const allPeople = useMemo<UnifiedPersonItem[]>(() => {
    const list: UnifiedPersonItem[] = [];

    // 1. Faculty & Staff (Teachers, Counselors, Admins)
    facultyList.forEach(f => {
      const isCounselor = f.role === "guidance_counselor" || f.role === "counselor";
      const isAdmin = f.role === "admin";
      list.push({
        id: f.id,
        name: f.name,
        email: f.email,
        role: isAdmin ? "admin" : isCounselor ? "guidance_counselor" : "teacher",
        roleLabel: isAdmin ? "System Administrator" : isCounselor ? "Guidance Counselor (RGC)" : "Faculty / Class Adviser",
        identifier: f.employee_id || f.prc_license_no || f.id,
        departmentOrSection: f.section || f.department || "Academic Department",
        initialPassword: f.initial_password || (isAdmin ? "admin123" : isCounselor ? "counselor123" : "teacher123"),
        status: f.status,
        phone: f.phone,
        originalFacultyRecord: f
      });
    });

    // 2. Parents & Guardians
    parentRecords.forEach(p => {
      list.push({
        id: p.id,
        name: p.name,
        email: p.email,
        role: "parent",
        roleLabel: `Parent (${p.relationship})`,
        identifier: `LRN: ${p.linkedLRN}`,
        departmentOrSection: `${p.linkedStudentName} (${p.section})`,
        initialPassword: p.initialPassword || "parent2026",
        status: p.status,
        phone: p.phone,
        linkedStudent: p.linkedStudentName,
        originalParentRecord: p
      });
    });

    // 3. Students
    students.forEach(s => {
      list.push({
        id: `STU-${s.id}`,
        name: s.full_name || `${s.first_name} ${s.last_name}`,
        email: s.email || `${s.first_name.toLowerCase()}.${s.last_name.toLowerCase()}@sapc.edu.ph`,
        role: "student",
        roleLabel: `Student (${s.strand || "JHS/SHS"})`,
        identifier: `LRN: ${s.lrn}`,
        departmentOrSection: s.section_name || `Grade ${s.grade_level}`,
        initialPassword: `sapc${String(s.lrn).slice(-4)}`,
        status: "Active",
        riskTier: s.latest_risk_tier,
        riskScore: s.latest_risk_score,
        originalStudentRecord: s
      });
    });

    return list;
  }, [facultyList, parentRecords, students]);

  // 3. Search & Filtering Engine
  const q = query.trim().toLowerCase();
  const ingestionBatches = useMemo(() => getIngestionHistory(), []);

  // Filtered People (Students, Teachers, Admins, Parents)
  const filteredPeople = useMemo(() => {
    if (!q) return allPeople.slice(0, 10);
    return allPeople.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.identifier.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.roleLabel.toLowerCase().includes(q) ||
      p.departmentOrSection.toLowerCase().includes(q) ||
      (p.linkedStudent && p.linkedStudent.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [allPeople, q]);

  // Subsets for category tabs
  const filteredStudents = useMemo(() => {
    return filteredPeople.filter(p => p.role === "student");
  }, [filteredPeople]);

  const filteredFaculty = useMemo(() => {
    return filteredPeople.filter(p => p.role === "teacher" || p.role === "guidance_counselor" || p.role === "admin");
  }, [filteredPeople]);

  const filteredParents = useMemo(() => {
    return filteredPeople.filter(p => p.role === "parent");
  }, [filteredPeople]);

  // Filtered Ingestion Batches
  const filteredBatches = useMemo(() => {
    if (!q) return ingestionBatches.slice(0, 3);
    return ingestionBatches.filter(b => 
      b.id.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      b.importedBy.toLowerCase().includes(q) ||
      b.domain.toLowerCase().includes(q)
    );
  }, [ingestionBatches, q]);

  // Filtered Modules
  const filteredModules = useMemo(() => {
    if (!q) return SYSTEM_MODULES.slice(0, 6);
    return SYSTEM_MODULES.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.cat.toLowerCase().includes(q) ||
      m.tab.toLowerCase().includes(q)
    );
  }, [SYSTEM_MODULES, q]);

  // Filtered Scenarios
  const filteredScenarios = useMemo(() => {
    if (!q) return DEMO_SCENARIOS;
    return DEMO_SCENARIOS.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.studentName.toLowerCase().includes(q) || 
      s.desc.toLowerCase().includes(q)
    );
  }, [DEMO_SCENARIOS, q]);

  // Filtered Hotlines
  const filteredHotlines = useMemo(() => {
    if (!q) return EMERGENCY_HOTLINES;
    return EMERGENCY_HOTLINES.filter(h => 
      h.name.toLowerCase().includes(q) || 
      h.number.includes(q) || 
      h.note.toLowerCase().includes(q)
    );
  }, [EMERGENCY_HOTLINES, q]);

  // Total matching count for active category
  const totalResultsCount = 
    filteredPeople.length + 
    filteredBatches.length + 
    filteredModules.length + 
    filteredScenarios.length;

  const copyAccountSlip = (person: UnifiedPersonItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sapc.edu.ph";
    const slip = `=====================================\nSAN ANTONIO DE PADUA COLLEGE (SAPC)\nCampus Institutional Account Slip\n=====================================\nFull Name: ${person.name}\nDesignation: ${person.roleLabel}\nIdentifier: ${person.identifier}\nDepartment / Section: ${person.departmentOrSection}\nInstitutional Email: ${person.email}\nInitial Password: ${person.initialPassword || "password123"}\nLogin Portal: ${origin}/login\n=====================================`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(slip);
      setCopiedId(person.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handlePersonClick = (person: UnifiedPersonItem) => {
    if (person.role === "student" && person.originalStudentRecord) {
      if (onSelectStudent) onSelectStudent(person.originalStudentRecord);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sapc:select-student", { detail: person.originalStudentRecord }));
      }
      if (onNavigateTab) {
        onNavigateTab(user?.role === "guidance_counselor" ? "student_profile" : "students");
      }
    } else if (person.role === "parent") {
      if (onNavigateTab) onNavigateTab("parents");
    } else {
      if (onNavigateTab) onNavigateTab("teachers");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
          <Search className="h-5 w-5 text-[#8B0014] dark:text-rose-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search people by name, LRN, email, staff role, section (e.g. 'Joshua', 'Santos', '109238475001', 'admin')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white font-bold placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black font-mono text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
              ESC
            </kbd>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: "all", label: `All Results (${totalResultsCount})` },
            { id: "people", label: `People & Directory (${filteredPeople.length})` },
            { id: "students", label: `Students (${filteredStudents.length})` },
            { id: "faculty", label: `Staff & Faculty (${filteredFaculty.length})` },
            { id: "parents", label: `Parents (${filteredParents.length})` },
            { id: "modules", label: "Dashboard Portals" },
            { id: "scenarios", label: "Defense Scenarios (4)" },
            { id: "hotlines", label: "Crisis Hotlines" }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === c.id
                  ? "bg-[#8B0014] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Content Results Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* SECTION 1: People & Profiles Directory (Students, Teachers, Admins, Parents) */}
          {(activeCategory === "all" || activeCategory === "people" || activeCategory === "students" || activeCategory === "faculty" || activeCategory === "parents") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-[#8B0014] dark:text-rose-400 tracking-wider flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#8B0014] dark:text-rose-400" />
                  {activeCategory === "students" ? "Student Registry" :
                   activeCategory === "faculty" ? "Faculty & Counselor Roster" :
                   activeCategory === "parents" ? "Parent & Guardian Accounts" :
                   "Campus People & Directory"} ({
                    activeCategory === "students" ? filteredStudents.length :
                    activeCategory === "faculty" ? filteredFaculty.length :
                    activeCategory === "parents" ? filteredParents.length :
                    filteredPeople.length
                  } matches):
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Click to open dossier / view profile
                </span>
              </div>

              {/* Render items based on active category */}
              {(() => {
                const displayList = 
                  activeCategory === "students" ? filteredStudents :
                  activeCategory === "faculty" ? filteredFaculty :
                  activeCategory === "parents" ? filteredParents :
                  filteredPeople;

                if (displayList.length === 0) {
                  return (
                    <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500">
                      No matching people found for &ldquo;{query}&rdquo;.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {displayList.map((person) => {
                      const isCopied = copiedId === person.id;
                      const isStudent = person.role === "student";
                      const isParent = person.role === "parent";
                      const isCounselor = person.role === "guidance_counselor";
                      const isAdmin = person.role === "admin";

                      const roleBadgeColor = isAdmin
                        ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300"
                        : isCounselor
                        ? "bg-rose-100 text-[#8B0014] dark:bg-rose-950 dark:text-rose-300"
                        : isParent
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                        : isStudent
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300";

                      return (
                        <div
                          key={`person-${person.id}-${person.email}`}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-rose-50/30 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-300 transition space-y-2.5 shadow-2xs flex flex-col justify-between group cursor-pointer"
                          onClick={() => handlePersonClick(person)}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${roleBadgeColor}`}>
                                {person.roleLabel}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">
                                {person.identifier}
                              </span>
                            </div>

                            <div className="flex items-start gap-2.5 pt-1">
                              <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                                isStudent && person.riskTier
                                  ? (person.riskTier === "high" ? "bg-rose-600 text-white" : person.riskTier === "medium" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white")
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                              }`}>
                                {isStudent && person.riskScore !== undefined
                                  ? Math.round(person.riskScore)
                                  : <User className="h-4 w-4" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate group-hover:text-[#8B0014] dark:group-hover:text-rose-400 transition">
                                  {person.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate">
                                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>{person.email}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                                  {person.departmentOrSection}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-slate-400 truncate">
                              PW: <code className="font-bold text-slate-700 dark:text-slate-300">{person.initialPassword || "••••••••"}</code>
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => copyAccountSlip(person)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                                title="Copy account login details"
                              >
                                {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-500" />}
                                <span>{isCopied ? "Copied" : "Copy"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePersonClick(person)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-[#8B0014] dark:text-rose-300 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                              >
                                <span>View</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* SECTION 2: Dashboard Portals & Shortcuts */}
          {(activeCategory === "all" || activeCategory === "modules") && filteredModules.length > 0 && (
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
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-rose-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-200 transition cursor-pointer flex items-center gap-2.5 shadow-2xs group"
                    >
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-[#8B0014] group-hover:text-white transition text-slate-700 dark:text-slate-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{m.name}</p>
                        <span className="text-[10px] text-slate-400">{m.cat} Portal</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: Curated Presentation & Defense Scenarios */}
          {(activeCategory === "all" || activeCategory === "scenarios") && filteredScenarios.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase text-[#8B0014] dark:text-rose-400 tracking-wider flex items-center gap-1.5">
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
                    className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 transition cursor-pointer space-y-1.5 shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 font-black text-[10px]">
                        {scen.tag}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-amber-800 dark:text-amber-300 group-hover:translate-x-1 transition" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{scen.title}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{scen.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Ingestion Batches & Snapshot Rollbacks */}
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
                    className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 transition cursor-pointer space-y-1 shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        {b.successRate}
                      </span>
                    </div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">{b.type}</p>
                    <p className="text-[10px] text-slate-500">{b.count} rows • {b.importedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: Emergency Crisis Hotlines */}
          {(activeCategory === "all" || activeCategory === "hotlines") && (
            <div className="space-y-2.5 bg-rose-50/80 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50">
              <span className="text-[11px] font-black uppercase text-rose-900 dark:text-rose-300 tracking-wider flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-rose-700 dark:text-rose-400" />
                Institutional &amp; National Emergency Hotlines (RA 11036 / DepEd DO 40):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {filteredHotlines.map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/40 space-y-0.5">
                    <p className="font-extrabold text-slate-900 dark:text-white text-xs">{h.name}</p>
                    <p className="font-mono text-rose-700 dark:text-rose-400 font-black text-xs">{h.number}</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{h.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>San Antonio de Padua College • Multi-Domain Early Warning Decision Support</span>
          <span>Press <strong>Ctrl + K</strong> anytime</span>
        </div>
      </div>
    </div>
  );
};
