'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from '@/actions/auth'
import { GoogleButton } from '@/components/auth/google-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const verified = searchParams.get('verified')
  const resetSuccess = searchParams.get('reset')
  const authError = searchParams.get('error')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authError ? 'Autentikasi gagal atau sesi telah kedaluwarsa. Silakan login kembali.' : null
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const formData = new FormData(e.currentTarget)
    formData.append('next', next)

    try {
      const res = await signIn(formData)
      if (res && !res.success) {
        setErrorMessage(res.error || 'Login gagal, periksa email dan password Anda.')
        setLoading(false)
      }
    } catch {
      // Jika redirect berhasil, Next.js melempar exception redirect (normal)
    }
  }

  return (
    <Card className="border border-border/80 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Selamat Datang Kembali</CardTitle>
        <CardDescription>
          Masuk ke akun Anda untuk melanjutkan belanja atau mengelola toko
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verified && (
          <div className="p-3 text-xs bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Email Anda berhasil diverifikasi! Silakan login untuk melanjutkan.</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3 text-xs bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Kata sandi Anda berhasil diperbarui. Silakan login dengan sandi baru.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Google OAuth */}
        <GoogleButton text="Masuk dengan Google" next={next} />

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">Atau dengan email</span>
          </div>
        </div>

        {/* Form Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Lupa sandi?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Belum punya akun?{' '}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-primary hover:underline font-semibold"
          >
            Daftar sekarang
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  )
}
