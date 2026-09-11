import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { aed } from "@/lib/format";
import { PrintButton } from "./print-button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function OrderInvoicePage({
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

  const t = await getTranslations("invoice");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const isAr = locale === "ar";
  const dateLocale = isAr ? "ar-AE" : "en-AE";

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_method, subtotal, delivery_fee, coupon_discount, coin_discount, wallet_discount, total, created_at, parent_order_id, vendor_id, customer_id, order_items(*), vendors(name, trn, address, emirate, phone)"
    )
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  // Split parent (multi-vendor cart): each vendor gets its own tax invoice —
  // point the customer at whichever sub-order they want instead of trying to
  // merge multiple suppliers onto one legal document.
  const isSplitParent = !order.parent_order_id && !order.vendor_id;
  if (isSplitParent) {
    const { data: children } = await supabase
      .from("orders")
      .select("id, order_number, vendors(name)")
      .eq("parent_order_id", id)
      .eq("customer_id", user.id)
      .order("created_at");

    return (
      <div className="mx-auto max-w-lg px-5 py-14 md:px-8">
        <Link href={`/orders/${id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[color:var(--brand-maroon)]">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </Link>
        <h1 className="font-display mt-4 text-2xl font-semibold text-[color:var(--ink)]">{t("chooseVendorTitle")}</h1>
        <p className="mt-2 text-sm text-neutral-600">{t("chooseVendorDesc")}</p>
        <div className="mt-6 space-y-3">
          {(children ?? []).map((c: Row) => (
            <Link
              key={c.id}
              href={`/orders/${c.id}/invoice`}
              className="flex items-center justify-between rounded-xl border border-[color:var(--brand-border)] bg-white px-5 py-4 text-sm font-semibold text-[color:var(--ink)] shadow-[var(--shadow-sm)] transition hover:border-[color:var(--brand-maroon)]"
            >
              {c.vendors?.name ?? "UAQ Deals Mart"}
              <span className="text-[color:var(--brand-maroon)]">{t("viewInvoice")} →</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const [{ data: profile }, { data: company }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone_number").eq("id", user.id).maybeSingle(),
    supabase.from("company_tax_settings").select("legal_name, trn, vat_registered, vat_rate, invoice_prefix").eq("id", 1).maybeSingle(),
  ]);

  const vendor = order.vendors as Row;
  const items = (order.order_items ?? []) as Row[];
  const total = Number(order.total);
  const vatRate = Number(company?.vat_rate ?? 5);
  const vatRegistered = company?.vat_registered !== false;
  const vatAmount = vatRegistered ? (total * vatRate) / (100 + vatRate) : 0;
  const invoiceNo = `${company?.invoice_prefix || "INV-"}${order.order_number}`;
  const invoiceDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8 print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/orders/${id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[color:var(--brand-maroon)]">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </Link>
        <PrintButton label={t("print")} />
      </div>

      <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-6 shadow-[var(--shadow-sm)] print:rounded-none print:border-0 print:p-0 print:shadow-none sm:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-xl font-bold text-[color:var(--brand-maroon)]">UAQ Deals</p>
            <p className="text-xs text-neutral-500">Umm Al Quwain, United Arab Emirates</p>
          </div>
          <div className={isAr ? "text-left" : "text-right"}>
            <h1 className="text-xl font-bold tracking-wide text-[color:var(--brand-maroon)]">{t("title")}</h1>
            <p className="mt-1 text-xs text-neutral-500">{t("invoiceNo")}: <span className="font-mono text-neutral-700">{invoiceNo}</span></p>
            <p className="text-xs text-neutral-500">{t("date")}: {invoiceDate}</p>
          </div>
        </div>

        <div className="my-5 h-1 rounded-full bg-gradient-to-r from-[color:var(--brand-maroon)] to-[color:var(--brand-red,#C72931)]" />

        {/* Supplier / Bill To */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{t("billedBy")}</p>
            <p className="mt-1 text-sm font-bold text-[color:var(--ink)]">{vendor?.name ?? "UAQ Deals"}</p>
            <p className="text-xs text-neutral-500">{t("trn")}: {vendor?.trn || "—"}</p>
            {(vendor?.address || vendor?.emirate) && (
              <p className="text-xs text-neutral-500">{[vendor?.address, vendor?.emirate].filter(Boolean).join(", ")}</p>
            )}
          </div>
          <div className={isAr ? "text-left" : "text-right"}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{t("billedTo")}</p>
            <p className="mt-1 text-sm font-bold text-[color:var(--ink)]">{profile?.full_name || "—"}</p>
            {profile?.phone_number && <p className="text-xs text-neutral-500">{profile.phone_number}</p>}
          </div>
        </div>

        {/* Items */}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--brand-border)] text-left text-[11px] uppercase tracking-wide text-neutral-400">
              <th className="pb-2 font-semibold">{t("description")}</th>
              <th className="pb-2 text-center font-semibold">{t("qty")}</th>
              <th className="pb-2 text-right font-semibold">{t("unitPrice")}</th>
              <th className="pb-2 text-right font-semibold">{t("amount")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: Row) => (
              <tr key={it.id} className="border-b border-neutral-100">
                <td className="py-2.5 pr-2">{it.name}</td>
                <td className="py-2.5 text-center">{it.quantity}</td>
                <td className="py-2.5 text-right">{aed(it.unit_price)}</td>
                <td className="py-2.5 text-right font-medium">{aed(it.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ms-auto mt-4 w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-neutral-500">{t("subtotal")}</span><span>{aed(order.subtotal)}</span></div>
          {Number(order.delivery_fee) > 0 && (
            <div className="flex justify-between"><span className="text-neutral-500">{t("delivery")}</span><span>{aed(order.delivery_fee)}</span></div>
          )}
          {Number(order.coupon_discount) > 0 && (
            <div className="flex justify-between"><span className="text-neutral-500">{t("coupon")}</span><span className="text-green-600">−{aed(order.coupon_discount)}</span></div>
          )}
          {Number(order.coin_discount) > 0 && (
            <div className="flex justify-between"><span className="text-neutral-500">{t("coinDiscount")}</span><span className="text-green-600">−{aed(order.coin_discount)}</span></div>
          )}
          {Number(order.wallet_discount) > 0 && (
            <div className="flex justify-between"><span className="text-neutral-500">{t("walletDiscount")}</span><span className="text-green-600">−{aed(order.wallet_discount)}</span></div>
          )}
          <div className="flex justify-between border-t border-[color:var(--brand-border)] pt-2 text-base font-bold text-[color:var(--brand-maroon)]">
            <span>{t("total")}</span><span>{aed(total)}</span>
          </div>
          {vatRegistered && (
            <p className="pt-1 text-right text-[11px] text-neutral-400">
              {t("vatIncluded", { rate: vatRate, amount: aed(vatAmount) })}
            </p>
          )}
        </div>

        <div className="mt-8 border-t border-[color:var(--brand-border)] pt-4 text-center">
          <p className="text-sm font-medium text-neutral-600">{t("thanks")}</p>
          <p className="mt-1 text-[11px] text-neutral-400">{t("footerNote")}</p>
          {company?.trn && <p className="mt-1 text-[10px] text-neutral-300">UAQ Deals · {t("trn")}: {company.trn}</p>}
        </div>
      </div>
    </div>
  );
}
