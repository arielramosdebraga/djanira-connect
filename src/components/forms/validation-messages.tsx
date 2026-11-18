"use client";

import { useEffect } from "react";

export default function ValidationMessages() {
  useEffect(() => {
    const handleInvalid = (event: Event) => {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!field || typeof field.setCustomValidity !== "function") return;
      if (field.validity.typeMismatch) {
        field.setCustomValidity("Informe um e-mail válido.");
      } else {
        field.setCustomValidity(field.dataset.validationMessage ?? "Preencha este campo.");
      }
    };
    const clearMessage = (event: Event) => {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (field && typeof field.setCustomValidity === "function") field.setCustomValidity("");
    };
    document.addEventListener("invalid", handleInvalid, true);
    document.addEventListener("input", clearMessage, true);
    document.addEventListener("change", clearMessage, true);
    return () => {
      document.removeEventListener("invalid", handleInvalid, true);
      document.removeEventListener("input", clearMessage, true);
      document.removeEventListener("change", clearMessage, true);
    };
  }, []);
  return null;
}
