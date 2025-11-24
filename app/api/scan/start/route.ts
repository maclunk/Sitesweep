import { db } from '@/lib/db'
import { validateUrl, normalizeUrl } from '@/lib/utils'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'
import { selectLowHangingFruit } from '@/lib/low-hanging-fruit'

// Interface for the external scanner API response
interface ScannerApiResponse {
  success: boolean
  data?: {
    score: number
    summary: string
    issues: any[]
    mobileScreenshotUrl?: string | null
    scoreBreakdown?: any
    scoreRaw?: number
  }
  error?: string
}

/**
 * Returns mock data for testing when SCANNER_API_URL is not configured
 */
function getMockScanData(normalizedUrl: string) {
  return {
    score: 75,
    summary: 'Mock scan result - SCANNER_API_URL not configured. This is test data for UI development.',
    issues: [
      {
        id: 'mock-ssl-check',
        category: 'technical',
        title: 'SSL Certificate Check (Mock)',
        description: 'This is a mock issue for testing purposes.',
        severity: 'high',
        pages: [normalizedUrl],
      },
    ],
    mobileScreenshotUrl: null,
    scoreBreakdown: {
      technical: 80,
      seo: 70,
      legal: 75,
      ux: 75,
    },
    scoreRaw: 75,
  }
}

export async function POST(request: Request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON in request body', 400, 'INVALID_JSON')
    }

    const { url, industry, city, postalCode, companyName } = body || {}

    // Check if url is provided
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return errorResponse('URL is required', 400, 'MISSING_URL')
    }

    // Validate URL
    if (!validateUrl(url)) {
      return errorResponse('Invalid URL. Please provide a valid http or https URL.', 400, 'INVALID_URL')
    }

    // Normalize URL
    let normalizedUrl: string
    try {
      normalizedUrl = normalizeUrl(url)
    } catch (error) {
      return errorResponse('Failed to normalize URL', 400, 'URL_NORMALIZATION_ERROR')
    }

    // Check if SCANNER_API_URL is configured
    const scannerApiUrl = process.env.SCANNER_API_URL

    if (!scannerApiUrl) {
      // Fallback: Return mock data for testing (or create a job for local worker)
      // For Vercel deployment without scanner API, we'll use mock data
      console.warn('[Scan API] SCANNER_API_URL not configured. Using mock data for testing.')

      // Create a ScanJob with mock result
      try {
        const scanJob = await db.scanJob.create({
          data: {
            url: normalizedUrl,
            status: 'done',
            createdAt: new Date(),
            finishedAt: new Date(),
            industry: industry || null,
            city: city || null,
            postalCode: postalCode || null,
            companyName: companyName || null,
            result: {
              create: {
                score: 75,
                summary: 'Mock scan result - SCANNER_API_URL not configured',
                issues: getMockScanData(normalizedUrl).issues as any,
                scoreBreakdown: getMockScanData(normalizedUrl).scoreBreakdown as any,
                scoreRaw: 75,
                mobileScreenshotUrl: null,
              },
            },
          },
          include: {
            result: true,
          },
        })

        const issues = Array.isArray(scanJob.result?.issues) ? (scanJob.result.issues as any[]) : []
        const lowHangingFruit = selectLowHangingFruit(issues as any)

        return successResponse({
          jobId: scanJob.id,
          status: 'done',
          score: scanJob.result?.score || 0,
          summary: scanJob.result?.summary || '',
          issues,
          mobileScreenshotUrl: scanJob.result?.mobileScreenshotUrl || null,
          industry: scanJob.industry || null,
          city: scanJob.city || null,
          lowHangingFruit: lowHangingFruit || null,
          url: scanJob.url || null,
        })
      } catch (dbError: any) {
        console.error('Database error creating mock scan:', dbError)
        if (dbError.code === 'P2002') {
          return errorResponse('A scan for this URL is already in progress', 409, 'DUPLICATE_SCAN')
        }
        throw dbError
      }
    }

    // SCANNER_API_URL is configured - proxy to external scanner service
    let scanJob: { id: string; industry: string | null; city: string | null; url: string } | null = null
    
    try {
      // Create ScanJob with status "running" first
      scanJob = await db.scanJob.create({
        data: {
          url: normalizedUrl,
          status: 'running',
          createdAt: new Date(),
          industry: industry || null,
          city: city || null,
          postalCode: postalCode || null,
          companyName: companyName || null,
        },
      })

      // Call external scanner API
      const scannerResponse = await fetch(scannerApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          jobId: scanJob.id,
        }),
        // Set a reasonable timeout (5 minutes for scanning)
        signal: AbortSignal.timeout(5 * 60 * 1000),
      })

      if (!scannerResponse.ok) {
        const errorText = await scannerResponse.text()
        throw new Error(`Scanner API returned ${scannerResponse.status}: ${errorText}`)
      }

      const scannerData: ScannerApiResponse = await scannerResponse.json()

      if (!scannerData.success || !scannerData.data) {
        throw new Error(scannerData.error || 'Scanner API returned unsuccessful response')
      }

      const { score, summary, issues, mobileScreenshotUrl, scoreBreakdown, scoreRaw } = scannerData.data

      // Store result in database
      const scanResult = await db.scanResult.create({
        data: {
          scanJobId: scanJob.id,
          score: score || 0,
          summary: summary || '',
          issues: Array.isArray(issues) ? (issues as any) : [],
          scoreBreakdown: scoreBreakdown ? (scoreBreakdown as any) : null,
          scoreRaw: scoreRaw || null,
          mobileScreenshotUrl: mobileScreenshotUrl || null,
        },
      })

      // Update job status to "done"
      await db.scanJob.update({
        where: { id: scanJob.id },
        data: {
          status: 'done',
          finishedAt: new Date(),
        },
      })

      // Compute low hanging fruit
      const issuesArray = Array.isArray(issues) ? (issues as any[]) : []
      const lowHangingFruit = selectLowHangingFruit(issuesArray as any)

      return successResponse({
        jobId: scanJob.id,
        status: 'done',
        score: scanResult.score,
        summary: scanResult.summary,
        issues: issuesArray,
        mobileScreenshotUrl: scanResult.mobileScreenshotUrl,
        industry: scanJob.industry || null,
        city: scanJob.city || null,
        lowHangingFruit: lowHangingFruit || null,
        url: scanJob.url || null,
      })
    } catch (scannerError) {
      console.error('Error calling scanner API:', scannerError)

      // Update job status to "error" if job was created
      if (scanJob) {
        try {
          const errorMessage = scannerError instanceof Error ? scannerError.message : String(scannerError)
          const truncatedError = errorMessage.length > 500 ? errorMessage.substring(0, 500) + '...' : errorMessage

          await db.scanJob.update({
            where: { id: scanJob.id },
            data: {
              status: 'error',
              error: truncatedError,
              finishedAt: new Date(),
            },
          })
        } catch (updateError) {
          console.error('Failed to update error status:', updateError)
        }
      }

      return errorResponse(
        `Scanner API error: ${scannerError instanceof Error ? scannerError.message : String(scannerError)}`,
        502,
        'SCANNER_API_ERROR'
      )
    }
  } catch (error) {
    console.error('Error starting scan:', error)
    return serverErrorResponse('Failed to start scan')
  }
}

