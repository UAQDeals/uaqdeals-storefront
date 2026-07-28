"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, Hotel, MapPin, Calendar, User, Phone, Mail, FileText, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

const PREMIUM_INPUT =
  "w-full rounded-xl border border-[color:var(--brand-border)] bg-white ps-10 pe-4 py-3 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] transition";

const HOTEL_TYPES = [
  { label: "Budget", labelAr: "اقتصادي", icon: "\u{1F4B0}" },
  { label: "Standard", labelAr: "قياسي", icon: "\u{1F3E8}" },
  { label: "Premium", labelAr: "ممتاز", icon: "\u{2B50}" },
  { label: "Luxury", labelAr: "فاخر", icon: "\u{1F48E}" },
];

function Counter({ label, value, set, min, max }: { label: string; value: number; set: (v: number) => void; min: number; max: number; }) {
  return (
    <div className="flex-1 rounded-xl border border-[color:var(--brand-border)] bg-white px-2.5 py-2">
      <p className="text-[10px] text-[color:var(--brand-muted)] text-center">{label}</p>
      <div className="flex items-center justify-center gap-2.5 mt-1">
        <button type="button" disabled={value <= min} onClick={() => set(value - 1)}
          className="p-1 rounded-full bg-[color:var(--paper-2)] transition hover:brightness-95 disabled:opacity-30">
          <Minus className="w-3.5 h-3.5 text-[color:var(--brand-maroon)]" />
        </button>
        <span className="font-display text-base font-semibold text-[color:var(--ink)] w-5 text-center">{value}</span>
        <button type="button" disabled={value >= max} onClick={() => set(value + 1)}
          className="p-1 rounded-full bg-[color:var(--paper-2)] transition hover:brightness-95 disabled:opacity-30">
          <Plus className="w-3.5 h-3.5 text-[color:var(--brand-maroon)]" />
        </button>
      </div>
    </div>
  );
}

