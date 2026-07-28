"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PendingActions() {
  const router = useRouter();
  const supabase = createClient();

  async function refresh() {
    router.refresh();
  }
  async function signOut() {
    await supabase.auth.signOut();
    router.push("/vendor/login");
  }

  return (
    <div className="flex gap-3">
      <button onClick={refresh} className="bg-brand-gradient flex-1 rounded-full py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
        Check Status
      </button>
      <button onClick={signOut} className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2.5 text-sm font-semibold text-[color:var(--brand-muted)] transition hover:bg-[color:var(--paper-2)]">
        Sign Out
      </button>
    </div>
  );
}
