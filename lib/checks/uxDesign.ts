/**
 * UX/Design Checks - Modernitäts-Check für Websites
 * 
 * Prüft ob eine Website optisch/strukturell veraltet wirkt
 * und erzeugt Issues + Category-Score (raw 0-100)
 */

import { CrawlResult } from '../checks'

export interface CheckResult {
  id: string
  category: 'technical' | 'seo' | 'legal' | 'ux'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  pages: string[]
  evidence?: string
  recommendation?: string
  categoryScoreRaw?: number
  metadata?: Record<string, any>
}

interface SiteMeta {
  totalPages: number
  avgWordCount?: number
  avgScriptCount?: number
}

/**
 * Berechnet Kontrast-Ratio zwischen zwei Farben (WCAG)
 */
function calculateContrastRatio(color1: string, color2: string): number {
  try {
    // Vereinfachte Heuristik: Extrahiere RGB-Werte
    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g)
      if (!rgb || rgb.length < 3) return 0.5 // Default
      
      const r = parseInt(rgb[0], 10) / 255
      const g = parseInt(rgb[1], 10) / 255
      const b = parseInt(rgb[2], 10) / 255
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        return c
      })
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    
    return (lighter + 0.05) / (darker + 0.05)
  } catch {
    return 1 // Fallback
  }
}

/**
 * Extrahiert Font-Size-Werte aus HTML/CSS-Heuristik
 */
