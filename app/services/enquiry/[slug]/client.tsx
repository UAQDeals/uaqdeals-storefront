"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, X, CheckCircle, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// field key -> { column in govt_service_enquiries, label }
const DOC_FIELDS: { key: string; col: string; label: string }[] = [
  { key: "trade_license",    col: "trade_license_path",    label: "Trade License Copy" },
  { key: "passport",         col: "passport_path",         label: "Passport Copy" },
  { key: "passport_address", col: "passport_address_path", label: "Passport Address Page" },
  { key: "visa",             col: "visa_path",             label: "Visa Page" },
  { key: "bank_statement",   col: "bank_statement_path",   label: "Bank Statement (6mo / 1yr)" },
  { key: "vat_receipt",      col: "vat_receipt_path",      label: "VAT Receipts (last 4 quarters)" },
  { key: "emirates_id",      col: "emirates_id_path",      label: "Emirates ID Copy" },
];

export function GovtEnquiryClient({
  slug, title, tagline,
}: { slug: string; title: string; tagline: string }) {
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

      // Upload each provided file to the PRIVATE bucket; keep the path.
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

  const inputCls =
    "w-full h-12 rounded-xl border border-neutral-300 px-4 text-sm focus:outline-none focus:border-[#8E1B3A] bg-neutral-50";

  if (done) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title={title} onBack={() => router.back()} />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#16A34A" }} />
          </div>
          <h2 className="text-[22px] font-extrabold text-neutral-900">Enquiry Received!</h2>
          <p className="text-neutral-500 text-[14px] mt-2 leading-relaxed">
            Thanks {name.split(" ")[0]}! Our {title} team will review your enquiry and contact you shortly on {phone}.
          </p>
          <button onClick={() => router.push("/services")}
            className="mt-8 inline-block rounded-xl px-6 py-3 text-white font-bold text-[14px]"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title={title} onBack={() => router.back()} />
      <div className="mx-auto max-w-lg px-4 py-6">
        <p className="text-neutral-500 text-[14px] mb-6">{tagline}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
              Name <span className="text-[#C72931]">*</span>
            </label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5">Company Name</label>
            <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5">Email</label>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
              Phone Number <span className="text-[#C72931]">*</span>
            </label>
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05X XXX XXXX" />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5">Your Enquiry</label>
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-[#8E1B3A] bg-neutral-50"
              value={enquiry}
              onChange={(e) => setEnquiry(e.target.value)}
              placeholder="Tell us what you need help with..."
            />
          </div>

          <div className="pt-2">
            <p className="text-[13px] font-semibold text-neutral-700 mb-1">Documents (all optional)</p>
            <p className="text-[12px] text-neutral-400 mb-3">Upload any that apply. Your files are stored securely.</p>
            <div className="space-y-2">
              {DOC_FIELDS.map((f) => (
                <FileRow key={f.key} label={f.label} file={files[f.key] ?? null} onPick={(file) => setFile(f.key, file)} />
              ))}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-xl py-3.5 text-white font-bold text-[15px] mt-4 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
            {loading ? "Submitting..." : "Submit Enquiry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FileRow({
  label, file, onPick,
}: { label: string; file: File | null; onPick: (f: File | null) => void }) {
  const inputId = "f_" + label.replace(/[^a-z0-9]/gi, "_");
  return (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-neutral-700 truncate">{label}</p>
        {file && <p className="text-[11px] text-neutral-400 truncate">{file.name}</p>}
      </div>
      {file ? (
        <button onClick={() => onPick(null)} className="p-1 text-neutral-400 hover:text-[#C72931]">
          <X className="w-4 h-4" />
        </button>
      ) : (
        <label htmlFor={inputId} className="cursor-pointer flex items-center gap-1 text-[12px] font-semibold text-[#8E1B3A]">
          <Upload className="w-3.5 h-3.5" /> Upload
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
    <div className="sticky top-0 z-10 bg-white border-b border-neutral-100">
      <div className="mx-auto max-w-lg px-4 h-14 flex items-center gap-2">
        <button onClick={onBack} className="p-1 -ml-1 text-neutral-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-extrabold text-neutral-900">{title}</h1>
      </div>
    </div>
  );
}
