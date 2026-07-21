"use client";

import {
  Suspense,
  useEffect,
  useRef,
} from "react";
import Script from "next/script";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import {
  GA_MEASUREMENT_ID,
  isGaEnabled,
  trackPageView,
} from "@/lib/analytics/gtag";

function GoogleAnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl =
    useRef<string | null>(null);

  useEffect(() => {
    if (!isGaEnabled()) {
      return;
    }

    const query = searchParams.toString();
    const url = query
      ? `${pathname}?${query}`
      : pathname;

    if (lastTrackedUrl.current === url) {
      return;
    }

    lastTrackedUrl.current = url;
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!isGaEnabled()) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      <Script
        id="htv-google-analytics-init"
        strategy="afterInteractive"
      >
        {`
          if (window.__HTV_GA_INITIALIZED__) {
            // Skip duplicate init during Fast Refresh.
          } else {
            window.__HTV_GA_INITIALIZED__ = true;
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: false,
              anonymize_ip: true,
            });
          }
        `}
      </Script>

      <Suspense fallback={null}>
        <GoogleAnalyticsPageViews />
      </Suspense>
    </>
  );
}
