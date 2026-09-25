import { SAPC_500_STUDENTS, StudentRecord } from "@/data/students500";
export type { StudentRecord };
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  writeBatch, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  limit,
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
// UNIFIED INTERVENTIONS & CARE PLANS STORE
// ============================================================================
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
    student_name: "Joshua Dimaculangan",
    title: "Academic Remediation & Anxiety Management Protocol",
    description: "Peer tutoring in Pre-Calculus with weekly guidance counseling check-ins for test anxiety.",
    target_domain: "Mental Health & Academic",
    status: "Active",
    action_items: JSON.stringify([
      { id: "task-101", text: "Pre-Calculus diagnostic test with Ms. Santos", assignee: "Subject Teacher", priority: "high", due_timeline: "Within 3 Days", completed: true },
      { id: "task-102", text: "Bi-weekly 1-on-1 counseling session for test anxiety", assignee: "Guidance Counselor", priority: "high", due_timeline: "Ongoing (Weekly)", completed: false },
      { id: "task-103", text: "Assigned peer tutor (Kyle Mercado - Grade 12 STEM)", assignee: "Class Adviser", priority: "medium", due_timeline: "Within 1 Week", completed: true },
      { id: "task-104", text: "Parent consultation on quiet evening study space", assignee: "Parent / Guardian", priority: "routine", due_timeline: "Within 2 Weeks", completed: false }
    ]),
    scheduled_followup: new Date(Date.now() + 86400000 * 3).toISOString(),
    goals: "Reduce GAD-7 anxiety score from 14 to <7, stabilize Pre-Calculus grade above 78.0",
    session_notes: "Joshua was open about feeling overwhelmed by expectations as first in family to take STEM.",
    outcome_rating: 4,
    assigned_counselor: "Maria Theresa Cruz, RGC",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 202,
    student_id: 4,
    student_name: "Samantha Nicole Reyes",
    title: "Family Support & Attendance Recovery Plan",
    description: "Coordination with guardian and flexible modular submission arrangement for missed HUMSS deadlines.",
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
    student_name: "Angelica Dela Cruz",
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
  {
    id: "notif-001",
    type: "crisis",
    title: "Crisis Alert — High Risk Student",
    body: "Joshua Dimaculangan logged high distress in Pre-Calculus. Counselor case conference requested.",
    message: "Joshua Dimaculangan logged high distress in Pre-Calculus. Counselor case conference requested.",
    time: "5 min ago",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    created_at: "5 min ago",
    read: false,
    is_read: false,
    priority: "high",
    targetRole: "all",
    audience: "all",
    studentId: 1,
    student_id: 1,
    studentName: "Joshua Dimaculangan",
    student_name: "Joshua Dimaculangan",
    href: "/dashboard/guidance?tab=crisis_alerts"
  },
  {
    id: "notif-002",
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
    id: "notif-003",
    type: "session",
    title: "Counseling Session Scheduled",
    body: "Parent consultation with Mrs. Teresa Santos confirmed for Room 204 Guidance Center.",
    message: "Parent consultation with Mrs. Teresa Santos confirmed for Room 204 Guidance Center.",
    time: "1 hr ago",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    created_at: "1 hr ago",
    read: false,
    is_read: false,
    priority: "medium",
    targetRole: "all",
    audience: "all",
    studentId: 1,
    student_id: 1,
    studentName: "Joshua Dimaculangan",
    student_name: "Joshua Dimaculangan",
    href: "/dashboard/guidance?tab=sessions"
  },
  {
    id: "notif-004",
    type: "system",
    title: "Dataset Ingestion & AHP Recalculation Complete",
    body: "500 student records synchronized with DepEd DO 8, s. 2015 weighted scoring metrics.",
    message: "500 student records synchronized with DepEd DO 8, s. 2015 weighted scoring metrics.",
    time: "2 hrs ago",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    created_at: "2 hrs ago",
    read: true,
    is_read: true,
    priority: "low",
    targetRole: "all",
    audience: "all"
  },
  {
    id: "notif-005",
    type: "parent",
    title: "Parent Digital Form 138 Acknowledged",
    body: "Parent of Mark Kenneth Bautista signed Q1 digital report card.",
    message: "Parent of Mark Kenneth Bautista signed Q1 digital report card.",
    time: "Yesterday",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    created_at: "Yesterday",
    read: true,
    is_read: true,
    priority: "low",
    targetRole: "teacher",
    audience: "teacher"
  }
];

export function getActiveNotifications(role?: string): AppNotification[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!role || role === "all") return parsed;
          return parsed.filter(n => !n.targetRole || n.targetRole === "all" || n.targetRole === role || n.audience === "all" || n.audience === role);
        }
      }
    } catch {
      // fallback
    }
  }
  if (!role || role === "all") return DEFAULT_NOTIFICATIONS;
  return DEFAULT_NOTIFICATIONS.filter(n => !n.targetRole || n.targetRole === "all" || n.targetRole === role || n.audience === "all" || n.audience === role);
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
  const current = getActiveNotifications();
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
  const current = getActiveNotifications();
  const updated = current.map(n => n.id === id ? { ...n, read: true, is_read: true } : n);
  saveActiveNotifications(updated);
}

export function markAllNotificationsRead(role?: string): void {
  const current = getActiveNotifications();
  const updated = current.map(n => {
    if (!role || role === "all" || !n.targetRole || n.targetRole === "all" || n.targetRole === role) {
      return { ...n, read: true, is_read: true };
    }
    return n;
  });
  saveActiveNotifications(updated);
}

export function deleteAppNotification(id: string): void {
  const current = getActiveNotifications();
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
    student_name: "Joshua Dimaculangan",
    lrn: "109238475001",
    section: "Grade 11 - St. Augustine (STEM)",
    referring_teacher: "Mr. Roberto Santos, LPT (Class Adviser)",
    concern_type: "Academic Helplessness & Exam Panic",
    urgency: "priority",
    observations: "Student exhibits visible trembling before math quizzes and has missed 2 problem set submissions.",
    attempted_interventions: ["1-on-1 recitation debrief", "Extended submission window for quiz #2"],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "pending_review"
  },
  {
    id: "REF-002",
    student_id: 7,
    student_name: "Christian Dave Villanueva",
    lrn: "109238475007",
    section: "Grade 11 - St. Augustine (STEM)",
    referring_teacher: "Engr. Paul Valdez (Chemistry Teacher)",
    concern_type: "Working Student Fatigue & Missed Lab Tasks",
    urgency: "routine",
    observations: "Falls asleep during morning lecture sessions due to evening BPO shifts. Needs schedule counseling.",
    attempted_interventions: ["Modified lab group partner assignment"],
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
    lrn: "109238475000",
    section: "Grade 11 - STEM",
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
    student_name: "Joshua Dimaculangan",
    time: "02:00 PM - 02:45 PM",
    date: "Today",
    type: "Academic Anxiety Counseling",
    status: "Confirmed",
    room: "Room 204 Guidance Center",
    notes: "Follow up on GAD-7 anxiety triggers and Pre-Calculus tutoring match."
  },
  {
    id: "SES-102",
    student_id: 4,
    student_name: "Samantha Nicole Reyes",
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
    student_name: "Angelica Dela Cruz",
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
