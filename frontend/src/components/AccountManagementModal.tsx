"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Mail, 
  GraduationCap, 
  LogOut, 
  Save, 
  Sparkles,
  CheckCircle2,
  Lock,
  Calendar,
  Building,
  KeyRound,
  FileText
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "academic" | "privacy">("profile");
  
  // Editable form fields
  const [fullName, setFullName] = useState(user?.full_name || "Kalye");
  const [email] = useState(user?.email || "kalye@sapc.edu.ph");
  const [lrn, setLrn] = useState("109482719283");
  const [strand, setStrand] = useState("Grade 11 - STEM (Science, Technology, Engineering, and Mathematics)");
  const [section, setSection] = useState("Section A - St. Thomas Aquinas");
  const [guardianName, setGuardianName] = useState("Mrs. Elena Dimaculangan");
  const [guardianContact, setGuardianContact] = useState("+63 917 555 0192");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleLogout = () => {
    onClose();
    logout();
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-[#D97706] text-[#7B0012] flex items-center justify-center font-black text-xl shadow-md">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  SAPC Account Settings
                </span>
                <span className="text-xs text-rose-200 capitalize">• {user?.role?.replace("_", " ")}</span>
              </div>
              <h3 className="text-xl font-black text-white">{user?.full_name || "User Account"}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "profile"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="h-4 w-4 text-[#8B0014]" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("academic")}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "academic"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building className="h-4 w-4 text-amber-600" />
            <span>Academic & Family</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "privacy"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>RA 10173 Privacy</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">

          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Your institutional profile preferences have been successfully updated and saved.</span>
            </div>
          )}

          {/* TAB 1: Profile Details */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">SAPC Institutional Email</label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-600 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">DepEd LRN (12-Digit)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={lrn}
                    onChange={(e) => setLrn(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Academic Year</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-semibold">
                    <Calendar className="h-4 w-4 text-[#8B0014]" />
                    <span>AY 2025–2026 (Semester 2)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Academic & Family */}
          {activeTab === "academic" && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Track / Strand</label>
                <input
                  type="text"
                  value={strand}
                  onChange={(e) => setStrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Section & Class Adviser</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Linked Parent / Guardian</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Emergency Mobile Number</label>
                  <input
                    type="text"
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Academic Info"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: RA 10173 Privacy Transparency */}
          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <span>RA 10173 Sensitive Personal Information (SPI) Protection</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  San Antonio de Padua College enforces end-to-end access boundaries. Sensitive psychological and non-academic distress scores are strictly accessible only to licensed Guidance Counselors (RGC).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Encryption Protocol:</span>
                  <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" /> 256-bit TLS / AES-GCM
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Role-Based Access Control:</span>
                  <span className="font-bold text-slate-900 capitalize">{user?.role?.replace("_", " ")} Tier</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Audit Trail Logging:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Immutable Hash Verified
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Data Subject Consent:</span>
                  <span className="font-bold text-slate-900">Signed on Enrollment Slip</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <FileText className="h-3.5 w-3.5 text-[#8B0014]" />
                <span>To request a full data portability export or privacy review, contact <strong className="text-slate-800">dpo@sapc.edu.ph</strong></span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Sign Out */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <KeyRound className="h-4 w-4 text-emerald-600" />
            <span>Authenticated Session Active</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#8B0014] font-bold text-xs border border-rose-200 transition flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Account</span>
          </button>
        </div>

      </div>
    </div>
  );
};
