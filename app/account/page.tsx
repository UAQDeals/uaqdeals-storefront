import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountView } from "@/components/account-view";

export const metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: wallet }, { data: txs }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, phone_number, email, emirate, avatar_url, auth_method, notification_preferences, created_at"
      )
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
  ]);

  // Fallbacks for missing rows (older accounts may not have wallet/profile rows yet)
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const initialProfile = {
    full_name:
      (profile?.full_name as string | null) ??
      (meta.name as string | undefined) ??
      (meta.full_name as string | undefined) ??
      null,
    phone_number: (profile?.phone_number as string | null) ?? user.phone ?? null,
    email: (profile?.email as string | null) ?? user.email ?? null,
    avatar_url:
      (profile?.avatar_url as string | null) ??
      (meta.avatar_url as string | undefined) ??
      null,
    auth_method: (profile?.auth_method as string | null) ?? "google",
    member_since:
      (profile?.created_at as string | null) ?? user.created_at ?? null,
  };
  const initialPrefs = (profile?.notification_preferences as Record<
    string,
    boolean
  > | null) ?? {
    order_updates: true,
    deals_promos: true,
    wallet_coins: true,
    support_replies: true,
  };

  return (
    <AccountView
      userId={user.id}
      initialProfile={initialProfile}
      coinBalance={(wallet?.coin_balance as number | null) ?? 0}
      transactions={(txs ?? []).map((t) => ({
        id: t.id as string,
        coins: Number(t.coins),
        type: (t.type as string | null) ?? "—",
        description: (t.description as string | null) ?? null,
        created_at: t.created_at as string,
      }))}
      initialPrefs={initialPrefs}
    />
  );
}
