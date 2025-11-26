'use client'

import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'

export default function Footer() {
  const handleCookieSettings = () => {
    // Trigger cookie banner to show again
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('showCookieBanner')
      window.dispatchEvent(event)
      // Also try to find and click cookie banner if it exists
      const cookieBanner = document.querySelector('[data-cookie-banner]')
      if (cookieBanner) {
        (cookieBanner as HTMLElement).style.display = 'block'
      }
    }
  }

  return (
    <footer className="mt-16 bg-gradient-footer py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Left: SiteSweep Logo + Mission */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-slate-900 mb-3">SiteSweep</h4>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Der technisch abgesicherte Website-Check für KMU. Rechtskonform, schnell, transparent.
            </p>
            <div className="space-y-2 text-sm">
              <a 
                href="mailto:info@sitesweep.de" 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@sitesweep.de
              </a>
            </div>
          </div>
          
          {/* Produkt */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Produkt
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Scan
                </Link>
              </li>
              <li>
                <Link 
                  href="/leistungen" 
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Leistungen
                </Link>
              </li>
              <li>
                <Link 
                  href="/ratgeber" 
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Infos
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Unternehmen */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Unternehmen
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/ueber-uns" 
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Über uns
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Rechtliches */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Rechtliches
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/impressum" 
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link 
                  href="/datenschutz" 
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-slate-200/50 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 text-center md:text-left">
              &copy; {new Date().getFullYear()} SiteSweep. Alle Rechte vorbehalten.
            </p>
            <button
              onClick={handleCookieSettings}
              className="text-xs text-slate-600 hover:text-slate-900 transition-colors underline"
            >
              Cookie-Einstellungen
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
