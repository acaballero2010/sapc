"use client";

import React from "react";
import { useToast } from "@/lib/toast-context";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div 
      aria-live="polite" 
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let bgStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xl";
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

        if (toast.type === "success") {
          bgStyle = "bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10 shadow-xl";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
        } else if (toast.type === "error") {
          bgStyle = "bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 shadow-rose-500/10 shadow-xl";
          icon = <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
        } else if (toast.type === "warning") {
          bgStyle = "bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 shadow-amber-500/10 shadow-xl";
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
        } else {
          bgStyle = "bg-sky-50/95 dark:bg-sky-950/90 border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-100 shadow-sky-500/10 shadow-xl";
          icon = <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in-0 shadow-lg ${bgStyle}`}
          >
            {icon}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold leading-tight tracking-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed break-words">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-60 hover:opacity-100 transition-opacity p-1 -mr-1 -mt-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
