"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Search as SearchIcon, X, Loader2, PackagePlus } from "lucide-react";

type CatalogItem = {
  id: string;
  gtin: string | null;
  brand: string | null;
  title: string;
  uaq_slug: string | null;
  icecat_category: string | null;
  main_image_url: string | null;
  brand_product_code: string | null;
};

export function CatalogSearch({
  vendorId,
  onAdded,
}: {
  vendorId: string;
  onAdded?: () => void; // call your existing fetchProducts()-style refresh here
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<CatalogItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query.trim()), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function runSearch(q: string) {
    setSearching(true);
    const { data, error } = await supabase.rpc("search_catalog", {
      p_query: q,
      p_limit: 30,
    });
    setSearching(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setResults((data as CatalogItem[]) ?? []);
  }

  function closeAll() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setPicked(null);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-[color:var(--brand-maroon)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-maroon)] transition hover:bg-[color:var(--brand-maroon)]/[0.06]"
      >
        <PackagePlus size={16} />
        Add from Catalog
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAll} />

          {/* panel */}
          <div className="ms-auto h-full w-full max-w-md bg-[color:var(--paper)] shadow-[var(--shadow-premium)] flex flex-col relative border-s border-[color:var(--brand-border)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--brand-border)] bg-white">
              <div className="flex items-center gap-3">
                <span className="accent-bar h-7 w-1.5 rounded-full" />
                <h2 className="font-display text-lg font-semibold text-[color:var(--ink)]">Add from Catalog</h2>
              </div>
              <button onClick={closeAll} className="rounded-full p-1.5 text-[color:var(--brand-muted)] transition hover:bg-[color:var(--paper-2)] hover:text-[color:var(--ink)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-[color:var(--brand-border)] bg-white">
              <div className="relative">
                <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--brand-muted)]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, brand or barcode"
                  className="w-full rounded-full border border-[color:var(--brand-border)] bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searching && (
                <div className="flex items-center justify-center py-10 text-[color:var(--brand-muted)]">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}

              {!searching && query && results.length === 0 && (
                <div className="text-center text-sm text-[color:var(--brand-muted)] py-10">No matches found</div>
              )}

              {!searching && !query && (
                <div className="text-center text-sm text-[color:var(--brand-muted)] py-10 px-6">
                  Search the catalog to add a product to your store
                </div>
              )}

              <ul className="divide-y divide-[color:var(--brand-border)]">
                {results.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => setPicked(item)}
                    className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-[color:var(--brand-gold)]/[0.07]"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-xl border border-[color:var(--brand-border)] bg-white flex items-center justify-center overflow-hidden">
                      {item.main_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.main_image_url} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <PackagePlus size={16} className="text-[color:var(--brand-muted)]/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[color:var(--ink)] line-clamp-2">{item.title}</p>
                      <p className="text-xs text-[color:var(--brand-muted)]">
                        {[item.brand, item.icecat_category].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="rounded-full bg-[color:var(--brand-maroon)]/[0.08] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[color:var(--brand-maroon)] transition group-hover:bg-[color:var(--brand-maroon)] group-hover:text-white">ADD</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* second sheet: price/stock entry, shown once an item is picked */}
          {picked && (
            <AddToStoreSheet
              item={picked}
              vendorId={vendorId}
              onClose={() => setPicked(null)}
              onDone={() => {
                closeAll();
                onAdded?.();
              }}
            />
          )}
        </div>
      )}
    </>
  );
}

function AddToStoreSheet({
  item,
  vendorId,
  onClose,
  onDone,
}: {
  item: CatalogItem;
  vendorId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const supabase = createClient();
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("0");
  const [condition, setCondition] = useState("new");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const priceNum = parseFloat(price);
    if (!priceNum || priceNum <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("add_catalog_to_store", {
      p_catalog_id: item.id,
      p_vendor_id: vendorId,
      p_price: priceNum,
      p_stock: parseInt(stock || "0", 10),
      p_sale_price: salePrice ? parseFloat(salePrice) : null,
      p_condition: condition,
      p_status: "active",
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Added to your store");
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="premium-card relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 shadow-[var(--shadow-premium)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 shrink-0 rounded-xl border border-[color:var(--brand-border)] bg-white flex items-center justify-center overflow-hidden">
            {item.main_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.main_image_url} alt="" className="w-full h-full object-contain" />
            ) : null}
          </div>
          <p className="text-sm font-semibold text-[color:var(--ink)] line-clamp-2">{item.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-[color:var(--brand-muted)] mb-1">Price (AED) *</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[color:var(--brand-muted)] mb-1">Sale price</label>
            <input
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-[color:var(--brand-muted)] mb-1">Stock</label>
            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[color:var(--brand-muted)] mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-[color:var(--paper-2)]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="bg-brand-gradient flex-1 rounded-full text-white py-2.5 text-sm font-semibold shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Add to my store
          </button>
        </div>
      </div>
    </div>
  );
}
