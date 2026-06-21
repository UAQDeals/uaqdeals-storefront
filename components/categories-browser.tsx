"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Store } from "lucide-react";
import { useTranslations } from "next-intl";

type Item = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export function CategoriesBrowser({ items }: { items: Item[] }) {
  const t = useTranslations("categoriesPage");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? items.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.description ?? "").toLowerCase().includes(query)
      )
    : items;

  return (
    <div className="mt-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 w-full rounded-full border border-[color:var(--brand-border)] bg-white ps-10 pe-4 text-sm outline-none focus:border-[color:var(--brand-maroon)]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-neutral-500">
          {t("noMatch", { query: q })}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 transition hover:border-[color:var(--brand-maroon)] hover:shadow-sm"
            >
              <span
                className="bg-brand-gradient inline-flex h-11 w-11 items-center justify-center rounded-full text-white"
                aria-hidden
              >
                <Store className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{c.name}</p>
                {c.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">
                    {c.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
