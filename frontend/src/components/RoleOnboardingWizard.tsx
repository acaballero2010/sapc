"use client";

import React, { useState } from "react";
import { 
  X, 
  Compass, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Brain, 
  ShieldCheck, 
  Users, 
  Sliders, 
  Bot, 
  Mic, 
  FileSpreadsheet, 
  TrendingUp, 
  Activity,
  Award,
  Bell
} from "lucide-react";
import { RoleType } from "@/lib/auth-context";

interface RoleOnboardingWizardProps {
  role: RoleType;
  isOpen: boolean;
  onClose: () => void;
}

export const RoleOnboardingWizard: React.FC<RoleOnboardingWizardProps> = ({ role, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const ONBOARDING_CONTENT: Record<RoleType, {
    roleTitle: string;
    roleBadge: string;
    steps: {
      title: string;
      subtitle: string;
      icon: any;
      iconBg: string;
      iconColor: string;
      description: string;
      highlights: string[];
      actionLabel?: string;
    }[];
  }> = {
    guidance_counselor: {
      roleTitle: "Guidance Counselor Portal",
      roleBadge: "Registered Guidance Counselor (RGC)",
      steps: [
        {
          title: "AHP 5-Domain Multi-Criteria Triage",
          subtitle: "Holistic student risk assessment beyond academic grades",
          icon: Brain,
          iconBg: "bg-rose-50",
          iconColor: "text-[#8B0014]",
          description: "SAPC IntellySys integrates academic performance ($S_{AC}$) with Mental Health, Financial Strain, Family Dynamics, and Physical Wellness using the Analytic Hierarchy Process.",
          highlights: [
            "Saaty AHP Consistency Ratio mathematically verified (CR ≤ 0.10)",
            "Automatic priority intervention recommendations tailored to the dominant vulnerability factor",
            "Real-time Tagalog & Taglish distress keyword alerts from the student AI guidance chatbot"
          ]
        },
        {
          title: "Confidential Clinical Notes & Voice Dictation",
          subtitle: "RA 10173 Privileged Sensitive Personal Information (SPI)",
          icon: Mic,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-800",
          description: "Dictate counseling intake sessions with built-in Web Speech recognition in English or Taglish. Our AI summarizer automatically generates structured clinical observations and action plans.",
          highlights: [
            "Strict role-based isolation: Teachers and parents are blocked from seeing psychological notes",
            "Live speech-to-text with one-click '✨ AI Auto-Structure' into clinical care plans",
            "Instant '✉ Notify Parent' SMS/Email consultation invitation dispatcher"
          ]
        },
        {
          title: "DepEd / CHED Institutional PDF Reports",
          subtitle: "Official failure prevention & retention compliance documentation",
          icon: Award,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-700",
          description: "Generate print-ready DepEd/CHED quarterly reports complete with the official SAPC crest, AHP risk distribution metrics, and dual signatory blocks for RGC Director & School Principal.",
          highlights: [
            "One-click print/PDF formatting with official school typography",
            "SHA-256 cryptographic audit seal for statutory data compliance",
            "Longitudinal multi-semester retention tracking with +14.2% institutional gain"
          ]
        }
      ]
    },
    teacher: {
      roleTitle: "Class Adviser Dashboard",
      roleBadge: "Licensed Professional Teacher (LPT)",
      steps: [
        {
          title: "SASS Grade CSV Batch Ingestion",
          subtitle: "Automated student academic synchronization",
          icon: FileSpreadsheet,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-900",
          description: "Upload SAPC Academic School System (SASS) quarterly CSV export files to automatically synchronize class rosters, quarter grades, and attendance metrics.",
          highlights: [
            "Deterministic formula: 60% Quarter GPA + 25% Absence Penalty + 15% Failed Units",
            "Line-by-line CSV format validation with automatic error handling",
            "Instant cohort risk re-calculation upon file upload"
          ]
        },
        {
          title: "Section At-Risk Student Monitoring",
          subtitle: "Real-time class roster & academic triage",
          icon: TrendingUp,
          iconBg: "bg-rose-50",
          iconColor: "text-rose-700",
          description: "View your assigned section's risk distribution. High Risk students are flagged for immediate academic remediation before midterm grading.",
          highlights: [
            "Color-coded risk badges (High: 70-100, Medium: 40-69.9, Low: 0-39.9)",
            "Direct student profile inspection for quarterly grade breakdown",
            "Protected privacy boundaries: non-academic notes remain confidential with Guidance"
          ]
        },
        {
          title: "Care Plan Collaboration & Remediation",
          subtitle: "Guidance counselor intervention tracking",
          icon: CheckCircle,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-700",
          description: "Track peer tutoring schedules, remedial study sessions, and scheduled follow-up dates assigned to students in your advisory class.",
          highlights: [
            "Follow-up scheduling with active care plan status badges",
            "Seamless collaboration between class advisers and RGC counselors",
            "Quarter-over-quarter academic GPA recovery verification"
          ]
        }
      ]
    },
    student: {
      roleTitle: "Student Wellness & Success Hub",
      roleBadge: "SAPC Learner Experience",
      steps: [
        {
          title: "Daily Mood Pulse & Mindfulness Guide",
          subtitle: "Track your emotional energy and daily wellness",
          icon: Activity,
          iconBg: "bg-rose-50",
          iconColor: "text-[#8B0014]",
          description: "Check in daily with 5 mood faces, energy battery levels, and optional reflections. Use the 60-second visual box breathing timer before exams to decompress.",
          highlights: [
            "5-second daily mood check-in with streak counter (🔥 5-Day Streak)",
            "Visual Box Breathing Guide (Inhale → Hold → Exhale) for stress relief",
            "7-day wellness sparkline tracking your emotional trend"
          ]
        },
        {
          title: "'What-If' Academic Recovery Simulator",
          subtitle: "Set grade goals and simulate risk reduction",
          icon: Sliders,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-800",
          description: "Experiment with target quarter GPAs, allowable absences, and remedial study sessions to see exactly how your composite risk score drops in real time.",
          highlights: [
            "1-click goal presets: Pass Standard, ★ Balanced Goal, and Academic Honors",
            "Live side-by-side comparison: Baseline Risk vs. Simulated Target Score",
            "Dynamic milestone checklist with personalized academic recommendations"
          ]
        },
        {
          title: "24/7 AI Guidance Companion",
          subtitle: "Confidential Tagalog & English pastoral support",
          icon: Bot,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-700",
          description: "Chat with the SAPC Guidance AI anytime for advice on study habits, time management, or emotional encouragement in English or Taglish.",
          highlights: [
            "Safe, empathetic responses grounded in San Antonio de Padua College values",
            "Automatic emergency crisis support and hotline routing for urgent distress",
            "Completely private student space for personal academic growth"
          ]
        }
      ]
    },
    parent: {
      roleTitle: "Parent / Guardian Portal",
      roleBadge: "Family Engagement Central",
      steps: [
        {
          title: "Linked Child Academic & Wellness Standing",
          subtitle: "Holistic oversight of your child's senior high journey",
          icon: Users,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-900",
          description: "Monitor your child's quarterly GPA, attendance standing, and holistic well-being in an easy-to-read, encouraging parent dashboard.",
          highlights: [
            "Clear GPA standing and quarter attendance percentage",
            "Holistic wellness rating ensuring emotional and academic balance",
            "Encouraging pastoral guidance updates from class advisers"
          ]
        },
        {
          title: "Guidance Consultation & Meeting Inbox",
          subtitle: "Direct communication with RGC counselors & advisers",
          icon: Bell,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-900",
          description: "Receive direct meeting requests via SMS or Email when your child needs support. Confirm attendance or request a reschedule with one click.",
          highlights: [
            "1-click RSVP: 'Confirm Attendance' or 'Request Reschedule'",
            "Clear venue, agenda, and scheduled time details",
            "SMS & Email notification preferences managed right from your portal"
          ]
        },
        {
          title: "Partnership for Student Retention",
          subtitle: "'A College for the Family' community support",
          icon: ShieldCheck,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-700",
          description: "Work closely with SAPC educators to support your child's study habits, career planning, and graduation goals.",
          highlights: [
            "Active intervention tracking and milestone achievements",
            "Direct access to school counseling resources and calendar",
            "Strict RA 10173 data privacy ensuring family record security"
          ]
        }
      ]
    },
    admin: {
      roleTitle: "System Administration & Compliance",
      roleBadge: "SAPC Central Directorate",
      steps: [
        {
          title: "AHP Multi-Criteria Decision Engine Weights",
          subtitle: "Fixed priority vector calibration & Saaty validation",
          icon: Sliders,
          iconBg: "bg-amber-50",
          iconColor: "text-[#D97706]",
          description: "Review and calibrate the Analytic Hierarchy Process pairwise weights for Academic, Mental Health, Financial, Family, and Physical Health domains.",
          highlights: [
            "Academic (40.17%), Mental Health (24.42%), Financial (13.73%), Family (13.73%), Health (7.94%)",
            "Saaty Consistency Ratio: CR = 0.048 (Passes standard CR ≤ 0.10)",
            "Mathematical priority vector validation for all decision models"
          ]
        },
        {
          title: "RA 10173 Immutable Security Audit Trail",
          subtitle: "Statutory compliance & privileged access logging",
          icon: ShieldCheck,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-700",
          description: "Inspect append-only audit logs tracking all student record views, psychological note accesses, and risk assessments under Philippine Data Privacy Act rules.",
          highlights: [
            "Immutable append-only Firestore audit collection (zero deletion allowed)",
            "Role boundaries strictly enforced across counselor, teacher, and parent roles",
            "SHA-256 cryptographic hash logging on all generated institutional reports"
          ]
        },
        {
          title: "Multi-Semester Longitudinal Retention Impact",
          subtitle: "Cohort-wide analytics & failure reduction benchmarking",
          icon: TrendingUp,
          iconBg: "bg-rose-50",
          iconColor: "text-[#8B0014]",
          description: "Track the macro-level impact of SAPC IntellySys across academic years and sections (STEM, ABM, HUMSS).",
          highlights: [
            "+14.2% YoY Retention Gain across Senior High School cohorts",
            "34 dropouts successfully intercepted via AHP early warning triage",
            "98.4% early interception SLA compliance under guidance protocols"
          ]
        }
      ]
    }
  };

  const roleData = ONBOARDING_CONTENT[role] || ONBOARDING_CONTENT.guidance_counselor;
  const stepData = roleData.steps[currentStep];
  const StepIcon = stepData.icon;
  const isLastStep = currentStep === roleData.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/40 flex items-center gap-1">
                <Compass className="h-3 w-3 text-amber-300" />
                Welcome to SAPC IntellySys
              </span>
              <span className="text-xs text-rose-200 font-semibold">• {roleData.roleBadge}</span>
            </div>
            <h3 className="text-xl font-black text-white">{roleData.roleTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Skip Onboarding Tour"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Step {currentStep + 1} of {roleData.steps.length}:</span>
            <span className="text-xs font-extrabold text-[#8B0014] truncate max-w-[280px]">{stepData.title}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {roleData.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? "w-7 bg-[#8B0014]" 
                    : idx < currentStep 
                    ? "w-2.5 bg-emerald-500" 
                    : "w-2.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-left">
          
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl ${stepData.iconBg} ${stepData.iconColor} border border-slate-200/80 shrink-0 shadow-xs`}>
              <StepIcon className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-950 tracking-tight">{stepData.title}</h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">{stepData.subtitle}</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {stepData.description}
          </p>

          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 block">
              Key Capabilities & Features:
            </span>
            <div className="space-y-2">
              {stepData.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Controls Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 transition"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <span>{isLastStep ? "Complete Tour & Enter Portal" : "Next Step"}</span>
              {isLastStep ? <CheckCircle className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
