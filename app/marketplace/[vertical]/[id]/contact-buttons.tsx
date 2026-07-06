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
      <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50 py-4 text-center text-sm font-semibold text-neutral-500">
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

  const btnBase = "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90";
  const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";

  return (
    <>
      <div className="flex gap-2">
        <a
          href={`tel:${PHONE}`}
          className={btnBase + " bg-gradient-to-r from-[#8E1B3A] to-[#C72931] text-white"}
        >
          📞 {isRTL ? "اتصال" : "Call"}
        </a>
        <a
          href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(waMsg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btnBase + " border-2 border-[#25D366] text-[#25D366]"}
        >
          💬 {isRTL ? "واتساب" : "WhatsApp"}
        </a>
        <button
          onClick={() => setModalOpen(true)}
          className={btnBase + " border-2 border-[#8E1B3A] text-[#8E1B3A]"}
        >
          ✉️ {isRTL ? "استفسار" : "Enquire"}
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="my-12 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-neutral-900">{isRTL ? "إرسال استفسار" : "Send Enquiry"}</h2>
            <p className="mt-1 truncate text-xs text-neutral-500">{isRTL ? "بخصوص: " : "About: "}{listingTitle}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">{isRTL ? "اسمك *" : "Your Name *"}</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={isRTL ? "الاسم الكامل" : "Full name"} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">{isRTL ? "الهاتف *" : "Phone *"}</label>
                <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">{isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}</label>
                <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">{isRTL ? "الرسالة" : "Message"}</label>
                <textarea className={inputCls} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={isRTL ? "أنا مهتم. هل يمكنك مشاركة المزيد من التفاصيل؟" : "I'm interested. Can you share more details?"} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-semibold">{isRTL ? "إلغاء" : "Cancel"}</button>
              <button onClick={submitEnquiry} disabled={submitting} className="flex-1 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {submitting ? (isRTL ? "جارٍ الإرسال…" : "Sending…") : (isRTL ? "إرسال الاستفسار" : "Send Enquiry")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
