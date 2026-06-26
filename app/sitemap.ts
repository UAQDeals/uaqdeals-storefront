import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE = "https://uaqdeals.ae";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/products", "/categories", "/deals", "/services",
    "/services/explore-uaq", "/services/zoo-events",
    "/services/tech-services", "/services/job-portal",
    "/services/hotel-booking", "/services/flight-booking",
    "/marketplace/real_estate", "/marketplace/automotive",
    "/marketplace/used_items", "/marketplace/fancy_numbers",
    "/about", "/contact", "/blog", "/privacy", "/terms",
    "/select-emirate",
  ].map((path) => ({
    url: SITE + path,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  // Dynamic: active products + categories
  try {
    const supabase = await createClient();
    const [{ data: products }, { data: cats }] = await Promise.all([
      supabase.from("products").select("id, updated_at").eq("status", "active").limit(1000),
      supabase.from("categories").select("id").eq("is_active", true).limit(200),
    ]);

    const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p: any) => ({
      url: `${SITE}/products/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const catRoutes: MetadataRoute.Sitemap = (cats ?? []).map((c: any) => ({
      url: `${SITE}/shop/${c.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...catRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
