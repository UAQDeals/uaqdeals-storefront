import { createServiceClient } from "@/lib/supabase/service";

const NOMOD_API_BASE = "https://api.nomod.com/v1";

export type NomodGatewayConfig = { apiKey: string; isSandbox: boolean };

export type NomodCheckoutItem = {
  item_id: string;
  name: string;
  quantity: number;
  unit_amount: string;
  total_amount: string;
  net_amount: string;
};

export type NomodCheckoutSession = {
  id: string;
  url: string;
  status: "created" | "cancelled" | "expired" | "paid";
  amount: number;
  currency: string;
  reference_id: string;
};

// Reads the enabled Nomod config from payment_gateways (service-role only —
// the API key must never reach the browser). Returns null if the gateway
// isn't configured/enabled, which callers treat as "online payment unavailable".
export async function getNomodConfig(): Promise<NomodGatewayConfig | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("payment_gateways")
    .select("is_enabled, is_sandbox, api_key")
    .eq("provider", "nomod")
    .maybeSingle();

  if (!data?.is_enabled || !data.api_key) return null;
  return { apiKey: data.api_key as string, isSandbox: Boolean(data.is_sandbox) };
}

export async function createNomodCheckout(params: {
  apiKey: string;
  referenceId: string;
  amount: number;
  currency: string;
  items: NomodCheckoutItem[];
  customer: { first_name: string; last_name: string; email: string; phone_number: string };
  successUrl: string;
  failureUrl: string;
  cancelledUrl: string;
}): Promise<NomodCheckoutSession> {
  const res = await fetch(`${NOMOD_API_BASE}/checkout`, {
    method: "POST",
    headers: { "X-API-KEY": params.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      reference_id: params.referenceId,
      amount: params.amount.toFixed(2),
      currency: params.currency,
      items: params.items,
      customer: params.customer,
      success_url: params.successUrl,
      failure_url: params.failureUrl,
      cancelled_url: params.cancelledUrl,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Nomod create-checkout failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function getNomodCheckout(apiKey: string, checkoutId: string): Promise<NomodCheckoutSession> {
  const res = await fetch(`${NOMOD_API_BASE}/checkout/${checkoutId}`, {
    method: "GET",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Nomod get-checkout failed (${res.status}): ${body}`);
  }
  return res.json();
}
