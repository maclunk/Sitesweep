'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

export default function StickyCta() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('scan-section')
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect()
        // Show sticky CTA when hero section is scrolled past
        setIsVisible(rect.bottom < 0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToScanner = () => {
    const element = document.getElementById('scan-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-soft-lg px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm font-medium text-slate-900">
          Finden Sie heraus, wie viele neue Kunden Sie gewinnen könnten
        </p>
        <button
          onClick={scrollToScanner}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F766E] text-white font-semibold rounded-full text-sm hover:bg-[#0D5D56] transition-all shadow-soft whitespace-nowrap min-h-[40px]"
        >
          <Search className="w-4 h-4" />
          Jetzt analysieren
        </button>
      </div>
    </div>
  )
}

