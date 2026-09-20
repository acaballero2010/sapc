"use client";

import React, { useState } from "react";
import { 
  X, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Download, 
  ExternalLink
} from "lucide-react";
import { exportToICS, getGoogleCalendarUrl } from "@/lib/export-utils";

export interface CalendarEvent {
  id: string;
  title: string;
  category: "crisis" | "consultation" | "screening" | "academic";
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  location: string;
  attendees: string;
  notes: string;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "🚨 Crisis Follow-up: Joshua Dimaculangan",
    category: "crisis",
    startDate: "2026-09-21",
    startTime: "09:30",
    durationMinutes: 45,
    location: "Guidance Office Room 204",
    attendees: "Ms. Santos (RGC), Joshua Dimaculangan",
    notes: "Post-triage check-in on test anxiety and coping strategies."
  },
  {
    id: "evt-2",
    title: "📅 Parent Case Conference: Maria Santos",
    category: "consultation",
    startDate: "2026-09-22",
    startTime: "14:00",
    durationMinutes: 60,
    location: "Virtual (Google Meet: meet.google.com/sapc-counseling)",
    attendees: "Mrs. Remedios Santos (Parent), Mr. Fernandez (Adviser), Ms. Santos (RGC)",
    notes: "Review Quarter 1 to Quarter 2 progress delta and peer tutoring contract."
  },
  {
    id: "evt-3",
    title: "🧠 Grade 10 Universal PHQ-9 / GAD-7 Screening",
    category: "screening",
    startDate: "2026-09-24",
    startTime: "08:00",
    durationMinutes: 180,
    location: "SAPC Computer Lab 1 & 2",
    attendees: "Grade 10 St. Augustine & St. Francis",
    notes: "Universal mid-semester emotional wellness screening under RA 11036."
  },
  {
    id: "evt-4",
    title: "📚 DepEd Quarter 2 Remediation & Grade Deliberation",
    category: "academic",
    startDate: "2026-09-26",
    startTime: "13:00",
    durationMinutes: 120,
    location: "Faculty Conference Room",
    attendees: "SHS & JHS Subject Teachers",
    notes: "Review early warning flagged learners with GPA < 80.0."
  },
  {
    id: "evt-5",
    title: "📅 Urgent Consultation: Kyle Mercado Support Plan",
    category: "consultation",
    startDate: "2026-09-28",
    startTime: "10:30",
    durationMinutes: 45,
    location: "Guidance Office Room 204",
    attendees: "Mr. Mercado (Parent), Ms. Santos (RGC)",
    notes: "Financial scholarship endorsement and academic recovery roadmap."
  }
];

interface AcademicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicCalendarModal: React.FC<AcademicCalendarModalProps> = ({
  isOpen,
  onClose
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<"agenda" | "month">("agenda");

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"crisis" | "consultation" | "screening" | "academic">("consultation");
  const [newDate, setNewDate] = useState("2026-09-23");
  const [newTime, setNewTime] = useState("10:00");
  const [newDuration, setNewDuration] = useState(60);
  const [newLocation, setNewLocation] = useState("Guidance Office Room 204");
  const [newAttendees, setNewAttendees] = useState("");
  const [newNotes, setNewNotes] = useState("");

  if (!isOpen) return null;

  const filteredEvents = events.filter(e => {
    if (selectedCategory === "all") return true;
    return e.category === selectedCategory;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      startDate: newDate,
      startTime: newTime,
      durationMinutes: Number(newDuration),
      location: newLocation,
      attendees: newAttendees || "Counselor & Student",
      notes: newNotes
    };

    setEvents(prev => [created, ...prev]);
    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewNotes("");
  };

  const getCategoryBadge = (cat: CalendarEvent["category"]) => {
    switch (cat) {
      case "crisis":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">🚨 Crisis Follow-up</span>;
      case "consultation":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300">📅 Case Conference</span>;
      case "screening":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300">🧠 Screening Window</span>;
      case "academic":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">📚 DepEd Milestone</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#8B0014]/10 text-[#8B0014] dark:text-rose-400">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                SAPC Academic &amp; Guidance Calendar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled case conferences, crisis triage sessions, and DepEd academic checkpoints
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#8B0014] hover:bg-[#5A000D] text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" /> Schedule Event
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls & View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["all", "crisis", "consultation", "screening", "academic"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat === "all" ? "All Schedules" : cat === "crisis" ? "🚨 Crisis (1)" : cat === "consultation" ? "📅 Conferences (2)" : cat === "screening" ? "🧠 Screenings (1)" : "📚 Academic (1)"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("agenda")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeView === "agenda" ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200" : "text-slate-500"}`}
            >
              Agenda View
            </button>
            <button
              onClick={() => setActiveView("month")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeView === "month" ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200" : "text-slate-500"}`}
            >
              Month View
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Create Event Sub-panel */}
          {isCreateModalOpen && (
            <form onSubmit={handleCreateEvent} className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800 pb-2">
                <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-amber-600" /> Book New Session / Case Conference
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-amber-700 hover:text-amber-950 dark:text-amber-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Event Title / Case Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Parent Case Conference: Student Name"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Session Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="consultation">📅 Parent Case Conference</option>
                    <option value="crisis">🚨 Crisis Triage Follow-up</option>
                    <option value="screening">🧠 Mental Health Screening</option>
                    <option value="academic">📚 Academic Remediation Checkpoint</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Duration</label>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location / Modality</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Attendees</label>
                  <input
                    type="text"
                    placeholder="e.g. Parent Name, Adviser, Counselor"
                    value={newAttendees}
                    onChange={(e) => setNewAttendees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-xl text-xs font-bold bg-[#8B0014] hover:bg-[#5A000D] text-white shadow-xs"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          )}

          {/* Agenda List View */}
          <div className="space-y-3">
            {filteredEvents.map((evt) => {
              const googleCalUrl = getGoogleCalendarUrl({
                title: evt.title,
                description: `${evt.notes}\nAttendees: ${evt.attendees}`,
                location: evt.location,
                startDate: evt.startDate,
                startTime: evt.startTime,
                durationMinutes: evt.durationMinutes
              });

              return (
                <div
                  key={evt.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(evt.category)}
                      <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {evt.startDate} • {evt.startTime} ({evt.durationMinutes} mins)
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {evt.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#8B0014] dark:text-rose-400" />
                        {evt.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-blue-500" />
                        {evt.attendees}
                      </span>
                    </div>

                    {evt.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        &quot;{evt.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Sync Actions */}
                  <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-700 shrink-0">
                    <a
                      href={googleCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1.5"
                      title="Add to Google Calendar"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
                      Google Cal
                    </a>

                    <button
                      onClick={() => exportToICS({
                        title: evt.title,
                        description: evt.notes,
                        location: evt.location,
                        startDate: evt.startDate,
                        startTime: evt.startTime,
                        durationMinutes: evt.durationMinutes
                      })}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer"
                      title="Download .ICS Calendar File (Apple / Outlook)"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export .ICS
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
          <span>Synced with SAPC IntellySys Multi-Factor Decision Support &amp; Resend Gateway</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition cursor-pointer"
          >
            Close Calendar
          </button>
        </div>

      </div>
    </div>
  );
};
