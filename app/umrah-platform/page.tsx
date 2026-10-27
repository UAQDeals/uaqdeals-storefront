import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Umrah Booking Growth & Management Platform",
  description:
    "Proposal: a digital platform for Umrah package promotion, customer acquisition and booking management — built for Umm Al Quwain travel teams.",
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=2000&h=1100&fit=crop&auto=format";
const BREAK_IMG =
  "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=2000&h=1000&fit=crop&auto=format";

function SectionHeader({
  eyebrow,
  title,
  id,
}: {
  eyebrow: string;
  title: string;
  id: string;
}) {
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

const TOC = [
  { id: "exec-summary", label: "Summary" },
  { id: "objectives", label: "Objectives" },
  { id: "services", label: "Services" },
  { id: "conversion", label: "Conversion" },
  { id: "dashboards", label: "Dashboards" },
  { id: "revenue", label: "Revenue" },
  { id: "kpis", label: "KPIs" },
  { id: "technical", label: "Technical" },
  { id: "roadmap", label: "Roadmap" },
  { id: "risk", label: "Risk" },
  { id: "priorities", label: "Priorities" },
  { id: "value", label: "Value" },
  { id: "conclusion", label: "Conclusion" },
];

const objectives = [
  "Increase the number of qualified Umrah package enquiries.",
  "Help participating travel teams attract new customers.",
  "Convert more enquiries into confirmed bookings through structured follow-ups.",
  "Make Umrah packages easier to discover and compare.",
  "Centralise customer enquiries and booking records.",
  "Improve sales team productivity and accountability.",
  "Establish sustainable revenue streams for UAQ Deals.",
  "Build long-term relationships with customers and travel partners.",
];

const services = [
  {
    icon: <Plane className="h-5 w-5" />,
    title: "3.1 — Umrah Package Marketplace",
    desc: "Participating travel teams publish packages that customers can browse, compare and enquire about directly.",
    items: [
      "Package name and description",
      "Total price and applicable conditions",
      "Departure date and duration",
      "Flight information, where confirmed",
      "Makkah and Madinah hotel details",
      "Room and transport arrangements",
      "Meals and other inclusions",
      "Visa assistance details, where applicable",
      "Available seats, based on verified operator information",
      "Terms, cancellation conditions and exclusions",
      "Contact details and enquiry options",
    ],
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: "3.2 — Customer Enquiry Generation",
    desc: "Multiple enquiry channels, each linked to a package and, where possible, its original marketing source — so teams can see which campaigns generate genuine interest.",
    items: [
      "Website enquiry forms",
      "WhatsApp enquiry links",
      "Package-specific contact buttons",
      "Group and family enquiry forms",
      "Social media campaign links",
      "Referral links",
      "Promotional landing pages",
    ],
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "3.3 — Customer Relationship Management (CRM)",
    desc: "A central CRM organises every enquiry and customer interaction, with controlled access and duplicate-lead detection.",
    items: [
      "Customer name and contact details",
      "Preferred package",
      "Expected departure period",
      "Number of travellers",
      "Enquiry source",
      "Assigned sales representative",
      "Last contact date",
      "Next follow-up date",
      "Notes and customer preferences",
      "Current enquiry status",
    ],
    note: "Recommended lead statuses: New → Contacted → Interested → Follow-up Required → Booking Pending → Confirmed / Lost.",
  },
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "3.4 — Sales Team Management",
    desc: "Each participating travel team gets a dedicated workspace with role-based permissions.",
    items: [
      "Create and manage staff accounts",
      "Assign leads to sales representatives",
      "Monitor follow-up activity",
      "View individual and team performance",
      "Track lead-to-booking conversion rates",
      "Identify overdue follow-ups",
      "Review booking history and changes",
    ],
  },
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: "3.5 — Booking Management",
    desc: "The booking module organises the customer journey after an enquiry, distinguishing an enquiry, a booking request and a confirmed booking.",
    items: [
      "1. Customer submits an enquiry",
      "2. Sales staff contact the customer",
      "3. Travel team confirms package details and availability",
      "4. Customer receives booking terms and payment instructions",
      "5. Operator records the booking and payment status",
      "6. Customer receives a booking confirmation",
      "7. Team manages pre-departure communication",
    ],
    note: "A booking must not be marked confirmed until the authorised operator verifies the necessary details.",
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: "3.6 — WhatsApp Communication & Follow-up",
    desc: "WhatsApp as a key customer communication channel, using authorised integrations where required.",
    items: [
      "Package-specific WhatsApp enquiry buttons",
      "Pre-filled enquiry messages",
      "Follow-up reminders",
      "Booking confirmation message templates",
      "Payment reminder templates",
      "Departure information messages",
      "Post-trip feedback requests",
    ],
  },
  {
    icon: <Megaphone className="h-5 w-5" />,
    title: "3.7 — Digital Marketing Support",
    desc: "Marketing tools for participating teams, with reports showing which sources produce enquiries and confirmed bookings.",
    items: [
      "Package poster creation",
      "Social media promotional creatives",
      "Campaign-specific landing pages",
      "Shareable package links",
      "Referral campaign materials",
      "Featured package placement",
      "Promotional offer management",
      "Campaign enquiry tracking",
    ],
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: "3.8 — Customer Assistance & Package Comparison",
    desc: "Useful information surfaced before a customer ever contacts a sales representative. All published details are verified by the responsible operator and kept up to date.",
    items: [
      "Frequently asked questions",
      "Package comparison",
      "Hotel and transport information",
      "Trip duration comparison",
      "Group booking requests",
      "Family travel enquiries",
      "Contact support",
      "Pre-departure information",
    ],
  },
];

