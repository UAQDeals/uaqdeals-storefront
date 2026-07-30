// app/privacy/page.tsx  — UAQ Deals Privacy Policy
// Drop-in Next.js App Router page. Uses inline styles so it renders
// correctly regardless of your global CSS. Replace the LegalLayout import
// with your own header/footer wrapper if you have one, or keep as-is.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — UAQ Deals",
  description:
    "How UAQ Deals collects, uses, and protects your personal data under UAE Federal Decree-Law No. 45 of 2021 (PDPL).",
};

const UPDATED = "30 July 2026";

export default function PrivacyPage() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <p style={styles.eyebrow}>Legal</p>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.updated}>Last updated: {UPDATED}</p>

        <p style={styles.lead}>
          This Privacy Policy explains how Ultimate Affordable Quickmark Deals
          FZC LLC (“UAQ Deals”, “we”, “us”) collects, uses, discloses, and
          protects your personal data when you use the UAQ Deals mobile
          application and website. We are committed to handling your data in
          accordance with UAE Federal Decree-Law No. 45 of 2021 on the
          Protection of Personal Data (the “PDPL”) and its Executive Regulation
          (Cabinet Decision No. 33 of 2024).
        </p>

        <Section n="01" title="Who we are">
          <p style={styles.p}>
            UAQ Deals is a hyperlocal super-app operated by Ultimate Affordable
            Quickmark Deals FZC LLC, a company licensed and registered in
            Ajman, United Arab Emirates, with its registered office at CWS-3V-147022,
            26th Floor, Amber Gem Tower, Ajman, UAE. We operate across the
            Emirates of Ajman and Umm Al Quwain, with selected services
            available UAE-wide.
          </p>
          <p style={styles.p}>
            For all privacy matters, we are the data controller responsible for
            your personal data. You can reach our management using the contact
            details in Section 12.
          </p>
        </Section>

        <Section n="02" title="Data we collect">
          <p style={styles.p}>We collect the following categories of personal data:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              <b>Account data</b> — your name, mobile number, email address, and
              the sign-in method you use (mobile OTP, Google, or Apple). When you
              sign in with Apple using “Hide My Email”, we receive a private
              relay email address rather than your real one.
            </li>
            <li style={styles.li}>
              <b>Order and delivery data</b> — items purchased, delivery
              address, geographic coordinates you provide for delivery, order
              value, and payment method.
            </li>
            <li style={styles.li}>
              <b>Wallet and loyalty data</b> — your AED wallet balance,
              transaction history, coinback balance, and Priority Card status.
            </li>
            <li style={styles.li}>
              <b>Health-related data</b> — where you use our pharmacy service,
              any prescription you upload. This is sensitive personal data and
              is handled in line with Federal Law No. 2 of 2019 on the use of
              information and communication technology in health fields.
            </li>
            <li style={styles.li}>
              <b>Device and usage data</b> — device identifiers, push
              notification tokens, app interactions, and product views, used to
              operate the service and improve it.
            </li>
          </ul>
        </Section>

        <Section n="03" title="How we use your data">
          <p style={styles.p}>We process your personal data to:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>Create and manage your account and verify your identity by OTP.</li>
            <li style={styles.li}>Process, deliver, and support your orders and service bookings.</li>
            <li style={styles.li}>Operate the wallet, coinback loyalty, and Priority Card programmes.</li>
            <li style={styles.li}>Send transactional and, where you have consented, promotional notifications.</li>
            <li style={styles.li}>Prevent fraud, secure the platform, and meet our legal obligations.</li>
          </ul>
          <p style={styles.p}>
            We rely on your consent, the performance of our contract with you,
            our legitimate business interests, and compliance with UAE law as
            our lawful bases for processing, as applicable to each purpose.
          </p>
        </Section>

        <Section n="04" title="Sharing your data">
          <p style={styles.p}>
            We share personal data only as needed to run the service: with the
            vendors and delivery drivers fulfilling your order, with payment
            providers, and with technology providers who host and support the
            platform under confidentiality obligations. For orders placed with
            certain vendor categories, the vendor is shown to you as “UAQ Deals
            Mart” and receives only the data required to fulfil your order. We do
            not sell your personal data.
          </p>
        </Section>

        <Section n="05" title="International transfers">
          <p style={styles.p}>
            Our platform is hosted on secure cloud infrastructure that may
            process data outside the UAE. Where personal data is transferred
            outside the UAE, we do so only in accordance with the cross-border
            transfer rules of the PDPL and its Executive Regulation, ensuring an
            adequate level of protection.
          </p>
        </Section>

        <Section n="06" title="Data retention">
          <p style={styles.p}>
            We keep your personal data only as long as necessary for the
            purposes described here. Financial and tax records, including order
            invoices, are retained for the period required by UAE tax law
            (currently a minimum of five years) even after you delete your
            account; where we retain such records, we remove or anonymise the
            personal details linked to them.
          </p>
        </Section>

        <Section n="07" title="Your rights">
          <p style={styles.p}>Under the PDPL, you have the right to:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>Access the personal data we hold about you.</li>
            <li style={styles.li}>Request correction of inaccurate or incomplete data.</li>
            <li style={styles.li}>Request deletion of your personal data.</li>
            <li style={styles.li}>Object to or restrict certain processing, and withdraw consent.</li>
            <li style={styles.li}>Request that your data be transferred to another controller where technically feasible.</li>
          </ul>
          <p style={styles.p}>
            To exercise any of these rights, contact us using the details in
            Section 12. You also have the right to lodge a complaint with the
            UAE Data Office.
          </p>
        </Section>

        <Section n="08" title="Deleting your account">
          <p style={styles.p}>
            You can delete your account at any time from within the app, under
            Profile → Delete Account. This permanently removes your personal
            data and closes your account. Financial records required by law are
            retained in anonymised form as described in Section 6. If you signed
            in with Apple, you can additionally revoke access under iOS Settings
            → your name → Sign in with Apple → UAQ Deals.
          </p>
        </Section>

        <Section n="09" title="Security">
          <p style={styles.p}>
            We apply appropriate technical and organisational measures to
            protect your data, including encryption in transit, access controls,
            and role-based restrictions on who can view personal data. No system
            is perfectly secure, but we work continuously to protect your
            information and to meet our obligations under the PDPL.
          </p>
        </Section>

        <Section n="10" title="Children">
          <p style={styles.p}>
            UAQ Deals is not directed at children under 18. We do not knowingly
            collect personal data from children. If you believe a child has
            provided us data, contact us and we will delete it.
          </p>
        </Section>

        <Section n="11" title="Changes to this policy">
          <p style={styles.p}>
            We may update this Privacy Policy from time to time. We will post the
            revised version here with an updated “Last updated” date, and where
            changes are significant we will notify you in the app.
          </p>
        </Section>

        <Section n="12" title="Contact us">
          <p style={styles.p}>
            Ultimate Affordable Quickmark Deals FZC LLC<br />
            CWS-3V-147022, 26th Floor, Amber Gem Tower, Ajman, UAE
          </p>
          <p style={styles.p}>
            <b>Ali Saif Mohamed Boassaibah Al Ali</b> — Managing Director<br />
            <a style={styles.a} href="tel:+971529900900">+971 52 990 0900</a>
          </p>
          <p style={styles.p}>
            <b>Irshad Kannankuzhiyan Hamsa</b> — Managing Director<br />
            <a style={styles.a} href="tel:+971522668089">+971 52 266 8089</a>
          </p>
          <p style={styles.p}>
            General support:{" "}
            <a style={styles.a} href="tel:+971542205885">+971 54 220 5885</a>{" "}·{" "}
            <a style={styles.a} href="https://uaqdeals.ae/contact">uaqdeals.ae/contact</a>
          </p>
        </Section>

        <p style={styles.foot}>
          This policy is governed by the laws of the United Arab Emirates. The
          courts of Ajman have jurisdiction over any dispute arising from it.
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
  updated: { fontSize: 13.5, color: MUTE, margin: "0 0 32px" },
  lead: { fontSize: 16.5, color: INK, margin: "0 0 8px", paddingBottom: 28, borderBottom: `2px solid ${MAROON}22` },
  section: { paddingTop: 30 },
  h2: { fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px", display: "flex", alignItems: "baseline", gap: 12 },
  num: { fontSize: 13, fontWeight: 700, color: GOLD, fontVariantNumeric: "tabular-nums", minWidth: 24 },
  p: { fontSize: 15.5, color: "#2A2530", margin: "0 0 14px" },
  ul: { margin: "0 0 14px", paddingLeft: 0, listStyle: "none" },
  li: { fontSize: 15.5, color: "#2A2530", margin: "0 0 10px", paddingLeft: 20, position: "relative" },
  a: { color: MAROON, fontWeight: 600, textDecoration: "none" },
  foot: { marginTop: 40, paddingTop: 20, borderTop: `1px solid #E5DFE2`, fontSize: 13.5, color: MUTE, fontStyle: "italic" },
};
