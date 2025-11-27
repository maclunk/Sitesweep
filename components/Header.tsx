'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Wenn bereits auf Homepage, scroll nach oben und triggere Reset
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Dispatch custom event für State-Reset
      window.dispatchEvent(new CustomEvent('resetHomepage'))
    }
    // Ansonsten normale Link-Navigation zur Homepage
  }

  return (
    <header className="px-4 py-4 md:sticky md:top-4 md:z-50">
      <div className="max-w-6xl mx-auto">
        <nav className="bg-white md:bg-white/95 md:backdrop-blur-sm md:rounded-2xl md:shadow-soft-lg md:border md:border-slate-200/50 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center md:justify-between gap-4">
          {/* Logo - Centered on Mobile */}
          <Link 
            href="/" 
            className="flex flex-col gap-1 group text-center md:text-left"
            onClick={handleLogoClick}
          >
            <span className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
              SiteSweep
            </span>
            <span className="hidden md:inline text-xs text-slate-600 font-medium">
              Der technisch abgesicherte Website-Check für KMU
            </span>
          </Link>
          
          {/* Navigation Links - Centered on Mobile */}
          <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
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
        </nav>
      </div>
    </header>
  )
}
