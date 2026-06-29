"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Truck, Tag, Coins, Ticket, Star, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
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
    <div className={"mb-8 rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg " + style.gradient}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Your Active Card</p>
          <h2 className="mt-1 text-2xl font-extrabold">{style.emoji} {plan?.name ?? card.tier}</h2>
          {until && <p className="mt-1 text-sm opacity-90">Free delivery until {until}</p>}
        </div>
        <CheckCircle className="h-8 w-8 opacity-80" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
        {plan?.discount_pct > 0 && (
          <span className="rounded-full bg-white/20 px-3 py-1">{plan.discount_pct}% discount</span>
        )}
        {plan?.cashback_pct > 0 && (
          <span className="rounded-full bg-white/20 px-3 py-1">{plan.cashback_pct}% coinback</span>
        )}
        {plan?.lucky_draw_entries > 0 && (
          <span className="rounded-full bg-white/20 px-3 py-1">{plan.lucky_draw_entries} lucky draw entries</span>
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
        {plans.map((plan: Plan) => {
          const style = TIER_STYLES[plan.tier] ?? TIER_STYLES.standard;
          const isActive = activeCard?.tier === plan.tier;
          return (
            <div
              key={plan.id}
              className={
                "rounded-2xl border bg-white p-5 transition " +
                (isActive
                  ? "border-[color:var(--brand-maroon)] ring-2 ring-[color:var(--brand-maroon)]/20"
                  : "border-[color:var(--brand-border)] hover:shadow-md")
              }
            >
              <div className={"mb-4 flex items-center gap-3 rounded-xl bg-gradient-to-br p-4 text-white " + style.gradient}>
                <span className="text-3xl">{style.emoji}</span>
                <div>
                  <p className="text-lg font-extrabold leading-tight">{plan.name}</p>
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

              <button
                onClick={() => handleBuy(plan)}
                disabled={isActive || pending}
                className={
                  "w-full rounded-full py-3 text-sm font-bold transition " +
                  (isActive
                    ? "bg-neutral-100 text-neutral-500 cursor-default"
                    : "bg-[color:var(--brand-maroon)] text-white hover:opacity-90 shadow-sm")
                }
              >
                {isActive
                  ? "Active"
                  : "Get " + plan.name + " · AED " + Number(plan.price).toFixed(0)}
              </button>
            </div>
          );
        })}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirming(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">Confirm Purchase</h3>
            <p className="mt-2 text-sm text-neutral-600">
              {confirming.name} — <strong>AED {Number(confirming.price).toFixed(0)}</strong>
            </p>
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Online payment is not yet connected. Our team will contact you
              to collect payment. Your card will be activated immediately.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={pending}
                className="flex-1 rounded-full bg-[color:var(--brand-maroon)] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
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
