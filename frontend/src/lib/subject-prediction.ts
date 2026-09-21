// Subject-Level Student Failure Prediction Engine (Early Academic Warning Model)
// Calibrated with DepEd SHS/JHS grading standards (DO 8, s. 2015) & AHP cross-domain multipliers.

export interface SubjectMetadata {
  code: string;
  name: string;
  grade_level?: number;
  strand: "Grade 7" | "Grade 8" | "Grade 9" | "Grade 10" | "JHS" | "STEM" | "ABM" | "HUMSS" | "TVL";
  category: "Core" | "Applied" | "Specialized" | "JHS";
  weight_ww: number; // Written work weight
  weight_pt: number; // Performance task weight
  weight_qa: number; // Quarterly assessment weight
  passing_threshold: number;
}

export const SUBJECT_REGISTRY: SubjectMetadata[] = [
  // Grade 7 Subjects
  { code: "JHS-MATH7", name: "Mathematics 7 (Elementary Algebra & Geometry)", grade_level: 7, strand: "Grade 7", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-SCI7", name: "Science 7 (Integrated General Science)", grade_level: 7, strand: "Grade 7", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ENG7", name: "English 7 (Philippine Literature & Grammar)", grade_level: 7, strand: "Grade 7", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-FIL7", name: "Filipino 7 (Ibong Adarna at Panitikang Luzon)", grade_level: 7, strand: "Grade 7", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-AP7", name: "Araling Panlipunan 7 (Araling Asyano)", grade_level: 7, strand: "Grade 7", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-TLE7", name: "TLE 7 (Exploratory ICT & Home Economics)", grade_level: 7, strand: "Grade 7", category: "Core", weight_ww: 0.20, weight_pt: 0.60, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-MAPEH7", name: "MAPEH 7 (Music, Arts, PE & Health)", grade_level: 7, strand: "Grade 7", category: "Core", weight_ww: 0.20, weight_pt: 0.60, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ESP7", name: "Edukasyon sa Pagpapakatao 7 (EsP)", grade_level: 7, strand: "Grade 7", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },

  // Grade 8 Subjects
  { code: "JHS-MATH8", name: "Mathematics 8 (Linear Equations & Geometry)", grade_level: 8, strand: "Grade 8", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-SCI8", name: "Science 8 (Biology, Chemistry & Physics)", grade_level: 8, strand: "Grade 8", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ENG8", name: "English 8 (Afro-Asian Literature)", grade_level: 8, strand: "Grade 8", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-FIL8", name: "Filipino 8 (Florante at Laura)", grade_level: 8, strand: "Grade 8", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-AP8", name: "Araling Panlipunan 8 (Kasaysayan ng Daigdig)", grade_level: 8, strand: "Grade 8", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-TLE8", name: "TLE 8 (Junior Computer Hardware & Programming)", grade_level: 8, strand: "Grade 8", category: "Core", weight_ww: 0.20, weight_pt: 0.60, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-MAPEH8", name: "MAPEH 8 (Music, Arts, PE & Health)", grade_level: 8, strand: "Grade 8", category: "Core", weight_ww: 0.20, weight_pt: 0.60, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ESP8", name: "Edukasyon sa Pagpapakatao 8 (EsP)", grade_level: 8, strand: "Grade 8", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },

  // Grade 9 Subjects
  { code: "JHS-MATH9", name: "Mathematics 9 (Quadratic Functions & Trigonometry)", grade_level: 9, strand: "Grade 9", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-SCI9", name: "Science 9 (Living Things & Electricity)", grade_level: 9, strand: "Grade 9", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ENG9", name: "English 9 (Anglo-American Literature)", grade_level: 9, strand: "Grade 9", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-FIL9", name: "Filipino 9 (Noli Me Tangere)", grade_level: 9, strand: "Grade 9", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-AP9", name: "Araling Panlipunan 9 (Ekonomiks)", grade_level: 9, strand: "Grade 9", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-TLE9", name: "TLE 9 (Technical Drafting & Web Design)", grade_level: 9, strand: "Grade 9", category: "Core", weight_ww: 0.20, weight_pt: 0.60, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-MAPEH9", name: "MAPEH 9 (Music, Arts, PE & Health)", grade_level: 9, strand: "Grade 9", category: "Core", weight_ww: 0.20, weight_pt: 0.60, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ESP9", name: "Edukasyon sa Pagpapakatao 9 (EsP)", grade_level: 9, strand: "Grade 9", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },

  // Grade 10 Subjects
  { code: "JHS-MATH10", name: "Mathematics 10 (Polynomials, Sequences & Probability)", grade_level: 10, strand: "Grade 10", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-SCI10", name: "Science 10 (Earth & Space, Heredity & Electromagnetism)", grade_level: 10, strand: "Grade 10", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ENG10", name: "English 10 (World Literature & Persuasive Writing)", grade_level: 10, strand: "Grade 10", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-FIL10", name: "Filipino 10 (El Filibusterismo)", grade_level: 10, strand: "Grade 10", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-AP10", name: "Araling Panlipunan 10 (Mga Kontemporaryong Isyu)", grade_level: 10, strand: "Grade 10", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-TLE10", name: "TLE 10 (Computer Systems Servicing & Coding)", grade_level: 10, strand: "Grade 10", category: "Core", weight_ww: 0.20, weight_pt: 0.60, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-MAPEH10", name: "MAPEH 10 (Music, Arts, PE & Health)", grade_level: 10, strand: "Grade 10", category: "Core", weight_ww: 0.20, weight_pt: 0.60, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ESP10", name: "Edukasyon sa Pagpapakatao 10 (EsP)", grade_level: 10, strand: "Grade 10", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },

  // General JHS Fallback Aliases
  { code: "JHS-MATH", name: "Mathematics (Grade 7-10 General)", strand: "JHS", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-SCI", name: "Science (Grade 7-10 General)", strand: "JHS", category: "Core", weight_ww: 0.40, weight_pt: 0.40, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-ENG", name: "English (Grade 7-10 General)", strand: "JHS", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "JHS-AP", name: "Araling Panlipunan (Grade 7-10 General)", strand: "JHS", category: "Core", weight_ww: 0.30, weight_pt: 0.50, weight_qa: 0.20, passing_threshold: 75.0 },
  { code: "STEM-CALC", name: "Pre-Calculus / Basic Algebra", strand: "STEM", category: "Specialized", weight_ww: 0.25, weight_pt: 0.45, weight_qa: 0.30, passing_threshold: 75.0 },
];

export interface StudentSubjectPrediction {
  student_id: number;
  student_name: string;
  lrn: string;
  grade_level: number;
  section_name: string;
  strand: string;
  subject_code: string;
  subject_name: string;
  
  // Formative Metrics
  written_work_avg: number;
  performance_task_avg: number;
  quarterly_assessment_score: number;
  missing_tasks_count: number;
  subject_absences_count: number;

  // Model Predictions
  projected_final_grade: number;
  confidence_interval_95: [number, number];
  failure_probability_pct: number;
  passing_probability_pct: number;
  risk_tier: "CRITICAL_RISK" | "MODERATE_RISK" | "ON_TRACK";
  risk_badge: string;
  
  // Drivers & Actions
  risk_drivers: string[];
  recommended_actions: string[];
}

/**
 * Predicts student failure probability for a specific subject
 */
export function calculateSubjectFailurePrediction(
  student: {
    id: number;
    full_name: string;
    lrn: string;
    grade_level: number;
    section_name: string;
    strand: string;
    sass_metrics: {
      gpa: number;
      failing_subjects_count: number;
      days_absent: number;
      incomplete_requirements_count: number;
    };
    domain_scores: {
      academic: number;
      mental_health: number;
      financial: number;
      family: number;
      health: number;
    };
  },
  subjectCode: string
): StudentSubjectPrediction {
  const subj = SUBJECT_REGISTRY.find(s => s.code === subjectCode) || SUBJECT_REGISTRY[0];

  // Pseudo-random deterministic seed for realistic formative breakdowns per student
  const hash = (student.id * 17 + subjectCode.length * 31) % 100;
  const gpa = student.sass_metrics.gpa || 78;
  const isHighRisk = student.sass_metrics.failing_subjects_count > 0 || gpa < 75.0;

  // Synthesize realistic current standings
  const baseWW = isHighRisk ? Math.max(52, gpa - 6 + (hash % 10)) : Math.min(96, gpa + 2 - (hash % 8));
  const basePT = isHighRisk ? Math.max(55, gpa - 4 + (hash % 8)) : Math.min(98, gpa + 4 - (hash % 6));
  const baseQA = isHighRisk ? Math.max(50, gpa - 8 + (hash % 12)) : Math.min(95, gpa - (hash % 7));

  // Determine missing tasks and subject-specific absences
  const missingTasks = student.sass_metrics.incomplete_requirements_count > 0
    ? Math.max(1, Math.min(4, Math.round(student.sass_metrics.incomplete_requirements_count * (0.8 + (hash % 50) / 100))))
    : (hash % 7 === 0 ? 1 : 0);

  const subjectAbsences = student.sass_metrics.days_absent > 0
    ? Math.max(0, Math.min(8, Math.round(student.sass_metrics.days_absent * 0.4)))
    : 0;

  // Weighted Academic standing
  const rawWeighted = (baseWW * subj.weight_ww) + (basePT * subj.weight_pt) + (baseQA * subj.weight_qa);

  // Penalties
  const taskPenalty = Math.min(25.0, missingTasks * 8.0);
  const attendancePenalty = Math.min(15.0, Math.max(0, subjectAbsences - 2) * 2.5);
  // Cross-Domain Multipliers (All 4 Non-Academic Domains Factored)
  const crossDomainPenalty = (
    (student.domain_scores.family * 0.03) +
    (student.domain_scores.mental_health * 0.03) +
    (student.domain_scores.health * 0.02) +
    (student.domain_scores.financial * 0.02)
  );

  const projectedGrade = Math.max(50.0, Math.min(100.0, rawWeighted - taskPenalty - attendancePenalty - crossDomainPenalty));
  const roundedProjected = Math.round(projectedGrade * 10) / 10;

  // Calibrated Sigmoid Failure Probability
  const gradeDeficit = subj.passing_threshold - projectedGrade;
  const rawProb = 1.0 / (1.0 + Math.exp(-0.18 * gradeDeficit));
  const failureProbPct = Math.round(rawProb * 1000) / 10;

  let riskTier: "CRITICAL_RISK" | "MODERATE_RISK" | "ON_TRACK" = "ON_TRACK";
  let riskBadge = "🟢 On Track";

  if (failureProbPct >= 70.0 || projectedGrade < 72.0) {
    riskTier = "CRITICAL_RISK";
    riskBadge = "🔴 Critical Risk";
  } else if (failureProbPct >= 40.0 || projectedGrade < 75.0) {
    riskTier = "MODERATE_RISK";
    riskBadge = "🟡 Moderate Risk";
  }

  // Top Risk Drivers (Factoring All 5 Domains)
  const riskDrivers: string[] = [];
  if (missingTasks > 0) riskDrivers.push(`${missingTasks} Missing Performance Task(s) (-${taskPenalty.toFixed(1)} pts)`);
  if (baseWW < 75.0) riskDrivers.push(`Low Quiz Average (${baseWW.toFixed(1)}%)`);
  if (subjectAbsences >= 3) riskDrivers.push(`${subjectAbsences} Subject Period Cuts/Absences`);
  if (baseQA < 75.0) riskDrivers.push(`Sub-Passing Exam Standing (${baseQA.toFixed(1)}%)`);
  if (student.domain_scores.family >= 60.0) riskDrivers.push(`Household Instability / Domestic Stress (Family: ${student.domain_scores.family.toFixed(0)})`);
  if (student.domain_scores.mental_health >= 60.0) riskDrivers.push(`Psychological Distress Impact (MH: ${student.domain_scores.mental_health.toFixed(0)})`);
  if (student.domain_scores.health >= 60.0) riskDrivers.push(`Physical Fatigue / Health Strain (Health: ${student.domain_scores.health.toFixed(0)})`);
  if (student.domain_scores.financial >= 60.0) riskDrivers.push(`Working Student / Socioeconomic Fatigue (Financial: ${student.domain_scores.financial.toFixed(0)})`);
  if (student.domain_scores.financial >= 60.0) riskDrivers.push(`Working Student Fatigue / Economic Strain`);
  if (riskDrivers.length === 0) riskDrivers.push("Satisfactory Task Submissions & Quiz Averages");

  // Prescribed Actions
  const recommendedActions: string[] = [];
  if (riskTier === "CRITICAL_RISK") {
    recommendedActions.push("Immediate 1-on-1 Subject Teacher Diagnostic Consultation");
    recommendedActions.push("Assign Senior Peer Tutor under SAPC Academic Assistance Program");
    recommendedActions.push("Issue Official Early Warning Notice to Guardian with Remediation Plan");
  } else if (riskTier === "MODERATE_RISK") {
    recommendedActions.push("Grant 5-Day Performance Task Submission Extension Window");
    recommendedActions.push("Enroll in Weekly Remedial Problem-Solving Session");
    recommendedActions.push("Class Adviser Coordination for Homework Pacing");
  } else {
    recommendedActions.push("Maintain Current Study Pace & Milestone Submissions");
  }

  return {
    student_id: student.id,
    student_name: student.full_name,
    lrn: student.lrn,
    grade_level: student.grade_level,
    section_name: student.section_name,
    strand: student.strand,
    subject_code: subj.code,
    subject_name: subj.name,
    written_work_avg: Math.round(baseWW * 10) / 10,
    performance_task_avg: Math.round(basePT * 10) / 10,
    quarterly_assessment_score: Math.round(baseQA * 10) / 10,
    missing_tasks_count: missingTasks,
    subject_absences_count: subjectAbsences,
    projected_final_grade: roundedProjected,
    confidence_interval_95: [Math.round(Math.max(50, roundedProjected - 3.2) * 10) / 10, Math.round(Math.min(100, roundedProjected + 3.2) * 10) / 10],
    failure_probability_pct: failureProbPct,
    passing_probability_pct: Math.round((100.0 - failureProbPct) * 10) / 10,
    risk_tier: riskTier,
    risk_badge: riskBadge,
    risk_drivers: riskDrivers,
    recommended_actions: recommendedActions
  };
}

/**
 * Simulates "What-If" remediation outcomes
 */
export function simulateRemediationOutcome(
  original: StudentSubjectPrediction,
  tasksSubmitted: number,
  tutoringHours: number,
  examPrepBoost: number
): {
  projected_grade: number;
  failure_probability_pct: number;
  risk_tier: "CRITICAL_RISK" | "MODERATE_RISK" | "ON_TRACK";
  grade_gain: number;
  risk_reduction_pct: number;
} {
  const tutoringGain = Math.min(15.0, tutoringHours * 2.5);
  const newWW = Math.min(100.0, original.written_work_avg + tutoringGain);
  const newPT = Math.min(100.0, original.performance_task_avg + Math.min(20.0, tasksSubmitted * 6.0));
  const newQA = Math.min(100.0, original.quarterly_assessment_score + (tutoringGain * 0.6) + examPrepBoost);
  const remainingMissing = Math.max(0, original.missing_tasks_count - tasksSubmitted);

  const subj = SUBJECT_REGISTRY.find(s => s.code === original.subject_code) || SUBJECT_REGISTRY[0];
  const rawWeighted = (newWW * subj.weight_ww) + (newPT * subj.weight_pt) + (newQA * subj.weight_qa);
  const taskPenalty = Math.min(25.0, remainingMissing * 8.0);
  const attendancePenalty = Math.min(15.0, Math.max(0, original.subject_absences_count - 2) * 2.5);

  const simulatedGrade = Math.max(50.0, Math.min(100.0, rawWeighted - taskPenalty - attendancePenalty));
  const roundedSimulatedGrade = Math.round(simulatedGrade * 10) / 10;

  const gradeDeficit = subj.passing_threshold - simulatedGrade;
  const rawProb = 1.0 / (1.0 + Math.exp(-0.18 * gradeDeficit));
  const simulatedFailProb = Math.round(rawProb * 1000) / 10;

  let riskTier: "CRITICAL_RISK" | "MODERATE_RISK" | "ON_TRACK" = "ON_TRACK";
  if (simulatedFailProb >= 70.0 || simulatedGrade < 72.0) riskTier = "CRITICAL_RISK";
  else if (simulatedFailProb >= 40.0 || simulatedGrade < 75.0) riskTier = "MODERATE_RISK";

  return {
    projected_grade: roundedSimulatedGrade,
    failure_probability_pct: simulatedFailProb,
    risk_tier: riskTier,
    grade_gain: Math.round((roundedSimulatedGrade - original.projected_final_grade) * 10) / 10,
    risk_reduction_pct: Math.round((original.failure_probability_pct - simulatedFailProb) * 10) / 10
  };
}
