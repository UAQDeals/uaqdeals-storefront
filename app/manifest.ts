import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UAQ Deals — Umm Al Quwain Super App",
    short_name: "UAQ Deals",
    description: "Shop, services, classifieds and more — hyperlocal to Umm Al Quwain.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8E1B3A",
    icons: [
      { src: "/uaq-logo.png", sizes: "192x192", type: "image/png" },
      { src: "/uaq-logo.png", sizes: "512x512", type: "image/png" },
      { src: "/uaq-logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
