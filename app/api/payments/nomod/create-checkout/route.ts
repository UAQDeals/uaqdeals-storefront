import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getNomodConfig, createNomodCheckout, type NomodCheckoutItem } from "@/lib/payments/nomod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Web (storefront) calls this with a session cookie. The Flutter app has no
// cookies — it sends its Supabase access token as a Bearer header instead.
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

  const { orderId } = await req.json().catch(() => ({ orderId: null }));
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const config = await getNomodConfig();
  if (!config) return NextResponse.json({ error: "Online payment is not available right now." }, { status: 409 });

  // Re-read everything server-side — never trust client-submitted amounts.
  const svc = createServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select("id, customer_id, vendor_id, parent_order_id, total, payment_method, payment_status, order_items(product_id, name, quantity, unit_price, total_price)")
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.payment_method !== "card") {
    return NextResponse.json({ error: "This order isn't set up for online payment." }, { status: 409 });
  }
  if (order.payment_status === "paid") {
    return NextResponse.json({ error: "This order is already paid." }, { status: 409 });
  }

  // Split multi-vendor carts: the parent order (no vendor_id, no parent_order_id)
  // carries the full payable total but its items live on the child orders.
  const isParent = !order.vendor_id && !order.parent_order_id;
  let lineItems = (order.order_items ?? []) as { product_id: string; name: string; quantity: number; unit_price: number; total_price: number }[];
  if (isParent) {
    const { data: children } = await svc
      .from("orders")
      .select("order_items(product_id, name, quantity, unit_price, total_price)")
      .eq("parent_order_id", orderId);
    lineItems = (children ?? []).flatMap((c) => (c.order_items ?? []) as typeof lineItems);
  }

  const { data: profile } = await svc
    .from("profiles")
    .select("full_name, phone_number, email")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = (profile?.full_name as string | null)?.trim() || "Customer";
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ") || firstName;

  const items: NomodCheckoutItem[] = lineItems.map((it) => ({
    item_id: it.product_id,
    name: it.name,
    quantity: it.quantity,
    unit_amount: Number(it.unit_price).toFixed(2),
    total_amount: Number(it.total_price).toFixed(2),
    net_amount: Number(it.total_price).toFixed(2),
  }));
  // Order total includes delivery/service charges and discounts not captured
  // per line item — if the item lines don't foot to the total (coupons, coin/
  // wallet redemption, delivery fee), add the remainder as one adjustment line
  // so Nomod's displayed total always matches what we actually charge.
  const itemsTotal = items.reduce((sum, it) => sum + Number(it.total_amount), 0);
  const remainder = Number(order.total) - itemsTotal;
  if (Math.abs(remainder) >= 0.01) {
    items.push({
      item_id: "adjustment",
      name: remainder > 0 ? "Delivery & fees" : "Discount",
      quantity: 1,
      unit_amount: remainder.toFixed(2),
      total_amount: remainder.toFixed(2),
      net_amount: remainder.toFixed(2),
    });
  }

  const origin = new URL(req.url).origin;
  try {
    const session = await createNomodCheckout({
      apiKey: config.apiKey,
      referenceId: orderId,
      amount: Number(order.total),
      currency: "AED",
      items,
      customer: {
        first_name: firstName || "Customer",
        last_name: lastName,
        email: (profile?.email as string | null) || user.email || "",
        phone_number: (profile?.phone_number as string | null) || "",
      },
      successUrl: `${origin}/orders/${orderId}?payment=success`,
      failureUrl: `${origin}/orders/${orderId}?payment=failed`,
      cancelledUrl: `${origin}/checkout?payment=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to start online payment.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
