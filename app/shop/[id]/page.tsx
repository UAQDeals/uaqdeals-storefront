import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShopDrillClient } from "./drill-client";
import { CategoryHero } from "@/components/category-hero";

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

  const [{ data: cat }, { data: children }] = await Promise.all([
    supabase.from("categories").select("id, name, parent_id").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").eq("parent_id", id)
      .eq("is_active", true).order("sort_order").order("name"),
  ]);

  if (!cat) notFound();
  if (!children || children.length === 0) redirect("/products?cat=" + id);

  // Build breadcrumb
  const breadcrumb: { id: string; name: string }[] = [{ id: cat.id, name: cat.name }];
  let current = cat;
  while (current.parent_id) {
    const { data: parent } = await supabase.from("categories")
      .select("id, name, parent_id").eq("id", current.parent_id).maybeSingle();
    if (!parent) break;
    breadcrumb.unshift({ id: parent.id, name: parent.name });
    current = parent;
  }


  return (
    <>
      <CategoryHero title={cat.name} />
      <ShopDrillClient
        category={cat}
        children={children}
        breadcrumb={breadcrumb}
      />
    </>
  );
}
