'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signUpWithOtp } from '@/actions/auth'
import { useLanguage } from '@/context/language-context'
import { useAuthModal } from '@/context/auth-modal-context'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Loader2 } from 'lucide-react'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const { t } = useLanguage()
  const { openLoginModal } = useAuthModal()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password !== confirmPassword) {
      setErrorMessage(t.confirm_password + ' tidak cocok')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('firstName', firstName.trim())
    formData.append('lastName', lastName.trim())
    formData.append('email', email.trim())
    formData.append('password', password)
    formData.append('confirmPassword', confirmPassword)
    formData.append('next', next)

    try {
      const res = await signUpWithOtp(formData)
      if (!res.success) {
        setErrorMessage(res.error || 'Pendaftaran gagal, periksa data yang Anda masukkan.')
        setLoading(false)
      } else if (res.redirectUrl) {
        router.push(res.redirectUrl)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
      setErrorMessage(msg)
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setGoogleLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghubungkan dengan Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="py-8 sm:py-12 bg-slate-50/50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-muted-foreground mb-8 gap-2">
          <Link href="/" className="hover:text-primary transition-colors">
            {t.home}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t.register_submit}</span>
        </nav>

        {/* Centered Register Form Card (Persis Gambar 2) */}
        <div className="max-w-[460px] mx-auto bg-card rounded-xl border border-border/80 shadow-xs p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-foreground text-center mb-6 tracking-tight">
            {t.register_submit}
          </h1>

          {errorMessage && (
            <div className="mb-5 p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Connect with Google Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading || loading}
            className="w-full h-11 flex items-center justify-center gap-2.5 px-4 rounded-md border border-border/90 bg-background hover:bg-muted/60 text-xs sm:text-sm font-medium text-foreground transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{t.connect_with_google}</span>
          </button>

          {/* Divider: Or register with email */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">
                {t.or_register_with_email}
              </span>
            </div>
          </div>

          {/* Form Fields: First Name, Last Name, Email, Password, Confirm Password */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
                disabled={loading || googleLoading}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
                disabled={loading || googleLoading}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                disabled={loading || googleLoading}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading || googleLoading}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                disabled={loading || googleLoading}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              Dengan mendaftar, Anda menyetujui Ketentuan Layanan Krafita. Kode OTP verifikasi akan dikirimkan ke email Anda.
            </p>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-11 bg-[#00a699] hover:bg-[#008f84] text-white rounded-md font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Mengirim Kode OTP...</span>
                </>
              ) : (
                <span>{t.register_submit}</span>
              )}
            </button>
          </form>

          {/* Bottom Link: Already have an account? Login */}
          <p className="text-center text-xs text-muted-foreground pt-5">
            {t.already_have_account_q}{' '}
            <button
              type="button"
              onClick={() => openLoginModal(next)}
              className="text-[#00a699] hover:underline font-semibold cursor-pointer"
            >
              {t.login_submit}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      <RegisterContent />
    </Suspense>
  )
}
