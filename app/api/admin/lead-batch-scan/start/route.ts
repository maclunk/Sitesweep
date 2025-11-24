import { db } from '@/lib/db'
import { runLeadSearch } from '@/lib/leadFinder'
import { validateUrl, normalizeUrl } from '@/lib/utils'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret') || request.headers.get('x-admin-secret')

    // Check admin secret
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { category, city, limit } = body

    // Validate input
    if (!category || typeof category !== 'string' || category.trim() === '') {
      return errorResponse('category is required and must be a non-empty string', 400, 'MISSING_CATEGORY')
    }

    if (!city || typeof city !== 'string' || city.trim() === '') {
      return errorResponse('city is required and must be a non-empty string', 400, 'MISSING_CITY')
    }

    const limitValue = limit && typeof limit === 'number' && limit > 0 ? limit : 50

    // Create LeadSearchJob with status="running"
    const leadSearchJob = await db.leadSearchJob.create({
      data: {
        category: category.trim(),
        city: city.trim(),
        limit: limitValue,
        status: 'running',
      },
    })

    try {
      // Execute KMU-Finder
      const businessLeads = await runLeadSearch({
        category: category.trim(),
        city: city.trim(),
        limit: limitValue,
      })

      // Save Leads to database
      let leadsCreated = 0
      const createdLeads: Array<{ id: string; website: string | null }> = []

      for (const businessLead of businessLeads) {
        // Check for duplicate (same jobId + website)
        const existing = businessLead.website
          ? await db.lead.findFirst({
              where: {
                jobId: leadSearchJob.id,
                website: businessLead.website,
              },
            })
          : null

        if (!existing) {
          const lead = await db.lead.create({
            data: {
              jobId: leadSearchJob.id,
              name: businessLead.name,
              website: businessLead.website || null,
              email: businessLead.email || null,
              phone: businessLead.phone || null,
              address: businessLead.address || null,
              city: businessLead.city || null,
              category: businessLead.category || null,
              source: businessLead.source || null,
              sourceUrl: businessLead.sourceUrl || null,
            },
          })
          leadsCreated++
          createdLeads.push({ id: lead.id, website: lead.website })
        }
      }

      // Create ScanJobs for all leads with valid website URLs
      let scanJobsCreated = 0

      for (const lead of createdLeads) {
        if (!lead.website) continue

        // Validate and normalize URL
        let urlToValidate = lead.website
        if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
          urlToValidate = 'https://' + urlToValidate
        }

        if (!validateUrl(urlToValidate)) {
          continue
        }

        const normalizedUrl = normalizeUrl(urlToValidate)

        // Check if ScanJob already exists for this lead and URL
        const existingScanJob = await db.scanJob.findFirst({
          where: {
            leadId: lead.id,
            url: normalizedUrl,
          },
        })

        if (!existingScanJob) {
          await db.scanJob.create({
            data: {
              url: normalizedUrl,
              status: 'pending',
              leadId: lead.id,
            },
          })
          scanJobsCreated++
        }
      }

      // Update LeadSearchJob status to "done"
      await db.leadSearchJob.update({
        where: { id: leadSearchJob.id },
        data: {
          status: 'done',
          finishedAt: new Date(),
        },
      })

      return successResponse({
        leadSearchJobId: leadSearchJob.id,
        leadsCreated,
        scanJobsCreated,
        totalLeadsFound: businessLeads.length,
      })
    } catch (searchError) {
      // Update LeadSearchJob status to "error"
      const errorMessage = searchError instanceof Error ? searchError.message : 'Unknown error during lead search'
      await db.leadSearchJob.update({
        where: { id: leadSearchJob.id },
        data: {
          status: 'error',
          error: errorMessage,
          finishedAt: new Date(),
        },
      })

      console.error('Error in lead batch scan:', searchError)
      return errorResponse(`Lead search failed: ${errorMessage}`, 500, 'LEAD_SEARCH_ERROR')
    }
  } catch (error) {
    console.error('Error processing lead batch scan request:', error)
    return serverErrorResponse('Failed to process lead batch scan request')
  }
}

