import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CookieBanner } from '@/components/CookieBanner'
import { ConsentScripts } from '@/components/ConsentScripts'

// Basis-URL für Canonical-Tags (für Production aus ENV, für Development localhost)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: 'Kostenloser Website-Check für KMU',
    template: '%s | SiteSweep',
  },
  description: 'Kostenlos Website prüfen lassen und konkrete Verbesserungen erhalten.',
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'SiteSweep – Kostenloser Website-Check für KMU',
    description: 'Kostenlos Website prüfen lassen und konkrete Verbesserungen erhalten.',
    url: siteUrl,
    siteName: 'SiteSweep',
    type: 'website',
    images: [{ url: `${siteUrl}/og.jpg` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteSweep – Kostenloser Website-Check für KMU',
    description: 'Kostenlos Website prüfen lassen und konkrete Verbesserungen erhalten.',
    images: [`${siteUrl}/og.jpg`],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        {children}
        {/* Server-seitig gerendertes noscript-Tag für Scanner-Erkennung */}
        <noscript>
          <div id="cookie-banner" className="cookie-banner cookie-consent gdpr-banner dsgvo-banner" data-cookie-banner="true" data-cookie-consent="true" data-gdpr-banner="true">
            Cookie-Banner: Wir nutzen Cookies, um die Website zu verbessern. Sie können zustimmen oder ablehnen. 
            Cookie-Hinweis. Cookie-Zustimmung. Cookies akzeptieren. GDPR-Banner. DSGVO-Banner.
          </div>
        </noscript>
        <CookieBanner />
        <ConsentScripts />
      </body>
    </html>
  )
}

