import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Plane,
  Hotel,
  Users,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  LayoutDashboard,
  DollarSign,
  BarChart3,
  CheckCircle2,
  MapPin,
  ClipboardList,
  Megaphone,
  HelpCircle,
  AlertTriangle,
  Rocket,
  ArrowRight,
  Workflow,
  Database,
  BadgeCheck,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("umrahPlatform");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const HERO_IMG =
  "https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=2000&h=1100&fit=crop&auto=format";
const BREAK_IMG =
  "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=2000&h=1000&fit=crop&auto=format";

const SERVICE_ICONS = [
  Plane,
  MessageCircle,
  Users,
  LayoutDashboard,
  ClipboardList,
  MessageCircle,
  Megaphone,
  HelpCircle,
];
const DASHBOARD_ICONS = [BarChart3, Hotel, Users];

type Named<T> = T & { id: string };

function SectionHeader({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div id={id} className="scroll-mt-28">
      <div className="flex items-center gap-3">
        <span className="accent-bar h-7 w-1.5 rounded-full" />
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="font-display mt-0.5 text-[22px] font-semibold leading-tight text-[color:var(--ink)] sm:text-[26px]">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default async function UmrahPlatformPage() {
  const t = await getTranslations("umrahPlatform");

  const toc: Named<{ label: string }>[] = [
    { id: "exec-summary", label: t("toc.summary") },
    { id: "objectives", label: t("toc.objectives") },
    { id: "services", label: t("toc.services") },
    { id: "conversion", label: t("toc.conversion") },
    { id: "dashboards", label: t("toc.dashboards") },
    { id: "revenue", label: t("toc.revenue") },
    { id: "kpis", label: t("toc.kpis") },
    { id: "technical", label: t("toc.technical") },
    { id: "roadmap", label: t("toc.roadmap") },
    { id: "risk", label: t("toc.risk") },
    { id: "priorities", label: t("toc.priorities") },
    { id: "value", label: t("toc.value") },
    { id: "conclusion", label: t("toc.conclusion") },
  ];

  const objectives = t.raw("objectivesSection.items") as string[];
  const services = t.raw("services.list") as {
    title: string;
    desc: string;
    items: string[];
    note?: string;
  }[];
  const conversionStages = t.raw("conversion.stages") as { title: string; desc: string }[];
  const dashboards = t.raw("dashboards.cards") as { title: string; items: string[] }[];
  const revenueStreams = t.raw("revenue.rows") as { stream: string; desc: string }[];
  const kpis = t.raw("kpis.rows") as { kpi: string; purpose: string }[];
  const technical = t.raw("technical.items") as string[];
  const roadmap = t.raw("roadmap.phases") as { phase: string; title: string; items: string[] }[];
  const risks = t.raw("risk.items") as { title: string; desc: string }[];
  const priorities = t.raw("priorities.items") as string[];
  const businessValue = t.raw("value.items") as string[];

  return (
    <div className="bg-[color:var(--paper)]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMG} alt="The Kaaba at Masjid al-Haram, Makkah" className="h-full w-full object-cover" />
          <div className="bg-maroon-radial absolute inset-0 opacity-[0.86] mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        </div>
        <div className="relative mx-auto max-w-[1040px] px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-white/90 backdrop-blur-sm">
              {t("hero.eyebrow")}
            </span>
            <h1 className="font-display mt-5 max-w-[760px] text-[32px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[46px]">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-[600px] text-[15.5px] leading-relaxed text-white/85">{t("hero.subtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-white/80">
              <span>
                <span className="font-semibold text-white">{t("hero.preparedForLabel")}</span> — {t("hero.preparedFor")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {t("hero.location")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-gold)]/90 px-2.5 py-0.5 font-semibold text-[color:var(--ink)]">
                {t("hero.status")}
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Table of contents ── */}
      <div className="sticky top-0 z-10 border-b border-[color:var(--brand-border)] bg-[color:var(--paper)]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1040px] overflow-x-auto px-5 md:px-8">
          <nav className="flex gap-5 py-3 text-[12.5px] font-semibold whitespace-nowrap text-neutral-600">
            {toc.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="shrink-0 transition hover:text-[color:var(--brand-maroon)]">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1040px] px-5 py-14 md:px-8 md:py-16">
        {/* 1. Executive Summary */}
        <Reveal>
          <SectionHeader eyebrow={t("execSummary.eyebrow")} title={t("execSummary.title")} id="exec-summary" />
          <div className="premium-card mt-6 p-6 sm:p-8">
            <p className="text-[15px] leading-relaxed text-neutral-700">{t("execSummary.p1")}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{t("execSummary.p2")}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{t("execSummary.p3")}</p>
          </div>
        </Reveal>

        {/* 2. Business Objectives */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("objectivesSection.eyebrow")} title={t("objectivesSection.title")} id="objectives" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {objectives.map((o, i) => (
                <div key={o} className="premium-card flex items-start gap-3 p-4">
                  <span className="font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-[12.5px] font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-[14px] leading-relaxed text-neutral-700">{o}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 3. Proposed Application Services */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("services.eyebrow")} title={t("services.title")} id="services" />
            <div className="mt-6 space-y-5">
              {services.map((s, i) => {
                const Icon = SERVICE_ICONS[i] ?? Plane;
                return (
                  <div key={s.title} className="premium-card p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--brand-maroon)] to-[color:var(--brand-red)] text-white shadow-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="font-display text-[16.5px] font-semibold text-[color:var(--ink)]">{s.title}</h3>
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-neutral-700">{s.desc}</p>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {s.items.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-neutral-600">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--brand-gold-deep)]" />
                          {it}
                        </li>
                      ))}
                    </ul>
                    {s.note && (
                      <p className="mt-4 rounded-xl bg-[color:var(--paper-2)] px-4 py-3 text-[13px] leading-relaxed text-neutral-600">
                        {s.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Image break */}
        <Reveal delay={60}>
          <div className="relative mt-14 overflow-hidden rounded-3xl shadow-[var(--shadow-premium)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BREAK_IMG} alt={t("breakImgAlt")} className="h-[220px] w-full object-cover sm:h-[280px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <p className="font-display absolute bottom-5 left-6 right-6 text-[17px] font-medium text-white sm:text-[20px]">
              {t("breakQuote")}
            </p>
          </div>
        </Reveal>

        {/* 4. Booking Conversion Strategy */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("conversion.eyebrow")} title={t("conversion.title")} id="conversion" />
            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {conversionStages.map((c, i) => (
                <div key={c.title} className="premium-card relative p-4 pt-9">
                  <span className="font-display absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand-maroon)] text-[12.5px] font-bold text-white shadow-[var(--shadow-card)]">
                    {i + 1}
                  </span>
                  <h4 className="font-display text-[14.5px] font-semibold text-[color:var(--ink)]">{c.title}</h4>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-600">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 5. Dashboards */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("dashboards.eyebrow")} title={t("dashboards.title")} id="dashboards" />
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {dashboards.map((d, i) => {
                const Icon = DASHBOARD_ICONS[i] ?? BarChart3;
                return (
                  <div key={d.title} className="premium-card p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display mt-3.5 text-[15.5px] font-semibold text-[color:var(--ink)]">{d.title}</h3>
                    <ul className="mt-3 space-y-1.5">
                      {d.items.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-[13px] leading-relaxed text-neutral-600">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--brand-gold-deep)]" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* 6. Revenue Model */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("revenue.eyebrow")} title={t("revenue.title")} id="revenue" />
            <div className="premium-card mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-[13.5px]">
                  <thead>
                    <tr className="bg-maroon-radial text-white">
                      <th className="px-5 py-3 font-semibold">{t("revenue.colStream")}</th>
                      <th className="px-5 py-3 font-semibold">{t("revenue.colDesc")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueStreams.map((r, i) => (
                      <tr key={r.stream} className={i % 2 ? "bg-[color:var(--paper-2)]" : "bg-white"}>
                        <td className="px-5 py-3 font-semibold text-[color:var(--ink)] whitespace-nowrap">{r.stream}</td>
                        <td className="px-5 py-3 text-neutral-600">{r.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 inline-flex items-start gap-2 text-[13px] leading-relaxed text-neutral-600">
              <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-gold-deep)]" />
              {t("revenue.note")}
            </p>
          </div>
        </Reveal>

        {/* 7. KPIs */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("kpis.eyebrow")} title={t("kpis.title")} id="kpis" />
            <div className="premium-card mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-[13.5px]">
                  <thead>
                    <tr className="bg-maroon-radial text-white">
                      <th className="px-5 py-3 font-semibold">{t("kpis.colKpi")}</th>
                      <th className="px-5 py-3 font-semibold">{t("kpis.colPurpose")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map((k, i) => (
                      <tr key={k.kpi} className={i % 2 ? "bg-[color:var(--paper-2)]" : "bg-white"}>
                        <td className="px-5 py-3 font-semibold text-[color:var(--ink)] whitespace-nowrap">{k.kpi}</td>
                        <td className="px-5 py-3 text-neutral-600">{k.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">{t("kpis.note")}</p>
          </div>
        </Reveal>

        {/* 8. Technical Requirements */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("technical.eyebrow")} title={t("technical.title")} id="technical" />
            <div className="premium-card mt-6 p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                {technical.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-neutral-700">
                    <Database className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-maroon)]" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="gold-rule my-6" />
              <p className="text-[13.5px] leading-relaxed text-neutral-600">{t("technical.note")}</p>
            </div>
          </div>
        </Reveal>

        {/* 9. Implementation Roadmap */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("roadmap.eyebrow")} title={t("roadmap.title")} id="roadmap" />
            <div className="mt-6 space-y-4">
              {roadmap.map((r) => (
                <div key={r.phase} className="premium-card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex shrink-0 items-center gap-3 sm:w-[180px] sm:flex-col sm:items-start">
                    <span className="eyebrow rounded-full bg-[color:var(--paper-2)] px-3 py-1">{r.phase}</span>
                    <h4 className="font-display text-[16px] font-semibold text-[color:var(--ink)]">{r.title}</h4>
                  </div>
                  <ul className="grid flex-1 gap-2 sm:grid-cols-2">
                    {r.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-neutral-600">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--brand-gold-deep)] rtl:rotate-180" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 10. Risk & Compliance */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("risk.eyebrow")} title={t("risk.title")} id="risk" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {risks.map((r) => (
                <div key={r.title} className="premium-card p-5">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-[color:var(--brand-maroon)]" />
                    <h4 className="font-display text-[14.5px] font-semibold text-[color:var(--ink)]">{r.title}</h4>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 11. Recommended Initial Priorities */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("priorities.eyebrow")} title={t("priorities.title")} id="priorities" />
            <div className="premium-card mt-6 p-6 sm:p-8">
              <ol className="space-y-3">
                {priorities.map((p, i) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-gold)] text-[12px] font-bold text-[color:var(--brand-gold-deep)]">
                      {i + 1}
                    </span>
                    <span className="text-[14.5px] leading-relaxed text-neutral-700">{p}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-[13px] leading-relaxed text-neutral-600">{t("priorities.note")}</p>
            </div>
          </div>
        </Reveal>

        {/* 12. Expected Business Value */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow={t("value.eyebrow")} title={t("value.title")} id="value" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {businessValue.map((v) => (
                <div key={v} className="flex items-start gap-2.5 rounded-xl bg-[color:var(--paper-2)] px-4 py-3 text-[14px] leading-relaxed text-neutral-700">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-maroon)]" />
                  {v}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">{t("value.note")}</p>
          </div>
        </Reveal>

        {/* 13. Conclusion */}
        <Reveal delay={60}>
          <div className="mt-14" id="conclusion">
            <div className="bg-maroon-radial relative overflow-hidden rounded-3xl px-7 py-12 text-center shadow-[var(--shadow-premium)] sm:px-12">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
              <Rocket className="mx-auto h-8 w-8 text-[color:var(--brand-gold)]" />
              <p className="eyebrow mt-4 text-white/80">{t("conclusion.label")}</p>
              <p className="font-display mx-auto mt-3 max-w-[640px] text-[20px] font-semibold leading-snug text-white sm:text-[25px]">
                {t("conclusion.title")}
              </p>
              <p className="mx-auto mt-4 max-w-[600px] text-[14px] leading-relaxed text-white/80">{t("conclusion.sub")}</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/umrah-platform/how-it-works" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-[color:var(--brand-maroon)] shadow-[var(--shadow-card)] transition hover:brightness-105">
                  {t("conclusion.ctaHowItWorks")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <a href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                  {t("conclusion.ctaDiscuss")}
                </a>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" /> {t("conclusion.statusBadge")}
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-[color:var(--brand-border)] bg-white px-5 py-4 text-[12.5px] leading-relaxed text-neutral-500">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-gold-deep)]" />
              <span>
                <span className="font-semibold text-neutral-600">{t("conclusion.docNoteLabel")}</span> {t("conclusion.docNote")}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Workflow footnote */}
        <div className="mt-10 flex items-center justify-center gap-2 text-[12px] text-neutral-400">
          <Workflow className="h-3.5 w-3.5" />
          {t("footnote")}
        </div>
      </div>
    </div>
  );
}
