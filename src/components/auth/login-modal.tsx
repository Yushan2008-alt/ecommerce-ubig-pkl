'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, AlertCircle, Loader2 } from 'lucide-react'
import { signIn } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/language-context'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  next?: string
}

export function LoginModal({ isOpen, onClose, next = '/' }: LoginModalProps) {
  const { t } = useLanguage()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null)
    } else {
      setEmail('')
      setPassword('')
      setErrorMessage(null)
      setLoading(false)
      setGoogleLoading(false)
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('next', next)

    try {
      const res = await signIn(formData)
      if (res && !res.success) {
        setErrorMessage(res.error || 'Login gagal, periksa email dan password Anda.')
        setLoading(false)
      } else {
        onClose()
        router.refresh()
      }
    } catch {
      // If Next.js redirect thrown, it succeeds
      onClose()
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
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

  const handleNavigateRegister = () => {
    onClose()
    router.push(`/register?next=${encodeURIComponent(next)}`)
  }

  const handleNavigateForgotPassword = () => {
    onClose()
    router.push('/forgot-password')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative w-full max-w-[420px] bg-card rounded-xl border border-border/80 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        {/* Close Button X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <h2
          id="login-modal-title"
          className="text-2xl font-bold text-foreground text-center mb-6 tracking-tight"
        >
          {t.login_submit}
        </h2>

        {errorMessage && (
          <div className="mb-4 p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Connect with Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
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

        {/* Divider: Or login with email */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground">
              {t.or_login_with_email}
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3.5">
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
            {/* Forgot Password Link */}
            <div className="text-right pt-1.5">
              <button
                type="button"
                onClick={handleNavigateForgotPassword}
                className="text-[11px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {t.forgot_password_question}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-11 bg-[#00a699] hover:bg-[#008f84] text-white rounded-md font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span>{t.login_submit}</span>
            )}
          </button>
        </form>

        {/* Bottom text: Don't have an account? Register */}
        <p className="text-center text-xs text-muted-foreground pt-5">
          {t.dont_have_account_q}{' '}
          <button
            type="button"
            onClick={handleNavigateRegister}
            className="text-[#00a699] hover:underline font-semibold cursor-pointer"
          >
            {t.register_submit}
          </button>
        </p>
      </div>
    </div>
  )
}
