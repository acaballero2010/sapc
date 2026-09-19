"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  FileText, 
  ArrowRight, 
  Sparkles,
  KeyRound,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"student_claim" | "parent_link" | "faculty_request">("student_claim");
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student form state
  const [lrn, setLrn] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentBirthDate, setStudentBirthDate] = useState("");

  // Parent form state
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentLrn, setParentLrn] = useState("");
  const [relationship, setRelationship] = useState("Mother");

  // Faculty request state
  const [facultyName, setFacultyName] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyRole, setFacultyRole] = useState("teacher");
  const [facultyDept, setFacultyDept] = useState("Senior High School (STEM)");

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleStudentClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("otp");
    }, 800);
  };

  const handleParentLink = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("otp");
    }, 800);
  };

  const handleFacultyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("success");
    }, 800);
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    setTimeout(async () => {
      setIsSubmitting(false);
      setStep("success");
    }, 1000);
  };

  const handleFinishAndEnter = async () => {
    onClose();
    if (activeTab === "student_claim") {
      await switchRole("student");
    } else if (activeTab === "parent_link") {
      await switchRole("parent");
    } else {
      await switchRole("teacher");
    }
    router.push("/dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar */}
        <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/40 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-300" />
                SAPC Institutional Onboarding
              </span>
              <span className="text-xs text-rose-200">• RA 10173 Verified</span>
            </div>
            <h3 className="text-xl font-black text-white">
              {step === "form" && "Claim Account & Family Registration"}
              {step === "otp" && "Verify SMS / Email OTP Token"}
              {step === "success" && "Account Verified & Activated!"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher (Visible in Form Mode) */}
        {step === "form" && (
          <div className="grid grid-cols-3 p-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center">
            <button
              onClick={() => setActiveTab("student_claim")}
              className={`py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === "student_claim"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="h-4 w-4 text-[#8B0014]" />
              <span>Student Claim</span>
            </button>
            <button
              onClick={() => setActiveTab("parent_link")}
              className={`py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === "parent_link"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4 text-amber-600" />
              <span>Parent Link</span>
            </button>
            <button
              onClick={() => setActiveTab("faculty_request")}
              className={`py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === "faculty_request"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Faculty Verification</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* STEP 1: FORMS */}
          {step === "form" && (
            <>
              {/* TAB 1: Student Claim Form */}
              {activeTab === "student_claim" && (
                <form onSubmit={handleStudentClaim} className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-[#8B0014]">
                      <FileText className="h-3.5 w-3.5" /> DepEd Learner Reference Number (LRN) Required
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Enter your official 12-digit LRN found on your SAPC Enrollment Slip or DepEd Form 138 report card.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">12-Digit LRN</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={lrn}
                      onChange={(e) => setLrn(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 109482719283"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Birthdate</label>
                      <input
                        type="date"
                        required
                        value={studentBirthDate}
                        onChange={(e) => setStudentBirthDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SAPC Student Email</label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="student@sapc.edu.ph"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Set Account Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || lrn.length < 5}
                    className="w-full py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? "Matching LRN Records..." : "Claim Student Account →"}
                  </button>
                </form>
              )}

              {/* TAB 2: Parent Link Form */}
              {activeTab === "parent_link" && (
                <form onSubmit={handleParentLink} className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-blue-900">
                      <Users className="h-3.5 w-3.5" /> Family Link & SMS Verification
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Link your parent/guardian profile with your child’s academic standing to receive attendance SMS notices and meeting invites.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Full Name</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Mrs. Elena Dimaculangan"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="0917-XXX-XXXX"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      >
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student's 12-Digit LRN</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={parentLrn}
                      onChange={(e) => setParentLrn(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter student's LRN"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? "Sending SMS OTP..." : "Request Parent OTP Verification →"}
                  </button>
                </form>
              )}

              {/* TAB 3: Faculty Verification Request */}
              {activeTab === "faculty_request" && (
                <form onSubmit={handleFacultyRequest} className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-emerald-900">
                      <ShieldCheck className="h-3.5 w-3.5" /> Institutional Faculty Verification
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Class advisers and registered guidance counselors undergo DepEd/PRC credential verification before accessing student records under RA 10173.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Faculty / Staff Full Name</label>
                    <input
                      type="text"
                      required
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
                      placeholder="e.g. Roberto Santos, LPT"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SAPC Faculty Email</label>
                      <input
                        type="email"
                        required
                        value={facultyEmail}
                        onChange={(e) => setFacultyEmail(e.target.value)}
                        placeholder="teacher@sapc.edu.ph"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Requested Role</label>
                      <select
                        value={facultyRole}
                        onChange={(e) => setFacultyRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                      >
                        <option value="teacher">Class Adviser (LPT)</option>
                        <option value="guidance_counselor">Guidance Counselor (RGC)</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Department / Strand</label>
                    <input
                      type="text"
                      required
                      value={facultyDept}
                      onChange={(e) => setFacultyDept(e.target.value)}
                      placeholder="e.g. Senior High School - STEM Strand"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#8B0014] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? "Submitting for Dean Approval..." : "Submit Faculty Verification Request →"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === "otp" && (
            <div className="space-y-6 text-center py-3">
              <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-[#8B0014]">
                <KeyRound className="h-7 w-7" />
              </div>

              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-lg font-black text-slate-900">Enter 6-Digit One-Time PIN</h4>
                <p className="text-xs text-slate-500">
                  We've sent a 6-digit verification code to your registered mobile number / email for authentication.
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-13 text-center text-xl font-mono font-black text-slate-900 bg-slate-50 border-2 border-slate-200 focus:border-[#8B0014] focus:bg-white rounded-xl focus:outline-none transition shadow-2xs"
                  />
                ))}
              </div>

              {/* Demo Helper */}
              <div className="p-2.5 rounded-xl bg-slate-100 text-xs text-slate-600 flex items-center justify-center gap-2">
                <span className="font-bold text-[#8B0014]">💡 Demo Sandbox:</span>
                <span>Click autofill to use PIN <strong className="font-mono text-slate-900">774-892</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp(["7", "7", "4", "8", "9", "2"])}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-300 font-bold text-slate-800 text-[11px] hover:bg-slate-50"
                >
                  Autofill
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting}
                  className="flex-2 py-3 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition"
                >
                  {isSubmitting ? "Verifying PIN..." : "Verify & Complete Onboarding →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "success" && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-xl font-black text-slate-900">Verification Successful!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your identity has been authenticated against official San Antonio de Padua College records under RA 10173 data privacy rules.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Institutional Status:</span>
                  <span className="font-bold text-emerald-700">Active & Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Authorized Role:</span>
                  <span className="font-bold text-slate-900 capitalize">{activeTab.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Academic Year:</span>
                  <span className="font-bold text-slate-900">AY 2025–2026 (Semester 2)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishAndEnter}
                className="w-full py-3.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-base shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Launch Interactive Portal Tour</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
          San Antonio de Padua College Guidance Office • RA 10173 Privacy Seal
        </div>

      </div>
    </div>
  );
};
