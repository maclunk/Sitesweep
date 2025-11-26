import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ==========================================
  // 1. ADMIN ROUTE PROTECTION (Basic Auth)
  // ==========================================
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    
    // Check if Basic Auth header exists
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      })
    }

    // Decode and validate credentials
    try {
      const base64Credentials = authHeader.split(' ')[1]
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
      const [username, password] = credentials.split(':')

      const validUsername = process.env.ADMIN_USER
      const validPassword = process.env.ADMIN_PASSWORD

      // Check if env variables are set
      if (!validUsername || !validPassword) {
        console.error('[Middleware] ADMIN_USER or ADMIN_PASSWORD not set in environment variables')
        return new NextResponse('Server configuration error', { status: 500 })
      }

      // Validate credentials
      if (username !== validUsername || password !== validPassword) {
        return new NextResponse('Invalid credentials', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
          },
        })
      }

      // Credentials valid - continue to admin area
    } catch (error) {
      console.error('[Middleware] Error parsing Basic Auth:', error)
      return new NextResponse('Invalid authorization format', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      })
    }
  }

  // ==========================================
  // 2. HTTPS REDIRECT (Production Only)
  // ==========================================
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

