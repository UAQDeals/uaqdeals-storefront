export const metadata = {
  title: "Privacy Policy",
  description: "How UAQ Deals collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--brand-maroon)] sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: June 2026</p>

      <div className="mt-8 space-y-7 text-sm leading-relaxed text-neutral-700">
        <Section title="1. Overview">
          <p>
            This Privacy Policy explains how UAQ Deals collects, uses, and
            protects your personal information when you use our website and mobile
            applications. We are committed to handling your data responsibly and
            keeping it secure.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We may collect the following information:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account details such as your name, email, and phone number.</li>
            <li>Delivery addresses and order history.</li>
            <li>Coin balance and loyalty activity.</li>
            <li>Messages you send us through contact or support forms.</li>
            <li>Basic technical data such as device and usage information.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Process and deliver your orders.</li>
            <li>Operate the coinback loyalty program.</li>
            <li>Provide customer support and respond to enquiries.</li>
            <li>Improve the Platform and personalize your experience.</li>
            <li>Send service updates and, where you have opted in, promotions.</li>
          </ul>
        </Section>

        <Section title="4. Sharing Your Information">
          <p>
            We share necessary order information with the relevant local vendor
            and delivery partner so your order can be fulfilled. We do not sell
            your personal information. We may share data with service providers
            who help us operate the Platform, and where required by law.
          </p>
        </Section>

        <Section title="5. Notification Preferences">
          <p>
            You can control which notifications you receive — order updates, deals
            and promotions, wallet and coins, and support replies — from your
            account settings at any time.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p>
            We use industry-standard measures to protect your information.
            Sensitive items such as prescriptions are handled with additional
            care. No method of transmission or storage is completely secure, but
            we work continually to safeguard your data.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>
            You may access, update, or request deletion of your personal
            information by contacting us. Note that some information may be
            retained where required for legal or operational reasons.
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. The latest
            version will always be available on this page.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            For privacy questions or requests, contact us at{" "}
            <a href="mailto:uaqdeals@gmail.com" className="font-semibold text-[color:var(--brand-maroon)]">uaqdeals@gmail.com</a>{" "}
            or call +971 54 477 6967.
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
