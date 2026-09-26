"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { getActiveStudentDataset, saveStudentDataset } from "@/lib/dataset-store";

export function CloudSyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>("Just now");
  const { success, error } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      // Simulate/trigger cloud sync with local dataset store
      const dataset = getActiveStudentDataset();
      saveStudentDataset(dataset, true);

      // Brief delay for user visual confirmation
      await new Promise((r) => setTimeout(r, 600));

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSynced(timeStr);
      success("Sync Complete", `Successfully synchronized ${dataset.length} student records.`);
    } catch (err: any) {
      error("Sync Failed", err.message || "Failed to communicate with cloud database.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 backdrop-blur-sm transition-all shadow-sm">
      {isOnline ? (
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Cloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cloud Active</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
          <CloudOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Offline Mode</span>
        </span>
      )}

      <span className="text-slate-300 dark:text-slate-600">|</span>

      <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
        {lastSynced}
      </span>

      <button
        onClick={handleManualSync}
        disabled={isSyncing}
        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50"
        title="Trigger manual cloud sync"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-amber-500" : ""}`} />
      </button>
    </div>
  );
}
