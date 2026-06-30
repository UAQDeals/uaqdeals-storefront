"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, MapPin, Clock, FileText, Building2 } from "lucide-react";

const DAYS = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS: Record<string,string> = { mon:"Monday", tue:"Tuesday", wed:"Wednesday", thu:"Thursday", fri:"Friday", sat:"Saturday", sun:"Sunday" };

const defaultHours = () => Object.fromEntries(DAYS.map(d => [d, { open: "09:00", close: "18:00", closed: false }]));

const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";
const labelCls = "block text-xs font-medium text-neutral-600 mb-1";

type Section = "storefront" | "contact" | "hours" | "documents";

export function BusinessProfileManager({ vendorId }: { vendorId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<Section>("storefront");
  const [vendor, setVendor] = useState<any>(null);

  // Storefront
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Contact
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  // Hours
  const [hours, setHours] = useState<any>(defaultHours());

  // Documents
  const [documents, setDocuments] = useState<string[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const docRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadVendor(); }, []);

  async function loadVendor() {
    setLoading(true);
    const { data: v } = await supabase.from("vendors").select("*").eq("id", vendorId).single();
    if (!v) { setLoading(false); return; }
    setVendor(v);
    setName(v.name ?? "");
    setAddress(v.address ?? "");
    setLogoPreview(v.logo_url ?? null);
    setCoverPreview(v.cover_url ?? null);
    const cf = v.contact_info ?? {};
    setOwnerPhone(cf.owner_phone ?? "");
    setHours(v.hours && typeof v.hours === "object" ? { ...defaultHours(), ...v.hours } : defaultHours());
    setDocuments(Array.isArray(v.extra_documents) ? v.extra_documents : []);
    setLoading(false);
  }

  async function uploadImage(file: File, bucket: string, path: string) {
    await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: true });
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function save() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? vendorId;
      const update: any = { name, address, hours, contact_info: { ...(vendor?.contact_info ?? {}), owner_phone: ownerPhone } };

      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        update.logo_url = await uploadImage(logoFile, "vendor_logos", `${userId}/logo.${ext}`);
      }
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        update.cover_url = await uploadImage(coverFile, "vendor_logos", `${userId}/cover.${ext}`);
      }
      if (docFile) {
        const ext = docFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const docUrl = await uploadImage(docFile, "vendor_documents", path);
        update.extra_documents = [...documents, docUrl];
        setDocuments(update.extra_documents);
        setDocFile(null);
      }

      const { error } = await supabase.from("vendors").update(update).eq("id", vendorId);
      if (error) throw error;
      setVendor((v: any) => ({ ...v, ...update }));
      if (logoFile) { setLogoPreview(update.logo_url); setLogoFile(null); }
      if (coverFile) { setCoverPreview(update.cover_url); setCoverFile(null); }
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally { setSaving(false); }
  }

  function setHour(day: string, field: string, value: any) {
    setHours((h: any) => ({ ...h, [day]: { ...h[day], [field]: value } }));
  }

  const tabs: { id: Section; label: string; icon: any }[] = [
    { id: "storefront", label: "Storefront", icon: Building2 },
    { id: "contact", label: "Contact", icon: MapPin },
    { id: "hours", label: "Hours", icon: Clock },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8E1B3A]" size={24} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Business Profile</h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving && <Loader2 size={14} className="animate-spin" />}Save changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSection(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${section === t.id ? "bg-white text-[#8E1B3A] shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {section === "storefront" && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Store name</label>
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your business name" />
          </div>
          <div>
            <label className={labelCls}>Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-neutral-50 cursor-pointer flex items-center justify-center" onClick={() => logoRef.current?.click()}>
                {logoPreview ? <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" /> : <Building2 size={24} className="text-neutral-300" />}
              </div>
              <button onClick={() => logoRef.current?.click()} className="text-sm text-[#8E1B3A] font-medium">Upload logo</button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }}} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Cover image</label>
            <div className="relative h-36 w-full overflow-hidden rounded-xl border bg-neutral-50 cursor-pointer flex items-center justify-center" onClick={() => coverRef.current?.click()}>
              {coverPreview ? <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" /> : <span className="text-sm text-neutral-400">Click to upload cover</span>}
            </div>
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }}} />
          </div>
        </div>
      )}

      {section === "contact" && (
        <div className="space-y-4">
          <div><label className={labelCls}>Address</label><input className={inputCls} value={address} onChange={e => setAddress(e.target.value)} placeholder="Full business address" /></div>
          <div><label className={labelCls}>Owner phone</label><input className={inputCls} value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="+971 50 000 0000" /></div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500 mb-2">📍 Map location pin</p>
            <p className="text-sm text-neutral-700">
              {vendor?.location_lat && vendor?.location_lng
                ? `Lat: ${vendor.location_lat.toFixed(6)}, Lng: ${vendor.location_lng.toFixed(6)}`
                : "No location set"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Use the vendor mobile app to update the map pin (tap "Edit location").</p>
          </div>
        </div>
      )}

      {section === "hours" && (
        <div className="space-y-2">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <span className="w-24 text-sm font-medium text-neutral-700">{DAY_LABELS[day]}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={!hours[day]?.closed} onChange={e => setHour(day, "closed", !e.target.checked)} className="accent-[#8E1B3A]" />
                <span className="text-xs text-neutral-600">Open</span>
              </label>
              {!hours[day]?.closed && (
                <>
                  <input type="time" value={hours[day]?.open ?? "09:00"} onChange={e => setHour(day, "open", e.target.value)}
                    className="rounded-lg border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-[#8E1B3A]" />
                  <span className="text-xs text-neutral-400">to</span>
                  <input type="time" value={hours[day]?.close ?? "18:00"} onChange={e => setHour(day, "close", e.target.value)}
                    className="rounded-lg border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-[#8E1B3A]" />
                </>
              )}
              {hours[day]?.closed && <span className="text-xs text-neutral-400">Closed</span>}
            </div>
          ))}
        </div>
      )}

      {section === "documents" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {documents.length === 0 && <p className="text-sm text-neutral-400">No documents uploaded yet.</p>}
            {documents.map((url, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <FileText size={16} className="text-[#8E1B3A] shrink-0" />
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-sm text-blue-600 hover:underline">Document {i + 1}</a>
                <button onClick={() => setDocuments(d => d.filter((_, j) => j !== i))} className="text-xs text-red-500 font-medium">Remove</button>
              </div>
            ))}
          </div>
          <div className="rounded-xl border-2 border-dashed border-neutral-300 p-6 text-center cursor-pointer" onClick={() => docRef.current?.click()}>
            <FileText size={24} className="mx-auto text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-500">{docFile ? docFile.name : "Click to upload a document (PDF, image)"}</p>
            <input ref={docRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
      )}
    </div>
  );
}
