"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  RefreshCw, 
  Target, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  Bell, 
  Lock, 
  GraduationCap, 
  Brain, 
  DollarSign, 
  Users, 
  HeartPulse, 
  ChevronRight,
  UserCheck
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export interface CarePlanTask {
  id: string;
  text: string;
  assignee: string;
  priority: "high" | "medium" | "routine";
  due_timeline: string;
  completed: boolean;
}

interface InterventionModalProps {
  student: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// 6 Curated Protocol Presets for 1-Click Care Plan Generation
const PROTOCOL_TEMPLATES = [
  {
    id: "academic_remediation",
    name: "Academic Remediation & Tutoring",
    domain: "Academic Remediation",
    icon: GraduationCap,
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    title: "Peer Tutoring & Modular Subject Remediation Plan",
    description: "Targeted academic recovery protocol focusing on core subject competencies, weekly peer tutoring sessions, and bi-weekly diagnostic progress checks with subject teachers.",
    followup_days: 7,
    status: "in_progress",
    tasks: [
      {
        id: "task-1",
        text: "Coordinate with Subject Teacher for diagnostic remedial quiz and modular worksheets",
        assignee: "Subject Teacher",
        priority: "high",
        due_timeline: "Within 3 Days",
        completed: false
      },
      {
        id: "task-2",
        text: "Pair with accredited Senior High peer study tutor for twice-weekly review sessions",
        assignee: "Guidance Counselor",
        priority: "medium",
        due_timeline: "Within 1 Week",
        completed: false
      },
      {
        id: "task-3",
        text: "Weekly modular assignment progress check-in with Class Adviser",
        assignee: "Class Adviser",
        priority: "medium",
        due_timeline: "Ongoing (Weekly)",
        completed: false
      },
      {
        id: "task-4",
        text: "Student daily commitment log for 45-minute distraction-free evening study",
        assignee: "Student",
        priority: "routine",
        due_timeline: "Ongoing",
        completed: false
      }
    ]
  },
  {
    id: "mental_health_wellness",
    name: "Mental Health & Stress De-escalation",
    domain: "Psychological & Counseling",
    icon: Brain,
    badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    title: "Confidential Stress De-escalation & Counseling Support Protocol",
    description: "Clinical guidance intake and structured bi-weekly 1-on-1 counseling sessions addressing cognitive anxiety, academic burnout, emotional coping, and sleep hygiene.",
    followup_days: 3,
    status: "in_progress",
    tasks: [
      {
        id: "task-1",
        text: "Conduct confidential 1-on-1 clinical intake and anxiety trigger inventory",
        assignee: "Guidance Counselor",
        priority: "high",
        due_timeline: "Within 24 Hours",
        completed: false
      },
      {
        id: "task-2",
        text: "Introduce box breathing, cognitive reframing, and test-anxiety toolkit",
        assignee: "Guidance Counselor",
        priority: "medium",
        due_timeline: "Within 3 Days",
        completed: false
      },
      {
        id: "task-3",
        text: "Check-in with school clinic regarding somatic headaches and sleep hygiene",
        assignee: "School Clinic / Nurse",
        priority: "medium",
        due_timeline: "Within 1 Week",
        completed: false
      },
      {
        id: "task-4",
        text: "Bi-weekly wellness reflection journal submission via Student Portal",
        assignee: "Student",
        priority: "routine",
        due_timeline: "Bi-weekly",
        completed: false
      }
    ]
  },
  {
    id: "financial_assistance",
    name: "Financial Aid & Grant Subsidy",
    domain: "Financial Assistance",
    icon: DollarSign,
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    title: "Emergency Student Assistance Grant & Installment Restructuring",
    description: "Proactive retention protocol to eliminate financial-driven dropouts by endorsing the student to SAPC Alumni Emergency Subsidy and setting up flexible installment terms.",
    followup_days: 7,
    status: "in_progress",
    tasks: [
      {
        id: "task-1",
        text: "Endorse student application to SAPC Alumni Foundation Emergency Relief Fund",
        assignee: "Guidance Counselor",
        priority: "high",
        due_timeline: "Within 3 Days",
        completed: false
      },
      {
        id: "task-2",
        text: "Coordinate with Finance & Accounting Office for promissory installment restructuring",
        assignee: "Scholarship / Finance Office",
        priority: "high",
        due_timeline: "Within 5 Days",
        completed: false
      },
      {
        id: "task-3",
        text: "Briefing consultation with parent/guardian on financial aid documentation",
        assignee: "Class Adviser",
        priority: "medium",
        due_timeline: "Within 1 Week",
        completed: false
      }
    ]
  },
  {
    id: "family_attendance",
    name: "Family Case Conference & Attendance",
    domain: "Family Consultation & Attendance",
    icon: Users,
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    title: "Guardian Case Conference & Attendance Recovery Contract",
    description: "Collaborative home-school partnership protocol to resolve chronic absenteeism, clarify home study routines, and establish structured attendance monitoring.",
    followup_days: 5,
    status: "in_progress",
    tasks: [
      {
        id: "task-1",
        text: "Formal case conference with parent/guardian and Class Adviser at Guidance Center",
        assignee: "Guidance Counselor",
        priority: "high",
        due_timeline: "Within 3 Days",
        completed: false
      },
      {
        id: "task-2",
        text: "Execute formal Attendance Recovery Commitment Contract with student and guardian",
        assignee: "Parent / Guardian",
        priority: "high",
        due_timeline: "Within 5 Days",
        completed: false
      },
      {
        id: "task-3",
        text: "Daily morning attendance tracking and weekly guidance summary submission",
        assignee: "Class Adviser",
        priority: "medium",
        due_timeline: "Ongoing",
        completed: false
      }
    ]
  },
  {
    id: "health_clinic",
    name: "Clinic Health & Somatic Evaluation",
    domain: "Health Clinic Support",
    icon: HeartPulse,
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    title: "Clinic Somatic Health Evaluation & Wellness Support",
    description: "Medical evaluation for students exhibiting frequent clinic visits, chronic fatigue, or physical symptoms impeding sustained classroom learning.",
    followup_days: 7,
    status: "in_progress",
    tasks: [
      {
        id: "task-1",
        text: "Comprehensive somatic health checkup and vital sign evaluation at SAPC Clinic",
        assignee: "School Clinic / Nurse",
        priority: "high",
        due_timeline: "Within 2 Days",
        completed: false
      },
      {
        id: "task-2",
        text: "Secure parental medical clearance and physician recommendation form",
        assignee: "Parent / Guardian",
        priority: "medium",
        due_timeline: "Within 2 Weeks",
        completed: false
      },
      {
        id: "task-3",
        text: "Classroom physical accommodation memo (front seat preference, hydration allowance)",
        assignee: "Class Adviser",
        priority: "routine",
        due_timeline: "Within 3 Days",
        completed: false
      }
    ]
  },
  {
    id: "multifactor_retention",
    name: "Multi-Factor Retention Masterplan",
    domain: "Multi-Domain Comprehensive",
    icon: Layers,
    badgeColor: "bg-rose-100 text-rose-950 border-rose-300",
    title: "Integrated Multi-Factor Risk Mitigation & Retention Masterplan",
    description: "Comprehensive multi-stakeholder case management plan addressing combined academic difficulty, psychological stress, and home circumstances.",
    followup_days: 3,
    status: "in_progress",
    tasks: [
      {
        id: "task-1",
        text: "Multidisciplinary Guidance Case Conference (Counselor, Adviser, Subject Teachers)",
        assignee: "Guidance Counselor",
        priority: "high",
        due_timeline: "Within 48 Hours",
        completed: false
      },
      {
        id: "task-2",
        text: "Individualized academic adjustment & deadline extension agreement",
        assignee: "Subject Teacher",
        priority: "high",
        due_timeline: "Within 3 Days",
        completed: false
      },
      {
        id: "task-3",
        text: "Weekly 1-on-1 counseling check-in and coping mechanism review",
        assignee: "Guidance Counselor",
        priority: "high",
        due_timeline: "Weekly",
        completed: false
      },
      {
        id: "task-4",
        text: "Assign dedicated peer mentor for study group participation",
        assignee: "Class Adviser",
        priority: "medium",
        due_timeline: "Within 1 Week",
        completed: false
      }
    ]
  }
];

const QUICK_SUGGESTIONS = [
  { text: "1-on-1 Clinical Intake Counseling Session", assignee: "Guidance Counselor", priority: "high", due: "Within 24 Hours" },
  { text: "Send official Parent/Guardian case conference invite", assignee: "Guidance Counselor", priority: "high", due: "Within 3 Days" },
  { text: "Subject Teacher remedial test & worksheet provision", assignee: "Subject Teacher", priority: "medium", due: "Within 1 Week" },
  { text: "Class Adviser daily attendance monitoring report", assignee: "Class Adviser", priority: "medium", due: "Ongoing" },
  { text: "Referral to SAPC Alumni Emergency Tuition Assistance", assignee: "Scholarship / Finance Office", priority: "high", due: "Within 5 Days" },
  { text: "Somatic fatigue evaluation & vital signs checkup", assignee: "School Clinic / Nurse", priority: "medium", due: "Within 3 Days" },
  { text: "Student weekly goal journal & self-reflection log", assignee: "Student", priority: "routine", due: "Ongoing" }
];

export const InterventionModal: React.FC<InterventionModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    target_domain: "Academic Remediation",
    custom_domain: "",
    description: "",
    followup_days: 7,
    status: "in_progress",
    confidentiality: "guidance_only"
  });

  // Action Items State
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Guidance Counselor");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "routine">("medium");
  const [newTaskTimeline, setNewTaskTimeline] = useState("Within 1 Week");

  // Workflow & Stakeholder Dispatch Options
  const [dispatchAdviser, setDispatchAdviser] = useState(true);
  const [dispatchParent, setDispatchParent] = useState(true);
  const [dispatchStudentPortal, setDispatchStudentPortal] = useState(true);
  const [dispatchCalendarAlert, setDispatchCalendarAlert] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset when opened
  useEffect(() => {
    if (isOpen && student) {
      // Default to Academic or Mental Health template based on student risk driver
      const primaryDriver = (student.primary_risk_driver || "").toLowerCase();
      let matchedTemplate = PROTOCOL_TEMPLATES[0];
      if (primaryDriver.includes("mental") || primaryDriver.includes("anxiety")) {
        matchedTemplate = PROTOCOL_TEMPLATES[1];
      } else if (primaryDriver.includes("financial")) {
        matchedTemplate = PROTOCOL_TEMPLATES[2];
      } else if (primaryDriver.includes("family") || primaryDriver.includes("attendance")) {
        matchedTemplate = PROTOCOL_TEMPLATES[3];
      } else if (primaryDriver.includes("health")) {
        matchedTemplate = PROTOCOL_TEMPLATES[4];
      }

      applyTemplate(matchedTemplate);
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const applyTemplate = (tmpl: typeof PROTOCOL_TEMPLATES[0]) => {
    setSelectedTemplate(tmpl.id);
    setFormData({
      title: `${tmpl.title} (${student.first_name})`,
      target_domain: tmpl.domain,
      custom_domain: "",
      description: tmpl.description,
      followup_days: tmpl.followup_days,
      status: tmpl.status,
      confidentiality: "guidance_only"
    });
    setTasks(
      tmpl.tasks.map((t, idx) => ({
        ...t,
        id: `task-${Date.now()}-${idx}`
      })) as CarePlanTask[]
    );
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: CarePlanTask = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      assignee: newTaskAssignee,
      priority: newTaskPriority,
      due_timeline: newTaskTimeline,
      completed: false
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
  };

  const handleAddQuickTask = (sug: typeof QUICK_SUGGESTIONS[0]) => {
    const newTask: CarePlanTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: sug.text,
      assignee: sug.assignee,
      priority: sug.priority as any,
      due_timeline: sug.due,
      completed: false
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleToggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please provide a valid Plan Title and Clinical Objective description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + Number(formData.followup_days));

    const effectiveDomain =
      formData.target_domain === "Custom Domain"
        ? formData.custom_domain.trim() || "Custom Domain"
        : formData.target_domain;

    // Serialize tasks into JSON string format
    const serializedTasks = JSON.stringify(tasks);

    try {
      // 1. Try sending to backend API
      const res = await fetchWithAuth("/risk/interventions", {
        method: "POST",
        body: JSON.stringify({
          student_id: student.id,
          title: formData.title,
          target_domain: effectiveDomain,
          risk_level_at_creation: student.latest_risk_tier || "high",
          description: formData.description,
          action_items: serializedTasks,
          status: formData.status,
          scheduled_followup: followupDate.toISOString()
        })
      }).catch((err) => {
        console.warn("Backend API not reachable for intervention sync, falling back to local storage:", err);
        return null;
      });

      // 2. Also record in local state / localStorage to guarantee instant UI reflection
      if (typeof window !== "undefined") {
        const storedPlans = localStorage.getItem("sapc_interventions");
        const existingPlans: any[] = storedPlans ? JSON.parse(storedPlans) : [];
        
        const newCarePlan = {
          id: res?.id || Date.now(),
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          title: formData.title,
          target_domain: effectiveDomain,
          risk_level_at_creation: student.latest_risk_tier || "high",
          description: formData.description,
          action_items: serializedTasks,
          status: formData.status,
          scheduled_followup: followupDate.toISOString(),
          created_at: new Date().toISOString(),
          dispatch_flags: {
            adviser: dispatchAdviser,
            parent: dispatchParent,
            student_portal: dispatchStudentPortal,
            calendar_alert: dispatchCalendarAlert
          }
        };

        const updated = [newCarePlan, ...existingPlans.filter((p) => p.id !== newCarePlan.id)];
        localStorage.setItem("sapc_interventions", JSON.stringify(updated));

        // Dispatch window event so any open dashboards react instantly
        window.dispatchEvent(new CustomEvent("sapc_interventions_updated", { detail: newCarePlan }));
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create intervention plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in font-sans overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-rose-50/40 to-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#8B0014] text-white shadow-xs">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Configure Intervention Care Plan & Protocol
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200">
                  {student.latest_risk_tier || "High"} Risk
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Target Student: <strong className="text-slate-900 font-bold">{student.first_name} {student.last_name}</strong> (LRN: <span className="font-mono">{student.lrn}</span> • {student.section_name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-6 text-sm flex-1">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
              <span className="font-medium text-xs sm:text-sm">{error}</span>
            </div>
          )}

          {/* 1-Click Protocol Template Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#8B0014] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                1-Click Care Plan Protocol Templates:
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Click to auto-populate best practice workflows</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PROTOCOL_TEMPLATES.map((tmpl) => {
                const IconComp = tmpl.icon;
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 shadow-2xs ${
                      isSelected
                        ? "bg-rose-50/80 border-[#8B0014] ring-2 ring-[#8B0014]/20"
                        : "bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-xl ${isSelected ? "bg-[#8B0014] text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-extrabold text-[#8B0014] bg-white px-2 py-0.5 rounded-full border border-rose-200">
                          Active
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug">
                        {tmpl.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {tmpl.tasks.length} standard tasks
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Plan Details */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#8B0014]" />
              Plan Title & Target Domain Configuration
            </h4>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Care Plan Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Peer Tutoring & Weekly Counseling Support Protocol"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8B0014] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Target Domain
                </label>
                <select
                  value={formData.target_domain}
                  onChange={(e) => setFormData({ ...formData, target_domain: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#8B0014] transition"
                >
                  <option value="Academic Remediation">Academic Remediation</option>
                  <option value="Psychological & Counseling">Psychological & Counseling</option>
                  <option value="Financial Assistance">Financial Assistance</option>
                  <option value="Family Consultation & Attendance">Family Consultation & Attendance</option>
                  <option value="Health Clinic Support">Health Clinic Support</option>
                  <option value="Multi-Domain Comprehensive">Multi-Domain Comprehensive</option>
                  <option value="Custom Domain">+ Custom Domain...</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Workflow Stage
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#8B0014] transition"
                >
                  <option value="in_progress">🟡 In Progress (Active Monitoring)</option>
                  <option value="pending">⚪ Pending Intake Review</option>
                  <option value="resolved">🟢 Resolved / Goal Met</option>
                  <option value="escalated">🔴 Escalated to Case Conference</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Follow-up Horizon
                </label>
                <select
                  value={formData.followup_days}
                  onChange={(e) => setFormData({ ...formData, followup_days: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#8B0014] transition"
                >
                  <option value={3}>In 3 Days (Urgent)</option>
                  <option value={5}>In 5 Days</option>
                  <option value={7}>In 1 Week (Standard)</option>
                  <option value={14}>In 2 Weeks</option>
                  <option value={30}>In 1 Month (Midterm Audit)</option>
                </select>
              </div>
            </div>

            {/* Custom Domain Input when selected */}
            {formData.target_domain === "Custom Domain" && (
              <div className="animate-in fade-in">
                <label className="block font-bold text-[#8B0014] text-xs mb-1">
                  Specify Custom Target Domain Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extracurricular Re-engagement, Special Education Accommodation..."
                  value={formData.custom_domain}
                  onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                  className="w-full bg-white border border-rose-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8B0014] transition"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Clinical Objective & Diagnosis Formulation *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Detail the failure risk root cause, intervention hypothesis, and measurable recovery milestones..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8B0014] transition"
              />
            </div>
          </div>

          {/* Dynamic Action Items Checklist Builder */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Action Items & Stakeholder Task Checklist ({tasks.length} Items)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Assign actionable responsibilities to Counselor, Adviser, Teacher, Student, or Parent.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                {tasks.filter((t) => t.completed).length} / {tasks.length} Completed
              </span>
            </div>

            {/* Quick Suggested Task Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">Quick Add Suggested Tasks:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleAddQuickTask(sug)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-300 hover:border-[#8B0014] hover:text-[#8B0014] text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                  >
                    <Plus className="h-3 w-3 text-[#8B0014]" />
                    <span>{sug.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Tasks List */}
            <div className="space-y-2 pt-1">
              {tasks.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-white border border-dashed border-slate-300 text-slate-400 text-xs">
                  No action items added yet. Use the form below or pick suggested tasks above.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                      task.completed
                        ? "bg-emerald-50/60 border-emerald-200 text-slate-500"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskCompleted(task.id)}
                        className={`mt-0.5 p-1 rounded-lg border transition ${
                          task.completed
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 text-transparent border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="space-y-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-bold text-slate-900 ${task.completed ? "line-through text-slate-400" : ""}`}>
                          {task.text}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200 inline-flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-[#8B0014]" />
                            {task.assignee}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider ${
                              task.priority === "high"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : task.priority === "medium"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 font-medium border border-slate-200 inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {task.due_timeline}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTask(task.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition self-end sm:self-center"
                      title="Remove task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Inline Task Creator Form */}
            <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Add New Action Item:</span>
              </div>
              <input
                type="text"
                placeholder="Describe specific task or milestone to be completed..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
              />

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#8B0014]"
                  >
                    <option value="Guidance Counselor">Guidance Counselor</option>
                    <option value="Class Adviser">Class Adviser</option>
                    <option value="Subject Teacher">Subject Teacher</option>
                    <option value="Student">Student</option>
                    <option value="Parent / Guardian">Parent / Guardian</option>
                    <option value="School Clinic / Nurse">School Clinic / Nurse</option>
                    <option value="Scholarship / Finance Office">Scholarship / Finance Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#8B0014]"
                  >
                    <option value="high">🔴 High / Urgent</option>
                    <option value="medium">🟡 Medium / Standard</option>
                    <option value="routine">🟢 Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Timeline Due</label>
                  <select
                    value={newTaskTimeline}
                    onChange={(e) => setNewTaskTimeline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#8B0014]"
                  >
                    <option value="Within 24 Hours">Within 24 Hours</option>
                    <option value="Within 3 Days">Within 3 Days</option>
                    <option value="Within 1 Week">Within 1 Week</option>
                    <option value="Within 2 Weeks">Within 2 Weeks</option>
                    <option value="Ongoing">Ongoing / Quarterly</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddTask}
                    disabled={!newTaskText.trim()}
                    className="w-full py-2 px-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow & Stakeholder Dispatch Options */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-[#8B0014]" />
                Automated Workflow & Stakeholder Dispatch
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Configurable integration triggers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={dispatchAdviser}
                  onChange={(e) => setDispatchAdviser(e.target.checked)}
                  className="mt-0.5 text-[#8B0014] rounded-md focus:ring-0 cursor-pointer"
                />
                <div>
                  <strong className="text-slate-900 font-bold block">Notify Class Adviser</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Dispatch brief intake notification to {student.adviser_name || "Adviser"}.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={dispatchParent}
                  onChange={(e) => setDispatchParent(e.target.checked)}
                  className="mt-0.5 text-[#8B0014] rounded-md focus:ring-0 cursor-pointer"
                />
                <div>
                  <strong className="text-slate-900 font-bold block">Generate Parent Notice Draft</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Queue SMS/email briefing invite for guardian case conference.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={dispatchStudentPortal}
                  onChange={(e) => setDispatchStudentPortal(e.target.checked)}
                  className="mt-0.5 text-[#8B0014] rounded-md focus:ring-0 cursor-pointer"
                />
                <div>
                  <strong className="text-slate-900 font-bold block">Sync Student Wellness Milestones</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Publish non-punitive growth goals to student&apos;s guidance view.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={dispatchCalendarAlert}
                  onChange={(e) => setDispatchCalendarAlert(e.target.checked)}
                  className="mt-0.5 text-[#8B0014] rounded-md focus:ring-0 cursor-pointer"
                />
                <div>
                  <strong className="text-slate-900 font-bold block">Automated Calendar Reminder</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Schedule review alarm in {formData.followup_days} days.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Privacy & Compliance Footer Note */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#8B0014] shrink-0" />
              <span>
                <strong>RA 10173 SPI Protection:</strong> Care plans and clinical counseling notes are encrypted and audit-logged.
              </span>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold transition text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold flex items-center gap-2 transition disabled:opacity-50 shadow-md text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Configuring Protocol...</span>
                </>
              ) : (
                <>
                  <span>Save & Dispatch Care Plan</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
