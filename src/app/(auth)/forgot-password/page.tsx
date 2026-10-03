'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await forgotPassword(formData)
      if (!res.success) {
        setErrorMessage(res.error || 'Gagal mengirimkan tautan reset sandi')
      } else {
        setSuccessMessage(res.message || 'Tautan pemulihan kata sandi telah dikirim ke email Anda.')
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat memproses permintaan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-border/80 shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Lupa Kata Sandi?</CardTitle>
        <CardDescription className="text-xs">
          Masukkan alamat email Anda untuk menerima instruksi pemulihan kata sandi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {successMessage && (
          <div className="p-3 text-xs bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Alamat Email Terdaftar</Label>
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

          <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Link href="/login" className="text-xs text-primary hover:underline font-semibold">
            Kembali ke Halaman Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
