"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Layers, 
  Brain, 
  Users, 
  Bot, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  BookOpen, 
  Lock, 
  ArrowRight, 
  Archive, 
  User, 
  GraduationCap, 
  UserCheck 
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { 
  getActiveStudentDataset, 
  getActiveFacultyRecords, 
  getActiveParentRecords, 
  StudentRecord,
  FacultyRecord,
  ParentRecord
} from "@/lib/dataset-store";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
  onOpenSimulator?: () => void;
  onOpenArchive?: () => void;
  onSelectStudent?: (student: StudentRecord) => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Students" | "Staff & Faculty" | "Parents" | "Actions" | "Navigation" | "Documentation";
  description?: string;
  icon: any;
  action: () => void;
  badge?: string;
  badgeColor?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenChat,
  onOpenSimulator,
  onOpenArchive,
  onSelectStudent
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTabFilter, setActiveTabFilter] = useState<"all" | "students" | "staff" | "parents" | "actions">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Live records state
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [parentRecords, setParentRecords] = useState<ParentRecord[]>([]);

  // Load and subscribe to live records
  useEffect(() => {
    if (!isOpen) return;

    const refreshData = () => {
      setStudents(getActiveStudentDataset());
      setFacultyList(getActiveFacultyRecords());
      setParentRecords(getActiveParentRecords());
    };

    refreshData();
    window.addEventListener("sapc:dataset-updated", refreshData);
    window.addEventListener("sapc:faculty-updated", refreshData);
    window.addEventListener("sapc:parent-records-updated", refreshData);

    return () => {
      window.removeEventListener("sapc:dataset-updated", refreshData);
      window.removeEventListener("sapc:faculty-updated", refreshData);
      window.removeEventListener("sapc:parent-records-updated", refreshData);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
      setActiveTabFilter("all");
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
          window.dispatchEvent(new CustomEvent("sapc:toggle-command-palette"));
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const role = user?.role || "guidance_counselor";

  const showToastHint = (message: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sapc:toast", { detail: message }));
    }
  };

  const handleStudentSelect = useCallback((student: StudentRecord) => {
    onClose();
    if (onSelectStudent) {
      onSelectStudent(student);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sapc:select-student", { detail: student }));
      window.dispatchEvent(new CustomEvent("sapc:open-student-detail", { detail: student }));
      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { 
        detail: { tab: role === "guidance_counselor" ? "student_profile" : "students", studentId: student.id } 
      }));
    }
    showToastHint(`Opening dossier for ${student.full_name} (${student.lrn})...`);
    if (role === "guidance_counselor") {
      router.push("/dashboard/guidance?tab=student_profile");
    } else if (role === "teacher") {
      router.push("/dashboard/teacher?tab=gradebook");
    } else if (role === "admin") {
      router.push("/dashboard/admin?tab=students");
    }
  }, [onClose, onSelectStudent, role, router]);

  const handleFacultySelect = useCallback((faculty: FacultyRecord) => {
    onClose();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab: "teachers" } }));
    }
    showToastHint(`Navigating to ${faculty.name} (${faculty.role.toUpperCase()}) in Accounts Roster.`);
    if (role === "admin") {
      router.push("/dashboard/admin?tab=teachers");
    }
  }, [onClose, role, router]);

  const handleParentSelect = useCallback((parent: ParentRecord) => {
    onClose();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab: "parents" } }));
    }
    showToastHint(`Navigating to parent ${parent.name} (Linked: ${parent.linkedStudentName}).`);
    if (role === "admin") {
      router.push("/dashboard/admin?tab=parents");
    }
  }, [onClose, role, router]);

  // Build items dynamically
  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // 1. Live Students (All matching students from 500-cohort)
    students.forEach((s) => {
      const isHigh = s.latest_risk_tier === "high";
      const isMed = s.latest_risk_tier === "medium";
      const badge = isHigh ? "HIGH RISK" : isMed ? "MED RISK" : "LOW RISK";
      const badgeColor = isHigh ? "bg-rose-600 text-white" : isMed ? "bg-amber-500 text-slate-950" : "bg-emerald-600 text-white";

      items.push({
        id: `stu-${s.id}-${s.lrn}`,
        title: `${s.full_name} (LRN: ${s.lrn})`,
        category: "Students",
        description: `${s.section_name || `Grade ${s.grade_level}`} • Risk: ${s.latest_risk_score.toFixed(1)} (${s.latest_risk_tier.toUpperCase()}) • Driver: ${s.primary_risk_driver || "Academic"}`,
        icon: Users,
        action: () => handleStudentSelect(s),
        badge,
        badgeColor
      });
    });

    // 2. Live Faculty & Staff
    facultyList.forEach((f) => {
      const isCounselor = f.role === "guidance_counselor" || f.role === "counselor";
      const isAdmin = f.role === "admin";
      const badge = isAdmin ? "ADMIN" : isCounselor ? "RGC COUNSELOR" : "TEACHER";
      const badgeColor = isAdmin ? "bg-purple-600 text-white" : isCounselor ? "bg-rose-600 text-white" : "bg-blue-600 text-white";

      items.push({
        id: `fac-${f.id}-${f.email}`,
        title: `${f.name} (${f.email})`,
        category: "Staff & Faculty",
        description: `${f.section || f.department} • ${f.employee_id || f.prc_license_no || f.id} • ${f.status}`,
        icon: isCounselor ? Brain : isAdmin ? UserCheck : GraduationCap,
        action: () => handleFacultySelect(f),
        badge,
        badgeColor
      });
    });

    // 3. Live Parents
    parentRecords.forEach((p) => {
      items.push({
        id: `par-${p.id}-${p.email}`,
        title: `${p.name} (${p.relationship})`,
        category: "Parents",
        description: `Linked: ${p.linkedStudentName} (LRN: ${p.linkedLRN}) • ${p.section} • ${p.phone}`,
        icon: User,
        action: () => handleParentSelect(p),
        badge: "PARENT",
        badgeColor: "bg-amber-600 text-white"
      });
    });

    // 4. Standard System Actions
    items.push(
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
        badge: "BACKUP",
        badgeColor: "bg-indigo-600 text-white"
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
        badge: "AI COMPANION",
        badgeColor: "bg-purple-600 text-white"
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
        badge: "DSS TOOL",
        badgeColor: "bg-teal-600 text-white"
      },
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
        badge: "TRIAGE",
        badgeColor: "bg-rose-600 text-white"
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
        badge: "SASS",
        badgeColor: "bg-amber-600 text-white"
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
        id: "action-docs",
        title: "System Design & Risk Assessment Specs",
        category: "Documentation",
        description: "Detailed AHP math formulas, 5-domain weights, architecture & tech stack",
        icon: BookOpen,
        action: () => {
          onClose();
          router.push("/dashboard/docs");
        },
        badge: "DOCS",
        badgeColor: "bg-slate-700 text-white"
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
      }
    );

    return items;
  }, [students, facultyList, parentRecords, role, onOpenArchive, onOpenChat, onOpenSimulator, router, handleStudentSelect, handleFacultySelect, handleParentSelect, onClose]);

  // Search filtering
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = allItems;

    // Filter by tab pill
    if (activeTabFilter === "students") {
      list = list.filter((i) => i.category === "Students");
    } else if (activeTabFilter === "staff") {
      list = list.filter((i) => i.category === "Staff & Faculty");
    } else if (activeTabFilter === "parents") {
      list = list.filter((i) => i.category === "Parents");
    } else if (activeTabFilter === "actions") {
      list = list.filter((i) => i.category === "Actions" || i.category === "Navigation" || i.category === "Documentation");
    }

    if (!q) {
      // Default suggested items: first 8 students + top actions
      const sampleStudents = list.filter((i) => i.category === "Students").slice(0, 8);
      const topActions = list.filter((i) => i.category !== "Students").slice(0, 6);
      return activeTabFilter === "all" ? [...sampleStudents, ...topActions] : list.slice(0, 20);
    }

    // Keyword matching
    const matching = list.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });

    // Return up to 40 relevant results
    return matching.slice(0, 40);
  }, [allItems, query, activeTabFilter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-900/70">
          <Search className="h-5 w-5 text-[#8B0014] dark:text-rose-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students, staff, parents, LRNs, or actions (e.g. 'Joshua', 'Santos', 'Grade 10', 'AHP')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base font-bold focus:outline-none focus:ring-0"
          />
          {query && (
            <button 
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg text-xs font-bold"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: "all", label: `All (${filteredItems.length})` },
            { id: "students", label: `Students (${students.length})` },
            { id: "staff", label: `Staff & Faculty (${facultyList.length})` },
            { id: "parents", label: `Parents (${parentRecords.length})` },
            { id: "actions", label: "Tools & Actions" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTabFilter(tab.id as any);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTabFilter === tab.id
                  ? "bg-[#8B0014] text-white shadow-2xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto max-h-[58vh] divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Search className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No matching results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-400">
                Try searching by first name (e.g. &ldquo;Joshua&rdquo;), last name (e.g. &ldquo;Dimaculangan&rdquo;), 12-digit LRN, or section.
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.id}-${idx}`}
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
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${item.badgeColor || "bg-slate-200 text-slate-700"}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">
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
            <span><kbd className="font-mono font-bold text-slate-500 dark:text-slate-400">↵</kbd> to open dossier</span>
          </div>
          <span className="font-medium text-slate-500">
            {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
};
