"use client";

import Link from "next/link";

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
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
        <Link href={bannerHref(b)} className="block overflow-hidden rounded-2xl">
          <picture>
            {b.mobile_image_url && <source media="(max-width: 768px)" srcSet={b.mobile_image_url} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image_url} alt={b.title ?? ""} className="aspect-[2/1] w-full object-cover hover:scale-[1.01] transition-transform duration-500 md:aspect-[16/5]" />
          </picture>
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <div className="grid grid-cols-2 gap-3">
        {banners.slice(0, 2).map((b) => (
          <Link key={b.id} href={bannerHref(b)} className="block overflow-hidden rounded-2xl">
            <picture>
              {b.mobile_image_url && <source media="(max-width: 768px)" srcSet={b.mobile_image_url} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt={b.title ?? ""} className="aspect-[16/9] w-full object-cover hover:scale-[1.01] transition-transform duration-500" />
            </picture>
          </Link>
        ))}
      </div>
    </div>
  );
}
