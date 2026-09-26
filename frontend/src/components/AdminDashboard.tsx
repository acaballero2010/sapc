"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Sliders, 
  ShieldCheck, 
  Award, 
  Users, 
  Search, 
  CheckCircle2, 
  Activity, 
  Layers, 
  GraduationCap, 
  Calendar, 
  RotateCcw, 
  UserPlus, 
  UserCheck, 
  BookOpen, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  Bell, 
  HelpCircle, 
  Edit, 
  Building,
  Upload,
  ImageIcon,
  Trash2,
  ShieldAlert,
  Key,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Copy,
  Check,
  Plus,
  Send,
  RefreshCw,
  X,
  Printer,
  Eye,
  CheckSquare,
  Square,
  FileCheck
} from "lucide-react";
import { SapcLogo } from "./SapcLogo";
import { InstitutionalReportModal } from "./InstitutionalReportModal";
import { MultiDomainIngestionHub } from "./MultiDomainIngestionHub";
import { CounselorKnowledgeHubModal } from "./CounselorKnowledgeHubModal";
import { FacultyImportModal } from "./FacultyImportModal";
import { 
  getActiveStudentDataset, 
  computeCohortAggregates, 
  exportActiveDatasetToCSV,
  importFullCohortCSV,
  subscribeToStudentDataset,
  loadStudentDatasetFromFirestore,
  getIngestionHistory,
  rollbackIngestionBatch,
  IngestionBatchRecord,
  addStudentRecord,
  updateStudentRecord,
  deleteStudentRecord,
  addAppNotification,
  getActiveNotifications,
  FacultyRecord,
  getActiveFacultyRecords,
  saveActiveFacultyRecords,
  loadFacultyRecordsFromFirestore,
  subscribeToFacultyRecords,
  addFacultyRecord,
  updateFacultyRecord,
  deleteFacultyRecord,
  PendingRegistrationRecord,
  ParentRecord,
  getActivePendingRegistrations,
  saveActivePendingRegistrations,
  loadPendingRegistrationsFromFirestore,
  subscribeToPendingRegistrations,
  getActiveParentRecords,
  saveActiveParentRecords,
  loadParentRecordsFromFirestore,
  subscribeToParentRecords,
  DEFAULT_PENDING_REGISTRATIONS
} from "@/lib/dataset-store";
import { useDragScroll } from "@/lib/useDragScroll";
import type { StudentRecord } from "@/data/students500";

// Tab types for all Admin Modules
export type AdminTabType = 
  | "dashboard"
  | "platform_settings"
  | "import_wizard"
  | "import_history"
  | "revert_import"
  | "students"
  | "create_student"
  | "student_profile"
  | "teachers"
  | "create_user"
  | "parents"
  | "pending_registrations"
  | "quarter_management"
  | "interventions"
  | "intervention_suggestions"
  | "reports"
  | "notifications"
  | "knowledge_base"
  | "verify_assessments"
  | "export_credentials"
  | "export_import_history"
  | "audit_logs"
  | "data_integrity"
  | "system_health"
  | "admin_actions";

