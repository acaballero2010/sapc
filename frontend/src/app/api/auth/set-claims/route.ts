import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body
    }

    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : body.idToken;

    if (!idToken) {
      return NextResponse.json(
        { error: "Unauthorized: Missing ID token" },
        { status: 401 }
      );
    }

    // Verify caller's Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const callerUid = decodedToken.uid;
    const targetUid = body.uid || callerUid;

    // Authorization check: User can set their own claims (derived from Firestore / registration),
    // or an Admin can set claims for any user.
    const isSelf = callerUid === targetUid;
    const isAdmin = decodedToken.role === "admin" || decodedToken.email?.toLowerCase().includes("admin@sapc.edu.ph");

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify custom claims for other users" },
        { status: 403 }
      );
    }

    // Read the user's profile from Firestore to confirm authorized role and identity linkages
    let role = body.role;
    let lrn = body.lrn || null;
    let linked_lrns = body.linked_lrns || [];
    let primary_lrn = body.primary_lrn || lrn || null;

    try {
      const userDoc = await adminDb.collection("users").doc(targetUid).get();
      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        // If not explicitly provided in body by an admin, derive from Firestore
        if (!isAdmin || !body.role) {
          role = userData.role || role || "student";
        }
        if (!lrn && userData.lrn) lrn = userData.lrn;
        if (!lrn && userData.metadata?.lrn) lrn = userData.metadata.lrn;

        if ((!linked_lrns || linked_lrns.length === 0) && userData.linked_lrns) {
          linked_lrns = userData.linked_lrns;
        } else if ((!linked_lrns || linked_lrns.length === 0) && userData.metadata?.childLrn) {
          linked_lrns = [userData.metadata.childLrn];
        }

        if (!primary_lrn) {
          primary_lrn = userData.primary_lrn || lrn || linked_lrns[0] || null;
        }
      }
    } catch (dbErr) {
      console.warn("[set-claims] Could not fetch Firestore user doc:", dbErr);
    }

    const validRoles = ["admin", "guidance_counselor", "teacher", "parent", "student"];
    if (!role || !validRoles.includes(role)) {
      role = "student";
    }

    const claims = {
      role,
      lrn: lrn || null,
      linked_lrns: Array.isArray(linked_lrns) ? linked_lrns : [],
      primary_lrn: primary_lrn || null,
      claims_updated_at: Date.now(),
    };

    // Apply custom claims to Firebase Auth user
    await adminAuth.setCustomUserClaims(targetUid, claims);

    return NextResponse.json({
      success: true,
      uid: targetUid,
      claims,
    });
  } catch (error: any) {
    console.error("[set-claims] Error setting custom claims:", error);
    return NextResponse.json(
      { error: error.message || "Failed to set custom claims" },
      { status: 500 }
    );
  }
}
