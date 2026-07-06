"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft, ChevronRight, ArrowLeft, CheckCircle, FileText, MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
              <p className="text-neutral-500 mt-3">{isRTL ? "لا توجد خدمات متاحة بعد. يرجى المعاودة قريبًا." : "No services available yet. Please check back soon."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] font-bold text-neutral-700">{isRTL ? "اختر خدمة" : "Choose a service"}</p>
              {services.map((s) => (
                <button key={s.id} onClick={() => openForm(s)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl border border-neutral-100 p-4 hover:shadow-md transition-shadow text-start"
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
                        {s.price_label ? s.price_label + " " : ""}{isRTL ? "درهم" : "AED"} {Number(s.price).toFixed(0)}
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
                <p className="text-[13px] font-extrabold mt-0.5" style={{ color: "#8E1B3A" }}>{isRTL ? "درهم" : "AED"} {Number(selected.price).toFixed(0)}</p>
              )}
            </div>
            <button onClick={() => setStep("list")} className="text-[12px] font-semibold text-neutral-500 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> {isRTL ? "تغيير" : "Change"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: "#8E1B3A" }} />
            <h3 className="text-[15px] font-bold text-neutral-800">{isRTL ? "معلوماتك" : "Your Information"}</h3>
          </div>
          <p className="text-[12px] text-neutral-500 -mt-3">{isRTL ? "نحتاج بعض التفاصيل لمعالجة هذه الخدمة." : "We need a few details to process this service."}</p>

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

          <button onClick={submitEnquiry} disabled={submitting}
            className="w-full h-12 rounded-xl text-white font-extrabold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            <MessageCircle className="w-4 h-4" /> {submitting ? (isRTL ? "جارٍ الإرسال..." : "Submitting...") : (isRTL ? "اطلب الخدمة" : "Request Service")}
          </button>
          <p className="text-center text-[12px] text-neutral-400">{isRTL ? "سيتواصل معك فريقنا لتأكيد التفاصيل." : "Our team will contact you to confirm details."}</p>
        </div>
      )}

      {/* ── ADDED ── */}
      {step === "added" && selected && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#16A34A" }} />
          </div>
          <h2 className="text-[22px] font-extrabold text-neutral-900">{isRTL ? "تم إرسال الطلب!" : "Request Submitted!"}</h2>
          <p className="text-neutral-500 text-[14px] mt-2">
            {isRTL
              ? `لقد استلمنا طلبك لـ ${meta.title}: ${selected.title}. سيتواصل معك فريقنا قريبًا للتأكيد.`
              : `We've received your request for ${meta.title}: ${selected.title}. Our team will contact you shortly to confirm.`}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => router.push("/services")}
              className="rounded-xl px-6 py-3 text-white font-bold text-[14px]"
              style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              {isRTL ? "تصفّح المزيد من الخدمات" : "Browse More Services"}
            </button>
            <button onClick={() => setStep("list")} className="text-[13px] font-semibold text-neutral-500">
              {isRTL ? "اطلب خدمة أخرى" : "Request another service"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
