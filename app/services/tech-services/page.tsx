import { TechServicesClient } from "./form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Tech & Digital Services — UAQ Deals" };
export const revalidate = 300;

const SLUG_META: Record<string, { label: string; emoji: string }> = {
  web_dev_design:       { label: "Web Design & Development", emoji: "🌐" },
  mobile_app_dev:       { label: "Mobile App Development",   emoji: "📱" },
  ecommerce_dev:        { label: "E-Commerce Development",   emoji: "🛒" },
  ecommerce_management: { label: "E-Commerce Management",    emoji: "📦" },
  accounting_software:  { label: "Accounting Software",      emoji: "📊" },
  custom_software:      { label: "Custom Software",          emoji: "⚙️" },
  seo_content:          { label: "SEO & Content",            emoji: "🔍" },
  social_media_mgmt:    { label: "Social Media Management",  emoji: "📣" },
};

export default async function TechServicesPage({
  searchParams,
}: {
  searchParams: { s?: string };
}) {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("tech_services")
    .select("id, vendor_type_slug, title, description, price, price_label, image_url")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const services = rows ?? [];

  const grouped: Record<string, typeof services> = {};
  for (const row of services) {
    const s = row.vendor_type_slug as string;
    if (!grouped[s]) grouped[s] = [];
    grouped[s].push(row);
  }

  const activeSlug = searchParams.s ?? Object.keys(SLUG_META)[0];

  return (
    <TechServicesClient
      grouped={grouped}
      slugMeta={SLUG_META}
      initialSlug={activeSlug}
    />
  );
}
