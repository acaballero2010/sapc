"use client";

import React from "react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
  const { isAuthorized, isChecking } = useRoleGuard("admin");

  if (isChecking) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-300">
        <RefreshCw className="h-10 w-10 animate-spin text-amber-400" />
        <p className="text-base font-bold text-white">Verifying access...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <AdminDashboard />;
}
