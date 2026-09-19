"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Smile, 
  Flame, 
  Send, 
  CheckCircle2, 
  Wind, 
  Clock, 
  BatteryCharging,
  ShieldCheck
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface DailyMoodCheckinProps {
  studentId?: number | null;
  onCheckinSuccess?: () => void;
}

const MOOD_OPTIONS = [
  { score: 1, emoji: "😫", label: "Overwhelmed", color: "hover:bg-rose-100 border-rose-300 text-rose-800" },
  { score: 2, emoji: "😟", label: "Stressed", color: "hover:bg-amber-100 border-amber-300 text-amber-800" },
  { score: 3, emoji: "😐", label: "Okay / Neutral", color: "hover:bg-slate-100 border-slate-300 text-slate-800" },
  { score: 4, emoji: "🙂", label: "Good", color: "hover:bg-emerald-100 border-emerald-300 text-emerald-800" },
  { score: 5, emoji: "✨", label: "Energized", color: "hover:bg-amber-100 border-amber-400 text-amber-900" }
];

const STRESSOR_TAGS = [
  "Academics", "Exams / Deadlines", "Family", "Finances", "Physical Health", "Sleep", "None / Peaceful"
];

export const DailyMoodCheckin: React.FC<DailyMoodCheckinProps> = ({
  studentId,
  onCheckinSuccess
}) => {
  const [selectedMood, setSelectedMood] = useState<number>(4);
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [primaryStressor, setPrimaryStressor] = useState<string>("None / Peaceful");
  const [reflectionText, setReflectionText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedToday, setIsSubmittedToday] = useState<boolean>(false);
  
  // History and streak
  const [history, setHistory] = useState<any | null>(null);
  
  // Quick Breathing Tool
  const [showBreathing, setShowBreathing] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");

  const loadHistory = useCallback(async () => {
    try {
      const url = studentId ? `/assessments/mood-history?student_id=${studentId}` : "/assessments/mood-history";
      const data = await fetchWithAuth(url);
      setHistory(data);
      if (data?.recent_checkins && data.recent_checkins.length > 0) {
        // Check if latest was today
        const latest = new Date(data.recent_checkins[0].created_at);
        const today = new Date();
        if (latest.toDateString() === today.toDateString()) {
          setIsSubmittedToday(true);
        }
      }
    } catch (err) {
      console.error("Failed to load mood history:", err);
    }
  }, [studentId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Breathing timer loop
  useEffect(() => {
    if (!showBreathing) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === "Inhale") return "Hold";
        if (prev === "Hold") return "Exhale";
        return "Inhale";
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [showBreathing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedObj = MOOD_OPTIONS.find((m) => m.score === selectedMood);
      await fetchWithAuth("/assessments/mood-checkin", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId || undefined,
          mood_score: selectedMood,
          mood_emoji: selectedObj?.emoji || "🙂",
          energy_level: energyLevel,
          primary_stressor: primaryStressor,
          reflection_note: reflectionText
        })
      });
      setIsSubmittedToday(true);
      await loadHistory();
      if (onCheckinSuccess) onCheckinSuccess();
    } catch (err) {
      console.error("Check-in submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-sans">
      {/* Top Banner with Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-400/20 text-[#8B0014] border border-amber-400/40 shadow-xs">
            <Smile className="h-6 w-6 text-[#8B0014]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Daily Student Wellness & Mood Pulse
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                S_MH Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              5-second emotional check-in protecting mental health and pastoral wellness
            </p>
          </div>
        </div>

        {/* Streak & Reset Buttons */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-400/40 text-xs font-black text-amber-900 flex items-center gap-1.5 shadow-xs">
            <Flame className="h-4 w-4 text-amber-600 fill-amber-500" />
            <span>{history?.streak_days || 1}-Day Streak!</span>
          </div>
          <button
            onClick={() => setShowBreathing(!showBreathing)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-xs"
          >
            <Wind className="h-4 w-4 text-[#8B0014]" />
            {showBreathing ? "Close Reset" : "1-Min Reset"}
          </button>
        </div>
      </div>

      {/* Expandable 60-Second Box Breathing Widget */}
      {showBreathing && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#7B0012] to-[#4A000A] text-white text-center space-y-4 shadow-md animate-in fade-in">
          <div className="max-w-md mx-auto space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
              Box Breathing & Mindfulness Reset
            </span>
            <h4 className="text-xl font-bold">Center your mind before classes or study</h4>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
              breathPhase === "Inhale"
                ? "scale-110 border-amber-300 bg-amber-400/20"
                : breathPhase === "Hold"
                ? "scale-105 border-emerald-300 bg-emerald-400/20"
                : "scale-90 border-rose-300 bg-rose-400/20"
            }`}>
              <div className="text-center">
                <p className="text-lg font-black tracking-tight">{breathPhase}</p>
                <span className="text-[10px] text-slate-200 uppercase tracking-widest">4 Seconds</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-rose-100 max-w-sm mx-auto">
            Slow, rhythmic breathing signals safety to your nervous system and alleviates exam anxiety.
          </p>
        </div>
      )}

      {/* Main Check-In Form */}
      {isSubmittedToday ? (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h4 className="text-base font-bold text-emerald-950">You&apos;re checked in for today!</h4>
            <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto leading-relaxed">
              Thank you for sharing your daily pulse. Your guidance support team and personal wellness meter have been synchronized.
            </p>
          </div>
          <button
            onClick={() => setIsSubmittedToday(false)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
          >
            Update Today&apos;s Response
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Mood Emoji Face */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. How are you feeling overall right now?
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.score}
                  type="button"
                  onClick={() => setSelectedMood(m.score)}
                  className={`p-3 sm:p-4 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedMood === m.score
                      ? "bg-amber-50/80 border-[#8B0014] ring-2 ring-[#8B0014]/20 shadow-sm"
                      : `bg-white border-slate-200 ${m.color}`
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{m.emoji}</span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Energy Meter & Stressor Chips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {/* Energy Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <BatteryCharging className="h-4 w-4 text-emerald-600" />
                  Energy Level:
                </span>
                <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {energyLevel} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8B0014]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>Drained</span>
                <span>Moderate</span>
                <span>High Energy</span>
              </div>
            </div>

            {/* Stressor Tag Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Primary Stress Factor:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STRESSOR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setPrimaryStressor(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      primaryStressor === tag
                        ? "bg-[#8B0014] text-white border-[#8B0014] font-bold shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Brief Reflection / Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              One-sentence reflection or thought (Optional & Confidential):
            </label>
            <input
              type="text"
              placeholder="e.g., A bit nervous for the Physics exam, but feeling prepared."
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]/20 focus:border-[#8B0014] bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Protected under SAPC pastoral care & RA 10173
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Syncing..." : "Log Daily Pulse"}
            </button>
          </div>
        </form>
      )}

      {/* Historical Trend Sparkline Bar */}
      {history?.recent_checkins && history.recent_checkins.length > 0 && (
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Recent Emotional Trend ({history.recent_checkins.length} check-ins)
            </span>
            <span>Avg Mood: <strong className="text-slate-900">{history.average_mood}/5</strong></span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {history.recent_checkins.slice(0, 7).reverse().map((c: any, idx: number) => (
              <div
                key={idx}
                className="flex-1 min-w-[50px] p-2 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1"
                title={`${c.primary_stressor || "None"} • ${new Date(c.created_at).toLocaleDateString()}`}
              >
                <span className="text-lg block">{c.mood_emoji}</span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {new Date(c.created_at).toLocaleDateString([], { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
