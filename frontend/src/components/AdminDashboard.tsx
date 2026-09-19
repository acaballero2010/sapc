"use client";

import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  ShieldCheck, 
  Settings, 
  Award, 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  Database, 
  Activity, 
  Eye, 
  X, 
  BookOpen, 
  Brain, 
  HeartPulse, 
  FileText,
  UserCheck,
  Lock,
  Key,
  Check
} from "lucide-react";
import { AuditLogViewer } from "./AuditLogViewer";
import { InstitutionalReportModal } from "./InstitutionalReportModal";
import { CohortTrendAnalytics } from "./CohortTrendAnalytics";

const CAMPUS_USERS = [
  {
    id: 1,
    name: "Maria Theresa Cruz, RGC",
    email: "counselor@sapc.edu.ph",
    role: "guidance_counselor",
    roleLabel: "Guidance Counselor",
    identifier: "EMP-GC-2018-0042",
    department: "Guidance & Counseling Department (Room 204)",
    accessScope: "Full Pastoral Records & Triage",
    status: "active",
    mfaEnabled: true,
    lastLogin: "Just now",
    authorizedModules: [
      "Crisis Triage Queue & Heatmap",
      "NLP Sentiment & Distress Flags",
      "Classroom Teacher Referrals",
      "Tier-3 Multi-Domain Care Protocols",
      "DepEd / CHED Institutional Reports"
    ],
    recentAuditActivity: "Evaluated AHP composite risk for Joshua Dimaculangan (Score: 0.618, High Risk)"
  },
  {
    id: 2,
    name: "Prof. Ernesto Bautista",
    email: "teacher@sapc.edu.ph",
    role: "teacher",
    roleLabel: "Class Adviser",
    identifier: "EMP-FAC-2015-0108",
    department: "Grade 11 - St. Augustine (Senior High STEM)",
    accessScope: "Advisory Class Roster & SASS Ingestion",
    status: "active",
    mfaEnabled: true,
    lastLogin: "10 mins ago",
    authorizedModules: [
      "Advisory Class Roster (45 Students)",
      "DepEd SASS Academic Ingestion",
      "1-Click Guidance Counselor Referral",
      "Academic Attendance Marking"
    ],
    recentAuditActivity: "Dispatched 1-Click Guidance Referral for Mark Anthony Reyes (Math Q1 Drop: 71.5%)"
  },
  {
    id: 3,
    name: "Dr. Remedios Santos, Ed.D.",
    email: "admin@sapc.edu.ph",
    role: "admin",
    roleLabel: "System Administrator",
    identifier: "EMP-ADM-2011-0003",
    department: "Office of the Principal & Academic Affairs",
    accessScope: "System Governance & RA 10173 Audit Logs",
    status: "active",
    mfaEnabled: true,
    lastLogin: "Active now",
    authorizedModules: [
      "AHP Criteria Weights Vector Management",
      "Saaty Mathematical Model Consistency (CR ≤ 0.10)",
      "Campus User Roles & Directory Boundary Enforcer",
      "RA 10173 Immutable Audit Trail Viewer",
      "DepEd Compliance & Executive Export"
    ],
    recentAuditActivity: "Verified AHP pairwise matrix consistency (CR = 0.048) and reviewed immutable audit trail"
  },
  {
    id: 4,
    name: "Joshua Dimaculangan",
    email: "student@sapc.edu.ph",
    role: "student",
    roleLabel: "Student",
    identifier: "STD-2024-00129",
    department: "Grade 11 - STEM Track",
    accessScope: "Self Wellness Pulse & Academic Standing",
    status: "active",
    mfaEnabled: false,
    lastLogin: "Today, 8:15 AM",
    authorizedModules: [
      "Self Wellness Mood Pulse & Reflection Journal",
      "5-Domain Holistic Progress Tracking",
      "Grade 11 SASS Academic Simulator (₱ / GPA)",
      "Assigned Care Plan Goals & Action Steps"
    ],
    recentAuditActivity: "Submitted Daily Wellness Mood Check-in ('Stressed & Overwhelmed' - Math Exam Prep)"
  },
  {
    id: 5,
    name: "Mrs. Elena Dimaculangan",
    email: "parent@sapc.edu.ph",
    role: "parent",
    roleLabel: "Parent / Guardian",
    identifier: "PAR-2024-00084",
    department: "PTCA — Parent of Joshua Dimaculangan",
    accessScope: "Linked Child Academic & Wellness Progress",
    status: "active",
    mfaEnabled: false,
    lastLogin: "Yesterday",
    authorizedModules: [
      "Linked Child Academic Summary & Quarterly GPA",
      "Attendance & Absence Monitoring",
      "Counselor Advisories & Action Plans",
      "Child Emotional Wellness Pulse Review"
    ],
    recentAuditActivity: "Acknowledged Counselor Advisory Notice from Maria Theresa Cruz, RGC"
  }
];

