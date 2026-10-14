// Landing page Nomod redirects to after a vendor wallet top-up. The actual
// crediting happens server-side via the Nomod webhook — this page is only the
// browser's return destination, so it just reports the outcome and points the
// vendor back to the app. Opened in the system browser from the Flutter vendor
// app's "Top Up Wallet" flow.
export const dynamic = "force-dynamic";

type Status = "success" | "failed" | "cancelled";

const COPY: Record<Status, { icon: string; title: string; body: string }> = {
  success: {
    icon: "✓",
    title: "Payment received",
    body: "Your wallet will be credited within a few moments. You can close this tab and return to the UAQ Deals Business app.",
  },
  failed: {
    icon: "✕",
    title: "Payment failed",
    body: "Your wallet was not charged. Please return to the app and try the top-up again.",
  },
  cancelled: {
    icon: "—",
    title: "Payment cancelled",
    body: "You cancelled the top-up. No charge was made. You can try again from the app.",
  },
};

export default async function WalletTopupPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const key: Status = status === "success" || status === "failed" ? status : "cancelled";
  const { icon, title, body } = COPY[key];
  const accent = key === "success" ? "#1a7f37" : key === "failed" ? "#b42318" : "#6b7280";

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background: "#f7f7f8",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: "32px 28px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `${accent}1a`,
            color: accent,
            fontSize: 32,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          {icon}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", color: "#111" }}>{title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "#555", margin: 0 }}>{body}</p>
      </div>
    </main>
  );
}
