"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronRight, Coins, LogOut, Package, ShoppingCart, Smartphone,
  Bell, Pencil, Check, X, ShieldCheck, MapPin, Plus, Trash2,
  Tag, Copy, Home, Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { aed } from "@/lib/format";

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
  initialPrefs,
  recentOrders,
  addresses: initialAddresses,
  coupons,
}: {
  userId: string;
  initialProfile: InitialProfile;
  coinBalance: number;
  transactions: Tx[];
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

  const displayName = profile.full_name || profile.email || "—";
  const initial     = (displayName?.[0] ?? "U").toUpperCase();
  const isGoogle    = profile.auth_method === "google";

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">

      {/* ── Profile header ─────────────────────────────────────────────────── */}
      <section className="flex items-center gap-4 border border-neutral-200 bg-white p-5">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-neutral-200" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-2xl font-bold text-white">{initial}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold tracking-tight">{displayName.split(" ")[0]}</p>
          <p className="truncate text-sm text-neutral-500">{profile.email}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {isGoogle && (
              <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                <ShieldCheck className="h-3 w-3" /> Google
              </span>
            )}
            {profile.member_since && (
              <span className="text-[11px] text-neutral-400">
                Member since {new Date(profile.member_since).toLocaleDateString("en-AE", { month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Coin wallet ────────────────────────────────────────────────────── */}
      <section className="border border-neutral-200 bg-white p-5">
        <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400 mb-3">{t("coinWallet")}</p>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center bg-neutral-900 text-white shrink-0">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-neutral-900">{coinBalance.toLocaleString()}</p>
            <p className="text-sm text-neutral-500">{aed(coinBalance / 100)} value · {t("coinHelp")}</p>
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="mt-4 border-t border-neutral-100 pt-3 space-y-0">
            <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400 mb-2">{t("recentActivity")}</p>
            {transactions.slice(0, 5).map((tx) => {
              const positive = tx.coins > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-0">
                  <span className={"inline-flex h-7 w-7 items-center justify-center text-[11px] font-bold " + (positive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                    {positive ? "+" : "−"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] line-clamp-1">{tx.description ?? tx.type.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-neutral-400">{fmtDate(tx.created_at)}</p>
                  </div>
                  <span className={"text-[13px] font-bold " + (positive ? "text-green-700" : "text-amber-700")}>
                    {positive ? "+" : ""}{tx.coins.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Priority Card ─────────────────────────────────────────────────────── */}
      <Link href="/account/priority-card" className="flex items-center gap-3 border border-neutral-200 bg-white p-5 hover:border-[color:var(--brand-maroon)] transition-colors">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-white text-lg">🥇</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">Priority Cards</p>
          <p className="text-xs text-neutral-500">Unlock free delivery, discounts &amp; coinback</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
      </Link>

      {/* ── My Tickets quick link ──────────────────────────────────────────── */}
      <Link href="/tickets" className="section-tickets-link flex items-center gap-3 border border-neutral-200 bg-white p-5 hover:border-[color:var(--brand-maroon)] transition-colors">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: "#FDE8EC" }}>🎟️</span>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-neutral-900">My Tickets</p>
          <p className="text-[12px] text-neutral-500">View your zoo & event bookings and QR codes</p>
        </div>
        <span className="text-neutral-400 text-lg">›</span>
      </Link>

      {/* ── Recent orders ──────────────────────────────────────────────────── */}
      <section className="border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400">{t("myOrders")}</p>
          <Link href="/orders" className="text-[12px] font-bold text-neutral-900 underline underline-offset-2 hover:text-[color:var(--brand-maroon)]">
            {tc("seeAll")} →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-6 text-center">
            <Package className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
            <p className="text-[13px] text-neutral-500">{t("noOrders")}</p>
            <Link href="/categories" className="mt-3 inline-block bg-neutral-900 text-white text-[12px] font-bold px-5 py-2 hover:bg-neutral-700 transition-colors">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => {
              const status = o.status ?? "pending";
              return (
                <Link key={o.id} href={`/orders/${o.id}`}
                  className="flex items-center gap-3 border border-neutral-100 p-3 hover:border-neutral-300 transition-colors">
                  <div className="h-12 w-12 shrink-0 overflow-hidden bg-neutral-100">
                    {o.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold">{o.order_number ?? o.id.slice(0, 8).toUpperCase()}</p>
                      <span className={"px-2 py-0.5 text-[10px] font-bold " + (STATUS_COLORS[status] ?? "bg-neutral-100 text-neutral-500")}>
                        {fmtStatus(status)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{o.preview}</p>
                    <p className="text-[11px] text-neutral-400">{fmtDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[14px] font-extrabold text-neutral-900">{aed(o.total)}</span>
                    <ChevronRight className="h-4 w-4 text-neutral-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Saved addresses ────────────────────────────────────────────────── */}
      <section className="border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400">Saved Addresses</p>
          {!addingAddr && (
            <button onClick={() => setAddingAddr(true)}
              className="flex items-center gap-1 text-[12px] font-bold text-neutral-900 hover:text-[color:var(--brand-maroon)] transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add new
            </button>
          )}
        </div>

        {addresses.length === 0 && !addingAddr && (
          <div className="py-6 text-center">
            <MapPin className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
            <p className="text-[13px] text-neutral-500">No saved addresses yet</p>
          </div>
        )}

        <div className="space-y-2">
          {addresses.map((addr) => (
            <div key={addr.id}
              className={"flex items-start gap-3 border p-3 " + (addr.is_default ? "border-neutral-900" : "border-neutral-100")}>
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-neutral-100">
                {addr.label?.toLowerCase().includes("work") || addr.label?.toLowerCase().includes("office")
                  ? <Briefcase className="h-4 w-4 text-neutral-600" />
                  : <Home className="h-4 w-4 text-neutral-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold">{addr.label ?? "Address"}</p>
                  {addr.is_default && (
                    <span className="bg-neutral-900 text-white text-[9px] font-bold px-2 py-0.5 tracking-wide">DEFAULT</span>
                  )}
                </div>
                <p className="text-[12px] text-neutral-600 mt-0.5">{addr.full_address}</p>
                {addr.emirate && <p className="text-[11px] text-neutral-400">{addr.emirate}{addr.landmark ? ` · ${addr.landmark}` : ""}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!addr.is_default && (
                  <button onClick={() => setDefault(addr.id)}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900">
                    Set default
                  </button>
                )}
                <button onClick={() => deleteAddress(addr.id)}
                  className="text-neutral-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add address form */}
        {addingAddr && (
          <div className="mt-3 border border-neutral-200 p-4 space-y-3">
            <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">New Address</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Label</label>
                <input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)}
                  placeholder="Home / Work / Other"
                  className="w-full h-10 border border-neutral-200 px-3 text-[13px] focus:outline-none focus:border-neutral-900" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Emirate</label>
                <select value={addrEmirate} onChange={(e) => setAddrEmirate(e.target.value)}
                  className="w-full h-10 border border-neutral-200 px-3 text-[13px] bg-white focus:outline-none focus:border-neutral-900">
                  {["UAQ", "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah"].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Full Address</label>
              <input value={addrFull} onChange={(e) => setAddrFull(e.target.value)}
                placeholder="Building, street, area…"
                className="w-full h-10 border border-neutral-200 px-3 text-[13px] focus:outline-none focus:border-neutral-900" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Landmark (optional)</label>
              <input value={addrLandmark} onChange={(e) => setAddrLandmark(e.target.value)}
                placeholder="Near mosque, next to school…"
                className="w-full h-10 border border-neutral-200 px-3 text-[13px] focus:outline-none focus:border-neutral-900" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveAddress} disabled={addrSaving}
                className="bg-neutral-900 text-white text-[13px] font-bold px-5 py-2.5 hover:bg-neutral-700 transition-colors disabled:opacity-50">
                {addrSaving ? "Saving…" : "Save address"}
              </button>
              <button onClick={() => setAddingAddr(false)}
                className="border border-neutral-200 text-[13px] font-semibold px-5 py-2.5 hover:bg-neutral-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Available coupons ──────────────────────────────────────────────── */}
      {coupons.length > 0 && (
        <section className="border border-neutral-200 bg-white p-5">
          <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400 mb-3">Available Coupons</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {coupons.map((c) => {
              const discount = c.free_shipping
                ? "Free shipping"
                : c.type === "percentage" || c.type === "percent"
                ? `${c.amount}% off`
                : `AED ${c.amount} off`;
              return (
                <div key={c.id}
                  className="flex items-center gap-3 border border-dashed border-neutral-300 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-900">
                    <Tag className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-extrabold tracking-wide">{c.code}</p>
                    <p className="text-[11.5px] text-neutral-500">{discount}{c.min_spend ? ` · min AED ${c.min_spend}` : ""}</p>
                    {c.expires_at && (
                      <p className="text-[10.5px] text-neutral-400">Expires {fmtDate(c.expires_at)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(c.code); toast.success(`${c.code} copied!`); }}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Personal details ───────────────────────────────────────────────── */}
      <section className="border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400">{t("personalDetails")}</p>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-neutral-900 hover:text-[color:var(--brand-maroon)] transition-colors">
              <Pencil className="h-3.5 w-3.5" /> {tc("edit")}
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">{t("fullName")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full h-10 border border-neutral-200 px-3 text-[13px] focus:outline-none focus:border-neutral-900" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">{t("mobile")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
                placeholder="+9715XXXXXXXX"
                className="w-full h-10 border border-neutral-200 px-3 text-[13px] focus:outline-none focus:border-neutral-900" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveProfile} disabled={saving}
                className="bg-neutral-900 text-white text-[13px] font-bold px-5 py-2.5 hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                <Check className="h-4 w-4" /> {saving ? tc("saving") : tc("save")}
              </button>
              <button onClick={() => { setName(profile.full_name ?? ""); setPhone(profile.phone_number ?? ""); setEditing(false); }}
                disabled={saving}
                className="border border-neutral-200 text-[13px] font-semibold px-5 py-2.5 hover:bg-neutral-50 transition-colors flex items-center gap-2">
                <X className="h-4 w-4" /> {tc("cancel")}
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <KV label={t("fullName")}  value={profile.full_name} />
            <KV label={t("mobile")}    value={profile.phone_number} />
            <KV label={t("email")}     value={profile.email} />
            <KV label={t("emirate")}   value={profile.emirate ?? "UAQ"} />
          </dl>
        )}
      </section>

      {/* ── Notifications ──────────────────────────────────────────────────── */}
      <section className="border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400">{t("notifications")}</p>
          <Bell className="h-4 w-4 text-neutral-300" />
        </div>
        <ul className="divide-y divide-neutral-50">
          {PREF_KEYS.map((key) => {
            const on   = !!prefs[key];
            const meta = prefLabel[key];
            return (
              <li key={key} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium">{meta.label}</p>
                  <p className="text-[11.5px] text-neutral-400">{meta.desc}</p>
                </div>
                <button onClick={() => togglePref(key)} disabled={prefsSaving} role="switch" aria-checked={on}
                  className={"relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition " + (on ? "bg-neutral-900" : "bg-neutral-200")}>
                  <span className={"inline-block h-4 w-4 transform rounded-full bg-white shadow transition " + (on ? "translate-x-6" : "translate-x-1")} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Get the app ────────────────────────────────────────────────────── */}
      <section className="border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-neutral-900">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold">{t("getApp")}</p>
            <p className="text-[12px] text-neutral-500">{t("getAppDesc")}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href="#" className="border border-neutral-200 text-[11px] font-bold px-3 py-1.5 hover:bg-neutral-50">iOS</a>
            <a href="#" className="border border-neutral-200 text-[11px] font-bold px-3 py-1.5 hover:bg-neutral-50">Android</a>
          </div>
        </div>
      </section>

      {/* ── Sign out ───────────────────────────────────────────────────────── */}
      <button onClick={signOut}
        className="flex w-full items-center justify-center gap-2 border border-neutral-200 bg-white px-4 py-3.5 text-[13.5px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
        <LogOut className="h-4 w-4" /> {tc("signOut")}
      </button>

    </div>
  );
}

function KV({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">{label}</dt>
      <dd className="mt-0.5 text-[13.5px] text-neutral-800">{value || "—"}</dd>
    </div>
  );
}
