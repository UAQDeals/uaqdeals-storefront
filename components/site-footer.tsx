import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--brand-border)] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-neutral-600 sm:flex-row">
        <p>© {new Date().getFullYear()} UAQ Deals</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/about" className="hover:text-[color:var(--brand-maroon)]">About</Link>
          <Link href="/contact" className="hover:text-[color:var(--brand-maroon)]">Contact</Link>
          <Link href="/terms" className="hover:text-[color:var(--brand-maroon)]">Terms</Link>
          <Link href="/privacy" className="hover:text-[color:var(--brand-maroon)]">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
