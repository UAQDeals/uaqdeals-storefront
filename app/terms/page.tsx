// app/terms/page.tsx  — UAQ Deals Terms of Service
// Drop-in Next.js App Router page. Inline styles for portability.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — UAQ Deals",
  description:
    "The terms governing your use of the UAQ Deals app and website, under the laws of the United Arab Emirates.",
};

const UPDATED = "30 July 2026";

export default function TermsPage() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <p style={styles.eyebrow}>Legal</p>
        <h1 style={styles.h1}>Terms of Service</h1>
        <p style={styles.updated}>Last updated: {UPDATED}</p>

        <p style={styles.lead}>
          These Terms of Service (“Terms”) govern your use of the UAQ Deals
          mobile application and website (the “Platform”), operated by Ultimate
          Affordable Quickmark Deals FZC LLC (“UAQ Deals”, “we”, “us”). By
          creating an account or using the Platform, you agree to these Terms.
          If you do not agree, please do not use the Platform.
        </p>

        <Section n="01" title="About us">
          <p style={styles.p}>
            UAQ Deals is a hyperlocal super-app operated by Ultimate Affordable
            Quickmark Deals FZC LLC, licensed and registered in Ajman, UAE, with
            its registered office at CWS-3V-147022, 26th Floor, Amber Gem Tower,
            Ajman. We operate across the Emirates of Ajman and Umm Al Quwain,
            with selected services available UAE-wide. The Platform connects you
            with vendors offering products, services, restaurants, and
            classified listings.
          </p>
        </Section>

        <Section n="02" title="Eligibility and your account">
          <p style={styles.p}>
            You must be at least 18 years old and capable of entering a binding
            contract under UAE law to use the Platform. You are responsible for
            the accuracy of the information you provide and for keeping your
            account secure. We verify accounts by one-time password (OTP) sent to
            your mobile number, and also support sign-in with Google and Apple.
          </p>
        </Section>

        <Section n="03" title="Our role as a marketplace">
          <p style={styles.p}>
            UAQ Deals is a marketplace. Products and services are provided by
            independent vendors, and delivery may be carried out by independent
            drivers or couriers. For certain vendor categories, the seller is
            presented to you as “UAQ Deals Mart”. While we work to ensure quality,
            the vendor is responsible for the products and services they supply.
            Your consumer rights under Federal Law No. 15 of 2020 on Consumer
            Protection are preserved.
          </p>
        </Section>

        <Section n="04" title="Orders, pricing, and payment">
          <p style={styles.p}>
            Prices are shown in UAE Dirham (AED) and, where applicable, include
            Value Added Tax. We accept Cash on Delivery and the electronic
            payment methods shown at checkout. An order is confirmed once you
            receive confirmation through the Platform. We may decline or cancel
            an order where an item is unavailable, a pricing error has occurred,
            or we suspect fraud.
          </p>
        </Section>

        <Section n="05" title="Delivery and pickup">
          <p style={styles.p}>
            Delivery fees and estimated times are shown at checkout and vary by
            emirate and fulfilment type. You are responsible for providing an
            accurate delivery address and for being available to receive your
            order. Risk in the goods passes to you on delivery.
          </p>
        </Section>

        <Section n="06" title="Wallet, coinback, and Priority Card">
          <p style={styles.p}>
            The Platform offers an AED wallet, a coinback loyalty programme, and
            Priority Card tiers. Coins and wallet credit have no cash value
            except as expressly provided, are non-transferable, and are subject
            to the programme rules shown in the app, including minimum redemption
            thresholds and per-order caps. We may vary these programmes on
            reasonable notice. Wallet withdrawals are subject to identity
            verification and the withdrawal rules in the app.
          </p>
        </Section>

        <Section n="07" title="Pharmacy and prescriptions">
          <p style={styles.p}>
            Where you use our pharmacy service, you must provide a valid
            prescription where one is required by UAE law. Prescription
            medicines are dispensed by licensed pharmacy vendors in accordance
            with applicable regulations. We handle any health information you
            provide as sensitive personal data under our Privacy Policy.
          </p>
        </Section>

        <Section n="08" title="Returns, refunds, and cancellations">
          <p style={styles.p}>
            Returns and refunds are handled in line with the applicable vendor’s
            policy and your rights under UAE consumer protection law. Perishable
            goods, personalised items, and certain health products may be
            non-returnable for hygiene and safety reasons. Where a refund is due,
            it is issued to your original payment method or your UAQ Deals wallet.
          </p>
        </Section>

        <Section n="09" title="Acceptable use">
          <p style={styles.p}>You agree not to:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>Use the Platform for any unlawful purpose or in breach of UAE law.</li>
            <li style={styles.li}>Post false, misleading, or infringing content in listings or reviews.</li>
            <li style={styles.li}>Attempt to gain unauthorised access to the Platform or interfere with its operation.</li>
            <li style={styles.li}>Abuse the wallet, coinback, or referral programmes, including through duplicate or fraudulent accounts.</li>
          </ul>
          <p style={styles.p}>
            We may suspend or terminate accounts that breach these Terms.
          </p>
        </Section>

        <Section n="10" title="Classified listings">
          <p style={styles.p}>
            Where the Platform lets you post classified listings, you are solely
            responsible for the accuracy and legality of your listing. We may
            remove listings that breach these Terms or applicable law. UAQ Deals
            is not a party to transactions arranged directly between users
            through classified listings.
          </p>
        </Section>

        <Section n="11" title="Intellectual property">
          <p style={styles.p}>
            The Platform, including its name, logo, design, and content, is owned
            by or licensed to UAQ Deals and protected under UAE law. You may not
            copy, modify, or distribute any part of it without our written
            permission.
          </p>
        </Section>

        <Section n="12" title="Limitation of liability">
          <p style={styles.p}>
            To the fullest extent permitted by UAE law, UAQ Deals is not liable
            for indirect or consequential loss arising from your use of the
            Platform. Nothing in these Terms limits any liability that cannot be
            limited under UAE law, including your statutory consumer rights.
          </p>
        </Section>

        <Section n="13" title="Termination">
          <p style={styles.p}>
            You may stop using the Platform and delete your account at any time
            from Profile → Delete Account. We may suspend or end your access if
            you breach these Terms or where required by law. Provisions that by
            their nature should survive termination will continue to apply.
          </p>
        </Section>

        <Section n="14" title="Changes to these Terms">
          <p style={styles.p}>
            We may update these Terms from time to time. The revised version will
            be posted here with a new “Last updated” date, and continued use of
            the Platform after changes take effect constitutes acceptance.
          </p>
        </Section>

        <Section n="15" title="Governing law and jurisdiction">
          <p style={styles.p}>
            These Terms are governed by the laws of the United Arab Emirates as
            applied in the Emirate of Ajman. Any dispute arising from them is
            subject to the exclusive jurisdiction of the courts of Ajman, without
            prejudice to any mandatory consumer protections available to you.
          </p>
        </Section>

        <Section n="16" title="Contact us">
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
};
