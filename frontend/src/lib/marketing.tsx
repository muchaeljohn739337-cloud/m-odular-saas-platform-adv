import Script from "next/script";

// Type definitions for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Marketing Scripts Component
 * Handles Google Analytics and tracking scripts
 */
export function MarketingScripts() {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-XXXXXXX";

  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
        `}
      </Script>

      {/* Structured Data (JSON-LD) */}
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Advancia Pay Ledger",
          description: "Multi-currency ledger, MedBed care, crypto recovery, gamified rewards, and more.",
          url: "https://advanciapayledger.com",
          applicationCategory: "FinanceApplication",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        })}
      </Script>
    </>
  );
}

/**
 * Track custom events in Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(
      "config",
      process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-XXXXXXX",
      {
        page_path: pagePath,
        page_title: pageTitle,
      }
    );
  }
}

/**
 * Track conversion
 */
export function trackConversion(conversionId: string, conversionLabel: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: `${conversionId}/${conversionLabel}`,
    });
  }
}