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
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
