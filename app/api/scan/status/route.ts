import { db } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { selectLowHangingFruit } from '@/lib/low-hanging-fruit'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return errorResponse('id is required', 400, 'MISSING_ID')
    }
    
    // Find ScanJob with result relation
    const scanJob = await db.scanJob.findUnique({
      where: { id: id.trim() },
      include: { result: true },
    })
    
    // ID not found
    if (!scanJob) {
      return notFoundResponse('ScanJob not found')
    }
    
    // Handle different statuses
    if (scanJob.status === 'pending' || scanJob.status === 'running') {
      return successResponse({ status: scanJob.status })
    }
    
    if (scanJob.status === 'done') {
      if (!scanJob.result) {
        return serverErrorResponse('ScanResult not found for completed job', {
          jobId: scanJob.id,
          status: scanJob.status,
        })
      }
      
      // Ensure issues is an array
      const issues = Array.isArray(scanJob.result.issues) 
        ? (scanJob.result.issues as any[])
        : []
      
      // Compute low hanging fruit from issues
      const lowHangingFruit = selectLowHangingFruit(issues as any)
      
      return successResponse({
        status: scanJob.status,
        score: scanJob.result.score || 0,
        summary: scanJob.result.summary || '',
        issues,
        mobileScreenshotUrl: scanJob.result.mobileScreenshotUrl || null,
        industry: scanJob.industry || null,
        city: scanJob.city || null,
        competitorName: (scanJob as any).competitorName || null,
        lowHangingFruit: lowHangingFruit || null,
        url: scanJob.url || null,
      })
    }
    
    if (scanJob.status === 'error') {
      return successResponse({
        status: scanJob.status,
        error: scanJob.error || 'Unknown error',
      })
    }
    
    // Fallback for unknown status
    return successResponse({ status: scanJob.status || 'unknown' })
  } catch (error) {
    console.error('Error getting scan status:', error)
    return serverErrorResponse('Failed to get status')
  }
}

