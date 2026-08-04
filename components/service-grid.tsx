import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export type ServiceGridItem = {
  title: string;
  href: string;
  emoji: string;
};

/**
 * A single calm, scannable grid of every service & marketplace listing —
 * the web counterpart of the app's long list of service carousels. Replaces
 * the former wall of full-width red "Browse" rails with one dense card grid
 * on the warm paper surface, so brand red stays a punctuation, not the floor.
 */
export async function ServiceGrid({
  items,
  title,
}: {
  items: ServiceGridItem[];
  title?: string;
}) {
  const t = await getTranslations("home");
  if (!items.length) return null;
  const heading = title ?? t("svcGridTitle");

  return (
    <section className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 md:py-10">
      <Reveal className="mb-5 flex items-center gap-3.5">
        <span className="accent-bar h-9 w-1.5 rounded-full" aria-hidden />
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[26px]">
          {heading}
        </h2>
      </Reveal>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal as="li" key={`${item.title}-${i}`} delay={Math.min(i, 7) * 45}>
            <Link
              href={item.href}
              className="premium-card group flex h-full items-center gap-3 p-3.5 sm:p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-xl shadow-[var(--shadow-sm)] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
                {item.emoji}
              </span>
              <span className="font-display line-clamp-2 min-w-0 flex-1 text-[14.5px] font-semibold leading-snug tracking-tight text-[color:var(--ink)]">
                {item.title}
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 -translate-x-1 text-[color:var(--brand-muted)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[color:var(--brand-maroon)] group-hover:opacity-100 rtl:-scale-x-100"
                aria-hidden
              />
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
