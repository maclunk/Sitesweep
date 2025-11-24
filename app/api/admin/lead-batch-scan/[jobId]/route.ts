import { db } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret') || request.headers.get('x-admin-secret')

    // Check admin secret
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    const jobId = params.jobId

    if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
      return errorResponse('jobId is required', 400, 'MISSING_JOB_ID')
    }

    // Find LeadSearchJob with leads and their scan jobs
    // Performance: Only load latest scanJob per lead, without issues (too large)
    const leadSearchJob = await db.leadSearchJob.findUnique({
      where: { id: jobId.trim() },
      select: {
        id: true,
        category: true,
        city: true,
        limit: true,
        status: true,
        error: true,
        createdAt: true,
        finishedAt: true,
        leads: {
          select: {
            id: true,
            name: true,
            website: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            category: true,
            source: true,
            sourceUrl: true,
            createdAt: true,
            scanJobs: {
              take: 1, // Only latest scanJob per lead
              orderBy: {
                createdAt: 'desc',
              },
              select: {
                id: true,
                url: true,
                status: true,
                createdAt: true,
                finishedAt: true,
                error: true,
                result: {
                  select: {
                    id: true,
                    score: true,
                    // summary: true, // Don't load for list view - too large
                    // issues: true, // Don't load for list view - too large
                    createdAt: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!leadSearchJob) {
      return notFoundResponse('LeadSearchJob not found')
    }

    // Transform leads to include the most recent scan job
    // Performance: Only use what was loaded (no issues)
    const leads = leadSearchJob.leads.map((lead: any) => ({
      id: lead.id,
      name: lead.name,
      website: lead.website || null,
      email: lead.email || null,
      phone: lead.phone || null,
      address: lead.address || null,
      city: lead.city || null,
      category: lead.category || null,
      source: lead.source || null,
      sourceUrl: lead.sourceUrl || null,
      createdAt: lead.createdAt.toISOString(),
      scanJob: lead.scanJobs && lead.scanJobs.length > 0
        ? {
            id: lead.scanJobs[0].id,
            url: lead.scanJobs[0].url,
            status: lead.scanJobs[0].status,
            createdAt: lead.scanJobs[0].createdAt.toISOString(),
            finishedAt: lead.scanJobs[0].finishedAt?.toISOString() || null,
            error: lead.scanJobs[0].error || null,
            result: lead.scanJobs[0].result
              ? {
                  id: lead.scanJobs[0].result.id,
                  score: lead.scanJobs[0].result.score,
                  // summary: lead.scanJobs[0].result.summary, // Not loaded for performance
                  // issues: [], // Not loaded for performance
                  createdAt: lead.scanJobs[0].result.createdAt.toISOString(),
                }
              : null,
          }
        : null,
    }))

    return successResponse({
      job: {
        id: leadSearchJob.id,
        category: leadSearchJob.category,
        city: leadSearchJob.city,
        limit: leadSearchJob.limit,
        status: leadSearchJob.status,
        error: leadSearchJob.error || null,
        createdAt: leadSearchJob.createdAt.toISOString(),
        finishedAt: leadSearchJob.finishedAt?.toISOString() || null,
      },
      leads,
    })
  } catch (error) {
    console.error('Error fetching lead batch scan job:', error)
    return serverErrorResponse('Failed to fetch lead batch scan job')
  }
}

