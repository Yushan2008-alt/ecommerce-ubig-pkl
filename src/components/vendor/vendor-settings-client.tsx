'use client'

import React, { useState, useMemo } from 'react'
import { ImageUploader } from './image-uploader'
import { updateShopSettingsAction } from '@/actions/vendor'
import type { ShopSettingsInput } from '@/lib/validators'
import {
  Store,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { SearchableSelect } from '@/components/ui/searchSelect'
import {
  INDONESIA_PROVINCES,
  getCitiesByProvinceName,
} from '@/data/indonesia-regions'

export interface ShopSettingsData {
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  city?: string | null
  province?: string | null
  flat_shipping_cost?: number
  whatsapp?: string | null
  phone?: string | null
  email?: string | null
  bank_name?: string | null
  bank_account_number?: string | null
  bank_account_holder?: string | null
}

interface VendorSettingsClientProps {
  initialShop: ShopSettingsData
}

function cleanPhoneDigits(value: string, country = '+62'): string {
  let digits = value.replace(/\D/g, '')

  if (country === '+62') {
    while (digits.startsWith('62') || digits.startsWith('0')) {
      if (digits.startsWith('62')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  } else if (country === '+60') {
    while (digits.startsWith('60') || digits.startsWith('0')) {
      if (digits.startsWith('60')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  } else if (country === '+65') {
    while (digits.startsWith('65') || digits.startsWith('0')) {
      if (digits.startsWith('65')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  }

  return digits
}

function formatPhoneNumber(value: string, country = '+62'): string {
  let digits = cleanPhoneDigits(value, country)
  const maxDigits = country === '+62' ? 13 : 12
  digits = digits.slice(0, maxDigits)

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11)}`
}

export function VendorSettingsClient({ initialShop }: VendorSettingsClientProps) {
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Deteksi kode negara dan format nomor telepon awal
  const initialRawPhone = initialShop.phone || initialShop.whatsapp || ''
  let initialCountry = '+62'
  if (initialRawPhone.startsWith('+60') || initialRawPhone.startsWith('60')) {
    initialCountry = '+60'
  } else if (initialRawPhone.startsWith('+65') || initialRawPhone.startsWith('65')) {
    initialCountry = '+65'
  }
  const initialFormattedPhone = formatPhoneNumber(initialRawPhone, initialCountry)

  const [countryCode, setCountryCode] = useState(initialCountry)
  const [phone, setPhone] = useState(initialFormattedPhone)

  const [formData, setFormData] = useState({
    name: initialShop.name || '',
    slug: initialShop.slug || '',
    logoUrl: initialShop.logo_url || '',
    province: initialShop.province || '',
    city: initialShop.city || '',
  })

  // Master Data Wilayah (Provinsi & Kota)
  const provinceOptions = useMemo(() => {
    return INDONESIA_PROVINCES.map((p) => ({
      value: p.name,
      label: p.name,
    }))
  }, [])

  const cityOptions = useMemo(() => {
    if (!formData.province) return []
    return getCitiesByProvinceName(formData.province).map((c) => ({
      value: c.name,
      label: c.name,
    }))
  }, [formData.province])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value
    setCountryCode(newCode)
    setPhone(formatPhoneNumber(phone, newCode))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, countryCode)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.name.trim() || formData.name.length < 2) {
      toast.error('Nama toko wajib diisi (minimal 2 karakter).')
      return
    }

    const phoneDigits = cleanPhoneDigits(phone, countryCode)
    if (!phoneDigits) {
      toast.error('Nomor telepon toko wajib diisi.')
      return
    }
    if (phoneDigits.length < 8) {
      toast.error('Nomor telepon toko minimal 8 digit.')
      return
    }
    if (countryCode === '+62' && phoneDigits.length > 13) {
      toast.error('Nomor telepon toko maksimal 13 digit.')
      return
    }

    if (!formData.province) {
      toast.error('Silakan pilih provinsi toko.')
      return
    }

    if (!formData.city) {
      toast.error('Silakan pilih kota / kabupaten toko.')
      return
    }

    setSubmitting(true)

    const fullPhone = countryCode === '+62' ? `0${phoneDigits}` : `${countryCode}${phoneDigits}`

    try {
      const payload: ShopSettingsInput = {
        name: formData.name.trim(),
        description: initialShop.description || null,
        logoUrl: formData.logoUrl?.trim() || null,
        flatShippingCost: Number(initialShop.flat_shipping_cost || 0),
        whatsapp: fullPhone,
        phone: fullPhone,
        city: formData.city.trim() || null,
        province: formData.province.trim() || null,
        bankName: initialShop.bank_name || null,
        bankAccountNumber: initialShop.bank_account_number || null,
        bankAccountHolder: initialShop.bank_account_holder || null,
      }

      const res = await updateShopSettingsAction(payload)

      if (res.success) {
        toast.success('Profil toko berhasil disimpan!')
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan profil')
        toast.error(res.error || 'Gagal menyimpan')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server.')
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Header Toolbar (Hapus Subtitle & Hapus Tombol Atas) */}
      <div className="pb-4 border-b border-border/80">
        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Pengaturan
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Card Identitas Toko (Satu Card Saja) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-5 w-full max-w-full min-w-0">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Store className="w-4 h-4 text-[#00a699]" />
            Identitas
          </h2>
        </div>

        {/* Logo Toko */}
        <div className="space-y-1.5">
          <ImageUploader
            bucket="shop-assets"
            value={formData.logoUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url as string }))}
            label="Logo Toko"
            description="Format WebP, PNG, atau JPG. Disarankan rasio 1:1."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama Toko */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Nama Toko <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Toko Krafita Sejahtera"
              className="w-full h-10 px-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
            />
          </div>

          {/* Domain / Slug Toko */}
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-bold text-foreground">Domain / Slug Toko</label>
            <div className="flex items-center w-full min-w-0">
              <span className="h-10 px-2.5 sm:px-3 shrink-0 flex items-center text-[11px] sm:text-xs font-mono bg-muted/60 text-muted-foreground border border-r-0 border-border rounded-l-lg select-none">
                krafita.com/shop/
              </span>
              <input
                type="text"
                disabled
                value={formData.slug}
                className="flex-1 min-w-0 w-full h-10 px-3.5 text-xs font-mono bg-muted/40 text-muted-foreground border border-border rounded-r-lg cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Nomor Telepon Toko (Dropdown default +62, tipe teks, auto '-') */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Nomor Telepon Toko <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center h-10 border border-border rounded-lg bg-background overflow-hidden focus-within:border-[#00a699] transition-all">
            <select
              value={countryCode}
              onChange={handleCountryChange}
              className="h-full px-2.5 bg-muted/30 border-r border-border text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="+62">🇮🇩 +62</option>
              <option value="+60">🇲🇾 +60</option>
              <option value="+65">🇸🇬 +65</option>
            </select>
            <div className="relative flex-1 flex items-center h-full">
              <input
                type="text"
                inputMode="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder={
                  countryCode === '+62'
                    ? '812-3456-7890'
                    : countryCode === '+60'
                    ? '12-345-6789'
                    : '8123-4567'
                }
                className="w-full h-full px-3.5 text-xs font-mono bg-transparent focus:outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {countryCode === '+62'
              ? 'Format otomatis: nomor telepon aktif toko (8-13 digit setelah +62).'
              : 'Nomor telepon aktif toko untuk koordinasi pesanan.'}
          </p>
        </div>

        {/* Master Data: Provinsi & Kota */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Provinsi <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={provinceOptions}
              value={formData.province}
              onChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  province: val,
                  city: '', // Reset kota jika ganti provinsi
                }))
              }}
              placeholder="Pilih Provinsi..."
              searchPlaceholder="Cari provinsi..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Kota / Kabupaten <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={cityOptions}
              value={formData.city}
              onChange={(val) => setFormData((prev) => ({ ...prev, city: val }))}
              placeholder={formData.province ? 'Pilih Kota/Kabupaten...' : 'Pilih provinsi terlebih dahulu'}
              searchPlaceholder="Cari kota/kabupaten..."
              disabled={!formData.province}
            />
          </div>
        </div>
      </div>

      {/* 3. Button Simpan 1 Aja Di Bawah */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center min-w-[100px] px-6 py-2.5 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              Menyimpan...
            </>
          ) : (
            'Simpan'
          )}
        </button>
      </div>
    </form>
  )
}
