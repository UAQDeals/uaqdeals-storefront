"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/locale-actions";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const other = locale === "en" ? "ar" : "en";
  const label = locale === "en" ? "عربي" : "EN";

  function switchLocale() {
    startTransition(async () => {
      await setLocale(other);
      router.refresh();
    });
  }

  return (
    <button
      onClick={switchLocale}
      disabled={pending}
      className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 px-2.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
      aria-label={`Switch to ${other === "en" ? "English" : "Arabic"}`}
    >
      {label}
    </button>
  );
}
