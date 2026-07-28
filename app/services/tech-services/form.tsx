"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft, Globe, Smartphone, ShoppingCart, Package,
  Calculator, Code2, Search, Megaphone, MessageCircle,
  ChevronRight, X, User, Phone, Mail, FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

const SLUG_ICONS: Record<string, React.ElementType> = {
  web_dev_design:       Globe,
  mobile_app_dev:       Smartphone,
  ecommerce_dev:        ShoppingCart,
  ecommerce_management: Package,
  accounting_software:  Calculator,
  custom_software:      Code2,
  seo_content:          Search,
  social_media_mgmt:    Megaphone,
};

const PREMIUM_INPUT =
  "w-full rounded-xl border border-[color:var(--brand-border)] bg-white ps-10 pe-4 py-3 text-[14px] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] transition";

type Service = {
  id: string;
  vendor_type_slug: string;
  title: string;
  description: string;
  price: number | null;
  price_label: string | null;
  image_url: string | null;
};

type SlugMeta = Record<string, { label: string; emoji: string }>;

function EnquiryModal({
  service,
  emoji,
  onClose,
}: {
  service: Service;
  emoji: string;
  onClose: () => void;
}) {
  const isRTL = useLocale() === "ar";
  const supabase = createClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name || !phone) {
      toast.error(isRTL ? "يرجى إدخال اسمك ورقم هاتفك" : "Please enter your name and phone number");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const details = `Service: ${service.title}${message ? ` | Notes: ${message}` : ""}${email ? ` | Email: ${email}` : ""}`;
      const { error } = await supabase.from("service_enquiries").insert({
        user_id: user?.id ?? null,
        service_id: service.vendor_type_slug,
        service_title: service.title,
        name,
        phone,
        message: details,
        status: "open",
      });
      if (error) throw error;
      toast.success(isRTL ? "تم إرسال الاستفسار! سنتواصل معك قريباً." : "Enquiry sent! We'll get back to you shortly.");
      onClose();
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذر الإرسال" : "Could not submit")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="premium-card relative w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 space-y-5 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{isRTL ? "استفسار عن" : "Enquire About"}</p>
            <h3 className="font-display mt-0.5 text-[18px] font-semibold text-[color:var(--ink)] leading-tight">{service.title}</h3>
            {service.price != null && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
                {service.price_label ?? (isRTL ? "يبدأ من" : "Starting from")} AED {Number(service.price).toLocaleString()}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-[color:var(--paper-2)] shrink-0 transition hover:brightness-95">
            <X className="w-4 h-4 text-[color:var(--brand-muted)]" />
          </button>
        </div>

        <div className="space-y-3">
          <Field icon={User} placeholder={isRTL ? "الاسم الكامل *" : "Full Name *"} value={name} onChange={setName} />
          <Field icon={Phone} placeholder={isRTL ? "رقم الهاتف *" : "Phone Number *"} value={phone} onChange={setPhone} type="tel" />
          <Field icon={Mail} placeholder={isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"} value={email} onChange={setEmail} type="email" />
          <div className="relative">
            <FileText className="absolute start-3 top-3.5 text-[color:var(--brand-maroon)]" style={{ width: 18, height: 18 }} />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isRTL ? "أخبرنا عن متطلباتك..." : "Tell us about your requirements..."}
              rows={3}
              className={PREMIUM_INPUT}
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="bg-brand-gradient w-full h-12 rounded-full text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? (isRTL ? "جارٍ الإرسال..." : "Submitting...") : <><MessageCircle className="w-4 h-4" /> {isRTL ? "إرسال الاستفسار" : "Send Enquiry"}</>}
        </button>
        <p className="text-center text-[11px] text-[color:var(--brand-muted)]">{isRTL ? "نرد عادةً خلال بضع ساعات" : "We typically respond within a few hours"}</p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, placeholder, value, onChange, type = "text",
}: {
  icon: React.ElementType; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-[color:var(--brand-maroon)]" style={{ width: 18, height: 18 }} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={PREMIUM_INPUT}
      />
    </div>
  );
}

