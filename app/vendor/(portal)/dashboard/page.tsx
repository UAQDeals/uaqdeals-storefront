import { createClient } from "@/lib/supabase/server";
import { Wallet, Package, ShoppingBag, TrendingUp, Plus, ClipboardList, BarChart3, ArrowRight } from "lucide-react";

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

  const [{ count: productCount }, { count: orderCount }, { data: summary }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("vendor_id", vendorId),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("vendor_id", vendorId),
    supabase.from("vendor_earnings_summary").select("*").eq("vendor_id", vendorId).maybeSingle(),
  ]);

  const wallet = Number(vendor?.wallet_balance ?? 0);
  const earnings = Number(summary?.vendor_earnings ?? 0);

  const stats = [
    { label: "Wallet Balance", value: `AED ${wallet.toFixed(2)}`, icon: Wallet, hero: true },
    { label: "Total Products", value: String(productCount ?? 0), icon: Package, tint: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Orders", value: String(orderCount ?? 0), icon: ShoppingBag, tint: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Net Earnings", value: `AED ${earnings.toFixed(2)}`, icon: TrendingUp, tint: "text-violet-600", bg: "bg-violet-50" },
  ];

  const actions = [
    { label: "Add / Manage Products", desc: "Upload items, set prices & stock", href: "/vendor/products", icon: Plus, primary: true },
    { label: "View Orders", desc: "Track and fulfil customer orders", href: "/vendor/orders", icon: ClipboardList },
    { label: "Finance", desc: "Earnings, payouts & statements", href: "/vendor/finance", icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">

      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-3xl p-7 text-white"
        style={{ background: "linear-gradient(135deg, #8E1B3A 0%, #C72931 55%, #F24732 100%)" }}>
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-white/70">Vendor Dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Welcome back, {vendor?.name} 👋</h1>
          <p className="mt-1.5 text-sm text-white/80">Here is what is happening with your store today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          if (s.hero) {
            return (
              <div key={s.label} className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-white/80">{s.label}</p>
                  <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
                </div>
              </div>
            );
          }
          return (
            <div key={s.label} className="group rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={"flex h-11 w-11 items-center justify-center rounded-xl " + s.bg}>
                <Icon className={"h-5 w-5 " + s.tint} />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{s.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-neutral-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-500">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <a key={a.href} href={a.href}
                className={"group relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md " +
                  (a.primary ? "border-transparent text-white" : "border-neutral-100 bg-white")}
                style={a.primary ? { background: "linear-gradient(135deg, #8E1B3A, #C72931)" } : undefined}>
                <div className="flex items-start justify-between">
                  <div className={"flex h-11 w-11 items-center justify-center rounded-xl " + (a.primary ? "bg-white/20" : "bg-neutral-100")}>
                    <Icon className={"h-5 w-5 " + (a.primary ? "text-white" : "text-[#8E1B3A]")} />
                  </div>
                  <ArrowRight className={"h-4 w-4 transition-transform group-hover:translate-x-1 " + (a.primary ? "text-white/70" : "text-neutral-300")} />
                </div>
                <p className={"mt-4 text-[15px] font-bold " + (a.primary ? "text-white" : "text-neutral-900")}>{a.label}</p>
                <p className={"mt-0.5 text-xs " + (a.primary ? "text-white/75" : "text-neutral-500")}>{a.desc}</p>
              </a>
            );
          })}
        </div>
      </div>

    </div>
  );
}
