import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { getFirebaseAdminDb } from "@lib/firebase/admin";
import { type DocumentData, type DocumentReference, FieldValue, type Firestore,Timestamp } from "firebase-admin/firestore";

type Session = NonNullable<Awaited<ReturnType<typeof import("@lib/firebase/session").getFirebaseSession>>>;

function fail(message: string): never { throw new Error(message); }
function date(value: unknown) {
  const result = value instanceof Date ? value : new Date(String(value ?? ""));
  if (Number.isNaN(result.getTime())) fail("Data e horário inválidos.");
  return result;
}
function dateKey(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
function timeZone(salon: DocumentData | undefined) {
  return typeof salon?.settings?.timezone === "string" ? salon.settings.timezone : "America/Sao_Paulo";
}
function getLocalTime(value: Date, zone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value);
  return Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 + Number(parts.find((part) => part.type === "minute")?.value ?? 0);
}
function getWeekday(value: Date, zone: string) {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "short" }).format(value);
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[weekday] ?? 0;
}
function localSlot(dateString: string, minutes: number, zone: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  // The salon currently operates in São José, Brazil (UTC-03:00).
  const value = new Date(`${dateString}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-03:00`);
  if (dateKey(value, zone) !== `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`) fail("Data incompatível com o fuso do salão.");
  return value;
}
function idempotentId(salonId: string, key: string) {
  return createHash("sha256").update(`${salonId}:${key}`).digest("hex");
}
function normalizePhone(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : digits.length <= 11 ? `55${digits}` : digits;
  if (normalized.length < 12 || normalized.length > 15) fail("Informe um telefone válido com código do país.");
  return normalized;
}
function asMillis(value: unknown) {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return new Date(String(value ?? "")).getTime();
}
function dateOnlyFromDate(value: Date, zone: string) { return dateKey(value, zone); }

async function readSalon(db: Firestore, salonId: string) {
  const snapshot = await db.collection("salons").doc(salonId).get();
  if (!snapshot.exists || snapshot.data()?.active === false) fail("Salão não encontrado ou inativo.");
  return snapshot.data() ?? {};
}

async function readService(db: Firestore, salonId: string, serviceId: string): Promise<DocumentData & { id: string; durationMinutes: number }> {
  const snapshot = await db.collection("services").doc(serviceId).get();
  const service = snapshot.data();
  if (!snapshot.exists || service?.salonId !== salonId || service?.active === false) fail("Serviço inválido ou inativo.");
  const durationMinutes = Number(service?.durationMinutes);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) fail("O serviço não possui duração válida.");
  return { id: snapshot.id, ...service, durationMinutes };
}

async function getProfessionalAndAssignee(db: Firestore, salonId: string, professionalId: string | null) {
  let professional: DocumentData | null = null;
  if (professionalId) {
    const snapshot = await db.collection("professionals").doc(professionalId).get();
    const data = snapshot.data();
    if (snapshot.exists && data?.salonId === salonId && data.active !== false) professional = { id: snapshot.id, ...data };
    if (!professional) {
      const userSnapshot = await db.collection("users").doc(professionalId).get();
      const user = userSnapshot.data();
      if (userSnapshot.exists && user?.salonId === salonId) professional = { id: professionalId, userId: professionalId, name: user.displayName ?? user.name ?? "Profissional", defaultCommissionRate: user.commissionRate ?? 0 };
    }
    if (!professional) fail("Profissional inválido ou inativo.");
  }

  const users = await db.collection("users").where("salonId", "==", salonId).limit(200).get();
  const owner = users.docs.find((item) => item.data().role === "salon_owner" || item.data().role === "manicure")
    ?? users.docs.find((item) => item.data().role === "nail_technician");
  if (!owner) fail("Cadastre um responsável ativo no NailFlow antes de criar compromissos compartilhados.");
  return {
    professionalId: professional?.id ?? null,
    professionalName: professional?.name ?? professional?.displayName ?? null,
    commissionRate: Number(professional?.defaultCommissionRate ?? 0),
    manicureId: typeof professional?.userId === "string" ? professional.userId : owner.id,
    manicureName: professional?.name ?? professional?.displayName ?? owner.data().displayName ?? owner.data().name ?? "Profissional",
  };
}

