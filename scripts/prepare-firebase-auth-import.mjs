#!/usr/bin/env node

/**
 * SAPC IntellySys — Firebase Auth Import JSON Generator
 * 
 * Generates the official firebase auth:import JSON for all 503 students
 * with SHA256 hashed temporary passwords and customClaims/customAttributes.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const csvPath = path.resolve(projectRoot, "sapc_503_student_credentials.csv");
if (!fs.existsSync(csvPath)) {
  console.error("Credentials CSV not found at:", csvPath);
  process.exit(1);
}

const lines = fs.readFileSync(csvPath, "utf-8").split(/\r?\n/).filter(l => l.trim().length > 0);
console.log(`Loaded ${lines.length - 1} records from CSV.`);

const users = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(val => val.replace(/^"|"$/g, "").trim()) || line.split(",").map(v => v.trim());

  const fullName = cols[1] || "";
  const email = (cols[2] || "").toLowerCase().trim();
  const lrn = cols[3] || "";
  const tempPassword = cols[7] || `SAPC@${lrn.slice(-4)}!`;

  if (!email || !email.includes("@")) continue;

  const passwordHash = crypto.createHash("sha256").update(tempPassword).digest("base64");

  users.push({
    localId: `stu_${lrn}`,
    email,
    emailVerified: true,
    displayName: fullName,
    passwordHash,
    customAttributes: JSON.stringify({
      role: "student",
      lrn: lrn,
      primary_lrn: lrn,
      linked_lrns: [lrn]
    })
  });
}

const importData = { users };
const outputPath = path.resolve(projectRoot, "sapc_503_firebase_auth_import.json");
fs.writeFileSync(outputPath, JSON.stringify(importData, null, 2), "utf-8");

console.log(`[SUCCESS] Prepared ${users.length} accounts in: ${outputPath}`);
