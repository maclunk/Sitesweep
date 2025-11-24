import { db } from '@/lib/db'
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Check admin secret
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    // Fetch last 20 scan jobs with results (optimiert - keine Issues für Übersicht)
    const jobs = await db.scanJob.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        status: true,
        createdAt: true,
        finishedAt: true,
        error: true,
        batchId: true,
        label: true,
        result: {
          select: {
            id: true,
            score: true,
            summary: true,
            // Issues NICHT laden - zu groß für Übersicht
            mobileScreenshotUrl: true,
            createdAt: true,
          },
        },
      },
    })

    // Normalize jobs data - Issues nicht inkludieren für Übersicht
    const normalizedJobs = jobs.map((job) => ({
      id: job.id,
      url: job.url,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      finishedAt: job.finishedAt?.toISOString() || null,
      error: job.error || null,
      batchId: job.batchId || null,
      label: job.label || null,
      result: job.result
        ? {
            id: job.result.id,
            score: job.result.score,
            summary: job.result.summary,
            // Issues werden in Detailansicht geladen
            issues: [],
            mobileScreenshotUrl: job.result.mobileScreenshotUrl || null,
            createdAt: job.result.createdAt.toISOString(),
          }
        : null,
    }))

    return successResponse({ jobs: normalizedJobs })
  } catch (error) {
    console.error('Error fetching admin jobs:', error)
    return serverErrorResponse('Failed to fetch jobs')
  }
}

