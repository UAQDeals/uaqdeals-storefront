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

  const [{ data: profile }, { data: wallet }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone_number, email, emirate")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("wallets")
      .select("coin_balance")
      .eq("customer_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-sm text-neutral-600">{t("subtitle")}</p>
      <div className="mt-6">
        <CheckoutForm
          userId={user.id}
          initialProfile={{
            full_name: (profile?.full_name as string | null) ?? null,
            phone_number: (profile?.phone_number as string | null) ?? null,
            email: ((profile?.email as string | null) ?? user.email) ?? null,
          }}
          coinBalance={(wallet?.coin_balance as number | null) ?? 0}
        />
      </div>
    </div>
  );
}
