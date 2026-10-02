#!/usr/bin/env node

/**
 * SAPC IntellySys — Universal CSV to Firebase Uploader
 * 
 * Usage:
 *   node scripts/upload-csv-to-firebase.mjs [path_to_csv]
 * 
 * Examples:
 *   node scripts/upload-csv-to-firebase.mjs sapc_503_student_credentials.csv
 *   node scripts/upload-csv-to-firebase.mjs sapc_503_parent_credentials.csv
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// 1. Determine input CSV path
const inputArg = process.argv[2] || "sapc_503_student_credentials.csv";
const csvPath = path.isAbsolute(inputArg) ? inputArg : path.resolve(projectRoot, inputArg);

if (!fs.existsSync(csvPath)) {
  console.error(`❌ Error: CSV file not found at: ${csvPath}`);
  console.log(`\nUsage:\n  node scripts/upload-csv-to-firebase.mjs <filename.csv>\n`);
  process.exit(1);
}

console.log(`\n📂 Reading CSV: ${csvPath}`);
const rawCsv = fs.readFileSync(csvPath, "utf-8");

// 2. Simple CSV Parser
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const entries = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        entries.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    entries.push(current.trim());
    return entries;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[\s\-_/]/g, ""));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || "";
    });
    data.push(obj);
  }
  return data;
}

const records = parseCsv(rawCsv);
console.log(`📋 Parsed ${records.length} user records from CSV.`);

if (records.length === 0) {
  console.error("❌ No records found in CSV.");
  process.exit(1);
}

// 3. Format records for Firebase Auth Import
const authUsers = [];
let skippedCount = 0;

records.forEach((r, idx) => {
  const email = (r.email || r.useremail || "").toLowerCase().trim();
  const password = r.temppassword || r.password || r.temporarypassword || "SAPC@2026!";
  const name = r.fullname || r.parentname || r.name || email.split("@")[0];
  const lrn = (r.lrn_or_id || r.lrnorid || r.lrn || r.linkedstudentlrn || `user_${idx + 1}`).replace(/\D/g, "");

  if (!email || !email.includes("@")) {
    skippedCount++;
    return;
  }

  const role = (r.role || "student").toLowerCase();
  const prefix = role.slice(0, 3);
  const localId = `${prefix}_${lrn || (idx + 1)}`;

  const passwordHash = crypto.createHash("sha256").update(password).digest("base64");

  authUsers.push({
    localId,
    email,
    emailVerified: true,
    displayName: name,
    passwordHash,
    salt: ""
  });
});

console.log(`✨ Prepared ${authUsers.length} valid accounts (skipped ${skippedCount} invalid rows).`);

// 4. Save temporary import JSON
const tempJsonPath = path.resolve(projectRoot, ".temp_firebase_auth_import.json");
fs.writeFileSync(tempJsonPath, JSON.stringify({ users: authUsers }, null, 2), "utf-8");

// 5. Execute Firebase CLI auth:import
console.log(`🚀 Uploading accounts to Firebase Auth (Project: sapc-intellysys-ph)...`);
try {
  const cmd = `npx firebase auth:import "${tempJsonPath}" --hash-algo=SHA256 --rounds=1 --project sapc-intellysys-ph`;
  execSync(cmd, { stdio: "inherit" });
  console.log(`\n🎉 SUCCESS! All accounts from "${path.basename(csvPath)}" are now active in Firebase Auth!`);
} catch (err) {
  console.error(`\n❌ Firebase Auth import encountered an error.`, err.message);
} finally {
  // Clean up temporary file
  if (fs.existsSync(tempJsonPath)) {
    fs.unlinkSync(tempJsonPath);
  }
}
