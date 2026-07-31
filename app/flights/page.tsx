import type { Metadata } from "next";
import { TravelWidget } from "@/components/TravelWidget";

// Paste the Travelpayouts flight-search widget script URL here.
const FLIGHTS_WIDGET_SRC = "PASTE_WIDGET_SCRIPT_SRC_HERE";

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
        <TravelWidget scriptSrc={FLIGHTS_WIDGET_SRC} minHeight={560} />
      </div>
    </div>
  );
}
