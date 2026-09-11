import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Paths that must remain reachable even without an emirate chosen.
const EMIRATE_EXEMPT = [
  "/select-emirate",
  "/auth",
  "/login",
  "/vendor",
  "/api",
  "/privacy",
  "/terms",
  "/refund",
];

// Admin-editable via Content > Redirects (retiring old URLs without a code
// deploy). A single indexed lookup — fails open (no redirect) on any error
// or timeout so a slow/unreachable Supabase never blocks a request.
async function findRedirect(pathname: string): Promise<{ to: string; status: number } | null> {
  try {
    const url =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/redirects` +
      `?from_path=eq.${encodeURIComponent(pathname)}&is_active=eq.true&select=to_path,status_code&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      signal: AbortSignal.timeout(1200),
    });
    if (!res.ok) return null;
    const rows: { to_path: string; status_code: number }[] = await res.json();
    return rows.length ? { to: rows[0].to_path, status: rows[0].status_code } : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const redirectMatch = await findRedirect(pathname);
  if (redirectMatch) {
    const dest = /^https?:\/\//i.test(redirectMatch.to) ? redirectMatch.to : new URL(redirectMatch.to, request.url);
    return NextResponse.redirect(dest, redirectMatch.status);
  }

  const hasEmirate = request.cookies.has("emirate");
  const isExempt = EMIRATE_EXEMPT.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));

  // Travelpayouts site verification appends init_marker/init_trs to the home
  // URL; the redirect below would strip the query string, so let it through
  // (unchanged) so the Travelpayouts Drive script can read the params.
  const isTpVerify =
    request.nextUrl.searchParams.has("init_marker") ||
    request.nextUrl.searchParams.has("init_trs");

  // First-visit: no emirate selected yet → send to the selector.
  if (!hasEmirate && !isExempt && !isTpVerify) {
    const url = request.nextUrl.clone();
    url.pathname = "/select-emirate";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match every request except:
     * - _next/static, _next/image
     * - favicon, public images, fonts
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
