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
    const { notes } = body

    if (typeof notes !== 'string') {
      return serverErrorResponse('Invalid notes format')
    }

    // Update lead notes
    const lead = await (db as any).lead.update({
      where: { id: leadId },
      data: {
        notes: notes || null,
        lastActivityAt: new Date(),
      },
    })

    return successResponse({ lead })
  } catch (error) {
    console.error('Error updating lead notes:', error)
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return notFoundResponse('Lead not found')
    }
    return serverErrorResponse('Failed to update lead notes')
  }
}

