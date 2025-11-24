import { db } from '@/lib/db'
import { validateUrl, normalizeUrl } from '@/lib/utils'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response'
import { randomUUID } from 'crypto'

type ManualScanEntry = {
  website: string
  name?: string
  city?: string
  category?: string
  whyWeak?: string
  [key: string]: any // Allow additional fields from Atlas JSON
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret') || request.headers.get('x-admin-secret')

    // 1. ADMIN-Check
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    // 2. Body einlesen
    let body: { entriesText?: string }
    try {
      body = await request.json()
    } catch (err) {
      return errorResponse('Invalid JSON in request body', 400, 'INVALID_JSON')
    }

    const { entriesText } = body

    if (!entriesText || typeof entriesText !== 'string') {
      return errorResponse('entriesText must be a JSON string', 400, 'MISSING_ENTRIES_TEXT')
    }

    // 3. JSON parsen
    let parsed: any[]
    try {
      parsed = JSON.parse(entriesText)
    } catch (err) {
      return errorResponse('Invalid JSON format in entriesText', 400, 'INVALID_JSON_FORMAT')
    }

    if (!Array.isArray(parsed)) {
      return errorResponse('entriesText must be a JSON array', 400, 'NOT_AN_ARRAY')
    }

    const totalEntries = parsed.length

    // 4. Nur Einträge mit website extrahieren
    const entriesWithWebsite: ManualScanEntry[] = []
    for (const item of parsed) {
      if (item && typeof item === 'object' && typeof item.website === 'string') {
        entriesWithWebsite.push({
          website: item.website,
          name: typeof item.name === 'string' ? item.name : undefined,
          city: typeof item.city === 'string' ? item.city : undefined,
          category: typeof item.category === 'string' ? item.category : undefined,
          whyWeak: typeof item.whyWeak === 'string' ? item.whyWeak : undefined,
        })
      }
    }

    if (entriesWithWebsite.length === 0) {
      return errorResponse('No entries with valid website field found', 400, 'NO_VALID_ENTRIES')
    }

    // 5. URL-Validierung und Normalisierung
    const validEntries: Array<{ url: string; name?: string }> = []

    for (const entry of entriesWithWebsite) {
      let urlToValidate = entry.website.trim()

      // Add https:// if no protocol
      if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
        urlToValidate = 'https://' + urlToValidate
      }

      if (validateUrl(urlToValidate)) {
        const normalizedUrl = normalizeUrl(urlToValidate)
        validEntries.push({
          url: normalizedUrl,
          name: entry.name,
        })
      }
    }

    if (validEntries.length === 0) {
      return errorResponse('No valid URLs found after validation', 400, 'NO_VALID_URLS')
    }

    // 6. batchId erzeugen
    const batchId = randomUUID()

    // 7. ScanJobs erstellen (mit Duplikat-Prüfung)
    let scanJobsCreated = 0

    for (const entry of validEntries) {
      // Prüfen, ob schon ein ScanJob mit exakt gleicher url UND batchId existiert
      const existing = await db.scanJob.findFirst({
        where: {
          url: entry.url,
          batchId: batchId,
        },
      })

      if (!existing) {
        await db.scanJob.create({
          data: {
            url: entry.url,
            status: 'pending',
            batchId: batchId,
            label: entry.name || null,
          },
        })
        scanJobsCreated++
      }
    }

    // 8. Response
    return successResponse({
      batchId,
      totalEntries,
      validWebsites: validEntries.length,
      scanJobsCreated,
    })
  } catch (error) {
    console.error('Error in manual mass scan:', error)
    return serverErrorResponse('Internal server error')
  }
}

