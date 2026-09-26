/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  LogOut,
  Settings,
  Bell,
  Bot,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  KeyRound
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme, ThemeMode } from "@/lib/theme-context";
import { useRouter } from "next/navigation";

interface UserMenuPopoverProps {
  onOpenAccount: () => void;
  onOpenChat: () => void;
  onOpenNotifications?: () => void;
  /** Unread notification count shown on the bell */
  notifCount?: number;
}

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: any }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({
  onOpenAccount,
  onOpenChat,
  onOpenNotifications,
  notifCount = 0,
}) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div ref={ref} className="relative flex items-center gap-2 shrink-0">
      {/* ── Notification Bell ── */}
      <button
        type="button"
        onClick={() => { setIsOpen(false); onOpenNotifications?.(); }}
        className="relative h-9 w-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-2xs shrink-0"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="h-4 w-4" />
        {notifCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {notifCount > 9 ? "9+" : notifCount}
          </span>
        )}
      </button>

      {/* ── Avatar Trigger ── */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={`flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-xl border transition shadow-2xs shrink-0 ${
          isOpen
            ? "bg-rose-50 dark:bg-rose-950/50 border-[#8B0014]/40 text-[#8B0014] dark:text-rose-300"
            : "bg-slate-50 dark:bg-slate-800 hover:bg-rose-50/60 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 hover:border-[#8B0014]/30"
        }`}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="h-6 w-6 rounded-lg object-cover border border-amber-400/80 shadow-xs shrink-0"
          />
        ) : (
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#8B0014] to-[#5A000D] border border-amber-400/70 flex items-center justify-center text-white text-[10px] font-extrabold shadow-xs shrink-0">
            {initials}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[130px]">
            {user?.full_name?.split(" ")[0] || "Account"}
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium capitalize truncate">
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:block transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Popover Panel ── */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ animation: "popoverIn 0.15s ease-out" }}
        >
          {/* ── Header: identity ── */}
          <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-[#8B0014]/5 to-amber-50/40 dark:from-slate-800 dark:to-slate-800 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="h-11 w-11 rounded-xl object-cover border-2 border-amber-400/80 shadow"
                />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400/70 flex items-center justify-center text-white text-lg font-black shadow shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 capitalize">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {user?.role?.replace("_", " ")} — Active Session
                </span>
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="px-3 pt-2.5 pb-1">
            <p className="px-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Quick Actions</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Profile", icon: User, action: () => { setIsOpen(false); router.push("/dashboard/profile"); } },
                {
                  label: "Notifications", icon: Bell, badge: notifCount,
                  action: () => { setIsOpen(false); onOpenNotifications?.(); }
                },
                { label: "AI Counselor", icon: Bot, action: () => { setIsOpen(false); onOpenChat(); } },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="relative flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-[#8B0014] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:border-rose-200 transition text-center cursor-pointer"
                >
                  <item.icon className="h-4.5 w-4.5" />
                  <span className="text-[10px] font-bold leading-none">{item.label}</span>
                  {"badge" in item && (item.badge as number) > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                      {(item.badge as number) > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Appearance toggle ── */}
          <div className="px-3 pt-2 pb-2 border-t border-slate-100 dark:border-slate-800">
            <p className="px-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Appearance</p>
            <div className="grid grid-cols-3 gap-1">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      active
                        ? "bg-[#8B0014] text-white border-[#8B0014] shadow"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Manage Profile link ── */}
          <div className="px-3 pb-2 border-t border-slate-100 dark:border-slate-800 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenAccount) {
                  onOpenAccount();
                } else {
                  router.push("/dashboard/profile?tab=profile");
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              Account Settings &amp; Profile
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); router.push("/dashboard/profile?tab=privacy"); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <KeyRound className="h-3.5 w-3.5 text-slate-400" />
              Privacy &amp; RA 10173 Data
            </button>
          </div>

          {/* ── Sign Out ── */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-2">
            <button
              type="button"
              onClick={() => { setIsOpen(false); logout(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes popoverIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
};
