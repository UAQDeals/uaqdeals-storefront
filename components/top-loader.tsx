"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A lightweight, dependency-free top navigation progress bar.
 *
 * It shows the instant an internal link is clicked (so the user gets immediate
 * feedback even while the next page is still loading on the server) and
 * finishes when the new route has rendered. Purely visual, brand-coloured.
 */
export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTrickle = () => {
    if (trickle.current) {
      clearInterval(trickle.current);
      trickle.current = null;
    }
  };

  const start = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    stopTrickle();
    setVisible(true);
    setProgress(8);
    // Creep toward ~90% while we wait for the route to be ready.
    trickle.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const step = p < 40 ? 8 : p < 70 ? 4 : 1.5;
        return Math.min(90, p + step);
      });
    }, 220);
  };

  const done = () => {
    stopTrickle();
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 350);
  };

  // Complete the bar whenever the route (path or query) has changed.
  useEffect(() => {
    if (!visible) return;
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Start the bar on any same-origin link click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("rel")?.includes("external")) return;

      let dest: URL;
      try {
        dest = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (dest.origin !== window.location.origin) return;
      // Same page (only hash / identical URL) → no navigation, don't start.
      if (dest.pathname === window.location.pathname && dest.search === window.location.search) return;

      start();
    };

    document.addEventListener("click", onClick, { capture: true });
    // Browser back/forward also triggers a navigation.
    const onPopState = () => start();
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
      stopTrickle();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 2000,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, #8e1b3a 0%, #c72931 55%, #c9a24b 100%)",
          boxShadow: "0 0 10px rgba(199, 41, 49, 0.7), 0 0 5px rgba(201, 162, 75, 0.5)",
          transition: "width 0.2s ease",
          borderTopRightRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
    </div>
  );
}
