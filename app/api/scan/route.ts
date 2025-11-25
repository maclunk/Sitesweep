import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log("API /api/scan called");

  try {
    // 1. Parse Request
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 2. Get Backend URL
    const SCANNER_URL = process.env.SCANNER_API_URL;
    console.log("Target Scanner URL:", SCANNER_URL);

    if (!SCANNER_URL) {
      return NextResponse.json({ 
        error: 'Configuration Error: SCANNER_API_URL is missing on Vercel.' 
      }, { status: 500 });
    }

    // 3. Forward to Railway (Proxy)
    // Note: We do NOT save to database here anymore.
    const response = await fetch(`${SCANNER_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Scanner Backend Error:", errorText);
      throw new Error(`Scanner Backend failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}

