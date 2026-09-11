"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110"
    >
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
