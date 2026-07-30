import Link from "next/link";
import type { SquareSection } from "@/lib/home-data";
import { Reveal } from "@/components/reveal";

export function SquareBannerRow({ section, isAr }: { section: SquareSection; isAr: boolean }) {
  if (!section.items.length) return null;
  const title = (isAr ? section.titleAr : section.title) || section.title;
  const subtitle = (isAr ? section.subtitleAr : section.subtitle) || section.subtitle;
  const portrait = section.shape === "portrait";
  const cardW = portrait ? "w-[150px] md:w-[168px]" : "w-[168px] md:w-[190px]";

  return (
    <section className="border-t border-[color:var(--brand-border)] py-12 md:py-14">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        {(title || subtitle) && (
          <div className="mb-6 flex items-center gap-3.5">
            <span className="accent-bar h-9 w-1.5 rounded-full" />
            <div>
              {subtitle && <p className="eyebrow">{subtitle}</p>}
              {title && (
                <h2 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">
                  {title}
                </h2>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {section.items.map((item, i) => (
            <Reveal key={item.id} delay={i * 60}>
              <Link
                href={item.href}
                className={`premium-card group relative block shrink-0 overflow-hidden ${cardW}`}
              >
                <div className="relative w-full overflow-hidden bg-[color:var(--paper-2)]" style={{ aspectRatio: portrait ? "3/4" : "1/1" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
                  />
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/50 to-transparent" aria-hidden />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
