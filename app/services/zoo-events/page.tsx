import { createClient } from "@/lib/supabase/server";
import { ZooEventsClient } from "./client";

export const metadata = { title: "Zoo & Events — UAQ Deals" };
export const revalidate = 60;

export default async function ZooEventsPage() {
  const supabase = await createClient();

  const [{ data: attractions }, { data: events }] = await Promise.all([
    supabase
      .from("attractions")
      .select("*, attraction_tickets(*)")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true }),
  ]);

  return <ZooEventsClient attractions={attractions ?? []} events={events ?? []} />;
}
