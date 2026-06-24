"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const EMIRATES = [
  "Umm Al Quwain", "Al Hamriyah", "Dubai", "Abu Dhabi",
  "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain",
];

export function VendorSignupForm() {
  const router = useRouter();
  const supabase = createClient();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emirate, setEmirate] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [tradeLicense, setTradeLicense] = useState<File | null>(null);
  const [emiratesIdFront, setEmiratesIdFront] = useState<File | null>(null);
  const [emiratesIdBack, setEmiratesIdBack] = useState<File | null>(null);

  async function uploadDoc(userId: string, file: File, label: string) {
    const ext = file.name.split(".").pop() || "png";
    const path = `${userId}/${label}_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("vendor_documents")
      .upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    return path;
  }

  async function handleSubmit() {
    setError(null);
    if (!businessName.trim()) return setError("Business name is required");
    if (!phone.trim()) return setError("Phone number is required");
    if (!email.trim()) return setError("Email is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (!emirate) return setError("Please select an emirate");
    if (!businessType.trim()) return setError("Please describe your business type");
    if (!tradeLicense) return setError("Trade license is required");

    setSubmitting(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authErr) throw authErr;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Registration failed — please try again");

      const extraDocs: { type: string; path: string }[] = [];
      const tradeLicensePath = await uploadDoc(userId, tradeLicense, "trade_license");
      if (emiratesIdFront) {
        const p = await uploadDoc(userId, emiratesIdFront, "emirates_id_front");
        extraDocs.push({ type: "emirates_id_front", path: p });
      }
      if (emiratesIdBack) {
        const p = await uploadDoc(userId, emiratesIdBack, "emirates_id_back");
        extraDocs.push({ type: "emirates_id_back", path: p });
      }

      const { error: insErr } = await supabase.from("vendors").insert({
        user_id: userId,
        name: businessName.trim(),
        emirate,
        phone: phone.trim(),
        email: email.trim(),
        custom_fields: { business_type_note: businessType.trim() },
        address: address.trim() || null,
        description: description.trim() || null,
        status: "pending",
        trade_license_url: tradeLicensePath,
        extra_documents: extraDocs.length > 0 ? extraDocs : null,
      });
      if (insErr) throw insErr;

      router.push("/vendor/pending");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";
  const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600";

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className={labelCls}>Business Name *</label>
        <input className={inputCls} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Al Noor Electronics" />
      </div>

      <div>
        <label className={labelCls}>Contact Person</label>
        <input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Phone *</label>
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Password *</label>
        <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Emirate *</label>
          <select className={inputCls} value={emirate} onChange={(e) => setEmirate(e.target.value)}>
            <option value="">Select emirate</option>
            {EMIRATES.map((em) => (<option key={em} value={em}>{em}</option>))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Business Type *</label>
          <input className={inputCls} value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g. Electronics, Grocery, Pharmacy" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Business Address</label>
        <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, emirate" />
      </div>

      <div>
        <label className={labelCls}>About Your Business</label>
        <textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you sell or offer?" />
      </div>

      <div className="rounded-lg border border-dashed border-neutral-300 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">Documents</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-600">Trade License * (PDF or image)</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setTradeLicense(e.target.files?.[0] ?? null)} className="block w-full text-xs text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#8E1B3A] file:px-3 file:py-1.5 file:text-xs file:text-white" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-neutral-600">Emirates ID — Front</label>
              <input type="file" accept="image/*" onChange={(e) => setEmiratesIdFront(e.target.files?.[0] ?? null)} className="block w-full text-xs text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-xs" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-600">Emirates ID — Back</label>
              <input type="file" accept="image/*" onChange={(e) => setEmiratesIdBack(e.target.files?.[0] ?? null)} className="block w-full text-xs text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-xs" />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60">
        {submitting ? "Submitting application…" : "Submit Vendor Application"}
      </button>

      <p className="text-center text-xs text-neutral-500">
        Already a vendor? <a href="/vendor/login" className="font-semibold text-[#8E1B3A] underline">Sign in</a>
      </p>
    </div>
  );
}