function extractFontSizes(html: string | undefined): number[] {
  if (!html) return []
  
  const fontSizes: number[] = []
  
  // Suche nach font-size in inline styles
  const inlineStyleRegex = /font-size\s*:\s*([0-9.]+)px/gi
  let match
  while ((match = inlineStyleRegex.exec(html)) !== null) {
    const size = parseFloat(match[1])
    if (size > 0) fontSizes.push(size)
  }
  
  // Suche nach <font size="..."> Tags (veraltet)
  const fontTagRegex = /<font[^>]*size\s*=\s*["']?(\d+)["']?/gi
  while ((match = fontTagRegex.exec(html)) !== null) {
    const size = parseInt(match[1], 10)
    // <font size="1-7" entspricht etwa 10px - 36px
    const pxSize = 10 + (size - 1) * 4.3
    fontSizes.push(pxSize)
  }
  
  return fontSizes
}

/**
 * Prüft auf fehlendes Viewport Meta-Tag
 */
function checkMissingViewport(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutViewport = crawlResult.pages.filter((page: any) => {
    const meta = page.meta || {}
    return !meta.viewport && !meta['viewport']
  })
  
  if (pagesWithoutViewport.length > 0) {
    results.push({
      id: 'ux_missing_viewport',
      category: 'ux',
      title: 'Fehlende Viewport-Konfiguration für mobile Geräte',
      description: `${pagesWithoutViewport.length} Seite(n) hat/haben kein <meta name="viewport">-Tag. Mobile Geräte können die Website möglicherweise nicht korrekt darstellen.`,
      severity: 'medium',
      pages: pagesWithoutViewport.map(p => p.url || p.finalUrl || ''),
      evidence: `${pagesWithoutViewport.length} Seiten ohne viewport meta-tag`,
      recommendation: 'Fügen Sie <meta name="viewport" content="width=device-width, initial-scale=1"> im <head> hinzu, um die mobile Darstellung zu optimieren.',
      categoryScoreRaw: 100 - (pagesWithoutViewport.length * 7), // -7 pro Seite
    })
  }
  
  return results
}

/**
 * Prüft auf Mobile-Overflow (horizontales Scrollen)
 */
function checkMobileOverflow(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const issues: string[] = []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Suche nach großen fixed widths
    const fixedWidthRegex = /width\s*:\s*(\d+)px/gi
    let match
    const wideElements: string[] = []
    
    while ((match = fixedWidthRegex.exec(html)) !== null) {
      const width = parseInt(match[1], 10)
      // Elemente breiter als 1200px verursachen auf Mobile meist Overflow
      if (width > 1200) {
        wideElements.push(`${width}px`)
      }
    }
    
    // Suche nach body/main mit fester Breite
    const bodyMainWidthRegex = /(body|main|#wrapper|\.container)[^}]*width\s*:\s*(\d+)px/gi
    while ((match = bodyMainWidthRegex.exec(html)) !== null) {
      const width = parseInt(match[2], 10)
      if (width > 1200) {
        issues.push(`${match[1]} mit ${width}px Breite`)
      }
    }
    
    if (wideElements.length > 0 || issues.length > 0) {
      const evidence = `Elemente mit fester Breite > 1200px gefunden: ${[...wideElements, ...issues].slice(0, 3).join(', ')}`
      results.push({
        id: 'ux_mobile_overflow',
        category: 'ux',
        title: 'Mögliches horizontales Scrollen auf mobilen Geräten',
        description: `Die Website verwendet Elemente mit fester Breite (> 1200px), die auf mobilen Geräten zu horizontalem Scrollen führen können.`,
        severity: wideElements.length > 3 ? 'high' : 'medium',
        pages: [page.url || page.finalUrl || ''],
        evidence,
        recommendation: 'Verwenden Sie responsive Einheiten (%, rem, vw) statt fester Pixel-Werte oder max-width: 100% für Container.',
        categoryScoreRaw: 100 - (wideElements.length > 3 ? 12 : 7),
      })
    }
  }
  
  return results
}

/**
 * Prüft auf sehr kleine Schriftgrößen
 */
function checkSmallFontSizes(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithSmallFonts: string[] = []
  
  for (const page of crawlResult.pages) {
    const fontSizes = extractFontSizes(page.html)
    if (fontSizes.length === 0) continue
    
    // Berechne Median
    const sorted = [...fontSizes].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    
    // Median < 14px ist problematisch
    if (median < 14) {
      pagesWithSmallFonts.push(page.url || page.finalUrl || '')
    }
  }
  
  if (pagesWithSmallFonts.length > 0) {
    results.push({
      id: 'ux_small_font_sizes',
      category: 'ux',
      title: 'Sehr kleine Schriftgrößen gefunden',
      description: `${pagesWithSmallFonts.length} Seite(n) verwendet/verwenden durchschnittlich sehr kleine Schriftgrößen (< 14px), was die Lesbarkeit beeinträchtigen kann.`,
      severity: 'medium',
      pages: pagesWithSmallFonts,
      evidence: `Median font-size < 14px auf ${pagesWithSmallFonts.length} Seiten`,
      recommendation: 'Erhöhen Sie die Schriftgröße auf mindestens 16px für Body-Text, um die Lesbarkeit zu verbessern.',
      categoryScoreRaw: 100 - (pagesWithSmallFonts.length * 7),
    })
  }
  
  return results
}

/**
 * Prüft auf sehr lange Textzeilen (schlechte Lesbarkeit)
 */
function checkLongTextLines(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Heuristik: Suche nach Containern mit großer Breite und Text-Inhalt
    // Wenn Container > 800px und Text vorhanden → möglicherweise zu lange Zeilen
    const wideTextContainerRegex = /(?:width|max-width)\s*:\s*(\d+)px[^}]*[^}]*(?:p|span|div)[^}]*text/gi
    let match
    const wideContainers: number[] = []
    
    while ((match = wideTextContainerRegex.exec(html)) !== null) {
      const width = parseInt(match[1], 10)
      if (width > 800) {
        wideContainers.push(width)
      }
    }
    
    // Alternative: Prüfe content-Länge und container-breite Heuristik
    if (page.content && page.content.length > 500) {
      // Wenn viel Text vorhanden, prüfe auf große Container
      const hasLargeContainer = html.includes('width:') && /width\s*:\s*(9\d{2}|[1-9]\d{3,})px/.test(html)
      
      if (hasLargeContainer || wideContainers.length > 0) {
        const maxWidth = Math.max(...wideContainers, 900)
        // 95 Zeichen ≈ 700-800px bei normaler Schrift
        if (maxWidth > 800) {
          results.push({
            id: 'ux_long_text_lines',
            category: 'ux',
            title: 'Sehr lange Textzeilen erschweren die Lesbarkeit',
            description: `Text-Container sind sehr breit (> 800px), was zu langen Zeilen führt. Die optimale Zeilenlänge liegt bei 50-75 Zeichen.`,
            severity: 'low',
            pages: [page.url || page.finalUrl || ''],
            evidence: `Text-Container mit ${maxWidth}px Breite gefunden`,
            recommendation: 'Begrenzen Sie die Textbreite auf max-width: 65ch (≈ 650px) für bessere Lesbarkeit.',
            categoryScoreRaw: 100 - 3, // -3 für low severity
          })
          break // Nur einmal pro Seite
        }
      }
    }
  }
  
  return results
}

/**
 * Prüft auf fehlende klare Hierarchie (keine H2/H3 oder multiple H1)
 */
