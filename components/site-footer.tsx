import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("common");
  return (
    <footer className="border-t border-[color:var(--brand-border)] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-neutral-600 sm:flex-row">
        <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/about" className="hover:text-[color:var(--brand-maroon)]">{t("about")}</Link>
          <Link href="/contact" className="hover:text-[color:var(--brand-maroon)]">{t("contact")}</Link>
          <Link href="/terms" className="hover:text-[color:var(--brand-maroon)]">{t("terms")}</Link>
          <Link href="/privacy" className="hover:text-[color:var(--brand-maroon)]">{t("privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}
