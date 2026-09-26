import { SAPC_500_STUDENTS, StudentRecord } from "@/data/students500";
export type { StudentRecord };
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  writeBatch, 
  getDocs, 
  setDoc,
  deleteDoc,
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  Unsubscribe
} from "firebase/firestore";

export interface CohortAggregates {
  total: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  highRiskPct: number;
  mediumRiskPct: number;
  lowRiskPct: number;
  avgRiskScore: number;
  avgGpa: number;
  avgAttendanceRate: number;
  totalFailingMarks: number;
  domainAverages: {
    academic: number;
    family: number;
    health: number;
    mental_health: number;
    financial: number;
  };
  sectionBreakdown: Array<{
    sectionName: string;
    total: number;
    highRisk: number;
    avgRisk: number;
    adviser: string;
    gradeLevel: string;
  }>;
}

export interface RiskWeightsConfig {
  academic: number;
  family: number;
  health: number;
  mental: number;
  financial: number;
}

export interface CloudAuditLogEntry {
  id?: string;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_resource: string;
  details: string;
  ip_address?: string;
  createdAt?: any;
}

export const DEFAULT_RISK_WEIGHTS: RiskWeightsConfig = {
  academic: 30.0,
  family: 20.0,
  health: 20.0,
  mental: 15.0,
  financial: 15.0
};

export const DEFAULT_AHP_WEIGHTS = {
  academic: 0.30,
  family: 0.20,
  health: 0.20,
  mental_health: 0.15,
  financial: 0.15
};

const STORAGE_KEY = "sapc_custom_student_data";
const WEIGHTS_KEY = "sapc_custom_risk_weights";
const AUDIT_STORAGE_KEY = "sapc_audit_logs";

export function getActiveRiskWeights(): RiskWeightsConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(WEIGHTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.academic === "number") {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_RISK_WEIGHTS;
}

export function saveRiskWeights(weights: RiskWeightsConfig): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
    } catch {
      // Ignore
    }
  }
}

export function recalculateAHPForDataset(
  students: StudentRecord[],
  weights: RiskWeightsConfig = getActiveRiskWeights()
): StudentRecord[] {
  const wAcad = (weights.academic || 30) / 100;
  const wFam = (weights.family || 20) / 100;
  const wHealth = (weights.health || 20) / 100;
  const wMental = (weights.mental || 15) / 100;
  const wFin = (weights.financial || 15) / 100;

  return students.map((student) => {
    const acad = student.domain_scores?.academic ?? 20;
    const fam = student.domain_scores?.family ?? 15;
    const health = student.domain_scores?.health ?? 15;
    const mental = student.domain_scores?.mental_health ?? 15;
    const fin = student.domain_scores?.financial ?? 15;

    const composite = (acad * wAcad) + (fam * wFam) + (health * wHealth) + (mental * wMental) + (fin * wFin);
    const roundedComposite = Number(composite.toFixed(1));
    const tier: "high" | "medium" | "low" = roundedComposite >= 70 ? "high" : roundedComposite >= 40 ? "medium" : "low";

    const drivers = [
      { name: "Academic", val: acad },
      { name: "Family", val: fam },
      { name: "Health", val: health },
      { name: "Mental Health", val: mental },
      { name: "Financial", val: fin }
    ].sort((a, b) => b.val - a.val);

    const primaryDriver = drivers[0].val >= 40 ? drivers[0].name : "Academic";

    return {
      ...student,
      latest_risk_score: roundedComposite,
      latest_risk_tier: tier,
      primary_risk_driver: primaryDriver
    };
  });
}

export function getActiveStudentDataset(): StudentRecord[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load custom student dataset from local storage, falling back to baseline:", e);
    }
  }
  return SAPC_500_STUDENTS;
}

/**
 * Persists the student dataset to client localStorage and optionally syncs to Firebase Cloud Firestore.
 */
export function saveStudentDataset(students: StudentRecord[], syncToCloud = true): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      window.dispatchEvent(new CustomEvent("sapc:dataset-updated", { detail: { count: students.length } }));
    } catch (e) {
      console.error("Failed to persist updated student dataset locally:", e);
    }
  }

  if (syncToCloud && typeof window !== "undefined") {
    // Non-blocking background cloud sync
    syncStudentDatasetToFirestore(students).catch((err) => {
      console.warn("Background Firestore cloud sync encountered an issue:", err);
    });
  }
}

/**
 * Synchronizes the student dataset to Firebase Cloud Firestore using chunked batch writes (max 400 per batch).
 */
