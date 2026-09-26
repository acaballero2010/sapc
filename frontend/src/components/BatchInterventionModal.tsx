"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Send,
  Users,
  CheckSquare,
  Square,
  Calendar,
  MessageSquare,
  HeartHandshake,
} from "lucide-react";
import {
  getActiveStudentDataset,
  createInterventionCarePlan,
  addAppNotification,
  scheduleCounselingSession,
} from "@/lib/dataset-store";
import { useToast } from "@/lib/toast-context";

interface BatchInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatched?: () => void;
}

export function BatchInterventionModal({
  isOpen,
  onClose,
  onDispatched,
}: BatchInterventionModalProps) {
  const { success, warning } = useToast();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dataset = useMemo(() => getActiveStudentDataset(), [isOpen]);

  const [riskFilter, setRiskFilter] = useState<string>("Critical");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [actionType, setActionType] = useState<"care_plan" | "notification" | "counseling">("care_plan");
  const [title, setTitle] = useState("Targeted Academic & Wellbeing Follow-up");
  const [details, setDetails] = useState("Immediate counseling triage scheduled to address multiple domain vulnerability indicators.");
  const [scheduledDate, setScheduledDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return dataset.filter((s) => {
      const tier = s.latest_risk_tier || "low";
      const matchRisk = riskFilter === "All" || 
        (riskFilter === "Critical" && (tier === "high" || s.latest_risk_score >= 60)) ||
        (riskFilter === "High" && tier === "high") ||
        (riskFilter === "Moderate" && tier === "medium") ||
        (riskFilter === "Low" && tier === "low");
      const matchGrade = gradeFilter === "All" || String(s.grade_level) === gradeFilter;
      return matchRisk && matchGrade;
    });
  }, [dataset, riskFilter, gradeFilter]);

  // Initialize all matched as selected when filter changes
  React.useEffect(() => {
    setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
  }, [filteredStudents]);

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleToggleStudent = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDispatch = () => {
    if (selectedIds.size === 0) {
      warning("No Students Selected", "Please select at least one student to dispatch batch action.");
      return;
    }

    const selectedList = dataset.filter((s) => selectedIds.has(s.id));
    let count = 0;

    selectedList.forEach((student) => {
      if (actionType === "care_plan") {
        createInterventionCarePlan({
          student_id: student.id,
          student_name: student.full_name,
          title: title,
          description: details,
          target_domain: "Multi-Domain",
          status: "Active",
          action_items: "Scheduled bi-weekly check-in; Parent notification dispatched.",
          due_date: scheduledDate,
          scheduled_followup: scheduledDate,
        });
      } else if (actionType === "counseling") {
        scheduleCounselingSession({
          student_id: student.id,
          student_name: student.full_name,
          counselor: "Alexander Santos, RGC",
          date: scheduledDate,
          time: "10:00 AM",
          type: "Individual",
          status: "Scheduled",
          notes: details,
        });
      }

      // Always dispatch app notification
      addAppNotification({
        targetRole: "all",
        title: `Intervention Initiated: ${student.full_name}`,
        body: `${title} — ${details}`,
        message: `${title} — ${details}`,
        type: actionType === "care_plan" ? "alert" : actionType === "counseling" ? "session" : "alert",
        studentId: student.id,
        studentName: student.full_name,
        read: false,
      });

      count++;
    });

    success(
      "Batch Intervention Dispatched",
      `Successfully processed ${count} student records across guidance and parent channels.`
    );

    if (onDispatched) onDispatched();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-800 text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Multi-Recipient Batch Intervention & Broadcast
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 font-extrabold">
                  Mass Action Hub
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Filter target at-risk cohorts, assign unified care plans, or send mass guidance updates simultaneously.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "care_plan", title: "Assign Care Plan", desc: "Create active multi-factor intervention care plan", icon: HeartHandshake },
              { id: "counseling", title: "Schedule Sessions", desc: "Book triage counseling sessions for cohort", icon: Calendar },
              { id: "notification", title: "Send In-App Alerts", desc: "Broadcast alerts to teachers and parents", icon: MessageSquare },
            ].map((act) => {
              const Icon = act.icon;
              const isSelected = actionType === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setActionType(act.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${isSelected ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200 shadow-sm" : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? "text-red-700 dark:text-red-400" : "text-slate-400"}`} />
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "border-red-600 bg-red-600 text-white" : "border-slate-300"}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-snug">{act.title}</h4>
                    <p className="text-[11px] opacity-75 mt-0.5">{act.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Intervention Subject / Goal
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Target Due / Follow-up Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Action Directives / Counselor Instructions
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Cohort Filters & Multi-Selection */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Cohort:
                </span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Critical">Critical Risk Students</option>
                  <option value="High">High Risk Students</option>
                  <option value="Moderate">Moderate Risk Students</option>
                  <option value="Low">Low Risk Students</option>
                  <option value="All">All Risk Levels</option>
                </select>

                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="All">All Grades</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>

              <button
                onClick={handleToggleSelectAll}
                className="text-xs font-semibold text-red-800 dark:text-red-400 hover:underline flex items-center gap-1.5"
              >
                {selectedIds.size === filteredStudents.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Deselect All ({filteredStudents.length})
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" /> Select All ({filteredStudents.length})
                  </>
                )}
              </button>
            </div>

            {/* Students List */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No students match the selected filter criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-8"></th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">LRN</th>
                      <th className="py-2 px-3">Grade & Section</th>
                      <th className="py-2 px-3">Risk Band</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.map((s) => {
                      const isChecked = selectedIds.has(s.id);
                      return (
                        <tr
                          key={s.id}
                          onClick={() => handleToggleStudent(s.id)}
                          className={`cursor-pointer transition-colors ${isChecked ? "bg-red-50/50 dark:bg-red-950/20" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"}`}
                        >
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-red-700 focus:ring-red-500"
                            />
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {s.full_name}
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                            {s.lrn}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            Grade {s.grade_level} - {s.section_name || "St. Anthony"}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${s.latest_risk_tier === "high" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : s.latest_risk_tier === "medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                              {s.latest_risk_tier || "Low"} ({s.latest_risk_score}%)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Selected: <strong className="text-red-700 dark:text-red-400 font-bold">{selectedIds.size}</strong> student(s)
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              disabled={selectedIds.size === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-800 hover:bg-red-700 disabled:opacity-50 shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Dispatch to {selectedIds.size} Recipient(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
