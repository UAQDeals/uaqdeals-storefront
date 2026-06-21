import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function HomeHero() {
  const t = await getTranslations("hero");
  const tc = await getTranslations("common");
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, #F24732, #C72931 45%, transparent 75%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-maroon)]">
          {t("tagline")}
        </p>
        <h1 className="text-brand-gradient mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          {t("headline")}
        </h1>
        <p className="mt-4 max-w-xl text-base text-neutral-700 sm:text-lg">
          {t("subtext")}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/deals"
            className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            {tc("shopDeals")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-maroon)] px-5 py-3 text-sm font-semibold text-[color:var(--brand-maroon)] transition hover:bg-[color:var(--brand-maroon)] hover:text-white"
          >
            {tc("browseCategories")}
          </Link>
        </div>
      </div>
    </section>
  );
}
