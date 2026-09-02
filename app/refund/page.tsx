// app/refund/page.tsx  — UAQ Deals Refund Policy
// Standalone public legal page. Mirrors the styling of the Privacy and
// Terms pages. Exempt from the emirate gate in middleware.ts so it is
// reachable at a public URL without selecting an emirate.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — UAQ Deals",
  description:
    "How UAQ Deals handles cancellations, returns, and refunds for orders and service bookings, in line with UAE Federal Law No. 15 of 2020 on Consumer Protection.",
};

const UPDATED = "2 September 2026";

export default function RefundPage() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <p style={styles.eyebrow}>Legal</p>
        <h1 style={styles.h1}>Refund Policy</h1>
        <p style={styles.updated}>Effective date: {UPDATED}</p>

        <div style={styles.meta}>
          <p style={styles.metaRow}>
            <b>Operated by:</b> Ultimate Affordable Quickmark Deals FZC LLC
            (“UAQ Deals”, “we”, “us”, “our”)
          </p>
          <p style={styles.metaRow}>
            <b>Trade License No.:</b> 2623415470888 — Ajman NuVentures Centre
            Free Zone, United Arab Emirates
          </p>
          <p style={styles.metaRow}>
            <b>Applies to:</b> Orders placed through the UAQ Deals website
            (uaqdeals.ae) or customer app, serving Ajman and Umm Al Quwain.
          </p>
        </div>

        <Section n="01" title="About this policy">
          <p style={styles.p}>
            UAQ Deals is a multi-vendor marketplace connecting customers with
            independent local vendors — grocery stores, pharmacies, mobile &amp;
            electronics shops, cafés and other partner businesses — together
            with our own delivery network. Because listings come from many
            vendors across very different product types, how a refund works
            depends on what you ordered, as set out below.
          </p>
          <p style={styles.p}>
            This policy works alongside — and never limits or replaces — your
            statutory rights under UAE Federal Law No. 15 of 2020 on Consumer
            Protection and its Executive Regulations (Cabinet Resolution No. 66
            of 2023), which apply to all consumer purchases in the UAE,
            including free zones. Nothing in this policy waives or reduces those
            rights, and no part of it should be read as a “no refund” or “no
            return” clause for defective, wrong, or misrepresented goods.
          </p>
        </Section>

        <Section n="02" title="Order cancellations">
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Situation</th>
                  <th style={styles.th}>What happens</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Order not yet accepted/processed by the vendor</td>
                  <td style={styles.td}>Cancel free in the app for a full refund</td>
                </tr>
                <tr>
                  <td style={styles.td}><b>Quick delivery</b> orders, once the vendor starts preparing</td>
                  <td style={styles.td}>May no longer be cancellable — contact support immediately and we’ll do our best with the vendor</td>
                </tr>
                <tr>
                  <td style={styles.td}><b>Same-Day</b> orders</td>
                  <td style={styles.td}>Cancellable up to the point the vendor confirms dispatch</td>
                </tr>
                <tr>
                  <td style={styles.td}><b>Scheduled</b> orders</td>
                  <td style={styles.td}>Cancellable free up to 3 hours before the scheduled slot; treated as a standard order after that</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={styles.p}>
            If a vendor cancels your order, or an item turns out to be
            unavailable, you’re refunded in full automatically — no action
            needed.
          </p>
        </Section>

        <Section n="03" title="When you’re entitled to a refund or return">
          <p style={styles.p}>You can request a refund, replacement, or return if:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>An item arrives damaged, spoiled, or defective.</li>
            <li style={styles.li}>You received the wrong item, or your order is incomplete.</li>
            <li style={styles.li}>An item is materially different from how it was listed (wrong size, wrong variant, expired, etc.).</li>
            <li style={styles.li}>Your order didn’t arrive, or arrived significantly later than the promised delivery window.</li>
            <li style={styles.li}>A grocery or fresh item fails a reasonable quality check on arrival.</li>
          </ul>
        </Section>

        <Section n="04" title="Reporting window">
          <p style={styles.p}>
            To keep resolution fast — especially for perishables — please report
            issues within:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              <b>Fresh &amp; perishable groceries</b> (produce, dairy, meat,
              bakery, etc.): <b>24 hours</b> of delivery, with photos where
              possible.
            </li>
            <li style={styles.li}>
              <b>Packaged, non-perishable goods</b> (electronics, mobile
              accessories, household items, etc.): <b>3 days</b> of delivery.
            </li>
            <li style={styles.li}>
              <b>Pharmacy &amp; healthcare items</b>: at the point of delivery,
              or as soon as noticed — see Section 5 for restrictions specific to
              medicines.
            </li>
            <li style={styles.li}>
              <b>Any defective item, generally</b>: you keep your statutory right
              to raise a defect claim within 14 days of delivery, even where a
              shorter window is suggested above for faster handling.
            </li>
          </ul>
          <p style={styles.p}>
            Report through the app (<b>Orders → select order → Get Help</b>),
            via chat with your vendor or driver, or using the contact details in
            Section 12.
          </p>
        </Section>

        <Section n="05" title="Items not eligible for change-of-mind return">
          <p style={styles.p}>
            For hygiene, safety, and practical reasons, these aren’t eligible
            for change-of-mind returns — though your rights under Section 3 for
            defective, wrong, or misrepresented items always apply regardless of
            category:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Fresh, perishable, or made-to-order food items, once accepted in good condition.</li>
            <li style={styles.li}>Opened or used personal care, hygiene, or grooming products.</li>
            <li style={styles.li}>Medicines and healthcare products, once dispensed — pharmacy items can only be returned if damaged, incorrect, or expired <b>at the point of delivery</b>.</li>
            <li style={styles.li}>AED Wallet top-ups and Coinback coins (see Section 8).</li>
            <li style={styles.li}>Custom, personalized, or made-to-order items.</li>
            <li style={styles.li}>Gift cards or vouchers, once issued.</li>
          </ul>
        </Section>

        <Section n="06" title="Voluntary change-of-mind returns">
          <p style={styles.p}>
            For sealed, unused, non-perishable items outside Section 5, we accept
            change-of-mind returns within <b>24 hours</b> of delivery, provided
            the item is unopened and in its original condition. This is offered
            in addition to your statutory rights, not instead of them. Delivery
            fees are not refunded for change-of-mind returns.
          </p>
        </Section>

        <Section n="07" title="How refunds are paid">
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Original payment method</th>
                  <th style={styles.th}>Refund method</th>
                  <th style={styles.th}>Typical timeline</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>AED Wallet balance</td>
                  <td style={styles.td}>Back to AED Wallet</td>
                  <td style={styles.td}>Instant to same-day</td>
                </tr>
                <tr>
                  <td style={styles.td}>Card / online payment</td>
                  <td style={styles.td}>AED Wallet, or back to original card on request</td>
                  <td style={styles.td}>Wallet: same-day · Card: 5–10 business days depending on your bank</td>
                </tr>
                <tr>
                  <td style={styles.td}>Cash on Delivery (COD)</td>
                  <td style={styles.td}>AED Wallet by default</td>
                  <td style={styles.td}>Same-day</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={styles.p}>
            Refunds include any VAT charged on the item, with a credit note or
            updated tax invoice issued where applicable. Delivery fees are
            refunded in full when the issue is on us or the vendor (wrong /
            damaged / missing item, vendor cancellation, non-delivery); they’re
            generally kept for change-of-mind returns. For multi-item orders,
            only the affected item(s) are refunded — the rest of your order is
            unaffected.
          </p>
        </Section>

        <Section n="08" title="AED Wallet, Coinback & Priority Card">
          <ul style={styles.ul}>
            <li style={styles.li}>
              <b>AED Wallet top-ups</b> aren’t refundable to your bank account
              once added, but stay usable on the platform indefinitely.
              Order-issue refunds are credited to your wallet as above.
            </li>
            <li style={styles.li}>
              <b>Coinback coins</b> have no cash value, aren’t transferable, and
              aren’t redeemable for a refund. If an order that earned coins is
              refunded, the corresponding coins are reversed.
            </li>
            <li style={styles.li}>
              <b>Priority Card membership (Silver / Gold / Diamond):</b>
              <ul style={styles.ulNested}>
                <li style={styles.li}>Full refund if cancelled within <b>24 hours</b> of purchase, provided no membership benefits have been used.</li>
                <li style={styles.li}>After benefits are used, or after 24 hours, the fee for that period is non-refundable — but you can turn off auto-renewal at any time, keep your benefits until the paid period ends, and we’ll notify you in advance before the next renewal charge.</li>
                <li style={styles.li}>If your membership was purchased through the Apple App Store or Google Play, that store’s own refund process applies instead of this section.</li>
              </ul>
            </li>
          </ul>
        </Section>

        <Section n="09" title="Delivery issues">
          <ul style={styles.ul}>
            <li style={styles.li}><b>Non-delivery:</b> full refund, including the delivery fee.</li>
            <li style={styles.li}><b>Delayed delivery</b> beyond your selected tier’s promised window (Quick / Same-Day / Scheduled): contact support — we’ll refund the delivery fee and, for significant delays, offer a partial or full order refund.</li>
            <li style={styles.li}><b>Wrong address entered by the customer:</b> delivery fee isn’t refundable; item refund is handled case by case.</li>
          </ul>
        </Section>

        <Section n="10" title="How to request a refund">
          <ol style={styles.ol}>
            <li style={styles.li}>Open the app → <b>Orders</b> → select the order → <b>Get Help</b>.</li>
            <li style={styles.li}>Choose the issue and attach photos if relevant.</li>
            <li style={styles.li}>We (or the vendor, for vendor-specific issues) review and respond, usually within <b>2–3 business days</b>.</li>
            <li style={styles.li}>Approved refunds are processed per Section 7.</li>
          </ol>
          <p style={styles.p}>You can also reach us directly using Section 12.</p>
        </Section>

        <Section n="11" title="Fair use">
          <p style={styles.p}>
            We review requests individually and may decline or limit refunds
            where we reasonably suspect misuse — for example, repeated “not
            received” claims on successfully delivered orders, or repeated
            change-of-mind returns outside Section 6. This never affects a
            legitimate statutory claim.
          </p>
        </Section>

        <Section n="12" title="Contact us">
          <ul style={styles.ul}>
            <li style={styles.li}><b>In-app:</b> Orders → Get Help</li>
            <li style={styles.li}><b>Email:</b> <a style={styles.a} href="mailto:support@uaqdeals.ae">support@uaqdeals.ae</a></li>
            <li style={styles.li}><b>Company:</b> Ultimate Affordable Quickmark Deals FZC LLC, Ajman NuVentures Centre Free Zone, UAE</li>
          </ul>
          <p style={styles.p}>
            If we can’t resolve your complaint directly, you can escalate to the
            UAE’s consumer protection channels at{" "}
            <a style={styles.a} href="https://www.consumerrights.ae">consumerrights.ae</a>.
          </p>
        </Section>

        <Section n="13" title="Changes to this policy">
          <p style={styles.p}>
            We may update this policy to reflect changes in our services or in
            UAE law. The current version is always available on uaqdeals.ae,
            with the effective date shown at the top; material changes will be
            highlighted in-app.
          </p>
        </Section>

        <p style={styles.foot}>
          Governed by the laws of the United Arab Emirates. This policy does not
          affect your statutory rights under UAE consumer protection law.
        </p>
      </div>
    </main>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.h2}>
        <span style={styles.num}>{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const MAROON = "#8E1B3A";
const GOLD = "#C8A24B";
const INK = "#1A1A1A";
const MUTE = "#5B5560";

const styles: Record<string, React.CSSProperties> = {
  page: { background: "#FBF9FA", minHeight: "100vh", padding: "48px 20px 80px" },
  wrap: { maxWidth: 760, margin: "0 auto", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", color: INK, lineHeight: 1.7 },
  eyebrow: { textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12, fontWeight: 700, color: GOLD, margin: "0 0 8px" },
  h1: { fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px", color: MAROON },
  updated: { fontSize: 13.5, color: MUTE, margin: "0 0 20px" },
  meta: { background: "#fff", border: `1px solid #EADFE3`, borderRadius: 12, padding: "16px 20px", margin: "0 0 8px" },
  metaRow: { fontSize: 14, color: "#2A2530", margin: "0 0 6px" },
  lead: { fontSize: 16.5, color: INK, margin: "0 0 8px", paddingBottom: 28, borderBottom: `2px solid ${MAROON}22` },
  section: { paddingTop: 30 },
  h2: { fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px", display: "flex", alignItems: "baseline", gap: 12 },
  num: { fontSize: 13, fontWeight: 700, color: GOLD, fontVariantNumeric: "tabular-nums", minWidth: 24 },
  p: { fontSize: 15.5, color: "#2A2530", margin: "0 0 14px" },
  ul: { margin: "0 0 14px", paddingLeft: 20, listStyle: "disc" },
  ulNested: { margin: "10px 0 0", paddingLeft: 20, listStyle: "circle" },
  ol: { margin: "0 0 14px", paddingLeft: 22, listStyle: "decimal" },
  li: { fontSize: 15.5, color: "#2A2530", margin: "0 0 10px" },
  a: { color: MAROON, fontWeight: 600, textDecoration: "none" },
  tableWrap: { overflowX: "auto", margin: "0 0 16px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14.5, minWidth: 480 },
  th: { textAlign: "left", background: `${MAROON}0D`, color: MAROON, fontWeight: 700, padding: "10px 12px", border: `1px solid #EADFE3`, verticalAlign: "top" },
  td: { padding: "10px 12px", border: `1px solid #EADFE3`, color: "#2A2530", verticalAlign: "top" },
  foot: { marginTop: 40, paddingTop: 20, borderTop: `1px solid #E5DFE2`, fontSize: 13.5, color: MUTE, fontStyle: "italic" },
};
