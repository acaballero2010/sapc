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
let seed = 666;
function pseudoRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomChoice(arr) {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

const occupationsHighRisk = [
  "Informal Sector / Daily Wage Earner",
  "Tricycle / PUV Driver",
  "Construction Daily Laborer",
  "Unemployed / Seeking Work",
  "Small Sari-Sari Store Vendor"
];

const occupationsModerate = [
  "BPO / Call Center Agent",
  "Private Sector Office Staff",
  "Service Industry / Fast Food Crew",
  "Auto Mechanic / Repair Technician"
];

const occupationsLow = [
  "Government Employee / Licensed Teacher",
  "Small Business Owner / Merchant",
  "IT / Software Engineer",
  "Healthcare / Registered Nurse",
  "OFW Senior Technical Worker"
];

const financialStressorsHigh = [
  "Overdue Tuition & Exam Permit Insecurity",
  "Daily Allowance (Baon) & Commute Shortage",
  "Household Debt & Micro-loan Obligations",
  "Emergency Family Medical Expenses",
  "Multiple Siblings School Tuition Overload"
];

const financialStressorsModerate = [
  "Delayed Remittance / Seasonal Cash Flow",
  "Project & Special School Requirement Fees",
  "Uniform & Textbook Expenses",
  "Household Utility Bill Catch-up"
];

const vouchers = ["Full DepEd SHS Voucher", "ESC Scholar", "Partial Subsidy", "Alumni Grantee", "Non-Voucher / Private Payer"];

const recommendationsHigh = [
  "Award SAPC Emergency Tuition Relief Grant and restructure remaining balance into manageable zero-interest installments.",
  "Enroll student in SAPC Work-Study Assistance Program; coordinate with accounting for exam permit release.",
  "Endorse student for Alumni Educational Assistance Subsidy and provide subsidized daily meal coupons.",
  "Grant promissory note extension and assist guardian with DepEd voucher reconciliation."
];

const recommendationsModerate = [
  "Provide flexible installment catch-up schedule aligned with guardian salary payout cycles.",
  "Recommend application for ESC tuition top-up grant and school supply material subsidy.",
  "Monitor quarterly accounting clearance; accounting officer consultation scheduled."
];

const recommendationsLow = [
  "Financial profile in good standing. DepEd voucher / ESC scholarship active.",
  "Regular tuition schedule maintained with prompt quarterly payments.",
  "Exemplary payment record; student fully cleared for all academic quarters."
];

const headers = [
  "lrn",
  "student_name",
  "monthly_household_income_php",
  "income_bracket",
  "is_4ps_beneficiary",
  "breadwinner_occupation",
  "financial_stress_level_1_to_5",
  "primary_financial_stressor",
  "daily_allowance_adequacy",
  "student_part_time_work_status",
  "voucher_subsidy_status",
  "unpaid_balance_php",
  "overdue_installments",
  "promissory_note_active",
  "alumni_grant_eligible",
  "financial_assistance_recommendation"
];

let csvContent = headers.join(",") + "\n";

students.forEach((s) => {
  const finScore = s.domain_scores?.financial || 15;
  const isHighRisk = finScore >= 55;
  const isMediumRisk = finScore >= 30 && finScore < 55;

  let incomePhp = 35000;
  let incomeBracket = "₱25,000 - ₱49,999 (Middle)";
  let is4Ps = false;
  let occupation = "Private Sector Office Staff";
  let finStress = 2;
  let stressor = "None / Stable Finances";
  let allowance = "Adequate (₱100+/day)";
  let workStatus = "None / Full-time Student";
  let voucher = "ESC Scholar";
  let balance = 0;
  let overdue = 0;
  let promissory = false;
  let grantEligible = false;
  let recommendation = "";

  if (isHighRisk) {
    incomePhp = Math.floor(pseudoRandom() * 9000) + 7000; // ₱7,000 - ₱16,000
    incomeBracket = incomePhp < 10000 ? "Below ₱10,000 (Low Income)" : "₱10,000 - ₱24,999 (Lower Middle)";
    is4Ps = pseudoRandom() > 0.45;
    occupation = randomChoice(occupationsHighRisk);
    finStress = Math.floor(pseudoRandom() * 2) + 4; // 4 or 5
    stressor = randomChoice(financialStressorsHigh);
    allowance = pseudoRandom() > 0.4 ? "Inadequate / Skips Commute or Meals (<₱50/day)" : "Tight (₱50-₱80/day)";
    workStatus = pseudoRandom() > 0.5 ? "Working Student (15-25 hrs/wk - High Fatigue Burden)" : "Weekend Work / Gig (<10 hrs/wk)";
    voucher = randomChoice(["Partial Subsidy", "Alumni Grantee", "Non-Voucher / Private Payer"]);
    overdue = Math.floor(pseudoRandom() * 3) + 2; // 2 to 4 overdue
    balance = Math.floor(pseudoRandom() * 15000) + 12000; // ₱12,000 - ₱27,000
    promissory = true;
    grantEligible = true;
    recommendation = randomChoice(recommendationsHigh);
  } else if (isMediumRisk) {
    // Note: Can have decent income but still high financial stress due to debt or emergencies
    const hasDecentIncome = pseudoRandom() > 0.4;
    incomePhp = hasDecentIncome ? Math.floor(pseudoRandom() * 20000) + 25000 : Math.floor(pseudoRandom() * 12000) + 12000;
    incomeBracket = incomePhp >= 25000 ? "₱25,000 - ₱49,999 (Middle)" : "₱10,000 - ₱24,999 (Lower Middle)";
    is4Ps = pseudoRandom() > 0.8;
    occupation = hasDecentIncome ? randomChoice(occupationsModerate) : randomChoice(occupationsHighRisk);
    finStress = Math.floor(pseudoRandom() * 2) + 3; // 3 or 4 (Moderate to High stress)
    stressor = randomChoice(financialStressorsModerate);
    allowance = pseudoRandom() > 0.35 ? "Tight (₱50-₱80/day)" : "Adequate (₱100+/day)";
    workStatus = pseudoRandom() > 0.75 ? "Weekend Work / Gig (<10 hrs/wk)" : "None / Full-time Student";
    voucher = randomChoice(vouchers);
    overdue = pseudoRandom() > 0.4 ? 1 : 0;
    balance = overdue > 0 ? Math.floor(pseudoRandom() * 7000) + 4000 : 0;
    promissory = overdue > 0;
    grantEligible = pseudoRandom() > 0.5;
    recommendation = randomChoice(recommendationsModerate);
  } else {
    incomePhp = Math.floor(pseudoRandom() * 40000) + 45000; // ₱45,000 - ₱85,000
    incomeBracket = incomePhp >= 50000 ? "₱50,000+ (Upper Middle/High)" : "₱25,000 - ₱49,999 (Middle)";
    is4Ps = false;
    occupation = randomChoice(occupationsLow);
    finStress = 1;
    stressor = "None / Stable Finances";
    allowance = "Adequate (₱100+/day)";
    workStatus = "None / Full-time Student";
    voucher = pseudoRandom() > 0.4 ? "Full DepEd SHS Voucher" : "ESC Scholar";
    balance = 0;
    overdue = 0;
    promissory = false;
    grantEligible = false;
    recommendation = randomChoice(recommendationsLow);
  }

  csvContent += `${s.lrn},"${s.full_name}",${incomePhp},"${incomeBracket}",${is4Ps},"${occupation}",${finStress},"${stressor}","${allowance}","${workStatus}","${voucher}",${balance},${overdue},${promissory},${grantEligible},"${recommendation}"\n`;
});

// Write to public/samples and root samples
fs.writeFileSync(path.join(__dirname, '../public/samples/sapc_500_financial_records.csv'), csvContent, 'utf-8');
fs.writeFileSync(path.join(__dirname, '../../public/samples/sapc_500_financial_records.csv'), csvContent, 'utf-8');

console.log("Successfully generated 16-attribute Financial Records dataset for all 500 students!");
