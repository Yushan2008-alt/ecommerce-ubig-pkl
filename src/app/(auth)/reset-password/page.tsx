'use client'

import { useState } from 'react'
import { resetPassword } from '@/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await resetPassword(formData)
      if (res && !res.success) {
        setErrorMessage(res.error || 'Gagal memperbarui kata sandi')
        setLoading(false)
      }
    } catch {
      // Jika redirect berhasil, Next.js melempar exception redirect (normal)
    }
  }

  return (
    <Card className="border border-border/80 shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Atur Ulang Kata Sandi</CardTitle>
        <CardDescription className="text-xs">
          Masukkan kata sandi baru untuk akun Krafita Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Kata Sandi Baru</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi kata sandi baru"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-semibold bg-[#00a699] hover:bg-[#008f84] text-white"
            disabled={loading}
          >
            {loading ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
