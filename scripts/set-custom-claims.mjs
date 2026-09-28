#!/usr/bin/env node

/**
 * SAPC IntellySys — Custom Claims Management Script
 * 
 * Sets custom claims on Firebase Auth accounts to enforce role-based access
 * in Firestore Security Rules (request.auth.token.role, etc.).
 *
 * Usage:
 *   node scripts/set-custom-claims.mjs <email_or_uid> <role> [lrn] [linked_lrns_csv]
 *   node scripts/set-custom-claims.mjs --sync-all
 *   node scripts/set-custom-claims.mjs --init-demo
 *
 * Examples:
 *   node scripts/set-custom-claims.mjs admin@sapc.edu.ph admin
 *   node scripts/set-custom-claims.mjs teacher@sapc.edu.ph teacher
 *   node scripts/set-custom-claims.mjs counselor@sapc.edu.ph guidance_counselor
 *   node scripts/set-custom-claims.mjs student@sapc.edu.ph student 108543120001
 *   node scripts/set-custom-claims.mjs parent@sapc.edu.ph parent "" "108543120001,108543120002"
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from frontend/.env.local if available
function loadEnv() {
  const envPath = path.resolve(process.cwd(), "frontend", ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "sapc-intellysys-ph";

  if (serviceAccountKey) {
    try {
      const parsed = typeof serviceAccountKey === "string" && serviceAccountKey.trim().startsWith("{")
        ? JSON.parse(serviceAccountKey)
        : JSON.parse(Buffer.from(serviceAccountKey, "base64").toString("utf-8"));
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || projectId,
      });
    } catch (e) {
      console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT_KEY:", e.message);
    }
  }

  // Use application default credentials or project ID
  return initializeApp({
    projectId,
  });
}

const app = initAdmin();
const auth = getAuth(app);
const db = getFirestore(app);

const VALID_ROLES = ["admin", "guidance_counselor", "teacher", "parent", "student"];

const DEMO_ACCOUNTS = [
  { email: "admin@sapc.edu.ph", role: "admin" },
  { email: "counselor@sapc.edu.ph", role: "guidance_counselor" },
  { email: "teacher@sapc.edu.ph", role: "teacher" },
  { email: "student@sapc.edu.ph", role: "student", lrn: "108543120001" },
  { email: "parent@sapc.edu.ph", role: "parent", linked_lrns: ["108543120001"] },
];

async function findUser(identifier) {
  try {
    if (identifier.includes("@")) {
      return await auth.getUserByEmail(identifier);
    } else {
      return await auth.getUser(identifier);
    }
  } catch (err) {
    return null;
  }
}

async function setClaimsForUser(userRecord, role, lrn = null, linked_lrns = []) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role '${role}'. Must be one of: ${VALID_ROLES.join(", ")}`);
  }

  const claims = {
    role,
    lrn: lrn || null,
    linked_lrns: Array.isArray(linked_lrns) ? linked_lrns : [],
    primary_lrn: lrn || (Array.isArray(linked_lrns) && linked_lrns.length > 0 ? linked_lrns[0] : null),
    claims_updated_at: Date.now(),
  };

  await auth.setCustomUserClaims(userRecord.uid, claims);
  console.log(`[OK] Custom claims applied to ${userRecord.email || userRecord.uid}:`, claims);

  // Sync to Firestore /users/{uid} as well
  try {
    await db.collection("users").doc(userRecord.uid).set(
      {
        role,
        lrn: claims.lrn,
        linked_lrns: claims.linked_lrns,
        primary_lrn: claims.primary_lrn,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    console.log(`[OK] Synced profile to Firestore /users/${userRecord.uid}`);
  } catch (dbErr) {
    console.warn(`[WARN] Could not sync Firestore profile doc: ${dbErr.message}`);
  }
}

async function initDemoAccounts() {
  console.log("Setting custom claims on standard SAPC accounts...");
  for (const acct of DEMO_ACCOUNTS) {
    const user = await findUser(acct.email);
    if (user) {
      await setClaimsForUser(user, acct.role, acct.lrn, acct.linked_lrns || []);
    } else {
      console.log(`[INFO] Account ${acct.email} does not exist in Firebase Auth yet (will be claimed upon creation).`);
    }
  }
}

async function syncAllUsers() {
  console.log("Scanning all users in Firestore and Firebase Auth...");
  try {
    const snapshot = await db.collection("users").get();
    let count = 0;
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const uid = docSnap.id;
      let user = null;
      try {
        user = await auth.getUser(uid);
      } catch {
        if (data.email) {
          user = await findUser(data.email);
        }
      }

      if (user) {
        const role = data.role || "student";
        const lrn = data.lrn || data.metadata?.lrn || null;
        let linked_lrns = data.linked_lrns || [];
        if (linked_lrns.length === 0 && data.metadata?.childLrn) {
          linked_lrns = [data.metadata.childLrn];
        }
        await setClaimsForUser(user, role, lrn, linked_lrns);
        count++;
      }
    }
    console.log(`[DONE] Synced custom claims for ${count} users.`);
  } catch (err) {
    console.error("[ERROR] Failed to sync users:", err.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
SAPC Custom Claims Manager
--------------------------
Commands:
  node scripts/set-custom-claims.mjs --init-demo
  node scripts/set-custom-claims.mjs --sync-all
  node scripts/set-custom-claims.mjs <email_or_uid> <role> [lrn] [linked_lrns_csv]

Roles:
  admin | guidance_counselor | teacher | parent | student
    `);
    process.exit(0);
  }

  if (args[0] === "--init-demo") {
    await initDemoAccounts();
    process.exit(0);
  }

  if (args[0] === "--sync-all") {
    await syncAllUsers();
    process.exit(0);
  }

  const [identifier, role, lrn, linked_lrns_csv] = args;
  const user = await findUser(identifier);
  if (!user) {
    console.error(`[ERROR] User not found: ${identifier}`);
    process.exit(1);
  }

  const linked_lrns = linked_lrns_csv ? linked_lrns_csv.split(",").map((s) => s.trim()) : [];
  await setClaimsForUser(user, role, lrn || null, linked_lrns);
  process.exit(0);
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
