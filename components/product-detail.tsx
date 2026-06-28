"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Smartphone, ShoppingCart, Tag, Store, Star, ChevronDown , FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { aed } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { PrescriptionUploadModal } from "@/components/prescription-upload-modal";

type Product = {
  id: string; name: string; description: string | null;
  price: number; sale_price: number | null;
  thumbnail_url: string | null; images: string[];
  variants: Array<{ name: string; options: string[] }>;
  stock_quantity: number | null; track_stock: boolean;
  requires_prescription: boolean; vendor_id: string | null; brand: string | null;
  unit: string | null; vendor_name: string | null; condition?: string | null;
  average_rating: number | null; review_count: number;
};

type Review = {
  id: string; rating: number; comment: string | null;
  created_at: string; reviewer_name: string | null; reviewer_avatar: string | null;
};

export function ProductDetail({ product: p, reviews: initialReviews = [] }: { product: Product; reviews?: Review[] }) {
  const t = useTranslations("product");
  const tc = useTranslations("common");

  const gallery = useMemo(() => {
    const set: string[] = [];
    if (p.thumbnail_url) set.push(p.thumbnail_url);
    for (const u of p.images) if (u && !set.includes(u)) set.push(u);
    return set;
  }, [p.thumbnail_url, p.images]);

  const [activeImg, setActiveImg] = useState(0);
  const [picked, setPicked] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of p.variants ?? []) {
      if (v?.name && Array.isArray(v.options) && v.options.length) init[v.name] = v.options[0];
    }
    return init;
  });
  const [qty, setQty] = useState(1);
  const { add } = useCart();
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
      if (!user) { toast.error("Please sign in to leave a review"); return; }
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
      toast.success("Review submitted! It will appear after approval.");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  }

  const hasSale = p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price;
  const unitPrice = hasSale ? (p.sale_price as number) : p.price;
  const discountPct = hasSale ? Math.round(((p.price - (p.sale_price as number)) / p.price) * 100) : 0;
  const oos = p.track_stock && (p.stock_quantity == null || p.stock_quantity <= 0);
  const lowStock = p.track_stock && p.stock_quantity != null && p.stock_quantity > 0 && p.stock_quantity <= 5;
  const isRx = p.requires_prescription;
  const canAdd = !oos && (!isRx || rxUploaded);

  const variantSummary = Object.entries(picked).map(([k, v]) => `${k}: ${v}`).join(", ");
  const lineId = p.id + (variantSummary ? "::" + variantSummary.replace(/\s+/g, "_") : "");

  function handleAdd() {
    if (!canAdd) return;
    add({ id: lineId, product_id: p.id, name: p.name, price: unitPrice, original_price: hasSale ? p.price : null, image: gallery[0] ?? null, variant: variantSummary || null, vendor_name: p.vendor_name }, qty);
    toast.success(t("added", { qty, name: p.name }));
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white">
          <div className="relative aspect-square bg-neutral-100">
            {gallery[activeImg] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gallery[activeImg]} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-16 w-16" /></div>
            )}
            {discountPct > 0 && <span className="bg-brand-gradient absolute start-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white">-{discountPct}%</span>}
          </div>
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((src, i) => (
              <button key={src + i} onClick={() => setActiveImg(i)}
                className={"h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition " + (i === activeImg ? "border-[color:var(--brand-maroon)]" : "border-transparent opacity-70 hover:opacity-100")}
                aria-label={`Image ${i + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {p.condition === "used" && (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-black tracking-widest text-amber-700 uppercase">Used Item</span>
            <VerifiedBadge />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{p.name}</h1>

        {(p.vendor_name || p.brand) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
            {p.vendor_name && <span className="inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5" />{p.vendor_name}</span>}
            {p.brand && <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />{p.brand}</span>}
          </div>
        )}

        <div className="mt-5 flex items-end gap-3">
          <span className="text-3xl font-extrabold text-[color:var(--brand-maroon)]">{aed(unitPrice)}</span>
          {hasSale && <span className="text-base text-neutral-500 line-through">{aed(p.price)}</span>}
          {p.unit && <span className="text-xs text-neutral-500">/ {p.unit}</span>}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {isRx && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{t("prescriptionRequired")}</span>}
          {oos && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">{tc("outOfStock")}</span>}
          {!oos && lowStock && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{tc("onlyLeft", { count: p.stock_quantity! })}</span>}
          {!oos && !isRx && !lowStock && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{tc("inStock")}</span>}
        </div>

        {p.variants?.length > 0 && (
          <div className="mt-6 space-y-4">
            {p.variants.map((v) => (
              <div key={v.name}>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{v.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {v.options.map((opt) => {
                    const active = picked[v.name] === opt;
                    return (
                      <button key={opt} onClick={() => setPicked((s) => ({ ...s, [v.name]: opt }))}
                        className={"rounded-full border px-3 py-1.5 text-sm font-medium transition " + (active ? "border-[color:var(--brand-maroon)] bg-[color:var(--brand-maroon)] text-white" : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400")}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-stretch gap-3">
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="inline-flex h-11 w-11 items-center justify-center text-neutral-700 hover:bg-neutral-100" aria-label="−"><Minus className="h-4 w-4" /></button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="inline-flex h-11 w-11 items-center justify-center text-neutral-700 hover:bg-neutral-100" aria-label="+"><Plus className="h-4 w-4" /></button>
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
          ) : (
            <button disabled className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-500">{tc("outOfStock")}</button>
          )}
        </div>

        {rxOpen && userId && (
        <PrescriptionUploadModal
          productId={p.id}
          vendorId={(p as any).vendor_id ?? null}
          productName={p.name}
          userId={userId}
          onSuccess={() => setRxUploaded(true)}
          onClose={() => setRxOpen(false)}
        />
      )}

      {p.description && (
          <div className="mt-8 border-t border-[color:var(--brand-border)] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("description")}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{p.description}</p>
          </div>
        )}

        <p className="mt-8 text-xs text-neutral-500">
          {t("needHelp")}{" "}
          <Link href="/contact" className="font-semibold text-[color:var(--brand-maroon)] hover:underline">{t("contactUs")}</Link>
        </p>
      </div>

      {/* ── Reviews section ──────────────────────────────────────────── */}
      <div className="md:col-span-2 border-t border-[color:var(--brand-border)] pt-8 mt-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Customer Reviews</h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-neutral-500">({p.review_count} review{p.review_count !== 1 ? "s" : ""})</span>
              </div>
            )}
          </div>
          {!reviewSubmitted && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 border border-[color:var(--brand-maroon)] text-[color:var(--brand-maroon)] px-4 py-2 text-sm font-semibold hover:bg-[color:var(--brand-maroon)] hover:text-white transition-colors"
            >
              <Star className="w-4 h-4" /> Write a Review
            </button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && !reviewSubmitted && (
          <div className="mb-8 border border-[color:var(--brand-border)] p-5 bg-neutral-50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">Your Review</h3>
            {/* Star picker */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setReviewRating(i + 1)}>
                  <Star className={`w-7 h-7 transition-colors ${i < reviewRating ? "fill-amber-400 text-amber-400" : "text-neutral-300 hover:text-amber-300"}`} />
                </button>
              ))}
              <span className="ms-2 text-sm text-neutral-500">{reviewRating} star{reviewRating !== 1 ? "s" : ""}</span>
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this product (optional)"
              rows={3}
              className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                disabled={reviewSubmitting}
                className="bg-neutral-900 text-white text-sm font-bold px-6 py-2.5 hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting…" : "Submit Review"}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="border border-neutral-200 text-sm font-semibold px-6 py-2.5 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {reviewSubmitted && (
          <div className="mb-6 bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium flex items-center gap-2">
            <Star className="w-4 h-4" /> Thank you! Your review will appear after approval.
          </div>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="py-10 text-center text-neutral-400 text-sm border border-dashed border-neutral-200">
            No reviews yet. Be the first to review this product!
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
                      <p className="text-sm font-semibold">{r.reviewer_name ?? "Customer"}</p>
                      <p className="text-xs text-neutral-400">{new Date(r.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}</p>
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
