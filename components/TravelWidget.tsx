"use client";

import { useEffect, useRef } from "react";

/**
 * Mounts a Travelpayouts widget by injecting its vendor <script> into a ref'd
 * container. The script renders the widget in-place where it's appended.
 */
export function TravelWidget({
  scriptSrc,
  minHeight = 400,
}: {
  scriptSrc: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Clear first so React 18 Strict Mode's double-invoke doesn't inject twice.
    el.innerHTML = "";
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.setAttribute("charset", "utf-8");
    el.appendChild(script);
  }, [scriptSrc]);

  return <div ref={ref} style={{ minHeight }} className="w-full" />;
}
