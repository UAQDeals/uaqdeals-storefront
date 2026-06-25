import { createClient } from "@/lib/supabase/server";
import { VendorProductsManager } from "./products-manager";

export const metadata = { title: "Products — UAQ Deals Vendor" };

export default async function VendorProductsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, vendor_type_id")
    .eq("user_id", auth!.user!.id)
    .maybeSingle();

  const vendorId = vendor?.id;

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  // Resolve the vendor's assigned product category tree.
  // Vendor is linked via vendor_type_id -> vendor_types.name, which maps by
  // name to an L1 row in `categories`. We then fetch that L1's full descendant
  // subtree so the vendor can pick any leaf category.
  let categories: { id: string; name: string; is_approved: boolean | null; parent_id: string | null }[] = [];

  if (vendor?.vendor_type_id) {
    // 1. Get the vendor_type name
    const { data: vt } = await supabase
      .from("vendor_types")
      .select("name")
      .eq("id", vendor.vendor_type_id)
      .maybeSingle();

    if (vt?.name) {
      // 2. Find the matching L1 category by name
      const { data: l1 } = await supabase
        .from("categories")
        .select("id")
        .is("parent_id", null)
        .ilike("name", vt.name)
        .maybeSingle();

      if (l1?.id) {
        // 3. Walk the subtree breadth-first; collect EVERY node (with parent_id)
        //    so the client can render a cascading drill-down picker.
        const allCats: { id: string; name: string; is_approved: boolean | null; parent_id: string | null }[] = [
          { id: l1.id, name: vt.name, is_approved: true, parent_id: null },
        ];
        let frontier = [l1.id];
        for (let depth = 0; depth < 6 && frontier.length > 0; depth++) {
          const { data: children } = await supabase
            .from("categories")
            .select("id, name, is_approved, parent_id")
            .in("parent_id", frontier)
            .eq("is_active", true)
            .order("sort_order")
            .order("name");
          if (!children || children.length === 0) break;
          allCats.push(...(children as typeof allCats));
          frontier = children.map((c) => c.id as string);
        }
        categories = allCats.map((c) => ({ id: c.id, name: c.name, is_approved: c.is_approved, parent_id: c.parent_id }));
      }
    }

    // 4. Always include vendor-created custom categories
    const { data: customCats } = await supabase
      .from("categories")
      .select("id, name, is_approved, created_by_vendor_id")
      .eq("created_by_vendor_id", vendorId)
      .order("name");
    if (customCats && customCats.length) {
      const existing = new Set(categories.map((c) => c.id));
      for (const c of customCats) {
        if (!existing.has(c.id as string)) {
          categories.push({ id: c.id as string, name: c.name as string, is_approved: c.is_approved as boolean | null, parent_id: null });
        }
      }
    }
  }

  return (
    <VendorProductsManager
      vendorId={vendorId as string}
      vendorTypeId={vendor?.vendor_type_id ?? null}
      initialProducts={products ?? []}
      initialCategories={categories}
    />
  );
}
