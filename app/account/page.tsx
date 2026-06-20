import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = { title: "Your account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) redirect("/login?next=/account");
  const u = data.user;
  const name =
    (u.user_metadata?.name as string | undefined) ||
    (u.user_metadata?.full_name as string | undefined) ||
    u.email ||
    u.phone ||
    "there";
  const avatar = (u.user_metadata?.avatar_url as string | undefined) ?? null;
  const initial = (name?.[0] ?? "U").toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="bg-brand-gradient flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">Hi, {name.split(" ")[0]}</p>
          <p className="truncate text-sm text-neutral-600">
            {u.email ?? u.phone}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/orders"
          className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 hover:border-[color:var(--brand-maroon)]"
        >
          <p className="text-base font-semibold">My orders</p>
          <p className="mt-1 text-xs text-neutral-500">Track and reorder</p>
        </Link>
        <Link
          href="/cart"
          className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 hover:border-[color:var(--brand-maroon)]"
        >
          <p className="text-base font-semibold">Cart</p>
          <p className="mt-1 text-xs text-neutral-500">Review and checkout</p>
        </Link>
      </div>
    </div>
  );
}
