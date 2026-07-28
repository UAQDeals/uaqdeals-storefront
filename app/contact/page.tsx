import { ContactForm } from "@/components/contact-form";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return { title: t("eyebrow"), description: t("intro") };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-12 md:px-8 md:py-16">
      {/* Page header */}
      <Reveal>
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="font-display mt-2 text-[30px] font-semibold leading-[1.08] tracking-tight text-[color:var(--ink)] sm:text-[40px]">
          {t("headline")}
        </h1>
        <p className="mt-3 max-w-[560px] text-[15.5px] leading-relaxed text-neutral-700">{t("intro")}</p>
        <div className="gold-rule mt-8" />
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <Reveal delay={80}>
          <ContactForm />
        </Reveal>

        <Reveal delay={140} as="div" className="space-y-4">
          <aside className="space-y-4">
            <div className="premium-card p-5">
              <h2 className="eyebrow">{t("reachDirectly")}</h2>
              <ul className="mt-4 space-y-4">
                <ContactRow icon={<Phone className="h-4 w-4" />} label={t("phone")} value="+971 54 220 5775" href="tel:+971542205775" />
                <ContactRow icon={<Mail className="h-4 w-4" />} label={t("email")} value="uaqdeals@gmail.com" href="mailto:uaqdeals@gmail.com" />
                <ContactRow icon={<Globe className="h-4 w-4" />} label={t("website")} value="www.uaqdeals.ae" href="https://www.uaqdeals.ae" />
                <ContactRow icon={<MapPin className="h-4 w-4" />} label={t("location")} value={t("locationValue")} />
              </ul>
            </div>
            <div className="bg-maroon-radial relative overflow-hidden rounded-2xl p-6 text-center shadow-[var(--shadow-card)]">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
              <p className="font-display text-[17px] font-semibold text-white">{t("tagline")}</p>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-white shadow-sm">{icon}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--brand-muted)]">{label}</p>
        <p className="text-[14px] font-semibold text-[color:var(--ink)]">{value}</p>
      </div>
    </div>
  );
  return <li>{href ? <a href={href} className="block transition hover:opacity-80">{inner}</a> : inner}</li>;
}
