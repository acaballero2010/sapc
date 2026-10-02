#!/usr/bin/env node

/**
 * SAPC IntellySys — 503 Parent & Guardian Accounts Generator
 * 
 * Generates official institutional credentials and dataset for 503 parents/guardians,
 * matching 1-to-1 with every student in SAPC:
 * - Joshua Dimaculangan -> Mrs. Elena Dimaculangan (parent@sapc.edu.ph)
 * - Angelica Dela Cruz -> Mr. Roberto Dela Cruz (parent.109238475613@parent.sapc.edu.ph)
 * - Mark Anthony Reyes -> Mrs. Carmela Reyes (parent.109238475614@parent.sapc.edu.ph)
 * - 500 Cohort Students -> parent.<lrn>@parent.sapc.edu.ph
 * 
 * Generates:
 * 1. sapc_503_parent_credentials.csv (root & frontend/public/)
 * 2. frontend/src/data/parents503.ts (TypeScript dataset for seamless in-app hydration)
 * 3. sapc_503_parent_firebase_auth_import.json (SHA256 password hashes for Firebase Auth import)
 * 4. Refreshes sapc_503_student_credentials.csv with accurate guardian names and contacts
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Load the 500 students dataset
const students500Path = path.resolve(projectRoot, "frontend", "src", "data", "students500.ts");
const rawTsContent = fs.readFileSync(students500Path, "utf-8");

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
    guardian_relationship: "Mother",
    guardian_contact: "+63 917 555 0192",
    parent_email: "parent@sapc.edu.ph"
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
    guardian_relationship: "Father",
    guardian_contact: "+63 918 333 4444",
    parent_email: "parent.109238475613@parent.sapc.edu.ph"
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
    guardian_relationship: "Mother",
    guardian_contact: "+63 919 444 5555",
    parent_email: "parent.109238475614@parent.sapc.edu.ph"
  }
];

const all503Students = [...seedStudents, ...sapc500Students];

const MOTHER_FIRST_NAMES = [
  "Elena", "Teresa", "Maricel", "Corazon", "Carmela", "Rowena", "Rosalinda", "Lorna",
  "Josephine", "Mary Ann", "Remedios", "Jocelyn", "Flordeliza", "Elizabeth", "Cynthia",
  "Imelda", "Shirley", "Bernadette", "Jennifer", "Cristina", "Grace", "Lourdes", "Gina"
];

const FATHER_FIRST_NAMES = [
  "Roberto", "Ernesto", "Edgardo", "Ferdinand", "Rolando", "Carlos", "Ramon", "Danilo",
  "Antonio", "Reynaldo", "Eduardo", "Renato", "Wilfredo", "Rodolfo", "Victor", "Nestor",
  "Gabriel", "Jaime", "Manuel", "Cesar", "Mario", "Arnel", "Gerardo"
];

function getDeterministicPhone(seedId) {
  const baseNum = 917000000 + (seedId * 1337) % 8999999;
  return `+63 ${String(baseNum).slice(0, 3)} ${String(baseNum).slice(3, 6)} ${String(baseNum).slice(6)}`;
}

function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const parentRecords = [];
const parentAuthUsers = [];
const updatedStudentRows = [];

// Headers for sapc_503_parent_credentials.csv
const parentCsvHeaders = [
  "role",
  "parent_name",
  "relationship",
  "email",
  "temp_password",
  "linked_student_name",
  "linked_student_lrn",
  "student_grade_level",
  "section",
  "phone",
  "account_status"
];
const parentCsvRows = [parentCsvHeaders.join(",")];

// Headers for sapc_503_student_credentials.csv
const studentCsvHeaders = [
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
  "guardian_relationship",
  "guardian_email",
  "guardian_contact",
  "account_status"
];
const studentCsvRows = [studentCsvHeaders.join(",")];

all503Students.forEach((st, idx) => {
  const lrn = String(st.lrn || "").trim();
  const last4 = lrn.slice(-4) || String(idx + 1).padStart(4, "0");
  const studentFullName = st.full_name || `${st.first_name} ${st.last_name}`;
  const studentLastName = st.last_name || studentFullName.split(" ").slice(-1)[0] || "Santos";
  
  let guardianName = st.guardian_name;
  let relationship = st.guardian_relationship || (idx % 2 === 0 ? "Mother" : "Father");
  let parentEmail = st.parent_email;

  if (!guardianName) {
    if (relationship === "Mother") {
      const fName = MOTHER_FIRST_NAMES[idx % MOTHER_FIRST_NAMES.length];
      guardianName = `Mrs. ${fName} ${studentLastName}`;
    } else {
      const fName = FATHER_FIRST_NAMES[idx % FATHER_FIRST_NAMES.length];
      guardianName = `Mr. ${fName} ${studentLastName}`;
    }
  }

  if (!parentEmail) {
    parentEmail = `parent.${lrn}@parent.sapc.edu.ph`;
  }

  const parentPhone = st.guardian_contact || getDeterministicPhone((st.id || idx + 1) + 8000);
  const tempPassword = `SAPC@P${last4}!`;
  const parentId = `PAR-${String(idx + 1).padStart(3, "0")}`;

  // 1. In-memory ParentRecord
  const parentRec = {
    id: parentId,
    name: guardianName,
    email: parentEmail,
    phone: parentPhone,
    relationship: relationship,
    linkedStudentName: studentFullName,
    linkedLRN: lrn,
    linkedLRNs: [lrn],
    linkedStudentNames: [studentFullName],
    section: st.section_name || "",
    gradeLevel: `Grade ${st.grade_level}`,
    status: "Active",
    verifiedAt: "2026-08-15",
    sf9Access: true,
    attendanceAlerts: true,
    riskAlerts: true,
    initialPassword: tempPassword
  };
  parentRecords.push(parentRec);

  // 2. CSV row for Parent Credentials
  parentCsvRows.push([
    csvEscape("parent"),
    csvEscape(guardianName),
    csvEscape(relationship),
    csvEscape(parentEmail),
    csvEscape(tempPassword),
    csvEscape(studentFullName),
    csvEscape(lrn),
    csvEscape(`Grade ${st.grade_level}`),
    csvEscape(st.section_name || ""),
    csvEscape(parentPhone),
    csvEscape("Pre-Provisioned (Password Change Required Upon 1st Login)")
  ].join(","));

  // 3. Updated CSV row for Student Credentials
  const studentTempPass = `SAPC@${last4}!`;
  studentCsvRows.push([
    csvEscape("student"),
    csvEscape(studentFullName),
    csvEscape(st.email),
    csvEscape(lrn),
    csvEscape(`Grade ${st.grade_level}`),
    csvEscape(st.section_name || ""),
    csvEscape("Junior High Department"),
    csvEscape(studentTempPass),
    csvEscape(st.adviser_name || "Unassigned"),
    csvEscape(st.phone || getDeterministicPhone(st.id || idx + 1)),
    csvEscape(guardianName),
    csvEscape(relationship),
    csvEscape(parentEmail),
    csvEscape(parentPhone),
    csvEscape("Pre-Provisioned (Password Change Required Upon 1st Login)")
  ].join(","));

  // 4. Firebase Auth User Object (SHA256 hashed password)
  const passwordHash = crypto.createHash("sha256").update(tempPassword).digest("base64");
  parentAuthUsers.push({
    localId: `par_${lrn}`,
    email: parentEmail,
    emailVerified: true,
    displayName: guardianName,
    passwordHash: passwordHash,
    salt: ""
  });
});

console.log(`Generated ${parentRecords.length} Parent Records and Credentials.`);

// Write sapc_503_parent_credentials.csv to public & root
const parentCsvContent = parentCsvRows.join("\r\n");
const rootParentCsv = path.resolve(projectRoot, "sapc_503_parent_credentials.csv");
const publicParentCsv = path.resolve(projectRoot, "frontend", "public", "sapc_503_parent_credentials.csv");

fs.writeFileSync(rootParentCsv, parentCsvContent, "utf-8");
fs.writeFileSync(publicParentCsv, parentCsvContent, "utf-8");
console.log(`Wrote parent credentials CSV to:\n- ${rootParentCsv}\n- ${publicParentCsv}`);

// Refresh sapc_503_student_credentials.csv with enriched guardian info
const studentCsvContent = studentCsvRows.join("\r\n");
const rootStudentCsv = path.resolve(projectRoot, "sapc_503_student_credentials.csv");
const publicStudentCsv = path.resolve(projectRoot, "frontend", "public", "sapc_503_student_credentials.csv");

fs.writeFileSync(rootStudentCsv, studentCsvContent, "utf-8");
fs.writeFileSync(publicStudentCsv, studentCsvContent, "utf-8");
console.log(`Refreshed student credentials CSV with linked guardian data at:\n- ${rootStudentCsv}\n- ${publicStudentCsv}`);

// Write parents503.ts
const parents503Path = path.resolve(projectRoot, "frontend", "src", "data", "parents503.ts");
const parentsTsContent = `// Auto-generated 503 SAPC Junior High School Parent / Guardian Registry
export interface ParentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  linkedStudentName: string;
  linkedLRN: string;
  linkedLRNs?: string[];
  linkedStudentNames?: string[];
  section: string;
  gradeLevel: string;
  status: "Active" | "Pending Activation" | "Suspended";
  verifiedAt: string;
  sf9Access: boolean;
  attendanceAlerts: boolean;
  riskAlerts: boolean;
  initialPassword?: string;
}

export const SAPC_503_PARENTS: ParentRecord[] = ${JSON.stringify(parentRecords, null, 2)};
`;
fs.writeFileSync(parents503Path, parentsTsContent, "utf-8");
console.log(`Wrote TypeScript dataset to ${parents503Path}`);

// Write Firebase Auth Import JSON
const authImportPath = path.resolve(projectRoot, "sapc_503_parent_firebase_auth_import.json");
const authImportData = {
  users: parentAuthUsers
};
fs.writeFileSync(authImportPath, JSON.stringify(authImportData, null, 2), "utf-8");
console.log(`Wrote Firebase Auth Import JSON to ${authImportPath}`);
