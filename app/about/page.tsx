import Link from "next/link";
import { ArrowRight, Store, Coins, Globe, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

export async function generateMetadata() {
  const t = await getTranslations("about");
  return { title: t("eyebrow"), description: t("intro") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const tc = await getTranslations("common");

  const features = [
    { icon: <Store className="h-5 w-5" />, title: t("feat1Title"), desc: t("feat1Desc") },
    { icon: <Globe className="h-5 w-5" />, title: t("feat2Title"), desc: t("feat2Desc") },
    { icon: <Coins className="h-5 w-5" />, title: t("feat3Title"), desc: t("feat3Desc") },
    { icon: <Truck className="h-5 w-5" />, title: t("feat4Title"), desc: t("feat4Desc") },
  ];

  return (
    <div className="mx-auto max-w-[820px] px-5 py-12 md:px-8 md:py-16">
      {/* Page header */}
      <Reveal>
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="font-display mt-2 text-[30px] font-semibold leading-[1.08] tracking-tight text-[color:var(--ink)] sm:text-[40px]">
          {t("headline")}
        </h1>
        <p className="mt-4 max-w-[640px] text-[15.5px] leading-relaxed text-neutral-700">{t("intro")}</p>
        <div className="gold-rule mt-8" />
      </Reveal>

      {/* Feature cards */}
      <Reveal delay={80}>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="premium-card p-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-white shadow-sm">
                {f.icon}
              </span>
              <h3 className="font-display mt-3.5 text-[17px] font-semibold text-[color:var(--ink)]">{f.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-neutral-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Vision & Mission */}
      <Reveal delay={120}>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="accent-bar h-7 w-1.5 rounded-full" />
              <h2 className="font-display text-[19px] font-semibold text-[color:var(--ink)]">{t("visionTitle")}</h2>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-neutral-700">{t("visionBody")}</p>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="accent-bar h-7 w-1.5 rounded-full" />
              <h2 className="font-display text-[19px] font-semibold text-[color:var(--ink)]">{t("missionTitle")}</h2>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-neutral-700">{t("missionBody")}</p>
          </div>
        </div>
      </Reveal>

      {/* Tagline / CTA */}
      <Reveal delay={160}>
        <div className="bg-maroon-radial relative mt-12 overflow-hidden rounded-3xl px-7 py-10 text-center shadow-[var(--shadow-premium)]">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
          <p className="font-display text-[22px] font-semibold text-white sm:text-[26px]">{t("tagline")}</p>
          <p className="mt-2 text-[14px] text-white/80">{t("taglineSub")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/deals" className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
              {tc("shopDeals")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
              {t("getInTouch")}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
