/**
 * Root Suspense fallback — shown while a server-rendered route is fetching
 * data during navigation. The top progress bar (TopLoader) covers the quick
 * transitions; this covers pages with a longer data delay.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-[color:var(--brand-border)] border-t-[color:var(--brand-maroon)]"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