export async function syncStudentDatasetToFirestore(students: StudentRecord[]): Promise<{ success: boolean; syncedCount: number; error?: string }> {
  if (!db) {
    return { success: false, syncedCount: 0, error: "Firestore instance not available" };
  }

  try {
    const studentsCol = collection(db, "students");
    const CHUNK_SIZE = 400; // Safe threshold under Firestore 500-op limit
    let totalSynced = 0;

    for (let i = 0; i < students.length; i += CHUNK_SIZE) {
      const chunk = students.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const student of chunk) {
        const docId = student.lrn ? String(student.lrn).trim() : `student_${student.id}`;
        const studentRef = doc(studentsCol, docId);
        batch.set(studentRef, {
          ...student,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();
      totalSynced += chunk.length;
    }

    console.log(`[Firestore Sync] Successfully committed ${totalSynced} student records to Cloud Firestore.`);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sapc:cloud-synced", { detail: { count: totalSynced } }));
    }
    return { success: true, syncedCount: totalSynced };
  } catch (err: any) {
    console.error("[Firestore Sync Error]:", err);
    return { success: false, syncedCount: 0, error: err.message || "Cloud sync failed" };
  }
}

/**
 * CRUD (Create): Adds a new student record to both local state and Firebase Cloud Firestore.
 */
export async function addStudentRecord(newStudent: Partial<StudentRecord>): Promise<StudentRecord> {
  const current = getActiveStudentDataset();
  const nextId = current.length > 0 ? Math.max(...current.map(s => Number(s.id) || 0)) + 1 : 1;
  
  const fullRecord: StudentRecord = {
    id: nextId,
    lrn: newStudent.lrn || `1092384${String(nextId).padStart(5, "0")}`,
    full_name: newStudent.full_name || `${newStudent.last_name || "Student"}, ${newStudent.first_name || "New"}`,
    first_name: newStudent.first_name || "New",
    last_name: newStudent.last_name || "Student",
    grade_level: newStudent.grade_level || 11,
    strand: newStudent.strand || "STEM",
    section_name: newStudent.section_name || "Grade 11 - St. Augustine (STEM)",
    adviser_name: newStudent.adviser_name || "Adviser",
    email: newStudent.email || `student${nextId}@sapc.edu.ph`,
    latest_risk_score: newStudent.latest_risk_score || 25.0,
    latest_risk_tier: newStudent.latest_risk_tier || "low",
    primary_risk_driver: newStudent.primary_risk_driver || "Academic",
    domain_scores: newStudent.domain_scores || {
      academic: 20,
      family: 15,
      health: 15,
      mental_health: 15,
      financial: 15
    },
    sass_metrics: {
      gpa: 85.0,
      failing_subjects_count: 0,
      days_absent: 0,
      attendance_rate_pct: 100,
      incomplete_requirements_count: 0,
      extracurricular_club: "Academic Club",
      club_participation_level: "Moderate",
      hobbies_interests: "Reading, STEM",
      ...(newStudent.sass_metrics || {})
    }
  };

  const updatedList = recalculateAHPForDataset([fullRecord, ...current]);
  saveStudentDataset(updatedList, true);

  if (db) {
    try {
      const docId = fullRecord.lrn ? String(fullRecord.lrn).trim() : `student_${fullRecord.id}`;
      const studentRef = doc(collection(db, "students"), docId);
      const { setDoc } = await import("firebase/firestore");
      await setDoc(studentRef, {
        ...fullRecord,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Could not save new student doc to Firestore:", err);
    }
  }

  await logCloudAuditEvent({
    actor_name: "Authorized Staff",
    actor_role: "admin",
    action: "STUDENT_RECORD_CREATED",
    target_resource: `Student: ${fullRecord.full_name} (LRN: ${fullRecord.lrn})`,
    details: `Created new student record in ${fullRecord.section_name}.`,
    ip_address: "127.0.0.1 (Campus LAN)"
  });

  return fullRecord;
}

/**
 * CRUD (Read): Fetches a specific student record by ID or LRN.
 */
export function getStudentRecord(idOrLrn: string | number): StudentRecord | undefined {
  const current = getActiveStudentDataset();
  const searchStr = String(idOrLrn).trim();
  return current.find(s => String(s.id) === searchStr || String(s.lrn).trim() === searchStr);
}

/**
 * CRUD (Update): Updates an existing student record in local state and Firestore.
 */
export async function updateStudentRecord(
  idOrLrn: string | number,
  updates: Partial<StudentRecord> & {
    family_support_score?: number;
    financial_risk_score?: number;
    mental_health_score?: number;
    health_physical_score?: number;
    academic_gwa_score?: number;
  }
): Promise<StudentRecord | null> {
  const current = getActiveStudentDataset();
  const searchStr = String(idOrLrn).trim();
  const index = current.findIndex(s => String(s.id) === searchStr || String(s.lrn).trim() === searchStr);

  if (index === -1) return null;

  const existing = current[index];
  const domain_scores = {
    academic: updates.academic_gwa_score ?? updates.domain_scores?.academic ?? existing.domain_scores.academic,
    family: updates.family_support_score ?? updates.domain_scores?.family ?? existing.domain_scores.family,
    health: updates.health_physical_score ?? updates.domain_scores?.health ?? existing.domain_scores.health,
    mental_health: updates.mental_health_score ?? updates.domain_scores?.mental_health ?? existing.domain_scores.mental_health,
    financial: updates.financial_risk_score ?? updates.domain_scores?.financial ?? existing.domain_scores.financial
  };

  const updated: StudentRecord = {
    ...existing,
    ...updates,
    domain_scores,
    sass_metrics: {
      ...existing.sass_metrics,
      ...(updates.sass_metrics || {})
    }
  };

  current[index] = updated;
  const recalculated = recalculateAHPForDataset(current);
  saveStudentDataset(recalculated, true);

  if (db) {
    try {
      const docId = updated.lrn ? String(updated.lrn).trim() : `student_${updated.id}`;
      const studentRef = doc(collection(db, "students"), docId);
      const { setDoc } = await import("firebase/firestore");
      await setDoc(studentRef, {
        ...updated,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Could not update student doc in Firestore:", err);
    }
  }

  await logCloudAuditEvent({
    actor_name: "Authorized Staff",
    actor_role: "teacher",
    action: "STUDENT_RECORD_UPDATED",
    target_resource: `Student: ${updated.full_name} (LRN: ${updated.lrn})`,
    details: `Updated student attributes and recalculated AHP risk score.`,
    ip_address: "127.0.0.1 (Campus LAN)"
  });

  return recalculated[index] || updated;
}

/**
 * CRUD (Delete): Removes a student record from both local state and Firebase Cloud Firestore.
 */
export async function deleteStudentRecord(idOrLrn: string | number): Promise<boolean> {
  const current = getActiveStudentDataset();
  const searchStr = String(idOrLrn).trim();
  const target = current.find(s => String(s.id) === searchStr || String(s.lrn).trim() === searchStr);

  if (!target) return false;

  const filtered = current.filter(s => String(s.id) !== searchStr && String(s.lrn).trim() !== searchStr);
  saveStudentDataset(filtered, true);

  if (db) {
    try {
      const docId = target.lrn ? String(target.lrn).trim() : `student_${target.id}`;
      const studentRef = doc(collection(db, "students"), docId);
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(studentRef);
    } catch (err) {
      console.warn("Could not delete student doc from Firestore:", err);
    }
  }

  await logCloudAuditEvent({
    actor_name: "Authorized Administrator",
    actor_role: "admin",
    action: "STUDENT_RECORD_DELETED",
    target_resource: `Student: ${target.full_name} (LRN: ${target.lrn})`,
    details: `Removed student record from active registry.`,
    ip_address: "127.0.0.1 (Campus LAN)"
  });

  return true;
}

/**
 * Fetches the latest student dataset from Firebase Cloud Firestore, updating local cache.
 */
export async function loadStudentDatasetFromFirestore(): Promise<StudentRecord[]> {
  if (!db) return getActiveStudentDataset();

  try {
    const studentsCol = collection(db, "students");
    const snapshot = await getDocs(studentsCol);

    if (!snapshot.empty) {
      const cloudStudents: StudentRecord[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as StudentRecord;
        cloudStudents.push(data);
      });

      // Sort by ID or Grade/Section
      cloudStudents.sort((a, b) => Number(a.id) - Number(b.id));

      if (cloudStudents.length > 0) {
        saveStudentDataset(cloudStudents, false); // Cache locally without echoing back to cloud
        return cloudStudents;
      }
    }
  } catch (err) {
    console.warn("Could not load students from Firestore, using local baseline:", err);
  }

  return getActiveStudentDataset();
}

/**
 * Subscribes to real-time updates from Firebase Cloud Firestore for all connected dashboards.
 */
export function subscribeToStudentDataset(
  onUpdate: (students: StudentRecord[]) => void
): Unsubscribe | (() => void) {
  if (!db || typeof window === "undefined") {
    return () => {};
  }

  try {
    const studentsCol = collection(db, "students");
    const unsubscribe = onSnapshot(
      studentsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const updated: StudentRecord[] = [];
          snapshot.forEach((d) => {
            updated.push(d.data() as StudentRecord);
          });
          updated.sort((a, b) => Number(a.id) - Number(b.id));
          
          if (updated.length > 0) {
            // Update local cache silently
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {
              // Ignore
            }
            onUpdate(updated);
          }
        }
      },
      (error) => {
        console.warn("Firestore real-time subscription error:", error);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn("Could not initiate Firestore subscription:", e);
    return () => {};
  }
}

/**
 * Logs an RA 10173 compliance event to Firebase Cloud Firestore `/audit_logs` and local storage.
 */
export async function logCloudAuditEvent(entry: {
  actor_name: string;
  actor_role: string;
  action: string;
  target_resource: string;
  details: string;
  ip_address?: string;
}): Promise<void> {
  const logId = `audit-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const fullEntry: CloudAuditLogEntry = {
    id: logId,
    timestamp,
    ...entry,
    ip_address: entry.ip_address || "127.0.0.1 (Campus LAN)"
  };

  // 1. Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const storedLogs = localStorage.getItem(AUDIT_STORAGE_KEY);
      const currentLogs = storedLogs ? JSON.parse(storedLogs) : [];
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([fullEntry, ...currentLogs]));
    } catch {
      // Ignore
    }
  }

  // 2. Cloud Firestore persistence
  if (db) {
    try {
      const auditCol = collection(db, "audit_logs");
      await addDoc(auditCol, {
        ...fullEntry,
        createdAt: serverTimestamp()
      });
      console.log(`[Audit Log] RA 10173 Audit Record logged to Firestore: ${entry.action}`);
    } catch (err) {
      console.warn("Could not persist audit log to Firestore:", err);
    }
  }
}

export function resetToBaselineDataset(): StudentRecord[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(WEIGHTS_KEY);
      window.dispatchEvent(new CustomEvent("sapc:dataset-updated", { detail: { count: SAPC_500_STUDENTS.length } }));
    } catch (e) {
      console.error("Failed to reset dataset:", e);
    }
  }
  return SAPC_500_STUDENTS;
}

export function computeCohortAggregates(students: StudentRecord[]): CohortAggregates {
  const total = students.length;
  if (total === 0) {
    return {
      total: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      highRiskPct: 0,
      mediumRiskPct: 0,
      lowRiskPct: 0,
      avgRiskScore: 0,
      avgGpa: 0,
      avgAttendanceRate: 0,
      totalFailingMarks: 0,
      domainAverages: { academic: 0, family: 0, health: 0, mental_health: 0, financial: 0 },
      sectionBreakdown: []
    };
  }

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let riskSum = 0;
  let gpaSum = 0;
  let attendanceSum = 0;
  let failingCount = 0;
  let acadSum = 0;
  let famSum = 0;
  let healthSum = 0;
  let mentalSum = 0;
  let finSum = 0;

  const sectionMap = new Map<string, { total: number; high: number; riskSum: number; adviser: string; grade: string }>();

  students.forEach((s) => {
    if (s.latest_risk_tier === "high") highCount++;
    else if (s.latest_risk_tier === "medium") mediumCount++;
    else lowCount++;

    riskSum += s.latest_risk_score || 0;
    gpaSum += s.sass_metrics?.gpa || 75;
    attendanceSum += s.sass_metrics?.attendance_rate_pct || 90;
    failingCount += s.sass_metrics?.failing_subjects_count || 0;

    acadSum += s.domain_scores?.academic || 0;
    famSum += s.domain_scores?.family || 0;
    healthSum += s.domain_scores?.health || 0;
    mentalSum += s.domain_scores?.mental_health || 0;
    finSum += s.domain_scores?.financial || 0;

    const secName = s.section_name || "Unassigned";
    if (!sectionMap.has(secName)) {
      sectionMap.set(secName, {
        total: 0,
        high: 0,
        riskSum: 0,
        adviser: s.adviser_name || "Adviser",
        grade: `Grade ${s.grade_level || 11}`
      });
    }
    const sec = sectionMap.get(secName)!;
    sec.total++;
    if (s.latest_risk_tier === "high") sec.high++;
    sec.riskSum += s.latest_risk_score || 0;
  });

  const sectionBreakdown = Array.from(sectionMap.entries()).map(([secName, sec]) => ({
    sectionName: secName,
    total: sec.total,
    highRisk: sec.high,
    avgRisk: Number((sec.riskSum / (sec.total || 1)).toFixed(1)),
    adviser: sec.adviser,
    gradeLevel: sec.grade
  }));

  return {
    total,
    highRiskCount: highCount,
    mediumRiskCount: mediumCount,
    lowRiskCount: lowCount,
    highRiskPct: Number(((highCount / total) * 100).toFixed(1)),
    mediumRiskPct: Number(((mediumCount / total) * 100).toFixed(1)),
    lowRiskPct: Number(((lowCount / total) * 100).toFixed(1)),
    avgRiskScore: Number((riskSum / total).toFixed(1)),
    avgGpa: Number((gpaSum / total).toFixed(1)),
    avgAttendanceRate: Number((attendanceSum / total).toFixed(1)),
    totalFailingMarks: failingCount,
    domainAverages: {
      academic: Number((acadSum / total).toFixed(1)),
      family: Number((famSum / total).toFixed(1)),
      health: Number((healthSum / total).toFixed(1)),
      mental_health: Number((mentalSum / total).toFixed(1)),
      financial: Number((finSum / total).toFixed(1))
    },
    sectionBreakdown
  };
}

export function exportActiveDatasetToCSV(customStudents?: StudentRecord[], filename = "SAPC_Active_Cohort_Dataset.csv"): void {
  const dataset = customStudents || getActiveStudentDataset();
  const headers = [
    "student_id",
    "lrn",
    "full_name",
    "first_name",
    "last_name",
    "grade_level",
    "strand",
    "section_name",
    "adviser_name",
    "email",
    "latest_risk_score",
    "latest_risk_tier",
    "primary_risk_driver",
    "academic_score",
    "family_score",
    "health_score",
    "mental_health_score",
    "financial_score",
    "quarter_gpa",
    "failing_subjects_count",
    "days_absent",
    "attendance_rate_pct",
    "incomplete_requirements_count"
  ];

  const rows = dataset.map(s => [
    s.id,
    `"${s.lrn}"`,
    `"${s.full_name}"`,
    `"${s.first_name}"`,
    `"${s.last_name}"`,
    s.grade_level,
    `"${s.strand}"`,
    `"${s.section_name}"`,
    `"${s.adviser_name}"`,
    `"${s.email}"`,
    s.latest_risk_score,
    `"${s.latest_risk_tier}"`,
    `"${s.primary_risk_driver}"`,
    s.domain_scores.academic,
    s.domain_scores.family,
    s.domain_scores.health,
    s.domain_scores.mental_health,
    s.domain_scores.financial,
    s.sass_metrics.gpa,
    s.sass_metrics.failing_subjects_count,
    s.sass_metrics.days_absent,
    s.sass_metrics.attendance_rate_pct,
    s.sass_metrics.incomplete_requirements_count
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importFullCohortCSV(csvText: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) {
      return { success: false, count: 0, error: "CSV file is empty or missing headers" };
    }

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const currentStudents = getActiveStudentDataset();
    const studentMap = new Map<string, StudentRecord>();
    currentStudents.forEach(s => {
      studentMap.set(s.lrn.trim(), s);
      studentMap.set(String(s.id), s);
    });

    let updatedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i];
      const values: string[] = [];
      let inQuote = false;
      let currentVal = "";
      for (let c = 0; c < rawLine.length; c++) {
        const char = rawLine[c];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = (values[idx] || "").replace(/^"|"$/g, "");
      });

      const lrn = row["lrn"] || "";
      const studentId = row["student_id"] || "";
      const existing = (lrn && studentMap.get(lrn)) || (studentId && studentMap.get(studentId));

      if (existing) {
        const acadScore = row["academic_score"] ? parseFloat(row["academic_score"]) : existing.domain_scores.academic;
        const famScore = row["family_score"] ? parseFloat(row["family_score"]) : existing.domain_scores.family;
        const healthScore = row["health_score"] ? parseFloat(row["health_score"]) : existing.domain_scores.health;
        const mentalScore = row["mental_health_score"] ? parseFloat(row["mental_health_score"]) : existing.domain_scores.mental_health;
        const finScore = row["financial_score"] ? parseFloat(row["financial_score"]) : existing.domain_scores.financial;

        const gpa = row["quarter_gpa"] ? parseFloat(row["quarter_gpa"]) : existing.sass_metrics.gpa;
        const failing = row["failing_subjects_count"] ? parseInt(row["failing_subjects_count"], 10) : existing.sass_metrics.failing_subjects_count;
        const daysAbsent = row["days_absent"] ? parseInt(row["days_absent"], 10) : existing.sass_metrics.days_absent;
        const attendanceRate = row["attendance_rate_pct"] ? parseFloat(row["attendance_rate_pct"]) : existing.sass_metrics.attendance_rate_pct;
        const incomplete = row["incomplete_requirements_count"] ? parseInt(row["incomplete_requirements_count"], 10) : existing.sass_metrics.incomplete_requirements_count;

        const updatedStudent: StudentRecord = {
          ...existing,
          full_name: row["full_name"] || existing.full_name,
          first_name: row["first_name"] || existing.first_name,
          last_name: row["last_name"] || existing.last_name,
          grade_level: row["grade_level"] ? parseInt(row["grade_level"], 10) : existing.grade_level,
          strand: row["strand"] || existing.strand,
          section_name: row["section_name"] || existing.section_name,
          adviser_name: row["adviser_name"] || existing.adviser_name,
          domain_scores: {
            academic: acadScore,
            family: famScore,
            health: healthScore,
            mental_health: mentalScore,
            financial: finScore
          },
          sass_metrics: {
            ...existing.sass_metrics,
            gpa,
            failing_subjects_count: failing,
            days_absent: daysAbsent,
            attendance_rate_pct: attendanceRate,
            incomplete_requirements_count: incomplete
          }
        };

        studentMap.set(existing.lrn.trim(), updatedStudent);
        studentMap.set(String(existing.id), updatedStudent);
        updatedCount++;
      }
    }

    const updatedList = recalculateAHPForDataset(Array.from(new Set(Array.from(studentMap.values()))));
    saveStudentDataset(updatedList, true);

    return { success: true, count: updatedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || "Failed to parse CSV" };
  }
}

// ============================================================================
// UNIFIED INGESTION HISTORY & 1-CLICK SNAPSHOT ROLLBACK ENGINE
// ============================================================================
export interface IngestionBatchRecord {
  id: string;
  type: string;
  domain: string;
  importedBy: string;
  count: number;
  successRate: string;
  date: string;
  academicYear?: string;
  quarter?: string;
  canRollback: boolean;
  rolledBack?: boolean;
  snapshotData?: StudentRecord[]; // Pre-import dataset snapshot for 100% loss-free rollback
  diffSummary?: {
    studentsAffected: number;
    riskIncreased: number;
    riskDecreased: number;
    unchanged: number;
  };
}

const INGESTION_HISTORY_KEY = "sapc_import_history";

export const DEFAULT_INGESTION_HISTORY: IngestionBatchRecord[] = [
  {
    id: "IMP-2026-901",
    type: "DepEd SASS Academic & Attendance (DO 8, s. 2015)",
    domain: "academic",
    importedBy: "Mr. Roberto Santos, LPT",
    count: 45,
    successRate: "100%",
    date: "2026-09-18 14:15",
    academicYear: "2025-2026",
    quarter: "Q1",
    canRollback: true,
    rolledBack: false,
    diffSummary: {
      studentsAffected: 45,
      riskIncreased: 6,
      riskDecreased: 12,
      unchanged: 27
    }
  },
  {
    id: "IMP-2026-902",
    type: "PHQ-9 & GAD-7 Psychometric Screening Intake",
    domain: "mental_health",
    importedBy: "Maria Theresa Cruz, RGC",
    count: 120,
    successRate: "98.4%",
    date: "2026-09-16 09:30",
    academicYear: "2025-2026",
    quarter: "Q1",
    canRollback: true,
    rolledBack: false,
    diffSummary: {
      studentsAffected: 120,
      riskIncreased: 14,
      riskDecreased: 22,
      unchanged: 84
    }
  },
  {
    id: "IMP-2026-903",
    type: "Master 500-Student Baseline Enrollment Roster",
    domain: "master_cohort",
    importedBy: "Dr. Remedios Santos, Ed.D.",
    count: 500,
    successRate: "100%",
    date: "2026-08-15 10:00",
    academicYear: "2025-2026",
    quarter: "Q1",
    canRollback: false,
    rolledBack: false,
    diffSummary: {
      studentsAffected: 500,
      riskIncreased: 0,
      riskDecreased: 0,
      unchanged: 500
    }
  }
];

export function getIngestionHistory(): IngestionBatchRecord[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(INGESTION_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_INGESTION_HISTORY;
}

export function saveIngestionHistory(history: IngestionBatchRecord[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(INGESTION_HISTORY_KEY, JSON.stringify(history));
      window.dispatchEvent(new CustomEvent("sapc:ingestion-history-updated", { detail: history }));
    } catch (e) {
      console.error("Failed to save ingestion history locally:", e);
    }
  }
}

export function recordIngestionBatch(
  batch: Omit<IngestionBatchRecord, "id" | "date"> & { id?: string; date?: string }
): IngestionBatchRecord {
  const current = getIngestionHistory();
  const id = batch.id || `IMP-${Date.now().toString().slice(-6)}`;
  const date = batch.date || new Date().toLocaleString("en-US", { 
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit", 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  const fullRecord: IngestionBatchRecord = {
    ...batch,
    id,
    date,
    canRollback: batch.canRollback ?? true,
    rolledBack: batch.rolledBack ?? false
  };

  const updated = [fullRecord, ...current];
  saveIngestionHistory(updated);
  return fullRecord;
}

export async function rollbackIngestionBatch(batchId: string): Promise<{ success: boolean; message: string; restoredCount?: number }> {
  const history = getIngestionHistory();
  const batchIndex = history.findIndex(h => h.id === batchId);

  if (batchIndex === -1) {
    return { success: false, message: `Batch ${batchId} not found in ingestion audit trail.` };
  }

  const batch = history[batchIndex];

  if (batch.rolledBack) {
    return { success: false, message: `Batch ${batchId} was already rolled back.` };
  }

  if (!batch.snapshotData || batch.snapshotData.length === 0) {
    // If no pre-import snapshot exists (e.g. initial demo history), safely recalculate baseline dataset
    const baseList = SAPC_500_STUDENTS;
    saveStudentDataset(baseList, true);
    
    // Mark batch as rolled back
    history[batchIndex] = { ...batch, rolledBack: true, canRollback: false };
    saveIngestionHistory(history);

    await logCloudAuditEvent({
      actor_name: "Authorized Administrator",
      actor_role: "admin",
      action: "BATCH_INGESTION_ROLLBACK",
      target_resource: `Batch ${batchId} (${batch.type})`,
      details: `Reverted active cohort to pre-import baseline (${baseList.length} students).`,
      ip_address: "127.0.0.1 (Campus LAN)"
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sapc:dataset-updated", { detail: { count: baseList.length } }));
    }

    return { success: true, message: `Successfully reverted batch ${batchId} to baseline state (${baseList.length} students).`, restoredCount: baseList.length };
  }

  // Restore dataset from pre-import snapshot
  const restoredDataset = recalculateAHPForDataset(batch.snapshotData);
  saveStudentDataset(restoredDataset, true);

  // Update audit history entry
  history[batchIndex] = { ...batch, rolledBack: true, canRollback: false };
  saveIngestionHistory(history);

  await logCloudAuditEvent({
    actor_name: "Authorized Administrator",
    actor_role: "admin",
    action: "BATCH_INGESTION_ROLLBACK",
    target_resource: `Batch ${batchId} (${batch.type})`,
    details: `Restored pre-import dataset snapshot containing ${restoredDataset.length} student records. Cloud Firestore synchronized.`,
    ip_address: "127.0.0.1 (Campus LAN)"
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sapc:dataset-updated", { detail: { count: restoredDataset.length } }));
  }

  return {
    success: true,
    message: `Batch ${batchId} successfully rolled back. Restored ${restoredDataset.length} student profiles with full Cloud sync.`,
    restoredCount: restoredDataset.length
  };
}

export interface DomainCompletenessStatus {
  domain: string;
  title: string;
  icon: string;
  weightPercent: number;
  countIngested: number;
  totalStudents: number;
  pctComplete: number;
  status: "Complete" | "Partial" | "Baseline Only";
  statusColor: string;
  lastUpdated: string;
}

export function getDomainIngestionCompleteness(students?: StudentRecord[]): DomainCompletenessStatus[] {
  const cohort = students || getActiveStudentDataset();
  const total = cohort.length || 500;

  // Check how many students have customized or non-default domain scores
  let acadCustom = 0;
  let mentalCustom = 0;
  let finCustom = 0;
  let famCustom = 0;
  let healthCustom = 0;

  cohort.forEach(s => {
    // SASS GPA or failing counts modified or academic score !== 20
    if (s.domain_scores?.academic && s.domain_scores.academic !== 20) acadCustom++;
    if (s.domain_scores?.mental_health && s.domain_scores.mental_health !== 15) mentalCustom++;
    if (s.domain_scores?.financial && s.domain_scores.financial !== 15) finCustom++;
    if (s.domain_scores?.family && s.domain_scores.family !== 15) famCustom++;
    if (s.domain_scores?.health && s.domain_scores.health !== 15) healthCustom++;
  });

  // If initial state, set realistic base proportions
  const calcStatus = (custom: number, baseWeight: number, title: string, icon: string, domainKey: string): DomainCompletenessStatus => {
    // Use actual or calibrated count
    const count = custom > 0 ? custom : (domainKey === "academic" ? 500 : domainKey === "mental_health" ? 385 : domainKey === "financial" ? 210 : domainKey === "family" ? 180 : 150);
    const pct = Math.min(100, Math.round((count / total) * 100));
    const status: "Complete" | "Partial" | "Baseline Only" = pct >= 90 ? "Complete" : pct >= 20 ? "Partial" : "Baseline Only";
    const statusColor = status === "Complete" ? "emerald" : status === "Partial" ? "amber" : "slate";

    return {
      domain: domainKey,
      title,
      icon,
      weightPercent: baseWeight,
      countIngested: count,
      totalStudents: total,
      pctComplete: pct,
      status,
      statusColor,
      lastUpdated: status === "Complete" ? "AY 2025-2026 Q1" : "Partial Sync (Baselines Active)"
    };
  };

  return [
    calcStatus(acadCustom, 30, "Academic & Attendance (SASS)", "📚", "academic"),
    calcStatus(mentalCustom, 15, "Mental Health & Psychometrics", "🧠", "mental_health"),
    calcStatus(finCustom, 15, "Financial & Scholarship Aid", "💰", "financial"),
    calcStatus(famCustom, 20, "Family & Social Dynamics", "👨‍👩‍👧‍👦", "family"),
    calcStatus(healthCustom, 20, "Physical Health & Clinic Records", "🏥", "health")
  ];
}

export interface InterventionCarePlan {
  id: number | string;
  student_id: number;
  student_name?: string;
  title: string;
  description?: string;
  target_domain?: string;
  domain?: string;
  status: "Active" | "Completed" | "Pending Review" | "Under Review" | "in-progress" | "pending" | "completed" | string;
  action_items?: string;
  scheduled_followup?: string;
  due_date?: string;
  goals?: string;
  session_notes?: string;
  outcome_rating?: number;
  assigned_counselor?: string;
  assigned_by?: string;
  proposed_by?: string;
  risk_adjustment_proposed?: string;
  created_at?: string;
}

const INTERVENTIONS_STORAGE_KEY = "sapc_interventions";

export const DEFAULT_INTERVENTIONS: InterventionCarePlan[] = [
  {
    id: 201,
    student_id: 1,
    student_name: "Erika Bautista",
    title: "Academic Remediation & Anxiety Management Protocol",
    description: "Peer tutoring in Mathematics with weekly guidance counseling check-ins for test anxiety.",
    target_domain: "Mental Health & Academic",
    status: "Active",
    action_items: JSON.stringify([
      { id: "task-101", text: "Math diagnostic test with Ms. Elena Bautista", assignee: "Subject Teacher", priority: "high", due_timeline: "Within 3 Days", completed: true },
      { id: "task-102", text: "Bi-weekly 1-on-1 counseling session for test anxiety", assignee: "Guidance Counselor", priority: "high", due_timeline: "Ongoing (Weekly)", completed: false },
      { id: "task-103", text: "Assigned peer tutor (Kyle Mercado - Grade 10)", assignee: "Class Adviser", priority: "medium", due_timeline: "Within 1 Week", completed: true },
      { id: "task-104", text: "Parent consultation on quiet evening study space", assignee: "Parent / Guardian", priority: "routine", due_timeline: "Within 2 Weeks", completed: false }
    ]),
    scheduled_followup: new Date(Date.now() + 86400000 * 3).toISOString(),
    goals: "Reduce GAD-7 anxiety score from 14 to <7, stabilize Mathematics grade above 80.0",
    session_notes: "Erika was open about feeling overwhelmed by study expectations and exam preparation.",
    outcome_rating: 4,
    assigned_counselor: "Maria Theresa Cruz, RGC",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 202,
    student_id: 4,
    student_name: "John Paul Dimaculangan",
    title: "Family Support & Attendance Recovery Plan",
    description: "Coordination with guardian and flexible modular submission arrangement for missed JHS deadlines.",
    target_domain: "Family & Attendance",
    status: "Active",
    action_items: JSON.stringify([
      { id: "task-201", text: "Formal case conference with guardian at Guidance Center", assignee: "Guidance Counselor", priority: "high", due_timeline: "Within 3 Days", completed: true },
      { id: "task-202", text: "Execute Attendance Recovery Commitment Contract", assignee: "Parent / Guardian", priority: "high", due_timeline: "Within 5 Days", completed: false },
      { id: "task-203", text: "Daily morning attendance tracking by adviser", assignee: "Class Adviser", priority: "medium", due_timeline: "Ongoing", completed: false }
    ]),
    scheduled_followup: new Date(Date.now() + 86400000 * 5).toISOString(),
    goals: "Restore 95% attendance standing and submit pending creative writing portfolios",
    session_notes: "Guardian confirmed emotional stress at home. Flexible timeline granted.",
    outcome_rating: 3,
    assigned_counselor: "Maria Theresa Cruz, RGC",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 203,
    student_id: 3,
    student_name: "Angelica Santos",
    title: "Emergency Tuition Subsidy & Financial Aid Referral",
    description: "Endorsement to SAPC Alumni Foundation assistance grant for delayed installment payments.",
    target_domain: "Financial Assistance",
    status: "Completed",
    action_items: JSON.stringify([
      { id: "task-301", text: "Endorse scholarship application to Alumni Foundation", assignee: "Guidance Counselor", priority: "high", due_timeline: "Completed", completed: true },
      { id: "task-302", text: "Accounting promissory note approval", assignee: "Scholarship / Finance Office", priority: "high", due_timeline: "Completed", completed: true },
      { id: "task-303", text: "Final voucher release & enrollment clearance", assignee: "Scholarship / Finance Office", priority: "medium", due_timeline: "Completed", completed: true }
    ]),
    scheduled_followup: new Date(Date.now() - 86400000 * 2).toISOString(),
    goals: "Clear financial arrears to enable examination permits",
    session_notes: "Grant approved. Student cleared for 2nd quarter examinations.",
    outcome_rating: 5,
    assigned_counselor: "Maria Theresa Cruz, RGC",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

export function getActiveInterventions(): InterventionCarePlan[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(INTERVENTIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_INTERVENTIONS;
}

export function saveActiveInterventions(plans: InterventionCarePlan[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(INTERVENTIONS_STORAGE_KEY, JSON.stringify(plans));
      window.dispatchEvent(new CustomEvent("sapc_interventions_updated", { detail: plans }));
    } catch (e) {
      console.error("Failed to save interventions locally:", e);
    }
  }
}

export function saveOrUpdateIntervention(plan: Partial<InterventionCarePlan> & { student_id: number; title: string }): InterventionCarePlan {
  const current = getActiveInterventions();
  const id = plan.id || Date.now();
  const existingIndex = current.findIndex(p => String(p.id) === String(id));

  const fullPlan: InterventionCarePlan = {
    description: "",
    target_domain: "Academic Remediation",
    status: "Active",
    action_items: "[]",
    scheduled_followup: new Date(Date.now() + 86400000 * 7).toISOString(),
    goals: "",
    session_notes: "",
    outcome_rating: 0,
    assigned_counselor: "Maria Theresa Cruz, RGC",
    created_at: new Date().toISOString(),
    ...plan,
    id,
    student_id: plan.student_id,
    student_name: plan.student_name || `Student #${plan.student_id}`,
    title: plan.title,
  };

  let updatedList: InterventionCarePlan[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = fullPlan;
  } else {
    updatedList = [fullPlan, ...current];
  }

  saveActiveInterventions(updatedList);
  return fullPlan;
}

export const createInterventionCarePlan = saveOrUpdateIntervention;

export function deleteIntervention(id: number | string): boolean {
  const current = getActiveInterventions();
  const filtered = current.filter(p => String(p.id) !== String(id));
  if (filtered.length !== current.length) {
    saveActiveInterventions(filtered);
    return true;
  }
  return false;
}

// ============================================================================
// UNIFIED NOTIFICATIONS STORE (SMS, EMAIL, SYSTEM, CRISIS)
// ============================================================================
export interface AppNotification {
  id: string;
  type: "crisis" | "referral" | "session" | "system" | "info" | "parent" | "alert" | "deadline";
  title: string;
  body: string;
  message?: string;
  time: string;
  timestamp: string;
  created_at?: string;
  read: boolean;
  is_read?: boolean;
  priority?: "urgent" | "high" | "medium" | "low" | string;
  audience?: string;
  targetRole?: "admin" | "counselor" | "teacher" | "student" | "parent" | "all";
  studentId?: number;
  student_id?: number;
  studentName?: string;
  student_name?: string;
  href?: string;
}

const NOTIFICATIONS_STORAGE_KEY = "sapc_notifications";

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  // Admin notifications
  {
    id: "notif-adm-001",
    type: "system",
    title: "SASS Batch Ingestion Sync Complete",
    body: "500 student records synchronized with DepEd DO 8, s. 2015 weighted scoring metrics.",
    message: "500 student records synchronized with DepEd DO 8, s. 2015 weighted scoring metrics.",
    time: "10 min ago",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    created_at: "10 min ago",
    read: false,
    is_read: false,
    priority: "medium",
    targetRole: "admin",
    audience: "admin",
    href: "/dashboard/admin"
  },
  {
    id: "notif-adm-002",
    type: "alert",
    title: "RA 10173 Compliance Audit Verified",
    body: "System security audit log generated and verified for compliance archives.",
    message: "System security audit log generated and verified for compliance archives.",
    time: "1 hr ago",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    created_at: "1 hr ago",
    read: true,
    is_read: true,
    priority: "low",
    targetRole: "admin",
    audience: "admin",
    href: "/dashboard/admin"
  },

  // Counselor / Guidance notifications
  {
    id: "notif-cns-001",
    type: "crisis",
    title: "Crisis Alert — High Risk Student",
    body: "Joshua Dimaculangan logged elevated distress in Pre-Calculus. Counselor case conference requested.",
    message: "Joshua Dimaculangan logged elevated distress in Pre-Calculus. Counselor case conference requested.",
    time: "5 min ago",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    created_at: "5 min ago",
    read: false,
    is_read: false,
    priority: "high",
    targetRole: "counselor",
    audience: "counselor",
    studentId: 1,
    student_id: 1,
    studentName: "Joshua Dimaculangan",
    student_name: "Joshua Dimaculangan",
    href: "/dashboard/guidance?tab=crisis_alerts"
  },
  {
    id: "notif-cns-002",
    type: "referral",
    title: "Teacher Referral Submitted",
    body: "Mr. Roberto Santos submitted a student support referral for Grade 11 - STEM St. Augustine.",
    message: "Mr. Roberto Santos submitted a student support referral for Grade 11 - STEM St. Augustine.",
    time: "25 min ago",
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    created_at: "25 min ago",
    read: false,
    is_read: false,
    priority: "medium",
    targetRole: "counselor",
    audience: "counselor",
    studentId: 7,
    student_id: 7,
    studentName: "Christian Dave Villanueva",
    student_name: "Christian Dave Villanueva",
    href: "/dashboard/guidance?tab=referrals"
  },
  {
    id: "notif-cns-003",
    type: "session",
    title: "Counseling Session Scheduled",
    body: "Parent consultation with Mrs. Teresa Santos confirmed for Room 204 Guidance Center.",
    message: "Parent consultation with Mrs. Teresa Santos confirmed for Room 204 Guidance Center.",
    time: "2 hrs ago",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    created_at: "2 hrs ago",
    read: true,
    is_read: true,
    priority: "medium",
    targetRole: "counselor",
    audience: "counselor",
    studentId: 1,
    student_id: 1,
    studentName: "Joshua Dimaculangan",
    student_name: "Joshua Dimaculangan",
    href: "/dashboard/guidance?tab=sessions"
  },

  // Teacher notifications
  {
    id: "notif-tch-001",
    type: "parent",
    title: "Parent Digital Form 138 Acknowledged",
    body: "Parent of Mark Kenneth Bautista digitally signed Q1 report card acknowledgment.",
    message: "Parent of Mark Kenneth Bautista digitally signed Q1 report card acknowledgment.",
    time: "15 min ago",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    created_at: "15 min ago",
    read: false,
    is_read: false,
    priority: "medium",
    targetRole: "teacher",
    audience: "teacher",
    studentId: 4,
    student_id: 4,
    studentName: "Mark Kenneth Bautista",
    student_name: "Mark Kenneth Bautista"
  },
  {
    id: "notif-tch-002",
    type: "deadline",
    title: "Q2 Diagnostic Remarks Due",
    body: "Submission deadline for 2nd Quarter formative assessment remarks is approaching on Friday.",
    message: "Submission deadline for 2nd Quarter formative assessment remarks is approaching on Friday.",
    time: "1 hr ago",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    created_at: "1 hr ago",
    read: false,
    is_read: false,
    priority: "low",
    targetRole: "teacher",
    audience: "teacher"
  },

  // Parent notifications
  {
    id: "notif-par-001",
    type: "alert",
    title: "Attendance & Punctuality Notice",
    body: "Joshua Dimaculangan marked present for all morning classes (St. Augustine).",
    message: "Joshua Dimaculangan marked present for all morning classes (St. Augustine).",
    time: "30 min ago",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    created_at: "30 min ago",
    read: false,
    is_read: false,
    priority: "medium",
    targetRole: "parent",
    audience: "parent",
    studentId: 1,
    student_id: 1,
    studentName: "Joshua Dimaculangan",
    student_name: "Joshua Dimaculangan"
  },
  {
    id: "notif-par-002",
    type: "info",
    title: "Form 138 Quarterly Grades Ready",
    body: "First Quarter academic evaluation cards are now available for review and signature.",
    message: "First Quarter academic evaluation cards are now available for review and signature.",
    time: "3 hrs ago",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    created_at: "3 hrs ago",
    read: true,
    is_read: true,
    priority: "low",
    targetRole: "parent",
    audience: "parent"
  },

  // Student notifications
  {
    id: "notif-stu-001",
    type: "session",
    title: "Guidance Consultation Scheduled",
    body: "Follow-up wellness check-in scheduled with Ms. Maria Theresa Cruz on Thursday at 2:00 PM.",
    message: "Follow-up wellness check-in scheduled with Ms. Maria Theresa Cruz on Thursday at 2:00 PM.",
    time: "45 min ago",
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    created_at: "45 min ago",
    read: false,
    is_read: false,
    priority: "medium",
    targetRole: "student",
    audience: "student"
  }
];

function normalizeRoleForNotifs(r?: string): string {
  if (!r) return "";
  const low = r.toLowerCase().trim();
  if (low === "guidance_counselor" || low === "counselor" || low === "guidance") return "counselor";
  return low;
}

function getAllNotificationsRaw(): AppNotification[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return [...DEFAULT_NOTIFICATIONS];
}

export function getActiveNotifications(role?: string): AppNotification[] {
  const normRole = normalizeRoleForNotifs(role);
  const allNotifs = getAllNotificationsRaw();

  if (!normRole || normRole === "all") return allNotifs;

  return allNotifs.filter((n) => {
    const target = normalizeRoleForNotifs(n.targetRole);
    const audience = normalizeRoleForNotifs(n.audience);
    if (!target || target === "all" || target === normRole) return true;
    if (audience && (audience === "all" || audience === normRole)) return true;
    return false;
  });
}

export function saveActiveNotifications(notifications: AppNotification[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      window.dispatchEvent(new CustomEvent("sapc:notifications-updated", { detail: notifications }));
    } catch (e) {
      console.error("Failed to save notifications locally:", e);
    }
  }
}

export function addAppNotification(notif: Partial<AppNotification> & { title: string; body?: string; message?: string }): AppNotification {
  const current = getAllNotificationsRaw();
  const id = notif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const text = notif.body || notif.message || "";
  const fullNotif: AppNotification = {
    time: "Just now",
    timestamp: new Date().toISOString(),
    created_at: "Just now",
    read: false,
    is_read: false,
    targetRole: "all",
    audience: "all",
    priority: "medium",
    ...notif,
    id,
    type: notif.type || "system",
    title: notif.title,
    body: text,
    message: text,
    studentId: notif.studentId || notif.student_id,
    student_id: notif.student_id || notif.studentId,
    studentName: notif.studentName || notif.student_name,
    student_name: notif.student_name || notif.studentName,
  };

  const updated = [fullNotif, ...current];
  saveActiveNotifications(updated);
  return fullNotif;
}

export function markNotificationRead(id: string): void {
  const current = getAllNotificationsRaw();
  const updated = current.map(n => (n.id === id ? { ...n, read: true, is_read: true } : n));
  saveActiveNotifications(updated);
}

export function markAllNotificationsRead(role?: string): void {
  const normRole = normalizeRoleForNotifs(role);
  const current = getAllNotificationsRaw();
  const updated = current.map((n) => {
    const target = normalizeRoleForNotifs(n.targetRole);
    const audience = normalizeRoleForNotifs(n.audience);
    if (
      !normRole ||
      normRole === "all" ||
      !target ||
      target === "all" ||
      target === normRole ||
      audience === "all" ||
      audience === normRole
    ) {
      return { ...n, read: true, is_read: true };
    }
    return n;
  });
  saveActiveNotifications(updated);
}

export function deleteAppNotification(id: string): void {
  const current = getAllNotificationsRaw();
  const filtered = current.filter(n => n.id !== id);
  saveActiveNotifications(filtered);
}

// ============================================================================
// UNIFIED TEACHER REFERRALS STORE
// ============================================================================
export interface TeacherReferral {
  id: string;
  student_id: number;
  student_name: string;
  lrn: string;
  section: string;
  referring_teacher: string;
  concern_type: string;
  urgency: "crisis" | "priority" | "routine" | string;
  observations: string;
  attempted_interventions: string[];
  created_at: string;
  status: "pending_review" | "accepted" | "in_progress" | "declined";
}

const REFERRALS_STORAGE_KEY = "sapc_teacher_referrals";

export const DEFAULT_REFERRALS: TeacherReferral[] = [
  {
    id: "REF-001",
    student_id: 1,
    student_name: "Erika Bautista",
    lrn: "109238470001",
    section: "Grade 7 - St. Anthony",
    referring_teacher: "Ms. Elena Bautista, LPT (Class Adviser)",
    concern_type: "Academic Helplessness & Exam Panic",
    urgency: "priority",
    observations: "Student exhibits visible trembling before math quizzes and has missed 2 problem set submissions.",
    attempted_interventions: ["1-on-1 recitation debrief", "Extended submission window for quiz #2"],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "pending_review"
  },
  {
    id: "REF-002",
    student_id: 2,
    student_name: "Althea Garcia",
    lrn: "109238470002",
    section: "Grade 7 - St. Bernadette",
    referring_teacher: "Mr. Carlos Dizon, LPT (Class Adviser)",
    concern_type: "Working Student Fatigue & Missed Tasks",
    urgency: "routine",
    observations: "Reports difficulty balancing family responsibilities with daytime academic schedule. Needs schedule counseling.",
    attempted_interventions: ["Modified study group partner assignment"],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "in_progress"
  }
];

export function getActiveReferrals(): TeacherReferral[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(REFERRALS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_REFERRALS;
}

export function saveActiveReferrals(referrals: TeacherReferral[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(referrals));
      window.dispatchEvent(new CustomEvent("sapc:referrals-updated", { detail: referrals }));
    } catch (e) {
      console.error("Failed to save referrals locally:", e);
    }
  }
}

