import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorMenuClient } from "./client";

export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("vendors").select("name").eq("id", id).maybeSingle();
  return { title: data?.name ? `${data.name} Menu — UAQ Deals` : "Restaurant Menu" };
}

export default async function VendorMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: vendor }, { data: productsRaw }] = await Promise.all([
    supabase.from("vendors").select("id, name, description, logo_url, rating, review_count, emirate").eq("id", id).maybeSingle(),
    supabase.from("products")
      .select("id, name, description, price, sale_price, thumbnail_url, images, category_id, categories(name)")
      .eq("vendor_id", id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  if (!vendor) notFound();

  // Group by category
  const grouped: Record<string, Row[]> = {};
  for (const p of (productsRaw ?? [])) {
    const cat = (p.categories as any)?.name ?? "Menu";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  return (
    <VendorMenuClient
      vendor={vendor}
      grouped={grouped}
    />
  );
}
