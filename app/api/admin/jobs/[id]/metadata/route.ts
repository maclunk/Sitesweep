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

    const jobId = params.id
    const body = await request.json()

    // Validate allowed fields
    const allowedFields = ['industry', 'city', 'postalCode', 'companyName', 'competitorName']
    const updateData: Record<string, any> = {}

    for (const field of allowedFields) {
      if (field in body) {
        // Allow empty string to clear the field, or set value
        updateData[field] = body[field] === '' ? null : body[field] || null
      }
    }

    // Check if job exists
    const existingJob = await db.scanJob.findUnique({
      where: { id: jobId },
    })

    if (!existingJob) {
      return notFoundResponse('ScanJob not found')
    }

    // Update job
    const updatedJob = await db.scanJob.update({
      where: { id: jobId },
      data: updateData,
    })

    // If industry or city changed and we have a result, update benchmark aggregate
    if ((updateData.industry || updateData.city) && existingJob.status === 'done') {
      const scanResult = await db.scanResult.findUnique({
        where: { scanJobId: jobId },
      })
      
      if (scanResult) {
        const finalIndustry = updateData.industry !== undefined ? updateData.industry : existingJob.industry
        const finalCity = updateData.city !== undefined ? updateData.city : existingJob.city
        
        if (finalIndustry && finalCity) {
          // Import and update benchmark asynchronously (don't block response)
          import('@/lib/benchmark').then(({ updateBenchmarkAggregate }) => {
            updateBenchmarkAggregate(finalIndustry, finalCity, scanResult.score).catch((err) => {
              console.error('Error updating benchmark after metadata update:', err)
            })
          })
        }
      }
    }

    return successResponse({
      job: {
        id: updatedJob.id,
        industry: updatedJob.industry,
        city: updatedJob.city,
        postalCode: (updatedJob as any).postalCode || null,
        companyName: (updatedJob as any).companyName || null,
        competitorName: (updatedJob as any).competitorName || null,
      },
    })
  } catch (error) {
    console.error('Error updating job metadata:', error)
    return serverErrorResponse('Failed to update job metadata')
  }
}

