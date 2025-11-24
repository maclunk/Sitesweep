import { CheckResult } from '../checks'
import { suggestFix, Issue } from './suggestFix'

/**
 * Mapping von Issue-IDs zu AutoFix-Funktionen
 * Jede Funktion gibt Kontext-Informationen zurück, die für GPT benötigt werden
 */
export interface IssueContext {
  issueId: string
  issue: CheckResult
  affectedPages: string[]
  pageContent?: string // HTML-Content der betroffenen Seite
  pageUrl?: string
}

/**
 * AutoFix-Funktionen für verschiedene Issue-Typen
 * Jede Funktion verwendet suggestFix() um GPT-basierte Patches zu generieren
 */
export const autofixByIssueId: Record<
  string,
  (html: string, issue: Issue) => Promise<{ patch: string; explanation: string }>
> = {
  // 1. SEO: Fehlender Title-Tag
  'missing-title': async (html: string, issue: Issue) => {
    return suggestFix(html, issue)
  },

  // 2. SEO: Fehlende Meta-Description
  'missing-meta-description': async (html: string, issue: Issue) => {
    return suggestFix(html, issue)
  },

  // 3. SEO: Fehlende ALT-Texte für Bilder
  'missing-alt-tags': async (html: string, issue: Issue) => {
    return suggestFix(html, issue)
  },

  // 4. UX: Telefonnummer nicht klickbar
  'phone-not-clickable': async (html: string, issue: Issue) => {
    return suggestFix(html, issue)
  },

  // 5. SEO: Fehlendes Canonical-Tag
  'seo_missing_canonical': async (html: string, issue: Issue) => {
    return suggestFix(html, issue)
  },

  // 6. SEO: Fehlende Open-Graph-Tags
  'seo_missing_og_tags': async (html: string, issue: Issue) => {
    return suggestFix(html, issue)
  },

  // 7. SEO: Fehlendes lang-Attribut
  'seo_missing_lang_attr': async (html: string, issue: Issue) => {
    return suggestFix(html, issue)
  },

  // 8. UX: Fehlendes Favicon
  'ux_missing_favicon': async (html: string, issue: Issue) => {
    return suggestFix(html, issue)
  },
}

/**
 * Gibt für eine Issue-ID zurück, ob ein AutoFix verfügbar ist
 */
export function hasAutoFix(issueId: string): boolean {
  return issueId in autofixByIssueId
}

/**
 * Gibt für eine Issue-ID die relevanten Kontext-Informationen zurück
 */
export function getIssueContext(issue: CheckResult, pageContent?: string, pageUrl?: string): IssueContext {
  return {
    issueId: issue.id,
    issue,
    affectedPages: issue.pages || [],
    pageContent,
    pageUrl,
  }
}

/**
 * Gibt eine kurze Beschreibung zurück, was für diesen Issue-Typ gefixt werden soll
 */
export function getFixDescription(issueId: string): string {
  const descriptions: Record<string, string> = {
    'missing-title': 'Füge einen <title>-Tag im <head> hinzu',
    'missing-meta-description': 'Füge ein <meta name="description">-Tag im <head> hinzu',
    'missing-responsive-meta': 'Füge ein <meta name="viewport">-Tag im <head> hinzu',
    'seo_missing_canonical': 'Füge ein <link rel="canonical">-Tag im <head> hinzu',
    'seo_missing_og_tags': 'Füge Open-Graph Meta-Tags (og:title, og:description, og:image) im <head> hinzu',
    'seo_missing_lang_attr': 'Füge ein lang-Attribut zum <html>-Tag hinzu',
    'ux_missing_favicon': 'Füge ein <link rel="icon">-Tag im <head> hinzu',
    'multiple-h1': 'Reduziere die Anzahl der <h1>-Tags auf maximal einen',
    'missing-alt-tags': 'Füge alt-Attribute zu <img>-Tags ohne alt hinzu',
    'phone-not-clickable': 'Ersetze Telefonnummer durch <a href="tel:XXX">',
  }
  return descriptions[issueId] || 'Behebe das Problem im HTML'
}

