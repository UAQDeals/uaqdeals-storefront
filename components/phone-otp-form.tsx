"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const EDGE = process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1";

interface Props { next: string; }

type Step = "phone" | "otp";

export function PhoneOtpForm({ next }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // Format phone for display — accept 05X or +9715X or 9715X
  function normalizePhone(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("971")) return "+" + digits;
    if (digits.startsWith("0"))   return "+971" + digits.slice(1);
    if (digits.length === 9)      return "+971" + digits;
    return raw;
  }

  function startCountdown() {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  }

  async function sendOtp() {
    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, "");
    if (digits.length < 9) { toast.error("Enter a valid UAE phone number"); return; }
    setBusy(true);
    try {
      const res = await fetch(`${EDGE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
                   "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        body: JSON.stringify({ phone: normalized }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to send OTP");
      setVerificationId(data.verificationId);
      setStep("otp");
      startCountdown();
      toast.success("OTP sent to " + normalized);
    } catch (e: any) {
      toast.error(e.message ?? "Could not send OTP");
    } finally { setBusy(false); }
  }

  async function verifyOtp() {
    const code = otp.join("");
    if (code.length !== 6) { toast.error("Enter the 6-digit code"); return; }
    setBusy(true);
    try {
      // Step 1: verify the OTP code
      const vRes = await fetch(`${EDGE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
                   "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        body: JSON.stringify({ verificationId, code }),
      });
      const vData = await vRes.json();
      if (!vData.success) throw new Error(vData.error ?? "Invalid OTP");

      // Step 2: sign in / create user
      const sRes = await fetch(`${EDGE}/phone-signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
                   "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        body: JSON.stringify({ phone: normalizePhone(phone) }),
      });
      const sData = await sRes.json();
      if (!sData.success) throw new Error(sData.error ?? "Sign in failed");

      // Step 3: set session in the browser
      const { error: sessErr } = await supabase.auth.setSession({
        access_token:  sData.access_token,
        refresh_token: sData.refresh_token,
      });
      if (sessErr) throw sessErr;

      toast.success("Signed in!");
      router.push(next);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Verification failed");
    } finally { setBusy(false); }
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  }

  function handleOtpChange(i: number, val: string) {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next2 = [...otp];
    next2[i] = ch;
    setOtp(next2);
    if (ch && i < 5) refs[i + 1].current?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      refs[5].current?.focus();
    }
  }

  if (step === "phone") {
    return (
      <div className="w-full space-y-3">
        <div className="relative">
          <span className="absolute start-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500">
            +971
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendOtp()}
            placeholder="5X XXX XXXX"
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white ps-16 pe-4 text-sm font-semibold tracking-widest outline-none focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-maroon)]/20"
          />
        </div>
        <button
          onClick={sendOtp}
          disabled={busy || !phone.trim()}
          className="bg-brand-gradient inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm disabled:opacity-60 transition hover:opacity-90"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Phone className="h-4 w-4" /> Send OTP</>}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <p className="text-sm text-neutral-600">
        Enter the 6-digit code sent to{" "}
        <span className="font-semibold text-neutral-900">{normalizePhone(phone)}</span>
      </p>

      {/* OTP boxes */}
      <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
        {otp.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKey(i, e)}
            className="h-12 w-10 rounded-xl border border-neutral-200 bg-white text-center text-lg font-bold outline-none focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-maroon)]/20"
          />
        ))}
      </div>

      <button
        onClick={verifyOtp}
        disabled={busy || otp.join("").length !== 6}
        className="bg-brand-gradient inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm disabled:opacity-60 transition hover:opacity-90"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Verify & Sign In</>}
      </button>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <button
          onClick={() => { setStep("phone"); setOtp(["","","","","",""]); }}
          className="inline-flex items-center gap-1 hover:text-[color:var(--brand-maroon)]"
        >
          <RotateCcw className="h-3 w-3" /> Change number
        </button>
        {countdown > 0 ? (
          <span>Resend in {countdown}s</span>
        ) : (
          <button onClick={sendOtp} disabled={busy}
            className="hover:text-[color:var(--brand-maroon)] disabled:opacity-50">
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}
