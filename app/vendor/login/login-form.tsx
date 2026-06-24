"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function VendorLoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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
    "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">Email</label>
        <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="you@business.com" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">Password</label>
        <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Your password" />
      </div>
      <button onClick={handleLogin} disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60">
        {submitting ? "Signing in…" : "Sign In"}
      </button>
      <p className="text-center text-xs text-neutral-500">
        New vendor? <a href="/vendor/signup" className="font-semibold text-[#8E1B3A] underline">Apply here</a>
      </p>
    </div>
  );
}
