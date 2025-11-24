'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

/**
 * ConsentScripts Component
 * 
 * Lädt Tracking-Scripts nur nach expliziter Zustimmung.
 * Prüft localStorage key "cookie_consent" === "accepted"
 */
export function ConsentScripts() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Prüfe initialen Consent-Status
    const checkConsent = () => {
      const consent = localStorage.getItem('cookie_consent')
      setHasConsent(consent === 'accepted')
    }

    checkConsent()

    // Höre auf Consent-Änderungen
    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      setHasConsent(customEvent.detail === 'accepted')
    }

    window.addEventListener('cookieConsentChanged', handleConsentChange)

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange)
    }
  }, [])

  // Nur Tracking-Scripts laden, wenn Consent gegeben wurde
  if (!hasConsent) {
    return null
  }

  return (
    <>
      {/* Beispiel: Google Analytics
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>
      */}

      {/* Beispiel: Facebook Pixel
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      */}

      {/* Weitere Tracking-Scripts können hier hinzugefügt werden */}
    </>
  )
}

