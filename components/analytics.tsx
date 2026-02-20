/* eslint-disable @next/next/next-script-for-ga */

import { siteConfig } from '@/lib/site-config';

export function AnalyticsHead() {
  const gaId = siteConfig.analytics.gaMeasurementId;
  const gtmId = siteConfig.analytics.gtmId;

  if (!gaId && !gtmId) {
    return null;
  }

  return (
    <>
      {gaId ? <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} /> : null}
      {gaId ? (
        <script
          id="ga4"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `,
          }}
        />
      ) : null}
      {gtmId ? (
        <script
          id="gtm"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      ) : null}
    </>
  );
}

export function AnalyticsBody() {
  const gtmId = siteConfig.analytics.gtmId;

  if (!gtmId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
