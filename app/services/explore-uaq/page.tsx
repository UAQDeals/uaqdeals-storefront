import { createClient } from "@/lib/supabase/server";
import { ExploreClient } from "./client";

export const metadata = { title: "Explore UAQ — UAQ Deals" };
export const revalidate = 300;

export default async function ExploreUAQPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiences")
    .select("id, title, description, category, price, duration, image_url, location, highlights, is_featured")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return <ExploreClient experiences={data ?? []} />;
}
