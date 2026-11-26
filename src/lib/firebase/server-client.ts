import "server-only";

import { getFirebaseAdminDb } from "@lib/firebase/admin";
import { runFirebaseAction } from "@lib/firebase/server-rpc";
import { getFirebaseSession } from "@lib/firebase/session";
import type { DocumentData, Firestore, QueryDocumentSnapshot } from "firebase-admin/firestore";

type FirebaseError = { message: string; code: string; details?: string; hint?: string };
// A consulta é dinâmica porque cada tela escolhe sua projeção e relações no Firestore.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynamicPageValue = any;
type FirebaseRowsResult = { data: DynamicPageValue[]; error: FirebaseError | null };
type FirebaseSingleResult = { data: DynamicPageValue | null; error: FirebaseError | null };
type FirebaseActionResult = { data: unknown; error: FirebaseError | null };
type Filter = { field: string; operator: "eq" | "neq" | "in" | "gte" | "lte"; value: unknown };
type Order = { field: string; ascending: boolean };
type Session = NonNullable<Awaited<ReturnType<typeof getFirebaseSession>>>;

const collectionByTable: Record<string, string> = {
  organizations: "salons",
  services: "services",
  appointments: "appointments",
  customers: "clients",
  attendances: "appointments",
  follow_ups: "followUps",
  contact_logs: "contactLogs",
  professionals: "professionals",
  availability_rules: "availabilityRules",
};

const explicitFieldMap: Record<string, string> = {
  organization_id: "salonId",
  phone_normalized: "phoneNormalized",
  last_contact_at: "lastContactAt",
  default_message: "defaultMessage",
  whatsapp_phone: "whatsappPhone",
  average_price_cents: "averagePriceCents",
  duration_minutes: "durationMinutes",
  return_period_days: "returnPeriodDays",
  service_name_snapshot: "serviceNameSnapshot",
  service_duration_snapshot: "serviceDurationSnapshot",
  return_period_days_snapshot: "returnPeriodDaysSnapshot",
  professional_name_snapshot: "professionalNameSnapshot",
  commission_rate_snapshot: "commissionRateSnapshot",
  default_commission_rate: "defaultCommissionRate",
  customer_id: "clientId",
  service_id: "serviceId",
  professional_id: "professionalId",
  attendance_id: "attendanceId",
  follow_up_id: "followUpId",
  original_due_date: "originalDueDate",
  next_follow_up_date: "nextFollowUpDate",
  contacted_at: "contactedAt",
  contacted_by: "contactedBy",
  created_by: "createdBy",
  idempotency_key: "idempotencyKey",
  starts_at: "startTime",
  ends_at: "endTime",
  performed_at: "startTime",
  start_time: "startTime",
  end_time: "endTime",
  break_start: "breakStart",
  break_end: "breakEnd",
  weekday: "weekday",
  timezone: "timezone",
  do_not_contact: "doNotContact",
  created_at: "createdAt",
  updated_at: "updatedAt",
  cancelled_at: "cancelledAt",
  cancelled_by: "cancelledBy",
};

const relationCollection: Record<string, string> = {
  customers: "clients",
  services: "services",
  professionals: "professionals",
};

function fieldToFirestore(field: string, table: string) {
  if (table === "attendances" && field === "performed_at") return "startTime";
  if (table === "attendances" && field === "professional_id") return "professionalId";
  return explicitFieldMap[field] ?? field.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function toIso(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value.toDate as () => Date)().toISOString();
  }
  if (Array.isArray(value)) return value.map(toIso);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toIso(item)]));
  }
  return value;
}

