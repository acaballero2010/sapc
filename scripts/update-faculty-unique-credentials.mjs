import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

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

// Complete official list of 25 Faculty & Guidance Counselors
const FACULTY_LIST = [
  // Institutional Leadership
  {
    name: "Dr. Remedios Santos, Ed.D.",
    email: "admin@sapc.edu.ph",
    role: "admin",
    department: "Office of the Vice President for Academic Affairs",
    section: "Executive Administration",
    grade_level: "Institution-Wide",
    employee_id: "SAPC-ADM-2020-001",
    phone: "+63 917 100 2000"
  },
  // Guidance Counselors (RGC)
  {
    name: "Maria Theresa Cruz, RGC",
    email: "counselor@sapc.edu.ph",
    role: "guidance_counselor",
    department: "Guidance & Counseling Center",
    section: "Main Guidance Center - Room 101",
    grade_level: "All Levels (RGC Head)",
    employee_id: "SAPC-COUN-2020-001",
    prc_license_no: "PRC-RGC-007812",
    phone: "+63 917 333 4455"
  },
  {
    name: "Dr. Elena Ramos, RGC",
    email: "elena.ramos@sapc.edu.ph",
    role: "guidance_counselor",
    department: "Guidance & Counseling Center",
    section: "Guidance Office - Room 204",
    grade_level: "Grades 7-10 (Junior High)",
    employee_id: "SAPC-COUN-2021-008",
    prc_license_no: "PRC-RGC-008924",
    phone: "+63 917 555 8924"
  },
  {
    name: "Mr. Francis M. Tolentino, RGC",
    email: "francis.tolentino@sapc.edu.ph",
    role: "guidance_counselor",
    department: "Guidance & Counseling Center",
    section: "Guidance Office - Room 202",
    grade_level: "Grades 7-10 (Junior High)",
    employee_id: "SAPC-COUN-2022-019",
    prc_license_no: "PRC-RGC-009102",
    phone: "+63 919 444 3210"
  },
  {
    name: "Dr. Victor Hernandez, RGC",
    email: "victor.hernandez@sapc.edu.ph",
    role: "guidance_counselor",
    department: "Guidance & Counseling Center",
    section: "Guidance Office - Room 205",
    grade_level: "Grades 7-10 (Senior High Lead)",
    employee_id: "SAPC-COUN-2023-025",
    prc_license_no: "PRC-RGC-009841",
    phone: "+63 918 223 4567"
  },
  {
    name: "Ms. Clarissa Ramos, RGC",
    email: "clarissa.ramos@sapc.edu.ph",
    role: "guidance_counselor",
    department: "Guidance & Counseling Center",
    section: "Guidance Office - Room 203",
    grade_level: "Grades 7-10 (Crisis & Career)",
    employee_id: "SAPC-COUN-2024-031",
    prc_license_no: "PRC-RGC-009912",
    phone: "+63 920 445 6789"
  },
  // Junior & Senior High Teachers
  {
    name: "Prof. Ernesto Bautista, LPT",
    email: "teacher@sapc.edu.ph",
    role: "teacher",
    department: "Junior & Senior High Science",
    section: "Grade 8 - St. Benedict",
    grade_level: "Grade 8",
    employee_id: "SAPC-FAC-2020-005",
    phone: "+63 918 555 6677"
  },
  {
    name: "Ms. Elena Bautista, LPT",
    email: "elena.bautista@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 7 - St. Anthony",
    grade_level: "Grade 7",
    employee_id: "SAPC-FAC-2023-001",
    phone: "+63 917 112 0001"
  },
  {
    name: "Mr. Carlos Dizon, LPT",
    email: "carlos.dizon@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 7 - St. Bernadette",
    grade_level: "Grade 7",
    employee_id: "SAPC-FAC-2023-002",
    phone: "+63 917 112 0002"
  },
  {
    name: "Ms. Maria Theresa Cruz, LPT",
    email: "mariatheresa.cruz@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 7 - St. Francis",
    grade_level: "Grade 7",
    employee_id: "SAPC-FAC-2023-003",
    phone: "+63 917 112 0003"
  },
  {
    name: "Mr. Roberto Santos, LPT",
    email: "roberto.santos@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 7 - St. Therese",
    grade_level: "Grade 7",
    employee_id: "SAPC-FAC-2023-014",
    phone: "+63 917 842 1092"
  },
  {
    name: "Ms. Katrina Salazar, LPT",
    email: "katrina.salazar@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 8 - St. Dominic",
    grade_level: "Grade 8",
    employee_id: "SAPC-FAC-2024-005",
    phone: "+63 917 112 0005"
  },
  {
    name: "Mr. Joseph Morales, LPT",
    email: "joseph.morales@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 8 - St. Jude",
    grade_level: "Grade 8",
    employee_id: "SAPC-FAC-2022-006",
    phone: "+63 917 112 0006"
  },
  {
    name: "Mr. Mark Villanueva, LPT",
    email: "mark.villanueva@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 8 - St. Lorenzo",
    grade_level: "Grade 8",
    employee_id: "SAPC-FAC-2024-007",
    phone: "+63 917 112 0007"
  },
  {
    name: "Ms. Angela Reyes, LPT",
    email: "angela.reyes@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 8 - St. Clare",
    grade_level: "Grade 8",
    employee_id: "SAPC-FAC-2023-008",
    phone: "+63 917 112 0008"
  },
  {
    name: "Ms. Pamela Rivera, LPT",
    email: "pamela.rivera@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 9 - St. Paul",
    grade_level: "Grade 9",
    employee_id: "SAPC-FAC-2023-009",
    phone: "+63 917 112 0009"
  },
  {
    name: "Mr. Ronald Ramos, LPT",
    email: "ronald.ramos@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 9 - St. Peter",
    grade_level: "Grade 9",
    employee_id: "SAPC-FAC-2022-010",
    phone: "+63 917 112 0010"
  },
  {
    name: "Mr. Emmanuel Flores, LPT",
    email: "emmanuel.flores@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 9 - St. Augustine",
    grade_level: "Grade 9",
    employee_id: "SAPC-FAC-2024-011",
    phone: "+63 917 112 0011"
  },
  {
    name: "Ms. Clarisse Ocampo, LPT",
    email: "clarisse.ocampo@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 9 - St. Thomas",
    grade_level: "Grade 9",
    employee_id: "SAPC-FAC-2023-012",
    phone: "+63 917 112 0012"
  },
  {
    name: "Ms. Jennifer Tolentino, LPT",
    email: "jennifer.tolentino@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 10 - St. Joseph",
    grade_level: "Grade 10",
    employee_id: "SAPC-FAC-2021-013",
    phone: "+63 917 112 0013"
  },
  {
    name: "Ms. Veronica Dimaculangan, LPT",
    email: "veronica.dimaculangan@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 10 - St. Michael",
    grade_level: "Grade 10",
    employee_id: "SAPC-FAC-2023-015",
    phone: "+63 917 112 0014"
  },
  {
    name: "Mr. Dennis Castro, LPT",
    email: "dennis.castro@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 10 - St. Gabriel",
    grade_level: "Grade 10",
    employee_id: "SAPC-FAC-2022-015",
    phone: "+63 917 112 0015"
  },
  {
    name: "Mrs. Teresa Santos, LPT",
    email: "teresa.santos@sapc.edu.ph",
    role: "teacher",
    department: "Junior High Department",
    section: "Grade 10 - St. Raphael",
    grade_level: "Grade 10",
    employee_id: "SAPC-FAC-2022-089",
    phone: "+63 918 331 4059"
  },
  {
    name: "Mrs. Clara Buenaflor, LPT",
    email: "clara.buenaflor@sapc.edu.ph",
    role: "teacher",
    department: "Senior High HUMSS Department",
    section: "Grade 11 - St. Thomas (HUMSS)",
    grade_level: "Grade 11",
    employee_id: "SAPC-FAC-2023-016",
    phone: "+63 918 442 5060"
  },
  {
    name: "Mr. Arnold Dizon, LPT",
    email: "arnold.dizon@sapc.edu.ph",
    role: "teacher",
    department: "Senior High ABM Department",
    section: "Grade 11 - St. Clare (ABM)",
    grade_level: "Grade 11",
    employee_id: "SAPC-FAC-2024-017",
    phone: "+63 919 553 6071"
  },
  {
    name: "Prof. Annalyn Cruz, LPT",
    email: "annalyn.cruz@sapc.edu.ph",
    role: "teacher",
    department: "Senior High ABM Department",
    section: "Grade 12 - St. Jude (ABM)",
    grade_level: "Grade 12",
    employee_id: "SAPC-FAC-2024-002",
    phone: "+63 920 119 2847"
  },
  {
    name: "Engr. Paul Valdez",
    email: "paul.valdez@sapc.edu.ph",
    role: "teacher",
    department: "Senior High STEM Department",
    section: "Chemistry & Physics Faculty",
    grade_level: "Grade 11-12",
    employee_id: "SAPC-FAC-2021-045",
    phone: "+63 922 776 5432"
  },
  {
    name: "Ms. Jessica Alcantara, LPT",
    email: "jessica.alcantara@sapc.edu.ph",
    role: "teacher",
    department: "Senior High HUMSS Department",
    section: "Grade 11 - San Lorenzo Ruiz (HUMSS)",
    grade_level: "Grade 11",
    employee_id: "SAPC-FAC-2024-019",
    phone: "+63 915 678 1234"
  }
];

