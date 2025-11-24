import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function POST(
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
    const body = await request.json()
    const { note } = body

    if (typeof note !== 'string') {
      return serverErrorResponse('Invalid note format')
    }

    // Find ScanJob and its result
    const job = await db.scanJob.findUnique({
      where: { id: jobId },
      include: { result: true },
    })

    if (!job) {
      return notFoundResponse('ScanJob not found')
    }

    // Update or create ScanResult with adminNote
    if (job.result) {
      await db.scanResult.update({
        where: { id: job.result.id },
        data: { adminNote: note || null },
      })
    } else {
      // If no result exists yet, we can't save a note
      return serverErrorResponse('Cannot save note: Scan result not available yet')
    }

    return successResponse({ success: true })
  } catch (error) {
    console.error('Error saving admin note:', error)
    return serverErrorResponse('Failed to save note')
  }
}

