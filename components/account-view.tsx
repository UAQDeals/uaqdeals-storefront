"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronRight, Coins, LogOut, Package, ShoppingCart, Smartphone,
  Bell, Pencil, Check, X, ShieldCheck, MapPin, Plus, Trash2,
  Tag, Copy, Home, Briefcase, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { aed } from "@/lib/format";
import { WalletWithdraw, type Withdrawal } from "@/components/wallet-withdraw";

// ── Types ─────────────────────────────────────────────────────────────────────

type InitialProfile = {
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  avatar_url: string | null;
  auth_method: string | null;
  emirate?: string | null;
  member_since: string | null;
};

type Tx = {
  id: string;
  coins: number;
  type: string;
  description: string | null;
  created_at: string;
};

// AED store-credit wallet transaction (separate from coins).
type WalletTx = {
  id: string;
  type: string; // 'credit' | 'debit'
  amount: number; // positive magnitude
  source: string | null; // 'refund' | 'promotional' | 'goodwill' | 'spend'
  description: string | null;
  created_at: string;
};

type Prefs = Record<string, boolean>;

type Order = {
  id: string;
  order_number: string | null;
  status: string | null;
  total: number | null;
  created_at: string;
  thumb: string | null;
  preview: string;
};

type Address = {
  id: string;
  label: string | null;
  full_address: string | null;
  emirate: string | null;
  landmark: string | null;
  is_default: boolean;
};

type Coupon = {
  id: string;
  code: string;
  type: string;
  amount: number;
  min_spend: number | null;
  expires_at: string | null;
  free_shipping: boolean;
};

const PREF_KEYS = ["order_updates", "deals_promos", "wallet_coins", "support_replies"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending:          "bg-amber-50 text-amber-700",
  confirmed:        "bg-blue-50 text-blue-700",
  preparing:        "bg-blue-50 text-blue-700",
  out_for_delivery: "bg-indigo-50 text-indigo-700",
  delivered:        "bg-green-50 text-green-700",
  cancelled:        "bg-neutral-100 text-neutral-500",
};

function fmtStatus(s: string | null) {
  return (s ?? "pending").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
}

// ── Main component ────────────────────────────────────────────────────────────

