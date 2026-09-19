/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  ShieldCheck, 
  Mail, 
  GraduationCap, 
  LogOut, 
  Save, 
  Settings, 
  CheckCircle2, 
  Lock, 
  Calendar, 
  Building, 
  KeyRound, 
  FileText, 
  Camera, 
  Upload, 
  Trash2,
  RotateCcw,
  ImageIcon
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { SapcLogo } from "./SapcLogo";

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  { id: "stem", label: "STEM Scholar", emoji: "🔬", bg: "from-blue-600 to-indigo-800" },
  { id: "grad", label: "Academic Achiever", emoji: "🎓", bg: "from-[#8B0014] to-[#4A000A]" },
  { id: "lion", label: "SAPC Lion", emoji: "🦁", bg: "from-amber-500 to-amber-700" },
  { id: "star", label: "Excellence", emoji: "🌟", bg: "from-purple-600 to-rose-600" },
  { id: "creative", label: "Arts & Culture", emoji: "🎨", bg: "from-emerald-600 to-teal-800" }
];

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, logout, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "academic" | "privacy">("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Editable form fields
  const [fullName, setFullName] = useState(user?.full_name || "Maria Theresa Cruz, RGC");
  const [email] = useState(user?.email || "counselor@sapc.edu.ph");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sapc_custom_logo");
    }
    return null;
  });
  const [lrn, setLrn] = useState("109482719283");
  const [strand, setStrand] = useState("Grade 11 - STEM (Science, Technology, Engineering, and Mathematics)");
  const [section, setSection] = useState("Section A - St. Thomas Aquinas");
  const [guardianName, setGuardianName] = useState("Mrs. Elena Dimaculangan");
  const [guardianContact, setGuardianContact] = useState("+63 917 555 0192");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstitutionalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setUploadError("Logo file size must be less than 4MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        localStorage.setItem("sapc_custom_logo", result);
        setCustomLogo(result);
        window.dispatchEvent(new Event("sapc_logo_updated"));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetInstitutionalLogo = () => {
    localStorage.removeItem("sapc_custom_logo");
    setCustomLogo(null);
    window.dispatchEvent(new Event("sapc_logo_updated"));
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("Image size must be less than 4MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        updateUserProfile({ avatar_url: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof AVATAR_PRESETS[0]) => {
    // Generate a quick SVG/canvas preset avatar URL or emoji marker
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = preset.id === "grad" ? "#8B0014" : preset.id === "lion" ? "#D97706" : preset.id === "stem" ? "#2563EB" : preset.id === "star" ? "#9333EA" : "#059669";
      ctx.beginPath();
      ctx.arc(64, 64, 64, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "60px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(preset.emoji, 64, 70);
      const dataUrl = canvas.toDataURL();
      setAvatarUrl(dataUrl);
      updateUserProfile({ avatar_url: dataUrl });
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    updateUserProfile({ avatar_url: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateUserProfile({
      full_name: fullName,
      avatar_url: avatarUrl
    });
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
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-13 w-13 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                />
              ) : (
                <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-amber-400 to-[#D97706] text-[#7B0012] flex items-center justify-center font-black text-2xl shadow-md">
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                  <Settings className="h-3 w-3 text-amber-300" />
                  SAPC Account Settings
                </span>
                <span className="text-xs text-rose-200 capitalize">• {user?.role?.replace("_", " ")}</span>
              </div>
              <h3 className="text-xl font-black text-white">{fullName || "User Account"}</h3>
            </div>
          </div>

          <button
            type="button"
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
            <span>Profile & Photo</span>
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
              <span>Your profile preferences and photo have been successfully updated.</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-[#8B0014] flex items-center gap-2.5">
              <X className="h-4 w-4 text-[#8B0014] shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* TAB 1: Profile Details & Photo Upload */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Profile Photo Uploader Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">Student Profile Photo</label>
                    <p className="text-[11px] text-slate-500">Upload a custom headshot or pick an institutional avatar</p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                    PNG, JPG, WebP ≤ 4MB
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div className="relative group shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile preview"
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-[#8B0014] shadow-sm"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#8B0014] to-[#5A000D] border-2 border-amber-400 flex items-center justify-center text-white text-3xl font-black shadow-sm">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold"
                    >
                      <Camera className="h-5 w-5 mb-0.5" />
                      <span>Change</span>
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-2xs transition flex items-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5 text-[#8B0014]" />
                        <span>Upload Photo</span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#8B0014] border border-rose-200 font-bold text-xs transition flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    {/* Avatar Presets Strip */}
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Or choose a quick preset:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {AVATAR_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPreset(p)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#8B0014] hover:bg-rose-50/60 transition text-xs flex items-center gap-1 shadow-2xs"
                            title={p.label}
                          >
                            <span>{p.emoji}</span>
                            <span className="font-bold text-[10px] text-slate-700">{p.label.split(" ")[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Institutional / School Branding Logo Upload Section */}
              <div className="p-4 bg-gradient-to-r from-amber-50/70 to-rose-50/50 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-[#8B0014]" />
                      Institutional / Campus Logo
                    </label>
                    <p className="text-[11px] text-slate-600">Customize the site header & sidebar brand emblem</p>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-slate-700 border border-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
                    PNG, SVG, JPG, WebP
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div className="p-2 bg-white rounded-2xl border border-amber-300/80 shadow-xs shrink-0 flex items-center justify-center">
                    <SapcLogo size={52} />
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleInstitutionalLogoUpload}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{customLogo ? "Change Custom Logo" : "Upload School Logo"}</span>
                      </button>

                      {customLogo && (
                        <button
                          type="button"
                          onClick={handleResetInstitutionalLogo}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                          title="Restore the official vector emblem"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                          <span>Reset to Official SAPC Seal</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500">
                      {customLogo 
                        ? "Custom campus logo is currently active in the navigation header & sidebar."
                        : "Using the default official San Antonio de Padua College vector seal emblem."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
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

              <div className="pt-2 flex justify-end">
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
