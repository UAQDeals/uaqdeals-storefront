// app/delete-account/page.tsx — UAQ Deals account deletion request page
// Required by Google Play's account deletion policy: a public, no-login web
// page that lets users request deletion even if they no longer have the app
// installed. Mirrors the styling of app/privacy/page.tsx.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Your Account — UAQ Deals",
  description:
    "How to request deletion of your UAQ Deals account and personal data, in-app or by contacting us directly.",
};

export default function DeleteAccountPage() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <p style={styles.eyebrow}>Account</p>
        <h1 style={styles.h1}>Delete your UAQ Deals account</h1>

        <p style={styles.lead}>
          You can request permanent deletion of your UAQ Deals account and
          associated personal data at any time, whether or not you still have
          the app installed.
        </p>

        <Section n="01" title="Option 1 — Delete in the app">
          <p style={styles.p}>
            Open the UAQ Deals app and go to{" "}
            <b>Profile → Delete Account</b>, then confirm. Deletion is
            immediate and permanent.
          </p>
        </Section>

        <Section n="02" title="Option 2 — Request by phone or email">
          <p style={styles.p}>
            If you no longer have the app installed, contact us using the
            phone number or email registered to your UAQ Deals account and
            ask us to delete your account. We will verify your identity and
            action the request promptly.
          </p>
          <p style={styles.p}>
            General support:{" "}
            <a style={styles.a} href="tel:+971542205885">+971 54 220 5885</a>{" "}·{" "}
            <a style={styles.a} href="https://uaqdeals.ae/contact">uaqdeals.ae/contact</a>
          </p>
        </Section>

        <Section n="03" title="What gets deleted">
          <p style={styles.p}>
            Deleting your account permanently removes your profile, saved
            addresses, wallet and coinback balances, order history, uploaded
            prescriptions, and sign-in credentials from UAQ Deals.
          </p>
        </Section>

        <Section n="04" title="What we keep, and for how long">
          <p style={styles.p}>
            UAE tax law requires us to retain financial records — order
            invoices and transaction records — for a minimum of five years.
            After your account is deleted, we remove or anonymise the
            personal details linked to these records; the underlying
            financial record itself is kept only for the legally required
            retention period.
          </p>
        </Section>

        <p style={styles.foot}>
          UAQ Deals is operated by Ultimate Affordable Quickmark Deals FZC
          LLC. See our{" "}
          <a style={styles.a} href="https://uaqdeals.ae/privacy">Privacy Policy</a>{" "}
          for full details on how we handle your data.
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
  h1: { fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px", color: MAROON },
  lead: { fontSize: 16.5, color: INK, margin: "24px 0 8px", paddingBottom: 28, borderBottom: `2px solid ${MAROON}22` },
  section: { paddingTop: 30 },
  h2: { fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px", display: "flex", alignItems: "baseline", gap: 12 },
  num: { fontSize: 13, fontWeight: 700, color: GOLD, fontVariantNumeric: "tabular-nums", minWidth: 24 },
  p: { fontSize: 15.5, color: "#2A2530", margin: "0 0 14px" },
  a: { color: MAROON, fontWeight: 600, textDecoration: "none" },
  foot: { marginTop: 40, paddingTop: 20, borderTop: `1px solid #E5DFE2`, fontSize: 13.5, color: MUTE, fontStyle: "italic" },
};
