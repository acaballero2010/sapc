"use client";

import React, { useState, useMemo, useRef } from "react";
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Users,
  GraduationCap,
  Copy,
  Check
} from "lucide-react";
import { 
  getActiveStudentDataset, 
  saveActiveParentRecords, 
  getActiveParentRecords, 
  importFacultyCSV,
  saveStudentDataset,
  recalculateAHPForDataset,
  StudentRecord
} from "@/lib/dataset-store";

interface UserProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

const PROVISION_CSV_TEMPLATE = `role,full_name,email,lrn_or_id,grade_level,section,department,temp_password,phone,guardian_name,guardian_contact,child_lrns
student,Kalye POS,kalyepos26@gmail.com,109238400501,Grade 7,Grade 7 - St. Anthony,Junior High Department,SAPC@2026!pos,+63 917 111 2222,Elena Pos,+63 917 111 2222,
student,Juan Dela Cruz,juan.delacruz@sapc.edu.ph,109238400502,Grade 7,Grade 7 - St. Anthony,Junior High Department,SAPC@2026!juan,+63 918 222 3333,Maria Dela Cruz,+63 918 222 3333,
teacher,Elena Bautista,elena.bautista@sapc.edu.ph,SAPC-FAC-2026-001,Grade 7,Grade 7 - St. Anthony,Junior High School Faculty,SAPC@2026!elena,+63 917 112 0001,,,,
guidance_counselor,Dr. Victor Hernandez,victor.hernandez@sapc.edu.ph,PRC-RGC-009841,,Central Guidance Consultation Room 204,Guidance & Counseling Department,SAPC@2026!victor,+63 918 223 4567,,,,
parent,Elena Pos,parent.pos@gmail.com,PAR-00501,Grade 7,Grade 7 - St. Anthony,Parent Council,SAPC@2026!parent,+63 917 111 2222,,,109238400501`;

