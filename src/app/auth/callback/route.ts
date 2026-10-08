import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ambil data user yang baru saja login
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Cek profil pengguna di database Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, phone')
          .eq('id', user.id)
          .maybeSingle()

        // Jika nomor telepon belum diisi, arahkan ke form pengisian profil
        const isProfileIncomplete = !profile?.phone
        if (isProfileIncomplete) {
          return NextResponse.redirect(`${origin}/complete-profile?next=${encodeURIComponent(next)}`)
        }
      }

      // Validasi anti open redirect: hanya izinkan path relatif
      const isRelative = next.startsWith('/') && !next.startsWith('//')
      const targetUrl = isRelative ? `${origin}${next}` : `${origin}/`
      return NextResponse.redirect(targetUrl)
    }
  }

  // Jika error atau code tidak valid, arahkan ke login dengan indikator error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

