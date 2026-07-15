"use client";

import { useMemo, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, ShoppingCart, Tag, Store, Star, FileText, Zap, Share2, Truck, RotateCcw, ShieldCheck, BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { aed } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { PrescriptionUploadModal } from "@/components/prescription-upload-modal";
import {
  type VariantTree,
  type VOption,
  type VariantSelection,
  isColourOption,
  isValueAvailable,
  resolveVariant,
  minVariantPrice,
} from "@/lib/variants";

type Product = {
  id: string; name: string; name_ar?: string | null; description: string | null; description_ar?: string | null;
  price: number; sale_price: number | null;
  thumbnail_url: string | null; images: string[];
  variants: Array<{ name: string; price: number | null; sale_price: number | null; sku?: string | null; stock_quantity: number }>;
  stock_quantity: number | null; track_stock: boolean;
  requires_prescription: boolean; vendor_id: string | null; brand: string | null;
  unit: string | null; vendor_name: string | null; condition?: string | null;
  average_rating: number | null; review_count: number;
  specs?: Record<string, string> | null; sku?: string | null;
  is_halal?: boolean; weight_based?: boolean; weight_unit?: string | null;
  delivery_days?: number | null;
};

type Review = {
  id: string; rating: number; comment: string | null;
  created_at: string; reviewer_name: string | null; reviewer_avatar: string | null;
};

export function ProductDetail({
  product: p,
  variantTree = { options: [], variants: [] },
  reviews: initialReviews = [],
}: {
  product: Product;
  variantTree?: VariantTree;
  reviews?: Review[];
}) {
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const tr = useTranslations("reviews");
  const locale = useLocale();
  const isAr = locale === "ar";
  const dateLocale = isAr ? "ar-AE" : "en-AE";
  // Prefer Arabic product content when viewing in Arabic and it exists.
  const displayName = isAr && p.name_ar ? p.name_ar : p.name;
  const displayDescription = isAr && p.description_ar ? p.description_ar : p.description;

  const baseGallery = useMemo(() => {
    const set: string[] = [];
    if (p.thumbnail_url) set.push(p.thumbnail_url);
    for (const u of p.images) if (u && !set.includes(u)) set.push(u);
    return set;
  }, [p.thumbnail_url, p.images]);

  // ── Relational variants (get_product_variants) ─────────────────────────────
  // When the product exposes relational options we use them exclusively and
  // ignore the legacy products.variants jsonb. When there are none, everything
  // below falls back to the product-level (or legacy jsonb) behaviour.
  const relOptions = variantTree.options;
  const hasRel = relOptions.length > 0;
  const [selValues, setSelValues] = useState<VariantSelection>({});
  const relVariant = useMemo(
    () => (hasRel ? resolveVariant(variantTree, selValues) : null),
    [hasRel, variantTree, selValues],
  );
  const relComplete = hasRel && relOptions.every((o) => !!selValues[o.id]);
  const relFromPrice = useMemo(() => (hasRel ? minVariantPrice(variantTree) : null), [hasRel, variantTree]);

  function pickValue(optionId: string, valueId: string) {
    setSelValues((prev) => {
      const next = { ...prev };
      if (next[optionId] === valueId) delete next[optionId]; // tap again to clear
      else next[optionId] = valueId;
      return next;
    });
    setQty(1);
  }

  // Legacy jsonb variant path — only when there are NO relational options.
  const hasLegacyVariants = !hasRel && (p.variants?.length ?? 0) > 0;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const selectedVariant = !hasRel && selectedVariantIdx != null ? p.variants[selectedVariantIdx] : null;

  // Gallery swaps to the selected variant's images when it has any.
  const activeGallery = useMemo(() => {
    if (hasRel && relVariant && relVariant.images.length > 0) {
      const set: string[] = [];
      for (const u of relVariant.images) if (u && !set.includes(u)) set.push(u);
      return set;
    }
    return baseGallery;
  }, [hasRel, relVariant, baseGallery]);

  const [activeImg, setActiveImg] = useState(0);
  // Reset to the first image whenever the effective gallery changes.
  useEffect(() => { setActiveImg(0); }, [relVariant?.id]);
  const safeImg = Math.min(activeImg, Math.max(0, activeGallery.length - 1));

  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const router = useRouter();
  const [rxUploaded, setRxUploaded] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    });
  }, []);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : (p.average_rating ?? 0);

  async function submitReview() {
    if (reviewSubmitting) return;
    setReviewSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error(tr("signInRequired")); return; }
      const { error } = await supabase.from("reviews").insert({
        product_id: p.id,
        customer_id: user.id,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
        is_approved: false,
      });
      if (error) throw error;
      setReviewSubmitted(true);
      setShowReviewForm(false);
      toast.success(tr("submitted"));
    } catch (e: any) {
      toast.error(e.message ?? tr("submitFailed"));
    } finally {
      setReviewSubmitting(false);
    }
  }

  // ── Effective price / stock for the current view ───────────────────────────
  let basePrice: number;
  let baseSale: number | null;
  if (hasRel) {
    if (relVariant) {
      basePrice = relVariant.price ?? p.price;
      baseSale = relVariant.sale_price;
    } else {
      basePrice = relFromPrice ?? p.price; // "from …" before a complete pick
      baseSale = null;
    }
  } else if (selectedVariant) {
    basePrice = selectedVariant.price ?? p.price;
    baseSale = selectedVariant.sale_price;
  } else {
    basePrice = p.price;
    baseSale = p.sale_price;
  }
  const hasSale = baseSale != null && baseSale > 0 && baseSale < basePrice;
  const unitPrice = hasSale ? (baseSale as number) : basePrice;
  const discountPct = hasSale ? Math.round(((basePrice - (baseSale as number)) / basePrice) * 100) : 0;
  const savings = hasSale ? basePrice - (baseSale as number) : 0;
  // Show a "from …" price before a complete relational selection is made.
  const showFromPrice = hasRel && !relComplete && relFromPrice != null;

  // ── Stock / availability ───────────────────────────────────────────────────
  let oos: boolean;
  let lowStock = false;
  let stockLeft: number | null = null;
  let availStock: number;
  if (hasRel) {
    if (relVariant) {
      oos = !relVariant.in_stock || !relVariant.is_active;
      stockLeft = relVariant.stock_quantity;
      lowStock = !oos && stockLeft != null && stockLeft > 0 && stockLeft <= 5;
      availStock = stockLeft != null && stockLeft > 0 ? stockLeft : (oos ? 1 : Infinity);
    } else {
      oos = false; // don't flag the whole product OOS before a selection
      availStock = Infinity;
    }
  } else if (selectedVariant) {
    const sq = selectedVariant.stock_quantity;
    oos = sq == null || sq <= 0;
    stockLeft = sq;
    lowStock = !oos && sq > 0 && sq <= 5;
    availStock = sq > 0 ? sq : 1;
  } else if (hasLegacyVariants) {
    oos = false;
    availStock = p.track_stock ? (p.stock_quantity ?? 0) : Infinity;
  } else {
    oos = p.track_stock && (p.stock_quantity == null || p.stock_quantity <= 0);
    stockLeft = p.stock_quantity;
    lowStock = p.track_stock && p.stock_quantity != null && p.stock_quantity > 0 && p.stock_quantity <= 5;
    availStock = p.track_stock ? (p.stock_quantity ?? 0) : Infinity;
  }
  const maxQty = availStock > 0 ? availStock : 1;

  const isRx = p.requires_prescription;
  // Must pick a complete (in-stock) combination before adding.
  const needsVariant = hasRel ? !relVariant : (hasLegacyVariants && selectedVariant == null);
  const canAdd = !oos && !needsVariant && (!isRx || rxUploaded);

  // ── Variant identity for the cart line + human-readable summary ────────────
  const relSummary = hasRel
    ? relOptions
        .map((o) => {
          const val = o.values.find((v) => v.id === selValues[o.id]);
          if (!val) return "";
          const oName = isAr && o.name_ar ? o.name_ar : o.name;
          const vName = isAr && val.value_ar ? val.value_ar : val.value;
          return `${oName}: ${vName}`;
        })
        .filter(Boolean)
        .join(" / ")
    : "";
  const variantSummary = hasRel ? relSummary : (selectedVariant ? selectedVariant.name : "");
  const variantId = hasRel ? (relVariant?.id ?? null) : null;
  const lineId =
    p.id +
    (variantId ? "::" + variantId : variantSummary ? "::" + variantSummary.replace(/\s+/g, "_") : "");

  function pushToCart() {
    add(
      {
        id: lineId,
        product_id: p.id,
        name: p.name,
        price: unitPrice,
        original_price: hasSale ? basePrice : null,
        image: activeGallery[0] ?? baseGallery[0] ?? null,
        variant: variantSummary || null,
        // Carried for order creation; checkout does not forward it yet (next task).
        variant_id: variantId,
        vendor_name: p.vendor_name,
        vendor_id: p.vendor_id,
      },
      qty,
    );
  }

  function handleAdd() {
    if (!canAdd) return;
    pushToCart();
    toast.success(t("added", { qty, name: p.name }));
  }

  function handleBuyNow() {
    if (!canAdd) return;
    pushToCart();
    router.push("/checkout");
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: p.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("linkCopied"));
      }
    } catch {
      /* user dismissed the share sheet — no-op */
    }
  }

  // Spec rows: explicit `specs` map plus a few core attributes, when present.
  const specRows: Array<[string, string]> = [
    ...(p.brand ? [[t("brandLabel"), p.brand] as [string, string]] : []),
    ...(p.sku ? [[t("skuLabel"), p.sku] as [string, string]] : []),
    ...(p.condition ? [[t("conditionLabel"),
      p.condition === "used" ? t("used")
      : p.condition === "new" ? t("new")
      : p.condition === "refurbished" ? t("refurbished")
      : p.condition.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())] as [string, string]] : []),
    ...(p.is_halal ? [[t("halalLabel"), t("yes")] as [string, string]] : []),
    ...(p.unit && Number.isNaN(Number(p.unit)) ? [[t("unitLabel"), p.unit] as [string, string]] : []),
    ...Object.entries(p.specs ?? {})
      .filter(([, v]) => v != null && String(v).trim() !== "")
      .map(([k, v]) => [k, String(v)] as [string, string]),
  ];

  // Expected delivery — only for product vendors that publish a lead time.
  const deliveryDays = typeof p.delivery_days === "number" && p.delivery_days > 0 ? p.delivery_days : null;
  const getItByDate = deliveryDays != null
    ? new Date(Date.now() + deliveryDays * 86_400_000).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      <div className="md:sticky md:top-24 md:self-start">
        <div className="overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white">
          <div className="relative aspect-square bg-neutral-100">
            {activeGallery[safeImg] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeGallery[safeImg]} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-16 w-16" /></div>
            )}
            {discountPct > 0 && <span className="bg-brand-gradient absolute start-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white">-{discountPct}%</span>}
          </div>
        </div>
        {activeGallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {activeGallery.map((src, i) => (
              <button key={src + i} onClick={() => setActiveImg(i)}
                className={"h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition " + (i === safeImg ? "border-[color:var(--brand-maroon)]" : "border-transparent opacity-70 hover:opacity-100")}
                aria-label={`Image ${i + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Buy box (sticky on desktop) ──────────────────────────────────── */}
      <div className="flex flex-col md:sticky md:top-24 md:self-start">
        {p.condition === "used" && (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-black tracking-widest text-amber-700 uppercase">Used Item</span>
            <VerifiedBadge />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>

        {(p.vendor_name || p.brand) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
            {p.vendor_name && <span className="inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5" />{p.vendor_name}</span>}
            {p.brand && <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />{p.brand}</span>}
          </div>
        )}

        {/* Rating summary — jumps to the reviews section below. */}
        {avgRating > 0 && (
          <a href="#reviews" className="mt-2 inline-flex items-center gap-1.5 text-sm">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
              ))}
            </span>
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-neutral-500 hover:text-[color:var(--brand-maroon)] hover:underline">
              ({reviews.length || p.review_count} {(reviews.length || p.review_count) === 1 ? t("review") : t("reviews")})
            </span>
          </a>
        )}

        <div className="mt-5 flex items-end gap-3">
          {showFromPrice && <span className="text-sm font-medium text-neutral-500">{t("from")}</span>}
          <span className="text-3xl font-extrabold text-[color:var(--brand-maroon)]">{aed(unitPrice)}</span>
          {hasSale && <span className="text-base text-neutral-500 line-through">{aed(basePrice)}</span>}
          {/* Only show a real unit (e.g. "kg", "piece") — a blank or purely numeric value like "1" is not a unit. */}
          {p.unit && p.unit.trim() !== "" && Number.isNaN(Number(p.unit)) && (
            <span className="text-xs text-neutral-500">/ {p.unit}</span>
          )}
        </div>
        {hasSale && (
          <p className="mt-1 text-sm font-semibold text-green-700">
            {t("save")} {aed(savings)} ({discountPct}%)
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {isRx && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{t("prescriptionRequired")}</span>}
          {oos && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">{tc("outOfStock")}</span>}
          {!oos && lowStock && stockLeft != null && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{tc("onlyLeft", { count: stockLeft })}</span>}
          {!oos && !isRx && !lowStock && !needsVariant && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{tc("inStock")}</span>}
        </div>

        {getItByDate && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700">
            <Truck className="h-4 w-4 text-[color:var(--brand-maroon)]" /> {t("getItBy", { date: getItByDate })}
          </p>
        )}

        {/* Variant selector: relational (preferred) or legacy jsonb chips. */}
        {hasRel ? (
          <VariantSelector
            options={relOptions}
            tree={variantTree}
            selected={selValues}
            onPick={pickValue}
            isAr={isAr}
            selectHint={t("selectOne")}
          />
        ) : hasLegacyVariants ? (
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {t("options")} {needsVariant && <span className="text-[color:var(--brand-maroon)]">{t("selectOne")}</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.variants.map((v, idx) => {
                  const active = selectedVariantIdx === idx;
                  const vOos = v.stock_quantity != null && v.stock_quantity <= 0;
                  const vSale = v.sale_price != null && v.sale_price > 0 && v.price != null && v.sale_price < v.price;
                  const vPrice = vSale ? v.sale_price : v.price;
                  return (
                    <button
                      key={idx}
                      disabled={vOos}
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={"flex flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition " +
                        (vOos ? "border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed line-through "
                              : active ? "border-[color:var(--brand-maroon)] bg-[color:var(--brand-maroon)]/5 "
                              : "border-neutral-200 bg-white hover:border-neutral-400 ")}
                    >
                      <span className="font-semibold text-neutral-900">{v.name}</span>
                      {vPrice != null && (
                        <span className="text-xs text-[color:var(--brand-maroon)] font-bold">{aed(vPrice)}</span>
                      )}
                      {vOos && <span className="text-[10px] text-neutral-400">{tc("outOfStock")}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap items-stretch gap-3">
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="inline-flex h-11 w-11 items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40" aria-label="−" disabled={qty <= 1}><Minus className="h-4 w-4" /></button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="inline-flex h-11 w-11 items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40" aria-label="+" disabled={qty >= maxQty}><Plus className="h-4 w-4" /></button>
          </div>

          {canAdd ? (
            <button onClick={handleAdd} className="bg-brand-gradient inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
              <ShoppingCart className="h-4 w-4" /> {t("addToCart")} · {aed(unitPrice * qty)}
            </button>
          ) : isRx && !rxUploaded ? (
            <div className="flex flex-1 flex-col items-stretch gap-1">
              <button
                onClick={() => setRxOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-maroon)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                <FileText className="h-4 w-4" /> Upload Prescription to Add
              </button>
              <p className="text-center text-xs text-neutral-500">A valid prescription is required for this item.</p>
            </div>
          ) : needsVariant ? (
            <button disabled className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-500">{t("selectOption")}</button>
          ) : (
            <button disabled className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-500">{tc("outOfStock")}</button>
          )}
        </div>

        {/* Buy Now (express to checkout) + Share */}
        <div className="mt-3 flex items-stretch gap-3">
          {canAdd && (
            <button onClick={handleBuyNow} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[color:var(--brand-maroon)] px-6 py-3 text-sm font-semibold text-[color:var(--brand-maroon)] transition hover:bg-[color:var(--brand-maroon)]/5">
              <Zap className="h-4 w-4" /> {t("buyNow")}
            </button>
          )}
          <button onClick={handleShare} aria-label={t("share")} className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50">
            <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">{t("share")}</span>
          </button>
        </div>

        {/* Delivery & returns trust panel */}
        <div className="mt-6 rounded-2xl border border-[color:var(--brand-border)] bg-gradient-to-b from-[color:var(--brand-maroon)]/[0.035] to-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.10)]">
          <div className="grid grid-cols-2">
            <TrustRow icon={<Truck className="h-[18px] w-[18px]" />} title={t("trustDeliveryTitle")} sub={t("trustDeliverySub")} className="border-b border-e border-black/[0.06]" />
            <TrustRow icon={<BadgeCheck className="h-[18px] w-[18px]" />} title={t("trustCodTitle")} sub={t("trustCodSub")} className="border-b border-black/[0.06]" />
            <TrustRow icon={<RotateCcw className="h-[18px] w-[18px]" />} title={t("trustReturnsTitle")} sub={t("trustReturnsSub")} className="border-e border-black/[0.06]" />
            <TrustRow icon={<ShieldCheck className="h-[18px] w-[18px]" />} title={t("trustSecureTitle")} sub={t("trustSecureSub")} />
          </div>
        </div>

        {rxOpen && (
        <PrescriptionUploadModal
          productId={p.id}
          vendorId={(p as any).vendor_id ?? null}
          productName={p.name}
          userId={userId ?? ''}
          onSuccess={() => setRxUploaded(true)}
          onClose={() => setRxOpen(false)}
        />
      )}
      </div>

      {/* ── Detail sections (full width, below the buy box) ───────────────── */}
      <div className="md:col-span-2">
        {displayDescription && (
          <div className="mt-2 border-t border-[color:var(--brand-border)] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("description")}</h2>
            <div className="prose prose-sm mt-2 max-w-none text-sm leading-relaxed text-neutral-700" dangerouslySetInnerHTML={{ __html: displayDescription }} />
          </div>
        )}

        {specRows.length > 0 && (
          <div className="mt-8 border-t border-[color:var(--brand-border)] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("specifications")}</h2>
            <dl className="mt-3 overflow-hidden rounded-xl border border-[color:var(--brand-border)] md:max-w-2xl">
              {specRows.map(([k, v], i) => (
                <div key={k} className={"flex text-sm " + (i % 2 ? "bg-white" : "bg-neutral-50/60")}>
                  <dt className="w-2/5 shrink-0 px-4 py-2.5 font-medium capitalize text-neutral-500">{k.replace(/_/g, " ")}</dt>
                  <dd className="px-4 py-2.5 text-neutral-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <p className="mt-8 text-xs text-neutral-500">
          {t("needHelp")}{" "}
          <Link href="/contact" className="font-semibold text-[color:var(--brand-maroon)] hover:underline">{t("contactUs")}</Link>
        </p>
      </div>

      {/* ── Reviews section ──────────────────────────────────────────── */}
      <div id="reviews" className="scroll-mt-24 md:col-span-2 border-t border-[color:var(--brand-border)] pt-8 mt-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{tr("title")}</h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-neutral-500">{tr("count", { count: p.review_count })}</span>
              </div>
            )}
          </div>
          {!reviewSubmitted && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 border border-[color:var(--brand-maroon)] text-[color:var(--brand-maroon)] px-4 py-2 text-sm font-semibold hover:bg-[color:var(--brand-maroon)] hover:text-white transition-colors"
            >
              <Star className="w-4 h-4" /> {tr("write")}
            </button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && !reviewSubmitted && (
          <div className="mb-8 border border-[color:var(--brand-border)] p-5 bg-neutral-50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">{tr("yourReview")}</h3>
            {/* Star picker */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setReviewRating(i + 1)}>
                  <Star className={`w-7 h-7 transition-colors ${i < reviewRating ? "fill-amber-400 text-amber-400" : "text-neutral-300 hover:text-amber-300"}`} />
                </button>
              ))}
              <span className="ms-2 text-sm text-neutral-500">{tr("stars", { count: reviewRating })}</span>
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder={tr("commentPlaceholder")}
              rows={3}
              className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                disabled={reviewSubmitting}
                className="bg-neutral-900 text-white text-sm font-bold px-6 py-2.5 hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? tr("submitting") : tr("submit")}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="border border-neutral-200 text-sm font-semibold px-6 py-2.5 hover:bg-neutral-50 transition-colors"
              >
                {tc("cancel")}
              </button>
            </div>
          </div>
        )}

        {reviewSubmitted && (
          <div className="mb-6 bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium flex items-center gap-2">
            <Star className="w-4 h-4" /> {tr("thanks")}
          </div>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="py-10 text-center text-neutral-400 text-sm border border-dashed border-neutral-200">
            {tr("empty")}
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-neutral-100 pb-5 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-200 shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-neutral-600">
                    {r.reviewer_avatar
                      ? <img src={r.reviewer_avatar} alt="" className="w-full h-full object-cover" />
                      : (r.reviewer_name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{r.reviewer_name ?? tr("customer")}</p>
                      <p className="text-xs text-neutral-400">{new Date(r.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="flex mt-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-neutral-700 leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Relational variant selector: one row per option, nested availability ─────
function VariantSelector({
  options,
  tree,
  selected,
  onPick,
  isAr,
  selectHint,
}: {
  options: VOption[];
  tree: VariantTree;
  selected: VariantSelection;
  onPick: (optionId: string, valueId: string) => void;
  isAr: boolean;
  selectHint: string;
}) {
  return (
    <div className="mt-6 space-y-5">
      {options.map((o) => {
        const colour = isColourOption(o);
        const oName = isAr && o.name_ar ? o.name_ar : o.name;
        const chosen = selected[o.id];
        const chosenVal = o.values.find((v) => v.id === chosen);
        const chosenLabel = chosenVal ? (isAr && chosenVal.value_ar ? chosenVal.value_ar : chosenVal.value) : null;
        return (
          <div key={o.id}>
            <div className="flex items-baseline gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{oName}</p>
              {chosenLabel ? (
                <span className="text-sm font-medium text-neutral-800">{chosenLabel}</span>
              ) : (
                <span className="text-xs text-[color:var(--brand-maroon)]">{selectHint}</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {o.values.map((v) => {
                const available = isValueAvailable(tree, selected, o.id, v.id);
                const active = chosen === v.id;
                const label = isAr && v.value_ar ? v.value_ar : v.value;
                if (colour) {
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!available}
                      onClick={() => onPick(o.id, v.id)}
                      title={label}
                      aria-label={label}
                      aria-pressed={active}
                      className={
                        "relative h-9 w-9 rounded-full border transition " +
                        (active
                          ? "border-transparent ring-2 ring-[color:var(--brand-maroon)] ring-offset-2 "
                          : "border-neutral-300 hover:border-neutral-500 ") +
                        (!available ? "cursor-not-allowed opacity-30 " : "")
                      }
                      style={{ background: v.swatch_hex || "#e5e5e5" }}
                    >
                      {!available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-px w-[120%] rotate-45 bg-neutral-500/70" />
                        </span>
                      )}
                    </button>
                  );
                }
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!available}
                    onClick={() => onPick(o.id, v.id)}
                    aria-pressed={active}
                    className={
                      "min-w-[2.75rem] rounded-lg border px-3 py-2 text-sm font-medium transition " +
                      (active
                        ? "border-[color:var(--brand-maroon)] bg-[color:var(--brand-maroon)]/5 text-[color:var(--brand-maroon)] "
                        : available
                          ? "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400 "
                          : "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 line-through ")
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrustRow({ icon, title, sub, className = "" }: { icon: ReactNode; title: string; sub: string; className?: string }) {
  return (
    <div className={"group flex items-center gap-3 rounded-xl px-3.5 py-3.5 transition-colors duration-200 hover:bg-white " + className}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--brand-maroon)]/[0.12] to-[color:var(--brand-maroon)]/[0.04] text-[color:var(--brand-maroon)] ring-1 ring-inset ring-[color:var(--brand-maroon)]/10 shadow-sm transition-transform duration-200 group-hover:scale-[1.06]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-tight text-neutral-900">{title}</p>
        <p className="mt-0.5 truncate text-[11px] leading-tight text-neutral-500">{sub}</p>
      </div>
    </div>
  );
}

function VerifiedBadge() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-green-200 transition-colors"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        Verified
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-50 w-64 rounded-xl border border-green-200 bg-white p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <p className="text-sm font-bold text-neutral-900">UAQ Deals Verified</p>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">This used item has been manually reviewed and verified by the UAQ Deals team. The condition, details, and pricing have been checked before listing.</p>
          </div>
        </>
      )}
    </div>
  );
}
