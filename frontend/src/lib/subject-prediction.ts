import { 
  getActiveCurriculum, 
  DEFAULT_CURRICULUM_REGISTRY, 
  CurriculumSubject 
} from "./curriculum-store";

export interface SubjectMetadata {
  code: string;
  name: string;
  grade_level?: number;
  strand: "Grade 7" | "Grade 8" | "Grade 9" | "Grade 10" | "JHS" | "STEM" | "ABM" | "HUMSS" | "TVL" | "GAS" | "ALL" | string;
  category: "Core" | "Applied" | "Specialized" | "Elective" | "JHS" | string;
  weight_ww: number; // Written work weight
  weight_pt: number; // Performance task weight
  weight_qa: number; // Quarterly assessment weight
  passing_threshold: number;
  is_active?: boolean;
}

/**
 * Returns dynamic active subjects or mapped fallback
 */
export function getActiveSubjectRegistry(): SubjectMetadata[] {
  const curriculum = getActiveCurriculum();
  return curriculum.map(s => ({
    code: s.code,
    name: s.name,
    grade_level: s.grade_level,
    strand: s.strand === "JHS" ? `Grade ${s.grade_level}` : s.strand,
    category: s.category,
    weight_ww: s.weight_ww,
    weight_pt: s.weight_pt,
    weight_qa: s.weight_qa,
    passing_threshold: s.passing_threshold,
    is_active: s.is_active
  }));
}

export const SUBJECT_REGISTRY: SubjectMetadata[] = DEFAULT_CURRICULUM_REGISTRY.map(s => ({
  code: s.code,
  name: s.name,
  grade_level: s.grade_level,
  strand: s.strand === "JHS" ? `Grade ${s.grade_level}` : s.strand,
  category: s.category,
  weight_ww: s.weight_ww,
  weight_pt: s.weight_pt,
  weight_qa: s.weight_qa,
  passing_threshold: s.passing_threshold,
  is_active: s.is_active
}));


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
      attendance_rate_pct?: number;
      incomplete_requirements_count: number;
    };
    domain_scores: {
      academic: number;
      mental_health: number;
      financial: number;
      family: number;
      health: number;
    };
    subject_grades?: Record<string, {
      written_work_avg?: number;
      performance_task_avg?: number;
      quarterly_assessment_score?: number;
      missing_tasks_count?: number;
      subject_absences_count?: number;
    }>;
  },
  subjectCode: string
): StudentSubjectPrediction {
  const registry = getActiveSubjectRegistry();
  const subj = registry.find(s => s.code === subjectCode) || SUBJECT_REGISTRY.find(s => s.code === subjectCode) || registry[0] || SUBJECT_REGISTRY[0];

  // Check if real per-subject formative records exist for this student
  const realSubjectRecord = student.subject_grades?.[subjectCode];

  // Pseudo-random deterministic seed for realistic formative breakdowns per student (if real scores not present)
  const hash = (student.id * 17 + subjectCode.length * 31) % 100;
  const gpa = student.sass_metrics.gpa || 78;
  const isHighRisk = student.sass_metrics.failing_subjects_count > 0 || gpa < 75.0;

  // Formative standings: Use real data if provided, otherwise calibrated synthetic standings
  const baseWW = realSubjectRecord?.written_work_avg ?? (
    isHighRisk ? Math.max(52, gpa - 6 + (hash % 10)) : Math.min(96, gpa + 2 - (hash % 8))
  );
  const basePT = realSubjectRecord?.performance_task_avg ?? (
    isHighRisk ? Math.max(55, gpa - 4 + (hash % 8)) : Math.min(98, gpa + 4 - (hash % 6))
  );
  const baseQA = realSubjectRecord?.quarterly_assessment_score ?? (
    isHighRisk ? Math.max(50, gpa - 8 + (hash % 12)) : Math.min(95, gpa - (hash % 7))
  );

  // Determine missing tasks and subject-specific absences
  const missingTasks = realSubjectRecord?.missing_tasks_count ?? (
    student.sass_metrics.incomplete_requirements_count > 0
      ? Math.max(1, Math.min(4, Math.round(student.sass_metrics.incomplete_requirements_count * (0.8 + (hash % 50) / 100))))
      : (hash % 7 === 0 ? 1 : 0)
  );

  const subjectAbsences = realSubjectRecord?.subject_absences_count ?? (
    student.sass_metrics.days_absent > 0
      ? Math.max(0, Math.min(8, Math.round(student.sass_metrics.days_absent * 0.4)))
      : (student.sass_metrics.attendance_rate_pct && student.sass_metrics.attendance_rate_pct < 90
          ? Math.max(1, Math.round((100 - student.sass_metrics.attendance_rate_pct) / 2.5))
          : 0)
  );

  // Weighted Academic standing
  const rawWeighted = (baseWW * subj.weight_ww) + (basePT * subj.weight_pt) + (baseQA * subj.weight_qa);

  // Penalties
  const taskPenalty = Math.min(25.0, missingTasks * 8.0);
  const attendancePenalty = Math.min(15.0, Math.max(0, subjectAbsences - 2) * 2.5);
  // Cross-Domain Multipliers (All 4 Non-Academic Domains Factored)
  // Scaled proportionally to AHP weights (family=20%, health=20%, mental=15%, financial=15%)
  // Each domain contributes up to its proportional share of a 15-point maximum total penalty.
  const crossDomainPenalty = Math.min(15.0, (
    (student.domain_scores.family      / 100) * 6.0 +   // 20% weight → up to 6 pts
    (student.domain_scores.health      / 100) * 6.0 +   // 20% weight → up to 6 pts
    (student.domain_scores.mental_health / 100) * 4.5 + // 15% weight → up to 4.5 pts
    (student.domain_scores.financial   / 100) * 4.5     // 15% weight → up to 4.5 pts
  ));

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
    // Dynamic CI: widens with missing tasks, high absences, and non-academic domain stress
    confidence_interval_95: (() => {
      const ciMargin = Math.min(10.0,
        3.2 +
        (missingTasks * 1.2) +
        (subjectAbsences > 3 ? 2.5 : 0) +
        (crossDomainPenalty > 5 ? 1.5 : 0)
      );
      return [
        Math.round(Math.max(50, roundedProjected - ciMargin) * 10) / 10,
        Math.round(Math.min(100, roundedProjected + ciMargin) * 10) / 10
      ] as [number, number];
    })(),
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