// Helper to generate distinct temporary password
function generateTempPassword(faculty, idx) {
  if (faculty.email === "admin@sapc.edu.ph" || faculty.role === "admin") {
    return "SAPC@Admin2026!";
  }
  const digits = (faculty.employee_id || "").replace(/\D/g, "");
  const suffix = digits.slice(-3) || String(idx + 1).padStart(3, "0");
  if (faculty.role === "guidance_counselor") {
    return `SAPC@Coun${suffix}!`;
  }
  return `SAPC@Fac${suffix}!`;
}

async function run() {
  console.log("\n🔐 Generating Individualized Credentials for all Faculty & Counselors...");

  const processed = FACULTY_LIST.map((f, idx) => {
    const tempPass = generateTempPassword(f, idx);
    return {
      ...f,
      temp_password: tempPass
    };
  });

  // 1. Generate CSV content
  const csvHeaders = "role,full_name,email,lrn_or_id,grade_level,section,department,temp_password,phone,account_status";
  const csvRows = processed.map(f => {
    const role = f.role;
    const name = `"${f.name}"`;
    const email = f.email;
    const empId = f.employee_id;
    const grade = `"${f.grade_level}"`;
    const sec = `"${f.section}"`;
    const dept = `"${f.department}"`;
    const pass = f.temp_password;
    const phone = f.phone;
    const status = `Active / ${f.role === "guidance_counselor" ? "Guidance Counselor" : (f.role === "admin" ? "Platform Administrator" : "Faculty")}`;
    return `${role},${name},${email},${empId},${grade},${sec},${dept},${pass},${phone},${status}`;
  });

  const fullCsv = [csvHeaders, ...csvRows].join("\n");

  const rootCsv = path.resolve(projectRoot, "sapc_faculty_credentials.csv");
  const publicCsv = path.resolve(projectRoot, "frontend", "public", "sapc_faculty_credentials.csv");
  fs.writeFileSync(rootCsv, fullCsv, "utf-8");
  fs.writeFileSync(publicCsv, fullCsv, "utf-8");
  console.log(`✅ Saved updated CSV to:\n  - ${rootCsv}\n  - ${publicCsv}`);

  // 2. Prepare Firebase Auth Import
  const authUsers = processed.map((f, idx) => {
    const passwordHash = crypto.createHash("sha256").update(f.temp_password).digest("base64");
    const rolePrefix = f.role.slice(0, 3);
    const digits = (f.employee_id || "").replace(/\D/g, "") || String(idx + 1);
    return {
      localId: `${rolePrefix}_${digits}`,
      email: f.email.toLowerCase().trim(),
      emailVerified: true,
      displayName: f.name,
      passwordHash,
      salt: ""
    };
  });

  const tempJsonPath = path.resolve(projectRoot, ".temp_faculty_auth_import.json");
  fs.writeFileSync(tempJsonPath, JSON.stringify({ users: authUsers }, null, 2), "utf-8");

  // 3. Import to Firebase Auth
  console.log(`🚀 Uploading ${authUsers.length} accounts to Firebase Auth (sapc-intellysys-ph)...`);
  try {
    const cmd = `npx firebase auth:import "${tempJsonPath}" --hash-algo=SHA256 --rounds=1 --project sapc-intellysys-ph`;
    execSync(cmd, { stdio: "inherit" });
    console.log(`🎉 SUCCESS: All faculty accounts updated in Firebase Auth!`);
  } catch (err) {
    console.error(`❌ Firebase Auth import error:`, err.message);
  } finally {
    if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
  }

  // 4. Update Firestore faculty_records
  console.log(`\n☁️ Synchronizing Firestore faculty_records collection...`);
  try {
    await signInWithEmailAndPassword(auth, "admin@sapc.edu.ph", "admin123");
    for (const f of processed) {
      const docId = f.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const ref = doc(db, "faculty_records", docId);
      await setDoc(ref, {
        id: f.employee_id,
        name: f.name,
        email: f.email,
        role: f.role,
        department: f.department,
        section: f.section,
        grade_level: f.grade_level,
        employee_id: f.employee_id,
        prc_license_no: f.prc_license_no || null,
        initial_password: f.temp_password,
        initialPassword: f.temp_password,
        status: "Active",
        phone: f.phone,
        updated_at: new Date().toISOString()
      }, { merge: true });
    }
    console.log(`✅ All ${processed.length} faculty documents synchronized in Firestore!`);
  } catch (err) {
    console.error(`⚠️ Firestore sync notice:`, err.message);
  }

  console.log("\n📋 Sample of Individualized Credentials:");
  processed.slice(0, 10).forEach(f => {
    console.log(`  • ${f.name.padEnd(30)} [${f.employee_id}] -> Email: ${f.email.padEnd(32)} Pass: ${f.temp_password}`);
  });
}

run();