async function createAppointment(db: Firestore, params: {
  salonId: string; clientId: string; serviceId: string; start: Date; notes: string; idempotencyKey: string;
  source: string; professionalId?: string | null; status?: string; priceCents?: number | null; createdBy: string;
  publicClient?: { name: string; phone: string };
}) {
  const appointmentId = idempotentId(params.salonId, params.idempotencyKey);
  const appointmentRef = db.collection("appointments").doc(appointmentId);
  const [salon, service, assignee] = await Promise.all([
    readSalon(db, params.salonId),
    readService(db, params.salonId, params.serviceId),
    getProfessionalAndAssignee(db, params.salonId, params.professionalId ?? null),
  ]);
  const end = new Date(params.start.getTime() + service.durationMinutes * 60_000);
  const zone = timeZone(salon);
  const rulesQuery = db.collection("availabilityRules").where("salonId", "==", params.salonId);
  const appointmentsQuery = db.collection("appointments").where("salonId", "==", params.salonId).limit(2000);
  const clientsQuery = params.publicClient ? db.collection("clients").where("salonId", "==", params.salonId).limit(2000) : null;

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(appointmentRef);
    if (existing.exists) return appointmentId;

    const [rulesSnapshot, appointmentsSnapshot, clientsSnapshot, customerSnapshot] = await Promise.all([
      transaction.get(rulesQuery),
      transaction.get(appointmentsQuery),
      clientsQuery ? transaction.get(clientsQuery) : Promise.resolve(null),
      params.publicClient ? Promise.resolve(null) : transaction.get(db.collection("clients").doc(params.clientId)),
    ]);

    let clientId = params.clientId;
    let clientRef: DocumentReference | null = null;
    let existingClientData: DocumentData | null = null;
    if (params.publicClient && clientsSnapshot) {
      const matchingClient = clientsSnapshot.docs.find((item) => {
        const data = item.data();
        const storedPhone = String(data.phoneNormalized ?? data.phone ?? "").replace(/\D/g, "");
        return storedPhone === params.publicClient!.phone || (storedPhone.length === 11 && `55${storedPhone}` === params.publicClient!.phone);
      });
      if (matchingClient) {
        clientId = matchingClient.id;
        clientRef = matchingClient.ref;
        existingClientData = matchingClient.data();
        if (existingClientData.status === "archived") fail("Esse contato está arquivado. Fale com o salão para fazer uma reserva.");
      } else {
        clientId = randomUUID();
        clientRef = db.collection("clients").doc(clientId);
      }
    } else if (!customerSnapshot?.exists || customerSnapshot.data()?.salonId !== params.salonId || customerSnapshot.data()?.status === "archived") {
      fail("Contato inválido ou arquivado.");
    }

    const weekday = getWeekday(params.start, zone);
    const rule = rulesSnapshot.docs.find((item) => item.data().weekday === weekday && item.data().active !== false)?.data();
    if (!rule) fail("Não há atendimento configurado para esse dia.");
    const [openHour, openMinute] = String(rule.startTime ?? "09:00").split(":").map(Number);
    const [closeHour, closeMinute] = String(rule.endTime ?? "18:00").split(":").map(Number);
    const startsAtMinutes = getLocalTime(params.start, zone);
    const endsAtMinutes = getLocalTime(end, zone);
    if (startsAtMinutes < openHour * 60 + openMinute || endsAtMinutes > closeHour * 60 + closeMinute) fail("Horário fora do período de atendimento.");
    if (rule.breakStart && rule.breakEnd) {
      const [breakStartHour, breakStartMinute] = String(rule.breakStart).split(":").map(Number);
      const [breakEndHour, breakEndMinute] = String(rule.breakEnd).split(":").map(Number);
      if (startsAtMinutes < breakEndHour * 60 + breakEndMinute && endsAtMinutes > breakStartHour * 60 + breakStartMinute) fail("Horário coincide com o intervalo.");
    }
    if (appointmentsSnapshot.docs.some((item) => {
      const data = item.data();
      return ["scheduled", "confirmed"].includes(data.status)
        && asMillis(data.startTime) < end.getTime() && asMillis(data.endTime) > params.start.getTime();
    })) fail("Horário já reservado.");

    if (params.publicClient) {
      if (params.start <= new Date()) fail("Escolha um horário futuro.");
      const localDate = dateKey(params.start, zone);
      const activeSameDay = appointmentsSnapshot.docs.filter((item) => {
        const data = item.data();
        return data.source === "public_web" && data.status === "scheduled" && data.clientId === clientId
          && dateKey(new Date(asMillis(data.startTime)), zone) === localDate;
      });
      if (activeSameDay.length >= 3) fail("Limite diário de solicitações atingido para este telefone.");
    }

    const now = FieldValue.serverTimestamp();
    const appointment = {
      salonId: params.salonId, manicureId: assignee.manicureId, clientId, serviceId: service.id,
      professionalId: assignee.professionalId, status: params.status ?? "scheduled",
      startTime: Timestamp.fromDate(params.start), endTime: Timestamp.fromDate(end), notes: params.notes.trim(),
      priceCents: params.priceCents ?? Number(service.averagePriceCents ?? 0), serviceNameSnapshot: service.name,
      serviceDurationSnapshot: service.durationMinutes, returnPeriodDaysSnapshot: service.returnPeriodDays ?? null,
      professionalNameSnapshot: assignee.professionalName ?? assignee.manicureName, commissionRateSnapshot: assignee.commissionRate,
      idempotencyKey: params.idempotencyKey, source: params.source, timezone: zone, createdBy: params.createdBy,
      createdAt: now, updatedAt: now, syncStatus: "disabled",
    };
    if (clientRef && params.publicClient) {
      if (existingClientData) transaction.update(clientRef, { name: params.publicClient.name.trim(), updatedAt: now });
      else transaction.create(clientRef, {
        salonId: params.salonId, name: params.publicClient.name.trim(), phone: params.publicClient.phone,
        phoneNormalized: params.publicClient.phone, email: null, notes: "", tags: [], status: "active",
        doNotContact: false, lastVisit: null, createdAt: now, updatedAt: now,
      });
    }
    transaction.create(appointmentRef, appointment);
    return appointmentId;
  });
}

