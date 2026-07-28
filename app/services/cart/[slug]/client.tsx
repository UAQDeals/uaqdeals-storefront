"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft, ChevronRight, ArrowLeft, CheckCircle, FileText, MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

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
  const isRTL = useLocale() === "ar";
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<"list" | "form" | "added">("list");
  const [selected, setSelected] = useState<Service | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  function openForm(s: Service) {
    setSelected(s);
    setValues({});
    setStep("form");
  }

  async function submitEnquiry() {
    if (!selected) return;
    // validate required fields
    for (const f of meta.fields) {
      if (f.required && !values[f.key]?.trim()) {
        const el = document.getElementById("field_" + f.key);
        el?.focus();
        toast.error((isRTL ? "يرجى تعبئة: " : "Please fill in: ") + f.label);
        return;
      }
    }

    // Build a human-readable summary of the collected info → enquiry message
    const summary = meta.fields
      .filter((f) => values[f.key]?.trim())
      .map((f) => `${f.label}: ${values[f.key].trim()}`)
      .join(" | ");

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Detect name/phone fields generically (keys differ per service slug)
      const nameField = meta.fields.find(
        (f) => /name/i.test(f.key) || /name/i.test(f.label)
      );
      const phoneField = meta.fields.find(
        (f) => f.type === "tel" || /phone|mobile|contact/i.test(f.key)
      );
      const enquiryName =
        (nameField && values[nameField.key]?.trim()) ||
        (user?.user_metadata?.full_name as string | undefined) ||
        "";
      const enquiryPhone =
        (phoneField && values[phoneField.key]?.trim()) ||
        (user?.user_metadata?.phone as string | undefined) ||
        (user?.phone ?? "") ||
        "";

      const message = `${meta.title}: ${selected.title}${summary ? ` | ${summary}` : ""}`;
      const { error } = await supabase.from("service_enquiries").insert({
        user_id: user?.id ?? null,
        service_id: slug,
        service_title: `${meta.title}: ${selected.title}`,
        name: enquiryName,
        phone: enquiryPhone,
        message,
        status: "open",
      });
      if (error) throw error;
      setStep("added");
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذّر إرسال الطلب" : "Could not submit request")));
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full h-12 rounded-xl border border-[color:var(--brand-border)] px-4 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white transition";

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      {/* Header */}
      <div className="bg-maroon-radial sticky top-0 z-30">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => step === "list" ? router.back() : setStep("list")} className="p-1.5 rounded-full bg-white/10 ring-1 ring-[color:var(--brand-gold)]/30">
            <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" />
          </button>
          <h1 className="font-display text-[16px] font-semibold text-white flex-1">{meta.title}</h1>
        </div>
      </div>

      {/* ── SERVICE LIST ── */}
      {step === "list" && (
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Reveal>
            <div className="bg-maroon-radial relative overflow-hidden rounded-3xl p-5 text-white mb-5 shadow-[var(--shadow-premium)]">
              <span className="pointer-events-none absolute -top-16 -end-12 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
              <div className="relative flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40 text-3xl">{meta.emoji}</span>
                <div>
                  <h2 className="font-display text-[20px] font-semibold leading-tight">{meta.title}</h2>
                  <p className="text-white/75 text-[13px]">{meta.tagline}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {services.length === 0 ? (
            <div className="text-center py-16">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-4xl">{meta.emoji}</span>
              <p className="font-display text-[16px] text-[color:var(--ink)] mt-4">{isRTL ? "لا توجد خدمات متاحة بعد. يرجى المعاودة قريبًا." : "No services available yet. Please check back soon."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="eyebrow">{isRTL ? "اختر خدمة" : "Choose a service"}</p>
              {services.map((s) => (
                <button key={s.id} onClick={() => openForm(s)}
                  className="premium-card w-full flex items-center gap-4 p-4 text-start">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-[color:var(--paper-2)]">
                      {meta.emoji}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[color:var(--ink)]">{s.title}</p>
                    {s.description && <p className="text-[12px] text-[color:var(--brand-muted)] line-clamp-2 mt-0.5">{s.description}</p>}
                    {s.price != null && (
                      <span className="text-[13px] font-bold mt-1 inline-block text-[color:var(--brand-maroon)]">
                        {s.price_label ? s.price_label + " " : ""}{isRTL ? "درهم" : "AED"} {Number(s.price).toFixed(0)}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-[color:var(--brand-maroon)]/40 shrink-0 rtl:rotate-180" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── INFO FORM ── */}
      {step === "form" && selected && (
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
          <div className="premium-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[color:var(--ink)]">{selected.title}</p>
              {selected.price != null && (
                <p className="text-[13px] font-bold mt-0.5 text-[color:var(--brand-maroon)]">{isRTL ? "درهم" : "AED"} {Number(selected.price).toFixed(0)}</p>
              )}
            </div>
            <button onClick={() => setStep("list")} className="text-[12px] font-semibold text-[color:var(--brand-muted)] flex items-center gap-1 hover:text-[color:var(--brand-maroon)] transition">
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" /> {isRTL ? "تغيير" : "Change"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[color:var(--brand-maroon)]" />
            <h3 className="font-display text-[16px] font-semibold text-[color:var(--ink)]">{isRTL ? "معلوماتك" : "Your Information"}</h3>
          </div>
          <p className="text-[12px] text-[color:var(--brand-muted)] -mt-3">{isRTL ? "نحتاج بعض التفاصيل لمعالجة هذه الخدمة." : "We need a few details to process this service."}</p>

          {meta.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-[12.5px] font-semibold text-[color:var(--brand-muted)] mb-1.5">
                {f.label}{f.required && <span className="text-[color:var(--brand-maroon)]"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea id={"field_" + f.key} rows={3}
                  value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-[color:var(--brand-border)] px-4 py-3 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white transition" />
              ) : (
                <input id={"field_" + f.key} type={f.type}
                  value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className={inputCls} />
              )}
            </div>
          ))}

          <button onClick={submitEnquiry} disabled={submitting}
            className="bg-brand-gradient w-full h-12 rounded-full text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
            <MessageCircle className="w-4 h-4" /> {submitting ? (isRTL ? "جارٍ الإرسال..." : "Submitting...") : (isRTL ? "اطلب الخدمة" : "Request Service")}
          </button>
          <p className="text-center text-[12px] text-[color:var(--brand-muted)]">{isRTL ? "سيتواصل معك فريقنا لتأكيد التفاصيل." : "Our team will contact you to confirm details."}</p>
        </div>
      )}

      {/* ── ADDED ── */}
      {step === "added" && selected && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-green-50 ring-8 ring-green-50/50">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-display text-[24px] font-semibold text-[color:var(--ink)]">{isRTL ? "تم إرسال الطلب!" : "Request Submitted!"}</h2>
          <p className="text-[color:var(--brand-muted)] text-[14px] mt-2">
            {isRTL
              ? `لقد استلمنا طلبك لـ ${meta.title}: ${selected.title}. سيتواصل معك فريقنا قريبًا للتأكيد.`
              : `We've received your request for ${meta.title}: ${selected.title}. Our team will contact you shortly to confirm.`}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => router.push("/services")}
              className="bg-brand-gradient rounded-full px-6 py-3 text-white font-bold text-[14px] shadow-[var(--shadow-card)] transition hover:brightness-110">
              {isRTL ? "تصفّح المزيد من الخدمات" : "Browse More Services"}
            </button>
            <button onClick={() => setStep("list")} className="text-[13px] font-semibold text-[color:var(--brand-muted)] hover:text-[color:var(--brand-maroon)] transition">
              {isRTL ? "اطلب خدمة أخرى" : "Request another service"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
