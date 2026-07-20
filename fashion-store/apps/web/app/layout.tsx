import type { Metadata } from 'next';
import './globals.css';
import { buildMetadata, organizationJsonLd } from '@/lib/seo';
import { SmoothScroll } from '@/components/SmoothScroll';

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
