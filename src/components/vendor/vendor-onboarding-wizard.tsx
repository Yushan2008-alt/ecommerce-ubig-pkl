'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUploader } from './image-uploader'
import { becomeVendorAction } from '@/actions/vendor'
import {
  Store,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
  FileText,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { CATALOG_CATEGORIES } from '@/lib/catalog-data'

interface VendorOnboardingWizardProps {
  userEmail?: string
  userName?: string
}

export function VendorOnboardingWizard({
  userEmail = '',
  userName = '',
}: VendorOnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: CATALOG_CATEGORIES[0]?.name_id || 'Pakaian',
    description: '',
    logoUrl: '',
    flatShippingCost: 15000,
    city: 'Jakarta',
    province: 'DKI Jakarta',
    whatsapp: '',
    phone: '',
    email: userEmail,
    agreedToTerms: false,
  })

  // Auto-generate slug from store name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug,
    }))
  }

  const validateStep1 = () => {
    if (!formData.name.trim() || formData.name.length < 2) {
      toast.error('Nama toko wajib diisi (minimal 2 karakter).')
      return false
    }
    if (!formData.slug.trim() || formData.slug.length < 2) {
      toast.error('Slug toko wajib diisi (minimal 2 karakter).')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.flatShippingCost < 0) {
      toast.error('Tarif ongkir tidak boleh kurang dari 0.')
      return false
    }
    if (!formData.city.trim()) {
      toast.error('Kota asal toko wajib diisi untuk rute pengiriman.')
      return false
    }
    if (!formData.whatsapp.trim()) {
      toast.error('Nomor WhatsApp aktif wajib diisi untuk komunikasi pesanan.')
      return false
    }
    return true
  }

  const handleNext = () => {
    setErrorMsg(null)
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2)
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3)
    }
  }

  const handleBack = () => {
    setErrorMsg(null)
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreedToTerms) {
      toast.error('Anda harus menyetujui Syarat & Ketentuan Penjual terlebih dahulu.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await becomeVendorAction({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category: formData.category,
        description: formData.description.trim() || null,
        logo_url: formData.logoUrl || null,
        flat_shipping_cost: Number(formData.flatShippingCost) || 0,
        city: formData.city.trim(),
        province: formData.province.trim(),
        whatsapp: formData.whatsapp.trim(),
        phone: formData.phone.trim() || formData.whatsapp.trim(),
        email: formData.email.trim() || null,
      })

      if (res.success) {
        toast.success('Selamat! Toko Anda berhasil diaktifkan. Mengalihkan ke Dashboard...')
        router.push('/vendor')
      } else {
        setErrorMsg(res.error || 'Gagal mendaftar sebagai vendor.')
        toast.error(res.error || 'Gagal mendaftar')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server.')
      toast.error('Gagal menghubungkan ke server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-card border border-border/80 rounded-2xl shadow-lg p-6 sm:p-8">
      {/* 1. Stepper Indicator Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#00a699]/15 text-[#00a699] font-bold text-xs flex items-center justify-center">
              {currentStep} / 3
            </span>
            <span className="text-sm font-bold text-foreground">
              {currentStep === 1 && 'Langkah 1: Informasi Toko'}
              {currentStep === 2 && 'Langkah 2: Pengiriman & Pickup'}
              {currentStep === 3 && 'Langkah 3: Review & Syarat Penjual'}
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {currentStep === 1 && '33% Selesai'}
            {currentStep === 2 && '66% Selesai'}
            {currentStep === 3 && 'Hampir Selesai!'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00a699] transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Step Contents */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= STEP 1 ================= */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Store className="w-4 h-4 text-[#00a699]" />
                Profil & Identitas Toko
              </h2>
              <p className="text-xs text-muted-foreground">
                {userName ? `Halo ${userName}, tentukan nama dan alamat toko Anda untuk menarik pelanggan.` : 'Tentukan nama dan alamat unik toko Anda untuk menarik pelanggan.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Nama Toko <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Contoh: Galeri Kerajinan Nusantara"
                className="w-full h-10 px-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Domain / Slug Unik Toko <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="h-10 px-3 flex items-center text-xs font-mono bg-muted/60 text-muted-foreground border border-r-0 border-border rounded-l-lg select-none">
                  krafita.com/shop/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    }))
                  }
                  placeholder="galeri-kerajinan-nusantara"
                  className="w-full h-10 px-3.5 text-xs font-mono bg-background border border-border rounded-r-lg focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Kategori Utama Fokus Toko
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] cursor-pointer"
              >
                {CATALOG_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name_id}>
                    {cat.name_id} ({cat.name_en})
                  </option>
                ))}
                <option value="Karya Digital & Template">Karya Digital, Desain & Software</option>
                <option value="Kerajinan & Seni">Kerajinan Tangan & Souvenir</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Deskripsi Singkat Toko</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Ceritakan tentang toko Anda, keunggulan produk fisik atau digital yang Anda tawarkan..."
                className="w-full p-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] resize-none"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <ImageUploader
                bucket="shop-assets"
                value={formData.logoUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url as string }))}
                label="Logo Toko (Opsional)"
                description="Format WebP/PNG/JPG. Rekomendasi rasio 1:1."
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00a699]" />
                Atur Pengiriman & Kontak Pickup
              </h2>
              <p className="text-xs text-muted-foreground">
                Tentukan ongkos kirim flat per toko serta nomor kontak aktif untuk konfirmasi order.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Tarif Flat Ongkos Kirim per Pesanan Toko (Rp){' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-muted-foreground">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  required
                  value={formData.flatShippingCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      flatShippingCost: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-10 pl-10 pr-3.5 text-xs font-mono font-bold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                *Masukkan 0 jika toko Anda memberikan Gratis Ongkir ke seluruh pembeli. Produk
                digital otomatis bebas ongkir.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Kota Lokasi Asal Toko <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Contoh: Bandung"
                  className="w-full h-10 px-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Provinsi</label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData((prev) => ({ ...prev, province: e.target.value }))}
                  placeholder="Contoh: Jawa Barat"
                  className="w-full h-10 px-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Nomor WhatsApp Toko <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="081234567890"
                  className="w-full h-10 pl-10 pr-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Digunakan untuk tombol &ldquo;Tanya Penjual via WhatsApp&rdquo; pada detail produk.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Email Resmi Toko</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="toko@krafita.com"
                className="w-full h-10 px-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00a699]" />
                Review Data & Syarat Penjual
              </h2>
              <p className="text-xs text-muted-foreground">
                Periksa kembali data toko Anda sebelum pengaktifan instan.
              </p>
            </div>

            {/* Ringkasan Data */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Nama Toko:</span>
                <span className="font-bold text-foreground">{formData.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">URL Slug:</span>
                <span className="font-mono text-[#00a699]">krafita.com/shop/{formData.slug}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Kategori Fokus:</span>
                <span className="font-medium text-foreground">{formData.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Ongkir Flat Toko:</span>
                <span className="font-bold text-emerald-600">
                  {formData.flatShippingCost === 0
                    ? 'Gratis Ongkir'
                    : `Rp ${formData.flatShippingCost.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Lokasi Pickup:</span>
                <span className="text-foreground">
                  {formData.city}, {formData.province}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">No. WhatsApp:</span>
                <span className="font-mono text-foreground">{formData.whatsapp}</span>
              </div>
            </div>

            {/* Syarat & Ketentuan Penjual */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted/20 border border-border space-y-2 text-[11px] text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <ShieldCheck className="w-4 h-4 text-[#00a699]" />
                Ketentuan Layanan Penjual Krafita:
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Komisi Platform:</strong> Setiap transaksi pesanan yang selesai
                  dikenakan potongan komisi platform transparan sebesar 5% secara otomatis.
                </li>
                <li>
                  <strong>Originalitas Produk:</strong> Penjual menjamin produk fisik maupun aset
                  digital yang dijual merupakan karya asli atau memiliki hak distribusi sah.
                </li>
                <li>
                  <strong>Pemenuhan Pesanan:</strong> Penjual berkomitmen memproses dan menginput
                  nomor resi pengiriman fisik tepat waktu.
                </li>
                <li>
                  <strong>Pencairan Dana (Payout):</strong> Dana penjualan masuk ke Saldo Bersih
                  toko setelah pesanan dikonfirmasi selesai oleh pembeli dan dapat ditarik ke rekening
                  bank lokal Anda.
                </li>
              </ul>
            </div>

            {/* Checkbox Persetujuan */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                required
                checked={formData.agreedToTerms}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded border-border text-[#00a699] focus:ring-[#00a699] cursor-pointer"
              />
              <span className="text-xs text-foreground font-medium leading-snug">
                Saya telah membaca, memahami, dan menyetujui seluruh{' '}
                <strong className="text-[#00a699]">Syarat & Ketentuan Penjual Krafita</strong>.
              </span>
            </label>
          </div>
        )}

        {/* 3. Action Buttons Navigation */}
        <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              disabled={submitting}
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              Lanjutkan
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || !formData.agreedToTerms}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00a699] hover:bg-[#008f84] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mendaftarkan Toko...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Aktifkan Toko & Buka Sekarang
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
