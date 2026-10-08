'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOtpEmail, sendPasswordResetOtpEmail } from '@/lib/mail'
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
  const firstName = (formData.get('firstName') as string) || ''
  const lastName = (formData.get('lastName') as string) || ''
  let name = (formData.get('name') as string) || ''
  if (!name && (firstName || lastName)) {
    name = `${firstName} ${lastName}`.trim()
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const next = (formData.get('next') as string) || '/'

  const cleanEmail = email.trim().toLowerCase()
  const validated = registerSchema.safeParse({ name, email: cleanEmail, password, confirmPassword })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Input tidak valid' }
  }

  const adminClient = createAdminClient()

  // Daftarkan akun pengguna baru ke Supabase Auth
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email: cleanEmail,
    password,
    user_metadata: { full_name: name, name },
    email_confirm: false,
  })

  if (createError) {
    // Tangani jika email sudah terdaftar
    if (createError.message.toLowerCase().includes('already') || createError.status === 422) {
      // Periksa apakah user yang sudah ada sudah terkonfirmasi atau belum
      const { data: userList } = await adminClient.auth.admin.listUsers()
      const existingUser = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)

      if (existingUser && !existingUser.email_confirmed_at) {
        // User belum terkonfirmasi, perbarui password & metadata, lalu izinkan kirim ulang OTP
        await adminClient.auth.admin.updateUserById(existingUser.id, {
          password,
          user_metadata: { full_name: name, name },
        })
      } else {
        return { success: false, error: 'Email ini sudah terdaftar. Silakan langsung login.' }
      }
    } else {
      return { success: false, error: createError.message }
    }
  }

  // Buat kode OTP 6 digit
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 menit

  // Hapus OTP lama untuk email ini jika ada
  await adminClient.from('otp_codes').delete().eq('email', cleanEmail).eq('type', 'signup')

  // Simpan OTP ke tabel otp_codes
  const { error: otpInsertError } = await adminClient.from('otp_codes').insert({
    email: cleanEmail,
    code,
    type: 'signup',
    expires_at: expiresAt,
  })

  if (otpInsertError) {
    console.error('[OTP Insert Error]', otpInsertError)
    return { success: false, error: 'Gagal membuat kode verifikasi' }
  }

  // Kirim email OTP via Nodemailer
  const mailResult = await sendOtpEmail(cleanEmail, code)
  if (!mailResult.success) {
    console.error('[Mail Error]', mailResult.error)
    return {
      success: false,
      error: mailResult.error || 'Gagal mengirim email kode verifikasi. Periksa konfigurasi email Anda.',
    }
  }

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return {
    success: true,
    email: cleanEmail,
    redirectUrl: `/verify-otp?email=${encodeURIComponent(cleanEmail)}&next=${encodeURIComponent(safeNext)}`,
  }
}

export async function verifyOtpAction(email: string, code: string, nextPath = '/') {
  const cleanEmail = email?.trim().toLowerCase()
  const cleanCode = code?.trim()

  const validated = verifyOtpSchema.safeParse({ email: cleanEmail, code: cleanCode })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Kode OTP tidak valid' }
  }

  const adminClient = createAdminClient()

  // Cari kode OTP aktif di database
  const { data: otpRecord, error: otpFetchError } = await adminClient
    .from('otp_codes')
    .select('*')
    .eq('email', cleanEmail)
    .eq('code', cleanCode)
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

  // Pastikan email user terkonfirmasi di Supabase Auth
  const { data: userList } = await adminClient.auth.admin.listUsers()
  const user = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)
  if (user) {
    await adminClient.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    })
  }

  // Konfirmasi email user & generate magiclink untuk sesi login
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: cleanEmail,
  })

  if (!linkError && linkData?.properties?.hashed_token) {
    // Buat sesi login di browser client menggunakan token hash
    const supabase = await createClient()
    await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'email',
    })
  }

  revalidatePath('/', 'layout')
  const safeNext = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/'
  return { success: true, redirectUrl: safeNext }
}

