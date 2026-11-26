"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";

const requiredConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseClientAuth() {
  if (Object.values(requiredConfig).some((value) => !value)) {
    throw new Error("Configuração pública do Firebase incompleta.");
  }

  const app = getApps().length ? getApp() : initializeApp(requiredConfig);
  const auth = getAuth(app);
  return setPersistence(auth, inMemoryPersistence).then(() => auth);
}
