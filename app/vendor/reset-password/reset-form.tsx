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

  // Supabase puts the recovery token in the URL hash; the client picks it up
  // and fires a PASSWORD_RECOVERY event, establishing a temporary session.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Also check if a session already exists (link already processed)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
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
        <p className="mt-1 text-green-700">Redirecting you to sign in\u2026</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-neutral-600">Verifying your reset link\u2026</p>
        <p className="text-xs text-neutral-400">If this doesn\u2019t load, the link may have expired. Request a new one from the sign-in page.</p>
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
        {submitting ? "Updating\u2026" : "Update Password"}
      </button>
    </div>
  );
}
