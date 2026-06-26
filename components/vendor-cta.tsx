import Link from "next/link";
import { Store, Briefcase, ArrowRight } from "lucide-react";

export function VendorCta() {
  return (
    <section className="border-t border-neutral-100 py-10">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-9 md:px-12 md:py-12">
          {/* brand glow */}
          <span
            className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-2xl"
            style={{ background: "linear-gradient(135deg, #C72931, #F24732)" }}
            aria-hidden
          />
          <div className="relative grid items-center gap-7 md:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-brand-gradient text-[10.5px] font-bold uppercase tracking-[2px]">
                For businesses
              </p>
              <h2 className="mt-2 text-[26px] font-extrabold leading-[1.1] tracking-[-0.5px] text-white sm:text-[32px]">
                Grow your business with UAQ Deals.
              </h2>
              <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-neutral-400 sm:text-[14.5px]">
                Reach thousands of local customers in Umm Al Quwain. List your products or services, manage orders, and get paid — all from one dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link
                href="/vendor/signup"
                className="bg-brand-gradient group flex flex-1 items-center justify-between gap-3 rounded-2xl px-5 py-4 text-white shadow-md transition hover:scale-[1.02]"
              >
                <span className="flex items-center gap-3">
                  <Store className="h-5 w-5" />
                  <span className="text-[14px] font-bold">Sell products</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </Link>
              <Link
                href="/vendor/signup"
                className="group flex flex-1 items-center justify-between gap-3 rounded-2xl border border-white/20 px-5 py-4 text-white transition hover:bg-white/10"
              >
                <span className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-[14px] font-bold">List a service</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
