"use client";

import { useRef, useState } from "react";

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
  const [query, setQuery] = useState(options.find((option) => option.value === defaultValue)?.label ?? "");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedOption = options.find((option) => option.label === query);
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()));
  const selectOption = (option: SearchableOption) => {
    setQuery(option.label);
    setOpen(false);
    inputRef.current?.setCustomValidity("");
    onValueChange?.(option.value);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 pr-10 focus:border-[#8f4e68] focus:outline-none"
        placeholder={placeholder}
        required={required}
        value={query}
        data-validation-message="Selecione uma opção."
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setOpen(true);
          event.currentTarget.setCustomValidity("");
          onValueChange?.(options.find((option) => option.label === value)?.value ?? "");
        }}
      />
      <span className="pointer-events-none absolute right-4 top-[calc(50%+0.25rem)] -translate-y-1/2 text-lg leading-none text-[#8f4e68]" aria-hidden="true">⌄</span>
      {open ? <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[#d9cec8] bg-white p-1 shadow-lg">{filteredOptions.length ? filteredOptions.map((option) => <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#faf5f7]" key={option.value} type="button" onMouseDown={(event) => { event.preventDefault(); selectOption(option); }}>{option.label}</button>) : <p className="px-3 py-2 text-sm text-[#716963]">Nenhuma opção encontrada.</p>}</div> : null}
      <input type="hidden" name={name} value={selectedOption?.value ?? ""} />
    </div>
  );
}
