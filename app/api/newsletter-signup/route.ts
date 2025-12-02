import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, city, industry, consent } = body

    // Validate required fields
    if (!email || !consent) {
      return NextResponse.json(
        { error: 'E-Mail und Zustimmung sind erforderlich.' },
        { status: 400 }
      )
    }

    // Log for now - later connect to database or email service
    console.log('=== NEW DOMAIN RADAR SIGNUP ===')
    console.log('Name:', name)
    console.log('Email:', email)
    console.log('City:', city)
    console.log('Industry:', industry)
    console.log('Consent:', consent)
    console.log('Timestamp:', new Date().toISOString())
    console.log('===============================')

    // TODO: Save to database
    // TODO: Send double opt-in email via SendGrid/Resend
    // TODO: Add to CRM / Email list

    return NextResponse.json({ 
      success: true, 
      message: 'Erfolgreich angemeldet. Bitte E-Mail bestätigen.' 
    })

  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}

