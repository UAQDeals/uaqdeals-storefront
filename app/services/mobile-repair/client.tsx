"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Smartphone, User, Phone, MapPin, Upload, X,
  CheckCircle, Wrench, Clock, ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function MobileRepairClient() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [issue, setIssue] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!name.trim() || !phone.trim()) { toast.error("Please enter your name and phone"); return; }
    if (!issue.trim()) { toast.error("Please describe the issue"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Optional photo upload to the public-assets bucket
      let photoUrl = "";
      if (photo) {
        const ext = photo.name.split(".").pop() ?? "jpg";
        const path = `mobile-repair/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("public-assets").upload(path, photo);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from("public-assets").getPublicUrl(path);
          photoUrl = publicUrl;
        }
      }

      // service_enquiries has name/phone/message — fold address+issue+photo into message
      const message =
        `Issue: ${issue.trim()}` +
        (address.trim() ? ` | Address: ${address.trim()}` : "") +
        (photoUrl ? ` | Photo: ${photoUrl}` : "");

      const { error } = await supabase.from("service_enquiries").insert({
        user_id: user?.id ?? null,
        service_title: "Mobile Repair",
        name: name.trim(),
        phone: phone.trim(),
        message,
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

  const inputCls = "w-full h-12 rounded-xl border border-neutral-300 px-4 text-sm focus:outline-none focus:border-[#8E1B3A] bg-neutral-50";

  if (done) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header onBack={() => router.back()} />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#16A34A" }} />
          </div>
          <h2 className="text-[22px] font-extrabold text-neutral-900">Request Received!</h2>
          <p className="text-neutral-500 text-[14px] mt-2 leading-relaxed">
            Thanks {name.split(" ")[0]}! Our repair team will review your request and contact you shortly on {phone}.
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
      <Header onBack={() => router.back()} />

      {/* Hero */}
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold leading-tight">Mobile Repair</h1>
              <p className="text-white/80 text-[13px]">Fast, reliable phone & device repairs</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-[12px]">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Same-day service</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Warranty included</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4" style={{ color: "#8E1B3A" }} />
          <h2 className="text-[15px] font-bold text-neutral-800">Tell us what needs fixing</h2>
        </div>

        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *" className={inputCls + " pl-11"} />
        </div>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number *" type="tel" className={inputCls + " pl-11"} />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address (for pickup / on-site)" className={inputCls + " pl-11"} />
        </div>

        <textarea value={issue} onChange={e => setIssue(e.target.value)} rows={4}
          placeholder="Describe the issue * — e.g. cracked screen, battery draining, won't charge…"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-[#8E1B3A] bg-neutral-50" />

        {/* Photo upload (optional) */}
        <div>
          <p className="text-[13px] font-semibold text-neutral-700 mb-2">Photo of the device (optional)</p>
          {photo ? (
            <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}>
              <CheckCircle className="w-4 h-4" style={{ color: "#16A34A" }} />
              <span className="flex-1 text-[12px] font-semibold truncate" style={{ color: "#16A34A" }}>{photo.name}</span>
              <button onClick={() => setPhoto(null)}><X className="w-4 h-4 text-red-500" /></button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed cursor-pointer hover:bg-neutral-50" style={{ borderColor: "#8E1B3A" }}>
              <Upload className="w-4 h-4" style={{ color: "#8E1B3A" }} />
              <span className="text-[13px] font-semibold" style={{ color: "#8E1B3A" }}>Upload a photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full h-12 rounded-xl text-white font-extrabold text-[14px] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
          {loading ? "Submitting…" : "Request Repair"}
        </button>
        <p className="text-center text-[12px] text-neutral-400">We&apos;ll contact you back to confirm details and pricing.</p>
      </div>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="sticky top-0 z-30" style={{ background: "linear-gradient(to right, #C72931, #8E1B3A)" }}>
      <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg bg-white/10">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Mobile Repair</h1>
      </div>
    </div>
  );
}
