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
  Award,
  Calculator,
  Mic,
  MicOff,
  Wand2,
  Volume2
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";
import { AcademicRecoverySimulator } from "./AcademicRecoverySimulator";

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
  const [activeTab, setActiveTab] = useState<"synthesis" | "simulator">("synthesis");
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

  // Voice Dictation & AI Summarizer States
  const [isRecording, setIsRecording] = useState(false);
  const [dictationTranscript, setDictationTranscript] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = typeof window !== "undefined" ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. You can type or use the sample clinical monologue below!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-PH"; // Philippine English / Taglish

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + " ";
        }
        setDictationTranscript(currentText.trim());
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsRecording(false);
    }
  };

  const handleAiStructure = async (textToProcess?: string) => {
    const raw = textToProcess || dictationTranscript;
    if (!raw.trim()) return;
    setIsSummarizing(true);
    try {
      const result = await fetchWithAuth("/assessments/summarize-session", {
        method: "POST",
        body: JSON.stringify({ raw_transcript: raw })
      });
      setNewNote({
        observation_summary: result.observation_summary,
        mental_health_indicators: result.mental_health_indicators,
        recommended_action: result.recommended_action
      });
    } catch (err) {
      console.error("Failed to summarize session:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400/80 flex items-center justify-center text-white font-black text-xl shadow-xs">
              {student ? student.first_name[0] : "S"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {student ? `${student.first_name} ${student.last_name}` : "Student Profile"}
                </h2>
                {riskData && (
                  <RiskBadge score={riskData.composite_risk_score} tier={riskData.risk_tier} size="md" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                LRN: <span className="text-slate-900 font-mono font-semibold">{student?.lrn}</span> • Section:{" "}
                <span className="text-slate-900 font-medium">{student?.section_name}</span> • Adviser:{" "}
                <span className="text-slate-900 font-medium">{student?.adviser_name || "Unassigned"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onCreateIntervention && isCounselor && (
              <button
                onClick={() => onCreateIntervention(student)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#8B0014] hover:bg-[#6D0010] text-white flex items-center gap-2 transition shadow-xs"
              >
                <PlusCircle className="h-4 w-4 text-white" />
                <span>Create Care Plan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 sm:px-8 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("synthesis")}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === "synthesis"
                ? "bg-white text-[#8B0014] border-t border-x border-slate-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AHP Multi-Domain Synthesis & Notes
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === "simulator"
                ? "bg-white text-[#8B0014] border-t border-x border-slate-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calculator className="h-4 w-4 text-[#8B0014]" />
            "What-If" Academic Recovery Simulator
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin text-[#8B0014]" />
              <p className="text-base font-semibold">Synthesizing multi-criteria AHP profile...</p>
            </div>
          ) : activeTab === "simulator" ? (
            <AcademicRecoverySimulator
              studentId={student?.id}
              studentName={`${student?.first_name} ${student?.last_name}`}
              initialAcademicScore={domainScores.academic}
              initialCompositeScore={riskData?.composite_risk_score}
              initialRiskTier={riskData?.risk_tier}
            />
          ) : (
            <>
              {/* AHP Decision Engine Synthesis Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-bold text-[#8B0014] uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AHP Criteria Weights Breakdown
                    </h4>
                    {riskBreakdown && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" /> CR: {riskBreakdown.consistency_ratio} (Consistent)
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <BookOpen className="h-4 w-4 text-[#8B0014]" /> Academic (w_AC = 0.4017)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{domainScores.academic.toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <Brain className="h-4 w-4 text-rose-600" /> Mental Health (w_MH = 0.2442)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{domainScores.mental_health.toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <DollarSign className="h-4 w-4 text-amber-600" /> Financial (w_FI = 0.1373)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{domainScores.financial.toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <Users className="h-4 w-4 text-amber-600" /> Family (w_FA = 0.1373)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{domainScores.family.toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <HeartPulse className="h-4 w-4 text-rose-600" /> Health (w_HE = 0.0794)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{domainScores.health.toFixed(1)} / 100</span>
                    </div>
                  </div>

                  {riskData?.calculation_summary && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                      {riskData.calculation_summary}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <DomainRadarChart scores={domainScores} studentName={student?.first_name} />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Multi-Factor Decision Pentagon: Outer polygon edges indicate elevated failure risk.
                  </p>
                </div>
              </div>

              {/* AHP Alternative Ranking & Recommended Interventions */}
              {riskBreakdown?.primary_recommendation && (
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Award className="h-5 w-5 text-[#8B0014]" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        AHP Targeted Decision Recommendation (Dominant: {riskBreakdown.dominant_domain.replace("_", " ").toUpperCase()})
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8B0014] text-white">
                      Alternative Ranking #{1}
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-rose-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-base">
                        {riskBreakdown.primary_recommendation.title}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-[#8B0014] border border-rose-200 font-bold text-xs">
                        Primary Action
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{riskBreakdown.primary_recommendation.description}</p>
                    {riskBreakdown.primary_recommendation.action_items && (
                      <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 pt-2">
                        {riskBreakdown.primary_recommendation.action_items.map((act: string, aIdx: number) => (
                          <li key={aIdx}>{act}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {riskBreakdown.secondary_recommendations && riskBreakdown.secondary_recommendations.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-800">Secondary Targeted Protocols:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {riskBreakdown.secondary_recommendations.map((sec: any, idx: number) => (
                          <div key={idx} className="bg-white p-3.5 rounded-xl border border-rose-100 text-xs sm:text-sm shadow-xs">
                            <span className="font-bold text-slate-900 block">{sec.title}</span>
                            <span className="text-slate-600 text-xs mt-0.5 block leading-relaxed">{sec.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SASS Academic History */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <h4 className="text-sm font-bold text-[#8B0014] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#8B0014]" />
                  SASS Academic Metrics History
                </h4>
                {academicRecords.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No SASS records ingested yet for this student.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                          <th className="py-3.5 px-4">Period</th>
                          <th className="py-3.5 px-4">GPA / Grade</th>
                          <th className="py-3.5 px-4">Failed Subjects</th>
                          <th className="py-3.5 px-4">Incompletes</th>
                          <th className="py-3.5 px-4">Attendance</th>
                          <th className="py-3.5 px-4">Absences</th>
                          <th className="py-3.5 px-4 text-right">Normalized S_AC Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {academicRecords.map((r) => (
                          <tr key={r.id} className="text-slate-800 hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              SY {r.school_year} ({r.quarter || r.semester})
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`font-extrabold text-base ${r.gpa < 75 ? "text-rose-600" : r.gpa < 80 ? "text-amber-700" : "text-emerald-700"}`}>
                                {r.gpa.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">{r.failed_subjects_count}</td>
                            <td className="py-3.5 px-4">{r.incomplete_subjects_count}</td>
                            <td className="py-3.5 px-4">{r.attendance_rate}%</td>
                            <td className="py-3.5 px-4">{r.absences_count} days</td>
                            <td className="py-3.5 px-4 text-right font-black text-[#8B0014] text-base">
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
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="h-5 w-5 text-[#8B0014]" />
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Counselor Guidance & Wellness Notes
                    </h4>
                    <span className="px-3 py-1 text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded-full">
                      RA 10173 SPI Protected
                    </span>
                  </div>
                </div>

                {!isCounselor ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 flex items-center gap-3">
                    <ShieldAlert className="h-6 w-6 text-[#8B0014] shrink-0" />
                    <span>
                      Confidential clinical observations are restricted to authorized Guidance Counselors in compliance with the Philippine Data Privacy Act (RA 10173).
                    </span>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Add Note Form with Hands-free Voice Dictation */}
                    <form onSubmit={handleAddCounselorNote} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">Record New Guidance Intake Session</h5>
                          <p className="text-xs text-slate-500">Dictate hands-free or use AI clinical auto-structuring</p>
                        </div>

                        {/* Dictation Action Bar */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={toggleRecording}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                              isRecording
                                ? "bg-rose-600 text-white animate-pulse"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-[#8B0014]" />}
                            {isRecording ? "Listening... (Click to Stop)" : "Voice Dictate"}
                          </button>

                          {dictationTranscript && (
                            <button
                              type="button"
                              onClick={() => handleAiStructure()}
                              disabled={isSummarizing}
                              className="px-3.5 py-1.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                            >
                              <Wand2 className="h-3.5 w-3.5 text-amber-300" />
                              {isSummarizing ? "Structuring..." : "AI Auto-Structure"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Live Voice Transcript Banner if active */}
                      {(isRecording || dictationTranscript) && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#8B0014]">
                            <span className="flex items-center gap-1.5">
                              <Volume2 className="h-4 w-4" />
                              Live Speech Dictation Transcript:
                            </span>
                            <button
                              type="button"
                              onClick={() => setDictationTranscript("")}
                              className="text-slate-500 hover:text-slate-800 text-[11px]"
                            >
                              Clear
                            </button>
                          </div>
                          <p className="text-xs font-mono text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-amber-200">
                            {dictationTranscript || "Listening for counselor speech... (English, Tagalog, or Taglish)"}
                          </p>
                        </div>
                      )}

                      {/* Quick Sample Monologue Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="font-bold text-slate-500">Quick Samples:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const sample = "Student arrived feeling overwhelmed and crying regarding failing Calculus and fear of parental disappointment. Insomnia reported over the past week. Recommended 1-on-1 counseling, peer tutoring referral, and box breathing exercises.";
                            setDictationTranscript(sample);
                            handleAiStructure(sample);
                          }}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                        >
                          Exam Anxiety Sample
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const sample = "Student reported difficulty concentrating due to financial stress and parents arguing at home over delayed tuition balance. Recommended case conference with parents and referral to student affairs for scholarship aid.";
                            setDictationTranscript(sample);
                            handleAiStructure(sample);
                          }}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                        >
                          Family & Financial Sample
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Observation Summary:</label>
                        <textarea
                          rows={2}
                          value={newNote.observation_summary}
                          onChange={(e) => setNewNote({ ...newNote, observation_summary: e.target.value })}
                          placeholder="Counselor observation & clinical findings..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8B0014] transition"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <input
                          type="text"
                          value={newNote.mental_health_indicators}
                          onChange={(e) => setNewNote({ ...newNote, mental_health_indicators: e.target.value })}
                          placeholder="Indicators (e.g., severe test anxiety, panic attacks)"
                          className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8B0014] transition"
                        />
                        <input
                          type="text"
                          value={newNote.recommended_action}
                          onChange={(e) => setNewNote({ ...newNote, recommended_action: e.target.value })}
                          placeholder="Recommended action / follow-up plan"
                          className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8B0014] transition"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newNote.observation_summary.trim() || isSavingNote}
                          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8B0014] hover:bg-[#6D0010] text-white transition disabled:opacity-50 shadow-xs"
                        >
                          {isSavingNote ? "Saving SPI Note..." : "Save Confidential Note"}
                        </button>
                      </div>
                    </form>

                    {/* Past Notes List */}
                    <div className="space-y-3">
                      {counselorNotes.map((n) => (
                        <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-2">
                          <div className="flex items-center justify-between text-slate-500 text-xs">
                            <span className="font-bold text-slate-900">{n.counselor_name}</span>
                            <span className="flex items-center gap-1.5 font-medium" suppressHydrationWarning>
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed">{n.observation_summary}</p>
                          {n.mental_health_indicators && (
                            <p className="text-rose-700 text-xs font-medium">
                              <strong>Indicators:</strong> {n.mental_health_indicators}
                            </p>
                          )}
                          {n.recommended_action && (
                            <p className="text-slate-700 text-xs font-medium">
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
