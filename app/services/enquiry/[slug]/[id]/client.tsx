"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Upload, Check, CheckCircle2, FileText, Paperclip,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const DOC_FIELDS: { key: string; col: string; label: string }[] = [
  { key: "trade_license",    col: "trade_license_path",    label: "Trade License" },
  { key: "passport",         col: "passport_path",         label: "Passport" },
  { key: "passport_address", col: "passport_address_path", label: "Passport Address Page" },
  { key: "visa",             col: "visa_path",             label: "Visa Page" },
  { key: "bank_statement",   col: "bank_statement_path",   label: "Bank Statement (6mo / 1yr)" },
  { key: "vat_receipt",      col: "vat_receipt_path",      label: "VAT Receipts (4 quarters)" },
  { key: "emirates_id",      col: "emirates_id_path",      label: "Emirates ID" },
];

const MAROON = "#8E1B3A";
const MAROON2 = "#C72931";

export function GovtEnquiryClient({
  slug, serviceId, serviceTitle, description, imageUrl,
}: {
  slug: string;
  serviceId: string;
  serviceTitle: string;
  description: string;
  imageUrl: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enquiry, setEnquiry] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const attachedCount = DOC_FIELDS.filter((f) => files[f.key]).length;

  function setFile(key: string, f: File | null) {
    setFiles((prev) => ({ ...prev, [key]: f }));
  }

  async function submit() {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const docPaths: Record<string, string> = {};
      for (const f of DOC_FIELDS) {
        const file = files[f.key];
        if (!file) continue;
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${slug}/${Date.now()}_${f.key}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("govt-enquiry-docs")
          .upload(path, file);
        if (upErr) throw new Error(`Upload failed for ${f.label}: ${upErr.message}`);
        docPaths[f.col] = path;
      }
      const { error } = await supabase.from("govt_service_enquiries").insert({
        vendor_type_slug: slug,
        service_id: serviceId,
        service_title: serviceTitle,
        user_id: user?.id ?? null,
        name: name.trim(),
        company_name: company.trim() || null,
        email: email.trim() || null,
        phone: phone.trim(),
        enquiry_text: enquiry.trim() || null,
        ...docPaths,
        status: "new",
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      toast.error("Error: " + (e.message ?? "Could not submit"));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#FAF8F6]">
        <Header title={serviceTitle} onBack={() => router.push(`/services/enquiry/${slug}`)} />
        <div className="mx-auto max-w-lg px-5 py-20 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-[#F0FDF4] ring-8 ring-[#F0FDF4]/40">
            <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
          </div>
          <h2 className="text-[26px] font-black tracking-tight text-neutral-900">Enquiry received</h2>
          <p className="text-neutral-500 text-[15px] mt-3 leading-relaxed">
            Thanks {name.split(" ")[0]}. Our {serviceTitle} team will review your request and reach you on{" "}
            <span className="font-semibold text-neutral-700">{phone}</span>.
          </p>
          <button
            onClick={() => router.push("/services")}
            className="mt-9 inline-flex items-center justify-center rounded-full px-7 py-3.5 text-white font-bold text-[14px] shadow-lg shadow-[#8E1B3A]/20"
            style={{ background: `linear-gradient(135deg, ${MAROON}, ${MAROON2})` }}>
            Back to services
          </button>
        </div>
      </div>
    );
  }

  const fieldCls =
    "w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8E1B3A]/15 focus:border-[#8E1B3A] transition";

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-28">
      <Header title={serviceTitle} onBack={() => router.push(`/services/enquiry/${slug}`)} />

      <div className="mx-auto max-w-lg px-5 pt-5">
        {/* Hero: image contained on a tinted panel so logos show whole */}
        {imageUrl && (
          <div className="rounded-3xl p-5 mb-5"
            style={{ background: "linear-gradient(135deg, rgba(142,27,58,0.06), rgba(199,41,49,0.04))" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={serviceTitle}
              className="w-full h-52 object-contain"
            />
          </div>
        )}

        <div className="mb-1.5">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8E1B3A]">
            Service Enquiry
          </span>
        </div>
        <h1 className="text-[24px] leading-tight font-black tracking-tight text-neutral-900">{serviceTitle}</h1>
        {description && (
          <p className="text-neutral-500 text-[14.5px] mt-2.5 leading-relaxed whitespace-pre-wrap">{description}</p>
        )}

        {/* Contact card */}
        <div className="mt-7 rounded-2xl bg-white border border-neutral-200/80 p-5 shadow-sm">
          <h2 className="text-[15px] font-bold text-neutral-900 mb-4">Your details</h2>
          <div className="space-y-3.5">
            <Field label="Name" required>
              <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Company">
              <input className={fieldCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
            </Field>
            <div className="grid grid-cols-1 gap-3.5">
              <Field label="Email">
                <input className={fieldCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
              </Field>
              <Field label="Phone" required>
                <input className={fieldCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05X XXX XXXX" />
              </Field>
            </div>
            <Field label="Your enquiry">
              <textarea
                className="w-full min-h-[110px] rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8E1B3A]/15 focus:border-[#8E1B3A] transition resize-y"
                value={enquiry}
                onChange={(e) => setEnquiry(e.target.value)}
                placeholder="Tell us what you need help with…"
              />
            </Field>
          </div>
        </div>

        {/* Documents checklist */}
        <div className="mt-5 rounded-2xl bg-white border border-neutral-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-bold text-neutral-900">Documents</h2>
            <span className="text-[12px] font-semibold text-neutral-400">
              {attachedCount} of {DOC_FIELDS.length} attached
            </span>
          </div>
          <p className="text-[12.5px] text-neutral-400 mb-4">All optional. Attach any that apply — your files are stored securely.</p>

          {/* progress bar */}
          <div className="h-1.5 w-full rounded-full bg-neutral-100 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(attachedCount / DOC_FIELDS.length) * 100}%`,
                background: `linear-gradient(90deg, ${MAROON}, ${MAROON2})`,
              }}
            />
          </div>

          <div className="space-y-2">
            {DOC_FIELDS.map((f) => (
              <FileRow key={f.key} label={f.label} file={files[f.key] ?? null} onPick={(file) => setFile(f.key, file)} />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-gradient-to-t from-[#FAF8F6] via-[#FAF8F6] to-transparent pt-6 pb-5 px-5">
        <div className="mx-auto max-w-lg">
          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-full py-4 text-white font-bold text-[15px] shadow-lg shadow-[#8E1B3A]/25 disabled:opacity-60 transition active:scale-[0.99]"
            style={{ background: `linear-gradient(135deg, ${MAROON}, ${MAROON2})` }}>
            {loading ? "Submitting…" : "Submit enquiry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-neutral-600 mb-1.5">
        {label} {required && <span className="text-[#C72931]">*</span>}
      </label>
      {children}
    </div>
  );
}

function FileRow({
  label, file, onPick,
}: { label: string; file: File | null; onPick: (f: File | null) => void }) {
  const inputId = "f_" + label.replace(/[^a-z0-9]/gi, "_");
  const attached = !!file;
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
        attached ? "border-[#8E1B3A]/30 bg-[#8E1B3A]/[0.03]" : "border-neutral-200 bg-white"
      }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        attached ? "bg-[#8E1B3A]/10" : "bg-neutral-100"
      }`}>
        {attached
          ? <Check className="w-4 h-4 text-[#8E1B3A]" />
          : <Paperclip className="w-4 h-4 text-neutral-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-neutral-700 truncate">{label}</p>
        {attached && <p className="text-[11.5px] text-neutral-400 truncate">{file!.name}</p>}
      </div>
      {attached ? (
        <button onClick={() => onPick(null)} className="text-[12px] font-semibold text-neutral-400 hover:text-[#C72931] px-1">
          Remove
        </button>
      ) : (
        <label htmlFor={inputId} className="cursor-pointer flex items-center gap-1.5 text-[12.5px] font-bold text-[#8E1B3A] px-1">
          <Upload className="w-3.5 h-3.5" /> Add
        </label>
      )}
      <input
        id={inputId}
        type="file"
        className="hidden"
        accept="image/*,application/pdf"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-30 bg-[#FAF8F6]/85 backdrop-blur-md border-b border-neutral-200/60">
      <div className="mx-auto max-w-lg px-4 h-14 flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold text-neutral-900 truncate">{title}</h1>
      </div>
    </div>
  );
}
