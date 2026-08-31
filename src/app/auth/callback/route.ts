import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Use the production URL if available, otherwise fall back to request origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.NEXT_PUBLIC_VERCEL_URL ? 
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 
    new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth?error=confirmation_failed`)
}