"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  // Recovery links from admin generateLink arrive with a ?token_hash=...&type=recovery
  // query param, which must be verified via verifyOtp. Older hash-fragment links
  // fire PASSWORD_RECOVERY via onAuthStateChange. Handle both.
  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (!cancelled) setReady(true);
      }
    });

    async function init() {
      // 0. Check the URL hash for an error (expired/invalid link)
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
      const hashParams = new URLSearchParams(hash);
      if (hashParams.get("error")) {
        const desc = hashParams.get("error_description") || "This reset link is invalid or has expired.";
        if (!cancelled) setError(decodeURIComponent(desc.replace(/\+/g, " ")));
        return;
      }

      // 1. Existing session?
      const { data: sess } = await supabase.auth.getSession();
      if (sess.session) { if (!cancelled) setReady(true); return; }

      // 2. token_hash query param (admin-generated recovery link)
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      if (tokenHash && type === "recovery") {
        const { error: vErr } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        if (!cancelled) {
          if (vErr) setError("This reset link is invalid or has expired. Please request a new one.");
          else setReady(true);
        }
        return;
      }

      // 3. Hash-fragment style (#access_token=...) — supabase-js auto-detects on load,
      //    onAuthStateChange will fire. Give it a moment; if nothing, show expired note.
      setTimeout(() => {
        if (!cancelled) {
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) setReady(true);
          });
        }
      }, 1500);
    }

    init();
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [supabase]);

  async function handleUpdate() {
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setSubmitting(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
      setDone(true);
      setTimeout(() => router.push("/vendor/login"), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not update password");
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";

  if (done) {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-4 text-sm text-green-800">
        <p className="font-semibold">Password updated</p>
        <p className="mt-1 text-green-700">Redirecting you to sign in…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-neutral-600">Verifying your reset link…</p>
        <p className="text-xs text-neutral-400">If this doesn't load, the link may have expired. Request a new one from the sign-in page.</p>
        <a href="/vendor/login" className="inline-block text-xs font-semibold text-[#8E1B3A] underline">Back to sign in</a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">New Password</label>
        <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">Confirm Password</label>
        <input className={inputCls} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleUpdate()} placeholder="Re-enter password" />
      </div>
      <button onClick={handleUpdate} disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60">
        {submitting ? "Updating…" : "Update Password"}
      </button>
    </div>
  );
}
