"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  BookOpen, 
  Brain, 
  DollarSign, 
  Users, 
  HeartPulse, 
  ShieldAlert, 
  PlusCircle, 
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck,
  Award
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";

interface StudentDetailModalProps {
  studentId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateIntervention?: (student: any) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  isOpen,
  onClose,
  onCreateIntervention
}) => {
  const { user } = useAuth();
  const [student, setStudent] = useState<any | null>(null);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [riskBreakdown, setRiskBreakdown] = useState<any | null>(null);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [_assessments, setAssessments] = useState<any[]>([]);
  const [counselorNotes, setCounselorNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState({
    observation_summary: "",
    mental_health_indicators: "",
    recommended_action: ""
  });
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isCounselor = user?.role === "guidance_counselor";

  useEffect(() => {
    if (!studentId || !isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [sRes, rRes, rbRes, aRes, assRes] = await Promise.all([
          fetchWithAuth(`/students/${studentId}`),
          fetchWithAuth(`/risk/student/${studentId}`),
          fetchWithAuth(`/analytics/student/${studentId}/risk-breakdown`),
          fetchWithAuth(`/academic/student/${studentId}`),
          fetchWithAuth(`/assessments/student/${studentId}`)
        ]);

        setStudent(sRes);
        setRiskData(rRes);
        setRiskBreakdown(rbRes);
        setAcademicRecords(aRes);
        setAssessments(assRes);

        if (isCounselor) {
          try {
            const notesRes = await fetchWithAuth(`/assessments/counselor-notes/student/${studentId}`);
            setCounselorNotes(notesRes);
          } catch (e) {
            console.warn("Could not load counselor notes:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load student details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [studentId, isOpen, isCounselor]);

  const handleAddCounselorNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.observation_summary.trim() || !studentId) return;

    setIsSavingNote(true);
    try {
      const added = await fetchWithAuth("/assessments/counselor-notes", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId,
          observation_summary: newNote.observation_summary,
          mental_health_indicators: newNote.mental_health_indicators,
          recommended_action: newNote.recommended_action
        })
      });
      setCounselorNotes((prev) => [added, ...prev]);
      setNewNote({ observation_summary: "", mental_health_indicators: "", recommended_action: "" });
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  if (!isOpen || !studentId) return null;

  const domainScores = {
    academic: riskData?.academic_score || 0,
    mental_health: riskData?.mental_health_score || 0,
    financial: riskData?.financial_score || 0,
    family: riskData?.family_score || 0,
    health: riskData?.health_score || 0
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-300 font-bold text-lg">
              {student ? student.first_name[0] : "S"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">
                  {student ? `${student.first_name} ${student.last_name}` : "Student Profile"}
                </h2>
                {riskData && (
                  <RiskBadge score={riskData.composite_risk_score} tier={riskData.risk_tier} size="md" />
                )}
              </div>
              <p className="text-xs text-slate-400">
                LRN: <span className="text-slate-200 font-mono">{student?.lrn}</span> • Section:{" "}
                <span className="text-slate-200">{student?.section_name}</span> • Adviser:{" "}
                <span className="text-slate-200">{student?.adviser_name || "Unassigned"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onCreateIntervention && isCounselor && (
              <button
                onClick={() => onCreateIntervention(student)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Care Plan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm">Synthesizing multi-criteria AHP profile...</p>
            </div>
          ) : (
            <>
              {/* AHP Decision Engine Synthesis Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      AHP Criteria Weights Breakdown
                    </h4>
                    {riskBreakdown && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> CR: {riskBreakdown.consistency_ratio} (Consistent)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <BookOpen className="h-3.5 w-3.5 text-blue-400" /> Academic (w_AC = 0.4017)
                      </span>
                      <span className="font-bold text-white">{domainScores.academic.toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Brain className="h-3.5 w-3.5 text-purple-400" /> Mental Health (w_MH = 0.2442)
                      </span>
                      <span className="font-bold text-white">{domainScores.mental_health.toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Financial (w_FI = 0.1373)
                      </span>
                      <span className="font-bold text-white">{domainScores.financial.toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Users className="h-3.5 w-3.5 text-amber-400" /> Family (w_FA = 0.1373)
                      </span>
                      <span className="font-bold text-white">{domainScores.family.toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <HeartPulse className="h-3.5 w-3.5 text-rose-400" /> Health (w_HE = 0.0794)
                      </span>
                      <span className="font-bold text-white">{domainScores.health.toFixed(1)} / 100</span>
                    </div>
                  </div>

                  {riskData?.calculation_summary && (
                    <div className="mt-3 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
                      {riskData.calculation_summary}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center">
                  <DomainRadarChart scores={domainScores} studentName={student?.first_name} />
                  <p className="text-[11px] text-slate-500 mt-1 text-center">
                    Multi-Factor Decision Pentagon: Outer polygon edges indicate elevated failure risk.
                  </p>
                </div>
              </div>

              {/* AHP Alternative Ranking & Recommended Interventions */}
              {riskBreakdown?.primary_recommendation && (
                <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-5 rounded-2xl border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        AHP Targeted Decision Recommendation (Dominant: {riskBreakdown.dominant_domain.replace("_", " ").toUpperCase()})
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Alternative Ranking #{1}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-sm">
                        {riskBreakdown.primary_recommendation.title}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold text-[10px]">
                        Primary Action
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{riskBreakdown.primary_recommendation.description}</p>
                    {riskBreakdown.primary_recommendation.action_items && (
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pt-1">
                        {riskBreakdown.primary_recommendation.action_items.map((act: string, aIdx: number) => (
                          <li key={aIdx}>{act}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {riskBreakdown.secondary_recommendations && riskBreakdown.secondary_recommendations.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400">Secondary Targeted Protocols:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {riskBreakdown.secondary_recommendations.map((sec: any, idx: number) => (
                          <div key={idx} className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/80 text-[11px]">
                            <span className="font-semibold text-slate-200 block">{sec.title}</span>
                            <span className="text-slate-400 text-[10px]">{sec.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SASS Academic History */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  SASS Academic Metrics History
                </h4>
                {academicRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No SASS records ingested yet for this student.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-2">Period</th>
                          <th className="pb-2">GPA / Grade</th>
                          <th className="pb-2">Failed Subjects</th>
                          <th className="pb-2">Incompletes</th>
                          <th className="pb-2">Attendance</th>
                          <th className="pb-2">Absences</th>
                          <th className="pb-2 text-right">Normalized S_AC Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {academicRecords.map((r) => (
                          <tr key={r.id} className="text-slate-300">
                            <td className="py-2.5 font-medium text-white">
                              SY {r.school_year} ({r.quarter || r.semester})
                            </td>
                            <td className="py-2.5">
                              <span className={`font-bold ${r.gpa < 75 ? "text-rose-400" : r.gpa < 80 ? "text-amber-400" : "text-emerald-400"}`}>
                                {r.gpa.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-2.5">{r.failed_subjects_count}</td>
                            <td className="py-2.5">{r.incomplete_subjects_count}</td>
                            <td className="py-2.5">{r.attendance_rate}%</td>
                            <td className="py-2.5">{r.absences_count} days</td>
                            <td className="py-2.5 text-right font-semibold text-indigo-400">
                              {r.normalized_academic_risk.toFixed(1)} / 100
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Confidential Counselor Notes (RA 10173 Protected) */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Counselor Psychiatric & Wellness Notes
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-full">
                      RA 10173 SPI Protected
                    </span>
                  </div>
                </div>

                {!isCounselor ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
                    <span>
                      Confidential clinical observations are restricted to authorized Guidance Counselors in compliance with the Philippine Data Privacy Act (RA 10173).
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Add Note Form */}
                    <form onSubmit={handleAddCounselorNote} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h5 className="text-xs font-semibold text-white">Record New Guidance Intake Session</h5>
                      <div>
                        <textarea
                          rows={2}
                          value={newNote.observation_summary}
                          onChange={(e) => setNewNote({ ...newNote, observation_summary: e.target.value })}
                          placeholder="Counselor observation & clinical findings..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newNote.mental_health_indicators}
                          onChange={(e) => setNewNote({ ...newNote, mental_health_indicators: e.target.value })}
                          placeholder="Indicators (e.g., severe test anxiety, panic attacks)"
                          className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={newNote.recommended_action}
                          onChange={(e) => setNewNote({ ...newNote, recommended_action: e.target.value })}
                          placeholder="Recommended action / follow-up plan"
                          className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newNote.observation_summary.trim() || isSavingNote}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
                        >
                          {isSavingNote ? "Saving SPI Note..." : "Save Confidential Note"}
                        </button>
                      </div>
                    </form>

                    {/* Past Notes List */}
                    <div className="space-y-2.5">
                      {counselorNotes.map((n) => (
                        <div key={n.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span className="font-semibold text-slate-200">Recorded by: {n.counselor_name}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed">{n.observation_summary}</p>
                          {n.mental_health_indicators && (
                            <p className="text-amber-400/90 text-[11px]">
                              <strong>Indicators:</strong> {n.mental_health_indicators}
                            </p>
                          )}
                          {n.recommended_action && (
                            <p className="text-indigo-400 text-[11px]">
                              <strong>Action:</strong> {n.recommended_action}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
