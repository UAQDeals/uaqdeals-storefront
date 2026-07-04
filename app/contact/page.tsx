import { ContactForm } from "@/components/contact-form";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return { title: t("eyebrow"), description: t("intro") };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-maroon)]">{t("eyebrow")}</p>
      <h1 className="text-brand-gradient mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("headline")}</h1>
      <p className="mt-3 max-w-xl text-base text-neutral-700">{t("intro")}</p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <ContactForm />

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("reachDirectly")}</h2>
            <ul className="mt-4 space-y-4">
              <ContactRow icon={<Phone className="h-4 w-4" />} label={t("phone")} value="+971 54 220 5775" href="tel:+971542205775" />
              <ContactRow icon={<Mail className="h-4 w-4" />} label={t("email")} value="uaqdeals@gmail.com" href="mailto:uaqdeals@gmail.com" />
              <ContactRow icon={<Globe className="h-4 w-4" />} label={t("website")} value="www.uaqdeals.ae" href="https://www.uaqdeals.ae" />
              <ContactRow icon={<MapPin className="h-4 w-4" />} label={t("location")} value={t("locationValue")} />
            </ul>
          </div>
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-5 text-center">
            <p className="text-sm font-bold text-[color:var(--brand-maroon)]">{t("tagline")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-cream)] text-[color:var(--brand-maroon)]">{icon}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  );
  return <li>{href ? <a href={href} className="block hover:opacity-80">{inner}</a> : inner}</li>;
}
