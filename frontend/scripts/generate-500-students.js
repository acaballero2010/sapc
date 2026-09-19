const fs = require('fs');
const path = require('path');

const firstNamesMale = [
  "Joshua", "Mark Kenneth", "John Carlo", "Christian Dave", "Daniel", "Justin", "Kyle", "Jerome",
  "Ralph", "Gabriel", "Angelo", "Sean", "Miguel", "Ethan", "Nathan", "Paolo", "Vincent", "Rafael",
  "Alexander", "Adrian", "Francis", "Dominic", "Matthew", "Lucas", "Aaron", "Lance", "Karl", "Cedric"
];

const firstNamesFemale = [
  "Angelica", "Samantha Nicole", "Bea Patricia", "Princess Mae", "Althea", "Nicole", "Sofia",
  "Hannah", "Jasmine", "Patricia", "Andrea", "Chloe", "Danielle", "Mariel", "Erika", "Kathleen",
  "Alyssa", "Bianca", "Camille", "Denise", "Kristine", "Rochelle", "Shaina", "Vanessa", "Trisha"
];

const lastNames = [
  "Santos", "Dela Cruz", "Bautista", "Reyes", "Mendoza", "Ramos", "Villanueva", "Alcantara",
  "Garcia", "Lim", "Dizon", "Aquino", "Tan", "Castillo", "Navarro", "Flores", "Gonzales",
  "Pascual", "Soriano", "Salazar", "Torres", "Tolentino", "Valdez", "Rivera", "Castro",
  "Mercado", "Domingo", "Ocampo", "Padilla", "De Leon", "Corpuz", "Manalo", "San Jose", "Santiago"
];

const sections = [
  { name: "Grade 11 - St. Augustine (STEM)", adviser: "Mr. Roberto Santos, LPT", grade: 11, strand: "STEM" },
  { name: "Grade 11 - St. Lorenzo (HUMSS)", adviser: "Mr. Carlos Dizon, LPT", grade: 11, strand: "HUMSS" },
  { name: "Grade 11 - St. Clare (ABM)", adviser: "Ms. Jennifer Lim, LPT", grade: 11, strand: "ABM" },
  { name: "Grade 11 - St. Pedro Calungsod (TVL-ICT)", adviser: "Mr. Dennis Ramos, LPT", grade: 11, strand: "TVL" },
  { name: "Grade 12 - St. Thomas Aquinas (STEM)", adviser: "Engr. Maria Theresa Cruz, LPT", grade: 12, strand: "STEM" },
  { name: "Grade 12 - St. Teresa of Avila (HUMSS)", adviser: "Mrs. Rowena Castillo, LPT", grade: 12, strand: "HUMSS" },
  { name: "Grade 12 - St. Jude (ABM)", adviser: "Mr. Ferdinand Navarro, LPT", grade: 12, strand: "ABM" },
  { name: "Grade 12 - St. Vincent (TVL-HE)", adviser: "Ms. Carmina Flores, LPT", grade: 12, strand: "TVL" },
  { name: "Grade 10 - St. Francis", adviser: "Mr. Allan Mercado, LPT", grade: 10, strand: "JHS" },
  { name: "Grade 9 - St. Benedict", adviser: "Mrs. Evelyn Tolentino, LPT", grade: 9, strand: "JHS" },
  { name: "Grade 8 - St. Dominic", adviser: "Mr. Joel Salazar, LPT", grade: 8, strand: "JHS" },
  { name: "Grade 7 - St. Ignatius", adviser: "Ms. Rochelle Valdez, LPT", grade: 7, strand: "JHS" }
];

// AHP Criteria Weights (Calibrated for SAPC)
// Academic: 0.35, Mental Health: 0.25, Financial: 0.15, Family: 0.15, Health: 0.10
const AHP_WEIGHTS = {
  academic: 0.35,
  mental_health: 0.25,
  financial: 0.15,
  family: 0.15,
  health: 0.10
};

