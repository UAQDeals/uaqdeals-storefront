"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Ticket, Copy, Calendar } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

type TicketRow = {
  id: string;
  booking_type: string;
  title: string;
  image_url: string | null;
  ticket_type: string | null;
  quantity: number | null;
  total_price: number | null;
  visit_date: string | null;
  e_ticket_code: string | null;
  status: string | null;
  created_at: string;
};

function statusColor(s: string): { bg: string; text: string } {
  switch (s) {
    case "confirmed": return { bg: "#DCFCE7", text: "#15803D" };
    case "used":      return { bg: "#F3F4F6", text: "#6B7280" };
    case "cancelled": return { bg: "#FEE2E2", text: "#B91C1C" };
    default:          return { bg: "#FEF3C7", text: "#B45309" };
  }
}

function TicketCard({ ticket }: { ticket: TicketRow }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (ticket.e_ticket_code) {
      QRCode.toDataURL(ticket.e_ticket_code, {
        width: 240, margin: 1, color: { dark: "#8E1B3A", light: "#FFFFFF" },
      }).then(setQr).catch(() => {});
    }
  }, [ticket.e_ticket_code]);

  const sc = statusColor(ticket.status ?? "confirmed");

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 flex items-start gap-4">
        {/* QR */}
        <div className="shrink-0">
          {qr ? (
            <img src={qr} alt="QR" className="rounded-xl border border-[color:var(--brand-border)]" style={{ width: 96, height: 96 }} />
          ) : (
            <div className="rounded-xl bg-[color:var(--paper-2)] flex items-center justify-center" style={{ width: 96, height: 96 }}>
              <Ticket className="w-6 h-6 text-[color:var(--brand-gold)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
              {ticket.booking_type}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
              style={{ background: sc.bg, color: sc.text }}>
              {ticket.status ?? "confirmed"}
            </span>
          </div>
          <h3 className="font-display text-[16px] font-semibold text-[color:var(--ink)] leading-snug line-clamp-1">{ticket.title}</h3>

          <div className="mt-1.5 space-y-0.5 text-[12px] text-[color:var(--brand-muted)]">
            {ticket.ticket_type && <p>{ticket.ticket_type} × {ticket.quantity ?? 1}</p>}
            {ticket.visit_date && (
              <p className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[color:var(--brand-gold)]" /> {ticket.visit_date}
              </p>
            )}
            <p className="font-bold text-[color:var(--brand-maroon)]">
              {ticket.total_price ? `AED ${Number(ticket.total_price).toFixed(2)}` : "Free"}
            </p>
          </div>
        </div>
      </div>

      {/* Code bar */}
      <button
        onClick={() => {
          if (ticket.e_ticket_code) {
            navigator.clipboard.writeText(ticket.e_ticket_code);
            toast.success("Code copied!");
          }
        }}
        className="w-full flex items-center justify-between px-4 py-3 border-t border-dashed border-[color:var(--brand-gold)]/40 bg-[color:var(--paper-2)]/60 transition hover:bg-[color:var(--paper-2)]"
      >
        <span className="text-[10px] font-bold tracking-widest text-[color:var(--brand-muted)]">E-TICKET CODE</span>
        <span className="flex items-center gap-2 text-[15px] font-extrabold tracking-widest text-[color:var(--brand-maroon)]">
          {ticket.e_ticket_code ?? "—"}
          <Copy className="w-3.5 h-3.5 text-[color:var(--brand-gold)]" />
        </span>
      </button>
    </div>
  );
}

export function MyTicketsClient({ tickets }: { tickets: TicketRow[] }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      {/* App bar */}
      <div className="bg-maroon-radial relative overflow-hidden sticky top-0 z-10">
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-white/10 border border-[color:var(--brand-gold)]/25 backdrop-blur-sm transition hover:bg-white/20">
            <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" />
          </button>
          <h1 className="font-display text-[18px] font-semibold text-white">My Tickets</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-4xl ring-1 ring-[color:var(--brand-gold)]/30">🎟️</span>
            <p className="font-display text-[18px] font-semibold text-[color:var(--ink)]">No tickets yet</p>
            <button onClick={() => router.push("/services/zoo-events")}
              className="bg-brand-gradient mt-2 px-6 h-11 rounded-full text-white font-bold text-[13px] shadow-[var(--shadow-card)] transition hover:brightness-110">
              Browse Zoo & Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t, i) => (
              <Reveal key={t.id} delay={i * 70}>
                <TicketCard ticket={t} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
