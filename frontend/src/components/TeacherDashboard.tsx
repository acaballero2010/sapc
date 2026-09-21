"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  BookOpen, 
  HeartHandshake, 
  AlertTriangle, 
  Layers, 
  Upload, 
  CheckCircle2, 
  Search, 
  Eye, 
  Download, 
  RotateCcw, 
  Edit3, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Calendar, 
  Bell, 
  Key, 
  MessageSquare, 
  FileSpreadsheet, 
  ChevronLeft,
  ChevronRight,
  BarChart3, 
  Plus, 
  Trash2, 
  Info,
  GraduationCap,
  Save,
  Send,
  UserCheck,
  Percent,
  FileText
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SAPC_500_STUDENTS, StudentRecord } from "@/data/students500";
import { 
  getActiveStudentDataset, 
  saveStudentDataset, 
  recalculateAHPForDataset,
  subscribeToStudentDataset,
  loadStudentDatasetFromFirestore
} from "@/lib/dataset-store";
import { useDragScroll } from "@/lib/useDragScroll";
import { RiskBadge } from "./RiskBadge";
import { StudentDetailModal } from "./StudentDetailModal";
import { TeacherReferralModal } from "./TeacherReferralModal";
import { SubjectFailurePredictor } from "./SubjectFailurePredictor";

export type TeacherTabType = 
  | "dashboard"
  | "students"
  | "subject_predictor"
  | "student_profile"
  | "student_progress"
  | "at_risk"
  | "import_wizard"
  | "import_students"
  | "import_grades"
  | "import_attendance"
  | "import_history"
  | "revert_import"
  | "csv_editor"
  | "interventions"
  | "suggestions"
  | "log_progress"
  | "complete_intervention"
  | "class_record"
  | "attendance_record"
  | "notifications"
  | "export_credentials"
  | "messages";

interface ImportHistoryItem {
  id: string;
  type: string;
  fileName: string;
  uploadedBy: string;
  timestamp: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  status: "Success" | "Partial" | "Reverted";
}

