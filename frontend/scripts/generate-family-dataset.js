const fs = require('fs');
const path = require('path');

// Import the 500 students to ensure 100% synchronized LRN and names
const studentsTs = fs.readFileSync(path.join(__dirname, '../src/data/students500.ts'), 'utf-8');
const match = studentsTs.match(/export const SAPC_500_STUDENTS: StudentRecord\[\] = (\[[\s\S]*?\]);/);

if (!match) {
  console.error("Could not parse SAPC_500_STUDENTS from students500.ts");
  process.exit(1);
}

const students = JSON.parse(match[1]);

// Deterministic Pseudo-Random
let seed = 777;
function pseudoRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomChoice(arr) {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

const birthOrderOptions = ["Eldest", "Middle", "Youngest", "Only Child"];
const ofwOptions = ["None", "Father OFW", "Mother OFW", "Both Parents OFW"];
const maritalOptions = ["Married / Intact", "Separated / Annulled", "Single Parent / Unmarried", "Widowed"];
const livingArrangements = [
  "With Both Parents",
  "With Mother Only",
  "With Father Only",
  "With Grandparents",
  "With Relatives",
  "Boarding / Independent"
];
const caregiverOptions = ["Both Parents", "Mother", "Father", "Grandmother", "Grandparents", "Aunt/Uncle", "Elder Sibling"];
const incomeBrackets = [
  "Below ₱10,000 (Low Income)",
  "₱10,000 - ₱24,999 (Lower Middle)",
  "₱25,000 - ₱49,999 (Middle)",
  "₱50,000+ (Upper Middle/High)"
];
const educationAttainment = ["Elementary", "High School", "Vocational/Tech", "College Degree", "Postgraduate"];

const highRiskAdviserNotes = [
  "Family facing severe domestic pressure; student assumes full household caretaking duties for younger siblings",
  "Both parents overseas; student experiences high isolation and emotional disconnect despite remittances",
  "Guardian unresponsive during 3 consecutive homeroom PTA calls; homeroom visit recommended",
  "Recent parental separation resulting in emotional distress and sudden drop in homework submission",
  "Student is the eldest of 5 siblings; works part-time on weekends to support household 4Ps allowance",
  "Living with elderly grandparents with limited capacity for high school academic supervision"
];

const moderateRiskAdviserNotes = [
  "One parent works in Middle East; student displays mood fluctuations during exam periods",
  "Single mother working multiple shifts; student shows good effort but needs follow-up on project deadlines",
  "Family experiencing livelihood changes; adviser providing guidance check-ins",
  "Guardian attended quarterly academic remediation conference and agreed on a home study schedule",
  "Lives with aunt and cousins; generally stable environment with occasional internet connectivity issues"
];

const lowRiskAdviserNotes = [
  "Exemplary parental involvement in all PTA and school wellness activities",
  "Very supportive and responsive home environment; parents actively monitor academic progress",
  "Both parents present and maintain regular communication with class adviser",
  "Stable living arrangement with dedicated home study space and strong family emotional support",
  "Active guardian support during homeroom consultations; student well-adjusted"
];

// CSV Header - 17 Fields Total
const headers = [
  "lrn",
  "student_name",
  "birth_order",
  "is_eldest_child",
  "siblings_count",
  "ofw_parent_status",
  "parent_marital_status",
  "single_parent_status",
  "living_arrangement",
  "is_4ps_beneficiary",
  "primary_caregiver_relationship",
  "household_monthly_income_bracket",
  "parent_educational_attainment",
  "guardian_contact_rating",
  "parent_conference_attended",
  "domestic_distress_flag",
  "adviser_notes"
];

let csvContent = headers.join(",") + "\n";

students.forEach((s) => {
  const famScore = s.domain_scores?.family || 20;
  const isHighRisk = famScore >= 60;
  const isMediumRisk = famScore >= 35 && famScore < 60;

  // 1. Birth Order & Eldest Status
  let birthOrder = "Middle";
  let isEldest = false;
  let siblings = Math.floor(pseudoRandom() * 4) + 1;

  if (isHighRisk) {
    if (pseudoRandom() > 0.35) {
      birthOrder = "Eldest";
      isEldest = true;
      siblings = Math.floor(pseudoRandom() * 4) + 2; // 2 to 5 siblings
    } else {
      birthOrder = randomChoice(["Middle", "Youngest", "Only Child"]);
      isEldest = birthOrder === "Eldest";
    }
  } else if (isMediumRisk) {
    birthOrder = randomChoice(birthOrderOptions);
    isEldest = birthOrder === "Eldest";
    siblings = Math.floor(pseudoRandom() * 4) + 1;
  } else {
    birthOrder = randomChoice(["Middle", "Youngest", "Eldest", "Only Child"]);
    isEldest = birthOrder === "Eldest";
    siblings = birthOrder === "Only Child" ? 0 : Math.floor(pseudoRandom() * 3) + 1;
  }

  // 2. OFW Status
  let ofw = "None";
  if (isHighRisk) {
    ofw = pseudoRandom() > 0.4 ? randomChoice(["Both Parents OFW", "Mother OFW", "Father OFW"]) : "None";
  } else if (isMediumRisk) {
    ofw = pseudoRandom() > 0.5 ? randomChoice(["Father OFW", "Mother OFW", "None"]) : "None";
  } else {
    ofw = pseudoRandom() > 0.75 ? "Father OFW" : "None";
  }

  // 3. Marital Status & Single Parent Status
  let marital = "Married / Intact";
  let singleParent = false;
  if (isHighRisk) {
    marital = pseudoRandom() > 0.4 ? randomChoice(["Separated / Annulled", "Single Parent / Unmarried", "Widowed"]) : "Married / Intact";
    singleParent = marital !== "Married / Intact";
  } else if (isMediumRisk) {
    marital = pseudoRandom() > 0.65 ? randomChoice(["Separated / Annulled", "Single Parent / Unmarried", "Widowed"]) : "Married / Intact";
    singleParent = marital !== "Married / Intact";
  } else {
    marital = pseudoRandom() > 0.85 ? "Single Parent / Unmarried" : "Married / Intact";
    singleParent = marital !== "Married / Intact";
  }

  // 4. Living Arrangement & Primary Caregiver
  let livingArrangement = "With Both Parents";
  let caregiver = "Both Parents";

  if (singleParent) {
    livingArrangement = marital === "Widowed" ? "With Mother Only" : randomChoice(["With Mother Only", "With Father Only", "With Grandparents"]);
    caregiver = livingArrangement === "With Mother Only" ? "Mother" : livingArrangement === "With Father Only" ? "Father" : "Grandmother";
  } else if (ofw === "Both Parents OFW") {
    livingArrangement = randomChoice(["With Grandparents", "With Relatives", "Boarding / Independent"]);
    caregiver = livingArrangement === "With Grandparents" ? "Grandparents" : "Aunt/Uncle";
  } else if (ofw === "Father OFW") {
    livingArrangement = "With Mother Only";
    caregiver = "Mother";
  } else if (ofw === "Mother OFW") {
    livingArrangement = "With Father Only";
    caregiver = "Father";
  } else {
    livingArrangement = pseudoRandom() > 0.15 ? "With Both Parents" : randomChoice(["With Grandparents", "With Relatives"]);
    caregiver = livingArrangement === "With Both Parents" ? "Both Parents" : "Grandparents";
  }

  // 5. 4Ps Beneficiary & Income Bracket
  let is4Ps = false;
  let income = "₱25,000 - ₱49,999 (Middle)";
  if (isHighRisk) {
    is4Ps = pseudoRandom() > 0.45;
    income = is4Ps ? "Below ₱10,000 (Low Income)" : randomChoice(["Below ₱10,000 (Low Income)", "₱10,000 - ₱24,999 (Lower Middle)"]);
  } else if (isMediumRisk) {
    is4Ps = pseudoRandom() > 0.75;
    income = is4Ps ? "Below ₱10,000 (Low Income)" : randomChoice(["₱10,000 - ₱24,999 (Lower Middle)", "₱25,000 - ₱49,999 (Middle)"]);
  } else {
    is4Ps = false;
    income = pseudoRandom() > 0.4 ? "₱50,000+ (Upper Middle/High)" : "₱25,000 - ₱49,999 (Middle)";
  }

  // 6. Parent Education Attainment
  let parentEdu = "College Degree";
  if (isHighRisk) {
    parentEdu = randomChoice(["Elementary", "High School", "Vocational/Tech"]);
  } else if (isMediumRisk) {
    parentEdu = randomChoice(["High School", "Vocational/Tech", "College Degree"]);
  } else {
    parentEdu = randomChoice(["College Degree", "Postgraduate", "College Degree"]);
  }

  // 7. Guardian Contact Rating & PTA Conference Attendance
  let contactRating = "High";
  let ptaAttended = true;
  if (isHighRisk) {
    contactRating = pseudoRandom() > 0.3 ? randomChoice(["Low", "Unresponsive"]) : "Moderate";
    ptaAttended = pseudoRandom() > 0.75;
  } else if (isMediumRisk) {
    contactRating = randomChoice(["Moderate", "High", "Low"]);
    ptaAttended = pseudoRandom() > 0.35;
  } else {
    contactRating = "High";
    ptaAttended = pseudoRandom() > 0.1;
  }

  // 8. Domestic Distress Flag & Adviser Notes
  let domesticDistress = false;
  let notes = "";
  if (isHighRisk) {
    domesticDistress = pseudoRandom() > 0.3;
    notes = randomChoice(highRiskAdviserNotes);
  } else if (isMediumRisk) {
    domesticDistress = pseudoRandom() > 0.7;
    notes = randomChoice(moderateRiskAdviserNotes);
  } else {
    domesticDistress = false;
    notes = randomChoice(lowRiskAdviserNotes);
  }

  // Row formatting
  csvContent += `${s.lrn},"${s.full_name}","${birthOrder}",${isEldest},${siblings},"${ofw}","${marital}",${singleParent},"${livingArrangement}",${is4Ps},"${caregiver}","${income}","${parentEdu}","${contactRating}",${ptaAttended},${domesticDistress},"${notes}"\n`;
});

// Write to files
fs.writeFileSync(path.join(__dirname, '../public/samples/sapc_500_family_social_support.csv'), csvContent, 'utf-8');
fs.writeFileSync(path.join(__dirname, '../../public/samples/sapc_500_family_social_support.csv'), csvContent, 'utf-8');

console.log(`Successfully generated 17-field Family & Social Support dataset for all 500 students!`);