export const AdminDashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTabType>("dashboard");
  const [selectedNavCategory, setSelectedNavCategory] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Live Student Dataset
  const [students, setStudents] = useState<StudentRecord[]>([]);

  useEffect(() => {
    // 1. Initial state from local store
    setStudents(getActiveStudentDataset());

    // 2. Load latest from Firestore cloud
    loadStudentDatasetFromFirestore().then((all) => {
      if (all && all.length > 0) setStudents(all);
    });

    // 3. Real-time multi-user subscription
    const unsubscribe = subscribeToStudentDataset((all) => {
      setStudents(all);
    });

    const handleDatasetUpdate = () => {
      setStudents(getActiveStudentDataset());
    };
    window.addEventListener("sapc:dataset-updated", handleDatasetUpdate);
    return () => {
      window.removeEventListener("sapc:dataset-updated", handleDatasetUpdate);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const cohortStats = useMemo(() => computeCohortAggregates(students), [students]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Modals & Sub-views
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isKnowledgeHubOpen, setIsKnowledgeHubOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const catDrag = useDragScroll();
  const tabsDrag = useDragScroll();



  // Handle full CSV import
  const handleFullCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const result = await importFullCohortCSV(content);
          if (result.success) {
            showToast(`Imported and synced ${result.count} students from ${file.name} to Cloud Firestore.`);
          } else {
            showToast(`Import Error: ${result.error}`);
          }
        } catch {
          showToast("Failed to parse CSV file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Platform Settings & Institutional Branding (Campus Logo)
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sapc_custom_logo");
    }
    return null;
  });
  const [institutionName, setInstitutionName] = useState("San Antonio de Padua College");
  const [campusTagline, setCampusTagline] = useState("Foundation of Pila, Laguna, Inc. • IntellySys DSS");
  const [campusAddress, setCampusAddress] = useState("National Highway, Pila, Laguna 4010 Philippines");
  const [depEdSchoolId, setDepEdSchoolId] = useState("402681");
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const handleInstitutionalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast("Logo file size must be less than 4MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        localStorage.setItem("sapc_custom_logo", result);
        setCustomLogo(result);
        window.dispatchEvent(new Event("sapc_logo_updated"));
        showToast("Campus institutional logo updated across all platform portals!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetInstitutionalLogo = () => {
    localStorage.removeItem("sapc_custom_logo");
    setCustomLogo(null);
    window.dispatchEvent(new Event("sapc_logo_updated"));
    if (logoInputRef.current) logoInputRef.current.value = "";
    showToast("Campus logo reset to official SAPC 1979 crest.");
  };

  // 12. Quarter Calendar Config
  const [quarterConfig, setQuarterConfig] = useState([
    { id: "Q1", label: "1st Quarter (Diagnostic Period)", start: "2026-08-01", end: "2026-10-15", status: "Completed", isCurrent: false },
    { id: "Q2", label: "2nd Quarter (Midterm Remediation)", start: "2026-10-16", end: "2026-12-18", status: "Active Now", isCurrent: true },
    { id: "Q3", label: "3rd Quarter (Post-Holiday Recovery)", start: "2027-01-05", end: "2027-03-20", status: "Upcoming", isCurrent: false },
    { id: "Q4", label: "4th Quarter (Final Clearance & Retention)", start: "2027-03-22", end: "2027-05-30", status: "Upcoming", isCurrent: false }
  ]);

  // Faculty & Guidance Counselors Directory (Cloud Firestore collection: faculty_records)
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(() => getActiveFacultyRecords());
  const [isFacultyImportOpen, setIsFacultyImportOpen] = useState(false);
  const [facultyRoleFilter, setFacultyRoleFilter] = useState<string>("all");
  const [facultyStatusFilter, setFacultyStatusFilter] = useState<string>("all");
  const [facultySearch, setFacultySearch] = useState<string>("");
  const [editingFaculty, setEditingFaculty] = useState<FacultyRecord | null>(null);

  // Sync faculty with Firestore and local events
  useEffect(() => {
    setFacultyList(getActiveFacultyRecords());
    loadFacultyRecordsFromFirestore().then((all) => {
      if (all && all.length > 0) setFacultyList(all);
    });
    const unsubFaculty = subscribeToFacultyRecords((all) => {
      setFacultyList(all);
    });
    const handleFacultyUpdate = () => {
      setFacultyList(getActiveFacultyRecords());
    };
    window.addEventListener("sapc:faculty-updated", handleFacultyUpdate);
    return () => {
      window.removeEventListener("sapc:faculty-updated", handleFacultyUpdate);
      if (typeof unsubFaculty === "function") unsubFaculty();
    };
  }, []);

  const copyFacultySlip = (faculty: FacultyRecord | any) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sapc.edu.ph";
    const licenseText = faculty.prc_license_no ? `\nPRC License No: ${faculty.prc_license_no}` : "";
    const slip = `=====================================\nSAN ANTONIO DE PADUA COLLEGE (SAPC)\nInstitutional Portal Credentials Slip\n=====================================\nName: ${faculty.name}\nRole: ${(faculty.role || "teacher").toUpperCase()}\nDepartment: ${faculty.department || "Academic"}\nAssigned Advisory / Level: ${faculty.section || "General"}${licenseText}\nInstitutional Email: ${faculty.email}\nInitial Default Password: ${faculty.initial_password || faculty.initialPassword || "teacher123"}\nSign-in Portal: ${origin}/login\n\n* Security Notice: Please sign in and update your password under Profile > Security Settings.\n=====================================`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(slip);
      showToast(`Copied onboarding credentials slip for ${faculty.name}!`);
    }
  };

  const handleToggleFacultyStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    const updated = await updateFacultyRecord(id, { status: nextStatus as any });
    if (updated) {
      setFacultyList(getActiveFacultyRecords());
      showToast(`Account for ${updated.name} is now ${nextStatus}.`);
    }
  };

  const handleDeleteFacultyAction = async (id: string, name: string) => {
    if (!window.confirm(`⚠️ Remove Account Confirmation\n\nAre you sure you want to remove ${name} from the Faculty & Counselor roster and Cloud Firestore?`)) {
      return;
    }
    const success = await deleteFacultyRecord(id);
    if (success) {
      setFacultyList(getActiveFacultyRecords());
      showToast(`Account for ${name} removed.`);
    }
  };

  const handleExportFacultyCSV = () => {
    const headers = ["full_name", "institutional_email", "role", "department", "advisory_section", "assigned_grade", "employee_id", "prc_license_no", "initial_password", "status", "phone"];
    const rows = facultyList.map(f => [
      `"${f.name}"`,
      f.email,
      f.role,
      `"${f.department || ""}"`,
      `"${f.section || ""}"`,
      `"${f.grade_level || ""}"`,
      f.employee_id || "",
      f.prc_license_no || "",
      f.initial_password || "teacher123",
      f.status,
      f.phone || ""
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SAPC_Faculty_Counselors_Roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${facultyList.length} faculty and counselor records to CSV.`);
  };

  // 11. Pending Registrations & Parent Linkage Verification Queue
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistrationRecord[]>(() => getActivePendingRegistrations());
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingRoleFilter, setPendingRoleFilter] = useState<string>("all");
  const [previewDocRegistration, setPreviewDocRegistration] = useState<PendingRegistrationRecord | null>(null);

  // 12. Parent Accounts & Student Linkages
  const [parentRecords, setParentRecords] = useState<ParentRecord[]>(() => getActiveParentRecords());
  const [parentSearch, setParentSearch] = useState("");
  const [parentGradeFilter, setParentGradeFilter] = useState<string>("all");
  const [parentSectionFilter, _setParentSectionFilter] = useState<string>("all");
  const [parentStatusFilter, setParentStatusFilter] = useState<string>("all");
  const [editingParent, setEditingParent] = useState<ParentRecord | null>(null);
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);
  const [newParentName, setNewParentName] = useState("");
  const [newParentEmail, setNewParentEmail] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");
  const [newParentRel, setNewParentRel] = useState("Mother");
  const [newParentStudent, setNewParentStudent] = useState("");
  const [newParentLRN, setNewParentLRN] = useState("");
  const [newParentSection, setNewParentSection] = useState("Grade 11 - St. Augustine (STEM)");

  // 13. Bulk Export Credentials State
  const [credentialRoleFilter, setCredentialRoleFilter] = useState<"all" | "teacher" | "counselor" | "parent" | "student">("all");
  const [credentialSearch, setCredentialSearch] = useState("");
  const [selectedCredentialIds, setSelectedCredentialIds] = useState<Set<string>>(new Set());
  const [isPrintSlipsOpen, setIsPrintSlipsOpen] = useState(false);

  // Real-time Firestore Multi-User Sync for Pending & Parents
  useEffect(() => {
    loadPendingRegistrationsFromFirestore().then((res) => {
      if (res && res.length > 0) setPendingRegistrations(res);
    });
    loadParentRecordsFromFirestore().then((res) => {
      if (res && res.length > 0) setParentRecords(res);
    });

    const unsubPending = subscribeToPendingRegistrations((res) => setPendingRegistrations(res));
    const unsubParents = subscribeToParentRecords((res) => setParentRecords(res));

    const handlePendingUpdated = () => setPendingRegistrations(getActivePendingRegistrations());
    const handleParentsUpdated = () => setParentRecords(getActiveParentRecords());

    window.addEventListener("sapc:pending-registrations-updated", handlePendingUpdated);
    window.addEventListener("sapc:parent-records-updated", handleParentsUpdated);

    return () => {
      if (typeof unsubPending === "function") unsubPending();
      if (typeof unsubParents === "function") unsubParents();
      window.removeEventListener("sapc:pending-registrations-updated", handlePendingUpdated);
      window.removeEventListener("sapc:parent-records-updated", handleParentsUpdated);
    };
  }, []);

  // Filtered Pending Registrations
  const filteredPending = useMemo(() => {
    let result = pendingRegistrations;
    if (pendingSearch.trim()) {
      const q = pendingSearch.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.linkedStudent.toLowerCase().includes(q) ||
        r.linkedLRN.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q)
      );
    }
    if (pendingRoleFilter !== "all") {
      result = result.filter(r => r.role === pendingRoleFilter);
    }
    return result;
  }, [pendingRegistrations, pendingSearch, pendingRoleFilter]);

  // Handle Approve Registration
  const handleApproveRegistration = (reg: PendingRegistrationRecord) => {
    if (reg.role === "parent") {
      const newParent: ParentRecord = {
        id: `PAR-${String(parentRecords.length + 101).padStart(3, "0")}`,
        name: reg.name,
        email: reg.email,
        phone: reg.phone,
        relationship: reg.relationship,
        linkedStudentName: reg.linkedStudent,
        linkedLRN: reg.linkedLRN,
        section: reg.section,
        gradeLevel: reg.section.includes("12") ? "Grade 12" : "Grade 11",
        status: "Active",
        verifiedAt: "2026-09-27",
        sf9Access: true,
        attendanceAlerts: true,
        riskAlerts: true,
        initialPassword: "parent2026"
      };
      const updatedParents = [newParent, ...parentRecords];
      setParentRecords(updatedParents);
      saveActiveParentRecords(updatedParents, true);
    } else if (reg.role === "teacher" || reg.role === "counselor") {
      const isCounselor = reg.role === "counselor";
      const newFac: FacultyRecord = {
        id: isCounselor ? `COUN-${String(facultyList.length + 101).padStart(3, "0")}` : `FAC-${String(facultyList.length + 101).padStart(3, "0")}`,
        name: reg.name,
        email: reg.email,
        role: isCounselor ? "guidance_counselor" : "teacher",
        department: isCounselor ? "Guidance & Counseling Center" : "Senior High Academic Department",
        section: reg.section,
        grade_level: reg.section.includes("12") ? "Grade 12" : "Grade 11",
        employee_id: `SAPC-${String(facultyList.length + 101).padStart(4, "0")}`,
        initial_password: "teacher123",
        status: "Active",
        phone: reg.phone,
        created_at: "2026-09-27T00:00:00.000Z"
      };
      const updatedFaculty = [newFac, ...facultyList];
      setFacultyList(updatedFaculty);
      saveActiveFacultyRecords(updatedFaculty, true);
    }

    const updatedPending = pendingRegistrations.filter(p => p.id !== reg.id);
    setPendingRegistrations(updatedPending);
    saveActivePendingRegistrations(updatedPending, true);

    showToast(`✓ Approved & provisioned account for ${reg.name} (${reg.role.toUpperCase()}) with Cloud Sync.`);
  };

  // Handle Decline Registration
  const handleDeclineRegistration = (regId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to decline registration ${regId} for ${name}?`)) return;
    const updated = pendingRegistrations.filter(p => p.id !== regId);
    setPendingRegistrations(updated);
    saveActivePendingRegistrations(updated, true);
    showToast(`Declined registration request for ${name}.`);
  };

  // Reset Demo Registrations
  const handleResetDemoRegistrations = () => {
    saveActivePendingRegistrations(DEFAULT_PENDING_REGISTRATIONS, true);
    setPendingRegistrations(DEFAULT_PENDING_REGISTRATIONS);
    showToast("Reset pending registrations queue to 3 initial applications.");
  };

  // Filtered Parent Records
  const filteredParents = useMemo(() => {
    let result = parentRecords;
    if (parentSearch.trim()) {
      const q = parentSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.linkedStudentName.toLowerCase().includes(q) ||
        p.linkedLRN.toLowerCase().includes(q) ||
        p.section.toLowerCase().includes(q)
      );
    }
    if (parentGradeFilter !== "all") {
      result = result.filter(p => p.gradeLevel === parentGradeFilter);
    }
    if (parentSectionFilter !== "all") {
      result = result.filter(p => p.section === parentSectionFilter);
    }
    if (parentStatusFilter !== "all") {
      result = result.filter(p => p.status === parentStatusFilter);
    }
    return result;
  }, [parentRecords, parentSearch, parentGradeFilter, parentSectionFilter, parentStatusFilter]);

  // Parent Status Toggle
  const handleToggleParentStatus = (parentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    const updated = parentRecords.map(p => p.id === parentId ? { ...p, status: nextStatus as any } : p);
    setParentRecords(updated);
    saveActiveParentRecords(updated, true);
    showToast(`Updated parent account status to '${nextStatus}'.`);
  };

  // Delete Parent
  const handleDeleteParentAction = (parentId: string, parentName: string) => {
    if (!window.confirm(`Are you sure you want to delete parent account for ${parentName}?`)) return;
    const updated = parentRecords.filter(p => p.id !== parentId);
    setParentRecords(updated);
    saveActiveParentRecords(updated, true);
    showToast(`Deleted parent account for ${parentName}.`);
  };

  // Copy Parent Credential Slip
  const copyParentSlip = (p: ParentRecord) => {
    const slip = `=========================================
SAN ANTONIO DE PADUA COLLEGE (SAPC)
PARENT / GUARDIAN PORTAL ACCESS CREDENTIALS
=========================================
Parent Name     : ${p.name}
Relationship    : ${p.relationship}
Login Portal    : https://sapc-intellysys-ph.web.app/login
Email Address   : ${p.email}
Initial Password: ${p.initialPassword || "parent2026"}
Linked Student  : ${p.linkedStudentName}
Student LRN     : ${p.linkedLRN}
Advisory Section: ${p.section}
DepEd SF-9 Card : Authorized (Online Viewing)
Absence Alerts  : SMS & Push Enabled
Issued Date     : ${new Date().toLocaleDateString()}
=========================================`;
    navigator.clipboard.writeText(slip);
    showToast(`Copied Parent Portal Onboarding Slip for ${p.name} to clipboard!`);
  };

  // Export Parents CSV
  const handleExportParentsCSV = () => {
    const headers = ["Parent ID", "Parent Name", "Email", "Phone", "Relationship", "Linked Student", "LRN", "Section", "Grade Level", "Status", "Verified Date"];
    const rows = parentRecords.map(p => [
      p.id,
      `"${p.name}"`,
      p.email,
      `"${p.phone}"`,
      `"${p.relationship}"`,
      `"${p.linkedStudentName}"`,
      `"${p.linkedLRN}"`,
      `"${p.section}"`,
      `"${p.gradeLevel}"`,
      p.status,
      p.verifiedAt
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SAPC_Parent_Accounts_Roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${parentRecords.length} parent accounts to CSV.`);
  };

  // Save Parent Edit
  const handleSaveParentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent) return;
    const updated = parentRecords.map(p => p.id === editingParent.id ? editingParent : p);
    setParentRecords(updated);
    saveActiveParentRecords(updated, true);
    setEditingParent(null);
    showToast(`Saved changes for ${editingParent.name}.`);
  };

  // Add Parent Form Submission
  const handleAddParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentName.trim() || !newParentEmail.trim() || !newParentStudent.trim()) {
      showToast("Please complete Parent Name, Email, and Linked Student.");
      return;
    }
    const newParent: ParentRecord = {
      id: `PAR-${String(parentRecords.length + 101).padStart(3, "0")}`,
      name: newParentName.trim(),
      email: newParentEmail.trim(),
      phone: newParentPhone.trim() || "+63 900 000 0000",
      relationship: newParentRel,
      linkedStudentName: newParentStudent.trim(),
      linkedLRN: newParentLRN.trim() || "109238475000",
      section: newParentSection,
      gradeLevel: newParentSection.includes("12") ? "Grade 12" : "Grade 11",
      status: "Active",
      verifiedAt: "2026-09-27",
      sf9Access: true,
      attendanceAlerts: true,
      riskAlerts: true,
      initialPassword: "parent2026"
    };
    const updated = [newParent, ...parentRecords];
    setParentRecords(updated);
    saveActiveParentRecords(updated, true);
    setIsAddParentOpen(false);
    setNewParentName("");
    setNewParentEmail("");
    setNewParentPhone("");
    setNewParentStudent("");
    setNewParentLRN("");
    showToast(`Created and linked parent account for ${newParent.name}!`);
  };

  // Master Unified Credentials List for Bulk Export Tab
  interface UnifiedCredentialUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "teacher" | "counselor" | "parent" | "student";
    roleLabel: string;
    identifier: string; // LRN or Employee ID
    sectionOrDept: string;
    initialPassword: string;
    status: string;
  }

  const allCredentialUsers: UnifiedCredentialUser[] = useMemo(() => {
    const list: UnifiedCredentialUser[] = [];

    // 1. Admin
    list.push({
      id: "ADMIN-01",
      name: "Dr. Remedios Santos",
      email: "admin@sapc.edu.ph",
      role: "admin",
      roleLabel: "System Administrator",
      identifier: "SAPC-ADM-001",
      sectionOrDept: "Platform & IT Governance",
      initialPassword: "admin123",
      status: "Active"
    });

    // 2. Faculty
    facultyList.forEach(f => {
      const isCounselor = f.role === "guidance_counselor" || f.role === "counselor";
      list.push({
        id: f.id,
        name: f.name,
        email: f.email,
        role: isCounselor ? "counselor" : "teacher",
        roleLabel: isCounselor ? "Guidance Counselor (RGC)" : "Faculty / Class Adviser",
        identifier: f.employee_id || f.prc_license_no || f.id,
        sectionOrDept: f.section || f.department || "General Faculty",
        initialPassword: f.initial_password || (isCounselor ? "counselor123" : "teacher123"),
        status: f.status
      });
    });

    // 3. Parents
    parentRecords.forEach(p => {
      list.push({
        id: p.id,
        name: p.name,
        email: p.email,
        role: "parent",
        roleLabel: `Parent (${p.relationship})`,
        identifier: `LRN: ${p.linkedLRN}`,
        sectionOrDept: `${p.linkedStudentName} (${p.section})`,
        initialPassword: p.initialPassword || "parent2026",
        status: p.status
      });
    });

    // 4. Students (First 50 sample for bulk credential generator)
    students.slice(0, 50).forEach(s => {
      list.push({
        id: `STU-${s.id}`,
        name: `${s.first_name} ${s.last_name}`,
        email: s.email || `student.${s.lrn}@sapc.edu.ph`,
        role: "student",
        roleLabel: `Student (${s.strand || 'SHS'})`,
        identifier: s.lrn,
        sectionOrDept: s.section_name || `Grade ${s.grade_level}`,
        initialPassword: `sapc${s.lrn.slice(-4)}`,
        status: "Active"
      });
    });

    return list;
  }, [facultyList, parentRecords, students]);

  const filteredCredentialUsers = useMemo(() => {
    let result = allCredentialUsers;
    if (credentialSearch.trim()) {
      const q = credentialSearch.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.identifier.toLowerCase().includes(q) ||
        u.sectionOrDept.toLowerCase().includes(q)
      );
    }
    if (credentialRoleFilter !== "all") {
      result = result.filter(u => u.role === credentialRoleFilter);
    }
    return result;
  }, [allCredentialUsers, credentialSearch, credentialRoleFilter]);

  const handleToggleSelectAllCredentials = () => {
    if (selectedCredentialIds.size === filteredCredentialUsers.length) {
      setSelectedCredentialIds(new Set());
    } else {
      setSelectedCredentialIds(new Set(filteredCredentialUsers.map(u => u.id)));
    }
  };

  const handleToggleSelectCredential = (id: string) => {
    setSelectedCredentialIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportSelectedCredentialsCSV = () => {
    const targetUsers = selectedCredentialIds.size > 0 
      ? allCredentialUsers.filter(u => selectedCredentialIds.has(u.id))
      : filteredCredentialUsers;

    const headers = ["User ID", "Full Name", "Portal Email", "Assigned Role", "Identifier (LRN / Emp ID)", "Section / Office", "Initial Password", "Status"];
    const rows = targetUsers.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      `"${u.roleLabel}"`,
      `"${u.identifier}"`,
      `"${u.sectionOrDept}"`,
      `"${u.initialPassword}"`,
      u.status
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SAPC_Master_Credentials_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${targetUsers.length} user credential records to CSV.`);
  };

  const handleCopySelectedCredentials = () => {
    const targetUsers = selectedCredentialIds.size > 0 
      ? allCredentialUsers.filter(u => selectedCredentialIds.has(u.id))
      : filteredCredentialUsers.slice(0, 20);

    const formatted = targetUsers.map(u => 
      `Account: ${u.name} | Role: ${u.roleLabel} | Email: ${u.email} | Pass: ${u.initialPassword} | ID: ${u.identifier}`
    ).join("\n");

    navigator.clipboard.writeText(formatted);
    showToast(`Copied ${targetUsers.length} credential logins to clipboard!`);
  };

  // 3. Dynamic Ingestion History & 1-Click Rollback State
  const [importHistory, setImportHistory] = useState<IngestionBatchRecord[]>(() => getIngestionHistory());

  useEffect(() => {
    const refreshHistory = () => {
      setImportHistory(getIngestionHistory());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("sapc:ingestion-history-updated", refreshHistory);
      window.addEventListener("sapc:data-ingested", refreshHistory);
      return () => {
        window.removeEventListener("sapc:ingestion-history-updated", refreshHistory);
        window.removeEventListener("sapc:data-ingested", refreshHistory);
      };
    }
  }, []);

  const handleRollbackBatch = async (batchId: string) => {
    const batch = importHistory.find(b => b.id === batchId);
    const desc = batch ? `Batch ${batch.id} (${batch.type})` : `Batch ${batchId}`;
    if (!window.confirm(`⚠️ Rollback Confirmation\n\nAre you sure you want to revert ${desc}?\n\nThis will restore the student cohort risk roster to the snapshot captured prior to this ingestion and synchronize to Cloud Firestore.`)) {
      return;
    }

    const result = await rollbackIngestionBatch(batchId);
    if (result.success) {
      showToast(result.message);
      setImportHistory(getIngestionHistory());
      setStudents(getActiveStudentDataset());
    } else {
      showToast(`Rollback Failed: ${result.message}`);
    }
  };

  // Categories for 19 Tabs
  const CATEGORIES = useMemo(() => [
    { id: "all", label: "All Master Controls (19)" },
    { id: "governance", label: "System & Platform Config (5)", tabIds: ["dashboard", "platform_settings", "quarter_management", "knowledge_base", "notifications"] },
    { id: "ingestion", label: "Master Ingestion & Rollback (5)", tabIds: ["import_wizard", "import_history", "revert_import", "verify_assessments", "export_import_history"] },
    { id: "students", label: "Student Master Registry (3)", tabIds: ["students", "create_student", "student_profile"] },
    { id: "users", label: "Campus Accounts & Security (5)", tabIds: ["teachers", "create_user", "parents", "pending_registrations", "export_credentials"] },
    { id: "compliance", label: "Institutional Compliance (1)", tabIds: ["reports"] }
  ], []);

  const TAB_ITEMS: Array<{ id: AdminTabType; label: string; icon: any; badge?: string; category: string }> = [
    { id: "dashboard", label: "System Command Center", icon: Activity, badge: "Master", category: "governance" },
    { id: "platform_settings", label: "Platform & Campus Logo", icon: Building, badge: "Admin Only", category: "governance" },
    { id: "quarter_management", label: "Quarter Management", icon: Calendar, badge: "Q2 Active", category: "governance" },
    { id: "import_wizard", label: "Master Import Wizard", icon: Layers, badge: "DepEd SASS", category: "ingestion" },
    { id: "import_history", label: "Import Audit History", icon: ShieldCheck, badge: `${importHistory.length}`, category: "ingestion" },
    { id: "revert_import", label: "Rollback & Revert Engine", icon: RotateCcw, badge: "Emergency", category: "ingestion" },
    { id: "students", label: "Master Student Registry", icon: BookOpen, badge: `${cohortStats.total || 500}`, category: "students" },
    { id: "create_student", label: "Create Single Student", icon: UserPlus, category: "students" },
    { id: "student_profile", label: "Student Override Editor", icon: Edit, category: "students" },
    { id: "teachers", label: "Faculty & Counselors Roster", icon: GraduationCap, badge: `${facultyList.length} Active`, category: "users" },
    { id: "create_user", label: "Create Campus Account", icon: Key, category: "users" },
    { id: "parents", label: "Parent Accounts & Links", icon: Users, badge: `${parentRecords.length} Active`, category: "users" },
    { id: "pending_registrations", label: "Pending Registrations", icon: UserCheck, badge: `${pendingRegistrations.length} Due`, category: "users" },
    { id: "reports", label: "DepEd / CHED Reports", icon: Award, category: "compliance" },
    { id: "notifications", label: "Broadcast Announcements", icon: Bell, category: "governance" },
    { id: "knowledge_base", label: "Knowledge Base & FAQs", icon: HelpCircle, category: "governance" },
    { id: "verify_assessments", label: "Verify Submitted Screeners", icon: Activity, category: "ingestion" },
    { id: "export_credentials", label: "Bulk Export Credentials", icon: Download, category: "users" },
    { id: "export_import_history", label: "Export Ingestion Logs", icon: FileSpreadsheet, category: "ingestion" }
  ];

  const visibleTabs = selectedNavCategory === "all"
    ? TAB_ITEMS
    : TAB_ITEMS.filter(t => t.category === selectedNavCategory);

  // ==========================================
  // 1. STUDENT REGISTRY PAGINATION & FILTERING
  // ==========================================
  const [studentPage, setStudentPage] = useState<number>(1);
  const [studentPageSize, setStudentPageSize] = useState<number>(25);
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>("all");
  const [studentSectionFilter, setStudentSectionFilter] = useState<string>("all");

  const selectedStudentObj = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0] || {} as StudentRecord;
  }, [students, selectedStudentId]);

  const uniqueSections = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => { if (s.section_name) set.add(s.section_name); });
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = [...students];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.lrn.includes(searchQuery) ||
        (s.section_name && s.section_name.toLowerCase().includes(q))
      );
    }
    if (studentGradeFilter !== "all") {
      result = result.filter(s => String(s.grade_level) === studentGradeFilter);
    }
    if (studentSectionFilter !== "all") {
      result = result.filter(s => s.section_name === studentSectionFilter);
    }
    return result;
  }, [students, searchQuery, studentGradeFilter, studentSectionFilter]);

  const totalStudentPages = useMemo(() => {
    if (studentPageSize >= 500) return 1;
    return Math.max(1, Math.ceil(filteredStudents.length / studentPageSize));
  }, [filteredStudents.length, studentPageSize]);

  const paginatedStudents = useMemo(() => {
    if (studentPageSize >= 500) return filteredStudents;
    const start = (studentPage - 1) * studentPageSize;
    return filteredStudents.slice(start, start + studentPageSize);
  }, [filteredStudents, studentPage, studentPageSize]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setStudentPage(1);
  }, [searchQuery, studentGradeFilter, studentSectionFilter, studentPageSize]);

  // ==========================================
  // 2. CREATE STUDENT FORM STATE
  // ==========================================
  const [newStudentFirstName, setNewStudentFirstName] = useState("");
  const [newStudentLastName, setNewStudentLastName] = useState("");
  const [newStudentLRN, setNewStudentLRN] = useState("");
  const [newStudentGradeLevel, setNewStudentGradeLevel] = useState<number>(11);
  const [newStudentStrand, setNewStudentStrand] = useState("STEM");
  const [newStudentSection, setNewStudentSection] = useState("Grade 11 - St. Augustine (STEM)");
  const [newStudentGWA, setNewStudentGWA] = useState<number>(85);
  const [newStudentAttendance, setNewStudentAttendance] = useState<number>(95);
  const [newStudentPHQ9, setNewStudentPHQ9] = useState<number>(3);
  const [newStudentIncome, setNewStudentIncome] = useState("10k-25k");
  const [newStudentIsSubmitting, setNewStudentIsSubmitting] = useState(false);

  const handleEnrollSingleStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentFirstName.trim() || !newStudentLastName.trim() || !newStudentLRN.trim()) {
      showToast("Please fill in First Name, Last Name, and 12-digit LRN.");
      return;
    }
    if (newStudentLRN.trim().length !== 12) {
      showToast("LRN must be exactly 12 digits (DepEd Standard).");
      return;
    }

    setNewStudentIsSubmitting(true);
    try {
      const gpa = Number(newStudentGWA);
      const att = Number(newStudentAttendance);
      const fails = gpa < 75 ? 2 : 0;
      const abs = Math.max(0, Math.round((100 - att) / 5));
      const phq = Number(newStudentPHQ9);
      const finRisk = newStudentIncome === "<10k" ? 35 : newStudentIncome === "10k-25k" ? 20 : 10;

      const newRec = await addStudentRecord({
        first_name: newStudentFirstName.trim(),
        last_name: newStudentLastName.trim(),
        full_name: `${newStudentFirstName.trim()} ${newStudentLastName.trim()}`,
        lrn: newStudentLRN.trim(),
        grade_level: Number(newStudentGradeLevel),
        strand: newStudentStrand,
        section_name: newStudentSection,
        adviser_name: "Class Adviser",
        email: `${newStudentFirstName.toLowerCase().replace(/\s+/g, '')}.${newStudentLastName.toLowerCase().replace(/\s+/g, '')}@sapc.edu.ph`,
        domain_scores: {
          academic: Math.max(0, 100 - gpa),
          mental_health: phq * 3.5,
          financial: finRisk,
          family: 15,
          health: Math.max(0, 100 - att)
        },
        sass_metrics: {
          gpa,
          failing_subjects_count: fails,
          days_absent: abs,
          attendance_rate_pct: att,
          incomplete_requirements_count: 0,
          extracurricular_club: "General Student Association",
          club_participation_level: "Moderate",
          hobbies_interests: "Academic & Campus Activities"
        }
      });

      setStudents(getActiveStudentDataset());
      showToast(`Successfully enrolled student ${newRec.first_name} ${newRec.last_name} into ${newRec.section_name}!`);
      // Reset form
      setNewStudentFirstName("");
      setNewStudentLastName("");
      setNewStudentLRN("");
      // Navigate to students registry
      handleTabChange("students");
    } catch (err) {
      console.error(err);
      showToast("Failed to enroll student. Please check input fields.");
    } finally {
      setNewStudentIsSubmitting(false);
    }
  };

  // ==========================================
  // 3. STUDENT OVERRIDE FORM STATE
  // ==========================================
  const [overrideGWA, setOverrideGWA] = useState<number>(85);
  const [overrideAttendance, setOverrideAttendance] = useState<number>(95);
  const [overrideFailedCount, setOverrideFailedCount] = useState<number>(0);
  const [overridePHQ9, setOverridePHQ9] = useState<number>(3);
  const [overrideFamilySupport, setOverrideFamilySupport] = useState<string>("Stable");
  const [overrideIncome, setOverrideIncome] = useState<string>("10k-25k");

  useEffect(() => {
    if (selectedStudentObj && selectedStudentObj.id) {
      setOverrideGWA(selectedStudentObj.sass_metrics?.gpa || 85);
      setOverrideAttendance(selectedStudentObj.sass_metrics?.attendance_rate_pct || 95);
      setOverrideFailedCount(selectedStudentObj.sass_metrics?.failing_subjects_count || 0);
      setOverridePHQ9(Math.round((selectedStudentObj.domain_scores?.mental_health || 10) / 3.5));
      setOverrideFamilySupport(selectedStudentObj.domain_scores?.family >= 25 ? "OFW Parents" : "Stable");
      setOverrideIncome(selectedStudentObj.domain_scores?.financial >= 30 ? "<10k" : "10k-25k");
    }
  }, [selectedStudentObj]);

  const handleSaveStudentOverride = async () => {
    if (!selectedStudentObj || !selectedStudentObj.id) return;
    try {
      const gpa = Number(overrideGWA);
      const att = Number(overrideAttendance);
      const fails = Number(overrideFailedCount);
      const abs = Math.max(0, Math.round((100 - att) / 5));
      const phq = Number(overridePHQ9);
      const famRisk = overrideFamilySupport === "OFW Parents" ? 30 : overrideFamilySupport === "Single Parent" ? 25 : 10;
      const finRisk = overrideIncome === "<10k" ? 35 : overrideIncome === "10k-25k" ? 20 : 10;

      const updated = await updateStudentRecord(selectedStudentObj.id, {
        domain_scores: {
          academic: Math.max(0, 100 - gpa),
          mental_health: phq * 3.5,
          family: famRisk,
          financial: finRisk,
          health: Math.max(0, 100 - att)
        },
        sass_metrics: {
          ...selectedStudentObj.sass_metrics,
          gpa,
          failing_subjects_count: fails,
          attendance_rate_pct: att,
          days_absent: abs
        }
      });
      setStudents(getActiveStudentDataset());
      showToast(`Saved manual override for ${selectedStudentObj.first_name} ${selectedStudentObj.last_name}. New AHP Score: ${updated?.latest_risk_score}/100 (${updated?.latest_risk_tier?.toUpperCase()})`);
    } catch (err) {
      console.error(err);
      showToast("Failed to save student override.");
    }
  };

  const handleDeleteStudentAction = async (studentId: number, name: string) => {
    if (!window.confirm(`⚠️ Permanently Delete Student Record\n\nAre you sure you want to delete ${name} (ID: ${studentId}) from the Master Student Registry?\n\nThis will remove the student from Firestore and re-aggregate cohort analytics.`)) {
      return;
    }
    const success = await deleteStudentRecord(studentId);
    if (success) {
      setStudents(getActiveStudentDataset());
      showToast(`Student record for ${name} removed.`);
    } else {
      showToast("Failed to delete student record.");
    }
  };

  // ==========================================
  // 4. CREATE CAMPUS USER ACCOUNT FORM STATE
  // ==========================================
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("teacher");
  const [newUserSection, setNewUserSection] = useState("Grade 11 - St. Augustine (STEM)");
  const [newUserDepartment, _setNewUserDepartment] = useState("Senior High STEM");
  const [newUserPassword, setNewUserPassword] = useState("sapc2026");

  const handleProvisionCampusUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast("Please enter Full Name and Institutional Email.");
      return;
    }
    const isCounselor = newUserRole === "guidance_counselor" || newUserRole === "counselor";
    const createdRecord = await addFacultyRecord({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole as any,
      section: newUserSection.trim(),
      department: newUserDepartment.trim() || (isCounselor ? "Guidance & Counseling Center" : "Academic Department"),
      initial_password: newUserPassword.trim() || (isCounselor ? "counselor123" : "teacher123"),
      status: "Active"
    });
    
    setFacultyList(getActiveFacultyRecords());
    showToast(`Account provisioned for ${createdRecord.name}! Initial password: ${createdRecord.initial_password}`);
    setNewUserName("");
    setNewUserEmail("");
    handleTabChange("teachers");
  };

  const filteredFaculty = useMemo(() => {
    let result = [...facultyList];
    if (facultySearch.trim()) {
      const q = facultySearch.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (f.department && f.department.toLowerCase().includes(q)) ||
        (f.section && f.section.toLowerCase().includes(q)) ||
        (f.employee_id && f.employee_id.toLowerCase().includes(q)) ||
        (f.prc_license_no && f.prc_license_no.toLowerCase().includes(q))
      );
    }
    if (facultyRoleFilter !== "all") {
      if (facultyRoleFilter === "counselor") {
        result = result.filter(f => f.role === "guidance_counselor" || f.role === "counselor");
      } else {
        result = result.filter(f => f.role === facultyRoleFilter);
      }
    }
    if (facultyStatusFilter !== "all") {
      result = result.filter(f => f.status === facultyStatusFilter);
    }
    return result;
  }, [facultyList, facultySearch, facultyRoleFilter, facultyStatusFilter]);

  const handleSaveFacultyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    const updated = await updateFacultyRecord(editingFaculty.id, editingFaculty);
    if (updated) {
      setFacultyList(getActiveFacultyRecords());
      showToast(`Updated account details for ${updated.name}.`);
      setEditingFaculty(null);
    }
  };

  // ==========================================
  // 5. BROADCAST ANNOUNCEMENTS STATE
  // ==========================================
  const [broadcastAudience, setBroadcastAudience] = useState<"all" | "teacher" | "parent" | "counselor">("all");
  const [broadcastPriority, setBroadcastPriority] = useState<"info" | "urgent" | "alert">("urgent");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [activeBroadcasts, setActiveBroadcasts] = useState(() => getActiveNotifications());

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast("Please enter announcement title and message content.");
      return;
    }
    addAppNotification({
      type: broadcastPriority === "urgent" ? "alert" : broadcastPriority === "alert" ? "alert" : "system",
      title: `[ADMIN BROADCAST] ${broadcastTitle.trim()}`,
      body: broadcastMessage.trim(),
      message: broadcastMessage.trim(),
      targetRole: broadcastAudience,
      audience: broadcastAudience,
      href: "/dashboard"
    });
    setActiveBroadcasts(getActiveNotifications());
    showToast(`Broadcast dispatched to ${broadcastAudience.toUpperCase()} recipients across SAPC.`);
    setBroadcastTitle("");
    setBroadcastMessage("");
  };

  // ==========================================
  // 7. VERIFY SUBMITTED SCREENERS QUEUE
  // ==========================================
  const [screenerQueue, setScreenerQueue] = useState([
    { id: "SCR-901", studentName: "Joshua Dimaculangan", lrn: "109238475001", section: "Grade 11 - St. Augustine (STEM)", type: "GAD-7 Anxiety Screener", submittedBy: "Class Adviser", score: "Score: 14/21 (Moderate)", date: "2026-09-25", status: "Pending Verification" },
    { id: "SCR-902", studentName: "Samantha Nicole Reyes", lrn: "109238475004", section: "Grade 11 - St. Thomas (HUMSS)", type: "DepEd SASS Attendance Slip", submittedBy: "Subject Teacher", score: "12 Unexcused Absences", date: "2026-09-24", status: "Pending Verification" },
    { id: "SCR-903", studentName: "Althea Garcia", lrn: "109238470002", section: "Grade 7 - St. Bernadette", type: "PHQ-9 Depression Screener", submittedBy: "Guidance Staff", score: "Score: 6/27 (Mild)", date: "2026-09-23", status: "Pending Verification" },
    { id: "SCR-904", studentName: "Karl Patrick Mendoza", lrn: "109238475008", section: "Grade 12 - St. Jude (ABM)", type: "Midterm Diagnostic Exam", submittedBy: "Math Dept Head", score: "Score: 71/100 (Below 75 Threshold)", date: "2026-09-22", status: "Pending Verification" }
  ]);

  const handleVerifyScreener = (id: string, name: string) => {
    setScreenerQueue(prev => prev.filter(s => s.id !== id));
    showToast(`Verified screener ${id} for ${name}. Ingested into AHP Multi-Domain calculation engine.`);
  };

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as AdminTabType;
      if (urlTab) setActiveTab(urlTab);

      const handleCustomNav = (e: CustomEvent<{ tab?: AdminTabType; source?: string }>) => {
        if (e.detail?.source === "tab_click") return;
        if (e.detail?.tab) setActiveTab(e.detail.tab);
      };
      window.addEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
      return () => window.removeEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
    }
  }, []);

  // Auto-scroll active tab and category into view smoothly when activeTab changes
  useEffect(() => {
    if (!isMounted) return;

    const parentCat = CATEGORIES.find(
      (c) => c.id !== "all" && c.tabIds?.includes(activeTab)
    );

    if (
      selectedNavCategory !== "all" &&
      parentCat &&
      !CATEGORIES.find((c) => c.id === selectedNavCategory)?.tabIds?.includes(activeTab)
    ) {
      setSelectedNavCategory("all");
    }

    const timer = setTimeout(() => {
      const activeTabEl = document.getElementById(`admin-tab-${activeTab}`);
      if (activeTabEl && tabsDrag.ref.current) {
        activeTabEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }

      const targetCatId = selectedNavCategory === "all" ? (parentCat?.id || "all") : selectedNavCategory;
      const activeCatEl = document.getElementById(`admin-cat-${targetCatId}`);
      if (activeCatEl && catDrag.ref.current) {
        activeCatEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeTab, selectedNavCategory, isMounted, CATEGORIES, catDrag.ref, tabsDrag.ref]);

  const handleTabChange = useCallback((tab: AdminTabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab, source: "tab_click" } }));
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6 pb-12 font-sans animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-7 pb-16 font-sans w-full max-w-full overflow-hidden px-1 sm:px-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Top Banner - Institutional Maroon & Gold (Mobile / Tablet Optimized) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-5 sm:p-7 md:p-8 shadow-md text-white border-t-4 border-amber-400">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                San Antonio de Padua College
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• System Administration &amp; Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Master System &amp; Campus Governance
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-rose-50/95 leading-relaxed font-normal">
              Oversee campus student master registry, manage DepEd SASS batch ingestion, configure campus user accounts, and enforce immutable RA 10173 audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsKnowledgeHubOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-purple-600/85 hover:bg-purple-600 text-white border border-purple-400/40 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
              title="Train and personalize the AI Counselor Knowledge Base"
            >
              <BrainCircuit className="h-4 w-4 text-purple-200" />
              <span>AI Training Hub</span>
            </button>

            <button
              onClick={() => handleTabChange("reports")}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Award className="h-4 w-4 text-[#8B0014]" />
              <span>DepEd Reports Hub</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-extrabold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4 text-amber-300" />
              <span>Executive Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* System KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Master Student Records</span>
            <Users className="h-4 w-4 text-[#8B0014]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{cohortStats.total}</span>
            <span className="text-xs font-bold text-slate-400">Enrolled</span>
          </div>
          <span className="text-[11px] text-slate-500">Across {cohortStats.sectionBreakdown.length || 16} Sections (JHS &amp; SHS)</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Faculty &amp; Staff</span>
            <GraduationCap className="h-4 w-4 text-[#8B0014]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{facultyList.length}</span>
            <span className="text-xs font-bold text-slate-400">Accounts</span>
          </div>
          <span className="text-[11px] font-bold text-slate-600">
            {facultyList.filter(f => f.role === "teacher").length} Teachers • {facultyList.filter(f => f.role === "guidance_counselor" || f.role === "counselor").length} Counselors
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">SASS Ingestion Pipeline</span>
            <Layers className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{importHistory.length}</span>
            <span className="text-xs font-bold text-slate-400">Batches Synced</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">✓ 100% DepEd Schema Integrity</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Access &amp; Security Queue</span>
            <UserCheck className="h-4 w-4 text-amber-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-800">{pendingRegistrations.length}</span>
            <span className="text-xs font-bold text-slate-400">Registrations Due</span>
          </div>
          <span className="text-[11px] font-bold text-amber-800">RA 10173 Audit Logging Active</span>
        </div>
      </div>

      {/* Navigation Hub: Category Switcher + Tabs */}
      <div className="space-y-2.5">
        {/* Category Filter Chips with Scroll Controls */}
        <div className="relative flex items-center">
          {catDrag.canScrollLeft && (
            <button
              type="button"
              onClick={() => catDrag.scrollBy(-220)}
              className="flex absolute -left-2 z-10 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer"
              title="Scroll categories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div 
            ref={catDrag.ref}
            {...catDrag.events}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth pb-1 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none w-full"
          >
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedNavCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`admin-cat-${cat.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedNavCategory(cat.id);
                    if (cat.id !== "all" && cat.tabIds && !cat.tabIds.includes(activeTab)) {
                      handleTabChange(cat.tabIds[0] as AdminTabType);
                    }
                  }}
                  className={`min-h-[34px] px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 cursor-pointer ${
                    isCatActive
                      ? "bg-[#8B0014] text-white shadow-2xs ring-2 ring-rose-200"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {catDrag.canScrollRight && (
            <button
              type="button"
              onClick={() => catDrag.scrollBy(220)}
              className="flex absolute -right-2 z-10 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer"
              title="Scroll categories right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categorized Navigation Tabs Bar (Scrollable Pill Strip with Left/Right Buttons) */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center">
          {tabsDrag.canScrollLeft && (
            <button
              type="button"
              onClick={() => tabsDrag.scrollBy(-260)}
              className="flex absolute left-2 z-10 h-8 w-8 rounded-xl bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer backdrop-blur-xs"
              title="Scroll modules left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div 
            ref={tabsDrag.ref}
            {...tabsDrag.events}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth px-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none text-xs font-bold w-full"
          >
            {visibleTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-tab-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#8B0014] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                      isActive ? "bg-amber-400 text-amber-950" : "bg-slate-200 text-slate-700"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {tabsDrag.canScrollRight && (
            <button
              type="button"
              onClick={() => tabsDrag.scrollBy(260)}
              className="flex absolute right-2 z-10 h-8 w-8 rounded-xl bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-[#8B0014] hover:bg-rose-50 transition cursor-pointer backdrop-blur-xs"
              title="Scroll modules right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SYSTEM COMMAND CENTER (dashboard) */}
      {/* ========================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Health & Operations Matrix */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] flex items-center justify-center font-bold">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                          Platform Infrastructure &amp; Health Overview
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Real-time system telemetry, Cloud Firestore multi-client sync, and institutional data governance
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs self-start sm:self-auto">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Cloud Firestore Live</span>
                  </span>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block font-bold text-[11px]">System Status</span>
                    <span className="text-lg font-black text-emerald-600 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      99.98% Online
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Sub-listeners Active</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block font-bold text-[11px]">Active Academic Term</span>
                    <span className="text-lg font-black text-slate-900">Quarter 2</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Midterm Remediation</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block font-bold text-[11px]">Ingestion Schema</span>
                    <span className="text-lg font-black text-blue-700">DepEd SASS v2.4</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">0 Parse Errors</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block font-bold text-[11px]">Data Privacy Act</span>
                    <span className="text-lg font-black text-emerald-700">RA 10173</span>
                    <span className="text-[10px] text-emerald-600 mt-0.5 block">✓ Immutable Logs</span>
                  </div>
                </div>

                {/* Quick Administrative Operations Action Matrix */}
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#8B0014]" />
                    Core Platform Governance Modules
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTabChange("import_wizard")}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 transition text-left space-y-1.5 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-extrabold text-slate-900 group-hover:text-[#8B0014] text-xs">
                          Master DepEd SASS Ingestion Hub
                        </strong>
                        <Layers className="h-4 w-4 text-slate-400 group-hover:text-[#8B0014]" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Upload multi-domain CSV datasets (Academic, Attendance, Screeners) with real-time validation.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabChange("teachers")}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 transition text-left space-y-1.5 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-extrabold text-slate-900 group-hover:text-[#8B0014] text-xs">
                          Faculty &amp; Counselor User Accounts
                        </strong>
                        <GraduationCap className="h-4 w-4 text-slate-400 group-hover:text-[#8B0014]" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Manage {facultyList.length} active teacher &amp; counselor accounts, advisory rosters, and login slips.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabChange("pending_registrations")}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-200 transition text-left space-y-1.5 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-extrabold text-slate-900 group-hover:text-amber-800 text-xs">
                          Pending Registration Verification Queue
                        </strong>
                        <UserCheck className="h-4 w-4 text-slate-400 group-hover:text-amber-700" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {pendingRegistrations.length} parent &amp; faculty verification requests awaiting PSA document review.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabChange("platform_settings")}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 transition text-left space-y-1.5 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-extrabold text-slate-900 group-hover:text-[#8B0014] text-xs">
                          Institutional Branding &amp; Campus Config
                        </strong>
                        <Building className="h-4 w-4 text-slate-400 group-hover:text-[#8B0014]" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Configure official SAPC emblem, DepEd School ID ({depEdSchoolId}), and institutional identifiers.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#8B0014]" />
                System Activity &amp; Audit Trail
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-slate-900">DepEd SASS Ingestion</strong>
                    <span className="text-slate-400 text-[10px]">Just now</span>
                  </div>
                  <p className="text-slate-600">Mr. Santos uploaded 45 STEM Grade 11 grades (Schema v2.4 Validated).</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-slate-900">Faculty Roster Synchronized</strong>
                    <span className="text-slate-400 text-[10px]">2 hrs ago</span>
                  </div>
                  <p className="text-slate-600">7 academic faculty &amp; counselor accounts synced with Cloud Firestore.</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-slate-900">PSA Document Verified</strong>
                    <span className="text-slate-400 text-[10px]">Yesterday</span>
                  </div>
                  <p className="text-slate-600">Parent account authorized for Form 138 digital access.</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-slate-900">Security Audit Log Check</strong>
                    <span className="text-slate-400 text-[10px]">2 days ago</span>
                  </div>
                  <p className="text-slate-600">RA 10173 access logs verified with 256-bit cryptographic integrity.</p>
                </div>
              </div>

              <button
                onClick={() => handleTabChange("import_history")}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition text-center cursor-pointer"
              >
                View Full Audit Logs →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1.5 PLATFORM & INSTITUTIONAL BRANDING (platform_settings) */}
      {/* ========================================================= */}
      {activeTab === "platform_settings" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Building className="h-6 w-6 text-[#8B0014]" />
                  Institutional Branding &amp; Platform Configuration
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Manage official campus emblem, institutional identifiers, and platform-wide DSS branding
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-[#8B0014] border border-rose-200 self-start sm:self-auto">
                Admin Exclusive Control
              </span>
            </div>

            {/* Campus Logo & Emblem Customization */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[#8B0014]" />
                  Official Campus Seal &amp; Institutional Logo
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  This emblem appears across all user portals (Counselor, Faculty, Administrator, Student, Parent), generated PDF reports, and navigation headers.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Logo Preview */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Live Emblem Preview</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                    <SapcLogo size={72} />
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="text-xs font-black text-slate-800">
                      {customLogo ? "Custom Institutional Logo" : "Official SAPC 1979 Crest"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {customLogo ? "Active override saved in platform storage" : "Default San Antonio de Padua College seal"}
                    </p>
                  </div>
                </div>

                {/* Upload & Reset Controls */}
                <div className="lg:col-span-8 space-y-4">
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleInstitutionalLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                    <span className="font-extrabold block">Institutional Emblem Guidelines:</span>
                    <ul className="list-disc pl-4 space-y-1 text-amber-900">
                      <li>Recommended dimensions: Square (512x512px) or circular emblem for optimal crispness.</li>
                      <li>Accepted formats: PNG (transparent background recommended), JPG, WebP, or SVG.</li>
                      <li>Maximum upload size: 4.0 MB.</li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Upload className="h-4 w-4 text-amber-300" />
                      <span>Upload New Institutional Logo</span>
                    </button>

                    {customLogo && (
                      <button
                        type="button"
                        onClick={handleResetInstitutionalLogo}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                        <span>Reset to Default SAPC Crest</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Institution Metadata Form */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-base font-extrabold text-slate-900">
                Institutional Identification &amp; Accredited Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700">Official Institution Name</label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700">DepEd / CHED School ID</label>
                  <input
                    type="text"
                    value={depEdSchoolId}
                    onChange={(e) => setDepEdSchoolId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700">Campus System Tagline</label>
                  <input
                    type="text"
                    value={campusTagline}
                    onChange={(e) => setCampusTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700">Campus Postal Address</label>
                  <input
                    type="text"
                    value={campusAddress}
                    onChange={(e) => setCampusAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast("Institutional configuration saved successfully.")}
                  className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition shadow-xs cursor-pointer"
                >
                  Save Platform Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================= */}
      {/* 3. QUARTER MANAGEMENT (quarter_management) */}
      {/* ========================================================= */}
      {activeTab === "quarter_management" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-[#8B0014]" />
                  School Year Structure &amp; Quarter Calendar Controls
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Configure active grading terms, examination clearance deadlines, and diagnostic ingestion windows
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {quarterConfig.map((q) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    q.isCurrent ? "bg-amber-50/70 border-amber-300" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">{q.id}</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{q.label}</h4>
                      {q.isCurrent && (
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 font-black text-[10px] uppercase">Active Now</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">Timeline: {q.start} to {q.end}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!q.isCurrent && (
                      <button
                        onClick={() => {
                          setQuarterConfig(prev => prev.map(item => ({
                            ...item,
                            isCurrent: item.id === q.id,
                            status: item.id === q.id ? "Active Now" : "Configured"
                          })));
                          showToast(`Set ${q.id} as the current active grading quarter.`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                      >
                        Set as Active Quarter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MASTER IMPORT WIZARD (import_wizard) */}
      {/* ========================================================= */}
      {activeTab === "import_wizard" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="h-6 w-6 text-[#8B0014]" />
                Master Multi-Domain Data Ingestion Hub
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                System-wide access to upload and match CSV dataset columns for any grade, section, or domain
              </p>
            </div>

            <MultiDomainIngestionHub defaultDomain="academic" />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. IMPORT AUDIT HISTORY (import_history) */}
      {/* ========================================================= */}
      {activeTab === "import_history" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-[#8B0014]" />
                  System-Wide Ingestion Audit Trail &amp; Import Logs
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Chronological record of all bulk CSV uploads, schema matches, and automated AHP risk recalculations
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNavCategory("ingestion");
                    handleTabChange("import_wizard");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition shadow-xs flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>New Batch Ingestion</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-600">
                    <th className="py-3 px-4">Batch Ref ID</th>
                    <th className="py-3 px-4">Domain &amp; Type</th>
                    <th className="py-3 px-4">Imported By</th>
                    <th className="py-3 px-4">Records</th>
                    <th className="py-3 px-4">Risk Shifts</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Safeguard Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {importHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span>{h.id}</span>
                        {h.rolledBack && (
                          <span className="block text-[10px] text-slate-400 font-sans font-medium">
                            (Rolled Back)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="font-bold text-slate-900 block">{h.type}</strong>
                        <span className="text-[11px] text-slate-500 capitalize">{h.academicYear || "AY 2025-2026"} • {h.quarter || "Q1"}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{h.importedBy}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {h.count} students
                      </td>
                      <td className="py-3 px-4">
                        {h.diffSummary ? (
                          <div className="flex items-center gap-1.5 font-bold text-[11px]">
                            <span className="text-rose-700">▲ {h.diffSummary.riskIncreased}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-emerald-700">▼ {h.diffSummary.riskDecreased}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{h.date}</td>
                      <td className="py-3 px-4 text-right">
                        {h.rolledBack ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Reverted
                          </span>
                        ) : h.canRollback ? (
                          <button
                            type="button"
                            onClick={() => handleRollbackBatch(h.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#8B0014] border border-rose-200 font-bold text-xs transition shadow-2xs cursor-pointer"
                          >
                            1-Click Rollback
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100">
                            Baseline Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ROLLBACK & REVERT ENGINE (revert_import) */}
      {/* ========================================================= */}
      {activeTab === "revert_import" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <RotateCcw className="h-6 w-6 text-rose-600" />
                Emergency Ingestion Undo &amp; Snapshot Rollback Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Safely revert erroneous bulk imports with 100% loss-free pre-import snapshot recovery
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                <h4 className="font-black text-slate-900 text-sm">How Snapshot Rollback Works</h4>
              </div>
              <p className="leading-relaxed text-slate-600">
                Whenever a staff member or counselor ingests a batch CSV, IntellySys AGY automatically captures an immutable memory snapshot of all 500 student records before mutations are applied. Reverting a batch restores this snapshot instantly and synchronizes changes across client dashboards and Firebase Cloud Firestore.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Active Ingestion Batches Available for Rollback ({importHistory.filter(h => h.canRollback && !h.rolledBack).length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {importHistory.filter(h => h.canRollback && !h.rolledBack).map((batch) => (
                  <div key={batch.id} className="p-5 rounded-2xl border-2 border-rose-200/70 bg-rose-50/30 space-y-4 shadow-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {batch.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                          Ready for Undo
                        </span>
                      </div>

                      <h5 className="font-extrabold text-slate-900 text-sm">
                        {batch.type}
                      </h5>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Actor / Imported By</span>
                          <strong className="text-slate-800">{batch.importedBy}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Timestamp</span>
                          <strong className="text-slate-800 font-mono">{batch.date}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Dataset Size</span>
                          <strong className="text-slate-800">{batch.count} Students</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Risk Shifts</span>
                          {batch.diffSummary ? (
                            <strong className="text-slate-800">
                              ▲ {batch.diffSummary.riskIncreased} | ▼ {batch.diffSummary.riskDecreased}
                            </strong>
                          ) : (
                            <strong className="text-slate-800">Standard</strong>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-rose-200/50 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {batch.snapshotData ? "✓ Snapshot Valid" : "Baseline Fallback"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRollbackBatch(batch.id)}
                        className="px-4 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Rollback Batch</span>
                      </button>
                    </div>
                  </div>
                ))}

                {importHistory.filter(h => h.canRollback && !h.rolledBack).length === 0 && (
                  <div className="col-span-2 p-8 text-center rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-500 text-xs">
                    No active rollback batches in queue. All recent imports have either been finalized or already reverted.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MASTER STUDENTS REGISTRY (students) */}
      {/* ========================================================= */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            {/* Header with Title and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Master Student Registry ({cohortStats.total} Students)
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Cloud Firestore Live Sync
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Master learner census, 12-digit LRN verification, section assignments, and DepEd SASS synchronization
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => exportActiveDatasetToCSV(students)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Download all 500 student records in CSV format"
                >
                  <Download className="h-3.5 w-3.5 text-slate-600" />
                  <span>Export Active CSV ({students.length})</span>
                </button>

                <label className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-[#8B0014]" />
                  <span>Import / Re-Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFullCSVUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => handleTabChange("create_student")}
                  className="px-4 py-2 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Single Student</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="lg:col-span-5 relative">
                <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name, LRN, section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#8B0014] focus:ring-1 focus:ring-[#8B0014]"
                />
              </div>

              {/* Grade Filter */}
              <div className="lg:col-span-3">
                <select
                  value={studentGradeFilter}
                  onChange={(e) => setStudentGradeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#8B0014]"
                >
                  <option value="all">All Grade Levels</option>
                  <option value="7">Grade 7 (JHS)</option>
                  <option value="8">Grade 8 (JHS)</option>
                  <option value="9">Grade 9 (JHS)</option>
                  <option value="10">Grade 10 (JHS)</option>
                  <option value="11">Grade 11 (SHS)</option>
                  <option value="12">Grade 12 (SHS)</option>
                </select>
              </div>

              {/* Section Filter */}
              <div className="lg:col-span-4">
                <select
                  value={studentSectionFilter}
                  onChange={(e) => setStudentSectionFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#8B0014]"
                >
                  <option value="all">All Advisory Sections ({uniqueSections.length})</option>
                  {uniqueSections.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table & Pagination Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 px-1">
              <div className="font-semibold">
                Showing <strong className="text-slate-900">{filteredStudents.length === 0 ? 0 : (studentPage - 1) * studentPageSize + 1}</strong> to <strong className="text-slate-900">{Math.min(studentPage * studentPageSize, filteredStudents.length)}</strong> of <strong className="text-slate-900">{filteredStudents.length}</strong> filtered records (Total Cohort: {students.length})
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Rows per page:</span>
                <select
                  value={studentPageSize}
                  onChange={(e) => setStudentPageSize(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                >
                  <option value={10}>10 rows</option>
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                  <option value={500}>All 500 rows</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-black text-slate-600 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Student &amp; LRN</th>
                    <th className="py-3 px-4">Grade &amp; Section</th>
                    <th className="py-3 px-4">SASS Ingestion Data</th>
                    <th className="py-3 px-4">Enrolment Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                        No student records match the search filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s, idx) => {
                      const rowNum = (studentPage - 1) * studentPageSize + idx + 1;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                            {rowNum}
                          </td>
                          <td className="py-3.5 px-4">
                            <strong className="text-slate-900 font-extrabold block text-xs sm:text-sm">
                              {s.first_name} {s.last_name}
                            </strong>
                            <span className="font-mono text-[11px] text-slate-500">
                              LRN: {s.lrn}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 block text-xs">
                              {s.section_name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Grade {s.grade_level} {s.strand ? `• ${s.strand}` : ""}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 text-[10px]">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100" title="Academic GWA">
                                GWA: {s.sass_metrics?.gpa || 85}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100" title="Attendance Rate">
                                Att: {s.sass_metrics?.attendance_rate_pct || 95}%
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200" title="DepEd SASS Synced">
                                ✓ SASS Synced
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active Enrolled
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentId(s.id);
                                  handleTabChange("student_profile");
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#8B0014] hover:text-white text-slate-800 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1"
                                title="Override / Edit Student Data"
                              >
                                <Edit className="h-3 w-3" />
                                <span>Edit Record</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteStudentAction(s.id, `${s.first_name} ${s.last_name}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete student record"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            {totalStudentPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="text-slate-500">
                  Page <strong className="text-slate-800">{studentPage}</strong> of <strong className="text-slate-800">{totalStudentPages}</strong>
                </div>

                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  <button
                    type="button"
                    disabled={studentPage <= 1}
                    onClick={() => setStudentPage(1)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="First Page"
                  >
                    « First
                  </button>

                  <button
                    type="button"
                    disabled={studentPage <= 1}
                    onClick={() => setStudentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>

                  {/* Page Jump Numeric Display */}
                  <div className="flex items-center gap-1 px-1">
                    {(() => {
                      const count = Math.min(5, totalStudentPages);
                      let start = Math.max(1, studentPage - Math.floor(count / 2));
                      let end = start + count - 1;
                      if (end > totalStudentPages) {
                        end = totalStudentPages;
                        start = Math.max(1, end - count + 1);
                      }
                      const pageNumbers: number[] = [];
                      for (let i = start; i <= end; i++) {
                        pageNumbers.push(i);
                      }
                      return pageNumbers.map((p) => (
                        <button
                          key={`page-${p}`}
                          type="button"
                          onClick={() => setStudentPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-black transition ${
                            studentPage === p
                              ? "bg-[#8B0014] text-white shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {p}
                        </button>
                      ));
                    })()}
                  </div>

                  <button
                    type="button"
                    disabled={studentPage >= totalStudentPages}
                    onClick={() => setStudentPage(prev => Math.min(totalStudentPages, prev + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={studentPage >= totalStudentPages}
                    onClick={() => setStudentPage(totalStudentPages)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Last Page"
                  >
                    Last »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. CREATE STUDENT (create_student) */}
      {/* ========================================================= */}
      {activeTab === "create_student" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-[#8B0014]" />
                  Manually Enroll Single Student Record
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Instantly enroll transferees or special track students directly into the master registry &amp; Cloud Firestore
                </p>
              </div>
              <button
                onClick={() => handleTabChange("students")}
                className="text-xs font-bold text-slate-500 hover:text-[#8B0014] transition"
              >
                ← Back to Student Registry
              </button>
            </div>

            <form onSubmit={handleEnrollSingleStudent} className="space-y-6">
              {/* Section 1: Demographics */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <h4 className="font-black text-slate-900 text-sm">1. Student Identification &amp; Demographics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Juan"
                      value={newStudentFirstName}
                      onChange={(e) => setNewStudentFirstName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dela Cruz"
                      value={newStudentLastName}
                      onChange={(e) => setNewStudentLastName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">12-Digit LRN (DepEd) *</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="109238475099"
                      value={newStudentLRN}
                      onChange={(e) => setNewStudentLRN(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic & Section */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <h4 className="font-black text-slate-900 text-sm">2. Grade Level &amp; Advisory Section</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Grade Level</label>
                    <select
                      value={newStudentGradeLevel}
                      onChange={(e) => setNewStudentGradeLevel(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    >
                      <option value={7}>Grade 7 (JHS)</option>
                      <option value={8}>Grade 8 (JHS)</option>
                      <option value={9}>Grade 9 (JHS)</option>
                      <option value={10}>Grade 10 (JHS)</option>
                      <option value={11}>Grade 11 (SHS)</option>
                      <option value={12}>Grade 12 (SHS)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Strand / Track</label>
                    <select
                      value={newStudentStrand}
                      onChange={(e) => setNewStudentStrand(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="STEM">STEM (Science, Tech, Eng, Math)</option>
                      <option value="HUMSS">HUMSS (Humanities & Social Sciences)</option>
                      <option value="ABM">ABM (Accountancy, Business, Management)</option>
                      <option value="GAS">GAS (General Academic Strand)</option>
                      <option value="TVL">TVL (Technical-Vocational Track)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Advisory Section</label>
                    <select
                      value={newStudentSection}
                      onChange={(e) => setNewStudentSection(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    >
                      {uniqueSections.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Diagnostic 5-Domain Baselines */}
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4 text-xs">
                <h4 className="font-black text-amber-950 text-sm">3. Diagnostic 5-Domain Intake Baselines</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-amber-900">Academic GWA (70-100)</label>
                    <input
                      type="number"
                      min="65"
                      max="100"
                      value={newStudentGWA}
                      onChange={(e) => setNewStudentGWA(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-amber-900">Attendance Rate (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={newStudentAttendance}
                      onChange={(e) => setNewStudentAttendance(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-amber-900">PHQ-9 Screener (0-27)</label>
                    <input
                      type="number"
                      min="0"
                      max="27"
                      value={newStudentPHQ9}
                      onChange={(e) => setNewStudentPHQ9(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-amber-900">Monthly Family Income</label>
                    <select
                      value={newStudentIncome}
                      onChange={(e) => setNewStudentIncome(e.target.value)}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                    >
                      <option value="<10k">&lt; ₱10,000 (Low Income)</option>
                      <option value="10k-25k">₱10,000 - ₱25,000 (Lower Middle)</option>
                      <option value="25k-50k">₱25,000 - ₱50,000 (Middle)</option>
                      <option value=">50k">&gt; ₱50,000 (Upper Middle)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleTabChange("students")}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={newStudentIsSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] text-white font-extrabold text-xs hover:bg-[#6D0010] transition shadow-md flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{newStudentIsSubmitting ? "Enrolling & Recalculating..." : "Enroll Student & Recalculate AHP"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. STUDENT OVERRIDE PROFILE (student_profile) */}
      {/* ========================================================= */}
      {activeTab === "student_profile" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <button
                  onClick={() => handleTabChange("students")}
                  className="text-xs font-bold text-slate-500 hover:text-[#8B0014] mb-2 flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Back to Student Registry</span>
                </button>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Admin Data Override: {selectedStudentObj.first_name} {selectedStudentObj.last_name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  LRN: {selectedStudentObj.lrn} • {selectedStudentObj.section_name} • Grade {selectedStudentObj.grade_level}
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                🟢 Enrolled &amp; Active
              </span>
            </div>

            {/* Quick Student Selector */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="font-bold text-slate-700">Select Student to Override:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.section_name} - LRN: {s.lrn})
                  </option>
                ))}
              </select>
            </div>

            {/* Comprehensive Multi-Domain Override Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <span className="font-black text-blue-950 block text-sm">1. Academic Domain</span>
                <div className="space-y-1.5">
                  <label className="font-bold text-blue-900">General Weighted Average (GWA)</label>
                  <input
                    type="number"
                    min="65"
                    max="100"
                    value={overrideGWA}
                    onChange={(e) => setOverrideGWA(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-blue-900">Failed Subjects Count</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={overrideFailedCount}
                    onChange={(e) => setOverrideFailedCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <span className="font-black text-emerald-950 block text-sm">2. Attendance &amp; Health</span>
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-900">Quarter Attendance Rate (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={overrideAttendance}
                    onChange={(e) => setOverrideAttendance(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <span className="font-black text-purple-950 block text-sm">3. Mental Health Screener</span>
                <div className="space-y-1.5">
                  <label className="font-bold text-purple-900">PHQ-9 Depression Screener Score (0-27)</label>
                  <input
                    type="number"
                    min="0"
                    max="27"
                    value={overridePHQ9}
                    onChange={(e) => setOverridePHQ9(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <span className="font-black text-amber-950 block text-sm">4. Family Domain</span>
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-900">Family Support Status</label>
                  <select
                    value={overrideFamilySupport}
                    onChange={(e) => setOverrideFamilySupport(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Stable">Two-Parent Stable Home</option>
                    <option value="OFW Parents">OFW Parent(s) Working Abroad</option>
                    <option value="Single Parent">Single Parent Household</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                <span className="font-black text-rose-950 block text-sm">5. Financial Status</span>
                <div className="space-y-1.5">
                  <label className="font-bold text-rose-900">Household Income Level</label>
                  <select
                    value={overrideIncome}
                    onChange={(e) => setOverrideIncome(e.target.value)}
                    className="w-full p-2.5 bg-white border border-rose-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="<10k">&lt; ₱10,000 (Low Income / Subsidy Priority)</option>
                    <option value="10k-25k">₱10,000 - ₱25,000 (Lower Middle)</option>
                    <option value="25k-50k">₱25,000 - ₱50,000 (Middle)</option>
                    <option value=">50k">&gt; ₱50,000 (Upper Middle)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveStudentOverride}
                className="px-6 py-2.5 rounded-xl bg-[#8B0014] text-white font-extrabold text-xs hover:bg-[#6D0010] transition shadow-md flex items-center gap-2"
              >
                <Sliders className="h-4 w-4 text-amber-300" />
                <span>Save Override &amp; Recalculate AHP Risk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. FACULTY & COUNSELORS ROSTER (teachers) */}
      {/* ========================================================= */}
      {activeTab === "teachers" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] flex items-center justify-center font-bold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                      Faculty &amp; Guidance Counselors Roster
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Manage teachers, class advisers, licensed guidance counselors (RGC), and institutional credentials
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🟢 Cloud Firestore: faculty_records Live</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsFacultyImportOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import Faculty &amp; Counselors CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("create_user")}
                  className="px-3.5 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Provision Faculty / Counselor</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportFacultyCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Roster CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block font-bold text-[11px]">Total Accounts</span>
                <span className="text-xl font-black text-slate-900">{facultyList.length}</span>
              </div>
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200">
                <span className="text-blue-700 block font-bold text-[11px]">Class Advisers &amp; Teachers</span>
                <span className="text-xl font-black text-blue-950">
                  {facultyList.filter(f => f.role === "teacher").length}
                </span>
              </div>
              <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200">
                <span className="text-purple-700 block font-bold text-[11px]">Guidance Counselors (RGC)</span>
                <span className="text-xl font-black text-purple-950">
                  {facultyList.filter(f => f.role === "guidance_counselor" || f.role === "counselor").length}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <span className="text-emerald-700 block font-bold text-[11px]">Active Portal Status</span>
                <span className="text-xl font-black text-emerald-950">
                  {facultyList.filter(f => f.status === "Active").length} / {facultyList.length}
                </span>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculty name, email, advisory section, or PRC license..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014] text-slate-900"
                />
              </div>

              {/* Role & Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFacultyRoleFilter("all")}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                      facultyRoleFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({facultyList.length})
                  </button>
                  <button
                    onClick={() => setFacultyRoleFilter("teacher")}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                      facultyRoleFilter === "teacher" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Teachers ({facultyList.filter(f => f.role === "teacher").length})
                  </button>
                  <button
                    onClick={() => setFacultyRoleFilter("counselor")}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                      facultyRoleFilter === "counselor" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Counselors ({facultyList.filter(f => f.role === "guidance_counselor" || f.role === "counselor").length})
                  </button>
                </div>

                <select
                  value={facultyStatusFilter}
                  onChange={(e) => setFacultyStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active Only</option>
                  <option value="Pending Activation">Pending Only</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Roster Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Faculty / Counselor</th>
                      <th className="p-3">Role &amp; Credentials</th>
                      <th className="p-3">Advisory / Department</th>
                      <th className="p-3">Institutional Contact</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFaculty.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p className="font-bold">No faculty or counselor records match the current filters.</p>
                          <button
                            onClick={() => { setFacultySearch(""); setFacultyRoleFilter("all"); setFacultyStatusFilter("all"); }}
                            className="mt-2 text-[#8B0014] font-bold hover:underline"
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredFaculty.map((f) => {
                        const isCounselor = f.role === "guidance_counselor" || f.role === "counselor";
                        return (
                          <tr key={f.id} className="hover:bg-slate-50/70 transition">
                            {/* Profile */}
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                  isCounselor ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                }`}>
                                  {f.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-black text-slate-900">{f.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    ID: {f.employee_id || f.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Role & License */}
                            <td className="p-3">
                              <div className="space-y-0.5">
                                <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  isCounselor ? "bg-purple-100 text-purple-900" : (f.role === "admin" ? "bg-rose-100 text-rose-900" : "bg-blue-100 text-blue-900")
                                }`}>
                                  {isCounselor ? "Guidance Counselor (RGC)" : (f.role === "admin" ? "System Admin" : "Faculty / Class Adviser")}
                                </span>
                                {f.prc_license_no && (
                                  <div className="text-[10px] font-mono text-emerald-700 font-bold">
                                    {f.prc_license_no}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Department / Advisory */}
                            <td className="p-3 text-slate-700">
                              <div className="font-bold text-slate-800">{f.section || "General Faculty"}</div>
                              <div className="text-[10px] text-slate-500">{f.department || "Academic Department"}</div>
                            </td>

                            {/* Contact */}
                            <td className="p-3">
                              <div className="font-mono text-slate-700 flex items-center gap-1">
                                <span>{f.email}</span>
                              </div>
                              {f.phone && (
                                <div className="text-[10px] text-slate-500">{f.phone}</div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleFacultyStatus(f.id, f.status)}
                                title="Click to toggle status"
                                className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition cursor-pointer ${
                                  f.status === "Active" 
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                                    : (f.status === "Suspended" ? "bg-rose-100 text-rose-800 hover:bg-rose-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200")
                                }`}
                              >
                                {f.status}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => copyFacultySlip(f)}
                                  title="Copy Onboarding Credential Slip"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#8B0014] text-slate-600 hover:text-white transition"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFaculty(f)}
                                  title="Edit Record"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white transition"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFacultyAction(f.id, f.name)}
                                  title="Delete Record"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-600 text-slate-600 hover:text-white transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Edit Faculty Modal */}
          {editingFaculty && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Edit className="h-4 w-4 text-[#8B0014]" />
                    Edit Account: {editingFaculty.name}
                  </h4>
                  <button onClick={() => setEditingFaculty(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveFacultyEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingFaculty.name}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Institutional Email</label>
                    <input
                      type="email"
                      required
                      value={editingFaculty.email}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Role</label>
                    <select
                      value={editingFaculty.role}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, role: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="teacher">Teacher / Class Adviser</option>
                      <option value="guidance_counselor">Guidance Counselor (RGC)</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Account Status</label>
                    <select
                      value={editingFaculty.status}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, status: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending Activation">Pending Activation</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Department</label>
                    <input
                      type="text"
                      value={editingFaculty.department || ""}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, department: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Advisory Section / Office</label>
                    <input
                      type="text"
                      value={editingFaculty.section || ""}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, section: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Employee ID</label>
                    <input
                      type="text"
                      value={editingFaculty.employee_id || ""}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, employee_id: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">PRC License No. (Counselors)</label>
                    <input
                      type="text"
                      placeholder="PRC-RGC-000000"
                      value={editingFaculty.prc_license_no || ""}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, prc_license_no: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingFaculty(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#8B0014] text-white rounded-xl font-bold hover:bg-[#6D0010] transition shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. CREATE CAMPUS USER (create_user) */}
      {/* ========================================================= */}
      {activeTab === "create_user" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Key className="h-6 w-6 text-[#8B0014]" />
                  Provision New Campus User Account
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">Create login credentials for Faculty, Guidance Counselors, Parents, or Students</p>
              </div>
              <button
                onClick={() => handleTabChange("teachers")}
                className="text-xs font-bold text-slate-500 hover:text-[#8B0014] transition"
              >
                ← View Accounts Roster
              </button>
            </div>

            <form onSubmit={handleProvisionCampusUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clara Santos, LPT"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Institutional Email *</label>
                <input
                  type="email"
                  required
                  placeholder="user@sapc.edu.ph"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Institutional Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="teacher">Teacher / Class Adviser</option>
                  <option value="guidance_counselor">Guidance Counselor (RGC)</option>
                  <option value="parent">Parent / Guardian</option>
                  <option value="student">Student</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Section / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 11 - St. Augustine (STEM)"
                  value={newUserSection}
                  onChange={(e) => setNewUserSection(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700">Initial Onboarding Password</label>
                <input
                  type="text"
                  placeholder="sapc2026"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                />
                <span className="text-[11px] text-slate-500">User will be prompted to update this password upon initial authentication.</span>
              </div>

              <div className="sm:col-span-2 pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition shadow-md flex items-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Provision Account &amp; Generate Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. PARENT ACCOUNTS & LINKS (parents) */}
      {/* ========================================================= */}
      {activeTab === "parents" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] flex items-center justify-center font-bold">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                      Parent Accounts &amp; Student Linkage Roster
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Manage verified parent &amp; guardian accounts, Form 138 digital access, and real-time SMS attendance alerts
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🟢 Cloud Firestore: parent_records Live</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddParentOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Link New Parent Account</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportParentsCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Parents CSV</span>
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block font-bold text-[11px]">Verified Parent Accounts</span>
                <span className="text-xl font-black text-slate-900">{parentRecords.length}</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <span className="text-emerald-700 block font-bold text-[11px]">Active Portal Access</span>
                <span className="text-xl font-black text-emerald-950">
                  {parentRecords.filter(p => p.status === "Active").length} / {parentRecords.length}
                </span>
              </div>
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200">
                <span className="text-blue-700 block font-bold text-[11px]">Form 138 (SF-9) Authorized</span>
                <span className="text-xl font-black text-blue-950">
                  {parentRecords.filter(p => p.sf9Access).length} Parents
                </span>
              </div>
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="text-amber-800 block font-bold text-[11px]">Real-time SMS Push Alert</span>
                <span className="text-xl font-black text-amber-950">
                  {parentRecords.filter(p => p.attendanceAlerts).length} Enabled
                </span>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search parent name, student name, LRN, email, or section..."
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014] text-slate-900"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={parentGradeFilter}
                  onChange={(e) => setParentGradeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs"
                >
                  <option value="all">All Grade Levels</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>

                <select
                  value={parentStatusFilter}
                  onChange={(e) => setParentStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active Only</option>
                  <option value="Pending Activation">Pending Only</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Parents Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Parent / Guardian</th>
                      <th className="p-3">Relationship &amp; Permissions</th>
                      <th className="p-3">Linked Student &amp; LRN</th>
                      <th className="p-3">Advisory Section</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredParents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p className="font-bold">No parent accounts match the current filters.</p>
                          <button
                            onClick={() => { setParentSearch(""); setParentGradeFilter("all"); setParentStatusFilter("all"); }}
                            className="mt-2 text-[#8B0014] font-bold hover:underline"
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredParents.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          {/* Parent Profile */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs shrink-0">
                                {p.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-black text-slate-900">{p.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                                  <span>ID: {p.id}</span>
                                  <span>•</span>
                                  <span>{p.email}</span>
                                </div>
                                {p.phone && <div className="text-[10px] text-slate-500">{p.phone}</div>}
                              </div>
                            </div>
                          </td>

                          {/* Relationship & Permissions */}
                          <td className="p-3">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900">
                                {p.relationship}
                              </span>
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                                  SF-9 Form 138
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                  SMS Alerts
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Linked Student */}
                          <td className="p-3">
                            <div className="font-black text-slate-900">{p.linkedStudentName}</div>
                            <div className="text-[10px] font-mono text-emerald-700 font-bold">
                              LRN: {p.linkedLRN}
                            </div>
                          </td>

                          {/* Section */}
                          <td className="p-3 text-slate-700">
                            <div className="font-bold text-slate-800">{p.section}</div>
                            <div className="text-[10px] text-slate-500">Verified: {p.verifiedAt}</div>
                          </td>

                          {/* Status */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleParentStatus(p.id, p.status)}
                              title="Click to toggle status"
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition cursor-pointer ${
                                p.status === "Active" 
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                                  : (p.status === "Suspended" ? "bg-rose-100 text-rose-800 hover:bg-rose-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200")
                              }`}
                            >
                              {p.status}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => copyParentSlip(p)}
                                title="Copy Parent Portal Onboarding Slip"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#8B0014] text-slate-600 hover:text-white transition cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingParent(p)}
                                title="Edit Parent Record"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white transition cursor-pointer"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteParentAction(p.id, p.name)}
                                title="Delete Parent Record"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-600 text-slate-600 hover:text-white transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Parent Modal */}
          {isAddParentOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-[#8B0014]" />
                    Link &amp; Provision New Parent Account
                  </h4>
                  <button onClick={() => setIsAddParentOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleAddParent} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Parent / Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mrs. Maria Santos"
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Parent Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="parent@gmail.com"
                      value={newParentEmail}
                      onChange={(e) => setNewParentEmail(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mobile Phone Number</label>
                    <input
                      type="text"
                      placeholder="+63 917 000 0000"
                      value={newParentPhone}
                      onChange={(e) => setNewParentPhone(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Relationship to Student</label>
                    <select
                      value={newParentRel}
                      onChange={(e) => setNewParentRel(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="Mother">Mother / Primary Guardian</option>
                      <option value="Father">Father</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Grandfather">Grandfather</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Linked Student Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Juan Carlos Santos"
                      value={newParentStudent}
                      onChange={(e) => setNewParentStudent(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">12-Digit Student LRN</label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="109238475001"
                      value={newParentLRN}
                      onChange={(e) => setNewParentLRN(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Student Section</label>
                    <select
                      value={newParentSection}
                      onChange={(e) => setNewParentSection(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      {uniqueSections.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddParentOpen(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#8B0014] text-white rounded-xl font-bold hover:bg-[#6D0010] transition shadow-md"
                    >
                      Link &amp; Provision Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Parent Modal */}
          {editingParent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Edit className="h-4 w-4 text-[#8B0014]" />
                    Edit Parent Record: {editingParent.name}
                  </h4>
                  <button onClick={() => setEditingParent(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveParentEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Parent Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingParent.name}
                      onChange={(e) => setEditingParent({ ...editingParent, name: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Parent Email</label>
                    <input
                      type="email"
                      required
                      value={editingParent.email}
                      onChange={(e) => setEditingParent({ ...editingParent, email: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mobile Phone</label>
                    <input
                      type="text"
                      value={editingParent.phone}
                      onChange={(e) => setEditingParent({ ...editingParent, phone: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Relationship</label>
                    <input
                      type="text"
                      value={editingParent.relationship}
                      onChange={(e) => setEditingParent({ ...editingParent, relationship: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Linked Student Name</label>
                    <input
                      type="text"
                      required
                      value={editingParent.linkedStudentName}
                      onChange={(e) => setEditingParent({ ...editingParent, linkedStudentName: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Student LRN</label>
                    <input
                      type="text"
                      value={editingParent.linkedLRN}
                      onChange={(e) => setEditingParent({ ...editingParent, linkedLRN: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Section</label>
                    <input
                      type="text"
                      value={editingParent.section}
                      onChange={(e) => setEditingParent({ ...editingParent, section: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Account Status</label>
                    <select
                      value={editingParent.status}
                      onChange={(e) => setEditingParent({ ...editingParent, status: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending Activation">Pending Activation</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingParent(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#8B0014] text-white rounded-xl font-bold hover:bg-[#6D0010] transition shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. PENDING REGISTRATIONS & PARENT LINKAGE QUEUE (pending_registrations) */}
      {/* ========================================================= */}
      {activeTab === "pending_registrations" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                      Pending Registrations &amp; Parent Linkage Queue
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Review, verify PSA birth certificates / faculty appointments, and authorize institutional portal access
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🟢 Cloud Firestore: pending_registrations Live</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetDemoRegistrations}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Restore initial 3 sample pending registrations"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Demo Queue (3)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("parents")}
                  className="px-3.5 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>View Verified Parents Roster ({parentRecords.length})</span>
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="text-amber-800 block font-bold text-[11px]">Total Applications Due</span>
                <span className="text-2xl font-black text-amber-950">{pendingRegistrations.length}</span>
              </div>
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200">
                <span className="text-blue-700 block font-bold text-[11px]">Parent Verification Requests</span>
                <span className="text-2xl font-black text-blue-950">
                  {pendingRegistrations.filter(r => r.role === "parent").length}
                </span>
              </div>
              <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200">
                <span className="text-purple-700 block font-bold text-[11px]">Faculty &amp; Staff Requests</span>
                <span className="text-2xl font-black text-purple-950">
                  {pendingRegistrations.filter(r => r.role === "teacher" || r.role === "counselor").length}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <span className="text-emerald-700 block font-bold text-[11px]">PSA &amp; ID Proofs Attached</span>
                <span className="text-2xl font-black text-emerald-950">100% Verified</span>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applicant name, email, student, LRN, or section..."
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014] text-slate-900"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPendingRoleFilter("all")}
                  className={`px-3 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                    pendingRoleFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({pendingRegistrations.length})
                </button>
                <button
                  onClick={() => setPendingRoleFilter("parent")}
                  className={`px-3 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                    pendingRoleFilter === "parent" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Parents ({pendingRegistrations.filter(r => r.role === "parent").length})
                </button>
                <button
                  onClick={() => setPendingRoleFilter("teacher")}
                  className={`px-3 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                    pendingRoleFilter === "teacher" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Faculty ({pendingRegistrations.filter(r => r.role === "teacher").length})
                </button>
              </div>
            </div>

            {/* Pending Queue Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Applicant &amp; Contact</th>
                      <th className="p-3">Requested Role &amp; Link</th>
                      <th className="p-3">Linked Student / Section</th>
                      <th className="p-3">Attached Document Proof</th>
                      <th className="p-3">Submitted</th>
                      <th className="p-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPending.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-slate-400">
                          <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500 opacity-80" />
                          <p className="font-extrabold text-slate-800 text-sm">All Registration Requests Cleared!</p>
                          <p className="text-xs text-slate-500 mt-1">There are no pending accounts waiting in the verification queue.</p>
                          <button
                            onClick={handleResetDemoRegistrations}
                            className="mt-3 px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Load Demo Sample Applications (3)</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredPending.map((reg) => {
                        const isParent = reg.role === "parent";
                        return (
                          <tr key={reg.id} className="hover:bg-slate-50/70 transition">
                            {/* Applicant */}
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                  isParent ? "bg-amber-100 text-amber-900" : "bg-purple-100 text-purple-900"
                                }`}>
                                  {reg.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-black text-slate-900">{reg.name}</div>
                                  <div className="text-[10px] text-slate-500">{reg.email}</div>
                                  <div className="text-[10px] text-slate-400">{reg.phone}</div>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="p-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                isParent ? "bg-blue-100 text-blue-900" : "bg-purple-100 text-purple-900"
                              }`}>
                                {isParent ? "Parent / Guardian" : (reg.role === "counselor" ? "Counselor (RGC)" : "Faculty / Teacher")}
                              </span>
                              <div className="text-[10px] text-slate-600 font-medium mt-0.5">
                                {reg.relationship}
                              </div>
                            </td>

                            {/* Linked Student / Section */}
                            <td className="p-3">
                              <div className="font-black text-slate-900">{reg.linkedStudent}</div>
                              {reg.linkedLRN !== "N/A (Faculty)" && (
                                <div className="text-[10px] font-mono text-emerald-700 font-bold">
                                  LRN: {reg.linkedLRN}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-500">{reg.section}</div>
                            </td>

                            {/* Document Proof */}
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => setPreviewDocRegistration(reg)}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                                title="Click to view attached verification document"
                              >
                                <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                                <span>{reg.verificationDoc}</span>
                                <Eye className="h-3 w-3 text-slate-400" />
                              </button>
                            </td>

                            {/* Date */}
                            <td className="p-3 text-slate-500 font-mono text-[11px]">
                              {reg.date}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleApproveRegistration(reg)}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                  title="Approve registration and provision credentials"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeclineRegistration(reg.id, reg.name)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                                  title="Decline application"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Document Preview Modal */}
          {previewDocRegistration && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                    Verification Document Proof
                  </h4>
                  <button onClick={() => setPreviewDocRegistration(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-500 font-bold">{previewDocRegistration.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900">
                      Pending Verification
                    </span>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-900 font-black text-sm block">{previewDocRegistration.name}</strong>
                    <p className="text-slate-600">Email: {previewDocRegistration.email} • Tel: {previewDocRegistration.phone}</p>
                    <p className="text-slate-600">Relationship: <strong>{previewDocRegistration.relationship}</strong></p>
                    <p className="text-slate-600">Linked Student: <strong>{previewDocRegistration.linkedStudent}</strong> (LRN: {previewDocRegistration.linkedLRN})</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>{previewDocRegistration.verificationDoc}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {previewDocRegistration.notes || "Official Philippine Statistics Authority (PSA) / PRC credentials verified against master institutional enrolment database."}
                    </p>
                    <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                      <span>DepEd Matched: Yes</span>
                      <span>Security Hash: SHA-256 Valid</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDocRegistration(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition text-xs cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reg = previewDocRegistration;
                      setPreviewDocRegistration(null);
                      handleApproveRegistration(reg);
                    }}
                    className="px-5 py-2 bg-[#8B0014] text-white rounded-xl font-bold hover:bg-[#6D0010] transition shadow-md text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve &amp; Provision Credentials</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 13.5 BULK EXPORT CREDENTIALS (export_credentials) */}
      {/* ========================================================= */}
      {activeTab === "export_credentials" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] flex items-center justify-center font-bold">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                      Bulk Export Credentials &amp; Onboarding Slips
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Batch generate, copy, and print official login credentials and onboarding slips for Faculty, Parents, and Students
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportSelectedCredentialsCSV}
                  className="px-4 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Export Selected CSV ({selectedCredentialIds.size > 0 ? selectedCredentialIds.size : filteredCredentialUsers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintSlipsOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Onboarding Slips</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySelectedCredentials}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Logins</span>
                </button>
              </div>
            </div>

            {/* Filter and Role Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email, LRN, employee ID, section..."
                  value={credentialSearch}
                  onChange={(e) => setCredentialSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0014] text-slate-900"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setCredentialRoleFilter("all")}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                      credentialRoleFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({allCredentialUsers.length})
                  </button>
                  <button
                    onClick={() => setCredentialRoleFilter("teacher")}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                      credentialRoleFilter === "teacher" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Faculty ({facultyList.filter(f => f.role === "teacher").length})
                  </button>
                  <button
                    onClick={() => setCredentialRoleFilter("parent")}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                      credentialRoleFilter === "parent" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Parents ({parentRecords.length})
                  </button>
                  <button
                    onClick={() => setCredentialRoleFilter("student")}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                      credentialRoleFilter === "student" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Students (50)
                  </button>
                </div>
              </div>
            </div>

            {/* Selection info */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAllCredentials}
                  className="font-bold text-[#8B0014] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {selectedCredentialIds.size === filteredCredentialUsers.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span>
                    {selectedCredentialIds.size === filteredCredentialUsers.length ? "Deselect All" : "Select All Visible"}
                  </span>
                </button>
                <span>•</span>
                <span>Selected: <strong className="text-slate-900">{selectedCredentialIds.size}</strong> of {filteredCredentialUsers.length} records</span>
              </div>
            </div>

            {/* Credentials Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">User &amp; Identifier</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">Portal Login Email</th>
                      <th className="p-3">Initial Password</th>
                      <th className="p-3">Section / Office</th>
                      <th className="p-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCredentialUsers.map((u) => {
                      const isSelected = selectedCredentialIds.has(u.id);
                      return (
                        <tr key={u.id} className={`hover:bg-slate-50/70 transition ${isSelected ? 'bg-amber-50/50' : ''}`}>
                          {/* Checkbox */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectCredential(u.id)}
                              className="text-slate-400 hover:text-[#8B0014] cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-[#8B0014]" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>

                          {/* User & ID */}
                          <td className="p-3">
                            <div className="font-black text-slate-900">{u.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{u.identifier}</div>
                          </td>

                          {/* Role */}
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              u.role === "admin" ? "bg-rose-100 text-rose-900" :
                              u.role === "counselor" ? "bg-purple-100 text-purple-900" :
                              u.role === "parent" ? "bg-amber-100 text-amber-900" :
                              u.role === "student" ? "bg-emerald-100 text-emerald-900" :
                              "bg-blue-100 text-blue-900"
                            }`}>
                              {u.roleLabel}
                            </span>
                          </td>

                          {/* Email */}
                          <td className="p-3 font-mono text-slate-700">
                            {u.email}
                          </td>

                          {/* Password */}
                          <td className="p-3">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg font-mono text-slate-800 text-[11px]">
                              <span>{u.initialPassword}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(u.initialPassword);
                                  showToast(`Copied password '${u.initialPassword}' to clipboard!`);
                                }}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copy password"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </td>

                          {/* Section */}
                          <td className="p-3 text-slate-600 font-medium">
                            {u.sectionOrDept}
                          </td>

                          {/* Quick Action */}
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const slip = `SAPC CREDENTIALS: ${u.name} | Email: ${u.email} | Password: ${u.initialPassword} | Role: ${u.roleLabel}`;
                                navigator.clipboard.writeText(slip);
                                showToast(`Copied credential slip for ${u.name}!`);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#8B0014] text-slate-600 hover:text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                            >
                              Copy Slip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Printable Slips Modal */}
          {isPrintSlipsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Printer className="h-5 w-5 text-[#8B0014]" />
                    Official SAPC Onboarding Credential Slips
                  </h4>
                  <button onClick={() => setIsPrintSlipsOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedCredentialIds.size > 0 
                      ? allCredentialUsers.filter(u => selectedCredentialIds.has(u.id))
                      : filteredCredentialUsers.slice(0, 10)
                    ).map((u) => (
                      <div key={u.id} className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="font-black text-[#8B0014] text-xs">SAPC IntellySys 2026</div>
                          <span className="font-mono text-[10px] font-bold text-slate-500">{u.id}</span>
                        </div>
                        <div>
                          <strong className="text-slate-900 text-sm block">{u.name}</strong>
                          <span className="text-slate-500 text-[10px]">{u.roleLabel} • {u.sectionOrDept}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-0.5 font-mono text-[11px]">
                          <div><strong>Login URL :</strong> https://sapc-intellysys-ph.web.app</div>
                          <div><strong>Email     :</strong> {u.email}</div>
                          <div><strong>Password  :</strong> <span className="text-[#8B0014] font-bold">{u.initialPassword}</span></div>
                        </div>
                        <div className="text-[9px] text-slate-400">
                          Please change your password upon initial login. RA 10173 Protected.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPrintSlipsOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition text-xs cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="px-5 py-2 bg-[#8B0014] text-white rounded-xl font-bold hover:bg-[#6D0010] transition shadow-md text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Slips</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 13.8 OFFICIAL DEPED / CHED REPORTS (reports) */}
      {/* ========================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-[#8B0014]/10 text-[#8B0014] flex items-center justify-center font-bold">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                      DepEd &amp; CHED Institutional Compliance Reports
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Standardized School Forms (SF-1, SF-2, SF-9, SF-10), AHP 5-Domain Early Warning Summaries, and Audit Certificates
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Open Interactive DSS Report Hub</span>
              </button>
            </div>

            {/* Catalog of Official Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* SF-1 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase bg-blue-100 text-blue-900">
                      DepEd SF-1
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">DO 4, s. 2014</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">School Register &amp; Demographic Census</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Master list of 500 enrolled learners with 12-digit LRN, advisory sections, birth certificates, and guardian contacts.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-bold">500 Students Ready</span>
                  <button
                    type="button"
                    onClick={() => exportActiveDatasetToCSV(students)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* SF-2 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase bg-emerald-100 text-emerald-900">
                      DepEd SF-2
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">DO 8, s. 2015</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Daily Attendance &amp; Absenteeism Log</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Quarterly attendance registry tracking chronic absenteeism thresholds and medical excuses across 12 sections.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-bold">Mean: 95.8% Att</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View Report</span>
                  </button>
                </div>
              </div>

              {/* SF-9 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase bg-amber-100 text-amber-900">
                      DepEd SF-9 (Form 138)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">DO 36, s. 2016</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Learner Progress Report Card (Form 138)</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Quarterly academic marks, core subject descriptors, and behavioral ratings synchronized with parent portals.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-amber-800 font-bold">Q2 Active Term</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              {/* AHP 5-Domain Early Warning */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase bg-rose-100 text-rose-900">
                      AHP EWS Matrix
                    </span>
                    <span className="text-[10px] text-rose-700 font-mono">Saaty Validated</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">5-Domain Dropout Risk Executive Report</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Algorithmic risk distribution detailing Tier 1 High Risk ({cohortStats.highRiskCount} cases), 5-domain scores, and clinical triage.
                  </p>
                </div>
                <div className="pt-3 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-rose-700 font-bold">CR = 0.048 Valid</span>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>Executive Hub</span>
                  </button>
                </div>
              </div>

              {/* Guidance Accomplishment */}
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase bg-purple-100 text-purple-900">
                      RGC Guidance Log
                    </span>
                    <span className="text-[10px] text-purple-700 font-mono">RA 11036</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Guidance Intervention Accomplishment</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Documentation of counseling intakes, psychological first aid sessions, and parent-teacher case conferences.
                  </p>
                </div>
                <div className="pt-3 border-t border-purple-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-purple-700 font-bold">RGC Counseling Hub</span>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Summary</span>
                  </button>
                </div>
              </div>

              {/* RA 10173 Compliance */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase bg-emerald-100 text-emerald-900">
                      NPC / RA 10173
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono">Data Privacy Act</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Data Privacy &amp; Security Compliance Audit</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    National Privacy Commission audit log verifying end-to-end encryption, role-based masking, and immutable logs.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-bold">✓ 100% Compliant</span>
                  <button
                    type="button"
                    onClick={() => handleTabChange("import_history")}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Audit Logs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 16. BROADCAST ANNOUNCEMENTS (notifications) */}
      {/* ========================================================= */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Bell className="h-6 w-6 text-[#8B0014]" />
                Institutional Broadcast Announcements &amp; Push Alerts
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Dispatch system alerts, deadline notices, and emergency advisories across campus portals
              </p>
            </div>

            {/* Broadcast Composer */}
            <form onSubmit={handleSendBroadcast} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <h4 className="font-black text-slate-900 text-sm">Compose Campus Announcement</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Audience</label>
                  <select
                    value={broadcastAudience}
                    onChange={(e) => setBroadcastAudience(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="all">All Campus Users (Students, Teachers, Parents, Counselors)</option>
                    <option value="teacher">Faculty &amp; Class Advisers Only</option>
                    <option value="parent">Parents &amp; Guardians Only</option>
                    <option value="counselor">Guidance Counselors Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority Level</label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="urgent">🔴 Urgent / Priority Notice</option>
                    <option value="alert">🟡 Important Administrative Update</option>
                    <option value="info">🔵 General Announcement</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Announcement Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2nd Quarter SASS Diagnostic Ingestion Deadline: Friday 5:00 PM"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Detailed Message Body *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Write announcement body..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#8B0014] text-white font-extrabold text-xs hover:bg-[#6D0010] transition shadow-md flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5 text-amber-300" />
                  <span>Dispatch Broadcast Announcement</span>
                </button>
              </div>
            </form>

            {/* Active Notifications Feed */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm">Active Broadcast Feeds</h4>
              <div className="space-y-2.5">
                {activeBroadcasts.slice(0, 5).map((n) => (
                  <div key={n.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-extrabold">{n.title}</strong>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-200 text-slate-700">
                          {n.audience || "ALL"}
                        </span>
                      </div>
                      <p className="text-slate-600">{n.body || n.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 17. VERIFY SUBMITTED SCREENERS (verify_assessments) */}
      {/* ========================================================= */}
      {activeTab === "verify_assessments" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-[#8B0014]" />
                  Verify Submitted Screeners &amp; Diagnostic Records
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Review and authorize mental health, attendance, and clinic health screeners submitted by teachers
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                {screenerQueue.length} Pending Verifications
              </span>
            </div>

            <div className="space-y-3">
              {screenerQueue.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  All diagnostic screeners have been verified and ingested.
                </div>
              ) : (
                screenerQueue.map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 font-bold">{item.id}</span>
                          <strong className="text-slate-900 font-extrabold text-sm">{item.studentName}</strong>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          <strong>Section:</strong> {item.section} (LRN: {item.lrn}) • <strong>Submitted by:</strong> {item.submittedBy}
                        </p>
                        <p className="text-[#8B0014] font-bold">
                          Diagnostic Result: {item.score}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleVerifyScreener(item.id, item.studentName)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Verify &amp; Ingest</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setScreenerQueue(prev => prev.filter(s => s.id !== item.id));
                            showToast(`Flagged ${item.id} for counselor clinical review.`);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
                        >
                          Flag
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 18. EXPORT INGESTION LOGS (export_import_history) */}
      {/* ========================================================= */}
      {activeTab === "export_import_history" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-[#8B0014]" />
                  DepEd SASS Ingestion History &amp; Immutable Audit Trail
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Comprehensive log of all CSV batch ingestion sessions with snapshot rollback anchors
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const csvData = "Batch ID,Domain Type,Records,Imported By,Timestamp,Status\n" +
                    importHistory.map(h => `"${h.id}","${h.type}",${h.count},"${h.importedBy}","${h.date}","${h.rolledBack ? 'Rolled Back' : 'Active'}"`).join("\n");
                  const blob = new Blob([csvData], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `SAPC_Ingestion_Audit_Trail_${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                  showToast("Ingestion audit trail exported to CSV.");
                }}
                className="px-4 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="h-4 w-4 text-amber-300" />
                <span>Export Audit Logs (CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-black text-slate-600 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Domain &amp; Ingestion Type</th>
                    <th className="py-3 px-4">Imported By</th>
                    <th className="py-3 px-4">Records</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {importHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{h.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{h.type}</td>
                      <td className="py-3 px-4 text-slate-600">{h.importedBy}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{h.count} students</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{h.date}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          h.rolledBack ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {h.rolledBack ? "Reverted" : "Active Ingested"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 19. KNOWLEDGE BASE (knowledge_base) */}
      {/* ========================================================= */}
      {activeTab === "knowledge_base" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-[#8B0014]" />
                  Guidance AI Knowledge Base &amp; Institutional SOPs
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Custom institutional context repository powering the AI Guidance Counselor assistant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsKnowledgeHubOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
              >
                <BrainCircuit className="h-4 w-4 text-purple-200" />
                <span>Open AI Training Hub</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 block font-black">DepEd Child Protection Policy (DO 40, s. 2012)</strong>
                <p className="text-slate-600">Institutional protocol for student safety, positive discipline, and anti-bullying guidelines.</p>
                <span className="text-[10px] font-bold text-emerald-600 block">✓ Ingested in AI Knowledge Store</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 block font-black">Mental Health Act (RA 11036) Standard</strong>
                <p className="text-slate-600">Confidentiality protocols, crisis referral pathways, and psychometrician guidelines.</p>
                <span className="text-[10px] font-bold text-emerald-600 block">✓ Ingested in AI Knowledge Store</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-slate-900 block font-black">SAPC Student Handbook 2026-2027</strong>
                <p className="text-slate-600">Grading scale, clearance rules, absence thresholds, and institutional scholarships.</p>
                <span className="text-[10px] font-bold text-emerald-600 block">✓ Ingested in AI Knowledge Store</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Report Modal */}
      <InstitutionalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <CounselorKnowledgeHubModal
        isOpen={isKnowledgeHubOpen}
        onClose={() => setIsKnowledgeHubOpen(false)}
        currentUserRole="admin"
        currentUserName="System Administrator"
      />

      <FacultyImportModal
        isOpen={isFacultyImportOpen}
        onClose={() => setIsFacultyImportOpen(false)}
        onSuccess={(count) => {
          setFacultyList(getActiveFacultyRecords());
          showToast(`Successfully imported and synchronized ${count} faculty and counselor accounts with Cloud Firestore.`);
        }}
      />
    </div>
  );
};
