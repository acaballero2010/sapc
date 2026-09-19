"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Clock, RefreshCw, FileText } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth("/audit/logs?limit=50");
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.actor_role.toLowerCase().includes(search.toLowerCase()) ||
    l.target_resource.toLowerCase().includes(search.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">RA 10173 Data Privacy Audit Trail</h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                Compliance Live
              </span>
            </div>
            <p className="text-xs text-slate-400">Immutable access log tracking sensitive personal information access</p>
          </div>
        </div>
        <button
          onClick={loadLogs}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition self-start sm:self-auto"
          title="Refresh Audit Logs"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Filter audit actions, actor roles, or student IDs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-2.5">Timestamp</th>
              <th className="pb-2.5">Actor Role</th>
              <th className="pb-2.5">Action Code</th>
              <th className="pb-2.5">Target Resource</th>
              <th className="pb-2.5">Audit Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="text-slate-300 hover:bg-slate-850/30">
                <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                    {log.actor_role}
                  </span>
                </td>
                <td className="py-2.5 font-mono text-indigo-400 font-semibold">{log.action}</td>
                <td className="py-2.5 font-mono text-slate-400">{log.target_resource}</td>
                <td className="py-2.5 text-slate-400 truncate max-w-xs">{log.details || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
