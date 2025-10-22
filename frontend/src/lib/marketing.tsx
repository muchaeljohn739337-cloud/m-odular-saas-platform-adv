import Script from "next/script";
import Head from "next/head";

// Type definitions for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Marketing Meta Component
 * Handles SEO, Open Graph, Twitter Cards, and Google Analytics
 */
export function MarketingMeta() {
  const title = "Advancia Pay Ledger – Your Fintech Dashboard";
  const description =
    "Multi-currency ledger, MedBed care, crypto recovery, gamified rewards, and more. Self-hosted fintech platform.";
  const siteUrl = "https://advanciapayledger.com";
  const logoUrl = `${siteUrl}/logo.png`;
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-XXXXXXX";

  return (
    <>
      <Head>
        {/* ✅ SEO & social meta */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />

        {/* Open Graph for social sharing */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={logoUrl} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={logoUrl} />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* Canonical URL */}
        <link rel="canonical" href={siteUrl} />
      </Head>

      {/* ✅ Google Analytics 4 */}
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

      {/* ✅ Google Site Verification (optional) */}
      {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
        <meta
          name="google-site-verification"
          content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
        />
      )}

      {/* ✅ Structured Data (JSON-LD) */}
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Advancia Pay Ledger",
          description,
          url: siteUrl,
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
