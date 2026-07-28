import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

export async function AppDownloadCta() {
  const t = await getTranslations("home");
  const stats = [
    { num: "10K+", label: t("statDownloads") },
    { num: "4.8★", label: t("statRating") },
    { num: "32+", label: t("statVendorTypes") },
  ];
  return (
    <section id="get-app" className="bg-maroon-radial relative overflow-hidden">
      {/* Gold hairline top divider */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />

      {/* Floating decorative orbs */}
      <span className="animate-floaty pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl" aria-hidden />
      <span className="animate-floaty pointer-events-none absolute -bottom-28 -start-20 h-80 w-80 rounded-full bg-black/25 blur-3xl" style={{ animationDelay: "1.6s" }} aria-hidden />
      <span className="pointer-events-none absolute end-[16%] top-10 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/10 blur-2xl" aria-hidden />

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-8 py-16 md:py-20">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">

          {/* Left: app icon in a glass frame */}
          <Reveal className="shrink-0">
            <div className="glass-dark relative flex flex-col items-center gap-4 rounded-[30px] p-7 shadow-[var(--shadow-premium)]">
              <div className="relative">
                <div className="h-28 w-28 overflow-hidden rounded-[30px] border border-[color:var(--brand-gold)]/40 shadow-2xl ring-1 ring-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/uaq-logo.png" alt="UAQ Deals App" className="h-full w-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -end-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[color:var(--brand-maroon-deep)] bg-green-400">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-display text-[16px] font-semibold text-white">UAQ Deals</p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="h-3.5 w-3.5 fill-current text-[color:var(--brand-gold)]" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ms-1 text-[11.5px] font-semibold text-white/70">4.8</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: text + CTAs */}
          <div className="flex-1 text-center md:text-start">
            <Reveal>
              <p className="eyebrow text-[color:var(--brand-gold)]">{t("appEyebrow")}</p>
              <h2 className="font-display mt-3 text-[32px] font-semibold leading-[1.08] tracking-[-0.01em] text-white md:text-[46px]">
                {t("appHeadline1")}<br />
                <span className="text-gold-gradient">{t("appHeadline2")}</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[14.5px] leading-relaxed text-white/70 md:mx-0">
                {t("appSubcopy")}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-9 flex flex-wrap justify-center gap-3.5 md:justify-start">
                <Link href="#"
                  className="shine group inline-flex items-center gap-3 rounded-2xl border border-[color:var(--brand-gold)]/30 bg-white/10 px-5 py-3.5 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--brand-gold)]/60 hover:bg-white/15">
                  <svg className="h-7 w-7 shrink-0 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[10px] leading-none text-white/60">{t("downloadOnThe")}</p>
                    <p className="text-[15px] font-bold leading-tight">App Store</p>
                  </div>
                </Link>
                <Link href="#"
                  className="shine group inline-flex items-center gap-3 rounded-2xl border border-[color:var(--brand-gold)]/30 bg-white/10 px-5 py-3.5 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--brand-gold)]/60 hover:bg-white/15">
                  <svg className="h-7 w-7 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4CAF50" d="M1.22 0C.89 0 .6.25.6.67v22.67c0 .4.29.67.62.67l.09-.01 12.65-12.65v-.27L1.31.01l-.09-.01z"/>
                    <path fill="#FFC107" d="M17.96 12.33l-3.38-3.38-12.88 12.88.2.18c.5.35 1.17.31 1.62-.09l14.44-9.59z"/>
                    <path fill="#F44336" d="M17.96 11.67L3.52.79C3.07.39 2.4.35 1.9.7l-.09.06 12.88 12.88 3.27-1.97z"/>
                    <path fill="#37474F" d="M1.22 24c-.33 0-.62-.25-.62-.67V.67C.6.25.89 0 1.22 0l.09.01L.6 12l.71 12-.09-.01z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[10px] leading-none text-white/60">{t("getItOn")}</p>
                    <p className="text-[15px] font-bold leading-tight">Google Play</p>
                  </div>
                </Link>
              </div>
            </Reveal>

            {/* Stats strip */}
            <Reveal delay={220}>
              <div className="mt-9 flex justify-center gap-8 md:justify-start">
                {stats.map(({ num, label }) => (
                  <div key={label} className="text-center md:text-start">
                    <p className="font-display text-[24px] font-semibold text-white">{num}</p>
                    <p className="mt-0.5 text-[11px] text-white/55">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
