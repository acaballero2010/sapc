import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyAi9KdQAuOdyEo1T3SURKMjKJ3iVWeABb0",
  authDomain:        "sapc-intellysys-ph.firebaseapp.com",
  projectId:         "sapc-intellysys-ph",
  storageBucket:     "sapc-intellysys-ph.firebasestorage.app",
  messagingSenderId: "923880712593",
  appId:             "1:923880712593:web:942fcdeac9a8e251519230",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CORE_ACCOUNTS = [
  {
    email: "admin@sapc.edu.ph",
    pass: "admin123",
    name: "Dr. Remedios Santos, Ed.D.",
    role: "admin",
    department: "Office of the Vice President for Academic Affairs"
  },
  {
    email: "counselor@sapc.edu.ph",
    pass: "counselor123",
    name: "Maria Theresa Cruz, RGC",
    role: "guidance_counselor",
    department: "Guidance & Counseling Center"
  },
  {
    email: "teacher@sapc.edu.ph",
    pass: "teacher123",
    name: "Prof. Ernesto Bautista",
    role: "teacher",
    section: "Grade 10 - St. Augustine",
    department: "Senior High STEM / Junior High Science"
  },
  {
    email: "student@sapc.edu.ph",
    pass: "student123",
    name: "Joshua Dimaculangan",
    role: "student",
    lrn: "108543120001",
    student_id: 1,
    grade_level: 10,
    section: "Grade 10 - St. Augustine"
  },
  {
    email: "parent@sapc.edu.ph",
    pass: "parent123",
    name: "Mrs. Teresa Dimaculangan",
    role: "parent",
    lrn: "108543120001",
    linked_lrns: ["108543120001"],
    student_id: 1
  }
];

async function seedAccount(acc) {
  let user = null;
  try {
    const cred = await signInWithEmailAndPassword(auth, acc.email, acc.pass);
    user = cred.user;
    console.log(`[EXISTS] ${acc.email} is already in Firebase Auth (UID: ${user.uid})`);
  } catch (err) {
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      try {
        const cred = await createUserWithEmailAndPassword(auth, acc.email, acc.pass);
        user = cred.user;
        console.log(`[CREATED] ${acc.email} created in Firebase Auth (UID: ${user.uid})`);
      } catch (createErr) {
        console.error(`[ERROR] Could not create ${acc.email}:`, createErr.message);
        return;
      }
    } else {
      console.error(`[AUTH ERR] ${acc.email}:`, err.message);
      return;
    }
  }

  if (user) {
    try {
      await updateProfile(user, { displayName: acc.name });
    } catch {}

    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: acc.email,
        name: acc.name,
        displayName: acc.name,
        full_name: acc.name,
        role: acc.role,
        roleConfirmed: true,
        lrn: acc.lrn || null,
        linked_lrns: acc.linked_lrns || (acc.lrn ? [acc.lrn] : []),
        primary_lrn: acc.lrn || (acc.linked_lrns && acc.linked_lrns[0]) || null,
        student_id: acc.student_id || null,
        section: acc.section || null,
        grade_level: acc.grade_level || null,
        department: acc.department || null,
        verified: true,
        verification_status: "active",
        linkageStatus: "verified",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });
      console.log(`[SYNCED] Firestore profile updated for ${acc.email}`);
    } catch (dbErr) {
      console.warn(`[WARN] Firestore profile write for ${acc.email}:`, dbErr.message);
    }
  }
}

async function main() {
  console.log("=== Provisioning Core Institutional Accounts in Firebase Auth ===");
  for (const acc of CORE_ACCOUNTS) {
    await seedAccount(acc);
  }
  console.log("=== Seeding Complete ===");
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