function ServiceCard({
  service,
  emoji,
  onEnquire,
}: {
  service: Service;
  emoji: string;
  onEnquire: (s: Service) => void;
}) {
  const isRTL = useLocale() === "ar";
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="premium-card overflow-hidden !p-0">
      <button
        className="w-full flex items-center gap-3 p-3.5 text-start"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-[color:var(--paper-2)]">
          {service.image_url ? (
            <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{emoji}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-[color:var(--ink)] leading-snug truncate">{service.title}</p>
          {service.description && (
            <p className="text-[11px] text-[color:var(--brand-muted)] mt-0.5 line-clamp-2 leading-snug">{service.description}</p>
          )}
          {service.price != null && (
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
              {service.price_label ?? (isRTL ? "يبدأ من" : "Starting from")} AED {Number(service.price).toLocaleString()}
            </span>
          )}
        </div>

        <ChevronRight
          className="shrink-0 transition-transform text-[color:var(--brand-maroon)]/50"
          style={{
            width: 16, height: 16,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {expanded && (
        <div className="border-t border-[color:var(--brand-border)] px-4 py-3.5 space-y-3">
          {service.image_url && (
            <img
              src={service.image_url}
              alt={service.title}
              className="w-full h-40 object-cover rounded-2xl"
            />
          )}
          {service.description && (
            <div className="bg-[color:var(--paper-2)] rounded-2xl p-3.5">
              <p className="eyebrow mb-1">{isRTL ? "الوصف" : "Description"}</p>
              <p className="text-[13px] text-[color:var(--brand-muted)] leading-relaxed">{service.description}</p>
            </div>
          )}
          <button
            onClick={() => onEnquire(service)}
            className="bg-brand-gradient w-full h-11 rounded-full text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] transition hover:brightness-110"
          >
            <MessageCircle className="w-4 h-4" /> {isRTL ? "استفسر الآن" : "Enquire Now"}
          </button>
        </div>
      )}
    </div>
  );
}

export function TechServicesClient({
  grouped,
  slugMeta,
  initialSlug,
}: {
  grouped: Record<string, any[]>;
  slugMeta: SlugMeta;
  initialSlug: string;
}) {
  const isRTL = useLocale() === "ar";
  const router = useRouter();
  const slugs = Object.keys(slugMeta);
  const [activeSlug, setActiveSlug] = useState(
    slugs.includes(initialSlug) ? initialSlug : slugs[0]
  );
  const [enquiryService, setEnquiryService] = useState<Service | null>(null);

  const meta = slugMeta[activeSlug] ?? { label: activeSlug, emoji: "💻" };
  const services: Service[] = grouped[activeSlug] ?? [];
  const SlugIcon = SLUG_ICONS[activeSlug] ?? Code2;

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      <div className="bg-white/85 backdrop-blur-md border-b border-[color:var(--brand-border)] sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-full bg-[color:var(--paper-2)] transition hover:brightness-95">
            <ChevronLeft className="w-5 h-5 text-[color:var(--ink)] rtl:rotate-180" />
          </button>
          <h1 className="font-display text-[17px] font-semibold text-[color:var(--ink)]">{isRTL ? "الخدمات التقنية والرقمية" : "Tech & Digital Services"}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        <Reveal>
          <div className="bg-maroon-radial relative overflow-hidden rounded-3xl p-5 flex items-center gap-4 text-white shadow-[var(--shadow-premium)]">
            <span className="pointer-events-none absolute -top-16 -end-12 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40">
              <SlugIcon className="w-6 h-6" />
            </span>
            <div className="relative">
              <p className="font-display text-[17px] font-semibold">{meta.emoji} {meta.label}</p>
              <p className="text-[12px] text-white/75">{isRTL ? "خدمات رقمية احترافية لأعمالك" : "Professional digital services for your business"}</p>
            </div>
          </div>
        </Reveal>

        <div className="-mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {slugs.map((slug) => {
              const m = slugMeta[slug];
              const active = slug === activeSlug;
              return (
                <button
                  key={slug}
                  onClick={() => setActiveSlug(slug)}
                  className={
                    "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[12px] font-semibold whitespace-nowrap transition " +
                    (active
                      ? "bg-brand-gradient text-white border-transparent shadow-[var(--shadow-card)]"
                      : "bg-white text-[color:var(--brand-muted)] border-[color:var(--brand-border)] hover:border-[color:var(--brand-gold)]/50")
                  }
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-4xl">{meta.emoji}</span>
            <p className="font-display text-[16px] text-[color:var(--ink)]">{isRTL ? `لا توجد باقات ${meta.label} بعد` : `No ${meta.label} packages yet`}</p>
            <p className="text-[12px] text-[color:var(--brand-muted)]">{isRTL ? "تحقق مرة أخرى قريباً" : "Check back soon"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                emoji={meta.emoji}
                onEnquire={setEnquiryService}
              />
            ))}
          </div>
        )}
      </div>

      {enquiryService && (
        <EnquiryModal
          service={enquiryService}
          emoji={meta.emoji}
          onClose={() => setEnquiryService(null)}
        />
      )}
    </div>
  );
}
