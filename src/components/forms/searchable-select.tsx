"use client";

import { useId, useState } from "react";

type SearchableOption = { value: string; label: string };

type SearchableSelectProps = {
  name: string;
  placeholder: string;
  options: SearchableOption[];
  required?: boolean;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export default function SearchableSelect({ name, placeholder, options, required = false, defaultValue = "", onValueChange }: SearchableSelectProps) {
  const listId = useId();
  const [query, setQuery] = useState(options.find((option) => option.value === defaultValue)?.label ?? "");
  const selectedOption = options.find((option) => option.label === query);

  return (
    <>
      <input
        className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none"
        list={listId}
        placeholder={placeholder}
        required={required}
        value={query}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          onValueChange?.(options.find((option) => option.label === value)?.value ?? "");
        }}
      />
      <datalist id={listId}>
        {options.map((option) => <option key={option.value} value={option.label} />)}
      </datalist>
      <input type="hidden" name={name} value={selectedOption?.value ?? ""} />
    </>
  );
}
