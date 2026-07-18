import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";

type FooterLink = { key: string; href: string; lead?: boolean };

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
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const SHOP_LINKS: FooterLink[] = [
  { key: "allProducts",  href: "/products", lead: true },
  { key: "electronics",  href: "/shop/a1000000-0000-0000-0000-000000000001" },
  { key: "grocery",      href: "/shop/a1000000-0000-0000-0000-000000000002" },
  { key: "beauty",       href: "/shop/a1000000-0000-0000-0000-000000000003" },
  { key: "homeKitchen",  href: "/shop/a1000000-0000-0000-0000-000000000004" },
  { key: "fashion",      href: "/shop/a1000000-0000-0000-0000-000000000005" },
  { key: "health",       href: "/shop/a1000000-0000-0000-0000-000000000009" },
  { key: "books",        href: "/shop/a1000000-0000-0000-0000-000000000011" },
  { key: "marketplace",  href: "/marketplace/real_estate" },
];

const SERVICES_LINKS: FooterLink[] = [
  { key: "allServices",   href: "/services", lead: true },
  { key: "homeServices",  href: "/categories/home_services" },
  { key: "cleaning",      href: "/categories/cleaning_service" },
  { key: "pestControl",   href: "/categories/pest_control" },
  { key: "mobileRepair",  href: "/categories/mobile_repair" },
  { key: "typingCenter",  href: "/categories/typing_center" },
  { key: "businessSetup", href: "/categories/business_setup" },
  { key: "exploreUaq",    href: "/services/explore-uaq" },
  { key: "hotelBooking",  href: "/services/hotel-booking" },
];

const HELP_LINKS: FooterLink[] = [
  { key: "trackOrder", href: "/account" },
  { key: "contactUs",  href: "/contact" },
  { key: "about",      href: "/about" },
  { key: "terms",      href: "/terms" },
  { key: "privacy",    href: "/privacy" },
];

const SOCIALS = [
  { Icon: MessageCircle, href: "https://wa.me/971542205775", label: "WhatsApp" },
  { Icon: FacebookIcon,  href: "https://www.facebook.com/uaqdeals", label: "Facebook" },
  { Icon: InstagramIcon, href: "https://www.instagram.com/uaqdeals", label: "Instagram" },
  { Icon: XIcon,         href: "https://x.com/uaqdeals", label: "X" },
  { Icon: TikTokIcon,    href: "https://www.tiktok.com/@uaqdeals", label: "TikTok" },
  { Icon: YouTubeIcon,   href: "https://www.youtube.com/@UAQDeals", label: "YouTube" },
];

const PAYMENTS = ["COD", "VISA", "Mastercard", "Apple Pay"];

function FooterColumn({
  title,
  links,
  cta,
  t,
}: {
  title: string;
  links: FooterLink[];
  cta?: { label: string; href: string };
  t: (key: string) => string;
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
              {t(l.key)}
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
  const tf = await getTranslations("footer");
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
              {tf("tagline")}
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-2.5">
              <a
                href="tel:+971542205885"
                className="flex items-center gap-2.5 text-[12.5px] text-neutral-400 transition-colors hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand-orange)]" />
                +971 54 220 5885
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2.5 text-[12.5px] text-neutral-400 transition-colors hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand-orange)]" />
                {tf("contactSupport")}
              </Link>
              <p className="flex items-center gap-2.5 text-[12.5px] text-neutral-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand-orange)]" />
                {tf("location")}
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
              title={tf("colShop")}
              links={SHOP_LINKS}
              cta={{ label: tf("sellCta"), href: "/vendor/signup" }}
              t={tf}
            />
          )}

          {/* Services */}
          <FooterColumn
            title={tf("colServices")}
            links={SERVICES_LINKS}
            cta={{ label: tf("listCta"), href: "/vendor/signup" }}
            t={tf}
          />

          {/* Help */}
          <FooterColumn title={tf("colHelp")} links={HELP_LINKS} t={tf} />
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
