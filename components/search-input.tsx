"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchInput({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    if (q.length < 2) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    });
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.focus();
    startTransition(() => { router.push("/search"); });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--brand-maroon)] pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={initialValue}
          placeholder="Search products, deals, services…"
          autoFocus
          className="w-full h-12 ps-12 pe-10 rounded-full border border-[color:var(--brand-border)] bg-white text-[14px] text-[color:var(--ink)] placeholder:text-neutral-400 shadow-[var(--shadow-sm)] focus:outline-none focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 transition"
        />
        {initialValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-[color:var(--brand-maroon)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="h-12 px-6 rounded-full bg-brand-gradient text-white text-[13px] font-bold shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-50 shrink-0"
      >
        {isPending ? "…" : "Search"}
      </button>
    </form>
  );
}
