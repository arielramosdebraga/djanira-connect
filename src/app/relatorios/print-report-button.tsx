"use client";

export default function PrintReportButton() {
  return <button className="no-print rounded-xl border border-[#d9cec8] bg-white px-5 py-3 text-sm font-semibold text-[#75401f] hover:border-[#a96532]" type="button" onClick={() => window.print()}>Gerar PDF</button>;
}
