"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Ticket, Copy, Calendar } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

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
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
      <div className="p-4 flex items-start gap-4">
        {/* QR */}
        <div className="shrink-0">
          {qr ? (
            <img src={qr} alt="QR" className="rounded-lg border border-neutral-100" style={{ width: 96, height: 96 }} />
          ) : (
            <div className="rounded-lg bg-neutral-100 flex items-center justify-center" style={{ width: 96, height: 96 }}>
              <Ticket className="w-6 h-6 text-neutral-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
              style={{ background: "#FDE8EC", color: "#8E1B3A" }}>
              {ticket.booking_type}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
              style={{ background: sc.bg, color: sc.text }}>
              {ticket.status ?? "confirmed"}
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-neutral-900 leading-snug line-clamp-1">{ticket.title}</h3>

          <div className="mt-1.5 space-y-0.5 text-[12px] text-neutral-500">
            {ticket.ticket_type && <p>{ticket.ticket_type} × {ticket.quantity ?? 1}</p>}
            {ticket.visit_date && (
              <p className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {ticket.visit_date}
              </p>
            )}
            <p className="font-semibold text-neutral-700">
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
        className="w-full flex items-center justify-between px-4 py-3 border-t border-dashed"
        style={{ borderColor: "#F0D0D8", background: "#FDF2F4" }}
      >
        <span className="text-[10px] font-bold tracking-widest text-neutral-400">E-TICKET CODE</span>
        <span className="flex items-center gap-2 text-[15px] font-extrabold tracking-widest" style={{ color: "#8E1B3A" }}>
          {ticket.e_ticket_code ?? "—"}
          <Copy className="w-3.5 h-3.5" />
        </span>
      </button>
    </div>
  );
}

export function MyTicketsClient({ tickets }: { tickets: TicketRow[] }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* App bar */}
      <div className="sticky top-0 z-10"
        style={{ background: "linear-gradient(to right, #C72931 0%, #8E1B3A 40%, #6B1530 100%)" }}>
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-white/10">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[17px] font-bold text-white">My Tickets</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-5">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl">🎟️</span>
            <p className="text-[15px] text-neutral-500">No tickets yet</p>
            <button onClick={() => router.push("/services/zoo-events")}
              className="mt-2 px-5 h-10 rounded-xl text-white font-bold text-[13px]"
              style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              Browse Zoo & Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
