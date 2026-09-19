"use client";

import React, { useState } from "react";
import { X, PlusCircle, CheckCircle2, RefreshCw, Calendar, Target, AlertTriangle } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface InterventionModalProps {
  student: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: "",
    target_domain: "Academic & Mental Health",
    description: "",
    action_items: "",
    followup_days: 7
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please fill in the required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + Number(formData.followup_days));

    try {
      await fetchWithAuth("/risk/interventions", {
        method: "POST",
        body: JSON.stringify({
          student_id: student.id,
          title: formData.title,
          target_domain: formData.target_domain,
          risk_level_at_creation: student.latest_risk_tier || "high",
          description: formData.description,
          action_items: formData.action_items,
          scheduled_followup: followupDate.toISOString()
        })
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create intervention plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Intervention Care Plan</h3>
              <p className="text-xs text-slate-400">
                For: <span className="text-white font-medium">{student.first_name} {student.last_name}</span> (LRN: {student.lrn})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Plan Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Peer Tutoring & Weekly Counseling Support Protocol"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Risk Domain</label>
              <select
                value={formData.target_domain}
                onChange={(e) => setFormData({ ...formData, target_domain: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Academic & Mental Health">Academic & Mental Health</option>
                <option value="Academic Remediation">Academic Remediation</option>
                <option value="Psychological & Counseling">Psychological & Counseling</option>
                <option value="Financial Assistance">Financial Assistance</option>
                <option value="Family Consultation">Family Consultation</option>
                <option value="Health Clinic Support">Health Clinic Support</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Follow-up Schedule</label>
              <select
                value={formData.followup_days}
                onChange={(e) => setFormData({ ...formData, followup_days: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>In 3 Days (Urgent)</option>
                <option value={7}>In 1 Week (Standard)</option>
                <option value={14}>In 2 Weeks</option>
                <option value={30}>In 1 Month (Midterm Check)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Intervention Objective & Diagnosis *</label>
            <textarea
              rows={2}
              required
              placeholder="Detail the failure risk factors and remediation goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Action Items / Assigned Tasks</label>
            <textarea
              rows={3}
              placeholder="- Coordinate with Subject Teacher for remedial tests&#10;- Schedule parent consultation on allowance/study space&#10;- Assign peer study buddy for Math"
              value={formData.action_items}
              onChange={(e) => setFormData({ ...formData, action_items: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Create & Dispatch Plan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
