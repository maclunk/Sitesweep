import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // HTTPS Redirect (only in production)
  // Read x-forwarded-proto header (set by load balancers/proxies like Vercel, AWS ALB, etc.)
  // This header indicates the original protocol used by the client
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const protocol = forwardedProto || request.nextUrl.protocol
  
  // Check if request is HTTP (not HTTPS) in production
  // Skip redirect for localhost/dev environments
  if (isProduction && protocol === 'http:') {
    const hostname = request.nextUrl.hostname
    
    // Don't redirect localhost or 127.0.0.1 (dev environments)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      // Allow HTTP in local dev environments
      return NextResponse.next()
    }
    
    // Build HTTPS URL with same host and path
    const httpsUrl = new URL(request.url)
    httpsUrl.protocol = 'https:'
    
    // Redirect to HTTPS (301 permanent redirect for SEO)
    return NextResponse.redirect(httpsUrl, 301)
  }
  
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Set CORS headers
    const origin = request.headers.get('origin')
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}

