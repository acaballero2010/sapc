const fs = require('fs');
const path = require('path');

// Read the 500 students to ensure 100% sync
const studentsTs = fs.readFileSync(path.join(__dirname, '../src/data/students500.ts'), 'utf-8');
const match = studentsTs.match(/export const SAPC_500_STUDENTS: StudentRecord\[\] = (\[[\s\S]*?\]);/);

if (!match) {
  console.error("Could not parse SAPC_500_STUDENTS from students500.ts");
  process.exit(1);
}

const students = JSON.parse(match[1]);

// Deterministic Pseudo-Random
let seed = 888;
function pseudoRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomChoice(arr) {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

const stressTriggersHigh = [
  "Exam & Academic Performance Anxiety",
  "Severe Family Conflict & Parental Separation",
  "Financial Insecurity & Tuition Delay Panic",
  "Sleep Deprivation & Remediation Burnout",
  "Fear of Academic Failure & Retaining Grade"
];

const stressTriggersModerate = [
  "Midterm Project Deadlines",
  "Math Anxiety & Difficult Subject Fatigue",
  "Peer Relationship & Social Adjustment Strain",
  "Time Management Between Chores and Studies",
  "Parental High Expectation Pressure"
];

const somaticHigh = [
  "Panic Episodes & Hyperventilation",
  "Emotional Exhaustion & Crying Spells",
  "Frequent Tension Headaches & Nausea",
  "Chronic Insomnia & Restlessness"
];

const somaticModerate = [
  "Mild Headaches During Review",
  "Occasional Restlessness Before Exams",
  "Afternoon Fatigue Slump"
];

const anxietyBehaviorsHigh = [
  "Test Panic & Freezing During Exams",
  "School Refusal & Morning Dread",
  "Severe Avoidance of Class Recitations",
  "Social Withdrawal from Peer Groups"
];

const anxietyBehaviorsModerate = [
  "Avoidance of Public Presentations",
  "Classroom Restlessness / Fidgeting",
  "Procrastination on Difficult Modules"
];

const copingConstructive = [
  "Problem-Focused (Study Plans / Consultations)",
  "Social Support (Talking with Friends/Family)",
  "Creative & Artistic Expression (Music / Sketching)",
  "Physical Exercise & Sports"
];

const copingMaladaptive = [
  "Avoidance & Withdrawal (Isolating / Skipping Tasks)",
  "Passive Distraction (Excessive Screen Time / Gaming)",
  "Emotional Repression / Keeping Feelings Inside"
];

const clinicalHigh = [
  "Urgent 1-on-1 confidential counseling intake required. Implement academic stress mitigation and parent conference.",
  "Schedule clinical assessment for acute anxiety and somatic distress. Coordinate with guidance counselor and adviser.",
  "Immediate counseling intervention; enroll student in structured study management and emotional resilience coaching.",
  "Prioritize supportive clinical check-in; assess home stress factors and establish safe guidance office open door policy."
];

const clinicalModerate = [
  "Enroll in Peer Wellness Circle & Midterm Stress Management Workshop. Regular homeroom adviser check-in.",
  "Provide bi-weekly guidance counselor mentoring for time management and test anxiety relief.",
  "Recommend school-life balance consultation and peer tutoring support for challenging subjects.",
  "Monitor mood trends via daily check-ins; adviser check-in if attendance slips."
];

const clinicalLow = [
  "Routine annual wellness check-in. Student demonstrates healthy emotional regulation and strong social support.",
  "General wellness maintenance. Continue participation in school clubs and leadership activities.",
  "Normal psychological profile; maintain proactive guidance wellness engagement."
];

const headers = [
  "lrn",
  "student_name",
  "stress_level_1_to_5",
  "primary_stress_trigger",
  "burnout_somatic_symptoms",
  "gad7_anxiety_score",
  "anxiety_severity_level",
  "anxiety_behavioral_manifestation",
  "phq9_depression_score",
  "depression_severity_level",
  "anhedonia_and_withdrawal_flag",
  "emotional_support_feeling",
  "primary_coping_mechanism",
  "coping_adaptiveness",
  "resilience_score_1_to_5",
  "counselor_case_flag",
  "clinical_intake_recommendation"
];

let csvContent = headers.join(",") + "\n";

students.forEach((s) => {
  const mhScore = s.domain_scores?.mental_health || 20;
  const isHighRisk = mhScore >= 60;
  const isMediumRisk = mhScore >= 35 && mhScore < 60;

  let stressLevel = 2;
  let stressTrigger = "None / Well Adjusted";
  let somatic = "None";
  let gad7 = 3;
  let anxietyLevel = "Minimal";
  let anxietyBehavior = "None";
  let phq9 = 2;
  let depressionLevel = "Minimal / None";
  let anhedonia = false;
  let emotionalSupport = "Strongly Supported";
  let copingMechanism = "Problem-Focused (Study Plans / Consultations)";
  let copingAdaptiveness = "Adaptive / Constructive";
  let resilience = 4;
  let counselorFlag = false;
  let recommendation = "";

  if (isHighRisk) {
    stressLevel = Math.floor(pseudoRandom() * 2) + 4; // 4 or 5
    stressTrigger = randomChoice(stressTriggersHigh);
    somatic = randomChoice(somaticHigh);
    gad7 = Math.floor(pseudoRandom() * 8) + 14; // 14 to 21 (Severe)
    anxietyLevel = gad7 >= 15 ? "Severe" : "Moderate";
    anxietyBehavior = randomChoice(anxietyBehaviorsHigh);
    phq9 = Math.floor(pseudoRandom() * 9) + 15; // 15 to 23 (Moderately Severe/Severe)
    depressionLevel = phq9 >= 20 ? "Severe" : "Moderately Severe";
    anhedonia = pseudoRandom() > 0.3;
    emotionalSupport = pseudoRandom() > 0.4 ? "Isolated / Disconnected" : "Completely Alone";
    copingMechanism = randomChoice(copingMaladaptive);
    copingAdaptiveness = "Maladaptive / Avoidant";
    resilience = Math.floor(pseudoRandom() * 2) + 1; // 1 or 2
    counselorFlag = true;
    recommendation = randomChoice(clinicalHigh);
  } else if (isMediumRisk) {
    stressLevel = 3;
    stressTrigger = randomChoice(stressTriggersModerate);
    somatic = pseudoRandom() > 0.5 ? randomChoice(somaticModerate) : "None";
    gad7 = Math.floor(pseudoRandom() * 6) + 7; // 7 to 12 (Mild to Moderate)
    anxietyLevel = gad7 >= 10 ? "Moderate" : "Mild";
    anxietyBehavior = randomChoice(anxietyBehaviorsModerate);
    phq9 = Math.floor(pseudoRandom() * 6) + 7; // 7 to 12 (Mild to Moderate)
    depressionLevel = phq9 >= 10 ? "Moderate" : "Mild";
    anhedonia = pseudoRandom() > 0.75;
    emotionalSupport = pseudoRandom() > 0.4 ? "Moderately Supported" : "Isolated / Disconnected";
    copingMechanism = pseudoRandom() > 0.5 ? randomChoice(copingConstructive) : randomChoice(copingMaladaptive);
    copingAdaptiveness = copingMechanism.includes("Problem") || copingMechanism.includes("Social") ? "Adaptive / Constructive" : "Neutral / Distraction";
    resilience = Math.floor(pseudoRandom() * 2) + 2; // 2 or 3
    counselorFlag = gad7 >= 12 || phq9 >= 12;
    recommendation = randomChoice(clinicalModerate);
  } else {
    stressLevel = pseudoRandom() > 0.7 ? 2 : 1;
    stressTrigger = "None / Well Adjusted";
    somatic = "None";
    gad7 = Math.floor(pseudoRandom() * 4) + 1; // 1 to 4 (Minimal)
    anxietyLevel = "Minimal";
    anxietyBehavior = "None";
    phq9 = Math.floor(pseudoRandom() * 4) + 1; // 1 to 4 (Minimal)
    depressionLevel = "Minimal / None";
    anhedonia = false;
    emotionalSupport = "Strongly Supported";
    copingMechanism = randomChoice(copingConstructive);
    copingAdaptiveness = "Adaptive / Constructive";
    resilience = pseudoRandom() > 0.4 ? 5 : 4;
    counselorFlag = false;
    recommendation = randomChoice(clinicalLow);
  }

  csvContent += `${s.lrn},"${s.full_name}",${stressLevel},"${stressTrigger}","${somatic}",${gad7},"${anxietyLevel}","${anxietyBehavior}",${phq9},"${depressionLevel}",${anhedonia},"${emotionalSupport}","${copingMechanism}","${copingAdaptiveness}",${resilience},${counselorFlag},"${recommendation}"\n`;
});

// Write to public/samples and root samples
fs.writeFileSync(path.join(__dirname, '../public/samples/sapc_500_mental_health_screenings.csv'), csvContent, 'utf-8');
fs.writeFileSync(path.join(__dirname, '../../public/samples/sapc_500_mental_health_screenings.csv'), csvContent, 'utf-8');

console.log("Successfully generated 17-attribute Mental Health Screenings dataset for all 500 students!");
