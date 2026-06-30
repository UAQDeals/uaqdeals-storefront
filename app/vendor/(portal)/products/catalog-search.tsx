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
        className="flex items-center gap-2 rounded-lg border border-[#8E1B3A] px-4 py-2 text-sm font-semibold text-[#8E1B3A] hover:bg-[#8E1B3A]/[0.04]"
      >
        <PackagePlus size={16} />
        Add from Catalog
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeAll} />

          {/* panel */}
          <div className="ml-auto h-full w-full max-w-md bg-white shadow-xl flex flex-col relative">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-base font-semibold">Add from Catalog</h2>
              <button onClick={closeAll} className="p-1 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, brand or barcode"
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8E1B3A]/30 focus:border-[#8E1B3A]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searching && (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}

              {!searching && query && results.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-8">No matches found</div>
              )}

              {!searching && !query && (
                <div className="text-center text-sm text-gray-400 py-8 px-6">
                  Search the catalog to add a product to your store
                </div>
              )}

              <ul className="divide-y">
                {results.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => setPicked(item)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 shrink-0 rounded border bg-white flex items-center justify-center overflow-hidden">
                      {item.main_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.main_image_url} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <PackagePlus size={16} className="text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {[item.brand, item.icecat_category].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#8E1B3A]">ADD</span>
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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 shrink-0 rounded border bg-white flex items-center justify-center overflow-hidden">
            {item.main_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.main_image_url} alt="" className="w-full h-full object-contain" />
            ) : null}
          </div>
          <p className="text-sm font-semibold line-clamp-2">{item.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price (AED) *</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8E1B3A]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sale price</label>
            <input
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8E1B3A]/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8E1B3A]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8E1B3A]/30"
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
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] text-white py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Add to my store
          </button>
        </div>
      </div>
    </div>
  );
}
