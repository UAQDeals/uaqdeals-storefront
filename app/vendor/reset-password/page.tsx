import { ResetPasswordForm } from "./reset-form";

export const metadata = { title: "Reset Password — UAQ Deals Vendor" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-brand-gradient text-3xl font-extrabold tracking-tight">Set New Password</h1>
        <p className="mt-2 text-sm text-neutral-600">Choose a new password for your vendor account.</p>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
