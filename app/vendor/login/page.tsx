import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorLoginForm } from "./login-form";
import { Reveal } from "@/components/reveal";

export const metadata = { title: "Vendor Sign In — UAQ Deals" };

export default async function VendorLoginPage() {
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

  return (
    <section className="bg-maroon-radial relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-14 md:py-20">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
      <span className="pointer-events-none absolute -bottom-28 -start-20 h-80 w-80 rounded-full bg-black/15 blur-2xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-md px-5 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--brand-border)] bg-white p-7 shadow-[var(--shadow-premium)] sm:p-9">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />

            <div className="mb-8 text-center">
              <h1 className="text-brand-gradient font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">Vendor Portal</h1>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[color:var(--brand-muted)]">Sign in to manage your store.</p>
            </div>
            <VendorLoginForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
