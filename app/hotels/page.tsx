import type { Metadata } from "next";
import Link from "next/link";
import { TravelWidget } from "@/components/TravelWidget";

// Paste the Travelpayouts hotel-search widget script URL here.
const HOTELS_WIDGET_SRC = "PASTE_WIDGET_SCRIPT_SRC_HERE";

export const metadata: Metadata = {
  title: "Hotel Booking | UAQ Deals",
  description:
    "Find and book hotels worldwide at the best prices with UAQ Deals.",
  alternates: { canonical: "https://uaqdeals.ae/hotels" },
};

export default function HotelsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12 md:px-8 md:py-16">
      <p className="eyebrow">Travel</p>
      <h1 className="font-display mt-2 text-[30px] font-semibold leading-[1.08] tracking-tight text-[color:var(--ink)] sm:text-[40px]">
        Hotel Booking
      </h1>
      <p className="mt-3 max-w-[640px] text-[15.5px] leading-relaxed text-neutral-700">
        Compare and book hotels worldwide, from city stays to beach resorts.
      </p>
      <div className="gold-rule mt-8" />
      <div className="mt-8">
        {HOTELS_WIDGET_SRC.startsWith("PASTE") ? (
          <div className="premium-card p-8 text-center sm:p-12">
            <p className="text-[15.5px] leading-relaxed text-neutral-700">
              Hotel booking is launching soon on UAQ Deals.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]"
            >
              ← Back to home
            </Link>
          </div>
        ) : (
          <TravelWidget scriptSrc={HOTELS_WIDGET_SRC} minHeight={560} />
        )}
      </div>
    </div>
  );
}