function recordForTable(table: string, id: string, raw: DocumentData) {
  const source: DocumentData = { ...raw, id };
  if (table === "organizations") {
    source.timezone = raw.settings?.timezone ?? raw.timezone ?? "America/Sao_Paulo";
    source.defaultMessage = raw.settings?.defaultMessage ?? raw.defaultMessage ?? "";
    source.whatsappPhone = raw.settings?.whatsappPhone ?? raw.whatsappPhone ?? null;
  }
  if (table === "customers") {
    source.phoneNormalized = raw.phoneNormalized ?? String(raw.phone ?? "").replace(/\D/g, "");
    source.status ??= "active";
    source.doNotContact ??= false;
    source.lastContactAt ??= null;
  }
  if (table === "attendances") {
    source.serviceNameSnapshot ??= "Serviço";
    source.professionalId ??= null;
  }

  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === "settings") continue;
    const legacyKey = Object.entries(explicitFieldMap).find(([, mapped]) => mapped === key)?.[0]
      ?? key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    output[legacyKey] = toIso(value);
  }
  if (table === "organizations") {
    output.timezone = source.timezone;
    output.default_message = source.defaultMessage;
    output.whatsapp_phone = source.whatsappPhone;
  }
  if (table === "attendances") {
    output.performed_at = toIso(raw.startTime);
    output.professional_id = raw.professionalId ?? raw.manicureId ?? null;
  }
  return output;
}

function parseRelations(select: string) {
  return Array.from(select.matchAll(/\b(customers|services|professionals)(!inner)?\(([^)]*)\)/g), (match) => ({
    name: match[1],
    inner: Boolean(match[2]),
    fields: match[3].split(",").map((field) => field.trim()).filter(Boolean),
  }));
}

function comparable(value: unknown): unknown {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value.toDate as () => Date)().getTime();
  }
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).getTime();
  return value;
}

function matchesFilter(row: DocumentData, filter: Filter) {
  const value = row[fieldToFirestore(filter.field, "")];
  const left = comparable(value);
  const right = comparable(filter.value);
  switch (filter.operator) {
    case "eq": return left === right;
    case "neq": return left !== right;
    case "in": return Array.isArray(filter.value) && filter.value.some((item) => comparable(item) === left);
    case "gte": return typeof left === "number" && typeof right === "number" ? left >= right : String(left ?? "") >= String(right ?? "");
    case "lte": return typeof left === "number" && typeof right === "number" ? left <= right : String(left ?? "") <= String(right ?? "");
  }
}

function toFirestoreValue(value: unknown): unknown {
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) return new Date(value);
  if (Array.isArray(value)) return value.map(toFirestoreValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item)]));
  return value;
}

function payloadForTable(table: string, input: DocumentData, salonId: string) {
  const output: DocumentData = { salonId };
  for (const [key, value] of Object.entries(input)) {
    if (key === "id" || key === "organization_id") continue;
    const field = fieldToFirestore(key, table);
    if (table === "organizations" && ["timezone", "default_message", "whatsapp_phone"].includes(key)) {
      const settingsKey = key === "default_message" ? "defaultMessage" : key === "whatsapp_phone" ? "whatsappPhone" : "timezone";
      output.settings = { ...(output.settings ?? {}), [settingsKey]: value };
      continue;
    }
    output[field] = toFirestoreValue(value);
  }
  if (table === "customers") {
    output.phone = input.phone_normalized ?? input.phone ?? "";
    output.phoneNormalized = input.phone_normalized ?? input.phoneNormalized ?? "";
    output.status ??= "active";
    output.tags ??= [];
  }
  if (table === "services") output.active ??= true;
  if (table === "professionals" || table === "availability_rules") output.active ??= true;
  output.updatedAt = new Date();
  return output;
}

class FirestoreQuery implements PromiseLike<FirebaseRowsResult> {
  private selected = "*";
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private values: DocumentData | DocumentData[] | null = null;
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private maxRows = 1000;

  constructor(private readonly table: string, private readonly session: Session | null) {}

