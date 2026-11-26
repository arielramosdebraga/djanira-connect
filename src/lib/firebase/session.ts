import "server-only";

import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@lib/firebase/admin";
import { cookies } from "next/headers";

export const FIREBASE_SESSION_COOKIE = "djanira_session";

export async function getFirebaseSession() {
  const value = (await cookies()).get(FIREBASE_SESSION_COOKIE)?.value;
  if (!value) return null;

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(value, true);
    const userSnapshot = await getFirebaseAdminDb().collection("users").doc(decoded.uid).get();
    if (!userSnapshot.exists) return null;

    const profile = userSnapshot.data() ?? {};
    const role = typeof profile.role === "string" ? profile.role : "";
    const salonId = typeof profile.salonId === "string" ? profile.salonId : null;
    if (!new Set(["super_admin", "salon_owner", "nail_technician", "manicure"]).has(role)) return null;
    if (profile.active === false || profile.isActive === false) return null;
    if (role !== "super_admin" && !salonId) return null;
    if (salonId) {
      const salon = await getFirebaseAdminDb().collection("salons").doc(salonId).get();
      if (!salon.exists || salon.data()?.active === false) return null;
    }

    return { userId: decoded.uid, salonId, role, profile };
  } catch {
    return null;
  }
}