function checkMissingHierarchy(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  for (const page of crawlResult.pages) {
    const h1Count = page.h1Count || page.h1?.length || 0
    const h2Count = page.h2Count || 0
    
    // Multiple H1 ist ein Problem
    if (h1Count > 1) {
      results.push({
        id: 'ux_multiple_h1',
        category: 'ux',
        title: 'Mehrere H1-Überschriften gefunden',
        description: `Die Seite verwendet ${h1Count} H1-Überschriften. Pro Seite sollte nur eine H1 vorhanden sein für klare Hierarchie.`,
        severity: 'medium',
        pages: [page.url || page.finalUrl || ''],
        evidence: `${h1Count} H1-Tags gefunden`,
        recommendation: 'Verwenden Sie nur eine H1 pro Seite (Hauptüberschrift) und nutzen Sie H2, H3 für Unterüberschriften.',
        categoryScoreRaw: 100 - 7,
      })
    }
    
    // Keine H2/H3 obwohl viel Content vorhanden
    if (h2Count === 0 && (page.wordCount || 0) > 200) {
      results.push({
        id: 'ux_missing_hierarchy',
        category: 'ux',
        title: 'Fehlende Überschriften-Hierarchie',
        description: `Die Seite hat viel Text (${page.wordCount} Wörter), aber keine H2/H3-Überschriften. Dies erschwert die Strukturierung und Lesbarkeit.`,
        severity: 'low',
        pages: [page.url || page.finalUrl || ''],
        evidence: `${page.wordCount} Wörter, aber keine H2/H3-Überschriften`,
        recommendation: 'Strukturieren Sie den Inhalt mit H2- und H3-Überschriften für bessere Lesbarkeit und SEO.',
        categoryScoreRaw: 100 - 3,
      })
    }
  }
  
  return results
}

/**
 * Prüft auf überladene Navigation (> 8 Hauptnav-Links)
 */
function checkOverloadedNavigation(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Suche nach nav-Elementen und zähle Links
    const navMatches = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/gi)
    if (!navMatches) continue
    
    for (const navHtml of navMatches) {
      const linkMatches = navHtml.match(/<a[^>]*href[^>]*>/gi) || []
      // Nur Hauptnav-Links zählen (keine Footer-Links)
      if (linkMatches.length > 8) {
        results.push({
          id: 'ux_overloaded_navigation',
          category: 'ux',
          title: 'Überladene Navigation erschwert die Orientierung',
          description: `Die Hauptnavigation enthält ${linkMatches.length} Links. Mehr als 8 Hauptnav-Links können Nutzer überfordern.`,
          severity: 'medium',
          pages: [page.url || page.finalUrl || ''],
          evidence: `${linkMatches.length} Links in der Hauptnavigation`,
          recommendation: 'Reduzieren Sie die Hauptnavigation auf maximal 5-7 wichtige Links. Nutzen Sie Dropdowns oder Untermenüs für weitere Kategorien.',
          categoryScoreRaw: 100 - 7,
        })
        break // Nur einmal pro Seite
      }
    }
  }
  
  return results
}

/**
 * Prüft auf niedrigen Kontrast (WCAG-Heuristik)
 */
function checkLowContrast(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithLowContrast: string[] = []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Suche nach Text-Farben und Hintergrund-Farben
    const colorRegex = /color\s*:\s*(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/gi
    const bgColorRegex = /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/gi
    
    const textColors: string[] = []
    const bgColors: string[] = []
    
    let match
    while ((match = colorRegex.exec(html)) !== null) {
      textColors.push(match[1])
    }
    while ((match = bgColorRegex.exec(html)) !== null) {
      bgColors.push(match[1])
    }
    
    // Prüfe Kontrast-Verhältnisse (vereinfacht)
    let lowContrastCount = 0
    const sampleBg = bgColors[0] || '#ffffff'
    
    for (const textColor of textColors.slice(0, 10)) { // Max 10 prüfen
      const contrast = calculateContrastRatio(textColor, sampleBg)
      // WCAG AA erfordert 4.5:1 für normalen Text
      if (contrast < 4.5) {
        lowContrastCount++
      }
    }
    
    // Wenn mehrere Texte niedrigen Kontrast haben
    if (lowContrastCount > 2) {
      pagesWithLowContrast.push(page.url || page.finalUrl || '')
    }
  }
  
  if (pagesWithLowContrast.length > 0) {
    results.push({
      id: 'ux_low_contrast',
      category: 'ux',
      title: 'Niedriger Kontrast zwischen Text und Hintergrund',
      description: `${pagesWithLowContrast.length} Seite(n) hat/haben Texte mit niedrigem Kontrast (< 4.5:1), was die Lesbarkeit beeinträchtigt.`,
      severity: 'high',
      pages: pagesWithLowContrast,
      evidence: `Texte mit Kontrast < 4.5:1 gefunden`,
      recommendation: 'Erhöhen Sie den Kontrast zwischen Text- und Hintergrundfarbe auf mindestens 4.5:1 (WCAG AA) für bessere Lesbarkeit.',
      categoryScoreRaw: 100 - (pagesWithLowContrast.length * 12), // -12 für high
    })
  }
  
  return results
}

/**
 * Prüft auf viele unterschiedliche Button-Farben (unharmonisch)
 */
