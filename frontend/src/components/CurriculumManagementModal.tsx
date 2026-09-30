"use client";

import React from "react";
import { CurriculumManagementHub } from "./CurriculumManagementHub";

export interface CurriculumManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userName?: string;
}

export function CurriculumManagementModal({
  isOpen,
  onClose,
  userRole = "Administrator",
  userName = "Academic Coordinator"
}: CurriculumManagementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-50 rounded-3xl w-full max-w-6xl shadow-2xl border border-slate-200/80 max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn my-auto">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <CurriculumManagementHub 
            onClose={onClose} 
            userRole={userRole} 
            userName={userName} 
            isModal={false} 
          />
        </div>
      </div>
    </div>
  );
}
