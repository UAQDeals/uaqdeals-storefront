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
      <button onClick={refresh} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
        Check Status
      </button>
      <button onClick={signOut} className="flex-1 rounded-lg bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-200">
        Sign Out
      </button>
    </div>
  );
}
