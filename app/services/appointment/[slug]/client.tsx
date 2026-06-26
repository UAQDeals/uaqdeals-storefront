"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Clock, ChevronRight, X, Calendar, User, Phone,
  MapPin, CheckCircle, CreditCard, ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
    if (!date) { toast.error("Please select a date"); return; }
    if (!time) { toast.error("Please select a time slot"); return; }
    if (!name.trim() || !phone.trim()) { toast.error("Please enter your name and phone"); return; }
    if (!address.trim() && slug !== "clinics" && slug !== "barber_shop") {
      toast.error("Please enter your address"); return;
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
      if (!user) { toast.error("Please sign in to book"); setLoading(false); return; }

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
      toast.error("Error: " + (e.message ?? "Could not book"));
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full h-12 rounded-xl border border-neutral-300 px-4 text-sm focus:outline-none focus:border-[#8E1B3A] bg-neutral-50";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-30" style={{ background: "linear-gradient(to right, #C72931, #8E1B3A)" }}>
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => step === "list" ? router.back() : setStep(step === "payment" ? "book" : "list")}
            className="p-1.5 rounded-lg bg-white/10">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[16px] font-bold text-white flex-1">{meta.title}</h1>
        </div>
      </div>

      {/* ── STEP: SERVICE LIST ── */}
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
              <p className="text-[13px] font-bold text-neutral-700">Choose a service to book</p>
              {services.map((s) => (
                <button key={s.id} onClick={() => openBooking(s)}
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
                    <div className="flex items-center gap-3 mt-1.5">
                      {s.price != null && (
                        <span className="text-[13px] font-extrabold" style={{ color: "#8E1B3A" }}>
                          {s.price_label ? s.price_label + " " : ""}AED {Number(s.price).toFixed(0)}
                        </span>
                      )}
                      {s.duration_minutes != null && (
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.duration_minutes} min
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
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

          {/* Date */}
          <div>
            <p className="text-[13px] font-bold text-neutral-800 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Select Date</p>
            <input type="date" min={today} max={maxDate} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>

          {/* Time slots */}
          {date && (
            <div>
              <p className="text-[13px] font-bold text-neutral-800 mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Select Time</p>
              {slotsForDate.length === 0 ? (
                <p className="text-[13px] text-neutral-400 py-3">No slots available on this day. Try another date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotsForDate.map((slot) => {
                    const taken = (takenSlots[slot] ?? 0) >= maxPerSlot;
                    const active = time === slot;
                    return (
                      <button key={slot} disabled={taken} onClick={() => setTime(slot)}
                        className="h-10 rounded-lg text-[12px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={active
                          ? { background: "#8E1B3A", color: "#fff", borderColor: "#8E1B3A" }
                          : taken
                            ? { background: "#F3F4F6", color: "#9CA3AF", borderColor: "#E5E7EB" }
                            : { background: "#fff", color: "#374151", borderColor: "#D1D5DB" }}>
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
            <p className="text-[13px] font-bold text-neutral-800">Your Details</p>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name *" className={inputCls + " pl-11"} />
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number *" type="tel" className={inputCls + " pl-11"} />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder={slug === "clinics" || slug === "barber_shop" ? "Address (optional)" : "Address *"} className={inputCls + " pl-11"} />
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Notes (optional)" className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-[#8E1B3A] bg-neutral-50" />
          </div>

          <button onClick={proceedToPayment}
            className="w-full h-12 rounded-xl text-white font-extrabold text-[14px]"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            Continue to Payment
          </button>
        </div>
      )}

      {/* ── STEP: PAYMENT (placeholder) ── */}
      {step === "payment" && selected && (
        <div className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
            <h2 className="text-[17px] font-extrabold text-neutral-900">Confirm & Pay</h2>

            {/* Summary */}
            <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-4 space-y-2 text-[13px]">
              <Row label="Service" value={selected.title} />
              <Row label="Date" value={new Date(date + "T00:00:00").toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short" })} />
              <Row label="Time" value={time} />
              <Row label="Name" value={name} />
              <div className="border-t border-neutral-200 pt-2 mt-2 flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="font-extrabold" style={{ color: "#8E1B3A" }}>
                  {selected.price != null ? `AED ${Number(selected.price).toFixed(2)}` : "TBD"}
                </span>
              </div>
            </div>

            {/* Payment placeholder */}
            <div className="rounded-xl border-2 border-dashed p-4 text-center" style={{ borderColor: "#F0D0D8", background: "#FDF6F8" }}>
              <CreditCard className="w-7 h-7 mx-auto mb-2" style={{ color: "#8E1B3A" }} />
              <p className="text-[13px] font-bold text-neutral-700">Online payment coming soon</p>
              <p className="text-[12px] text-neutral-500 mt-1">
                For now, confirm your booking and our team will arrange payment on service.
              </p>
            </div>

            <button onClick={bookAppointment} disabled={loading}
              className="w-full h-12 rounded-xl text-white font-extrabold text-[14px] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              {loading ? "Confirming…" : "Confirm Booking"}
            </button>
            <button onClick={() => setStep("book")} className="w-full text-[13px] font-semibold text-neutral-500">
              Back
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: DONE ── */}
      {step === "done" && selected && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#16A34A" }} />
          </div>
          <h2 className="text-[22px] font-extrabold text-neutral-900">Booking Confirmed!</h2>
          <p className="text-neutral-500 text-[14px] mt-2 leading-relaxed">
            Your {selected.title} appointment is booked for{" "}
            <span className="font-semibold text-neutral-700">
              {new Date(date + "T00:00:00").toLocaleDateString("en-AE", { weekday: "long", day: "numeric", month: "long" })} at {time}
            </span>. Our team will contact you to confirm.
          </p>
          <button onClick={() => router.push("/services")}
            className="mt-8 inline-block rounded-xl px-6 py-3 text-white font-bold text-[14px]"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            Back to Services
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-neutral-800">{value}</span>
    </div>
  );
}
