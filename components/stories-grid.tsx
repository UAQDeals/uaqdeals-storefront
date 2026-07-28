import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import type { HomeTile } from "@/lib/home-data";
import { Reveal } from "@/components/reveal";

export async function StoriesGrid({ tiles, title, eyebrow, seeAllHref = "/services", seeAllLabel }: {
  tiles: HomeTile[];
  title?: string;
  eyebrow?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
}) {
  if (!tiles || tiles.length === 0) return null;
  const t = await getTranslations("home");
  const isAr = (await getLocale()) === "ar";
  const titleText = title ?? t("exploreUaq");
  const eyebrowText = eyebrow ?? t("discover");
  const seeAllText = seeAllLabel ?? t("seeAll");
  return (
    <section className="border-t border-[color:var(--brand-border)] py-12 md:py-14">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-3.5">
            <span className="accent-bar h-9 w-1.5 rounded-full" />
            <div>
              <p className="eyebrow">{eyebrowText}</p>
              <h2 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">{titleText}</h2>
            </div>
          </div>
          <Link href={seeAllHref} className="text-[12.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]">
            {seeAllText} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.slice(0, 8).map((s, i) => (
            <Reveal key={s.slug} delay={i * 70}>
              <Link href={s.href} className="group block">
                <div className="relative w-full overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card-hover)]" style={{ aspectRatio: "3/4" }}>
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imageUrl} alt={isAr && s.titleAr ? s.titleAr : s.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                  ) : (
                    <div className="bg-maroon-radial absolute inset-0" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/50 to-transparent" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                    <p className="font-display text-[14px] font-semibold leading-snug drop-shadow">{isAr && s.titleAr ? s.titleAr : s.title}</p>
                    {!isAr && s.titleAr && <p className="mt-0.5 text-[11px] text-white/75">{s.titleAr}</p>}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
