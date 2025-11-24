import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'

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

    // Validate allowed fields
    const allowedFields = ['industry', 'city', 'competitorName']
    const updateData: Record<string, any> = {}

    // Map fields: Lead uses 'category' instead of 'industry'
    if ('industry' in body) {
      updateData.category = body.industry === '' ? null : body.industry || null
    }

    if ('city' in body) {
      updateData.city = body.city === '' ? null : body.city || null
    }

    if ('competitorName' in body) {
      updateData.competitorName = body.competitorName === '' ? null : body.competitorName || null
    }

    // Check if lead exists
    const existingLead = await db.lead.findUnique({
      where: { id: leadId },
    })

    if (!existingLead) {
      return notFoundResponse('Lead not found')
    }

    // Update lead
    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: updateData,
    })

    return successResponse({
      lead: {
        id: updatedLead.id,
        category: updatedLead.category,
        city: updatedLead.city,
        competitorName: (updatedLead as any).competitorName || null,
      },
    })
  } catch (error) {
    console.error('Error updating lead metadata:', error)
    return serverErrorResponse('Failed to update lead metadata')
  }
}

