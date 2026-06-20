"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
  const [state, setState] = useState<{
    loading: boolean;
    avatar: string | null;
    initial: string | null;
  }>({ loading: true, avatar: null, initial: null });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function refresh() {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const u = data?.user;
      if (!u) {
        setState({ loading: false, avatar: null, initial: null });
        return;
      }
      const name =
        (u.user_metadata?.name as string | undefined) ||
        (u.user_metadata?.full_name as string | undefined) ||
        u.email ||
        u.phone ||
        "U";
      const avatar =
        (u.user_metadata?.avatar_url as string | undefined) ?? null;
      setState({
        loading: false,
        avatar,
        initial: (name?.[0] ?? "U").toUpperCase(),
      });
    }

    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state.loading) {
    return (
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-300"
      >
        <User className="h-5 w-5" />
      </span>
    );
  }

  if (!state.initial) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      aria-label="Account"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full"
    >
      {state.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={state.avatar}
          alt=""
          className="h-9 w-9 rounded-full object-cover ring-1 ring-neutral-200"
        />
      ) : (
        <span className="bg-brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white">
          {state.initial}
        </span>
      )}
    </Link>
  );
}
