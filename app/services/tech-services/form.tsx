"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Globe, Smartphone, ShoppingCart, Package,
  Calculator, Code2, Search, Megaphone, MessageCircle,
  ChevronRight, X, User, Phone, Mail, FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
  const supabase = createClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name || !phone) {
      toast.error("Please enter your name and phone number");
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
      toast.success("Enquiry sent! We'll get back to you shortly.");
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
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 space-y-4 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-neutral-400 font-medium">Enquire About</p>
            <h3 className="text-[16px] font-bold text-neutral-900 leading-tight">{service.title}</h3>
            {service.price != null && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                style={{ background: "#FDE8EC", color: "#8E1B3A" }}>
                {service.price_label ?? "Starting from"} AED {Number(service.price).toLocaleString()}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-neutral-100 shrink-0">
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        <div className="space-y-3">
          <Field icon={User} placeholder="Full Name *" value={name} onChange={setName} />
          <Field icon={Phone} placeholder="Phone Number *" value={phone} onChange={setPhone} type="tel" />
          <Field icon={Mail} placeholder="Email (optional)" value={email} onChange={setEmail} type="email" />
          <div className="relative">
            <FileText className="absolute left-3 top-3.5 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your requirements..."
              rows={3}
              className="w-full rounded-xl border border-neutral-300 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#8E1B3A]"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full h-12 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}
        >
          {loading ? "Submitting..." : <><MessageCircle className="w-4 h-4" /> Send Enquiry</>}
        </button>
        <p className="text-center text-[11px] text-neutral-400">We typically respond within a few hours</p>
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
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-neutral-300 pl-10 pr-4 text-sm focus:outline-none focus:border-[#8E1B3A]"
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
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <button
        className="w-full flex items-center gap-3 p-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{ background: "#FDE8EC" }}
        >
          {service.image_url ? (
            <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{emoji}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-neutral-900 leading-snug truncate">{service.title}</p>
          {service.description && (
            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2 leading-snug">{service.description}</p>
          )}
          {service.price != null && (
            <span
              className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold"
              style={{ background: "#FDE8EC", color: "#8E1B3A" }}
            >
              {service.price_label ?? "Starting from"} AED {Number(service.price).toLocaleString()}
            </span>
          )}
        </div>

        <ChevronRight
          className="shrink-0 transition-transform"
          style={{
            width: 16, height: 16,
            color: "#8E1B3A",
            opacity: 0.5,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-4 py-3 space-y-3">
          {service.image_url && (
            <img
              src={service.image_url}
              alt={service.title}
              className="w-full h-40 object-cover rounded-xl"
            />
          )}
          {service.description && (
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
              <p className="text-[11px] font-bold text-neutral-700 mb-1">Description</p>
              <p className="text-[13px] text-neutral-600 leading-relaxed">{service.description}</p>
            </div>
          )}
          <button
            onClick={() => onEnquire(service)}
            className="w-full h-11 rounded-xl text-white font-bold text-[13px] flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}
          >
            <MessageCircle className="w-4 h-4" /> Enquire Now
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
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-neutral-100">
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-[17px] font-bold text-neutral-900">Tech & Digital Services</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        <div
          className="rounded-2xl p-4 flex items-center gap-3 text-white"
          style={{ background: "linear-gradient(135deg, #0F172A, #1E3A5F)" }}
        >
          <SlugIcon className="w-7 h-7 shrink-0" />
          <div>
            <p className="text-[16px] font-extrabold">{meta.emoji} {meta.label}</p>
            <p className="text-[11px] text-white/70">Professional digital services for your business</p>
          </div>
        </div>

        <div className="-mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {slugs.map((slug) => {
              const m = slugMeta[slug];
              const active = slug === activeSlug;
              return (
                <button
                  key={slug}
                  onClick={() => setActiveSlug(slug)}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[12px] font-semibold whitespace-nowrap transition-colors"
                  style={
                    active
                      ? { background: "#8E1B3A", color: "#fff", borderColor: "#8E1B3A" }
                      : { background: "#fff", color: "#374151", borderColor: "#D1D5DB" }
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
            <span className="text-5xl">{meta.emoji}</span>
            <p className="text-[14px] text-neutral-500">No {meta.label} packages yet</p>
            <p className="text-[12px] text-neutral-400">Check back soon</p>
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
