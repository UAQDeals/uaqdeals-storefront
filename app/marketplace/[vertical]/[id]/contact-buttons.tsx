"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const PHONE = "+971542205775";
const WA_PHONE = "971542205775";

export function ContactButtons({
  vertical,
  listingId,
  listingTitle,
  isSold = false,
}: {
  vertical: string;
  listingId: string;
  listingTitle: string;
  isSold?: boolean;
}) {
  const isRTL = useLocale() === "ar";
  if (isSold) {
    return (
      <div className="rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--paper-2)] py-4 text-center text-sm font-semibold text-[color:var(--brand-muted)]">
        {isRTL ? "هذا العنصر لم يعد متاحاً" : "This item is no longer available"}
      </div>
    );
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const waMsg = isRTL
    ? `مرحباً UAQ Deals، أنا مهتم بـ: ${listingTitle}`
    : `Hi UAQ Deals, I'm interested in: ${listingTitle}`;

  async function submitEnquiry() {
    if (!name.trim() || !phone.trim()) {
      toast.error(isRTL ? "الاسم ورقم الهاتف مطلوبان" : "Name and phone are required");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("marketplace_enquiries").insert({
        vertical,
        listing_id: listingId,
        listing_title: listingTitle,
        user_id: user?.id ?? null,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        message: message.trim() || null,
        status: "new",
      });
      if (error) throw error;
      toast.success(isRTL ? "تم إرسال طلبك! سيتواصل معك UAQ Deals قريباً." : "Enquiry sent! UAQ Deals will contact you soon.");
      setModalOpen(false);
      setName(""); setPhone(""); setEmail(""); setMessage("");
    } catch (e: any) {
      toast.error(e.message ?? (isRTL ? "تعذّر إرسال الطلب" : "Could not send enquiry"));
    } finally {
      setSubmitting(false);
    }
  }

  const btnBase = "flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition";
  const inputCls = "w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40";

  return (
    <>
      <div className="flex gap-2">
        <a
          href={`tel:${PHONE}`}
          className={btnBase + " bg-brand-gradient text-white shadow-[var(--shadow-card)] hover:brightness-110"}
        >
          📞 {isRTL ? "اتصال" : "Call"}
        </a>
        <a
          href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(waMsg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btnBase + " border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"}
        >
          💬 {isRTL ? "واتساب" : "WhatsApp"}
        </a>
        <button
          onClick={() => setModalOpen(true)}
          className={btnBase + " border border-[color:var(--brand-maroon)] text-[color:var(--brand-maroon)] hover:bg-[color:var(--paper-2)]"}
        >
          ✉️ {isRTL ? "استفسار" : "Enquire"}
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="premium-card my-12 w-full max-w-md p-6 shadow-[var(--shadow-premium)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-semibold text-[color:var(--ink)]">{isRTL ? "إرسال استفسار" : "Send Enquiry"}</h2>
            <p className="mt-1 truncate text-xs text-[color:var(--brand-muted)]">{isRTL ? "بخصوص: " : "About: "}{listingTitle}</p>
            <span className="gold-rule my-4 block" />
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[color:var(--brand-muted)]">{isRTL ? "اسمك *" : "Your Name *"}</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={isRTL ? "الاسم الكامل" : "Full name"} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[color:var(--brand-muted)]">{isRTL ? "الهاتف *" : "Phone *"}</label>
                <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[color:var(--brand-muted)]">{isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}</label>
                <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[color:var(--brand-muted)]">{isRTL ? "الرسالة" : "Message"}</label>
                <textarea className={inputCls} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={isRTL ? "أنا مهتم. هل يمكنك مشاركة المزيد من التفاصيل؟" : "I'm interested. Can you share more details?"} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-[color:var(--paper-2)]">{isRTL ? "إلغاء" : "Cancel"}</button>
              <button onClick={submitEnquiry} disabled={submitting} className="bg-brand-gradient flex-1 rounded-full py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
                {submitting ? (isRTL ? "جارٍ الإرسال…" : "Sending…") : (isRTL ? "إرسال الاستفسار" : "Send Enquiry")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
