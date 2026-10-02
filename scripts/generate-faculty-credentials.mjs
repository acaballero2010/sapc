#!/usr/bin/env node

/**
 * SAPC IntellySys — Faculty & Guidance Counselors Credentials Generator
 * 
 * Generates official institutional credentials and dataset for all SAPC Faculty
 * and Guidance Counselors:
 * - 4 Guidance Counselors (including Department Head Maria Theresa Cruz)
 * - 16 Junior High School Class Advisers (Grades 7 - 10, all sections)
 * - 3 Subject Department Coordinators & Specialist Teachers
 * - 1 Academic Affairs Administrator (Dr. Remedios Santos)
 * 
 * Outputs:
 * 1. sapc_faculty_credentials.csv (root)
 * 2. frontend/public/sapc_faculty_credentials.csv (web download)
 * 3. sapc_faculty_firebase_auth_import.json (for direct Firebase Auth import)
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const facultyData = [
  // Guidance Counselors
  {
    role: "guidance_counselor",
    full_name: "Maria Theresa Cruz, RGC",
    email: "counselor@sapc.edu.ph",
    lrn_or_id: "SAPC-COUN-001",
    grade_level: "All Levels (RGC Head)",
    section: "Main Guidance Center - Room 101",
    department: "Guidance & Counseling Center",
    temp_password: "counselor123",
    phone: "+63 917 333 4455",
    prc_license_no: "PRC-RGC-007812",
    account_status: "Active / Lead Guidance Counselor"
  },
  {
    role: "guidance_counselor",
    full_name: "Dr. Elena Ramos, RGC",
    email: "elena.ramos@sapc.edu.ph",
    lrn_or_id: "SAPC-COUN-002",
    grade_level: "Grades 7-10 (Junior High)",
    section: "Guidance Office - Room 204",
    department: "Guidance & Counseling Center",
    temp_password: "counselor123",
    phone: "+63 917 555 8924",
    prc_license_no: "PRC-RGC-008924",
    account_status: "Active / Senior Counselor"
  },
  {
    role: "guidance_counselor",
    full_name: "Mr. Francis M. Tolentino, RGC",
    email: "francis.tolentino@sapc.edu.ph",
    lrn_or_id: "SAPC-COUN-003",
    grade_level: "Grades 7-10 (Junior High)",
    section: "Guidance Office - Room 202",
    department: "Guidance & Counseling Center",
    temp_password: "counselor123",
    phone: "+63 919 444 3210",
    prc_license_no: "PRC-RGC-009102",
    account_status: "Active / JHS Counselor"
  },
  {
    role: "guidance_counselor",
    full_name: "Ms. Kristine Mae Valdez, RGC",
    email: "kristine.valdez@sapc.edu.ph",
    lrn_or_id: "SAPC-COUN-004",
    grade_level: "Grades 7-10 (Crisis & Career)",
    section: "Guidance Office - Room 203",
    department: "Guidance & Counseling Center",
    temp_password: "counselor123",
    phone: "+63 920 888 7766",
    prc_license_no: "PRC-RGC-009450",
    account_status: "Active / Crisis Counselor"
  },

  // Faculty & Class Advisers
  {
    role: "teacher",
    full_name: "Prof. Ernesto Bautista, LPT",
    email: "teacher@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-001",
    grade_level: "Grade 8",
    section: "Grade 8 - St. Benedict",
    department: "Senior High STEM / Junior High Science",
    temp_password: "teacher123",
    phone: "+63 918 555 6677",
    account_status: "Active / Senior STEM Faculty"
  },
  {
    role: "teacher",
    full_name: "Ms. Elena Bautista, LPT",
    email: "elena.bautista@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-002",
    grade_level: "Grade 7",
    section: "Grade 7 - St. Anthony",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 917 555 0192",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mr. Carlos Dizon, LPT",
    email: "carlos.dizon@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-003",
    grade_level: "Grade 7",
    section: "Grade 7 - St. Bernadette",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 917 555 1203",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Ms. Maria Theresa Cruz, LPT",
    email: "mariatheresa.cruz@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-004",
    grade_level: "Grade 7",
    section: "Grade 7 - St. Francis",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 917 555 2314",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mr. Roberto Santos, LPT",
    email: "roberto.santos@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-005",
    grade_level: "Grade 7",
    section: "Grade 7 - St. Therese",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 917 842 1092",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mrs. Teresa Santos, LPT",
    email: "teresa.santos@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-006",
    grade_level: "Grade 8",
    section: "Grade 8 - St. Dominic",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 918 331 4059",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mr. Mark Anthony Reyes, LPT",
    email: "mark.reyes@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-007",
    grade_level: "Grade 8",
    section: "Grade 8 - St. Jude",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 917 223 8819",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Ms. Jessica Alcantara, LPT",
    email: "jessica.alcantara@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-008",
    grade_level: "Grade 8",
    section: "Grade 8 - St. Lorenzo",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 915 678 1234",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Prof. Annalyn Cruz, LPT",
    email: "annalyn.cruz@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-009",
    grade_level: "Grade 9",
    section: "Grade 9 - St. Paul",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 920 119 2847",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Ms. Sarah Jane Mendoza, LPT",
    email: "sarah.mendoza@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-010",
    grade_level: "Grade 9",
    section: "Grade 9 - St. Peter",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 918 776 1120",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Engr. Paul Valdez",
    email: "paul.valdez@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-011",
    grade_level: "Grade 9",
    section: "Grade 9 - St. Augustine",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 922 776 5432",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mr. Carlo Dominic Villanueva, LPT",
    email: "carlo.villanueva@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-012",
    grade_level: "Grade 9",
    section: "Grade 9 - St. Thomas",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 920 445 6678",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mr. Rolando Castillo, LPT",
    email: "rolando.castillo@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-013",
    grade_level: "Grade 10",
    section: "Grade 10 - St. Joseph",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 917 998 7766",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mrs. Cristina Morales, LPT",
    email: "cristina.morales@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-014",
    grade_level: "Grade 10",
    section: "Grade 10 - St. Michael",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 918 223 3344",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mr. Eduardo Ramos, LPT",
    email: "eduardo.ramos@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-015",
    grade_level: "Grade 10",
    section: "Grade 10 - St. Gabriel",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 919 334 4455",
    account_status: "Active / Class Adviser"
  },
  {
    role: "teacher",
    full_name: "Mrs. Rowena Perez, LPT",
    email: "rowena.perez@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-016",
    grade_level: "Grade 10",
    section: "Grade 10 - St. Raphael",
    department: "Junior High School",
    temp_password: "teacher123",
    phone: "+63 920 445 5566",
    account_status: "Active / Class Adviser"
  },

  // Subject Department Coordinators
  {
    role: "teacher",
    full_name: "Dr. Maria Gomez, LPT",
    email: "maria.gomez@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-017",
    grade_level: "Senior High & JHS",
    section: "General Chemistry / Biology",
    department: "Science Department Coordinator",
    temp_password: "teacher123",
    phone: "+63 917 667 8899",
    account_status: "Active / Department Head"
  },
  {
    role: "teacher",
    full_name: "Mr. Carlos Cruz, LPT",
    email: "carlos.cruz@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-018",
    grade_level: "Junior & Senior High",
    section: "English & Oral Communication",
    department: "Languages Department Coordinator",
    temp_password: "teacher123",
    phone: "+63 918 778 9900",
    account_status: "Active / Department Head"
  },
  {
    role: "teacher",
    full_name: "Coach Mark Morales",
    email: "mark.morales@sapc.edu.ph",
    lrn_or_id: "SAPC-FAC-019",
    grade_level: "All Levels",
    section: "PE & Health / Sports Guild",
    department: "MAPEH & Athletics Coordinator",
    temp_password: "teacher123",
    phone: "+63 919 889 0011",
    account_status: "Active / Athletics Head"
  },

  // Academic Administration
  {
    role: "admin",
    full_name: "Dr. Remedios Santos, Ed.D.",
    email: "admin@sapc.edu.ph",
    lrn_or_id: "SAPC-ADM-001",
    grade_level: "Institutional Leadership",
    section: "Office of Academic Affairs",
    department: "Office of the Vice President for Academic Affairs",
    temp_password: "admin123",
    phone: "+63 917 555 0100",
    account_status: "Active / Platform Administrator"
  }
];

function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Build CSV
const headers = [
  "role",
  "full_name",
  "email",
  "lrn_or_id",
  "grade_level",
  "section",
  "department",
  "temp_password",
  "phone",
  "account_status"
];

const rows = [headers.join(",")];
const authUsers = [];

facultyData.forEach((fac) => {
  rows.push([
    csvEscape(fac.role),
    csvEscape(fac.full_name),
    csvEscape(fac.email),
    csvEscape(fac.lrn_or_id),
    csvEscape(fac.grade_level),
    csvEscape(fac.section),
    csvEscape(fac.department),
    csvEscape(fac.temp_password),
    csvEscape(fac.phone),
    csvEscape(fac.account_status)
  ].join(","));

  const passwordHash = crypto.createHash("sha256").update(fac.temp_password).digest("base64");
  const localId = `fac_${fac.lrn_or_id.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

  authUsers.push({
    localId,
    email: fac.email,
    emailVerified: true,
    displayName: fac.full_name,
    passwordHash,
    salt: ""
  });
});

const csvContent = rows.join("\r\n");

// Write CSV files
const rootCsv = path.resolve(projectRoot, "sapc_faculty_credentials.csv");
const publicCsv = path.resolve(projectRoot, "frontend", "public", "sapc_faculty_credentials.csv");

fs.writeFileSync(rootCsv, csvContent, "utf-8");
fs.writeFileSync(publicCsv, csvContent, "utf-8");
console.log(`✅ Wrote Faculty Credentials CSV to:\n- ${rootCsv}\n- ${publicCsv}`);

// Write Firebase Auth Import JSON
const authImportPath = path.resolve(projectRoot, "sapc_faculty_firebase_auth_import.json");
fs.writeFileSync(authImportPath, JSON.stringify({ users: authUsers }, null, 2), "utf-8");
console.log(`✅ Wrote Firebase Auth Import JSON to ${authImportPath}`);