function checkInconsistentButtons(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Suche nach Button-Elementen und deren Hintergrund-Farben
    const buttonRegex = /<button[^>]*>|<input[^>]*type=["'](button|submit)["'][^>]*>/gi
    const buttonColors = new Set<string>()
    
    let match
    while ((match = buttonRegex.exec(html)) !== null) {
      const buttonHtml = match[0]
      const bgMatch = buttonHtml.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/i)
      if (bgMatch) {
        buttonColors.add(bgMatch[1].toLowerCase())
      }
      
      // Auch nach class-Namen suchen die auf Buttons hindeuten
      const classMatch = buttonHtml.match(/class=["']([^"']*btn[^"']*)/i)
      if (classMatch) {
        // Suche nach bg-* Klassen (Tailwind-style)
        const bgClassMatch = classMatch[1].match(/bg-(\w+)/g)
        if (bgClassMatch) {
          bgClassMatch.forEach(cls => buttonColors.add(cls))
        }
      }
    }
    
    // Wenn mehr als 3 verschiedene Button-Farben gefunden
    if (buttonColors.size > 3) {
      results.push({
        id: 'ux_inconsistent_buttons',
        category: 'ux',
        title: 'Viele unterschiedliche Button-Farben wirken unharmonisch',
        description: `Die Seite verwendet ${buttonColors.size} verschiedene Button-Farben. Ein konsistentes Design verbessert die User Experience.`,
        severity: 'low',
        pages: [page.url || page.finalUrl || ''],
        evidence: `${buttonColors.size} verschiedene Button-Farben gefunden`,
        recommendation: 'Standardisieren Sie Button-Farben auf 1-2 Primär- und Sekundärfarben für ein konsistentes Design.',
        categoryScoreRaw: 100 - 3,
      })
    }
  }
  
  return results
}

/**
 * Prüft auf alte UI-Patterns (<marquee>, <blink>, <font>, <center>, Tabellenlayout)
 */
function checkOutdatedUIPatterns(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    const patterns: { name: string; regex: RegExp; severity: 'high' | 'medium' }[] = [
      { name: '<marquee>', regex: /<marquee[^>]*>/i, severity: 'high' },
      { name: '<blink>', regex: /<blink[^>]*>/i, severity: 'high' },
      { name: '<font>', regex: /<font[^>]*>/i, severity: 'medium' },
      { name: '<center>', regex: /<center[^>]*>/i, severity: 'medium' },
    ]
    
    const foundPatterns: string[] = []
    
    for (const pattern of patterns) {
      if (pattern.regex.test(html)) {
        foundPatterns.push(pattern.name)
      }
    }
    
    // Prüfe auf Tabellenlayout (viele <table> mit width/align für Layout)
    const tableLayoutRegex = /<table[^>]*(?:width|align|cellpadding|cellspacing)[^>]*>/gi
    const tableMatches = html.match(tableLayoutRegex) || []
    if (tableMatches.length > 2) {
      foundPatterns.push('Tabellenlayout')
    }
    
    if (foundPatterns.length > 0) {
      const highestSeverity = foundPatterns.some(p => ['<marquee>', '<blink>'].includes(p)) ? 'high' : 'medium'
      
      results.push({
        id: 'ux_outdated_ui_patterns',
        category: 'ux',
        title: 'Veraltete HTML-Elemente und Layout-Techniken gefunden',
        description: `Die Website verwendet veraltete HTML-Elemente: ${foundPatterns.join(', ')}. Diese wirken unprofessionell und können zu Darstellungsproblemen führen.`,
        severity: highestSeverity,
        pages: [page.url || page.finalUrl || ''],
        evidence: `Gefundene Patterns: ${foundPatterns.join(', ')}`,
        recommendation: 'Ersetzen Sie veraltete Elemente durch moderne HTML5/CSS3-Techniken. Nutzen Sie Flexbox oder Grid statt Tabellenlayout.',
        categoryScoreRaw: 100 - (highestSeverity === 'high' ? 12 : 7),
      })
    }
  }
  
  return results
}

/**
 * Prüft auf fehlende HTTPS oder Mixed Content
 */
