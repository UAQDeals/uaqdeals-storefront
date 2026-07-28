import { ALL_EMIRATES } from "@/lib/emirate";
import { EmirateGrid } from "./grid";
import { Reveal } from "@/components/reveal";

export const metadata = { title: "Choose Your Emirate — UAQ Deals" };

export default function SelectEmiratePage() {
  return (
    <section className="bg-maroon-radial relative min-h-screen w-full overflow-hidden">
      {/* gold hairline + soft decorative glows */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
      <span className="pointer-events-none absolute -bottom-28 -start-24 h-96 w-96 rounded-full bg-black/15 blur-2xl" aria-hidden />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-14 md:px-8 sm:py-20">
        <Reveal>
          <div className="mb-11 text-center text-white">
            <p className="eyebrow">UAQ Deals</p>
            <h1 className="font-display mt-3 text-[32px] font-semibold leading-[1.08] tracking-tight sm:text-[44px]">
              Welcome to Umm Al Quwain&apos;s<br className="hidden sm:block" /> hyperlocal super-app
            </h1>
            <span className="mx-auto mt-5 block h-px w-24 bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/80 to-transparent" aria-hidden />
            <p className="mt-5 text-[14px] text-white/75 sm:text-[16px]">
              Which emirate would you like to explore?
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <EmirateGrid emirates={ALL_EMIRATES} />
        </Reveal>

        <p className="mt-9 text-center text-[12px] leading-relaxed text-white/60">
          Shop &amp; Classifieds available in Umm Al Quwain &amp; Al Hamriyah · Services available everywhere
        </p>
      </div>
    </section>
  );
}