const conversionStages = [
  { title: "Attract", desc: "Publish relevant packages and promote them through approved digital marketing channels." },
  { title: "Capture", desc: "Make it easy for customers to enquire through a short form or WhatsApp." },
  { title: "Qualify", desc: "Identify the customer's preferred dates, budget, group size and travel requirements." },
  { title: "Follow Up", desc: "Assign a sales representative and schedule appropriate follow-up reminders." },
  { title: "Convert", desc: "Help the operator confirm availability, provide accurate information and explain payment terms." },
  { title: "Retain", desc: "Request feedback after the trip and encourage referrals through approved referral programmes." },
];

const dashboards = [
  {
    title: "Admin Dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    items: [
      "Total participating travel teams",
      "Published packages",
      "New customer enquiries",
      "Enquiries awaiting follow-up",
      "Confirmed bookings",
      "Booking conversion rate",
      "Campaign performance",
      "Partner subscription status",
      "Revenue and commission records",
    ],
  },
  {
    title: "Travel Team Dashboard",
    icon: <Hotel className="h-5 w-5" />,
    items: [
      "Its own packages",
      "Assigned leads",
      "Customer enquiries",
      "Follow-up reminders",
      "Booking records",
      "Payment status",
      "Sales representative performance",
      "Reports for its own operations",
    ],
  },
  {
    title: "Sales Representative Dashboard",
    icon: <Users className="h-5 w-5" />,
    items: [
      "View assigned leads",
      "Contact customers",
      "Update enquiry statuses",
      "Schedule follow-ups",
      "Record relevant customer notes",
      "Track their own conversion performance",
    ],
  },
];

const revenueStreams = [
  { stream: "Partner subscription", desc: "Monthly or annual fee for team dashboard access" },
  { stream: "Featured listings", desc: "Fee for additional package visibility" },
  { stream: "Marketing services", desc: "Charges for promotional design and campaign management" },
  { stream: "Qualified leads", desc: "Agreed fee for eligible, genuine customer enquiries" },
  { stream: "Booking commission", desc: "Contractually agreed commission on eligible confirmed bookings" },
  { stream: "Premium reporting", desc: "Advanced reporting and management tools" },
];

const kpis = [
  { kpi: "Total enquiries", purpose: "Measures customer interest" },
  { kpi: "Qualified enquiries", purpose: "Measures the quality of leads" },
  { kpi: "Contact response time", purpose: "Measures sales responsiveness" },
  { kpi: "Follow-up completion rate", purpose: "Measures consistency" },
  { kpi: "Enquiry-to-booking conversion", purpose: "Measures sales effectiveness" },
  { kpi: "Cost per qualified lead", purpose: "Measures marketing efficiency" },
  { kpi: "Cost per confirmed booking", purpose: "Measures acquisition cost" },
  { kpi: "Revenue per partner", purpose: "Measures commercial performance" },
  { kpi: "Customer satisfaction", purpose: "Measures service quality" },
  { kpi: "Referral-generated bookings", purpose: "Measures customer advocacy" },
];

