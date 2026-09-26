"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  HeartHandshake,
  GraduationCap,
  Clock,
  Trash2,
  ExternalLink,
} from "lucide-react";



const TYPE_META: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  crisis:   { icon: AlertTriangle,  color: "text-rose-600",    bg: "bg-rose-50",    label: "Crisis" },
  referral: { icon: HeartHandshake, color: "text-amber-600",   bg: "bg-amber-50",   label: "Referral" },
  session:  { icon: GraduationCap,  color: "text-blue-600",    bg: "bg-blue-50",    label: "Session" },
  system:   { icon: CheckCircle2,   color: "text-emerald-600", bg: "bg-emerald-50", label: "System" },
  info:     { icon: Info,           color: "text-slate-500",   bg: "bg-slate-50",   label: "Info" },
  parent:   { icon: CheckCircle2,   color: "text-indigo-600",  bg: "bg-indigo-50",  label: "Parent" },
  alert:    { icon: AlertTriangle,  color: "text-rose-600",    bg: "bg-rose-50",    label: "Alert" },
  deadline: { icon: Clock,          color: "text-amber-600",   bg: "bg-amber-50",   label: "Deadline" }
};

import { 
  getActiveNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteAppNotification,
  AppNotification 
} from "@/lib/dataset-store";

const FILTER_TABS = ["All", "Unread", "Crisis", "Referral", "Session"] as const;
type FilterTab = typeof FILTER_TABS[number];

interface GlobalNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const GlobalNotificationDrawer: React.FC<GlobalNotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return typeof window !== "undefined" ? getActiveNotifications() : [];
  });
  const [filter, setFilter] = useState<FilterTab>("All");

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(getActiveNotifications());
    };
    window.addEventListener("sapc:notifications-updated", handleUpdate);
    // Initial fetch
    setNotifications(getActiveNotifications());
    return () => window.removeEventListener("sapc:notifications-updated", handleUpdate);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    return n.type === filter.toLowerCase();
  });

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(getActiveNotifications());
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(getActiveNotifications());
  };

  const handleRemove = (id: string) => {
    deleteAppNotification(id);
    setNotifications(getActiveNotifications());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ animation: "fadeBackdrop 0.2s ease-out" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer panel */}
      <div
        className="relative ml-auto h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.22s cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="h-5 w-5 text-[#8B0014] dark:text-rose-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-600 text-white text-[8px] font-black flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#8B0014] dark:hover:text-rose-400 transition px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 overflow-x-auto shrink-0">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filter === tab
                  ? "bg-[#8B0014] text-white shadow"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab}
              {tab === "Unread" && unreadCount > 0 && (
                <span className="ml-1 text-[9px]">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No notifications in this category.</p>
            </div>
          ) : (
            filtered.map((notif) => {
              const meta = TYPE_META[notif.type] || TYPE_META.system;
              const Icon = meta.icon;
              return (
                <div
                  key={notif.id}
                  className={`relative flex gap-3 px-4 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group ${
                    !notif.read ? "bg-rose-50/40 dark:bg-rose-950/20" : ""
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-rose-600" />
                  )}
                  <div className={`h-9 w-9 rounded-xl ${meta.bg} dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-bold leading-tight ${!notif.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(notif.id)}
                            title="Mark as read"
                            className="h-5 w-5 rounded-md flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(notif.id)}
                          title="Dismiss"
                          className="h-5 w-5 rounded-md flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                      {notif.body}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <Clock className="h-3 w-3" />
                        {notif.time}
                      </div>
                      {notif.href && (
                        <a
                          href={notif.href}
                          onClick={onClose}
                          className="text-[10px] font-bold text-[#8B0014] dark:text-rose-400 hover:underline flex items-center gap-0.5"
                        >
                          View <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 shrink-0">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Notifications auto-clear after 30 days · RA 10173 Data Privacy Compliant
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