  select(columns = "*") { this.selected = columns; return this; }
  insert(values: DocumentData | DocumentData[]) { this.mode = "insert"; this.values = values; return this; }
  update(values: DocumentData) { this.mode = "update"; this.values = values; return this; }
  delete() { this.mode = "delete"; return this; }
  eq(field: string, value: unknown) { this.filters.push({ field, operator: "eq", value }); return this; }
  neq(field: string, value: unknown) { this.filters.push({ field, operator: "neq", value }); return this; }
  in(field: string, value: unknown[]) { this.filters.push({ field, operator: "in", value }); return this; }
  gte(field: string, value: unknown) { this.filters.push({ field, operator: "gte", value }); return this; }
  lte(field: string, value: unknown) { this.filters.push({ field, operator: "lte", value }); return this; }
  order(field: string, options?: { ascending?: boolean }) { this.orders.push({ field, ascending: options?.ascending ?? true }); return this; }
  limit(value: number) { this.maxRows = Math.min(2000, Math.max(1, value)); return this; }

  async maybeSingle(): Promise<FirebaseSingleResult> {
    const result = await this.execute();
    if (result.error) return result;
    const rows = result.data;
    return { data: rows[0] ?? null, error: null };
  }

  async single(): Promise<FirebaseSingleResult> {
    const result = await this.execute();
    if (result.error) return result;
    const rows = result.data;
    if (rows.length !== 1) return { data: null, error: { code: "not-single", message: "O registro esperado não foi encontrado." } };
    return { data: rows[0], error: null };
  }

