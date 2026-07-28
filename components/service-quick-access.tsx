import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import type { HomeTile } from "@/lib/home-data";
import { Reveal } from "@/components/reveal";

export async function ServiceQuickAccess({ tiles }: { tiles: HomeTile[] }) {
  if (!tiles || tiles.length === 0) return null;
  const t = await getTranslations("home");
  const isAr = (await getLocale()) === "ar";
  return (
    <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-12 md:py-14">
      <div className="mb-6 flex items-center gap-3.5">
        <span className="accent-bar h-9 w-1.5 rounded-full" />
        <div>
          <p className="eyebrow">{t("atYourDoorstep")}</p>
          <h2 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">
            {t("popularServices")}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {tiles.map((tile, i) => (
          <Reveal key={tile.slug} delay={i * 70}>
            <Link
              href={tile.href}
              className="group relative flex h-full min-h-[132px] flex-col justify-end overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-card)] ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] sm:min-h-[150px] sm:p-5"
            >
              {tile.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tile.imageUrl}
                  alt={isAr && tile.titleAr ? tile.titleAr : tile.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="bg-maroon-radial absolute inset-0" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
              <span className="pointer-events-none absolute -end-6 -top-6 h-20 w-20 rounded-full bg-[color:var(--brand-gold)]/15 blur-xl" aria-hidden />
              <div className="relative flex items-end justify-between">
                <p className="font-display text-[15px] font-semibold leading-tight text-white drop-shadow sm:text-[17px]">
                  {isAr && tile.titleAr ? tile.titleAr : tile.title}
                </p>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
