import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag, ChevronRight, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { aed } from "@/lib/format";
import { Reveal } from "@/components/reveal";

export async function generateMetadata() {
  const t = await getTranslations("orders");
  return { title: t("title") };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  preparing: "bg-blue-50 text-blue-700",
  ready: "bg-blue-50 text-blue-700",
  out_for_delivery: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-neutral-100 text-neutral-600",
  refunded: "bg-neutral-100 text-neutral-600",
};

function fmtStatus(s: string | null) {
  if (!s) return "Pending";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orders");

  const t = await getTranslations("orders");
  const tc = await getTranslations("common");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, wallet_discount, created_at, order_items(id, name, quantity, products(thumbnail_url))")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (orders ?? []) as Row[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <div>
            <p className="eyebrow">{tc("account")}</p>
            <h1 className="font-display mt-0.5 text-[26px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[32px]">{t("title")}</h1>
            <p className="mt-0.5 text-sm text-[color:var(--brand-muted)]">{t("count", { count: rows.length })}</p>
          </div>
        </div>
        <Link href="/account" className="text-sm font-semibold text-[color:var(--brand-muted)] transition hover:text-[color:var(--brand-maroon)]">
          {tc("backTo", { page: tc("account") })}
        </Link>
      </div>

      {rows.length === 0 ? (
        <Reveal className="rounded-3xl border border-dashed border-[color:var(--brand-border)] bg-white p-12 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
            <Package className="h-6 w-6" />
          </div>
          <p className="font-display mt-5 text-[20px] font-semibold text-[color:var(--ink)]">{t("noOrders")}</p>
          <p className="mt-1 text-sm text-[color:var(--brand-muted)]">{t("noOrdersDesc")}</p>
          <Link href="/categories" className="bg-brand-gradient mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
            {t("startShopping")}
          </Link>
        </Reveal>
      ) : (
        <ul className="space-y-3">
          {rows.map((o, idx) => {
            const items = (o.order_items ?? []) as Row[];
            const totalQty = items.reduce((s: number, it: Row) => s + Number(it.quantity ?? 0), 0);
            const thumb = items.find((it: Row) => it.products?.thumbnail_url)?.products?.thumbnail_url ?? null;
            const previewNames = items.slice(0, 2).map((it: Row) => it.name).join(", ");
            const more = items.length > 2 ? ` +${items.length - 2}` : "";
            const status = (o.status ?? "pending") as string;
            const ref = o.order_number ?? `${String(o.id).slice(0, 8).toUpperCase()}`;

            return (
              <Reveal key={o.id} as="li" delay={Math.min(idx * 50, 300)}>
                <Link href={`/orders/${o.id}`} className="premium-card flex items-center gap-3 p-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[color:var(--paper-2)]">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-6 w-6" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{ref}</p>
                      <span className={"inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold " + (STATUS_COLORS[status] ?? "bg-neutral-100 text-neutral-700")}>
                        {fmtStatus(status)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-600">{previewNames}{more}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">{totalQty} × · {fmtDate(o.created_at)}</p>
                    {Number(o.wallet_discount) > 0 && (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--brand-maroon)]">
                        <Wallet className="h-3 w-3 text-[color:var(--brand-gold)]" /> −{aed(o.wallet_discount)}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-base font-bold text-[color:var(--brand-maroon)]">{aed(o.total)}</span>
                    <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      )}
    </div>
  );
}