export async function resendOtpAction(email: string) {
  const cleanEmail = email?.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Email tidak valid' }
  }

  const adminClient = createAdminClient()

  // Cek apakah ada request dalam 30 detik terakhir untuk rate-limiting
  const { data: recentOtp } = await adminClient
    .from('otp_codes')
    .select('created_at')
    .eq('email', cleanEmail)
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

  await adminClient.from('otp_codes').delete().eq('email', cleanEmail).eq('type', 'signup')
  await adminClient.from('otp_codes').insert({
    email: cleanEmail,
    code,
    type: 'signup',
    expires_at: expiresAt,
  })

  const mailResult = await sendOtpEmail(cleanEmail, code)
  if (!mailResult.success) {
    return {
      success: false,
      error: mailResult.error || 'Gagal mengirim email kode verifikasi. Periksa koneksi internet/SMTP.',
    }
  }

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

/**
 * Mengirimkan kode OTP pemulihan kata sandi ke Gmail pengguna
 */
export async function sendPasswordResetOtp(email: string): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Format alamat email tidak valid' }
  }

  const cleanEmail = email.trim().toLowerCase()
  const adminClient = createAdminClient()

  // Periksa apakah email terdaftar di sistem
  const { data: userList, error: listError } = await adminClient.auth.admin.listUsers()
  if (listError) {
    console.error('[Admin listUsers error]', listError)
    return { success: false, error: 'Gagal memproses permintaan' }
  }

  const user = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)
  if (!user) {
    return { success: false, error: 'Alamat email ini tidak terdaftar di sistem kami' }
  }

  // Buat kode OTP 6 digit
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // Berlaku 10 menit

  // Hapus kode OTP reset password lama jika ada
  await adminClient.from('otp_codes').delete().eq('email', cleanEmail).eq('type', 'reset_password')

  // Simpan kode OTP baru
  const { error: insErr } = await adminClient.from('otp_codes').insert({
    email: cleanEmail,
    code,
    type: 'reset_password',
    expires_at: expiresAt,
  })

  if (insErr) {
    console.error('[OTP reset insert error]', insErr)
    return { success: false, error: 'Gagal membuat kode verifikasi OTP' }
  }

  // Kirim email kode OTP ke Gmail pengguna
  const mailRes = await sendPasswordResetOtpEmail(cleanEmail, code)
  if (!mailRes.success) {
    console.error('[Mail warning]', mailRes.error)
    return {
      success: false,
      error: mailRes.error || 'Gagal mengirim email pemulihan kata sandi. Periksa koneksi email Anda.',
    }
  }

  return {
    success: true,
    message: 'Kode OTP pemulihan kata sandi telah dikirim ke email Anda.',
  }
}

/**
 * Mengatur ulang kata sandi dengan memvalidasi kode OTP yang dikirim ke email
 */
export async function resetPasswordWithOtp(
  email: string,
  code: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email?.trim().toLowerCase()
  const cleanCode = code?.trim()

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Email tidak valid' }
  }
  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, error: 'Kode OTP harus berupa 6 digit angka' }
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Kata sandi baru minimal 6 karakter' }
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Konfirmasi kata sandi tidak cocok' }
  }

  const adminClient = createAdminClient()

  // Cari kode OTP aktif di tabel otp_codes
  const { data: otpRecord, error: otpError } = await adminClient
    .from('otp_codes')
    .select('*')
    .eq('email', cleanEmail)
    .eq('code', cleanCode)
    .eq('type', 'reset_password')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (otpError || !otpRecord) {
    return { success: false, error: 'Kode OTP salah atau telah kedaluwarsa' }
  }

  // Hapus kode OTP yang berhasil digunakan
  await adminClient.from('otp_codes').delete().eq('id', otpRecord.id)

  // Ambil user dari Supabase Admin
  const { data: userList } = await adminClient.auth.admin.listUsers()
  const user = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)

  if (!user) {
    return { success: false, error: 'Akun pengguna tidak ditemukan' }
  }

  // Update password akun pengguna secara langsung
  const { error: updateErr } = await adminClient.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  return { success: true }
}