function checkSecurityIssues(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  const pagesWithoutHTTPS: string[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithMixedContent: string[] = []
  
  for (const page of crawlResult.pages) {
    const url = page.url || page.finalUrl || ''
    if (!url) continue
    
    try {
      const urlObj = new URL(url)
      
      // Kein HTTPS
      if (urlObj.protocol === 'http:') {
        pagesWithoutHTTPS.push(url)
      }
      
      // Mixed Content (HTTPS-Seite mit HTTP-Ressourcen)
      if (urlObj.protocol === 'https:' && page.html) {
        const httpResources = page.html.match(/https?:\/\/([^"'\s<>]+)/gi) || []
        const hasMixedContent = httpResources.some((resource: string) => resource.startsWith('http://'))
        
        if (hasMixedContent) {
          pagesWithMixedContent.push(url)
        }
      }
    } catch {
      // URL-Parsing fehlgeschlagen
    }
  }
  
  if (pagesWithoutHTTPS.length > 0) {
    results.push({
      id: 'ux_no_https',
      category: 'ux',
      title: 'Website verwendet kein HTTPS',
      description: `${pagesWithoutHTTPS.length} Seite(n) wird/werden über HTTP (statt HTTPS) geladen. Dies wirkt unsicher und unprofessionell.`,
      severity: 'high',
      pages: pagesWithoutHTTPS,
      evidence: `${pagesWithoutHTTPS.length} Seiten ohne HTTPS`,
      recommendation: 'Aktivieren Sie SSL/TLS-Zertifikat und leiten Sie alle HTTP-Requests zu HTTPS um für Sicherheit und Vertrauen.',
      categoryScoreRaw: 100 - (pagesWithoutHTTPS.length * 12),
    })
  }
  
  if (pagesWithMixedContent.length > 0) {
    results.push({
      id: 'ux_mixed_content',
      category: 'ux',
      title: 'Mixed Content (HTTP-Ressourcen auf HTTPS-Seite)',
      description: `${pagesWithMixedContent.length} Seite(n) lädt HTTP-Ressourcen auf einer HTTPS-Seite. Browser blockieren diese oder warnen Nutzer.`,
      severity: 'high',
      pages: pagesWithMixedContent,
      evidence: `HTTP-Ressourcen auf HTTPS-Seiten gefunden`,
      recommendation: 'Stellen Sie sicher, dass alle Ressourcen (Bilder, CSS, JS) über HTTPS geladen werden. Verwenden Sie protocol-relative URLs (//) oder absolute HTTPS-URLs.',
      categoryScoreRaw: 100 - (pagesWithMixedContent.length * 12),
    })
  }
  
  return results
}

/**
 * Prüft auf fehlende klare CTA (Call-to-Action) im Hero-Bereich
 */
function checkMissingCTA(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Suche nach Buttons/CTAs im ersten Viewport (Hero)
    // Heuristik: Suche nach Button/CTA in den ersten 2000 Zeichen des <body>
    const bodyMatch = html.match(/<body[^>]*>([\s\S]{0,2000})/i)
    if (!bodyMatch) continue
    
    const heroSection = bodyMatch[1]
    
    // Suche nach Button/CTA-Keywords
    const ctaKeywords = ['jetzt', 'starten', 'anfragen', 'kontakt', 'buchen', 'kaufen', 'bestellen', 'download', 'mehr erfahren']
    const hasCTA = /<button|btn|cta|call-to-action/i.test(heroSection) ||
                   ctaKeywords.some(keyword => new RegExp(keyword, 'i').test(heroSection))
    
    // Wenn viel Content vorhanden, aber keine CTA
    if (!hasCTA && (page.wordCount || 0) > 100) {
      results.push({
        id: 'ux_missing_primary_cta',
        category: 'ux',
        title: 'Kein klarer Call-to-Action im Hero-Bereich',
        description: 'Die Startseite hat keinen prominenten Button oder Call-to-Action im sichtbaren Bereich. Nutzer wissen möglicherweise nicht, was sie als Nächstes tun sollen.',
        severity: 'low',
        pages: [page.url || page.finalUrl || ''],
        evidence: 'Kein Button/CTA im ersten Viewport gefunden',
        recommendation: 'Fügen Sie einen prominenten Button im Hero-Bereich hinzu, der Nutzer zur Hauptaktion führt (z. B. "Jetzt kontaktieren", "Angebot anfordern").',
        categoryScoreRaw: 100 - 3,
      })
    }
  }
  
  return results
}

/**
 * Prüft auf fehlende Social Proof-Elemente
 */
function checkMissingSocialProof(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutProof: string[] = []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    const content = (page.content || '').toLowerCase()
    
    if (!html) continue
    
    // Suche nach Social Proof-Keywords
    const proofKeywords = ['referenz', 'kunde', 'testimonial', 'bewertung', 'erfahrung', 'zufrieden', 'empfehlung', 'auszeichnung', 'zertifikat']
    const hasProof = proofKeywords.some(keyword => content.includes(keyword)) ||
                     /<blockquote|testimonial|review|rating/i.test(html)
    
    // Für Startseiten ist Social Proof besonders wichtig
    const isHomepage = (page.url || '').match(/\/$|^https?:\/\/[^\/]+\/?$/i)
    
    if (!hasProof && isHomepage && (page.wordCount || 0) > 150) {
      pagesWithoutProof.push(page.url || page.finalUrl || '')
    }
  }
  
  if (pagesWithoutProof.length > 0) {
    results.push({
      id: 'ux_missing_social_proof',
      category: 'ux',
      title: 'Fehlende Social Proof-Elemente',
      description: `${pagesWithoutProof.length} Startseite(n) hat/haben keine Referenzen, Testimonials oder Bewertungen. Social Proof erhöht das Vertrauen.`,
      severity: 'low',
      pages: pagesWithoutProof,
      evidence: 'Keine Referenzen/Testimonials gefunden',
      recommendation: 'Fügen Sie Kundenreferenzen, Testimonials oder Bewertungen hinzu, um Vertrauen aufzubauen.',
      categoryScoreRaw: 100 - (pagesWithoutProof.length * 3),
    })
  }
  
  return results
}

/**
 * Prüft auf SPA ohne SSR (sehr hohe JS-Last + wenig Text)
 */
function checkSPAPerformance(crawlResult: CrawlResult, siteMeta: SiteMeta): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  // Berechne Durchschnitte
  const avgWordCount = siteMeta.avgWordCount || 0
  const avgScriptCount = siteMeta.avgScriptCount || 0
  
  // SPA-Heuristik: Viel JS, wenig Text
  if (avgScriptCount > 5 && avgWordCount < 200) {
    const spaPages = crawlResult.pages.filter((page: any) => {
      const scriptCount = page.scriptCount || 0
      const wordCount = page.wordCount || 0
      return scriptCount > 3 && wordCount < 150
    })
    
    if (spaPages.length > 0) {
      results.push({
        id: 'ux_spa_without_ssr',
        category: 'ux',
        title: 'Sehr hohe JavaScript-Last bei wenig Inhalt (SPA ohne SSR)',
        description: `Die Website lädt viele JavaScript-Bundles (${avgScriptCount} im Schnitt), hat aber wenig Text-Inhalt (${Math.round(avgWordCount)} Wörter). Dies kann die Performance beeinträchtigen.`,
        severity: 'low',
        pages: spaPages.map(p => p.url || p.finalUrl || '').slice(0, 3),
        evidence: `Durchschnitt: ${avgScriptCount} Scripts, ${Math.round(avgWordCount)} Wörter`,
        recommendation: 'Erwägen Sie Server-Side Rendering (SSR) für bessere Performance und SEO. Lazy Loading für JavaScript-Bundles kann helfen.',
        categoryScoreRaw: 100 - 3,
      })
    }
  }
  
  return results
}

/**
 * Prüft auf schwache Performance (LCP/TTFB)
 */
function checkPerformanceMetrics(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const slowPages: string[] = []
  
  for (const page of crawlResult.pages) {
    const timings = page.timings
    if (!timings) continue
    
    const ttfb = timings.ttfb || 0
    const total = timings.total || 0
    
    // TTFB > 1.5s ist problematisch
    if (ttfb > 1500) {
      slowPages.push(`${page.url || ''} (TTFB: ${Math.round(ttfb)}ms)`)
    }
    
    // Total Load Time > 4s ist problematisch
    if (total > 4000) {
      if (!slowPages.some(p => p.includes(page.url || ''))) {
        slowPages.push(`${page.url || ''} (Load: ${Math.round(total)}ms)`)
      }
    }
  }
  
  if (slowPages.length > 0) {
    results.push({
      id: 'ux_slow_performance',
      category: 'ux',
      title: 'Schwache Performance-Metriken',
      description: `${slowPages.length} Seite(n) hat/haben langsame Ladezeiten (TTFB > 1.5s oder Total Load > 4s). Dies verschlechtert die User Experience erheblich.`,
      severity: 'high',
      pages: crawlResult.pages.filter(p => {
        const t = p.timings
        return t && ((t.ttfb || 0) > 1500 || (t.total || 0) > 4000)
      }).map(p => p.url || p.finalUrl || ''),
      evidence: `Langsame Seiten gefunden: ${slowPages.slice(0, 2).join(', ')}`,
      recommendation: 'Optimieren Sie Server-Response-Zeit (TTFB), reduzieren Sie JavaScript-Bundles, nutzen Sie CDN und Caching für bessere Performance.',
      categoryScoreRaw: 100 - (slowPages.length * 12),
    })
  }
  
  return results
}

/**
 * Prüft auf Hero ohne klaren Nutzen-Text / CTA
 */
function checkHeroWithoutValueProposition(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithWeakHero: string[] = []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    const content = (page.content || '').toLowerCase()
    
    // Prüfe ob es eine Hero-Section gibt (erste 2000 Zeichen des Body)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]{0,2000})/i)
    if (!bodyMatch) continue
    
    const heroSection = bodyMatch[1]
    const heroContent = heroSection.toLowerCase()
    
    // Prüfe auf Nutzen-Keywords (Wertversprechen)
    const valueKeywords = ['leistung', 'vorteil', 'profitieren', 'erfolg', 'qualität', 'kompetenz', 'lösung', 'hilfe', 'unterstützung', 'kostenlos', 'schnell', 'effizient']
    const hasValueProposition = valueKeywords.some(keyword => heroContent.includes(keyword) || content.includes(keyword))
    
    // Prüfe auf CTA
    const hasCTA = /<button|btn|cta|call-to-action|jetzt|anfrage|kontakt|starten/i.test(heroSection)
    
    // Wenn kein Nutzen-Text UND kein CTA → schwacher Hero
    if (!hasValueProposition && !hasCTA && (page.wordCount || 0) > 50) {
      pagesWithWeakHero.push(page.url)
    }
  }
  
  if (pagesWithWeakHero.length > 0) {
    results.push({
      id: 'ux_hero_without_value_proposition',
      category: 'ux',
      title: `${pagesWithWeakHero.length} Seite(n) mit schwachem Hero-Bereich`,
      description: `Diese Seiten haben keinen klaren Nutzen-Text oder Call-to-Action im Hero-Bereich. Nutzer wissen möglicherweise nicht, welchen Wert die Website bietet.`,
      severity: 'medium',
      pages: pagesWithWeakHero,
      evidence: `Hero-Bereich ohne klaren Nutzen-Text oder CTA`,
      recommendation: 'Fügen Sie im Hero-Bereich ein klares Wertversprechen und einen Call-to-Action hinzu, damit Nutzer sofort verstehen, was Sie anbieten.',
      categoryScoreRaw: 100 - 7,
    })
  }
  
  return results
}

