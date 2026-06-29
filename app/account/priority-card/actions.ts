"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

export async function purchasePriorityCard(planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: plan, error: planErr } = await supabase
    .from("priority_card_plans")
    .select("id, tier, price, delivery_free_months, name")
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle();
  if (planErr || !plan) return { error: "Plan not found" };

  const service = createServiceClient();
  const now = new Date();
  const months = (plan.delivery_free_months as number) ?? 0;
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + months);

  await service
    .from("customer_cards")
    .update({ is_active: false })
    .eq("customer_id", user.id)
    .eq("is_active", true);

  const { error: insertErr } = await service.from("customer_cards").insert({
    customer_id:         user.id,
    plan_id:             plan.id,
    tier:                plan.tier,
    issued_at:           now.toISOString(),
    expires_at:          expires.toISOString(),
    delivery_free_until: expires.toISOString(),
    is_active:           true,
    issued_by:           "web_purchase",
  });
  if (insertErr) return { error: insertErr.message };

  revalidatePath("/account/priority-card");
  return { success: true };
}
