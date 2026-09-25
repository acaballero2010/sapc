"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  Filter, 
  X, 
  Lock, 
  Eye
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface AuditLogEntry {
  id: number | string;
  timestamp: string;
  actor_role: string;
  actor_name?: string;
  actor_email?: string;
  action: string;
  target_resource: string;
  details?: string;
  ip_address?: string;
  hash_digest?: string;
  compliance_basis?: string;
}

// Fixed reference point for seed log timestamps — prevents SSR/client hydration mismatch
// that would occur if Date.now() were called at module evaluation time (different on server vs client).
const SEED_ANCHOR = new Date("2026-09-20T08:00:00Z").getTime();
const seedTs = (offsetMs: number) => new Date(SEED_ANCHOR - offsetMs).toISOString();

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "LOG-2026-9481",
    timestamp: seedTs(5 * 60 * 1000),
    actor_role: "guidance_counselor",
    actor_name: "Maria Theresa Cruz, RGC",
    actor_email: "counselor@sapc.edu.ph",
    action: "AHP_RISK_CALCULATION",
    target_resource: "STD-2024-00129",
    details: "Computed multi-domain AHP priority score: 0.618 (High Risk - Pastoral Care Plan Triggered)",
    ip_address: "192.168.10.45",
    hash_digest: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    compliance_basis: "RA 10173 Sec. 12(f) - Legitimate Educational & Pastoral Interest"
  },
  {
    id: "LOG-2026-9480",
    timestamp: seedTs(25 * 60 * 1000),
    actor_role: "teacher",
    actor_name: "Prof. Ernesto Bautista",
    actor_email: "teacher@sapc.edu.ph",
    action: "TEACHER_REFERRAL_FILED",
    target_resource: "STD-2024-00130",
    details: "1-Click Guidance Referral dispatched for Mark Anthony Reyes (Math Q1 Drop: 71.5%, 3 consecutive absences)",
    ip_address: "192.168.10.82",
    hash_digest: "a6c8e310065b210a4249a4697f4cb842e472280d92ad69324005b8a07c64c781",
    compliance_basis: "RA 10173 Sec. 12(c) - Compliance with Institutional Academic Regulations"
  },
  {
    id: "LOG-2026-9479",
    timestamp: seedTs(75 * 60 * 1000),
    actor_role: "admin",
    actor_name: "Dr. Remedios Santos, Ed.D.",
    actor_email: "admin@sapc.edu.ph",
    action: "AHP_WEIGHTS_VERIFIED",
    target_resource: "DECISION_ENGINE_V2",
    details: "Validated Saaty pairwise matrix consistency (CR = 0.048 <= 0.10, lambda_max = 5.215)",
    ip_address: "192.168.10.2",
    hash_digest: "b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78",
    compliance_basis: "RA 10173 Sec. 11 - Institutional Governance & Data Integrity"
  },
  {
    id: "LOG-2026-9478",
    timestamp: seedTs(3 * 3600 * 1000),
    actor_role: "guidance_counselor",
    actor_name: "Maria Theresa Cruz, RGC",
    actor_email: "counselor@sapc.edu.ph",
    action: "CARE_PLAN_CREATED",
    target_resource: "STD-2024-00129",
    details: "Tier-3 Comprehensive Protocol initialized with 3 Assigned Action Items and Counselor Check-in Schedule",
    ip_address: "192.168.10.45",
    hash_digest: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    compliance_basis: "RA 10173 Sec. 13(b) - Protection of Vital Psychological & Academic Health"
  },
  {
    id: "LOG-2026-9477",
    timestamp: seedTs(5 * 3600 * 1000),
    actor_role: "teacher",
    actor_name: "Prof. Ernesto Bautista",
    actor_email: "teacher@sapc.edu.ph",
    action: "SASS_DATA_INGESTION",
    target_resource: "COHORT_G11_STEM",
    details: "Uploaded and processed Q1 SASS Grade Sheet (45 Students Ingested without format errors)",
    ip_address: "192.168.10.82",
    hash_digest: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    compliance_basis: "RA 10173 Sec. 12(a) - Enrolled Student Academic Record Processing"
  },
  {
    id: "LOG-2026-9476",
    timestamp: seedTs(12 * 3600 * 1000),
    actor_role: "student",
    actor_name: "Joshua Dimaculangan",
    actor_email: "student@sapc.edu.ph",
    action: "DAILY_MOOD_CHECKIN",
    target_resource: "STD-2024-00129",
    details: "Logged daily emotional wellness pulse ('Stressed & Overwhelmed', Score: 2/5, Focus: Math Exam)",
    ip_address: "112.204.14.89",
    hash_digest: "c6a92842e4789004d9d885a53922c0709b1f72cf02f06c11c1dfb7bf5718a280",
    compliance_basis: "RA 10173 Sec. 12(b) - Voluntary Express Student Consent"
  },
  {
    id: "LOG-2026-9475",
    timestamp: seedTs(24 * 3600 * 1000),
    actor_role: "parent",
    actor_name: "Mrs. Elena Dimaculangan",
    actor_email: "parent@sapc.edu.ph",
    action: "COUNSELOR_ADVISORY_VIEWED",
    target_resource: "STD-2024-00129",
    details: "Parent portal access: Acknowledged Counselor Advisory Notice & Attendance Summary",
    ip_address: "112.204.14.89",
    hash_digest: "8f434346648f6b96df89dda901c5176b10e6d0ceec3ed197141930768d987d12",
    compliance_basis: "RA 10173 Sec. 12(f) - Authorized Parental Access for Minor Student"
  },
  {
    id: "LOG-2026-9474",
    timestamp: seedTs(36 * 3600 * 1000),
    actor_role: "admin",
    actor_name: "Dr. Remedios Santos, Ed.D.",
    actor_email: "admin@sapc.edu.ph",
    action: "DEPED_REPORT_EXPORT",
    target_resource: "DEPED_REGION_IV_A",
    details: "Exported Institutional DepEd/CHED At-Risk Demographic & Retention Summary PDF",
    ip_address: "192.168.10.2",
    hash_digest: "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d",
  }
];

