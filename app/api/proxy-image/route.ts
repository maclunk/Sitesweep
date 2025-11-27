import { NextRequest, NextResponse } from 'next/server'

/**
 * Image Proxy Route
 * 
 * Proxiert Bilder von externen URLs, um CORS-Probleme beim Download zu umgehen.
 * Usage: /api/proxy-image?url=https://example.com/image.jpg
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')

  // Validate URL parameter
  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Missing "url" query parameter' },
      { status: 400 }
    )
  }

  // Validate URL format
  try {
    new URL(imageUrl)
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    )
  }

  try {
    // Fetch the image from the external URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(imageUrl).origin, // Some sites require referrer
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer()
    
    // Get Content-Type from response or default to jpeg
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('Image proxy error:', error)
    
    // Handle timeout
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - image took too long to download' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch image' },
      { status: 500 }
    )
  }
}

