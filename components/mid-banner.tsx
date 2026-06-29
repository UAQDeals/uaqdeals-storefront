"use client";

import Link from "next/link";

export type BannerItem = { id: string; title: string | null; image_url: string; link_type: string | null; link_value: string | null };

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.image_url} alt={b.title ?? ""} className="w-full object-cover max-h-[200px] hover:scale-[1.01] transition-transform duration-500" />
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <div className="grid grid-cols-2 gap-3">
        {banners.slice(0, 2).map((b) => (
          <Link key={b.id} href={bannerHref(b)} className="block overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image_url} alt={b.title ?? ""} className="w-full object-cover max-h-[180px] hover:scale-[1.01] transition-transform duration-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
