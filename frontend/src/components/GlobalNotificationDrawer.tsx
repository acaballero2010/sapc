"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, 
  X, 
  ChevronRight,
  Trash2
} from "lucide-react";

interface NotificationItem {
  id: string;
  category: "crisis" | "academic" | "consultation" | "system";
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  actionTab?: string;
  actionRole?: string;
}

interface GlobalNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string, role?: string) => void;
}

export const GlobalNotificationDrawer: React.FC<GlobalNotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "crisis" | "academic" | "consultation" | "system">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "NOTIF-01",
      category: "crisis",
      title: "Urgent NLP Crisis Keyword Flag",
      description: "Joshua Dimaculangan expressed acute academic distress during an AI chatbot session.",
      timestamp: "12 mins ago",
      unread: true,
      actionTab: "crisis_detail",
      actionRole: "guidance_counselor"
    },
    {
      id: "NOTIF-02",
      category: "consultation",
      title: "Parent Conference Attendance Confirmed",
      description: "Mrs. Elena Dimaculangan confirmed attendance for Tuesday 2:00 PM case review.",
      timestamp: "45 mins ago",
      unread: true,
      actionTab: "sessions",
      actionRole: "guidance_counselor"
    },
    {
      id: "NOTIF-03",
      category: "academic",
      title: "Quarter 2 SASS Grades Ingested",
      description: "Mr. Roberto Santos uploaded 45 Grade 11 STEM Pre-Calculus diagnostic marks.",
      timestamp: "2 hours ago",
      unread: true,
      actionTab: "import_history",
      actionRole: "admin"
    },
    {
      id: "NOTIF-04",
      category: "system",
      title: "AHP Consistency Ratio Validated",
      description: "Master weights vector checked (CR = 0.048 <= 0.10) for 30/20/20/15/15 matrix.",
      timestamp: "Yesterday",
      unread: false,
      actionTab: "risk_config",
      actionRole: "admin"
    }
  ]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter(n => n.category === activeFilter);
  }, [notifications, activeFilter]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8B0014] text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Institutional Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread action items` : "All notifications read"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Pills & Actions */}
        <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 [scrollbar-width:none]">
            {[
              { id: "all", label: "All" },
              { id: "crisis", label: "🚨 Crisis" },
              { id: "consultation", label: "📅 Meetings" },
              { id: "academic", label: "📚 Academic" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  activeFilter === f.id ? "bg-[#8B0014] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={markAllAsRead}
            className="text-[11px] font-bold text-[#8B0014] hover:underline whitespace-nowrap shrink-0"
          >
            Mark all read
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Bell className="h-8 w-8 mx-auto text-slate-300" />
              <p className="font-bold text-xs">No notifications in this category.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.actionTab && onNavigateTab) {
                    onNavigateTab(notif.actionTab, notif.actionRole);
                    onClose();
                  }
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-1.5 shadow-2xs group ${
                  notif.unread
                    ? notif.category === "crisis"
                      ? "bg-rose-50/70 border-rose-300"
                      : "bg-amber-50/60 border-amber-300"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    notif.category === "crisis"
                      ? "bg-rose-600 text-white"
                      : notif.category === "consultation"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-800"
                  }`}>
                    {notif.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                </div>

                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{notif.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.description}</p>

                {notif.actionTab && (
                  <div className="pt-1 flex items-center justify-end text-[11px] font-bold text-[#8B0014] group-hover:underline gap-1">
                    <span>Jump to Case View</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Real-Time SAPC Event Dispatch</span>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear inbox</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
