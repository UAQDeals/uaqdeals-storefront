import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { PhoneOtpForm } from "@/components/phone-otp-form";
import { Reveal } from "@/components/reveal";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data?.user) redirect(next ?? "/account");

  return (
    <section className="bg-maroon-radial relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-14 md:py-20">
      {/* gold hairline + soft decorative glows */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
      <span className="pointer-events-none absolute -bottom-28 -start-20 h-80 w-80 rounded-full bg-black/15 blur-2xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-md px-5 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--brand-border)] bg-white p-7 shadow-[var(--shadow-premium)] sm:p-9">
            {/* gold hairline accent along the card top */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />

            <div className="text-center">
              <h1 className="text-brand-gradient font-display text-[30px] font-semibold tracking-tight sm:text-[36px]">
                Welcome to UAQ Deals
              </h1>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[color:var(--brand-muted)]">
                Sign in to track orders, save favourites and earn coins.
              </p>
            </div>

            {error && (
              <p className="mt-6 w-full rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-center text-[13px] font-medium text-red-700">
                Couldn&apos;t sign you in. Please try again.
              </p>
            )}

            <div className="mt-8 space-y-5">
              {/* Primary: phone OTP */}
              <div>
                <p className="eyebrow mb-3 text-start">Sign in with phone</p>
                <PhoneOtpForm next={next ?? "/account"} />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <span className="gold-rule h-px flex-1" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--brand-muted)]">
                  or
                </span>
                <span className="gold-rule h-px flex-1" />
              </div>

              {/* Secondary: Google */}
              <GoogleSignInButton next={next ?? "/account"} />
            </div>

            <p className="mx-auto mt-8 max-w-xs text-center text-[12px] leading-relaxed text-[color:var(--brand-muted)]">
              By continuing you agree to UAQ Deals&apos;{" "}
              <Link href="/terms" className="font-semibold text-[color:var(--brand-maroon)] underline decoration-[color:var(--brand-gold)]/50 underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[color:var(--brand-maroon)] underline decoration-[color:var(--brand-gold)]/50 underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
