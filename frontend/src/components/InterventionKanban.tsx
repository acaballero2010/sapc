"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  Filter,
  MoreVertical,
  Layers,
  HeartPulse,
  Brain,
  GraduationCap,
  Users as UsersIcon,
  Wallet
} from "lucide-react";

export interface KanbanItem {
  id: string;
  studentName: string;
  lrn: string;
  gradeSection: string;
  domain: "academic" | "mental_health" | "family" | "health" | "financial";
  title: string;
  riskScore: number;
  stage: "flagged" | "intake" | "active" | "review" | "resolved";
  assignedDate: string;
  milestones: string[];
}

const INITIAL_KANBAN_DATA: KanbanItem[] = [
  {
    id: "kb-1",
    studentName: "Juan Dela Cruz",
    lrn: "109283748291",
    gradeSection: "Grade 10 - St. Anthony",
    domain: "academic",
    title: "Peer Tutoring & Remedial Math Pacing",
    riskScore: 76.5,
    stage: "flagged",
    assignedDate: "2026-09-18",
    milestones: ["Enroll in Peer Tutoring", "Teacher Consultation"]
  },
  {
    id: "kb-2",
    studentName: "Maria Santos",
    lrn: "109283748292",
    gradeSection: "Grade 10 - St. Francis",
    domain: "mental_health",
    title: "One-on-One Guidance Intake Interview",
    riskScore: 68.0,
    stage: "intake",
    assignedDate: "2026-09-15",
    milestones: ["Conduct GAD-7 follow-up", "Schedule bi-weekly check-in"]
  },
  {
    id: "kb-3",
    studentName: "Carlo Aquino",
    lrn: "109283748294",
    gradeSection: "Grade 11 - STEM A",
    domain: "family",
    title: "Parent-Teacher-Counselor Case Conference",
    riskScore: 62.0,
    stage: "active",
    assignedDate: "2026-09-10",
    milestones: ["PTC Conference Completed", "Home Study Plan Active"]
  },
  {
    id: "kb-4",
    studentName: "Elena Rodriguez",
    lrn: "109283748295",
    gradeSection: "Grade 9 - St. Clare",
    domain: "financial",
    title: "Scholarship & Staggered Payment Plan",
    riskScore: 48.0,
    stage: "review",
    assignedDate: "2026-09-02",
    milestones: ["Accounting Promissory Note Approved", "Quarter 2 Installment Cleared"]
  },
  {
    id: "kb-5",
    studentName: "Jose Rizal",
    lrn: "109283748293",
    gradeSection: "Grade 10 - St. Jude",
    domain: "health",
    title: "Clinic Medical Clearance & Sleep Hygiene",
    riskScore: 28.5,
    stage: "resolved",
    assignedDate: "2026-08-20",
    milestones: ["Physician Clearance Issued", "Attendance Recovered to 98%"]
  }
];

const STAGES: { key: KanbanItem["stage"]; label: string; color: string; bg: string; border: string }[] = [
  { key: "flagged", label: "1. Flagged & Triage", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50/70 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-900/60" },
  { key: "intake", label: "2. Intake Scheduled", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50/70 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-900/60" },
  { key: "active", label: "3. Active Care Plan", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50/70 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-900/60" },
  { key: "review", label: "4. Milestone Review", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50/70 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-900/60" },
  { key: "resolved", label: "5. Resolved / Stabilized", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50/70 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-900/60" }
];

export const InterventionKanban: React.FC = () => {
  const [items, setItems] = useState<KanbanItem[]>(INITIAL_KANBAN_DATA);
  const [domainFilter, setDomainFilter] = useState<string>("all");

  const moveStage = (id: string, direction: "next" | "prev") => {
    const stageOrder: KanbanItem["stage"][] = ["flagged", "intake", "active", "review", "resolved"];
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const currentIndex = stageOrder.indexOf(item.stage);
      const newIndex = direction === "next" 
        ? Math.min(stageOrder.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
      return { ...item, stage: stageOrder[newIndex] };
    }));
  };

  const filteredItems = domainFilter === "all"
    ? items
    : items.filter(item => item.domain === domainFilter);

  const getDomainIcon = (domain: KanbanItem["domain"]) => {
    switch (domain) {
      case "academic": return <GraduationCap className="h-3.5 w-3.5 text-[#8B0014] dark:text-rose-400" />;
      case "mental_health": return <Brain className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
      case "family": return <UsersIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
      case "health": return <HeartPulse className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "financial": return <Wallet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#8B0014] dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Counselor Care Plan Kanban Board
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track student intervention stages from initial triage to resolution
            </p>
          </div>
        </div>

        {/* Domain Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {["all", "academic", "mental_health", "family", "health", "financial"].map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition shrink-0 cursor-pointer ${
                domainFilter === d
                  ? "bg-[#8B0014] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {d.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Column Kanban Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto min-w-[1000px] lg:min-w-0 pb-2">
        {STAGES.map((stage) => {
          const stageItems = filteredItems.filter(item => item.stage === stage.key);
          return (
            <div
              key={stage.key}
              className={`rounded-2xl border ${stage.border} ${stage.bg} p-3 flex flex-col min-h-[450px] shadow-2xs`}
            >
              {/* Lane Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80 mb-3">
                <span className={`text-xs font-black uppercase tracking-wider ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="h-5 w-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs">
                  {stageItems.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageItems.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center p-3 border border-dashed border-slate-300 dark:border-slate-700/60 rounded-xl">
                    <span className="text-[11px] text-slate-400 italic">No cases in this stage</span>
                  </div>
                ) : (
                  stageItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs space-y-2 hover:border-[#8B0014]/40 dark:hover:border-rose-500/40 transition group"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1 capitalize">
                          {getDomainIcon(item.domain)}
                          <span>{item.domain.replace("_", " ")}</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          item.riskScore >= 70 ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" :
                          item.riskScore >= 40 ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" :
                          "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                        }`}>
                          {item.riskScore} Risk
                        </span>
                      </div>

                      {/* Student Info */}
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#8B0014] dark:group-hover:text-rose-400 transition">
                          {item.studentName}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate font-medium">
                          {item.gradeSection} • LRN: {item.lrn}
                        </p>
                      </div>

                      {/* Intervention Title */}
                      <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        {item.title}
                      </div>

                      {/* Milestones count */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {item.milestones.length} Milestones
                        </span>

                        {/* Stage Mover Buttons */}
                        <div className="flex items-center gap-1">
                          {stage.key !== "flagged" && (
                            <button
                              onClick={() => moveStage(item.id, "prev")}
                              title="Move back"
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                            >
                              &larr;
                            </button>
                          )}
                          {stage.key !== "resolved" && (
                            <button
                              onClick={() => moveStage(item.id, "next")}
                              title="Advance to next stage"
                              className="p-1 px-1.5 rounded bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-[#8B0014] dark:text-rose-300 text-[10px] font-bold flex items-center gap-0.5"
                            >
                              <span>Next</span>
                              <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
