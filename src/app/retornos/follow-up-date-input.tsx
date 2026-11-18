"use client";

import { useState } from "react";
import MaskedDateInput from "@/components/forms/masked-date-input";

export default function FollowUpDateInput({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return <><MaskedDateInput value={value} onChange={setValue} required /><input type="hidden" name={name} value={value} /></>;
}
