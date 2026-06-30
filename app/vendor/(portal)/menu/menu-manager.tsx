"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, UtensilsCrossed } from "lucide-react";

type Dish = Record<string, any>;

const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";
const labelCls = "block text-xs font-medium text-neutral-600 mb-1";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Menu</h1>
        <button onClick={() => { setEditing(null); setDialogOpen(true); }} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8E1B3A]" size={24} /></div>
      ) : dishes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-neutral-500">
          No menu items yet. Add your first dish to get started.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {dishes.map(dish => (
            <div key={dish.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {dish.thumbnail_url ? <img src={dish.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <UtensilsCrossed size={20} className="m-auto mt-3 text-neutral-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{dish.name}</p>
                <p className="text-xs text-neutral-500">
                  AED {Number(dish.price).toFixed(2)}
                  {dish.sale_price ? ` · Sale AED ${Number(dish.sale_price).toFixed(2)}` : ""}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${dish.status === "active" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                {dish.status === "active" ? "Available" : "Unavailable"}
              </span>
              <button onClick={() => toggleStatus(dish)} className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-semibold">
                {dish.status === "active" ? "Hide" : "Show"}
              </button>
              <button onClick={() => { setEditing(dish); setDialogOpen(true); }} className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-semibold"><Pencil size={12} /></button>
              <button onClick={() => remove(dish)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600"><Trash2 size={12} /></button>
            </div>
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
        const bytes = await imageFile.arrayBuffer();
        await supabase.storage.from("products").uploadBinary(path, new Uint8Array(bytes), { contentType: imageFile.type, upsert: true });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{dish ? "Edit item" : "Add menu item"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-neutral-50 flex items-center justify-center cursor-pointer" onClick={() => fileRef.current?.click()}>
            {imagePreview ? <img src={imagePreview} alt="" className="h-full w-full object-cover" /> : <Plus size={20} className="text-neutral-300" />}
          </div>
          <div>
            <p className="text-sm font-medium">Dish photo</p>
            <button onClick={() => fileRef.current?.click()} className="mt-1 text-xs text-[#8E1B3A] font-medium">Upload photo</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>
        </div>

        <div className="space-y-3">
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

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-2.5 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}{dish ? "Save changes" : "Add item"}
          </button>
        </div>
      </div>
    </div>
  );
}
