"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShoppingBag, Tag } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import { DeliveryMapPicker } from "@/components/delivery-map-picker";
import { aed } from "@/lib/format";

const FREE_OVER = 100;      // app_settings: free_delivery_threshold
const DELIVERY_FEE = 10;    // app_settings: delivery_fee
const COIN_VALUE = 0.1;     // app_settings: coin_value  (10 coins = AED 1)
const MIN_REDEEM = 1000;    // app_settings: min_redeem_coins
const MAX_REDEEM_AED = 50;  // app_settings: max_redeem_aed

type InitialProfile = {
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
};

export function CheckoutForm({
  userId,
  initialProfile,
  coinBalance,
  walletBalance,
}: {
  userId: string;
  initialProfile: InitialProfile;
  coinBalance: number;
  walletBalance: number;
}) {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const toc = useTranslations("orderConfirm");
  const router = useRouter();
  const { items, hydrated, subtotal, clear, coupon: storedCoupon, setCoupon: setStoredCoupon } = useCart();

  const [fullName, setFullName] = useState(initialProfile.full_name ?? "");
  const [phone, setPhone] = useState(initialProfile.phone_number ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Umm Al Quwain");
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [mapConfirmed, setMapConfirmed] = useState(false);
  const [notes, setNotes] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number; id: string; freeShipping: boolean } | null>(storedCoupon ?? null);
  const [couponBusy, setCouponBusy] = useState(false);

  const [useCoins, setUseCoins] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  const sub = subtotal();
  const couponDiscount = coupon?.discount ?? 0;
  const subAfterCoupon = Math.max(0, sub - couponDiscount);

  const coinDiscount = useMemo(() => {
    if (!useCoins || coinBalance < MIN_REDEEM) return 0;
    const usableByBalance = Math.floor(coinBalance / 100);
    const usableByOrder = Math.floor(subAfterCoupon);
    return Math.min(MAX_REDEEM_AED, usableByBalance, usableByOrder);
  }, [useCoins, coinBalance, subAfterCoupon]);
  const coinsToRedeem = Math.round(coinDiscount / COIN_VALUE);

  const shipping = subAfterCoupon >= FREE_OVER ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subAfterCoupon - coinDiscount) + shipping;
  const coinsEarned = Math.floor(sub / 10);

  // AED wallet preview — DISPLAY ONLY; the server recomputes authoritatively.
  // Applied against the payable total (after coupon + coins + delivery fee),
  // capped at the available balance; partial allowed, COD covers the remainder.
  const walletApplied = useWallet ? Math.min(walletBalance, total) : 0;
  const amountDue = Math.max(0, total - walletApplied);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, code, type, amount, min_spend, max_uses, used_count, starts_at, expires_at, is_active, free_shipping")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      if (error || !data) throw new Error(t("invalidCoupon"));
      const now = new Date();
      if (data.starts_at && new Date(data.starts_at) > now) throw new Error(t("couponNotActive"));
      if (data.expires_at && new Date(data.expires_at) < now) throw new Error(t("couponExpired"));
      if (data.max_uses != null && (data.used_count ?? 0) >= data.max_uses) throw new Error(t("couponLimitReached"));
      if (data.min_spend && sub < Number(data.min_spend))
        throw new Error(t("minOrderRequired", { amount: aed(data.min_spend) }));

      let discount = 0;
      if (data.type === "percentage" || data.type === "percent") {
        discount = (sub * Number(data.amount)) / 100;
      } else if (data.type === "fixed" || data.type === "fixed_cart") {
        discount = Number(data.amount);
      }
      discount = Math.min(discount, sub);

      setCoupon({ code: data.code as string, discount, id: data.id as string, freeShipping: data.free_shipping ?? false });
      toast.success(t("couponApplied", { amount: aed(discount) }));
    } catch (e) {
      setCoupon(null);
      toast.error(e instanceof Error ? e.message : t("invalidCoupon"));
    } finally {
      setCouponBusy(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setStoredCoupon(null);
    setCouponInput("");
  }

  async function placeOrder() {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error(t("fillRequired"));
      return;
    }
    if (mapLat == null || mapLng == null) {
      toast.error(t("fillRequired"));
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    const supabase = createClient();

    try {
      const payload = items.map((i) => ({
        product_id: i.product_id,
        qty: i.qty,
        variant: i.variant ?? null,
      }));

      const { data: orderId, error } = await supabase.rpc("place_order_v3", {
        p_items: payload,
        p_use_coins: useCoins,
        p_use_wallet: useWallet,
        p_coupon_code: coupon?.code ?? null,
        p_full_name: fullName.trim(),
        p_phone: phone.trim(),
        p_address: `${address.trim()}, ${city.trim()}`,
        p_notes: notes.trim() || null,
        p_lat: mapLat,
        p_lng: mapLng,
      });

      if (error || !orderId) {
        const code = error?.message ?? "";
        const msg =
          code.includes("INSUFFICIENT_STOCK") ? t("outOfStock") :
          code.includes("PRODUCT_INACTIVE")   ? t("itemUnavailable") :
          code.includes("EMPTY_CART")         ? t("fillRequired") :
          code.match(/^GROCERY_UNAVAILABLE:/) ? t("groceryUnavailable", { department: code.split(":")[1] }) :
          code.includes("GROCERY_NO_ZONE")     ? t("groceryNoZone") :
          code.includes("PHONE_IN_USE")        ? t("phoneInUse") :
          t("orderFailed");
        throw new Error(msg);
      }

      // Snapshot the expected delivery date from the cart's vendor lead times
      // (max across distinct vendors). Product vendors only — restaurants have
      // no delivery_days, so the field stays null. Non-fatal on failure.
      try {
        const vendorIds = items
          .map((i) => i.vendor_id)
          .filter((v): v is string => !!v);
        const missing = items.filter((i) => !i.vendor_id).map((i) => i.product_id);
        if (missing.length > 0) {
          const { data: prods } = await supabase
            .from("products")
            .select("vendor_id")
            .in("id", missing);
          for (const pr of prods ?? []) if (pr.vendor_id) vendorIds.push(pr.vendor_id as string);
        }
        const distinct = Array.from(new Set(vendorIds));
        if (distinct.length > 0) {
          const { data: vendors } = await supabase
            .from("vendors")
            .select("delivery_days")
            .in("id", distinct);
          const maxDays = (vendors ?? []).reduce((m, v) => {
            const d = v.delivery_days != null ? Number(v.delivery_days) : 0;
            return d > m ? d : m;
          }, 0);
          if (maxDays > 0) {
            const d = new Date();
            d.setDate(d.getDate() + maxDays);
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            await supabase.rpc("set_expected_delivery_date", { p_order_id: orderId, p_date: iso });
          }
        }
      } catch {
        /* non-fatal — leave expected_delivery_date null */
      }

      clear();
      toast.success(t("orderPlaced"));
      window.location.assign(`/orders/${orderId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("orderFailed"));
      setPlacing(false);
    }
  }

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-2xl border border-[color:var(--brand-border)] bg-white" />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("deliveryAddress")}</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={t("fullName")}>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
            </Field>
            <Field label={t("phone")}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="input" placeholder="+9715XXXXXXXX" />
            </Field>
          </div>
          {/* ── Delivery Location (required) ─────────────────────────────── */}
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--brand-maroon)] text-xs font-bold text-white">3</span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Delivery Location</h2>
              {!mapConfirmed && (
                <span className="ms-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">Required</span>
              )}
              {mapConfirmed && (
                <span className="ms-auto rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">✓ Set</span>
              )}
            </div>
            <div className={"rounded-2xl border-2 p-4 transition-colors " + (mapConfirmed ? "border-green-400 bg-green-50/50" : "border-[color:var(--brand-maroon)] bg-[color:var(--brand-cream)]")}>
              {mapConfirmed ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">📍</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{address}</p>
                      <p className="text-xs text-neutral-500">{city}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setMapConfirmed(false)}
                    className="shrink-0 rounded-full border border-[color:var(--brand-maroon)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white transition-colors">
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-xs text-neutral-600">
                    📌 Pin your exact delivery location on the map so our driver can find you easily.
                  </p>
                  <DeliveryMapPicker
                    initialLat={mapLat ?? undefined}
                    initialLng={mapLng ?? undefined}
                    onConfirm={(addr, c, la, ln) => {
                      setAddress(addr);
                      setCity(c);
                      setMapLat(la);
                      setMapLng(ln);
                      setMapConfirmed(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={t("areaCity")}>
              <input value={city} readOnly className="input bg-neutral-50 text-neutral-500 cursor-default" />
            </Field>
            <Field label={t("notes")}>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder={t("notesPlaceholder")} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("payment")}</h2>
          <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-[color:var(--brand-maroon)] bg-[color:var(--brand-cream)] p-4">
            <input type="radio" checked readOnly className="mt-1 h-4 w-4 accent-[color:var(--brand-maroon)]" />
            <div>
              <p className="text-sm font-semibold">{t("cod")}</p>
              <p className="text-xs text-neutral-600">{t("codDesc")}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-500">{t("cardsSoon")}</p>
        </section>

        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("coupon")}</h2>
          {coupon ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 p-3 text-sm">
              <span className="inline-flex items-center gap-2 font-semibold text-green-700">
                <Tag className="h-4 w-4" /> {coupon.code} — {aed(coupon.discount)}
              </span>
              <button onClick={removeCoupon} className="text-xs font-semibold text-neutral-600 hover:text-red-600">{tc("remove")}</button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder={t("enterCode")} className="input flex-1 uppercase" />
              <button onClick={applyCoupon} disabled={couponBusy || !couponInput.trim()} className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-maroon)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white disabled:opacity-50">
                {couponBusy ? "…" : tc("apply")}
              </button>
            </div>
          )}
        </section>

        {coinBalance > 0 && (
          <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("coins")}</h2>
            <div className="mt-3 flex items-start gap-3">
              <input id="coins" type="checkbox" disabled={coinBalance < MIN_REDEEM} checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} className="mt-1 h-4 w-4 accent-[color:var(--brand-maroon)]" />
              <label htmlFor="coins" className="text-sm">
                <p className="font-medium">
                  {t("useCoins", { count: coinsToRedeem > 0 ? coinsToRedeem.toLocaleString() : "—" })}
                  {coinDiscount > 0 && <span className="ms-2 font-bold text-[color:var(--brand-maroon)]">{t("saveCoin", { amount: aed(coinDiscount) })}</span>}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {t("youHaveCoins", { count: coinBalance.toLocaleString() })}{" "}
                  {coinBalance < MIN_REDEEM ? t("needCoins", { count: MIN_REDEEM.toLocaleString() }) : t("coinRule", { max: aed(MAX_REDEEM_AED) })}
                </p>
              </label>
            </div>
          </section>
        )}

        {walletBalance > 0 && (
          <section className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("walletBalance")}</h2>
            <div className="mt-3 flex items-start gap-3">
              <input
                id="wallet"
                type="checkbox"
                checked={useWallet}
                onChange={(e) => setUseWallet(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[color:var(--brand-maroon)]"
              />
              <label htmlFor="wallet" className="text-sm">
                <p className="font-medium">
                  {t("useWallet")}
                  {walletApplied > 0 && (
                    <span className="ms-2 font-bold text-[color:var(--brand-maroon)]">−{aed(walletApplied)}</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {t("walletAvailable", { amount: walletBalance.toFixed(2) })}
                </p>
              </label>
            </div>
          </section>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 lg:sticky lg:top-20">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("orderSummary")}</h2>
        <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto pe-1">
          {items.map((i) => (
            <li key={i.id} className="flex gap-3 text-sm">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-5 w-5" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{i.name}</p>
                <p className="text-xs text-neutral-500">{i.qty} × {aed(i.price)}</p>
              </div>
              <p className="text-sm font-semibold">{aed(i.qty * i.price)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-[color:var(--brand-border)] pt-4 text-sm">
          <Row label={t("subtotal")} value={aed(sub)} />
          {couponDiscount > 0 && <Row label={`${t("coupon")} (${coupon?.code ?? ""})`} value={`-${aed(couponDiscount)}`} valueClass="text-green-600" />}
          {coinDiscount > 0 && <Row label={t("coinDiscount")} value={`-${aed(coinDiscount)}`} valueClass="text-green-600" />}
          <Row label={toc("deliverySection")} value={shipping === 0 ? tc("free") : aed(shipping)} valueClass={shipping === 0 ? "text-green-600 font-semibold" : ""} />
          {walletApplied > 0 && <Row label={t("walletApplied")} value={`-${aed(walletApplied)}`} valueClass="text-green-600" />}
        </dl>

        <div className="mt-4 flex items-end justify-between border-t border-[color:var(--brand-border)] pt-4">
          <span className="text-sm font-semibold text-neutral-700">{walletApplied > 0 ? t("amountDue") : t("total")}</span>
          {/* Always format the payable as AED X.XX — never aed(), which renders 0 as "—". */}
          <span className="text-2xl font-extrabold text-[color:var(--brand-maroon)]">AED {amountDue.toFixed(2)}</span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">{t("earnCoins", { count: coinsEarned.toLocaleString() })}</p>

        {!mapConfirmed && (
          <p className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 text-center font-medium">
            📍 Please set your delivery location above to continue
          </p>
        )}
        <button onClick={placeOrder} disabled={placing || !mapConfirmed} className="bg-brand-gradient mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60">
          {placing ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("placing")}</> : <>{t("placeOrder")} · AED {amountDue.toFixed(2)}</>}
        </button>
        <Link href="/cart" className="mt-2 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
          {t("backToCart")}
        </Link>
      </aside>

      <style jsx>{`
        :global(.input) {
          height: 42px; width: 100%; border-radius: 0.75rem;
          border: 1px solid #e5e7eb; background: #fff;
          padding: 0 0.875rem; font-size: 0.9rem; outline: none;
          transition: border-color 0.15s;
        }
        :global(.input:focus) { border-color: var(--brand-maroon); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
      {children}
    </label>
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
