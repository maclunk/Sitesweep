import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { selectLowHangingFruit } from '@/lib/low-hanging-fruit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Check admin secret
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    const jobId = params.id

    // Performance: Nur benötigte Felder laden (keine großen Crawl-Daten)
    const job = await db.scanJob.findUnique({
      where: { id: jobId },
      include: {
        result: true,
      },
    })

    if (!job) {
      return notFoundResponse('ScanJob not found')
    }

    // Compute low hanging fruit if result exists
    const issues = job.result && Array.isArray(job.result.issues) ? (job.result.issues as any[]) : []
    const lowHangingFruit = job.result ? selectLowHangingFruit(issues as any) : null
    
    // Normalize job data
    const normalizedJob = {
      id: job.id,
      url: job.url,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      finishedAt: job.finishedAt?.toISOString() || null,
      error: job.error || null,
      batchId: (job as any).batchId || null,
      label: (job as any).label || null,
      industry: (job as any).industry || null,
      city: (job as any).city || null,
      postalCode: (job as any).postalCode || null,
      companyName: (job as any).companyName || null,
      competitorName: (job as any).competitorName || null,
      lowHangingFruit: lowHangingFruit || null, // Add for admin debugging
      result: job.result
        ? {
            id: job.result.id,
            score: job.result.score,
            scoreRaw: (job.result as any).scoreRaw || null,
            summary: job.result.summary,
            issues: Array.isArray(job.result.issues) ? job.result.issues : [],
            scoreBreakdown: (job.result as any).scoreBreakdown || null,
            mobileScreenshotUrl: job.result.mobileScreenshotUrl || null,
            adminNote: (job.result as any).adminNote || null,
            createdAt: job.result.createdAt.toISOString(),
          }
        : null,
    }

    return successResponse({ job: normalizedJob })
  } catch (error) {
    console.error('Error fetching admin job:', error)
    return serverErrorResponse('Failed to fetch job')
  }
}

