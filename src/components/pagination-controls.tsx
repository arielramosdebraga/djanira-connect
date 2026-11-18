"use client";

type PaginationControlsProps = { page: number; totalPages: number; onPageChange: (page: number) => void };

export default function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;
  return <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f1ece8] pt-4"><p className="text-sm text-[#716963]">Página {page} de {totalPages}</p><div className="flex gap-2"><button className="rounded-xl border border-[#d9cec8] px-4 py-2 text-sm font-semibold text-[#716963] transition hover:border-[#8f4e68] hover:text-[#8f4e68] disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>Anterior</button><button className="rounded-xl border border-[#d9cec8] px-4 py-2 text-sm font-semibold text-[#716963] transition hover:border-[#8f4e68] hover:text-[#8f4e68] disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>Próxima</button></div></div>;
}
