import { createClient } from "@/lib/supabase/server";
import { VendorB2BManager } from "./b2b-manager";

export const metadata = { title: "B2B Market — UAQ Deals Vendor" };

export default async function VendorB2BPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, wallet_balance")
    .eq("user_id", auth!.user!.id)
    .maybeSingle();

  const vendorId = vendor?.id as string | undefined;

  // Browse: approved + active listings (platform + other vendors). Own listings
  // are filtered out client-side. Buyers only see approved rows (RLS enforces).
  const [browseRes, mineRes, ordersRes] = await Promise.all([
    supabase
      .from("source_items")
      .select("*")
      .eq("is_active", true)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(200),
    vendorId
      ? supabase
          .from("source_items")
          .select("*")
          .eq("seller_vendor_id", vendorId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    vendorId
      ? supabase
          .from("source_requests")
          .select("*")
          .or(`vendor_id.eq.${vendorId},seller_vendor_id.eq.${vendorId}`)
          .order("created_at", { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const browse = (browseRes.data ?? []).filter(
    (it: any) => it.seller_vendor_id !== vendorId,
  );

  return (
    <VendorB2BManager
      vendorId={vendorId as string}
      walletBalance={(vendor?.wallet_balance as number) ?? 0}
      initialBrowse={browse}
      initialListings={mineRes.data ?? []}
      initialOrders={ordersRes.data ?? []}
    />
  );
}
