import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Tag, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aed } from "@/lib/format";
import { DealAddToCart } from "@/components/deal-add-to-cart";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  return { title: data?.title ?? "Deal" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data: d } = await supabase
    .from("deals")
    .select(
      "id, title, description, deal_price, original_price, discount_pct, deal_image_url, stock_available, ends_at, status, product_id, vendor_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (!d || d.status !== "active") notFound();
  if (d.ends_at && new Date(d.ends_at) < new Date(nowIso)) notFound();

  // Pull the underlying product (for images + Rx + vendor)
  let product: Row | null = null;
  if (d.product_id) {
    const { data: p } = await supabase
      .from("products")
      .select(
        "id, name, description, images, thumbnail_url, requires_prescription, stock_quantity, track_stock, variants, vendor_id"
      )
      .eq("id", d.product_id)
      .maybeSingle();
    product = p;
  }

  let vendor_name: string | null = null;
  const vendorId = d.vendor_id ?? product?.vendor_id ?? null;
  if (vendorId) {
    const { data: v } = await supabase
      .from("vendors")
      .select("name, vendor_types(name, mask_vendor_identity)")
      .eq("id", vendorId)
      .maybeSingle();
    if (v) {
      const masked = (v as Row).vendor_types?.mask_vendor_identity;
      vendor_name = masked ? "UAQ Deals Mart" : ((v as Row).name ?? null);
    }
  }

  // Build a gallery: deal image first, then product images
  const gallery: string[] = [];
  if (d.deal_image_url) gallery.push(d.deal_image_url);
  if (product?.thumbnail_url && !gallery.includes(product.thumbnail_url))
    gallery.push(product.thumbnail_url);
  if (Array.isArray(product?.images)) {
    for (const u of product.images as string[]) {
      if (u && !gallery.includes(u)) gallery.push(u);
    }
  }

  const pct = Number(d.discount_pct ?? 0);
  const dealPrice = Number(d.deal_price ?? 0);
  const original = Number(d.original_price ?? 0);

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-[color:var(--brand-muted)]">
        <Link href="/" className="transition hover:text-[color:var(--brand-maroon)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <Link href="/deals" className="transition hover:text-[color:var(--brand-maroon)]">
          Deals
        </Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <span className="line-clamp-1 text-[color:var(--ink)]">{d.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <Reveal>
          <DealGallery images={gallery} title={d.title} pct={pct} />
        </Reveal>

        <Reveal delay={90} className="flex flex-col">
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-[color:var(--ink)] sm:text-[34px]">
            {d.title}
          </h1>

          {vendor_name && (
            <p className="mt-2 text-[13px] font-medium text-[color:var(--brand-muted)]">
              {vendor_name}
            </p>
          )}

          <div className="gold-rule mt-5" />

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="text-[34px] font-extrabold leading-none text-[color:var(--brand-maroon)]">
              {aed(dealPrice)}
            </span>
            {original > dealPrice && (
              <span className="text-base text-neutral-400 line-through">
                {aed(original)}
              </span>
            )}
            {pct > 0 && (
              <span className="bg-brand-gradient rounded-full px-3 py-1 text-xs font-black tracking-wider text-white shadow-sm">
                Save {Math.round(pct)}%
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {d.ends_at && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 ring-1 ring-amber-100">
                <Clock className="h-3.5 w-3.5" />
                Ends {new Date(d.ends_at).toLocaleDateString("en-AE", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
            {d.stock_available != null && d.stock_available > 0 && (
              <span className="inline-flex rounded-full bg-green-50 px-3 py-1.5 font-semibold text-green-700 ring-1 ring-green-100">
                Only {d.stock_available} left
              </span>
            )}
            {product?.requires_prescription && (
              <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-700 ring-1 ring-red-100">
                Prescription required
              </span>
            )}
          </div>

          {product ? (
            <div className="mt-7">
              <DealAddToCart
                dealId={d.id}
                productId={product.id}
                name={d.title}
                price={dealPrice}
                original={original > dealPrice ? original : null}
                image={gallery[0] ?? null}
                vendorName={vendor_name}
                rx={Boolean(product.requires_prescription)}
                variants={Array.isArray(product.variants) ? product.variants : []}
              />
            </div>
          ) : (
            <div className="mt-7 rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--paper-2)] px-4 py-3 text-sm font-medium text-[color:var(--brand-muted)]">
              This deal is currently unavailable for online purchase.
            </div>
          )}

          {(d.description || product?.description) && (
            <div className="mt-8 border-t border-[color:var(--brand-border)] pt-6">
              <p className="eyebrow">Description</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {d.description || product?.description}
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}

function DealGallery({
  images,
  title,
  pct,
}: {
  images: string[];
  title: string;
  pct: number;
}) {
  return (
    <div>
      <div className="premium-card overflow-hidden rounded-3xl">
        <div className="relative aspect-square bg-[color:var(--paper-2)]">
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0]}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <Tag className="h-16 w-16" />
            </div>
          )}
          {pct > 0 && (
            <span className="bg-brand-gradient absolute start-3 top-3 rounded-full px-3 py-1 text-[11px] font-black tracking-wider text-white shadow-sm">
              -{Math.round(pct)}%
            </span>
          )}
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.slice(1).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className="h-16 w-16 shrink-0 rounded-xl border border-[color:var(--brand-border)] object-cover opacity-90 transition hover:opacity-100"
            />
          ))}
        </div>
      )}
    </div>
  );
}
