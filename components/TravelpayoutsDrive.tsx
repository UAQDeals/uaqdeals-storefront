import Script from "next/script";

/**
 * Loads the Travelpayouts "Drive" tag. Injects the vendor script into <head>
 * after the page is interactive.
 */
export function TravelpayoutsDrive() {
  return (
    <Script id="travelpayouts-drive" strategy="afterInteractive">
      {`(function () {
        var script = document.createElement("script");
        script.async = 1;
        script.setAttribute("data-cmp-ab", "2");
        script.src = 'https://tp-em.com/NTU3MDc3.js?t=557077';
        document.head.appendChild(script);
      })();`}
    </Script>
  );
}
