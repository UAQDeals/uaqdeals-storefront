import { ResetPasswordForm } from "./reset-form";
import { Reveal } from "@/components/reveal";

export const metadata = { title: "Reset Password — UAQ Deals Vendor" };

export default function ResetPasswordPage() {
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
              <h1 className="text-brand-gradient font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">Set New Password</h1>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[color:var(--brand-muted)]">Choose a new password for your vendor account.</p>
            </div>
            <ResetPasswordForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
