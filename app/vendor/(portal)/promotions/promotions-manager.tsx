"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Tag, Star, Image as ImageIcon, Search, ArrowLeftRight,
  TrendingUp, Plus, X, Loader2, ChevronLeft, Trash2,
} from "lucide-react";

type AdProduct = {
  id: string; key: string; name: string; description: string;
  icon: string; price: number; pricing_model: string; sort_order: number;
};
type Deal = Record<string, any>;
type Product = { id: string; name: string; price: number; thumbnail_url: string | null };

const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";
const labelCls = "block text-xs font-medium text-neutral-600 mb-1";
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-neutral-100 text-neutral-500",
  expired: "bg-neutral-100 text-neutral-400",
  rejected: "bg-red-100 text-red-700",
};

function IconFor({ k, size = 20 }: { k: string; size?: number }) {
  const props = { size, className: "text-[#8E1B3A]" };
  switch (k) {
    case "deal": return <Tag {...props} />;
    case "featured_product": return <Star {...props} />;
    case "banner": return <ImageIcon {...props} />;
    case "sponsored_search": return <Search {...props} />;
    case "cross_sell": return <ArrowLeftRight {...props} />;
    case "up_sell": return <TrendingUp {...props} />;
    default: return <Tag {...props} />;
  }
}

export function PromotionsManager({ vendorId }: { vendorId: string }) {
  const supabase = createClient();
  const [adProducts, setAdProducts] = useState<AdProduct[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"hub" | "list" | "form">("hub");
  const [activeType, setActiveType] = useState<AdProduct | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  useEffect(() => { init(); }, []);

  async function init() {
    setLoading(true);
    const [{ data: ap }, { data: dl }, { data: pr }] = await Promise.all([
      supabase.from("ad_products").select().eq("is_active", true).eq("vendor_self_serve", true).order("sort_order"),
      supabase.from("deals").select().eq("vendor_id", vendorId).order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, price, thumbnail_url").eq("vendor_id", vendorId).eq("status", "active"),
    ]);
    setAdProducts((ap ?? []) as AdProduct[]);
    setDeals(dl ?? []);
    setProducts((pr ?? []) as Product[]);
    setLoading(false);
  }

  function openList(type: AdProduct) { setActiveType(type); setView("list"); }
  function openForm(type: AdProduct, deal?: Deal) { setActiveType(type); setEditingDeal(deal ?? null); setView("form"); }

  function dealsForType(key: string) { return deals.filter(d => (d.promotion_type ?? "deal") === key); }

  function priceLabel(ap: AdProduct) {
    if (!ap.price) return "Free";
    const suffix = ap.pricing_model === "per_day" ? "/day" : ap.pricing_model === "cpm" ? "/1k views" : ap.pricing_model === "cpc" ? "/click" : "";
    return `AED ${ap.price}${suffix}`;
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8E1B3A]" size={24} /></div>;

  if (view === "list" && activeType) {
    const typedDeals = dealsForType(activeType.key);
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("hub")} className="text-neutral-400 hover:text-neutral-700"><ChevronLeft size={20} /></button>
          <h1 className="text-xl font-bold">{activeType.name}</h1>
          <button onClick={() => openForm(activeType)} className="ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-3 py-2 text-sm font-semibold text-white">
            <Plus size={14} /> New
          </button>
        </div>
        {typedDeals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
            No {activeType.name.toLowerCase()} promotions yet. Tap New to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {typedDeals.map(d => (
              <DealCard key={d.id} deal={d} onEdit={() => openForm(activeType, d)}
                onDeleted={() => setDeals(prev => prev.filter(x => x.id !== d.id))} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "form" && activeType) {
    return (
      <PromoForm vendorId={vendorId} adProduct={activeType} deal={editingDeal} products={products}
        onBack={() => setView("list")}
        onSaved={(saved) => {
          setDeals(prev => editingDeal ? prev.map(d => d.id === saved.id ? saved : d) : [saved, ...prev]);
          setView("list");
        }} />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Promotions</h1>
        <p className="mt-1 text-sm text-neutral-500">Boost your visibility across UAQ Deals</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {adProducts.map(ap => {
          const count = dealsForType(ap.key).length;
          const active = dealsForType(ap.key).filter(d => d.status === "active").length;
          return (
            <button key={ap.id} onClick={() => openList(ap)}
              className="flex flex-col items-start rounded-2xl border border-neutral-200 bg-white p-4 text-left transition hover:border-[#8E1B3A]/30 hover:shadow-sm">
              <div className="flex w-full items-start justify-between">
                <div className="rounded-xl bg-[#8E1B3A]/[0.08] p-2.5"><IconFor k={ap.key} /></div>
                {count > 0 && (
                  <span className="rounded-full bg-[#8E1B3A]/10 px-2 py-0.5 text-[10px] font-bold text-[#8E1B3A]">
                    {active > 0 ? `${active} live` : `${count} pending`}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm font-bold text-neutral-900">{ap.name}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-neutral-500">{ap.description}</p>
              <div className="mt-3 flex w-full items-center justify-between">
                <span className="rounded-full bg-[#8E1B3A]/[0.08] px-2.5 py-1 text-[11px] font-bold text-[#8E1B3A]">{priceLabel(ap)}</span>
                <ChevronLeft size={14} className="rotate-180 text-neutral-300" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DealCard({ deal: d, onEdit, onDeleted }: { deal: Deal; onEdit: () => void; onDeleted: () => void }) {
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!confirm("Delete this promotion?")) return;
    setDeleting(true);
    const { error } = await supabase.from("deals").delete().eq("id", d.id);
    if (error) { toast.error(error.message); setDeleting(false); return; }
    toast.success("Deleted"); onDeleted();
  }

  const type = d.promotion_type ?? "deal";
  const orig = Number(d.original_price ?? 0);
  const dealP = Number(d.deal_price ?? 0);
  const pct = Number(d.discount_pct ?? 0);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 flex items-center justify-center">
        {d.deal_image_url ? <img src={d.deal_image_url} alt="" className="h-full w-full object-cover" /> : <IconFor k={type} size={20} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900">{d.title}</p>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          {type === "deal" && dealP > 0 && (
            <>
              <span className="text-xs font-bold text-[#8E1B3A]">AED {dealP.toFixed(2)}</span>
              {orig > dealP && <span className="text-xs text-neutral-400 line-through">AED {orig.toFixed(2)}</span>}
              {pct > 0 && <span className="text-xs font-bold text-green-600">-{pct}%</span>}
            </>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_COLORS[d.status] ?? "bg-neutral-100 text-neutral-500"}`}>{d.status}</span>
        </div>
        {(d.starts_at || d.ends_at) && (
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {d.starts_at ? new Date(d.starts_at).toLocaleDateString() : "—"} → {d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "—"}
          </p>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onEdit} className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-semibold">Edit</button>
        <button onClick={remove} disabled={deleting} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 disabled:opacity-40">
          {deleting ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  );
}

function PromoForm({ vendorId, adProduct, deal, products, onBack, onSaved }: {
  vendorId: string; adProduct: AdProduct; deal: Deal | null;
  products: Product[]; onBack: () => void; onSaved: (d: Deal) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(deal?.deal_image_url ?? null);
  const [title, setTitle] = useState(deal?.title ?? "");
  const [description, setDescription] = useState(deal?.description ?? "");
  const [startsAt, setStartsAt] = useState(deal?.starts_at ? deal.starts_at.slice(0, 10) : "");
  const [endsAt, setEndsAt] = useState(deal?.ends_at ? deal.ends_at.slice(0, 10) : "");
  const [productId, setProductId] = useState(deal?.product_id ?? "");
  const [dealPrice, setDealPrice] = useState(deal?.deal_price?.toString() ?? "");
  const [stock, setStock] = useState(deal?.stock_available?.toString() ?? "");
  const [targetProductId, setTargetProductId] = useState(deal?.meta?.product_id ?? deal?.product_id ?? "");
  const [bannerScreens, setBannerScreens] = useState<string[]>(deal?.meta?.screens ?? ["home"]);
  const [keywords, setKeywords] = useState(deal?.meta?.keywords?.join(", ") ?? "");

  const selectedProduct = products.find(p => p.id === productId);
  const originalPrice = selectedProduct?.price ?? 0;
  const dealPriceNum = parseFloat(dealPrice) || 0;
  const discountPct = originalPrice > 0 && dealPriceNum > 0 && dealPriceNum < originalPrice
    ? Math.round((1 - dealPriceNum / originalPrice) * 100) : 0;

  function onProductChange(id: string) {
    setProductId(id);
    const p = products.find(x => x.id === id);
    if (p && !title) setTitle(p.name);
  }

  async function submit() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (adProduct.key === "deal") {
      if (!productId) { toast.error("Select a product"); return; }
      if (!dealPrice || dealPriceNum <= 0) { toast.error("Enter a valid deal price"); return; }
      if (originalPrice > 0 && dealPriceNum >= originalPrice) { toast.error("Deal price must be below original price"); return; }
    }
    if (["featured_product", "cross_sell", "up_sell"].includes(adProduct.key) && !targetProductId) {
      toast.error("Select a product"); return;
    }
    setSaving(true);
    try {
      let imageUrl = deal?.deal_image_url ?? null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${vendorId}/${adProduct.key}/${Date.now()}.${ext}`;
        await supabase.storage.from("deal_images").upload(path, imageFile, { contentType: imageFile.type, upsert: true });
        imageUrl = supabase.storage.from("deal_images").getPublicUrl(path).data.publicUrl;
      }
      if (!imageUrl && adProduct.key === "deal" && selectedProduct?.thumbnail_url) imageUrl = selectedProduct.thumbnail_url;

      const meta: Record<string, any> = {};
      if (adProduct.key === "banner") meta.screens = bannerScreens;
      if (adProduct.key === "sponsored_search") meta.keywords = keywords.split(",").map((k: string) => k.trim()).filter(Boolean);
      if (["cross_sell", "up_sell"].includes(adProduct.key)) meta.product_id = targetProductId;

      const payload: Record<string, any> = {
        vendor_id: vendorId, promotion_type: adProduct.key,
        title: title.trim(), description: description.trim() || null,
        deal_image_url: imageUrl, starts_at: startsAt || null, ends_at: endsAt || null,
        meta, updated_at: new Date().toISOString(),
      };
      if (adProduct.key === "deal") {
        Object.assign(payload, { product_id: productId, original_price: originalPrice, deal_price: dealPriceNum, discount_pct: discountPct, stock_available: stock ? parseInt(stock) : null });
      } else if (["featured_product", "cross_sell", "up_sell"].includes(adProduct.key)) {
        payload.product_id = targetProductId;
        const p = products.find(x => x.id === targetProductId);
        payload.original_price = p?.price ?? null;
      }

      let saved: Deal;
      if (deal) {
        const { data, error } = await supabase.from("deals").update(payload).eq("id", deal.id).select().single();
        if (error) throw error; saved = data;
      } else {
        payload.status = "pending";
        const { data, error } = await supabase.from("deals").insert(payload).select().single();
        if (error) throw error; saved = data;
      }
      toast.success(deal ? "Updated" : "Submitted for review");
      onSaved(saved);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally { setSaving(false); }
  }

  const BANNER_SCREENS = ["home", "category", "cart", "checkout", "search"];
  const isDeal = adProduct.key === "deal";
  const isProductBased = ["featured_product", "cross_sell", "up_sell"].includes(adProduct.key);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-neutral-400 hover:text-neutral-700"><ChevronLeft size={20} /></button>
        <div>
          <h1 className="text-xl font-bold">{deal ? "Edit" : "New"} {adProduct.name}</h1>
          <p className="text-xs text-neutral-500">{adProduct.description}</p>
        </div>
      </div>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className={labelCls}>Banner image {adProduct.key === "banner" ? "*" : "(optional)"}</label>
          <div className="relative h-24 w-full overflow-hidden rounded-xl border bg-neutral-50 cursor-pointer flex items-center justify-center" onClick={() => fileRef.current?.click()}>
            {imagePreview ? <img src={imagePreview} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-neutral-400">Click to upload</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }}} />
        </div>
        {isDeal && (
          <div>
            <label className={labelCls}>Product *</label>
            <select className={inputCls} value={productId} onChange={e => onProductChange(e.target.value)}>
              <option value="">— Select a product —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} · AED {p.price}</option>)}
            </select>
            {originalPrice > 0 && <p className="mt-1 text-xs text-neutral-400">Original price: AED {originalPrice.toFixed(2)}</p>}
          </div>
        )}
        {isProductBased && (
          <div>
            <label className={labelCls}>Product to promote *</label>
            <select className={inputCls} value={targetProductId} onChange={e => setTargetProductId(e.target.value)}>
              <option value="">— Select a product —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} · AED {p.price}</option>)}
            </select>
          </div>
        )}
        <div><label className={labelCls}>Title *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder={isDeal ? "e.g. 30% off Samsung TV" : adProduct.name} /></div>
        <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details" /></div>
        {isDeal && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Deal price (AED) *</label><input className={inputCls} type="number" min="0" step="0.01" value={dealPrice} onChange={e => setDealPrice(e.target.value)} /></div>
            <div className="flex items-end pb-0.5">
              <div className={`rounded-lg px-4 py-2.5 text-sm font-bold w-full text-center ${discountPct > 0 ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-400"}`}>
                {discountPct > 0 ? `-${discountPct}%` : "—"}
              </div>
            </div>
          </div>
        )}
        {isDeal && <div><label className={labelCls}>Stock for this deal (optional)</label><input className={inputCls} type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="Leave blank for unlimited" /></div>}
        {adProduct.key === "banner" && (
          <div>
            <label className={labelCls}>Show on screens *</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {BANNER_SCREENS.map(s => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer text-sm capitalize">
                  <input type="checkbox" className="accent-[#8E1B3A]" checked={bannerScreens.includes(s)}
                    onChange={e => setBannerScreens(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s))} />{s}
                </label>
              ))}
            </div>
          </div>
        )}
        {adProduct.key === "sponsored_search" && (
          <div>
            <label className={labelCls}>Target keywords (comma-separated)</label>
            <input className={inputCls} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. laptop, samsung, headphones" />
            <p className="mt-1 text-xs text-neutral-400">Your product appears at the top when customers search these terms.</p>
          </div>
        )}
        <div>
          <label className={labelCls}>Schedule (optional)</label>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-neutral-400 mb-0.5 block">Starts</label><input className={inputCls} type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></div>
            <div><label className="text-[10px] text-neutral-400 mb-0.5 block">Ends</label><input className={inputCls} type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} /></div>
          </div>
        </div>
        {adProduct.price > 0 && (
          <div className="rounded-xl border border-[#8E1B3A]/15 bg-[#8E1B3A]/[0.04] p-3 text-sm">
            <p className="font-semibold text-[#8E1B3A]">Cost: AED {adProduct.price}{adProduct.pricing_model === "per_day" ? "/day" : ""}</p>
            <p className="text-xs text-neutral-500 mt-0.5">Billing handled by UAQ Deals admin after approval.</p>
          </div>
        )}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
          ⚠️ Promotions are reviewed by our team before going live. You'll be notified once approved.
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onBack} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-2.5 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}{deal ? "Save changes" : "Submit for review"}
          </button>
        </div>
      </div>
    </div>
  );
}