const technical = [
  "Responsive website suitable for mobile devices",
  "Secure database and authenticated user accounts",
  "Separate administrator, manager and staff permissions",
  "Package management module",
  "CRM and lead assignment module",
  "Booking and payment-status tracking",
  "WhatsApp integration options",
  "Search and package filtering",
  "Reporting and analytics",
  "Notification and reminder system",
  "Backup and recovery procedures",
  "Audit logs for important actions",
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "Planning",
    items: [
      "Confirm the business model",
      "Identify participating travel teams",
      "Define package publication requirements",
      "Agree on lead ownership and commercial terms",
      "Confirm applicable licensing and compliance requirements",
    ],
  },
  {
    phase: "Phase 2",
    title: "Minimum Viable Product (MVP)",
    items: [
      "Public Umrah package listing",
      "Package enquiry forms",
      "WhatsApp enquiry links",
      "Partner login",
      "Lead management",
      "Basic booking records",
      "Follow-up reminders",
      "Basic reporting",
    ],
  },
  {
    phase: "Phase 3",
    title: "Pilot Launch",
    items: [
      "Launch with a limited number of authorised travel partners",
      "Test the complete enquiry-to-booking workflow",
      "Monitor lead quality",
      "Measure staff response times",
      "Identify missing features",
      "Collect feedback from operators and customers",
    ],
  },
  {
    phase: "Phase 4",
    title: "Growth & Automation",
    items: [
      "Advanced marketing attribution",
      "Automated messaging through authorised integrations",
      "Referral management",
      "Enhanced analytics",
      "Partner subscription management",
      "Online payment integration",
      "Additional languages",
      "Mobile application development, if justified by demand",
    ],
  },
];

const risks = [
  { title: "Package accuracy", desc: "Each operator must verify prices, departure dates, hotel details, inclusions and seat availability." },
  { title: "Customer privacy", desc: "Collect only necessary information, restrict access and apply appropriate data-protection controls." },
  { title: "Booking disputes", desc: "Clearly display payment terms, cancellation conditions, refund policies and the responsible operator's identity." },
  { title: "Lead ownership", desc: "Establish transparent rules for duplicate enquiries, reassignment and partner access." },
  { title: "Marketing integrity", desc: "Avoid misleading claims, fabricated reviews, false scarcity and unverified promotional offers." },
  { title: "Regulatory compliance", desc: "Confirm applicable UAE travel, tourism, advertising, data-protection and commercial requirements before launch." },
  { title: "Payment security", desc: "Use authorised payment providers and maintain reliable transaction records." },
];

const priorities = [
  "Professional Umrah package listings",
  "Simple WhatsApp and website enquiries",
  "Centralised lead management",
  "Staff assignment and follow-up reminders",
  "Booking status tracking",
  "Marketing source tracking",
  "Basic performance reports",
];

const businessValue = [
  "Improve package visibility",
  "Make customer enquiries easier",
  "Reduce missed follow-ups",
  "Improve sales team accountability",
  "Identify effective marketing channels",
  "Build better customer relationships",
  "Measure the progress from enquiry to confirmed booking",
  "Create recurring revenue opportunities for UAQ Deals",
];

