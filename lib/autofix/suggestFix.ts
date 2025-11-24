export interface Issue {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  category: string
  pages: string[]
}

/**
 * Generiert einen GPT-basierten Fix-Vorschlag für ein Issue
 */
export async function suggestFix(
  html: string,
  issue: Issue
): Promise<{ patch: string; explanation: string }> {
  // Prüfe ob OpenAI API Key vorhanden ist
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY ist nicht gesetzt. Bitte in .env konfigurieren.')
  }

  // Erstelle GPT-Prompt
  const prompt = createFixPrompt(html, issue)

  try {
    // Rufe OpenAI API auf
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // gpt-4.1-mini existiert nicht, verwende gpt-4o-mini
        messages: [
          {
            role: 'system',
            content: 'Du bist eine Engine für präzise HTML-Fixes. Gib NUR einen minimalen HTML-Patch zurück, kein komplettes HTML-Dokument. Fasse dich extrem kurz.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2, // Sehr niedrige Temperatur für präzise Patches
        max_tokens: 500, // Kürzer für minimale Patches
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API Fehler: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const gptResponse = data.choices?.[0]?.message?.content

    if (!gptResponse) {
      throw new Error('Keine Antwort von OpenAI erhalten')
    }

    // Parse GPT-Antwort
    return parseGPTResponse(gptResponse)
  } catch (error) {
    console.error('Fehler beim Generieren des Fix-Vorschlags:', error)
    throw error
  }
}

/**
 * Erstellt den Prompt für GPT
 */
function createFixPrompt(html: string, issue: Issue): string {
  // Extrahiere relevanten HTML-Ausschnitt basierend auf Issue-Typ
  const relevantHTML = extractRelevantHTML(html, issue)
  
  return `Problem: ${issue.title} - ${issue.description}

Aktuelles HTML:
\`\`\`html
${relevantHTML}
\`\`\`

Erstelle einen MINIMALEN HTML-Patch. Ersetze NUR das betroffene Element, nicht die ganze Seite.

Antworte im JSON-Format:
{
  "patch": "<nur das geänderte Element>",
  "explanation": "1-2 Sätze auf Deutsch"
}`
}

/**
 * Extrahiert relevanten HTML-Ausschnitt basierend auf Issue-Typ
 */
function extractRelevantHTML(content: string, issue: Issue): string {
  // Für Head-bezogene Issues: Extrahiere <head>-Bereich
  const headRelated = [
    'missing-title',
    'missing-meta-description',
    'missing-responsive-meta',
    'seo_missing_canonical',
    'seo_missing_og_tags',
    'seo_missing_lang_attr',
    'ux_missing_favicon',
  ]

  if (headRelated.includes(issue.id)) {
    const headMatch = content.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
    if (headMatch) {
      return `<head>${headMatch[1]}</head>`
    }
    // Fallback: Erste 500 Zeichen
    return content.substring(0, 500)
  }

  // Für H1-Issues: Extrahiere H1-Bereich
  if (issue.id === 'multiple-h1') {
    const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)
    if (h1Matches) {
      return h1Matches.slice(0, 3).join('\n') // Erste 3 H1-Tags
    }
  }

  // Für Image-Issues: Extrahiere img-Tags
  if (issue.id === 'missing-alt-tags') {
    const imgMatches = content.match(/<img[^>]*>/gi)
    if (imgMatches) {
      return imgMatches.slice(0, 5).join('\n') // Erste 5 img-Tags
    }
  }

  // Fallback: Erste 1000 Zeichen
  return content.substring(0, 1000)
}

/**
 * Parst die GPT-Antwort und extrahiert Patch und Erklärung
 */
function parseGPTResponse(gptResponse: string): { patch: string; explanation: string } {
  try {
    // Versuche JSON zu extrahieren (könnte in Code-Blöcken sein)
    let jsonStr = gptResponse.trim()
    
    // Entferne Markdown-Code-Blöcke falls vorhanden
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Versuche JSON zu parsen
    const parsed = JSON.parse(jsonStr)
    
    if (typeof parsed.patch === 'string' && typeof parsed.explanation === 'string') {
      return {
        patch: parsed.patch.trim(),
        explanation: parsed.explanation.trim(),
      }
    }
    
    throw new Error('Ungültiges Format in GPT-Antwort')
  } catch (error) {
    // Fallback: Versuche manuell zu extrahieren
    console.warn('Konnte GPT-Antwort nicht parsen, verwende Fallback:', error)
    
    // Einfacher Fallback: Verwende gesamte Antwort als Patch
    return {
      patch: gptResponse.trim(),
      explanation: 'Automatisch generierter Fix',
    }
  }
}

