import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Paths that must remain reachable even without an emirate chosen.
const EMIRATE_EXEMPT = [
  "/select-emirate",
  "/auth",
  "/login",
  "/vendor",
  "/api",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasEmirate = request.cookies.has("emirate");
  const isExempt = EMIRATE_EXEMPT.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));

  // First-visit: no emirate selected yet → send to the selector.
  if (!hasEmirate && !isExempt) {
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
