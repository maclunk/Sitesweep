import { getBenchmark } from '@/lib/benchmark'
import { successResponse, errorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const city = searchParams.get('city')
    const isAdmin = searchParams.get('isAdmin') === 'true'

    if (!industry || !city) {
      return errorResponse('industry and city parameters are required', 400, 'MISSING_PARAMS')
    }

    const benchmark = await getBenchmark(industry, city, isAdmin)

    if (!benchmark) {
      return successResponse(null)
    }

    return successResponse({
      avgScore: benchmark.avgScore,
      sampleSize: benchmark.sampleSize,
    })
  } catch (error) {
    console.error('Error getting benchmark:', error)
    return errorResponse('Failed to get benchmark', 500, 'SERVER_ERROR')
  }
}

