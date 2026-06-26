"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, MapPin, Clock, Calendar, Ticket,
  X, User, Phone, Plus, Minus, CheckCircle, Copy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import QRCode from "qrcode";

// ── Types ─────────────────────────────────────────────────────────────────────
type TicketOption = {
  id: string;
  ticket_type: string;
  price: number;
  description: string | null;
  max_persons: number | null;
  display_order: number;
};

type Attraction = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  opening_hours: string | null;
  attraction_tickets: TicketOption[];
};

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  event_date: string;
  event_time: string | null;
  ticket_price: number;
  price_label: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatEventDate(dateStr: string, time: string | null): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let base = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    if (!time) return base;
    const [hStr, mStr] = time.split(":");
    let h = parseInt(hStr);
    const period = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${base} • ${h}:${mStr} ${period}`;
  } catch { return dateStr; }
}

function genTicketCode(): string {
  return "UAQ-" + Date.now().toString().substring(5);
}

// ── Ticket Booking Modal ──────────────────────────────────────────────────────
function TicketModal({
  type, title, imageUrl,
  attractionId, ticketOptions,
  eventId, eventPrice, eventPriceLabel, isFreeEvent,
  onClose,
}: {
  type: "attraction" | "event";
  title: string;
  imageUrl: string | null;
  attractionId?: string;
  ticketOptions?: TicketOption[];
  eventId?: string;
  eventPrice?: number;
  eventPriceLabel?: string | null;
  isFreeEvent?: boolean;
  onClose: () => void;
}) {
  const supabase = createClient();
  const sorted = [...(ticketOptions ?? [])].sort((a, b) => a.display_order - b.display_order);
  // Per-ticket-type counts, keyed by option id. All start at 0 (Airbnb style).
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(sorted.map((t) => [t.id, 0]))
  );
  const [quantity, setQuantity] = useState(1); // events (flat price)

  function setCount(id: string, next: number) {
    setTypeCounts((prev) => ({ ...prev, [id]: Math.max(0, next) }));
  }
  const [visitDate, setVisitDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [eTicket, setETicket] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Generate QR whenever an e-ticket is issued
  if (eTicket && !qrDataUrl) {
    QRCode.toDataURL(eTicket, { width: 240, margin: 1, color: { dark: "#8E1B3A", light: "#FFFFFF" } })
      .then(setQrDataUrl)
      .catch(() => {});
  }

  const today = new Date().toISOString().split("T")[0];

  const totalQty = type === "attraction"
    ? Object.values(typeCounts).reduce((a, b) => a + b, 0)
    : quantity;

  const totalPrice = type === "attraction"
    ? sorted.reduce((sum, t) => sum + (typeCounts[t.id] ?? 0) * t.price, 0)
    : (eventPrice ?? 0) * quantity;

  const unitPrice = totalQty > 0 ? totalPrice / totalQty : 0;

  const ticketSummary = type === "attraction"
    ? sorted.filter(t => (typeCounts[t.id] ?? 0) > 0).map(t => `${typeCounts[t.id]}x ${t.ticket_type}`).join(", ")
    : (eventPriceLabel ?? "Standard");

  async function submit() {
    if (type === "attraction" && totalQty === 0) { toast.error("Please add at least one ticket"); return; }
    if (type === "attraction" && !visitDate) { toast.error("Please select a visit date"); return; }
    if (!name.trim() || !phone.trim()) { toast.error("Please enter your name and phone"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in to book tickets"); setLoading(false); return; }

      const code = genTicketCode();
      const { error } = await supabase.from("ticket_bookings").insert({
        user_id: user.id,
        booking_type: type,
        attraction_id: attractionId ?? null,
        event_id: eventId ?? null,
        ticket_type: ticketSummary || null,
        quantity: totalQty,
        unit_price: unitPrice,
        total_price: totalPrice,
        visit_date: visitDate || null,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        e_ticket_code: code,
        status: "confirmed",
      });
      if (error) throw error;
      setETicket(code);
    } catch (e: any) {
      toast.error("Error: " + (e.message ?? "Could not book"));
    } finally {
      setLoading(false);
    }
  }

  // E-ticket confirmation view
  if (eTicket) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 space-y-5">
          <div className="flex flex-col items-center text-center gap-2">
            <CheckCircle className="w-14 h-14" style={{ color: "#16A34A" }} />
            <h3 className="text-[20px] font-extrabold text-neutral-900">Booking Confirmed!</h3>
            <p className="text-[13px] text-neutral-500">{title}</p>
          </div>
          <div className="rounded-xl border-2 border-dashed p-4 text-center space-y-3"
            style={{ borderColor: "#8E1B3A", background: "#FDF2F4" }}>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Ticket QR Code" className="mx-auto rounded-lg" style={{ width: 180, height: 180 }} />
            )}
            <div className="space-y-1">
              <p className="text-[11px] font-bold tracking-widest text-neutral-400">E-TICKET CODE</p>
              <p className="text-[22px] font-extrabold tracking-widest" style={{ color: "#8E1B3A" }}>{eTicket}</p>
            </div>
          </div>
          <p className="text-[12px] text-neutral-400 text-center">Show this code at the entrance. Find it anytime in My Tickets.</p>
          <div className="flex gap-3">
            <button onClick={() => { navigator.clipboard.writeText(eTicket); toast.success("Code copied!"); }}
              className="flex-1 h-11 rounded-xl border border-neutral-300 flex items-center justify-center gap-2 text-[13px] font-semibold text-neutral-700">
              <Copy className="w-4 h-4" /> Copy Code
            </button>
            <button onClick={onClose}
              className="flex-1 h-11 rounded-xl text-white font-bold text-[13px]"
              style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92dvh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[17px] font-extrabold text-neutral-900">
                {type === "attraction" ? "Book Tickets" : (isFreeEvent ? "Get Free Ticket" : "Buy Tickets")}
              </h3>
              <p className="text-[12px] text-neutral-500 mt-0.5 line-clamp-1">{title}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-neutral-100 shrink-0">
              <X className="w-4 h-4 text-neutral-600" />
            </button>
          </div>

          {/* Per-type counters (attractions) */}
          {type === "attraction" && sorted.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-neutral-800">Tickets</p>
                {totalQty > 0 && (
                  <span className="text-[12px] font-bold" style={{ color: "#8E1B3A" }}>{totalQty} selected</span>
                )}
              </div>
              {sorted.map(t => {
                const count = typeCounts[t.id] ?? 0;
                const active = count > 0;
                return (
                  <div key={t.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border transition-colors"
                    style={active ? { borderColor: "#8E1B3A", borderWidth: 1.5, background: "#FDF2F4" } : { borderColor: "#E5E7EB" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-neutral-900">{t.ticket_type}</p>
                      <p className="text-[11px] text-neutral-500">
                        AED {t.price}
                        {t.max_persons ? ` · up to ${t.max_persons} persons` : ""}
                        {t.description ? ` · ${t.description}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 border border-neutral-300 rounded-lg overflow-hidden shrink-0">
                      <button onClick={() => setCount(t.id, count - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-neutral-50 disabled:opacity-30"
                        disabled={count <= 0}>
                        <Minus className="w-3.5 h-3.5" style={{ color: "#8E1B3A" }} />
                      </button>
                      <span className="w-8 text-center text-[15px] font-extrabold">{count}</span>
                      <button onClick={() => setCount(t.id, count + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-neutral-50">
                        <Plus className="w-3.5 h-3.5" style={{ color: "#8E1B3A" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Events — single guest counter */
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold text-neutral-800">Guests</p>
              <div className="flex items-center gap-1 border border-neutral-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center bg-neutral-50 disabled:opacity-30"
                  disabled={quantity <= 1}>
                  <Minus className="w-3.5 h-3.5 text-neutral-600" />
                </button>
                <span className="w-9 text-center text-[15px] font-extrabold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 flex items-center justify-center bg-neutral-50">
                  <Plus className="w-3.5 h-3.5 text-neutral-600" />
                </button>
              </div>
            </div>
          )}

          {/* Visit date (attractions only) */}
          {type === "attraction" && (
            <div className="space-y-1.5">
              <p className="text-[13px] font-bold text-neutral-800">Visit Date <span className="text-red-500">*</span></p>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
                <input type="date" min={today} value={visitDate} onChange={e => setVisitDate(e.target.value)}
                  className="w-full h-12 rounded-xl border border-neutral-300 pl-10 pr-4 text-[13px] font-semibold focus:outline-none focus:border-[#8E1B3A]" />
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="space-y-2.5">
            <p className="text-[13px] font-bold text-neutral-800">Your Details</p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *"
                className="w-full h-12 rounded-xl border border-neutral-300 pl-10 pr-4 text-sm focus:outline-none focus:border-[#8E1B3A]" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number *" type="tel"
                className="w-full h-12 rounded-xl border border-neutral-300 pl-10 pr-4 text-sm focus:outline-none focus:border-[#8E1B3A]" />
            </div>
          </div>

          {/* Total */}
          {totalPrice > 0 && (
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "#FDE8EC" }}>
              <p className="text-[13px] text-neutral-600">Total ({totalQty}×)</p>
              <p className="text-[16px] font-extrabold" style={{ color: "#8E1B3A" }}>
                AED {totalPrice.toFixed(2)}
              </p>
            </div>
          )}

          <button onClick={submit} disabled={loading}
            className="w-full h-12 rounded-xl text-white font-extrabold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            {loading ? "Processing..." : (isFreeEvent ? "Confirm Free Ticket" : "Confirm Booking")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Attraction Card ───────────────────────────────────────────────────────────
function AttractionCard({ attraction, onBook }: { attraction: Attraction; onBook: () => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.07)" }}>
      <div className="relative h-48 bg-neutral-200">
        {attraction.image_url
          ? <img src={attraction.image_url} alt={attraction.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🦁</div>}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="text-[16px] font-extrabold text-neutral-900">{attraction.name}</h3>
        <div className="flex flex-wrap gap-3">
          {attraction.location && (
            <span className="flex items-center gap-1 text-[12px] text-neutral-500">
              <MapPin className="w-3.5 h-3.5" style={{ color: "#8E1B3A" }} /> {attraction.location}
            </span>
          )}
          {attraction.opening_hours && (
            <span className="flex items-center gap-1 text-[12px] text-neutral-500">
              <Clock className="w-3.5 h-3.5" /> {attraction.opening_hours}
            </span>
          )}
        </div>
        {attraction.description && (
          <p className="text-[12px] text-neutral-500 leading-relaxed line-clamp-2">{attraction.description}</p>
        )}
        {attraction.attraction_tickets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {[...attraction.attraction_tickets]
              .sort((a, b) => a.display_order - b.display_order)
              .map(t => (
                <span key={t.id} className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                  style={{ background: "#FDE8EC", color: "#8E1B3A" }}>
                  {t.ticket_type} — AED {t.price}
                </span>
              ))}
          </div>
        )}
        <button onClick={onBook}
          className="w-full h-11 rounded-xl text-white font-bold text-[13px] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
          <Ticket className="w-4 h-4" /> Book Tickets
        </button>
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event, onBook }: { event: Event; onBook: () => void }) {
  const isFree = !event.ticket_price || event.ticket_price === 0;
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.07)" }}>
      <div className="relative h-44 bg-neutral-200">
        {event.image_url
          ? <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🎉</div>}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-extrabold"
          style={isFree
            ? { background: "#16A34A", color: "#fff" }
            : { background: "#8E1B3A", color: "#fff" }}>
          {isFree ? "FREE" : `AED ${event.ticket_price}`}
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        <h3 className="text-[15px] font-extrabold text-neutral-900">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "#8E1B3A" }}>
          <Calendar className="w-3.5 h-3.5" />
          {formatEventDate(event.event_date, event.event_time)}
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5 text-[12px] text-neutral-500">
            <MapPin className="w-3.5 h-3.5" /> {event.location}
          </div>
        )}
        {event.description && (
          <p className="text-[12px] text-neutral-500 leading-relaxed line-clamp-2">{event.description}</p>
        )}
        <button onClick={onBook}
          className="w-full h-11 rounded-xl text-white font-bold text-[13px] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
          <Ticket className="w-4 h-4" /> {isFree ? "Get Free Ticket" : "Buy Tickets"}
        </button>
      </div>
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────
export function ZooEventsClient({
  attractions, events,
}: {
  attractions: Attraction[];
  events: Event[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"attractions" | "events">("attractions");
  const [modal, setModal] = useState<{
    type: "attraction" | "event";
    attraction?: Attraction;
    event?: Event;
  } | null>(null);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* App bar */}
      <div className="sticky top-0 z-10"
        style={{ background: "linear-gradient(to right, #C72931 0%, #8E1B3A 40%, #6B1530 100%)" }}>
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-white/10">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[17px] font-bold text-white flex-1">Zoo &amp; Events</h1>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-6xl px-4 flex border-t border-white/10">
          {(["attractions", "events"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 sm:flex-none sm:px-8 py-3 text-[13px] font-bold capitalize transition-colors relative"
              style={activeTab === tab ? { color: "#fff" } : { color: "rgba(255,255,255,0.55)" }}>
              {tab === "attractions" ? "Attractions" : "Events"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-5">
        {activeTab === "attractions" ? (
          attractions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-5xl">🦁</span>
              <p className="text-[15px] text-neutral-500">No attractions available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {attractions.map(a => (
                <AttractionCard key={a.id} attraction={a}
                  onBook={() => setModal({ type: "attraction", attraction: a })} />
              ))}
            </div>
          )
        ) : (
          events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-5xl">🎉</span>
              <p className="text-[15px] text-neutral-500">No upcoming events</p>
              <p className="text-[12px] text-neutral-400">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map(e => (
                <EventCard key={e.id} event={e}
                  onBook={() => setModal({ type: "event", event: e })} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Ticket modal */}
      {modal?.type === "attraction" && modal.attraction && (
        <TicketModal
          type="attraction"
          title={modal.attraction.name}
          imageUrl={modal.attraction.image_url}
          attractionId={modal.attraction.id}
          ticketOptions={modal.attraction.attraction_tickets}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "event" && modal.event && (
        <TicketModal
          type="event"
          title={modal.event.title}
          imageUrl={modal.event.image_url}
          eventId={modal.event.id}
          eventPrice={modal.event.ticket_price}
          eventPriceLabel={modal.event.price_label}
          isFreeEvent={!modal.event.ticket_price || modal.event.ticket_price === 0}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