export function HotelBookingForm() {
  const router = useRouter();
  const isRTL = useLocale() === "ar";
  const supabase = createClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [hotelType, setHotelType] = useState("Standard");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  async function submit() {
    if (!name || !phone || !destination) { toast.error(isRTL ? "يرجى إدخال الاسم ورقم الهاتف والوجهة" : "Please fill in name, phone and destination"); return; }
    if (!checkIn || !checkOut) { toast.error(isRTL ? "يرجى اختيار تاريخ الوصول والمغادرة" : "Please select check-in and check-out dates"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const details = `Destination: ${destination} | Type: ${hotelType} | Check-in: ${checkIn} | Check-out: ${checkOut} | Nights: ${nights} | Rooms: ${rooms} | Adults: ${adults} | Children: ${children} | Email: ${email}${notes ? ` | Notes: ${notes}` : ""}`;
      const { error } = await supabase.from("service_enquiries").insert({
        user_id: user?.id ?? null, service_id: "hotel_booking", service_title: "Hotel Booking Enquiry",
        name, phone, message: details, status: "open",
      });
      if (error) throw error;
      toast.success(isRTL ? "تم إرسال طلب الحجز! سنجد لك أفضل الخيارات." : "Hotel enquiry submitted! We will find the best options for you.");
      router.push("/services");
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذّر الإرسال" : "Could not submit")));
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      <div className="bg-white/85 backdrop-blur-md border-b border-[color:var(--brand-border)] sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-full bg-[color:var(--paper-2)] transition hover:brightness-95">
            <ChevronLeft className="w-5 h-5 text-[color:var(--ink)] rtl:rotate-180" />
          </button>
          <h1 className="font-display text-[17px] font-semibold text-[color:var(--ink)]">{isRTL ? "حجز الفنادق" : "Hotel Booking"}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        <Reveal>
          <div className="bg-maroon-radial relative overflow-hidden rounded-3xl p-5 flex items-center gap-4 text-white shadow-[var(--shadow-premium)]">
            <span className="pointer-events-none absolute -top-16 -end-12 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40">
              <Hotel className="w-6 h-6" />
            </span>
            <div className="relative">
              <p className="font-display text-[17px] font-semibold">{isRTL ? "اعثر على إقامتك المثالية" : "Find Your Perfect Stay"}</p>
              <p className="text-[12px] text-white/75">{isRTL ? "سنوفّر لك أفضل العروض" : "We will match you with the best deals"}</p>
            </div>
          </div>
        </Reveal>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "الوجهة" : "Destination"}</label>
          <div className="relative mt-2">
            <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 text-[color:var(--brand-maroon)]" style={{ width: 18, height: 18 }} />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder={isRTL ? "المدينة أو اسم الفندق" : "City or Hotel Name"}
              className={PREMIUM_INPUT} />
          </div>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "تواريخ الإقامة" : "Stay Dates"}</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white px-3.5 py-2.5">
              <p className="text-[10px] text-[color:var(--brand-muted)]">{isRTL ? "الوصول" : "Check-in"}</p>
              <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-[13px] font-semibold text-[color:var(--ink)] focus:outline-none bg-transparent" />
            </div>
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white px-3.5 py-2.5">
              <p className="text-[10px] text-[color:var(--brand-muted)]">{isRTL ? "المغادرة" : "Check-out"}</p>
              <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-[13px] font-semibold text-[color:var(--ink)] focus:outline-none bg-transparent" />
            </div>
          </div>
          {nights > 0 && <p className="text-[12px] font-semibold text-[color:var(--brand-maroon)] mt-1.5">{isRTL ? `${nights} ${nights > 2 && nights < 11 ? "ليالٍ" : "ليلة"}` : `${nights} night${nights > 1 ? "s" : ""}`}</p>}
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "فئة الفندق" : "Hotel Category"}</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {HOTEL_TYPES.map((h) => (
              <button key={h.label} type="button" onClick={() => setHotelType(h.label)}
                className={
                  "px-3.5 py-2 rounded-full border text-[12px] font-semibold flex items-center gap-1.5 transition " +
                  (hotelType === h.label
                    ? "bg-brand-gradient text-white border-transparent shadow-[var(--shadow-card)]"
                    : "bg-white text-[color:var(--brand-muted)] border-[color:var(--brand-border)] hover:border-[color:var(--brand-gold)]/50")
                }>
                <span>{h.icon}</span> {isRTL ? h.labelAr : h.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "الغرف والضيوف" : "Rooms & Guests"}</label>
          <div className="flex gap-2.5 mt-2">
            <Counter label={isRTL ? "الغرف" : "Rooms"} value={rooms} set={setRooms} min={1} max={10} />
            <Counter label={isRTL ? "البالغون" : "Adults"} value={adults} set={setAdults} min={1} max={20} />
            <Counter label={isRTL ? "الأطفال" : "Children"} value={children} set={setChildren} min={0} max={10} />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "بيانات التواصل" : "Contact Details"}</label>
          <Field icon={User} placeholder={isRTL ? "الاسم الكامل" : "Full Name"} value={name} onChange={setName} />
          <Field icon={Phone} placeholder={isRTL ? "رقم الهاتف" : "Phone"} value={phone} onChange={setPhone} type="tel" />
          <Field icon={Mail} placeholder={isRTL ? "البريد الإلكتروني" : "Email"} value={email} onChange={setEmail} type="email" />
          <div className="relative">
            <FileText className="absolute start-3 top-3.5 text-[color:var(--brand-maroon)]" style={{ width: 18, height: 18 }} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={isRTL ? "طلبات خاصة" : "Special Requests"} rows={3}
              className={PREMIUM_INPUT} />
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="bg-brand-gradient w-full rounded-full text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60"
          style={{ height: 52 }}>
          {loading ? (isRTL ? "جارٍ الإرسال..." : "Submitting...") : <><Hotel className="w-5 h-5" /> {isRTL ? "إرسال الطلب" : "Submit Enquiry"}</>}
        </button>
        <p className="text-center text-[11px] text-[color:var(--brand-muted)]">{isRTL ? "سيردّ فريق الكونسيرج خلال ساعتين" : "Our concierge will respond within 2 hours"}</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, type = "text" }: { icon: any; placeholder: string; value: string; onChange: (v: string) => void; type?: string; }) {
  return (
    <div className="relative">
      <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-[color:var(--brand-maroon)]" style={{ width: 18, height: 18 }} />
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={PREMIUM_INPUT} />
    </div>
  );
}
