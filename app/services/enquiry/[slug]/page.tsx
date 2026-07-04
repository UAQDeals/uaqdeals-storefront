import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
    <div className="min-h-screen bg-neutral-50">
      <div className="sticky top-0 z-10 text-white" style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
        <div className="mx-auto max-w-3xl px-4 py-5">
          <Link href="/services" className="text-white/80 text-sm">&larr; Services</Link>
          <h1 className="text-2xl font-extrabold mt-1">{meta.title}</h1>
          <p className="text-white/85 text-sm mt-0.5">{meta.tagline}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {(!listings || listings.length === 0) ? (
          <div className="text-center text-neutral-500 py-16">
            No services listed yet. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/services/enquiry/${slug}/${l.id}`}
                className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white hover:shadow-md transition-shadow"
              >
                {l.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image_url} alt={l.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-neutral-100" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 text-[15px]">{l.title}</h3>
                  {l.description && (
                    <p className="text-neutral-500 text-[13px] mt-1 line-clamp-2">{l.description}</p>
                  )}
                  <span className="inline-block mt-3 text-[13px] font-semibold text-[#8E1B3A]">
                    Enquire &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
