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

  let categories: { id: string; name: string; is_approved: boolean | null }[] = [];
  if (vendor?.vendor_type_id) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name, is_approved, created_by_vendor_id")
      .eq("vendor_type_id", vendor.vendor_type_id)
      .or(`is_approved.eq.true,created_by_vendor_id.eq.${vendorId}`)
      .order("name");
    categories = (cats ?? []) as typeof categories;
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
