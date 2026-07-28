import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PendingActions } from "./pending-actions";
import { Reveal } from "@/components/reveal";

export const metadata = { title: "Application Under Review — UAQ Deals" };

export default async function VendorPendingPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/vendor/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("name, status")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/signup");
  if (vendor.status === "approved" || vendor.status === "active") {
    redirect("/vendor/dashboard");
  }

  const rejected = vendor.status === "rejected";

  return (
    <div className="bg-maroon-radial relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-14 md:py-20">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
      <span className="pointer-events-none absolute -bottom-28 -start-20 h-80 w-80 rounded-full bg-black/15 blur-2xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-md px-5 text-center md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--brand-border)] bg-white p-8 shadow-[var(--shadow-premium)]">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
            {rejected ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl ring-1 ring-red-100">✕</div>
                <h1 className="font-display mt-4 text-xl font-semibold text-[color:var(--ink)]">Application Not Approved</h1>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--brand-muted)]">
                  Unfortunately your vendor application for <strong className="text-[color:var(--ink)]">{vendor.name}</strong> was not approved.
                  Please contact our team for more information.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl ring-1 ring-[color:var(--brand-gold)]/30">⏳</div>
                <h1 className="font-display mt-4 text-xl font-semibold text-[color:var(--ink)]">Application Under Review</h1>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--brand-muted)]">
                  Thanks for applying, <strong className="text-[color:var(--ink)]">{vendor.name}</strong>! Our team is reviewing your
                  application. You&apos;ll get access to your vendor dashboard once approved.
                </p>
                <p className="mt-3 text-xs text-[color:var(--brand-muted)]">
                  This usually takes 1–2 business days. You can check back anytime by signing in.
                </p>
              </>
            )}
            <div className="mt-6">
              <PendingActions />
            </div>
          </div>
        </Reveal>
        <p className="mt-6 text-xs text-white/80">
          Need help? <Link href="/contact" className="font-semibold text-[color:var(--brand-gold)] underline decoration-[color:var(--brand-gold)]/50 underline-offset-2">Contact us</Link>
        </p>
      </div>
    </div>
  );
}
