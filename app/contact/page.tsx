import { ContactForm } from "@/components/contact-form";
import { Phone, Mail, MapPin, Globe } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the UAQ Deals team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-maroon)]">
        Contact
      </p>
      <h1 className="text-brand-gradient mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Get in touch
      </h1>
      <p className="mt-3 max-w-xl text-base text-neutral-700">
        Questions, feedback, or interested in partnering with us? We&apos;d love
        to hear from you.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <ContactForm />

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Reach us directly
            </h2>
            <ul className="mt-4 space-y-4">
              <ContactRow icon={<Phone className="h-4 w-4" />} label="Phone" value="+971 54 477 6967" href="tel:+971544776967" />
              <ContactRow icon={<Mail className="h-4 w-4" />} label="Email" value="uaqdeals@gmail.com" href="mailto:uaqdeals@gmail.com" />
              <ContactRow icon={<Globe className="h-4 w-4" />} label="Website" value="www.uaqdeals.ae" href="https://www.uaqdeals.ae" />
              <ContactRow icon={<MapPin className="h-4 w-4" />} label="Location" value="Umm Al Quwain, U.A.E." />
            </ul>
          </div>
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-5 text-center">
            <p className="text-sm font-bold text-[color:var(--brand-maroon)]">
              Trust &bull; Community &bull; Our Promise
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-cream)] text-[color:var(--brand-maroon)]">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  );
  return <li>{href ? <a href={href} className="block hover:opacity-80">{inner}</a> : inner}</li>;
}
