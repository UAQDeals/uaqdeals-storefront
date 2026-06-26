import Link from "next/link";
import { Coins, ArrowRight } from "lucide-react";

const STATS = [
  { big: "25", small: "Welcome coins on signup" },
  { big: "1 coin", small: "For every AED 10 spent" },
  { big: "AED 1", small: "Per 100 coins, at checkout" },
];

export function CoinbackSpotlight() {
  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-8 text-white md:px-12 md:py-11"
          style={{ background: "linear-gradient(120deg, #8E1B3A 0%, #C72931 55%, #F24732 100%)" }}
        >
          {/* decorative coins */}
          <Coins className="pointer-events-none absolute -end-6 -top-6 h-44 w-44 text-white/10" aria-hidden />
          <span className="pointer-events-none absolute -bottom-16 start-1/3 h-48 w-48 rounded-full bg-white/5" aria-hidden />

          <div className="relative grid items-center gap-7 md:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[1.5px] backdrop-blur-sm">
                <Coins className="h-3.5 w-3.5" />
                Coinback rewards
              </span>
              <h2 className="mt-4 text-[26px] font-extrabold leading-[1.1] tracking-[-0.5px] sm:text-[32px]">
                Earn coins on every order. Spend them like cash.
              </h2>
              <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-white/85 sm:text-[14.5px]">
                Collect Coinback automatically as you shop across UAQ Deals, then redeem for real money off your next order — up to AED 50 per order.
              </p>
              <Link
                href="/account"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[13.5px] font-bold text-[color:var(--brand-maroon)] shadow-md transition hover:scale-[1.02]"
              >
                Start earning
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2.5 md:gap-3">
              {STATS.map((s) => (
                <div
                  key={s.small}
                  className="rounded-2xl border border-white/20 bg-white/10 px-3 py-4 text-center backdrop-blur-sm"
                >
                  <p className="text-[19px] font-extrabold leading-none sm:text-[22px]">{s.big}</p>
                  <p className="mt-1.5 text-[10.5px] leading-snug text-white/80">{s.small}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
