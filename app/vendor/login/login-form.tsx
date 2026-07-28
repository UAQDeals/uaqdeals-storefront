"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Mirrors the Flutter vendor app: strip non-digits, then vendor_<digits>@uaqdeals.ae
function phoneToEmail(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  return `vendor_${clean}@uaqdeals.ae`;
}

export function VendorLoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleReset() {
    setError(null);
    if (mode === "phone") {
      setError("Password reset works by email. Phone-registered vendors, please contact support at +971 54 220 5775.");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email to receive a reset link");
      return;
    }
    setSubmitting(true);
    try {
      const redirectTo = typeof window !== "undefined"
        ? window.location.origin + "/vendor/reset-password"
        : undefined;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (resetErr) throw resetErr;
      setResetSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not send reset email");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin() {
    setError(null);
    const loginEmail = mode === "phone" ? phoneToEmail(phone) : email.trim();

    if (mode === "phone" && !phone.trim()) {
      setError("Enter your phone number and password");
      return;
    }
    if (mode === "email" && !email.trim()) {
      setError("Enter your email and password");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (authErr) throw authErr;

      const userId = data.user?.id;
      const { data: vendor } = await supabase
        .from("vendors")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      if (!vendor) {
        setError("No vendor account found for this login.");
        setSubmitting(false);
        return;
      }
      router.push(
        vendor.status === "approved" || vendor.status === "active"
          ? "/vendor/dashboard"
          : "/vendor/pending"
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not sign in";
      setError(msg);
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[color:var(--brand-muted)]";

  if (resetMode) {
    return (
      <div className="space-y-4">
        {resetSent ? (
          <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-4 text-sm text-green-800">
            <p className="font-semibold">Check your inbox</p>
            <p className="mt-1 text-green-700">We sent a password reset link to <span className="font-medium">{email}</span>. Open it to set a new password.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[color:var(--brand-muted)]">Enter the email you registered with and we will send you a reset link.</p>
            {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleReset()} placeholder="you@business.com" />
            </div>
            <button onClick={handleReset} disabled={submitting} className="bg-brand-gradient w-full rounded-full py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
              {submitting ? "Sending…" : "Send Reset Link"}
            </button>
          </>
        )}
        <button type="button" onClick={() => { setResetMode(false); setError(null); setResetSent(false); }} className="w-full text-center text-xs font-semibold text-[color:var(--brand-muted)] transition-colors hover:text-[color:var(--brand-maroon)]">
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-full border border-[color:var(--brand-border)] bg-[color:var(--paper-2)] p-1">
        <button
          type="button"
          onClick={() => { setMode("email"); setError(null); }}
          className={"rounded-full py-2 text-xs font-bold transition " + (mode === "email" ? "bg-white text-[color:var(--brand-maroon)] shadow-[var(--shadow-sm)] ring-1 ring-[color:var(--brand-gold)]/25" : "text-[color:var(--brand-muted)]")}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => { setMode("phone"); setError(null); }}
          className={"rounded-full py-2 text-xs font-bold transition " + (mode === "phone" ? "bg-white text-[color:var(--brand-maroon)] shadow-[var(--shadow-sm)] ring-1 ring-[color:var(--brand-gold)]/25" : "text-[color:var(--brand-muted)]")}
        >
          Phone
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {mode === "email" ? (
        <div>
          <label className={labelCls}>Email</label>
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="you@business.com" />
        </div>
      ) : (
        <div>
          <label className={labelCls}>Phone Number</label>
          <input className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="05X XXX XXXX" />
          <p className="mt-1.5 text-[11px] text-[color:var(--brand-muted)]">Use the same number you registered with in the app.</p>
        </div>
      )}

      <div>
        <label className={labelCls}>Password</label>
        <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Your password" />
      </div>

      <div className="flex justify-end -mt-1">
        <button type="button" onClick={() => { setResetMode(true); setError(null); setResetSent(false); }} className="text-xs font-semibold text-[color:var(--brand-maroon)] hover:underline">
          Forgot password?
        </button>
      </div>

      <button onClick={handleLogin} disabled={submitting} className="bg-brand-gradient w-full rounded-full py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
        {submitting ? "Signing in…" : "Sign In"}
      </button>
      <p className="text-center text-xs text-[color:var(--brand-muted)]">
        New vendor? <a href="/vendor/signup" className="font-semibold text-[color:var(--brand-maroon)] underline decoration-[color:var(--brand-gold)]/50 underline-offset-2">Apply here</a>
      </p>
    </div>
  );
}
