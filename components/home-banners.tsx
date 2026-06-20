import Link from "next/link";

export type BannerCard = {
  id: string;
  title: string | null;
  image_url: string;
  link_type: string | null;
  link_value: string | null;
};

function bannerHref(b: BannerCard): string {
  if (!b.link_type || !b.link_value) return "#";
  switch (b.link_type) {
    case "product":
      return `/products/${b.link_value}`;
    case "vendor":
      return `/vendors/${b.link_value}`;
    case "category":
      return `/categories/${b.link_value}`;
    case "deal":
      return `/deals/${b.link_value}`;
    case "url":
      return b.link_value;
    default:
      return "#";
  }
}

export function HomeBanners({ banners }: { banners: BannerCard[] }) {
  if (!banners.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {banners.slice(0, 4).map((b) => (
          <Link
            key={b.id}
            href={bannerHref(b)}
            className="group relative block overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-neutral-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.image_url}
              alt={b.title ?? "Banner"}
              className="aspect-[16/7] w-full object-cover transition group-hover:scale-[1.02]"
            />
            {b.title && (
              <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {b.title}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
