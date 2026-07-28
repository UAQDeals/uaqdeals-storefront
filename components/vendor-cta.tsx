import Link from "next/link";
import { Store, Briefcase, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export function VendorCta() {
  return (
    <section className="border-t border-[color:var(--brand-border)] py-12 md:py-14">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <Reveal>
          <div className="bg-maroon-radial relative overflow-hidden rounded-3xl px-6 py-9 shadow-[var(--shadow-premium)] md:px-12 md:py-12">
            {/* gold hairline + soft glows */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
            <span
              className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -bottom-20 -start-12 h-64 w-64 rounded-full bg-black/20 blur-3xl"
              aria-hidden
            />
            <div className="relative grid items-center gap-7 md:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="eyebrow text-[color:var(--brand-gold)]">
                  For businesses
                </p>
                <h2 className="font-display mt-2 text-[26px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[32px]">
                  Grow your business with UAQ Deals.
                </h2>
                <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-white/70 sm:text-[14.5px]">
                  Reach thousands of local customers in Umm Al Quwain. List your products or services, manage orders, and get paid — all from one dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link
                  href="/vendor/signup"
                  className="group flex flex-1 items-center justify-between gap-3 rounded-2xl border border-[color:var(--brand-gold)]/40 bg-white px-5 py-4 text-[color:var(--brand-maroon)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="flex items-center gap-3">
                    <Store className="h-5 w-5" />
                    <span className="text-[14px] font-bold">Sell products</span>
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                </Link>
                <Link
                  href="/vendor/signup"
                  className="group flex flex-1 items-center justify-between gap-3 rounded-2xl border border-[color:var(--brand-gold)]/25 bg-white/10 px-5 py-4 text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--brand-gold)]/60 hover:bg-white/15"
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
        </Reveal>
      </div>
    </section>
  );
}