/**
 * Prüft auf fehlende Telefonnummer / Kontakt im Header oder Footer
 */
function checkMissingContactInfo(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithoutContact: string[] = []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Prüfe auf Telefonnummer (verschiedene Formate)
    const phonePatterns = [
      /\d{3}[\s\-]?\d{3}[\s\-]?\d{4}/, // Standard
      /\+?\d{2,3}[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}/, // International
      /\(0\d{1,4}\)\s?\d{1,4}[\s\-]?\d{1,9}/, // Deutsch mit Vorwahl
      /tel:/i, // tel: Link
    ]
    
    const hasPhone = phonePatterns.some(pattern => pattern.test(html))
    
    // Prüfe auf Kontakt-Keywords im Header/Footer
    const headerFooterMatch = html.match(/(<header[^>]*>[\s\S]{0,3000}|<footer[^>]*>[\s\S]{0,3000})/gi)
    const hasContactInHeaderFooter = headerFooterMatch?.some((section: string) => {
      const sectionLower = section.toLowerCase()
      return sectionLower.includes('kontakt') || 
             sectionLower.includes('contact') || 
             sectionLower.includes('telefon') ||
             sectionLower.includes('phone') ||
             /tel:/.test(sectionLower)
    })
    
    // Wichtige Seiten (Startseite) sollten Kontakt-Info haben
    const isImportantPage = page.url.match(/\/$|^https?:\/\/[^\/]+\/?$/i)
    
    if (isImportantPage && !hasPhone && !hasContactInHeaderFooter) {
      pagesWithoutContact.push(page.url)
    }
  }
  
  if (pagesWithoutContact.length > 0) {
    const severity = pagesWithoutContact.length > 1 ? 'medium' : 'low'
    results.push({
      id: 'ux_missing_contact_info',
      category: 'ux',
      title: `${pagesWithoutContact.length} wichtige Seite(n) ohne Kontakt-Informationen`,
      description: `Diese wichtigen Seiten (z.B. Startseite) haben keine Telefonnummer oder Kontakt-Informationen im Header oder Footer. Dies erschwert es Nutzern, Sie zu erreichen.`,
      severity,
      pages: pagesWithoutContact,
      evidence: `Keine Telefonnummer oder Kontakt-Info im Header/Footer gefunden`,
      recommendation: 'Fügen Sie Kontakt-Informationen (Telefonnummer, E-Mail) im Header oder Footer hinzu, damit Nutzer Sie leicht erreichen können.',
      categoryScoreRaw: severity === 'medium' ? 100 - 7 : 100 - 3,
    })
  }
  
  return results
}

