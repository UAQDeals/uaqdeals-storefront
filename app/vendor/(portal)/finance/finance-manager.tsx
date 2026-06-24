"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Txn = Record<string, any>;
type Payout = Record<string, any>;

function payoutColor(s: string) {
  switch (s) {
    case "completed": return "bg-green-100 text-green-700";
    case "failed": return "bg-red-100 text-red-700";
    case "processing": return "bg-blue-100 text-blue-700";
    default: return "bg-amber-100 text-amber-700";
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

  const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Finance &amp; Wallet</h1>

      {/* Wallet card */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#8E1B3A] to-[#C72931] p-6 text-white">
        <p className="text-xs uppercase tracking-wide text-white/70">Wallet Balance</p>
        <p className="mt-1 text-3xl font-extrabold">{money(balance)}</p>
        <p className="mt-2 text-[11px] text-white/60">Credited from order earnings, debited for promotions and payouts.</p>
        <button
          onClick={() => setModalOpen(true)}
          disabled={balance <= 0}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#8E1B3A] disabled:opacity-50"
        >
          Request Payout
        </button>
      </div>

      {/* Earnings summary */}
      {summary && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-bold text-neutral-900">Earnings Summary</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <div><p className="text-xs text-neutral-400">Total Orders</p><p className="text-lg font-bold">{summary.total_orders ?? 0}</p></div>
            <div><p className="text-xs text-neutral-400">Gross Sales</p><p className="text-lg font-bold">{money(summary.gross_sales)}</p></div>
            <div><p className="text-xs text-neutral-400">Commission</p><p className="text-lg font-bold">{money(summary.total_commission_paid)}</p></div>
            <div><p className="text-xs text-neutral-400">Net Earnings</p><p className="text-lg font-bold text-[#8E1B3A]">{money(summary.vendor_earnings)}</p></div>
          </div>
        </div>
      )}

      {/* Payout requests */}
      {payouts.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-neutral-900">Payout Requests</h2>
          <div className="mt-2 space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{money(p.amount)}</p>
                  <p className="text-xs text-neutral-500">{p.payment_method ?? "Bank Transfer"} · {fmtDate(p.created_at)}</p>
                </div>
                <span className={"rounded-full px-2.5 py-1 text-[10px] font-bold " + payoutColor(p.status)}>{cap(p.status)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-neutral-900">Wallet Transactions</h2>
        <div className="mt-2 space-y-2">
          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">No transactions yet.</div>
          ) : transactions.map((t) => {
            const credit = t.type === "credit";
            return (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                <div className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " + (credit ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                  {credit ? "↓" : "↑"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">{t.description}</p>
                  <p className="text-xs text-neutral-400">{fmtDate(t.created_at)} · Balance: {money(t.balance_after)}</p>
                </div>
                <span className={"text-sm font-bold " + (credit ? "text-green-600" : "text-red-600")}>
                  {credit ? "+" : "−"}{money(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="my-12 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-neutral-900">Request Payout</h2>
            <p className="mt-1 text-sm text-neutral-500">Available: {money(balance)}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Amount (AED)</label>
                <input className={inputCls} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={balance.toFixed(0)} autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Payment Method</label>
                <input className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Bank Transfer, Cash" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Notes (optional)</label>
                <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Bank account / IBAN details" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-semibold">Cancel</button>
              <button onClick={submitPayout} disabled={requesting} className="flex-1 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {requesting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
