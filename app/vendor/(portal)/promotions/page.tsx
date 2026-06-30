import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PromotionsManager } from "./promotions-manager";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");
  const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).single();
  if (!vendor) redirect("/vendor/pending");
  return <PromotionsManager vendorId={vendor.id} />;
}