/**
 * Prüft auf Formulare ohne Labels (Accessibility/UX)
 */
function checkFormsWithoutLabels(crawlResult: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) return []
  
  const pagesWithUnlabeledForms: string[] = []
  
  for (const page of crawlResult.pages) {
    const html = page.html || ''
    if (!html) continue
    
    // Suche nach Formularen
    const formMatches = html.match(/<form[^>]*>[\s\S]*?<\/form>/gi)
    if (!formMatches || formMatches.length === 0) continue
    
    let hasUnlabeledInputs = false
    
    for (const formHtml of formMatches) {
      // Suche nach Input-Feldern
      const inputMatches = formHtml.match(/<input[^>]*>/gi) || []
      const textareaMatches = formHtml.match(/<textarea[^>]*>/gi) || []
      const selectMatches = formHtml.match(/<select[^>]*>/gi) || []
      
      const allInputs = [...inputMatches, ...textareaMatches, ...selectMatches]
      
      // Prüfe ob Inputs Labels haben
      for (const inputHtml of allInputs) {
        // Prüfe auf aria-label oder placeholder (als Fallback)
        const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(inputHtml)
        const hasPlaceholder = /placeholder=["'][^"']+["']/i.test(inputHtml)
        
        // Prüfe ob es ein <label> mit for-Attribut gibt
        const inputIdMatch = inputHtml.match(/id=["']([^"']+)["']/i)
        if (inputIdMatch) {
          const inputId = inputIdMatch[1]
          const hasLabel = new RegExp(`<label[^>]*for=["']${inputId}["']`, 'i').test(formHtml) ||
                          new RegExp(`<label[^>]*>[\s\S]*?<[^>]*id=["']${inputId}["']`, 'i').test(formHtml)
          
          if (!hasLabel && !hasAriaLabel && !hasPlaceholder) {
            hasUnlabeledInputs = true
            break
          }
        } else if (!hasAriaLabel && !hasPlaceholder) {
          // Wenn kein ID vorhanden, prüfe ob es ein umgebendes <label> gibt
          const hasWrappingLabel = /<label[^>]*>[\s\S]*?<\/label>/i.test(formHtml)
          if (!hasWrappingLabel) {
            hasUnlabeledInputs = true
            break
          }
        }
      }
      
      if (hasUnlabeledInputs) break
    }
    
    if (hasUnlabeledInputs) {
      pagesWithUnlabeledForms.push(page.url)
    }
  }
  
  if (pagesWithUnlabeledForms.length > 0) {
    const severity = pagesWithUnlabeledForms.length > 2 ? 'medium' : 'low'
    results.push({
      id: 'ux_forms_without_labels',
      category: 'ux',
      title: `${pagesWithUnlabeledForms.length} Seite(n) mit Formularen ohne Labels`,
      description: `Diese Seiten haben Formulare mit Input-Feldern ohne Labels. Dies beeinträchtigt Accessibility (Barrierefreiheit) und UX.`,
      severity,
      pages: pagesWithUnlabeledForms,
      evidence: `Formulare mit ungelabelten Input-Feldern gefunden`,
      recommendation: 'Fügen Sie <label>-Tags oder aria-label-Attribute zu allen Formularfeldern hinzu für bessere Accessibility und UX.',
      categoryScoreRaw: severity === 'medium' ? 100 - 7 : 100 - 3,
    })
  }
  
  return results
}

