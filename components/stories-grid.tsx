import Link from "next/link";
import { getTranslations } from "next-intl/server";

const STORIES = [
  {
    emoji: "🧭",
    bg: "#e8ddd4",
    label: { en: "Explore UAQ's hidden gems", ar: "استكشف أم القيوين" },
    sub:   { en: "Tours & local experiences",  ar: "جولات محلية" },
    href: "/categories/explore_uaq",
  },
  {
    emoji: "🦁",
    bg: "#d4e8d4",
    label: { en: "Zoo & Events this weekend", ar: "حديقة الحيوان والفعاليات" },
    sub:   { en: "Family fun in UAQ",          ar: "متعة عائلية" },
    href: "/categories/zoo_events",
  },
  {
    emoji: "✈️",
    bg: "#d4dfe8",
    label: { en: "Fly anywhere from UAQ",      ar: "احجز رحلتك" },
    sub:   { en: "Book flights in one tap",     ar: "حجز رحلات سريع" },
    href: "/categories/flight_booking",
  },
  {
    emoji: "🏨",
    bg: "#e8d4e0",
    label: { en: "Stay in UAQ",                ar: "أقم في أم القيوين" },
    sub:   { en: "Hotels & short stays",        ar: "فنادق وإقامة قصيرة" },
    href: "/categories/hotel_booking",
  },
];

export async function StoriesGrid() {
  const t = await getTranslations("common");

  return (
    <section className="border-t border-neutral-100 py-10">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)] mb-1">
              Discover
            </p>
            <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-900">
              Explore UAQ
            </h2>
          </div>
          <Link
            href="/services"
            className="text-[12px] font-bold text-neutral-900 underline underline-offset-2 hover:text-[color:var(--brand-maroon)] transition-colors"
          >
            {t("seeAll")} →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STORIES.map((s) => (
            <Link key={s.href} href={s.href} className="group block">
              {/* Tall card image */}
              <div
                className="w-full overflow-hidden flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ background: s.bg, aspectRatio: "3/4" }}
              >
                {s.emoji}
              </div>
              <div className="pt-2.5">
                <p className="text-[13px] font-bold text-neutral-900 leading-snug">
                  {s.label.en}
                </p>
                <p className="text-[11.5px] text-neutral-500 mt-0.5">{s.sub.en}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