export function addTeacherReferral(ref: Partial<TeacherReferral> & { student_id: number; student_name: string; observations: string }): TeacherReferral {
  const current = getActiveReferrals();
  const id = ref.id || `REF-${Date.now().toString().slice(-4)}`;
  const fullRef: TeacherReferral = {
    lrn: "109238470000",
    section: "Grade 7 - St. Anthony",
    referring_teacher: "Subject Teacher",
    concern_type: "Academic & Emotional Distress",
    urgency: "priority",
    attempted_interventions: [],
    created_at: new Date().toISOString(),
    status: "pending_review",
    ...ref,
    id,
    student_id: ref.student_id,
    student_name: ref.student_name,
    observations: ref.observations,
  };

  const updated = [fullRef, ...current];
  saveActiveReferrals(updated);

  // Auto-post notification
  addAppNotification({
    type: "referral",
    title: `Teacher Referral: ${fullRef.student_name}`,
    body: `${fullRef.referring_teacher} submitted a ${fullRef.urgency.toUpperCase()} referral: ${fullRef.concern_type}.`,
    message: `${fullRef.referring_teacher} submitted a ${fullRef.urgency.toUpperCase()} referral: ${fullRef.concern_type}.`,
    targetRole: "counselor",
    audience: "counselor",
    studentId: fullRef.student_id,
    student_id: fullRef.student_id,
    studentName: fullRef.student_name,
    student_name: fullRef.student_name,
    href: "/dashboard/guidance?tab=referrals"
  });

  return fullRef;
}

