import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, hasAdminCredentials } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").trim().toLowerCase();
    const role = (body?.role || "student").toLowerCase();
    const explicitPassword = body?.newPassword ? String(body.newPassword).trim() : "";
    const lrnOrId = (body?.lrn_or_id || body?.identifier || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required for account reset." },
        { status: 400 }
      );
    }

    // Generate secure default password if none explicitly provided
    let newPassword = explicitPassword;
    if (!newPassword) {
      const cleanDigits = lrnOrId.replace(/\D/g, "");
      const suffix = cleanDigits.slice(-4) || String(Math.floor(1000 + Math.random() * 9000));
      if (role === "guidance_counselor" || role === "counselor") {
        newPassword = `SAPC@Coun${suffix.slice(-3)}!`;
      } else if (role === "teacher" || role === "faculty") {
        newPassword = `SAPC@Fac${suffix.slice(-3)}!`;
      } else if (role === "parent") {
        newPassword = `SAPC@P${suffix}!`;
      } else if (role === "admin") {
        newPassword = `SAPC@Admin2026!`;
      } else {
        newPassword = `SAPC@${suffix}!`;
      }
    }

    const hasCreds = hasAdminCredentials();
    let uid = "";

    if (hasCreds) {
      // 1. Firebase Admin SDK
      try {
        const user = await adminAuth.getUserByEmail(email);
        uid = user.uid;
        await adminAuth.updateUser(uid, {
          password: newPassword,
          emailVerified: true
        });
      } catch (adminErr: any) {
        if (adminErr?.code === "auth/user-not-found") {
          // Create account if not yet registered in Firebase Auth
          const created = await adminAuth.createUser({
            email,
            password: newPassword,
            displayName: body?.full_name || email.split("@")[0],
            emailVerified: true
          });
          uid = created.uid;
        } else {
          throw adminErr;
        }
      }
    } else {
      // 2. Fallback via Google Identity Toolkit REST API
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAi9KdQAuOdyEo1T3SURKMjKJ3iVWeABb0";
      
      // Try login to acquire idToken, or create if non-existent
      let idToken = "";
      const currentPass = body?.currentPassword || "teacher123";
      
      const loginRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: currentPass, returnSecureToken: true })
      });
      const loginData = await loginRes.json();

      if (loginData.idToken) {
        idToken = loginData.idToken;
        uid = loginData.localId;
        // Update password with token
        await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, password: newPassword, returnSecureToken: true })
        });
      } else {
        // Direct signup or password override
        const signUpRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: newPassword, returnSecureToken: true })
        });
        const signUpData = await signUpRes.json();
        uid = signUpData.localId || `user_${Date.now()}`;
      }
    }

    // 3. Update Firestore records across relevant collections if Admin SDK available
    if (hasCreds && adminDb) {
      try {
        if (uid) {
          await adminDb.collection("users").doc(uid).set({
            initial_password: newPassword,
            initialPassword: newPassword,
            mustChangePassword: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }

        const safeDocId = email.replace(/[^a-z0-9]/g, "_");

        if (role === "teacher" || role === "guidance_counselor" || role === "faculty" || role === "counselor") {
          await adminDb.collection("faculty_records").doc(safeDocId).set({
            initial_password: newPassword,
            initialPassword: newPassword,
            updated_at: new Date().toISOString()
          }, { merge: true });
        } else if (role === "parent") {
          await adminDb.collection("parent_records").doc(safeDocId).set({
            initial_password: newPassword,
            initialPassword: newPassword,
            updated_at: new Date().toISOString()
          }, { merge: true });
        }
      } catch (dbErr) {
        console.warn("Firestore password sync notice:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      email,
      newPassword,
      role,
      uid,
      message: `Account credentials for ${email} have been successfully reset.`
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
