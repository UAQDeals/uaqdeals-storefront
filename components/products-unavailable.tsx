import Link from "next/link";
import { MapPin } from "lucide-react";

export function ProductsUnavailable() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] ring-1 ring-[color:var(--brand-gold)]/30">
        <span className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[var(--shadow-sm)]">
          <MapPin className="h-6 w-6" />
        </span>
      </div>
      <h1 className="font-display text-[22px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[26px]">
        Products &amp; Deals aren&apos;t available here yet
      </h1>
      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[color:var(--brand-muted)] sm:text-[15px]">
        Products &amp; Deals are only available in Umm Al Quwain and Al Hamriyah.
        You can still explore services in your area.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/select-emirate"
          className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-[color:var(--brand-gold)]/40 transition hover:brightness-110"
        >
          Switch emirate
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-6 py-3 text-sm font-bold text-[color:var(--brand-maroon)] transition hover:border-[color:var(--brand-gold)]/60 hover:bg-[color:var(--paper-2)]"
        >
          Browse services
        </Link>
      </div>
    </div>
  );
}
