"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { selectEmirate } from "./actions";

type Em = { name: string; emoji: string; full: boolean; grad: string[] };

export function EmirateGrid({ emirates }: { emirates: Em[] }) {
  const router = useRouter();
  const [picking, setPicking] = useState<string | null>(null);

  async function choose(name: string) {
    setPicking(name);
    try {
      await selectEmirate(name);
      router.push("/");
      router.refresh();
    } catch (e) {
      setPicking(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {emirates.map((em, i) => {
        const isPicking = picking === em.name;
        return (
          <Reveal key={em.name} delay={i * 60}>
            <button
              disabled={!!picking}
              onClick={() => choose(em.name)}
              className="premium-card group relative w-full overflow-hidden p-5 text-start transition-all duration-300 hover:-translate-y-1 disabled:opacity-70"
            >
              {/* soft gradient wash on hover */}
              <span
                className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `linear-gradient(135deg, ${em.grad[0]}, ${em.grad[1]})` }}
                aria-hidden
              />

              {/* badge */}
              <span
                className="absolute end-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide"
                style={em.full
                  ? { background: "var(--brand-gold-deep)", color: "#fff" }
                  : { background: "var(--paper-2)", color: "var(--brand-muted)" }}
              >
                {em.full ? "FULL" : "SERVICES"}
              </span>

              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${em.grad[0]}, ${em.grad[1]})` }}
              >
                {em.emoji}
              </div>
              <p className="font-display text-[16px] font-semibold leading-tight text-[color:var(--ink)]">{em.name}</p>
              <span className="gold-rule my-2 block w-8" />
              <p className="mt-1 text-[11px] text-[color:var(--brand-muted)]">
                {em.full ? "Shop + Services + Classifieds" : "Services + Classifieds"}
              </p>

              {isPicking && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--brand-maroon)] border-t-transparent" />
                </div>
              )}
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}
