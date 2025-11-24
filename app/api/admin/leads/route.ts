import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
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

    // Get filter parameters
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : null
    const maxScore = searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!) : null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause for DB filtering (much faster than JS filtering)
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (category) {
      where.category = category
    }
    
    // Note: Search filtering is done in JS after DB query for case-insensitivity
    // SQLite doesn't support mode: 'insensitive' in Prisma
    // We apply other filters (status, category) in DB first, then filter by search in JS

    // Fetch leads with pagination and DB filtering
    // Performance: Only fetch latest scanJob per lead, not all scanJobs
    const [leads, totalCount] = await Promise.all([
      (db as any).lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
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
          status: true,
          notes: true,
          lastActivityAt: true,
          createdAt: true,
          updatedAt: true,
          // Only fetch latest scanJob for score calculation
          scanJobs: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              createdAt: true,
              result: {
                select: {
                  score: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      }),
      (db as any).lead.count({ where }),
    ])

    // Process leads: calculate score from latest scanJob
    // Performance: Only use latest scanJob (already fetched above)
    let processedLeads = leads.map((lead: any) => {
      // Use score from latest scanJob
      const latestScanJob = lead.scanJobs && lead.scanJobs.length > 0 ? lead.scanJobs[0] : null
      const worstScore = latestScanJob?.result?.score ?? null
      const latestScanDate = latestScanJob?.createdAt ?? null

      return {
        id: lead.id,
        name: lead.name,
        website: lead.website,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        city: lead.city,
        category: lead.category,
        source: lead.source,
        sourceUrl: lead.sourceUrl,
        status: lead.status,
        notes: lead.notes,
        lastActivityAt: lead.lastActivityAt?.toISOString() || null,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
        worstScore,
        latestScanDate: latestScanDate?.toISOString() || null,
        latestScanJobId: latestScanJob?.id || null,
      }
    })

    // Apply case-insensitive search filter (SQLite doesn't support mode: 'insensitive')
    // Performance: Filter after DB query, but list is limited by pagination
    if (search) {
      const searchLower = search.toLowerCase()
      processedLeads = processedLeads.filter((lead: any) =>
        lead.name.toLowerCase().includes(searchLower) ||
        (lead.website && lead.website.toLowerCase().includes(searchLower)) ||
        (lead.city && lead.city.toLowerCase().includes(searchLower)) ||
        (lead.category && lead.category.toLowerCase().includes(searchLower))
      )
    }

    // Apply score filters (can't be done in DB easily, but list is now limited by pagination)
    if (minScore !== null || maxScore !== null) {
      processedLeads = processedLeads.filter((lead: any) => {
        if (lead.worstScore === null) return false
        if (minScore !== null && lead.worstScore < minScore) return false
        if (maxScore !== null && lead.worstScore > maxScore) return false
        return true
      })
    }

    // Sort by worst score (lowest first) by default
    processedLeads.sort((a: any, b: any) => {
      if (a.worstScore === null && b.worstScore === null) return 0
      if (a.worstScore === null) return 1
      if (b.worstScore === null) return -1
      return a.worstScore - b.worstScore
    })

    // Get unique categories for filter dropdown
    // Performance: Use raw SQL for distinct categories (faster than groupBy/findMany)
    // SQLite doesn't support Prisma groupBy, so use findMany with distinct
    const categoryRecords = await (db as any).lead.findMany({
      select: { category: true },
      distinct: ['category'],
      where: {
        category: { not: null },
      },
      // Limit to prevent huge lists (if you have thousands of categories, adjust)
      take: 100,
    })
    
    const categories = categoryRecords
      .map((item: any) => item.category)
      .filter((c: any) => !!c && typeof c === 'string')
      .sort() as string[]

    return successResponse({
      leads: processedLeads,
      categories,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return serverErrorResponse('Failed to fetch leads')
  }
}


