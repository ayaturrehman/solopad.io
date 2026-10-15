"use client";
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function MarketingAnalytics() {
  const path = usePathname();
  // Recovery and client capability URLs must not be sent to analytics.
  const publicPage = path === '/' || /^\/(features|blog|compare|privacy|terms|changelog)(\/|$)/.test(path || '');
  if (!publicPage) return null;
  return <>
    <Script src="https://www.googletagmanager.com/gtag/js?id=G-RGD4VP2T9Y" strategy="afterInteractive" />
    <Script id="google-analytics" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-RGD4VP2T9Y');
    `}</Script>
  </>;
}
