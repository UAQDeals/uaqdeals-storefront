import Link from "next/link";
import { Store } from "lucide-react";

export type CategoryTile = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

export function CategoriesGrid({ items }: { items: CategoryTile[] }) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Browse by Category
          </h2>
          <p className="text-sm text-neutral-600">
            From grocery and pharmacy to plates and properties.
          </p>
        </div>
        <Link
          href="/categories"
          className="hidden text-sm font-semibold text-[color:var(--brand-maroon)] hover:underline sm:inline"
        >
          See all
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 text-center transition hover:border-[color:var(--brand-maroon)] hover:shadow-sm"
          >
            <span
              className="bg-brand-gradient inline-flex h-12 w-12 items-center justify-center rounded-full text-white"
              aria-hidden
            >
              <Store className="h-5 w-5" />
            </span>
            <span className="line-clamp-2 text-xs font-semibold text-neutral-800">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
