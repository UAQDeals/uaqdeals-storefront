"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft, Clock, ChevronRight, Calendar, User, Phone,
  MapPin, CheckCircle, CreditCard, ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

type Service = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_label: string | null;
  duration_minutes: number | null;
  image_url: string | null;
};
type Availability = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number | null;
  max_bookings_per_slot: number | null;
};
type Meta = { title: string; emoji: string; tagline: string };

// Generate hourly-ish time slots between start and end
function genSlots(start: string, end: string, stepMin: number): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const slots: string[] = [];
  let mins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  while (mins < endMins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    slots.push(`${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`);
    mins += stepMin;
  }
  return slots;
}

export function AppointmentClient({
  slug, meta, services, availability,
}: {
  slug: string; meta: Meta; services: Service[]; availability: Availability[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const isRTL = useLocale() === "ar";

  // step: list → book → payment → done
  const [step, setStep] = useState<"list" | "book" | "payment" | "done">("list");
  const [selected, setSelected] = useState<Service | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [takenSlots, setTakenSlots] = useState<Record<string, number>>({});

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 864e5).toISOString().split("T")[0];

  // Availability for the chosen date's weekday
  const slotsForDate = useMemo(() => {
    if (!date) return [];
    const dow = new Date(date + "T00:00:00").getDay(); // 0=Sun..6=Sat
    const avail = availability.find((a) => a.day_of_week === dow);
    if (!avail) return [];
    return genSlots(avail.start_time, avail.end_time, avail.slot_duration_minutes ?? 60);
  }, [date, availability]);

  const maxPerSlot = useMemo(() => {
    if (!date) return 2;
    const dow = new Date(date + "T00:00:00").getDay();
    return availability.find((a) => a.day_of_week === dow)?.max_bookings_per_slot ?? 2;
  }, [date, availability]);

  // Fetch taken slots when date changes
  useEffect(() => {
    if (!date) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("appointments")
        .select("appointment_time, status")
        .eq("vendor_type_slug", slug)
        .eq("appointment_date", date)
        .neq("status", "cancelled");
      if (!active) return;
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        counts[r.appointment_time] = (counts[r.appointment_time] ?? 0) + 1;
      });
      setTakenSlots(counts);
      setTime(""); // reset chosen time when date changes
    })();
    return () => { active = false; };
  }, [date, slug, supabase]);

  function openBooking(s: Service) {
    setSelected(s);
    setStep("book");
    setDate(""); setTime(""); setNotes("");
  }

  function proceedToPayment() {
    if (!date) { toast.error(isRTL ? "يرجى اختيار التاريخ" : "Please select a date"); return; }
    if (!time) { toast.error(isRTL ? "يرجى اختيار الوقت" : "Please select a time slot"); return; }
    if (!name.trim() || !phone.trim()) { toast.error(isRTL ? "يرجى إدخال الاسم ورقم الهاتف" : "Please enter your name and phone"); return; }
    if (!address.trim() && slug !== "clinics" && slug !== "barber_shop") {
      toast.error(isRTL ? "يرجى إدخال العنوان" : "Please enter your address"); return;
    }
    setStep("payment");
  }

  // ── PAYMENT PLACEHOLDER ──
  // When the gateway is ready, replace bookAppointment() body's "skip payment"
  // with the real checkout call, then create the appointment on success.
  async function bookAppointment() {
    if (!selected) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error(isRTL ? "يرجى تسجيل الدخول للحجز" : "Please sign in to book"); setLoading(false); return; }

      const { error } = await supabase.from("appointments").insert({
        user_id: user.id,
        vendor_type_slug: slug,
        service_id: selected.id,
        service_title: selected.title,
        appointment_date: date,
        appointment_time: time,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim() || null,
        notes: notes.trim() || null,
        status: "pending",
      });
      if (error) throw error;
      setStep("done");
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذّر إتمام الحجز" : "Could not book")));
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full h-12 rounded-xl border border-[color:var(--brand-border)] px-4 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white transition";

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      {/* Header */}
      <div className="bg-maroon-radial sticky top-0 z-30">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => step === "list" ? router.back() : setStep(step === "payment" ? "book" : "list")}
            className="p-1.5 rounded-full bg-white/10 ring-1 ring-[color:var(--brand-gold)]/30">
            <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" />
          </button>
          <h1 className="font-display text-[16px] font-semibold text-white flex-1">{meta.title}</h1>
        </div>
      </div>

      {/* ── STEP: SERVICE LIST ── */}
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
              <p className="font-display text-[16px] text-[color:var(--ink)] mt-4">{isRTL ? "لا توجد خدمات متاحة بعد. يرجى المعاودة قريباً." : "No services available yet. Please check back soon."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="eyebrow">{isRTL ? "اختر خدمة للحجز" : "Choose a service to book"}</p>
              {services.map((s) => (
                <button key={s.id} onClick={() => openBooking(s)}
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
                    <div className="flex items-center gap-3 mt-1.5">
                      {s.price != null && (
                        <span className="text-[13px] font-bold text-[color:var(--brand-maroon)]">
                          {s.price_label ? s.price_label + " " : ""}{isRTL ? "د.إ" : "AED"} {Number(s.price).toFixed(0)}
                        </span>
                      )}
                      {s.duration_minutes != null && (
                        <span className="text-[11px] text-[color:var(--brand-muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.duration_minutes} {isRTL ? "دقيقة" : "min"}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[color:var(--brand-maroon)]/40 shrink-0 rtl:rotate-180" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP: BOOKING FORM ── */}
      {step === "book" && selected && (
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
          {/* Selected service banner */}
          <div className="premium-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[color:var(--ink)]">{selected.title}</p>
              {selected.price != null && (
                <p className="text-[13px] font-bold text-[color:var(--brand-maroon)] mt-0.5">{isRTL ? "د.إ" : "AED"} {Number(selected.price).toFixed(0)}</p>
              )}
            </div>
            <button onClick={() => setStep("list")} className="text-[12px] font-semibold text-[color:var(--brand-muted)] flex items-center gap-1 hover:text-[color:var(--brand-maroon)] transition">
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" /> {isRTL ? "تغيير" : "Change"}
            </button>
          </div>

          {/* Date */}
          <div>
            <p className="text-[12.5px] font-semibold text-[color:var(--brand-muted)] mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[color:var(--brand-maroon)]" /> {isRTL ? "اختر التاريخ" : "Select Date"}</p>
            <input type="date" min={today} max={maxDate} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>

          {/* Time slots */}
          {date && (
            <div>
              <p className="text-[12.5px] font-semibold text-[color:var(--brand-muted)] mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4 text-[color:var(--brand-maroon)]" /> {isRTL ? "اختر الوقت" : "Select Time"}</p>
              {slotsForDate.length === 0 ? (
                <p className="text-[13px] text-[color:var(--brand-muted)] py-3">{isRTL ? "لا توجد مواعيد متاحة في هذا اليوم. جرّب تاريخاً آخر." : "No slots available on this day. Try another date."}</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotsForDate.map((slot) => {
                    const taken = (takenSlots[slot] ?? 0) >= maxPerSlot;
                    const active = time === slot;
                    return (
                      <button key={slot} disabled={taken} onClick={() => setTime(slot)}
                        className={
                          "h-10 rounded-full text-[12px] font-semibold border transition disabled:cursor-not-allowed " +
                          (active
                            ? "bg-brand-gradient text-white border-transparent shadow-[var(--shadow-card)]"
                            : taken
                              ? "bg-[color:var(--paper-2)] text-[color:var(--brand-muted)]/60 border-[color:var(--brand-border)] opacity-60"
                              : "bg-white text-[color:var(--brand-muted)] border-[color:var(--brand-border)] hover:border-[color:var(--brand-gold)]/50")
                        }>
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <p className="text-[12.5px] font-semibold text-[color:var(--brand-muted)]">{isRTL ? "بياناتك" : "Your Details"}</p>
            <div className="relative">
              <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--brand-maroon)]" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={isRTL ? "الاسم الكامل *" : "Full Name *"} className={inputCls + " ps-11"} />
            </div>
            <div className="relative">
              <Phone className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--brand-maroon)]" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={isRTL ? "رقم الهاتف *" : "Phone Number *"} type="tel" className={inputCls + " ps-11"} />
            </div>
            <div className="relative">
              <MapPin className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--brand-maroon)]" />
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder={slug === "clinics" || slug === "barber_shop" ? (isRTL ? "العنوان (اختياري)" : "Address (optional)") : (isRTL ? "العنوان *" : "Address *")} className={inputCls + " ps-11"} />
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder={isRTL ? "ملاحظات (اختياري)" : "Notes (optional)"} className="w-full rounded-xl border border-[color:var(--brand-border)] px-4 py-3 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white transition" />
          </div>

          <button onClick={proceedToPayment}
            className="bg-brand-gradient w-full h-12 rounded-full text-white font-bold text-[14px] shadow-[var(--shadow-card)] transition hover:brightness-110">
            {isRTL ? "المتابعة إلى الدفع" : "Continue to Payment"}
          </button>
        </div>
      )}

      {/* ── STEP: PAYMENT (placeholder) ── */}
      {step === "payment" && selected && (
        <div className="mx-auto max-w-md px-4 py-8">
          <div className="premium-card p-5 space-y-4">
            <h2 className="font-display text-[18px] font-semibold text-[color:var(--ink)]">{isRTL ? "التأكيد والدفع" : "Confirm & Pay"}</h2>

            {/* Summary */}
            <div className="rounded-2xl bg-[color:var(--paper-2)] p-4 space-y-2 text-[13px]">
              <Row label={isRTL ? "الخدمة" : "Service"} value={selected.title} />
              <Row label={isRTL ? "التاريخ" : "Date"} value={new Date(date + "T00:00:00").toLocaleDateString(isRTL ? "ar-AE" : "en-AE", { weekday: "short", day: "numeric", month: "short" })} />
              <Row label={isRTL ? "الوقت" : "Time"} value={time} />
              <Row label={isRTL ? "الاسم" : "Name"} value={name} />
              <div className="gold-rule my-2" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-[color:var(--ink)]">{isRTL ? "الإجمالي" : "Total"}</span>
                <span className="font-display font-semibold text-[color:var(--brand-maroon)]">
                  {selected.price != null ? `${isRTL ? "د.إ" : "AED"} ${Number(selected.price).toFixed(2)}` : (isRTL ? "يُحدد لاحقاً" : "TBD")}
                </span>
              </div>
            </div>

            {/* Payment placeholder */}
            <div className="rounded-2xl border border-dashed border-[color:var(--brand-gold)]/40 bg-[color:var(--paper-2)] p-4 text-center">
              <CreditCard className="w-7 h-7 mx-auto mb-2 text-[color:var(--brand-maroon)]" />
              <p className="text-[13px] font-bold text-[color:var(--ink)]">{isRTL ? "الدفع الإلكتروني قريباً" : "Online payment coming soon"}</p>
              <p className="text-[12px] text-[color:var(--brand-muted)] mt-1">
                {isRTL ? "في الوقت الحالي، أكّد حجزك وسيقوم فريقنا بترتيب الدفع عند تقديم الخدمة." : "For now, confirm your booking and our team will arrange payment on service."}
              </p>
            </div>

            <button onClick={bookAppointment} disabled={loading}
              className="bg-brand-gradient w-full h-12 rounded-full text-white font-bold text-[14px] shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
              {loading ? (isRTL ? "جارٍ التأكيد…" : "Confirming…") : (isRTL ? "تأكيد الحجز" : "Confirm Booking")}
            </button>
            <button onClick={() => setStep("book")} className="w-full text-[13px] font-semibold text-[color:var(--brand-muted)] hover:text-[color:var(--brand-maroon)] transition">
              {isRTL ? "رجوع" : "Back"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: DONE ── */}
      {step === "done" && selected && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-green-50 ring-8 ring-green-50/50">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-display text-[24px] font-semibold text-[color:var(--ink)]">{isRTL ? "تم تأكيد الحجز!" : "Booking Confirmed!"}</h2>
          <p className="text-[color:var(--brand-muted)] text-[14px] mt-2 leading-relaxed">
            {isRTL ? (<>تم حجز موعد {selected.title} في{" "}</>) : (<>Your {selected.title} appointment is booked for{" "}</>)}
            <span className="font-semibold text-[color:var(--ink)]">
              {new Date(date + "T00:00:00").toLocaleDateString(isRTL ? "ar-AE" : "en-AE", { weekday: "long", day: "numeric", month: "long" })} {isRTL ? "الساعة" : "at"} {time}
            </span>{isRTL ? ". سيتواصل معك فريقنا للتأكيد." : ". Our team will contact you to confirm."}
          </p>
          <button onClick={() => router.push("/services")}
            className="bg-brand-gradient mt-8 inline-block rounded-full px-7 py-3.5 text-white font-bold text-[14px] shadow-[var(--shadow-card)] transition hover:brightness-110">
            {isRTL ? "العودة إلى الخدمات" : "Back to Services"}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[color:var(--brand-muted)]">{label}</span>
      <span className="font-semibold text-[color:var(--ink)]">{value}</span>
    </div>
  );
}
