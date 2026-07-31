import type { Metadata } from "next";
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
        <TravelWidget scriptSrc={HOTELS_WIDGET_SRC} minHeight={560} />
      </div>
    </div>
  );
}
