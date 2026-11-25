"use client";

import MaskedDateInput from "@components/forms/masked-date-input";
import { useState } from "react";

export default function FollowUpDateInput({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return <><MaskedDateInput value={value} onChange={setValue} required /><input type="hidden" name={name} value={value} /></>;
}
