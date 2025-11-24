import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getDashboardKPIs, getQueueStatus, getRecentScans } from '@/lib/admin/queries'
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Check admin secret
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    // Parallel alle Dashboard-Daten laden
    const [kpis, queueStatus, recentScans] = await Promise.all([
      getDashboardKPIs(),
      getQueueStatus(),
      getRecentScans(20),
    ])

    return successResponse({
      kpis,
      queueStatus,
      recentScans: recentScans.map((scan) => ({
        id: scan.id,
        url: scan.url,
        label: scan.label,
        status: scan.status,
        createdAt: scan.createdAt.toISOString(),
        finishedAt: scan.finishedAt?.toISOString() || null,
        score: scan.score,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    return serverErrorResponse('Failed to fetch dashboard data')
  }
}

