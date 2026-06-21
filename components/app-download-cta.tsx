import Link from "next/link";

export function AppDownloadCta() {
  return (
    <section className="bg-[#f5f0ee] border-t border-neutral-200">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-12 flex flex-col md:flex-row items-center gap-8">
        <div className="text-5xl shrink-0">📱</div>
        <div className="flex-1">
          <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)] mb-2">
            UAQ Deals App
          </p>
          <h2 className="text-[24px] font-extrabold tracking-tight text-neutral-900 mb-2">
            Shop with us — anytime, anywhere.
          </h2>
          <p className="text-[13.5px] text-neutral-600 leading-relaxed max-w-md">
            Browse groceries, restaurants, services and listings — order, track and manage everything from your phone.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="#"
              className="inline-block bg-neutral-900 text-white text-[12.5px] font-bold tracking-wide px-6 py-3 hover:bg-neutral-700 transition-colors"
            >
              App Store
            </Link>
            <Link
              href="#"
              className="inline-block border border-neutral-900 text-neutral-900 text-[12.5px] font-bold tracking-wide px-6 py-3 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Google Play
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
