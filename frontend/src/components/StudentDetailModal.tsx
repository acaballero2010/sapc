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
  Sliders, 
  ShieldCheck, 
  Award, 
  Calculator, 
  Mic, 
  MicOff, 
  Wand2, 
  Volume2,
  CheckCircle2,
  CheckSquare,
  Square,
  Target,
  UserCheck,
  Sparkles,
  Smile,
  Flame,
  BatteryCharging
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RiskBadge } from "./RiskBadge";
import { DomainRadarChart } from "./DomainRadarChart";
import { AcademicRecoverySimulator } from "./AcademicRecoverySimulator";
import { SAPC_500_STUDENTS } from "@/data/students500";
import { analyzeMoodTelemetry } from "@/lib/mood-telemetry";

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
  const [activeTab, setActiveTab] = useState<"synthesis" | "wellness" | "simulator">("synthesis");
  const [student, setStudent] = useState<any | null>(null);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [riskBreakdown, setRiskBreakdown] = useState<any | null>(null);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [_assessments, setAssessments] = useState<any[]>([]);
  const [counselorNotes, setCounselorNotes] = useState<any[]>([]);
  const [studentCarePlans, setStudentCarePlans] = useState<any[]>([]);
  const [moodHistory, setMoodHistory] = useState<any | null>(null);
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
        const [sRes, rRes, rbRes, aRes, assRes, intRes, moodRes] = await Promise.all([
          fetchWithAuth(`/students/${studentId}`).catch(() => null),
          fetchWithAuth(`/risk/student/${studentId}`).catch(() => null),
          fetchWithAuth(`/analytics/student/${studentId}/risk-breakdown`).catch(() => null),
          fetchWithAuth(`/academic/student/${studentId}`).catch(() => null),
          fetchWithAuth(`/assessments/student/${studentId}`).catch(() => null),
          fetchWithAuth(`/risk/interventions?student_id=${studentId}`).catch(() => null),
          fetchWithAuth(`/assessments/mood-history?student_id=${studentId}`).catch(() => null)
        ]);

        if (moodRes) {
          setMoodHistory(moodRes);
        }

        // Load local interventions for this student
        let matchedPlans: any[] = intRes && Array.isArray(intRes) ? intRes : [];
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("sapc_interventions");
          if (stored) {
            try {
              const allLocal = JSON.parse(stored);
              const studentLocal = allLocal.filter((p: any) => p.student_id === studentId);
              const existingIds = new Set(matchedPlans.map((p: any) => p.id));
              matchedPlans = [...studentLocal, ...matchedPlans.filter((p: any) => !existingIds.has(p.id))];
            } catch {}
          }
        }
        setStudentCarePlans(matchedPlans);

        if (sRes) {
          setStudent(sRes);
          if (rRes) setRiskData(rRes);
          if (rbRes) setRiskBreakdown(rbRes);
          if (aRes) setAcademicRecords(aRes);
          if (assRes) setAssessments(assRes);

          if (isCounselor) {
            try {
              const notesRes = await fetchWithAuth(`/assessments/counselor-notes/student/${studentId}`).catch(() => null);
              if (notesRes) setCounselorNotes(notesRes);
            } catch {
              // Ignore offline notes
            }
          }
          return;
        }

        // If backend is offline, use comprehensive mock data
        throw new Error("Backend offline; using fallback profile");
      } catch (err) {
        console.warn("Using fallback mock data for student modal:", err);
        
        // Find student in 500-student dataset
        const found = SAPC_500_STUDENTS.find(s => s.id === studentId) || SAPC_500_STUDENTS[0];
        
        // Check if there are local plans for this student
        let localPlans: any[] = [];
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("sapc_interventions");
          if (stored) {
            try {
              const allLocal = JSON.parse(stored);
              localPlans = allLocal.filter((p: any) => p.student_id === studentId || p.student_name?.includes(found.first_name));
            } catch {}
          }
        }
        setStudentCarePlans(localPlans);

        const mockStudent = {
          id: found.id,
          first_name: found.first_name,
          last_name: found.last_name,
          lrn: found.lrn,
          section_name: found.section_name,
          adviser_name: found.adviser_name,
          email: found.email
        };

        const mockRisk = {
          composite_risk_score: found.latest_risk_score,
          risk_tier: found.latest_risk_tier,
          academic_score: found.domain_scores.academic,
          mental_health_score: found.domain_scores.mental_health,
          financial_score: found.domain_scores.financial,
          family_score: found.domain_scores.family,
          health_score: found.domain_scores.health,
          calculation_summary: `AHP Decision Engine synthesized ${found.latest_risk_tier.toUpperCase()} Composite Risk (${found.latest_risk_score}/100). Primary factor: ${found.primary_risk_driver}.`
        };

        const mockBreakdown = {
          dominant_domain: found.primary_risk_driver ? found.primary_risk_driver.toLowerCase().replace(/[^a-z]/g, "_") : "academic",
          consistency_ratio: "0.042",
          weights: {
            academic: 0.30,
            family: 0.20,
            health: 0.20,
            mental_health: 0.15,
            financial: 0.15
          },
          primary_recommendation: {
            title: found.latest_risk_tier === "high" 
              ? "Urgent Clinical Guidance Intake & Remediation" 
              : found.latest_risk_tier === "medium"
              ? "Active Academic Remediation & Adviser Check-in"
              : "Standard Guidance Progress & Honors Tracking",
            description: found.latest_risk_tier === "high"
              ? "Schedule urgent clinical intake to address multi-domain stress and formulate a structured tutoring & guidance care plan."
              : "Monitor quarterly attendance and coordinate with class adviser for targeted modular support.",
            action_items: [
              "Conduct confidential clinical intake with registered guidance counselor",
              "Notify subject teachers regarding academic support plan",
              "Coordinate with parent/guardian for supportive home study environment"
            ]
          },
          secondary_recommendations: [
            {
              title: "Peer Mentorship Alignment",
              description: "Pair with senior honor student for bi-weekly academic problem-solving sessions."
            },
            {
              title: "Guardian Engagement Protocol",
              description: "Provide progress report update to guardian via SMS/email notification."
            }
          ]
        };

        const mockAcademic = [
          {
            id: 1,
            school_year: "2025-2026",
            semester: "Quarter 2 (Current)",
            gpa: found.sass_metrics.gpa,
            failed_subjects_count: found.sass_metrics.failing_subjects_count,
            incomplete_subjects_count: found.sass_metrics.incomplete_requirements_count,
            attendance_rate: found.sass_metrics.attendance_rate_pct ?? Math.max(70, 100 - found.sass_metrics.days_absent * 2.5),
            absences_count: found.sass_metrics.days_absent,
            normalized_academic_risk: found.domain_scores.academic,
            extracurricular_club: found.sass_metrics.extracurricular_club,
            club_participation_level: found.sass_metrics.club_participation_level,
            hobbies_interests: found.sass_metrics.hobbies_interests
          },
          {
            id: 2,
            school_year: "2025-2026",
            semester: "Quarter 1",
            gpa: Math.min(100, parseFloat((found.sass_metrics.gpa + 1.8).toFixed(1))),
            failed_subjects_count: Math.max(0, found.sass_metrics.failing_subjects_count - 1),
            incomplete_subjects_count: 0,
            attendance_rate: Math.min(100, Math.max(75, 100 - Math.max(0, found.sass_metrics.days_absent - 1) * 2.5)),
            absences_count: Math.max(0, found.sass_metrics.days_absent - 1),
            normalized_academic_risk: Math.max(5, parseFloat((found.domain_scores.academic - 3.2).toFixed(1))),
            extracurricular_club: found.sass_metrics.extracurricular_club,
            club_participation_level: found.sass_metrics.club_participation_level,
            hobbies_interests: found.sass_metrics.hobbies_interests
          }
        ];

        const mockMoodCheckins = [
          {
            id: 101,
            mood_score: 4,
            mood_emoji: "🙂",
            energy_level: 4,
            primary_stressor: "None / Peaceful",
            reflection_note: "Feeling good after completing my STEM problem set early.",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
          },
          {
            id: 102,
            mood_score: 3,
            mood_emoji: "😐",
            energy_level: 3,
            primary_stressor: "Exams / Deadlines",
            reflection_note: "Pre-calculus quiz was tough, but group review helped clarify concepts.",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
          },
          {
            id: 103,
            mood_score: 4,
            mood_emoji: "🙂",
            energy_level: 4,
            primary_stressor: "Academics",
            reflection_note: "Had a positive check-in with class adviser Prof. Bautista.",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString()
          },
          {
            id: 104,
            mood_score: 2,
            mood_emoji: "😟",
            energy_level: 2,
            primary_stressor: "Sleep",
            reflection_note: "Stayed up late studying; feeling a bit tired during morning classes.",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 78).toISOString()
          },
          {
            id: 105,
            mood_score: 5,
            mood_emoji: "✨",
            energy_level: 5,
            primary_stressor: "None / Peaceful",
            reflection_note: "Energized after weekend rest and science lab project completion!",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 102).toISOString()
          }
        ];

        setMoodHistory({
          total_checkins: mockMoodCheckins.length,
          streak_days: 5,
          average_mood: 3.6,
          average_energy: 3.6,
          recent_checkins: mockMoodCheckins,
          mental_health_risk_impact: found.domain_scores.mental_health
        });

        setStudent(mockStudent);
        setRiskData(mockRisk);
        setRiskBreakdown(mockBreakdown);
        setAcademicRecords(mockAcademic);
        setAssessments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [studentId, isOpen, isCounselor]);

  const activeMoodList = moodHistory?.recent_checkins && moodHistory.recent_checkins.length > 0
    ? moodHistory.recent_checkins
    : [];

  const parseTasks = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return raw.split("\n").filter(l => l.trim()).map((line, idx) => ({
          id: `task-${idx}`,
          text: line.replace(/^-\s*(\[[ xX]\]\s*)?/, ""),
          assignee: "Guidance Counselor",
          priority: "medium",
          due_timeline: "Standard",
          completed: line.includes("[x]") || line.includes("[X]")
        }));
      }
    }
    return [];
  };

  const handleTogglePlanTaskInModal = async (planId: number, taskId: string) => {
    setStudentCarePlans((prev) => {
      const updated = prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const currentTasks = parseTasks(plan.action_items);
        const updatedTasks = currentTasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const serialized = JSON.stringify(updatedTasks);

        fetchWithAuth(`/risk/interventions/${planId}`, {
          method: "PATCH",
          body: JSON.stringify({ action_items: serialized })
        }).catch(() => {});

        return { ...plan, action_items: serialized };
      });

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sapc_interventions");
        if (stored) {
          try {
            const allLocal = JSON.parse(stored);
            const merged = allLocal.map((p: any) => {
              const matching = updated.find((u) => u.id === p.id);
              return matching || p;
            });
            localStorage.setItem("sapc_interventions", JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent("sapc_interventions_updated", { detail: updated[0] }));
          } catch {}
        }
      }
      return updated;
    });
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[92vh] overflow-hidden">
        {/* Header — compact single-block to minimise vertical footprint */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400/80 flex items-center justify-center text-white font-black text-lg shadow-xs">
              {student ? student.first_name[0] : "S"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                  {student ? `${student.first_name} ${student.last_name}` : "Student Profile"}
                </h2>
                {riskData && (
                  <RiskBadge score={riskData.composite_risk_score} tier={riskData.risk_tier} size="md" />
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                LRN: <span className="text-slate-900 font-mono font-semibold">{student?.lrn}</span>
                <span className="mx-1.5 text-slate-300">•</span>
                <span className="text-slate-900 font-medium">{student?.section_name}</span>
                <span className="mx-1.5 text-slate-300">•</span>
                Adviser: <span className="text-slate-900 font-medium">{student?.adviser_name || "Unassigned"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onCreateIntervention && isCounselor && (
              <button
                onClick={() => onCreateIntervention(student)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#8B0014] hover:bg-[#6D0010] text-white flex items-center gap-1.5 transition shadow-xs whitespace-nowrap"
              >
                <PlusCircle className="h-3.5 w-3.5 text-white" />
                <span className="hidden sm:inline">Create Care Plan</span>
                <span className="sm:hidden">Care Plan</span>
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

        {/* Tab Navigation — sits OUTSIDE the scrollable body so it's always visible */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 sm:px-6 gap-1 pt-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("synthesis")}
            className={`px-3 sm:px-4 py-2.5 rounded-t-2xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition shrink-0 ${
              activeTab === "synthesis"
                ? "bg-white text-[#8B0014] border-t border-x border-slate-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Brain className="h-3.5 w-3.5 text-[#8B0014]" />
            AHP Multi-Domain Synthesis
          </button>
          <button
            onClick={() => setActiveTab("wellness")}
            className={`px-3 sm:px-4 py-2.5 rounded-t-2xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition shrink-0 ${
              activeTab === "wellness"
                ? "bg-white text-[#8B0014] border-t border-x border-slate-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smile className="h-3.5 w-3.5 text-[#8B0014]" />
            Wellness & Mood Log ({activeMoodList.length})
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 sm:px-4 py-2.5 rounded-t-2xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition shrink-0 ${
              activeTab === "simulator"
                ? "bg-white text-[#8B0014] border-t border-x border-slate-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calculator className="h-3.5 w-3.5 text-[#8B0014]" />
            &quot;What-If&quot; Simulator
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
          ) : activeTab === "wellness" ? (
            <div className="space-y-6">
              {/* Wellness Metrics Overview Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Mood Score</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1">
                      {moodHistory?.average_mood || 3.8} <span className="text-sm font-normal text-slate-500">/ 5.0</span>
                    </strong>
                    <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 block">Positive Emotional Trend</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-100/60 text-amber-800 border border-amber-300/60">
                    <Smile className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Energy Level</span>
                    <strong className="text-2xl font-black text-slate-900 block mt-1">
                      {moodHistory?.average_energy || 3.6} <span className="text-sm font-normal text-slate-500">/ 5.0</span>
                    </strong>
                    <span className="text-[11px] font-semibold text-slate-600 mt-0.5 block">Steady Classroom Focus</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <BatteryCharging className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Check-in Streak</span>
                    <strong className="text-2xl font-black text-amber-900 block mt-1">
                      {moodHistory?.streak_days || 5} Days
                    </strong>
                    <span className="text-[11px] font-semibold text-amber-800 mt-0.5 block">Active Daily Pulse</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <Flame className="h-6 w-6 fill-amber-500" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">AHP Mental Health</span>
                    <strong className="text-2xl font-black text-rose-700 block mt-1">
                      {Number(domainScores.mental_health || 15.0).toFixed(1)} <span className="text-sm font-normal text-slate-500">pts</span>
                    </strong>
                    <span className="text-[11px] font-semibold text-slate-600 mt-0.5 block">Weight: 15.00% (w_MH)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                    <HeartPulse className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* 14-Day Chronological Daily Pulse Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#D97706]">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        14-Day Longitudinal Wellness & Mood Pulse History
                      </h4>
                      <p className="text-xs text-slate-500">Student emotional check-ins, energy logs, and confidential reflections</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                    ✓ Protected under RA 10173
                  </span>
                </div>

                {activeMoodList.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Emotional State</th>
                          <th className="py-3 px-4">Energy</th>
                          <th className="py-3 px-4">Primary Factor</th>
                          <th className="py-3 px-4">Student Reflection Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeMoodList.map((checkin: any) => {
                          const dateObj = new Date(checkin.created_at);
                          return (
                            <tr key={checkin.id} className="hover:bg-slate-50 transition">
                              <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-xs font-medium">
                                <div>{dateObj.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</div>
                                <span className="text-[10px] text-slate-400">{dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="flex items-center gap-2 font-bold text-slate-900">
                                  <span className="text-xl">{checkin.mood_emoji || "🙂"}</span>
                                  <span>
                                    {checkin.mood_score === 5 ? "Energized" :
                                     checkin.mood_score === 4 ? "Good" :
                                     checkin.mood_score === 3 ? "Neutral" :
                                     checkin.mood_score === 2 ? "Stressed" : "Overwhelmed"}
                                  </span>
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <span
                                        key={level}
                                        className={`h-2.5 w-2 rounded-xs ${
                                          level <= (checkin.energy_level || 3)
                                            ? "bg-emerald-500"
                                            : "bg-slate-200"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-mono text-xs text-slate-600 font-semibold">{checkin.energy_level || 3}/5</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                  {checkin.primary_stressor || "None / Peaceful"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-700 text-xs sm:text-sm">
                                {checkin.reflection_note ? (
                                  <p className="italic text-slate-800 bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                                    &ldquo;{checkin.reflection_note}&rdquo;
                                  </p>
                                ) : (
                                  <span className="text-slate-400 italic text-xs">No reflection note provided</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <Smile className="h-8 w-8 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold">No daily mood check-ins recorded yet for this student.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* AHP Decision Engine Synthesis Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-bold text-[#8B0014] uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-[#8B0014]" />
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
                        <BookOpen className="h-4 w-4 text-[#8B0014]" /> Academic (w_AC = 0.3000)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{Number(domainScores.academic || 0).toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <Users className="h-4 w-4 text-amber-600" /> Family (w_FA = 0.2000)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{Number(domainScores.family || 0).toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <HeartPulse className="h-4 w-4 text-rose-600" /> Health (w_HE = 0.2000)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{Number(domainScores.health || 0).toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <Brain className="h-4 w-4 text-rose-600" /> Mental Health (w_MH = 0.1500)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{Number(domainScores.mental_health || 0).toFixed(1)} / 100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <DollarSign className="h-4 w-4 text-amber-600" /> Financial (w_FI = 0.1500)
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{Number(domainScores.financial || 0).toFixed(1)} / 100</span>
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
                        AHP Targeted Decision Recommendation (Dominant: {riskBreakdown.dominant_domain ? riskBreakdown.dominant_domain.replace("_", " ").toUpperCase() : "ACADEMIC"})
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

              {/* Active Intervention Care Plans & Action Checklist for this student */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Target className="h-5 w-5 text-[#8B0014]" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Active Guidance Care Plans & Action Items
                      </h4>
                      <p className="text-xs text-slate-500">
                        {studentCarePlans.length > 0
                          ? `${studentCarePlans.length} active protocol(s) tracked for this student`
                          : "No active care plans created yet for this student"}
                      </p>
                    </div>
                  </div>

                  {onCreateIntervention && isCounselor && (
                    <button
                      type="button"
                      onClick={() => onCreateIntervention(student)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-amber-300" />
                      <span>+ Create Care Plan</span>
                    </button>
                  )}
                </div>

                {studentCarePlans.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                    <Sparkles className="h-6 w-6 text-amber-500 mx-auto" />
                    <p className="font-semibold text-slate-700">No care plan recorded yet for {student?.first_name}.</p>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Click &quot;+ Create Care Plan&quot; above to select a protocol template (Academic, Mental Health, Financial, Family, Clinic) and assign tasks.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentCarePlans.map((plan) => {
                      const tasks = parseTasks(plan.action_items);
                      const completedCount = tasks.filter((t) => t.completed).length;
                      const totalTasks = tasks.length;
                      const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

                      return (
                        <div key={plan.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-2xs">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-base">{plan.title}</span>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-[#8B0014] border border-rose-200">
                                  {plan.target_domain}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{plan.description}</p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                              plan.status === "resolved"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : plan.status === "escalated"
                                ? "bg-rose-100 text-rose-900 border border-rose-300"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                            }`}>
                              {plan.status?.replace("_", " ") || "In Progress"}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          {totalTasks > 0 && (
                            <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  Checklist Execution Progress:
                                </span>
                                <span className="text-[11px] text-slate-900">{completedCount} of {totalTasks} ({progressPct}%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    progressPct === 100 ? "bg-emerald-500" : progressPct > 50 ? "bg-amber-500" : "bg-[#8B0014]"
                                  }`}
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Task list with interactive toggles */}
                          {totalTasks > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
                                Assigned Action Items (Click to toggle completion):
                              </span>
                              {tasks.map((t) => (
                                <div
                                  key={t.id}
                                  onClick={() => handleTogglePlanTaskInModal(plan.id, t.id)}
                                  className={`p-2.5 rounded-xl border transition flex items-start gap-2.5 cursor-pointer shadow-2xs ${
                                    t.completed
                                      ? "bg-emerald-50/60 border-emerald-200 text-slate-400"
                                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {t.completed ? (
                                      <CheckSquare className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                      <Square className="h-4 w-4 text-slate-400 hover:text-[#8B0014]" />
                                    )}
                                  </div>
                                  <div className="space-y-0.5 min-w-0 flex-1">
                                    <p className={`text-xs font-semibold leading-tight ${t.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                                      {t.text}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-0.5">
                                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold inline-flex items-center gap-1">
                                        <UserCheck className="h-2.5 w-2.5 text-[#8B0014]" />
                                        {t.assignee}
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded font-extrabold uppercase ${
                                        t.priority === "high" ? "bg-rose-100 text-rose-800" : t.priority === "medium" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                                      }`}>
                                        {t.priority}
                                      </span>
                                      <span className="text-slate-400">• {t.due_timeline}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-[11px]">
                              <Clock className="h-3 w-3 text-slate-400" />
                              Follow-up Date: <strong className="text-slate-700">{plan.scheduled_followup ? new Date(plan.scheduled_followup).toLocaleDateString() : "Pending"}</strong>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Adaptive Mood Telemetry & Graceful Fallback Analysis */}
              {(() => {
                const telemetryResult = analyzeMoodTelemetry(
                  moodHistory?.recent_checkins || [],
                  academicRecords[0]?.absences_count || 0,
                  riskData?.mental_health_score || 20
                );

                return (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                          <Smile className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                              Adaptive Mood Telemetry &amp; Fallback Status
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              telemetryResult.frequency_tier === "high_frequency"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : telemetryResult.frequency_tier === "low_frequency"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-slate-100 text-slate-700 border border-slate-300"
                            }`}>
                              {telemetryResult.tier_label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Real-time time-decayed EMA telemetry blended with formal quarterly psychometric screeners
                          </p>
                        </div>
                      </div>

                      {telemetryResult.disengagement_anomaly_detected && (
                        <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                          <ShieldAlert className="h-4 w-4 text-[#8B0014]" />
                          <span>Disengagement Anomaly Flagged</span>
                        </div>
                      )}
                    </div>

                    {/* Telemetry Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">14-Day Check-Ins</span>
                        <strong className="text-xl font-black text-slate-900 mt-1 block">
                          {telemetryResult.checkins_last_14d} <span className="text-xs font-normal text-slate-500">entries</span>
                        </strong>
                        <span className="text-[10px] font-semibold text-slate-500">{telemetryResult.total_checkins} total recorded</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Decayed Mood Avg</span>
                        <strong className={`text-xl font-black mt-1 block ${
                          telemetryResult.time_decayed_mood_avg < 2.5 ? "text-rose-600" : telemetryResult.time_decayed_mood_avg < 3.5 ? "text-amber-700" : "text-emerald-700"
                        }`}>
                          {telemetryResult.time_decayed_mood_avg.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
                        </strong>
                        <span className="text-[10px] font-semibold text-slate-500">Exponential Decay (EMA)</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Weight Distribution</span>
                        <strong className="text-sm font-black text-slate-800 mt-1 block">
                          {Math.round(telemetryResult.baseline_screener_weight * 100)}% Screener
                        </strong>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {Math.round(telemetryResult.telemetry_weight * 100)}% Live Telemetry
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Top Stressor Tag</span>
                        <strong className="text-xs font-black text-slate-900 mt-1 block truncate">
                          {telemetryResult.primary_stressor}
                        </strong>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {telemetryResult.acute_distress_streak_days > 0 ? `${telemetryResult.acute_distress_streak_days}d distress streak` : "No acute streak"}
                        </span>
                      </div>
                    </div>

                    {/* Explanation Banner */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900">{telemetryResult.explanation}</p>
                        {telemetryResult.disengagement_reason && (
                          <p className="text-rose-700 font-bold">{telemetryResult.disengagement_reason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                              SY {r.school_year} ({r.quarter || r.semester || "Semester"})
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`font-extrabold text-base ${(r.gpa || 0) < 75 ? "text-rose-600" : (r.gpa || 0) < 80 ? "text-amber-700" : "text-emerald-700"}`}>
                                {Number(r.gpa ?? 0).toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">{r.failed_subjects_count ?? r.failing_subjects_count ?? 0}</td>
                            <td className="py-3.5 px-4 text-slate-600">{r.incomplete_subjects_count ?? r.incomplete_requirements_count ?? 0}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">{r.attendance_rate ?? 100}%</td>
                            <td className="py-3.5 px-4 text-slate-600">{r.absences_count ?? r.days_absent ?? 0} days</td>
                            <td className="py-3.5 px-4 text-right font-black text-[#8B0014] text-base">
                              {Number(r.normalized_academic_risk ?? 0).toFixed(1)} / 100
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Engagement Factors & Extracurricular Protective Buffer */}
                {academicRecords.length > 0 && academicRecords[0].extracurricular_club && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                          Engagement & Extracurricular Activities
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          academicRecords[0].club_participation_level === "High"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : academicRecords[0].club_participation_level === "Moderate"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : academicRecords[0].club_participation_level === "Low"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-200 text-slate-700 border border-slate-300"
                        }`}>
                          {academicRecords[0].club_participation_level || "None"} Participation
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        🛡️ Protective Factor against Dropout
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Club / Organization Membership</span>
                        <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                          {academicRecords[0].extracurricular_club}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Hobbies &amp; Creative Interests</span>
                        <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                          {academicRecords[0].hobbies_interests}
                        </span>
                      </div>
                    </div>
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
