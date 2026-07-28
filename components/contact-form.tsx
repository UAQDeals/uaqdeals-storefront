"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Reveal } from "@/components/reveal";

export function ContactForm() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!name.trim() || !message.trim() || (!email.trim() && !phone.trim())) {
      toast.error(t("fillRequired"));
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
      toast.error(error.message || t("sendError"));
      return;
    }
    setSent(true);
    toast.success(t("sentToast"));
  }

  if (sent) {
    return (
      <Reveal className="premium-card flex flex-col items-center justify-center p-10 text-center">
        <span className="bg-brand-gradient inline-flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[var(--shadow-card)]">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="font-display mt-5 text-[22px] font-semibold text-[color:var(--ink)]">{t("sentTitle")}</h2>
        <p className="mt-1.5 text-sm text-[color:var(--brand-muted)]">{t("sentDesc")}</p>
      </Reveal>
    );
  }

  return (
    <Reveal className="premium-card p-5 sm:p-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("formName")}>
          <input value={name} onChange={(e) => setName(e.target.value)} className="ctl" />
        </Field>
        <Field label={t("formSubject")}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="ctl" placeholder={t("formSubjectPlaceholder")} />
        </Field>
        <Field label={t("formEmail")}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="ctl" placeholder="you@example.com" />
        </Field>
        <Field label={t("formPhone")}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="ctl" placeholder="+9715XXXXXXXX" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label={t("formMessage")}>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="ctl resize-none py-2.5" placeholder={t("formMessagePlaceholder")} />
        </Field>
      </div>
      <button onClick={submit} disabled={sending} className="bg-brand-gradient mt-6 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
        {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("sending")}</> : <><Send className="h-4 w-4" /> {t("send")}</>}
      </button>

      <style jsx>{`
        :global(.ctl) {
          height: 46px; width: 100%; border-radius: 0.75rem;
          border: 1px solid var(--brand-border); background: #fff;
          padding: 0 0.9375rem; font-size: 0.9rem; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(textarea.ctl) { height: auto; }
        :global(.ctl:focus) {
          border-color: var(--brand-maroon);
          box-shadow: 0 0 0 3px rgb(201 162 75 / 0.28);
        }
      `}</style>
    </Reveal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-muted)]">{label}</span>
      {children}
    </label>
  );
}
