import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getNomodConfig, createNomodCheckout, type NomodCheckoutItem } from "@/lib/payments/nomod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vendors top up their wallet from the Flutter vendor app. The wallet is the
// single money-in point — B2B purchases and promotions both debit it. This
// starts a Nomod hosted-checkout session for an arbitrary amount; the webhook
// (/api/webhooks/nomod) credits the wallet once the charge completes.
const MIN_TOPUP = 10;      // AED — below this isn't worth a card fee
const MAX_TOPUP = 50000;   // AED — guardrail against fat-finger / abuse

// Web callers send a session cookie; the Flutter app has no cookies and sends
// its Supabase access token as a Bearer header instead.
async function resolveUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (bearerToken) {
    const client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: { user } } = await client.auth.getUser(bearerToken);
    return user;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: Request) {
  const user = await resolveUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json().catch(() => ({ amount: null }));
  const topupAmount = Number(amount);
  if (!Number.isFinite(topupAmount) || topupAmount < MIN_TOPUP || topupAmount > MAX_TOPUP) {
    return NextResponse.json(
      { error: `Enter an amount between AED ${MIN_TOPUP} and AED ${MAX_TOPUP}.` },
      { status: 400 },
    );
  }
  // Nomod amounts carry 2 decimals; keep ours consistent so the charged total
  // always equals what we credit.
  const roundedAmount = Math.round(topupAmount * 100) / 100;

  const config = await getNomodConfig();
  if (!config) return NextResponse.json({ error: "Online payment is not available right now." }, { status: 409 });

  const svc = createServiceClient();

  // Resolve the vendor this user owns — never trust a vendor id from the client.
  const { data: vendor } = await svc
    .from("vendors")
    .select("id, name, phone, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) return NextResponse.json({ error: "Vendor account not found." }, { status: 403 });

  // Record the pending top-up first; its id is the Nomod reference the webhook
  // reads back to credit the right wallet.
  const { data: topup, error: topupErr } = await svc
    .from("vendor_wallet_topups")
    .insert({ vendor_id: vendor.id, amount: roundedAmount, currency: "AED", status: "pending" })
    .select("id")
    .single();

  if (topupErr || !topup) {
    return NextResponse.json({ error: "Couldn't start the top-up. Please try again." }, { status: 500 });
  }

  // "wtop_" prefix lets the shared Nomod webhook tell wallet top-ups apart from
  // order payments (which use a bare order UUID as the reference).
  const referenceId = `wtop_${topup.id}`;

  const businessName = (vendor.name as string | null)?.trim() || "Vendor";
  const items: NomodCheckoutItem[] = [{
    item_id: "wallet_topup",
    name: "Wallet top-up",
    quantity: 1,
    unit_amount: roundedAmount.toFixed(2),
    total_amount: roundedAmount.toFixed(2),
    net_amount: roundedAmount.toFixed(2),
  }];

  const origin = new URL(req.url).origin;
  try {
    const session = await createNomodCheckout({
      apiKey: config.apiKey,
      referenceId,
      amount: roundedAmount,
      currency: "AED",
      items,
      customer: {
        first_name: businessName,
        last_name: "Wallet",
        email: (vendor.email as string | null) || user.email || "",
        phone_number: (vendor.phone as string | null) || "",
      },
      successUrl: `${origin}/wallet-topup?status=success`,
      failureUrl: `${origin}/wallet-topup?status=failed`,
      cancelledUrl: `${origin}/wallet-topup?status=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Leave the topup row as 'pending'; it never credits without a webhook, and
    // a failed start is harmless noise that admin can see in the table.
    const msg = err instanceof Error ? err.message : "Failed to start the top-up.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
