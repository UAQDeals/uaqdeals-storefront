import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Vendor Dashboard — UAQ Deals" };

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, name, wallet_balance")
    .eq("user_id", auth!.user!.id)
    .maybeSingle();

  const vendorId = vendor?.id;

  // Quick stats
  const [{ count: productCount }, { count: orderCount }, { data: summary }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("vendor_id", vendorId),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("vendor_id", vendorId),
    supabase.from("vendor_earnings_summary").select("*").eq("vendor_id", vendorId).maybeSingle(),
  ]);

  const wallet = Number(vendor?.wallet_balance ?? 0);
  const earnings = Number(summary?.vendor_earnings ?? 0);

  const cards = [
    { label: "Wallet Balance", value: `AED ${wallet.toFixed(2)}`, accent: true },
    { label: "Total Products", value: String(productCount ?? 0) },
    { label: "Total Orders", value: String(orderCount ?? 0) },
    { label: "Net Earnings", value: `AED ${earnings.toFixed(2)}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {vendor?.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">Here&apos;s an overview of your store.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={
              "rounded-xl border p-5 " +
              (c.accent
                ? "border-transparent bg-gradient-to-br from-[#8E1B3A] to-[#C72931] text-white"
                : "border-neutral-200 bg-white")
            }
          >
            <p className={"text-xs uppercase tracking-wide " + (c.accent ? "text-white/80" : "text-neutral-400")}>{c.label}</p>
            <p className="mt-2 text-2xl font-extrabold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-bold text-neutral-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/vendor/products" className="rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2 text-sm font-semibold text-white">Manage Products</a>
          <a href="/vendor/orders" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">View Orders</a>
          <a href="/vendor/finance" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">Finance</a>
        </div>
      </div>
    </div>
  );
}
