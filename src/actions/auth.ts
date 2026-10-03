'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOtpEmail } from '@/lib/mail'
import {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validators'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'

  const validated = loginSchema.safeParse({ email, password })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Input tidak valid' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  redirect(safeNext)
}

export async function signUpWithOtp(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const next = (formData.get('next') as string) || '/'

  const validated = registerSchema.safeParse({ name, email, password, confirmPassword })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Input tidak valid' }
  }

  const adminClient = createAdminClient()

  // Daftarkan akun pengguna baru ke Supabase Auth
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: name, name },
    email_confirm: false,
  })

  if (createError) {
    // Tangani jika email sudah terdaftar
    if (createError.message.toLowerCase().includes('already') || createError.status === 422) {
      return { success: false, error: 'Email ini sudah terdaftar. Silakan langsung login.' }
    }
    return { success: false, error: createError.message }
  }

  // Buat kode OTP 6 digit
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 menit

  // Hapus OTP lama untuk email ini jika ada
  await adminClient.from('otp_codes').delete().eq('email', email).eq('type', 'signup')

  // Simpan OTP ke tabel otp_codes
  const { error: otpInsertError } = await adminClient.from('otp_codes').insert({
    email,
    code,
    type: 'signup',
    expires_at: expiresAt,
  })

  if (otpInsertError) {
    console.error('[OTP Insert Error]', otpInsertError)
    return { success: false, error: 'Gagal membuat kode verifikasi' }
  }

  // Kirim email OTP via Nodemailer
  const mailResult = await sendOtpEmail(email, code)
  if (!mailResult.success) {
    console.warn('[Mail Warning]', mailResult.error)
  }

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return {
    success: true,
    email,
    redirectUrl: `/verify-otp?email=${encodeURIComponent(email)}&next=${encodeURIComponent(safeNext)}`,
  }
}

export async function verifyOtpAction(email: string, code: string, nextPath = '/') {
  const validated = verifyOtpSchema.safeParse({ email, code })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Kode OTP tidak valid' }
  }

  const adminClient = createAdminClient()

  // Cari kode OTP aktif di database
  const { data: otpRecord, error: otpFetchError } = await adminClient
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('type', 'signup')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (otpFetchError || !otpRecord) {
    return { success: false, error: 'Kode OTP salah atau telah kedaluwarsa' }
  }

  // Hapus kode OTP yang telah digunakan
  await adminClient.from('otp_codes').delete().eq('id', otpRecord.id)

  // Konfirmasi email user via Supabase Admin
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (linkError || !linkData.properties?.hashed_token) {
    return { success: false, error: 'Gagal memverifikasi akun pengguna' }
  }

  // Buat sesi login di browser client menggunakan token hash
  const supabase = await createClient()
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'email',
  })

  if (verifyError) {
    return { success: false, error: verifyError.message }
  }

  revalidatePath('/', 'layout')
  const safeNext = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/'
  return { success: true, redirectUrl: safeNext }
}

export async function resendOtpAction(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Email tidak valid' }
  }

  const adminClient = createAdminClient()

  // Cek apakah ada request dalam 30 detik terakhir untuk rate-limiting
  const { data: recentOtp } = await adminClient
    .from('otp_codes')
    .select('created_at')
    .eq('email', email)
    .eq('type', 'signup')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recentOtp) {
    const elapsedSeconds = (Date.now() - new Date(recentOtp.created_at).getTime()) / 1000
    if (elapsedSeconds < 30) {
      const waitTime = Math.ceil(30 - elapsedSeconds)
      return { success: false, error: `Harap tunggu ${waitTime} detik lagi sebelum mengirim ulang kode.` }
    }
  }

  // Buat OTP baru
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await adminClient.from('otp_codes').delete().eq('email', email).eq('type', 'signup')
  await adminClient.from('otp_codes').insert({
    email,
    code,
    type: 'signup',
    expires_at: expiresAt,
  })

  await sendOtpEmail(email, code)

  return { success: true, message: 'Kode OTP baru telah berhasil dikirim ke email Anda.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string
  const validated = forgotPasswordSchema.safeParse({ email })

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Email tidak valid' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Tautan reset password telah dikirim ke email Anda.' }
}

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  const validated = resetPasswordSchema.safeParse({ password, confirmPassword })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Input tidak valid' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/login?reset=success')
}
