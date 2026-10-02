import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, doc, writeBatch } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const firebaseConfig = {
  apiKey: "AIzaSyAi9KdQAuOdyEo1T3SURKMjKJ3iVWeABb0",
  authDomain: "sapc-intellysys-ph.firebaseapp.com",
  projectId: "sapc-intellysys-ph"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Read parents from frontend/src/data/parents503.ts
const parentsFile = path.resolve(projectRoot, "frontend", "src", "data", "parents503.ts");
const rawContent = fs.readFileSync(parentsFile, "utf-8");
const jsonMatch = rawContent.match(/export const SAPC_503_PARENTS: ParentRecord\[\] = (\[[\s\S]*?\]);/);

if (!jsonMatch) {
  console.error("❌ Could not parse SAPC_503_PARENTS from parents503.ts");
  process.exit(1);
}

const parents = JSON.parse(jsonMatch[1]);
console.log(`📋 Found ${parents.length} parents in parents503.ts.`);

async function syncParents() {
  console.log("🔑 Authenticating as admin@sapc.edu.ph...");
  await signInWithEmailAndPassword(auth, "admin@sapc.edu.ph", "admin123");
  console.log("✅ Authenticated!");

  console.log("☁️ Syncing all 503 parents into Firestore parent_records in batches of 400...");
  const BATCH_SIZE = 400;
  for (let i = 0; i < parents.length; i += BATCH_SIZE) {
    const chunk = parents.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    
    chunk.forEach(p => {
      const docId = p.id || `PAR-${String(i + 1).padStart(3, "0")}`;
      const ref = doc(db, "parent_records", docId);
      batch.set(ref, {
        id: docId,
        name: p.name,
        email: p.email,
        phone: p.phone,
        relationship: p.relationship,
        linkedStudentName: p.linkedStudentName,
        linkedLRN: p.linkedLRN,
        linkedLRNs: p.linkedLRNs || [p.linkedLRN],
        linkedStudentNames: p.linkedStudentNames || [p.linkedStudentName],
        section: p.section,
        gradeLevel: p.gradeLevel,
        status: p.status || "Active",
        verifiedAt: p.verifiedAt || "2026-08-15",
        sf9Access: Boolean(p.sf9Access),
        attendanceAlerts: Boolean(p.attendanceAlerts),
        riskAlerts: Boolean(p.riskAlerts),
        initialPassword: p.initialPassword || "SAPC@P2026!",
        initial_password: p.initialPassword || "SAPC@P2026!"
      }, { merge: true });
    });

    await batch.commit();
    console.log(`  ✅ Committed batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} parents)`);
  }

  console.log("🎉 Successfully synced all 503 parents into Firestore parent_records!");
}

syncParents().catch(err => {
  console.error("❌ Sync error:", err);
  process.exit(1);
});
