import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GovtEnquiryClient } from "./client";

const SLUG_TITLE: Record<string, string> = {
  typing_center: "Typing Center",
  business_setup: "Business Setup",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointment_services")
    .select("title")
    .eq("id", id)
    .single();
  return { title: data?.title ? `${data.title} — UAQ Deals` : (SLUG_TITLE[slug] ?? "Enquiry") };
}

export default async function EnquiryDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  if (!SLUG_TITLE[slug]) notFound();

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("appointment_services")
    .select("id, title, description, image_url, price, price_label, vendor_type_slug")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!listing) notFound();

  return (
    <GovtEnquiryClient
      slug={slug}
      serviceId={listing.id}
      serviceTitle={listing.title}
      description={listing.description ?? ""}
      imageUrl={listing.image_url ?? ""}
    />
  );
}
