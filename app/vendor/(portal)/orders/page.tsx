import { createClient } from "@/lib/supabase/server";
import { VendorOrdersManager } from "./orders-manager";

export const metadata = { title: "Orders — UAQ Deals Vendor" };

export default async function VendorOrdersPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", auth!.user!.id)
    .maybeSingle();

  const vendorId = vendor?.id;

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  return (
    <VendorOrdersManager
      vendorId={vendorId as string}
      initialOrders={orders ?? []}
    />
  );
}
