import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RotateCw, Sparkles, CalendarCheck, Coins, Smartphone } from "lucide-react";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Play & Win Coins",
  description: "Spin the wheel, scratch to win, and check in daily to earn UAQ Deals coins.",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const META: Record<string, { icon: typeof RotateCw; title: string; blurb: string }> = {
  spin: { icon: RotateCw, title: "Spin the Wheel", blurb: "One free spin — land on a reward and bank the coins instantly." },
  scratch: { icon: Sparkles, title: "Scratch & Win", blurb: "Earn scratch cards on delivered orders, then scratch to reveal coins." },
  checkin: { icon: CalendarCheck, title: "Daily Check-in", blurb: "Open the app each day — your streak unlocks bigger daily rewards." },
};

function rewards(key: string, cfg: Row): number[] {
  if (key === "spin" && Array.isArray(cfg?.segments)) return cfg.segments.map((s: Row) => Number(s.coins) || 0);
  if (key === "scratch" && Array.isArray(cfg?.tiers)) return cfg.tiers.map((s: Row) => Number(s.coins) || 0);
  if (key === "checkin" && Array.isArray(cfg?.day_rewards)) return cfg.day_rewards.map((n: Row) => Number(n) || 0);
  return [];
}

export default async function GamesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_configs")
    .select("game_key, is_enabled, config")
    .eq("is_enabled", true);
  const order = ["spin", "scratch", "checkin"];
  const games = ((data ?? []) as Row[])
    .filter((g) => META[g.game_key])
    .sort((a, b) => order.indexOf(a.game_key) - order.indexOf(b.game_key));

  return (
    <>
      {/* Hero */}
      <section className="bg-maroon-radial relative overflow-hidden py-16 md:py-24">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
        <span className="animate-floaty pointer-events-none absolute top-10 end-[14%] text-[color:var(--brand-gold)]/25" aria-hidden><Coins className="h-16 w-16" /></span>
        <span className="animate-floaty pointer-events-none absolute bottom-10 start-[10%] text-[color:var(--brand-gold)]/20" style={{ animationDelay: "1.2s" }} aria-hidden><Coins className="h-10 w-10" /></span>
        <div className="relative mx-auto max-w-[900px] px-5 text-center rise-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-gold)]/40 bg-white/10 px-4 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm">
            <Coins className="h-4 w-4 text-[color:var(--brand-gold)]" /> Play &amp; Win
          </span>
          <h1 className="font-display mt-5 text-[38px] font-medium leading-[1.05] tracking-tight text-white sm:text-[56px]">
            Play games,<br /> <span className="text-gold-gradient">earn coins</span> every day.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/80">
            Spin, scratch and check in to stack up UAQ Deals coins — then spend them at checkout across groceries, food, pharmacy and more.
          </p>
        </div>
      </section>

      {/* Game cards */}
      <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-14 md:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {games.map((g) => {
            const m = META[g.game_key];
            const Icon = m.icon;
            const r = rewards(g.game_key, g.config);
            const max = r.length ? Math.max(...r) : 0;
            return (
              <div key={g.game_key} className="premium-card flex flex-col p-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-white shadow-lg">
                  <Icon className="h-8 w-8" />
                </span>
                <h2 className="font-display mt-5 text-[22px] font-semibold text-[color:var(--ink)]">{m.title}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600">{m.blurb}</p>
                {r.length > 0 && (
                  <div className="mt-5">
                    <p className="eyebrow">Rewards</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[color:var(--paper-2)] px-2.5 py-1 text-[11.5px] font-bold text-[color:var(--brand-maroon)]">
                          <Coins className="h-3 w-3 text-[color:var(--brand-gold-deep)]" />{c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-5 border-t border-[color:var(--brand-border)] pt-4 text-[13px] font-bold text-[color:var(--ink)]">
                  Win up to <span className="text-[color:var(--brand-maroon)]">{max} coins</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Play-in-app CTA */}
        <div className="bg-maroon-radial shine relative mt-8 flex flex-col items-center justify-between gap-5 overflow-hidden rounded-3xl px-7 py-8 text-center shadow-[var(--shadow-premium)] sm:flex-row sm:text-start">
          <div className="flex items-center gap-4">
            <span className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-[color:var(--brand-gold)]/40 sm:flex">
              <Smartphone className="h-7 w-7" />
            </span>
            <div>
              <h3 className="font-display text-[22px] font-semibold text-white">Play in the UAQ Deals app</h3>
              <p className="mt-1 text-[13.5px] text-white/80">Games live in the app — download it to start winning coins.</p>
            </div>
          </div>
          <Link href="/#get-app" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-[color:var(--brand-maroon)] shadow-lg transition hover:brightness-105">
            Get the app
          </Link>
        </div>
      </section>
    </>
  );
}
