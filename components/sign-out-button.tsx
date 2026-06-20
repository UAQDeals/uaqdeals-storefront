"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.replace("/");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
    >
      Sign out
    </button>
  );
}
