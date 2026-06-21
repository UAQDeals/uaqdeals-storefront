import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "UAQ Deals", template: "%s — UAQ Deals" },
  description:
    "Umm Al Quwain's hyperlocal super-app. Shop deals, groceries, services, listings — all in one place.",
  metadataBase: new URL("https://shop.uaqdeals.ae"),
  icons: { icon: "/favicon.ico", apple: "/uaq_logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#8E1B3A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-[100dvh] flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster richColors position="top-center" dir={isRTL ? "rtl" : "ltr"} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
