import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PriorityCardClient } from "./client";

export const metadata = { title: "Priority Cards — UAQ Deals" };

export default async function PriorityCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/priority-card");

  const [{ data: plans }, { data: activeCard }] = await Promise.all([
    supabase
      .from("priority_card_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true }),
    supabase
      .from("customer_cards")
      .select("*, priority_card_plans(*)")
      .eq("customer_id", user.id)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-8">
      <div className="mb-6">
        <Link href="/account" className="text-sm font-semibold text-[color:var(--brand-muted)] transition hover:text-[color:var(--brand-maroon)]">← Back to Account</Link>
        <div className="mt-3 flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[32px]">Priority Cards</h1>
        </div>
        <p className="mt-3 text-sm text-[color:var(--brand-muted)]">
          Unlock exclusive benefits — free delivery, discounts and cashback coins.
        </p>
        <div className="gold-rule mt-4" />
      </div>
      <PriorityCardClient
        plans={plans ?? []}
        activeCard={activeCard ?? null}
        userId={user.id}
      />
    </div>
  );
}
