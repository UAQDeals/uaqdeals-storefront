import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";
import { ArrowLeft, ChevronRight, PackageOpen } from "lucide-react";

const SLUG_META: Record<string, { title: string; tagline: string }> = {
  typing_center: {
    title: "Typing Center",
    tagline: "Government typing, document processing & PRO services",
  },
  business_setup: {
    title: "Business Setup",
    tagline: "Company formation, licensing & business support",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = SLUG_META[slug];
  return { title: meta ? `${meta.title} — UAQ Deals` : "Services — UAQ Deals" };
}

export default async function EnquiryIndexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = SLUG_META[slug];
  if (!meta) notFound();

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("appointment_services")
    .select("id, title, description, image_url, price, price_label")
    .eq("vendor_type_slug", slug)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return (
    <>
      {/* Premium page header */}
      <section className="bg-maroon-radial relative overflow-hidden">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
        <span className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
        <div className="relative mx-auto max-w-[1100px] px-5 md:px-8 py-10 md:py-14 rise-in">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/75 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Services
          </Link>
          <h1 className="font-display mt-3 text-[30px] font-medium leading-[1.05] tracking-tight text-white sm:text-[40px]">
            {meta.title}
          </h1>
          <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-white/80 sm:text-[15px]">
            {meta.tagline}
          </p>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-[1100px] px-5 md:px-8 py-10 md:py-12">
        {(!listings || listings.length === 0) ? (
          <Reveal className="mx-auto max-w-md py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
              <PackageOpen className="h-8 w-8" />
            </span>
            <p className="font-display mt-5 text-[19px] leading-snug text-[color:var(--ink)]">
              No services listed yet. Please check back soon.
            </p>
          </Reveal>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <Reveal as="div" key={l.id} delay={i * 60}>
                <Link
                  href={`/services/enquiry/${slug}/${l.id}`}
                  className="group premium-card block h-full overflow-hidden"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[color:var(--paper-2)]">
                    {l.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.image_url}
                        alt={l.title}
                        className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[color:var(--brand-gold)]/40">
                        <PackageOpen className="h-9 w-9" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-[16px] font-semibold leading-snug text-[color:var(--ink)]">
                      {l.title}
                    </h3>
                    {l.description && (
                      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[color:var(--brand-muted)]">
                        {l.description}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-[color:var(--brand-maroon)] transition group-hover:gap-2">
                      Enquire
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
