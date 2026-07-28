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
        <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--brand-maroon)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-12 w-full rounded-full border border-[color:var(--brand-border)] bg-white ps-11 pe-4 text-sm text-[color:var(--ink)] shadow-[var(--shadow-sm)] outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
            <Search className="h-7 w-7" />
          </span>
          <p className="font-display mt-4 text-[18px] font-semibold text-[color:var(--ink)]">
            {t("noMatch", { query: q })}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((c) => {
            const isImg = !!c.icon && /^https?:\/\//.test(c.icon);
            return (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group premium-card flex flex-col gap-3 overflow-hidden p-4"
              >
                {isImg ? (
                  <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-inset ring-[color:var(--brand-gold)]/25">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.icon as string}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  </span>
                ) : (
                  <span
                    className="bg-brand-gradient inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-[1.07]"
                    aria-hidden
                  >
                    <Store className="h-5 w-5" />
                  </span>
                )}
                <div>
                  <p className="font-display text-[14.5px] font-semibold text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--brand-maroon)]">
                    {c.name}
                  </p>
                  {c.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--brand-muted)]">
                      {c.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
