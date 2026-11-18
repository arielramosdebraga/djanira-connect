import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizePhone, formatPhone } from "../src/domains/contacts/phone";
import { contactInputSchema } from "../src/domains/contacts/validation";
import { attendanceInputSchema } from "../src/domains/attendances/validation";
import { serviceInputSchema } from "../src/domains/services/validation";
import { parseSalonDateTime } from "../src/lib/dates/salon";
import { addCalendarDays, formatSalonDate, getSalonMonthStart, getSalonToday, getSalonWeekStart } from "../src/lib/dates/salon-calendar";

describe("telefone", () => {
  it("normaliza telefones nacionais e internacionais", () => {
    expect(normalizePhone("(48) 99219-0607")).toBe("5548992190607");
    expect(normalizePhone("5548992190607")).toBe("5548992190607");
    expect(formatPhone("5548992190607")).toBe("+55 (48) 99219-0607");
    expect(formatPhone("551199999999")).toBe("+551199999999");
  });

  it("rejeita números fora do tamanho aceito", () => {
    expect(() => normalizePhone("123")).toThrow("Informe um telefone válido");
    expect(() => normalizePhone("1234567890123456")).toThrow("Informe um telefone válido");
  });
});

describe("validação de contatos", () => {
  it("aceita contato válido e aplica padrão de não contatar", () => {
    const result = contactInputSchema.parse({ name: " Marina ", phone: "48992190607" });
    expect(result).toEqual({ name: "Marina", phone: "48992190607", doNotContact: false });
  });

  it("rejeita nome vazio e observação longa", () => {
    expect(contactInputSchema.safeParse({ name: " ", phone: "1" }).success).toBe(false);
    expect(contactInputSchema.safeParse({ name: "Marina", phone: "1", notes: "a".repeat(501) }).success).toBe(false);
  });
});

describe("validação de atendimento", () => {
  const valid = {
    customerId: "00000000-0000-4000-8000-000000000001",
    serviceId: "00000000-0000-4000-8000-000000000002",
    professionalId: "",
    performedAt: "18/11/2026 09:00",
    price: "R$ 70,00",
    notes: "Finalizado",
    idempotencyKey: "00000000-0000-4000-8000-000000000003",
  };

  it("converte valor monetário para centavos", () => {
    expect(attendanceInputSchema.parse(valid).price).toBe(7000);
    expect(attendanceInputSchema.parse({ ...valid, price: "" }).price).toBeNull();
  });

  it("aceita profissional válido e rejeita dados inválidos", () => {
    expect(attendanceInputSchema.parse({ ...valid, professionalId: "00000000-0000-4000-8000-000000000004" }).professionalId).toContain("0004");
    expect(attendanceInputSchema.safeParse({ ...valid, customerId: "invalido" }).success).toBe(false);
    expect(attendanceInputSchema.safeParse({ ...valid, price: "valor" }).success).toBe(false);
    expect(attendanceInputSchema.safeParse({ ...valid, price: "-R$ 1,00" }).success).toBe(false);
  });
});

describe("validação de serviços", () => {
  it("converte preço, duração e prazo", () => {
    expect(serviceInputSchema.parse({ name: "Corte", averagePrice: "R$ 70,00", durationMinutes: "45", returnPeriodDays: "30" })).toMatchObject({ averagePrice: 7000, durationMinutes: 45, returnPeriodDays: 30 });
    expect(serviceInputSchema.parse({ name: "Corte", averagePrice: "", durationMinutes: 15, returnPeriodDays: "" })).toMatchObject({ averagePrice: null, returnPeriodDays: null });
  });

  it("rejeita preço, duração e prazo inválidos", () => {
    expect(serviceInputSchema.safeParse({ name: "", averagePrice: "0", durationMinutes: 0, returnPeriodDays: "0" }).success).toBe(false);
    expect(serviceInputSchema.safeParse({ name: "Corte", averagePrice: "texto", durationMinutes: 15, returnPeriodDays: "" }).success).toBe(false);
    expect(serviceInputSchema.safeParse({ name: "Corte", averagePrice: "10", durationMinutes: 15, returnPeriodDays: "abc" }).success).toBe(false);
  });
});

describe("datas do salão", () => {
  afterEach(() => vi.useRealTimers());

  it("converte data e horário do salão para ISO", () => {
    expect(parseSalonDateTime("2026-11-18T09:00")).toBe("2026-11-18T12:00:00.000Z");
    expect(() => parseSalonDateTime("18/11/2026 09:00")).toThrow("data e horário válidos");
  });

  it("calcula hoje, início da semana, início do mês e dias seguintes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T15:00:00.000Z"));
    expect(getSalonToday()).toBe("2026-11-18");
    expect(getSalonWeekStart("2026-11-18")).toBe("2026-11-16");
    expect(getSalonWeekStart("2026-11-22")).toBe("2026-11-16");
    expect(getSalonMonthStart("2026-11-18")).toBe("2026-11-01");
    expect(addCalendarDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addCalendarDays("2026-11-18", -1)).toBe("2026-11-17");
    expect(formatSalonDate("2026-11-18")).toContain("18 de nov.");
  });
});
