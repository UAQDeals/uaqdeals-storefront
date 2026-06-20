import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aed } from "@/lib/format";

export const metadata = { title: "My orders" };

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
  const d = new Date(iso);
  return d.toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total, created_at, order_items(id, name, quantity, products(thumbnail_url))"
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (orders ?? []) as Row[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My orders
          </h1>
          <p className="text-sm text-neutral-600">
            {rows.length === 0
              ? "Nothing here yet."
              : `${rows.length} order${rows.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/account"
          className="text-sm font-semibold text-neutral-600 hover:text-[color:var(--brand-maroon)]"
        >
          Back to account
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--brand-border)] bg-white p-10 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <Package className="h-5 w-5" />
          </div>
          <p className="mt-4 text-base font-semibold text-neutral-800">
            No orders yet
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            When you place an order it&apos;ll appear here.
          </p>
          <Link
            href="/categories"
            className="bg-brand-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => {
            const items = (o.order_items ?? []) as Row[];
            const totalQty = items.reduce(
              (s: number, it: Row) => s + Number(it.quantity ?? 0),
              0
            );
            const thumb =
              items.find((it: Row) => it.products?.thumbnail_url)?.products
                ?.thumbnail_url ?? null;
            const previewNames = items
              .slice(0, 2)
              .map((it: Row) => it.name)
              .join(", ");
            const more = items.length > 2 ? ` +${items.length - 2} more` : "";
            const status = (o.status ?? "pending") as string;
            const ref =
              o.order_number ??
              `Order ${String(o.id).slice(0, 8).toUpperCase()}`;

            return (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 transition hover:border-[color:var(--brand-maroon)] hover:shadow-sm"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{ref}</p>
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                          (STATUS_COLORS[status] ?? "bg-neutral-100 text-neutral-700")
                        }
                      >
                        {fmtStatus(status)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-600">
                      {previewNames}
                      {more}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      {totalQty} item{totalQty === 1 ? "" : "s"} ·{" "}
                      {fmtDate(o.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-base font-bold text-[color:var(--brand-maroon)]">
                      {aed(o.total)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
