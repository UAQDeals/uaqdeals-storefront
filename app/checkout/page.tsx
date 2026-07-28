import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout-form";

export async function generateMetadata() {
  const t = await getTranslations("checkout");
  return { title: t("title") };
}

export default async function CheckoutPage() {
  const supabase = await createClient();
  const t = await getTranslations("checkout");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const [{ data: profile }, { data: wallet }, { data: emiratesRaw }, { data: settingsRaw }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone_number, email, emirate, wallet_balance")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("wallets")
      .select("coin_balance")
      .eq("customer_id", user.id)
      .maybeSingle(),
    // Canonical emirates only (active, ordered) — never the emirate_type enum,
    // which has dead legacy labels.
    supabase
      .from("emirates")
      .select("id, name, is_uaq, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["pickup_enabled", "pickup_location", "service_charge_aed"]),
  ]);

  const emirates = (emiratesRaw ?? []).map((e) => ({
    name: e.name as string,
    is_uaq: Boolean(e.is_uaq),
  }));
  const settingsMap = new Map((settingsRaw ?? []).map((s) => [s.key as string, (s.value as string | null) ?? ""]));
  const fulfilment = {
    pickupEnabled: (settingsMap.get("pickup_enabled") ?? "false") === "true",
    pickupLocation: settingsMap.get("pickup_location") ?? "",
    serviceCharge: Number(settingsMap.get("service_charge_aed") ?? "0") || 0,
  };
  const defaultEmirate = (profile?.emirate as string | null) ?? null;

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-10 md:px-8">
      <div className="mb-2 flex items-center gap-3.5">
        <span className="accent-bar h-9 w-1.5 rounded-full" />
        <div>
          <p className="eyebrow">{t("subtitle")}</p>
          <h1 className="font-display mt-0.5 text-[26px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[32px]">{t("title")}</h1>
        </div>
      </div>
      <div className="gold-rule mb-6 mt-4" />
      <div className="mt-6">
        <CheckoutForm
          userId={user.id}
          initialProfile={{
            full_name: (profile?.full_name as string | null) ?? null,
            phone_number: (profile?.phone_number as string | null) ?? null,
            email: ((profile?.email as string | null) ?? user.email) ?? null,
          }}
          coinBalance={(wallet?.coin_balance as number | null) ?? 0}
          walletBalance={Number(profile?.wallet_balance ?? 0)}
          emirates={emirates}
          fulfilment={fulfilment}
          defaultEmirate={defaultEmirate}
        />
      </div>
    </div>
  );
}
