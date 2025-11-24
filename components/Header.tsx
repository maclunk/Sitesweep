'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Wenn bereits auf Homepage, scroll nach oben und triggere Reset
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Dispatch custom event für State-Reset
      window.dispatchEvent(new CustomEvent('resetHomepage'))
    } else {
      // Navigiere zur Homepage
      router.push('/')
    }
  }

  const handleScanStartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (pathname === '/') {
      // Wenn bereits auf Startseite, scroll zum Scanner
      const element = document.getElementById('scan-section')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Navigiere zur Startseite mit Anker
      router.push('/#scan-section')
    }
  }

  return (
    <header className="sticky top-4 z-50 px-4 py-2">
      <div className="max-w-6xl mx-auto">
        <nav className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft-lg border border-slate-200/50 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Logo + Tagline */}
          <Link 
            href="/" 
            className="flex flex-col gap-1 group"
            onClick={handleLogoClick}
          >
            <span className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
              SiteSweep
            </span>
            <span className="hidden md:inline text-xs text-slate-600 font-medium">
              Der rechtssichere Website-Check für KMU
            </span>
          </Link>
          
          {/* Center: Navigation Links */}
          <div className="flex items-center gap-6 flex-wrap">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-primary' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Start
            </Link>
            <Link 
              href="/leistungen" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/leistungen' 
                  ? 'text-primary' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leistungen
            </Link>
            <Link 
              href="/ratgeber" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/ratgeber' 
                  ? 'text-primary' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Infos
            </Link>
            <Link 
              href="/ueber-uns" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/ueber-uns' 
                  ? 'text-primary' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Über uns
            </Link>
          </div>
          
          {/* Right: CTA Button */}
          <Link
            href="/#scan-section"
            onClick={handleScanStartClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-full text-sm hover:bg-primary-dark transition-all shadow-soft hover:shadow-soft-lg whitespace-nowrap"
          >
            Kostenlose Analyse buchen
            <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
