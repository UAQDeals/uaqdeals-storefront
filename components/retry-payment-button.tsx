"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function RetryPaymentButton({ orderId, label }: { orderId: string; label: string }) {
  const [busy, setBusy] = useState(false);

  async function retry() {
    setBusy(true);
    try {
      const res = await fetch("/api/payments/nomod/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) {
        toast.error(body.error ?? "Couldn't start payment. Please try again.");
        setBusy(false);
        return;
      }
      window.location.assign(body.url);
    } catch {
      toast.error("Couldn't start payment. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={retry}
      disabled={busy}
      className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}
