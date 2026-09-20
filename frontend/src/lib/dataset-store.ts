import { SAPC_500_STUDENTS, StudentRecord } from "@/data/students500";

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

export const DEFAULT_RISK_WEIGHTS: RiskWeightsConfig = {
  academic: 30.0,
  family: 20.0,
  health: 20.0,
  mental: 15.0,
  financial: 15.0
};

const STORAGE_KEY = "sapc_custom_student_data";
const WEIGHTS_KEY = "sapc_custom_risk_weights";

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
      console.warn("Could not load custom student dataset, falling back to baseline:", e);
    }
  }
  return SAPC_500_STUDENTS;
}

export function saveStudentDataset(students: StudentRecord[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      window.dispatchEvent(new CustomEvent("sapc:dataset-updated", { detail: { count: students.length } }));
    } catch (e) {
      console.error("Failed to persist updated student dataset:", e);
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

export function importFullCohortCSV(csvText: string): { success: boolean; count: number; error?: string } {
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
      // Simple regex CSV parser for quoted and unquoted cells
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
    saveStudentDataset(updatedList);

    return { success: true, count: updatedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || "Failed to parse CSV" };
  }
}
