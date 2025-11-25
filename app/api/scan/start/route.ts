import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log("API /api/scan/start called");

  try {
    // 1. Parse Request
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: parseError.message,
        stack: process.env.NODE_ENV === 'development' ? parseError.stack : undefined
      }, { status: 400 });
    }

    const { url } = body || {};

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json({ 
        error: 'URL is required',
        details: 'The request body must contain a valid "url" field'
      }, { status: 400 });
    }

    // 2. Get Backend URL
    const SCANNER_URL = process.env.SCANNER_API_URL;
    console.log("Target Scanner URL:", SCANNER_URL ? `${SCANNER_URL.substring(0, 20)}...` : 'NOT SET');

    if (!SCANNER_URL || SCANNER_URL.trim() === '') {
      console.error("Config Error: SCANNER_API_URL is not set");
      return NextResponse.json({ 
        error: 'Config Error: SCANNER_API_URL is not set',
        details: 'The scanner service URL is not configured. Please set SCANNER_API_URL environment variable on Vercel.',
        config: {
          hasEnvVar: !!process.env.SCANNER_API_URL,
          envVarLength: process.env.SCANNER_API_URL?.length || 0
        }
      }, { status: 500 });
    }

    // 3. Forward to Railway (Proxy)
    // Note: We do NOT save to database here anymore.
    let response;
    try {
      console.log(`[Proxy] Sending request to ${SCANNER_URL}/scan with URL: ${url}`);
      
      response = await fetch(`${SCANNER_URL}/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'SiteSweep-Proxy/1.0'
        },
        body: JSON.stringify({ url }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5 * 60 * 1000), // 5 minutes
      });
    } catch (fetchError: any) {
      console.error("Fetch Error (Connection Failed):", fetchError);
      return NextResponse.json({ 
        error: 'Connection Error',
        details: fetchError.message || 'Failed to connect to scanner service',
        type: fetchError.name || 'Unknown',
        stack: process.env.NODE_ENV === 'development' ? fetchError.stack : undefined,
        scannerUrl: SCANNER_URL,
        cause: fetchError.cause ? String(fetchError.cause) : undefined
      }, { status: 502 });
    }

    // 4. Handle non-200 responses
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = `Failed to read error response body: ${textError}`;
      }

      console.error(`Scanner Backend Error [${response.status}]:`, errorText);
      
      return NextResponse.json({ 
        error: 'Backend Error',
        status: response.status,
        statusText: response.statusText,
        details: errorText || 'No error details provided by backend',
        scannerUrl: SCANNER_URL,
        headers: {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        }
      }, { status: 502 });
    }

    // 5. Parse successful response
    let data;
    try {
      data = await response.json();
    } catch (jsonError: any) {
      console.error("JSON Parse Error (from backend):", jsonError);
      return NextResponse.json({ 
        error: 'Invalid Response',
        details: 'Backend returned non-JSON response',
        parseError: jsonError.message,
        stack: process.env.NODE_ENV === 'development' ? jsonError.stack : undefined
      }, { status: 502 });
    }

    console.log("Proxy Success: Returning data to client");
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Unexpected Proxy Error:", error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message || 'An unexpected error occurred',
      type: error.name || 'Unknown',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      cause: error.cause ? String(error.cause) : undefined
    }, { status: 500 });
  }
}
