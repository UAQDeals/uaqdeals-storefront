"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!name.trim() || !message.trim() || (!email.trim() && !phone.trim())) {
      toast.error("Please add your name, a message, and an email or phone");
      return;
    }
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      subject: subject.trim() || null,
      message: message.trim(),
    });
    setSending(false);
    if (error) {
      toast.error(error.message || "Could not send message");
      return;
    }
    setSent(true);
    toast.success("Message sent! We'll get back to you soon.");
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[color:var(--brand-border)] bg-white p-10 text-center">
        <span className="bg-brand-gradient inline-flex h-14 w-14 items-center justify-center rounded-full text-white">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold">Thank you!</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Your message has been sent. Our team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name *">
          <input value={name} onChange={(e) => setName(e.target.value)} className="ctl" placeholder="Full name" />
        </Field>
        <Field label="Subject">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="ctl" placeholder="What's this about?" />
        </Field>
        <Field label="Email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="ctl" placeholder="you@example.com" />
        </Field>
        <Field label="Phone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="ctl" placeholder="+9715XXXXXXXX" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Message *">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="ctl resize-none py-2.5" placeholder="How can we help?" />
        </Field>
      </div>
      <button
        onClick={submit}
        disabled={sending}
        className="bg-brand-gradient mt-5 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
      >
        {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send message</>}
      </button>

      <style jsx>{`
        :global(.ctl) {
          height: 42px;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          background: #fff;
          padding: 0 0.875rem;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(textarea.ctl) { height: auto; }
        :global(.ctl:focus) { border-color: var(--brand-maroon); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
