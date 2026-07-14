"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Landmark, X, Loader2, Check, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// ── Contract mirrors the customer Flutter app (commit 1ec6b6e) ────────────────
// Backend + Edge Functions are already live; this is display + two RPC/EF calls.

const MIN_WITHDRAWAL = 10;
const IBAN_RE = /^AE[0-9]{21}$/;

export type Withdrawal = {
  id: string;
  amount: number;
  iban: string;
  account_name: string | null;
  status: string; // requested | approved | paid | rejected | cancelled
  transfer_reference: string | null;
  reject_reason: string | null;
  requested_at: string;
  paid_at: string | null;
};

function aed2(n: number) {
  return "AED " + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
}

// requested=amber, approved=blue, paid=green, rejected=red, cancelled=grey
const STATUS_BADGE: Record<string, string> = {
  requested: "bg-amber-50 text-amber-700",
  approved:  "bg-blue-50 text-blue-700",
  paid:      "bg-green-50 text-green-700",
  rejected:  "bg-red-50 text-red-700",
  cancelled: "bg-neutral-100 text-neutral-500",
};

export function WalletWithdraw({
  userId,
  initialWithdrawable,
  initialWithdrawals,
}: {
  userId: string;
  initialWithdrawable: number;
  initialWithdrawals: Withdrawal[];
}) {
  const t = useTranslations("withdraw");

  const [withdrawable, setWithdrawable] = useState(initialWithdrawable);
  const [withdrawals, setWithdrawals]   = useState<Withdrawal[]>(initialWithdrawals);
  const [modalOpen, setModalOpen]       = useState(false);

  // Refresh withdrawable balance + history after any successful mutation.
  async function reload() {
    const supabase = createClient();
    const [{ data: bal }, { data: rows }] = await Promise.all([
      supabase.rpc("get_withdrawable_balance", { p_customer_id: userId }),
      supabase
        .from("wallet_withdrawals")
        .select("id, amount, iban, account_name, status, transfer_reference, reject_reason, requested_at, paid_at")
        .eq("customer_id", userId)
        .order("requested_at", { ascending: false })
        .limit(50),
    ]);
    setWithdrawable(Number(bal ?? 0));
    if (rows) setWithdrawals(rows as Withdrawal[]);
  }

  return (
    <>
      {withdrawable > 0 && (
        <button
          onClick={() => setModalOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--brand-maroon)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          <Landmark className="h-4 w-4 text-[color:var(--brand-gold)]" />
          {t("button")} · {aed2(withdrawable)}
        </button>
      )}

      <WithdrawalHistory
        withdrawals={withdrawals}
        onCancelled={reload}
        userId={userId}
      />

      {modalOpen && (
        <WithdrawModal
          userId={userId}
          withdrawable={withdrawable}
          onClose={() => setModalOpen(false)}
          onSuccess={async () => { await reload(); }}
        />
      )}
    </>
  );
}

// ── Two-step request modal ────────────────────────────────────────────────────

