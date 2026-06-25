"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

type Product = Record<string, any>;
type Category = { id: string; name: string; is_approved: boolean | null };

export function VendorProductsManager({
  vendorId,
  vendorTypeId,
  initialProducts,
  initialCategories,
}: {
  vendorId: string;
  vendorTypeId: string | null;
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // form state
  const [form, setForm] = useState<Product>({});
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [selCatId, setSelCatId] = useState<string | null>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const filtered = products.filter((p) =>
    !search || (p.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm({ status: "active", stock_quantity: 0, unit: "piece" });
    setThumbFile(null);
    setSelCatId(null);
    setAddingCat(false);
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ ...p });
    setThumbFile(null);
    setSelCatId(p.category_id ?? null);
    setAddingCat(false);
    setDialogOpen(true);
  }

  async function addCategory() {
    const name = newCatName.trim();
    if (!name || !vendorTypeId) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-5);
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name, slug, vendor_type_id: vendorTypeId,
        is_approved: false, created_by_vendor_id: vendorId,
      })
      .select("id, name, is_approved")
      .single();
    if (error) { toast.error(error.message); return; }
    setCategories((prev) => [...prev, data as Category]);
    setSelCatId(data.id);
    setAddingCat(false);
    setNewCatName("");
    toast.success(`"${name}" added — pending admin review`);
  }

  async function uploadThumb(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${vendorId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("products").upload(path, file, { upsert: true });
    if (error) { toast.error("Image upload failed: " + error.message); return null; }
    return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
  }

  async function save() {
    if (!form.name?.trim()) { toast.error("Product name is required"); return; }
    if (form.price == null || form.price === "") { toast.error("Price is required"); return; }
    setSaving(true);
    try {
      let thumbUrl = form.thumbnail_url ?? null;
      if (thumbFile) {
        const url = await uploadThumb(thumbFile);
        if (url) thumbUrl = url;
      }

      const payload: Product = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        price: parseFloat(form.price) || 0,
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity, 10) : 0,
        unit: form.unit?.trim() || "piece",
        brand: form.brand?.trim() || null,
        sku: form.sku?.trim() || null,
        status: form.status || "active",
        category_id: selCatId,
        vendor_id: vendorId,
        thumbnail_url: thumbUrl,
      };
      if (thumbUrl) payload.images = [thumbUrl];

      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-5);
        const { error } = await supabase.from("products").insert({ ...payload, slug });
        if (error) throw error;
        toast.success("Product created");
      }
      setDialogOpen(false);
      router.refresh();
      // optimistic refresh
      const { data } = await supabase
        .from("products").select("*, categories(name)")
        .eq("vendor_id", vendorId).order("created_at", { ascending: false });
      if (data) setProducts(data);
    } catch (e: any) {
      toast.error(e.message ?? "Could not save product");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Product) {
    const next = p.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("products").update({ status: next }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: next } : x));
    toast.success(next === "active" ? "Activated" : "Deactivated");
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Product deleted");
  }

  // ---- Bulk CSV ----
  async function generateDescription() {
    const hasNew = !!thumbFile;
    const hasExisting = !!form.thumbnail_url;
    if (!hasNew && !hasExisting) {
      toast.error("Please add a product photo first");
      return;
    }
    setAiBusy(true);
    try {
      const payload: Record<string, any> = {};
      if (hasNew) {
        const b64: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(thumbFile as File);
        });
        payload.imageBase64 = b64;
        payload.mediaType = (thumbFile as File).type || "image/jpeg";
      } else {
        payload.imageUrl = form.thumbnail_url;
      }
      const catName = categories.find((c) => c.id === selCatId)?.name;
      if (catName) payload.categoryHint = catName;

      const { data, error } = await supabase.functions.invoke("generate-product-description", { body: payload });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Generation failed");

      const title = (data.title ?? "").toString();
      const longDesc = (data.long_description ?? "").toString();
      const shortDesc = (data.short_description ?? "").toString();
      const tags = Array.isArray(data.tags) ? data.tags.join(", ") : "";
      const desc = longDesc || shortDesc;

      setForm((prev) => ({
        ...prev,
        name: (prev.name && prev.name.trim()) ? prev.name : title,
        description: desc ? (tags ? desc + "\n\nTags: " + tags : desc) : prev.description,
      }));
      toast.success("Description generated! Review and edit before saving.");
    } catch (e: any) {
      toast.error("AI error: " + (e.message ?? "Could not generate"));
    } finally {
      setAiBusy(false);
    }
  }

  const CSV_COLS = ["name","description","price","sale_price","cost_price","sku","barcode","stock_quantity","unit","brand","tags","image_urls","status"];

  function downloadCsv(filename: string, rows: string[][]) {
    const csv = rows.map((r) => r.map((c) => {
      const v = (c ?? "").toString();
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadTemplate() {
    downloadCsv("products_template.csv", [CSV_COLS, [
      "Sample Earphone","Wireless earphones","199","149","120","EAR-001","123456","50","piece","Sony","audio,wireless","https://example.com/img.jpg","active",
    ]]);
    toast.success("Template downloaded");
  }

  function exportProducts() {
    if (products.length === 0) { toast.error("No products to export"); return; }
    const rows = [CSV_COLS];
    for (const p of products) {
      rows.push([
        p.name ?? "", p.description ?? "", p.price?.toString() ?? "", p.sale_price?.toString() ?? "",
        p.cost_price?.toString() ?? "", p.sku ?? "", p.barcode ?? "", p.stock_quantity?.toString() ?? "",
        p.unit ?? "", p.brand ?? "", Array.isArray(p.tags) ? p.tags.join(",") : "",
        Array.isArray(p.images) ? p.images.join(",") : "", p.status ?? "active",
      ]);
    }
    downloadCsv("products_export.csv", rows);
    toast.success(`Exported ${products.length} products`);
  }

  function parseCsv(text: string): string[][] {
    const rows: string[][] = []; let cur: string[] = []; let f = ""; let q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i+1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else { if (c === '"') q = true; else if (c === ",") { cur.push(f); f = ""; }
        else if (c === "\n" || c === "\r") { if (c === "\r" && text[i+1] === "\n") i++; cur.push(f); f = ""; if (cur.some(x=>x.trim())) rows.push(cur); cur = []; }
        else f += c; }
    }
    if (f !== "" || cur.length) { cur.push(f); if (cur.some(x=>x.trim())) rows.push(cur); }
    return rows;
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (importRef.current) importRef.current.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const rows = parseCsv(await file.text());
      if (rows.length < 2) { toast.error("CSV has no data rows"); setImporting(false); return; }
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const idx = (n: string) => header.indexOf(n);
      const records: Product[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const g = (n: string) => { const i = idx(n); return i >= 0 ? (row[i] ?? "").trim() : ""; };
        if (!g("name") || !g("price")) continue;
        const tags = g("tags"); const imgs = g("image_urls");
        records.push({
          name: g("name"),
          slug: g("name").toLowerCase().replace(/[^a-z0-9]+/g,"-") + "-" + Math.random().toString(36).slice(2,7),
          description: g("description") || null,
          price: parseFloat(g("price")) || 0,
          sale_price: g("sale_price") ? parseFloat(g("sale_price")) : null,
          cost_price: g("cost_price") ? parseFloat(g("cost_price")) : null,
          sku: g("sku") || null, barcode: g("barcode") || null,
          stock_quantity: g("stock_quantity") ? parseInt(g("stock_quantity"),10) : 0,
          unit: g("unit") || null, brand: g("brand") || null,
          tags: tags ? tags.split(",").map(t=>t.trim()).filter(Boolean) : null,
          images: imgs ? imgs.split(",").map(u=>u.trim()).filter(Boolean) : null,
          status: g("status") || "active",
          vendor_id: vendorId,
        });
      }
      if (records.length === 0) { toast.error("No valid rows (name & price required)"); setImporting(false); return; }
      const { error } = await supabase.from("products").insert(records);
      if (error) throw error;
      toast.success(`Imported ${records.length} products`);
      router.refresh();
      const { data } = await supabase.from("products").select("*, categories(name)").eq("vendor_id", vendorId).order("created_at",{ascending:false});
      if (data) setProducts(data);
    } catch (e: any) {
      toast.error(e.message ?? "Import failed");
    } finally { setImporting(false); }
  }

  const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
        <button onClick={openCreate} className="rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2 text-sm font-semibold text-white">
          + Add Product
        </button>
      </div>

      {/* Bulk */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#8E1B3A]/15 bg-[#8E1B3A]/[0.04] p-3">
        <span className="text-xs font-bold uppercase tracking-wide text-[#8E1B3A]">Bulk Import &amp; Export</span>
        <div className="ml-auto flex gap-2">
          <button onClick={downloadTemplate} className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold">Template (CSV)</button>
          <button onClick={exportProducts} className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold">Export</button>
          <button onClick={() => importRef.current?.click()} disabled={importing} className="rounded-md bg-[#8E1B3A] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
            {importing ? "Importing…" : "Import"}
          </button>
          <input ref={importRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        </div>
      </div>

      <input className={inputCls + " mt-4 max-w-xs"} placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* List */}
      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-neutral-500">
            No products yet. Tap “Add Product” or import a CSV.
          </div>
        ) : filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {p.thumbnail_url ? <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-900">{p.name}</p>
              <p className="text-xs text-neutral-500">
                AED {Number(p.price).toFixed(2)}
                {p.sale_price ? ` · Sale AED ${Number(p.sale_price).toFixed(2)}` : ""}
                {p.categories?.name ? ` · ${p.categories.name}` : ""}
              </p>
            </div>
            <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + (p.status === "active" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500")}>
              {p.status === "active" ? "Active" : "Inactive"}
            </span>
            <button onClick={() => openEdit(p)} className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-semibold">Edit</button>
            <button onClick={() => toggleActive(p)} className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-semibold">{p.status === "active" ? "Hide" : "Show"}</button>
            <button onClick={() => remove(p)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600">Delete</button>
          </div>
        ))}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setDialogOpen(false)}>
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-neutral-900">{editing ? "Edit Product" : "New Product"}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Name *</label>
                <input className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-600">Price (AED) *</label>
                  <input className={inputCls} type="number" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-600">Sale Price</label>
                  <input className={inputCls} type="number" value={form.sale_price ?? ""} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-600">Stock</label>
                  <input className={inputCls} type="number" value={form.stock_quantity ?? ""} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-600">Unit</label>
                  <input className={inputCls} value={form.unit ?? ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="piece" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-600">Description</label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={aiBusy}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}
                  >
                    <Sparkles className="h-3 w-3" />
                    {aiBusy ? "Generating..." : "Generate with AI"}
                  </button>
                </div>
                <textarea className={inputCls} rows={5} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder='Describe your product, or upload a photo and tap "Generate with AI"' />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Category</label>
                {!addingCat ? (
                  <select className={inputCls} value={selCatId ?? ""} onChange={(e) => { if (e.target.value === "__add__") { setAddingCat(true); } else setSelCatId(e.target.value || null); }}>
                    <option value="">No category</option>
                    <option value="__add__">+ Add new category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.is_approved === false ? " (pending)" : ""}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input className={inputCls} autoFocus value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New category name" />
                    <button onClick={addCategory} className="rounded-lg bg-[#8E1B3A] px-3 text-xs font-semibold text-white">Save</button>
                    <button onClick={() => { setAddingCat(false); setNewCatName(""); }} className="rounded-lg border border-neutral-300 px-3 text-xs">Cancel</button>
                  </div>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Main Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)} className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-xs" />
                {(thumbFile || form.thumbnail_url) && (
                  <img src={thumbFile ? URL.createObjectURL(thumbFile) : form.thumbnail_url} alt="" className="mt-2 h-20 w-20 rounded-lg object-cover" />
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Status</label>
                <select className={inputCls} value={form.status ?? "active"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setDialogOpen(false)} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-semibold">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