export function updateReferralStatus(id: string, status: TeacherReferral["status"]): void {
  const current = getActiveReferrals();
  const updated = current.map(r => r.id === id ? { ...r, status } : r);
  saveActiveReferrals(updated);
}

// ============================================================================
// UNIFIED COUNSELING SESSIONS STORE
// ============================================================================
export interface CounselingSession {
  id: string;
  student_id: number;
  student_name: string;
  time: string;
  date: string;
  type: string;
  topic?: string;
  counselor?: string;
  format?: string;
  status: "Confirmed" | "Completed" | "Pending Acknowledgment" | "Rescheduled" | "Cancelled" | "scheduled" | string;
  room?: string;
  notes?: string;
}

const SESSIONS_STORAGE_KEY = "sapc_counseling_sessions";

export const DEFAULT_SESSIONS: CounselingSession[] = [
  {
    id: "SES-101",
    student_id: 1,
    student_name: "Erika Bautista",
    time: "02:00 PM - 02:45 PM",
    date: "Today",
    type: "Academic Anxiety Counseling",
    status: "Confirmed",
    room: "Room 204 Guidance Center",
    notes: "Follow up on GAD-7 anxiety triggers and Mathematics tutoring match."
  },
  {
    id: "SES-102",
    student_id: 4,
    student_name: "John Paul Dimaculangan",
    time: "03:30 PM - 04:15 PM",
    date: "Tomorrow",
    type: "Parent-Student Case Conference",
    status: "Pending Acknowledgment",
    room: "Room 204 Guidance Center",
    notes: "Joint session with guardian regarding flexible attendance agreement."
  },
  {
    id: "SES-103",
    student_id: 3,
    student_name: "Angelica Santos",
    time: "10:00 AM - 10:30 AM",
    date: "Sep 22, 2026",
    type: "Routine Follow-up",
    status: "Completed",
    room: "Online Google Meet",
    notes: "Financial grant promissory note verified and cleared by Accounting."
  }
];

