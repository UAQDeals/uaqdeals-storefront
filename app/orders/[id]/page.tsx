import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, Package, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { aed } from "@/lib/format";

export async function generateMetadata() {
  const t = await getTranslations("orderConfirm");
  return { title: t("title") };
}

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
  const tco = await getTranslations("checkout");
  const tord = await getTranslations("orders");

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_method, subtotal, delivery_fee, coupon_discount, coin_discount, total, coins_earned, coins_redeemed, delivery_address, delivery_notes, created_at, order_items(*, products(thumbnail_url, name))")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  const items = (order.order_items ?? []) as Row[];
  const ref = order.order_number ?? String(order.id).slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <span className="bg-brand-gradient inline-flex h-16 w-16 items-center justify-center rounded-full text-white shadow-sm">
          <Check className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {t("reference", { ref })} · <span className="capitalize">{order.status}</span>
        </p>
        <p className="mt-3 max-w-md text-sm text-neutral-700">{t("thanks")}</p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("deliverySection")}</h2>
          <p className="mt-3 text-sm text-neutral-800">{order.delivery_address}</p>
          {order.delivery_notes && <p className="mt-1 text-xs text-neutral-500">{order.delivery_notes}</p>}
        </section>
        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("paymentSection")}</h2>
          <p className="mt-3 text-sm font-medium">{order.payment_method === "cod" ? tco("cod") : order.payment_method}</p>
          <p className="mt-1 text-xs text-neutral-500">{t("payAt", { amount: aed(order.total) })}</p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("items")}</h2>
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
        <dl className="mt-4 space-y-2 border-t border-[color:var(--brand-border)] pt-4 text-sm">
          <Row label={tco("subtotal")} value={aed(order.subtotal)} />
          {Number(order.coupon_discount) > 0 && <Row label={tco("coupon")} value={`-${aed(order.coupon_discount)}`} valueClass="text-green-600" />}
          {Number(order.coin_discount) > 0 && <Row label={tco("coinDiscount")} value={`-${aed(order.coin_discount)}`} valueClass="text-green-600" />}
          <Row label={t("deliverySection")} value={Number(order.delivery_fee) === 0 ? tc("free") : aed(order.delivery_fee)} valueClass={Number(order.delivery_fee) === 0 ? "text-green-600 font-semibold" : ""} />
          <div className="flex items-end justify-between border-t border-[color:var(--brand-border)] pt-3">
            <span className="text-sm font-semibold text-neutral-700">{tco("total")}</span>
            <span className="text-2xl font-extrabold text-[color:var(--brand-maroon)]">{aed(order.total)}</span>
          </div>
          {Number(order.coins_earned) > 0 && (
            <p className="pt-1 text-[11px] text-neutral-500">{t("earned", { count: Number(order.coins_earned) })}</p>
          )}
        </dl>
      </section>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/orders" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-maroon)] px-5 py-3 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white">
          <Package className="h-4 w-4" /> {tord("title")}
        </Link>
        <Link href="/" className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white">
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
