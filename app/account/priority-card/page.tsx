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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <Link href="/account" className="text-sm text-[color:var(--brand-maroon)] hover:underline">← Back to Account</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Priority Cards</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Unlock exclusive benefits — free delivery, discounts and cashback coins.
        </p>
      </div>
      <PriorityCardClient
        plans={plans ?? []}
        activeCard={activeCard ?? null}
        userId={user.id}
      />
    </div>
  );
}
