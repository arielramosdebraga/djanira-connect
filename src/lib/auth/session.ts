import { createFirebaseServerClient } from "@lib/firebase/server-client";
import { getFirebaseSession } from "@lib/firebase/session";
import { redirect } from "next/navigation";

export async function requireActiveMember() {
  const session = await getFirebaseSession();
  if (!session) redirect("/login");
  if (!session.salonId) redirect("/login?erro=sem-acesso");

  const role = session.role === "salon_owner" || session.role === "super_admin" ? "admin" : "operator";
  const firebase = await createFirebaseServerClient(session);
  return {
    firebase,
    userId: session.userId,
    membership: { organization_id: session.salonId, role, active: true as const },
  };
}
