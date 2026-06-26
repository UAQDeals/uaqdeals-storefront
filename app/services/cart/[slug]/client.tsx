"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart, CheckCircle, FileText,
} from "lucide-react";
import { useCart } from "@/lib/cart";

type Field = { key: string; label: string; type: "text" | "textarea" | "tel" | "email"; required?: boolean };
type Service = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_label: string | null;
  image_url: string | null;
};
type Meta = { title: string; emoji: string; tagline: string; fields: Field[] };

export function ServiceCartClient({
  slug, meta, services,
}: {
  slug: string; meta: Meta; services: Service[];
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const [step, setStep] = useState<"list" | "form" | "added">("list");
  const [selected, setSelected] = useState<Service | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  function openForm(s: Service) {
    setSelected(s);
    setValues({});
    setStep("form");
  }

  function addToCart() {
    if (!selected) return;
    // validate required fields
    for (const f of meta.fields) {
      if (f.required && !values[f.key]?.trim()) {
        // simple inline validation: scroll to focus not needed, just alert via title
        const el = document.getElementById("field_" + f.key);
        el?.focus();
        return;
      }
    }

    // Build a human-readable summary of the collected info → stored in `variant`
    const summary = meta.fields
      .filter((f) => values[f.key]?.trim())
      .map((f) => `${f.label}: ${values[f.key].trim()}`)
      .join(" • ");

    // Unique line id per customized service (so two different submissions don't merge)
    const lineId = `svc_${slug}_${selected.id}_${Date.now()}`;

    add({
      id: lineId,
      product_id: selected.id,
      name: `${meta.title}: ${selected.title}`,
      price: Number(selected.price ?? 0),
      original_price: null,
      image: selected.image_url,
      variant: summary || null,
      vendor_name: meta.title,
    }, 1);

    setStep("added");
  }

  const inputCls = "w-full h-12 rounded-xl border border-neutral-300 px-4 text-sm focus:outline-none focus:border-[#8E1B3A] bg-neutral-50";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-30" style={{ background: "linear-gradient(to right, #C72931, #8E1B3A)" }}>
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => step === "list" ? router.back() : setStep("list")} className="p-1.5 rounded-lg bg-white/10">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[16px] font-bold text-white flex-1">{meta.title}</h1>
        </div>
      </div>

      {/* ── SERVICE LIST ── */}
      {step === "list" && (
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-2xl p-5 text-white mb-5" style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{meta.emoji}</span>
              <div>
                <h2 className="text-[20px] font-extrabold leading-tight">{meta.title}</h2>
                <p className="text-white/80 text-[13px]">{meta.tagline}</p>
              </div>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl">{meta.emoji}</span>
              <p className="text-neutral-500 mt-3">No services available yet. Please check back soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] font-bold text-neutral-700">Choose a service</p>
              {services.map((s) => (
                <button key={s.id} onClick={() => openForm(s)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl border border-neutral-100 p-4 hover:shadow-md transition-shadow text-left"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#FDE8EC" }}>
                      {meta.emoji}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-neutral-900">{s.title}</p>
                    {s.description && <p className="text-[12px] text-neutral-500 line-clamp-2 mt-0.5">{s.description}</p>}
                    {s.price != null && (
                      <span className="text-[13px] font-extrabold mt-1 inline-block" style={{ color: "#8E1B3A" }}>
                        {s.price_label ? s.price_label + " " : ""}AED {Number(s.price).toFixed(0)}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── INFO FORM ── */}
      {step === "form" && selected && (
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-neutral-900">{selected.title}</p>
              {selected.price != null && (
                <p className="text-[13px] font-extrabold mt-0.5" style={{ color: "#8E1B3A" }}>AED {Number(selected.price).toFixed(0)}</p>
              )}
            </div>
            <button onClick={() => setStep("list")} className="text-[12px] font-semibold text-neutral-500 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Change
            </button>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: "#8E1B3A" }} />
            <h3 className="text-[15px] font-bold text-neutral-800">Your Information</h3>
          </div>
          <p className="text-[12px] text-neutral-500 -mt-3">We need a few details to process this service.</p>

          {meta.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                {f.label}{f.required && <span className="text-red-500"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea id={"field_" + f.key} rows={3}
                  value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-[#8E1B3A] bg-neutral-50" />
              ) : (
                <input id={"field_" + f.key} type={f.type}
                  value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className={inputCls} />
              )}
            </div>
          ))}

          <button onClick={addToCart}
            className="w-full h-12 rounded-xl text-white font-extrabold text-[14px] flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
          <p className="text-center text-[12px] text-neutral-400">You can review and pay at checkout.</p>
        </div>
      )}

      {/* ── ADDED ── */}
      {step === "added" && selected && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#16A34A" }} />
          </div>
          <h2 className="text-[22px] font-extrabold text-neutral-900">Added to Cart!</h2>
          <p className="text-neutral-500 text-[14px] mt-2">
            {meta.title}: {selected.title} is in your cart with your details.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => router.push("/cart")}
              className="rounded-xl px-6 py-3 text-white font-bold text-[14px]"
              style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              Go to Cart &amp; Checkout
            </button>
            <button onClick={() => setStep("list")} className="text-[13px] font-semibold text-neutral-500">
              Add another service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