export function getActiveCounselingSessions(): CounselingSession[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_SESSIONS;
}

export function saveActiveCounselingSessions(sessions: CounselingSession[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      window.dispatchEvent(new CustomEvent("sapc:sessions-updated", { detail: sessions }));
    } catch (e) {
      console.error("Failed to save sessions locally:", e);
    }
  }
}

export function scheduleCounselingSession(session: Partial<CounselingSession> & { student_id: number; student_name: string; date: string; time: string }): CounselingSession {
  const current = getActiveCounselingSessions();
  const id = session.id || `SES-${Date.now().toString().slice(-4)}`;
  const fullSession: CounselingSession = {
    type: session.topic || "1-on-1 Counseling Check-in",
    status: "Confirmed",
    room: "Room 204 Guidance Center, SAPC",
    notes: "",
    ...session,
    id,
    student_id: session.student_id,
    student_name: session.student_name,
    time: session.time,
    date: session.date,
  };

  const updated = [fullSession, ...current];
  saveActiveCounselingSessions(updated);

  // Auto-post notification
  addAppNotification({
    type: "session",
    title: `Guidance Session: ${fullSession.student_name}`,
    body: `${fullSession.type} scheduled for ${fullSession.date} at ${fullSession.time}.`,
    message: `${fullSession.type} scheduled for ${fullSession.date} at ${fullSession.time}.`,
    targetRole: "all",
    audience: "all",
    studentId: fullSession.student_id,
    student_id: fullSession.student_id,
    studentName: fullSession.student_name,
    student_name: fullSession.student_name,
    href: "/dashboard/guidance?tab=sessions"
  });

  return fullSession;
}

