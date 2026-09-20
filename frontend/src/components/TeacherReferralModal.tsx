"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  HeartHandshake
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { RiskBadge } from "./RiskBadge";

interface TeacherReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
  students?: any[];
  onSuccess?: () => void;
}

export const TeacherReferralModal: React.FC<TeacherReferralModalProps> = ({
  isOpen,
  onClose,
  student,
  students = [],
  onSuccess
}) => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(student?.id || null);
  const [concernType, setConcernType] = useState("Academic Deterioration & Multiple Failing Marks");
  const [urgency, setUrgency] = useState<"routine" | "priority" | "crisis">("priority");
  const [observations, setObservations] = useState("");
  const [attemptedInterventions, setAttemptedInterventions] = useState<string[]>([
    "1-on-1 Teacher-Student Conference"
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Track timers so we can clear them if the modal unmounts before they fire
  const timer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timers when modal unmounts
  useEffect(() => {
    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    };
  }, []);

  // Sync selected student when prop changes
  React.useEffect(() => {
    if (student?.id) {
      setSelectedStudentId(student.id);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [student, students, selectedStudentId]);

  const activeStudent = (students.length > 0 && selectedStudentId)
    ? students.find((s) => s.id === selectedStudentId) || student || students[0]
    : student || (students.length > 0 ? students[0] : null);

  if (!isOpen || !activeStudent) return null;

  const toggleIntervention = (item: string) => {
    setAttemptedInterventions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const referralPayload = {
      id: `ref-${Date.now()}`,
      student_id: activeStudent.id,
      student_name: `${activeStudent.first_name} ${activeStudent.last_name}`,
      lrn: activeStudent.lrn,
      section: activeStudent.section_name || "Senior High STEM",
      referring_teacher: user?.full_name || "Prof. Ernesto Bautista (Class Adviser)",
      concern_type: concernType,
      urgency: urgency,
      observations: observations || "Classroom observation: Student exhibiting multiple failing marks and lack of class engagement.",
      attempted_interventions: attemptedInterventions,
      created_at: new Date().toISOString(),
      status: "pending_review"
    };

    // Save to local storage for persistence across views
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("sapc_teacher_referrals") || "[]");
      localStorage.setItem("sapc_teacher_referrals", JSON.stringify([referralPayload, ...existing]));
    }

    timer1Ref.current = setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      timer2Ref.current = setTimeout(() => {
        setIsSuccess(false);
        setObservations("");
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  Adviser-to-Guidance Referral
                </span>
                <span className="text-xs text-rose-200">• Room 204</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Refer Student to Guidance Office
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
          
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Referral Successfully Dispatched!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Referral ticket routed to <strong>Maria Theresa Cruz, RGC (Guidance Counselor)</strong>. The student will appear in the priority guidance intake queue.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Student Target Chip / Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Referred Student</span>
                    <h4 className="text-base font-black text-slate-900 truncate">
                      {activeStudent.first_name} {activeStudent.last_name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">LRN: {activeStudent.lrn} • {activeStudent.section_name || "Grade 11 STEM"}</p>
                  </div>
                  <div className="shrink-0">
                    <RiskBadge score={activeStudent.latest_risk_score || 78.5} tier={activeStudent.latest_risk_tier || "high"} size="sm" />
                  </div>
                </div>

                {students.length > 1 && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Switch Student to Refer:</label>
                    <select
                      value={activeStudent.id}
                      onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#8B0014]"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.latest_risk_tier?.toUpperCase()} Risk — Score: {s.latest_risk_score})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Primary Concern Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Reason for Referral</label>
                <select
                  value={concernType}
                  onChange={(e) => setConcernType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                >
                  <option value="Academic Deterioration & Multiple Failing Marks">Academic Deterioration & Multiple Failing Marks</option>
                  <option value="Chronic Absences & Truancy (5+ Days)">Chronic Absences & Truancy (5+ Days)</option>
                  <option value="Observable Emotional / Psychological Distress or Withdrawal">Observable Emotional / Psychological Distress or Withdrawal</option>
                  <option value="Sudden Drop in Class Participation & Missing Outputs">Sudden Drop in Class Participation & Missing Outputs</option>
                  <option value="Family Crisis / External Difficulty">Family Crisis / External Difficulty</option>
                  <option value="Financial & Tuition Difficulties Affecting Attendance">Financial & Tuition Difficulties Affecting Attendance</option>
                </select>
              </div>

              {/* Urgency Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency("routine")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      urgency === "routine"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>🟢 Routine</span>
                    <span className="text-[10px] font-normal text-slate-500">Within 3-5 days</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency("priority")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      urgency === "priority"
                        ? "bg-amber-50 border-amber-500 text-amber-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>🟡 Priority</span>
                    <span className="text-[10px] font-normal text-slate-500">Within 24-48 hrs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency("crisis")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      urgency === "crisis"
                        ? "bg-rose-50 border-[#8B0014] text-[#8B0014] shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>🔴 Urgent / Crisis</span>
                    <span className="text-[10px] font-normal text-slate-500">Immediate Triage</span>
                  </button>
                </div>
              </div>

              {/* Teacher Observations Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Classroom Observations & Context</label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="e.g. Student has missed 4 consecutive Friday classes, failed 2 major written works in Chemistry, and appeared withdrawn during group activities..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                />
              </div>

              {/* Pre-referral Actions Attempted */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pre-Referral Actions Attempted</label>
                <div className="space-y-1.5">
                  {[
                    "1-on-1 Teacher-Student Conference",
                    "Peer Tutoring / Remedial Pacing Offered",
                    "Parent Contacted via SMS / Call",
                    "Class Adviser Academic Warning Issued"
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={attemptedInterventions.includes(item)}
                        onChange={() => toggleIntervention(item)}
                        className="rounded border-slate-300 text-[#8B0014] focus:ring-[#8B0014]"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Confidentiality Warning */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Confidential guidance referral under <strong>RA 10173 SPI protection</strong>.</span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? "Routing to Guidance..." : "Submit Guidance Referral"}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
