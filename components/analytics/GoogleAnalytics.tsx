"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
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


const INTERNAL_ANALYTICS_KEY =
  "htv_internal_analytics";


function useInternalAnalyticsStatus() {
  const pathname = usePathname();

  const [
    internal,
    setInternal,
  ] = useState(true);

  useEffect(() => {
    /*
     * Never count Control Center traffic.
     */
    if (
      pathname === "/admin" ||
      pathname.startsWith("/admin/")
    ) {
      setInternal(true);
      return;
    }

    try {
      setInternal(
        window.localStorage.getItem(
          INTERNAL_ANALYTICS_KEY
        ) === "1"
      );
    } catch {
      setInternal(false);
    }
  }, [pathname]);

  return internal;
}


function GoogleAnalyticsPageViews() {
  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const internal =
    useInternalAnalyticsStatus();

  const lastTrackedUrl =
    useRef<string | null>(
      null
    );

  useEffect(() => {
    if (
      !isGaEnabled() ||
      internal
    ) {
      return;
    }

    const query =
      searchParams.toString();

    const url =
      query
        ? `${pathname}?${query}`
        : pathname;

    if (
      lastTrackedUrl.current ===
      url
    ) {
      return;
    }

    lastTrackedUrl.current =
      url;

    trackPageView(url);
  }, [
    pathname,
    searchParams,
    internal,
  ]);

  return null;
}


function GoogleAnalyticsScripts() {
  const internal =
    useInternalAnalyticsStatus();

  if (
    !isGaEnabled() ||
    internal
  ) {
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

            function gtag(){
              dataLayer.push(arguments);
            }

            window.gtag = gtag;

            gtag(
              'js',
              new Date()
            );

            gtag(
              'config',
              '${GA_MEASUREMENT_ID}',
              {
                send_page_view: false,
                anonymize_ip: true,
              }
            );
          }
        `}
      </Script>
    </>
  );
}


export default function GoogleAnalytics() {
  if (!isGaEnabled()) {
    return null;
  }

  return (
    <>
      <GoogleAnalyticsScripts />

      <Suspense fallback={null}>
        <GoogleAnalyticsPageViews />
      </Suspense>
    </>
  );
}
