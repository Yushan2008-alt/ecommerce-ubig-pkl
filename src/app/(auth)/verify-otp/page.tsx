'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyOtpAction, resendOtpAction } from '@/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react'

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const next = searchParams.get('next') || '/'

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(
    'Kode OTP 6-digit telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.'
  )

  // Cooldown Timer 30 detik untuk Resend OTP
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setErrorMessage('Harap masukkan 6 digit kode OTP secara lengkap')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await verifyOtpAction(email, otp, next)
      if (!res.success) {
        setErrorMessage(res.error || 'Kode OTP tidak valid atau telah kedaluwarsa')
        setLoading(false)
      } else if (res.redirectUrl) {
        router.push(res.redirectUrl)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verifikasi gagal'
      setErrorMessage(msg)
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || resending) return

    setResending(true)
    setErrorMessage(null)

    try {
      const res = await resendOtpAction(email)
      if (res.success) {
        setSuccessInfo(res.message || 'Kode OTP baru berhasil dikirim.')
        setCountdown(30) // Reset cooldown timer ke 30 detik
      } else {
        setErrorMessage(res.error || 'Gagal mengirim ulang OTP')
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat meminta kode baru')
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="border border-border/80 shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Verifikasi Email Anda</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          Masukkan 6 digit kode OTP yang kami kirimkan ke:
          <br />
          <strong className="text-foreground text-sm font-semibold">{email || 'email Anda'}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {successInfo && (
          <div className="p-3 text-xs bg-muted/60 border border-border text-foreground rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{successInfo}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="h-14 text-center text-3xl font-mono tracking-[0.5em] font-bold"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full h-11 font-semibold text-sm" disabled={loading || otp.length !== 6}>
            {loading ? 'Memverifikasi...' : 'Verifikasi Akun & Masuk'}
          </Button>
        </form>

        {/* Tombol Kirim Ulang dengan Cooldown 30 Detik */}
        <div className="pt-2 text-center space-y-2">
          <p className="text-xs text-muted-foreground">Tidak menerima kode di email?</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="text-xs font-semibold text-primary hover:text-primary/80 disabled:text-muted-foreground transition-all"
          >
            {resending ? (
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 animate-spin" /> Mengirim...
              </span>
            ) : countdown > 0 ? (
              <span>Kirim ulang kode dalam {countdown}s</span>
            ) : (
              <span>Kirim Ulang Kode OTP</span>
            )}
          </Button>
        </div>

        <div className="pt-2 text-center border-t border-border/60">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat...</div>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
