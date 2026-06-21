"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronRight, Coins, LogOut, Package, ShoppingCart, Smartphone,
  Bell, Pencil, Check, X, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { aed } from "@/lib/format";

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

const PREF_KEYS = ["order_updates", "deals_promos", "wallet_coins", "support_replies"] as const;

export function AccountView({
  userId,
  initialProfile,
  coinBalance,
  transactions,
  initialPrefs,
}: {
  userId: string;
  initialProfile: InitialProfile;
  coinBalance: number;
  transactions: Tx[];
  initialPrefs: Prefs;
}) {
  const t = useTranslations("accountPage");
  const tc = useTranslations("common");
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone_number ?? "");
  const [saving, setSaving] = useState(false);

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

  function cancelEdit() {
    setName(profile.full_name ?? "");
    setPhone(profile.phone_number ?? "");
    setEditing(false);
  }

  const [prefsSaving, setPrefsSaving] = useState(false);

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
    if (error) {
      toast.error(error.message);
      setPrefs(prefs);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(tc("signOut"));
    router.replace("/");
    router.refresh();
  }

  const prefLabel: Record<string, { label: string; desc: string }> = {
    order_updates: { label: t("orderUpdates"), desc: t("orderUpdatesDesc") },
    deals_promos: { label: t("dealsPromos"), desc: t("dealsPromosDesc") },
    wallet_coins: { label: t("walletCoins"), desc: t("walletCoinsDesc") },
    support_replies: { label: t("supportReplies"), desc: t("supportRepliesDesc") },
  };

  const displayName = profile.full_name || profile.email || "—";
  const initial = (displayName?.[0] ?? "U").toUpperCase();
  const isGoogle = profile.auth_method === "google";

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-10">
      {/* HEADER */}
      <section className="flex items-center gap-4 rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-neutral-200" />
        ) : (
          <div className="bg-brand-gradient flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white">{initial}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold">{displayName.split(" ")[0]}</p>
          <p className="truncate text-sm text-neutral-600">{profile.email}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {isGoogle && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                <ShieldCheck className="h-3 w-3" /> Google
              </span>
            )}
            {profile.member_since && (
              <span className="text-[11px] text-neutral-500">
                {t("memberSince", { date: new Date(profile.member_since).toLocaleDateString("en-AE", { month: "short", year: "numeric" }) })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* COIN WALLET */}
      <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("coinWallet")}</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="bg-brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-full text-white"><Coins className="h-4 w-4" /></span>
              <p className="text-3xl font-extrabold text-[color:var(--brand-maroon)]">{coinBalance.toLocaleString()}</p>
              <p className="text-sm text-neutral-500">{t("coinEquiv", { amount: aed(coinBalance / 100) })}</p>
            </div>
            <p className="mt-1 text-xs text-neutral-500">{t("coinHelp")}</p>
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="mt-4 border-t border-[color:var(--brand-border)] pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{t("recentActivity")}</p>
            <ul className="mt-2 divide-y divide-[color:var(--brand-border)]">
              {transactions.map((tx) => {
                const positive = tx.coins > 0;
                return (
                  <li key={tx.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className={"inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold " + (positive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                      {positive ? "+" : "−"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm">{tx.description ?? tx.type.replace(/_/g, " ")}</p>
                      <p className="text-[11px] text-neutral-500">{new Date(tx.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span className={"text-sm font-bold " + (positive ? "text-green-700" : "text-[color:var(--brand-maroon)]")}>
                      {positive ? "+" : ""}{tx.coins.toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* QUICK LINKS */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/orders" className="group flex items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 hover:border-[color:var(--brand-maroon)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-cream)] text-[color:var(--brand-maroon)]"><Package className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("myOrders")}</p>
            <p className="text-xs text-neutral-500">{t("myOrdersDesc")}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
        </Link>
        <Link href="/cart" className="group flex items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 hover:border-[color:var(--brand-maroon)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-cream)] text-[color:var(--brand-maroon)]"><ShoppingCart className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{tc("cart")}</p>
            <p className="text-xs text-neutral-500">{t("cartDesc")}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
        </Link>
      </section>

      {/* PERSONAL DETAILS */}
      <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("personalDetails")}</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--brand-maroon)] hover:underline">
              <Pencil className="h-3.5 w-3.5" /> {tc("edit")}
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">{t("fullName")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[color:var(--brand-maroon)]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">{t("mobile")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[color:var(--brand-maroon)]" placeholder="+9715XXXXXXXX" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveProfile} disabled={saving} className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                <Check className="h-4 w-4" /> {saving ? tc("saving") : tc("save")}
              </button>
              <button onClick={cancelEdit} disabled={saving} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
                <X className="h-4 w-4" /> {tc("cancel")}
              </button>
            </div>
          </div>
        ) : (
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <KV label={t("fullName")} value={profile.full_name} />
            <KV label={t("mobile")} value={profile.phone_number} />
            <KV label={t("email")} value={profile.email} />
            <KV label={t("emirate")} value={profile.emirate ?? "UAQ"} />
          </dl>
        )}
      </section>

      {/* NOTIFICATIONS */}
      <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("notifications")}</h2>
          <Bell className="h-4 w-4 text-neutral-400" />
        </div>
        <ul className="mt-3 divide-y divide-[color:var(--brand-border)]">
          {PREF_KEYS.map((key) => {
            const on = !!prefs[key];
            const meta = prefLabel[key];
            return (
              <li key={key} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="text-xs text-neutral-500">{meta.desc}</p>
                </div>
                <button onClick={() => togglePref(key)} disabled={prefsSaving} role="switch" aria-checked={on}
                  className={"relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition " + (on ? "bg-[color:var(--brand-maroon)]" : "bg-neutral-300")}>
                  <span className={"inline-block h-4 w-4 transform rounded-full bg-white shadow transition " + (on ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1")} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* GET THE APP */}
      <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="bg-brand-gradient inline-flex h-10 w-10 items-center justify-center rounded-full text-white"><Smartphone className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("getApp")}</p>
            <p className="text-xs text-neutral-500">{t("getAppDesc")}</p>
          </div>
        </div>
      </section>

      {/* SIGN OUT */}
      <button onClick={signOut} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-white px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
        <LogOut className="h-4 w-4" /> {tc("signOut")}
      </button>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-neutral-800">{value || "—"}</dd>
    </div>
  );
}
