"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Hotel, MapPin, Calendar, User, Phone, Mail, FileText, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const HOTEL_TYPES = [
  { label: "Budget", icon: "\u{1F4B0}" },
  { label: "Standard", icon: "\u{1F3E8}" },
  { label: "Premium", icon: "\u{2B50}" },
  { label: "Luxury", icon: "\u{1F48E}" },
];

function Counter({ label, value, set, min, max }: { label: string; value: number; set: (v: number) => void; min: number; max: number; }) {
  return (
    <div className="flex-1 rounded-xl border border-neutral-300 bg-white px-2.5 py-2">
      <p className="text-[10px] text-neutral-500 text-center">{label}</p>
      <div className="flex items-center justify-center gap-2.5 mt-1">
        <button type="button" disabled={value <= min} onClick={() => set(value - 1)}
          className="p-1 rounded-md bg-neutral-100 disabled:opacity-30">
          <Minus className="w-3.5 h-3.5 text-[#8E1B3A]" />
        </button>
        <span className="text-base font-extrabold w-5 text-center">{value}</span>
        <button type="button" disabled={value >= max} onClick={() => set(value + 1)}
          className="p-1 rounded-md bg-neutral-100 disabled:opacity-30">
          <Plus className="w-3.5 h-3.5 text-[#8E1B3A]" />
        </button>
      </div>
    </div>
  );
}

export function HotelBookingForm() {
  const router = useRouter();
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
    if (!name || !phone || !destination) { toast.error("Please fill in name, phone and destination"); return; }
    if (!checkIn || !checkOut) { toast.error("Please select check-in and check-out dates"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const details = `Destination: ${destination} | Type: ${hotelType} | Check-in: ${checkIn} | Check-out: ${checkOut} | Nights: ${nights} | Rooms: ${rooms} | Adults: ${adults} | Children: ${children} | Email: ${email}${notes ? ` | Notes: ${notes}` : ""}`;
      const { error } = await supabase.from("service_enquiries").insert({
        user_id: user?.id ?? null, service_id: "hotel_booking", service_title: "Hotel Booking Enquiry",
        name, phone, message: details, status: "open",
      });
      if (error) throw error;
      toast.success("Hotel enquiry submitted! We will find the best options for you.");
      router.push("/services");
    } catch (e: any) {
      toast.error("Error: " + (e.message ?? "Could not submit"));
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-neutral-100">
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-[17px] font-bold text-neutral-900">Hotel Booking</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        <div className="rounded-2xl p-4 flex items-center gap-3 text-white" style={{ background: "linear-gradient(135deg, #311B92, #4527A0)" }}>
          <Hotel className="w-7 h-7" />
          <div>
            <p className="text-[16px] font-extrabold">Find Your Perfect Stay</p>
            <p className="text-[11px] text-white/70">We will match you with the best deals</p>
          </div>
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">Destination</label>
          <div className="relative mt-2">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City or Hotel Name"
              className="w-full h-12 rounded-xl border border-neutral-300 pl-10 pr-4 text-sm focus:outline-none focus:border-[#8E1B3A]" />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">Stay Dates</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="rounded-xl border border-neutral-300 bg-white px-3 py-2">
              <p className="text-[10px] text-neutral-500">Check-in</p>
              <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-[13px] font-semibold focus:outline-none bg-transparent" />
            </div>
            <div className="rounded-xl border border-neutral-300 bg-white px-3 py-2">
              <p className="text-[10px] text-neutral-500">Check-out</p>
              <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-[13px] font-semibold focus:outline-none bg-transparent" />
            </div>
          </div>
          {nights > 0 && <p className="text-[12px] font-semibold text-[#8E1B3A] mt-1.5">{nights} night{nights > 1 ? "s" : ""}</p>}
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">Hotel Category</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {HOTEL_TYPES.map((h) => (
              <button key={h.label} type="button" onClick={() => setHotelType(h.label)}
                className={"px-3.5 py-2 rounded-lg border text-[12px] font-semibold flex items-center gap-1.5 transition " + (hotelType === h.label ? "bg-[#8E1B3A] text-white border-[#8E1B3A]" : "bg-white text-neutral-700 border-neutral-300")}>
                <span>{h.icon}</span> {h.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">Rooms & Guests</label>
          <div className="flex gap-2.5 mt-2">
            <Counter label="Rooms" value={rooms} set={setRooms} min={1} max={10} />
            <Counter label="Adults" value={adults} set={setAdults} min={1} max={20} />
            <Counter label="Children" value={children} set={setChildren} min={0} max={10} />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[13px] font-bold text-neutral-800">Contact Details</label>
          <Field icon={User} placeholder="Full Name" value={name} onChange={setName} />
          <Field icon={Phone} placeholder="Phone" value={phone} onChange={setPhone} type="tel" />
          <Field icon={Mail} placeholder="Email" value={email} onChange={setEmail} type="email" />
          <div className="relative">
            <FileText className="absolute left-3 top-3.5 w-4.5 h-4.5 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special Requests" rows={3}
              className="w-full rounded-xl border border-neutral-300 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#8E1B3A]" />
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full h-13 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "#311B92", height: 52 }}>
          {loading ? "Submitting..." : <><Hotel className="w-5 h-5" /> Submit Enquiry</>}
        </button>
        <p className="text-center text-[11px] text-neutral-500">Our concierge will respond within 2 hours</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, type = "text" }: { icon: any; placeholder: string; value: string; onChange: (v: string) => void; type?: string; }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-neutral-300 pl-10 pr-4 text-sm focus:outline-none focus:border-[#8E1B3A]" />
    </div>
  );
}
