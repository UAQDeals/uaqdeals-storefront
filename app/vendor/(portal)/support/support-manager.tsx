"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2, MessageSquare, X } from "lucide-react";
import { Reveal } from "@/components/reveal";

type Ticket = Record<string, any>;

const inputCls = "w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40";
const labelCls = "block text-xs font-medium text-[color:var(--brand-muted)] mb-1.5";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  in_progress: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  resolved: "bg-green-50 text-green-700 ring-1 ring-green-200",
  closed: "bg-[color:var(--paper-2)] text-[color:var(--brand-muted)] ring-1 ring-[color:var(--brand-border)]",
};

export function SupportManager({ vendorId }: { vendorId: string }) {
  const supabase = createClient();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");

  useEffect(() => { fetchTickets(); }, []);

  async function fetchTickets() {
    setLoading(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("id, subject, status, category, created_at, updated_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });
    if (data) setTickets(data);
    setLoading(false);
  }

  async function submit() {
    if (!subject.trim()) { toast.error("Subject is required"); return; }
    if (!message.trim()) { toast.error("Message is required"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("support_tickets").insert({
        vendor_id: vendorId,
        user_id: user?.id,
        subject: subject.trim(),
        message: message.trim(),
        category,
        status: "open",
      }).select().single();
      if (error) throw error;
      toast.success("Ticket submitted — we'll get back to you shortly");
      setTickets(t => [data, ...t]);
      setDialogOpen(false);
      setSubject(""); setMessage(""); setCategory("general");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit ticket");
    } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <div>
            <p className="eyebrow">UAQ Deals</p>
            <h1 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">Support</h1>
          </div>
        </div>
        <button onClick={() => setDialogOpen(true)} className="bg-brand-gradient flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      <div className="rounded-2xl border border-[color:var(--brand-gold)]/25 bg-[color:var(--paper-2)]/50 p-4 text-sm text-[color:var(--brand-muted)]">
        Need help? Submit a support ticket and our team will respond within 24 hours. For urgent issues, contact us via WhatsApp.
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[color:var(--brand-maroon)]" size={26} /></div>
      ) : tickets.length === 0 ? (
        <div className="premium-card mt-6 p-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)]">
            <MessageSquare className="h-8 w-8 text-[color:var(--brand-maroon)]" />
          </div>
          <p className="font-display text-lg font-semibold text-[color:var(--ink)]">No support tickets yet.</p>
          <p className="mt-1 text-sm text-[color:var(--brand-muted)]">Tap "New Ticket" if you need help.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {tickets.map((t, i) => (
            <Reveal key={t.id} delay={Math.min(i, 8) * 40}>
            <div className="premium-card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--paper-2)]">
                <MessageSquare size={18} className="text-[color:var(--brand-maroon)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[color:var(--ink)]">{t.subject}</p>
                <p className="text-xs text-[color:var(--brand-muted)]">
                  {t.category} · {new Date(t.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${STATUS_COLORS[t.status] ?? "bg-[color:var(--paper-2)] text-[color:var(--brand-muted)] ring-1 ring-[color:var(--brand-border)]"}`}>
                {(t.status ?? "open").replace("_", " ")}
              </span>
            </div>
            </Reveal>
          ))}
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div className="premium-card relative w-full max-w-md p-6 shadow-[var(--shadow-premium)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[color:var(--ink)]">New Support Ticket</h2>
              <button onClick={() => setDialogOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--brand-border)] text-[color:var(--brand-muted)] transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)]"><X size={18} /></button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="general">General</option>
                  <option value="orders">Orders</option>
                  <option value="products">Products</option>
                  <option value="payments">Payments</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                </select>
              </div>
              <div><label className={labelCls}>Subject *</label><input className={inputCls} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of your issue" /></div>
              <div><label className={labelCls}>Message *</label><textarea className={inputCls} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail..." /></div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDialogOpen(false)} className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]">Cancel</button>
              <button onClick={submit} disabled={saving} className="bg-brand-gradient flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}Submit ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
