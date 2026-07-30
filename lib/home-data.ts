import { createClient } from "@/lib/supabase/server";
import { dedicatedFor } from "@/lib/service-routes";

/** A generic image-backed tile used by the home service/quick-access sections. */
export type HomeTile = {
  slug: string;
  title: string;
  titleAr: string | null;
  imageUrl: string | null;
  href: string;
  subtitle?: string | null;
};

export function serviceHref(slug: string): string {
  const d = dedicatedFor(slug);
  if (d) return d;
  if (["real_estate", "automotive", "fancy_numbers", "used_items"].includes(slug)) return `/marketplace/${slug}`;
  return `/categories/${slug}`;
}

/** All enabled service_tiles, grouped by their `section` label, sorted. Real images. */
export async function getHomeTilesBySection(): Promise<Record<string, HomeTile[]>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_tiles")
    .select("section, title, title_ar, slug, image_url, sort_order")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });
  const out: Record<string, HomeTile[]> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) {
    const tile: HomeTile = {
      slug: r.slug,
      title: r.title,
      titleAr: r.title_ar ?? null,
      imageUrl: r.image_url ?? null,
      href: serviceHref(r.slug),
    };
    (out[r.section] ??= []).push(tile);
  }
  return out;
}

/** Representative real images for the fish/pharmacy/food quick tiles (no stock photos). */
export async function getQuickAccessImages(): Promise<Record<string, string | null>> {
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("slug, image_url")
    .or("slug.ilike.pharmacy*,slug.ilike.grocery*,slug.ilike.fish*,slug.ilike.restaurant*,slug.ilike.food*");
  const map: Record<string, string | null> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const c of (cats ?? []) as any[]) {
    const s = (c.slug as string) || "";
    if (s.startsWith("pharmacy")) map.pharmacy ??= c.image_url ?? null;
    if (s.startsWith("fish")) map.fish ??= c.image_url ?? null;
    if (s.startsWith("restaurant") || s.startsWith("food")) map.food ??= c.image_url ?? null;
  }
  return map;
}

export type SquareItem = { id: string; imageUrl: string; href: string };
export type SquareSection = {
  id: string;
  title: string | null;
  titleAr: string | null;
  subtitle: string | null;
  subtitleAr: string | null;
  shape: string;
  emirates: string[] | null;
  items: SquareItem[];
};

function squareHref(linkType: string | null, v: string | null): string {
  if (!linkType || !v) return "#";
  switch (linkType) {
    case "category": return `/shop/${v}`;
    case "deal": return `/deals/${v}`;
    case "product": return `/products/${v}`;
    case "vendor": return `/vendors/${v}`;
    case "external": return v;
    default: return "#";
  }
}

/** Active square-banner sections keyed by id, each with its active items in order. */
export async function getSquareBanners(): Promise<Map<string, SquareSection>> {
  const supabase = await createClient();
  const [{ data: secs }, { data: its }] = await Promise.all([
    supabase.from("square_banner_sections").select("*").eq("is_active", true),
    supabase.from("square_banner_items").select("*").eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);
  const map = new Map<string, SquareSection>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const s of (secs ?? []) as any[]) {
    map.set(s.id, {
      id: s.id, title: s.title, titleAr: s.title_ar, subtitle: s.subtitle,
      subtitleAr: s.subtitle_ar, shape: s.shape ?? "square", emirates: s.emirates ?? null, items: [],
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const it of (its ?? []) as any[]) {
    const sec = map.get(it.section_id);
    if (sec && it.image_url) sec.items.push({ id: it.id, imageUrl: it.image_url, href: squareHref(it.link_type, it.link_value) });
  }
  return map;
}

export type WebGame = { key: string; maxCoins: number };

/** Enabled games with their top reward, for the web Games spotlight. Public read. */
export async function getEnabledGames(): Promise<WebGame[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_configs")
    .select("game_key, is_enabled, config")
    .eq("is_enabled", true);
  const games: WebGame[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const g of (data ?? []) as any[]) {
    const cfg = g.config ?? {};
    let max = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nums = (arr: any[], pick: (x: any) => number) =>
      arr.length ? Math.max(...arr.map(pick)) : 0;
    if (Array.isArray(cfg.segments)) max = nums(cfg.segments, (s) => Number(s.coins) || 0);
    else if (Array.isArray(cfg.tiers)) max = nums(cfg.tiers, (s) => Number(s.coins) || 0);
    else if (Array.isArray(cfg.day_rewards)) max = nums(cfg.day_rewards, (n) => Number(n) || 0);
    games.push({ key: g.game_key, maxCoins: max });
  }
  const ord = ["spin", "scratch", "checkin"];
  games.sort((a, b) => ord.indexOf(a.key) - ord.indexOf(b.key));
  return games;
}
