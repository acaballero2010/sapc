"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  HeartHandshake,
  MessageSquare, 
  ShieldCheck, 
  Award, 
  AlertTriangle, 
  TrendingUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  PhoneCall, 
  GraduationCap, 
  Megaphone,
  Trophy,
  FileText, 
  Bell, 
  HeartPulse, 
  ShieldAlert, 
  Wallet, 
  Home, 
  Lock, 
  Eye, 
  EyeOff,
  Filter,
  User,
  ArrowRight,
  Send,
  Printer
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SAPC_500_STUDENTS, StudentRecord } from "@/data/students500";
import { useDragScroll } from "@/lib/useDragScroll";
import { RiskBadge } from "./RiskBadge";
import { AHPDataVisualizer } from "./AHPDataVisualizer";
import { DepEdFormModal } from "./DepEdFormModal";
import { 
  getActiveStudentDataset, 
  getActiveInterventions, 
  getActiveNotifications, 
  scheduleCounselingSession, 
  addAppNotification, 
  getActiveParentRecords,
  getActiveCommendations,
  AppNotification, 
  InterventionCarePlan 
} from "@/lib/dataset-store";

export type ParentTabType = 
  | "dashboard"
  | "child_progress"
  | "interventions"
  | "acknowledge_intervention"
  | "family_assessment"
  | "financial_assessment"
  | "crisis_alerts"
  | "schedule_meeting"
  | "academic_reports"
  | "attendance"
  | "wellness"
  | "notifications"
  | "resources"
  | "announcements"
  | "messages";

