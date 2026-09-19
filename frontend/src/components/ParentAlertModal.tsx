"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Send, 
  Mail, 
  Smartphone, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";

interface ParentAlertModalProps {
  student: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ParentAlertModal: React.FC<ParentAlertModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [channel, setChannel] = useState<"both" | "sms" | "email">("both");
  const [templateId, setTemplateId] = useState<string>("case_conference_taglish");
  const [parentContact] = useState<string>("+63 917 555 0192");
  const [parentEmail] = useState<string>("parent.dimaculangan@gmail.com");
  const [subject, setSubject] = useState<string>("SAPC Guidance Office: Parent-Counselor Case Conference Invitation");
  const [messageBody, setMessageBody] = useState<string>("");
  const [meetingDate, setMeetingDate] = useState<string>("");
  const [meetingLocation, setMeetingLocation] = useState<string>("Room 204 Guidance Center, SAPC");
  const [templates, setTemplates] = useState<any[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSentSuccess, setIsSentSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadTemplates = async () => {
      try {
        const data = await fetchWithAuth("/notifications/templates");
        setTemplates(data);
        if (data && data.length > 0) {
          const t = data[0];
          setTemplateId(t.id);
          setSubject(t.subject);
          setMessageBody(t.body);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    };

    // Set default meeting date to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(10, 0, 0, 0);
    setMeetingDate(tomorrow.toISOString().slice(0, 16));

    loadTemplates();
    setIsSentSuccess(false);
  }, [isOpen, student]);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const t = templates.find((item) => item.id === id);
    if (t) {
      setSubject(t.subject);
      setMessageBody(t.body);
      if (t.channel === "sms") setChannel("sms");
      else if (t.channel === "email") setChannel("email");
      else setChannel("both");
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.id || !messageBody.trim()) return;

    setIsSending(true);
    try {
      await fetchWithAuth("/notifications/dispatch", {
        method: "POST",
        body: JSON.stringify({
          student_id: student.id,
          parent_contact: channel === "email" ? parentEmail : parentContact,
          channel: channel,
          notification_type: templateId,
          subject: subject,
          message_body: messageBody,
          meeting_date: meetingDate ? new Date(meetingDate).toISOString() : null,
          meeting_location: meetingLocation
        })
      });
      setIsSentSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Dispatch failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] border border-[#8B0014]/20">
              <Smartphone className="h-5 w-5 text-[#8B0014]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Parent Multi-Channel Meeting Alert & SMS Dispatcher</h2>
              <p className="text-xs text-slate-500">Fast, respectful parent consultation outreach compliant with RA 10173</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {isSentSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Parent Consultation Notice Dispatched!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  The meeting invitation has been transmitted via <strong className="text-slate-900 uppercase">{channel}</strong> to the registered guardian of <strong>{student.first_name} {student.last_name}</strong>.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] text-white text-xs font-bold shadow-md hover:bg-[#6D0010] transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDispatch} className="space-y-6">
              {/* Student Context Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[#8B0014] text-white flex items-center justify-center font-bold text-lg">
                    {student.first_name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {student.first_name} {student.last_name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      LRN: {student.lrn} • Section: {student.section_name || student.section?.name || "Grade 11 - St. Augustine"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RiskBadge 
                    score={student.composite_risk_score || student.latest_risk_score || 68.4} 
                    tier={student.risk_tier || student.latest_risk_tier || "high"} 
                    size="sm" 
                  />
                </div>
              </div>

              {/* Template & Channel Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pre-Formatted Outreach Template
                  </label>
                  <select
                    value={templateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-[#8B0014]/20 focus:border-[#8B0014]"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dispatch Channel
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel("both")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        channel === "both"
                          ? "bg-[#8B0014] text-white border-[#8B0014] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Both (SMS + Email)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel("sms")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        channel === "sms"
                          ? "bg-[#8B0014] text-white border-[#8B0014] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" /> SMS Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel("email")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        channel === "email"
                          ? "bg-[#8B0014] text-white border-[#8B0014] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" /> Email Only
                    </button>
                  </div>
                </div>
              </div>

              {/* Proposed Meeting Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#8B0014]" />
                    Proposed Meeting Schedule:
                  </label>
                  <input
                    type="datetime-local"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#8B0014]" />
                    Venue / Meeting Mode:
                  </label>
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Subject and Message Editor */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Header:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Outreach Message Body (Taglish / English):</label>
                    <span className="text-[11px] text-slate-400 font-mono">{messageBody.length} chars</span>
                  </div>
                  <textarea
                    rows={4}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-900 bg-white focus:ring-2 focus:ring-[#8B0014]/20 focus:border-[#8B0014]"
                  />
                </div>
              </div>

              {/* Live Dispatch Preview */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <span className="text-xs font-bold text-[#8B0014] uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4" />
                  Philippine Mobile SMS Preview (+63 9XX):
                </span>
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-800 font-mono leading-relaxed shadow-2xs">
                  [SAPC Guidance Center]: {messageBody} Schedule: {meetingDate ? new Date(meetingDate).toLocaleString() : "TBD"}. Venue: {meetingLocation}. Reply YES to confirm.
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  RA 10173 Protected • Logged in Central Audit Trail
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {isSending ? "Transmitting..." : "Send Parent Invitation"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
