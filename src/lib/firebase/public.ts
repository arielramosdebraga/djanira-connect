import "server-only";

import { createPublicReservation, getPublicReservationCatalog, getPublicReservationContact, getPublicReservationSlots } from "@lib/firebase/server-rpc";

export function getConfiguredSalonId() {
  const salonId = process.env.NEXT_PUBLIC_FIREBASE_SALON_ID?.trim();
  if (!salonId) throw new Error("Defina NEXT_PUBLIC_FIREBASE_SALON_ID com o ID do salão no Firebase.");
  return salonId;
}

export async function getPublicCatalog() {
  return getPublicReservationCatalog(getConfiguredSalonId());
}

export async function getPublicContact() {
  return getPublicReservationContact(getConfiguredSalonId());
}

export async function getAvailableReservationSlots(serviceId: string, date: string) {
  return getPublicReservationSlots(getConfiguredSalonId(), serviceId, date);
}

export async function submitPublicReservation(input: { serviceId: string; name: string; phone: string; startsAt: string; idempotencyKey: string }) {
  return createPublicReservation({ ...input, salonId: getConfiguredSalonId() });
}
