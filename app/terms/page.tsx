export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using UAQ Deals.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--brand-maroon)] sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: June 2026</p>

      <div className="prose-uaq mt-8 space-y-7 text-sm leading-relaxed text-neutral-700">
        <Section title="1. Introduction">
          <p>
            Welcome to UAQ Deals. These Terms &amp; Conditions govern your use of
            the UAQ Deals platform, including our website and mobile applications
            (collectively, the &ldquo;Platform&rdquo;). By accessing or using the
            Platform, you agree to be bound by these terms. If you do not agree,
            please do not use the Platform.
          </p>
        </Section>

        <Section title="2. Using the Platform">
          <p>
            UAQ Deals connects customers with local businesses in Umm Al Quwain.
            You must be at least 18 years old, or have the consent of a parent or
            guardian, to place orders. You agree to provide accurate account and
            delivery information and to use the Platform only for lawful purposes.
          </p>
        </Section>

        <Section title="3. Orders &amp; Payments">
          <p>
            When you place an order, you make an offer to purchase the selected
            products or services at the listed price. Orders are subject to
            acceptance and availability by the relevant vendor. We currently
            support Cash on Delivery, with additional payment methods to follow.
            Prices are shown in UAE Dirhams (AED) and are inclusive of applicable
            taxes unless stated otherwise.
          </p>
        </Section>

        <Section title="4. Coins &amp; Rewards">
          <p>
            UAQ Deals offers a coinback loyalty program. Coins are earned on
            eligible orders and may be redeemed against future purchases subject
            to program rules, including minimum balances and per-order limits.
            Coins hold no cash value, are non-transferable, and may be adjusted or
            expired in cases of cancellation, return, or misuse.
          </p>
        </Section>

        <Section title="5. Delivery">
          <p>
            Delivery times and fees are estimates and may vary by vendor,
            location, and demand. Free delivery may apply to orders above a stated
            threshold. Risk in the products passes to you on delivery to the
            address you provide.
          </p>
        </Section>

        <Section title="6. Cancellations &amp; Returns">
          <p>
            Cancellation and return eligibility depends on the product or service
            type and the vendor&apos;s policy. Perishable goods, prescription
            items, and made-to-order products may not be returnable. Please
            contact us promptly if there is an issue with your order.
          </p>
        </Section>

        <Section title="7. Vendor Responsibility">
          <p>
            Products and services on the Platform are provided by independent
            local vendors. While we work to maintain quality and trust, vendors
            are responsible for the accuracy of their listings and the goods and
            services they supply.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            The Platform is provided on an &ldquo;as is&rdquo; basis. To the
            fullest extent permitted by law, UAQ Deals shall not be liable for
            indirect or consequential losses arising from your use of the
            Platform.
          </p>
        </Section>

        <Section title="9. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Continued use of the
            Platform after changes are posted constitutes acceptance of the
            revised Terms.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For any questions about these Terms, contact us at{" "}
            <a href="mailto:uaqdeals@gmail.com" className="font-semibold text-[color:var(--brand-maroon)]">uaqdeals@gmail.com</a>{" "}
            or call +971 54 220 5775.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-neutral-900">{title}</h2>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}
