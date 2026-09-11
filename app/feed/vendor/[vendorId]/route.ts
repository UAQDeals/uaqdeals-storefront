import { createClient } from "@/lib/supabase/server";

const SITE = "https://uaqdeals.ae";

// Google Shopping RSS 2.0 feed format (g: namespace). Meta's Commerce
// Manager / Catalog Manager explicitly accepts the same format for a
// scheduled feed fetch, so one endpoint serves both Google Merchant
// Center and Facebook/Instagram catalog sync — no separate CSV needed.
export const revalidate = 3600;

function escapeXml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(v: string) {
  return `<![CDATA[${v.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

// Product descriptions are stored as rich-text HTML; Google/Meta feed specs
// require plain text (no markup) and cap length around 5000 chars.
function stripHtml(v: string) {
  return v
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, name, status")
    .eq("id", vendorId)
    .maybeSingle();

  if (!vendor || vendor.status !== "approved") {
    return new Response("Vendor not found", { status: 404 });
  }

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, description, price, sale_price, currency, stock_quantity, track_stock, thumbnail_url, images, status, condition, brand"
    )
    .eq("vendor_id", vendorId)
    .eq("status", "active")
    .limit(5000);

  const items = (products ?? [])
    .filter((p) => p.thumbnail_url) // Google/Meta reject items with no image
    .map((p) => {
      const link = `${SITE}/products/${p.id}`;
      const currency = p.currency || "AED";
      const price = Number(p.price);
      const salePrice = p.sale_price != null ? Number(p.sale_price) : null;
      const inStock = !p.track_stock || (p.stock_quantity ?? 0) > 0;
      const extraImages = (p.images || [])
        .filter((img: string) => img && img !== p.thumbnail_url)
        .slice(0, 10)
        .map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join("\n      ");

      return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <title>${cdata(p.name || "")}</title>
      <description>${cdata(stripHtml(p.description || p.name || ""))}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(p.thumbnail_url)}</g:image_link>
      ${extraImages}
      <g:availability>${inStock ? "in stock" : "out of stock"}</g:availability>
      <g:price>${price.toFixed(2)} ${currency}</g:price>
      ${salePrice != null && salePrice < price ? `<g:sale_price>${salePrice.toFixed(2)} ${currency}</g:sale_price>` : ""}
      <g:condition>${p.condition || "new"}</g:condition>
      <g:brand>${cdata(p.brand || vendor.name || "UAQ Deals")}</g:brand>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${cdata(`${vendor.name} — UAQ Deals`)}</title>
    <link>${escapeXml(SITE)}</link>
    <description>${cdata(`Product catalog for ${vendor.name} on UAQ Deals`)}</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
