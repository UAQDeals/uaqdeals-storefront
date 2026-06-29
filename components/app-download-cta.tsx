import Link from "next/link";

export function AppDownloadCta() {
  return (
    <section className="relative overflow-hidden border-t border-neutral-200"
      style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0a0f 50%, #2d0d18 100%)" }}>
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #C72931, transparent)" }} />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #F24732, transparent)" }} />

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-8 py-14 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Left: app icon + mockup feel */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative">
              <div className="h-24 w-24 rounded-[28px] overflow-hidden shadow-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/uaq-logo.png" alt="UAQ Deals App" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-400 border-2 border-black flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-extrabold text-sm">UAQ Deals</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="h-3 w-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-white/60 text-[11px] ms-1">4.8</span>
              </div>
            </div>
          </div>

          {/* Right: text + CTAs */}
          <div className="flex-1 text-center md:text-start">
            <p className="text-[10.5px] font-bold tracking-[3px] uppercase text-[#F24732] mb-3">
              UAQ Deals App
            </p>
            <h2 className="text-[28px] md:text-[38px] font-extrabold tracking-tight text-white leading-[1.1] mb-4">
              Shop smarter.<br />
              <span style={{ background: "linear-gradient(90deg, #C72931, #F24732)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Earn while you shop.
              </span>
            </h2>
            <p className="text-[14px] text-white/60 leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              Groceries, food, services, real estate — everything UAQ in one app.
              Earn coins on every order and redeem for discounts.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link href="#"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-white hover:bg-white/20 transition-all backdrop-blur-sm">
                <svg className="h-7 w-7 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-start">
                  <p className="text-[10px] text-white/60 leading-none">Download on the</p>
                  <p className="text-[15px] font-bold leading-tight">App Store</p>
                </div>
              </Link>
              <Link href="#"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-white hover:bg-white/20 transition-all backdrop-blur-sm">
                <svg className="h-7 w-7 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4CAF50" d="M1.22 0C.89 0 .6.25.6.67v22.67c0 .4.29.67.62.67l.09-.01 12.65-12.65v-.27L1.31.01l-.09-.01z"/>
                  <path fill="#FFC107" d="M17.96 12.33l-3.38-3.38-12.88 12.88.2.18c.5.35 1.17.31 1.62-.09l14.44-9.59z"/>
                  <path fill="#F44336" d="M17.96 11.67L3.52.79C3.07.39 2.4.35 1.9.7l-.09.06 12.88 12.88 3.27-1.97z"/>
                  <path fill="#37474F" d="M1.22 24c-.33 0-.62-.25-.62-.67V.67C.6.25.89 0 1.22 0l.09.01L.6 12l.71 12-.09-.01z"/>
                </svg>
                <div className="text-start">
                  <p className="text-[10px] text-white/60 leading-none">Get it on</p>
                  <p className="text-[15px] font-bold leading-tight">Google Play</p>
                </div>
              </Link>
            </div>
            {/* Stats strip */}
            <div className="mt-8 flex gap-6 justify-center md:justify-start">
              {[
                { num: "10K+", label: "Downloads" },
                { num: "4.8★", label: "App Rating" },
                { num: "32+", label: "Vendor Types" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center md:text-start">
                  <p className="text-[20px] font-extrabold text-white">{num}</p>
                  <p className="text-[11px] text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
