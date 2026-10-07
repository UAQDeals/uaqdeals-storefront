import { NextResponse } from "next/server";
import { getNomodConfig } from "@/lib/payments/nomod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, no-auth status check — the Flutter app can't read payment_gateways
// directly (service-role only), so this is how it decides whether to show
// the Card/Tabby checkout options. Never returns the key or secret.
export async function GET() {
  const config = await getNomodConfig();
  return NextResponse.json({ enabled: Boolean(config) });
}
