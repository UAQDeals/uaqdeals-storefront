import Link from "next/link";

/** A titled "service" section with a brand CTA card — the web counterpart of the
 *  app's service carousels (config-driven from home_sections). */
export function ServiceRail({
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
  return (
    <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="h-5 w-1 rounded-full" style={{ background: "linear-gradient(180deg,#E7C56A,#C9A24B)" }} />
        <h2 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h2>
      </div>
      <Link
        href={href}
        className="group flex items-center gap-4 overflow-hidden rounded-2xl p-5 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">{emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold leading-tight">{title}</span>
          <span className="block text-[12.5px] text-white/85">{subtitle ?? `Browse ${title} in Umm Al Quwain`}</span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#8E1B3A]">Browse →</span>
      </Link>
    </section>
  );
}

/** Flight + Hotel booking button pair (web mirror of the app travel buttons). */
export function TravelButtons({ showFlight = true, showHotel = true }: { showFlight?: boolean; showHotel?: boolean }) {
  const cards = [
    showFlight && {
      label: "Book Flight",
      sub: "Flights worldwide",
      emoji: "✈️",
      href: "/services/flight-booking",
      grad: ["#2E7DF6", "#1B4FC4"],
    },
    showHotel && {
      label: "Hotels & Resorts",
      sub: "Stay & unwind",
      emoji: "🏨",
      href: "/services/hotel-booking",
      grad: ["#14B8A6", "#0D8A7C"],
    },
  ].filter(Boolean) as { label: string; sub: string; emoji: string; href: string; grad: string[] }[];
  if (!cards.length) return null;
  return (
    <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex items-center gap-3 rounded-2xl p-4 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})` }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-xl">{c.emoji}</span>
            <span>
              <span className="block text-[15px] font-bold leading-tight">{c.label}</span>
              <span className="block text-[12px] text-white/85">{c.sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** "List your Used gadgets" CTA banner (web mirror of the app banner). */
export function SellGadgetsBanner() {
  return (
    <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <Link
        href="/marketplace/used_items/sell"
        className="flex items-center gap-4 overflow-hidden rounded-2xl p-5 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        style={{ background: "linear-gradient(135deg, #4B2A86, #7C3AED)" }}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-extrabold leading-tight">List your Used gadgets!</span>
          <span className="mt-0.5 block text-[13px] text-white/85">Turn old phones &amp; devices into cash</span>
          <span className="mt-2 inline-block rounded-full bg-white px-3.5 py-1.5 text-[12px] font-extrabold text-[#6D28D9]">List Now →</span>
        </span>
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/18 text-3xl">📱</span>
      </Link>
    </section>
  );
}