async function createAttendance(db: Firestore, args: Record<string, unknown>, session: Session) {
  const salonId = session.salonId;
  if (!salonId) fail("Sessão do salão indisponível.");
  const serviceId = String(args.serviceId ?? "");
  const clientId = String(args.clientId ?? "");
  const start = date(args.performedAt);
  const service = await readService(db, salonId, serviceId);
  const customer = await db.collection("clients").doc(clientId).get();
  if (!customer.exists || customer.data()?.salonId !== salonId || customer.data()?.status === "archived") fail("Contato inválido ou arquivado.");
  const professionalId = args.professionalId ? String(args.professionalId) : null;
  const assignee = await getProfessionalAndAssignee(db, salonId, professionalId);
  const idempotencyKey = String(args.idempotencyKey ?? randomUUID());
  const id = idempotentId(salonId, idempotencyKey);
  const ref = db.collection("appointments").doc(id);
  if ((await ref.get()).exists) return id;
  const priceCents = args.priceCents == null ? Number(service.averagePriceCents ?? 0) : Number(args.priceCents);
  if (!Number.isInteger(priceCents) || priceCents < 0) fail("Valor inválido.");
  const salon = await readSalon(db, salonId);
  const end = new Date(start.getTime() + service.durationMinutes * 60_000);
  const now = FieldValue.serverTimestamp();
  await ref.create({
    salonId, manicureId: assignee.manicureId, clientId, serviceId,
    professionalId: assignee.professionalId, status: "completed",
    startTime: Timestamp.fromDate(start), endTime: Timestamp.fromDate(end),
    notes: String(args.notes ?? "").trim(), priceCents,
    serviceNameSnapshot: service.name, serviceDurationSnapshot: service.durationMinutes,
    returnPeriodDaysSnapshot: service.returnPeriodDays ?? null,
    professionalNameSnapshot: assignee.professionalName ?? assignee.manicureName,
    commissionRateSnapshot: assignee.commissionRate, idempotencyKey,
    source: "web", timezone: timeZone(salon), createdBy: session.userId,
    createdAt: now, updatedAt: now, syncStatus: "disabled",
  });
  const latest = await db.collection("appointments").where("salonId", "==", salonId).limit(2000).get();
  const isLatest = latest.docs.filter((item) => item.data().clientId === clientId && item.data().serviceId === serviceId && item.data().status === "completed")
    .every((item) => item.id === id || asMillis(item.data().startTime) <= start.getTime());
  if (isLatest) await updateFollowUpForAttendance(db, salonId, clientId, serviceId, id, start, service.returnPeriodDays ?? null, timeZone(salon));
  return id;
}