export function updateSessionStatus(id: string, status: CounselingSession["status"], notes?: string): void {
  const current = getActiveCounselingSessions();
  const updated = current.map(s => s.id === id ? { ...s, status, notes: notes || s.notes } : s);
  saveActiveCounselingSessions(updated);
}

// ============================================================================
// FACULTY & GUIDANCE COUNSELOR REPOSITORY WITH CLOUD FIRESTORE SYNC
// ============================================================================
export interface FacultyRecord {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "guidance_counselor" | "counselor" | "admin";
  department: string;
  section?: string;
  grade_level?: string;
  employee_id?: string;
  prc_license_no?: string;
  initial_password?: string;
  status: "Active" | "Pending Activation" | "Suspended";
  phone?: string;
  created_at: string;
}

export const FACULTY_STORAGE_KEY = "sapc_campus_faculty_records";

export const DEFAULT_FACULTY_ROSTER: FacultyRecord[] = [
  {
    id: "FAC-001",
    name: "Mr. Roberto Santos, LPT",
    email: "roberto.santos@sapc.edu.ph",
    role: "teacher",
    department: "Senior High STEM",
    section: "Grade 11 - St. Augustine (STEM)",
    grade_level: "Grade 11",
    employee_id: "SAPC-FAC-2023-014",
    initial_password: "teacher123",
    status: "Active",
    phone: "+63 917 842 1092",
    created_at: "2026-08-15T08:00:00.000Z"
  },
  {
    id: "FAC-002",
    name: "Mrs. Teresa Santos, LPT",
    email: "teresa.santos@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 10 - St. Thomas Aquinas",
    grade_level: "Grade 10",
    employee_id: "SAPC-FAC-2022-089",
    initial_password: "teacher123",
    status: "Active",
    phone: "+63 918 331 4059",
    created_at: "2026-08-15T08:00:00.000Z"
  },
  {
    id: "FAC-003",
    name: "Prof. Annalyn Cruz, LPT",
    email: "annalyn.cruz@sapc.edu.ph",
    role: "teacher",
    department: "Senior High ABM",
    section: "Grade 12 - St. Jude (ABM)",
    grade_level: "Grade 12",
    employee_id: "SAPC-FAC-2024-002",
    initial_password: "teacher123",
    status: "Active",
    phone: "+63 920 119 2847",
    created_at: "2026-08-15T08:00:00.000Z"
  },
  {
    id: "FAC-004",
    name: "Dr. Elena Ramos, RGC",
    email: "elena.ramos@sapc.edu.ph",
    role: "guidance_counselor",
    department: "Guidance & Counseling Center",
    section: "Guidance Office - Room 204",
    grade_level: "Grades 11-12 (Senior High)",
    employee_id: "SAPC-COUN-2021-008",
    prc_license_no: "PRC-RGC-008924",
    initial_password: "counselor123",
    status: "Active",
    phone: "+63 917 555 8924",
    created_at: "2026-08-10T08:00:00.000Z"
  },
  {
    id: "FAC-005",
    name: "Mr. Francis M. Tolentino, RGC",
    email: "francis.tolentino@sapc.edu.ph",
    role: "guidance_counselor",
    department: "Guidance & Counseling Center",
    section: "Guidance Office - Room 202",
    grade_level: "Grades 7-10 (Junior High)",
    employee_id: "SAPC-COUN-2022-019",
    prc_license_no: "PRC-RGC-009102",
    initial_password: "counselor123",
    status: "Active",
    phone: "+63 919 444 3210",
    created_at: "2026-08-10T08:00:00.000Z"
  },
  {
    id: "FAC-006",
    name: "Engr. Paul Valdez",
    email: "paul.valdez@sapc.edu.ph",
    role: "teacher",
    department: "Senior High STEM",
    section: "Chemistry & Physics Faculty",
    grade_level: "Grade 11-12",
    employee_id: "SAPC-FAC-2021-045",
    initial_password: "teacher123",
    status: "Active",
    phone: "+63 922 776 5432",
    created_at: "2026-08-15T08:00:00.000Z"
  },
  {
    id: "FAC-007",
    name: "Ms. Jessica Alcantara, LPT",
    email: "jessica.alcantara@sapc.edu.ph",
    role: "teacher",
    department: "Senior High HUMSS",
    section: "Grade 11 - San Lorenzo Ruiz (HUMSS)",
    grade_level: "Grade 11",
    employee_id: "SAPC-FAC-2024-019",
    initial_password: "teacher123",
    status: "Active",
    phone: "+63 915 678 1234",
    created_at: "2026-08-18T08:00:00.000Z"
  }
];

/**
 * Retrieves the active faculty & counselor roster from localStorage or falls back to standard defaults.
 */
export function getActiveFacultyRecords(): FacultyRecord[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(FACULTY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_FACULTY_ROSTER;
}

/**
 * Persists the faculty & counselor roster locally and broadcasts update event.
 */
export function saveActiveFacultyRecords(records: FacultyRecord[], syncToCloud = true): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent("sapc:faculty-updated", { detail: records }));
    } catch (e) {
      console.error("Failed to save faculty records locally:", e);
    }
  }

  if (syncToCloud && typeof window !== "undefined") {
    syncFacultyRecordsToFirestore(records).catch(err => {
      console.warn("Cloud sync for faculty records encountered an issue:", err);
    });
  }
}

/**
 * Synchronizes faculty & counselor records to Cloud Firestore `faculty_records` collection.
 */
export async function syncFacultyRecordsToFirestore(records: FacultyRecord[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (!db) {
    return { success: false, count: 0, error: "Firestore not initialized" };
  }
  try {
    const colRef = collection(db, "faculty_records");
    const batch = writeBatch(db);

    for (const rec of records) {
      const docId = rec.email ? rec.email.replace(/[@.]/g, "_") : `fac_${rec.id}`;
      const docRef = doc(colRef, docId);
      batch.set(docRef, {
        ...rec,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    await batch.commit();
    console.log(`[Firestore Sync] Successfully committed ${records.length} faculty/counselor records to 'faculty_records' collection.`);
    return { success: true, count: records.length };
  } catch (err: any) {
    console.error("[Firestore Sync Error - Faculty]:", err);
    return { success: false, count: 0, error: err.message || "Cloud sync failed" };
  }
}

/**
 * Fetches all faculty and counselor records from Cloud Firestore collection `faculty_records`.
 */
export async function loadFacultyRecordsFromFirestore(): Promise<FacultyRecord[]> {
  if (!db) return getActiveFacultyRecords();
  try {
    const colRef = collection(db, "faculty_records");
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const cloudRecords: FacultyRecord[] = [];
      snapshot.forEach(docSnap => {
        cloudRecords.push(docSnap.data() as FacultyRecord);
      });
      saveActiveFacultyRecords(cloudRecords, false);
      return cloudRecords;
    }
  } catch (err) {
    console.warn("Could not fetch faculty records from Firestore, using local fallback:", err);
  }
  return getActiveFacultyRecords();
}

/**
 * Sets up a real-time listener for Cloud Firestore `faculty_records`.
 */
export function subscribeToFacultyRecords(callback: (records: FacultyRecord[]) => void): Unsubscribe | (() => void) {
  if (!db) {
    return () => {};
  }
  try {
    const colRef = collection(db, "faculty_records");
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const records: FacultyRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push(docSnap.data() as FacultyRecord);
        });
        saveActiveFacultyRecords(records, false);
        callback(records);
      }
    }, (err) => {
      console.warn("Faculty real-time listener notice:", err);
    });
  } catch (err) {
    console.warn("Failed to attach faculty Firestore listener:", err);
    return () => {};
  }
}

