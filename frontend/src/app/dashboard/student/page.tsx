"use client";

import React, { useState } from "react";
import { StudentDashboard } from "@/components/StudentDashboard";
import { ChatbotModal } from "@/components/ChatbotModal";

export default function StudentDashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <StudentDashboard onOpenChat={() => setIsChatOpen(true)} />
      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
