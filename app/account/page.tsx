import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { AccountView } from "@/components/account-view";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return { title: t("account") };
}
export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const nowIso = new Date().toISOString();

  const [
    { data: profile },
    { data: wallet },
    { data: txs },
    { data: walletTxs },
    { data: orders },
    { data: addresses },
    { data: coupons },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone_number, email, emirate, avatar_url, auth_method, notification_preferences, created_at, wallet_balance")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("wallets")
      .select("coin_balance")
      .eq("customer_id", user.id)
      .maybeSingle(),

    supabase
      .from("coin_transactions")
      .select("id, coins, type, description, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),

    // AED store-credit wallet (refund-funded; separate from coins).
    supabase
      .from("customer_wallet_transactions")
      .select("id, type, amount, source, description, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, order_items(name, quantity, products(thumbnail_url))")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),

    supabase
      .from("addresses")
      .select("id, label, full_address, emirate, landmark, is_default")
      .eq("customer_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),

    supabase
      .from("coupons")
      .select("id, code, type, amount, min_spend, expires_at, free_shipping")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  const initialProfile = {
    full_name:    (profile?.full_name as string | null) ?? (meta.name as string | undefined) ?? null,
    phone_number: (profile?.phone_number as string | null) ?? user.phone ?? null,
    email:        (profile?.email as string | null) ?? user.email ?? null,
    avatar_url:   (profile?.avatar_url as string | null) ?? (meta.avatar_url as string | undefined) ?? null,
    auth_method:  (profile?.auth_method as string | null) ?? "google",
    emirate:      (profile?.emirate as string | null) ?? null,
    member_since: (profile?.created_at as string | null) ?? user.created_at ?? null,
  };

  const initialPrefs = (profile?.notification_preferences as Record<string, boolean> | null) ?? {
    order_updates: true, deals_promos: true, wallet_coins: true, support_replies: true,
  };

  const recentOrders = (orders ?? []).map((o: Row) => {
    const items = (o.order_items ?? []) as Row[];
    const thumb = items.find((it: Row) => it.products?.thumbnail_url)?.products?.thumbnail_url ?? null;
    const preview = items.slice(0, 2).map((it: Row) => it.name).join(", ") + (items.length > 2 ? ` +${items.length - 2}` : "");
    return { id: o.id, order_number: o.order_number, status: o.status, total: o.total, created_at: o.created_at, thumb, preview };
  });

  return (
    <AccountView
      userId={user.id}
      initialProfile={initialProfile}
      coinBalance={(wallet?.coin_balance as number | null) ?? 0}
      walletBalance={Number(profile?.wallet_balance ?? 0)}
      walletTransactions={(walletTxs ?? []).map((w: Row) => ({
        id: w.id, type: w.type as string, amount: Number(w.amount),
        source: (w.source as string | null) ?? null,
        description: (w.description as string | null) ?? null, created_at: w.created_at,
      }))}
      transactions={(txs ?? []).map((t: Row) => ({
        id: t.id, coins: Number(t.coins), type: t.type ?? "—",
        description: t.description ?? null, created_at: t.created_at,
      }))}
      initialPrefs={initialPrefs}
      recentOrders={recentOrders}
      addresses={(addresses ?? []).map((a: Row) => ({
        id: a.id, label: a.label, full_address: a.full_address,
        emirate: a.emirate, landmark: a.landmark, is_default: a.is_default ?? false,
      }))}
      coupons={(coupons ?? []).map((c: Row) => ({
        id: c.id, code: c.code, type: c.type, amount: Number(c.amount),
        min_spend: c.min_spend ? Number(c.min_spend) : null,
        expires_at: c.expires_at ?? null, free_shipping: c.free_shipping ?? false,
      }))}
    />
  );
}
