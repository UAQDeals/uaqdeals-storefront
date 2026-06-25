"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, MapPin, Clock, Users, Calendar,
  X, User, Phone, Mail, FileText, Compass,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  "All", "Tour Package", "Mangrove Visit", "Water Sports",
  "Desert Trip", "Short Stay", "Event", "Picnic", "Trip",
];

type Experience = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number | null;
  duration: string | null;
  image_url: string | null;
  location: string | null;
  highlights: string[] | null;
  is_featured: boolean | null;
};

function formatPrice(p: number | null): string {
  if (!p || p === 0) return "";
  return Number.isInteger(p) ? String(p) : p.toFixed(0);
}

// ── Enquiry Modal ────────────────────────────────────────────────────────────
function EnquiryModal({
  experience,
  onClose,
}: {
  experience: Experience;
  onClose: () => void;
}) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function submit() {
    if (!name || !phone) { toast.error("Please enter your name and phone"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("enquiries").insert({
        experience_id: experience.id,
        experience_title: "Explore UAQ: " + experience.title,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        guests,
        preferred_date: date || null,
        message: message.trim() || null,
      });
      if (error) throw error;
      toast.success("Enquiry submitted! We'll get back to you soon.");
      onClose();
    } catch (e: any) {
      toast.error("Error: " + (e.message ?? "Could not submit"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 space-y-4 max-h-[92dvh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center sm:hidden">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-neutral-900">Book / Enquire</h3>
            <p className="text-[12px] text-neutral-500 mt-0.5">{experience.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-neutral-100 shrink-0">
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <Field icon={User} placeholder="Full Name *" value={name} onChange={setName} />
          <Field icon={Phone} placeholder="Phone Number *" value={phone} onChange={setPhone} type="tel" />
          <Field icon={Mail} placeholder="Email (optional)" value={email} onChange={setEmail} type="email" />

          {/* Guests + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold text-neutral-600 mb-1.5">Guests</p>
              <div className="flex items-center justify-between h-11 rounded-xl border border-neutral-300 px-3 bg-white">
                <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
                  className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-[#8E1B3A] font-bold disabled:opacity-30"
                  disabled={guests <= 1}>
                  <Users className="w-3.5 h-3.5" />
                </button>
                <span className="text-[15px] font-bold">{guests}</span>
                <button type="button" onClick={() => setGuests(g => g + 1)}
                  className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-[#8E1B3A] font-bold">
                  +
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-neutral-600 mb-1.5">Preferred Date</p>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E1B3A]" style={{ width: 16, height: 16 }} />
                <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                  className="w-full h-11 rounded-xl border border-neutral-300 pl-9 pr-2 text-[12px] font-semibold focus:outline-none focus:border-[#8E1B3A] bg-white" />
              </div>
            </div>
          </div>

          <div className="relative">
            <FileText className="absolute left-3 top-3.5 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Any special requests..." rows={3}
              className="w-full rounded-xl border border-neutral-300 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#8E1B3A]" />
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full h-12 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
          {loading ? "Submitting..." : "Submit Enquiry"}
        </button>
        <p className="text-center text-[11px] text-neutral-400">We'll get back to you soon</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, type = "text" }: {
  icon: React.ElementType; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-neutral-300 pl-10 pr-4 text-sm focus:outline-none focus:border-[#8E1B3A]" />
    </div>
  );
}

// ── Detail view ──────────────────────────────────────────────────────────────
function ExperienceDetail({
  exp,
  onBack,
  onEnquire,
}: {
  exp: Experience;
  onBack: () => void;
  onEnquire: () => void;
}) {
  const price = formatPrice(exp.price);
  const highlights: string[] = Array.isArray(exp.highlights) ? exp.highlights : [];

  return (
    <div className="min-h-screen bg-neutral-50 pb-28">
      {/* Hero image */}
      <div className="relative h-64 md:h-96 w-full bg-neutral-200">
        {exp.image_url ? (
          <img src={exp.image_url} alt={exp.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            <Compass className="w-16 h-16 text-white/30" />
          </div>
        )}
        {/* Back button */}
        <button onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-5">
        {/* Category + duration */}
        <div className="flex flex-wrap gap-2 items-center">
          {exp.category && (
            <span className="px-2.5 py-1 rounded-lg text-[12px] font-semibold"
              style={{ background: "#FDE8EC", color: "#8E1B3A" }}>
              {exp.category}
            </span>
          )}
          {exp.duration && (
            <span className="flex items-center gap-1 text-[12px] text-neutral-500">
              <Clock className="w-3.5 h-3.5" /> {exp.duration}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-bold text-neutral-900 leading-snug">{exp.title}</h1>

        {/* Location */}
        {exp.location && (
          <div className="flex items-center gap-1.5 text-[13px] text-neutral-500">
            <MapPin className="w-4 h-4 text-[#8E1B3A]" /> {exp.location}
          </div>
        )}

        {/* Description */}
        {exp.description && (
          <p className="text-[14px] text-neutral-700 leading-relaxed">{exp.description}</p>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-[16px] font-bold text-neutral-900">Highlights</h2>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#8E1B3A" }} />
                  <p className="text-[13.5px] text-neutral-700 leading-snug">{h}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-3 z-10"
        style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.06)" }}>
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          {price && (
            <div className="shrink-0">
              <p className="text-[11px] text-neutral-400">From</p>
              <p className="text-[22px] font-bold text-neutral-900">AED {price}</p>
            </div>
          )}
          <button onClick={onEnquire}
            className="flex-1 h-12 rounded-2xl text-white font-bold text-[15px]"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            Book / Enquire
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Experience card ───────────────────────────────────────────────────────────
function ExperienceCard({ exp, onClick }: { exp: Experience; onClick: () => void }) {
  const price = formatPrice(exp.price);
  return (
    <button onClick={onClick} className="text-left bg-white rounded-[18px] overflow-hidden border border-black/[0.06]"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {/* Image */}
      <div className="relative w-full" style={{ paddingBottom: "147%" }}>
        <div className="absolute inset-0">
          {exp.image_url ? (
            <img src={exp.image_url} alt={exp.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              <Compass className="w-8 h-8 text-white/30" />
            </div>
          )}
          {/* Category badge */}
          {exp.category && (
            <div className="absolute top-2 left-2 bg-white rounded-[10px] px-2 py-0.5">
              <span className="text-[10px] font-semibold text-[#8E1B3A]">{exp.category}</span>
            </div>
          )}
          {/* Duration badge */}
          {exp.duration && (
            <div className="absolute bottom-2 right-2 bg-black/55 rounded-lg px-1.5 py-0.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-white" />
              <span className="text-[10px] font-semibold text-white">{exp.duration}</span>
            </div>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="p-2.5 space-y-1.5">
        <p className="text-[13px] font-semibold text-neutral-900 leading-snug line-clamp-2">{exp.title}</p>
        {price && (
          <div className="inline-block px-2 py-0.5 rounded-[10px]" style={{ background: "#FDE8EC" }}>
            <span className="text-[11px] font-bold text-[#8E1B3A]">from AED {price}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ── Main client component ─────────────────────────────────────────────────────
export function ExploreClient({ experiences }: { experiences: Experience[] }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [enquiryExp, setEnquiryExp] = useState<Experience | null>(null);

  const filtered = activeCategory === "All"
    ? experiences
    : experiences.filter(e => e.category === activeCategory);

  // Detail view
  if (selectedExp) {
    return (
      <>
        <ExperienceDetail
          exp={selectedExp}
          onBack={() => setSelectedExp(null)}
          onEnquire={() => setEnquiryExp(selectedExp)}
        />
        {enquiryExp && (
          <EnquiryModal experience={enquiryExp} onClose={() => setEnquiryExp(null)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* App bar */}
      <div className="sticky top-0 z-10 overflow-hidden"
        style={{ background: "linear-gradient(to right, #C72931 0%, #8E1B3A 40%, #6B1530 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-white/10">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[17px] font-bold text-white">Explore UAQ</h1>
        </div>
      </div>

      <div className="py-4 space-y-4">
        {/* Category pills */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => {
              const active = cat === activeCategory;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors"
                  style={active
                    ? { background: "linear-gradient(135deg, #8E1B3A, #C72931)", color: "#fff", borderColor: "transparent" }
                    : { background: "#fff", color: "#374151", borderColor: "#D1D5DB" }}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Compass className="w-12 h-12" style={{ color: "#8E1B3A", opacity: 0.3 }} />
            <p className="text-[15px] text-neutral-500">No experiences found</p>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filtered.map(exp => (
              <ExperienceCard key={exp.id} exp={exp} onClick={() => setSelectedExp(exp)} />
            ))}
          </div>
        )}
      </div>

      {enquiryExp && (
        <EnquiryModal experience={enquiryExp} onClose={() => setEnquiryExp(null)} />
      )}
    </div>
  );
}
