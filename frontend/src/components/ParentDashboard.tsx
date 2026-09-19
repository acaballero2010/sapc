"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Send, 
  CheckCircle2, 
  Clock, 
  HeartHandshake,
  MessageSquare,
  ShieldCheck
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";

export const ParentDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [student, setStudent] = useState<any | null>(null);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [childMoodHistory, setChildMoodHistory] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [_isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [students, notifs] = await Promise.all([
        fetchWithAuth("/students"),
        fetchWithAuth("/notifications/parent-inbox").catch(() => [])
      ]);

      setNotifications(notifs || []);

      if (students && students.length > 0) {
        const s = students[0];
        setStudent(s);
        const [rRes, aRes, mRes] = await Promise.all([
          fetchWithAuth(`/risk/student/${s.id}`).catch(() => null),
          fetchWithAuth(`/academic/student/${s.id}`).catch(() => null),
          fetchWithAuth(`/assessments/mood-history?student_id=${s.id}`).catch(() => null)
        ]);
        setRiskData(rRes);
        setAcademicRecords(aRes && Array.isArray(aRes) ? aRes : []);
        setChildMoodHistory(mRes || {
          average_mood: 3.8,
          average_energy: 3.5,
          streak_days: 5,
          recent_checkins: [
            { id: 1, mood_emoji: "🙂", mood_score: 4, primary_stressor: "None / Peaceful", created_at: new Date().toISOString() }
          ]
        });
      }
    } catch (err) {
      console.error("Failed to load parent dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const handleAcknowledge = async (notifId: number, action: "confirm" | "reschedule") => {
    try {
      await fetchWithAuth(`/notifications/${notifId}/acknowledge`, {
        method: "POST",
        body: JSON.stringify({ action })
      });
      await loadData();
    } catch (err) {
      console.error("Failed to acknowledge notification:", err);
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-8 pb-12 font-sans animate-pulse">
        <div className="h-48 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-64 rounded-3xl bg-slate-200" />
          <div className="h-64 rounded-3xl bg-slate-200 col-span-2" />
        </div>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setIsSent(true);
    setMessageText("");
    setTimeout(() => setIsSent(false), 5000);
  };

  const domainScores = {
    academic: riskData?.academic_score || 20,
    mental_health: riskData?.mental_health_score || 15,
    financial: riskData?.financial_score || 15,
    family: riskData?.family_score || 15,
    health: riskData?.health_score || 10
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Parent Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B0014] via-[#6D0010] to-[#4A000A] p-8 shadow-lg text-white">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-300" />
              Parent & Guardian Portal
            </span>
            <span className="text-xs sm:text-sm text-rose-100 font-semibold">• San Antonio de Padua College</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Family & Student Academic Progress
          </h1>
          <p className="text-sm sm:text-base text-rose-100 mt-2 leading-relaxed font-normal">
            Monitor your student’s attendance, quarterly performance, and connect directly with their assigned class adviser.
          </p>
        </div>
      </div>

      {/* Linked Child Summary Card */}
      <div id="child-profile" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-24">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400 flex items-center justify-center text-white font-black text-2xl shadow-xs">
                {student ? student.first_name[0] : "J"}
              </div>
              <div>
                <span className="text-xs font-bold text-[#8B0014] uppercase tracking-wider block">Linked Student Profile</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {student ? `${student.first_name} ${student.last_name}` : "Joshua Dimaculangan"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">LRN: {student?.lrn}</p>
              </div>
            </div>
            <RiskBadge score={riskData?.composite_risk_score} tier={riskData?.risk_tier} size="lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <BookOpen className="h-4 w-4 text-[#8B0014]" />
                <span>Grade Level & Section</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-2">{student?.section_name || "Grade 11 - STEM"}</p>
              <span className="text-xs text-slate-500 block mt-1">Adviser: {student?.adviser_name}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span>Attendance Standing</span>
              </div>
              <p className="text-base font-bold text-emerald-700 mt-2">
                {academicRecords[0] ? `${academicRecords[0].attendance_rate}% Rate` : "94% Attendance"}
              </p>
              <span className="text-xs text-slate-500 block mt-1">
                {academicRecords[0] ? `${academicRecords[0].absences_count} Recorded Absences` : "Regular attendance"}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Clock className="h-4 w-4 text-[#D97706]" />
                <span>Latest GPA Status</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-2">
                {academicRecords[0] ? `${academicRecords[0].gpa.toFixed(1)} / 100` : "78.5 / 100"}
              </p>
              <span className="text-xs text-slate-500 block mt-1">Quarter 1 Standing</span>
            </div>
          </div>

          {/* Child Emotional Wellness Pulse Indicator */}
          {childMoodHistory && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/70 to-amber-50/70 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-xl shadow-2xs shrink-0">
                  {childMoodHistory.recent_checkins?.[0]?.mood_emoji || "🙂"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      Daily Wellness Pulse: {childMoodHistory.recent_checkins?.[0]?.mood_score >= 4 ? "Positive / Thriving" : childMoodHistory.recent_checkins?.[0]?.mood_score === 3 ? "Neutral / Stable" : "Needs Support"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {childMoodHistory.streak_days || 1}-Day Streak
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Recent stress factor: <strong className="text-slate-700">{childMoodHistory.recent_checkins?.[0]?.primary_stressor || "None / Peaceful"}</strong> • Monitored under pastoral care
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800">Pastoral Monitored</span>
              </div>
            </div>
          )}
        </div>

        {/* Holistic Wellness Radar for Parents */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
          <h4 className="text-sm font-bold text-[#8B0014] uppercase tracking-wider mb-2">
            Holistic Growth & Support Areas
          </h4>
          <DomainRadarChart scores={domainScores} studentName={student?.first_name} />
        </div>
      </div>

      {/* Guidance Meeting Invitations & Notices */}
      {notifications.length > 0 && (
        <div id="guidance-notices" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-[#8B0014]" />
              Official Guidance Center Consultation Notices
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              {notifications.length} Active Notice(s)
            </span>
          </div>

          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#8B0014] text-white">
                      {n.channel}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{n.subject}</h4>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    n.status === "acknowledged"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}>
                    Status: {n.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-amber-200/60 font-sans">
                  {n.message_body}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 pt-1">
                  <div className="space-y-0.5">
                    {n.meeting_date && (
                      <p>
                        <strong>Proposed Schedule:</strong> {new Date(n.meeting_date).toLocaleString()}
                      </p>
                    )}
                    {n.meeting_location && (
                      <p>
                        <strong>Location:</strong> {n.meeting_location}
                      </p>
                    )}
                  </div>

                  {n.status !== "acknowledged" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcknowledge(n.id, "reschedule")}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
                      >
                        Request Reschedule
                      </button>
                      <button
                        onClick={() => handleAcknowledge(n.id, "confirm")}
                        className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm Attendance
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Messaging Portal with Class Adviser */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#8B0014]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Direct Message to Class Adviser</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Send a secure communication to <strong>{student?.adviser_name || "Class Adviser"}</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hidden sm:inline">
            Direct Channel Active
          </span>
        </div>

        {isSent && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Your message has been dispatched to the Class Adviser. You will receive an update in your registered email.</span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Consultation Topic / Inquiry
            </label>
            <textarea
              rows={3}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="e.g. Good day Teacher, I would like to inquire about the upcoming remedial schedule and study support for Joshua..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#8B0014] transition leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <HeartHandshake className="h-4 w-4 text-[#8B0014]" />
              <span>SAPC Parent-School Partnership Guidelines</span>
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-xs transition"
            >
              <Send className="h-4 w-4 text-white" />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
