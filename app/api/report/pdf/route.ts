import { errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const secret = searchParams.get('secret')
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return errorResponse('id is required', 400, 'MISSING_ID')
    }

    // Secret-Check
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    // PDF generation temporarily disabled on Vercel (puppeteer removed)
    return new Response(
      JSON.stringify({ 
        error: 'PDF Generation temporarily disabled',
        message: 'PDF generation requires puppeteer which is not available in serverless environment. Please use the external scanner service for full functionality.'
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error in PDF route:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
