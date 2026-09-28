import * as admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";

admin.initializeApp();

const VALID_ROLES = ["admin", "guidance_counselor", "teacher", "parent", "student"];

/**
 * Event-driven Cloud Function:
 * Automatically synchronizes custom claims on Firebase Auth tokens whenever
 * a user's Firestore profile doc (/users/{uid}) is created or modified.
 */
export const onUserDocWrite = onDocumentWritten("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const data = event.data?.after.data();

  // If document was deleted, clear claims or skip
  if (!data) {
    console.log(`[Claims Sync] User doc ${uid} deleted. Removing custom claims.`);
    try {
      await admin.auth().setCustomUserClaims(uid, null);
    } catch (err: any) {
      console.warn(`[Claims Sync] Failed to clear claims for deleted user ${uid}:`, err.message);
    }
    return;
  }

  let role = data.role;
  if (!role || !VALID_ROLES.includes(role)) {
    role = "student";
  }

  const lrn = data.lrn || data.metadata?.lrn || null;
  let linked_lrns = data.linked_lrns || [];
  if ((!linked_lrns || linked_lrns.length === 0) && data.metadata?.childLrn) {
    linked_lrns = [data.metadata.childLrn];
  }

  const primary_lrn = data.primary_lrn || lrn || (Array.isArray(linked_lrns) && linked_lrns.length > 0 ? linked_lrns[0] : null);

  const claims = {
    role,
    lrn: lrn || null,
    linked_lrns: Array.isArray(linked_lrns) ? linked_lrns : [],
    primary_lrn: primary_lrn || null,
    claims_updated_at: Date.now(),
  };

  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`[Claims Sync] Successfully synced custom claims for user ${uid}:`, claims);
  } catch (err: any) {
    console.error(`[Claims Sync] Failed to set custom claims for user ${uid}:`, err.message);
  }
});

/**
 * HTTPS endpoint to trigger claims synchronization on demand.
 */
export const syncClaims = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const targetUid = req.body?.uid || decodedToken.uid;

    const userDoc = await admin.firestore().collection("users").doc(targetUid).get();
    const data = userDoc.exists ? (userDoc.data() || {}) : {};

    let role = data.role || req.body?.role || "student";
    if (!VALID_ROLES.includes(role)) role = "student";

    const lrn = data.lrn || data.metadata?.lrn || req.body?.lrn || null;
    let linked_lrns = data.linked_lrns || (data.metadata?.childLrn ? [data.metadata.childLrn] : []);
    const primary_lrn = data.primary_lrn || lrn || (linked_lrns.length > 0 ? linked_lrns[0] : null);

    const claims = {
      role,
      lrn,
      linked_lrns,
      primary_lrn,
      claims_updated_at: Date.now(),
    };

    await admin.auth().setCustomUserClaims(targetUid, claims);
    res.json({ success: true, uid: targetUid, claims });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
