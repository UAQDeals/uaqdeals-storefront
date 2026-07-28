import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, Package, ShoppingBag, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { aed } from "@/lib/format";
import { Reveal } from "@/components/reveal";

export async function generateMetadata() {
  const t = await getTranslations("orderConfirm");
  return { title: t("title") };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  preparing: "bg-blue-50 text-blue-700 ring-blue-200",
  ready: "bg-blue-50 text-blue-700 ring-blue-200",
  out_for_delivery: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-green-50 text-green-700 ring-green-200",
  cancelled: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  refunded: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const t = await getTranslations("orderConfirm");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const dateLocale = locale === "ar" ? "ar-AE" : "en-AE";
  const tco = await getTranslations("checkout");
  const tord = await getTranslations("orders");

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_method, subtotal, delivery_fee, coupon_discount, coin_discount, wallet_discount, total, coins_earned, coins_redeemed, delivery_address, delivery_notes, expected_delivery_date, created_at, parent_order_id, vendor_id, delivery_tier, fulfilment_type, courier_id, tracking_number, couriers(name), order_items(*, products(thumbnail_url, name))")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  // Courier tracking URL (built server-side from the courier's template).
  const isCourier = order?.fulfilment_type === "courier";
  const { data: trackingUrl } = isCourier
    ? await supabase.rpc("order_tracking_url", { p_order_id: id })
    : { data: null };

  // For split parents: fetch child sub-orders with their items
  const isParent = order && !order.parent_order_id && !order.vendor_id;
  const { data: childOrders } = isParent
    ? await supabase
        .from("orders")
        .select("id, vendor_id, delivery_tier, subtotal, order_items(*, products(thumbnail_url, name)), vendors(name)")
        .eq("parent_order_id", id)
        .eq("customer_id", user.id)
        .order("created_at")
    : { data: null };

  if (!order) notFound();

  const children = (childOrders ?? []) as Row[];
  // For split parents use children's items; for single orders use own items
  const childItems: { vendorName: string; tier: string | null; items: Row[] }[] =
    children.map((c: Row) => ({
      vendorName: c.vendors?.name ?? "UAQ Deals Mart",
      tier: c.delivery_tier ?? null,
      items: (c.order_items ?? []) as Row[],
    }));
  const items = childItems.length > 0
    ? childItems.flatMap((g) => g.items)
    : (order.order_items ?? []) as Row[];
  const ref = order.order_number ?? String(order.id).slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <Reveal className="flex flex-col items-center text-center">
        <span className="bg-brand-gradient inline-flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[var(--shadow-card)] ring-4 ring-[color:var(--brand-gold)]/20">
          <Check className="h-7 w-7" />
        </span>
        <h1 className="font-display mt-5 text-[26px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[32px]">{t("title")}</h1>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-[color:var(--brand-muted)]">
          {t("reference", { ref })}
          <span className={"inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ring-1 " + (STATUS_COLORS[order.status as string] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200")}>{order.status}</span>
        </p>
        <p className="mt-3 max-w-md text-sm text-neutral-700">{t("thanks")}</p>
      </Reveal>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <h2 className="eyebrow">{t("deliverySection")}</h2>
          <p className="mt-3 text-sm text-neutral-800">{order.delivery_address}</p>
          {order.delivery_notes && <p className="mt-1 text-xs text-neutral-500">{order.delivery_notes}</p>}
          {order.expected_delivery_date && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700">
              <Truck className="h-4 w-4 text-[color:var(--brand-maroon)]" />
              {t("getItBy", {
                date: new Date(order.expected_delivery_date).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" }),
              })}
            </p>
          )}
          {isCourier && (
            <div className="mt-4 rounded-xl border border-[color:var(--brand-maroon)]/20 bg-[color:var(--brand-maroon)]/[0.04] p-3">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-maroon)]">
                <Truck className="h-3.5 w-3.5" /> {t("courierSection")}
              </p>
              <p className="mt-2 text-sm text-neutral-800">
                {(order.couriers as Row)?.name
                  ? t("courierName", { courier: (order.couriers as Row).name })
                  : t("courierArranged")}
              </p>
              {order.tracking_number && (
                <p className="mt-1 text-xs text-neutral-600">
                  {t("trackingNumber")}: <span className="font-mono text-neutral-800">{order.tracking_number}</span>
                </p>
              )}
              {trackingUrl && (
                <a href={trackingUrl as string} target="_blank" rel="noreferrer"
                  className="bg-brand-gradient mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white">
                  <Truck className="h-3.5 w-3.5" /> {t("trackShipment")}
                </a>
              )}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <h2 className="eyebrow">{t("paymentSection")}</h2>
          <p className="mt-3 text-sm font-medium">{order.payment_method === "cod" ? tco("cod") : order.payment_method}</p>
          <p className="mt-1 text-xs text-neutral-500">{t("payAt", { amount: aed(order.total) })}</p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <h2 className="eyebrow">{t("items")}</h2>
        {/* split: grouped by vendor */}
        {childItems.length > 0 ? (
          <div className="mt-4 space-y-4">
            {childItems.map((group, gi) => (
              <div key={gi}>
                {childItems.length > 1 && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{group.vendorName}</span>
                    {group.tier && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] bg-neutral-100 text-neutral-500">{group.tier.replace("_", " ")}</span>
                    )}
                  </div>
                )}
                <ul className="space-y-3">
                  {group.items.map((it: Row) => {
                    const thumb = it.products?.thumbnail_url ?? null;
                    return (
                      <li key={it.id} className="flex gap-3 text-sm">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt={it.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-5 w-5" /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-medium">{it.name}</p>
                          <p className="text-xs text-neutral-500">{it.quantity} × {aed(it.unit_price)}{it.notes ? ` · ${it.notes}` : ""}</p>
                        </div>
                        <p className="text-sm font-semibold">{aed(it.total_price)}</p>
                      </li>
                    );
                  })}
                </ul>
                {gi < childItems.length - 1 && <hr className="mt-4 border-[color:var(--brand-border)]" />}
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((it: Row) => {
              const thumb = it.products?.thumbnail_url ?? null;
              return (
                <li key={it.id} className="flex gap-3 text-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={it.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-5 w-5" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium">{it.name}</p>
                    <p className="text-xs text-neutral-500">{it.quantity} × {aed(it.unit_price)}{it.notes ? ` · ${it.notes}` : ""}</p>
                  </div>
                  <p className="text-sm font-semibold">{aed(it.total_price)}</p>
                </li>
              );
            })}
          </ul>
        )}
        <dl className="mt-4 space-y-2 border-t border-[color:var(--brand-border)] pt-4 text-sm">
          <Row label={tco("subtotal")} value={aed(order.subtotal)} />
          {Number(order.coupon_discount) > 0 && <Row label={tco("coupon")} value={`-${aed(order.coupon_discount)}`} valueClass="text-green-600" />}
          {Number(order.coin_discount) > 0 && <Row label={tco("coinDiscount")} value={`-${aed(order.coin_discount)}`} valueClass="text-green-600" />}
          {Number(order.wallet_discount) > 0 && <Row label={tco("walletApplied")} value={`-${aed(order.wallet_discount)}`} valueClass="text-green-600" />}
          <Row label={t("deliverySection")} value={Number(order.delivery_fee) === 0 ? tc("free") : aed(order.delivery_fee)} valueClass={Number(order.delivery_fee) === 0 ? "text-green-600 font-semibold" : ""} />
          <div className="flex items-end justify-between border-t border-[color:var(--brand-border)] pt-3">
            <span className="text-sm font-semibold text-neutral-700">{tco("total")}</span>
            <span className="font-display text-[26px] font-semibold text-[color:var(--brand-maroon)]">{aed(order.total)}</span>
          </div>
          {Number(order.coins_earned) > 0 && (
            <p className="inline-flex items-center gap-1 pt-1 text-[11px] font-medium text-[color:var(--brand-gold-deep)]">{t("earned", { count: Number(order.coins_earned) })}</p>
          )}
        </dl>
      </section>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/orders" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--brand-maroon)] transition hover:border-[color:var(--brand-maroon)]">
          <Package className="h-4 w-4" /> {tord("title")}
        </Link>
        <Link href="/" className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
          {tc("keepShopping")}
        </Link>
      </div>
    </div>
  );
}


function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-neutral-600">{label}</dt>
      <dd className={"font-semibold " + valueClass}>{value}</dd>
    </div>
  );
}
