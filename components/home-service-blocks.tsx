import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

/** A titled "service" section with a brand CTA card — the web counterpart of the
 *  app's service carousels (config-driven from home_sections). */
export async function ServiceRail({
  title,
  href,
  emoji = "🧩",
  subtitle,
}: {
  title: string;
  href: string;
  emoji?: string;
  subtitle?: string;
}) {
  const t = await getTranslations("home");
  return (
    <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-8 md:py-10">
      <Reveal className="mb-4 flex items-center gap-3.5">
        <span className="accent-bar h-9 w-1.5 rounded-full" />
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[26px]">{title}</h2>
      </Reveal>
      <Reveal>
        <Link
          href={href}
          className="shine bg-maroon-radial group relative flex items-center gap-4 overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-premium)] transition-all duration-500 hover:-translate-y-1"
        >
          <span className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl" aria-hidden />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-2xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            {emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-display block text-[17px] font-semibold leading-tight">{title}</span>
            <span className="mt-0.5 block text-[12.5px] text-white/80">{subtitle ?? t("browseInUaq", { name: title })}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--brand-gold)]/40 bg-white/10 px-4 py-2 text-[12.5px] font-bold backdrop-blur-sm transition group-hover:bg-white/20">
            {t("browse")}
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}

/** Flight + Hotel booking button pair (web mirror of the app travel buttons). */
export async function TravelButtons({ showFlight = true, showHotel = true }: { showFlight?: boolean; showHotel?: boolean }) {
  const t = await getTranslations("home");
  const cards = [
    showFlight && {
      label: t("bookFlight"),
      sub: t("flightsWorldwide"),
      emoji: "✈️",
      href: "/services/flight-booking",
      grad: ["#2E7DF6", "#1B4FC4"],
    },
    showHotel && {
      label: t("hotelsResorts"),
      sub: t("stayUnwind"),
      emoji: "🏨",
      href: "/services/hotel-booking",
      grad: ["#14B8A6", "#0D8A7C"],
    },
  ].filter(Boolean) as { label: string; sub: string; emoji: string; href: string; grad: string[] }[];
  if (!cards.length) return null;
  return (
    <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-8 md:py-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.href} delay={i * 70}>
            <Link
              href={c.href}
              className="shine group relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
              style={{ background: `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})` }}
            >
              <span className="pointer-events-none absolute -end-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" aria-hidden />
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" aria-hidden />
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl shadow-inner backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                {c.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block text-[16px] font-semibold leading-tight">{c.label}</span>
                <span className="mt-0.5 block text-[12px] text-white/85">{c.sub}</span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white rtl:-scale-x-100" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** "List your Used gadgets" CTA banner (web mirror of the app banner). */
export async function SellGadgetsBanner() {
  const t = await getTranslations("home");
  return (
    <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-8 md:py-10">
      <Reveal>
        <Link
          href="/marketplace/used_items/sell"
          className="shine group relative flex items-center gap-4 overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-premium)] transition-all duration-500 hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, #4B2A86, #7C3AED)" }}
        >
          <span className="pointer-events-none absolute -start-10 -bottom-10 h-44 w-44 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl" aria-hidden />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="font-display block text-[20px] font-semibold leading-tight">{t("sellGadgetsTitle")}</span>
            <span className="mt-1 block text-[13px] text-white/85">{t("sellGadgetsSub")}</span>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] px-4 py-2 text-[12.5px] font-extrabold text-[#3B1F63] shadow-lg">
              {t("listNow")}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
            </span>
          </span>
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-4xl shadow-inner backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
            📱
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
