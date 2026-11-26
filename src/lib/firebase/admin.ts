import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function readServiceAccount() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? (encoded ? Buffer.from(encoded, "base64").toString("utf8") : "");
  if (!raw) throw new Error("Firebase Admin não configurado. Defina FIREBASE_SERVICE_ACCOUNT_BASE64.");

  try {
    return JSON.parse(raw) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  } catch {
    throw new Error("A credencial do Firebase Admin não contém um JSON válido.");
  }
}

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const account = readServiceAccount();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || account.project_id;
  if (projectId !== account.project_id) {
    throw new Error("O projeto Firebase configurado não corresponde à credencial de servidor.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
    projectId,
  });
}

export async function getFirebaseAdminAuth() {
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(getAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getAdminApp());
}
