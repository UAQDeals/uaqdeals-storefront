import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NomodChargeEvent = {
  type: string;
  eventId: string;
  objectId: string;
  data: {
    id: string;
    referenceId: string | number;
    status: string;
    total: string | number;
    currency: string;
    paymentMethod: string | null;
  };
};

// Nomod's payment_method granularity (card / tabby / apple pay / google pay /
// tamara / ...) doesn't line up 1:1 with our fixed `payment_method` enum
// (cod, card, tabby, coins, wallet) — only Tabby gets its own bucket there,
// everything else (card, Apple Pay, Google Pay, Tamara, ...) maps to 'card'.
function mapPaymentMethod(nomodMethod: string | null): "card" | "tabby" {
  return (nomodMethod ?? "").toLowerCase() === "tabby" ? "tabby" : "card";
}

// Credits a vendor's wallet for a completed Nomod top-up. The topup row is the
// source of truth for the amount (never trust the webhook's total): we only act
// on a row that's still 'pending', which also dedupes webhook retries.
async function handleWalletTopup(
  svc: ReturnType<typeof createServiceClient>,
  topupId: string,
  eventType: string,
  charge: { chargeId: string; amount: number; currency: string },
) {
  const { data: topup } = await svc
    .from("vendor_wallet_topups")
    .select("id, vendor_id, amount, status")
    .eq("id", topupId)
    .maybeSingle();

  if (!topup) return NextResponse.json({ ok: true }); // unknown ref — ack, don't retry

  switch (eventType) {
    case "charge.completed": {
      if (topup.status === "paid") return NextResponse.json({ ok: true }); // already credited
      const creditAmount = Number(topup.amount);
      // Credit atomically via the same RPC the rest of the app uses; it writes
      // the ledger row and updates vendors.wallet_balance in one transaction.
      const { error: creditErr } = await svc.rpc("adjust_vendor_wallet", {
        p_vendor_id: topup.vendor_id,
        p_type: "credit",
        p_amount: creditAmount,
        p_description: "Wallet top-up via Nomod",
        p_reference_type: "topup",
        p_reference_id: topup.id,
      });
      if (creditErr) {
        // Don't mark paid — let Nomod retry the webhook so we don't drop a credit.
        return NextResponse.json({ error: "Failed to credit wallet" }, { status: 500 });
      }
      await svc
        .from("vendor_wallet_topups")
        .update({
          status: "paid",
          gateway_ref: charge.chargeId,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", topup.id);
      break;
    }
    case "charge.failed":
    case "charge.cancelled": {
      if (topup.status === "pending") {
        await svc
          .from("vendor_wallet_topups")
          .update({ status: "failed", gateway_ref: charge.chargeId, updated_at: new Date().toISOString() })
          .eq("id", topup.id);
      }
      break;
    }
    default:
      // charge.created / refunds / disputes — no wallet action; refunds on
      // top-ups are handled manually (would require a debit + payout reversal).
      break;
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: gateway } = await svc
    .from("payment_gateways")
    .select("webhook_signing_secret")
    .eq("provider", "nomod")
    .maybeSingle();

  if (!gateway?.webhook_signing_secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: NomodChargeEvent;
  try {
    const wh = new Webhook(gateway.webhook_signing_secret);
    // verify() only validates the signature (throws on failure) — it doesn't
    // return the parsed payload, so parse the already-verified raw body.
    wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
    event = JSON.parse(rawBody) as NomodChargeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const reference = String(event.data.referenceId);
  const chargeId = event.data.id;
  const amount = Number(event.data.total) || 0;
  const currency = event.data.currency || "AED";
  const method = mapPaymentMethod(event.data.paymentMethod);

  // Vendor wallet top-ups (started by /api/payments/wallet/nomod/create-topup)
  // carry a "wtop_<topupId>" reference instead of a bare order UUID. They credit
  // the vendor wallet rather than flipping an order's payment_status.
  if (reference.startsWith("wtop_")) {
    return handleWalletTopup(svc, reference.slice(5), event.type, { chargeId, amount, currency });
  }

  const orderId = reference;

  async function recordPayment(status: "paid" | "failed" | "refunded", notes?: string) {
    // Dedupe webhook retries: skip if we've already logged this exact
    // charge+status combination.
    const { data: existing } = await svc
      .from("payments")
      .select("id")
      .eq("gateway_ref", chargeId)
      .eq("status", status)
      .maybeSingle();
    if (existing) return;

    await svc.from("payments").insert({
      order_id: orderId,
      method,
      status,
      amount,
      currency,
      gateway_ref: chargeId,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      recon_notes: notes ?? null,
    });
  }

  switch (event.type) {
    case "charge.completed": {
      await svc
        .from("orders")
        .update({ payment_status: "paid", updated_at: new Date().toISOString() })
        .or(`id.eq.${orderId},parent_order_id.eq.${orderId}`);
      await recordPayment("paid");
      break;
    }
    case "charge.failed":
    case "charge.cancelled": {
      await svc
        .from("orders")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .or(`id.eq.${orderId},parent_order_id.eq.${orderId}`);
      await recordPayment("failed");
      break;
    }
    case "charge.refunded": {
      await svc
        .from("orders")
        .update({ payment_status: "refunded", updated_at: new Date().toISOString() })
        .or(`id.eq.${orderId},parent_order_id.eq.${orderId}`);
      await recordPayment("refunded");
      break;
    }
    case "charge.partially_refunded": {
      // No matching orders.payment_status value for "partially refunded" —
      // leave the order's status as paid, just log it on the ledger for
      // manual reconciliation (visible in /dashboard/payments).
      await recordPayment("refunded", `Partial refund via Nomod (charge ${chargeId})`);
      break;
    }
    default:
      // charge.created / charge.authorised / charge.dispute.created — no
      // order-state change needed yet; just acknowledge so Nomod doesn't retry.
      break;
  }

  return NextResponse.json({ ok: true });
}