async function updateFollowUpForAttendance(db: Firestore, salonId: string, clientId: string, serviceId: string, attendanceId: string, performedAt: Date, periodDays: number | null, zone: string) {
  const followUps = await db.collection("followUps").where("salonId", "==", salonId).limit(2000).get();
  const batch = db.batch();
  for (const item of followUps.docs) {
    const data = item.data();
    if (data.clientId === clientId && data.serviceId === serviceId && ["pending", "contacted", "postponed"].includes(data.status)) {
      batch.update(item.ref, { status: "substituted", updatedAt: FieldValue.serverTimestamp() });
    }
  }
  if (periodDays && periodDays > 0) {
    const nextDate = new Date(performedAt);
    nextDate.setDate(nextDate.getDate() + periodDays);
    const dueDate = dateOnlyFromDate(nextDate, zone);
    batch.create(db.collection("followUps").doc(randomUUID()), {
      salonId, clientId, serviceId, attendanceId,
      originalDueDate: dueDate, nextFollowUpDate: dueDate, status: "pending",
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
}

async function dispatchFirebaseAction(name: string, args: Record<string, unknown>, session: Session) {
  const db = getFirebaseAdminDb();
  const salonId = session.salonId;
  if (!salonId) fail("Sessão do salão indisponível.");
  switch (name) {
    case "createAppointment": {
      if (args.salonId !== salonId) fail("Usuário sem acesso à organização.");
      return createAppointment(db, { salonId, clientId: String(args.clientId ?? ""), serviceId: String(args.serviceId ?? ""), start: date(args.startsAt), notes: String(args.notes ?? ""), idempotencyKey: String(args.idempotencyKey ?? randomUUID()), source: "web", createdBy: session.userId });
    }
    case "registerAttendance": return createAttendance(db, args, session);
    case "cancelAppointment":
    case "cancelAttendance": {
      const id = String(args.appointmentId ?? args.attendanceId ?? "");
      const ref = db.collection("appointments").doc(id);
      const snapshot = await ref.get();
      if (!snapshot.exists || snapshot.data()?.salonId !== salonId) fail("Compromisso sem acesso.");
      if (name === "cancelAttendance" && session.role !== "salon_owner" && session.role !== "super_admin") fail("Usuário sem permissão administrativa.");
      await ref.update({ status: "cancelled", cancelledAt: FieldValue.serverTimestamp(), cancelledBy: session.userId, updatedAt: FieldValue.serverTimestamp() });
      if (name === "cancelAttendance") {
        const followUps = await db.collection("followUps").where("salonId", "==", salonId).limit(2000).get();
        const batch = db.batch();
        for (const item of followUps.docs) if (item.data().attendanceId === id && item.data().status !== "dismissed") batch.update(item.ref, { status: "dismissed", updatedAt: FieldValue.serverTimestamp() });
        await batch.commit();
      }
      return null;
    }
    case "updateAttendance": {
      if (session.role !== "salon_owner" && session.role !== "super_admin") fail("Usuário sem permissão administrativa.");
      const id = String(args.attendanceId ?? "");
      const ref = db.collection("appointments").doc(id);
      const old = await ref.get();
      const previous = old.data();
      if (!old.exists || previous?.salonId !== salonId || previous.status !== "completed") fail("Atendimento inválido ou sem acesso.");
      const [customer, service] = await Promise.all([
        db.collection("clients").doc(String(args.clientId ?? "")).get(),
        readService(db, salonId, String(args.serviceId ?? "")),
      ]);
      if (!customer.exists || customer.data()?.salonId !== salonId || customer.data()?.status === "archived") fail("Contato inválido ou arquivado.");
      const performedAt = date(args.performedAt);
      const assignee = await getProfessionalAndAssignee(db, salonId, args.professionalId ? String(args.professionalId) : null);
      const priceCents = args.priceCents == null ? previous.priceCents ?? 0 : Number(args.priceCents);
      if (!Number.isInteger(priceCents) || priceCents < 0) fail("Valor inválido.");
      const end = new Date(performedAt.getTime() + service.durationMinutes * 60_000);
      await ref.update({
        clientId: String(args.clientId), serviceId: service.id, manicureId: assignee.manicureId,
        professionalId: assignee.professionalId, startTime: Timestamp.fromDate(performedAt), endTime: Timestamp.fromDate(end),
        priceCents, serviceNameSnapshot: service.name, serviceDurationSnapshot: service.durationMinutes,
        returnPeriodDaysSnapshot: service.returnPeriodDays ?? null, professionalNameSnapshot: assignee.professionalName ?? assignee.manicureName,
        commissionRateSnapshot: assignee.commissionRate, notes: String(args.notes ?? "").trim(), updatedAt: FieldValue.serverTimestamp(),
      });
      await updateFollowUpForAttendance(db, salonId, String(args.clientId), service.id, id, performedAt, service.returnPeriodDays ?? null, timeZone(await readSalon(db, salonId)));
      return null;
    }
    case "updateSalonSettings": {
      if (session.role !== "salon_owner" && session.role !== "super_admin") fail("Usuário sem permissão administrativa.");
      if (args.salonId !== salonId) fail("Usuário sem acesso à organização.");
      const ref = db.collection("salons").doc(salonId);
      const snapshot = await ref.get();
      if (!snapshot.exists) fail("Salão não encontrado.");
      const current = snapshot.data()?.settings ?? {};
      await ref.update({
        name: String(args.name ?? "").trim(),
        settings: { ...current, timezone: String(args.timezone ?? "America/Sao_Paulo"), defaultMessage: String(args.defaultMessage ?? ""), whatsappPhone: String(args.whatsappPhone ?? "") },
        updatedAt: FieldValue.serverTimestamp(),
      });
      return null;
    }
    case "saveAvailabilityRules": {
      if (session.role !== "salon_owner" && session.role !== "super_admin") fail("Usuário sem permissão administrativa.");
      if (args.salonId !== salonId || !Array.isArray(args.rules)) fail("Configuração de horários inválida.");
      const old = await db.collection("availabilityRules").where("salonId", "==", salonId).get();
      const batch = db.batch();
      old.docs.forEach((item) => batch.delete(item.ref));
      for (const candidate of args.rules as Array<Record<string, unknown>>) {
        const weekday = Number(candidate.weekday);
        if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) fail("Dia da semana inválido.");
        batch.set(db.collection("availabilityRules").doc(`${salonId}_${weekday}`), {
          salonId, weekday, startTime: String(candidate.startTime ?? "09:00"), endTime: String(candidate.endTime ?? "18:00"),
          breakStart: candidate.breakStart ? String(candidate.breakStart) : null, breakEnd: candidate.breakEnd ? String(candidate.breakEnd) : null,
          active: true, updatedAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      return null;
    }
    case "recordFollowUpContact": {
      const id = String(args.followUpId ?? "");
      const ref = db.collection("followUps").doc(id);
      const snapshot = await ref.get();
      const followUp = snapshot.data();
      if (!snapshot.exists || followUp?.salonId !== salonId) fail("Retorno sem acesso.");
      if (!["pending", "postponed"].includes(String(followUp.status))) fail("Retorno não está pendente.");
      const batch = db.batch();
      const now = FieldValue.serverTimestamp();
      batch.update(ref, { status: "contacted", contactedAt: now, contactedBy: session.userId, updatedAt: now });
      batch.create(db.collection("contactLogs").doc(randomUUID()), {
        salonId, clientId: followUp.clientId, followUpId: id, channel: "whatsapp", contactedAt: now,
        createdBy: session.userId, notes: String(args.notes ?? "").trim(), createdAt: now,
      });
      batch.update(db.collection("clients").doc(String(followUp.clientId)), { lastContactAt: now, updatedAt: now });
      await batch.commit();
      return null;
    }
    case "postponeFollowUp":
    case "dismissFollowUp": {
      const id = String(args.followUpId ?? "");
      const ref = db.collection("followUps").doc(id);
      const snapshot = await ref.get();
      const followUp = snapshot.data();
      if (!snapshot.exists || followUp?.salonId !== salonId) fail("Retorno sem acesso.");
      if (!["pending", "postponed"].includes(String(followUp.status))) fail("Retorno não está pendente.");
      const patch = name === "postponeFollowUp"
        ? { nextFollowUpDate: String(args.nextDate ?? ""), status: "postponed" }
        : { status: "dismissed" };
      await ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
      return null;
    }
    default: fail(`Operação Firebase ainda não implementada: ${name}.`);
  }
}

export async function runFirebaseAction(name: string, args: Record<string, unknown>, session: Session) {
  return dispatchFirebaseAction(name, args, session);
}

export async function getPublicReservationCatalog(salonId: string) {
  const db = getFirebaseAdminDb();
  await readSalon(db, salonId);
  const snapshot = await db.collection("services").where("salonId", "==", salonId).limit(500).get();
  return snapshot.docs.filter((item) => item.data().active !== false).map((item) => ({ service_id: item.id, service_name: item.data().name ?? "", duration_minutes: Number(item.data().durationMinutes ?? 0) }));
}

export async function getPublicReservationContact(salonId: string) {
  const salon = await readSalon(getFirebaseAdminDb(), salonId);
  return { whatsapp_phone: salon.settings?.whatsappPhone ?? null };
}

export async function getPublicReservationSlots(salonId: string, serviceId: string, dateString: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) fail("Data inválida.");
  const db = getFirebaseAdminDb();
  const [salon, service, rules, appointments] = await Promise.all([
    readSalon(db, salonId),
    readService(db, salonId, serviceId),
    db.collection("availabilityRules").where("salonId", "==", salonId).get(),
    db.collection("appointments").where("salonId", "==", salonId).get(),
  ]);
  const zone = timeZone(salon);
  const day = localSlot(dateString, 12 * 60, zone);
  const weekday = getWeekday(day, zone);
  const rule = rules.docs.find((item) => item.data().weekday === weekday && item.data().active !== false)?.data();
  if (!rule) return [];
  const start = String(rule.startTime ?? "09:00").split(":").map(Number);
  const end = String(rule.endTime ?? "18:00").split(":").map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  const busy = appointments.docs.map((item) => item.data()).filter((item) => ["scheduled", "confirmed"].includes(item.status) && dateKey(new Date(asMillis(item.startTime)), zone) === dateString);
  const slots: Array<{ slot_time: string }> = [];
  for (let minutes = startMinutes; minutes + service.durationMinutes <= endMinutes; minutes += 15) {
    const slotStart = localSlot(dateString, minutes, zone);
    const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60_000);
    if (busy.some((item) => asMillis(item.startTime) < slotEnd.getTime() && asMillis(item.endTime) > slotStart.getTime())) continue;
    const breakStart = String(rule.breakStart ?? "");
    const breakEnd = String(rule.breakEnd ?? "");
    if (breakStart && breakEnd) {
      const [bs, bm] = breakStart.split(":").map(Number);
      const [be, bem] = breakEnd.split(":").map(Number);
      if (minutes < be * 60 + bem && minutes + service.durationMinutes > bs * 60 + bm) continue;
    }
    slots.push({ slot_time: `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00` });
  }
  return slots;
}

export async function createPublicReservation(params: { salonId: string; serviceId: string; name: string; phone: string; startsAt: string; idempotencyKey: string }) {
  const db = getFirebaseAdminDb();
  const phone = normalizePhone(params.phone);
  const start = date(params.startsAt);
  if (params.name.trim().length < 2 || params.name.trim().length > 120) fail("Informe um nome válido.");
  return createAppointment(db, {
    salonId: params.salonId, clientId: "", serviceId: params.serviceId, start,
    notes: "Reserva solicitada pelo site.", idempotencyKey: params.idempotencyKey,
    source: "public_web", createdBy: "public", publicClient: { name: params.name, phone },
  });
}
