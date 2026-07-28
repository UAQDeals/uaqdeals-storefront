"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { RotateCw, Sparkles, CalendarCheck, Coins, ChevronRight } from "lucide-react";
import type { WebGame } from "@/lib/home-data";
import { Reveal } from "@/components/reveal";

const META: Record<
  string,
  { icon: typeof RotateCw; en: string; ar: string; tagEn: (n: number) => string; tagAr: (n: number) => string }
> = {
  spin: {
    icon: RotateCw,
    en: "Spin the Wheel",
    ar: "عجلة الحظ",
    tagEn: (n) => `Win up to ${n} coins`,
    tagAr: (n) => `اربح حتى ${n} كوين`,
  },
  scratch: {
    icon: Sparkles,
    en: "Scratch & Win",
    ar: "اخدش واربح",
    tagEn: (n) => `Reveal up to ${n} coins`,
    tagAr: (n) => `اكشف حتى ${n} كوين`,
  },
  checkin: {
    icon: CalendarCheck,
    en: "Daily Check-in",
    ar: "تسجيل يومي",
    tagEn: (n) => `Up to ${n} coins a day`,
    tagAr: (n) => `حتى ${n} كوين يومياً`,
  },
};

export function GamesSpotlight({ games }: { games: WebGame[] }) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const list = games.filter((g) => META[g.key]);
  if (list.length === 0) return null;

  return (
    <section className="bg-maroon-radial relative overflow-hidden py-14 md:py-16">
      {/* gold hairline + decorative coins */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
      <span className="animate-floaty pointer-events-none absolute -top-6 end-[12%] hidden text-[color:var(--brand-gold)]/30 md:block" aria-hidden>
        <Coins className="h-16 w-16" />
      </span>
      <span className="animate-floaty pointer-events-none absolute bottom-6 start-[8%] hidden text-[color:var(--brand-gold)]/20 md:block" style={{ animationDelay: "1.4s" }} aria-hidden>
        <Coins className="h-10 w-10" />
      </span>
      <span className="pointer-events-none absolute -bottom-24 end-[-4rem] h-72 w-72 rounded-full bg-[color:var(--brand-gold)]/12 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-8">
        <Reveal className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand-gold)]/15 ring-1 ring-[color:var(--brand-gold)]/40">
              <Coins className="h-5 w-5 text-[color:var(--brand-gold)]" />
            </span>
            <div>
              <p className="eyebrow text-[color:var(--brand-gold)]">{isRTL ? "العب واربح" : "Play & Win"}</p>
              <h2 className="font-display mt-0.5 text-[26px] font-semibold tracking-tight text-white sm:text-[32px]">
                {isRTL ? "ألعب واكسب كوينز كل يوم" : "Play games, earn coins daily"}
              </h2>
            </div>
          </div>
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--brand-gold)]/50 bg-white/10 px-5 py-2.5 text-[13px] font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            {isRTL ? "العب الآن" : "Play now"}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {list.map((g, i) => {
            const m = META[g.key];
            const Icon = m.icon;
            return (
              <Reveal key={g.key} delay={i * 90}>
                <Link
                  href="/games"
                  className="shine glass-dark group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1.5"
                >
                  <span className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-[color:var(--brand-gold)]/10 blur-xl" aria-hidden />
                  <div className="flex items-center justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <Icon className="h-7 w-7" />
                    </span>
                    <ChevronRight className="h-5 w-5 text-white/50 transition group-hover:translate-x-1 group-hover:text-white rtl:rotate-180" />
                  </div>
                  <div className="mt-8">
                    <h3 className="font-display text-[20px] font-semibold text-white">{isRTL ? m.ar : m.en}</h3>
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--brand-gold)]">
                      <Coins className="h-3.5 w-3.5" />
                      {isRTL ? m.tagAr(g.maxCoins) : m.tagEn(g.maxCoins)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