/**
 * Hauptfunktion: Führt alle UX/Design-Checks aus
 */
export function runUxDesignChecks(
  crawlResult: CrawlResult,
  siteMeta?: SiteMeta
): { issues: CheckResult[]; categoryScoreRaw: number } {
  const issues: CheckResult[] = []
  
  // Berechne Site-Meta falls nicht übergeben
  if (!crawlResult?.pages || !Array.isArray(crawlResult.pages)) {
    return { issues: [], categoryScoreRaw: 0 }
  }
  
  const meta: SiteMeta = siteMeta || {
    totalPages: crawlResult.pages.length,
    avgWordCount: crawlResult.pages.reduce((sum: number, p: any) => sum + (p.wordCount || 0), 0) / crawlResult.pages.length || 0,
    avgScriptCount: crawlResult.pages.reduce((sum: number, p: any) => sum + (p.scriptCount || 0), 0) / crawlResult.pages.length || 0,
  }
  
  // A) Layout & Responsiveness
  issues.push(...checkMissingViewport(crawlResult))
  issues.push(...checkMobileOverflow(crawlResult))
  issues.push(...checkSmallFontSizes(crawlResult))
  
  // B) Typografie & Lesbarkeit
  issues.push(...checkLongTextLines(crawlResult))
  issues.push(...checkMissingHierarchy(crawlResult))
  issues.push(...checkOverloadedNavigation(crawlResult))
  
  // C) Farbwelt & Stil
  issues.push(...checkLowContrast(crawlResult))
  issues.push(...checkInconsistentButtons(crawlResult))
  issues.push(...checkOutdatedUIPatterns(crawlResult))
  
  // D) Vertrauen / Modern Web Standards
  issues.push(...checkSecurityIssues(crawlResult))
  issues.push(...checkMissingCTA(crawlResult))
  issues.push(...checkMissingSocialProof(crawlResult))
  
  // Zusätzliche UX/Design Checks
  issues.push(...checkHeroWithoutValueProposition(crawlResult))
  issues.push(...checkMissingContactInfo(crawlResult))
  issues.push(...checkFormsWithoutLabels(crawlResult))
  
  // E) SPA/Performance Signal
  issues.push(...checkSPAPerformance(crawlResult, meta))
  issues.push(...checkPerformanceMetrics(crawlResult))
  
  // Berechne Category Score (Start bei 100, ziehe ab je nach Severity)
  let categoryScore = 100
  
  for (const issue of issues) {
    if (issue.severity === 'high') {
      categoryScore -= 12
    } else if (issue.severity === 'medium') {
      categoryScore -= 7
    } else if (issue.severity === 'low') {
      categoryScore -= 3
    }
  }
  
  // Clamp auf 0-100
  categoryScore = Math.max(0, Math.min(100, categoryScore))
  const finalCategoryScore = Math.round(categoryScore)
  
  // Setze categoryScoreRaw für alle Issues (konsistent)
  issues.forEach(issue => {
    if (!issue.categoryScoreRaw) {
      issue.categoryScoreRaw = finalCategoryScore
    }
  })
  
  return {
    issues,
    categoryScoreRaw: finalCategoryScore,
  }
}

