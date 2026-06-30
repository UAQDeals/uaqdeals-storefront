"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Tag } from "lucide-react";

type Deal = Record<string, any>;
type Product = { id: string; name: string; price: number; thumbnail_url: string | null };

const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";
const labelCls = "block text-xs font-medium text-neutral-600 mb-1";

export function PromotionsManager({ vendorId }: { vendorId: string }) {
  const supabase = createClient();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);

  useEffect(() => { fetchDeals(); fetchProducts(); }, []);

  async function fetchDeals() {
    setLoading(true);
    const { data } = await supabase.from("deals").select().eq("vendor_id", vendorId).order("created_at", { ascending: false });
    if (data) setDeals(data);
    setLoading(false);
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("id, name, price, thumbnail_url").eq("vendor_id", vendorId).eq("status", "active");
    if (data) setProducts(data as Product[]);
  }

  async function remove(deal: Deal) {
    if (!confirm(`Delete "${deal.title}"?`)) return;
    const { error } = await supabase.from("deals").delete().eq("id", deal.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deal deleted");
    setDeals(d => d.filter(x => x.id !== deal.id));
  }

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(deal: Deal) { setEditing(deal); setDialogOpen(true); }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Promotions</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> New Deal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8E1B3A]" size={24} /></div>
      ) : deals.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-neutral-500">
          No deals yet. Create your first promotion to attract customers.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {deals.map(deal => (
            <div key={deal.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {deal.image_url ? <img src={deal.image_url} alt="" className="h-full w-full object-cover" /> : <Tag size={20} className="m-auto mt-3 text-neutral-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{deal.title}</p>
                <p className="text-xs text-neutral-500">
                  {deal.discount_type === "percentage" ? `${deal.discount_value}% off` : `AED ${deal.discount_value} off`}
                  {deal.expires_at ? ` · Expires ${new Date(deal.expires_at).toLocaleDateString()}` : ""}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${deal.is_active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                {deal.is_active ? "Active" : "Inactive"}
              </span>
              <button onClick={() => openEdit(deal)} className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-semibold"><Pencil size={12} /></button>
              <button onClick={() => remove(deal)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}

      {dialogOpen && (
        <DealDialog
          vendorId={vendorId}
          products={products}
          deal={editing}
          onClose={() => setDialogOpen(false)}
          onSaved={(saved) => {
            setDeals(prev => editing ? prev.map(d => d.id === saved.id ? saved : d) : [saved, ...prev]);
            setDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}

function DealDialog({ vendorId, products, deal, onClose, onSaved }: {
  vendorId: string; products: Product[]; deal: Deal | null;
  onClose: () => void; onSaved: (d: Deal) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(deal?.image_url ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: deal?.title ?? "",
    description: deal?.description ?? "",
    discount_type: deal?.discount_type ?? "percentage",
    discount_value: deal?.discount_value?.toString() ?? "",
    product_id: deal?.product_id ?? "",
    expires_at: deal?.expires_at ? deal.expires_at.slice(0, 10) : "",
    is_active: deal?.is_active ?? true,
  });

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function submit() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.discount_value || isNaN(Number(form.discount_value))) { toast.error("Enter a valid discount value"); return; }
    setSaving(true);
    try {
      let imageUrl = deal?.image_url ?? null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${vendorId}/${Date.now()}.${ext}`;
        const bytes = await imageFile.arrayBuffer();
        await supabase.storage.from("deal_images").uploadBinary(path, new Uint8Array(bytes), { contentType: imageFile.type, upsert: true });
        imageUrl = supabase.storage.from("deal_images").getPublicUrl(path).data.publicUrl;
      }
      const payload = {
        vendor_id: vendorId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        product_id: form.product_id || null,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      };
      let saved: Deal;
      if (deal) {
        const { data, error } = await supabase.from("deals").update(payload).eq("id", deal.id).select().single();
        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await supabase.from("deals").insert(payload).select().single();
        if (error) throw error;
        saved = data;
      }
      toast.success(deal ? "Deal updated" : "Deal created");
      onSaved(saved);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save deal");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{deal ? "Edit Deal" : "New Deal"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
        </div>

        {/* Image */}
        <div className="mb-4 flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-neutral-50 flex items-center justify-center cursor-pointer" onClick={() => fileRef.current?.click()}>
            {imagePreview ? <img src={imagePreview} alt="" className="h-full w-full object-cover" /> : <Plus size={20} className="text-neutral-300" />}
          </div>
          <div>
            <p className="text-sm font-medium">Deal image</p>
            <button onClick={() => fileRef.current?.click()} className="mt-1 text-xs text-[#8E1B3A] font-medium">Upload image</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>
        </div>

        <div className="space-y-3">
          <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. 20% off all laptops" /></div>
          <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional details" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Discount type</label>
              <select className={inputCls} value={form.discount_type} onChange={e => set("discount_type", e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (AED)</option>
              </select>
            </div>
            <div><label className={labelCls}>Value *</label><input className={inputCls} type="number" min="0" value={form.discount_value} onChange={e => set("discount_value", e.target.value)} placeholder={form.discount_type === "percentage" ? "e.g. 20" : "e.g. 50"} /></div>
          </div>
          <div>
            <label className={labelCls}>Linked product (optional)</label>
            <select className={inputCls} value={form.product_id} onChange={e => set("product_id", e.target.value)}>
              <option value="">— None (store-wide) —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} · AED {p.price}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Expires on</label><input className={inputCls} type="date" value={form.expires_at} onChange={e => set("expires_at", e.target.value)} /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="accent-[#8E1B3A]" />
            <span className="text-sm">Active (visible to customers)</span>
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-2.5 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}{deal ? "Save changes" : "Create deal"}
          </button>
        </div>
      </div>
    </div>
  );
}