  then<TResult1 = FirebaseRowsResult, TResult2 = never>(
    onfulfilled?: ((value: FirebaseRowsResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<FirebaseRowsResult> {
    try {
      if (!this.session?.salonId) throw new Error("Sessão do salão indisponível.");
      if (!collectionByTable[this.table]) throw new Error(`Coleção desconhecida: ${this.table}.`);
      const requestedSalon = this.filters.find((filter) => filter.field === "organization_id" || filter.field === "salonId");
      if (requestedSalon && requestedSalon.value !== this.session.salonId) throw new Error("Acesso negado a outro salão.");
      const db = getFirebaseAdminDb();
      if (this.mode !== "select") return await this.mutate(db);

      let docs: QueryDocumentSnapshot[];
      if (this.table === "organizations") {
        const snapshot = await db.collection("salons").doc(this.session.salonId).get();
        docs = snapshot.exists ? [snapshot as QueryDocumentSnapshot] : [];
      } else {
        const snapshot = await db.collection(collectionByTable[this.table]).where("salonId", "==", this.session.salonId).limit(this.maxRows).get();
        docs = snapshot.docs;
      }

      const rows: DocumentData[] = docs.map((snapshot) => {
        const data: DocumentData = snapshot.data() ?? {};
        if (this.table === "customers") {
          data.phoneNormalized ??= String(data.phone ?? "").replace(/\D/g, "");
          data.status ??= "active";
          data.doNotContact ??= false;
        }
        if (this.table === "organizations") {
          data.timezone ??= data.settings?.timezone ?? "America/Sao_Paulo";
          data.defaultMessage ??= data.settings?.defaultMessage ?? "";
          data.whatsappPhone ??= data.settings?.whatsappPhone ?? null;
        }
        return { id: snapshot.id, ...data };
      });
      let filtered = rows.filter((row) => this.filters.every((filter) => matchesFilter(row, filter)));
      for (const order of [...this.orders].reverse()) {
        const field = fieldToFirestore(order.field, this.table);
        filtered = filtered.toSorted((left, right) => {
          const a = comparable(left[field]);
          const b = comparable(right[field]);
          const result = a === b ? 0 : a == null ? -1 : b == null ? 1 : a < b ? -1 : 1;
          return order.ascending ? result : -result;
        });
      }
      filtered = filtered.slice(0, this.maxRows);
      const related = await this.attachRelations(db, filtered);
      return { data: related, error: null };
    } catch (error) {
      return { data: [], error: { code: "firebase-error", message: error instanceof Error ? error.message : "Falha ao acessar o Firebase." } };
    }
  }

  private async attachRelations(db: Firestore, rows: DocumentData[]) {
    const relations = parseRelations(this.selected);
    if (!relations.length) return rows.map((row) => recordForTable(this.table, row.id, row));

    const result = rows.map((row) => ({ ...recordForTable(this.table, row.id, row) }));
    for (const relation of relations) {
      const foreignKey = relation.name === "customers" ? "clientId" : relation.name === "services" ? "serviceId" : "professionalId";
      const ids = [...new Set(rows.map((row) => row[foreignKey] ?? (relation.name === "professionals" ? row.manicureId : null)).filter((id): id is string => typeof id === "string" && Boolean(id)))];
      const references = ids.map((id) => db.collection(relationCollection[relation.name]).doc(id));
      const snapshots = references.length ? await db.getAll(...references) : [];
      const byId = new Map(snapshots.filter((item) => item.exists).map((item) => [item.id, item.data() ?? {}]));
      for (let index = 0; index < rows.length; index += 1) {
        const id = rows[index][foreignKey] ?? (relation.name === "professionals" ? rows[index].manicureId : null);
        const data = typeof id === "string" ? byId.get(id) : undefined;
        const selected = data ? recordForTable(relation.name === "customers" ? "customers" : relation.name, id, data) : null;
        const projected = selected ? Object.fromEntries(relation.fields.map((field) => [field, selected[field]])) : null;
        result[index][relation.name] = projected ? [projected] : [];
      }
    }
    return result.filter((row) => !relations.some((relation) => relation.inner && !(row[relation.name] as unknown[])?.length));
  }

  private async mutate(db: Firestore): Promise<FirebaseRowsResult> {
    if (!this.session?.salonId) throw new Error("Sessão do salão indisponível.");
    if (["services", "professionals", "availability_rules", "organizations"].includes(this.table) && !["salon_owner", "super_admin"].includes(this.session.role)) {
      throw new Error("Somente a administração pode alterar esta informação.");
    }
    const collection = db.collection(collectionByTable[this.table]);
    const writes = this.values ? (Array.isArray(this.values) ? this.values : [this.values]) : [];
    if (this.mode === "insert") {
      for (const value of writes) {
        if (value.organization_id && value.organization_id !== this.session.salonId) throw new Error("Acesso negado a outro salão.");
        const id = typeof value.id === "string" ? value.id : crypto.randomUUID();
        await collection.doc(id).create(payloadForTable(this.table, value, this.session.salonId));
      }
      return { data: [], error: null };
    }

    const snapshot = await collection.where("salonId", "==", this.session.salonId).get();
    const matches = snapshot.docs.filter((doc) => this.filters.every((filter) => filter.field === "organization_id" || filter.field === "salonId" || matchesFilter({ id: doc.id, ...(doc.data() ?? {}) }, filter)));
    for (const doc of matches) {
      if (this.mode === "delete") await doc.ref.delete();
      else {
        const value = (this.values ?? {}) as DocumentData;
        if (value.organization_id && value.organization_id !== this.session.salonId) throw new Error("Acesso negado a outro salão.");
        await doc.ref.set(payloadForTable(this.table, value, this.session.salonId), { merge: true });
      }
    }
    return { data: [], error: null };
  }
}

export async function createFirebaseServerClient(session?: Session | null) {
  const activeSession = session === undefined ? await getFirebaseSession() : session;
  return {
    collection(name: string) { return new FirestoreQuery(name, activeSession); },
    async action(name: string, args: Record<string, unknown> = {}): Promise<FirebaseActionResult> {
      try {
        if (!activeSession) throw new Error("Sessão inválida.");
        return { data: await runFirebaseAction(name, args, activeSession), error: null };
      } catch (error) {
        return { data: null, error: { code: "firebase-error", message: error instanceof Error ? error.message : "Falha ao executar a operação." } };
      }
    },
  };
}
