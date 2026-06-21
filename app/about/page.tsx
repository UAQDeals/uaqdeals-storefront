import Link from "next/link";
import { ArrowRight, Store, Coins, Globe, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";

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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-maroon)]">{t("eyebrow")}</p>
      <h1 className="text-brand-gradient mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("headline")}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-700">{t("intro")}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <span className="bg-brand-gradient inline-flex h-10 w-10 items-center justify-center rounded-full text-white">{f.icon}</span>
            <h3 className="mt-3 text-base font-bold text-neutral-900">{f.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold text-[color:var(--brand-maroon)]">{t("visionTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">{t("visionBody")}</p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[color:var(--brand-maroon)]">{t("missionTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">{t("missionBody")}</p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-6 text-center">
        <p className="text-lg font-bold text-[color:var(--brand-maroon)]">{t("tagline")}</p>
        <p className="mt-1 text-sm text-neutral-600">{t("taglineSub")}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/deals" className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
            {tc("shopDeals")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-maroon)] px-5 py-2.5 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white">
            {t("getInTouch")}
          </Link>
        </div>
      </div>
    </div>
  );
}
