"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ArrowUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { aed } from "@/lib/format";

type Msg = { role: "user" | "assistant"; text: string; recs?: Candidate[] };
type Candidate = {
  id: string;
  name: string;
  price: number | null;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: unknown;
  categories?: { name?: string | null } | null;
};

function imageUrl(c: Candidate): string {
  if (c.thumbnail_url) return c.thumbnail_url;
  const imgs = c.images;
  if (Array.isArray(imgs) && imgs.length) {
    const f = imgs[0];
    return typeof f === "string" ? f : ((f as { src?: string })?.src ?? "");
  }
  return "";
}

export function DealFinderChat({
  productId,
  productName,
  price,
  salePrice,
  categoryId,
}: {
  productId: string;
  productName: string;
  price: number;
  salePrice: number | null;
  categoryId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I'm your shopping helper. Tell me what you're after and I'll suggest products for you. 🛍️" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const candsRef = useRef<Candidate[]>([]);
  const loadedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      const supabase = createClient();
      const sel = "id, name, price, sale_price, thumbnail_url, images, categories(name)";
      const jobs = [
        supabase.from("products").select(sel).eq("status", "active").eq("is_featured", true).neq("id", productId).limit(12),
      ];
      if (categoryId) {
        jobs.unshift(
          supabase.from("products").select(sel).eq("status", "active").eq("category_id", categoryId).neq("id", productId).limit(24)
        );
      }
      const results = await Promise.all(jobs);
      const seen = new Set<string>();
      const out: Candidate[] = [];
      for (const r of results) {
        for (const p of (r.data ?? []) as Candidate[]) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          out.push(p);
        }
      }
      candsRef.current = out;
    })();
  }, [open, categoryId, productId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, sending]);

  async function send(text: string) {
    text = text.trim();
    if (!text || sending) return;
    setInput("");
    const history = [...msgs, { role: "user" as const, text }];
    setMsgs(history);
    setSending(true);
    try {
      const supabase = createClient();
      const compact = candsRef.current.map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        sale_price: c.sale_price,
        category: c.categories?.name ?? null,
      }));
      const { data, error } = await supabase.functions.invoke("product-ai-chat", {
        body: {
          product: { id: productId, name: productName, price, sale_price: salePrice },
          candidates: compact,
          messages: history.map((m) => ({ role: m.role, content: m.text })),
          locale: "en",
        },
      });
      if (error) throw error;
      const reply = (data?.reply as string) ?? "";
      const ids: string[] = Array.isArray(data?.recommend) ? data.recommend.map(String) : [];
      const recs = ids.map((id) => candsRef.current.find((c) => c.id === id)).filter(Boolean) as Candidate[];
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: reply || (recs.length ? "" : "Sorry, I couldn't find a good match."), recs },
      ]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Something went wrong, please try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating pill */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}
        >
          <Sparkles className="h-4 w-4" /> Deals AI
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-end sm:inset-auto sm:bottom-6 sm:right-6">
          <div className="flex h-[80vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[70vh] sm:w-[380px] sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: "linear-gradient(135deg, #4E0A1A, #8E1B3A, #B4203A)" }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-bold leading-tight">Deal Finder</p>
                <p className="text-[11px] text-white/80">Ask me to find anything</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F7F5F6] p-3">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div className="max-w-[85%]">
                    {m.text && (
                      <div
                        className={
                          "rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug shadow-sm " +
                          (m.role === "user" ? "bg-[#C72931] text-white" : "bg-white text-neutral-800")
                        }
                      >
                        {m.text}
                      </div>
                    )}
                    {m.recs && m.recs.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {m.recs.map((c) => {
                          const img = imageUrl(c);
                          return (
                            <Link
                              key={c.id}
                              href={`/products/${c.id}`}
                              onClick={() => setOpen(false)}
                              className="w-[130px] shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
                            >
                              <div className="aspect-square bg-neutral-100">
                                {img ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={img} alt={c.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-neutral-300">🛍️</div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="line-clamp-2 text-[11.5px] font-semibold text-neutral-800">{c.name}</p>
                                <p className="mt-0.5 text-[12.5px] font-bold text-[#C72931]">{aed(c.sale_price ?? c.price)}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="w-max rounded-2xl bg-white px-4 py-3 text-sm text-neutral-400 shadow-sm">…</div>
              )}
            </div>

            {/* Suggestion chips */}
            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-3 pb-1 pt-2">
                {["Show similar items", "Cheaper options", "What pairs well with this?"].map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="rounded-full border border-[#C72931]/25 bg-[#C72931]/5 px-3 py-1.5 text-[12px] font-semibold text-[#C72931]"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <div className="flex items-center gap-2 border-t bg-white p-2.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
                placeholder="Ask about products…"
                className="flex-1 rounded-full bg-neutral-100 px-4 py-2.5 text-sm outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
