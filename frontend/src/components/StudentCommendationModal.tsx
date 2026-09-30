"use client";

import React, { useState } from "react";
import { 
  X, 
  Award, 
  CheckCircle2, 
  Send, 
  PhoneCall,
  RefreshCw
} from "lucide-react";
import { StudentRecord } from "@/data/students500";
import { addStudentCommendation, StudentCommendation } from "@/lib/dataset-store";

interface StudentCommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentRecord;
  senderName?: string;
  senderRole?: "Teacher" | "Counselor" | "Principal";
  onSuccess?: () => void;
}

const BADGE_TYPES: Array<{
  id: StudentCommendation["badge_type"];
  label: string;
  desc: string;
  color: string;
  icon: string;
}> = [
  {
    id: "Academic Excellence",
    label: "Academic Excellence",
    desc: "Outstanding test score, mastery of lessons, or consistent honor standing",
    color: "bg-amber-50 text-amber-900 border-amber-300",
    icon: "🥇"
  },
  {
    id: "Perseverance & Turnaround",
    label: "Perseverance & Turnaround",
    desc: "Overcoming a setback, homework recovery, or subject improvement",
    color: "bg-blue-50 text-blue-900 border-blue-300",
    icon: "🚀"
  },
  {
    id: "Kindness & Peer Support",
    label: "Kindness & Peer Support",
    desc: "Helping classmates, demonstrating empathy, and promoting inclusion",
    color: "bg-rose-50 text-rose-900 border-rose-300",
    icon: "🤝"
  },
  {
    id: "Leadership & Service",
    label: "Leadership & Service",
    desc: "Exemplary classroom citizenship, club contribution, or community spirit",
    color: "bg-purple-50 text-purple-900 border-purple-300",
    icon: "🌟"
  },
  {
    id: "Exemplary Attendance",
    label: "Exemplary Attendance & Punctuality",
    desc: "100% on-time attendance, zero tardiness, and active daily participation",
    color: "bg-emerald-50 text-emerald-900 border-emerald-300",
    icon: "⏰"
  }
];

export const StudentCommendationModal: React.FC<StudentCommendationModalProps> = ({
  isOpen,
  onClose,
  student,
  senderName = "Adviser / Counselor",
  senderRole = "Teacher",
  onSuccess
}) => {
  const [selectedBadge, setSelectedBadge] = useState<StudentCommendation["badge_type"]>("Perseverance & Turnaround");
  const [title, setTitle] = useState("Remarkable Effort & Progress This Quarter");
  const [message, setMessage] = useState(
    `Recognized for outstanding dedication, active participation in class recitations, and inspiring peer support in ${student.section_name}.`
  );
  const [notifyParentSms, setNotifyParentSms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      addStudentCommendation({
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        student_lrn: student.lrn,
        section: student.section_name,
        sender_name: senderName,
        sender_role: senderRole,
        badge_type: selectedBadge,
        title: title.trim(),
        message: message.trim(),
        notify_parent_sms: notifyParentSms
      });

      setSuccessToast(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessToast(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50/60 to-rose-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Award Student Commendation</h3>
              <p className="text-xs text-slate-500">Positive Reinforcement Card for {student.first_name} {student.last_name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-white/80 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {successToast ? (
            <div className="p-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Commendation Dispatched!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                The commendation card has been awarded to <strong>{student.first_name}</strong> and notification was dispatched to the parent portal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Badge Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Recognition Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BADGE_TYPES.map((b) => {
                    const isSelected = selectedBadge === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBadge(b.id)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? `${b.color} ring-2 ring-[#8B0014]/40 font-bold`
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xl">{b.icon}</span>
                        <div>
                          <p className="text-xs font-bold">{b.label}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{b.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Commendation Headline *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#8B0014]"
                  required
                />
              </div>

              {/* Personalized Praise Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Personalized Praise Message / Teacher Remark *
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the milestone or effort demonstrated by the student..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#8B0014]"
                  required
                />
              </div>

              {/* Notify Parent Toggle */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-amber-700" />
                  <div>
                    <p className="text-xs font-bold text-amber-950">SMS &amp; In-App Alert to Parent</p>
                    <p className="text-[10px] text-amber-800">Directly celebrate this win with the student&apos;s family</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyParentSms}
                  onChange={(e) => setNotifyParentSms(e.target.checked)}
                  className="h-4 w-4 rounded text-[#8B0014] focus:ring-[#8B0014] cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0014] to-[#B91C1C] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Award &amp; Notify Parent</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
