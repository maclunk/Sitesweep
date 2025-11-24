/**
 * Wendet einen HTML-Patch auf den gegebenen Content an
 * 
 * @param originalHtml - Das ursprüngliche HTML
 * @param patch - Der HTML-Patch (nur das geänderte Element)
 * @returns Das gepatchte HTML
 */
export function applyPatch(originalHtml: string, patch: string): string {
  const trimmedPatch = patch.trim()
  let result = originalHtml

  // 1. Title-Tag ersetzen
  if (trimmedPatch.match(/<title[^>]*>/i)) {
    const titleMatch = trimmedPatch.match(/<title[^>]*>[\s\S]*?<\/title>/i)
    if (titleMatch) {
      const newTitle = titleMatch[0]
      // Ersetze existierenden title
      if (result.match(/<title[^>]*>[\s\S]*?<\/title>/i)) {
        result = result.replace(/<title[^>]*>[\s\S]*?<\/title>/i, newTitle)
      } else {
        // Füge title in head ein
        result = result.replace(/(<head[^>]*>)/i, `$1\n  ${newTitle}`)
      }
      return result
    }
  }

  // 2. Meta-Tag hinzufügen (wenn nicht existiert)
  if (trimmedPatch.match(/<meta[^>]*>/i)) {
    const metaTag = trimmedPatch.match(/<meta[^>]*>/i)?.[0]
    if (metaTag) {
      // Prüfe ob Meta-Tag bereits existiert (basierend auf name/property)
      const nameMatch = metaTag.match(/(?:name|property)=["']([^"']+)["']/i)
      if (nameMatch) {
        const name = nameMatch[1]
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const existingMetaRegex = new RegExp(`<meta[^>]*(?:name|property)=["']${escapedName}["'][^>]*>`, 'i')
        
        if (result.match(existingMetaRegex)) {
          // Ersetze existierendes Meta-Tag
          result = result.replace(existingMetaRegex, metaTag)
        } else {
          // Füge neues Meta-Tag in head ein
          const headMatch = result.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i)
          if (headMatch) {
            result = result.replace(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i, `$1$2\n  ${metaTag}$3`)
          }
        }
      } else {
        // Meta-Tag ohne name/property - einfach in head einfügen
        const headMatch = result.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i)
        if (headMatch) {
          result = result.replace(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i, `$1$2\n  ${metaTag}$3`)
        }
      }
      return result
    }
  }

  // 3. HTML lang-Attribut ersetzen
  if (trimmedPatch.match(/<html[^>]*lang=["'][^"']+["']/i)) {
    const newHtmlTag = trimmedPatch.match(/<html[^>]*>/i)?.[0]
    if (newHtmlTag) {
      result = result.replace(/<html[^>]*>/i, newHtmlTag)
      return result
    }
  }

  // 4. Link rel="icon" in head einfügen
  if (trimmedPatch.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["']/i)) {
    const linkTag = trimmedPatch.match(/<link[^>]*>/i)?.[0]
    if (linkTag) {
      // Prüfe ob Link bereits existiert
      const existingLinkRegex = /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*>/i
      if (result.match(existingLinkRegex)) {
        // Ersetze existierendes Link-Tag
        result = result.replace(existingLinkRegex, linkTag)
      } else {
        // Füge neues Link-Tag in head ein
        const headMatch = result.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i)
        if (headMatch) {
          result = result.replace(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i, `$1$2\n  ${linkTag}$3`)
        }
      }
      return result
    }
  }

  // 5. Telefonnummer durch <a href="tel:..."> ersetzen
  if (trimmedPatch.match(/<a[^>]*href=["']tel:/i)) {
    const telLink = trimmedPatch.match(/<a[^>]*href=["']tel:([^"']+)["'][^>]*>[\s\S]*?<\/a>/i)
    if (telLink) {
      const phoneNumber = telLink[1]
      // Extrahiere nur Ziffern und + für Suche
      const phoneDigits = phoneNumber.replace(/[^\d+]/g, '')
      // Erstelle Regex für verschiedene Telefonnummer-Formate
      const phonePatterns = [
        phoneDigits, // Exakte Ziffern
        phoneNumber.replace(/[^\d+]/g, ''), // Ohne Formatierung
        phoneNumber.replace(/[^\d+]/g, '').replace(/^\+/, ''), // Ohne +
        phoneNumber, // Original
      ]

      // Finde Telefonnummer im HTML (verschiedene Formate)
      for (const pattern of phonePatterns) {
        if (pattern.length < 5) continue // Zu kurz
        
        // Erstelle Regex für Telefonnummer (mit/ohne Leerzeichen, Bindestriche, etc.)
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const phoneRegex = new RegExp(
          `(${escapedPattern.replace(/(\d)/g, '$1[\\s\\-\\.]?')})`,
          'gi'
        )

        // Ersetze Telefonnummer durch Link (nur wenn nicht bereits in <a> Tag)
        result = result.replace(phoneRegex, (match, phone) => {
          // Prüfe ob bereits in <a> Tag
          if (result.substring(result.indexOf(match) - 50, result.indexOf(match) + match.length + 50).match(/<a[^>]*>[\s\S]*?<\/a>/i)) {
            return match // Bereits verlinkt
          }
          // Ersetze durch Link
          return telLink[0].replace(/<a[^>]*>([\s\S]*?)<\/a>/i, (_, content) => {
            return `<a href="tel:${phoneNumber}">${phone}</a>`
          })
        })

        // Wenn Ersetzung gefunden, stoppe
        if (result !== originalHtml) {
          break
        }
      }
      return result
    }
  }

  // Fallback: Wenn Patch nicht erkannt wurde, gebe Original zurück
  return result
}
