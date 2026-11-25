import { getAvailableReservationSlots, submitPublicReservation } from "@lib/firebase/public";
import { NextResponse } from "next/server";

function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId") ?? "";
  const date = url.searchParams.get("date") ?? "";
  if (!serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Selecione um serviço e uma data válidos." }, { status: 400 });
  }
  try {
    return NextResponse.json({ slots: await getAvailableReservationSlots(serviceId, date) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar os horários." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const serviceId = typeof body.serviceId === "string" ? body.serviceId.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone : "";
    const startsAt = typeof body.startsAt === "string" ? body.startsAt : "";
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : "";
    if (!serviceId || name.length < 2 || name.length > 120 || phone.length > 30 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(startsAt) || !/^[\w-]{16,100}$/.test(idempotencyKey)) {
      return NextResponse.json({ error: "Confira nome, telefone, serviço, data e horário." }, { status: 400 });
    }
    await submitPublicReservation({ serviceId, name, phone, startsAt, idempotencyKey });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const known = /horário|dia|serviço|telefone|contato|reserva|limite/i.test(message);
    return NextResponse.json({ error: known ? message : "Não foi possível reservar esse horário." }, { status: known ? 409 : 503 });
  }
}