export function AccountView({
  userId,
  initialProfile,
  coinBalance,
  transactions,
  walletBalance,
  walletTransactions,
  withdrawable,
  withdrawals,
  initialPrefs,
  recentOrders,
  addresses: initialAddresses,
  coupons,
}: {
  userId: string;
  initialProfile: InitialProfile;
  coinBalance: number;
  transactions: Tx[];
  walletBalance: number;
  walletTransactions: WalletTx[];
  withdrawable: number;
  withdrawals: Withdrawal[];
  initialPrefs: Prefs;
  recentOrders: Order[];
  addresses: Address[];
  coupons: Coupon[];
}) {
  const t  = useTranslations("accountPage");
  const tc = useTranslations("common");
  const router = useRouter();

  // Profile
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(profile.full_name ?? "");
  const [phone, setPhone]       = useState(profile.phone_number ?? "");
  const [saving, setSaving]     = useState(false);

  // Notifications
  const [prefs, setPrefs]           = useState<Prefs>(initialPrefs);
  const [prefsSaving, setPrefsSaving] = useState(false);

  // Addresses
  const [addresses, setAddresses]     = useState<Address[]>(initialAddresses);
  const [addingAddr, setAddingAddr]   = useState(false);
  const [addrLabel, setAddrLabel]     = useState("");
  const [addrFull, setAddrFull]       = useState("");
  const [addrEmirate, setAddrEmirate] = useState("UAQ");
  const [addrLandmark, setAddrLandmark] = useState("");
  const [addrSaving, setAddrSaving]   = useState(false);

  // ── Profile save ────────────────────────────────────────────────────────────
  async function saveProfile() {
    if (!name.trim()) return toast.error(t("nameRequired"));
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim(), phone_number: phone.trim() || null })
      .eq("id", userId);
    setSaving(false);
    if (error) return toast.error(error.message);
    setProfile({ ...profile, full_name: name.trim(), phone_number: phone.trim() || null });
    setEditing(false);
    toast.success(t("profileUpdated"));
  }

  // ── Notification toggle ─────────────────────────────────────────────────────
  async function togglePref(key: string) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setPrefsSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ notification_preferences: next })
      .eq("id", userId);
    setPrefsSaving(false);
    if (error) { toast.error(error.message); setPrefs(prefs); }
  }

  // ── Address save ────────────────────────────────────────────────────────────
  async function saveAddress() {
    if (!addrFull.trim()) return toast.error("Please enter a full address");
    setAddrSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        customer_id: userId,
        label: addrLabel.trim() || "Home",
        full_address: addrFull.trim(),
        emirate: addrEmirate,
        landmark: addrLandmark.trim() || null,
        is_default: addresses.length === 0,
      })
      .select()
      .single();
    setAddrSaving(false);
    if (error) return toast.error(error.message);
    setAddresses([...addresses, data as Address]);
    setAddingAddr(false);
    setAddrLabel(""); setAddrFull(""); setAddrLandmark("");
    toast.success("Address saved");
  }

  async function deleteAddress(id: string) {
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success("Address removed");
  }

  async function setDefault(id: string) {
    const supabase = createClient();
    // Clear all defaults then set new one
    await supabase.from("addresses").update({ is_default: false }).eq("customer_id", userId);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    setAddresses(addresses.map((a) => ({ ...a, is_default: a.id === id })));
  }

  // ── Sign out ────────────────────────────────────────────────────────────────
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(tc("signOut"));
    router.replace("/");
    router.refresh();
  }

  const prefLabel: Record<string, { label: string; desc: string }> = {
    order_updates:  { label: t("orderUpdates"),  desc: t("orderUpdatesDesc") },
    deals_promos:   { label: t("dealsPromos"),   desc: t("dealsPromosDesc") },
    wallet_coins:   { label: t("walletCoins"),   desc: t("walletCoinsDesc") },
    support_replies:{ label: t("supportReplies"),desc: t("supportRepliesDesc") },
  };

  const isInternalEmail = profile.email?.includes("@uaqdeals.internal") || profile.email?.includes("@vendor.uaqdeals");
  const displayEmail = isInternalEmail ? null : profile.email;
  const displayName = profile.full_name || displayEmail || profile.phone_number || "\u2014";
  const initial     = (displayName?.[0] ?? "U").toUpperCase();
  const isGoogle    = profile.auth_method === "google";
  const coinAed     = (coinBalance * 0.1).toFixed(2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #8E1B3A 0%, #C72931 60%, #F24732 100%)" }}>
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white/30" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight truncate">{displayName}</h1>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition shrink-0">
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
            {profile.phone_number && <p className="text-sm text-white/80 mt-0.5">{profile.phone_number}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {isGoogle && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  <ShieldCheck className="h-3 w-3" /> Google
                </span>
              )}
              {profile.member_since && (
                <span className="text-[11px] text-white/70">
                  Member since {new Date(profile.member_since).toLocaleDateString("en-AE", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">{t("fullName")}</p>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-white/20 px-3 py-2 text-sm text-white placeholder-white/50 outline-none"
                placeholder="Your name" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">{t("mobile")}</p>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
                placeholder="+9715XXXXXXXX"
                className="w-full rounded-lg bg-white/20 px-3 py-2 text-sm text-white placeholder-white/50 outline-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-[color:var(--brand-maroon)] hover:bg-white/90 disabled:opacity-60">
                <Check className="h-3.5 w-3.5" /> {saving ? tc("saving") : tc("save")}
              </button>
              <button onClick={() => { setName(profile.full_name ?? ""); setPhone(profile.phone_number ?? ""); setEditing(false); }}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30">
                <X className="h-3.5 w-3.5" /> {tc("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 text-center">
          <Coins className="h-5 w-5 mx-auto mb-1 text-amber-500" />
          <p className="text-xl font-extrabold text-neutral-900">{coinBalance.toLocaleString()}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">UAQ Coins</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 text-center">
          <Package className="h-5 w-5 mx-auto mb-1 text-[color:var(--brand-maroon)]" />
          <p className="text-xl font-extrabold text-neutral-900">{recentOrders.length}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Orders</p>
        </div>
        <Link href="/account/priority-card"
          className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 text-center hover:border-[color:var(--brand-maroon)] transition-colors">
          <span className="text-xl block mb-1">{"🥇"}</span>
          <p className="text-sm font-extrabold text-neutral-900">Priority</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Cards</p>
        </Link>
      </div>

      {/* ── Two-column grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

        {/* Left column */}
        <div className="space-y-5">

          {/* Quick actions 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/orders"
              className="flex items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 hover:border-[color:var(--brand-maroon)] hover:shadow-sm transition-all">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: "#FDE8EC" }}>{"📦"}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900">{t("myOrders")}</p>
                <p className="text-[11px] text-neutral-500">{recentOrders.length} order{recentOrders.length !== 1 ? "s" : ""}</p>
              </div>
            </Link>
            <Link href="/account/priority-card"
              className="flex items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 hover:border-[color:var(--brand-maroon)] hover:shadow-sm transition-all">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: "#FEF9C3" }}>{"🥇"}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900">Priority Cards</p>
                <p className="text-[11px] text-neutral-500">Perks &amp; free delivery</p>
              </div>
            </Link>
            <Link href="/tickets"
              className="flex items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 hover:border-[color:var(--brand-maroon)] hover:shadow-sm transition-all">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: "#EDE9FE" }}>{"🎟️"}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900">My Tickets</p>
                <p className="text-[11px] text-neutral-500">Zoo &amp; event bookings</p>
              </div>
            </Link>
            <button onClick={signOut}
              className="flex items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 hover:border-red-300 hover:shadow-sm transition-all text-left w-full">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <LogOut className="h-4 w-4 text-red-500" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900">{tc("signOut")}</p>
                <p className="text-[11px] text-neutral-500">See you soon</p>
              </div>
            </button>
          </div>

          {/* Recent orders */}
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-neutral-900">{t("myOrders")}</p>
              <Link href="/orders" className="text-xs font-semibold text-[color:var(--brand-maroon)] hover:underline">
                {tc("seeAll")} &rarr;
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">{t("noOrders")}</p>
                <Link href="/categories"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-maroon)] px-5 py-2 text-sm font-bold text-white hover:opacity-90">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((o) => {
                  const status = o.status ?? "pending";
                  return (
                    <Link key={o.id} href={`/orders/${o.id}`}
                      className="flex items-center gap-3 rounded-xl border border-[color:var(--brand-border)] p-3 hover:border-[color:var(--brand-maroon)] transition-colors">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {o.thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={o.thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-300">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold">{o.order_number ?? o.id.slice(0, 8).toUpperCase()}</p>
                          <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + (STATUS_COLORS[status] ?? "bg-neutral-100 text-neutral-500")}>
                            {fmtStatus(status)}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{o.preview}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-[color:var(--brand-maroon)]">{aed(o.total)}</p>
                        <p className="text-[10px] text-neutral-400">{fmtDate(o.created_at)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved addresses */}
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-neutral-900">Saved Addresses</p>
              {!addingAddr && (
                <button onClick={() => setAddingAddr(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[color:var(--brand-maroon)] hover:underline">
                  <Plus className="h-3.5 w-3.5" /> Add new
                </button>
              )}
            </div>
            {addresses.length === 0 && !addingAddr && (
              <div className="py-6 text-center">
                <MapPin className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No saved addresses yet</p>
              </div>
            )}
            <div className="space-y-2">
              {addresses.map((addr) => (
                <div key={addr.id}
                  className={"flex items-start gap-3 rounded-xl border p-3 " + (addr.is_default ? "border-[color:var(--brand-maroon)] bg-[color:var(--brand-cream)]" : "border-[color:var(--brand-border)]")}>
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                    {addr.label?.toLowerCase().includes("work") || addr.label?.toLowerCase().includes("office")
                      ? <Briefcase className="h-4 w-4 text-neutral-600" />
                      : <Home className="h-4 w-4 text-neutral-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{addr.label ?? "Address"}</p>
                      {addr.is_default && (
                        <span className="rounded-full bg-[color:var(--brand-maroon)] text-white text-[9px] font-bold px-2 py-0.5">DEFAULT</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5">{addr.full_address}</p>
                    {addr.emirate && <p className="text-[11px] text-neutral-400">{addr.emirate}{addr.landmark ? ` \u00b7 ${addr.landmark}` : ""}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.is_default && (
                      <button onClick={() => setDefault(addr.id)}
                        className="text-[11px] font-semibold text-neutral-400 hover:text-[color:var(--brand-maroon)]">
                        Set default
                      </button>
                    )}
                    <button onClick={() => deleteAddress(addr.id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {addingAddr && (
              <div className="mt-3 rounded-xl border border-[color:var(--brand-border)] p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">New Address</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Label</label>
                    <input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder="Home / Work"
                      className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Emirate</label>
                    <select value={addrEmirate} onChange={(e) => setAddrEmirate(e.target.value)} className="input w-full bg-white">
                      {["UAQ","Dubai","Abu Dhabi","Sharjah","Ajman","RAK","Fujairah"].map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Full Address</label>
                  <input value={addrFull} onChange={(e) => setAddrFull(e.target.value)} placeholder="Building, street, area\u2026" className="input w-full" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Landmark (optional)</label>
                  <input value={addrLandmark} onChange={(e) => setAddrLandmark(e.target.value)} placeholder="Near mosque\u2026" className="input w-full" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveAddress} disabled={addrSaving}
                    className="rounded-full bg-[color:var(--brand-maroon)] text-white px-5 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-50">
                    {addrSaving ? "Saving\u2026" : "Save address"}
                  </button>
                  <button onClick={() => setAddingAddr(false)}
                    className="rounded-full border border-[color:var(--brand-border)] px-5 py-2 text-sm font-semibold hover:bg-neutral-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* AED wallet — refund-funded store credit; separate from coins */}
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <div className="mb-4 rounded-xl bg-gradient-to-br from-[color:var(--brand-maroon)] to-[#6e122c] p-4 text-white">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[color:var(--brand-gold)]" />
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">{t("wallet")}</p>
              </div>
              <p className="mt-1.5 text-3xl font-extrabold leading-none">{aed(walletBalance)}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-white/80">{t("walletRefundFunded")}</p>
            </div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">{t("walletHistoryTitle")}</p>
            {walletTransactions.length === 0 ? (
              <p className="py-4 text-center text-xs text-neutral-500">{t("walletEmpty")}</p>
            ) : (
              <div>
                {walletTransactions.slice(0, 8).map((w) => {
                  const credit = w.type === "credit";
                  return (
                    <div key={w.id} className="flex items-center gap-2.5 py-2 border-b border-neutral-50 last:border-0">
                      <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold " + (credit ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500")}>
                        {credit ? "+" : "−"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs line-clamp-1">{w.description?.trim() || (w.source ?? "Wallet")}</p>
                        <p className="text-[10px] text-neutral-400">{fmtDate(w.created_at)}</p>
                      </div>
                      <span className={"text-xs font-bold shrink-0 " + (credit ? "text-green-700" : "text-neutral-500")}>
                        {credit ? "+" : "−"} {aed(w.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Wallet v2 — bank withdrawal (refund-sourced credit only) */}
            <WalletWithdraw
              userId={userId}
              initialWithdrawable={withdrawable}
              initialWithdrawals={withdrawals}
            />
          </div>

          {/* Coin wallet */}
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                  <Coins className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t("coinWallet")}</p>
                <p className="ms-auto text-sm font-bold text-[color:var(--brand-maroon)]">{aed(Number(coinAed))}</p>
              </div>
              <p className="text-3xl font-extrabold text-neutral-900 leading-none mt-1">{coinBalance.toLocaleString()}</p>
              <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug">{t("coinHelp")}</p>
            </div>
            {transactions.length > 0 && (
              <div className="border-t border-[color:var(--brand-border)] pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">{t("recentActivity")}</p>
                {transactions.slice(0, 5).map((tx) => {
                  const positive = tx.coins > 0;
                  return (
                    <div key={tx.id} className="flex items-center gap-2.5 py-2 border-b border-neutral-50 last:border-0">
                      <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold " + (positive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                        {positive ? "+" : "\u2212"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs line-clamp-1">{tx.description ?? tx.type.replace(/_/g, " ")}</p>
                        <p className="text-[10px] text-neutral-400">{fmtDate(tx.created_at)}</p>
                      </div>
                      <span className={"text-xs font-bold shrink-0 " + (positive ? "text-green-700" : "text-amber-700")}>
                        {positive ? "+" : ""}{tx.coins.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coupons */}
          {coupons.length > 0 && (
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Available Coupons</p>
              <div className="space-y-2">
                {coupons.map((c) => {
                  const discount = c.free_shipping ? "Free shipping"
                    : c.type === "percentage" || c.type === "percent" ? `${c.amount}% off`
                    : `AED ${c.amount} off`;
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-dashed border-[color:var(--brand-maroon)]/30 bg-[color:var(--brand-cream)] p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--brand-maroon)]">
                        <Tag className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold tracking-wide text-[color:var(--brand-maroon)]">{c.code}</p>
                        <p className="text-[11px] text-neutral-500">{discount}{c.min_spend ? ` \u00b7 min AED ${c.min_spend}` : ""}</p>
                        {c.expires_at && <p className="text-[10px] text-neutral-400">Expires {fmtDate(c.expires_at)}</p>}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success(`${c.code} copied!`); }}
                        className="shrink-0 rounded-full border border-[color:var(--brand-maroon)]/30 px-2.5 py-1 text-[10px] font-bold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white transition-colors flex items-center gap-1">
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personal details */}
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">{t("personalDetails")}</p>
            <dl className="divide-y divide-neutral-50">
              <KV label={t("fullName")}  value={profile.full_name} />
              <KV label={t("mobile")}    value={profile.phone_number} />
              <KV label={t("email")}     value={displayEmail} />
              <KV label={t("emirate")}   value={profile.emirate ?? "UAQ"} />
            </dl>
          </div>

          {/* Get the app */}
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">{t("getApp")}</p>
                <p className="text-xs text-neutral-500">{t("getAppDesc")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="#" className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2 text-center text-xs font-bold hover:bg-neutral-50 transition-colors">iOS</a>
              <a href="#" className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2 text-center text-xs font-bold hover:bg-neutral-50 transition-colors">Android</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-neutral-50 last:border-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 shrink-0">{label}</dt>
      <dd className="text-[13px] text-neutral-800 text-right">{value || "\u2014"}</dd>
    </div>
  );
}
