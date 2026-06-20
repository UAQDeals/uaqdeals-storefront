"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function normalizePhone(raw: string): string | null {
  // Accept "0501234567", "501234567", "+971501234567" → E.164 +9715XXXXXXXX
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return "+" + digits.slice(2);
  if (digits.startsWith("971")) return "+" + digits;
  if (digits.startsWith("0")) return "+971" + digits.slice(1);
  if (digits.length === 9 && digits.startsWith("5")) return "+971" + digits;
  return null;
}

export function PhoneLoginForm({ next = "/account" }: { next?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      toast.error("Enter a valid UAE mobile number");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalized,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSentTo(normalized);
    setStep("code");
    toast.success("Code sent");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 4) return toast.error("Enter the code we sent you");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: sentTo,
      token: code.trim(),
      type: "sms",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    router.replace(next);
    router.refresh();
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendCode} className="space-y-4">
        <div>
          <label
            htmlFor="phone"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            Mobile number
          </label>
          <input
            id="phone"
            type="tel"
            autoFocus
            inputMode="tel"
            placeholder="050 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-base outline-none focus:border-[color:var(--brand-maroon)]"
          />
          <p className="mt-1 text-xs text-neutral-500">
            UAE numbers only. We&apos;ll add +971 automatically.
          </p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-brand-gradient inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      <p className="text-sm text-neutral-600">
        Code sent to <span className="font-semibold">{sentTo}</span>.{" "}
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="text-[color:var(--brand-maroon)] underline"
        >
          Change
        </button>
      </p>
      <div>
        <label
          htmlFor="code"
          className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
        >
          6-digit code
        </label>
        <input
          id="code"
          autoFocus
          inputMode="numeric"
          maxLength={8}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-center text-2xl font-bold tracking-[0.4em] outline-none focus:border-[color:var(--brand-maroon)]"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="bg-brand-gradient inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Verifying…" : "Verify & sign in"}
      </button>
    </form>
  );
}
