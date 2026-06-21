import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function HomeHero() {
  const t = await getTranslations("hero");
  const tc = await getTranslations("common");
  return (
    <section className="w-full bg-[#f5f0ee]">
      <div className="mx-auto max-w-[1320px] grid grid-cols-1 md:grid-cols-2 min-h-[360px]">
        {/* Left: copy */}
        <div className="flex flex-col justify-center px-8 md:px-12 py-14">
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)] mb-3">
            {t("tagline")}
          </p>
          <h1 className="text-[36px] md:text-[44px] font-extrabold leading-[1.08] tracking-[-1.5px] text-neutral-900 mb-4">
            {t("headline")}
          </h1>
          <p className="text-[14px] text-neutral-600 leading-relaxed mb-8 max-w-sm">
            {t("subtext")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/deals"
              className="inline-block bg-neutral-900 text-white text-[13px] font-bold tracking-wide px-6 py-3 hover:bg-neutral-700 transition-colors"
            >
              {tc("shopDeals")}
            </Link>
            <Link
              href="/categories"
              className="inline-block border border-neutral-900 text-neutral-900 text-[13px] font-bold tracking-wide px-6 py-3 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              {tc("browseCategories")}
            </Link>
          </div>
        </div>
        {/* Right: image placeholder — replace with real hero img */}
        <div
          className="hidden md:flex items-center justify-center bg-[#e8ddd4] min-h-[360px]"
          style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <span className="text-7xl select-none">🛒</span>
        </div>
      </div>
    </section>
  );
}
