import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { autofixByIssueId } from '@/lib/autofix/issues'
import { Issue } from '@/lib/autofix/suggestFix'
import { CheckResult } from '@/lib/checks'
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
    const { jobId, issueId } = body

    // 1. Validierung der Parameter
    if (!jobId || typeof jobId !== 'string') {
      return errorResponse('jobId ist erforderlich', 400, 'MISSING_JOB_ID')
    }

    if (!issueId || typeof issueId !== 'string') {
      return errorResponse('issueId ist erforderlich', 400, 'MISSING_ISSUE_ID')
    }

    // 2. Finde ScanResult zu jobId
    const scanJob = await db.scanJob.findUnique({
      where: { id: jobId },
      include: { result: true },
    })

    if (!scanJob || !scanJob.result) {
      return notFoundResponse('ScanJob oder ScanResult nicht gefunden')
    }

    // 3. Finde das Issue in den Ergebnissen
    const issues = Array.isArray(scanJob.result.issues) ? scanJob.result.issues : []
    const issueRaw = issues.find((i: any) => i && typeof i === 'object' && 'id' in i && i.id === issueId)

    if (!issueRaw || typeof issueRaw !== 'object') {
      return notFoundResponse('Issue nicht gefunden')
    }

    // Type guard: Stelle sicher, dass issue die notwendigen Felder hat
    const issue = issueRaw as Partial<CheckResult>
    if (!issue.id || typeof issue.id !== 'string') {
      return notFoundResponse('Issue hat keine gültige ID')
    }

    // 4. Prüfe: issueId existiert im autofixByIssueId
    if (!(issueId in autofixByIssueId)) {
      return errorResponse('AutoFix für dieses Issue ist nicht verfügbar', 409, 'AUTOFIX_NOT_AVAILABLE')
    }

    // 5. Hole das HTML der Startseite
    let html: string
    try {
      const response = await fetch(scanJob.url, {
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
      return serverErrorResponse('Fehler beim Laden des HTML der Startseite', {
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      })
    }

    // 6. Erstelle Issue-Objekt für AutoFix
    const issueForFix: Issue = {
      id: issue.id,
      title: issue.title || '',
      description: issue.description || '',
      severity: issue.severity || 'medium',
      category: issue.category || '',
      pages: Array.isArray(issue.pages) ? issue.pages : [],
    }

    // 7. Rufe autofixByIssueId[issueId](html, issue) auf
    try {
      const autofixFunction = autofixByIssueId[issueId]
      const result = await autofixFunction(html, issueForFix)

      // 8. Return {patch, explanation}
      return successResponse({
        patch: result.patch,
        explanation: result.explanation,
      })
    } catch (fixError) {
      console.error('Fehler beim Generieren des Fix-Vorschlags:', fixError)
      return serverErrorResponse('Fehler beim Generieren des Fix-Vorschlags', {
        error: fixError instanceof Error ? fixError.message : 'Unknown error',
      })
    }
  } catch (error) {
    console.error('Error in /api/fix/suggest:', error)
    return serverErrorResponse('Failed to suggest fix')
  }
}
