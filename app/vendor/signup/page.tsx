import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorSignupForm } from "./signup-form";
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
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar with prominent Sign In */}
      <div className="sticky top-0 z-20 border-b border-neutral-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              <Store className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-neutral-900">Vendor Portal</span>
          </div>
          <Link href="/vendor/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#8E1B3A] px-4 py-1.5 text-sm font-bold text-[#8E1B3A] transition-colors hover:bg-[#8E1B3A] hover:text-white">
            Sign In <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">

          {/* Left: hero / value prop */}
          <div className="lg:pt-4">
            <div className="relative overflow-hidden rounded-3xl p-7 text-white"
              style={{ background: "linear-gradient(135deg, #8E1B3A 0%, #C72931 55%, #F24732 100%)" }}>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-14 left-10 h-36 w-36 rounded-full bg-white/5" />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[3px] text-white/70">UAQ Deals</p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Become a Vendor</h1>
                <p className="mt-3 text-sm text-white/85">Join Umm Al Quwain&apos;s super-app and start selling to customers across the emirate.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {perks.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8E1B3A]/10">
                      <Icon className="h-5 w-5 text-[#8E1B3A]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{p.title}</p>
                      <p className="text-xs text-neutral-500">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-center text-xs text-neutral-500 lg:text-left">
              Already a vendor?{" "}
              <Link href="/vendor/login" className="font-bold text-[#8E1B3A] underline">Sign in here</Link>
            </p>
          </div>

          {/* Right: signup form */}
          <div>
            <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-1 text-lg font-extrabold text-neutral-900">Create your vendor account</h2>
              <p className="mb-6 text-xs text-neutral-500">Fill in your business details — our team reviews every application.</p>
              <VendorSignupForm />
            </div>
            <p className="mt-5 text-center text-xs text-neutral-500">
              By applying you agree to UAQ Deals&apos;{" "}
              <Link href="/terms" className="underline">Terms</Link> and{" "}
              <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
