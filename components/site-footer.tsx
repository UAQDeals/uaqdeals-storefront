import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";

type FooterLink = { label: string; href: string; lead?: boolean };

// Brand glyphs — lucide-react removed Instagram/Facebook (trademark), so inline them.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

const SHOP_LINKS: FooterLink[] = [
  { label: "All Products",        href: "/products", lead: true },
  { label: "Electronics",         href: "/shop/a1000000-0000-0000-0000-000000000001" },
  { label: "Grocery",             href: "/shop/a1000000-0000-0000-0000-000000000002" },
  { label: "Beauty & Fragrance",  href: "/shop/a1000000-0000-0000-0000-000000000003" },
  { label: "Home & Kitchen",      href: "/shop/a1000000-0000-0000-0000-000000000004" },
  { label: "Fashion",             href: "/shop/a1000000-0000-0000-0000-000000000005" },
  { label: "Health & Nutrition",  href: "/shop/a1000000-0000-0000-0000-000000000009" },
  { label: "Books",               href: "/shop/a1000000-0000-0000-0000-000000000011" },
  { label: "Marketplace",         href: "/marketplace/real_estate" },
];

const SERVICES_LINKS: FooterLink[] = [
  { label: "All Services",    href: "/services", lead: true },
  { label: "Home Services",   href: "/categories/home_services" },
  { label: "Cleaning Service",href: "/categories/cleaning_service" },
  { label: "Pest Control",    href: "/categories/pest_control" },
  { label: "Mobile Repair",   href: "/categories/mobile_repair" },
  { label: "Typing Center",   href: "/categories/typing_center" },
  { label: "Business Setup",  href: "/categories/business_setup" },
  { label: "Explore UAQ",     href: "/services/explore-uaq" },
  { label: "Hotel Booking",   href: "/services/hotel-booking" },
];

const HELP_LINKS: FooterLink[] = [
  { label: "Track your order", href: "/account" },
  { label: "Contact us",       href: "/contact" },
  { label: "About UAQ Deals",  href: "/about" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy",   href: "/privacy" },
];

const SOCIALS = [
  { Icon: InstagramIcon, href: "#", label: "Instagram", external: true },
  { Icon: FacebookIcon,  href: "#", label: "Facebook", external: true },
  { Icon: MessageCircle, href: "https://wa.me/971544776967", label: "WhatsApp", external: true },
];

const PAYMENTS = ["COD", "VISA", "Mastercard", "Apple Pay"];

function FooterColumn({
  title,
  links,
  cta,
}: {
  title: string;
  links: FooterLink[];
  cta?: { label: string; href: string };
}) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[2px] text-neutral-500">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={
                l.lead
                  ? "text-[12.5px] font-bold text-white transition-colors hover:text-[color:var(--brand-orange)]"
                  : "text-[12.5px] text-neutral-400 transition-colors hover:text-white"
              }
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      {cta && (
        <Link
          href={cta.href}
          className="group mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-white transition-colors hover:text-[color:var(--brand-orange)]"
        >
          {cta.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
        </Link>
      )}
    </div>
  );
}

export async function SiteFooter({ showProducts = true }: { showProducts?: boolean }) {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-neutral-950 text-neutral-400 pb-20 md:pb-0">
      {/* Brand gradient hairline */}
      <div className="h-1 w-full bg-brand-gradient" />

      {/* Ambient brand glow */}
      <span
        className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #C72931 0%, transparent 70%)" }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-28 start-1/4 h-72 w-72 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #F24732 0%, transparent 70%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-8 py-12 md:py-16">
        <div
          className={
            "grid grid-cols-2 gap-x-8 gap-y-10 " +
            (showProducts
              ? "md:grid-cols-[1.6fr_1fr_1fr_0.9fr]"
              : "md:grid-cols-[1.6fr_1fr_0.9fr]")
          }
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/uaq-logo.png"
                alt="UAQ Deals"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl object-cover"
              />
              <span className="text-xl font-extrabold tracking-tight text-white">UAQ Deals</span>
            </Link>

            <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-neutral-500">
              Umm Al Quwain&apos;s hyperlocal super-app — groceries, food, services, real estate
              and more. Delivered locally, priced fairly.
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-2.5">
              <a
                href="tel:+971544776967"
                className="flex items-center gap-2.5 text-[12.5px] text-neutral-400 transition-colors hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand-orange)]" />
                +971 54 477 6967
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2.5 text-[12.5px] text-neutral-400 transition-colors hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand-orange)]" />
                Contact support
              </Link>
              <p className="flex items-center gap-2.5 text-[12.5px] text-neutral-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand-orange)]" />
                Umm Al Quwain, UAE
              </p>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop — gated for services-only emirates */}
          {showProducts && (
            <FooterColumn
              title="Shop"
              links={SHOP_LINKS}
              cta={{ label: "Sell on UAQ Deals", href: "/vendor/signup" }}
            />
          )}

          {/* Services */}
          <FooterColumn
            title="Services"
            links={SERVICES_LINKS}
            cta={{ label: "List on UAQ Deals", href: "/vendor/signup" }}
          />

          {/* Help */}
          <FooterColumn title="Help" links={HELP_LINKS} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 md:px-8 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[11.5px] text-neutral-600">
            {t("copyright", { year })} · Umm Al Quwain, UAE
          </p>
          <div className="flex items-center gap-2">
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="bg-white/5 rounded-md border border-white/10 px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-neutral-400"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
