"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatbotModal } from "@/components/ChatbotModal";
import { SensitivitySimulator } from "@/components/SensitivitySimulator";
import { ShieldCheck } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#8B0014] fixed top-0 left-0 right-0 z-50 shadow-xs" />

      <div className="flex flex-1 pt-1.5">
        {/* Sidebar Component */}
        <Sidebar
          onOpenChat={() => setIsChatOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        {/* Main Content Area offset by Sidebar width on lg screens */}
        <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Institutional Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs sm:text-sm text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>© 2026 San Antonio de Padua College (SAPC) — IntellySys Decision Support System</p>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Compliant with Republic Act No. 10173 (Philippine Data Privacy Act)</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

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