function WithdrawModal({
  userId,
  withdrawable,
  onClose,
  onSuccess,
}: {
  userId: string;
  withdrawable: number;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const t = useTranslations("withdraw");

  const [step, setStep]   = useState<0 | 1 | 2>(0); // 0=details, 1=otp, 2=success
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpExpired, setOtpExpired] = useState(false);

  const [amountStr, setAmountStr] = useState("");
  const [ibanStr, setIbanStr]     = useState("");
  const [name, setName]           = useState("");
  const [otp, setOtp]             = useState("");
  const [amount, setAmount]       = useState(0); // frozen once OTP is sent

  const iban = ibanStr.replace(/\s/g, "").toUpperCase();
  const ibanValid = IBAN_RE.test(iban);
  const enteredAmount = parseFloat(amountStr.trim()) || 0;

  // ── Step A: validate locally then send the OTP ──
  async function sendOtp() {
    setError(null);
    if (enteredAmount < MIN_WITHDRAWAL) return setError(t("errMin", { amount: aed2(MIN_WITHDRAWAL) }));
    if (enteredAmount > withdrawable) return setError(t("errExceeds"));
    if (!ibanValid) return setError(t("errIban"));
    if (!name.trim()) return setError(t("errName"));

    setBusy(true);
    const supabase = createClient();
    let res: { ok?: boolean; error?: string } = {};
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("withdrawal-otp-send");
      if (fnErr) res = { ok: false, error: "SEND_FAILED" };
      else res = (data ?? {}) as { ok?: boolean; error?: string };
    } catch {
      res = { ok: false, error: "SEND_FAILED" };
    }
    setBusy(false);

    if (res.ok === true) {
      setAmount(enteredAmount);
      setStep(1);
      setError(null);
      setOtpExpired(false);
      setOtp("");
      return;
    }
    setError(res.error === "NO_PHONE_ON_FILE" ? t("errNoPhone") : t("errSendFailed"));
  }

  // ── Step B: confirm with the OTP ──
  async function confirm() {
    setError(null);
    setOtpExpired(false);
    if (otp.trim().length !== 6) return setError(t("errOtpLen"));

    setBusy(true);
    const supabase = createClient();
    try {
      const { data, error: rpcErr } = await supabase.rpc("request_wallet_withdrawal", {
        p_amount: amount,
        p_iban: iban,
        p_account_name: name.trim(),
        p_otp_code: otp.trim(),
      });
      setBusy(false);

      // Business-rule failures are RAISEd → surface as rpcErr.
      if (rpcErr) return setError(mapRpcError(rpcErr.message, t));

      const r = (data ?? {}) as { ok?: boolean; error?: string; attempts_left?: number };
      if (r.ok === true) {
        setStep(2);
        return;
      }
      if (r.error === "INVALID_OTP") {
        setError(t("errInvalidOtp", { count: r.attempts_left ?? 0 }));
      } else if (r.error === "OTP_EXPIRED") {
        setError(t("errOtpExpired"));
        setOtpExpired(true);
      } else {
        setError(t("errGeneric"));
      }
    } catch (e) {
      setBusy(false);
      setError(mapRpcError(e instanceof Error ? e.message : "", t));
    }
  }

  // Resend: go back to step A and immediately re-request a fresh code.
  async function resend() {
    setStep(0);
    setOtpExpired(false);
    await sendOtp();
  }

  function close(result: boolean) {
    if (busy) return;
    onClose();
    if (result) {
      toast.success(t("requestedToast"));
      void onSuccess();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={() => close(false)}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 0 && (
          <>
            <ModalHeader title={t("title")} onClose={() => close(false)} busy={busy} />
            <p className="mt-1 text-[13px] font-semibold text-[color:var(--brand-maroon)]">
              {t("availableForWithdrawal", { amount: aed2(withdrawable) })}
            </p>

            <div className="mt-5 space-y-4">
              <Field label={t("amountLabel")}>
                <input
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.]/g, ""))}
                  inputMode="decimal"
                  placeholder={t("amountPlaceholder")}
                  className="input w-full"
                />
              </Field>

              <Field label={t("ibanLabel")}>
                <input
                  value={ibanStr}
                  onChange={(e) => setIbanStr(e.target.value.replace(/[^A-Za-z0-9\s]/g, "").slice(0, 27))}
                  autoCapitalize="characters"
                  placeholder={t("ibanPlaceholder")}
                  className="input w-full font-mono uppercase"
                />
                {ibanValid ? (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-green-700">
                    <Check className="h-3.5 w-3.5" /> {t("ibanValid")}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {t("ibanHint", { n: iban.length })}
                  </p>
                )}
              </Field>

              <Field label={t("nameLabel")}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="input w-full"
                />
              </Field>

              {error && <ErrorBox msg={error} />}

              <PrimaryButton onClick={sendOtp} busy={busy} label={t("sendOtp")} />
              <p className="text-center text-[11px] text-neutral-400">{t("otpHelp")}</p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <ModalHeader title={t("otpTitle")} onClose={() => close(false)} busy={busy} />
            <p className="mt-1 text-[13px] text-neutral-500">
              {t("confirming", { amount: aed2(amount) })}
            </p>

            <div className="mt-5 space-y-4">
              <Field label={t("otpLabel")}>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="••••••"
                  className="input w-full text-center text-2xl font-bold tracking-[0.5em]"
                />
              </Field>

              {error && <ErrorBox msg={error} />}

              {otpExpired ? (
                <PrimaryButton onClick={resend} busy={busy} label={t("resend")} />
              ) : (
                <PrimaryButton
                  onClick={confirm}
                  busy={busy}
                  disabled={otp.trim().length !== 6}
                  label={t("confirm")}
                />
              )}
              <button
                onClick={() => { if (!busy) { setStep(0); setError(null); setOtpExpired(false); } }}
                className="w-full text-center text-[13px] text-neutral-500 hover:text-neutral-800"
              >
                {t("editDetails")}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="mt-4 text-lg font-extrabold text-neutral-900">{t("successTitle")}</p>
            <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-neutral-500">
              {t("successBody", { amount: aed2(amount) })}
            </p>
            <button
              onClick={() => close(true)}
              className="mt-6 w-full rounded-xl bg-[color:var(--brand-maroon)] py-3 text-sm font-bold text-white hover:opacity-90"
            >
              {t("done")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Withdrawal history ────────────────────────────────────────────────────────

function WithdrawalHistory({
  withdrawals,
  userId,
  onCancelled,
}: {
  withdrawals: Withdrawal[];
  userId: string;
  onCancelled: () => Promise<void>;
}) {
  const t = useTranslations("withdraw");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function cancel(id: string) {
    setCancelling(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("cancel_wallet_withdrawal", { p_withdrawal_id: id });
    setCancelling(null);
    setConfirmId(null);
    if (error) {
      toast.error(t("cancelFailedToast"));
      return;
    }
    toast.success(t("cancelledToast"));
    await onCancelled();
  }

  if (withdrawals.length === 0) return null;

  return (
    <div className="mt-4 border-t border-[color:var(--brand-border)] pt-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {t("historyTitle")}
      </p>
      <div className="space-y-2">
        {withdrawals.map((w) => {
          const expanded = expandedId === w.id;
          const last4 = w.iban.length >= 4 ? w.iban.slice(-4) : w.iban;
          const badge = STATUS_BADGE[w.status] ?? STATUS_BADGE.requested;
          const statusLabel = t(
            ("status" + w.status.charAt(0).toUpperCase() + w.status.slice(1)) as
              "statusRequested" | "statusApproved" | "statusPaid" | "statusRejected" | "statusCancelled"
          );
          return (
            <div key={w.id} className="rounded-xl border border-[color:var(--brand-border)]">
              <button
                onClick={() => setExpandedId(expanded ? null : w.id)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--brand-maroon)]/10">
                  <Landmark className="h-4 w-4 text-[color:var(--brand-maroon)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-neutral-900">{aed2(w.amount)}</p>
                  <p className="text-[11px] text-neutral-400">IBAN ••••{last4}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + badge}>
                    {statusLabel}
                  </span>
                  <span className="text-[10px] text-neutral-400">{fmtDate(w.requested_at)}</span>
                </div>
                {expanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-neutral-300" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-neutral-300" />
                )}
              </button>

              {expanded && (
                <div className="border-t border-neutral-50 px-3 pb-3 pt-2">
                  <DetailRow label={t("detailIban")} value={w.iban} />
                  {w.account_name && <DetailRow label={t("detailAccountName")} value={w.account_name} />}
                  {w.status === "paid" && w.transfer_reference && (
                    <DetailRow label={t("detailReference")} value={w.transfer_reference} />
                  )}
                  {w.status === "rejected" && w.reject_reason && (
                    <DetailRow label={t("detailReason")} value={w.reject_reason} />
                  )}

                  {w.status === "requested" && (
                    <div className="mt-2 flex justify-end">
                      {confirmId === w.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-neutral-500">{t("cancelConfirmTitle")}</span>
                          <button
                            onClick={() => cancel(w.id)}
                            disabled={cancelling === w.id}
                            className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {cancelling === w.id && <Loader2 className="h-3 w-3 animate-spin" />}
                            {t("cancelConfirm")}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="rounded-full border border-[color:var(--brand-border)] px-3 py-1 text-[11px] font-semibold hover:bg-neutral-50"
                          >
                            {t("keepIt")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(w.id)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-600 hover:underline"
                        >
                          <X className="h-3.5 w-3.5" /> {t("cancel")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Small shared bits ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRpcError(msg: string, t: any): string {
  if (msg.includes("WITHDRAWAL_ALREADY_OPEN")) return t("errAlreadyOpen");
  if (msg.includes("EXCEEDS_WITHDRAWABLE"))     return t("errExceeds");
  if (msg.includes("BELOW_MINIMUM"))            return t("errBelowMin");
  if (msg.includes("INVALID_IBAN"))             return t("errIban");
  if (msg.includes("MISSING_ACCOUNT_NAME"))     return t("errName");
  return t("errRequestFailed");
}

function ModalHeader({ title, onClose, busy }: { title: string; onClose: () => void; busy: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-extrabold text-neutral-900">{title}</h2>
      <button onClick={onClose} disabled={busy} className="text-neutral-400 hover:text-neutral-700 disabled:opacity-40">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

function PrimaryButton({
  onClick, busy, label, disabled,
}: { onClick: () => void; busy: boolean; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--brand-maroon)] py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="w-28 shrink-0 text-[12px] text-neutral-400">{label}</span>
      <span className="flex-1 break-all text-[12.5px] font-semibold text-neutral-800">{value}</span>
    </div>
  );
}
