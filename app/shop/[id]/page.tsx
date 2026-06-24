import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShopDrillClient } from "./drill-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("name").eq("id", id).maybeSingle();
  return { title: data?.name ? data.name + " — UAQ Deals" : "Shop — UAQ Deals" };
}

export default async function ShopDrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current category
  const { data: cat } = await supabase.from("categories").select("id, name, parent_id").eq("id", id).maybeSingle();
  if (!cat) notFound();

  // Get children
  const { data: children } = await supabase.from("categories").select("id, name")
    .eq("parent_id", id).eq("is_active", true).order("sort_order").order("name");

  // If no children — leaf category, go to products
  if (!children || children.length === 0) {
    redirect("/products?cat=" + id);
  }

  // Build breadcrumb by walking up the tree
  const breadcrumb: { id: string; name: string }[] = [{ id: cat.id, name: cat.name }];
  let current = cat;
  while (current.parent_id) {
    const { data: parent } = await supabase.from("categories").select("id, name, parent_id").eq("id", current.parent_id).maybeSingle();
    if (!parent) break;
    breadcrumb.unshift({ id: parent.id, name: parent.name });
    current = parent;
  }

  return <ShopDrillClient category={cat} children={children} breadcrumb={breadcrumb} />;
}