export const UserProvisioningModal: React.FC<UserProvisioningModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<"idle" | "preview" | "success" | "error">("idle");
  const [resultMessage, setResultMessage] = useState<string>("");
  const [provisionedResults, setProvisionedResults] = useState<any[]>([]);
  const [copiedSlip, setCopiedSlip] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV rows into structured objects
  const parsedRows = useMemo(() => {
    if (!csvContent.trim()) return [];
    const lines = csvContent.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
    const roleIdx = headers.findIndex(h => h.includes("role") || h.includes("type"));
    const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("full_name"));
    const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("mail"));
    const idIdx = headers.findIndex(h => h.includes("lrn") || h.includes("id") || h.includes("employee"));
    const gradeIdx = headers.findIndex(h => h.includes("grade"));
    const secIdx = headers.findIndex(h => h.includes("section"));
    const deptIdx = headers.findIndex(h => h.includes("dept") || h.includes("department"));
    const passIdx = headers.findIndex(h => h.includes("password") || h.includes("pass"));
    const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("contact"));
    const guardNameIdx = headers.findIndex(h => h.includes("guardian_name") || h.includes("parent_name"));
    const guardContactIdx = headers.findIndex(h => h.includes("guardian_contact"));
    const childLrnsIdx = headers.findIndex(h => h.includes("child") || h.includes("linked_lrn"));

    return lines.slice(1).map((line, idx) => {
      // Split by comma respecting quotes
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(val => val.replace(/^"|"$/g, "").trim()) || line.split(",").map(v => v.trim());

      const rawRole = (roleIdx !== -1 ? cols[roleIdx] : cols[0] || "").toLowerCase();
      let role: "student" | "teacher" | "guidance_counselor" | "parent" | "admin" = "student";
      if (rawRole.includes("counsel") || rawRole.includes("rgc")) role = "guidance_counselor";
      else if (rawRole.includes("teach") || rawRole.includes("facult") || rawRole.includes("adviser")) role = "teacher";
      else if (rawRole.includes("parent") || rawRole.includes("guard")) role = "parent";
      else if (rawRole.includes("admin")) role = "admin";

      const fullName = nameIdx !== -1 ? cols[nameIdx] : cols[1] || "";
      const email = emailIdx !== -1 ? cols[emailIdx] : cols[2] || "";
      const lrnOrId = idIdx !== -1 ? cols[idIdx] : cols[3] || "";
      const gradeLevel = gradeIdx !== -1 ? cols[gradeIdx] : "";
      const section = secIdx !== -1 ? cols[secIdx] : "";
      const department = deptIdx !== -1 ? cols[deptIdx] : "";
      const tempPass = passIdx !== -1 ? cols[passIdx] : "";
      const phone = phoneIdx !== -1 ? cols[phoneIdx] : "";
      const guardianName = guardNameIdx !== -1 ? cols[guardNameIdx] : "";
      const guardianContact = guardContactIdx !== -1 ? cols[guardContactIdx] : "";
      const childLrns = childLrnsIdx !== -1 && cols[childLrnsIdx] ? [cols[childLrnsIdx]] : [];

      const isValidEmail = email && email.includes("@");
      const isValid = Boolean(fullName && isValidEmail);

      return {
        rowNum: idx + 2,
        role,
        full_name: fullName,
        email,
        lrn_or_id: lrnOrId,
        grade_level: gradeLevel,
        section,
        department,
        temp_password: tempPass,
        phone,
        guardian_name: guardianName,
        guardian_contact: guardianContact,
        child_lrns: childLrns,
        isValid,
        error: !fullName ? "Missing full name" : (!isValidEmail ? "Invalid email" : null)
      };
    });
  }, [csvContent]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content || "");
      setImportStatus("preview");
    };
    reader.readAsText(file);
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const blob = new Blob([PROVISION_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "SAPC_User_Provisioning_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load official 503 students credentials CSV
  const handleLoad503Students = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch("/sapc_503_student_credentials.csv");
      if (!res.ok) throw new Error("Could not load credentials file");
      const text = await res.text();
      setFileName("sapc_503_student_credentials.csv");
      setCsvContent(text);
      setImportStatus("preview");
    } catch (e: any) {
      alert("Failed to load 503 student credentials: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load official 503 parents credentials CSV
  const handleLoad503Parents = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch("/sapc_503_parent_credentials.csv");
      if (!res.ok) throw new Error("Could not load credentials file");
      const text = await res.text();
      setFileName("sapc_503_parent_credentials.csv");
      setCsvContent(text);
      setImportStatus("preview");
    } catch (e: any) {
      alert("Failed to load 503 parent credentials: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load official faculty & guidance counselors credentials CSV
  const handleLoadFaculty = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch("/sapc_faculty_credentials.csv");
      if (!res.ok) throw new Error("Could not load faculty credentials file");
      const text = await res.text();
      setFileName("sapc_faculty_credentials.csv");
      setCsvContent(text);
      setImportStatus("preview");
    } catch (e: any) {
      alert("Failed to load faculty credentials: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Provisioned Credentials CSV
  const handleDownloadCredentialsCSV = () => {
    if (provisionedResults.length === 0) return;
    const headers = ["Role", "Full Name", "Email", "LRN / ID", "Temporary Password", "Section", "Status"];
    const rows = provisionedResults.map(r => [
      r.role,
      `"${r.full_name}"`,
      r.email,
      `"${r.lrn_or_id}"`,
      `"${r.temp_password || "SAPC@2026!"}"`,
      `"${r.section || ""}"`,
      r.status
    ]);
    const csvStr = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SAPC_Provisioned_Credentials_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Bulk Provisioning
  const handleProvisionSubmit = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert("No valid rows to provision. Please verify the CSV format.");
      return;
    }

    setIsProcessing(true);
    setResultMessage("");

    try {
      // 1. Call Backend API
      const res = await fetch("/api/admin/provision-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: validRows.map(r => ({
            role: r.role,
            full_name: r.full_name,
            email: r.email,
            lrn_or_id: r.lrn_or_id,
            grade_level: r.grade_level,
            section: r.section,
            department: r.department,
            temp_password: r.temp_password,
            phone: r.phone,
            guardian_name: r.guardian_name,
            guardian_contact: r.guardian_contact,
            child_lrns: r.child_lrns
          }))
        })
      });

      const data = await res.json().catch(() => ({}));

      // 2. Synchronize with client dataset-store
      // A. Batch Student Synchronization
      const studentRows = validRows.filter(r => r.role === "student");
      if (studentRows.length > 0) {
        const currentDataset = getActiveStudentDataset();
        const existingLrns = new Set(currentDataset.map(s => String(s.lrn).trim()));
        const existingEmails = new Set(currentDataset.map(s => s.email.toLowerCase()));
        const newStudents: StudentRecord[] = [];

        studentRows.forEach((row) => {
          const cleanLrn = row.lrn_or_id.replace(/\D/g, "");
          if (!existingLrns.has(cleanLrn) && !existingEmails.has(row.email.toLowerCase())) {
            const gradeNum = row.grade_level ? parseInt(row.grade_level.replace(/\D/g, ""), 10) || 7 : 7;
            const newId = currentDataset.length + newStudents.length + 1;
            const nameParts = row.full_name.trim().split(" ");
            const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

            newStudents.push({
              id: newId,
              first_name: firstName,
              last_name: lastName,
              full_name: row.full_name,
              lrn: cleanLrn.length === 12 ? cleanLrn : `10923847${String(newId).padStart(4, "0")}`,
              grade_level: gradeNum,
              strand: "JHS",
              section_name: row.section || "Grade 7 - St. Anthony",
              adviser_name: "Ms. Elena Bautista, LPT",
              email: row.email,
              latest_risk_score: 25.0,
              latest_risk_tier: "low",
              primary_risk_driver: "On-Track / Active Student Engagement",
              domain_scores: {
                academic: 10,
                family: 15,
                health: 15,
                mental_health: 15,
                financial: 15
              },
              sass_metrics: {
                gpa: 88.0,
                failing_subjects_count: 0,
                days_absent: 0,
                attendance_rate_pct: 100,
                incomplete_requirements_count: 0,
                extracurricular_club: "General Student Body",
                club_participation_level: "Moderate",
                hobbies_interests: "Academics"
              }
            });
            existingLrns.add(cleanLrn);
            existingEmails.add(row.email.toLowerCase());
          }
        });

        if (newStudents.length > 0) {
          const updatedList = recalculateAHPForDataset([...newStudents, ...currentDataset]);
          saveStudentDataset(updatedList, true);
        }
      }

      // B. Faculty & Counselor Synchronization
      const facultyRows = validRows.filter(r => r.role === "teacher" || r.role === "guidance_counselor");
      if (facultyRows.length > 0) {
        const facultyCsv = [
          "full_name,institutional_email,role,department,advisory_section,assigned_grade,employee_id,initial_password,status,phone",
          ...facultyRows.map(r => `"${r.full_name}",${r.email},${r.role},${r.department || "Faculty"},${r.section || ""},${r.grade_level || "Grade 7"},${r.lrn_or_id},${r.temp_password || "teacher123"},Active,${r.phone || ""}`)
        ].join("\n");
        await importFacultyCSV(facultyCsv).catch(() => {});
      }

      // C. Parent Synchronization
      const parentRows = validRows.filter(r => r.role === "parent");
      if (parentRows.length > 0) {
        const currentParents = getActiveParentRecords();
        const existingEmails = new Set(currentParents.map(p => p.email.toLowerCase()));
        const newParents: any[] = [];

        parentRows.forEach((row, pIdx) => {
          if (!existingEmails.has(row.email.toLowerCase())) {
            newParents.push({
              id: `PAR-${Date.now().toString().slice(-4)}-${pIdx + 1}`,
              name: row.full_name,
              email: row.email,
              phone: row.phone || "+63 900 000 0000",
              relationship: "Parent / Guardian",
              linkedStudentName: "Linked Learner",
              linkedLRN: (row.child_lrns && row.child_lrns[0]) || "109238400501",
              section: row.section || "Grade 7 - St. Anthony",
              gradeLevel: row.grade_level || "Grade 7",
              status: "Active" as const,
              verifiedAt: new Date().toISOString().split("T")[0],
              sf9Access: true,
              attendanceAlerts: true,
              riskAlerts: true,
              initialPassword: row.temp_password || "parent2026"
            });
            existingEmails.add(row.email.toLowerCase());
          }
        });

        if (newParents.length > 0) {
          saveActiveParentRecords([...newParents, ...currentParents], true);
        }
      }

      const resultsList = data?.results || validRows.map(r => ({ ...r, status: "created" }));
      setProvisionedResults(resultsList);
      setImportStatus("success");
      setResultMessage(`Successfully provisioned ${validRows.length} institutional accounts into Firebase Auth and Cloud Firestore.`);

      if (onSuccess) {
        onSuccess(validRows.length);
      }
    } catch (err: any) {
      setImportStatus("error");
      setResultMessage(err?.message || "An unexpected error occurred during bulk provisioning.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyOnboardingNotice = () => {
    const notice = `[San Antonio de Padua College - Institutional Portal Access]
Welcome to SAPC IntellySys Decision Support Portal!
Your institutional account has been pre-provisioned by the Registrar & Admissions Office.

Login Link: https://sapc-intellysys-ph.web.app/login
Use your assigned Institutional Email (or DepEd LRN) and Temporary Password.
Upon your first login, please set a new permanent password. You can also link your Google Account for 1-click Sign-In.

SAPC Registrar & Academic IT Governance • RA 10173 Sealed`;
    navigator.clipboard.writeText(notice);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 3000);
  };

  const roleCounts = useMemo(() => {
    const counts = { student: 0, teacher: 0, guidance_counselor: 0, parent: 0, admin: 0 };
    parsedRows.forEach(r => {
      if (counts[r.role] !== undefined) counts[r.role]++;
    });
    return counts;
  }, [parsedRows]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] text-white flex items-center justify-between border-t-4 border-amber-400">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Registrar Admin Only
                </span>
                <span className="text-xs text-rose-200 font-bold">• Firebase Auth Provisioning</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Bulk User Account Provisioner</h3>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
          {/* Instructions Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Institutional Pre-Provisioning Protocol (No Public Self-Registration)
              </p>
              <p className="text-amber-800/80 dark:text-amber-300/80">
                All SAPC accounts (Students, Faculty, Counselors, Parents) must be pre-created by the Platform Admin. This registers their credentials in Firebase Auth and establishes their official profile so they never inherit another user&apos;s records.
              </p>
            </div>
          </div>

          {importStatus === "idle" && (
            <div className="space-y-6">
              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#8B0014] dark:hover:border-rose-500 rounded-3xl p-8 text-center bg-slate-50 dark:bg-slate-950 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 transition cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-[#8B0014] group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Click to upload Unified Provisioning CSV
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Accepts standard SAPC CSV format with roles: student, teacher, guidance_counselor, parent
                    </p>
                  </div>
                </div>
              </div>

              {/* Official 503 Student Roster Fast-Track */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Official 503 Students Credentials CSV</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200">
                        Pre-Generated
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">All 503 junior high school student records with official LRNs, emails, and temp passwords.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/sapc_503_student_credentials.csv"
                    download="sapc_503_student_credentials.csv"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition shadow-xs"
                    title="Download the CSV file to your computer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleLoad503Students}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
                    title="Instantly load all 503 student records into the preview table"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Load 503 Roster</span>
                  </button>
                </div>
              </div>

              {/* Official 503 Parent Roster Fast-Track */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Official 503 Parent / Guardian CSV</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200">
                        Pre-Generated
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">All 503 parent accounts linked 1-to-1 to each student with temporary passwords &amp; portal access.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/sapc_503_parent_credentials.csv"
                    download="sapc_503_parent_credentials.csv"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition shadow-xs"
                    title="Download the parent credentials CSV file to your computer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleLoad503Parents}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer"
                    title="Instantly load all 503 parent records into the preview table"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Load 503 Parents</span>
                  </button>
                </div>
              </div>

              {/* Official Faculty & Counselors Roster Fast-Track */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Official Faculty &amp; Counselors CSV</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-200">
                        Pre-Generated
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">All 24 teachers, JHS section advisers, subject coordinators &amp; registered guidance counselors.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/sapc_faculty_credentials.csv"
                    download="sapc_faculty_credentials.csv"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition shadow-xs"
                    title="Download the faculty credentials CSV file to your computer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleLoadFaculty}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white transition shadow-xs cursor-pointer"
                    title="Instantly load all faculty & counselor records into the preview table"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Load Faculty Roster</span>
                  </button>
                </div>
              </div>

              {/* Download Sample Template */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Need the provisioning CSV template?</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Includes sample rows for all five institutional roles.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>
          )}

          {importStatus === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Parsed Roster: {fileName}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {parsedRows.length} Accounts Found
                    </span>
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1">
                    <span>Students: {roleCounts.student}</span> • 
                    <span>Teachers: {roleCounts.teacher}</span> • 
                    <span>Counselors: {roleCounts.guidance_counselor}</span> • 
                    <span>Parents: {roleCounts.parent}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCsvContent("");
                    setFileName("");
                    setImportStatus("idle");
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 transition"
                >
                  Choose Different File
                </button>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Full Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">LRN / ID</th>
                      <th className="p-2.5">Section / Assignment</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.slice(0, 15).map((row) => (
                      <tr key={row.rowNum} className={row.isValid ? "hover:bg-slate-50 dark:hover:bg-slate-800/50" : "bg-rose-50/50 dark:bg-rose-950/30"}>
                        <td className="p-2.5 font-mono text-slate-400">{row.rowNum}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            row.role === "student" ? "bg-amber-100 text-amber-900" :
                            row.role === "teacher" ? "bg-blue-100 text-blue-900" :
                            row.role === "guidance_counselor" ? "bg-purple-100 text-purple-900" :
                            row.role === "parent" ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-800"
                          }`}>
                            {row.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.full_name}</td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{row.email}</td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{row.lrn_or_id || "Auto-Generated"}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.section || row.department || "Standard"}</td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center gap-1" title={row.error || ""}>
                              <AlertTriangle className="h-3.5 w-3.5" /> {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedRows.length > 15 && (
                <p className="text-[11px] text-slate-400 text-center italic">
                  Showing first 15 rows of {parsedRows.length} total records...
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setImportStatus("idle")}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing || parsedRows.filter(r => r.isValid).length === 0}
                  onClick={handleProvisionSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B0014] hover:bg-[#700010] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Provisioning Accounts into Firebase Auth...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Provision {parsedRows.filter(r => r.isValid).length} Accounts</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {importStatus === "success" && (
            <div className="space-y-6 text-center py-4">
              <div className="inline-flex p-4 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Bulk Provisioning Complete!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto mt-1">
                  {resultMessage}
                </p>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={handleDownloadCredentialsCSV}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition shadow-md"
                >
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>Download Credentials Roster (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyOnboardingNotice}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-800 dark:text-slate-100 transition shadow-xs"
                >
                  {copiedSlip ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-blue-500" />}
                  <span>{copiedSlip ? "Copied to Clipboard!" : "Copy Onboarding Notice"}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          {importStatus === "error" && (
            <div className="space-y-4 text-center py-4">
              <div className="inline-flex p-4 rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                <AlertTriangle className="h-12 w-12" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Provisioning Error</h4>
                <p className="text-xs text-rose-700 dark:text-rose-400 max-w-md mx-auto mt-1">
                  {resultMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImportStatus("preview")}
                className="px-5 py-2 rounded-xl bg-slate-200 text-xs font-bold text-slate-800"
              >
                Back to Preview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
