"use client";

import { useState } from "react";
import { selectEmirate } from "./actions";

type Em = { name: string; emoji: string; full: boolean; grad: string[] };

export function EmirateGrid({ emirates }: { emirates: Em[] }) {
  const [picking, setPicking] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {emirates.map((em) => {
        const isPicking = picking === em.name;
        return (
          <button
            key={em.name}
            disabled={!!picking}
            onClick={() => { setPicking(em.name); selectEmirate(em.name); }}
            className="group relative bg-white rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl disabled:opacity-70"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}
          >
            {/* badge */}
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide"
              style={em.full
                ? { background: "#16A34A", color: "#fff" }
                : { background: "#F3F4F6", color: "#6B7280" }}>
              {em.full ? "FULL" : "SERVICES"}
            </span>

            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
              style={{ background: `linear-gradient(135deg, ${em.grad[0]}, ${em.grad[1]})` }}>
              {em.emoji}
            </div>
            <p className="text-[15px] font-extrabold text-neutral-900 leading-tight">{em.name}</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              {em.full ? "Shop + Services + Classifieds" : "Services + Classifieds"}
            </p>

            {isPicking && (
              <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#8E1B3A] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
