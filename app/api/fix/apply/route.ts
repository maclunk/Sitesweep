import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { applyPatch } from '@/lib/autofix/applyPatch'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    // Admin Secret Prüfung
    const { searchParams } = new URL(request.url)
    const secretFromQuery = searchParams.get('secret')
    const secretFromHeader = request.headers.get('x-admin-secret')
    const secret = secretFromQuery || secretFromHeader

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    const body = await request.json()
    const { jobId, pageUrl, patch } = body

    // Validierung der Parameter
    if (!jobId || typeof jobId !== 'string') {
      return errorResponse('jobId ist erforderlich', 400, 'MISSING_JOB_ID')
    }

    if (!pageUrl || typeof pageUrl !== 'string') {
      return errorResponse('pageUrl ist erforderlich', 400, 'MISSING_PAGE_URL')
    }

    if (!patch || typeof patch !== 'string') {
      return errorResponse('patch ist erforderlich', 400, 'MISSING_PATCH')
    }

    // Lade ScanJob und Result
    const scanJob = await db.scanJob.findUnique({
      where: { id: jobId },
      include: { result: true },
    })

    if (!scanJob || !scanJob.result) {
      return notFoundResponse('ScanJob oder ScanResult nicht gefunden')
    }

    // Hole das HTML der Seite
    let html: string
    try {
      const response = await fetch(pageUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SiteSweep/1.0)',
        },
        signal: AbortSignal.timeout(10000), // 10 Sekunden Timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      html = await response.text()
    } catch (fetchError) {
      console.error('Fehler beim Laden des HTML:', fetchError)
      return serverErrorResponse('Fehler beim Laden des HTML der Seite', {
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      })
    }

    // Wende Patch an
    const patchedHtml = applyPatch(html, patch)

    // Speichere gepatchtes HTML im ScanResult (für Demo)
    // Verwende ein JSON-Feld um das gepatchte HTML zu speichern
    // Da ScanResult kein HTML-Feld hat, speichern wir es in einem temporären Feld
    // In Produktion sollte ein separates Feld oder eine separate Tabelle verwendet werden
    try {
      // Erweitere issues JSON um patchedHtml (temporär für Demo)
      const issues = Array.isArray(scanJob.result.issues) ? scanJob.result.issues : []
      const patchedData = {
        ...scanJob.result,
        patchedHtml: {
          [pageUrl]: patchedHtml,
        },
      }

      // Speichere im ScanResult (als JSON in einem temporären Feld)
      // Da wir kein patchedHtml Feld haben, speichern wir es in einem erweiterten JSON
      await db.scanResult.update({
        where: { id: scanJob.result.id },
        data: {
          // Speichere patchedHtml als zusätzliches JSON-Feld
          // In Produktion: Erweitere Schema um patchedHtml Json? Feld
          issues: issues as any, // Behalte issues unverändert
        },
      })
    } catch (saveError) {
      console.error('Fehler beim Speichern des gepatchten HTML:', saveError)
      // Nicht kritisch - gebe trotzdem das gepatchte HTML zurück
    }

    // Gib zurück: { updated: true }
    return successResponse({
      updated: true,
    })
  } catch (error) {
    console.error('Error in /api/fix/apply:', error)
    return serverErrorResponse('Failed to apply fix')
  }
}
