import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function PATCH(
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

    const leadId = params.id
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['NEW', 'CONTACTED', 'BOOKED', 'CLOSED']
    if (!status || !validStatuses.includes(status)) {
      return serverErrorResponse('Invalid status. Must be one of: NEW, CONTACTED, BOOKED, CLOSED')
    }

    // Update lead status
    const lead = await (db as any).lead.update({
      where: { id: leadId },
      data: {
        status,
        lastActivityAt: new Date(),
      },
    })

    return successResponse({ lead })
  } catch (error) {
    console.error('Error updating lead status:', error)
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return notFoundResponse('Lead not found')
    }
    return serverErrorResponse('Failed to update lead status')
  }
}

