import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/vendor/", "/checkout", "/cart", "/account", "/orders", "/auth/"],
      },
    ],
    sitemap: "https://uaqdeals.ae/sitemap.xml",
    host: "https://uaqdeals.ae",
  };
}
