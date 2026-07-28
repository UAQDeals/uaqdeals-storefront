import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorSignupForm } from "./signup-form";
import { Reveal } from "@/components/reveal";
import { Store, TrendingUp, Wallet, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = { title: "Become a Vendor — UAQ Deals" };

export default async function VendorSignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("status")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (vendor) {
      redirect(vendor.status === "approved" || vendor.status === "active"
        ? "/vendor/dashboard"
        : "/vendor/pending");
    }
  }

  const perks = [
    { icon: TrendingUp, title: "Reach more customers", desc: "Sell across Umm Al Quwain" },
    { icon: Wallet, title: "Fast payouts", desc: "Track earnings in real time" },
    { icon: ShieldCheck, title: "Verified marketplace", desc: "Trusted local platform" },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      {/* Top bar with prominent Sign In */}
      <div className="sticky top-0 z-20 border-b border-[color:var(--brand-border)] bg-white/80 backdrop-blur">
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/50 to-transparent" aria-hidden />
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-gradient flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-[var(--shadow-card)]">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-display text-[15px] font-semibold text-[color:var(--ink)]">Vendor Portal</span>
          </div>
          <Link href="/vendor/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--brand-maroon)] px-4 py-1.5 text-sm font-semibold text-[color:var(--brand-maroon)] transition-colors hover:bg-[color:var(--brand-maroon)] hover:text-white">
            Sign In <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">

          {/* Left: hero / value prop */}
          <div className="lg:pt-4">
            <Reveal>
            <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-7 text-white shadow-[var(--shadow-premium)]">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/15 blur-xl" />
              <div className="absolute -bottom-14 left-10 h-36 w-36 rounded-full bg-white/5" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-gold)]">UAQ Deals</p>
                <h1 className="font-display mt-2.5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Become a Vendor</h1>
                <p className="mt-3 text-sm leading-relaxed text-white/85">Join Umm Al Quwain&apos;s super-app and start selling to customers across the emirate.</p>
              </div>
            </div>
            </Reveal>

            <div className="mt-5 space-y-3">
              {perks.map((p, i) => {
                const Icon = p.icon;
                return (
                  <Reveal key={p.title} delay={80 + i * 80}>
                  <div className="premium-card flex items-center gap-3 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--brand-maroon)]/8 ring-1 ring-[color:var(--brand-gold)]/25">
                      <Icon className="h-5 w-5 text-[color:var(--brand-maroon)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--ink)]">{p.title}</p>
                      <p className="text-xs text-[color:var(--brand-muted)]">{p.desc}</p>
                    </div>
                  </div>
                  </Reveal>
                );
              })}
            </div>

            <p className="mt-5 text-center text-xs text-[color:var(--brand-muted)] lg:text-left">
              Already a vendor?{" "}
              <Link href="/vendor/login" className="font-semibold text-[color:var(--brand-maroon)] underline decoration-[color:var(--brand-gold)]/50 underline-offset-2">Sign in here</Link>
            </p>
          </div>

          {/* Right: signup form */}
          <div>
            <Reveal delay={120}>
            <div className="relative overflow-hidden rounded-3xl border border-[color:var(--brand-border)] bg-white p-6 shadow-[var(--shadow-premium)] sm:p-8">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
              <div className="mb-6 flex items-center gap-3.5">
                <span className="accent-bar h-9 w-1.5 rounded-full" />
                <div>
                  <h2 className="font-display text-lg font-semibold text-[color:var(--ink)]">Create your vendor account</h2>
                  <p className="mt-0.5 text-xs text-[color:var(--brand-muted)]">Fill in your business details — our team reviews every application.</p>
                </div>
              </div>
              <VendorSignupForm />
            </div>
            </Reveal>
            <p className="mt-5 text-center text-xs text-[color:var(--brand-muted)]">
              By applying you agree to UAQ Deals&apos;{" "}
              <Link href="/terms" className="underline decoration-[color:var(--brand-gold)]/50 underline-offset-2">Terms</Link> and{" "}
              <Link href="/privacy" className="underline decoration-[color:var(--brand-gold)]/50 underline-offset-2">Privacy Policy</Link>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
