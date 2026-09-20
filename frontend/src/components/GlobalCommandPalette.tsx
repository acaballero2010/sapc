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
  Sliders
} from "lucide-react";
import { SAPC_500_STUDENTS } from "@/data/students500";
import type { StudentRecord } from "@/data/students500";
import { useAuth } from "@/lib/auth-context";

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (student: StudentRecord) => void;
  onNavigateTab?: (tabName: string, role?: string) => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
  onNavigateTab
}) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "students" | "modules" | "scenarios" | "hotlines">("all");
  const { user } = useAuth();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or custom event
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
    { name: "DepEd / CHED Institutional Risk Report", tab: "reports", role: "guidance_counselor", icon: GraduationCap, cat: "Counselor" },
    // Teacher Modules
    { name: "Teacher Import Wizard", tab: "import_wizard", role: "teacher", icon: FileSpreadsheet, cat: "Teacher" },
    { name: "Advisory Gradebook & SASS Warning Matrix", tab: "gradebook", role: "teacher", icon: BookOpen, cat: "Teacher" },
    { name: "Parent Conference Scheduler", tab: "parent_conferences", role: "teacher", icon: Calendar, cat: "Teacher" },
    // Admin Modules
    { name: "Admin Command Center", tab: "dashboard", role: "admin", icon: Brain, cat: "Admin" },
    { name: "AHP 5-Domain Risk Configuration", tab: "risk_config", role: "admin", icon: Sliders, cat: "Admin" },
    { name: "Master Ingestion Hub", tab: "import_wizard", role: "admin", icon: Layers, cat: "Admin" },
    { name: "Campus User Accounts Directory", tab: "teachers", role: "admin", icon: Users, cat: "Admin" },
    { name: "Grading Terms & Quarter Calendar", tab: "quarter_management", role: "admin", icon: Calendar, cat: "Admin" },
    { name: "Ingestion Audit Trail & Rollback", tab: "import_history", role: "admin", icon: ShieldCheck, cat: "Admin" }
  ];

  // Philippine Crisis Hotlines
  const EMERGENCY_HOTLINES = [
    { name: "National Center for Mental Health (NCMH) Crisis Hotline", number: "1553 / 0917-899-USAP (8727)", note: "24/7 Toll-Free Suicide & Crisis Hotline (RA 11036)" },
    { name: "Hopeline Philippines Crisis Line", number: "(02) 8804-4673 / 0917-558-4673", note: "DepEd / DOH Accredited Youth Crisis Support" },
    { name: "SAPC Guidance Emergency Desk", number: "Local 108 / guidance@sapc.edu.ph", note: "San Antonio de Padua College Student Wellness Office" },
    { name: "Bantay Bata Child Helpline", number: "163", note: "DepEd Child Protection Policy (DO 40, s. 2012)" }
  ];

  // Search Filtering (Derived State strictly scoped by RBAC role)
  const currentRole = user?.role || "guidance_counselor";
  const q = query.trim().toLowerCase();
  
  const filteredStudents = !q 
    ? SAPC_500_STUDENTS.slice(0, 6) 
    : SAPC_500_STUDENTS.filter(s => 
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.lrn.includes(query.trim()) ||
        (s.section_name && s.section_name.toLowerCase().includes(q))
      ).slice(0, 8);

  const roleScopedModules = SYSTEM_MODULES.filter(m => m.role === currentRole);
  const filteredModules = !q 
    ? roleScopedModules 
    : roleScopedModules.filter(m => m.name.toLowerCase().includes(q) || m.cat.toLowerCase().includes(q));

  const filteredScenarios = (!q ? DEMO_SCENARIOS : DEMO_SCENARIOS.filter(s => s.title.toLowerCase().includes(q) || s.studentName.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)))
    .filter(s => s.role === currentRole);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="h-5 w-5 text-[#8B0014] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search student name, LRN, module, or defense scenario (e.g. 'Joshua', 'PHQ-9', 'Import')..."
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
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-slate-100 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: "all", label: "All Results" },
            { id: "students", label: "Students (500)" },
            { id: "scenarios", label: "Defense Scenarios (4)" },
            { id: "modules", label: "Dashboard Modules" },
            { id: "hotlines", label: "Emergency Hotlines (RA 11036)" }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategory === c.id
                  ? "bg-[#8B0014] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Defense / Demo Scenarios */}
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

          {/* Students Roster Quick Jump */}
          {(activeCategory === "all" || activeCategory === "students") && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-600" />
                Student Case Files ({filteredStudents.length} matches):
              </span>
              <div className="space-y-1.5">
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (onSelectStudent) onSelectStudent(s);
                      if (onNavigateTab) onNavigateTab(currentRole === "teacher" ? "students" : "student_profile");
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
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {s.first_name} {s.last_name}
                        </h4>
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

          {/* Dashboard Modules */}
          {(activeCategory === "all" || activeCategory === "modules") && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-600" />
                Quick Navigation to Dashboard Modules:
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

          {/* Emergency Crisis Hotlines */}
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

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>San Antonio de Padua College • Multi-Domain Early Warning Decision Support</span>
          <span>Press <strong>Ctrl + K</strong> anytime</span>
        </div>
      </div>
    </div>
  );
};
