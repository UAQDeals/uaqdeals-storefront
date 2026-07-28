"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Wallet, Coins, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

type Txn = Record<string, any>;
type Payout = Record<string, any>;

function payoutColor(s: string) {
  switch (s) {
    case "completed": return "bg-green-50 text-green-700 ring-1 ring-green-200";
    case "failed": return "bg-red-50 text-red-700 ring-1 ring-red-200";
    case "processing": return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    default: return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const money = (v: any) => `AED ${Number(v ?? 0).toFixed(2)}`;
const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export function VendorFinanceManager({
  vendorId,
  walletBalance,
  minPayout,
  summary,
  initialTransactions,
  initialPayouts,
}: {
  vendorId: string;
  walletBalance: number;
  minPayout: number;
  summary: Record<string, any> | null;
  initialTransactions: Txn[];
  initialPayouts: Payout[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [balance, setBalance] = useState(walletBalance);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [payouts, setPayouts] = useState(initialPayouts);

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");
  const [requesting, setRequesting] = useState(false);

  async function submitPayout() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setRequesting(true);
    try {
      const { error } = await supabase.rpc("request_vendor_payout", {
        p_vendor_id: vendorId,
        p_amount: amt,
        p_payment_method: method.trim() || "bank_transfer",
        p_notes: notes.trim() || null,
      });
      if (error) throw error;
      toast.success("Payout request submitted");
      setModalOpen(false);
      setAmount(""); setNotes("");
      router.refresh();
      // refresh local data
      const [{ data: v }, { data: t }, { data: p }] = await Promise.all([
        supabase.from("vendors").select("wallet_balance").eq("id", vendorId).single(),
        supabase.from("vendor_wallet_transactions").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false }).limit(50),
        supabase.from("vendor_payouts").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false }).limit(20),
      ]);
      if (v) setBalance(Number(v.wallet_balance ?? 0));
      if (t) setTransactions(t);
      if (p) setPayouts(p);
    } catch (e: any) {
      toast.error((e.message ?? "Could not submit").replace("Exception: ", ""));
    } finally {
      setRequesting(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40";

  return (
    <div>
      <div className="mb-4 flex items-center gap-3.5">
        <span className="accent-bar h-9 w-1.5 rounded-full" />
        <div>
          <p className="eyebrow">UAQ Deals</p>
          <h1 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">Finance &amp; Wallet</h1>
        </div>
      </div>

      {/* Wallet card */}
      <Reveal>
      <div className="bg-maroon-radial relative overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-premium)]">
        <Coins className="pointer-events-none absolute -end-4 -top-4 h-32 w-32 text-[color:var(--brand-gold)]/15" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
            <Wallet size={14} className="text-[color:var(--brand-gold)]" /> Wallet Balance
          </p>
          <p className="font-display mt-1.5 text-4xl font-semibold tracking-tight">{money(balance)}</p>
          <p className="mt-2 text-[11px] text-white/60">Credited from order earnings, debited for promotions and payouts.</p>
          <button
            onClick={() => setModalOpen(true)}
            disabled={balance <= 0}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[color:var(--brand-maroon)] shadow-sm transition hover:brightness-105 disabled:opacity-50"
          >
            Request Payout
          </button>
        </div>
      </div>
      </Reveal>

      {/* Earnings summary */}
      {summary && (
        <Reveal delay={80}>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Total Orders", value: summary.total_orders ?? 0, accent: false },
            { label: "Gross Sales", value: money(summary.gross_sales), accent: false },
            { label: "Commission", value: money(summary.total_commission_paid), accent: false },
            { label: "Net Earnings", value: money(summary.vendor_earnings), accent: true },
          ].map((s) => (
            <div key={s.label} className="premium-card relative overflow-hidden p-4">
              {s.accent && <Coins className="pointer-events-none absolute -end-2 -top-2 h-14 w-14 text-[color:var(--brand-gold)]/15" />}
              <p className="eyebrow">{s.label}</p>
              <p className={"font-display mt-1 text-xl font-semibold tracking-tight " + (s.accent ? "text-[color:var(--brand-maroon)]" : "text-[color:var(--ink)]")}>{s.value}</p>
            </div>
          ))}
        </div>
        </Reveal>
      )}

      {/* Payout requests */}
      {payouts.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-[color:var(--ink)]">Payout Requests</h2>
          <div className="mt-3 space-y-2.5">
            {payouts.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 8) * 40}>
              <div className="premium-card flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-bold text-[color:var(--brand-maroon)]">{money(p.amount)}</p>
                  <p className="text-xs text-[color:var(--brand-muted)]">{p.payment_method ?? "Bank Transfer"} · {fmtDate(p.created_at)}</p>
                </div>
                <span className={"rounded-full px-2.5 py-1 text-[10px] font-bold " + payoutColor(p.status)}>{cap(p.status)}</span>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-[color:var(--ink)]">Wallet Transactions</h2>
        <div className="mt-3 space-y-2.5">
          {transactions.length === 0 ? (
            <div className="premium-card p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--paper-2)]">
                <Wallet className="h-7 w-7 text-[color:var(--brand-maroon)]" />
              </div>
              <p className="text-sm text-[color:var(--brand-muted)]">No transactions yet.</p>
            </div>
          ) : transactions.map((t, i) => {
            const credit = t.type === "credit";
            return (
              <Reveal key={t.id} delay={Math.min(i, 8) * 40}>
              <div className="premium-card flex items-center gap-3 p-4">
                <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full " + (credit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                  {credit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[color:var(--ink)]">{t.description}</p>
                  <p className="text-xs text-[color:var(--brand-muted)]">{fmtDate(t.created_at)} · Balance: {money(t.balance_after)}</p>
                </div>
                <span className={"text-sm font-bold " + (credit ? "text-green-600" : "text-red-600")}>
                  {credit ? "+" : "−"}{money(t.amount)}
                </span>
              </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Payout modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="premium-card relative my-12 w-full max-w-sm p-6 shadow-[var(--shadow-premium)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-semibold text-[color:var(--ink)]">Request Payout</h2>
            <p className="mt-1 text-sm text-[color:var(--brand-muted)]">Available: <span className="font-semibold text-[color:var(--brand-maroon)]">{money(balance)}</span></p>
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--brand-muted)]">Amount (AED)</label>
                <input className={inputCls} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={balance.toFixed(0)} autoFocus />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--brand-muted)]">Payment Method</label>
                <input className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Bank Transfer, Cash" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--brand-muted)]">Notes (optional)</label>
                <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Bank account / IBAN details" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]">Cancel</button>
              <button onClick={submitPayout} disabled={requesting} className="bg-brand-gradient flex-1 rounded-full py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
                {requesting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
