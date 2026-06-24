import { createClient } from "@/lib/supabase/server";
import { VendorFinanceManager } from "./finance-manager";

export const metadata = { title: "Finance — UAQ Deals Vendor" };

export default async function VendorFinancePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, wallet_balance, min_payout_amount")
    .eq("user_id", auth!.user!.id)
    .maybeSingle();

  const vendorId = vendor?.id;

  const [{ data: transactions }, { data: summary }, { data: payouts }] = await Promise.all([
    supabase.from("vendor_wallet_transactions").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false }).limit(50),
    supabase.from("vendor_earnings_summary").select("*").eq("vendor_id", vendorId).maybeSingle(),
    supabase.from("vendor_payouts").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <VendorFinanceManager
      vendorId={vendorId as string}
      walletBalance={Number(vendor?.wallet_balance ?? 0)}
      minPayout={Number(vendor?.min_payout_amount ?? 0)}
      summary={summary ?? null}
      initialTransactions={transactions ?? []}
      initialPayouts={payouts ?? []}
    />
  );
}
