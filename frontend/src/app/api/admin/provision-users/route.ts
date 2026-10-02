import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export interface ProvisionUserPayload {
  role: "admin" | "guidance_counselor" | "teacher" | "parent" | "student";
  full_name: string;
  email: string;
  lrn_or_id: string;
  grade_level?: string;
  section?: string;
  department?: string;
  temp_password?: string;
  phone?: string;
  guardian_name?: string;
  guardian_contact?: string;
  child_lrns?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUsers: ProvisionUserPayload[] = Array.isArray(body?.users) ? body.users : [];

    if (rawUsers.length === 0) {
      return NextResponse.json(
        { error: "No user records provided for provisioning." },
        { status: 400 }
      );
    }

    const hasCreds = hasAdminCredentials();
    const results: Array<{
      email: string;
      full_name: string;
      role: string;
      lrn_or_id: string;
      temp_password?: string;
      section?: string;
      uid?: string;
      status: "created" | "updated" | "failed";
      error?: string;
    }> = [];

    // Process each user account
    for (const u of rawUsers) {
      const email = (u.email || "").trim().toLowerCase();
      const fullName = (u.full_name || "").trim();
      const role = u.role || "student";
      const identifier = (u.lrn_or_id || "").trim();
      const cleanDigits = identifier.replace(/\D/g, "");
      const tempPass = (u.temp_password || "").trim() || `SAPC@${cleanDigits.slice(-4) || "2026"}!`;

      if (!email || !email.includes("@")) {
        results.push({
          email: u.email || "unknown",
          full_name: fullName,
          role,
          lrn_or_id: identifier,
          status: "failed",
          error: "Invalid email format"
        });
        continue;
      }

      if (!hasCreds) {
        // Direct Firebase Auth provisioning via Google Identity Toolkit REST API
        try {
          const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAi9KdQAuOdyEo1T3SURKMjKJ3iVWeABb0";
          let uid = "";
          let action: "created" | "updated" = "created";

          const signUpRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: tempPass, returnSecureToken: true })
          });
          const signUpData = await signUpRes.json();

          if (signUpData.localId) {
            uid = signUpData.localId;
            action = "created";
            // Update display name
            await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: signUpData.idToken, displayName: fullName, returnSecureToken: true })
            }).catch(() => {});
          } else if (signUpData.error?.message?.includes("EMAIL_EXISTS")) {
            action = "updated";
            // Existing user — try login to update password
            const loginRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password: tempPass, returnSecureToken: true })
            });
            const loginData = await loginRes.json();
            uid = loginData.localId || `stu_${cleanDigits || Date.now()}`;
          } else {
            throw new Error(signUpData.error?.message || "Failed to create account in Firebase Auth");
          }

          results.push({
            email,
            full_name: fullName,
            role,
            lrn_or_id: identifier,
            temp_password: tempPass,
            section: u.section || "",
            uid,
            status: action
          });
          continue;
        } catch (authErr: any) {
          results.push({
            email,
            full_name: fullName,
            role,
            lrn_or_id: identifier,
            status: "failed",
            error: authErr?.message || "Authentication creation failed"
          });
          continue;
        }
      }

      try {
        let uid = "";
        let isExisting = false;

        try {
          const existingUser = await adminAuth.getUserByEmail(email);
          uid = existingUser.uid;
          isExisting = true;
          // Update password and display name
          await adminAuth.updateUser(uid, {
            displayName: fullName,
            password: tempPass
          });
        } catch (findErr: any) {
          if (findErr?.code === "auth/user-not-found") {
            const created = await adminAuth.createUser({
              email,
              displayName: fullName,
              password: tempPass,
              emailVerified: true
            });
            uid = created.uid;
          } else {
            throw findErr;
          }
        }

        // Set custom claims for RBAC and security rules
        await adminAuth.setCustomUserClaims(uid, {
          role,
          lrn: identifier || null,
          linked_lrns: u.child_lrns || []
        });

        // Write official pre-provisioned profile to Firestore
        const userDocRef = adminDb.collection("users").doc(uid);
        await userDocRef.set({
          uid,
          email,
          full_name: fullName,
          name: fullName,
          displayName: fullName,
          role,
          roleConfirmed: true,
          lrn: identifier || null,
          primary_lrn: identifier || (u.child_lrns && u.child_lrns[0]) || null,
          linked_lrns: u.child_lrns || [],
          section: u.section || null,
          grade_level: u.grade_level || null,
          department: u.department || null,
          phone: u.phone || null,
          guardian_name: u.guardian_name || null,
          guardian_contact: u.guardian_contact || null,
          mustChangePassword: true,
          isVerified: true,
          authProvider: "institutional_provisioned",
          verified: true,
          verification_status: "active",
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // If student, sync with 'students' collection
        if (role === "student" && identifier) {
          const studentDocRef = adminDb.collection("students").doc(identifier);
          await studentDocRef.set({
            lrn: identifier,
            full_name: fullName,
            email,
            section_name: u.section || "Grade 7 - St. Anthony",
            grade_level: u.grade_level ? parseInt(String(u.grade_level).replace(/\D/g, ""), 10) || 7 : 7,
            strand: "JHS",
            guardian_name: u.guardian_name || "",
            guardian_contact: u.guardian_contact || "",
            updatedAt: FieldValue.serverTimestamp()
          }, { merge: true });
        }

        results.push({
          email,
          full_name: fullName,
          role,
          lrn_or_id: identifier,
          temp_password: tempPass,
          section: u.section || "",
          uid,
          status: isExisting ? "updated" : "created"
        });
      } catch (userErr: any) {
        console.error(`[Provisioning] Error provisioning ${email}:`, userErr);
        results.push({
          email,
          full_name: fullName,
          role,
          lrn_or_id: identifier,
          status: "failed",
          error: userErr?.message || "Firebase Auth / Firestore provisioning failure"
        });
      }
    }

    const successCount = results.filter(r => r.status === "created" || r.status === "updated").length;
    const failCount = results.filter(r => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      localDev: !hasCreds,
      total: rawUsers.length,
      successCount,
      failCount,
      results
    });
  } catch (err: any) {
    console.error("[Provisioning Route Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during user provisioning" },
      { status: 500 }
    );
  }
}