export default function UmrahPlatformPage() {
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
              Business &amp; Technology Proposal
            </span>
            <h1 className="font-display mt-5 max-w-[760px] text-[32px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[46px]">
              Umrah Booking Growth &amp; Management Platform
            </h1>
            <p className="mt-4 max-w-[600px] text-[15.5px] leading-relaxed text-white/85">
              Umrah Package Promotion, Customer Acquisition &amp; Booking Management System for Umm Al Quwain&rsquo;s
              travel teams — from package discovery to confirmed booking.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-white/80">
              <span><span className="font-semibold text-white">Prepared for</span> — UAQ Deals</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Umm Al Quwain, UAE</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-gold)]/90 px-2.5 py-0.5 font-semibold text-[color:var(--ink)]">
                Proposed Implementation Plan
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Table of contents ── */}
      <div className="sticky top-0 z-10 border-b border-[color:var(--brand-border)] bg-[color:var(--paper)]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1040px] overflow-x-auto px-5 md:px-8">
          <nav className="flex gap-5 py-3 text-[12.5px] font-semibold whitespace-nowrap text-neutral-600">
            {TOC.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="shrink-0 transition hover:text-[color:var(--brand-maroon)]">
                {t.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1040px] px-5 py-14 md:px-8 md:py-16">
        {/* 1. Executive Summary */}
        <Reveal>
          <SectionHeader eyebrow="01 — Executive Summary" title="A growth platform, not just an ad listing" id="exec-summary" />
          <div className="premium-card mt-6 p-6 sm:p-8">
            <p className="text-[15px] leading-relaxed text-neutral-700">
              UAQ Deals aims to develop a digital platform that helps Umrah travel teams promote their packages,
              attract potential pilgrims, manage customer enquiries, improve sales follow-ups and convert enquiries
              into confirmed bookings.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
              The proposed application combines a public-facing Umrah package marketplace with a business
              management dashboard for participating travel teams — providing an end-to-end booking growth
              workflow, from package discovery and customer enquiry to sales follow-up, booking confirmation and
              performance reporting.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
              The main objective is to create a scalable digital service that benefits customers, Umrah operators
              and UAQ Deals.
            </p>
          </div>
        </Reveal>

        {/* 2. Business Objectives */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow="02 — Business Objectives" title="What the platform is built to achieve" id="objectives" />
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
            <SectionHeader eyebrow="03 — Proposed Application Services" title="Eight modules, one booking workflow" id="services" />
            <div className="mt-6 space-y-5">
              {services.map((s) => (
                <div key={s.title} className="premium-card p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--brand-maroon)] to-[color:var(--brand-red)] text-white shadow-sm">
                      {s.icon}
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
              ))}
            </div>
          </div>
        </Reveal>

        {/* Image break */}
        <Reveal delay={60}>
          <div className="relative mt-14 overflow-hidden rounded-3xl shadow-[var(--shadow-premium)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BREAK_IMG} alt="Pilgrims performing Umrah" className="h-[220px] w-full object-cover sm:h-[280px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <p className="font-display absolute bottom-5 left-6 right-6 text-[17px] font-medium text-white sm:text-[20px]">
              &ldquo;Attract. Capture. Qualify. Follow up. Convert. Retain.&rdquo;
            </p>
          </div>
        </Reveal>

        {/* 4. Booking Conversion Strategy */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow="04 — Booking Conversion Strategy" title="Not just enquiries — confirmed bookings" id="conversion" />
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
            <SectionHeader eyebrow="05 — Recommended Dashboards" title="Three roles, three focused views" id="dashboards" />
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {dashboards.map((d) => (
                <div key={d.title} className="premium-card p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-white shadow-sm">
                    {d.icon}
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
              ))}
            </div>
          </div>
        </Reveal>

        {/* 6. Revenue Model */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow="06 — Revenue Model" title="How UAQ Deals monetises the platform" id="revenue" />
            <div className="premium-card mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-[13.5px]">
                  <thead>
                    <tr className="bg-maroon-radial text-white">
                      <th className="px-5 py-3 font-semibold">Revenue stream</th>
                      <th className="px-5 py-3 font-semibold">Description</th>
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
              Recommended approach: begin with a clear partner subscription or marketing service offering, then
              introduce additional revenue models once demand and operating costs are understood. Any commission or
              travel-related commercial arrangement must follow applicable UAE licensing and regulatory requirements.
            </p>
          </div>
        </Reveal>

        {/* 7. KPIs */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow="07 — Key Performance Indicators" title="How success will be measured" id="kpis" />
            <div className="premium-card mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-[13.5px]">
                  <thead>
                    <tr className="bg-maroon-radial text-white">
                      <th className="px-5 py-3 font-semibold">KPI</th>
                      <th className="px-5 py-3 font-semibold">Purpose</th>
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
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">
              Baseline performance should be measured during the initial pilot. Targets should be established using
              actual results rather than unsupported estimates.
            </p>
          </div>
        </Reveal>

        {/* 8. Technical Requirements */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow="08 — Technical Requirements" title="Core components the build must include" id="technical" />
            <div className="premium-card mt-6 p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                {technical.map((t) => (
                  <div key={t} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-neutral-700">
                    <Database className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-maroon)]" />
                    {t}
                  </div>
                ))}
              </div>
              <div className="gold-rule my-6" />
              <p className="text-[13.5px] leading-relaxed text-neutral-600">
                If the platform later supports online payments, the payment gateway should be integrated securely —
                the application must not store raw payment card details. Passport and other sensitive traveller
                information should be collected only when necessary, protected through encryption and restricted
                access, and retained according to applicable requirements.
              </p>
            </div>
          </div>
        </Reveal>

        {/* 9. Implementation Roadmap */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow="09 — Implementation Roadmap" title="From planning to growth, in four phases" id="roadmap" />
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
            <SectionHeader eyebrow="10 — Risk Management & Compliance" title="What must be addressed before launch" id="risk" />
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
            <SectionHeader eyebrow="11 — Recommended Initial Priorities" title="The first release, in order" id="priorities" />
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
              <p className="mt-5 text-[13px] leading-relaxed text-neutral-600">
                These features provide a measurable starting point without requiring the expense and complexity of
                building every advanced feature at once.
              </p>
            </div>
          </div>
        </Reveal>

        {/* 12. Expected Business Value */}
        <Reveal delay={60}>
          <div className="mt-14">
            <SectionHeader eyebrow="12 — Expected Business Value" title="What this unlocks, if executed well" id="value" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {businessValue.map((v) => (
                <div key={v} className="flex items-start gap-2.5 rounded-xl bg-[color:var(--paper-2)] px-4 py-3 text-[14px] leading-relaxed text-neutral-700">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-maroon)]" />
                  {v}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">
              Actual booking growth will depend on package competitiveness, marketing reach, customer trust, lead
              quality, operator reliability and sales execution. Results should be assessed through pilot data.
            </p>
          </div>
        </Reveal>

        {/* 13. Conclusion */}
        <Reveal delay={60}>
          <div className="mt-14" id="conclusion">
            <div className="bg-maroon-radial relative overflow-hidden rounded-3xl px-7 py-12 text-center shadow-[var(--shadow-premium)] sm:px-12">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
              <Rocket className="mx-auto h-8 w-8 text-[color:var(--brand-gold)]" />
              <p className="eyebrow mt-4 text-white/80">Final Recommendation</p>
              <p className="font-display mx-auto mt-3 max-w-[640px] text-[20px] font-semibold leading-snug text-white sm:text-[25px]">
                Build UAQ Deals as a customer-facing Umrah marketplace, supported by a dedicated partner management
                system — with booking conversion and customer experience as the primary performance objectives.
              </p>
              <p className="mx-auto mt-4 max-w-[600px] text-[14px] leading-relaxed text-white/80">
                Begin with a focused MVP, validate demand through a controlled partner pilot, and expand based on
                measured business results.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/umrah-platform/how-it-works" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-[color:var(--brand-maroon)] shadow-[var(--shadow-card)] transition hover:brightness-105">
                  See how it works <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <a href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                  Discuss this proposal
                </a>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" /> Status: Proposed Implementation Plan
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-[color:var(--brand-border)] bg-white px-5 py-4 text-[12.5px] leading-relaxed text-neutral-500">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-gold-deep)]" />
              <span>
                <span className="font-semibold text-neutral-600">Document note —</span> This proposal describes a
                recommended business and technology model. Financial projections, market size, partner commitments,
                licensing status and implementation costs must be validated separately before investment or
                commercial launch.
              </span>
            </div>
          </div>
        </Reveal>

        {/* Workflow footnote */}
        <div className="mt-10 flex items-center justify-center gap-2 text-[12px] text-neutral-400">
          <Workflow className="h-3.5 w-3.5" />
          Umrah Package Promotion, Customer Acquisition &amp; Booking Management System — Umm Al Quwain, UAE
        </div>
      </div>
    </div>
  );
}
