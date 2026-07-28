"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft, Smartphone, User, Phone, MapPin, Upload, X,
  CheckCircle, Wrench, Clock, ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

export function MobileRepairClient() {
  const router = useRouter();
  const supabase = createClient();
  const isRTL = useLocale() === "ar";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [issue, setIssue] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!name.trim() || !phone.trim()) { toast.error(isRTL ? "الرجاء إدخال اسمك ورقم هاتفك" : "Please enter your name and phone"); return; }
    if (!issue.trim()) { toast.error(isRTL ? "الرجاء وصف المشكلة" : "Please describe the issue"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Optional photo upload to the public-assets bucket
      let photoUrl = "";
      if (photo) {
        const ext = photo.name.split(".").pop() ?? "jpg";
        const path = `mobile-repair/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("public-assets").upload(path, photo);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from("public-assets").getPublicUrl(path);
          photoUrl = publicUrl;
        }
      }

      // service_enquiries has name/phone/message — fold address+issue+photo into message
      const message =
        `Issue: ${issue.trim()}` +
        (address.trim() ? ` | Address: ${address.trim()}` : "") +
        (photoUrl ? ` | Photo: ${photoUrl}` : "");

      const { error } = await supabase.from("service_enquiries").insert({
        user_id: user?.id ?? null,
        service_title: "Mobile Repair",
        name: name.trim(),
        phone: phone.trim(),
        message,
        status: "new",
      });
      if (error) throw error;

      setDone(true);
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذّر الإرسال" : "Could not submit")));
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full h-12 rounded-xl border border-[color:var(--brand-border)] px-4 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white transition";

  if (done) {
    return (
      <div className="min-h-screen bg-[color:var(--paper)]">
        <Header onBack={() => router.back()} isRTL={isRTL} />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-green-50 ring-8 ring-green-50/50">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-display text-[24px] font-semibold text-[color:var(--ink)]">{isRTL ? "تم استلام طلبك!" : "Request Received!"}</h2>
          <p className="text-[color:var(--brand-muted)] text-[14px] mt-2 leading-relaxed">
            {isRTL
              ? `شكرًا ${name.split(" ")[0]}! سيراجع فريق الإصلاح طلبك ويتواصل معك قريبًا على ${phone}.`
              : `Thanks ${name.split(" ")[0]}! Our repair team will review your request and contact you shortly on ${phone}.`}
          </p>
          <button onClick={() => router.push("/services")}
            className="bg-brand-gradient mt-8 inline-block rounded-full px-7 py-3.5 text-white font-bold text-[14px] shadow-[var(--shadow-card)] transition hover:brightness-110">
            {isRTL ? "العودة إلى الخدمات" : "Back to Services"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      <Header onBack={() => router.back()} isRTL={isRTL} />

      {/* Hero */}
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <Reveal>
          <div className="bg-maroon-radial relative overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-premium)]">
            <span className="pointer-events-none absolute -top-16 -end-12 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-[20px] font-semibold leading-tight">{isRTL ? "إصلاح الجوال" : "Mobile Repair"}</h1>
                <p className="text-white/75 text-[13px]">{isRTL ? "إصلاح سريع وموثوق للهواتف والأجهزة" : "Fast, reliable phone & device repairs"}</p>
              </div>
            </div>
            <div className="relative flex gap-4 mt-4 text-[12px]">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[color:var(--brand-gold)]" /> {isRTL ? "خدمة في نفس اليوم" : "Same-day service"}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[color:var(--brand-gold)]" /> {isRTL ? "مع الضمان" : "Warranty included"}</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[color:var(--brand-maroon)]" />
          <h2 className="font-display text-[16px] font-semibold text-[color:var(--ink)]">{isRTL ? "أخبرنا بما يحتاج إلى إصلاح" : "Tell us what needs fixing"}</h2>
        </div>

        <div className="relative">
          <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--brand-maroon)]" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder={isRTL ? "الاسم الكامل *" : "Full Name *"} className={inputCls + " ps-11"} />
        </div>
        <div className="relative">
          <Phone className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--brand-maroon)]" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={isRTL ? "رقم الهاتف *" : "Phone Number *"} type="tel" className={inputCls + " ps-11"} />
        </div>
        <div className="relative">
          <MapPin className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--brand-maroon)]" />
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder={isRTL ? "العنوان (للاستلام / في الموقع)" : "Address (for pickup / on-site)"} className={inputCls + " ps-11"} />
        </div>

        <textarea value={issue} onChange={e => setIssue(e.target.value)} rows={4}
          placeholder={isRTL ? "صف المشكلة * — مثل شاشة مكسورة، نفاد البطارية، لا يشحن…" : "Describe the issue * — e.g. cracked screen, battery draining, won't charge…"}
          className="w-full rounded-xl border border-[color:var(--brand-border)] px-4 py-3 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white transition" />

        {/* Photo upload (optional) */}
        <div>
          <p className="text-[12.5px] font-semibold text-[color:var(--brand-muted)] mb-2">{isRTL ? "صورة للجهاز (اختياري)" : "Photo of the device (optional)"}</p>
          {photo ? (
            <div className="flex items-center gap-2 p-3 rounded-xl border bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="flex-1 text-[12px] font-semibold truncate text-green-700">{photo.name}</span>
              <button onClick={() => setPhoto(null)}><X className="w-4 h-4 text-[color:var(--brand-maroon)]" /></button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-[color:var(--brand-gold)]/40 bg-[color:var(--paper-2)] cursor-pointer transition hover:brightness-95">
              <Upload className="w-4 h-4 text-[color:var(--brand-maroon)]" />
              <span className="text-[13px] font-semibold text-[color:var(--brand-maroon)]">{isRTL ? "رفع صورة" : "Upload a photo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>

        <button onClick={submit} disabled={loading}
          className="bg-brand-gradient w-full h-12 rounded-full text-white font-bold text-[14px] shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
          {loading ? (isRTL ? "جارٍ الإرسال…" : "Submitting…") : (isRTL ? "طلب إصلاح" : "Request Repair")}
        </button>
        <p className="text-center text-[12px] text-[color:var(--brand-muted)]">{isRTL ? "سنتواصل معك لتأكيد التفاصيل والسعر." : "We'll contact you back to confirm details and pricing."}</p>
      </div>
    </div>
  );
}

function Header({ onBack, isRTL }: { onBack: () => void; isRTL: boolean }) {
  return (
    <div className="bg-maroon-radial sticky top-0 z-30">
      <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-full bg-white/10 ring-1 ring-[color:var(--brand-gold)]/30">
          <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" />
        </button>
        <h1 className="font-display text-[16px] font-semibold text-white">{isRTL ? "إصلاح الجوال" : "Mobile Repair"}</h1>
      </div>
    </div>
  );
}
