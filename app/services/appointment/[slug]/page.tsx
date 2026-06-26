import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppointmentClient } from "./client";

// Display config per appointment vendor_type_slug
const SLUG_META: Record<string, { title: string; emoji: string; tagline: string }> = {
  pest_control:          { title: "Pest Control",          emoji: "🐜", tagline: "Safe, certified pest treatment for your home" },
  home_services:         { title: "Home Services",         emoji: "🛠️", tagline: "Plumbing, electrical, AC & handyman services" },
  construction_painting: { title: "Construction & Painting", emoji: "🏗️", tagline: "Renovation, painting & finishing work" },
  cleaning_service:      { title: "Cleaning Services",     emoji: "🧹", tagline: "Deep cleaning & regular housekeeping" },
  tailor_shop:           { title: "Tailor Shop",           emoji: "🧵", tagline: "Custom tailoring & alterations" },
  barber_shop:           { title: "Barber Shop",           emoji: "💈", tagline: "Haircuts, grooming & beard styling" },
  clinics:               { title: "Clinics & Healthcare",  emoji: "🩺", tagline: "Consultations & health services" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = SLUG_META[slug];
  return { title: meta ? `${meta.title} — UAQ Deals` : "Book a Service — UAQ Deals" };
}

export default async function AppointmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = SLUG_META[slug];
  if (!meta) notFound();

  const supabase = await createClient();

  const [{ data: services }, { data: availability }] = await Promise.all([
    supabase
      .from("appointment_services")
      .select("id, title, description, price, price_label, duration_minutes, image_url")
      .eq("vendor_type_slug", slug)
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("appointment_availability")
      .select("day_of_week, start_time, end_time, slot_duration_minutes, max_bookings_per_slot")
      .eq("vendor_type_slug", slug)
      .eq("is_active", true),
  ]);

  return (
    <AppointmentClient
      slug={slug}
      meta={meta}
      services={services ?? []}
      availability={availability ?? []}
    />
  );
}
