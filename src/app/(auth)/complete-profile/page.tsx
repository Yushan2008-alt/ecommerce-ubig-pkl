'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { completeProfileOnboardingAction } from '@/actions/account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react'

function CompleteProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form states
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [phone, setPhone] = useState('')

  // Address states (opsional tapi disarankan)
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace('/login')
          return
        }

        setEmail(user.email || '')
        const metaName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.display_name ||
          ''
        setDisplayName(metaName)
        setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null)

        // Cek jika profil sudah ada data di database
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, phone, avatar_url')
          .eq('id', user.id)
          .maybeSingle()

        if (profile) {
          if (profile.display_name) setDisplayName(profile.display_name)
          if (profile.phone) setPhone(profile.phone)
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
        }
      } catch (err) {
        console.error('Error loading user:', err)
      } finally {
        setInitLoading(false)
      }
    }

    loadCurrentUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!displayName.trim()) {
      setErrorMessage('Harap isi nama lengkap Anda.')
      return
    }

    if (!phone.trim()) {
      setErrorMessage('Harap isi nomor telepon / WhatsApp yang aktif.')
      return
    }

    setLoading(true)

    try {
      const res = await completeProfileOnboardingAction({
        displayName: displayName.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
      })

      if (!res.success) {
        setErrorMessage(res.error || 'Gagal menyimpan profil, coba beberapa saat lagi.')
        setLoading(false)
      } else {
        const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
        router.push(safeNext)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
      setErrorMessage(msg)
      setLoading(false)
    }
  }

  const handleSkip = () => {
    const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
    router.push(safeNext)
  }

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a699]" />
        <p className="text-sm text-muted-foreground">Menyiapkan profil Anda...</p>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-12 bg-slate-50/50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-muted-foreground mb-6 gap-2">
          <Link href="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Lengkapi Profil</span>
        </nav>

        {/* Card Form */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-6 sm:p-10">
          <div className="text-center mb-8">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-[#00a699] object-cover shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#00a699]/10 text-[#00a699] flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Selamat Datang di Krafita!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
              Lengkapi data diri dan kontak Anda untuk memudahkan proses pemesanan, verifikasi, serta
              pengiriman pesanan.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bagian 1: Data Kontak Utama */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#00a699]" />
                Informasi Kontak
              </h2>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Email Terdaftar
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="h-10 text-xs bg-muted/40 cursor-not-allowed font-medium text-muted-foreground"
                  />
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Nama Lengkap <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10 pl-9 text-xs sm:text-sm"
                  />
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Nomor WhatsApp / HP Aktif <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="h-10 pl-9 text-xs sm:text-sm"
                  />
                  <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Digunakan untuk notifikasi status pesanan & koordinasi kurir pengiriman.
                </p>
              </div>
            </div>

            {/* Bagian 2: Alamat Pengiriman (Opsional sekarang, bisa diisi nanti) */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                <MapPin className="w-4 h-4 text-[#00a699]" />
                Alamat Pengiriman Utama (Opsional)
              </h2>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Alamat Lengkap / Jalan
                </label>
                <Input
                  type="text"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Kota / Kabupaten
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Contoh: Jakarta Selatan"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-10 pl-8 text-xs sm:text-sm"
                    />
                    <Building className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Provinsi
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: DKI Jakarta"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Kode Pos
                  </label>
                  <Input
                    type="text"
                    maxLength={5}
                    placeholder="12345"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit & Skip Actions */}
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#00a699] hover:bg-[#008f84] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Profil...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan & Lanjutkan Belanja</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-center block"
              >
                Lewati untuk nanti (Anda dapat melengkapinya kapan saja di menu Akun)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#00a699]" />
          <p className="text-sm text-muted-foreground">Memuat formulir...</p>
        </div>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  )
}
