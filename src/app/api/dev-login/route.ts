import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const email = searchParams.get('email') || 'user@krafita.com'
  const password = searchParams.get('password') || 'Password123!'
  const next = searchParams.get('next') || '/'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return NextResponse.redirect(`${origin}${safeNext}`)
}

