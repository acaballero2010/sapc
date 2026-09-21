"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  Layers, 
  Brain, 
  Users, 
  Bot, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  BookOpen, 
  HelpCircle,
  Lock,
  ArrowRight,
  Archive
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
  onOpenSimulator?: () => void;
  onOpenArchive?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Students" | "Documentation" | "Actions";
  description?: string;
  icon: any;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenChat,
  onOpenSimulator,
  onOpenArchive
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keydown handler for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
          window.dispatchEvent(new CustomEvent("sapc:open-command-palette"));
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const role = user?.role || "guidance_counselor";

  // Build command items list
  const defaultItems: CommandItem[] = [
    // Actions
    {
      id: "action-archive",
      title: "Archive & Export Sample Datasets",
      category: "Actions",
      description: "Download 500-student database JSON, 5-domain CSVs, and manage snapshot backups",
      icon: Archive,
      action: () => {
        onClose();
        if (onOpenArchive) onOpenArchive();
      },
      badge: "BACKUP"
    },
    {
      id: "action-chat",
      title: "Talk to AI Guidance Counselor",
      category: "Actions",
      description: "24/7 confidential empathetic listening companion (Tagalog/English)",
      icon: Bot,
      action: () => {
        onClose();
        if (onOpenChat) onOpenChat();
      },
      badge: "AI COMPANION"
    },
    {
      id: "action-simulator",
      title: "Open AHP Sensitivity Simulator",
      category: "Actions",
      description: "Interactive what-if sliders for the 5-domain composite risk score",
      icon: Layers,
      action: () => {
        onClose();
        if (onOpenSimulator) onOpenSimulator();
      },
      badge: "DSS TOOL"
    },
    {
      id: "action-docs",
      title: "System Design & Risk Assessment Specs",
      category: "Documentation",
      description: "Detailed AHP math formulas, 5-domain weights, architecture & tech stack",
      icon: BookOpen,
      action: () => {
        onClose();
        router.push("/dashboard/docs");
      },
      badge: "DOCS"
    },
    {
      id: "action-faqs",
      title: "FAQs & How-To Guides",
      category: "Documentation",
      description: "Step-by-step guides for SASS CSV uploads, triage, and crisis protocols",
      icon: HelpCircle,
      action: () => {
        onClose();
        router.push("/dashboard/docs");
      }
    },
    {
      id: "action-privacy",
      title: "Data Privacy & Compliance (RA 10173)",
      category: "Documentation",
      description: "Philippine Data Privacy Act compliance & student consent policies",
      icon: Lock,
      action: () => {
        onClose();
        router.push("/dashboard/docs");
      }
    },

    // Navigation depending on role
    {
      id: "nav-command-center",
      title: "Dashboard Overview & Command Center",
      category: "Navigation",
      description: "Live cohort health, active care plans, and risk metrics",
      icon: Activity,
      action: () => {
        onClose();
        router.push(`/dashboard/${role.replace("_", "")}`);
      }
    },
    {
      id: "nav-crisis-alerts",
      title: "Crisis Alerts & Triage Queue",
      category: "Navigation",
      description: "High-distress flags and urgent counselor interventions",
      icon: AlertTriangle,
      action: () => {
        onClose();
        router.push("/dashboard/guidance?tab=crisis_alerts");
      },
      badge: "TRIAGE"
    },
    {
      id: "nav-import-wizard",
      title: "DepEd SASS 3-Step CSV Ingestion Wizard",
      category: "Navigation",
      description: "Upload quarterly academic spreadsheets and compute AHP scores",
      icon: Layers,
      action: () => {
        onClose();
        router.push(role === "admin" ? "/dashboard/admin?tab=import_wizard" : "/dashboard/teacher?tab=import_wizard");
      },
      badge: "SASS"
    },
    {
      id: "nav-interventions",
      title: "Master Care Plans & Interventions",
      category: "Navigation",
      description: "Manage active counseling, tutoring, and financial aid referrals",
      icon: ShieldCheck,
      action: () => {
        onClose();
        router.push(`/dashboard/${role === "guidance_counselor" ? "guidance" : role}?tab=interventions`);
      }
    },
    {
      id: "nav-screeners",
      title: "PHQ-9 & GAD-7 Clinical Screeners",
      category: "Navigation",
      description: "Administer and evaluate standardized depression/anxiety screeners",
      icon: Brain,
      action: () => {
        onClose();
        router.push("/dashboard/guidance?tab=assessments");
      }
    },

    // Mock Students for quick jump
    {
      id: "student-1",
      title: "Juan Dela Cruz (LRN: 109283748291)",
      category: "Students",
      description: "Grade 10 - St. Anthony • Composite Risk: 76.5 (HIGH) • Dominant: Academic",
      icon: Users,
      action: () => {
        onClose();
        router.push("/dashboard/guidance?tab=student_profile");
      },
      badge: "HIGH RISK"
    },
    {
      id: "student-2",
      title: "Maria Santos (LRN: 109283748292)",
      category: "Students",
      description: "Grade 10 - St. Francis • Composite Risk: 54.0 (MEDIUM) • Dominant: Mental Health",
      icon: Users,
      action: () => {
        onClose();
        router.push("/dashboard/guidance?tab=student_profile");
      },
      badge: "MED RISK"
    },
    {
      id: "student-3",
      title: "Jose Rizal (LRN: 109283748293)",
      category: "Students",
      description: "Grade 10 - St. Jude • Composite Risk: 28.5 (LOW) • Dominant: Healthy",
      icon: Users,
      action: () => {
        onClose();
        router.push("/dashboard/guidance?tab=student_profile");
      },
      badge: "LOW RISK"
    }
  ];

  // Filter items by query
  const filteredItems = query.trim() === "" 
    ? defaultItems 
    : defaultItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
        (item.badge && item.badge.toLowerCase().includes(query.toLowerCase()))
      );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-900/70">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students, tabs, AHP formulas, SASS imports, or docs... (Esc to close)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-0"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto max-h-[60vh] divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Search className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400">Try searching for &ldquo;AHP&rdquo;, &ldquo;SASS&rdquo;, &ldquo;Juan&rdquo;, &ldquo;Triage&rdquo;, or &ldquo;Crisis&rdquo;.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition cursor-pointer ${
                    isSelected
                      ? "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isSelected 
                        ? "bg-[#8B0014] text-white shadow-xs" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-[#8B0014] dark:text-rose-300 font-extrabold" : "text-slate-900 dark:text-white"}`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            item.badge.includes("HIGH")
                              ? "bg-rose-600 text-white"
                              : item.badge.includes("MED")
                              ? "bg-amber-500 text-slate-950 font-bold"
                              : item.badge.includes("AI")
                              ? "bg-purple-600 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {item.category}
                    </span>
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "translate-x-1 text-[#8B0014] dark:text-rose-400" : ""}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono font-bold text-slate-500 dark:text-slate-400">↑</kbd> <kbd className="font-mono font-bold text-slate-500 dark:text-slate-400">↓</kbd> to navigate</span>
            <span><kbd className="font-mono font-bold text-slate-500 dark:text-slate-400">↵</kbd> to select</span>
          </div>
          <span>SAPC IntellySys DSS</span>
        </div>
      </div>
    </div>
  );
};
