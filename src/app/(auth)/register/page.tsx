'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signUpWithOtp } from '@/actions/auth'
import { GoogleButton } from '@/components/auth/google-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const formData = new FormData(e.currentTarget)
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

  return (
    <Card className="border border-border/80 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Daftar Akun Baru</CardTitle>
        <CardDescription>
          Mulai belanja produk fisik & digital atau buka toko Anda sendiri
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Google Register */}
        <GoogleButton text="Daftar dengan Google" next={next} />

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">Atau daftar manual</span>
          </div>
        </div>

        {/* Form Pendaftaran Manual */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              name="name"
              placeholder="Budi Santoso"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Alamat Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="budi@email.com"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimal 6 karakter"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi kata sandi"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
            Dengan mendaftar, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi Marketplace Ubig. Kode OTP verifikasi akan dikirim ke email Anda.
          </p>

          <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
            {loading ? 'Mengirim Kode OTP...' : 'Daftar & Kirim OTP'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Sudah punya akun?{' '}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-primary hover:underline font-semibold"
          >
            Masuk sekarang
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
