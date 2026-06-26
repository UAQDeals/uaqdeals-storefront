import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyTicketsClient } from "./client";

export const metadata = { title: "My Tickets — UAQ Deals" };
export const dynamic = "force-dynamic";

type Row = any;

export default async function MyTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/tickets");

  const { data: bookings } = await supabase
    .from("ticket_bookings")
    .select("id, booking_type, attraction_id, event_id, ticket_type, quantity, unit_price, total_price, visit_date, customer_name, customer_phone, e_ticket_code, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = bookings ?? [];

  // Resolve attraction + event names
  const attractionIds = [...new Set(rows.filter((b: Row) => b.attraction_id).map((b: Row) => b.attraction_id))];
  const eventIds = [...new Set(rows.filter((b: Row) => b.event_id).map((b: Row) => b.event_id))];

  const [{ data: attractions }, { data: events }] = await Promise.all([
    attractionIds.length
      ? supabase.from("attractions").select("id, name, image_url").in("id", attractionIds)
      : Promise.resolve({ data: [] as Row[] }),
    eventIds.length
      ? supabase.from("events").select("id, title, image_url").in("id", eventIds)
      : Promise.resolve({ data: [] as Row[] }),
  ]);

  const attractionMap = Object.fromEntries((attractions ?? []).map((a: Row) => [a.id, a]));
  const eventMap = Object.fromEntries((events ?? []).map((e: Row) => [e.id, e]));

  const tickets = rows.map((b: Row) => {
    const place = b.booking_type === "attraction" ? attractionMap[b.attraction_id] : eventMap[b.event_id];
    return {
      id: b.id,
      booking_type: b.booking_type,
      title: place?.name ?? place?.title ?? (b.booking_type === "attraction" ? "Attraction" : "Event"),
      image_url: place?.image_url ?? null,
      ticket_type: b.ticket_type,
      quantity: b.quantity,
      total_price: b.total_price,
      visit_date: b.visit_date,
      e_ticket_code: b.e_ticket_code,
      status: b.status,
      created_at: b.created_at,
    };
  });

  return <MyTicketsClient tickets={tickets} />;
}
