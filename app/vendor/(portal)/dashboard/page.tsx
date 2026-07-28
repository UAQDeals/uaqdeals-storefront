import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";
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
    { label: "Net Earnings", value: `AED ${earnings.toFixed(2)}`, icon: TrendingUp, tint: "text-[color:var(--brand-maroon)]", bg: "bg-[color:var(--brand-maroon)]/8" },
  ];

  const actions = [
    { label: "Add / Manage Products", desc: "Upload items, set prices & stock", href: "/vendor/products", icon: Plus, primary: true },
    { label: "View Orders", desc: "Track and fulfil customer orders", href: "/vendor/orders", icon: ClipboardList },
    { label: "Finance", desc: "Earnings, payouts & statements", href: "/vendor/finance", icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">

      {/* Hero greeting */}
      <Reveal>
      <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-7 text-white shadow-[var(--shadow-premium)]">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[color:var(--brand-gold)]/15 blur-xl" />
        <div className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-gold)]">Vendor Dashboard</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">Welcome back, {vendor?.name} 👋</h1>
          <p className="mt-1.5 text-sm text-white/80">Here is what is happening with your store today.</p>
        </div>
      </div>
      </Reveal>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          if (s.hero) {
            return (
              <Reveal key={s.label} delay={idx * 70}>
              <div className="bg-brand-gradient relative h-full overflow-hidden rounded-2xl p-5 text-white shadow-[var(--shadow-card)]">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[color:var(--brand-gold)]/15 blur-lg" />
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-white/80">{s.label}</p>
                  <p className="font-display mt-1 text-2xl font-semibold">{s.value}</p>
                </div>
              </div>
              </Reveal>
            );
          }
          return (
            <Reveal key={s.label} delay={idx * 70}>
            <div className="premium-card h-full p-5">
              <div className={"flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-[color:var(--brand-gold)]/20 " + s.bg}>
                <Icon className={"h-5 w-5 " + s.tint} />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--brand-muted)]">{s.label}</p>
              <p className="font-display mt-1 text-2xl font-semibold text-[color:var(--ink)]">{s.value}</p>
            </div>
            </Reveal>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <div className="mb-4 flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <div>
            <p className="eyebrow">Vendor</p>
            <h2 className="font-display mt-0.5 text-[22px] font-semibold tracking-tight text-[color:var(--ink)]">Quick Actions</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a, idx) => {
            const Icon = a.icon;
            if (a.primary) {
              return (
                <Reveal key={a.href} delay={idx * 70}>
                <a href={a.href}
                  className="bg-brand-gradient group relative block h-full overflow-hidden rounded-2xl p-5 text-white shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:brightness-110">
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/70 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                  </div>
                  <p className="mt-4 text-[15px] font-bold text-white">{a.label}</p>
                  <p className="mt-0.5 text-xs text-white/75">{a.desc}</p>
                </a>
                </Reveal>
              );
            }
            return (
              <Reveal key={a.href} delay={idx * 70}>
              <a href={a.href} className="premium-card group block h-full p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--brand-maroon)]/8 ring-1 ring-[color:var(--brand-gold)]/25">
                    <Icon className="h-5 w-5 text-[color:var(--brand-maroon)]" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[color:var(--brand-muted)]/50 transition-transform group-hover:translate-x-1 group-hover:text-[color:var(--brand-maroon)] rtl:rotate-180" />
                </div>
                <p className="mt-4 text-[15px] font-bold text-[color:var(--ink)]">{a.label}</p>
                <p className="mt-0.5 text-xs text-[color:var(--brand-muted)]">{a.desc}</p>
              </a>
              </Reveal>
            );
          })}
        </div>
      </div>

    </div>
  );
}
