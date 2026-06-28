import { ImageResponse } from "next/og";

export const alt = "UAQ Deals — Umm Al Quwain's hyperlocal super-app";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "90px",
          backgroundImage:
            "linear-gradient(135deg, #8E1B3A 0%, #C72931 55%, #F24732 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 6, textTransform: "uppercase", opacity: 0.85, marginBottom: 12 }}>
          Umm Al Quwain
        </div>
        <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1 }}>UAQ Deals</div>
        <div style={{ fontSize: 40, marginTop: 28, opacity: 0.95, maxWidth: 900 }}>
          Groceries, food, services &amp; marketplace — delivered.
        </div>
      </div>
    ),
    { ...size },
  );
}
