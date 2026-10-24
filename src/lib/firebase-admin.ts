import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function getFirebaseApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are required."
    );
  }

  const existingApp = getApps()[0];
  return existingApp ?? initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getFirebaseMessaging() {
  return getMessaging(getFirebaseApp());
}

export async function getFirebaseAuth() {
  // firebase-admin/auth pulls jose through a CommonJS dependency. Loading it
  // dynamically keeps Next/Vercel from evaluating that ESM module at route load.
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(getFirebaseApp());
}
