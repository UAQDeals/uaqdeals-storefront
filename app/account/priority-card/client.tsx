"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Truck, Tag, Coins, Ticket, Star, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";
import { purchasePriorityCard } from "./actions";

type Plan = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type Card = any; // eslint-disable-line @typescript-eslint/no-explicit-any

const TIER_STYLES: Record<string, { gradient: string; emoji: string }> = {
  standard: { gradient: "from-slate-400 to-slate-600",   emoji: "✨" },
  silver:   { gradient: "from-slate-300 to-slate-500",   emoji: "🥈" },
  gold:     { gradient: "from-yellow-300 to-yellow-600", emoji: "🥇" },
  diamond:  { gradient: "from-blue-300 to-blue-600",     emoji: "💎" },
};

function BenefitRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <li className="flex items-center gap-2 text-neutral-700">
      <Icon className="h-4 w-4 shrink-0 text-[color:var(--brand-maroon)]" />
      <span>{label}</span>
    </li>
  );
}

function ActiveCardBanner({ card }: { card: Card }) {
  const plan = card.priority_card_plans;
  const style = TIER_STYLES[card.tier] ?? TIER_STYLES.standard;
  const until = card.delivery_free_until
    ? new Date(card.delivery_free_until).toLocaleDateString("en-AE", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;
  return (
    <div className={"mb-8 rounded-3xl bg-gradient-to-br p-6 text-white shadow-[var(--shadow-premium)] " + style.gradient}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Your Active Card</p>
          <h2 className="font-display mt-1 text-2xl font-semibold">{style.emoji} {plan?.name ?? card.tier}</h2>
          {until && <p className="mt-1 text-sm opacity-90">Free delivery until {until}</p>}
        </div>
        <CheckCircle className="h-8 w-8 opacity-80" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5 text-sm font-semibold">
        {plan?.discount_pct > 0 && (
          <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm ring-1 ring-white/25">{plan.discount_pct}% discount</span>
        )}
        {plan?.cashback_pct > 0 && (
          <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm ring-1 ring-white/25">{plan.cashback_pct}% coinback</span>
        )}
        {plan?.lucky_draw_entries > 0 && (
          <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm ring-1 ring-white/25">{plan.lucky_draw_entries} lucky draw entries</span>
        )}
      </div>
    </div>
  );
}

export function PriorityCardClient({
  plans, activeCard,
}: {
  plans: Plan[]; activeCard: Card | null; userId: string;
}) {
  const [confirming, setConfirming] = useState<Plan | null>(null);
  const [pending, startTransition] = useTransition();

  function handleBuy(plan: Plan) {
    if (activeCard?.tier === plan.tier) {
      toast("You already have this card active");
      return;
    }
    setConfirming(plan);
  }

  function confirm() {
    if (!confirming) return;
    startTransition(async () => {
      const result = await purchasePriorityCard(confirming.id);
      if (result?.error) {
        toast.error("Purchase failed: " + result.error);
      } else {
        toast.success(confirming.name + " activated! Enjoy your benefits.");
        setConfirming(null);
        window.location.reload();
      }
    });
  }

  return (
    <>
      {activeCard && <ActiveCardBanner card={activeCard} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan: Plan, idx: number) => {
          const style = TIER_STYLES[plan.tier] ?? TIER_STYLES.standard;
          const isActive = activeCard?.tier === plan.tier;
          return (
            <Reveal key={plan.id} delay={(idx % 2) * 80}>
            <div
              className={
                "premium-card h-full p-5 " +
                (isActive
                  ? "!border-[color:var(--brand-maroon)] ring-2 ring-[color:var(--brand-maroon)]/20"
                  : "")
              }
            >
              <div className={"mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 text-white shadow-sm " + style.gradient}>
                <span className="text-3xl">{style.emoji}</span>
                <div>
                  <p className="font-display text-lg font-semibold leading-tight">{plan.name}</p>
                  <p className="text-sm font-semibold opacity-90">AED {Number(plan.price).toFixed(0)}</p>
                </div>
                {isActive && <CheckCircle className="ms-auto h-5 w-5" />}
              </div>

              <ul className="mb-4 space-y-2 text-sm">
                <BenefitRow
                  icon={Truck}
                  label={plan.delivery_free_months + " month" + (plan.delivery_free_months !== 1 ? "s" : "") + " free delivery"}
                />
                <BenefitRow icon={Tag}    label={plan.discount_pct + "% discount on orders"} />
                <BenefitRow icon={Coins}  label={plan.cashback_pct + "% cashback as UAQ coins"} />
                <BenefitRow
                  icon={Ticket}
                  label={plan.lucky_draw_entries + " lucky draw " + (plan.lucky_draw_entries === 1 ? "entry" : "entries")}
                />
                {plan.early_access_flash_sales && (
                  <BenefitRow icon={Zap}   label="Early access to flash sales" />
                )}
                {plan.vip_events && (
                  <BenefitRow icon={Star}  label="VIP events access" />
                )}
                {plan.dedicated_manager && (
                  <BenefitRow icon={Crown} label="Dedicated account manager" />
                )}
              </ul>

              {/* Card image */}
              {plan.image_url && (
                <img src={plan.image_url} alt={plan.name}
                  className="mb-3 h-24 w-full rounded-xl object-cover" />
              )}

              {/* Rules */}
              {Array.isArray(plan.rules) && plan.rules.filter((r: string) => r.trim()).length > 0 && (
                <div className="mb-3 rounded-xl bg-[color:var(--paper-2)] p-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--brand-muted)]">Terms</p>
                  <ul className="space-y-1 text-xs text-neutral-600">
                    {plan.rules.filter((r: string) => r.trim()).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0 text-[color:var(--brand-gold-deep)]">•</span>
                        <span>{rule.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => handleBuy(plan)}
                disabled={isActive || pending}
                className={
                  "w-full rounded-full py-3 text-sm font-bold transition " +
                  (isActive
                    ? "bg-[color:var(--paper-2)] text-[color:var(--brand-muted)] cursor-default"
                    : "bg-brand-gradient text-white shadow-[var(--shadow-card)] hover:brightness-110")
                }
              >
                {isActive
                  ? "Active"
                  : "Get " + plan.name + " · AED " + Number(plan.price).toFixed(0)}
              </button>
            </div>
            </Reveal>
          );
        })}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirming(null)} />
          <div className="premium-card relative w-full max-w-sm p-6 shadow-[var(--shadow-premium)]">
            <h3 className="font-display text-xl font-semibold text-[color:var(--ink)]">Confirm Purchase</h3>
            <p className="mt-2 text-sm text-neutral-600">
              {confirming.name} — <strong className="text-[color:var(--brand-maroon)]">AED {Number(confirming.price).toFixed(0)}</strong>
            </p>
            <p className="mt-3 rounded-xl bg-[color:var(--paper-2)] p-3 text-xs text-[color:var(--brand-muted)] ring-1 ring-[color:var(--brand-gold)]/25">
              Online payment is not yet connected. Our team will contact you
              to collect payment. Your card will be activated immediately.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-[color:var(--paper-2)]"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={pending}
                className="bg-brand-gradient flex-1 rounded-full py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60"
              >
                {pending ? "Activating…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
