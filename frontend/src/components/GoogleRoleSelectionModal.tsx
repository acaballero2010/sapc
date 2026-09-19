"use client";

import React, { useState } from "react";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  HeartHandshake, 
  School,
  Lock
} from "lucide-react";
import { useAuth, RoleType } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { SapcLogo } from "./SapcLogo";

interface GoogleRoleSelectionModalProps {
  isOpen: boolean;
  userName?: string;
  onClose?: () => void;
}

const ROLES: Array<{
  role: RoleType;
  title: string;
  tagline: string;
  badge: string;
  icon: React.ReactNode;
  borderHover: string;
  badgeBg: string;
  route: string;
}> = [
  {
    role: "student",
    title: "Senior High / College Student",
    tagline: "Track GPA, 5-domain holistic wellness radar, failure recovery simulation, and guidance booking.",
    badge: "Student Success Portal",
    icon: <GraduationCap className="h-6 w-6 text-amber-500" />,
    borderHover: "hover:border-amber-400 hover:bg-amber-50/40",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
    route: "/dashboard/student"
  },
  {
    role: "teacher",
    title: "Teacher / Faculty Adviser",
    tagline: "Manage section rosters, submit SASS attendance records, view real-time class failure risk triage.",
    badge: "Faculty & Adviser Hub",
    icon: <School className="h-6 w-6 text-blue-600" />,
    borderHover: "hover:border-blue-400 hover:bg-blue-50/40",
    badgeBg: "bg-blue-100 text-blue-900 border-blue-300",
    route: "/dashboard/teacher"
  },
  {
    role: "guidance_counselor",
    title: "Guidance Counselor (RGC)",
    tagline: "Access Saaty AHP 5-domain multi-criteria triage, confidential NLP case notes, and triage queue.",
    badge: "Guidance Decision Hub",
    icon: <HeartHandshake className="h-6 w-6 text-[#8B0014]" />,
    borderHover: "hover:border-rose-400 hover:bg-rose-50/40",
    badgeBg: "bg-rose-100 text-[#8B0014] border-rose-300",
    route: "/dashboard/guidance"
  },
  {
    role: "parent",
    title: "Parent / Legal Guardian",
    tagline: "Monitor child's academic standing, receive attendance alerts, and schedule counselor consultations.",
    badge: "Parent & Family Portal",
    icon: <Users className="h-6 w-6 text-emerald-600" />,
    borderHover: "hover:border-emerald-400 hover:bg-emerald-50/40",
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    route: "/dashboard/parent"
  },
  {
    role: "admin",
    title: "Platform Administrator / Dean",
    tagline: "Calibrate AHP criteria pairwise weights, oversee system audit trails, and manage user accounts.",
    badge: "Institutional Admin",
    icon: <ShieldCheck className="h-6 w-6 text-purple-600" />,
    borderHover: "hover:border-purple-400 hover:bg-purple-50/40",
    badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
    route: "/dashboard/admin"
  }
];

export const GoogleRoleSelectionModal: React.FC<GoogleRoleSelectionModalProps> = ({ 
  isOpen, 
  userName,
  onClose 
}) => {
  const router = useRouter();
  const { switchRole, updateUserProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleType>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmRole = async () => {
    setIsSubmitting(true);
    try {
      await switchRole(selectedRole);
      await updateUserProfile({ role: selectedRole });
      const target = ROLES.find(r => r.role === selectedRole)?.route || "/dashboard/student";
      if (onClose) onClose();
      router.push(target);
    } catch {
      const target = ROLES.find(r => r.role === selectedRole)?.route || "/dashboard/student";
      if (onClose) onClose();
      router.push(target);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
              <SapcLogo className="h-9 w-9 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-amber-300" />
                  Google Workspace Authentication
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Welcome, {userName || "SAPC Member"}!
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Select Your Institutional Role
              </h3>
              <p className="text-xs text-slate-500">
                Choose your primary role at San Antonio de Padua College to enter your tailored portal:
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              <Lock className="h-3 w-3" />
              RA 10173 RBAC
            </span>
          </div>

          {/* Role Cards List */}
          <div className="space-y-2.5 pt-1">
            {ROLES.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <div
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    isSelected
                      ? "border-[#8B0014] bg-rose-50/50 shadow-sm"
                      : `border-slate-200 bg-slate-50/70 ${r.borderHover}`
                  }`}
                >
                  <div className={`p-2.5 rounded-xl bg-white border shrink-0 shadow-2xs ${
                    isSelected ? "border-[#8B0014]/40" : "border-slate-200"
                  }`}>
                    {r.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {r.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${r.badgeBg} shrink-0`}>
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {r.tagline}
                    </p>
                  </div>

                  <div className="pt-1 shrink-0">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? "border-[#8B0014] bg-[#8B0014] text-white" 
                        : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Selected Portal: <strong className="text-slate-900 font-bold">{ROLES.find(r => r.role === selectedRole)?.title}</strong>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmRole}
            className="px-6 py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-black text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>{isSubmitting ? "Launching Portal..." : "Enter Portal"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