export type QuarterFilterType = "all" | "q1" | "q2" | "q3" | "q4";

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ParentTabType>("dashboard");
  const [selectedNavCategory, setSelectedNavCategory] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterFilterType>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasStudentConsent, setHasStudentConsent] = useState<boolean>(true);
  const [studentDataset, setStudentDataset] = useState<StudentRecord[]>(() => getActiveStudentDataset());
  const [interventionsList, setInterventionsList] = useState<InterventionCarePlan[]>(() => getActiveInterventions());
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>(() => getActiveNotifications("parent"));
  const [isDepEdFormOpen, setIsDepEdFormOpen] = useState(false);
  const catDrag = useDragScroll<HTMLDivElement>();
  const tabsDrag = useDragScroll<HTMLDivElement>();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Pre-linked children dynamically derived from active student database and parent profile
  const isDemoParent = !user?.email || user.email.toLowerCase() === "parent@sapc.edu.ph";

  const LINKED_CHILDREN = useMemo(() => {
    const customStudentIds: number[] = [];

    if (user?.lrn) {
      const match = studentDataset.find(s => String(s.lrn).trim() === String(user.lrn).trim());
      if (match && !customStudentIds.includes(match.id)) {
        customStudentIds.push(match.id);
      }
    }

    if (user?.linked_lrns && Array.isArray(user.linked_lrns)) {
      user.linked_lrns.forEach(l => {
        const match = studentDataset.find(s => String(s.lrn).trim() === String(l).trim());
        if (match && !customStudentIds.includes(match.id)) {
          customStudentIds.push(match.id);
        }
      });
    }

    if (user?.email) {
      const allParents = getActiveParentRecords();
      const parentRec = allParents.find(p => p.email?.toLowerCase() === user.email?.toLowerCase());
      if (parentRec?.linkedLRN) {
        const match = studentDataset.find(s => String(s.lrn).trim() === String(parentRec.linkedLRN).trim());
        if (match && !customStudentIds.includes(match.id)) {
          customStudentIds.push(match.id);
        }
      }
      const extraList: string[] = (parentRec as any)?.linkedLRNs || [];
      extraList.forEach(l => {
        const match = studentDataset.find(s => String(s.lrn).trim() === String(l).trim());
        if (match && !customStudentIds.includes(match.id)) {
          customStudentIds.push(match.id);
        }
      });
    }

    // Only the default institutional demo account gets sample learners [1, 2, 4]
    const finalIds = customStudentIds.length > 0 
      ? customStudentIds 
      : isDemoParent 
        ? [1, 2, 4] 
        : [];

    return finalIds.map(id => {
      const s = studentDataset.find(st => st.id === id) || studentDataset[0];
      const initials = s ? `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}` : "ST";
      return {
        id: s.id,
        name: s.full_name,
        lrn: s.lrn,
        grade_level: s.grade_level || 10,
        strand: s.strand || "JHS",
        section: s.section_name || "Grade 10 - St. Anthony",
        adviser: s.adviser_name || "Engr. Roberto Santos, LPT",
        counselor: "Maria Theresa Cruz, RGC",
        avatar: initials,
        risk_score: s.latest_risk_score ?? 15,
        risk_tier: s.latest_risk_tier || "low"
      };
    });
  }, [studentDataset, user, isDemoParent]);

  // Synchronize selected child when linked children change
  useEffect(() => {
    if (LINKED_CHILDREN.length > 0 && !LINKED_CHILDREN.some(c => c.id === selectedStudentId)) {
      setSelectedStudentId(LINKED_CHILDREN[0].id);
    }
  }, [LINKED_CHILDREN, selectedStudentId]);

  const currentChild = useMemo(() => {
    return studentDataset.find(s => s.id === selectedStudentId) || studentDataset[0] || SAPC_500_STUDENTS[0];
  }, [studentDataset, selectedStudentId]);

  const currentChildInfo = useMemo(() => {
    return LINKED_CHILDREN.find(c => c.id === selectedStudentId) || LINKED_CHILDREN[0];
  }, [LINKED_CHILDREN, selectedStudentId]);

  const childInterventions = useMemo(() => {
    return interventionsList.filter(i => i.student_id === selectedStudentId);
  }, [interventionsList, selectedStudentId]);

  const childNotifications = useMemo(() => {
    return notificationsList.filter(n => !n.student_id || n.student_id === selectedStudentId || n.audience === "all" || n.audience === "parent");
  }, [notificationsList, selectedStudentId]);

  const unreadParentNotifsCount = useMemo(() => {
    return notificationsList.filter(n => !n.read && !n.is_read).length;
  }, [notificationsList]);

  // Dynamic Subject & Assigned Faculty Roster for Current Child
  const studentSubjects = useMemo(() => {
    const gwa = currentChild.sass_metrics?.gpa || currentChild.domain_scores?.academic || 85;
    const gradeLevel = currentChild.grade_level || 10;
    const isSHS = gradeLevel >= 11;

    if (isSHS) {
      return [
        {
          code: "CORE-1101",
          name: "Pre-Calculus / Advanced Mathematics",
          department: "Mathematics & Science",
          teacher: "Engr. Roberto Santos, LPT",
          teacherRole: "STEM Subject Teacher & Homeroom Adviser",
          teacherEmail: "r.santos@sapc.edu.ph",
          room: "Room 302 (STEM Lab)",
          schedule: "Mon/Wed/Fri • 8:00 AM - 9:30 AM",
          q1: Math.round(gwa - 4),
          q2: Math.round(gwa - 2),
          q3: Math.round(gwa - 1),
          q4: Math.round(gwa),
          ww: 84,
          pt: 86,
          qe: 82,
          teacherRemarks: "Shows continuous recovery in quadratic and trigonometric proofs. Dedicated homework diligence."
        },
        {
          code: "CORE-1102",
          name: "General Chemistry 1 & Laboratory",
          department: "Natural Sciences",
          teacher: "Mrs. Ma. Cristina Dela Cruz, LPT",
          teacherRole: "Science Department Coordinator",
          teacherEmail: "c.delacruz@sapc.edu.ph",
          room: "Science Laboratory B",
          schedule: "Tue/Thu • 9:30 AM - 11:30 AM",
          q1: Math.round(gwa - 2),
          q2: Math.round(gwa + 1),
          q3: Math.round(gwa + 2),
          q4: Math.round(gwa + 1),
          ww: 88,
          pt: 91,
          qe: 85,
          teacherRemarks: "Excellent laboratory outputs and safety compliance during chemical stoichiometry experiments."
        },
        {
          code: "CORE-1103",
          name: "Oral Communication in Context",
          department: "Languages & Humanities",
          teacher: "Ma'am Angelica Reyes, LPT",
          teacherRole: "English Faculty & Debate Coach",
          teacherEmail: "a.reyes@sapc.edu.ph",
          room: "Room 205 (Speech Lab)",
          schedule: "Mon/Wed • 10:00 AM - 11:30 AM",
          q1: Math.round(gwa + 2),
          q2: Math.round(gwa + 3),
          q3: Math.round(gwa + 4),
          q4: Math.round(gwa + 3),
          ww: 92,
          pt: 94,
          qe: 90,
          teacherRemarks: "Outstanding impromptu speeches and debate moderation. Highly confident and articulate."
        },
        {
          code: "CORE-1104",
          name: "Komunikasyon at Pananaliksik sa Wika",
          department: "Filipino & Social Sciences",
          teacher: "Ma'am Maricel Alcantara, LPT",
          teacherRole: "Filipino Department Head",
          teacherEmail: "m.alcantara@sapc.edu.ph",
          room: "Room 201",
          schedule: "Tue/Thu • 1:00 PM - 2:30 PM",
          q1: Math.round(gwa + 1),
          q2: Math.round(gwa + 2),
          q3: Math.round(gwa + 1),
          q4: Math.round(gwa + 2),
          ww: 89,
          pt: 90,
          qe: 87,
          teacherRemarks: "Mahusay na pagsusuri ng mga tekstong pampanitikan at masigasig sa mga pangkatang gawain."
        },
        {
          code: "SPEC-1105",
          name: "Earth & Life Science",
          department: "Natural Sciences",
          teacher: "Sir Dennis Ramos, LPT",
          teacherRole: "Senior High Science Faculty",
          teacherEmail: "d.ramos@sapc.edu.ph",
          room: "Room 304",
          schedule: "Mon/Wed • 1:00 PM - 2:30 PM",
          q1: Math.round(gwa),
          q2: Math.round(gwa + 1),
          q3: Math.round(gwa + 2),
          q4: Math.round(gwa + 2),
          ww: 86,
          pt: 89,
          qe: 84,
          teacherRemarks: "Consistent project submissions on tectonic and ecosystem models. Very reliable group leader."
        },
        {
          code: "APPL-1106",
          name: "Empowerment Technologies (ICT / Applied Media)",
          department: "Information & Communications Tech",
          teacher: "Sir Michael Alcantara, LPT",
          teacherRole: "ICT Coordinator & Systems Faculty",
          teacherEmail: "m.alcantara.ict@sapc.edu.ph",
          room: "Computer Lab 1",
          schedule: "Fri • 1:00 PM - 4:00 PM",
          q1: Math.round(gwa + 3),
          q2: Math.round(gwa + 4),
          q3: Math.round(gwa + 3),
          q4: Math.round(gwa + 4),
          ww: 95,
          pt: 96,
          qe: 93,
          teacherRemarks: "High technical aptitude in web publishing, digital prototyping, and collaborative media."
        },
        {
          code: "CORE-1107",
          name: "Physical Education & Health 1",
          department: "MAPEH & Athletics",
          teacher: "Coach Bryan Mercado, LPT",
          teacherRole: "Sports & Physical Wellness Instructor",
          teacherEmail: "b.mercado@sapc.edu.ph",
          room: "SAPC Gymnasium",
          schedule: "Tue • 3:00 PM - 5:00 PM",
          q1: Math.round(gwa + 5),
          q2: Math.round(gwa + 4),
          q3: Math.round(gwa + 5),
          q4: Math.round(gwa + 5),
          ww: 94,
          pt: 98,
          qe: 92,
          teacherRemarks: "Exemplary sportsmanship, active participation in aerobics, and leadership during team drills."
        }
      ];
    } else {
      // Junior High School Subjects (Grade 7 - 10)
      return [
        {
          code: "JHS-ENG",
          name: "English (Grammar & World Literature)",
          department: "Languages & Humanities",
          teacher: "Sir Gabriel Navarro, LPT",
          teacherRole: "English Faculty & Speech Coach",
          teacherEmail: "g.navarro@sapc.edu.ph",
          room: "Room 102",
          schedule: "Mon to Thu • 8:00 AM - 9:00 AM",
          q1: Math.round(gwa + 1),
          q2: Math.round(gwa + 2),
          q3: Math.round(gwa + 3),
          q4: Math.round(gwa + 2),
          ww: 90,
          pt: 92,
          qe: 88,
          teacherRemarks: "Very good reading comprehension, active class discussion, and timely book report submissions."
        },
        {
          code: "JHS-MATH",
          name: "Mathematics (Algebra & Geometry)",
          department: "Mathematics & Science",
          teacher: "Engr. Roberto Santos, LPT",
          teacherRole: "Junior High Math Coordinator",
          teacherEmail: "r.santos@sapc.edu.ph",
          room: "Room 104",
          schedule: "Mon to Fri • 9:00 AM - 10:00 AM",
          q1: Math.round(gwa - 3),
          q2: Math.round(gwa - 1),
          q3: Math.round(gwa),
          q4: Math.round(gwa + 1),
          ww: 82,
          pt: 85,
          qe: 80,
          teacherRemarks: "Shows great persistence in linear equations and geometric problem solving."
        },
        {
          code: "JHS-SCI",
          name: "Integrated Science",
          department: "Natural Sciences",
          teacher: "Mrs. Ma. Cristina Dela Cruz, LPT",
          teacherRole: "Science Department Head",
          teacherEmail: "c.delacruz@sapc.edu.ph",
          room: "Science Lab A",
          schedule: "Mon to Thu • 10:30 AM - 11:30 AM",
          q1: Math.round(gwa),
          q2: Math.round(gwa + 1),
          q3: Math.round(gwa + 2),
          q4: Math.round(gwa + 1),
          ww: 86,
          pt: 89,
          qe: 85,
          teacherRemarks: "Hands-on participation during lab experiments. Clear scientific journaling."
        },
        {
          code: "JHS-FIL",
          name: "Filipino (Panitikan at Balarila)",
          department: "Filipino Department",
          teacher: "Ma'am Maricel Alcantara, LPT",
          teacherRole: "Filipino Faculty",
          teacherEmail: "m.alcantara@sapc.edu.ph",
          room: "Room 106",
          schedule: "Mon to Thu • 1:00 PM - 2:00 PM",
          q1: Math.round(gwa + 2),
          q2: Math.round(gwa + 2),
          q3: Math.round(gwa + 3),
          q4: Math.round(gwa + 3),
          ww: 91,
          pt: 93,
          qe: 89,
          teacherRemarks: "Matiyaga sa pagbabasa ng Ibong Adarna / Florante at Laura. Mahusay makipagtalastasan."
        },
        {
          code: "JHS-AP",
          name: "Araling Panlipunan (Kasaysayan)",
          department: "Social Studies",
          teacher: "Sir Dennis Ramos, LPT",
          teacherRole: "Social Studies Faculty",
          teacherEmail: "d.ramos@sapc.edu.ph",
          room: "Room 108",
          schedule: "Mon to Thu • 2:00 PM - 3:00 PM",
          q1: Math.round(gwa + 1),
          q2: Math.round(gwa + 2),
          q3: Math.round(gwa + 2),
          q4: Math.round(gwa + 2),
          ww: 88,
          pt: 90,
          qe: 87,
          teacherRemarks: "Active participant in history recitations and current affairs analysis."
        },
        {
          code: "JHS-TLE",
          name: "Technology & Livelihood Education (TLE/ICT)",
          department: "TLE & Technical Dept",
          teacher: "Sir Michael Alcantara, LPT",
          teacherRole: "TLE Instructor",
          teacherEmail: "m.alcantara.ict@sapc.edu.ph",
          room: "TLE Workshop & Computer Room",
          schedule: "Tue/Thu • 3:00 PM - 4:30 PM",
          q1: Math.round(gwa + 3),
          q2: Math.round(gwa + 3),
          q3: Math.round(gwa + 4),
          q4: Math.round(gwa + 4),
          ww: 93,
          pt: 95,
          qe: 91,
          teacherRemarks: "Creative and resourceful during technical hands-on projects."
        },
        {
          code: "JHS-MAPEH",
          name: "MAPEH (Music, Arts, PE, Health)",
          department: "MAPEH Department",
          teacher: "Coach Bryan Mercado, LPT",
          teacherRole: "MAPEH Coordinator",
          teacherEmail: "b.mercado@sapc.edu.ph",
          room: "Music Hall & Gym",
          schedule: "Mon/Wed • 3:00 PM - 4:30 PM",
          q1: Math.round(gwa + 4),
          q2: Math.round(gwa + 4),
          q3: Math.round(gwa + 5),
          q4: Math.round(gwa + 4),
          ww: 94,
          pt: 96,
          qe: 92,
          teacherRemarks: "Very expressive in arts and music, demonstrates strong physical fitness."
        },
        {
          code: "JHS-ESP",
          name: "Edukasyon sa Pagpapakatao (EsP)",
          department: "Values Education",
          teacher: "Ma'am Teresa Morales, LPT",
          teacherRole: "Values Education Faculty",
          teacherEmail: "t.morales@sapc.edu.ph",
          room: "Room 110",
          schedule: "Fri • 8:00 AM - 10:00 AM",
          q1: Math.round(gwa + 3),
          q2: Math.round(gwa + 4),
          q3: Math.round(gwa + 4),
          q4: Math.round(gwa + 4),
          ww: 92,
          pt: 95,
          qe: 90,
          teacherRemarks: "Displays high ethical character, empathy towards classmates, and respectful demeanor."
        }
      ];
    }
  }, [currentChild]);

  // DepEd Core Values (Observed Values Matrix)
  const coreValuesList = useMemo(() => [
    {
      coreValue: "1. MAKA-DIYOS",
      behaviorStatement: "Expresses one's spiritual beliefs and shows respect for other religions and beliefs.",
      q1: "AO",
      q2: "AO",
      q3: "AO",
      q4: "AO"
    },
    {
      coreValue: "1. MAKA-DIYOS",
      behaviorStatement: "Demonstrates truthfulness, honesty, and integrity in all actions and academic work.",
      q1: "AO",
      q2: "AO",
      q3: "AO",
      q4: "AO"
    },
    {
      coreValue: "2. MAKATAO",
      behaviorStatement: "Shows sensitivity to individual, social, and cultural differences with empathy.",
      q1: "AO",
      q2: "AO",
      q3: "AO",
      q4: "AO"
    },
    {
      coreValue: "2. MAKATAO",
      behaviorStatement: "Demonstrates solidarity, cooperation, and respectful communication with peers and teachers.",
      q1: "AO",
      q2: "AO",
      q3: "AO",
      q4: "AO"
    },
    {
      coreValue: "3. MAKAKALIKASAN",
      behaviorStatement: "Cares for the environment and utilizes resources wisely, judiciously, and economically.",
      q1: "SO",
      q2: "AO",
      q3: "AO",
      q4: "AO"
    },
    {
      coreValue: "4. MAKABANSA",
      behaviorStatement: "Demonstrates pride in being a Filipino and exercises the rights and duties of a responsible citizen.",
      q1: "AO",
      q2: "AO",
      q3: "AO",
      q4: "AO"
    }
  ], []);

  // DepEd Monthly Attendance Summary Matrix
  const monthlyAttendance = useMemo(() => [
    { month: "Aug", days: 6, present: 6, absent: 0, tardy: 0 },
    { month: "Sep", days: 22, present: 21, absent: 1, tardy: 0 },
    { month: "Oct", days: 21, present: 20, absent: 1, tardy: 1 },
    { month: "Nov", days: 20, present: 20, absent: 0, tardy: 0 },
    { month: "Dec", days: 15, present: 15, absent: 0, tardy: 0 },
    { month: "Jan", days: 20, present: 19, absent: 1, tardy: 0 },
    { month: "Feb", days: 18, present: 18, absent: 0, tardy: 1 },
    { month: "Mar", days: 22, present: 22, absent: 0, tardy: 0 },
    { month: "Apr", days: 20, present: 20, absent: 0, tardy: 0 },
    { month: "May", days: 16, present: 15, absent: 1, tardy: 0 }
  ], []);

  // Homeroom Adviser's Narrative Report & Quarterly Qualitative Assessments
  const quarterlyAdviserRemarks = useMemo(() => [
    {
      quarter: "Quarter 1",
      quarterKey: "q1",
      date: "October 2026",
      adviser: currentChildInfo.adviser,
      generalAverage: (studentSubjects.reduce((acc, s) => acc + s.q1, 0) / studentSubjects.length).toFixed(2),
      conductRemark: "Very Good Conduct",
      narrative: `${currentChild.first_name} has adapted smoothly to the class environment. Needs slight reinforcement in exam pacing for core math subjects, but demonstrates high enthusiasm and active participation in class activities.`
    },
    {
      quarter: "Quarter 2",
      quarterKey: "q2",
      date: "December 2026",
      adviser: currentChildInfo.adviser,
      generalAverage: (studentSubjects.reduce((acc, s) => acc + s.q2, 0) / studentSubjects.length).toFixed(2),
      conductRemark: "Outstanding Conduct",
      narrative: `Remarkable improvement observed across technical and science subjects following the guided peer-tutoring protocol. Homework and project submissions are consistently submitted ahead of deadlines.`
    },
    {
      quarter: "Quarter 3",
      quarterKey: "q3",
      date: "March 2027",
      adviser: currentChildInfo.adviser,
      generalAverage: (studentSubjects.reduce((acc, s) => acc + s.q3, 0) / studentSubjects.length).toFixed(2),
      conductRemark: "Outstanding Conduct",
      narrative: `Shows strong academic consistency and leadership during group performance tasks. Maintains a healthy balance between academic work and extra-curricular interests.`
    },
    {
      quarter: "Quarter 4",
      quarterKey: "q4",
      date: "May 2027",
      adviser: currentChildInfo.adviser,
      generalAverage: (studentSubjects.reduce((acc, s) => acc + s.q4, 0) / studentSubjects.length).toFixed(2),
      conductRemark: "Exemplary Conduct",
      narrative: `Successfully completed all academic competencies for the grade level with flying colors. Recommended for promotion with Honors to the next academic level.`
    }
  ], [currentChild, currentChildInfo, studentSubjects]);

  // Categories for 15 Tabs
  const CATEGORIES = useMemo(() => [
    { id: "all", label: "All Parent Tools (15)" },
    { id: "overview", label: "Progress & Academics (4)", tabIds: ["dashboard", "child_progress", "academic_reports", "attendance"] },
    { id: "care", label: "Care & Interventions (4)", tabIds: ["interventions", "acknowledge_intervention", "wellness", "crisis_alerts"] },
    { id: "surveys", label: "Family & Financial Forms (2)", tabIds: ["family_assessment", "financial_assessment"] },
    { id: "connect", label: "Meetings & Messaging (5)", tabIds: ["schedule_meeting", "messages", "notifications", "resources", "announcements"] }
  ], []);

  const TAB_ITEMS: Array<{ id: ParentTabType; label: string; icon: any; badge?: string; category: string }> = [
    { id: "dashboard", label: "Family Overview", icon: Users, badge: "Home", category: "overview" },
    { id: "child_progress", label: "Child's Wellness Journey", icon: TrendingUp, badge: "Consent", category: "overview" },
    { id: "academic_reports", label: "Report Card (Form 138)", icon: BookOpen, badge: "Grades", category: "overview" },
    { id: "attendance", label: "Attendance & Patterns", icon: Calendar, badge: "96.5%", category: "overview" },
    { id: "interventions", label: "Active Care Plans", icon: ShieldCheck, badge: "1 Active", category: "care" },
    { id: "acknowledge_intervention", label: "Acknowledge Home Support", icon: CheckCircle2, badge: "Action Required", category: "care" },
    { id: "wellness", label: "Areas Needing Support", icon: HeartPulse, category: "care" },
    { id: "crisis_alerts", label: "Crisis Notifications", icon: AlertTriangle, badge: "Actionable", category: "care" },
    { id: "family_assessment", label: "Family Environment Form", icon: Home, badge: "Confidential", category: "surveys" },
    { id: "financial_assessment", label: "Financial & 4Ps Survey", icon: Wallet, badge: "Optional", category: "surveys" },
    { id: "schedule_meeting", label: "Schedule Consultation", icon: HeartHandshake, category: "connect" },
    { id: "messages", label: "Direct Teacher Chat", icon: MessageSquare, badge: "Threaded", category: "connect" },
    { id: "notifications", label: "Parent Inbox", icon: Bell, badge: unreadParentNotifsCount > 0 ? `${unreadParentNotifsCount} New` : undefined, category: "connect" },
    { id: "resources", label: "Parenting & Health Guides", icon: FileText, category: "connect" },
    { id: "announcements", label: "School Events & Memos", icon: Megaphone, category: "connect" }
  ];

  const visibleTabs = selectedNavCategory === "all"
    ? TAB_ITEMS
    : TAB_ITEMS.filter(t => t.category === selectedNavCategory);

  // 4. Formal Acknowledgment Checklist
  const [acknowledgments, setAcknowledgments] = useState([
    {
      id: "ACK-01",
      title: "Provide a Quiet Study Space & 8-Hour Sleep Schedule",
      originator: "Maria Theresa Cruz, RGC (Guidance Counselor)",
      protocol: "Academic Anxiety & Insomnia Remediation Protocol",
      parentActionRequired: "Ensure household lights are dimmed after 10:00 PM and student has a dedicated distraction-free study table for STEM homework.",
      dateAssigned: "Sep 18, 2026",
      isAcknowledged: true,
      acknowledgedDate: "Sep 19, 2026 08:30 AM"
    },
    {
      id: "ACK-02",
      title: "Supervise Tuesday & Thursday Peer Tutoring with Kyle Mercado",
      originator: "Engr. Roberto Santos, LPT (Class Adviser)",
      protocol: "Pre-Calculus Core Factoring & Limits Support",
      parentActionRequired: "Confirm student attends 4:30 PM library peer-review sessions before commuting home.",
      dateAssigned: "Sep 19, 2026",
      isAcknowledged: false,
      acknowledgedDate: null
    }
  ]);

  // 5. Family Assessment Form
  const [familyData, setFamilyData] = useState({
    parentingStyle: "Authoritative (Supportive with Clear Expectations)",
    homeEnvironment: "Peaceful / Adequate Space",
    familyStressors: "Managing rising transportation expenses and sibling tuition",
    familySupportLevel: "High - Parents available during evenings",
    culturalValues: "High emphasis on academic success as first-generation college applicant"
  });

  // 6. Financial Assessment Form
  const [financialData, setFinancialData] = useState({
    monthlyIncomeBracket: "₱25,000 - ₱45,000 (Middle Income)",
    is4PsBeneficiary: "No",
    hasExternalScholarship: "No - Inquiring about Alumni Foundation Grant",
    paymentArrangement: "Quarterly Installment Plan",
    financialConcerns: "Occasional delays in exam permit clearance during midterms"
  });

  // 8. Meeting Scheduler
  const [requestedMeetings, setRequestedMeetings] = useState([
    {
      id: "REQ-01",
      type: "Guidance Counselor 1-on-1 Consultation",
      staff: "Maria Theresa Cruz, RGC",
      date: "Sep 22, 2026",
      time: "02:00 PM - 02:45 PM",
      reason: "Discuss child's recent GAD-7 anxiety progress and exam preparation tips.",
      status: "Confirmed by Guidance"
    },
    {
      id: "REQ-02",
      type: "Subject Teacher Conference",
      staff: "Engr. Roberto Santos, LPT (Pre-Calculus)",
      date: "Sep 25, 2026",
      time: "03:30 PM - 04:00 PM",
      reason: "Follow up on modular quiz performance.",
      status: "Pending Teacher Confirmation"
    }
  ]);
  const [newMeetingType, setNewMeetingType] = useState("Guidance Counselor 1-on-1 Consultation");
  const [newMeetingDate, setNewMeetingDate] = useState("2026-09-24");
  const [newMeetingTime, setNewMeetingTime] = useState("10:30 AM");
  const [newMeetingReason, setNewMeetingReason] = useState("");

  // 15. Threaded Messages
  const [chatThreads, setChatThreads] = useState([
    {
      id: 1,
      contact: "Engr. Roberto Santos, LPT (Pre-Calculus & Adviser)",
      role: "Class Adviser & Math Faculty",
      unread: false,
      messages: [
        { sender: "Engr. Santos", text: "Good afternoon Mrs. Dimaculangan, just wanted to let you know Joshua got 18/20 on today's quiz.", time: "Yesterday, 3:15 PM", isSelf: false },
        { sender: "You", text: "Thank you so much Sir! We made sure he slept early as agreed during the care plan meeting.", time: "Yesterday, 4:02 PM", isSelf: true }
      ]
    },
    {
      id: 2,
      contact: "Maria Theresa Cruz, RGC",
      role: "Guidance Counselor",
      unread: true,
      messages: [
        { sender: "Ma'am Cruz", text: "Hello! We will see you for our scheduled check-in on Tuesday at 2:00 PM.", time: "Today, 9:30 AM", isSelf: false }
      ]
    },
    {
      id: 3,
      contact: "Mrs. Ma. Cristina Dela Cruz, LPT (Chemistry)",
      role: "Science Department Coordinator",
      unread: false,
      messages: [
        { sender: "Mrs. Dela Cruz", text: "Good day! The laboratory manual for Quarter 2 has been released.", time: "Sep 20, 10:15 AM", isSelf: false }
      ]
    }
  ]);
  const [activeThreadId, setActiveThreadId] = useState<number>(1);
  const [inputChat, setInputChat] = useState("");

  const activeThread = useMemo(() => {
    return chatThreads.find(t => t.id === activeThreadId) || chatThreads[0];
  }, [chatThreads, activeThreadId]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    setChatThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          messages: [
            ...t.messages,
            { sender: "You", text: inputChat.trim(), time: "Just now", isSelf: true }
          ]
        };
      }
      return t;
    }));
    setInputChat("");
    showToast("Message sent to school faculty.");
  };

  const handleTabChange = useCallback((tab: ParentTabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("sapc:navigate-tab", { detail: { tab, source: "tab_click" } }));
    }
  }, []);

  // Direct Teacher Messaging Action from Subject Cards
  const handleMessageSpecificTeacher = useCallback((teacherName: string, teacherRole: string, subjectName: string) => {
    setChatThreads(prev => {
      const existingThread = prev.find(t => t.contact.toLowerCase().includes(teacherName.toLowerCase()) || t.contact.toLowerCase().includes(subjectName.toLowerCase()));
      if (existingThread) {
        setActiveThreadId(existingThread.id);
        return prev;
      }
      const newId = prev.length + 10;
      const newThread = {
        id: newId,
        contact: `${teacherName} (${subjectName})`,
        role: teacherRole,
        unread: false,
        messages: [
          {
            sender: teacherName.split(" ")[0] || "Faculty",
            text: `Good day! Welcome to the parent channel for ${subjectName}. How can I assist you with ${currentChild.full_name}'s progress?`,
            time: "Just now",
            isSelf: false
          }
        ]
      };
      setActiveThreadId(newId);
      return [newThread, ...prev];
    });
    
    setInputChat(`Good day ${teacherName}, I would like to inquire regarding ${currentChild.full_name}'s progress in ${subjectName}.`);
    handleTabChange("messages");
    showToast(`Opened direct message channel with ${teacherName}`);
  }, [currentChild.full_name, handleTabChange, showToast]);

  useEffect(() => {
    const handleDatasetUpdate = () => {
      setStudentDataset(getActiveStudentDataset());
    };
    const handleInterventionsUpdate = () => {
      setInterventionsList(getActiveInterventions());
    };
    const handleNotificationsUpdate = () => {
      setNotificationsList(getActiveNotifications("parent"));
    };

    window.addEventListener("sapc_student_dataset_updated", handleDatasetUpdate);
    window.addEventListener("sapc_interventions_updated", handleInterventionsUpdate);
    window.addEventListener("sapc:notifications-updated", handleNotificationsUpdate);
    window.addEventListener("sapc:referrals-updated", handleNotificationsUpdate);
    window.addEventListener("sapc:sessions-updated", handleNotificationsUpdate);

    return () => {
      window.removeEventListener("sapc_student_dataset_updated", handleDatasetUpdate);
      window.removeEventListener("sapc_interventions_updated", handleInterventionsUpdate);
      window.removeEventListener("sapc:notifications-updated", handleNotificationsUpdate);
      window.removeEventListener("sapc:referrals-updated", handleNotificationsUpdate);
      window.removeEventListener("sapc:sessions-updated", handleNotificationsUpdate);
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as ParentTabType;
      if (urlTab) setActiveTab(urlTab);

      const handleCustomNav = (e: CustomEvent<{ tab?: ParentTabType; source?: string }>) => {
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
      const activeTabEl = document.getElementById(`parent-tab-${activeTab}`);
      if (activeTabEl && tabsDrag.ref.current) {
        activeTabEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }

      const targetCatId = selectedNavCategory === "all" ? (parentCat?.id || "all") : selectedNavCategory;
      const activeCatEl = document.getElementById(`parent-cat-${targetCatId}`);
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
      <div className="space-y-6 pb-12 font-sans animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl bg-slate-200" />
          <div className="h-64 rounded-3xl bg-slate-200 lg:col-span-2" />
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

      {/* Top Banner - Institutional Maroon & Gold */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B0012] via-[#5A000D] to-[#380008] p-5 sm:p-7 md:p-8 shadow-md text-white border-t-4 border-amber-400">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-amber-300" />
                San Antonio de Padua College
              </span>
              <span className="text-xs sm:text-sm text-rose-100 font-semibold">• Parent &amp; Family Engagement Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Parent Partnership &amp; Student Wellness Portal
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-rose-50/95 leading-relaxed font-normal">
              Transparent, consent-based updates on your child&apos;s academic standing, subject teachers, attendance habits, home care plans, and counseling records.
            </p>
          </div>

          {/* Quick Child Selector & SF9 Exporter */}
          <div className="bg-black/35 backdrop-blur-md border border-white/25 rounded-2xl p-3.5 sm:p-4 shadow-lg min-w-[260px] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-amber-200 font-extrabold uppercase tracking-wider block">
                Selected Child Profile:
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                Active View
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  const newId = Number(e.target.value);
                  setSelectedStudentId(newId);
                  showToast(`Switched view to ${LINKED_CHILDREN.find(c => c.id === newId)?.name}`);
                }}
                className="w-full min-h-[40px] px-3 pr-8 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-xs"
              >
                {LINKED_CHILDREN.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({child.section})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/15 gap-2">
              <span className="text-slate-200 font-mono text-[10px] truncate">LRN: {currentChildInfo.lrn}</span>
              <button
                type="button"
                onClick={() => setIsDepEdFormOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-[10px] flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Award className="w-3 h-3" />
                <span>DepEd SF9</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* "MY CHILDREN" FAMILY SHOWCASE SECTION                     */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#8B0014]/10 flex items-center justify-center text-[#8B0014]">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                My Children (Linked Learner Profiles)
              </h2>
              <p className="text-xs text-slate-500">
                Official student accounts verified and linked to your parent portal credentials
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#8B0014] border border-rose-200 self-start sm:self-auto">
            {LINKED_CHILDREN.length} Enrolled {LINKED_CHILDREN.length === 1 ? "Child" : "Children"} at SAPC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {LINKED_CHILDREN.map((child) => {
            const isSelected = child.id === selectedStudentId;
            return (
              <div
                key={child.id}
                onClick={() => {
                  setSelectedStudentId(child.id);
                  showToast(`Now viewing academic and wellness profile for ${child.name}`);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                  isSelected 
                    ? "bg-rose-50/70 border-[#8B0014] shadow-md ring-2 ring-[#8B0014]/20" 
                    : "bg-slate-50 hover:bg-slate-100/90 border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-2xl font-black text-sm flex items-center justify-center border shadow-xs ${
                      isSelected ? "bg-[#8B0014] text-white border-[#6D0010]" : "bg-white text-slate-700 border-slate-300"
                    }`}>
                      {child.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 line-clamp-1">{child.name}</h3>
                      <p className="text-xs font-semibold text-slate-600">{child.section}</p>
                      <span className="text-[10px] font-mono text-slate-400">LRN: {child.lrn}</span>
                    </div>
                  </div>

                  <RiskBadge score={child.risk_score} tier={child.risk_tier} size="sm" />
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <span className="text-[11px] truncate">
                    Adviser: <strong className="text-slate-800">{child.adviser.split(",")[0]}</strong>
                  </span>
                  <button
                    type="button"
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                      isSelected 
                        ? "bg-[#8B0014] text-white" 
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "Active Child" : "Switch Child"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards (Plain Language for Families) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Support Level */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Overall Status</span>
            <RiskBadge score={currentChild.latest_risk_score} tier={currentChild.latest_risk_tier} size="sm" />
          </div>
          <div className="my-1.5">
            <p className="text-sm sm:text-base font-extrabold text-slate-900">
              {currentChild.latest_risk_tier === "high" ? "Needs Attention" : currentChild.latest_risk_tier === "medium" ? "Active Support" : "On Track"}
            </p>
            <span className="text-[11px] text-slate-500">
              {currentChild.latest_risk_tier === "high" ? "School care plan active" : "Doing well in class"}
            </span>
          </div>
        </div>

        {/* GPA */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Average Grade</span>
            <Award className="h-4 w-4 text-[#8B0014]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentChild.sass_metrics?.gpa ? Number(currentChild.sass_metrics.gpa).toFixed(1) : "88.5"}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">✓ Passing Grade Status</span>
        </div>

        {/* Attendance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Attendance</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-900">96.5%</span>
            <span className="text-xs font-bold text-slate-400">(1 Absent)</span>
          </div>
          <span className="text-[11px] font-bold text-blue-700">Regular school attendance</span>
        </div>

        {/* Action Needed */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">Parent Actions</span>
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-800">
              {acknowledgments.filter(a => !a.isAcknowledged).length}
            </span>
            <span className="text-xs font-bold text-slate-400">Pending</span>
          </div>
          <span className="text-[11px] font-bold text-amber-800">1 Plan Acknowledgment Due</span>
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
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth pb-1 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing w-full"
          >
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedNavCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`parent-cat-${cat.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedNavCategory(cat.id);
                    if (cat.id !== "all" && cat.tabIds && !cat.tabIds.includes(activeTab)) {
                      handleTabChange(cat.tabIds[0] as ParentTabType);
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

        {/* Categorized Navigation Tabs Bar */}
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
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth px-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing text-xs font-bold w-full"
          >
            {visibleTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`parent-tab-${item.id}`}
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
      {/* 1. FAMILY DASHBOARD (dashboard)                           */}
      {/* ========================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Explanation for Parents */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">What Your Child&apos;s Status Means</h3>
                  <p className="text-xs text-slate-500">Simple explanation of our school early guidance support tiers</p>
                </div>
                <RiskBadge score={currentChild.latest_risk_score} tier={currentChild.latest_risk_tier} size="md" />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-amber-950 text-sm">
                  {currentChild.latest_risk_tier === "high" 
                    ? "🟡 Active Support Protocol (High Care Tier)"
                    : currentChild.latest_risk_tier === "medium"
                    ? "🟡 Moderate Guidance Tracking"
                    : "🟢 Low Risk — Satisfactory Progress"
                  }
                </p>
                <p>
                  At San Antonio de Padua College, our system looks at 5 areas: class grades, attendance, family support, physical health, and emotional well-being. A high score simply means the school has activated extra tutoring and check-ins to make sure your child succeeds.
                </p>
              </div>

              {/* Quick Action Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => handleTabChange("academic_reports")}
                  className="p-4 rounded-2xl bg-rose-50/70 hover:bg-rose-100/90 border border-rose-200 transition cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#8B0014]">View Quarterly Report Card</span>
                    <BookOpen className="h-4 w-4 text-[#8B0014] group-hover:scale-110 transition" />
                  </div>
                  <p className="text-[11px] text-rose-800">Check grades, subject teachers, and DepEd Core Values</p>
                </div>

                <div
                  onClick={() => handleTabChange("acknowledge_intervention")}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">Acknowledge Home Care Plan</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
                  </div>
                  <p className="text-[11px] text-slate-500">1 action item needs parent confirmation</p>
                </div>
              </div>
            </div>

            {/* Emergency Contacts & Guidance Desk */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-[#8B0014]" />
                School Contact Hotline
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Class Homeroom Adviser:</span>
                  <p className="font-extrabold text-slate-900">{currentChildInfo.adviser}</p>
                  <span className="text-[11px] text-slate-500">Room 302 • adviser@sapc.edu.ph</span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-rose-800 uppercase">Guidance &amp; Counseling Desk:</span>
                  <p className="font-extrabold text-rose-950">{currentChildInfo.counselor}</p>
                  <span className="text-[11px] text-rose-800">Local 108 • guidance@sapc.edu.ph</span>
                </div>
              </div>

              <button
                onClick={() => handleTabChange("messages")}
                className="w-full py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition text-center shadow-xs cursor-pointer"
              >
                Send Message via Portal →
              </button>
            </div>
          </div>

          {/* Quick Preview of Enrolled Subjects & Assigned Teachers */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#8B0014]" />
                  Enrolled Subjects &amp; Assigned Faculty Teachers
                </h3>
                <p className="text-xs text-slate-500">
                  Direct communication channels with your child&apos;s teachers across each learning area
                </p>
              </div>

              <button
                onClick={() => handleTabChange("academic_reports")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
              >
                <span>Full Form 138 Report Card</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {studentSubjects.slice(0, 6).map((sub) => (
                <div key={sub.code} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                        {sub.code}
                      </span>
                      <span className="text-xs font-black text-[#8B0014]">
                        Q2: {sub.q2}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">{sub.name}</h4>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">{sub.teacher}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-5">{sub.schedule}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMessageSpecificTeacher(sub.teacher, sub.teacherRole, sub.name)}
                    className="w-full mt-1 py-1.5 px-3 rounded-xl bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-[#8B0014] font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-[#8B0014]" />
                    <span>Message Teacher</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Kudos & Faculty Commendations */}
          {(() => {
            const childCommendations = getActiveCommendations().filter(
              c => c.student_id === currentChild.id || c.student_name?.toLowerCase().includes(currentChild.first_name.toLowerCase())
            );

            return (
              <div className="bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-xs">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        Teacher Praise &amp; Student Commendations
                      </h3>
                      <p className="text-xs text-slate-500">
                        Positive reinforcement and character recognition cards awarded to {currentChild.first_name}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 self-start sm:self-auto">
                    {childCommendations.length} {childCommendations.length === 1 ? "Commendation" : "Commendations"} Received
                  </span>
                </div>

                {childCommendations.length === 0 ? (
                  <div className="p-5 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 space-y-1.5">
                    <Trophy className="h-6 w-6 text-amber-500 mx-auto" />
                    <p className="font-bold text-slate-700">No commendation cards recorded yet this quarter.</p>
                    <p className="text-slate-400">Subject teachers and guidance counselors issue commendations for milestone turnaround, peer kindness, and academic growth.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {childCommendations.map((comm) => (
                      <div key={comm.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2.5 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl" role="img" aria-label="badge">
                              {comm.badge_type === "Academic Excellence" ? "🥇" :
                               comm.badge_type === "Perseverance & Turnaround" ? "🚀" :
                               comm.badge_type === "Kindness & Peer Support" ? "🤝" :
                               comm.badge_type === "Leadership & Service" ? "⭐" : "🌟"}
                            </span>
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">{comm.title || comm.badge_type}</strong>
                              <span className="text-[10px] text-slate-500">
                                Awarded by <span className="font-bold text-slate-700">{comm.sender_name}</span> ({comm.sender_role})
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {comm.created_at ? new Date(comm.created_at).toLocaleDateString() : "Recent"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed italic bg-white p-2.5 rounded-xl border border-amber-100">
                          &quot;{comm.message}&quot;
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-amber-200/50">
                          <span className="font-bold text-amber-900">{comm.badge_type}</span>
                          {comm.notify_parent_sms && (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Delivered via Parent SMS &amp; Portal
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CHILD PROGRESS (child_progress)                        */}
      {/* ========================================================= */}
      {activeTab === "child_progress" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-[#8B0014]" />
                  Child&apos;s Wellness &amp; Academic Journey
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Consent-based longitudinal tracking to respect student privacy under RA 10173
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Student Consent:</span>
                <button
                  onClick={() => {
                    setHasStudentConsent(prev => !prev);
                    showToast(hasStudentConsent ? "Consent revoked by student demo toggle" : "Consent granted for parent viewing");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    hasStudentConsent ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
                >
                  {hasStudentConsent ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{hasStudentConsent ? "Active Consent (Visible)" : "Consent Pending"}</span>
                </button>
              </div>
            </div>

            {hasStudentConsent ? (
              <div className="space-y-6">
                {/* 4-Quarter Trend Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-500">Quarter 1</span>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">82.4 Score</p>
                    <span className="text-[10px] text-rose-700 font-bold">Exam Anxiety Flagged</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-black uppercase text-amber-800">Quarter 2 (Now)</span>
                    <p className="text-xl sm:text-2xl font-black text-amber-950 mt-1">86.2 Score</p>
                    <span className="text-[10px] text-emerald-700 font-bold">✓ +3.8 Pt Recovery</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 opacity-70">
                    <span className="text-[10px] font-black uppercase text-slate-400">Quarter 3</span>
                    <p className="text-xl sm:text-2xl font-black text-slate-400 mt-1">--.-</p>
                    <span className="text-[10px] text-slate-400">Scheduled Jan 2027</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 opacity-70">
                    <span className="text-[10px] font-black uppercase text-slate-400">Quarter 4</span>
                    <p className="text-xl sm:text-2xl font-black text-slate-400 mt-1">--.-</p>
                    <span className="text-[10px] text-slate-400">Scheduled Apr 2027</span>
                  </div>
                </div>

                <AHPDataVisualizer
                  studentName={currentChild.full_name}
                  domainScores={{
                    academic: currentChild.domain_scores?.academic ?? 80,
                    family: currentChild.domain_scores?.family ?? 85,
                    health: currentChild.domain_scores?.health ?? 90,
                    mental: currentChild.domain_scores?.mental_health ?? 75,
                    financial: currentChild.domain_scores?.financial ?? 80
                  }}
                />
              </div>
            ) : (
              <div className="py-12 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 space-y-2">
                <Lock className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="font-bold text-sm">Detailed Wellness Journey is Protected</p>
                <p className="text-xs text-slate-400">Student consent has not been toggled for this demo session.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. INTERVENTIONS TRANSPARENCY (interventions)             */}
      {/* ========================================================= */}
      {activeTab === "interventions" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-[#8B0014]" />
                Active School Care Plans &amp; Support Protocols
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Full transparency on what the school is doing to help your child succeed
              </p>
            </div>

            <div className="space-y-4">
              {childInterventions.length > 0 ? (
                childInterventions.map((plan) => (
                  <div key={plan.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 rounded bg-[#8B0014] text-white font-black text-[10px]">Care Protocol</span>
                        <h4 className="font-extrabold text-base text-slate-900 mt-1">{plan.title}</h4>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                        plan.status === "completed" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : plan.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        Status: {plan.status === "in-progress" ? "In Progress" : plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{plan.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Assigned Counselor / Adviser:</span>
                        <strong>{plan.assigned_by || currentChildInfo.counselor}</strong>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Target Domain:</span>
                        <strong className="capitalize">{plan.domain || "Academic & Wellness"}</strong>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Follow-Up / Due Date:</span>
                        <strong>{plan.due_date || "Continuous Monitoring"}</strong>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded bg-[#8B0014] text-white font-black text-[10px]">Active Protocol</span>
                      <h4 className="font-extrabold text-base text-slate-900 mt-1">Pre-Calculus Tutoring &amp; Exam Anxiety Coping</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      Status: In Progress
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Assigned Handlers:</span>
                      <strong>Mr. Santos (Adviser) &amp; Ma&apos;am Cruz (Counselor)</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Peer Tutor:</span>
                      <strong>Kyle Mercado (Grade 12 STEM)</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Expected Outcome:</span>
                      <strong>Grade recovery above 78.0 &amp; lower GAD-7 anxiety</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ACKNOWLEDGE INTERVENTIONS (acknowledge_intervention)   */}
      {/* ========================================================= */}
      {activeTab === "acknowledge_intervention" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                Formal Parent Role Acknowledgment System
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Confirm your role in supporting home habits recommended by teachers and counselors
              </p>
            </div>

            <div className="space-y-4">
              {acknowledgments.map((ack) => (
                <div key={ack.id} className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{ack.title}</h4>
                      <p className="text-xs text-slate-500">Originator: {ack.originator}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ack.isAcknowledged ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}>
                      {ack.isAcknowledged ? "✓ Acknowledged" : "Action Required"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong>Parent Responsibility:</strong> {ack.parentActionRequired}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400">Date Assigned: {ack.dateAssigned}</span>
                    {!ack.isAcknowledged ? (
                      <button
                        onClick={() => {
                          setAcknowledgments(prev => prev.map(a => a.id === ack.id ? { ...a, isAcknowledged: true, acknowledgedDate: new Date().toLocaleString() } : a));
                          showToast("You have formally acknowledged your home support commitment.");
                        }}
                        className="px-4 py-2 rounded-xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-bold text-xs transition cursor-pointer"
                      >
                        ✓ I Acknowledge &amp; Confirm My Role
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold">Confirmed on {ack.acknowledgedDate}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. FAMILY ASSESSMENT (family_assessment)                  */}
      {/* ========================================================= */}
      {activeTab === "family_assessment" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Home className="h-6 w-6 text-[#8B0014]" />
                Family Environment &amp; Home Context Questionnaire
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Help counselors understand home factors directly from the source (protected by RA 10173)
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Parenting &amp; Communication Style at Home:</label>
                <input
                  type="text"
                  value={familyData.parentingStyle}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, parentingStyle: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Home Study Environment:</label>
                <input
                  type="text"
                  value={familyData.homeEnvironment}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, homeEnvironment: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Current Family Stressors or Concerns:</label>
                <input
                  type="text"
                  value={familyData.familyStressors}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, familyStressors: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  showToast("Family Environment assessment submitted securely.");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition cursor-pointer shadow-xs"
              >
                Save Family Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. FINANCIAL ASSESSMENT (financial_assessment)            */}
      {/* ========================================================= */}
      {activeTab === "financial_assessment" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Wallet className="h-6 w-6 text-emerald-600" />
                Financial Context &amp; Scholarship Assistance Survey
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Optional survey to help the school endorse your child for tuition assistance or grants
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Household Income Bracket:</label>
                <select
                  value={financialData.monthlyIncomeBracket}
                  onChange={(e) => setFinancialData(prev => ({ ...prev, monthlyIncomeBracket: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option>Below ₱15,000 (Low Income)</option>
                  <option>₱15,000 - ₱25,000 (Lower Middle)</option>
                  <option>₱25,000 - ₱45,000 (Middle Income)</option>
                  <option>₱45,000 - ₱70,000 (Upper Middle)</option>
                  <option>Above ₱70,000 (High Income)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">4Ps Beneficiary Status:</label>
                <select
                  value={financialData.is4PsBeneficiary}
                  onChange={(e) => setFinancialData(prev => ({ ...prev, is4PsBeneficiary: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option>No</option>
                  <option>Yes (Active DSWD Beneficiary)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Tuition Payment Arrangement:</label>
                <input
                  type="text"
                  value={financialData.paymentArrangement}
                  onChange={(e) => setFinancialData(prev => ({ ...prev, paymentArrangement: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  showToast("Financial information submitted. Guidance will assess for tuition grant endorsements.");
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition cursor-pointer shadow-xs"
              >
                Submit Financial Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CRISIS NOTIFICATIONS (crisis_alerts)                   */}
      {/* ========================================================= */}
      {activeTab === "crisis_alerts" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-rose-600" />
                Immediate Crisis Alert Notifications (With Consent)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Actionable crisis context, school actions taken, and recommended next steps for parents
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200 space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-900 text-sm">Notice of High Academic Distress Detected</span>
                <span className="text-[11px] text-rose-700 font-bold">Sep 18, 2026 - 11:25 PM</span>
              </div>
              <p className="leading-relaxed">
                <strong>What happened:</strong> During a student wellness check-in, {currentChild.first_name} expressed feeling overwhelmed by midterm examinations and requested counselor support.
              </p>
              <p className="leading-relaxed">
                <strong>What the school did:</strong> Guidance Counselor Maria Theresa Cruz dispatched a counseling invite and arranged peer tutoring with Kyle Mercado.
              </p>
              <div className="p-3 bg-white rounded-2xl border border-rose-200 space-y-1">
                <strong className="text-slate-900">What parent should do:</strong>
                <p>Ensure a calm conversation at home, reassure child that struggling with difficult exams is normal, and attend our scheduled check-in.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. SCHEDULE MEETING (schedule_meeting)                    */}
      {/* ========================================================= */}
      {activeTab === "schedule_meeting" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <HeartHandshake className="h-6 w-6 text-[#8B0014]" />
                Request Parent-Teacher or Counselor Consultations
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Select your preferred dates and times to consult regarding your child&apos;s progress
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-3 text-xs">
                <h4 className="font-extrabold text-slate-900 text-sm">Book New Appointment:</h4>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Consultation Type:</label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Guidance Counselor 1-on-1 Consultation">Guidance Counselor 1-on-1 Consultation</option>
                    <option value="Class Adviser Progress Meeting">Class Adviser Progress Meeting</option>
                    <option value="Subject Teacher Consultation (Mathematics)">Subject Teacher Consultation (Mathematics)</option>
                    <option value="Subject Teacher Consultation (Science)">Subject Teacher Consultation (Science)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Preferred Date:</label>
                    <input
                      type="date"
                      value={newMeetingDate}
                      onChange={(e) => setNewMeetingDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Preferred Time:</label>
                    <input
                      type="text"
                      value={newMeetingTime}
                      onChange={(e) => setNewMeetingTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Specific Concern / Agenda:</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what you would like to discuss..."
                    value={newMeetingReason}
                    onChange={(e) => setNewMeetingReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const req = {
                      id: `REQ-${Date.now()}`,
                      type: newMeetingType,
                      staff: "Guidance Office",
                      date: newMeetingDate,
                      time: newMeetingTime,
                      reason: newMeetingReason || "General progress check-in",
                      status: "Confirmed by Guidance"
                    };
                    setRequestedMeetings(prev => [req, ...prev]);

                    scheduleCounselingSession({
                      student_id: currentChild.id,
                      student_name: currentChild.full_name,
                      date: newMeetingDate,
                      time: newMeetingTime,
                      counselor: "Maria Theresa Cruz, RGC",
                      topic: `${newMeetingType}: ${newMeetingReason || "Parent consultation"}`,
                      status: "Confirmed",
                      notes: `Parent consultation requested for ${currentChild.full_name}.`,
                      format: "in-person"
                    });

                    addAppNotification({
                      studentId: currentChild.id,
                      studentName: currentChild.full_name,
                      title: `Parent Meeting Requested: ${newMeetingType}`,
                      body: `Parent of ${currentChild.full_name} requested consultation on ${newMeetingDate} at ${newMeetingTime}.`,
                      type: "session",
                      targetRole: "counselor",
                      priority: "medium"
                    });

                    setNewMeetingReason("");
                    showToast("Consultation request scheduled and dispatched to counselor triage queue.");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition cursor-pointer shadow-xs"
                >
                  Submit Meeting Request
                </button>
              </div>

              {/* Status List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">Existing Consultation Requests:</h4>
                <div className="space-y-2">
                  {requestedMeetings.map((m) => (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900">{m.type}</strong>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">{m.status}</span>
                      </div>
                      <p className="text-slate-600">{m.date} ({m.time}) • {m.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. ACADEMIC REPORTS (academic_reports) - FORM 138 / SF9   */}
      {/* ========================================================= */}
      {activeTab === "academic_reports" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Official Progress Card Header */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#8B0014] text-white font-black text-[10px] uppercase tracking-wider">
                    DepEd Form 138 (SF9-SHS/JHS)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                    DO 8, s. 2015 Compliant
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">• S.Y. 2025–2026</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-[#8B0014]" />
                  Learner Progress &amp; Official Report Card
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Detailed breakdown of subject learning areas, assigned faculty teachers, core values, and homeroom adviser remarks.
                </p>
              </div>

              {/* Quarter Filter & Official PDF Button */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Quarter Dropdown Selector */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 shadow-2xs">
                  <Filter className="h-4 w-4 text-slate-500 ml-2 shrink-0" />
                  <span className="text-xs font-bold text-slate-600 hidden sm:inline">Quarter View:</span>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => {
                      const q = e.target.value as QuarterFilterType;
                      setSelectedQuarter(q);
                      showToast(`Viewing report card for ${q === "all" ? "All Quarters (Cumulative)" : q.toUpperCase()}`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B0014] cursor-pointer"
                  >
                    <option value="all">All Quarters (Complete Form 138 Matrix)</option>
                    <option value="q1">Quarter 1 (Aug - Oct)</option>
                    <option value="q2">Quarter 2 (Nov - Dec / Current)</option>
                    <option value="q3">Quarter 3 (Jan - Mar)</option>
                    <option value="q4">Quarter 4 (Apr - May / Finals)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDepEdFormOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#8B0014] hover:bg-[#6D0010] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Official SF9 Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Learner & Section Banner Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrolled Learner:</span>
                <strong className="text-slate-900 text-sm">{currentChild.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">DepEd LRN (12-Digit):</span>
                <strong className="font-mono text-slate-800">{currentChild.lrn}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Grade &amp; Section:</span>
                <strong className="text-slate-800">{currentChild.section_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Homeroom Adviser:</span>
                <strong className="text-slate-800">{currentChildInfo.adviser}</strong>
              </div>
            </div>

            {/* LEARNING AREAS & SUBJECT TEACHERS TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>Part I: Report on Learning Progress and Achievement</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Passing Standard: <strong>75.0%</strong>
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Subject &amp; Assigned Teacher</th>
                      <th className="py-3 px-3">Room / Schedule</th>
                      <th className={`py-3 px-2 text-center w-14 ${selectedQuarter === "q1" ? "bg-amber-100 text-amber-950 font-black" : ""}`}>Q1</th>
                      <th className={`py-3 px-2 text-center w-14 ${selectedQuarter === "q2" ? "bg-amber-100 text-amber-950 font-black" : ""}`}>Q2</th>
                      <th className={`py-3 px-2 text-center w-14 ${selectedQuarter === "q3" ? "bg-amber-100 text-amber-950 font-black" : ""}`}>Q3</th>
                      <th className={`py-3 px-2 text-center w-14 ${selectedQuarter === "q4" ? "bg-amber-100 text-amber-950 font-black" : ""}`}>Q4</th>
                      <th className="py-3 px-3 text-center w-20 bg-rose-50/50 text-[#8B0014]">Final</th>
                      <th className="py-3 px-3 text-center w-24">Remarks</th>
                      <th className="py-3 px-3 text-center w-36">Faculty Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 bg-white">
                    {studentSubjects.map((sub) => {
                      const finalGrade = Number(((sub.q1 + sub.q2 + sub.q3 + sub.q4) / 4).toFixed(1));
                      const isPassed = finalGrade >= 75;

                      return (
                        <tr key={sub.code} className="hover:bg-slate-50/90 transition">
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                                  {sub.code}
                                </span>
                                <strong className="text-slate-900 text-xs">{sub.name}</strong>
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <User className="h-3 w-3 text-slate-400" />
                                <span>{sub.teacher}</span>
                              </p>
                              {sub.teacherRemarks && (
                                <p className="text-[10px] text-slate-400 italic pt-0.5">
                                  &ldquo;{sub.teacherRemarks}&rdquo;
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-600 text-[11px]">
                            <span className="font-semibold block text-slate-800">{sub.room}</span>
                            <span className="text-[10px] text-slate-400">{sub.schedule.split("•")[0]}</span>
                          </td>

                          <td className={`py-3 px-2 text-center font-mono font-bold ${selectedQuarter === "q1" ? "bg-amber-50 text-amber-900 font-black text-sm" : "text-slate-700"}`}>
                            {sub.q1}
                          </td>
                          <td className={`py-3 px-2 text-center font-mono font-bold ${selectedQuarter === "q2" ? "bg-amber-50 text-amber-900 font-black text-sm" : "text-slate-700"}`}>
                            {sub.q2}
                          </td>
                          <td className={`py-3 px-2 text-center font-mono font-bold ${selectedQuarter === "q3" ? "bg-amber-50 text-amber-900 font-black text-sm" : "text-slate-700"}`}>
                            {sub.q3}
                          </td>
                          <td className={`py-3 px-2 text-center font-mono font-bold ${selectedQuarter === "q4" ? "bg-amber-50 text-amber-900 font-black text-sm" : "text-slate-700"}`}>
                            {sub.q4}
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-black text-sm text-[#8B0014] bg-rose-50/30">
                            {finalGrade}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              isPassed 
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}>
                              {isPassed ? "PASSED" : "FAILED"}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleMessageSpecificTeacher(sub.teacher, sub.teacherRole, sub.name)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#8B0014] text-slate-700 hover:text-white font-bold text-[10px] transition inline-flex items-center gap-1 border border-slate-300 shadow-2xs cursor-pointer"
                              title={`Message ${sub.teacher}`}
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Message Teacher</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* General Weighted Average Row */}
                    <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={2} className="py-3 px-4 uppercase text-slate-800">
                        General Weighted Average (GWA)
                      </td>
                      <td className={`py-3 px-2 text-center font-mono font-black ${selectedQuarter === "q1" ? "bg-amber-200 text-amber-950 text-sm" : ""}`}>
                        {(studentSubjects.reduce((acc, s) => acc + s.q1, 0) / studentSubjects.length).toFixed(1)}
                      </td>
                      <td className={`py-3 px-2 text-center font-mono font-black ${selectedQuarter === "q2" ? "bg-amber-200 text-amber-950 text-sm" : ""}`}>
                        {(studentSubjects.reduce((acc, s) => acc + s.q2, 0) / studentSubjects.length).toFixed(1)}
                      </td>
                      <td className={`py-3 px-2 text-center font-mono font-black ${selectedQuarter === "q3" ? "bg-amber-200 text-amber-950 text-sm" : ""}`}>
                        {(studentSubjects.reduce((acc, s) => acc + s.q3, 0) / studentSubjects.length).toFixed(1)}
                      </td>
                      <td className={`py-3 px-2 text-center font-mono font-black ${selectedQuarter === "q4" ? "bg-amber-200 text-amber-950 text-sm" : ""}`}>
                        {(studentSubjects.reduce((acc, s) => acc + s.q4, 0) / studentSubjects.length).toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-base text-[#8B0014] bg-rose-100/60">
                        {(studentSubjects.reduce((acc, s) => acc + ((s.q1 + s.q2 + s.q3 + s.q4) / 4), 0) / studentSubjects.length).toFixed(2)}
                      </td>
                      <td colSpan={2} className="py-3 px-3 text-center text-emerald-800 font-extrabold text-xs">
                        ✓ PROMOTED WITH HONORS
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* GRADING COMPONENT SCORE SUMMARY */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide flex items-center justify-between">
                <span>DepEd DO 8, s. 2015 Grading Weights Breakdown</span>
                <span className="text-[10px] text-slate-500 font-normal">Junior High / Senior High Standard</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Written Works (WW - 30%):</span>
                  <p className="text-base font-black text-slate-900 mt-0.5">88.5% Mastery</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Quizzes, essays, and long tests</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Performance Tasks (PT - 50%):</span>
                  <p className="text-base font-black text-emerald-700 mt-0.5">92.0% Exemplary</p>
                  <span className="text-[10px] text-slate-500">Laboratory experiments and projects</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Quarterly Exam (QE - 20%):</span>
                  <p className="text-base font-black text-[#8B0014] mt-0.5">86.0% Passed</p>
                  <span className="text-[10px] text-slate-500">Periodic departmental assessments</span>
                </div>
              </div>
            </div>

            {/* PART II: DEPED CORE VALUES (OBSERVED VALUES) */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                    Part II: Report on Observed Values (DepEd Core Values)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Behavioral evaluation conducted quarterly by homeroom adviser and subject teachers
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                  <span>AO: Always Observed</span> • <span>SO: Sometimes</span> • <span>RO: Rarely</span> • <span>NO: Not Observed</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 w-44">Core Values</th>
                      <th className="py-2.5 px-4">Behavior Statements</th>
                      <th className="py-2.5 px-2 text-center w-12">Q1</th>
                      <th className="py-2.5 px-2 text-center w-12">Q2</th>
                      <th className="py-2.5 px-2 text-center w-12">Q3</th>
                      <th className="py-2.5 px-2 text-center w-12">Q4</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {coreValuesList.map((cv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{cv.coreValue}</td>
                        <td className="py-2.5 px-4 text-slate-700">{cv.behaviorStatement}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-emerald-800">{cv.q1}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-emerald-800">{cv.q2}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-emerald-800">{cv.q3}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-emerald-800">{cv.q4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PART III: ATTENDANCE RECORD (MONTHLY MATRIX) */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                Part III: Report on Learner Attendance Record
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-center text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Month</th>
                      {monthlyAttendance.map(m => (
                        <th key={m.month} className="py-2.5 px-2">{m.month}</th>
                      ))}
                      <th className="py-2.5 px-3 bg-slate-200 text-slate-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-3 text-left font-sans font-bold text-slate-700">No. of School Days</td>
                      {monthlyAttendance.map(m => (
                        <td key={m.month} className="py-2 px-2">{m.days}</td>
                      ))}
                      <td className="py-2 px-3 font-bold bg-slate-50">{monthlyAttendance.reduce((a, b) => a + b.days, 0)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-sans font-bold text-emerald-700">Days Present</td>
                      {monthlyAttendance.map(m => (
                        <td key={m.month} className="py-2 px-2 text-emerald-800 font-bold">{m.present}</td>
                      ))}
                      <td className="py-2 px-3 font-bold bg-emerald-50 text-emerald-900">{monthlyAttendance.reduce((a, b) => a + b.present, 0)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-sans font-bold text-rose-700">Days Absent</td>
                      {monthlyAttendance.map(m => (
                        <td key={m.month} className="py-2 px-2 text-rose-700">{m.absent}</td>
                      ))}
                      <td className="py-2 px-3 font-bold bg-rose-50 text-rose-900">{monthlyAttendance.reduce((a, b) => a + b.absent, 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PART IV: HOMEROOM ADVISER'S NARRATIVE ASSESSMENT */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                Part IV: Homeroom Adviser&apos;s Quarterly Narrative Report &amp; Feedback
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {quarterlyAdviserRemarks.map((qr) => (
                  <div key={qr.quarter} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#8B0014] font-black">{qr.quarter} ({qr.date})</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {qr.conductRemark}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      &ldquo;{qr.narrative}&rdquo;
                    </p>
                    <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Adviser: <strong>{qr.adviser}</strong></span>
                      <span className="font-mono">Quarter GWA: <strong>{qr.generalAverage}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. ATTENDANCE (attendance)                               */}
      {/* ========================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Attendance Log &amp; Pattern Analysis
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Punctuality records with Monday/Friday absence pattern alerts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <h4 className="font-black text-blue-950 text-sm">Attendance Pattern Summary</h4>
                <p className="leading-relaxed text-slate-700">
                  {currentChild.first_name} has maintained a <strong>96.5% attendance standing</strong>. No chronic absence patterns detected (e.g. no habitual Monday tardiness).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 text-sm">Excuse Slip Status</h4>
                <p className="text-slate-600">1 medical excuse slip on Aug 28, 2026 was verified by the school clinic.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. WELLNESS / AREAS NEEDING SUPPORT (wellness)          */}
      {/* ========================================================= */}
      {activeTab === "wellness" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-rose-600" />
                Holistic 5-Domain Growth &amp; Support Areas
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Detailed view of non-academic domains assessed through our AHP Early Warning System
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Academic Readiness</span>
                <p className="text-xl font-black text-slate-900">{currentChild.domain_scores?.academic ?? 80}%</p>
                <span className="text-emerald-700 font-bold block">Passing Baseline</span>
                <p className="text-slate-500 text-[11px]">Regular participation in laboratory and class discussions.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Family Support Environment</span>
                <p className="text-xl font-black text-emerald-700">{currentChild.domain_scores?.family ?? 85}%</p>
                <span className="text-emerald-700 font-bold block">Strong Home Foundation</span>
                <p className="text-slate-500 text-[11px]">Parents regularly acknowledge check-ins and school memos.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Physical Health &amp; Sleep</span>
                <p className="text-xl font-black text-purple-700">{currentChild.domain_scores?.health ?? 90}%</p>
                <span className="text-purple-700 font-bold block">Good Vitality</span>
                <p className="text-slate-500 text-[11px]">Consistent sleep schedule confirmed under home protocol.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Mental &amp; Emotional Wellbeing</span>
                <p className="text-xl font-black text-amber-700">{currentChild.domain_scores?.mental_health ?? 75}%</p>
                <span className="text-amber-800 font-bold block">Monitored Exam Readiness</span>
                <p className="text-slate-500 text-[11px]">Benefit from continuous mindfulness and peer-tutoring.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Financial &amp; Material Stability</span>
                <p className="text-xl font-black text-pink-700">{currentChild.domain_scores?.financial ?? 80}%</p>
                <span className="text-pink-700 font-bold block">Stable Resources</span>
                <p className="text-slate-500 text-[11px]">Learning materials and internet connection sufficient.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. NOTIFICATIONS (notifications)                         */}
      {/* ========================================================= */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Bell className="h-6 w-6 text-[#8B0014]" />
                Parent Notification Inbox
              </h3>
            </div>

            <div className="space-y-3">
              {childNotifications.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 text-sm">{n.title}</strong>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. RESOURCES (resources)                                 */}
      {/* ========================================================= */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-600" />
                Parenting, Academic &amp; Health Guides
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <strong className="text-slate-900 text-sm block">How to Help Your Child Manage Exam Anxiety</strong>
                <p className="text-slate-600">Practical tips from the SAPC Guidance &amp; Counseling Department on study intervals and emotional reassurance.</p>
                <span className="text-[#8B0014] font-bold block cursor-pointer hover:underline">Download PDF Guide →</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <strong className="text-slate-900 text-sm block">Understanding DepEd Order 8, s. 2015 Grading</strong>
                <p className="text-slate-600">Learn how Written Works, Performance Tasks, and Quarterly Assessments are weighted for high school learners.</p>
                <span className="text-[#8B0014] font-bold block cursor-pointer hover:underline">Read Explainer →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 14. ANNOUNCEMENTS (announcements)                         */}
      {/* ========================================================= */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Megaphone className="h-6 w-6 text-amber-500" />
                School-Wide &amp; Grade-Level Announcements
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <strong className="text-amber-950 text-sm">Senior High School Intramurals &amp; Academic Week 2026</strong>
                <span className="text-amber-800">Oct 20-22, 2026</span>
              </div>
              <p className="text-slate-700">Parents are welcome to attend the opening sports festival ceremonies and science exhibit booths.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 15. MESSAGES (messages)                                   */}
      {/* ========================================================= */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-[#8B0014]" />
                Direct Threaded Chat with Subject Teachers &amp; Counselors
              </h3>
              <p className="text-xs text-slate-500">
                Communicate directly with faculty regarding {currentChild.full_name}&apos;s subject progress
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Thread list */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-1">
                  Active Channels ({chatThreads.length})
                </span>
                {chatThreads.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs ${
                      t.id === activeThreadId ? "bg-rose-50 border-[#8B0014] font-bold shadow-xs ring-1 ring-[#8B0014]/20" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-slate-900 text-xs font-black line-clamp-1">{t.contact}</p>
                    <span className="text-slate-500 text-[10px] block mt-0.5">{t.role}</span>
                  </div>
                ))}
              </div>

              {/* Chat Window */}
              <div className="md:col-span-2 space-y-3">
                <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Chatting with:</span>
                    <strong className="text-slate-900">{activeThread.contact}</strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Faculty Channel Active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 max-h-[340px] min-h-[240px] overflow-y-auto">
                  {activeThread.messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${
                        m.isSelf ? "bg-[#8B0014] text-white ml-auto" : "bg-white border border-slate-200 text-slate-800 mr-auto shadow-2xs"
                      }`}
                    >
                      <div className={`flex justify-between text-[10px] ${m.isSelf ? "text-amber-200" : "text-slate-400"}`}>
                        <strong>{m.sender}</strong>
                        <span>{m.time}</span>
                      </div>
                      <p className="mt-0.5">{m.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message to faculty..."
                    value={inputChat}
                    onChange={(e) => setInputChat(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#8B0014] focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#8B0014] text-white font-bold text-xs hover:bg-[#6D0010] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DepEd SF9 / SF10 Official Form Modal */}
      <DepEdFormModal
        isOpen={isDepEdFormOpen}
        onClose={() => setIsDepEdFormOpen(false)}
        selectedStudent={currentChild}
      />
    </div>
  );
};
