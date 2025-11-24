import { db } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(
  request: Request,
  { params }: { params: { batchId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret') || request.headers.get('x-admin-secret')

    // Check admin secret
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    const batchId = params.batchId

    if (!batchId || typeof batchId !== 'string' || batchId.trim() === '') {
      return errorResponse('batchId is required', 400, 'MISSING_BATCH_ID')
    }

    // Find all ScanJobs with this batchId, including their results
    // Performance: Only select needed fields, don't load issues (too large)
    const jobs = await db.scanJob.findMany({
      where: {
        batchId: batchId.trim(),
      },
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
            // summary: true, // Don't load summary for list view - too large
            // issues: true, // Don't load issues for list view - too large
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    if (jobs.length === 0) {
      return notFoundResponse('No jobs found for this batch ID')
    }

    // Normalize jobs data
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
            // summary: job.result.summary, // Not loaded for performance
            // issues: [], // Not loaded for performance
            createdAt: job.result.createdAt.toISOString(),
          }
        : null,
    }))

    return successResponse({
      batchId: batchId.trim(),
      jobs: normalizedJobs,
      total: normalizedJobs.length,
      done: normalizedJobs.filter(j => j.status === 'done').length,
      pending: normalizedJobs.filter(j => j.status === 'pending' || j.status === 'running').length,
      error: normalizedJobs.filter(j => j.status === 'error').length,
    })
  } catch (error) {
    console.error('Error fetching batch jobs:', error)
    return serverErrorResponse('Failed to fetch batch jobs')
  }
}

