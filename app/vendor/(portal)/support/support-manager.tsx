"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2, MessageSquare, X } from "lucide-react";

type Ticket = Record<string, any>;

const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";
const labelCls = "block text-xs font-medium text-neutral-600 mb-1";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-neutral-100 text-neutral-500",
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Support</h1>
        <button onClick={() => setDialogOpen(true)} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-[#8E1B3A]/15 bg-[#8E1B3A]/[0.04] p-4 text-sm text-neutral-600">
        Need help? Submit a support ticket and our team will respond within 24 hours. For urgent issues, contact us via WhatsApp.
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8E1B3A]" size={24} /></div>
      ) : tickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-neutral-500">
          No support tickets yet. Tap "New Ticket" if you need help.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {tickets.map(t => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
              <MessageSquare size={18} className="shrink-0 text-[#8E1B3A]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{t.subject}</p>
                <p className="text-xs text-neutral-500">
                  {t.category} · {new Date(t.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_COLORS[t.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                {(t.status ?? "open").replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">New Support Ticket</h2>
              <button onClick={() => setDialogOpen(false)} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
            </div>
            <div className="space-y-3">
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
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDialogOpen(false)} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700">Cancel</button>
              <button onClick={submit} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-2.5 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}Submit ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