const SAATY_MATRIX = [
  { criterion: "Academic (C1)", c1: "1.00", c2: "2.00", c3: "3.00", c4: "3.00", c5: "5.00", weight: "40.17%" },
  { criterion: "Mental Health (C2)", c1: "0.50", c2: "1.00", c3: "2.00", c4: "2.00", c5: "3.00", weight: "24.42%" },
  { criterion: "Financial (C3)", c1: "0.33", c2: "0.50", c3: "1.00", c4: "1.00", c5: "2.00", weight: "13.73%" },
  { criterion: "Family Dynamics (C4)", c1: "0.33", c2: "0.50", c3: "1.00", c4: "1.00", c5: "2.00", weight: "13.73%" },
  { criterion: "Physical Health (C5)", c1: "0.20", c2: "0.33", c3: "0.50", c4: "0.50", c5: "1.00", weight: "7.94%" }
];

export const AdminDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof CAMPUS_USERS[0] | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    setIsMounted(true);
    
    // Check if there is a hash in the URL on mount or navigation
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.classList.add("ring-4", "ring-amber-400/50");
          setTimeout(() => el.classList.remove("ring-4", "ring-amber-400/50"), 2500);
        }
      }, 200);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-8 pb-12 font-sans animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="h-64 rounded-3xl bg-slate-200" />
      </div>
    );
  }

  const filteredUsers = CAMPUS_USERS.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-8 sm:p-9 shadow-md text-white border-t-4 border-amber-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-amber-300" />
                System Administration
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• Security, AHP Matrix &amp; RA 10173 Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              SAPC IntellySys Central Control
            </h1>
            <p className="text-sm sm:text-base text-rose-50/95 mt-2 leading-relaxed max-w-3xl font-normal">
              Configure decision engine criteria weights, manage campus user role boundaries, and monitor immutable data access audit trails.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <button
              onClick={() => setIsMatrixModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition flex items-center gap-2"
            >
              <Sliders className="h-4 w-4 text-amber-300" />
              <span>Saaty 5×5 Matrix</span>
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Award className="h-4 w-4 text-[#8B0014]" />
              <span>DepEd / CHED Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Health & Synchronization Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Decision Engine</span>
            <strong className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">AHP Model v2.4</strong>
            <span className="text-[11px] font-semibold text-emerald-700">CR = 0.048 (Pass)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">DepEd SASS Sync</span>
            <strong className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">SY 2025–2026</strong>
            <span className="text-[11px] font-semibold text-slate-500">1,250 Students Ingested</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Database className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Care Plans</span>
            <strong className="text-base sm:text-lg font-black text-amber-800 block mt-0.5">12 Live Protocols</strong>
            <span className="text-[11px] font-semibold text-emerald-700">98.4% Resolution Rate</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">RA 10173 Audit</span>
            <strong className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">Immutable Log</strong>
            <span className="text-[11px] font-semibold text-emerald-700">Real-Time Event Trail</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-[#8B0014] border border-rose-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* AHP Model Configuration Card */}
      <div id="ahp-matrix" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] shadow-xs">
              <Sliders className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">AHP Decision Criteria Weights (Fixed Priority Vector)</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Analytic Hierarchy Process model weights established for San Antonio de Padua College
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMatrixModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto shadow-2xs"
          >
            <Eye className="h-4 w-4 text-[#8B0014]" />
            <span>View Saaty 5×5 Matrix</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Academic Domain</span>
            <p className="text-2xl sm:text-3xl font-black text-[#8B0014] mt-2">40.17%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">w_AC = 0.4017</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Mental Health</span>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">24.42%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">w_MH = 0.2442</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Financial Strain</span>
            <p className="text-2xl sm:text-3xl font-black text-[#D97706] mt-2">13.73%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">w_FI = 0.1373</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Family Factors</span>
            <p className="text-2xl sm:text-3xl font-black text-[#D97706] mt-2">13.73%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">w_FA = 0.1373</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block">Physical Health</span>
            <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">7.94%</p>
            <span className="text-xs text-slate-500 font-mono mt-1 block">w_PH = 0.0794</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            <strong className="text-slate-900">Consistency Ratio (CR):</strong> <span className="text-emerald-700 font-bold">0.048</span> (Passes Saaty standard: CR ≤ 0.10, λ_max = 5.215)
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5" /> Validated Multi-Criteria Decision Model
          </span>
        </div>
      </div>

      {/* Campus User Accounts & Role Boundaries */}
      <div id="campus-users" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#8B0014]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Campus Accounts &amp; Role Boundaries</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Active portal user accounts, departmental assignments, and RA 10173 data access scopes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition w-full sm:w-56"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#8B0014]"
            >
              <option value="all">All Roles (5)</option>
              <option value="guidance_counselor">Guidance Counselor</option>
              <option value="teacher">Class Adviser</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Account User</th>
                <th className="py-3.5 px-4">Role Designation</th>
                <th className="py-3.5 px-4">Department / Section</th>
                <th className="py-3.5 px-4">RA 10173 Data Access Scope</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr 
                  key={u.id} 
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-rose-50/40 cursor-pointer transition text-slate-800 group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-[#8B0014] transition-colors">{u.name}</div>
                    <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                      <span>{u.email}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">{u.identifier}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      u.role === "admin" ? "bg-purple-50 text-purple-900 border border-purple-200" :
                      u.role === "guidance_counselor" ? "bg-rose-50 text-rose-900 border border-rose-200" :
                      u.role === "teacher" ? "bg-amber-50 text-amber-900 border border-amber-200" :
                      u.role === "student" ? "bg-blue-50 text-blue-900 border border-blue-200" :
                      "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    }`}>
                      {u.roleLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{u.department}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{u.accessScope}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(u);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#8B0014] text-slate-700 hover:text-white font-bold text-xs transition shadow-2xs"
                    >
                      Inspect Scope
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Longitudinal Multi-Semester Trends & Retention Health */}
      <div id="trend-analytics" className="scroll-mt-24">
        <CohortTrendAnalytics />
      </div>

      {/* RA 10173 Audit Log Viewer */}
      <div id="audit-logs" className="scroll-mt-24">
        <AuditLogViewer />
      </div>

      {/* Saaty 5x5 Pairwise Matrix Inspector Modal */}
      {isMatrixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Sliders className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      AHP Mathematics
                    </span>
                    <span className="text-xs text-rose-200">• Saaty Scale (1–9)</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Saaty 5×5 Pairwise Comparison Matrix (A)
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMatrixModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-center text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase">
                      <th className="py-3 px-4 text-left">Criteria Domain</th>
                      <th className="py-3 px-3">Academic</th>
                      <th className="py-3 px-3">Mental Health</th>
                      <th className="py-3 px-3">Financial</th>
                      <th className="py-3 px-3">Family</th>
                      <th className="py-3 px-3">Physical Health</th>
                      <th className="py-3 px-3 bg-amber-50 text-[#8B0014]">Priority Vector (w)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {SAATY_MATRIX.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-left font-sans font-bold text-slate-900">{row.criterion}</td>
                        <td className="py-3 px-3 text-slate-700">{row.c1}</td>
                        <td className="py-3 px-3 text-slate-700">{row.c2}</td>
                        <td className="py-3 px-3 text-slate-700">{row.c3}</td>
                        <td className="py-3 px-3 text-slate-700">{row.c4}</td>
                        <td className="py-3 px-3 text-slate-700">{row.c5}</td>
                        <td className="py-3 px-3 bg-amber-50/70 font-bold text-[#8B0014]">{row.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mathematical Consistency Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Principal Eigenvalue (λ_max):</span>
                  <strong className="font-mono text-slate-900 font-black">5.215</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Consistency Index (CI = (λ_max - n)/(n - 1)):</span>
                  <strong className="font-mono text-slate-900 font-black">0.0538</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Random Index for n = 5 (RI):</span>
                  <strong className="font-mono text-slate-900 font-black">1.1200</strong>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Consistency Ratio (CR = CI / RI):</span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                    CR = 0.048 (Passes: CR ≤ 0.10)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Decision-Making Policy:</strong> The AHP priority vector is derived from expert pairwise evaluations across SAPC leadership. Because CR = 0.048 is well below 0.10, judgments are statistically consistent and prevent arbitrary grading bias.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMatrixModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
              >
                Close Matrix View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campus User Account & Role Boundary Inspector Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-extrabold text-lg">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      {selectedUser.roleLabel}
                    </span>
                    <span className="text-xs text-rose-200">• {selectedUser.identifier}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {selectedUser.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Account Meta Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Institutional Email</span>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">{selectedUser.email}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Security & 2FA</span>
                  <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    {selectedUser.mfaEnabled ? "2FA Verified" : "Standard Auth"}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Last Active</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedUser.lastLogin}</p>
                </div>
              </div>

              {/* Department & Access Scope */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <ShieldCheck className="h-4 w-4 text-[#8B0014]" />
                  <span>RA 10173 Institutional Access Scope</span>
                </div>
                <p className="text-xs text-amber-950 font-medium">
                  <strong>Assignment:</strong> {selectedUser.department}
                </p>
                <p className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-xl border border-amber-200/60 font-mono">
                  {selectedUser.accessScope}
                </p>
              </div>

              {/* Authorized Modules */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Authorized Subsystems &amp; Clinical Portals
                </h4>
                <div className="space-y-1.5">
                  {selectedUser.authorizedModules.map((mod, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Audit Event */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Recent Immutable Audit Activity</span>
                  <span className="text-[10px] font-mono text-slate-400">RA 10173 Trail</span>
                </div>
                <p className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-slate-200/80">
                  {selectedUser.recentAuditActivity}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Verified SAPC Institutional Directory Entry
              </span>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      <InstitutionalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
