/**
 * Root Suspense fallback — shown while a server-rendered route is fetching
 * data during navigation. The top progress bar (TopLoader) covers the quick
 * transitions; this covers pages with a longer data delay.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[80dvh] w-full flex-col items-center justify-center gap-4">
      <div
        className="h-11 w-11 animate-spin rounded-full border-[3px] border-[color:var(--brand-border)] border-t-[color:var(--brand-maroon)]"
        role="status"
        aria-label="Loading"
      />
      <p className="font-display text-[14px] text-[color:var(--brand-muted)]">Loading…</p>
    </div>
  );
}
