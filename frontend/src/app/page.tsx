"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { CounselorDashboard } from "@/components/CounselorDashboard";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import { ChatbotModal } from "@/components/ChatbotModal";
import { SensitivitySimulator } from "@/components/SensitivitySimulator";
import { RefreshCw, ShieldCheck } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <RefreshCw className="h-9 w-9 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold tracking-wide">Initializing SAPC IntellySys Security Layer...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Top Navbar */}
      <Navbar
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === "guidance_counselor" && <CounselorDashboard />}
        {user?.role === "teacher" && <TeacherDashboard />}
        {user?.role === "admin" && <AdminDashboard />}
        {(user?.role === "student" || user?.role === "parent") && (
          <StudentDashboard onOpenChat={() => setIsChatOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 San Antonio de Padua College (SAPC) — IntellySys Decision Support System</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Compliant with Republic Act No. 10173 (Philippine Data Privacy Act)</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <SensitivitySimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}
