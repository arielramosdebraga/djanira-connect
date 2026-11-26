import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@lib/firebase/admin";
import { NextResponse } from "next/server";

const sessionCookieName = "djanira_session";
const sessionDurationMs = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { idToken?: unknown };
    if (typeof body.idToken !== "string" || body.idToken.length > 8_000) {
      return NextResponse.json({ error: "Token de acesso inválido." }, { status: 400 });
    }

    const auth = await getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(body.idToken, true);
    const profile = await getFirebaseAdminDb().collection("users").doc(decoded.uid).get();
    const user = profile.data();
    const role = user?.role;
    const hasWebAccess = ["super_admin", "salon_owner", "nail_technician", "manicure"].includes(role);

    if (!profile.exists || !hasWebAccess || user?.active === false || user?.isActive === false || (role !== "super_admin" && typeof user?.salonId !== "string")) {
      return NextResponse.json({ error: "Esta conta ainda não tem acesso ao sistema." }, { status: 403 });
    }
    if (typeof user?.salonId === "string") {
      const salon = await getFirebaseAdminDb().collection("salons").doc(user.salonId).get();
      if (!salon.exists || salon.data()?.active === false) return NextResponse.json({ error: "O salão vinculado está inativo." }, { status: 403 });
    }

    const sessionCookie = await auth.createSessionCookie(body.idToken, { expiresIn: sessionDurationMs });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieName, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(sessionDurationMs / 1000),
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Não foi possível iniciar sua sessão." }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