// Seeded pseudorandom generator for deterministic results
let seed = 42;
function pseudoRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomChoice(arr) {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

function randomRange(min, max, decimals = 1) {
  const val = min + pseudoRandom() * (max - min);
  return parseFloat(val.toFixed(decimals));
}

const students = [];

for (let i = 1; i <= 500; i++) {
  const isMale = pseudoRandom() > 0.5;
  const firstName = isMale ? randomChoice(firstNamesMale) : randomChoice(firstNamesFemale);
  const lastName = randomChoice(lastNames);
  const lrn = `10923847${String(5000 + i).padStart(4, '0')}`;
  const sec = sections[(i - 1) % sections.length];
  
  // Create natural risk archetype distributions:
  // ~12% High Risk (60 students), ~28% Medium Risk (140 students), ~60% Low Risk (300 students)
  const roll = pseudoRandom();
  let academicScore, mentalScore, financialScore, familyScore, healthScore;
  let primaryDriver = "General Academic Stability";

  if (roll < 0.12) {
    // High Risk Archetype (60–95)
    academicScore = randomRange(65, 92);
    mentalScore = randomRange(60, 95);
    financialScore = randomRange(35, 90);
    familyScore = randomRange(40, 88);
    healthScore = randomRange(25, 75);

    const drivers = [
      "Mental Health & Academic Deficits",
      "Family Crisis & Frequent Absenteeism",
      "Financial Strain & Overdue Balances",
      "Academic Deterioration (Failing Marks)",
      "Severe Anxiety & Helplessness Signals"
    ];
    primaryDriver = randomChoice(drivers);
  } else if (roll < 0.40) {
    // Medium Risk Archetype (40–59.9)
    academicScore = randomRange(40, 68);
    mentalScore = randomRange(35, 65);
    financialScore = randomRange(25, 70);
    familyScore = randomRange(20, 60);
    healthScore = randomRange(15, 55);

    const drivers = [
      "SASS Subject Remediation Required",
      "Intermittent Class Absences",
      "Tuition Installment Delay",
      "Peer & Social Adjustment Needs",
      "Physical Health / Migraine Flare-ups"
    ];
    primaryDriver = randomChoice(drivers);
  } else {
    // Low Risk / Thriving Archetype (5–39.9)
    academicScore = randomRange(8, 35);
    mentalScore = randomRange(5, 30);
    financialScore = randomRange(5, 28);
    familyScore = randomRange(5, 25);
    healthScore = randomRange(5, 22);

    const drivers = [
      "Academic Honors Track",
      "Exemplary Class Attendance",
      "High Family Support Index",
      "General Wellness Stability",
      "Active Student Leadership"
    ];
    primaryDriver = randomChoice(drivers);
  }

  // Calculate AHP Composite Risk Score
  const compositeScore = parseFloat((
    academicScore * AHP_WEIGHTS.academic +
    mentalScore * AHP_WEIGHTS.mental_health +
    financialScore * AHP_WEIGHTS.financial +
    familyScore * AHP_WEIGHTS.family +
    healthScore * AHP_WEIGHTS.health
  ).toFixed(1));

  let riskTier = "low";
  if (compositeScore >= 65.0) riskTier = "high";
  else if (compositeScore >= 40.0) riskTier = "medium";

  // Derive realistic SASS quarterly metrics
  // High academic risk -> GPA 68-74, failing 1-3, absences 5-14
  // Low academic risk -> GPA 85-96, failing 0, absences 0-2
  const gpa = parseFloat((100 - (academicScore * 0.35) - randomRange(0, 5)).toFixed(1));
  const failingCount = compositeScore >= 70 ? Math.floor(randomRange(1, 4, 0)) : (compositeScore >= 50 && pseudoRandom() > 0.6 ? 1 : 0);
  const absences = compositeScore >= 70 ? Math.floor(randomRange(6, 15, 0)) : Math.floor(randomRange(0, 5, 0));
  const incompleteReqs = compositeScore >= 60 ? Math.floor(randomRange(1, 3, 0)) : 0;

  students.push({
    id: i,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    lrn,
    grade_level: sec.grade,
    strand: sec.strand,
    section_name: sec.name,
    adviser_name: sec.adviser,
    email: `${firstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}${i}@sapc.edu.ph`,
    latest_risk_score: compositeScore,
    latest_risk_tier: riskTier,
    primary_risk_driver: primaryDriver,
    domain_scores: {
      academic: academicScore,
      mental_health: mentalScore,
      financial: financialScore,
      family: familyScore,
      health: healthScore
    },
    sass_metrics: {
      gpa,
      failing_subjects_count: failingCount,
      days_absent: absences,
      incomplete_requirements_count: incompleteReqs
    }
  });
}

// 1. Output TypeScript Module
const tsContent = `// Auto-generated 500 SAPC Student Cohort Dataset with AHP 5-Domain Multi-Factor Risk
export interface StudentRecord {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  lrn: string;
  grade_level: number;
  strand: string;
  section_name: string;
  adviser_name: string;
  email: string;
  latest_risk_score: number;
  latest_risk_tier: "high" | "medium" | "low";
  primary_risk_driver: string;
  domain_scores: {
    academic: number;
    mental_health: number;
    financial: number;
    family: number;
    health: number;
  };
  sass_metrics: {
    gpa: number;
    failing_subjects_count: number;
    days_absent: number;
    incomplete_requirements_count: number;
  };
}

export const SAPC_500_STUDENTS: StudentRecord[] = ${JSON.stringify(students, null, 2)};

export const SAPC_COHORT_SUMMARY = {
  total_students: 500,
  high_risk_count: ${students.filter(s => s.latest_risk_tier === 'high').length},
  medium_risk_count: ${students.filter(s => s.latest_risk_tier === 'medium').length},
  low_risk_count: ${students.filter(s => s.latest_risk_tier === 'low').length},
  average_composite_score: ${(students.reduce((a, b) => a + b.latest_risk_score, 0) / 500).toFixed(1)}
};
`;

// 2. Output SASS CSV File for Ingestion
let csvContent = "student_id,student_name,grade_level,section,quarter_gpa,failing_subjects_count,days_absent,incomplete_requirements_count\n";
students.forEach(s => {
  csvContent += `${s.lrn},"${s.full_name}",Grade ${s.grade_level},"${s.section_name}",${s.sass_metrics.gpa},${s.sass_metrics.failing_subjects_count},${s.sass_metrics.days_absent},${s.sass_metrics.incomplete_requirements_count}\n`;
});

// Ensure directories exist
fs.mkdirSync(path.join(__dirname, '../src/data'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '../public/samples'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '../../backend/samples'), { recursive: true });

// Write files
fs.writeFileSync(path.join(__dirname, '../src/data/students500.ts'), tsContent, 'utf-8');
fs.writeFileSync(path.join(__dirname, '../public/samples/sapc_500_students_sass_cohort.csv'), csvContent, 'utf-8');
fs.writeFileSync(path.join(__dirname, '../../backend/samples/sample_500_students_5domains.csv'), csvContent, 'utf-8');
fs.writeFileSync(path.join(__dirname, '../../backend/samples/sample_500_students_complete.json'), JSON.stringify(students, null, 2), 'utf-8');

console.log('Successfully generated 500-student dataset across TypeScript, CSV, and JSON formats.');
console.log(`High Risk: ${students.filter(s => s.latest_risk_tier === 'high').length}, Medium: ${students.filter(s => s.latest_risk_tier === 'medium').length}, Low: ${students.filter(s => s.latest_risk_tier === 'low').length}`);
