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
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={initialValue}
          placeholder="Search products, deals, services…"
          autoFocus
          className="w-full h-12 ps-11 pe-10 border border-neutral-300 bg-white text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
        />
        {initialValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="h-12 px-6 bg-neutral-900 text-white text-[13px] font-bold hover:bg-neutral-700 transition-colors disabled:opacity-50 shrink-0"
      >
        {isPending ? "…" : "Search"}
      </button>
    </form>
  );
}
