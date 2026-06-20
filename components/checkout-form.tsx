"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShoppingBag, Tag } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import { aed } from "@/lib/format";

const FREE_OVER = 200; // AED — mirrors app
const DELIVERY_FEE = 15;
const COIN_VALUE = 0.01; // 100 coins = AED 1
const MIN_REDEEM = 1000;
const MAX_REDEEM_AED = 50;

type InitialProfile = {
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
};

export function CheckoutForm({
  userId,
  initialProfile,
  coinBalance,
}: {
  userId: string;
  initialProfile: InitialProfile;
  coinBalance: number;
}) {
  const router = useRouter();
  const { items, hydrated, subtotal, clear } = useCart();

  // form state
  const [fullName, setFullName] = useState(initialProfile.full_name ?? "");
  const [phone, setPhone] = useState(initialProfile.phone_number ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Umm Al Quwain");
  const [notes, setNotes] = useState("");

  // coupon
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
    id: string;
  } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  // coins
  const [useCoins, setUseCoins] = useState(false);
  const [placing, setPlacing] = useState(false);

  // when cart empties (e.g. tab opened with no cart), bounce back
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  const sub = subtotal();
  const couponDiscount = coupon?.discount ?? 0;
  const subAfterCoupon = Math.max(0, sub - couponDiscount);

  // coin math — mirrors customer app
  const coinDiscount = useMemo(() => {
    if (!useCoins || coinBalance < MIN_REDEEM) return 0;
    const usableByBalance = Math.floor(coinBalance / 100); // AED
    const usableByOrder = Math.floor(subAfterCoupon); // can't exceed order
    return Math.min(MAX_REDEEM_AED, usableByBalance, usableByOrder);
  }, [useCoins, coinBalance, subAfterCoupon]);
  const coinsToRedeem = Math.round(coinDiscount / COIN_VALUE);

  const shipping = subAfterCoupon >= FREE_OVER ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subAfterCoupon - coinDiscount) + shipping;
  const coinsEarned = Math.floor(sub / 10);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select(
          "id, code, discount_type, discount_value, min_order_amount, max_discount, starts_at, expires_at, max_uses, used_count, is_active"
        )
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      if (error || !data) throw new Error("Invalid coupon");
      const now = new Date();
      if (data.starts_at && new Date(data.starts_at) > now)
        throw new Error("Coupon not yet active");
      if (data.expires_at && new Date(data.expires_at) < now)
        throw new Error("Coupon has expired");
      if (
        data.max_uses != null &&
        (data.used_count ?? 0) >= data.max_uses
      )
        throw new Error("Coupon limit reached");
      if (data.min_order_amount && sub < Number(data.min_order_amount))
        throw new Error(
          `Min order ${aed(data.min_order_amount)} required for this coupon`
        );

      let discount = 0;
      if (data.discount_type === "percentage") {
        discount = (sub * Number(data.discount_value)) / 100;
        if (data.max_discount)
          discount = Math.min(discount, Number(data.max_discount));
      } else {
        discount = Number(data.discount_value);
      }
      discount = Math.min(discount, sub);

      setCoupon({ code: data.code as string, discount, id: data.id as string });
      toast.success(`Coupon applied — ${aed(discount)} off`);
    } catch (e) {
      setCoupon(null);
      toast.error(e instanceof Error ? e.message : "Invalid coupon");
    } finally {
      setCouponBusy(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponInput("");
  }

  async function placeOrder() {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill name, phone and address");
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    const supabase = createClient();

    try {
      // 1) Save the address to the profile for next time
      await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone_number: phone.trim(),
        })
        .eq("id", userId);

      // 2) Resolve vendor_id from the first cart product (single-vendor order)
      const firstProductId = items[0].product_id;
      const { data: firstProduct } = await supabase
        .from("products")
        .select("vendor_id")
        .eq("id", firstProductId)
        .maybeSingle();
      const vendorId = firstProduct?.vendor_id ?? null;

      // 3) Create the order — same shape as the customer app
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id: userId,
          vendor_id: vendorId,
          status: "pending",
          payment_method: "cod",
          payment_status: "pending",
          subtotal: sub,
          delivery_fee: shipping,
          coupon_discount: couponDiscount,
          coin_discount: coinDiscount,
          total: total,
          coins_earned: coinsEarned,
          coins_redeemed: coinsToRedeem,
          delivery_address: `${address.trim()}, ${city.trim()}`,
          delivery_notes: notes.trim() || null,
        })
        .select()
        .single();
      if (orderErr || !order) throw orderErr ?? new Error("Failed to create order");

      const orderId = order.id as string;

      // 4) Insert order_items — fetch vendor_id per item for safety
      const productIds = Array.from(new Set(items.map((i) => i.product_id)));
      const { data: prodRows } = await supabase
        .from("products")
        .select("id, vendor_id")
        .in("id", productIds);
      const vendorByProduct = new Map<string, string | null>(
        (prodRows ?? []).map((p) => [p.id as string, p.vendor_id as string | null])
      );

      const rows = items.map((i) => ({
        order_id: orderId,
        product_id: i.product_id,
        vendor_id: vendorByProduct.get(i.product_id) ?? vendorId,
        name: i.name,
        quantity: i.qty,
        unit_price: i.price,
        total_price: i.price * i.qty,
        notes: i.variant,
      }));
      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(rows);
      if (itemsErr) throw itemsErr;

      // 5) Redeem coins via the same RPC the app uses
      if (coinsToRedeem > 0) {
        await supabase.rpc("add_coins", {
          p_customer_id: userId,
          p_coins: -coinsToRedeem,
          p_type: "redeem",
          p_order_id: orderId,
          p_description: "Redeemed at checkout",
        });
      }

      // 6) Clear cart and go to confirmation
      clear();
      toast.success("Order placed!");
      router.replace(`/orders/${orderId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
      setPlacing(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="h-40 animate-pulse rounded-2xl border border-[color:var(--brand-border)] bg-white" />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left: address + payment + coupon + coins */}
      <div className="space-y-6">
        {/* Address */}
        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Delivery address
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Full name *">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </Field>
            <Field label="Mobile *">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="input"
                placeholder="+9715XXXXXXXX"
              />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Address *">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input"
                placeholder="Building, street, landmark"
              />
            </Field>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Area / City">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Notes (optional)">
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                placeholder="Gate code, drop instructions…"
              />
            </Field>
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Payment
          </h2>
          <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-[color:var(--brand-maroon)] bg-[color:var(--brand-cream)] p-4">
            <input
              type="radio"
              checked
              readOnly
              className="mt-1 h-4 w-4 accent-[color:var(--brand-maroon)]"
            />
            <div>
              <p className="text-sm font-semibold">Cash on Delivery</p>
              <p className="text-xs text-neutral-600">
                Pay when you receive the order.
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Card payments coming soon.
          </p>
        </section>

        {/* Coupon */}
        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Coupon
          </h2>
          {coupon ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 p-3 text-sm">
              <span className="inline-flex items-center gap-2 font-semibold text-green-700">
                <Tag className="h-4 w-4" /> {coupon.code} — {aed(coupon.discount)}{" "}
                off
              </span>
              <button
                onClick={removeCoupon}
                className="text-xs font-semibold text-neutral-600 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter code"
                className="input flex-1 uppercase"
              />
              <button
                onClick={applyCoupon}
                disabled={couponBusy || !couponInput.trim()}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-maroon)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white disabled:opacity-50"
              >
                {couponBusy ? "…" : "Apply"}
              </button>
            </div>
          )}
        </section>

        {/* Coins */}
        {coinBalance > 0 && (
          <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Coins
            </h2>
            <div className="mt-3 flex items-start gap-3">
              <input
                id="coins"
                type="checkbox"
                disabled={coinBalance < MIN_REDEEM}
                checked={useCoins}
                onChange={(e) => setUseCoins(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[color:var(--brand-maroon)]"
              />
              <label htmlFor="coins" className="text-sm">
                <p className="font-medium">
                  Use {coinsToRedeem > 0 ? coinsToRedeem.toLocaleString() : "—"}{" "}
                  coins
                  {coinDiscount > 0 && (
                    <span className="ml-2 font-bold text-[color:var(--brand-maroon)]">
                      Save {aed(coinDiscount)}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  You have {coinBalance.toLocaleString()} coins.{" "}
                  {coinBalance < MIN_REDEEM
                    ? `Need ${MIN_REDEEM.toLocaleString()} to redeem.`
                    : `100 coins = AED 1. Max ${aed(MAX_REDEEM_AED)} per order.`}
                </p>
              </label>
            </div>
          </section>
        )}
      </div>

      {/* Right: summary */}
      <aside className="h-fit rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 lg:sticky lg:top-20">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Order summary
        </h2>

        <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
          {items.map((i) => (
            <li key={i.id} className="flex gap-3 text-sm">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={i.image}
                    alt={i.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{i.name}</p>
                <p className="text-xs text-neutral-500">
                  {i.qty} × {aed(i.price)}
                </p>
              </div>
              <p className="text-sm font-semibold">{aed(i.qty * i.price)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-[color:var(--brand-border)] pt-4 text-sm">
          <Row label="Subtotal" value={aed(sub)} />
          {couponDiscount > 0 && (
            <Row
              label={`Coupon (${coupon?.code ?? ""})`}
              value={`-${aed(couponDiscount)}`}
              valueClass="text-green-600"
            />
          )}
          {coinDiscount > 0 && (
            <Row
              label="Coin discount"
              value={`-${aed(coinDiscount)}`}
              valueClass="text-green-600"
            />
          )}
          <Row
            label="Delivery"
            value={shipping === 0 ? "FREE" : aed(shipping)}
            valueClass={shipping === 0 ? "text-green-600 font-semibold" : ""}
          />
        </dl>

        <div className="mt-4 flex items-end justify-between border-t border-[color:var(--brand-border)] pt-4">
          <span className="text-sm font-semibold text-neutral-700">Total</span>
          <span className="text-2xl font-extrabold text-[color:var(--brand-maroon)]">
            {aed(total)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Earn {coinsEarned.toLocaleString()} coins on this order.
        </p>

        <button
          onClick={placeOrder}
          disabled={placing}
          className="bg-brand-gradient mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {placing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Placing…
            </>
          ) : (
            <>Place Order · {aed(total)}</>
          )}
        </button>
        <Link
          href="/cart"
          className="mt-2 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
        >
          Back to cart
        </Link>
      </aside>

      <style jsx>{`
        :global(.input) {
          height: 42px;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          background: #fff;
          padding: 0 0.875rem;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.input:focus) {
          border-color: var(--brand-maroon);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-neutral-600">{label}</dt>
      <dd className={"font-semibold " + valueClass}>{value}</dd>
    </div>
  );
}
