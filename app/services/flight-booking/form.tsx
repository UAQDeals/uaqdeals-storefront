"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, Plane, PlaneTakeoff, PlaneLanding, User, Phone, Mail, FileText, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

const PREMIUM_INPUT =
  "w-full rounded-xl border border-[color:var(--brand-border)] bg-white ps-10 pe-4 py-3 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] transition";

function Counter({ label, value, set, min, max }: { label: string; value: number; set: (v: number) => void; min: number; max: number; }) {
  return (
    <div className="flex-1 rounded-xl border border-[color:var(--brand-border)] bg-white px-3 py-2 flex items-center justify-between">
      <div>
        <p className="text-[10px] text-[color:var(--brand-muted)]">{label}</p>
        <p className="font-display text-base font-semibold text-[color:var(--ink)]">{value}</p>
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" disabled={value >= max} onClick={() => set(value + 1)} className="p-1 rounded-full bg-[color:var(--paper-2)] transition hover:brightness-95 disabled:opacity-30">
          <Plus className="w-3.5 h-3.5 text-[color:var(--brand-maroon)]" />
        </button>
        <button type="button" disabled={value <= min} onClick={() => set(value - 1)} className="p-1 rounded-full bg-[color:var(--paper-2)] transition hover:brightness-95 disabled:opacity-30">
          <Minus className="w-3.5 h-3.5 text-[color:var(--brand-maroon)]" />
        </button>
      </div>
    </div>
  );
}

