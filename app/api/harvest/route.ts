import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Forward request to Scanner Service
    const scannerApiUrl = process.env.SCANNER_API_URL || 'http://localhost:8080'
    
    const response = await fetch(`${scannerApiUrl}/harvest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error')
      console.error('[Harvest API] Scanner service error:', errorData)
      return NextResponse.json(
        { 
          success: false, 
          error: `Scanner service error: ${response.statusText}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[Harvest API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