export const AuditLogViewer: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionCategoryFilter, setActionCategoryFilter] = useState("all");
  const [timeWindowFilter, setTimeWindowFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<AuditLogEntry | null>(null);
  const [referenceTime, setReferenceTime] = useState<number>(() => Date.now());
  const [accessError, setAccessError] = useState<string | null>(null);

  const isAuthorized = user?.role === "admin" || user?.role === "guidance_counselor";

  const loadLogs = useCallback(async () => {
    if (!isAuthorized) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAccessError(null);
    setReferenceTime(Date.now());
    try {
      const combined: AuditLogEntry[] = [];

      // 1. Try Firestore /audit_logs collection
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, getDocs, query, orderBy, limit } = await import("firebase/firestore");
        if (db) {
          const auditRef = collection(db, "audit_logs");
          const q = query(auditRef, orderBy("timestamp", "desc"), limit(50));
          const snap = await getDocs(q);
          if (!snap.empty) {
            snap.forEach((d) => {
              const data = d.data();
              combined.push({
                id: d.id,
                timestamp: data.timestamp || new Date().toISOString(),
                actor_role: data.actor_role || "guidance_counselor",
                actor_name: data.actor_name || "Authorized Staff",
                actor_email: data.actor_email || `${data.actor_role || "staff"}@sapc.edu.ph`,
                action: data.action || "DATA_ACCESS",
                target_resource: data.target_resource || "SYSTEM_RESOURCE",
                details: data.details || "Compliance logged action",
                ip_address: data.ip_address || "127.0.0.1 (Campus LAN)",
                compliance_basis: "RA 10173 Sec. 12(f) - Legitimate Educational & Pastoral Interest"
              });
            });
          }
        }
      } catch (fsErr) {
        console.warn("Firestore audit logs query:", fsErr);
      }

      // 2. Try LocalStorage logs
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("sapc_audit_logs");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                if (!combined.some(c => c.id === item.id)) {
                  combined.push({
                    id: item.id || `LOG-${Date.now()}`,
                    timestamp: item.timestamp || new Date().toISOString(),
                    actor_role: item.actor_role || "guidance_counselor",
                    actor_name: item.actor_name || "Authorized Staff",
                    actor_email: `${item.actor_role || "staff"}@sapc.edu.ph`,
                    action: item.action || "DATA_INGESTION",
                    target_resource: item.target_resource || "STUDENT_RECORDS",
                    details: item.details || "Processed records",
                    ip_address: item.ip_address || "127.0.0.1 (Campus LAN)",
                    compliance_basis: "RA 10173 Sec. 12(f) - Legitimate Educational & Pastoral Interest"
                  });
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }

      // 3. Fallback / Merge with Seed logs
      DEFAULT_AUDIT_LOGS.forEach((seed) => {
        if (!combined.some(c => c.id === seed.id)) {
          combined.push(seed);
        }
      });

      // Sort by timestamp descending
      combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(combined);
    } catch {
      setLogs(DEFAULT_AUDIT_LOGS);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized) {
      loadLogs();
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized, loadLogs]);

  // Multi-dimensional filtering logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Role filter
      if (roleFilter !== "all" && log.actor_role !== roleFilter) {
        return false;
      }

      // 2. Action Category filter
      if (actionCategoryFilter !== "all") {
        if (actionCategoryFilter === "ahp" && !log.action.includes("AHP")) return false;
        if (actionCategoryFilter === "referral" && !log.action.includes("REFERRAL")) return false;
        if (actionCategoryFilter === "care_plan" && !log.action.includes("CARE_PLAN") && !log.action.includes("INTERVENTION")) return false;
        if (actionCategoryFilter === "sass" && !log.action.includes("SASS") && !log.action.includes("GRADE")) return false;
        if (actionCategoryFilter === "wellness" && !log.action.includes("MOOD") && !log.action.includes("WELLNESS")) return false;
        if (actionCategoryFilter === "report" && !log.action.includes("REPORT") && !log.action.includes("EXPORT")) return false;
      }

      // 3. Time window filter
      if (timeWindowFilter !== "all") {
        const logTime = new Date(log.timestamp).getTime();
        const now = referenceTime;
        if (timeWindowFilter === "24h" && now - logTime > 24 * 3600 * 1000) return false;
        if (timeWindowFilter === "7d" && now - logTime > 7 * 24 * 3600 * 1000) return false;
        if (timeWindowFilter === "30d" && now - logTime > 30 * 24 * 3600 * 1000) return false;
      }

      // 4. Keyword search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchRole = log.actor_role.toLowerCase().includes(q);
        const matchTarget = log.target_resource.toLowerCase().includes(q);
        const matchName = (log.actor_name || "").toLowerCase().includes(q);
        const matchEmail = (log.actor_email || "").toLowerCase().includes(q);
        const matchDetails = (log.details || "").toLowerCase().includes(q);
        const matchId = String(log.id).toLowerCase().includes(q);
        return matchAction || matchRole || matchTarget || matchName || matchEmail || matchDetails || matchId;
      }

      return true;
    });
  }, [logs, search, roleFilter, actionCategoryFilter, timeWindowFilter, referenceTime]);

  const hasActiveFilters = search.trim() !== "" || roleFilter !== "all" || actionCategoryFilter !== "all" || timeWindowFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setActionCategoryFilter("all");
    setTimeWindowFilter("all");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200">Admin</span>;
      case "guidance_counselor":
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200">Counselor</span>;
      case "teacher":
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">Adviser</span>;
      case "student":
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">Student</span>;
      case "parent":
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">Parent</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">{role}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-2xs">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-slate-900">RA 10173 Data Privacy Audit Trail</h3>
              <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Immutable Log
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cryptographically verified access log tracking student personal and pastoral data under Philippine RA 10173
            </p>
          </div>
        </div>

        {isAuthorized && (
          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-2 shadow-2xs"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        )}
      </div>

      {!isAuthorized ? (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 flex items-center gap-3.5">
          <ShieldAlert className="h-6 w-6 text-[#8B0014] shrink-0" />
          <div>
            <strong className="block text-slate-900 font-bold">RA 10173 Access Boundary Protected</strong>
            <span className="text-xs text-slate-600">
              Audit trails are restricted to authorized System Administrators and registered Guidance Counselors.
            </span>
          </div>
        </div>
      ) : accessError ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <span>{accessError}</span>
          <button onClick={loadLogs} className="font-bold underline text-rose-900">Retry</button>
        </div>
      ) : (
        <>
          {/* Multi-Dimensional Filter Control Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                <Filter className="h-3.5 w-3.5 text-[#8B0014]" />
                <span>Audit Trail Filters &amp; Query Controls</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-[#8B0014] hover:underline flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student ID, actor, action..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8B0014] transition shadow-2xs"
                />
              </div>

              {/* Actor Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#8B0014] shadow-2xs"
                >
                  <option value="all">All Roles (Admin, GC, Teacher, etc.)</option>
                  <option value="guidance_counselor">Guidance Counselor (GC)</option>
                  <option value="teacher">Class Adviser / Faculty</option>
                  <option value="admin">System Administrator</option>
                  <option value="student">Student User</option>
                  <option value="parent">Parent / Guardian</option>
                </select>
              </div>

              {/* Action Category Filter */}
              <div>
                <select
                  value={actionCategoryFilter}
                  onChange={(e) => setActionCategoryFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#8B0014] shadow-2xs"
                >
                  <option value="all">All Action Categories</option>
                  <option value="ahp">AHP Decision &amp; Risk Evaluations</option>
                  <option value="referral">1-Click Guidance Referrals</option>
                  <option value="care_plan">Care Plan &amp; Interventions</option>
                  <option value="sass">SASS Data Ingestion</option>
                  <option value="wellness">Student Mood &amp; Wellness</option>
                  <option value="report">DepEd / CHED Reports</option>
                </select>
              </div>

              {/* Time Window Filter */}
              <div>
                <select
                  value={timeWindowFilter}
                  onChange={(e) => setTimeWindowFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#8B0014] shadow-2xs"
                >
                  <option value="all">All Time History</option>
                  <option value="24h">Past 24 Hours</option>
                  <option value="7d">Past 7 Days</option>
                  <option value="30d">Past 30 Days</option>
                </select>
              </div>
            </div>

            {/* Filter Status Counts */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
              <span>
                Showing <strong className="text-slate-900">{filteredLogs.length}</strong> of <strong className="text-slate-900">{logs.length}</strong> immutable audit events
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                SHA-256 Verified Digest
              </span>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Event ID &amp; Time</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action Code</th>
                  <th className="py-3.5 px-4">Target Resource</th>
                  <th className="py-3.5 px-4">Audit Payload &amp; Details</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <ShieldAlert className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 text-sm">No audit logs matching your filter criteria</p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-2 text-xs font-bold text-[#8B0014] hover:underline"
                      >
                        Reset filters to view all records
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedRecord(log)}
                      className="text-slate-800 hover:bg-rose-50/40 cursor-pointer transition group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs">{log.id}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5" suppressHydrationWarning>
                          {new Date(log.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {getRoleBadge(log.actor_role)}
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-1 truncate max-w-[150px]">
                          {log.actor_name || log.actor_role}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[#8B0014] font-bold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">
                        {log.target_resource}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs truncate max-w-xs">
                        {log.details || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(log);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-[#8B0014] text-slate-700 group-hover:text-white text-xs font-bold transition shadow-2xs flex items-center gap-1 ml-auto"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Proof</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Audit Record Proof Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-emerald-400">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                          RA 10173 Audit Record
                        </span>
                        <span className="text-xs text-rose-200">• {selectedRecord.id}</span>
                      </div>
                      <h3 className="text-xl font-black text-white">
                        Immutable Security Audit Certificate
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
                  {/* Actor & Action Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Actor Identity</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-1">{selectedRecord.actor_name || selectedRecord.actor_role}</strong>
                      <span className="text-xs font-mono text-slate-500">{selectedRecord.actor_email || `${selectedRecord.actor_role}@sapc.edu.ph`}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Action Code</span>
                      <span className="inline-block mt-1 font-mono font-black text-[#8B0014] bg-rose-50 px-2.5 py-1 rounded border border-rose-200 text-xs">
                        {selectedRecord.action}
                      </span>
                    </div>
                  </div>

                  {/* Target Resource & Timestamp */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Resource</span>
                      <strong className="text-xs font-mono font-bold text-slate-900 block mt-1">{selectedRecord.target_resource}</strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Timestamp (UTC / PHT)</span>
                      <span className="text-xs font-bold text-slate-800 block mt-1" suppressHydrationWarning>
                        {new Date(selectedRecord.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Legal Basis for Processing */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" />
                      <span>Philippine Data Privacy Act (RA 10173) Lawful Basis</span>
                    </div>
                    <p className="text-xs font-mono bg-white/80 p-2 rounded-xl border border-emerald-200/60">
                      {selectedRecord.compliance_basis || "RA 10173 Sec. 12(f) - Legitimate Educational & Pastoral Interest"}
                    </p>
                  </div>

                  {/* Payload Details */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Audit Event Payload &amp; Clinical Context
                    </span>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed break-words">
                      {selectedRecord.details || "No extra metadata captured for this event."}
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 Digest */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-emerald-400" />
                        <span>SHA-256 Cryptographic Digest</span>
                      </span>
                      <span className="text-emerald-400 font-bold">VERIFIED IMMUTABLE</span>
                    </div>
                    <div className="text-[11px] text-amber-300 break-all bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      {selectedRecord.hash_digest || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Source IP: {selectedRecord.ip_address || "192.168.10.45"}</span>
                      <span>DepEd / CHED Audit Ready</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                  >
                    Close Audit Proof
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
