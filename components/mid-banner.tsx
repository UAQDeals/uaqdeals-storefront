"use client";

import Link from "next/link";
import { Reveal } from "@/components/reveal";

export type BannerItem = { id: string; title: string | null; image_url: string; mobile_image_url?: string | null; link_type: string | null; link_value: string | null };

function bannerHref(b: BannerItem): string {
  if (!b.link_type || !b.link_value) return "#";
  if (b.link_type === "url") return b.link_value;
  if (b.link_type === "category") return `/shop/${b.link_value}`;
  if (b.link_type === "deal") return `/deals/${b.link_value}`;
  if (b.link_type === "product") return `/products/${b.link_value}`;
  return "#";
}

export function MidBanner({ banners }: { banners: BannerItem[] }) {
  if (!banners.length) return null;
  if (banners.length === 1) {
    const b = banners[0];
    return (
      <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 md:py-10">
        <Reveal>
          <Link
            href={bannerHref(b)}
            className="group relative block overflow-hidden rounded-3xl shadow-[var(--shadow-card)] ring-1 ring-[color:var(--brand-border)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
          >
            <picture>
              {b.mobile_image_url && <source media="(max-width: 768px)" srcSet={b.mobile_image_url} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt={b.title ?? ""} className="block h-auto w-full object-contain transition-transform duration-[600ms] ease-out group-hover:scale-105" />
            </picture>
            <span className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" aria-hidden />
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
          </Link>
        </Reveal>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 md:py-10">
      <div className="grid grid-cols-2 gap-4">
        {banners.slice(0, 2).map((b, i) => (
          <Reveal key={b.id} delay={i * 70}>
            <Link
              href={bannerHref(b)}
              className="group relative block overflow-hidden rounded-3xl shadow-[var(--shadow-card)] ring-1 ring-[color:var(--brand-border)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
            >
              <picture>
                {b.mobile_image_url && <source media="(max-width: 768px)" srcSet={b.mobile_image_url} />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image_url} alt={b.title ?? ""} className="block h-auto w-full object-contain transition-transform duration-[600ms] ease-out group-hover:scale-105" />
              </picture>
              <span className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" aria-hidden />
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
