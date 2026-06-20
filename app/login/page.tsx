import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

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
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <Image
        src="/uaq_logo.png"
        alt="UAQ Deals"
        width={120}
        height={40}
        priority
        className="h-12 w-auto"
      />
      <h1 className="text-brand-gradient mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Welcome to UAQ Deals
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Sign in to track orders, save favourites and earn coins.
      </p>

      {error && (
        <p className="mt-4 w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t sign you in. Please try again.
        </p>
      )}

      <div className="mt-8 w-full space-y-3">
        <GoogleSignInButton next={next ?? "/account"} />

      </div>

      <p className="mt-8 max-w-xs text-xs text-neutral-500">
        By continuing you agree to UAQ Deals&apos; {" "}
        <Link href="/terms" className="underline">Terms</Link> and {" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
