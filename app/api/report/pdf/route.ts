import { db } from '@/lib/db'
import { createPDF } from '@/lib/pdf'
import { CheckResult } from '@/lib/checks'
import { errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const secret = searchParams.get('secret')
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return errorResponse('id is required', 400, 'MISSING_ID')
    }

    // Secret-Check
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    // ScanResult + ScanJob laden
    const scanJob = await db.scanJob.findUnique({
      where: { id: id.trim() },
      include: { result: true },
    })

    if (!scanJob) {
      return notFoundResponse('Scan job not found')
    }

    if (!scanJob.result) {
      return notFoundResponse('Scan result not found for this job')
    }

    // createPDF(report)
    // Konvertiere JSON-Array zu CheckResult[]
    const issuesRaw = Array.isArray(scanJob.result.issues) 
      ? scanJob.result.issues 
      : []
    
    // Type guard: Filtere nur gültige CheckResult-Objekte
    const issues: CheckResult[] = issuesRaw
      .filter((issue: any): issue is CheckResult => {
        return (
          issue &&
          typeof issue === 'object' &&
          typeof issue.id === 'string' &&
          typeof issue.category === 'string' &&
          typeof issue.title === 'string' &&
          typeof issue.description === 'string' &&
          typeof issue.severity === 'string' &&
          Array.isArray(issue.pages)
        )
      })
      .map((issue: any) => ({
        id: issue.id,
        category: issue.category as CheckResult['category'],
        title: issue.title,
        description: issue.description,
        severity: issue.severity as CheckResult['severity'],
        pages: Array.isArray(issue.pages) ? issue.pages.map((p: any) => String(p)) : [],
      }))
    
    const report = {
      url: scanJob.url || '',
      score: scanJob.result.score || 0,
      summary: scanJob.result.summary || '',
      issues,
      createdAt: scanJob.createdAt,
      mobileScreenshotUrl: scanJob.result.mobileScreenshotUrl || null,
    }

    let pdfBuffer: Buffer
    try {
      pdfBuffer = await createPDF(report)
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError)
      return serverErrorResponse('Failed to generate PDF', {
        error: pdfError instanceof Error ? pdfError.message : 'Unknown PDF error',
      })
    }

    // PDF als application/pdf zurückgeben
    return new Response(pdfBuffer.buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sitesweep-report-${id}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return serverErrorResponse('Failed to generate PDF')
  }
}