/**
 * Adds a new single Faculty or Counselor record to local store and Cloud Firestore.
 */
export async function addFacultyRecord(newRecord: Partial<FacultyRecord> & { name: string; email: string; role: FacultyRecord["role"] }): Promise<FacultyRecord> {
  const current = getActiveFacultyRecords();
  const nextNum = current.length + 1;
  const isCounselor = newRecord.role === "guidance_counselor" || newRecord.role === "counselor";
  
  const record: FacultyRecord = {
    id: newRecord.id || (isCounselor ? `COUN-${String(nextNum).padStart(3, "0")}` : `FAC-${String(nextNum).padStart(3, "0")}`),
    name: newRecord.name.trim(),
    email: newRecord.email.trim().toLowerCase(),
    role: newRecord.role,
    department: newRecord.department || (isCounselor ? "Guidance & Counseling Center" : "Academic Department"),
    section: newRecord.section || (isCounselor ? "Guidance Office" : "General Faculty"),
    grade_level: newRecord.grade_level || (isCounselor ? "All Levels" : "Grade 11"),
    employee_id: newRecord.employee_id || (isCounselor ? `SAPC-COUN-2026-${String(nextNum).padStart(3, "0")}` : `SAPC-FAC-2026-${String(nextNum).padStart(3, "0")}`),
    prc_license_no: newRecord.prc_license_no || (isCounselor ? `PRC-RGC-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
    initial_password: newRecord.initial_password || (isCounselor ? "counselor123" : "teacher123"),
    status: newRecord.status || "Active",
    phone: newRecord.phone || "+63 900 000 0000",
    created_at: newRecord.created_at || new Date().toISOString()
  };

  const updated = [record, ...current.filter(r => r.email !== record.email)];
  saveActiveFacultyRecords(updated, true);

  if (db) {
    try {
      const docId = record.email.replace(/[@.]/g, "_");
      await setDoc(doc(collection(db, "faculty_records"), docId), {
        ...record,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Direct Firestore single write notice:", e);
    }
  }

  // Also log to cloud audit history
  logCloudAuditEvent({
    actor_name: "Platform Administrator",
    actor_role: "admin",
    action: "ADMIN_PROVISION_FACULTY",
    target_resource: `${record.role.toUpperCase()} Account: ${record.name}`,
    details: `Provisioned account for ${record.name} (${record.email}) in Cloud Firestore faculty_records.`
  }).catch(() => {});

  return record;
}

/**
 * Updates an existing Faculty or Counselor record in local store and Cloud Firestore.
 */
export async function updateFacultyRecord(id: string, updates: Partial<FacultyRecord>): Promise<FacultyRecord | null> {
  const current = getActiveFacultyRecords();
  let updatedRecord: FacultyRecord | null = null;
  const nextList = current.map(rec => {
    if (rec.id === id || rec.email === updates.email) {
      updatedRecord = { ...rec, ...updates };
      return updatedRecord;
    }
    return rec;
  });

  if (updatedRecord) {
    saveActiveFacultyRecords(nextList, true);
    if (db) {
      try {
        const docId = (updatedRecord as FacultyRecord).email.replace(/[@.]/g, "_");
        await setDoc(doc(collection(db, "faculty_records"), docId), {
          ...(updatedRecord as FacultyRecord),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn("Direct Firestore update notice:", e);
      }
    }
  }

  return updatedRecord;
}

/**
 * Deletes a Faculty or Counselor record from local store and Cloud Firestore.
 */
export async function deleteFacultyRecord(id: string): Promise<boolean> {
  const current = getActiveFacultyRecords();
  const target = current.find(r => r.id === id);
  if (!target) return false;

  const nextList = current.filter(r => r.id !== id);
  saveActiveFacultyRecords(nextList, false);

  if (db && target.email) {
    try {
      const docId = target.email.replace(/[@.]/g, "_");
      await deleteDoc(doc(collection(db, "faculty_records"), docId));
    } catch (e) {
      console.warn("Direct Firestore delete notice:", e);
    }
  }

  logCloudAuditEvent({
    actor_name: "Platform Administrator",
    actor_role: "admin",
    action: "ADMIN_DELETE_FACULTY",
    target_resource: `Faculty Record: ${target.name}`,
    details: `Deleted faculty record for ${target.name} (${target.email}) from Cloud Firestore.`
  }).catch(() => {});

  return true;
}

/**
 * Parses and batch imports a CSV dataset of Faculty and Guidance Counselors into Firestore & Local state.
 */
export async function importFacultyCSV(csvText: string): Promise<{ success: boolean; count: number; imported: FacultyRecord[]; errors: string[] }> {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return { success: false, count: 0, imported: [], errors: ["CSV file must contain a header row and at least one data row."] };
  }

  const rawHeaders = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
  
  // Header matching helpers
  const findIndex = (patterns: string[]) => rawHeaders.findIndex(h => patterns.some(p => h.includes(p)));
  const nameIdx = findIndex(["name", "fullname", "full_name", "teacher_name", "counselor_name"]);
  const emailIdx = findIndex(["email", "institutional_email", "mail"]);
  const roleIdx = findIndex(["role", "type", "position", "designation"]);
  const deptIdx = findIndex(["dept", "department", "unit"]);
  const secIdx = findIndex(["section", "advisory", "advisory_section", "assigned_section"]);
  const gradeIdx = findIndex(["grade", "grade_level", "assigned_grade", "level"]);
  const empIdx = findIndex(["employee", "emp_id", "employee_id", "faculty_id", "id_number"]);
  const prcIdx = findIndex(["prc", "license", "prc_license", "rgc", "prc_license_no"]);
  const passIdx = findIndex(["password", "initial_password", "pass"]);
  const statusIdx = findIndex(["status", "active_status"]);
  const phoneIdx = findIndex(["phone", "contact", "mobile"]);

  if (nameIdx === -1 || emailIdx === -1) {
    return { 
      success: false, 
      count: 0, 
      imported: [], 
      errors: ["Missing required columns: CSV must have 'name' (or 'full_name') and 'email' (or 'institutional_email')."] 
    };
  }

  const currentFaculty = getActiveFacultyRecords();
  const emailMap = new Map<string, FacultyRecord>();
  currentFaculty.forEach(f => emailMap.set(f.email.toLowerCase(), f));

  const parsedRecords: FacultyRecord[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowLine = lines[i].trim();
    if (!rowLine) continue;

    // Handle CSV quoting with regex
    const row = rowLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(val => val.replace(/^"|"$/g, "").trim()) || rowLine.split(",").map(v => v.trim());
    
    const name = row[nameIdx] || "";
    const email = (row[emailIdx] || "").toLowerCase();

    if (!name || !email) {
      errors.push(`Row ${i + 1}: Skipped due to missing name or email.`);
      continue;
    }

    if (!email.includes("@")) {
      errors.push(`Row ${i + 1}: Invalid email format '${email}'.`);
      continue;
    }

    const rawRole = (roleIdx !== -1 ? row[roleIdx] : "").toLowerCase();
    let role: FacultyRecord["role"] = "teacher";
    if (rawRole.includes("counsel") || rawRole.includes("rgc") || rawRole.includes("guidance")) {
      role = "guidance_counselor";
    } else if (rawRole.includes("admin")) {
      role = "admin";
    }

    const isCounselor = role === "guidance_counselor";
    const department = deptIdx !== -1 && row[deptIdx] ? row[deptIdx] : (isCounselor ? "Guidance & Counseling Center" : "Academic Department");
    const section = secIdx !== -1 && row[secIdx] ? row[secIdx] : (isCounselor ? "Guidance Office" : "General Faculty");
    const grade_level = gradeIdx !== -1 && row[gradeIdx] ? row[gradeIdx] : (isCounselor ? "All Levels" : "Grade 11");
    const employee_id = empIdx !== -1 && row[empIdx] ? row[empIdx] : (isCounselor ? `SAPC-COUN-2026-${String(parsedRecords.length + 10).padStart(3, "0")}` : `SAPC-FAC-2026-${String(parsedRecords.length + 10).padStart(3, "0")}`);
    const prc_license_no = prcIdx !== -1 && row[prcIdx] ? row[prcIdx] : (isCounselor ? `PRC-RGC-${Math.floor(100000 + Math.random() * 900000)}` : undefined);
    const initial_password = passIdx !== -1 && row[passIdx] ? row[passIdx] : (isCounselor ? "counselor123" : "teacher123");
    const statusVal = statusIdx !== -1 && row[statusIdx] ? row[statusIdx] : "Active";
    const status: FacultyRecord["status"] = (statusVal.toLowerCase().includes("pend") ? "Pending Activation" : (statusVal.toLowerCase().includes("susp") ? "Suspended" : "Active"));
    const phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : "+63 900 000 0000";

    const id = isCounselor ? `COUN-${String(emailMap.size + parsedRecords.length + 1).padStart(3, "0")}` : `FAC-${String(emailMap.size + parsedRecords.length + 1).padStart(3, "0")}`;

    const newRecord: FacultyRecord = {
      id,
      name,
      email,
      role,
      department,
      section,
      grade_level,
      employee_id,
      prc_license_no,
      initial_password,
      status,
      phone,
      created_at: new Date().toISOString()
    };

    emailMap.set(email, newRecord);
    parsedRecords.push(newRecord);
  }

  const mergedRoster = Array.from(emailMap.values());
  saveActiveFacultyRecords(mergedRoster, true);

  // Log to Ingestion History
  recordIngestionBatch({
    id: `FAC-${Date.now().toString().slice(-4)}`,
    type: "Faculty & Staff Roster CSV Ingestion",
    domain: "academic",
    importedBy: "Platform Administrator",
    count: parsedRecords.length,
    successRate: "100%",
    academicYear: "2026-2027",
    quarter: "Q2",
    canRollback: false,
    rolledBack: false
  });

  logCloudAuditEvent({
    actor_name: "Platform Administrator",
    actor_role: "admin",
    action: "CSV_INGESTION_FACULTY",
    target_resource: "Cloud Firestore: faculty_records",
    details: `Imported ${parsedRecords.length} faculty and counselor accounts into Firestore.`
  }).catch(() => {});

  return {
    success: true,
    count: parsedRecords.length,
    imported: parsedRecords,
    errors
  };
}

// ============================================================================
// 12. PENDING REGISTRATIONS & PARENT LINKAGE STORE (Firestore + Local)
// ============================================================================

export interface PendingRegistrationRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "parent" | "teacher" | "counselor" | "student";
  relationship: string;
  linkedStudent: string;
  linkedLRN: string;
  section: string;
  verificationDoc: string;
  date: string;
  status: "Pending Verification" | "Approved" | "Declined";
  notes?: string;
  submittedAt?: string;
}

export interface ParentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  linkedStudentName: string;
  linkedLRN: string;
  section: string;
  gradeLevel: string;
  status: "Active" | "Pending Activation" | "Suspended";
  verifiedAt: string;
  sf9Access: boolean;
  attendanceAlerts: boolean;
  riskAlerts: boolean;
  initialPassword?: string;
}

const PENDING_STORAGE_KEY = "sapc_pending_registrations_store";
const PARENTS_STORAGE_KEY = "sapc_parent_records_store";

export const DEFAULT_PENDING_REGISTRATIONS: PendingRegistrationRecord[] = [
  {
    id: "REG-201",
    name: "Mrs. Elena Dimaculangan",
    email: "parent.dimaculangan@gmail.com",
    phone: "+63 917 555 0192",
    role: "parent",
    relationship: "Mother / Primary Guardian",
    linkedStudent: "Joshua Dimaculangan",
    linkedLRN: "109238475001",
    section: "Grade 11 - St. Augustine (STEM)",
    verificationDoc: "PSA Birth Certificate (PSA-BC-2009-88219)",
    date: "2026-09-19",
    status: "Pending Verification",
    notes: "PSA verified; matching Grade 11 STEM class master list."
  },
  {
    id: "REG-202",
    name: "Mr. Arthur Reyes",
    email: "arthur.reyes@yahoo.com",
    phone: "+63 918 332 9481",
    role: "parent",
    relationship: "Father",
    linkedStudent: "Samantha Nicole Reyes",
    linkedLRN: "109238475004",
    section: "Grade 11 - St. Thomas (HUMSS)",
    verificationDoc: "Guardian Gov ID & Enrollment Slip",
    date: "2026-09-20",
    status: "Pending Verification",
    notes: "Government UMID ID attached with DepEd enrollment confirmation slip."
  },
  {
    id: "REG-203",
    name: "Prof. Annalyn Cruz, LPT",
    email: "annalyn.cruz@sapc.edu.ph",
    phone: "+63 920 119 2847",
    role: "teacher",
    relationship: "Faculty Adviser",
    linkedStudent: "Grade 12 - St. Jude (ABM)",
    linkedLRN: "N/A (Faculty)",
    section: "Grade 12 - St. Jude (ABM)",
    verificationDoc: "Faculty Appointment & PRC License No. 049821",
    date: "2026-09-18",
    status: "Pending Verification",
    notes: "Senior High ABM Advisory assignment verified by Academic Dean."
  }
];

export const DEFAULT_PARENT_RECORDS: ParentRecord[] = [
  {
    id: "PAR-001",
    name: "Mrs. Corazon D. Santos",
    email: "parent.santos@gmail.com",
    phone: "+63 917 882 1029",
    relationship: "Mother",
    linkedStudentName: "Juan Carlos Santos",
    linkedLRN: "109238475001",
    section: "Grade 11 - St. Augustine (STEM)",
    gradeLevel: "Grade 11",
    status: "Active",
    verifiedAt: "2026-08-15",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: "parent2026"
  },
  {
    id: "PAR-002",
    name: "Engr. Roberto B. Garcia",
    email: "roberto.garcia@outlook.ph",
    phone: "+63 922 401 9928",
    relationship: "Father",
    linkedStudentName: "Angela Mae Garcia",
    linkedLRN: "109238475002",
    section: "Grade 11 - St. Augustine (STEM)",
    gradeLevel: "Grade 11",
    status: "Active",
    verifiedAt: "2026-08-16",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: "parent2026"
  },
  {
    id: "PAR-003",
    name: "Mrs. Maritess P. Ramos",
    email: "maritess.ramos@gmail.com",
    phone: "+63 915 392 7710",
    relationship: "Mother",
    linkedStudentName: "Gabriel Ramos",
    linkedLRN: "109238475003",
    section: "Grade 11 - St. Augustine (STEM)",
    gradeLevel: "Grade 11",
    status: "Active",
    verifiedAt: "2026-08-18",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: "parent2026"
  },
  {
    id: "PAR-004",
    name: "Atty. Ferdinand G. De Jesus",
    email: "ferdinand.dejesus@yahoo.com",
    phone: "+63 919 726 1144",
    relationship: "Father",
    linkedStudentName: "Chloe Nicole De Jesus",
    linkedLRN: "109238475004",
    section: "Grade 11 - St. Thomas (HUMSS)",
    gradeLevel: "Grade 11",
    status: "Active",
    verifiedAt: "2026-08-20",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: "parent2026"
  },
  {
    id: "PAR-005",
    name: "Mrs. Jocelyn Mendoza",
    email: "jocelyn.mendoza@gmail.com",
    phone: "+63 928 654 3210",
    relationship: "Mother / OFW Guardian",
    linkedStudentName: "Mark Anthony Mendoza",
    linkedLRN: "109238475005",
    section: "Grade 11 - St. Thomas (HUMSS)",
    gradeLevel: "Grade 11",
    status: "Active",
    verifiedAt: "2026-08-22",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: "parent2026"
  },
  {
    id: "PAR-006",
    name: "Mr. Renato Bautista",
    email: "renato.bautista@gmail.com",
    phone: "+63 917 123 4567",
    relationship: "Father",
    linkedStudentName: "Christian Dave Bautista",
    linkedLRN: "109238475006",
    section: "Grade 12 - St. Jude (ABM)",
    gradeLevel: "Grade 12",
    status: "Active",
    verifiedAt: "2026-08-25",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: "parent2026"
  },
  {
    id: "PAR-007",
    name: "Mrs. Dolores Alcantara",
    email: "dolores.alcantara@gmail.com",
    phone: "+63 920 987 6543",
    relationship: "Grandmother / Guardian",
    linkedStudentName: "Patricia Alcantara",
    linkedLRN: "109238475007",
    section: "Grade 12 - St. Jude (ABM)",
    gradeLevel: "Grade 12",
    status: "Active",
    verifiedAt: "2026-08-28",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: "parent2026"
  },
  {
    id: "PAR-008",
    name: "Dr. Manuel Soriano",
    email: "manuel.soriano@gmail.com",
    phone: "+63 918 554 4332",
    relationship: "Father",
    linkedStudentName: "Ethan Soriano",
    linkedLRN: "109238475008",
    section: "Grade 12 - St. Jude (ABM)",
    gradeLevel: "Grade 12",
    status: "Active",
    verifiedAt: "2026-09-01",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: "parent2026"
  }
];

export function getActivePendingRegistrations(): PendingRegistrationRecord[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(PENDING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_PENDING_REGISTRATIONS;
}

export function saveActivePendingRegistrations(records: PendingRegistrationRecord[], syncToFirestore = true): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent("sapc:pending-registrations-updated", { detail: records }));
    } catch (e) {
      console.error("Failed to save pending registrations locally:", e);
    }
  }

  if (syncToFirestore) {
    (async () => {
      try {
        const batch = writeBatch(db);
        records.forEach((rec) => {
          const docRef = doc(db, "pending_registrations", rec.id);
          batch.set(docRef, { ...rec, updatedAt: serverTimestamp() }, { merge: true });
        });
        await batch.commit();
      } catch (err) {
        console.warn("Firestore pending registrations sync:", err);
      }
    })();
  }
}

export function getActiveParentRecords(): ParentRecord[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(PARENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_PARENT_RECORDS;
}

export function saveActiveParentRecords(records: ParentRecord[], syncToFirestore = true): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent("sapc:parent-records-updated", { detail: records }));
    } catch (e) {
      console.error("Failed to save parent records locally:", e);
    }
  }

  if (syncToFirestore) {
    (async () => {
      try {
        const batch = writeBatch(db);
        records.forEach((rec) => {
          const docRef = doc(db, "parent_records", rec.id);
          batch.set(docRef, { ...rec, updatedAt: serverTimestamp() }, { merge: true });
        });
        await batch.commit();
      } catch (err) {
        console.warn("Firestore parent records sync:", err);
      }
    })();
  }
}

export async function loadPendingRegistrationsFromFirestore(): Promise<PendingRegistrationRecord[] | null> {
  try {
    const colRef = collection(db, "pending_registrations");
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const all: PendingRegistrationRecord[] = [];
      snapshot.forEach(docSnap => {
        all.push({ ...docSnap.data(), id: docSnap.id } as PendingRegistrationRecord);
      });
      if (all.length > 0) {
        saveActivePendingRegistrations(all, false);
        return all;
      }
    }
  } catch (err) {
    console.warn("Could not fetch pending registrations from Firestore, using local:", err);
  }
  return null;
}

export async function loadParentRecordsFromFirestore(): Promise<ParentRecord[] | null> {
  try {
    const colRef = collection(db, "parent_records");
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const all: ParentRecord[] = [];
      snapshot.forEach(docSnap => {
        all.push({ ...docSnap.data(), id: docSnap.id } as ParentRecord);
      });
      if (all.length > 0) {
        saveActiveParentRecords(all, false);
        return all;
      }
    }
  } catch (err) {
    console.warn("Could not fetch parent records from Firestore, using local:", err);
  }
  return null;
}

export function subscribeToPendingRegistrations(callback: (records: PendingRegistrationRecord[]) => void): Unsubscribe | null {
  try {
    const colRef = collection(db, "pending_registrations");
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const records: PendingRegistrationRecord[] = [];
        snapshot.forEach(docSnap => {
          records.push({ ...docSnap.data(), id: docSnap.id } as PendingRegistrationRecord);
        });
        callback(records);
      }
    }, (error) => {
      console.warn("Real-time pending registrations listener error:", error);
    });
  } catch {
    return null;
  }
}

export function subscribeToParentRecords(callback: (records: ParentRecord[]) => void): Unsubscribe | null {
  try {
    const colRef = collection(db, "parent_records");
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const records: ParentRecord[] = [];
        snapshot.forEach(docSnap => {
          records.push({ ...docSnap.data(), id: docSnap.id } as ParentRecord);
        });
        callback(records);
      }
    }, (error) => {
      console.warn("Real-time parent records listener error:", error);
    });
  } catch {
    return null;
  }
}


