import Link from "next/link";
import { MapPin } from "lucide-react";

export function ProductsUnavailable() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-sm"
        style={{ background: "linear-gradient(135deg, #8E1B3A 0%, #C72931 55%, #F24732 100%)" }}
      >
        <MapPin className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
        Products &amp; Deals aren&apos;t available here yet
      </h1>
      <p className="mt-2 max-w-md text-sm text-neutral-600 sm:text-[15px]">
        Products &amp; Deals are only available in Umm Al Quwain and Al Hamriyah.
        You can still explore services in your area.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/select-emirate"
          className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          Switch emirate
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-800 hover:border-neutral-300"
        >
          Browse services
        </Link>
      </div>
    </div>
  );
}
