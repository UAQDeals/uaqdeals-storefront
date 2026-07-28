"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft, MapPin, Clock, Users, Calendar,
  X, User, Phone, Mail, FileText, Compass,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

const CATEGORIES = [
  "All", "Tour Package", "Mangrove Visit", "Water Sports",
  "Desert Trip", "Short Stay", "Event", "Picnic", "Trip",
];

const CATEGORY_LABELS_AR: Record<string, string> = {
  "All": "الكل",
  "Tour Package": "باقة سياحية",
  "Mangrove Visit": "زيارة القرم",
  "Water Sports": "رياضات مائية",
  "Desert Trip": "رحلة صحراوية",
  "Short Stay": "إقامة قصيرة",
  "Event": "فعالية",
  "Picnic": "نزهة",
  "Trip": "رحلة",
};

function categoryLabel(cat: string, isRTL: boolean): string {
  return isRTL ? (CATEGORY_LABELS_AR[cat] ?? cat) : cat;
}

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
  const isRTL = useLocale() === "ar";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function submit() {
    if (!name || !phone) { toast.error(isRTL ? "يرجى إدخال الاسم ورقم الهاتف" : "Please enter your name and phone"); return; }
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
      toast.success(isRTL ? "تم إرسال طلبك! سنتواصل معك قريبًا." : "Enquiry submitted! We'll get back to you soon.");
      onClose();
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذّر الإرسال" : "Could not submit")));
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
            <h3 className="font-display text-[18px] font-semibold text-[color:var(--ink)]">{isRTL ? "الحجز / الاستفسار" : "Book / Enquire"}</h3>
            <p className="text-[12px] text-[color:var(--brand-muted)] mt-0.5">{experience.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-[color:var(--paper-2)] shrink-0 transition hover:brightness-95">
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <Field icon={User} placeholder={isRTL ? "الاسم الكامل *" : "Full Name *"} value={name} onChange={setName} />
          <Field icon={Phone} placeholder={isRTL ? "رقم الهاتف *" : "Phone Number *"} value={phone} onChange={setPhone} type="tel" />
          <Field icon={Mail} placeholder={isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"} value={email} onChange={setEmail} type="email" />

          {/* Guests + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold text-[color:var(--brand-muted)] mb-1.5">{isRTL ? "عدد الضيوف" : "Guests"}</p>
              <div className="flex items-center justify-between h-11 rounded-xl border border-[color:var(--brand-border)] px-3 bg-white">
                <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
                  className="w-7 h-7 rounded-md bg-[color:var(--paper-2)] flex items-center justify-center text-[color:var(--brand-maroon)] font-bold disabled:opacity-30"
                  disabled={guests <= 1}>
                  <Users className="w-3.5 h-3.5" />
                </button>
                <span className="text-[15px] font-bold">{guests}</span>
                <button type="button" onClick={() => setGuests(g => g + 1)}
                  className="w-7 h-7 rounded-md bg-[color:var(--paper-2)] flex items-center justify-center text-[color:var(--brand-maroon)] font-bold">
                  +
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[color:var(--brand-muted)] mb-1.5">{isRTL ? "التاريخ المفضل" : "Preferred Date"}</p>
              <div className="relative">
                <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 text-[color:var(--brand-gold-deep)]" style={{ width: 16, height: 16 }} />
                <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[color:var(--brand-border)] ps-9 pe-2 text-[12px] font-semibold focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white" />
              </div>
            </div>
          </div>

          <div className="relative">
            <FileText className="absolute start-3 top-3.5 text-[color:var(--brand-gold-deep)]" style={{ width: 18, height: 18 }} />
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder={isRTL ? "أي طلبات خاصة..." : "Any special requests..."} rows={3}
              className="w-full rounded-xl border border-[color:var(--brand-border)] ps-10 pe-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]" />
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="bg-brand-gradient w-full h-12 rounded-full text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] hover:brightness-110 transition disabled:opacity-60">
          {loading ? (isRTL ? "جارٍ الإرسال..." : "Submitting...") : (isRTL ? "إرسال الطلب" : "Submit Enquiry")}
        </button>
        <p className="text-center text-[11px] text-neutral-400">{isRTL ? "سنتواصل معك قريبًا" : "We'll get back to you soon"}</p>
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
      <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-[color:var(--brand-gold-deep)]" style={{ width: 18, height: 18 }} />
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-[color:var(--brand-border)] ps-10 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]" />
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
  const isRTL = useLocale() === "ar";
  const price = formatPrice(exp.price);
  const highlights: string[] = Array.isArray(exp.highlights) ? exp.highlights : [];

  return (
    <div className="min-h-screen bg-[color:var(--paper)] pb-28">
      {/* Hero image */}
      <div className="relative h-64 md:h-96 w-full bg-[color:var(--paper-2)]">
        {exp.image_url ? (
          <img src={exp.image_url} alt={exp.title} className="w-full h-full object-cover" />
        ) : (
          <div className="bg-maroon-radial w-full h-full flex items-center justify-center">
            <Compass className="w-16 h-16 text-white/30" />
          </div>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" aria-hidden />
        {/* Back button */}
        <button onClick={onBack}
          className="absolute top-4 start-4 w-9 h-9 rounded-full bg-black/40 border border-[color:var(--brand-gold)]/30 backdrop-blur-sm flex items-center justify-center transition hover:bg-black/55">
          <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" />
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-5">
        {/* Category + duration */}
        <div className="flex flex-wrap gap-2 items-center">
          {exp.category && (
            <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
              {categoryLabel(exp.category, isRTL)}
            </span>
          )}
          {exp.duration && (
            <span className="flex items-center gap-1 text-[12px] text-[color:var(--brand-muted)]">
              <Clock className="w-3.5 h-3.5" /> {exp.duration}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-[26px] font-semibold text-[color:var(--ink)] leading-snug">{exp.title}</h1>

        {/* Location */}
        {exp.location && (
          <div className="flex items-center gap-1.5 text-[13px] text-[color:var(--brand-muted)]">
            <MapPin className="w-4 h-4 text-[color:var(--brand-maroon)]" /> {exp.location}
          </div>
        )}

        {/* Description */}
        {exp.description && (
          <p className="text-[14px] text-neutral-700 leading-relaxed">{exp.description}</p>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="accent-bar h-6 w-1.5 rounded-full" />
              <h2 className="font-display text-[18px] font-semibold text-[color:var(--ink)]">{isRTL ? "أبرز المميزات" : "Highlights"}</h2>
            </div>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-[color:var(--brand-gold)]" />
                  <p className="text-[13.5px] text-neutral-700 leading-snug">{h}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 start-0 end-0 bg-white/90 backdrop-blur border-t border-[color:var(--brand-border)] px-4 py-3 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          {price && (
            <div className="shrink-0">
              <p className="text-[11px] text-[color:var(--brand-muted)]">{isRTL ? "يبدأ من" : "From"}</p>
              <p className="text-[22px] font-extrabold text-[color:var(--brand-maroon)]">{isRTL ? "درهم" : "AED"} {price}</p>
            </div>
          )}
          <button onClick={onEnquire}
            className="bg-brand-gradient flex-1 h-12 rounded-full text-white font-bold text-[15px] shadow-[var(--shadow-card)] hover:brightness-110 transition">
            {isRTL ? "الحجز / الاستفسار" : "Book / Enquire"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Experience card ───────────────────────────────────────────────────────────
function ExperienceCard({ exp, onClick }: { exp: Experience; onClick: () => void }) {
  const isRTL = useLocale() === "ar";
  const price = formatPrice(exp.price);
  return (
    <button onClick={onClick} className="group premium-card text-start overflow-hidden w-full h-full block">
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: "147%" }}>
        <div className="absolute inset-0">
          {exp.image_url ? (
            <img src={exp.image_url} alt={exp.title} className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
          ) : (
            <div className="bg-maroon-radial w-full h-full flex items-center justify-center">
              <Compass className="w-8 h-8 text-white/30" />
            </div>
          )}
          {/* Category badge */}
          {exp.category && (
            <div className="absolute top-2 start-2 bg-white/90 backdrop-blur rounded-full px-2.5 py-0.5 ring-1 ring-[color:var(--brand-gold)]/40">
              <span className="text-[10px] font-semibold text-[color:var(--brand-maroon)]">{categoryLabel(exp.category, isRTL)}</span>
            </div>
          )}
          {/* Duration badge */}
          {exp.duration && (
            <div className="absolute bottom-2 end-2 bg-black/55 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-white" />
              <span className="text-[10px] font-semibold text-white">{exp.duration}</span>
            </div>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="p-2.5 space-y-1.5">
        <p className="text-[13px] font-semibold text-[color:var(--ink)] leading-snug line-clamp-2">{exp.title}</p>
        {price && (
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[color:var(--paper-2)]">
            <span className="text-[11px] font-bold text-[color:var(--brand-maroon)]">{isRTL ? `من ${price} درهم` : `from AED ${price}`}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ── Main client component ─────────────────────────────────────────────────────
export function ExploreClient({ experiences }: { experiences: Experience[] }) {
  const router = useRouter();
  const isRTL = useLocale() === "ar";
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
    <div className="min-h-screen bg-[color:var(--paper)]">
      {/* App bar */}
      <div className="bg-maroon-radial relative overflow-hidden sticky top-0 z-10">
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-white/10 border border-[color:var(--brand-gold)]/25 backdrop-blur-sm transition hover:bg-white/20">
            <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" />
          </button>
          <h1 className="font-display text-[18px] font-semibold text-white">{isRTL ? "اكتشف أم القيوين" : "Explore UAQ"}</h1>
        </div>
      </div>

      <div className="py-5 space-y-4">
        {/* Category pills */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => {
              const active = cat === activeCategory;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={"shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors " +
                    (active
                      ? "bg-brand-gradient text-white border-transparent shadow-[var(--shadow-card)]"
                      : "bg-white text-neutral-700 border-[color:var(--brand-border)] hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)]")}>
                  {categoryLabel(cat, isRTL)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] ring-1 ring-[color:var(--brand-gold)]/30">
              <Compass className="w-9 h-9 text-[color:var(--brand-maroon)]" />
            </span>
            <p className="font-display text-[18px] font-semibold text-[color:var(--ink)]">{isRTL ? "لا توجد تجارب" : "No experiences found"}</p>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((exp, i) => (
              <Reveal key={exp.id} delay={i * 40}>
                <ExperienceCard exp={exp} onClick={() => setSelectedExp(exp)} />
              </Reveal>
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
