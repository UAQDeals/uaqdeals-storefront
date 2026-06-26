import Link from "next/link";
import { getEmirate } from "@/lib/emirate";

export async function ServiceHero() {
  const emirate = (await getEmirate()) ?? "your area";
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <div
        className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14"
        style={{ background: "linear-gradient(135deg, #8E1B3A 0%, #C72931 55%, #F24732 100%)" }}
      >
        <span className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10" aria-hidden />
        <span className="pointer-events-none absolute -bottom-12 -start-8 h-44 w-44 rounded-full bg-white/5" aria-hidden />
        <p className="text-[12px] font-bold uppercase tracking-[3px] text-white/70">UAQ Deals · Services</p>
        <h1 className="mt-2 max-w-xl text-[26px] font-extrabold leading-tight text-white sm:text-[34px]">
          Trusted local services across {emirate}.
        </h1>
        <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-white/80 sm:text-[15px]">
          Book cleaning, home repairs, mobile fix, tailoring, business setup and more — verified providers, fair prices, right at your doorstep.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-[color:var(--brand-maroon)] shadow-sm transition hover:scale-[1.02]"
          >
            Browse all services
          </Link>
          <Link
            href="/select-emirate"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-[14px] font-bold text-white transition hover:bg-white/10"
          >
            Looking for products? Switch emirate
          </Link>
        </div>
      </div>
    </section>
  );
}
