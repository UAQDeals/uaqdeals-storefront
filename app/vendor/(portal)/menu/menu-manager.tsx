"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, UtensilsCrossed } from "lucide-react";
import { Reveal } from "@/components/reveal";

type Dish = Record<string, any>;

const inputCls = "w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40";
const labelCls = "block text-xs font-medium text-[color:var(--brand-muted)] mb-1.5";

export function MenuManager({ vendorId }: { vendorId: string }) {
  const supabase = createClient();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);

  useEffect(() => { fetchDishes(); }, []);

  async function fetchDishes() {
    setLoading(true);
    const { data } = await supabase.from("products").select().eq("vendor_id", vendorId).order("created_at", { ascending: false });
    if (data) setDishes(data);
    setLoading(false);
  }

  async function toggleStatus(dish: Dish) {
    const next = dish.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("products").update({ status: next }).eq("id", dish.id);
    if (error) { toast.error(error.message); return; }
    setDishes(d => d.map(x => x.id === dish.id ? { ...x, status: next } : x));
  }

  async function remove(dish: Dish) {
    if (!confirm(`Remove "${dish.name}" from menu?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", dish.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Item removed");
    setDishes(d => d.filter(x => x.id !== dish.id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <div>
            <p className="eyebrow">UAQ Deals</p>
            <h1 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">Menu</h1>
          </div>
        </div>
        <button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-brand-gradient flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[color:var(--brand-maroon)]" size={26} /></div>
      ) : dishes.length === 0 ? (
        <div className="premium-card mt-6 p-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)]">
            <UtensilsCrossed className="h-8 w-8 text-[color:var(--brand-maroon)]" />
          </div>
          <p className="font-display text-lg font-semibold text-[color:var(--ink)]">No menu items yet.</p>
          <p className="mt-1 text-sm text-[color:var(--brand-muted)]">Add your first dish to get started.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {dishes.map((dish, i) => (
            <Reveal key={dish.id} delay={Math.min(i, 8) * 40}>
            <div className="premium-card flex items-center gap-3 p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[color:var(--paper-2)]">
                {dish.thumbnail_url ? <img src={dish.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <UtensilsCrossed size={20} className="m-auto mt-3.5 text-neutral-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[color:var(--ink)]">{dish.name}</p>
                <p className="text-xs text-[color:var(--brand-muted)]">
                  <span className="font-bold text-[color:var(--brand-maroon)]">AED {Number(dish.price).toFixed(2)}</span>
                  {dish.sale_price ? ` · Sale AED ${Number(dish.sale_price).toFixed(2)}` : ""}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${dish.status === "active" ? "bg-green-50 text-green-700 ring-1 ring-green-200" : "bg-[color:var(--paper-2)] text-[color:var(--brand-muted)] ring-1 ring-[color:var(--brand-border)]"}`}>
                {dish.status === "active" ? "Available" : "Unavailable"}
              </span>
              <button onClick={() => toggleStatus(dish)} className="rounded-full border border-[color:var(--brand-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)]">
                {dish.status === "active" ? "Hide" : "Show"}
              </button>
              <button onClick={() => { setEditing(dish); setDialogOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--brand-border)] text-[color:var(--ink)] transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)]"><Pencil size={13} /></button>
              <button onClick={() => remove(dish)} className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-[color:var(--brand-red)] transition hover:bg-red-50"><Trash2 size={13} /></button>
            </div>
            </Reveal>
          ))}
        </div>
      )}

      {dialogOpen && (
        <DishDialog
          vendorId={vendorId}
          dish={editing}
          onClose={() => setDialogOpen(false)}
          onSaved={(saved) => {
            setDishes(prev => editing ? prev.map(d => d.id === saved.id ? saved : d) : [saved, ...prev]);
            setDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}

function DishDialog({ vendorId, dish, onClose, onSaved }: {
  vendorId: string; dish: Dish | null; onClose: () => void; onSaved: (d: Dish) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(dish?.thumbnail_url ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: dish?.name ?? "",
    description: dish?.description ?? "",
    price: dish?.price?.toString() ?? "",
    sale_price: dish?.sale_price?.toString() ?? "",
    status: dish?.status ?? "active",
  });

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function submit() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Enter a valid price"); return; }
    setSaving(true);
    try {
      let thumbUrl = dish?.thumbnail_url ?? null;
      if (imageFile) {
        const { data: { user } } = await supabase.auth.getUser();
        const ext = imageFile.name.split(".").pop();
        const path = `${vendorId}/${Date.now()}.${ext}`;
        const bytes = await supabase.storage.from("products").upload(path, imageFile, { contentType: imageFile.type, upsert: true });
        thumbUrl = supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
      }
      const payload: any = {
        vendor_id: vendorId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        status: form.status,
        ...(thumbUrl ? { thumbnail_url: thumbUrl, images: [thumbUrl] } : {}),
      };
      let saved: Dish;
      if (dish) {
        const { data, error } = await supabase.from("products").update(payload).eq("id", dish.id).select().single();
        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await supabase.from("products").insert({ ...payload, currency: "AED", condition: "new" }).select().single();
        if (error) throw error;
        saved = data;
      }
      toast.success(dish ? "Item updated" : "Item added");
      onSaved(saved);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="premium-card relative max-h-[90vh] w-full max-w-md overflow-y-auto p-6 shadow-[var(--shadow-premium)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[color:var(--ink)]">{dish ? "Edit item" : "Add menu item"}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--brand-border)] text-[color:var(--brand-muted)] transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)]"><X size={18} /></button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--paper-2)] transition hover:border-[color:var(--brand-gold)]" onClick={() => fileRef.current?.click()}>
            {imagePreview ? <img src={imagePreview} alt="" className="h-full w-full object-cover" /> : <Plus size={20} className="text-neutral-300" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--ink)]">Dish photo</p>
            <button onClick={() => fileRef.current?.click()} className="mt-1 text-xs font-semibold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]">Upload photo</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>
        </div>

        <div className="space-y-3.5">
          <div><label className={labelCls}>Name *</label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Chicken Shawarma" /></div>
          <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Ingredients, allergens, etc." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Price (AED) *</label><input className={inputCls} type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} /></div>
            <div><label className={labelCls}>Sale price</label><input className={inputCls} type="number" min="0" step="0.01" value={form.sale_price} onChange={e => set("sale_price", e.target.value)} /></div>
          </div>
          <div>
            <label className={labelCls}>Availability</label>
            <select className={inputCls} value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="active">Available</option>
              <option value="inactive">Unavailable</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]">Cancel</button>
          <button onClick={submit} disabled={saving} className="bg-brand-gradient flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}{dish ? "Save changes" : "Add item"}
          </button>
        </div>
      </div>
    </div>
  );
}
