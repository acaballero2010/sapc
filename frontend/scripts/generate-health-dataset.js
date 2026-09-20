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
let seed = 999;
function pseudoRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomChoice(arr) {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

const chronicOptions = [
  "None",
  "Bronchial Asthma",
  "Chronic Tension Headaches / Migraine",
  "Gastritis / Acid Reflux",
  "Iron-Deficiency Anemia",
  "Allergic Rhinitis"
];

const highRiskRemarks = [
  "Frequent clinic visits for acute tension headaches and nausea during examinations. Recommended pediatric neurology consult.",
  "Severe sleep deprivation (<4.5 hrs) and frequent morning dizziness. Student skips breakfast regularly.",
  "Recurrent bronchial asthma flare-ups during morning PE sessions. Inhaler on standby at school clinic.",
  "Chronic fatigue and iron-deficiency anemia indicators; nurse provided dietary iron supplement advisory.",
  "Acute gastritis episodes due to prolonged irregular meals; student advised on balanced nutrition schedule."
];

const moderateRiskRemarks = [
  "Occasional migraine episodes during afternoon heat index peaks. Administered hydration and clinic rest.",
  "Underweight BMI category; homeroom adviser notified for campus feeding & nutrition monitoring program.",
  "Reports difficulty sleeping due to late-night screen time; advised on healthy sleep hygiene protocols.",
  "Mild allergic rhinitis triggered by dust; cleared for regular classroom activities with personal medication.",
  "Clinic visit for minor sports fatigue; student cleared with adequate hydration."
];

const lowRiskRemarks = [
  "Annual physical and dental examination cleared. Optimal vitals and healthy BMI.",
  "Exemplary physical wellness, active varsity clearance, and consistent 8-hour sleep routine.",
  "Routine annual wellness check-up cleared without any medical restrictions.",
  "Healthy nutritional status and regular physical endurance in PE classes.",
  "Normal health screening benchmarks; no clinic visits recorded this quarter."
];

const headers = [
  "lrn",
  "student_name",
  "general_physical_health_status",
  "chronic_condition",
  "quarterly_clinic_visits",
  "medical_absences_count",
  "physical_activity_clearance",
  "bmi_category",
  "daily_meal_frequency",
  "nutrition_quality_score_1_to_5",
  "breakfast_consistency",
  "avg_sleep_hours_per_night",
  "sleep_quality_rating",
  "daytime_fatigue_or_somnolence",
  "visual_or_hearing_impairment",
  "clinic_nurse_remarks"
];

let csvContent = headers.join(",") + "\n";

students.forEach((s) => {
  const healthScore = s.domain_scores?.health || 15;
  const isHighRisk = healthScore >= 55;
  const isMediumRisk = healthScore >= 30 && healthScore < 55;

  // 1. General Status & Chronic Conditions
  let healthStatus = "Good";
  let chronic = "None";
  let visits = 0;
  let medAbsences = 0;
  let peClearance = "Cleared";

  if (isHighRisk) {
    healthStatus = pseudoRandom() > 0.4 ? "Poor" : "Fair";
    chronic = randomChoice(["Bronchial Asthma", "Chronic Tension Headaches / Migraine", "Gastritis / Acid Reflux", "Iron-Deficiency Anemia"]);
    visits = Math.floor(pseudoRandom() * 4) + 3; // 3 to 6 clinic visits
    medAbsences = Math.floor(pseudoRandom() * 5) + 3; // 3 to 7 days
    peClearance = pseudoRandom() > 0.5 ? "Restricted (PE Modified)" : "Unfit (Medical Waiver)";
  } else if (isMediumRisk) {
    healthStatus = pseudoRandom() > 0.5 ? "Fair" : "Good";
    chronic = pseudoRandom() > 0.4 ? randomChoice(chronicOptions) : "None";
    visits = Math.floor(pseudoRandom() * 3) + 1; // 1 to 3 clinic visits
    medAbsences = Math.floor(pseudoRandom() * 3); // 0 to 2 days
    peClearance = chronic !== "None" && pseudoRandom() > 0.6 ? "Restricted (PE Modified)" : "Cleared";
  } else {
    healthStatus = pseudoRandom() > 0.3 ? "Excellent" : "Good";
    chronic = "None";
    visits = pseudoRandom() > 0.8 ? 1 : 0;
    medAbsences = 0;
    peClearance = "Cleared";
  }

  // 2. Nutrition Quality & BMI
  let bmi = "Normal";
  let mealFreq = "3 Regular Meals + Snacks";
  let nutritionScore = 4;
  let breakfast = "Daily";

  if (isHighRisk) {
    bmi = pseudoRandom() > 0.4 ? randomChoice(["Underweight / Malnourished", "Obese"]) : "Normal";
    mealFreq = randomChoice(["2 Meals (Skips Breakfast)", "Irregular / Food Insecure", "Frequent Fast Food / Low Nutrient"]);
    nutritionScore = Math.floor(pseudoRandom() * 2) + 1; // 1 or 2
    breakfast = "Rarely / Skips Breakfast";
  } else if (isMediumRisk) {
    bmi = pseudoRandom() > 0.6 ? randomChoice(["Underweight / Malnourished", "Overweight"]) : "Normal";
    mealFreq = randomChoice(["2 Meals (Skips Breakfast)", "3 Regular Meals + Snacks"]);
    nutritionScore = Math.floor(pseudoRandom() * 2) + 3; // 3 or 4
    breakfast = pseudoRandom() > 0.5 ? "Frequent (3-4 days/wk)" : "Daily";
  } else {
    bmi = pseudoRandom() > 0.85 ? "Overweight" : "Normal";
    mealFreq = "3 Regular Meals + Snacks";
    nutritionScore = pseudoRandom() > 0.3 ? 5 : 4;
    breakfast = "Daily";
  }

  // 3. Sleep Patterns & Recovery
  let sleepHours = 7.5;
  let sleepQuality = "Good / Restful";
  let fatigue = "None";

  if (isHighRisk) {
    sleepHours = parseFloat((pseudoRandom() * 1.5 + 4.0).toFixed(1)); // 4.0 - 5.5 hrs
    sleepQuality = pseudoRandom() > 0.4 ? "Severely Deprived (<5 hrs)" : "Poor / Insomnia Symptoms";
    fatigue = "Frequent Daytime Drowsiness (Falls Asleep in Class)";
  } else if (isMediumRisk) {
    sleepHours = parseFloat((pseudoRandom() * 1.5 + 5.5).toFixed(1)); // 5.5 - 7.0 hrs
    sleepQuality = randomChoice(["Moderate / Intermittent", "Poor / Insomnia Symptoms"]);
    fatigue = pseudoRandom() > 0.4 ? "Occasional Afternoon Slump" : "None";
  } else {
    sleepHours = parseFloat((pseudoRandom() * 1.5 + 7.5).toFixed(1)); // 7.5 - 9.0 hrs
    sleepQuality = "Good / Restful";
    fatigue = "None";
  }

  // 4. Vision / Hearing & Remarks
  let vision = pseudoRandom() > 0.85 ? "Corrected Vision (Glasses)" : "None";
  if (isHighRisk && pseudoRandom() > 0.7) {
    vision = "Uncorrected Vision Deficit (Needs Glasses)";
  }

  let remarks = "";
  if (isHighRisk) {
    remarks = randomChoice(highRiskRemarks);
  } else if (isMediumRisk) {
    remarks = randomChoice(moderateRiskRemarks);
  } else {
    remarks = randomChoice(lowRiskRemarks);
  }

  csvContent += `${s.lrn},"${s.full_name}","${healthStatus}","${chronic}",${visits},${medAbsences},"${peClearance}","${bmi}","${mealFreq}",${nutritionScore},"${breakfast}",${sleepHours},"${sleepQuality}","${fatigue}","${vision}","${remarks}"\n`;
});

// Write to public/samples and root samples
fs.writeFileSync(path.join(__dirname, '../public/samples/sapc_500_clinic_health_records.csv'), csvContent, 'utf-8');
fs.writeFileSync(path.join(__dirname, '../../public/samples/sapc_500_clinic_health_records.csv'), csvContent, 'utf-8');

console.log("Successfully generated 16-field Health & Clinic records dataset for all 500 students!");
