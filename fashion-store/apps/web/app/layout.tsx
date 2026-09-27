import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { buildMetadata, organizationJsonLd } from '@/lib/seo';
import { SmoothScroll } from '@/components/SmoothScroll';
import { MetaPixel } from '@/components/MetaPixel';
import { FB_PIXEL_ID } from '@/lib/fbpixel';

export const metadata: Metadata = buildMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Flag JS availability before paint so scroll-reveal start-states apply
            only when they can be animated (no flash, no-JS content stays visible). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        {/* useSearchParams needs a Suspense boundary or it opts the whole tree
            out of static rendering — which SEO here depends on. */}
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <SmoothScroll />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </body>
    </html>
  );
}
