#!/usr/bin/env node

/**
 * SAPC IntellySys — 503 Students Credentials CSV Generator
 * 
 * Generates an institutional credentials CSV for the 503 students in SAPC:
 * - 3 Primary Seed / System Students (Joshua Dimaculangan, Angelica Dela Cruz, Mark Anthony Reyes)
 * - 500 Junior High School Cohort Students (Grade 7 - 10 from students500.ts)
 * 
 * Output formats:
 * 1. frontend/public/sapc_503_student_credentials.csv (directly downloadable from web app)
 * 2. sapc_503_student_credentials.csv (root folder for direct file explorer access)
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Load the 500 students dataset
const students500Path = path.resolve(projectRoot, "frontend", "src", "data", "students500.ts");
const rawTsContent = fs.readFileSync(students500Path, "utf-8");

// Extract the SAPC_500_STUDENTS JSON array
const match = rawTsContent.match(/export const SAPC_500_STUDENTS:\s*StudentRecord\[\]\s*=\s*(\[[\s\S]*?\]);/);
if (!match) {
  console.error("Could not find SAPC_500_STUDENTS in students500.ts");
  process.exit(1);
}

let sapc500Students = [];
try {
  sapc500Students = JSON.parse(match[1]);
} catch (e) {
  console.error("Error parsing SAPC_500_STUDENTS JSON:", e);
  process.exit(1);
}

console.log(`Loaded ${sapc500Students.length} students from students500.ts`);

// 3 System / Seed Students
const seedStudents = [
  {
    id: 501,
    full_name: "Joshua Dimaculangan",
    first_name: "Joshua",
    last_name: "Dimaculangan",
    email: "student@sapc.edu.ph",
    lrn: "109238475612",
    grade_level: 7,
    section_name: "Grade 7 - St. Anthony",
    adviser_name: "Ms. Elena Bautista, LPT",
    guardian_name: "Mrs. Elena Dimaculangan",
    guardian_contact: "+63 917 555 0192",
    phone: "+63 917 555 0192",
    notes: "Primary Seed Student (High Risk Academic & Mental Health Case)"
  },
  {
    id: 502,
    full_name: "Angelica Dela Cruz",
    first_name: "Angelica",
    last_name: "Dela Cruz",
    email: "angelica@sapc.edu.ph",
    lrn: "109238475613",
    grade_level: 7,
    section_name: "Grade 7 - St. Anthony",
    adviser_name: "Ms. Elena Bautista, LPT",
    guardian_name: "Mr. Roberto Dela Cruz",
    guardian_contact: "+63 918 333 4444",
    phone: "+63 918 333 4444",
    notes: "Seed Student (Medium Risk Attendance & Financial Strain)"
  },
  {
    id: 503,
    full_name: "Mark Anthony Reyes",
    first_name: "Mark Anthony",
    last_name: "Reyes",
    email: "mark@sapc.edu.ph",
    lrn: "109238475614",
    grade_level: 8,
    section_name: "Grade 8 - St. Benedict",
    adviser_name: "Prof. Ernesto Bautista",
    guardian_name: "Mrs. Carmela Reyes",
    guardian_contact: "+63 919 444 5555",
    phone: "+63 919 444 5555",
    notes: "Seed Student (Low Risk On-Track Student)"
  }
];

// Combine to exactly 503 students
const all503Students = [
  ...seedStudents,
  ...sapc500Students
];

console.log(`Total combined student cohort: ${all503Students.length} students`);

function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate deterministic Philippine mobile number based on student id
function getDeterministicPhone(seedId) {
  const baseNum = 917000000 + (seedId * 1337) % 8999999;
  return `+63 ${String(baseNum).slice(0, 3)} ${String(baseNum).slice(3, 6)} ${String(baseNum).slice(6)}`;
}

// Headers formatted for compatibility with UserProvisioningModal and Registrar Excel exports
const headers = [
  "role",
  "full_name",
  "email",
  "lrn_or_id",
  "grade_level",
  "section",
  "department",
  "temp_password",
  "adviser_name",
  "phone",
  "guardian_name",
  "guardian_contact",
  "account_status"
];

const rows = [headers.join(",")];

all503Students.forEach((st, idx) => {
  const role = "student";
  const fullName = st.full_name || `${st.first_name} ${st.last_name}`;
  const email = st.email;
  const lrn = String(st.lrn || "").trim();
  const gradeLevel = `Grade ${st.grade_level}`;
  const section = st.section_name || "";
  const department = "Junior High Department";
  
  // Predictable, secure institutional temporary password: SAPC@<last4LRN>!
  const last4 = lrn.slice(-4) || String(idx + 1).padStart(4, "0");
  const tempPassword = `SAPC@${last4}!`;
  
  const adviserName = st.adviser_name || "Unassigned";
  const studentPhone = st.phone || getDeterministicPhone(st.id || idx + 1);
  const guardianName = st.guardian_name || `Guardian of ${fullName}`;
  const guardianPhone = st.guardian_contact || getDeterministicPhone((st.id || idx + 1) + 5000);
  const status = "Pre-Provisioned (Password Change Required Upon 1st Login)";

  const row = [
    csvEscape(role),
    csvEscape(fullName),
    csvEscape(email),
    csvEscape(lrn),
    csvEscape(gradeLevel),
    csvEscape(section),
    csvEscape(department),
    csvEscape(tempPassword),
    csvEscape(adviserName),
    csvEscape(studentPhone),
    csvEscape(guardianName),
    csvEscape(guardianPhone),
    csvEscape(status)
  ];

  rows.push(row.join(","));
});

const csvContent = rows.join("\r\n");

// Write to frontend/public/sapc_503_student_credentials.csv (for direct web download)
const publicDir = path.resolve(projectRoot, "frontend", "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const publicFilePath = path.resolve(publicDir, "sapc_503_student_credentials.csv");
fs.writeFileSync(publicFilePath, csvContent, "utf-8");
console.log(`[SAVED] Public CSV written to: ${publicFilePath}`);

// Write to root project directory for direct offline access
const rootFilePath = path.resolve(projectRoot, "sapc_503_student_credentials.csv");
fs.writeFileSync(rootFilePath, csvContent, "utf-8");
console.log(`[SAVED] Root CSV written to: ${rootFilePath}`);

// Also create a credential slips printable summary
const slipSummaryPath = path.resolve(projectRoot, "sapc_503_student_credentials_summary.json");
const summaryData = all503Students.map((st, idx) => ({
  id: st.id || idx + 1,
  name: st.full_name || `${st.first_name} ${st.last_name}`,
  email: st.email,
  lrn: st.lrn,
  grade: `Grade ${st.grade_level}`,
  section: st.section_name,
  adviser: st.adviser_name,
  tempPassword: `SAPC@${String(st.lrn).slice(-4)}!`
}));
fs.writeFileSync(slipSummaryPath, JSON.stringify(summaryData, null, 2), "utf-8");
console.log(`[SAVED] JSON Summary written to: ${slipSummaryPath}`);

console.log("\nSample 5 First Credentials:");
console.table(summaryData.slice(0, 5));

console.log("\nSample 3 Last Credentials:");
console.table(summaryData.slice(-3));
