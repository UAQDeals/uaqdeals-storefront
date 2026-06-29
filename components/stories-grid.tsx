import Link from "next/link";
import { getTranslations } from "next-intl/server";

const STORIES = [
  {
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=533&fit=crop&auto=format",
    emoji: "🧭",
    label: { en: "Explore UAQ’s hidden gems", ar: "استكشف أم القيوين" },
    sub:   { en: "Tours & local experiences",    ar: "جولات محلية" },
    href: "/services/explore-uaq",
  },
  {
    image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=400&h=533&fit=crop&auto=format",
    emoji: "🦁",
    label: { en: "Zoo & Events this weekend",    ar: "حديقة الحيوان والفعاليات" },
    sub:   { en: "Family fun in UAQ",            ar: "متعة عائلية" },
    href: "/services/zoo-events",
  },
  {
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=533&fit=crop&auto=format",
    emoji: "✈️",
    label: { en: "Fly anywhere from UAQ",        ar: "احجز رحلتك" },
    sub:   { en: "Book flights in one tap",       ar: "حجز رحلات سريع" },
    href: "/services/flight-booking",
  },
  {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=533&fit=crop&auto=format",
    emoji: "🏨",
    label: { en: "Stay in UAQ",                  ar: "أقم في أم القيوين" },
    sub:   { en: "Hotels & short stays",          ar: "فنادق وإقامة قصيرة" },
    href: "/services/hotel-booking",
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
            <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-900">Explore UAQ</h2>
          </div>
          <Link href="/services"
            className="text-[12px] font-bold text-neutral-900 underline underline-offset-2 hover:text-[color:var(--brand-maroon)] transition-colors">
            {t("seeAll")} →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STORIES.map((s) => (
            <Link key={s.href} href={s.href} className="group block">
              <div className="w-full overflow-hidden relative rounded-2xl" style={{ aspectRatio: "3/4" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.label.en}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-3 text-white">
                  <span className="text-2xl block mb-1">{s.emoji}</span>
                  <p className="text-[13px] font-bold leading-snug">{s.label.en}</p>
                  <p className="text-[11px] text-white/80 mt-0.5">{s.sub.en}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
