import type { Metadata } from "next";
import Link from "next/link";
import { TravelWidget } from "@/components/TravelWidget";

// Travelpayouts flight-search widget script URL.
const FLIGHTS_WIDGET_SRC =
  "https://tpwgts.com/content?currency=aed&trs=557077&shmarker=758672&show_hotels=true&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%2332a8dd&color_button=%2332a8dd&color_icons=%2332a8dd&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%2332a8dd&border_radius=0&no_labels=true&plain=true&promo_id=7879&campaign_id=100";

export const metadata: Metadata = {
  title: "Flight Booking | UAQ Deals",
  description:
    "Search and book cheap flights to hundreds of destinations from the UAE with UAQ Deals.",
  alternates: { canonical: "https://uaqdeals.ae/flights" },
};

export default function FlightsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12 md:px-8 md:py-16">
      <p className="eyebrow">Travel</p>
      <h1 className="font-display mt-2 text-[30px] font-semibold leading-[1.08] tracking-tight text-[color:var(--ink)] sm:text-[40px]">
        Flight Booking
      </h1>
      <p className="mt-3 max-w-[640px] text-[15.5px] leading-relaxed text-neutral-700">
        Compare fares across airlines and book flights to hundreds of destinations.
      </p>
      <div className="gold-rule mt-8" />
      <div className="mt-8">
        {FLIGHTS_WIDGET_SRC.startsWith("PASTE") ? (
          <div className="premium-card p-8 text-center sm:p-12">
            <p className="text-[15.5px] leading-relaxed text-neutral-700">
              Flight booking is launching soon on UAQ Deals.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]"
            >
              ← Back to home
            </Link>
          </div>
        ) : (
          <TravelWidget scriptSrc={FLIGHTS_WIDGET_SRC} minHeight={560} />
        )}
      </div>
    </div>
  );
}
