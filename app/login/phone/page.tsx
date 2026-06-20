import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PhoneLoginForm } from "@/components/phone-login-form";

export const metadata = { title: "Continue with phone" };

export default async function PhoneLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data?.user) redirect(next ?? "/account");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Link
        href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
        className="text-sm text-neutral-600 hover:text-[color:var(--brand-maroon)]"
      >
        ← Other sign-in options
      </Link>
      <h1 className="text-brand-gradient mt-4 text-3xl font-extrabold tracking-tight">
        Continue with phone
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        We&apos;ll text you a 6-digit code to sign in.
      </p>
      <div className="mt-8">
        <PhoneLoginForm next={next ?? "/account"} />
      </div>
    </div>
  );
}
