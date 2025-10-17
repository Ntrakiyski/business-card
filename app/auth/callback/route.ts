import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/my-card'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }
      
      // Successfully authenticated, redirect to next page or default to my-card
      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error('Unexpected error during OAuth callback:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`)
    }
  }

  // If no code parameter, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}