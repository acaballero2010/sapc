"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, RefreshCw, ShieldAlert } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const AuditLogViewer: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [accessError, setAccessError] = useState<string | null>(null);

  const isAuthorized = user?.role === "admin" || user?.role === "guidance_counselor";

  const loadLogs = async () => {
    if (!isAuthorized) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAccessError(null);
    try {
      const data = await fetchWithAuth("/audit/logs?limit=50");
      setLogs(data);
    } catch (err: any) {
      setAccessError(err.message || "Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadLogs();
    } else {
      setIsLoading(false);
    }
  }, [user?.role, isAuthorized]);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.actor_role.toLowerCase().includes(search.toLowerCase()) ||
    l.target_resource.toLowerCase().includes(search.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-slate-900">RA 10173 Data Privacy Audit Trail</h3>
              <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                Compliance Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Immutable access log tracking sensitive personal information access across SAPC portals
            </p>
          </div>
        </div>
        {isAuthorized && (
          <button
            onClick={loadLogs}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition self-start sm:self-auto shadow-xs"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
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
          {/* Search Filter */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter audit actions, actor roles, or student IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-5">Timestamp</th>
                  <th className="py-4 px-5">Actor Role</th>
                  <th className="py-4 px-5">Action Code</th>
                  <th className="py-4 px-5">Target Resource</th>
                  <th className="py-4 px-5">Audit Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="text-slate-800 hover:bg-slate-50 transition">
                    <td className="py-4 px-5 text-slate-600 text-xs sm:text-sm whitespace-nowrap font-medium" suppressHydrationWarning>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 uppercase">
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-[#8B0014] font-bold text-sm">{log.action}</td>
                    <td className="py-4 px-5 font-mono text-slate-700 text-xs sm:text-sm">{log.target_resource}</td>
                    <td className="py-4 px-5 text-slate-600 text-xs sm:text-sm truncate max-w-xs">{log.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
