import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceCartClient } from "./client";

// Each cart-flow service defines its info-collection fields.
type Field = { key: string; label: string; type: "text" | "textarea" | "tel" | "email"; required?: boolean };

const SLUG_META: Record<string, {
  title: string; emoji: string; tagline: string; fields: Field[];
}> = {
  typing_center: {
    title: "Typing Center",
    emoji: "✍️",
    tagline: "Typing, attestation & PRO services",
    fields: [
      { key: "full_name", label: "Full Name (as per document)", type: "text", required: true },
      { key: "emirates_id", label: "Emirates ID / Passport No.", type: "text" },
      { key: "phone", label: "Contact Number", type: "tel", required: true },
      { key: "details", label: "Details / What you need typed", type: "textarea", required: true },
    ],
  },
  business_setup: {
    title: "Business Setup",
    emoji: "📋",
    tagline: "Company formation & licensing in UAQ",
    fields: [
      { key: "applicant_name", label: "Applicant Full Name", type: "text", required: true },
      { key: "proposed_company", label: "Proposed Company Name", type: "text" },
      { key: "activity", label: "Business Activity", type: "text", required: true },
      { key: "phone", label: "Contact Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email" },
      { key: "notes", label: "Additional Notes", type: "textarea" },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = SLUG_META[slug];
  return { title: meta ? `${meta.title} — UAQ Deals` : "Service — UAQ Deals" };
}

export default async function ServiceCartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = SLUG_META[slug];
  if (!meta) notFound();

  const supabase = await createClient();
  const { data: services } = await supabase
    .from("appointment_services")
    .select("id, title, description, price, price_label, image_url")
    .eq("vendor_type_slug", slug)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return <ServiceCartClient slug={slug} meta={meta} services={services ?? []} />;
}
