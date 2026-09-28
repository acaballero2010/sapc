"use client";

import React, { useState } from "react";
import { StudentDashboard } from "@/components/StudentDashboard";
import { ChatbotModal } from "@/components/ChatbotModal";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { RefreshCw } from "lucide-react";

export default function StudentDashboardPage() {
  const { isAuthorized, isChecking } = useRoleGuard("student");
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (isChecking) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-300">
        <RefreshCw className="h-10 w-10 animate-spin text-amber-400" />
        <p className="text-base font-bold text-white">Verifying access...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <>
      <StudentDashboard onOpenChat={() => setIsChatOpen(true)} />
      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
