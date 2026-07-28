import { Truck, ShieldCheck, BadgeCheck, Coins, Headphones, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

const ITEMS = [
  { icon: Truck,       titleKey: "trustDeliveryTitle", descKey: "trustDeliveryDesc" },
  { icon: ShieldCheck, titleKey: "trustPaymentsTitle", descKey: "trustPaymentsDesc" },
  { icon: BadgeCheck,  titleKey: "trustVendorsTitle",  descKey: "trustVendorsDesc" },
  { icon: Coins,       titleKey: "trustCoinsTitle",    descKey: "trustCoinsDesc" },
  { icon: Headphones,  titleKey: "trustSupportTitle",  descKey: "trustSupportDesc" },
  { icon: MapPin,      titleKey: "trustMadeTitle",     descKey: "trustMadeDesc" },
] as const;

export async function TrustBand() {
  const t = await getTranslations("home");
  return (
    <section className="border-t border-[color:var(--brand-border)] bg-gradient-to-b from-[color:var(--paper)] to-[color:var(--paper-2)]">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-12 md:py-14">
        <Reveal className="mb-8 text-center">
          <p className="eyebrow">{t("trustEyebrow")}</p>
          <h2 className="font-display mt-1 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">
            {t("trustTitle")}
          </h2>
          <span className="mx-auto mt-4 block h-px w-24 bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
          {ITEMS.map(({ icon: Icon, titleKey, descKey }, i) => (
            <Reveal key={titleKey} delay={i * 70}>
              <div className="premium-card group relative flex h-full flex-col items-center gap-3 p-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[12.5px] font-bold leading-tight text-[color:var(--ink)]">{t(titleKey)}</p>
                  <p className="mt-1 text-[10.5px] leading-snug text-[color:var(--brand-muted)]">{t(descKey)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
