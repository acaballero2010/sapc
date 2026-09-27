"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  ShieldCheck,
  Search,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  UserPlus,
  Edit3,
  Calendar,
  User,
  Layers,
  Sparkles
} from "lucide-react";
import { IngestionBatchRecord, IngestionBatchItemDiff } from "@/lib/dataset-store";

interface ImportDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: IngestionBatchRecord | null;
}

export const ImportDiffModal: React.FC<ImportDiffModalProps> = ({
  isOpen,
  onClose,
  batch
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "added" | "modified" | "risk_shifted" | "unchanged">("all");
  const [isExporting, setIsExporting] = useState(false);

  // Extract changes list
  const changes: IngestionBatchItemDiff[] = useMemo(() => {
    if (!batch || !batch.changesList) return [];
    return batch.changesList;
  }, [batch]);

  // Statistics
  const stats = useMemo(() => {
    if (!batch) {
      return { total: 0, added: 0, modified: 0, unchanged: 0, riskIncreased: 0, riskDecreased: 0 };
    }

    const total = batch.count || changes.length;
    const added = batch.diffSummary?.added ?? changes.filter(c => c.changeType === "added").length;
    const modified = batch.diffSummary?.modified ?? changes.filter(c => c.changeType === "modified").length;
    const unchanged = batch.diffSummary?.unchanged ?? changes.filter(c => c.changeType === "unchanged").length;
    const riskIncreased = batch.diffSummary?.riskIncreased ?? changes.filter(c => {
      const shift = c.riskShift;
      return shift && shift.oldScore !== undefined && shift.newScore !== undefined && shift.newScore > shift.oldScore;
    }).length;
    const riskDecreased = batch.diffSummary?.riskDecreased ?? changes.filter(c => {
      const shift = c.riskShift;
      return shift && shift.oldScore !== undefined && shift.newScore !== undefined && shift.newScore < shift.oldScore;
    }).length;

    return { total, added, modified, unchanged, riskIncreased, riskDecreased };
  }, [batch, changes]);

  // Filtered Changes
  const filteredChanges = useMemo(() => {
    let result = changes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.studentName.toLowerCase().includes(q) ||
        c.lrn.includes(q) ||
        (c.section && c.section.toLowerCase().includes(q))
      );
    }

    if (filterType === "added") {
      result = result.filter(c => c.changeType === "added");
    } else if (filterType === "modified") {
      result = result.filter(c => c.changeType === "modified");
    } else if (filterType === "unchanged") {
      result = result.filter(c => c.changeType === "unchanged");
    } else if (filterType === "risk_shifted") {
      result = result.filter(c => {
        const s = c.riskShift;
        return s && s.oldScore !== undefined && s.newScore !== undefined && s.oldScore !== s.newScore;
      });
    }

    return result;
  }, [changes, searchQuery, filterType]);

  // Export CSV of Diff Audit
  const handleExportDiffCSV = () => {
    if (!batch) return;
    setIsExporting(true);

    try {
      const headers = [
        "Batch ID",
        "Ingestion Type",
        "Date",
        "Imported By",
        "LRN",
        "Student Name",
        "Grade Level",
        "Section",
        "Change Classification",
        "Field Name",
        "Previous Value",
        "Ingested Value",
        "Old Risk Tier",
        "New Risk Tier",
        "Old Risk Score",
        "New Risk Score"
      ];

      const rows: string[][] = [];

      changes.forEach(item => {
        if (item.fieldsChanged && item.fieldsChanged.length > 0) {
          item.fieldsChanged.forEach(f => {
            rows.push([
              batch.id,
              `"${batch.type}"`,
              batch.date,
              `"${batch.importedBy}"`,
              item.lrn,
              `"${item.studentName}"`,
              `"${item.gradeLevel || ""}"`,
              `"${item.section || ""}"`,
              item.changeType.toUpperCase(),
              `"${f.fieldLabel || f.field}"`,
              `"${f.oldValue ?? ""}"`,
              `"${f.newValue ?? ""}"`,
              item.riskShift?.oldTier || "",
              item.riskShift?.newTier || "",
              String(item.riskShift?.oldScore ?? ""),
              String(item.riskShift?.newScore ?? "")
            ]);
          });
        } else {
          rows.push([
            batch.id,
            `"${batch.type}"`,
            batch.date,
            `"${batch.importedBy}"`,
            item.lrn,
            `"${item.studentName}"`,
            `"${item.gradeLevel || ""}"`,
            `"${item.section || ""}"`,
            item.changeType.toUpperCase(),
            "NO_FIELD_CHANGES",
            "",
            "",
            item.riskShift?.oldTier || "",
            item.riskShift?.newTier || "",
            String(item.riskShift?.oldScore ?? ""),
            String(item.riskShift?.newScore ?? "")
          ]);
        }
      });

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SAPC_Audit_Diff_${batch.id}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export audit diff error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B0014] to-[#6D0010] p-5 sm:p-6 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-mono font-bold text-xs">
                {batch.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-xs font-semibold">
                {batch.academicYear || "AY 2025-2026"} • {batch.quarter || "Q1"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" />
                RA 10173 Audit Verified
              </span>
              {batch.rolledBack && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-900 text-rose-200 border border-rose-700">
                  Rolled Back
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-300" />
              {batch.type}
            </h3>
            <div className="flex items-center gap-4 text-xs text-rose-100/90 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-amber-300" />
                Ingested By: <strong>{batch.importedBy}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-300" />
                Timestamp: <strong>{batch.date}</strong>
              </span>
              <span>
                Success Rate: <strong>{batch.successRate || "100%"}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top KPI Metrics Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Total Records</span>
              <span className="text-xl font-black text-slate-900">{stats.total}</span>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider">Added Records</span>
              <span className="text-xl font-black text-emerald-700">+{stats.added}</span>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-800 block uppercase tracking-wider">Modified Records</span>
              <span className="text-xl font-black text-blue-700">Δ {stats.modified}</span>
            </div>

            <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-800 block uppercase tracking-wider">Risk Increased</span>
              <span className="text-xl font-black text-rose-700">▲ {stats.riskIncreased}</span>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider">Risk Decreased</span>
              <span className="text-xl font-black text-emerald-700">▼ {stats.riskDecreased}</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="p-4 sm:px-6 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Student Name, LRN, or Section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#8B0014]"
            />
          </div>

          {/* Filter Pills & Export */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterType === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({changes.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("added")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterType === "added" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Added (+{stats.added})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("modified")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterType === "modified" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Modified (Δ{stats.modified})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("risk_shifted")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterType === "risk_shifted" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Risk Shifts (▲▼)
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportDiffCSV}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer shrink-0"
              title="Download CSV report of this audit batch"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#8B0014]" />
              <span>{isExporting ? "Exporting..." : "Export Audit CSV"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Audit Diff Records Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {filteredChanges.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No records match your search or filter.</p>
              <p className="text-xs text-slate-400">Try changing your search term or filter selection.</p>
            </div>
          ) : (
            filteredChanges.map((item, idx) => {
              const isAdded = item.changeType === "added";
              const isModified = item.changeType === "modified";
              const isUnchanged = item.changeType === "unchanged";

              const riskShift = item.riskShift;
              const hasRiskShift = riskShift && riskShift.oldScore !== undefined && riskShift.newScore !== undefined && riskShift.oldScore !== riskShift.newScore;
              const isRiskUp = hasRiskShift && (riskShift.newScore || 0) > (riskShift.oldScore || 0);

              return (
                <div 
                  key={`${item.lrn}-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs transition hover:border-slate-300 space-y-3.5"
                >
                  {/* Student Header & Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isAdded ? "bg-emerald-100 text-emerald-800" :
                        isModified ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {isAdded ? <UserPlus className="h-4 w-4" /> : isModified ? <Edit3 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm sm:text-base font-black text-slate-900">
                            {item.studentName}
                          </strong>
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            LRN: {item.lrn}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {item.section || `Grade ${item.gradeLevel || "JHS"}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Change Tag */}
                      {isAdded && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          + NEW ENROLLMENT ADDED
                        </span>
                      )}
                      {isModified && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                          <Edit3 className="h-3 w-3" />
                          Δ MODIFIED ({item.fieldsChanged.length} FIELDS)
                        </span>
                      )}
                      {isUnchanged && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          = UNCHANGED
                        </span>
                      )}

                      {/* Risk Shift Badge */}
                      {hasRiskShift && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          isRiskUp ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                        }`}>
                          <span className="uppercase text-[10px] font-black">{riskShift.oldTier} ({riskShift.oldScore})</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="uppercase text-[10px] font-black">{riskShift.newTier} ({riskShift.newScore})</span>
                          {isRiskUp ? <TrendingUp className="h-3.5 w-3.5 text-rose-600" /> : <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Field Diffs Table */}
                  {isModified && item.fieldsChanged && item.fieldsChanged.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
                      <table className="min-w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                            <th className="py-2 px-3">Field / Metric</th>
                            <th className="py-2 px-3">Previous Baseline</th>
                            <th className="py-2 px-3">Ingested Value</th>
                            <th className="py-2 px-3 text-right">Audit Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {item.fieldsChanged.map((f, fIdx) => (
                            <tr key={fIdx} className="hover:bg-slate-50/80">
                              <td className="py-2 px-3 font-bold text-slate-800">
                                {f.fieldLabel || f.field}
                              </td>
                              <td className="py-2 px-3">
                                <span className="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200 font-mono font-bold line-through">
                                  {String(f.oldValue ?? "None / Unset")}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-300 font-mono font-black">
                                  {String(f.newValue ?? "None")}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-blue-600" />
                                  Updated
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Added Student Details Grid */}
                  {isAdded && item.fieldsChanged && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {item.fieldsChanged.map((f, fIdx) => (
                        <div key={fIdx} className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            {f.fieldLabel || f.field}
                          </span>
                          <strong className="text-emerald-950 font-black text-xs sm:text-sm">
                            {String(f.newValue ?? "")}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Displaying <strong>{filteredChanges.length}</strong> of <strong>{changes.length}</strong> student audit entries
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
