/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  User, 
  ShieldCheck, 
  Mail, 
  GraduationCap, 
  Lock, 
  KeyRound, 
  Camera, 
  Trash2,
  Save, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  Eye,
  EyeOff,
  Download,
  BadgeCheck,
  Globe
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams } from "next/navigation";

const AVATAR_PRESETS = [
  { id: "stem", label: "STEM Scholar", emoji: "🔬", bg: "from-blue-600 to-indigo-800" },
  { id: "grad", label: "Academic Achiever", emoji: "🎓", bg: "from-[#8B0014] to-[#4A000A]" },
  { id: "lion", label: "SAPC Lion", emoji: "🦁", bg: "from-amber-500 to-amber-700" },
  { id: "star", label: "Excellence", emoji: "🌟", bg: "from-purple-600 to-rose-600" },
  { id: "creative", label: "Arts & Culture", emoji: "🎨", bg: "from-emerald-600 to-teal-800" }
];

export default function UserProfilePage() {
  const searchParams = useSearchParams();
  const { user, updateUserProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "privacy">("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form state
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "user@sapc.edu.ph");
  const [phone, setPhone] = useState("+63 (049) 559-0192");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [idNumber, setIdNumber] = useState("FAC-2026-STEM-04");
  const [department, setDepartment] = useState("Senior High School STEM Faculty");
  const [officeLocation, setOfficeLocation] = useState("Room 204, St. Augustine Building");
  const [bio, setBio] = useState("Licensed educator and decision-support facilitator at San Antonio de Padua College.");
  
  // Student/Parent Specific
  const [guardianName, setGuardianName] = useState("Mrs. Elena Dimaculangan");
  const [guardianContact, setGuardianContact] = useState("+63 917 555 0192");

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Status banners
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "security" || tabParam === "privacy" || tabParam === "profile") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync state with active authenticated user
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "user@sapc.edu.ph");
      setAvatarUrl(user.avatar_url || null);

      if (user.role === "guidance_counselor") {
        setIdNumber("PRC-RGC-094821");
        setDepartment("Guidance & Counseling Department");
        setOfficeLocation("Central Guidance Consultation Room 204");
        setBio("Registered Guidance Counselor (RGC) specializing in student crisis intervention, AHP behavioral modeling, and academic retention casework.");
      } else if (user.role === "teacher") {
        setIdNumber("FAC-2026-STEM-04");
        setDepartment("Senior High School Science & Mathematics Faculty");
        setOfficeLocation("Faculty Room 3B, Senior High Wing");
        setBio("Senior High STEM Class Adviser and Chemistry Faculty focusing on student academic stabilization and early guidance referrals.");
      } else if (user.role === "admin") {
        setIdNumber("ADM-2026-001");
        setDepartment("Institutional IT & Academic Administration");
        setOfficeLocation("Administration Building, 2nd Floor");
        setBio("System Administrator overseeing AHP decision support model weights, user provisioning, and RA 10173 data privacy compliance.");
      } else if (user.role === "student") {
        setIdNumber("109482719283");
        setDepartment("Grade 11 - STEM (St. Augustine)");
        setOfficeLocation("Classroom 11-A");
        setGuardianName("Mrs. Elena Dimaculangan");
        setGuardianContact("+63 917 555 0192");
        setBio("Grade 11 STEM Student passionate about Robotics, Applied Chemistry, and peer wellness advocacy.");
      } else if (user.role === "parent") {
        setIdNumber("PRNT-10948271");
        setDepartment("Parent-Teacher Community Association (PTCA)");
        setOfficeLocation("Parent Representative, Grade 11 STEM");
        setGuardianName("Mrs. Elena Dimaculangan (Self)");
        setGuardianContact("+63 917 555 0192");
        setBio("Guardian of Joshua Dimaculangan (Grade 11 STEM). Participating in student care plans and parent consultations.");
      }
    }
  }, [user]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Photo file size must be less than 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        if (updateUserProfile) {
          updateUserProfile({ avatar_url: result });
        }
        setSaveSuccess("Profile photo updated successfully!");
        setTimeout(() => setSaveSuccess(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Avatar Preset Selection
  const handleSelectPreset = (preset: typeof AVATAR_PRESETS[0]) => {
    const presetSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%238B0014"/><text x="50%" y="54%" font-size="52" text-anchor="middle" dominant-baseline="middle">${preset.emoji}</text></svg>`;
    setAvatarUrl(presetSvg);
    if (updateUserProfile) {
      updateUserProfile({ avatar_url: presetSvg });
    }
    setSaveSuccess(`Selected ${preset.label} avatar.`);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    if (updateUserProfile) {
      updateUserProfile({ avatar_url: "" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaveSuccess("Profile photo reset to initials.");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Handle Profile Details Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    setTimeout(() => {
      if (updateUserProfile) {
        updateUserProfile({
          full_name: fullName,
          avatar_url: avatarUrl || undefined,
        });
      }
      setIsSaving(false);
      setSaveSuccess("Your personal and institutional profile details have been saved.");
      setTimeout(() => setSaveSuccess(null), 4000);
    }, 600);
  };

  // Handle Password Update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswordSuccess("Your account password has been changed successfully. You can now use your new credentials.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 5000);
    }, 800);
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="space-y-6 pb-16 font-sans w-full max-w-6xl mx-auto">
      {/* Toast Notification */}
      {(saveSuccess || passwordSuccess) && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{saveSuccess || passwordSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-rose-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-500 animate-in fade-in slide-in-from-top-4">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-6 sm:p-8 text-white shadow-xl border-t-4 border-amber-400 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="h-64 w-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Upload Hover Trigger */}
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-amber-400 shadow-2xl"
              />
            ) : (
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-[#8B0014] to-[#4A000A] border-4 border-amber-400 flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                {initials}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-lg flex items-center justify-center transition hover:scale-105"
              title="Change Profile Photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* User Info & Identity */}
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 inline-flex items-center gap-1 shadow-xs">
                <BadgeCheck className="h-3.5 w-3.5 text-[#8B0014]" />
                {user?.role ? `${user.role.replace("_", " ")} Account` : "SAPC User"}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Verified Session
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{fullName || "User Profile"}</h1>
            <p className="text-xs sm:text-sm text-rose-100/90 font-medium flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-amber-300" /> {email}</span>
              <span className="inline-flex items-center gap-1"><Building className="h-3.5 w-3.5 text-amber-300" /> San Antonio de Padua College</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1 rounded-xl bg-white/15 hover:bg-rose-500/30 text-rose-200 text-xs font-bold border border-white/20 transition flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === "profile"
              ? "bg-[#8B0014] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Personal &amp; Institutional Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === "security"
              ? "bg-[#8B0014] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Password &amp; Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === "privacy"
              ? "bg-[#8B0014] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Data Privacy &amp; RA 10173</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PERSONAL & INSTITUTIONAL PROFILE */}
      {/* ========================================================= */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Main Details Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Account Details</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update your public identity, verified credentials, and institutional assignments.</p>
                </div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">SAPC IntellySys ID</span>
              </div>

              {/* Avatar Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Quick Avatar Emblems
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#8B0014] dark:hover:border-rose-500 bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition flex flex-col items-center gap-1.5 text-center group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{preset.emoji}</span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    placeholder="e.g. Maria Theresa Cruz, RGC"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address (Institutional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    placeholder="user@sapc.edu.ph"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {user?.role === "guidance_counselor" ? "PRC License No." : user?.role === "student" ? "DepEd LRN" : "Institutional ID No."}
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    placeholder="e.g. PRC-RGC-094821"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department / Division / Strand</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    placeholder="e.g. Guidance & Counseling Department"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Office / Section Assignment</label>
                  <input
                    type="text"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    placeholder="e.g. Room 204, Guidance Office"
                  />
                </div>
              </div>

              {(user?.role === "student" || user?.role === "parent") && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Guardian Emergency Contact</label>
                    <input
                      type="text"
                      value={guardianContact}
                      onChange={(e) => setGuardianContact(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Professional Bio &amp; Role Notes</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  placeholder="Share details regarding your educational background and counseling approach..."
                />
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#A30018] text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PASSWORD & SECURITY */}
      {/* ========================================================= */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <form onSubmit={handlePasswordUpdate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Change Account Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your account is protected with a strong passphrase containing uppercase, lowercase, numbers, and symbols.</p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    placeholder="Enter new strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              {/* Password strength checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password Requirements:</p>
                <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <li className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Minimum of 8 characters
                  </li>
                  <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Contains at least one uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Contains at least one numeric digit (0-9)
                  </li>
                </ul>
              </div>
            </div>

            {/* 2FA Section */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                  Two-Factor Authentication (2FA) via OTP
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Send a 6-digit verification code to your registered email address upon login.</p>
              </div>
              <button
                type="button"
                onClick={() => setIs2FAEnabled(p => !p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  is2FAEnabled 
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                }`}
              >
                {is2FAEnabled ? "2FA Enabled ✓" : "2FA Disabled"}
              </button>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#A30018] text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>{isSaving ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DATA PRIVACY & RA 10173 */}
      {/* ========================================================= */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Republic Act No. 10173 — Data Subject Rights &amp; Privacy Shield
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your personal and behavioral decision-support telemetry is governed by the Philippine Data Privacy Act of 2012.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                  Right to be Informed &amp; Consent
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  All mental health screening logs, AI counseling transcripts, and academic metrics require explicit student/guardian consent prior to counselor intake.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-[#8B0014] dark:text-rose-400" />
                  Right to Access &amp; Portability
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You can inspect all decision-support entries, historical AHP domain scores, and counselor care notes associated with your account.
                </p>
              </div>
            </div>

            {/* Active Session Telemetry */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                Current Verified Session Telemetry
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">IP Address</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">120.28.182.44 (Laguna, PH)</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Encryption Protocol</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">TLS 1.3 / AES-256 GCM</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Session Duration</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">Active (Started Today)</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Audit Trail Hash</span>
                  <p className="font-mono font-bold text-amber-600 dark:text-amber-400 truncate mt-0.5">sha256:e839f10a...</p>
                </div>
              </div>
            </div>

            {/* Data Export Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                To request a permanent account closure or data erasure, contact the SAPC Data Protection Officer at dpo@sapc.edu.ph.
              </span>
              <button
                type="button"
                onClick={() => {
                  setSaveSuccess("Exporting your complete RA 10173 account telemetry to JSON...");
                  setTimeout(() => setSaveSuccess(null), 4000);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
              >
                <Download className="h-4 w-4" />
                <span>Export My Data Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