interface MessageThread {
  id: string;
  studentName: string;
  lrn: string;
  recipient: string;
  role: "Counselor" | "Parent";
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  history: Array<{ sender: string; text: string; time: string; isTeacher: boolean }>;
}

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TeacherTabType>("dashboard");

  // Advisory Class Dataset (Grade 11 - STEM St. Augustine default)
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const all = typeof window !== "undefined" ? getActiveStudentDataset() : SAPC_500_STUDENTS;
    return all.filter(s => s.section_name.includes("St. Augustine") || s.grade_level === 11).slice(0, 40);
  });

  useEffect(() => {
    setIsMounted(true);
    // 1. Initial async load from Cloud Firestore
    loadStudentDatasetFromFirestore().then((all) => {
      setStudents(all.filter(s => s.section_name.includes("St. Augustine") || s.grade_level === 11).slice(0, 40));
    });

    // 2. Real-time subscription across all devices
    const unsubscribe = subscribeToStudentDataset((all) => {
      setStudents(all.filter(s => s.section_name.includes("St. Augustine") || s.grade_level === 11).slice(0, 40));
    });

    const handleUpdate = () => {
      const all = getActiveStudentDataset();
      setStudents(all.filter(s => s.section_name.includes("St. Augustine") || s.grade_level === 11).slice(0, 40));
    };
    window.addEventListener("sapc:dataset-updated", handleUpdate);
    return () => {
      window.removeEventListener("sapc:dataset-updated", handleUpdate);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [referralStudent, setReferralStudent] = useState<any | null>(null);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const catDrag = useDragScroll();
  const tabsDrag = useDragScroll();

  // ---------------------------------------------------------------------------
  // 1. IMPORT WIZARD (3-Step Process)
  // ---------------------------------------------------------------------------
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardFileName, setWizardFileName] = useState("DepEd_Grade11_STEM_Q2_SASS.csv");
  const [wizardRawRows] = useState<string[][]>([
    ["109238475001", "Santos, Jerome M.", "88", "90", "86", "88.0", "Passed", "44", "45"],
    ["109238475002", "Dela Cruz, Angelica R.", "74", "76", "72", "74.5", "Borderline", "42", "45"],
    ["109238475003", "Bautista, Mark Kenneth T.", "92", "95", "90", "93.0", "Passed", "45", "45"],
    ["109238475007", "Villanueva, Christian Dave G.", "76", "78", "75", "76.5", "Passed", "41", "45"],
    ["109238475008", "Alcantara, Princess Mae C.", "94", "96", "92", "94.5", "Passed", "45", "45"]
  ]);
  const [wizardColumnMap, setWizardColumnMap] = useState({
    lrn: 0,
    name: 1,
    ww: 2,
    pt: 3,
    qe: 4,
    final: 5,
    status: 6,
    present: 7,
    total: 8
  });

  // ---------------------------------------------------------------------------
  // 2. BULK ENROLLMENT (Import Students)
  // ---------------------------------------------------------------------------
  const [newStudentEnrollText, setNewStudentEnrollText] = useState(
    "109238475041,Reyes, Bea Katrina,11,Grade 11 - STEM (St. Augustine),09171234567,t.reyes@gmail.com\n109238475042,Navarro, Gabriel Paolo,11,Grade 11 - STEM (St. Augustine),09189876543,g.navarro@gmail.com"
  );
  const [enrollCheckDuplicates, setEnrollCheckDuplicates] = useState(true);

  // ---------------------------------------------------------------------------
  // 3. BULK GRADES (Import Grades)
  // ---------------------------------------------------------------------------
  const [gradeImportSubject, setGradeImportSubject] = useState("General Mathematics");
  const [gradeImportQuarter, setGradeImportQuarter] = useState("Q2");
  const [gradeImportRows, setGradeImportRows] = useState([
    { lrn: "109238475001", name: "Jerome Santos", ww: 88, pt: 92, qe: 86, valid: true },
    { lrn: "109238475002", name: "Angelica Dela Cruz", ww: 72, pt: 74, qe: 70, valid: true },
    { lrn: "109238475003", name: "Mark Kenneth Bautista", ww: 94, pt: 96, qe: 92, valid: true },
    { lrn: "109238475007", name: "Christian Dave Villanueva", ww: 76, pt: 78, qe: 73, valid: true },
    { lrn: "109238475008", name: "Princess Mae Alcantara", ww: 95, pt: 98, qe: 94, valid: true }
  ]);

  // ---------------------------------------------------------------------------
  // 4. BULK ATTENDANCE (Import Attendance)
  // ---------------------------------------------------------------------------
  const [attendanceImportQuarter, setAttendanceImportQuarter] = useState("Q2");
  const [attendanceImportRows, setAttendanceImportRows] = useState([
    { lrn: "109238475001", name: "Jerome Santos", present: 44, total: 45 },
    { lrn: "109238475002", name: "Angelica Dela Cruz", present: 40, total: 45 },
    { lrn: "109238475003", name: "Mark Kenneth Bautista", present: 45, total: 45 },
    { lrn: "109238475007", name: "Christian Dave Villanueva", present: 42, total: 45 },
    { lrn: "109238475008", name: "Princess Mae Alcantara", present: 45, total: 45 }
  ]);

  // ---------------------------------------------------------------------------
  // 5. IMPORT HISTORY & REVERT
  // ---------------------------------------------------------------------------
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([
    {
      id: "BATCH-2026-0920-01",
      type: "DepEd SASS Class Record",
      fileName: "Grade11_STEM_Q1_FinalGrades.csv",
      uploadedBy: "Mr. Roberto Santos, LPT",
      timestamp: "2026-09-18 14:32",
      totalRows: 40,
      successRows: 40,
      errorRows: 0,
      status: "Success"
    },
    {
      id: "BATCH-2026-0915-02",
      type: "Attendance Sync",
      fileName: "August_Monthly_Attendance.csv",
      uploadedBy: "Mr. Roberto Santos, LPT",
      timestamp: "2026-09-15 09:15",
      totalRows: 40,
      successRows: 39,
      errorRows: 1,
      status: "Partial"
    },
    {
      id: "BATCH-2026-0910-03",
      type: "Student Enrollment",
      fileName: "SeniorHigh_Transferee_Batch1.csv",
      uploadedBy: "Mr. Roberto Santos, LPT",
      timestamp: "2026-09-10 16:40",
      totalRows: 5,
      successRows: 5,
      errorRows: 0,
      status: "Success"
    }
  ]);
  const [revertConfirmId, setRevertConfirmId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 6. IN-BROWSER CSV EDITOR
  // ---------------------------------------------------------------------------
  const [csvEditorRows, setCsvEditorRows] = useState<Array<{ id: number; lrn: string; name: string; grade: number; attendance: number; status: string }>>([
    { id: 1, lrn: "109238475001", name: "Jerome Santos", grade: 88.0, attendance: 97.7, status: "Passed" },
    { id: 2, lrn: "109238475002", name: "Angelica Dela Cruz", grade: 74.5, attendance: 93.3, status: "Borderline" },
    { id: 3, lrn: "109238475003", name: "Mark Kenneth Bautista", grade: 93.0, attendance: 100.0, status: "Passed" },
    { id: 4, lrn: "109238475007", name: "Christian Dave Villanueva", grade: 76.5, attendance: 91.1, status: "Passed" },
    { id: 5, lrn: "109238475008", name: "Princess Mae Alcantara", grade: 94.5, attendance: 100.0, status: "Passed" }
  ]);

  // ---------------------------------------------------------------------------
  // 7. INTERVENTIONS, SUGGESTIONS & LOG PROGRESS
  // ---------------------------------------------------------------------------
  const [interventionsList, setInterventionsList] = useState([
    {
      id: "INT-001",
      studentId: 2,
      studentName: "Angelica Dela Cruz",
      lrn: "109238475002",
      type: "Math Remediation & Peer Tutoring",
      assignedTo: "Kyle Mercado (Grade 12 STEM Tutor)",
      status: "Active",
      effectiveness: 4,
      startDate: "Sept 12, 2026",
      latestMilestone: "Completed Week 2 factoring module",
      notes: "Student shows positive response in problem solving speed."
    },
    {
      id: "INT-002",
      studentId: 1,
      studentName: "Jerome Santos",
      lrn: "109238475001",
      type: "Family & Attendance Counselor Check-in",
      assignedTo: "Maria Theresa Cruz, RGC",
      status: "Active",
      effectiveness: 3,
      startDate: "Sept 15, 2026",
      latestMilestone: "Parent phone consultation held",
      notes: "Panganay burden discussed with mother."
    },
    {
      id: "INT-003",
      studentId: 7,
      studentName: "Christian Dave Villanueva",
      lrn: "109238475007",
      type: "Pre-Calculus Consultation with Adviser",
      assignedTo: "Mr. Roberto Santos, LPT",
      status: "Completed",
      effectiveness: 5,
      startDate: "Sept 01, 2026",
      latestMilestone: "Passed Q1 Remedial Examination (82%)",
      notes: "Goal attained. Returned to normal advisory standing."
    }
  ]);

  const [newInterventionProposal, setNewInterventionProposal] = useState({
    studentId: 1,
    type: "Academic Remediation (General Mathematics)",
    assignedPerson: "Class Adviser",
    targetOutcome: "Improve quiz average above 80%",
    durationWeeks: 4
  });

  const [milestoneLogForm, setMilestoneLogForm] = useState({
    interventionId: "INT-001",
    milestoneType: "Tutoring Session Completed",
    remarks: "Student attended 1-hour session on trigonometry with peer tutor.",
    progressScore: 80
  });

  const [closeoutForm, setCloseoutForm] = useState({
    interventionId: "INT-001",
    outcomeRating: "Successful (Target Met)",
    gradeImprovement: "+6.5 GPA points",
    lessonsLearned: "Consistent weekly peer tutoring significantly boosted self-confidence."
  });

  // ---------------------------------------------------------------------------
  // 8. MANUAL ATTENDANCE ENCODING CALENDAR (DYNAMIC MULTI-MONTH)
  // ---------------------------------------------------------------------------
  const ATTENDANCE_MONTHS = useMemo(() => [
    { key: "2026-08", label: "August 2026", year: 2026, monthIndex: 7, shortName: "Aug" },
    { key: "2026-09", label: "September 2026", year: 2026, monthIndex: 8, shortName: "Sept" },
    { key: "2026-10", label: "October 2026", year: 2026, monthIndex: 9, shortName: "Oct" },
    { key: "2026-11", label: "November 2026", year: 2026, monthIndex: 10, shortName: "Nov" },
    { key: "2026-12", label: "December 2026", year: 2026, monthIndex: 11, shortName: "Dec" },
    { key: "2027-01", label: "January 2027", year: 2027, monthIndex: 0, shortName: "Jan" },
    { key: "2027-02", label: "February 2027", year: 2027, monthIndex: 1, shortName: "Feb" },
    { key: "2027-03", label: "March 2027", year: 2027, monthIndex: 2, shortName: "Mar" },
    { key: "2027-04", label: "April 2027", year: 2027, monthIndex: 3, shortName: "Apr" },
    { key: "2027-05", label: "May 2027", year: 2027, monthIndex: 4, shortName: "May" }
  ], []);

  const [attendanceCalendarMonth, setAttendanceCalendarMonth] = useState("2026-09");
  const [attendanceStudentSearch, setAttendanceStudentSearch] = useState("");
  const [attendanceSectionFilter, setAttendanceSectionFilter] = useState("all");

  const [monthlyAttendanceRecord, setMonthlyAttendanceRecord] = useState<
    Record<string, Record<number, Record<number, "P" | "A" | "E" | "L">>>
  >({
    "2026-08": {
      1: { 24: "P", 25: "P", 26: "P", 27: "P", 28: "P", 31: "P" },
      2: { 24: "P", 25: "P", 26: "A", 27: "P", 28: "P", 31: "P" },
      3: { 24: "P", 25: "P", 26: "P", 27: "P", 28: "P", 31: "P" },
      4: { 24: "P", 25: "L", 26: "P", 27: "P", 28: "P", 31: "P" },
      5: { 24: "P", 25: "P", 26: "P", 27: "P", 28: "P", 31: "P" },
      6: { 24: "P", 25: "P", 26: "P", 27: "P", 28: "P", 31: "P" },
      7: { 24: "P", 25: "P", 26: "P", 27: "P", 28: "P", 31: "P" },
      8: { 24: "P", 25: "P", 26: "P", 27: "P", 28: "P", 31: "P" }
    },
    "2026-09": {
      1: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "E", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P", 21: "P", 22: "P", 23: "P", 24: "P", 25: "P", 28: "P", 29: "P", 30: "P" },
      2: { 1: "P", 2: "P", 3: "A", 4: "P", 7: "P", 8: "A", 9: "P", 10: "P", 11: "P", 14: "A", 15: "P", 16: "P", 17: "L", 18: "P", 21: "P", 22: "A", 23: "P", 24: "P", 25: "P", 28: "P", 29: "P", 30: "P" },
      3: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P", 21: "P", 22: "P", 23: "P", 24: "P", 25: "P", 28: "P", 29: "P", 30: "P" },
      4: { 1: "P", 2: "L", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P", 21: "L", 22: "P", 23: "P", 24: "P", 25: "P", 28: "P", 29: "P", 30: "P" },
      5: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "E", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P", 21: "P", 22: "P", 23: "P", 24: "P", 25: "P", 28: "P", 29: "P", 30: "P" },
      6: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "A", 8: "A", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P", 21: "P", 22: "P", 23: "P", 24: "P", 25: "P", 28: "P", 29: "P", 30: "P" },
      7: { 1: "P", 2: "P", 3: "P", 4: "L", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "L", 16: "P", 17: "P", 18: "P", 21: "P", 22: "P", 23: "P", 24: "P", 25: "P", 28: "P", 29: "P", 30: "P" },
      8: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P", 21: "P", 22: "P", 23: "P", 24: "P", 25: "P", 28: "P", 29: "P", 30: "P" }
    },
    "2026-10": {
      1: { 1: "P", 2: "P", 5: "P", 6: "P", 7: "P", 8: "P", 9: "P", 12: "P", 13: "P", 14: "P", 15: "P", 16: "P", 19: "P", 20: "P", 21: "P", 22: "P", 23: "P", 26: "P", 27: "P", 28: "P", 29: "P", 30: "P" },
      2: { 1: "A", 2: "P", 5: "P", 6: "P", 7: "A", 8: "P", 9: "P", 12: "A", 13: "P", 14: "P", 15: "P", 16: "L", 19: "P", 20: "P", 21: "A", 22: "P", 23: "P", 26: "A", 27: "P", 28: "P", 29: "P", 30: "P" },
      3: { 1: "P", 2: "P", 5: "P", 6: "P", 7: "P", 8: "P", 9: "P", 12: "P", 13: "P", 14: "P", 15: "P", 16: "P", 19: "P", 20: "P", 21: "P", 22: "P", 23: "P", 26: "P", 27: "P", 28: "P", 29: "P", 30: "P" },
      4: { 1: "P", 2: "P", 5: "L", 6: "P", 7: "P", 8: "P", 9: "P", 12: "P", 13: "P", 14: "P", 15: "P", 16: "P", 19: "P", 20: "P", 21: "P", 22: "P", 23: "P", 26: "P", 27: "P", 28: "P", 29: "P", 30: "P" },
      5: { 1: "P", 2: "P", 5: "P", 6: "P", 7: "P", 8: "P", 9: "P", 12: "P", 13: "P", 14: "P", 15: "P", 16: "P", 19: "P", 20: "P", 21: "P", 22: "P", 23: "P", 26: "P", 27: "P", 28: "P", 29: "P", 30: "P" },
      6: { 1: "P", 2: "P", 5: "P", 6: "P", 7: "P", 8: "P", 9: "P", 12: "P", 13: "P", 14: "P", 15: "P", 16: "P", 19: "P", 20: "P", 21: "P", 22: "P", 23: "P", 26: "P", 27: "P", 28: "P", 29: "P", 30: "P" },
      7: { 1: "P", 2: "P", 5: "P", 6: "P", 7: "P", 8: "P", 9: "P", 12: "P", 13: "P", 14: "P", 15: "P", 16: "P", 19: "P", 20: "P", 21: "P", 22: "P", 23: "P", 26: "P", 27: "P", 28: "P", 29: "P", 30: "P" },
      8: { 1: "P", 2: "P", 5: "P", 6: "P", 7: "P", 8: "P", 9: "P", 12: "P", 13: "P", 14: "P", 15: "P", 16: "P", 19: "P", 20: "P", 21: "P", 22: "P", 23: "P", 26: "P", 27: "P", 28: "P", 29: "P", 30: "P" }
    },
    "2026-11": {
      1: { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 9: "P", 10: "P", 11: "P", 12: "P", 13: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "P", 30: "P" },
      2: { 2: "P", 3: "A", 4: "P", 5: "P", 6: "P", 9: "A", 10: "P", 11: "P", 12: "A", 13: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "P", 23: "A", 24: "P", 25: "P", 26: "P", 27: "P", 30: "P" },
      3: { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 9: "P", 10: "P", 11: "P", 12: "P", 13: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "P", 30: "P" },
      4: { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 9: "P", 10: "P", 11: "P", 12: "P", 13: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "P", 30: "P" },
      5: { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 9: "P", 10: "P", 11: "P", 12: "P", 13: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "P", 30: "P" },
      6: { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 9: "P", 10: "P", 11: "P", 12: "P", 13: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "P", 30: "P" },
      7: { 2: "P", 3: "P", 4: "L", 5: "P", 6: "P", 9: "P", 10: "P", 11: "L", 12: "P", 13: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "P", 30: "P" },
      8: { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 9: "P", 10: "P", 11: "P", 12: "P", 13: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "P", 30: "P" }
    },
    "2026-12": {
      1: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P" },
      2: { 1: "P", 2: "P", 3: "A", 4: "P", 7: "P", 8: "A", 9: "P", 10: "P", 11: "P", 14: "A", 15: "P", 16: "P", 17: "P", 18: "P" },
      3: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P" },
      4: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P" },
      5: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P" },
      6: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P" },
      7: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P" },
      8: { 1: "P", 2: "P", 3: "P", 4: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P", 14: "P", 15: "P", 16: "P", 17: "P", 18: "P" }
    }
  });

  // Calculate active month's school days (Mon-Fri) dynamically
  const activeAttendanceMonthObj = useMemo(() => {
    return ATTENDANCE_MONTHS.find(m => m.key === attendanceCalendarMonth) || ATTENDANCE_MONTHS[1];
  }, [ATTENDANCE_MONTHS, attendanceCalendarMonth]);

  const activeSchoolDays = useMemo(() => {
    const days: { day: number; weekday: string; label: string; dateKey: string }[] = [];
    const daysInMonth = new Date(activeAttendanceMonthObj.year, activeAttendanceMonthObj.monthIndex + 1, 0).getDate();
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(activeAttendanceMonthObj.year, activeAttendanceMonthObj.monthIndex, d);
      const dayOfWeek = dt.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push({
          day: d,
          weekday: weekdayNames[dayOfWeek],
          label: `${activeAttendanceMonthObj.shortName} ${d}`,
          dateKey: `${activeAttendanceMonthObj.year}-${String(activeAttendanceMonthObj.monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        });
      }
    }
    return days;
  }, [activeAttendanceMonthObj]);

  const toggleAttendanceCell = (studentId: number, day: number) => {
    const currentStatus = monthlyAttendanceRecord[attendanceCalendarMonth]?.[studentId]?.[day] || "P";
    const nextStatus: "P" | "A" | "E" | "L" = 
      currentStatus === "P" ? "A" :
      currentStatus === "A" ? "E" :
      currentStatus === "E" ? "L" : "P";

    setMonthlyAttendanceRecord(prev => ({
      ...prev,
      [attendanceCalendarMonth]: {
        ...(prev[attendanceCalendarMonth] || {}),
        [studentId]: {
          ...(prev[attendanceCalendarMonth]?.[studentId] || {}),
          [day]: nextStatus
        }
      }
    }));
  };

  const handleFillAllPresent = () => {
    setMonthlyAttendanceRecord(prev => {
      const currentMonthData = { ...(prev[attendanceCalendarMonth] || {}) };
      students.forEach(s => {
        const studentDays = { ...(currentMonthData[s.id] || {}) };
        activeSchoolDays.forEach(d => {
          if (!studentDays[d.day]) {
            studentDays[d.day] = "P";
          }
        });
        currentMonthData[s.id] = studentDays;
      });
      return {
        ...prev,
        [attendanceCalendarMonth]: currentMonthData
      };
    });
    setToastMessage(`Filled all empty dates with Present (P) for ${activeAttendanceMonthObj.label}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredAttendanceStudents = useMemo(() => {
    return students.filter(s => {
      const matchQuery = attendanceStudentSearch === "" ||
        s.full_name.toLowerCase().includes(attendanceStudentSearch.toLowerCase()) ||
        s.lrn.includes(attendanceStudentSearch);
      const matchSection = attendanceSectionFilter === "all" || s.section_name === attendanceSectionFilter;
      return matchQuery && matchSection;
    });
  }, [students, attendanceStudentSearch, attendanceSectionFilter]);

  const handleExportMonthAttendanceCsv = () => {
    const headers = [
      "LRN",
      "Student Name",
      "Section",
      ...activeSchoolDays.map(d => `"${d.label} (${d.weekday})"`),
      "Present Count",
      "Absent Count",
      "Excused Count",
      "Late Count",
      "Attendance Rate %"
    ];

    const rows = filteredAttendanceStudents.map(s => {
      let p = 0, a = 0, e = 0, l = 0;
      const dayCols = activeSchoolDays.map(d => {
        const status = monthlyAttendanceRecord[attendanceCalendarMonth]?.[s.id]?.[d.day] || "P";
        if (status === "P") p++;
        else if (status === "A") a++;
        else if (status === "E") e++;
        else if (status === "L") l++;
        return `"${status}"`;
      });
      const total = p + a + e + l;
      const rate = total > 0 ? Math.round(((p + e) / total) * 100) : 100;
      return [
        `"${s.lrn}"`,
        `"${s.full_name}"`,
        `"${s.section_name}"`,
        ...dayCols,
        p,
        a,
        e,
        l,
        `"${rate}%"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SAPC_Attendance_${activeAttendanceMonthObj.label.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setToastMessage(`Exported ${activeAttendanceMonthObj.label} Attendance Sheet to CSV!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // 9. MESSAGES & THREADS
  // ---------------------------------------------------------------------------
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([
    {
      id: "TH-001",
      studentName: "Angelica Dela Cruz",
      lrn: "109238475002",
      recipient: "Maria Theresa Cruz, RGC",
      role: "Counselor",
      lastMessage: "I scheduled Angelica for a math confidence assessment on Thursday.",
      timestamp: "10:30 AM",
      unread: true,
      history: [
        { sender: "Mr. Roberto Santos", text: "Good morning Ma'am. Recommending Angelica for math anxiety counseling.", time: "Yesterday", isTeacher: true },
        { sender: "Maria Theresa Cruz, RGC", text: "Received Sir. I scheduled Angelica for a math confidence assessment on Thursday.", time: "10:30 AM", isTeacher: false }
      ]
    },
    {
      id: "TH-002",
      studentName: "Jerome Santos",
      lrn: "109238475001",
      recipient: "Mrs. Teresa Santos (Parent)",
      role: "Parent",
      lastMessage: "Thank you Sir Roberto, we will ensure Jerome arrives on time.",
      timestamp: "Yesterday",
      unread: false,
      history: [
        { sender: "Mr. Roberto Santos", text: "Magandang hapon po Ma'am. Follow up lang po sa attendance ni Jerome sa Friday class.", time: "2 days ago", isTeacher: true },
        { sender: "Mrs. Teresa Santos", text: "Thank you Sir Roberto, we will ensure Jerome arrives on time.", time: "Yesterday", isTeacher: false }
      ]
    }
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string>("TH-001");
  const [newMessageText, setNewMessageText] = useState("");

  // ---------------------------------------------------------------------------
  // 10. NOTIFICATIONS
  // ---------------------------------------------------------------------------
  const [notifications] = useState([
    { id: 1, type: "alert", title: "Crisis Watch Protocol Alert", desc: "Student Angelica Dela Cruz logged high academic distress indicator.", time: "15m ago", read: false },
    { id: 2, type: "counselor", title: "Guidance Referral Update", desc: "Counselor Maria Theresa Cruz approved peer tutoring referral for Jerome Santos.", time: "2h ago", read: false },
    { id: 3, type: "deadline", title: "Quarter 2 Grade Submission", desc: "DepEd Form 137 electronic encoding closes on October 15, 2026.", time: "1d ago", read: true },
    { id: 4, type: "parent", title: "Parent Acknowledgment Received", desc: "Parent of Mark Kenneth Bautista signed Q1 digital report card.", time: "2d ago", read: true }
  ]);

  // Selected student for deep dive views
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0] || SAPC_500_STUDENTS[0];
  }, [students, selectedStudentId]);

  // Synchronize Tab from URL params, hash, and CustomEvents
  useEffect(() => {
    setIsMounted(true);
    const handleUrlSync = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const tabFromQuery = params.get("tab") as TeacherTabType | null;
      const hash = window.location.hash.replace("#", "");

      const validTabs: TeacherTabType[] = [
        "dashboard", "students", "subject_predictor", "student_profile", "student_progress", "at_risk",
        "import_wizard", "import_students", "import_grades", "import_attendance",
        "import_history", "revert_import", "csv_editor", "interventions",
        "suggestions", "log_progress", "complete_intervention", "class_record",
        "attendance_record", "notifications", "export_credentials", "messages"
      ];

      if (tabFromQuery && validTabs.includes(tabFromQuery)) {
        setActiveTab(tabFromQuery);
      } else if (hash) {
        if (hash === "advisory-overview") setActiveTab("dashboard");
        else if (hash === "roster") setActiveTab("students");
        else if (hash === "subject-predictor-view" || hash === "predictor") setActiveTab("subject_predictor");
        else if (hash === "at-risk-view") setActiveTab("at_risk");
        else if (hash === "uploader" || hash === "import-wizard-view") setActiveTab("import_wizard");
        else if (hash === "interventions-view") setActiveTab("interventions");
        else if (hash === "class-record-view") setActiveTab("class_record");
        else if (hash === "messages-view") setActiveTab("messages");
      }

      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.add("ring-4", "ring-amber-400/50");
            setTimeout(() => el.classList.remove("ring-4", "ring-amber-400/50"), 2000);
          }
        }, 100);
      }
    };

    handleUrlSync();

    const handleCustomNav = (e: CustomEvent<{ tab?: TeacherTabType; hash?: string; source?: string }>) => {
      if (e.detail?.source === "tab_click") return;
      if (e.detail?.tab) setActiveTab(e.detail.tab);
      if (e.detail?.hash) {
        setTimeout(() => {
          const el = document.getElementById(e.detail.hash!);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.add("ring-4", "ring-amber-400/50");
            setTimeout(() => el.classList.remove("ring-4", "ring-amber-400/50"), 2000);
          }
        }, 100);
      }
    };

    const handleTeacherReferral = () => {
      setReferralStudent(students[0] || null);
      setIsReferralOpen(true);
    };

    window.addEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
    window.addEventListener("sapc:open-teacher-referral", handleTeacherReferral);
    window.addEventListener("popstate", handleUrlSync);
    window.addEventListener("hashchange", handleUrlSync);

    return () => {
      window.removeEventListener("sapc:navigate-tab", handleCustomNav as EventListener);
      window.removeEventListener("sapc:open-teacher-referral", handleTeacherReferral);
      window.removeEventListener("popstate", handleUrlSync);
      window.removeEventListener("hashchange", handleUrlSync);
    };
  }, [students]);

  const handleTabChange = (tab: TeacherTabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab, source: "tab_click" } }));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Summary Metrics calculations
  const classSize = students.length;
  const avgRisk = classSize > 0 ? (students.reduce((acc, s) => acc + s.latest_risk_score, 0) / classSize) : 28.4;
  const lowCount = students.filter(s => s.latest_risk_tier === "low").length;
  const medCount = students.filter(s => s.latest_risk_tier === "medium").length;
  const highCount = students.filter(s => s.latest_risk_tier === "high").length;
  const atRiskCount = medCount + highCount;

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.lrn.includes(search) ||
        s.primary_risk_driver.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = riskFilter === "all" || s.latest_risk_tier === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [students, search, riskFilter]);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------
  const handleWizardCommit = () => {
    // Merge wizardRawRows into active student dataset
    const updated = students.map((st) => {
      const match = wizardRawRows.find((r) => r[0] === st.lrn || r[1]?.toLowerCase() === st.full_name?.toLowerCase());
      if (match) {
        const computedGrade = parseFloat(match[5]) || st.sass_metrics.gpa;
        const ww = parseFloat(match[2]) || 80;
        const pt = parseFloat(match[3]) || 80;
        const qe = parseFloat(match[4]) || 80;
        const acadScore = Math.max(5, Math.min(100, Math.round((85 - computedGrade) * 3 + (computedGrade < 75 ? 25 : 0))));

        return {
          ...st,
          sass_metrics: {
            ...st.sass_metrics,
            gpa: computedGrade
          },
          domain_scores: {
            ...st.domain_scores,
            academic: acadScore
          }
        };
      }
      return st;
    });

    const recalculated = recalculateAHPForDataset(updated);
    saveStudentDataset(recalculated);
    setStudents(recalculated);

    showToast(`Successfully processed, stored, and recalculated ${wizardRawRows.length} student records from ${wizardFileName}.`);
    const newHistory: ImportHistoryItem = {
      id: `BATCH-2026-0920-${String(importHistory.length + 1).padStart(2, "0")}`,
      type: "DepEd SASS Import Wizard",
      fileName: wizardFileName,
      uploadedBy: user?.full_name || "Mr. Roberto Santos, LPT",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      totalRows: wizardRawRows.length,
      successRows: wizardRawRows.length,
      errorRows: 0,
      status: "Success"
    };
    setImportHistory([newHistory, ...importHistory]);
    setWizardStep(1);
    handleTabChange("students");
  };

  const handleEnrollStudents = () => {
    const lines = newStudentEnrollText.split("\n").filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    const newEnrolled: StudentRecord[] = lines.map((line, idx) => {
      const parts = line.split(",").map(p => p.trim());
      const lrn = parts[0] || `1092384750${String(students.length + idx + 1).padStart(2, "0")}`;
      const lastName = parts[1] || "Student";
      const firstName = parts[2] || "New";
      const grade = parseInt(parts[3], 10) || 7;
      const section = parts[4] || "Grade 7 - St. Francis";
      const email = parts[6] || `student.${lrn.slice(-4)}@sapc.edu.ph`;

      return {
        id: students.length + idx + 1,
        lrn,
        full_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        grade_level: grade,
        strand: "JHS",
        section_name: section,
        adviser_name: user?.full_name || "Mr. Roberto Santos, LPT",
        email,
        latest_risk_score: 24.5,
        latest_risk_tier: "low" as const,
        primary_risk_driver: "Academic",
        domain_scores: { academic: 20, family: 15, health: 15, mental_health: 15, financial: 15 },
        sass_metrics: {
          gpa: 86.5,
          failing_subjects_count: 0,
          days_absent: 1,
          attendance_rate_pct: 98.0,
          incomplete_requirements_count: 0,
          extracurricular_club: "Science Club",
          club_participation_level: "Moderate" as const,
          hobbies_interests: "Reading, Coding"
        }
      };
    });

    const combined = recalculateAHPForDataset([...students, ...newEnrolled]);
    saveStudentDataset(combined);
    setStudents(combined);

    showToast(`Successfully enrolled and stored ${lines.length} new student records into the database.`);
    setNewStudentEnrollText("");
    handleTabChange("students");
  };

  const handleSaveGradesBatch = () => {
    const updated = students.map((st) => {
      const match = gradeImportRows.find((r) => r.lrn === st.lrn || r.name?.toLowerCase() === st.full_name?.toLowerCase());
      if (match) {
        const computedGrade = parseFloat((match.ww * 0.25 + match.pt * 0.50 + match.qe * 0.25).toFixed(1));
        const acadScore = Math.max(5, Math.min(100, Math.round((85 - computedGrade) * 3 + (computedGrade < 75 ? 25 : 0))));

        return {
          ...st,
          sass_metrics: {
            ...st.sass_metrics,
            gpa: computedGrade
          },
          domain_scores: {
            ...st.domain_scores,
            academic: acadScore
          }
        };
      }
      return st;
    });

    const recalculated = recalculateAHPForDataset(updated);
    saveStudentDataset(recalculated);
    setStudents(recalculated);

    showToast(`Saved and stored quarterly grades for ${gradeImportRows.length} students in ${gradeImportSubject} (${gradeImportQuarter}).`);
  };

  const handleSaveAttendanceBatch = () => {
    const updated = students.map((st) => {
      const match = attendanceImportRows.find((r) => r.lrn === st.lrn || r.name?.toLowerCase() === st.full_name?.toLowerCase());
      if (match) {
        const absent = Math.max(0, match.total - match.present);
        const rate = parseFloat(((match.present / (match.total || 45)) * 100).toFixed(1));

        return {
          ...st,
          sass_metrics: {
            ...st.sass_metrics,
            days_absent: absent,
            attendance_rate_pct: rate
          }
        };
      }
      return st;
    });

    const recalculated = recalculateAHPForDataset(updated);
    saveStudentDataset(recalculated);
    setStudents(recalculated);

    showToast(`Saved and stored ${attendanceImportQuarter} attendance records for ${attendanceImportRows.length} students.`);
  };

  const handleRevertBatch = (batchId: string) => {
    setImportHistory(prev => prev.map(b => b.id === batchId ? { ...b, status: "Reverted" } : b));
    setRevertConfirmId(null);
    showToast(`Rollback complete. Successfully reverted import batch ${batchId}.`);
  };

  const handleSaveCsvEditor = () => {
    const updated = students.map((st) => {
      const match = csvEditorRows.find((r) => r.lrn === st.lrn || r.name?.toLowerCase() === st.full_name?.toLowerCase());
      if (match) {
        return {
          ...st,
          sass_metrics: {
            ...st.sass_metrics,
            gpa: match.grade,
            attendance_rate_pct: match.attendance
          }
        };
      }
      return st;
    });

    const recalculated = recalculateAHPForDataset(updated);
    saveStudentDataset(recalculated);
    setStudents(recalculated);

    showToast(`Saved and stored changes to ${csvEditorRows.length} CSV records directly in student database.`);
  };

  const handleAddCsvRow = () => {
    const newId = csvEditorRows.length + 1;
    setCsvEditorRows([
      ...csvEditorRows,
      { id: newId, lrn: `1092384750${String(newId).padStart(2, "0")}`, name: "New Enrolled Student", grade: 85.0, attendance: 100.0, status: "Passed" }
    ]);
  };

  const handleDeleteCsvRow = (id: number) => {
    setCsvEditorRows(csvEditorRows.filter(r => r.id !== id));
  };

  const handleProposeIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    const studentObj = students.find(s => s.id === Number(newInterventionProposal.studentId)) || students[0];
    const newInt = {
      id: `INT-${String(interventionsList.length + 1).padStart(3, "0")}`,
      studentId: studentObj.id,
      studentName: studentObj.full_name,
      lrn: studentObj.lrn,
      type: newInterventionProposal.type,
      assignedTo: newInterventionProposal.assignedPerson,
      status: "Active",
      effectiveness: 4,
      startDate: new Date().toISOString().substring(0, 10),
      latestMilestone: "Intervention proposed and initiated by class adviser",
      notes: newInterventionProposal.targetOutcome
    };
    setInterventionsList([newInt, ...interventionsList]);
    showToast(`Created intervention protocol for ${studentObj.full_name}.`);
  };

  const handleLogMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Logged milestone for ${milestoneLogForm.interventionId}: "${milestoneLogForm.milestoneType}".`);
    setInterventionsList(prev => prev.map(i => i.id === milestoneLogForm.interventionId ? {
      ...i,
      latestMilestone: milestoneLogForm.milestoneType,
      notes: milestoneLogForm.remarks
    } : i));
  };

  const handleCompleteIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Intervention ${closeoutForm.interventionId} successfully documented and closed.`);
    setInterventionsList(prev => prev.map(i => i.id === closeoutForm.interventionId ? {
      ...i,
      status: "Completed",
      notes: `Closed: ${closeoutForm.outcomeRating} - ${closeoutForm.lessonsLearned}`
    } : i));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    setMessageThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMessage: newMessageText,
          timestamp: "Just now",
          history: [
            ...t.history,
            { sender: user?.full_name || "Mr. Roberto Santos", text: newMessageText, time: "Just now", isTeacher: true }
          ]
        };
      }
      return t;
    }));
    setNewMessageText("");
  };

  const handleExportCredentialsCsv = () => {
    const csvHeader = "LRN,Full Name,Grade Level,Section,Username,Temporary Password\n";
    const csvBody = students.map(s => 
      `${s.lrn},"${s.full_name}",${s.grade_level},"${s.section_name}",${s.email},SAPC2026!${s.lrn.slice(-4)}`
    ).join("\n");
    const blob = new Blob([csvHeader + csvBody], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "SAPC_Grade11_STEM_Student_Credentials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Generated and downloaded student login credentials CSV.");
  };

  const handleExportClassRecord = () => {
    showToast("Preparing DepEd Form 137 / Digital Class Record for printing...");
    if (typeof window !== "undefined") window.print();
  };

  // Navigation Categories
  const CATEGORIES = useMemo(() => [
    { id: "all", label: "All Modules (22)" },
    { id: "overview", label: "Advisory & Prediction (6)", tabIds: ["dashboard", "students", "subject_predictor", "at_risk", "student_profile", "student_progress"] },
    { id: "import", label: "CSV Ingestion Hub (7)", tabIds: ["import_wizard", "import_students", "import_grades", "import_attendance", "import_history", "revert_import", "csv_editor"] },
    { id: "care", label: "Interventions & Care (4)", tabIds: ["interventions", "suggestions", "log_progress", "complete_intervention"] },
    { id: "records", label: "DepEd Records & Messages (5)", tabIds: ["class_record", "attendance_record", "notifications", "export_credentials", "messages"] }
  ], []);
  const [selectedNavCategory, setSelectedNavCategory] = useState<string>("all");

  const TAB_ITEMS: Array<{ id: TeacherTabType; label: string; icon: any; badge?: string; category: string }> = [
    { id: "dashboard", label: "Class Overview", icon: BarChart3, badge: "Health", category: "overview" },
    { id: "students", label: "Advisory Roster", icon: Users, badge: `${students.length}`, category: "overview" },
    { id: "subject_predictor", label: "Subject Failure Predictor", icon: BookOpen, badge: "Early Warning", category: "overview" },
    { id: "at_risk", label: "At-Risk Priority Focus", icon: AlertTriangle, badge: `${atRiskCount}`, category: "overview" },
    { id: "student_profile", label: "Student Profile", icon: Eye, category: "overview" },
    { id: "student_progress", label: "Longitudinal Progress", icon: TrendingUp, category: "overview" },
    { id: "import_wizard", label: "3-Step Import Wizard", icon: Layers, badge: "Flexible", category: "import" },
    { id: "import_students", label: "Bulk Enrollment", icon: UserCheck, category: "import" },
    { id: "import_grades", label: "Bulk Grades Input", icon: BookOpen, category: "import" },
    { id: "import_attendance", label: "Bulk Attendance", icon: Percent, category: "import" },
    { id: "import_history", label: "Import History", icon: Clock, category: "import" },
    { id: "revert_import", label: "Revert Rollback", icon: RotateCcw, category: "import" },
    { id: "csv_editor", label: "In-Browser CSV Editor", icon: FileSpreadsheet, category: "import" },
    { id: "interventions", label: "Care Plans & Interventions", icon: ShieldCheck, badge: `${interventionsList.filter(i => i.status === "Active").length}`, category: "care" },
    { id: "suggestions", label: "AI Suggestions", icon: Sparkles, category: "care" },
    { id: "log_progress", label: "Log Progress Milestones", icon: Edit3, category: "care" },
    { id: "complete_intervention", label: "Complete Intervention", icon: CheckCircle2, category: "care" },
    { id: "class_record", label: "DepEd Class Record", icon: FileText, badge: "Form 137", category: "records" },
    { id: "attendance_record", label: "Manual Attendance Calendar", icon: Calendar, category: "records" },
    { id: "notifications", label: "Teacher Alerts", icon: Bell, badge: `${notifications.filter(n => !n.read).length}`, category: "records" },
    { id: "export_credentials", label: "Export Credentials", icon: Key, category: "records" },
    { id: "messages", label: "Messages & Referrals", icon: MessageSquare, badge: "Threads", category: "records" }
  ];

  const visibleTabs = selectedNavCategory === "all" 
    ? TAB_ITEMS 
    : TAB_ITEMS.filter(t => t.category === selectedNavCategory);

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
      const activeTabEl = document.getElementById(`teacher-tab-${activeTab}`);
      if (activeTabEl && tabsDrag.ref.current) {
        activeTabEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }

      const targetCatId = selectedNavCategory === "all" ? (parentCat?.id || "all") : selectedNavCategory;
      const activeCatEl = document.getElementById(`teacher-cat-${targetCatId}`);
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

  if (!isMounted) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-12 font-sans animate-pulse px-2 sm:px-0">
        <div className="h-40 sm:h-44 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 sm:h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-7 pb-16 font-sans w-full max-w-full overflow-hidden px-1 sm:px-0">
      {/* Top Banner Header (Mobile-First Responsive Layout) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-5 sm:p-7 md:p-8 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-5 border border-rose-900/40">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300" />
              Class Adviser Portal
            </span>
            <span className="text-[11px] sm:text-xs text-rose-200 font-semibold">• Grade 11 - STEM (St. Augustine)</span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
            Welcome, Mr. Roberto Santos, LPT!
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-rose-100/90 leading-relaxed font-normal">
            Advisory class health overview, 3-step flexible CSV ingestion, automated DepEd Form 137 records, and collaborative guidance referrals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 md:pt-0">
          <button
            type="button"
            onClick={() => handleTabChange("import_wizard")}
            className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
          >
            <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-white shrink-0" />
            <span>Import SASS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReferralStudent(students[0] || null);
              setIsReferralOpen(true);
            }}
            className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5 text-amber-300 shrink-0" />
            <span>1-Click Referral</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Metric Cards (Mobile/Tablet Friendly Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Advisory Class Size */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Class Size</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              STEM Track
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-none">{classSize}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">Students</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">100% Enrolled &amp; Active</span>
        </div>

        {/* Average Risk Score */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Avg Risk Score</span>
            <RiskBadge score={avgRisk} tier="low" size="sm" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 leading-none">{avgRisk.toFixed(1)}</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-800/70">/ 100</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">5-Domain AHP Synthesis</span>
        </div>

        {/* At-Risk Priority */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">At-Risk Priority</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              {highCount}H • {medCount}M
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-700 leading-none">{atRiskCount}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">Students</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Focus for Guidance Care</span>
        </div>

        {/* Active Care Plans */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Care Plans</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              {interventionsList.filter(i => i.status === "Completed").length} Closed
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#8B0014] leading-none">
              {interventionsList.filter(i => i.status === "Active").length}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">In Progress</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Tutoring &amp; Advisories</span>
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
                  id={`teacher-cat-${cat.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedNavCategory(cat.id);
                    if (cat.id !== "all" && cat.tabIds && !cat.tabIds.includes(activeTab)) {
                      handleTabChange(cat.tabIds[0] as TeacherTabType);
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
                  id={`teacher-tab-${item.id}`}
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

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DASHBOARD PAGE: Advisory Class Health Overview */}
      {/* ========================================================================= */}
      {activeTab === "dashboard" && (
        <div id="advisory-overview" className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Risk Distribution Chart & Domain Bottlenecks */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">Advisory Class Risk Distribution</h3>
                  <p className="text-xs text-slate-500">Breakdown of 40 Grade 11 STEM students by AHP 5-domain vulnerability</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  70.0% Low Vulnerability
                </span>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(lowCount / classSize) * 100}%` }} title={`Low Risk: ${lowCount}`} />
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${(medCount / classSize) * 100}%` }} title={`Medium Risk: ${medCount}`} />
                  <div className="bg-rose-600 h-full transition-all" style={{ width: `${(highCount / classSize) * 100}%` }} title={`High Risk: ${highCount}`} />
                </div>
                <div className="flex justify-between text-xs font-bold pt-1">
                  <span className="text-emerald-700 flex items-center gap-1">🟢 Low Risk: {lowCount} ({((lowCount/classSize)*100).toFixed(0)}%)</span>
                  <span className="text-amber-700 flex items-center gap-1">🟡 Medium: {medCount} ({((medCount/classSize)*100).toFixed(0)}%)</span>
                  <span className="text-rose-700 flex items-center gap-1">🔴 High Risk: {highCount} ({((highCount/classSize)*100).toFixed(0)}%)</span>
                </div>
              </div>

              {/* Priority Domain Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">Academic Vulnerability</span>
                  <strong className="text-base sm:text-lg font-black text-slate-900">4 Students</strong>
                  <span className="text-[11px] text-amber-700 block">Pre-Calculus &amp; Chemistry</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">Attendance Irregularity</span>
                  <strong className="text-base sm:text-lg font-black text-slate-900">2 Students</strong>
                  <span className="text-[11px] text-rose-700 block">&gt;3 Excused/Unexcused</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">Family &amp; Panganay Burden</span>
                  <strong className="text-base sm:text-lg font-black text-slate-900">3 Students</strong>
                  <span className="text-[11px] text-blue-700 block">OFW / Single Parent</span>
                </div>
              </div>
            </div>

            {/* Live Alerts & Recent Signals Feed */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Recent Class Signals</h3>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Live Feed
                  </span>
                </div>

                <div className="space-y-3 mt-3">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900">{n.title}</span>
                        <span className="text-slate-400 font-medium">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleTabChange("subject_predictor")}
                  className="w-full min-h-[44px] py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Subject Failure Risk Predictor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("at_risk")}
                  className="w-full min-h-[44px] py-2.5 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <span>View At-Risk Priority List ({atRiskCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IMPORT WIZARD: 3-Step CSV Ingestion */}
      {/* ========================================================================= */}
      {activeTab === "import_wizard" && (
        <div id="uploader" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">3-Step Flexible CSV Ingestion Wizard</h3>
              <p className="text-xs text-slate-500">Flexible column mapping supporting arbitrary CSV order with pre-import validation</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${wizardStep === 1 ? "bg-[#8B0014] text-white" : "bg-slate-100 text-slate-600"}`}>1. Upload</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${wizardStep === 2 ? "bg-[#8B0014] text-white" : "bg-slate-100 text-slate-600"}`}>2. Match Columns</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${wizardStep === 3 ? "bg-[#8B0014] text-white" : "bg-slate-100 text-slate-600"}`}>3. Preview &amp; Confirm</span>
            </div>
          </div>

          {/* STEP 1: UPLOAD */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-3 bg-slate-50/60 hover:bg-slate-50 transition">
                <FileSpreadsheet className="h-12 w-12 text-[#8B0014] mx-auto" />
                <h4 className="text-base sm:text-lg font-bold text-slate-900">Upload DepEd SASS or Class Record CSV</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Drag and drop your spreadsheet here or browse your computer. Supports Written Work, Performance Tasks, Quarterly Exams, and Attendance.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWizardFileName("Grade11_STEM_Q2_Calculus_Scores.csv");
                      setWizardStep(2);
                    }}
                    className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition"
                  >
                    Select CSV File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FLEXIBLE COLUMN MATCHING */}
          {wizardStep === 2 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2.5">
                <Info className="h-5 w-5 text-amber-700 shrink-0" />
                <span>
                  Match the columns from <strong>{wizardFileName}</strong> to SAPC IntellySys database fields below.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Learner Ref No. (LRN)</label>
                  <select
                    value={wizardColumnMap.lrn}
                    onChange={(e) => setWizardColumnMap({ ...wizardColumnMap, lrn: Number(e.target.value) })}
                    className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
                  >
                    <option value={0}>Column A: LRN (109238475001)</option>
                    <option value={1}>Column B: Student Name</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Student Full Name</label>
                  <select
                    value={wizardColumnMap.name}
                    onChange={(e) => setWizardColumnMap({ ...wizardColumnMap, name: Number(e.target.value) })}
                    className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
                  >
                    <option value={1}>Column B: Full Name (Santos, Jerome)</option>
                    <option value={0}>Column A: LRN</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Written Work (WW 25%)</label>
                  <select
                    value={wizardColumnMap.ww}
                    onChange={(e) => setWizardColumnMap({ ...wizardColumnMap, ww: Number(e.target.value) })}
                    className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
                  >
                    <option value={2}>Column C: Written Work Score</option>
                    <option value={3}>Column D: Performance Task</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Performance Task (PT 50%)</label>
                  <select
                    value={wizardColumnMap.pt}
                    onChange={(e) => setWizardColumnMap({ ...wizardColumnMap, pt: Number(e.target.value) })}
                    className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
                  >
                    <option value={3}>Column D: Performance Task</option>
                    <option value={2}>Column C: Written Work</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Back to Upload
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs shadow-md"
                >
                  Proceed to Validation &amp; Preview
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & CONFIRM */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Validation Passed: {wizardRawRows.length} valid rows ready for ingestion. 0 errors detected.
                </span>
                <span className="text-[11px] font-mono text-emerald-800">Target: Grade 11 STEM</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">LRN</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3 text-center">WW (25%)</th>
                      <th className="py-2.5 px-3 text-center">PT (50%)</th>
                      <th className="py-2.5 px-3 text-center">QE (25%)</th>
                      <th className="py-2.5 px-3 text-center">Computed Final</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {wizardRawRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{r[0]}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{r[1]}</td>
                        <td className="py-2.5 px-3 text-center">{r[2]}</td>
                        <td className="py-2.5 px-3 text-center">{r[3]}</td>
                        <td className="py-2.5 px-3 text-center">{r[4]}</td>
                        <td className="py-2.5 px-3 text-center font-black text-[#8B0014]">{r[5]}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {r[6]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Back to Mapping
                </button>
                <button
                  type="button"
                  onClick={handleWizardCommit}
                  className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition"
                >
                  Commit &amp; Ingest Batch Records
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. IMPORT STUDENTS: Bulk Enrollment with LRN Deduplication */}
      {/* ========================================================================= */}
      {activeTab === "import_students" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Bulk Student Enrollment (LRN Deduplication)</h3>
              <p className="text-xs text-slate-500">Paste student info with automatic duplicate check against DepEd LIS registry</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded-full self-start sm:self-auto">
              Format: LRN, Last Name, First Name, Grade, Section, Parent Phone, Email
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <textarea
              rows={6}
              value={newStudentEnrollText}
              onChange={(e) => setNewStudentEnrollText(e.target.value)}
              placeholder="109238475041,Reyes,Bea Katrina,11,Grade 11 - STEM,09171234567,t.reyes@gmail.com"
              className="w-full p-3 font-mono text-xs rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={enrollCheckDuplicates}
                  onChange={(e) => setEnrollCheckDuplicates(e.target.checked)}
                  className="h-4 w-4 rounded text-[#8B0014] focus:ring-[#8B0014]"
                />
                <span>Enable LRN Duplication Guard (Prevent Accidental Overrides)</span>
              </label>

              <button
                type="button"
                onClick={handleEnrollStudents}
                className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition"
              >
                Enroll New Students Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. IMPORT GRADES: Bulk Quarterly Input */}
      {/* ========================================================================= */}
      {activeTab === "import_grades" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Bulk Quarterly Grade Ingestion</h3>
              <p className="text-xs text-slate-500">Component weights (WW 25%, PT 50%, QE 25%) with 75-100 range validation</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={gradeImportSubject}
                onChange={(e) => setGradeImportSubject(e.target.value)}
                className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs"
              >
                <option>General Mathematics</option>
                <option>Pre-Calculus</option>
                <option>General Chemistry 1</option>
                <option>Oral Communication</option>
              </select>
              <select
                value={gradeImportQuarter}
                onChange={(e) => setGradeImportQuarter(e.target.value)}
                className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs"
              >
                <option>Q1</option>
                <option>Q2</option>
                <option>Q3</option>
                <option>Q4</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600">
                <tr>
                  <th className="py-3 px-4">LRN</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3 text-center">WW (25%)</th>
                  <th className="py-3 px-3 text-center">PT (50%)</th>
                  <th className="py-3 px-3 text-center">QE (25%)</th>
                  <th className="py-3 px-3 text-center">Quarter Grade</th>
                  <th className="py-3 px-4 text-center">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {gradeImportRows.map((r, i) => {
                  const finalComputed = (r.ww * 0.25 + r.pt * 0.50 + r.qe * 0.25).toFixed(1);
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.lrn}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={r.ww}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...gradeImportRows];
                            updated[i].ww = val;
                            setGradeImportRows(updated);
                          }}
                          className="w-16 p-1.5 text-center font-bold border rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={r.pt}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...gradeImportRows];
                            updated[i].pt = val;
                            setGradeImportRows(updated);
                          }}
                          className="w-16 p-1.5 text-center font-bold border rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={r.qe}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...gradeImportRows];
                            updated[i].qe = val;
                            setGradeImportRows(updated);
                          }}
                          className="w-16 p-1.5 text-center font-bold border rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-3 text-center font-black text-[#8B0014] text-sm">
                        {finalComputed}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Valid (75-100)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveGradesBatch}
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition"
            >
              Save &amp; Ingest Grades Batch
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. IMPORT ATTENDANCE: Bulk Data Entry */}
      {/* ========================================================================= */}
      {activeTab === "import_attendance" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Bulk Attendance Entry &amp; Rate Calculation</h3>
              <p className="text-xs text-slate-500">Auto-computes attendance percentage based on days present out of total class days</p>
            </div>
            <select
              value={attendanceImportQuarter}
              onChange={(e) => setAttendanceImportQuarter(e.target.value)}
              className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs self-start sm:self-auto"
            >
              <option>Quarter 1 (45 Days)</option>
              <option>Quarter 2 (45 Days)</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600">
                <tr>
                  <th className="py-3 px-4">LRN</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3 text-center">Days Present</th>
                  <th className="py-3 px-3 text-center">Total School Days</th>
                  <th className="py-3 px-3 text-center">Attendance Rate</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attendanceImportRows.map((r, i) => {
                  const pct = ((r.present / r.total) * 100).toFixed(1);
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.lrn}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={r.present}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...attendanceImportRows];
                            updated[i].present = val;
                            setAttendanceImportRows(updated);
                          }}
                          className="w-16 p-1.5 text-center font-bold border rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{r.total}</td>
                      <td className="py-3 px-3 text-center font-black text-emerald-600 text-sm">{pct}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          Number(pct) >= 95 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {Number(pct) >= 95 ? "Optimal" : "Attention"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveAttendanceBatch}
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-sm shadow-md transition"
            >
              Save Attendance Batch
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. IMPORT HISTORY: Audit Trail & Logs */}
      {/* ========================================================================= */}
      {activeTab === "import_history" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Ingestion History &amp; Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable logging of all uploaded batches under RA 10173 compliance</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600">
                <tr>
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Type &amp; File Name</th>
                  <th className="py-3 px-3">Uploaded By</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-center">Records</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {importHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{h.id}</td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block">{h.type}</strong>
                      <span className="text-slate-500 text-[11px]">{h.fileName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{h.uploadedBy}</td>
                    <td className="py-3 px-3 text-slate-500">{h.timestamp}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{h.successRows}/{h.totalRows}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === "Success" ? "bg-emerald-100 text-emerald-800" :
                        h.status === "Partial" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => showToast(`Downloaded audit log report for ${h.id}.`)}
                        className="min-h-[36px] px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px]"
                      >
                        Download Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. REVERT IMPORT: Safety Net Rollback */}
      {/* ========================================================================= */}
      {activeTab === "revert_import" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Revert Ingestion Safety Net</h3>
              <p className="text-xs text-slate-500">Rollback accidental batch imports with full data restoration and audit confirmation</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full self-start sm:self-auto">
              ⚠️ Safety Rollback Guard
            </span>
          </div>

          <div className="space-y-3">
            {importHistory.filter(h => h.status !== "Reverted").map((b) => (
              <div key={b.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-black text-sm sm:text-base">{b.fileName}</strong>
                    <span className="font-mono text-xs text-slate-500">({b.id})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {b.type} • {b.totalRows} Records • Uploaded {b.timestamp} by {b.uploadedBy}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRevertConfirmId(b.id)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Rollback Batch</span>
                </button>
              </div>
            ))}
          </div>

          {/* Revert Confirmation Modal */}
          {revertConfirmId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
                <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-lg font-black text-slate-900">Confirm Batch Rollback?</h4>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to revert <strong>{revertConfirmId}</strong>? This will remove all records added in this upload and restore previous data snapshots.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRevertConfirmId(null)}
                    className="min-h-[44px] py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRevertBatch(revertConfirmId)}
                    className="min-h-[44px] py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
                  >
                    Confirm Revert
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CSV EDITOR: In-Browser Spreadsheet */}
      {/* ========================================================================= */}
      {activeTab === "csv_editor" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">In-Browser CSV Table Editor</h3>
              <p className="text-xs text-slate-500">Make live corrections to typos or formats directly without returning to Excel</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddCsvRow}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Row
              </button>
              <button
                type="button"
                onClick={handleSaveCsvEditor}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">LRN</th>
                  <th className="py-2.5 px-3">Student Full Name</th>
                  <th className="py-2.5 px-3 text-center">Grade (GPA)</th>
                  <th className="py-2.5 px-3 text-center">Attendance %</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {csvEditorRows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={r.lrn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCsvEditorRows(prev => prev.map(row => row.id === r.id ? { ...row, lrn: val } : row));
                        }}
                        className="w-full p-1.5 font-mono border rounded-lg text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCsvEditorRows(prev => prev.map(row => row.id === r.id ? { ...row, name: val } : row));
                        }}
                        className="w-full p-1.5 font-bold border rounded-lg text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        value={r.grade}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCsvEditorRows(prev => prev.map(row => row.id === r.id ? { ...row, grade: val } : row));
                        }}
                        className="w-20 p-1.5 text-center font-black text-[#8B0014] border rounded-lg text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        value={r.attendance}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCsvEditorRows(prev => prev.map(row => row.id === r.id ? { ...row, attendance: val } : row));
                        }}
                        className="w-20 p-1.5 text-center font-black text-emerald-600 border rounded-lg text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <select
                        value={r.status}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCsvEditorRows(prev => prev.map(row => row.id === r.id ? { ...row, status: val } : row));
                        }}
                        className="p-1 border rounded-lg text-xs font-bold"
                      >
                        <option>Passed</option>
                        <option>Borderline</option>
                        <option>Remedial</option>
                      </select>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteCsvRow(r.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBJECT-LEVEL FAILURE RISK PREDICTOR */}
      {/* ========================================================================= */}
      {activeTab === "subject_predictor" && (
        <div id="subject-predictor-view" className="animate-in fade-in duration-200 scroll-mt-24">
          <SubjectFailurePredictor />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. STUDENTS PAGE: Main Advisory Class Roster */}
      {/* ========================================================================= */}
      {activeTab === "students" && (
        <div id="roster" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Grade 11 - STEM (St. Augustine) Roster</h3>
              <p className="text-xs text-slate-500">Color-coded risk monitoring with 1-click student profiling and guidance referral</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 self-start sm:self-auto">
              {filteredStudents.length} of {students.length} Students
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, LRN, or primary driver..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk (🔴)</option>
                <option value="medium">Medium Risk (🟡)</option>
                <option value="low">Low Risk (🟢)</option>
              </select>
            </div>
          </div>

          {/* Mobile Stacked Student Cards (<md) */}
          <div className="grid grid-cols-1 md:hidden gap-3.5">
            {filteredStudents.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{s.full_name}</h4>
                    <span className="text-xs text-slate-500 font-mono">LRN: {s.lrn}</span>
                  </div>
                  <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="sm" />
                </div>
                <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <strong className="text-slate-800 font-bold block">Primary Bottleneck:</strong>
                  <span>{s.primary_risk_driver}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setIsDetailOpen(true);
                    }}
                    className="min-h-[44px] py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Eye className="h-4 w-4" /> View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReferralStudent(s);
                      setIsReferralOpen(true);
                    }}
                    className="min-h-[44px] py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <HeartHandshake className="h-4 w-4" /> Refer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Full Table on Tablet & Desktop (>=md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Student Name &amp; LRN</th>
                  <th className="py-3.5 px-3 text-center">GPA</th>
                  <th className="py-3.5 px-3 text-center">Attendance</th>
                  <th className="py-3.5 px-3 text-center">AHP Composite Risk</th>
                  <th className="py-3.5 px-4">Primary Driver</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 font-extrabold block">{s.full_name}</strong>
                      <span className="font-mono text-xs text-slate-500">{s.lrn}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-[#8B0014]">
                      {s.sass_metrics?.gpa ? s.sass_metrics.gpa.toFixed(1) : "88.5"}
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-emerald-600">
                      {s.sass_metrics?.attendance_rate_pct ? `${s.sass_metrics.attendance_rate_pct}%` : "96.5%"}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                      {s.primary_risk_driver}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            setIsDetailOpen(true);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="View Comprehensive Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReferralStudent(s);
                            setIsReferralOpen(true);
                          }}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          title="Submit Guidance Referral"
                        >
                          <HeartHandshake className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. STUDENT PROFILE PAGE: Deep Dive Record */}
      {/* ========================================================================= */}
      {activeTab === "student_profile" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Comprehensive Student Profile: {selectedStudent.full_name}</h3>
              <p className="text-xs text-slate-500">LRN: {selectedStudent.lrn} • {selectedStudent.section_name}</p>
            </div>
            <select
              value={selectedStudentId || 1}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.latest_risk_tier.toUpperCase()})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">5-Domain AHP Sub-Scores</span>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b pb-1"><span>Academic (30%):</span><strong>{selectedStudent.domain_scores?.academic?.toFixed(1) || "18.0"}/100</strong></div>
                <div className="flex justify-between border-b pb-1"><span>Family Support (20%):</span><strong>{selectedStudent.domain_scores?.family?.toFixed(1) || "14.0"}/100</strong></div>
                <div className="flex justify-between border-b pb-1"><span>Physical Health (20%):</span><strong>{selectedStudent.domain_scores?.health?.toFixed(1) || "12.0"}/100</strong></div>
                <div className="flex justify-between border-b pb-1"><span>Mental Health (15%):</span><strong>{selectedStudent.domain_scores?.mental_health?.toFixed(1) || "15.0"}/100</strong></div>
                <div className="flex justify-between pt-0.5"><span>Financial (15%):</span><strong>{selectedStudent.domain_scores?.financial?.toFixed(1) || "10.0"}/100</strong></div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Academic Standing &amp; Conduct</span>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b pb-1"><span>Current GPA:</span><strong className="text-[#8B0014]">{selectedStudent.sass_metrics?.gpa || 88.5}</strong></div>
                <div className="flex justify-between border-b pb-1"><span>Attendance Rate:</span><strong className="text-emerald-600">{selectedStudent.sass_metrics?.attendance_rate_pct || 96.5}%</strong></div>
                <div className="flex justify-between border-b pb-1"><span>Extracurricular Club:</span><strong>{selectedStudent.sass_metrics?.extracurricular_club || "Math & Robotics Club"}</strong></div>
                <div className="flex justify-between pt-0.5"><span>Club Participation:</span><strong>{selectedStudent.sass_metrics?.club_participation_level || "Moderate"}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. STUDENT PROGRESS PAGE: Longitudinal Tracker */}
      {/* ========================================================================= */}
      {activeTab === "student_progress" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Individual Student Longitudinal Progress</h3>
              <p className="text-xs text-slate-500">Tracking score trajectory from Quarter 1 to current with next-quarter prediction</p>
            </div>
            <select
              value={selectedStudentId || 1}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500">Q1 Baseline</span>
              <p className="text-xl sm:text-2xl font-black text-slate-800">32.5 / 100</p>
              <span className="text-[11px] text-slate-400">Moderate Risk</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500">Q2 Current</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">24.5 / 100</p>
              <span className="text-[11px] text-emerald-700 font-bold">-8.0 pts Improving</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500">Q3 Projected Target</span>
              <p className="text-xl sm:text-2xl font-black text-blue-700">18.0 / 100</p>
              <span className="text-[11px] text-blue-700 font-bold">Low Risk Honors</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500">Predicted Intervention Impact</span>
              <p className="text-xl sm:text-2xl font-black text-[#8B0014]">+14.2 pts</p>
              <span className="text-[11px] text-slate-500">Calculus Tutoring</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. AT-RISK STUDENTS PAGE: Priority Focus List */}
      {/* ========================================================================= */}
      {activeTab === "at_risk" && (
        <div id="at-risk-view" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">At-Risk Priority Focus List ({atRiskCount} Students)</h3>
              <p className="text-xs text-slate-500">Priority triage queue for students requiring immediate academic or counseling intervention</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 self-start sm:self-auto">
              Urgent Advisory Attention
            </span>
          </div>

          <div className="space-y-3">
            {students.filter(s => s.latest_risk_tier !== "low").map((s) => (
              <div key={s.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">{s.full_name}</h4>
                    <span className="font-mono text-xs text-slate-500">LRN: {s.lrn}</span>
                    <RiskBadge score={s.latest_risk_score} tier={s.latest_risk_tier} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Primary Risk Bottleneck:</strong> {s.primary_risk_driver}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setReferralStudent(s);
                      setIsReferralOpen(true);
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <HeartHandshake className="h-4 w-4" />
                    <span>Create Guidance Referral</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. INTERVENTIONS: Care Plan Management */}
      {/* ========================================================================= */}
      {activeTab === "interventions" && (
        <div id="interventions-view" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Student Care Plans &amp; Active Interventions</h3>
              <p className="text-xs text-slate-500">Manage assigned protocols, track milestone progress, and propose new care actions</p>
            </div>
          </div>

          {/* Active Protocols List */}
          <div className="space-y-3">
            {interventionsList.map((int) => (
              <div key={int.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs text-slate-400 font-bold block">{int.id} • Assigned to {int.assignedTo}</span>
                    <strong className="text-base font-black text-slate-900">{int.studentName} — {int.type}</strong>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold self-start sm:self-auto ${
                    int.status === "Active" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {int.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Latest Milestone:</strong> {int.latestMilestone}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Started: {int.startDate}</span>
                  <span className="text-emerald-700 font-bold">Effectiveness Rating: {int.effectiveness}/5 ⭐</span>
                </div>
              </div>
            ))}
          </div>

          {/* Propose New Intervention Form */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#8B0014]" /> Propose New Student Care Intervention
            </h4>
            <form onSubmit={handleProposeIntervention} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Student</label>
                <select
                  value={newInterventionProposal.studentId}
                  onChange={(e) => setNewInterventionProposal({ ...newInterventionProposal, studentId: Number(e.target.value) })}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Intervention Strategy</label>
                <select
                  value={newInterventionProposal.type}
                  onChange={(e) => setNewInterventionProposal({ ...newInterventionProposal, type: e.target.value })}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option>Academic Remediation &amp; Peer Tutoring</option>
                  <option>Weekly Attendance &amp; Habit Coaching</option>
                  <option>Guidance Counselor Stress Triage</option>
                  <option>Parent-Teacher Panganay Conference</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Outcome / Notes</label>
                <input
                  type="text"
                  value={newInterventionProposal.targetOutcome}
                  onChange={(e) => setNewInterventionProposal({ ...newInterventionProposal, targetOutcome: e.target.value })}
                  placeholder="e.g. Raise quiz passing rate..."
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end pt-1">
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs shadow-md"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. SUGGESTIONS: AI-Powered Recommendations */}
      {/* ========================================================================= */}
      {activeTab === "suggestions" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">AI-Powered Care Plan Recommendations</h3>
              <p className="text-xs text-slate-500">Automated interventions suggested from 5-domain risk profile and psychological research</p>
            </div>
            <select
              value={selectedStudentId || 1}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#8B0014] text-xs sm:text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Academic Domain (Weight 30%)
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>Suggested Action:</strong> Assign 1-on-1 Pre-Calculus tutoring with Grade 12 STEM Honor student.
              </p>
              <p className="text-[11px] text-slate-500">
                <strong>Rationale:</strong> Student scored 74 in Written Work. Early trigonometry reinforcement prevents failure cascades into General Physics.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-extrabold text-blue-700 text-xs sm:text-sm flex items-center gap-2">
                <Users className="h-4 w-4" /> Family &amp; Attendance Domain (Weight 20%)
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>Suggested Action:</strong> Conduct structured parent advisory on sibling caretaking load.
              </p>
              <p className="text-[11px] text-slate-500">
                <strong>Rationale:</strong> Eldest child (panganay) burden identified in 17-field screener correlates with Friday afternoon absences.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 15. LOG PROGRESS: Milestone Logger */}
      {/* ========================================================================= */}
      {activeTab === "log_progress" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Log Intervention Progress Milestones</h3>
              <p className="text-xs text-slate-500">Update tutoring sessions, parent meetings, and behavioral improvements in real-time</p>
            </div>
          </div>

          <form onSubmit={handleLogMilestone} className="space-y-4 max-w-xl text-xs sm:text-sm">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Select Active Protocol</label>
              <select
                value={milestoneLogForm.interventionId}
                onChange={(e) => setMilestoneLogForm({ ...milestoneLogForm, interventionId: e.target.value })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
              >
                {interventionsList.filter(i => i.status === "Active").map((i) => (
                  <option key={i.id} value={i.id}>{i.id}: {i.studentName} — {i.type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Milestone Type</label>
              <select
                value={milestoneLogForm.milestoneType}
                onChange={(e) => setMilestoneLogForm({ ...milestoneLogForm, milestoneType: e.target.value })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
              >
                <option>Tutoring Session Completed</option>
                <option>Parent-Teacher Meeting Conducted</option>
                <option>Diagnostic Quiz Retake Passed</option>
                <option>Attendance Consistency Improved</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Session Remarks &amp; Observations</label>
              <textarea
                rows={3}
                value={milestoneLogForm.remarks}
                onChange={(e) => setMilestoneLogForm({ ...milestoneLogForm, remarks: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-3 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-black text-sm shadow-md transition"
            >
              Record Progress Milestone
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 16. COMPLETE INTERVENTION: Outcome Analysis */}
      {/* ========================================================================= */}
      {activeTab === "complete_intervention" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Complete &amp; Close Out Care Protocol</h3>
              <p className="text-xs text-slate-500">Document outcomes, grade improvements, and institutional lessons learned</p>
            </div>
          </div>

          <form onSubmit={handleCompleteIntervention} className="space-y-4 max-w-xl text-xs sm:text-sm">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Select Protocol to Close</label>
              <select
                value={closeoutForm.interventionId}
                onChange={(e) => setCloseoutForm({ ...closeoutForm, interventionId: e.target.value })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
              >
                {interventionsList.filter(i => i.status === "Active").map((i) => (
                  <option key={i.id} value={i.id}>{i.id}: {i.studentName} — {i.type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Overall Outcome Rating</label>
              <select
                value={closeoutForm.outcomeRating}
                onChange={(e) => setCloseoutForm({ ...closeoutForm, outcomeRating: e.target.value })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
              >
                <option>Successful (Target Met)</option>
                <option>Partially Successful (Ongoing Monitoring Required)</option>
                <option>Escalated to Guidance Department</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Measured Improvement</label>
              <input
                type="text"
                value={closeoutForm.gradeImprovement}
                onChange={(e) => setCloseoutForm({ ...closeoutForm, gradeImprovement: e.target.value })}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Lessons Learned / Documentation</label>
              <textarea
                rows={3}
                value={closeoutForm.lessonsLearned}
                onChange={(e) => setCloseoutForm({ ...closeoutForm, lessonsLearned: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition"
            >
              Complete Protocol &amp; Archive
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 17. CLASS RECORD: DepEd Form 137 Digital Version */}
      {/* ========================================================================= */}
      {activeTab === "class_record" && (
        <div id="class-record-view" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">DepEd Digital Class Record (Form 137)</h3>
              <p className="text-xs text-slate-500">Official composite grades, attendance rates, and conduct for Grade 11 - STEM (St. Augustine)</p>
            </div>
            <button
              type="button"
              onClick={handleExportClassRecord}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Download className="h-4 w-4" />
              <span>Export &amp; Print Form 137</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600 text-[11px]">
                <tr>
                  <th className="py-3 px-4">LRN</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3 text-center">Gen. Math</th>
                  <th className="py-3 px-3 text-center">Pre-Calculus</th>
                  <th className="py-3 px-3 text-center">Gen. Chem</th>
                  <th className="py-3 px-3 text-center">Oral Comm</th>
                  <th className="py-3 px-3 text-center">Q2 GPA</th>
                  <th className="py-3 px-3 text-center">Attendance %</th>
                  <th className="py-3 px-4 text-center">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.slice(0, 15).map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.lrn}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.full_name}</td>
                    <td className="py-3 px-3 text-center">{88 + (idx % 5)}</td>
                    <td className="py-3 px-3 text-center">{74 + (idx % 7)}</td>
                    <td className="py-3 px-3 text-center">{85 + (idx % 4)}</td>
                    <td className="py-3 px-3 text-center">{90 + (idx % 3)}</td>
                    <td className="py-3 px-3 text-center font-black text-[#8B0014]">
                      {s.sass_metrics?.gpa ? s.sass_metrics.gpa.toFixed(1) : "88.5"}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-emerald-600">
                      {s.sass_metrics?.attendance_rate_pct ? `${s.sass_metrics.attendance_rate_pct}%` : "96.5%"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Passed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 18. ATTENDANCE RECORD: Manual Encoding Calendar */}
      {/* ========================================================================= */}
      {activeTab === "attendance_record" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Manual Attendance Encoding Calendar</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase">
                  {activeAttendanceMonthObj.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fast day-by-day attendance roll call with Present (P), Absent (A), Excused (E), and Late (L). Click any cell to cycle status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Month Selector Dropdown */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <select
                  value={attendanceCalendarMonth}
                  onChange={(e) => setAttendanceCalendarMonth(e.target.value)}
                  className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B0014]/20 cursor-pointer"
                >
                  {ATTENDANCE_MONTHS.map(m => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Actions */}
              <button
                type="button"
                onClick={handleFillAllPresent}
                className="min-h-[40px] px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Fill all blank dates for this month with Present"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Fill Present</span>
              </button>

              <button
                type="button"
                onClick={handleExportMonthAttendanceCsv}
                className="min-h-[40px] px-3.5 rounded-xl bg-[#8B0014] hover:bg-[#700010] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download this month's attendance sheet as CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search and Section Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name or LRN..."
                  value={attendanceStudentSearch}
                  onChange={e => setAttendanceStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8B0014]"
                />
              </div>
              <select
                value={attendanceSectionFilter}
                onChange={e => setAttendanceSectionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8B0014] cursor-pointer"
              >
                <option value="all">All Sections</option>
                {Array.from(new Set(students.map(s => s.section_name))).filter(Boolean).sort().map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-slate-500 font-medium self-end sm:self-auto">
              <span>Showing <strong>{filteredAttendanceStudents.length}</strong> students</span>
              <span>•</span>
              <span><strong>{activeSchoolDays.length}</strong> School Days in {activeAttendanceMonthObj.label}</span>
            </div>
          </div>

          {/* Dynamic Interactive Attendance Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="min-w-full text-center text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600">
                <tr>
                  <th className="py-3 px-3 text-left min-w-[180px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                    Student Details
                  </th>
                  {activeSchoolDays.map(d => (
                    <th key={d.dateKey} className="py-2.5 px-1.5 min-w-[48px] border-r border-slate-100 last:border-r-0">
                      <div className="text-[10px] text-slate-400 font-mono leading-none">{d.weekday}</div>
                      <div className="text-[11px] font-bold text-slate-700 mt-0.5">{d.day}</div>
                    </th>
                  ))}
                  <th className="py-3 px-2 min-w-[50px] bg-emerald-50/60 text-emerald-800 border-l border-slate-200" title="Total Present">
                    P
                  </th>
                  <th className="py-3 px-2 min-w-[50px] bg-rose-50/60 text-rose-800" title="Total Absent">
                    A
                  </th>
                  <th className="py-3 px-2 min-w-[50px] bg-amber-50/60 text-amber-800" title="Total Excused">
                    E
                  </th>
                  <th className="py-3 px-2 min-w-[50px] bg-blue-50/60 text-blue-800" title="Total Late">
                    L
                  </th>
                  <th className="py-3 px-3 min-w-[65px] bg-slate-100 text-slate-800 font-black" title="Monthly Attendance Rate">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAttendanceStudents.slice(0, 15).map(s => {
                  let pCount = 0;
                  let aCount = 0;
                  let eCount = 0;
                  let lCount = 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info Sticky Column */}
                      <td className="py-2.5 px-3 text-left sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200">
                        <div className="font-bold text-slate-900 truncate max-w-[170px]">{s.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{s.lrn}</div>
                      </td>

                      {/* Day Cells */}
                      {activeSchoolDays.map(d => {
                        const currentStatus = monthlyAttendanceRecord[attendanceCalendarMonth]?.[s.id]?.[d.day] || "P";
                        if (currentStatus === "P") pCount++;
                        else if (currentStatus === "A") aCount++;
                        else if (currentStatus === "E") eCount++;
                        else if (currentStatus === "L") lCount++;

                        return (
                          <td key={d.dateKey} className="py-1.5 px-1 border-r border-slate-100/80">
                            <button
                              type="button"
                              onClick={() => toggleAttendanceCell(s.id, d.day)}
                              className={`h-7 w-7 rounded-lg font-black text-xs transition-all flex items-center justify-center mx-auto cursor-pointer select-none transform active:scale-95 shadow-2xs ${
                                currentStatus === "P" ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300/60" :
                                currentStatus === "A" ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-in zoom-in-90 duration-100" :
                                currentStatus === "E" ? "bg-amber-200 hover:bg-amber-300 text-amber-900 border border-amber-300" :
                                "bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300"
                              }`}
                              title={`${s.full_name}: ${d.label} (${d.weekday}) — ${
                                currentStatus === "P" ? "Present" :
                                currentStatus === "A" ? "Unexcused Absent" :
                                currentStatus === "E" ? "Excused Absence" : "Late / Tardy"
                              } (Click to toggle)`}
                            >
                              {currentStatus}
                            </button>
                          </td>
                        );
                      })}

                      {/* Summary Columns */}
                      <td className="py-2 px-1 bg-emerald-50/30 font-bold text-emerald-700 border-l border-slate-200">
                        {pCount}
                      </td>
                      <td className="py-2 px-1 bg-rose-50/30 font-bold text-rose-700">
                        {aCount}
                      </td>
                      <td className="py-2 px-1 bg-amber-50/30 font-bold text-amber-700">
                        {eCount}
                      </td>
                      <td className="py-2 px-1 bg-blue-50/30 font-bold text-blue-700">
                        {lCount}
                      </td>
                      <td className="py-2 px-2 bg-slate-50 font-black">
                        {(() => {
                          const total = pCount + aCount + eCount + lCount;
                          const rate = total > 0 ? Math.round(((pCount + eCount) / total) * 100) : 100;
                          return (
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              rate >= 90 ? "bg-emerald-100 text-emerald-800" :
                              rate >= 80 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {rate}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Legend and Summary Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" /> P = Present</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-rose-600" /> A = Unexcused Absent</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-400" /> E = Excused Absence</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-500" /> L = Tardy / Late</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>💡 Click any status button to cycle between <strong>P &rarr; A &rarr; E &rarr; L</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 19. NOTIFICATIONS: Teacher Alerts */}
      {/* ========================================================================= */}
      {activeTab === "notifications" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Teacher Alert &amp; Notification Center</h3>
              <p className="text-xs text-slate-500">Crisis flag alerts, parent responses, and submission deadlines</p>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-slate-900">{n.title}</strong>
                    <span className="text-[11px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600">{n.desc}</p>
                </div>
                {!n.read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8B0014] shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 20. EXPORT CREDENTIALS: Generate Student Portal Logins */}
      {/* ========================================================================= */}
      {activeTab === "export_credentials" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Generate Student Portal Credentials</h3>
              <p className="text-xs text-slate-500">Batch export credentials with usernames and initial passwords for distribution</p>
            </div>
            <button
              type="button"
              onClick={handleExportCredentialsCsv}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Download className="h-4 w-4" />
              <span>Download Credentials CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-extrabold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">LRN</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Username / Email</th>
                  <th className="py-2.5 px-3">Initial Temp Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono">
                {students.slice(0, 10).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{s.lrn}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{s.full_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.email}</td>
                    <td className="py-2.5 px-3 font-bold text-[#8B0014]">SAPC2026!{s.lrn.slice(-4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 21. MESSAGES: Threaded Counselor & Parent Communications */}
      {/* ========================================================================= */}
      {activeTab === "messages" && (
        <div id="messages-view" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Threaded Communications per Student</h3>
              <p className="text-xs text-slate-500">Internal coordination with Guidance Counselors and Parents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Thread list */}
            <div className="space-y-2 border-r border-slate-100 pr-0 md:pr-3">
              {messageThreads.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition border ${
                    activeThreadId === t.id ? "bg-rose-50/70 border-rose-300 ring-1 ring-[#8B0014]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 font-extrabold">{t.studentName}</span>
                    <span className="text-[10px] text-slate-400">{t.timestamp}</span>
                  </div>
                  <span className="text-[11px] text-[#8B0014] font-bold block">{t.recipient} ({t.role})</span>
                  <p className="text-[11px] text-slate-500 truncate mt-1">{t.lastMessage}</p>
                </div>
              ))}
            </div>

            {/* Active Thread Chat */}
            <div className="md:col-span-2 flex flex-col justify-between h-96 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="overflow-y-auto space-y-3 pr-2">
                {messageThreads.find(t => t.id === activeThreadId)?.history.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.isTeacher ? "items-end" : "items-start"}`}>
                    <div className={`p-3 rounded-2xl max-w-sm text-xs ${
                      msg.isTeacher ? "bg-[#8B0014] text-white" : "bg-white border border-slate-200 text-slate-900 shadow-2xs"
                    }`}>
                      <strong className="block text-[10px] opacity-80 mb-0.5">{msg.sender}</strong>
                      <span>{msg.text}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-200/80">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type your message to Counselor / Parent..."
                  className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#8B0014]"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Student Comprehensive Detail Modal */}
      {isDetailOpen && selectedStudentId && (
        <StudentDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          studentId={selectedStudentId}
        />
      )}

      {/* 1-Click Guidance Referral Modal */}
      {isReferralOpen && (
        <TeacherReferralModal
          isOpen={isReferralOpen}
          onClose={() => setIsReferralOpen(false)}
          student={referralStudent}
          onSuccess={() => showToast("Guidance referral submitted to Guidance Department.")}
        />
      )}
    </div>
  );
};