export function FlightBookingForm() {
  const router = useRouter();
  const supabase = createClient();
  const isRTL = useLocale() === "ar";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [notes, setNotes] = useState("");
  const [tripType, setTripType] = useState("Round Trip");
  const [classType, setClassType] = useState("Economy");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [loading, setLoading] = useState(false);

  const tripTypeLabels: Record<string, string> = {
    "One Way": isRTL ? "ذهاب فقط" : "One Way",
    "Round Trip": isRTL ? "ذهاب وعودة" : "Round Trip",
    "Multi City": isRTL ? "وجهات متعددة" : "Multi City",
  };
  const classTypeLabels: Record<string, string> = {
    "Economy": isRTL ? "اقتصادية" : "Economy",
    "Business": isRTL ? "رجال الأعمال" : "Business",
    "First": isRTL ? "الأولى" : "First",
  };

  async function submit() {
    if (!name || !phone || !from || !to) { toast.error(isRTL ? "يرجى إدخال الاسم والهاتف ومن وإلى" : "Please fill name, phone, from and to"); return; }
    if (!departDate) { toast.error(isRTL ? "يرجى اختيار تاريخ المغادرة" : "Please select departure date"); return; }
    if (tripType === "Round Trip" && !returnDate) { toast.error(isRTL ? "يرجى اختيار تاريخ العودة" : "Please select return date"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const details = `Trip: ${tripType} | Class: ${classType} | From: ${from} | To: ${to} | Depart: ${departDate}${returnDate ? ` | Return: ${returnDate}` : ""} | Adults: ${adults} | Children: ${children} | Email: ${email}${notes ? ` | Notes: ${notes}` : ""}`;
      const { error } = await supabase.from("service_enquiries").insert({
        user_id: user?.id ?? null, service_id: "flight_booking", service_title: "Flight Booking Enquiry",
        name, phone, message: details, status: "open",
      });
      if (error) throw error;
      toast.success(isRTL ? "تم إرسال طلب الرحلة! سيتواصل معك فريقنا بأفضل الخيارات." : "Flight enquiry submitted! Our team will contact you with the best options.");
      router.push("/services");
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذر الإرسال" : "Could not submit")));
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const pillCls = (active: boolean) =>
    "rounded-full border text-[12px] font-semibold transition " +
    (active
      ? "bg-brand-gradient text-white border-transparent shadow-[var(--shadow-card)]"
      : "bg-white text-[color:var(--brand-muted)] border-[color:var(--brand-border)] hover:border-[color:var(--brand-gold)]/50");

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      <div className="bg-white/85 backdrop-blur-md border-b border-[color:var(--brand-border)] sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-full bg-[color:var(--paper-2)] transition hover:brightness-95">
            <ChevronLeft className="w-5 h-5 text-[color:var(--ink)] rtl:rotate-180" />
          </button>
          <h1 className="font-display text-[17px] font-semibold text-[color:var(--ink)]">{isRTL ? "حجز الطيران" : "Flight Booking"}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        <Reveal>
          <div className="bg-maroon-radial relative overflow-hidden rounded-3xl p-5 flex items-center gap-4 text-white shadow-[var(--shadow-premium)]">
            <span className="pointer-events-none absolute -top-16 -end-12 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40">
              <PlaneTakeoff className="w-6 h-6" />
            </span>
            <div className="relative">
              <p className="font-display text-[17px] font-semibold">{isRTL ? "احجز رحلتك" : "Book Your Flight"}</p>
              <p className="text-[12px] text-white/75">{isRTL ? "سنجد لك أفضل العروض" : "We will find the best deals for you"}</p>
            </div>
          </div>
        </Reveal>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "نوع الرحلة" : "Trip Type"}</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {["One Way", "Round Trip", "Multi City"].map((tp) => (
              <button key={tp} type="button" onClick={() => setTripType(tp)} className={"py-3 " + pillCls(tripType === tp)}>
                {tripTypeLabels[tp]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "المسار" : "Route"}</label>
          <div className="space-y-3 mt-2">
            <Field icon={PlaneTakeoff} placeholder={isRTL ? "من (المدينة / المطار)" : "From (City / Airport)"} value={from} onChange={setFrom} />
            <Field icon={PlaneLanding} placeholder={isRTL ? "إلى (المدينة / المطار)" : "To (City / Airport)"} value={to} onChange={setTo} />
          </div>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "تواريخ السفر" : "Travel Dates"}</label>
          <div className={"grid gap-3 mt-2 " + (tripType === "Round Trip" ? "grid-cols-2" : "grid-cols-1")}>
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white px-3.5 py-2.5">
              <p className="text-[10px] text-[color:var(--brand-muted)]">{isRTL ? "المغادرة" : "Departure"}</p>
              <input type="date" min={today} value={departDate} onChange={(e) => setDepartDate(e.target.value)}
                className="w-full text-[13px] font-semibold text-[color:var(--ink)] focus:outline-none bg-transparent" />
            </div>
            {tripType === "Round Trip" && (
              <div className="rounded-xl border border-[color:var(--brand-border)] bg-white px-3.5 py-2.5">
                <p className="text-[10px] text-[color:var(--brand-muted)]">{isRTL ? "العودة" : "Return"}</p>
                <input type="date" min={departDate || today} value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full text-[13px] font-semibold text-[color:var(--ink)] focus:outline-none bg-transparent" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "المسافرون" : "Passengers"}</label>
          <div className="flex gap-3 mt-2">
            <Counter label={isRTL ? "بالغون" : "Adults"} value={adults} set={setAdults} min={1} max={9} />
            <Counter label={isRTL ? "أطفال" : "Children"} value={children} set={setChildren} min={0} max={9} />
          </div>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "درجة السفر" : "Travel Class"}</label>
          <div className="flex gap-2 mt-2">
            {["Economy", "Business", "First"].map((c) => (
              <button key={c} type="button" onClick={() => setClassType(c)} className={"px-5 py-2.5 " + pillCls(classType === c)}>
                {classTypeLabels[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "بيانات التواصل" : "Contact Details"}</label>
          <Field icon={User} placeholder={isRTL ? "الاسم الكامل" : "Full Name"} value={name} onChange={setName} />
          <Field icon={Phone} placeholder={isRTL ? "الهاتف" : "Phone"} value={phone} onChange={setPhone} type="tel" />
          <Field icon={Mail} placeholder={isRTL ? "البريد الإلكتروني" : "Email"} value={email} onChange={setEmail} type="email" />
          <div className="relative">
            <FileText className="absolute start-3 top-3.5 text-[color:var(--brand-maroon)]" style={{ width: 18, height: 18 }} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={isRTL ? "متطلبات خاصة" : "Special Requirements"} rows={3}
              className={PREMIUM_INPUT} />
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="bg-brand-gradient w-full rounded-full text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60"
          style={{ height: 52 }}>
          {loading ? (isRTL ? "جاري الإرسال..." : "Submitting...") : <><Plane className="w-5 h-5" /> {isRTL ? "إرسال الطلب" : "Submit Enquiry"}</>}
        </button>
        <p className="text-center text-[11px] text-[color:var(--brand-muted)]">{isRTL ? "سيرد مكتب السفر لدينا خلال ساعتين" : "Our travel desk will respond within 2 hours"}</p>
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
