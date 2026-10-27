import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Star,
  Plane,
  Hotel,
  Send,
  Phone,
  Check,
  CheckCheck,
  Clock,
  BadgeCheck,
  Users,
  MoreHorizontal,
  Paperclip,
  Smile,
  Mic,
  ChevronLeft,
  CreditCard,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("umrahHowItWorks");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const KAABA_WIDE =
  "https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=900&h=600&fit=crop&auto=format";
const KAABA_CROWD =
  "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=900&h=600&fit=crop&auto=format";
const MADINAH =
  "https://images.unsplash.com/photo-1765892272462-bad4a8ba0fb9?w=900&h=600&fit=crop&auto=format";
const PACKAGE_IMGS = [KAABA_WIDE, MADINAH, KAABA_CROWD];
const PACKAGE_STARS = [5, 4, 5];
const PACKAGE_PRICES = ["4,250", "2,890", "5,600"];

function BrowserFrame({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[color:var(--brand-border)] bg-[color:var(--paper-2)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ec6a5e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#61c454]" />
        <span className="mx-auto flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] text-neutral-400">
          🔒 {title}
        </span>
      </div>
      <div className="bg-[color:var(--paper)]">{children}</div>
    </div>
  );
}

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="overflow-hidden rounded-[2rem] border-[6px] border-[#1b1614] bg-[#e5ddd0] shadow-[var(--shadow-premium)]">
        <div className="flex items-center gap-2.5 bg-[#075e54] px-3.5 py-2.5 text-white">
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold">UD</span>
          <div className="leading-tight">
            <p className="text-[12.5px] font-semibold">{label}</p>
            <p className="text-[10px] text-white/70">online</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function StepTag({ n }: { n: number }) {
  return (
    <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-[14px] font-bold text-white shadow-sm">
      {n}
    </span>
  );
}

export default async function HowItWorksPage() {
  const t = await getTranslations("umrahHowItWorks");

  const packages = (t.raw("packages") as { badge: string; name: string; hotel: string }[]).map((p, i) => ({
    ...p,
    img: PACKAGE_IMGS[i],
    stars: PACKAGE_STARS[i],
    price: PACKAGE_PRICES[i],
  }));
  const columns = t.raw("step3.columns") as string[];
  const counts = [1, 3, 2, 4, 6];

  return (
    <div className="bg-[color:var(--paper)]">
      {/* Hero */}
      <div className="bg-maroon-radial relative overflow-hidden">
        <div className="relative mx-auto max-w-[1040px] px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <Link href="/umrah-platform" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 transition hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("backToProposal")}
            </Link>
            <p className="eyebrow mt-5 text-white/80">{t("eyebrow")}</p>
            <h1 className="font-display mt-2 max-w-[680px] text-[30px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[40px]">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-[580px] text-[15px] leading-relaxed text-white/85">{t("subtitle")}</p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-[1040px] px-5 py-14 md:px-8 md:py-16">
        {/* Step 1 — Discover & Compare */}
        <Reveal>
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <StepTag n={1} />
                <p className="eyebrow">{t("step1.tag")}</p>
              </div>
              <h2 className="font-display mt-3 text-[22px] font-semibold text-[color:var(--ink)] sm:text-[26px]">
                {t("step1.title")}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-600">{t("step1.desc")}</p>
            </div>
            <BrowserFrame title="uaqdeals.ae/umrah">
              <div className="p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-3.5 py-2 text-[12.5px] text-neutral-400">
                    <Search className="h-3.5 w-3.5" /> {t("searchPlaceholder")}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-[color:var(--brand-border)] bg-white px-3 py-2 text-[12px] font-semibold text-neutral-500">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> {t("filters")}
                  </div>
                </div>
                <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
                  {packages.map((p) => (
                    <div key={p.name} className="overflow-hidden rounded-xl border border-[color:var(--brand-border)] bg-white">
                      <div className="relative h-[84px] w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded-full bg-[color:var(--brand-gold)] px-2 py-0.5 text-[9px] font-bold text-white">
                          {p.badge}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="text-[11.5px] font-semibold leading-tight text-[color:var(--ink)]">{p.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500">
                          <Hotel className="h-3 w-3" /> {p.hotel}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: p.stars }).map((_, i) => (
                              <Star key={i} className="h-2.5 w-2.5 fill-[color:var(--brand-gold)] text-[color:var(--brand-gold)]" />
                            ))}
                          </span>
                          <span className="text-[12px] font-bold text-[color:var(--brand-maroon)]">AED {p.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BrowserFrame>
          </div>
        </Reveal>

        <div className="gold-rule my-12" />

        {/* Step 2 — Enquire in seconds */}
        <Reveal delay={60}>
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <BrowserFrame title="uaqdeals.ae/umrah/premium-10-days">
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Plane className="h-3.5 w-3.5" /> {t("step2.packageMeta")}
                </div>
                <p className="font-display mt-1.5 text-[16px] font-semibold text-[color:var(--ink)]">{t("step2.packageName")}</p>
                <p className="text-[12px] text-neutral-500">{t("step2.packageHotels")}</p>
                <div className="mt-4 rounded-xl border border-[color:var(--brand-border)] bg-white p-4">
                  <p className="text-[12px] font-semibold text-[color:var(--ink)]">{t("step2.formLabel")}</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[color:var(--brand-border)] px-3 py-2 text-[11.5px] text-neutral-400">{t("step2.fieldName")}</div>
                    <div className="rounded-lg border border-[color:var(--brand-border)] px-3 py-2 text-[11.5px] text-neutral-400">{t("step2.fieldPhone")}</div>
                    <div className="rounded-lg border border-[color:var(--brand-border)] px-3 py-2 text-[11.5px] text-neutral-400">{t("step2.fieldTravellers")}</div>
                    <div className="rounded-lg border border-[color:var(--brand-border)] px-3 py-2 text-[11.5px] text-neutral-400">{t("step2.fieldMonth")}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="bg-brand-gradient flex-1 rounded-full py-2.5 text-[12.5px] font-bold text-white">
                      {t("step2.sendBtn")}
                    </button>
                    <button className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-[12.5px] font-bold text-white">
                      {t("step2.whatsappBtn")}
                    </button>
                  </div>
                </div>
              </div>
            </BrowserFrame>
            <div>
              <div className="flex items-center gap-3">
                <StepTag n={2} />
                <p className="eyebrow">{t("step2.tag")}</p>
              </div>
              <h2 className="font-display mt-3 text-[22px] font-semibold text-[color:var(--ink)] sm:text-[26px]">
                {t("step2.title")}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-600">{t("step2.desc")}</p>
            </div>
          </div>
        </Reveal>

        <div className="gold-rule my-12" />

        {/* Step 3 — Lead lands in CRM */}
        <Reveal delay={60}>
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <StepTag n={3} />
                <p className="eyebrow">{t("step3.tag")}</p>
              </div>
              <h2 className="font-display mt-3 text-[22px] font-semibold text-[color:var(--ink)] sm:text-[26px]">
                {t("step3.title")}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-600">{t("step3.desc")}</p>
            </div>
            <BrowserFrame title="uaqdeals.ae/partner/leads">
              <div className="overflow-x-auto p-5">
                <div className="flex min-w-[640px] gap-3">
                  {columns.map((label, i) => (
                    <div key={label} className="w-[120px] shrink-0 rounded-xl bg-[color:var(--paper-2)] p-2.5">
                      <p className="flex items-center justify-between text-[10.5px] font-bold text-neutral-500">
                        {label} <span className="rounded-full bg-white px-1.5 text-[9px]">{counts[i]}</span>
                      </p>
                      {i === 0 && (
                        <div className="mt-2 rounded-lg border border-[color:var(--brand-gold)] bg-white p-2.5 shadow-sm">
                          <p className="text-[10.5px] font-semibold text-[color:var(--ink)]">{t("step3.leadName")}</p>
                          <p className="text-[9.5px] text-neutral-500">{t("step3.leadPackage")}</p>
                          <p className="mt-1 flex items-center gap-1 text-[9px] text-[color:var(--brand-gold-deep)]">
                            <Clock className="h-2.5 w-2.5" /> {t("step3.leadSource")}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </BrowserFrame>
          </div>
        </Reveal>

        <div className="gold-rule my-12" />

        {/* Step 4 — Sales rep follows up on WhatsApp */}
        <Reveal delay={60}>
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="premium-card p-4">
                <p className="eyebrow">{t("step4.dashLabel")}</p>
                <div className="mt-3 rounded-xl border border-[color:var(--brand-border)] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-semibold text-[color:var(--ink)]">{t("step4.leadName")}</p>
                    <span className="rounded-full bg-[color:var(--brand-gold)]/15 px-2 py-0.5 text-[9px] font-bold text-[color:var(--brand-gold-deep)]">
                      {t("step4.statusBadge")}
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px] text-neutral-500">{t("step4.packageLine")}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <Clock className="h-3 w-3" /> {t("step4.nextFollowUp")}
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-[color:var(--paper-2)] px-2.5 py-1 text-[10px] font-semibold text-neutral-600">
                      <Phone className="h-3 w-3" /> {t("step4.callBtn")}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-1 text-[10px] font-semibold text-[#128C4A]">
                      <Send className="h-3 w-3" /> {t("step4.whatsappBtn")}
                    </span>
                  </div>
                </div>
              </div>

              <PhoneFrame label={t("step4.leadName")}>
                <div className="flex h-[280px] flex-col justify-end gap-2 p-3">
                  <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-white px-2.5 py-1.5 text-[10.5px] shadow-sm">
                    {t("step4.chatMsg1")}
                    <p className="mt-0.5 flex items-center justify-end gap-1 text-[8.5px] text-neutral-400">
                      10:02 <CheckCheck className="h-2.5 w-2.5 text-[#53bdeb]" />
                    </p>
                  </div>
                  <div className="mr-auto max-w-[85%] rounded-lg rounded-tl-none bg-[#dcf8c6] px-2.5 py-1.5 text-[10.5px] shadow-sm">
                    {t("step4.chatMsg2")}
                    <p className="mt-0.5 text-right text-[8.5px] text-neutral-400">10:03</p>
                  </div>
                  <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-white px-2.5 py-1.5 text-[10.5px] shadow-sm">
                    {t("step4.chatMsg3")}
                    <p className="mt-0.5 flex items-center justify-end gap-1 text-[8.5px] text-neutral-400">
                      10:05 <CheckCheck className="h-2.5 w-2.5 text-[#53bdeb]" />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-black/5 bg-[#f0f0f0] px-3 py-2">
                  <Smile className="h-4 w-4 text-neutral-400" />
                  <Paperclip className="h-4 w-4 text-neutral-400" />
                  <div className="flex-1 rounded-full bg-white px-3 py-1.5 text-[10px] text-neutral-300">{t("step4.msgPlaceholder")}</div>
                  <Mic className="h-4 w-4 text-neutral-400" />
                </div>
              </PhoneFrame>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <StepTag n={4} />
                <p className="eyebrow">{t("step4.tag")}</p>
              </div>
              <h2 className="font-display mt-3 text-[22px] font-semibold text-[color:var(--ink)] sm:text-[26px]">
                {t("step4.title")}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-600">{t("step4.desc")}</p>
            </div>
          </div>
        </Reveal>

        <div className="gold-rule my-12" />

        {/* Step 5 — Booking confirmed */}
        <Reveal delay={60}>
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <StepTag n={5} />
                <p className="eyebrow">{t("step5.tag")}</p>
              </div>
              <h2 className="font-display mt-3 text-[22px] font-semibold text-[color:var(--ink)] sm:text-[26px]">
                {t("step5.title")}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-600">{t("step5.desc")}</p>
            </div>
            <BrowserFrame title="uaqdeals.ae/partner/bookings/UB-10492">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  {[t("step5.stepperEnquiry"), t("step5.stepperPending"), t("step5.stepperConfirmed")].map((s, i) => (
                    <div key={s} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--brand-maroon)] text-[10px] font-bold text-white">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="text-[9.5px] font-semibold text-neutral-500">{s}</span>
                      </div>
                      {i < 2 && <span className="mx-1.5 h-[2px] flex-1 bg-[color:var(--brand-maroon)]" />}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-[color:var(--brand-gold)]/40 bg-[color:var(--brand-gold)]/10 px-4 py-3">
                  <BadgeCheck className="h-5 w-5 shrink-0 text-[color:var(--brand-gold-deep)]" />
                  <div>
                    <p className="text-[12.5px] font-bold text-[color:var(--ink)]">{t("step5.confirmedTitle")}</p>
                    <p className="text-[11px] text-neutral-500">{t("step5.confirmedLine")}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    { icon: <Users className="h-3.5 w-3.5" />, label: t("step5.metaTravellers") },
                    { icon: <Hotel className="h-3.5 w-3.5" />, label: t("step5.metaHotel") },
                    { icon: <CreditCard className="h-3.5 w-3.5" />, label: t("step5.metaDeposit") },
                    { icon: <Plane className="h-3.5 w-3.5" />, label: t("step5.metaFlights") },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-[10.5px] text-neutral-600 shadow-sm">
                      <span className="text-[color:var(--brand-maroon)]">{m.icon}</span> {m.label}
                    </div>
                  ))}
                </div>
              </div>
            </BrowserFrame>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={60}>
          <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-[color:var(--brand-border)] bg-white px-7 py-10 text-center shadow-[var(--shadow-card)]">
            <MoreHorizontal className="h-5 w-5 text-[color:var(--brand-gold-deep)]" />
            <p className="font-display max-w-[520px] text-[18px] font-semibold text-[color:var(--ink)] sm:text-[21px]">
              {t("footer.note1")}
            </p>
            <p className="max-w-[480px] text-[13.5px] leading-relaxed text-neutral-600">{t("footer.note2")}</p>
            <Link href="/umrah-platform" className="bg-brand-gradient mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
              {t("footer.cta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
