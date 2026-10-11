'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImageUploader } from './image-uploader'
import {
  submitVendorApplicationAction,
  submitFirstProductAction,
  getVendorApplicationStatusAction,
} from '@/actions/vendor'
import { POPULAR_COURIERS, POPULAR_BANKS } from '@/lib/shop-helper'
import { DASHBOARD_12_CATEGORIES } from '@/lib/catalog-data'
import {
  Store,
  MapPin,
  Truck,
  CreditCard,
  Clock,
  PackagePlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Building,
  Phone,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Database, ShopMetadata, ShopStatus } from '@/types/database'

type Shop = Database['public']['Tables']['shops']['Row']

export interface CategoryOption {
  id: string
  name: string
  slug: string
}

interface VendorOnboardingWizardProps {
  userEmail?: string
  userName?: string
  initialStep?: 1 | 2 | 3 | 4 | 5 | 6
  existingShop?: Shop | null
  existingMetadata?: ShopMetadata | null
  categories?: CategoryOption[]
}

export function VendorOnboardingWizard({
  userEmail = '',
  userName = '',
  initialStep = 1,
  existingShop = null,
  existingMetadata = null,
  categories = [],
}: VendorOnboardingWizardProps) {
  const router = useRouter()

  const effectiveCategories: CategoryOption[] =
    categories && categories.length > 0
      ? categories
      : DASHBOARD_12_CATEGORIES.map((c) => ({
          id: c.slug,
          name: c.name_id,
          slug: c.slug,
        }))

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(() => {
    if (existingShop) {
      if (existingShop.status === 'pending') return 5
      if (existingShop.status === 'approved') return 6
      if (existingShop.status === 'rejected') return 5
    }
    return initialStep
  })

  const [submitting, setSubmitting] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Current Shop Data (state)
  const [shop, setShop] = useState<Shop | null>(existingShop)
  const [shopMeta, setShopMeta] = useState<ShopMetadata>(existingMetadata || {})

  // Step 2, 3, 4: Application Form State
  const [appForm, setAppForm] = useState({
    name: existingShop?.name || '',
    slug: existingShop?.slug || '',
    phone: existingShop?.phone || existingShop?.whatsapp || '',
    pickup_address: existingMetadata?.pickup_address || '',
    city: existingShop?.city || 'Jakarta',
    province: existingShop?.province || 'DKI Jakarta',
    postal_code: existingMetadata?.postal_code || '',
    couriers: existingMetadata?.couriers && existingMetadata.couriers.length > 0
      ? existingMetadata.couriers
      : ['jnt', 'spx', 'jne'],
    bank_name: existingMetadata?.bank_name || POPULAR_BANKS[0],
    bank_account_number: existingMetadata?.bank_account_number || '',
    bank_account_holder: existingMetadata?.bank_account_holder || userName || '',
    agreedToTerms: true,
  })

  // Step 6: First Product Form State
  const [productForm, setProductForm] = useState({
    title: '',
    slug: '',
    categoryId: effectiveCategories[0]?.id || effectiveCategories[0]?.slug || 'clothing',
    price: 150000,
    stock: 20,
    description: '',
    images: [] as string[],
  })

  // Auto-generate slug from store name
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    setAppForm((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug,
    }))
  }

  // Toggle courier selection
  const toggleCourier = (courierId: string) => {
    setAppForm((prev) => {
      const exists = prev.couriers.includes(courierId)
      const next = exists
        ? prev.couriers.filter((c) => c !== courierId)
        : [...prev.couriers, courierId]
      return { ...prev, couriers: next }
    })
  }

  // Auto-generate product slug
  const handleProductTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    setProductForm((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug,
    }))
  }

  // Step Validations
  const validateStep2 = () => {
    if (!appForm.name.trim() || appForm.name.length < 2) {
      toast.error('Nama toko wajib diisi (minimal 2 karakter).')
      return false
    }
    if (!appForm.slug.trim() || appForm.slug.length < 2) {
      toast.error('Slug toko wajib diisi (minimal 2 karakter).')
      return false
    }
    if (!appForm.phone.trim() || appForm.phone.length < 8) {
      toast.error('Nomor telepon wajib diisi minimal 8 digit.')
      return false
    }
    if (!appForm.pickup_address.trim() || appForm.pickup_address.length < 5) {
      toast.error('Alamat pengambilan barang (gudang/rumah) wajib diisi lengkap.')
      return false
    }
    if (!appForm.city.trim() || !appForm.province.trim()) {
      toast.error('Kota dan Provinsi wajib diisi.')
      return false
    }
    if (!appForm.postal_code.trim()) {
      toast.error('Kode pos wajib diisi.')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (appForm.couriers.length === 0) {
      toast.error('Pilih minimal 1 ekspedisi jasa kirim yang aktif untuk toko Anda.')
      return false
    }
    return true
  }

  const validateStep4 = () => {
    if (!appForm.bank_name.trim()) {
      toast.error('Nama bank wajib dipilih.')
      return false
    }
    if (!appForm.bank_account_number.trim() || appForm.bank_account_number.length < 4) {
      toast.error('Nomor rekening bank wajib diisi minimal 4 digit.')
      return false
    }
    if (!appForm.bank_account_holder.trim() || appForm.bank_account_holder.length < 2) {
      toast.error('Nama pemilik rekening sesuai buku tabungan wajib diisi.')
      return false
    }
    if (!appForm.agreedToTerms) {
      toast.error('Anda harus menyetujui Syarat & Ketentuan Penjual Krafita.')
      return false
    }
    return true
  }

  // Handle Submit Application (Step 4 -> Step 5)
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep4()) return

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await submitVendorApplicationAction({
        name: appForm.name.trim(),
        slug: appForm.slug.trim(),
        phone: appForm.phone.trim(),
        pickup_address: appForm.pickup_address.trim(),
        city: appForm.city.trim(),
        province: appForm.province.trim(),
        postal_code: appForm.postal_code.trim(),
        couriers: appForm.couriers,
        bank_name: appForm.bank_name.trim(),
        bank_account_number: appForm.bank_account_number.trim(),
        bank_account_holder: appForm.bank_account_holder.trim(),
      })

      if (res.success && res.shop) {
        setShop(res.shop)
        setShopMeta({
          pickup_address: appForm.pickup_address,
          postal_code: appForm.postal_code,
          couriers: appForm.couriers,
          bank_name: appForm.bank_name,
          bank_account_number: appForm.bank_account_number,
          bank_account_holder: appForm.bank_account_holder,
        })
        setCurrentStep(5)
        toast.success('Pendaftaran toko berhasil dikirim! Menunggu verifikasi moderator.')
      } else {
        setErrorMsg(res.error || 'Gagal mengirim pendaftaran toko.')
        toast.error(res.error || 'Gagal mengirim pendaftaran')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server.')
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  // Check Status Refresher (Step 5)
  const handleCheckStatus = async () => {
    setCheckingStatus(true)
    try {
      const res = await getVendorApplicationStatusAction()
      if (res.success && res.shop) {
        setShop(res.shop)
        if (res.metadata) setShopMeta(res.metadata)

        if (res.shop.status === 'approved') {
          toast.success('Kabar baik! Toko Anda telah disetujui oleh moderator!')
          setCurrentStep(6)
        } else if (res.shop.status === 'active') {
          toast.success('Toko Anda sudah berstatus aktif penuh!')
          router.push('/vendor')
        } else if (res.shop.status === 'rejected') {
          toast.error(`Pendaftaran ditolak: ${res.metadata?.moderator_notes || 'Silakan tinjau kembali data Anda'}`)
        } else {
          toast.info('Pendaftaran toko Anda masih dalam antrean tinjauan moderator.')
        }
      }
    } catch {
      toast.error('Gagal mengecek status pendaftaran')
    } finally {
      setCheckingStatus(false)
    }
  }

  // Handle Submit First Product (Step 6 -> Vendor Dashboard)
  const handleSubmitFirstProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productForm.title.trim() || productForm.title.length < 3) {
      toast.error('Nama produk minimal 3 karakter.')
      return
    }
    if (!productForm.slug.trim()) {
      toast.error('Slug produk wajib diisi.')
      return
    }
    if (productForm.price < 1000) {
      toast.error('Harga produk minimal Rp 1.000.')
      return
    }
    if (productForm.stock < 1) {
      toast.error('Stok produk minimal 1 unit.')
      return
    }
    if (!productForm.description.trim() || productForm.description.length < 10) {
      toast.error('Deskripsi produk minimal 10 karakter.')
      return
    }
    if (productForm.images.length === 0) {
      toast.error('Silakan unggah minimal 1 foto produk.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await submitFirstProductAction({
        title: productForm.title.trim(),
        slug: productForm.slug.trim(),
        categoryId: productForm.categoryId,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        description: productForm.description.trim(),
        images: productForm.images,
      })

      if (res.success) {
        toast.success('Selamat! Produk pertama berhasil diterbitkan dan toko Anda resmi aktif!')
        router.push('/vendor')
      } else {
        setErrorMsg(res.error || 'Gagal menerbitkan produk pertama.')
        toast.error(res.error || 'Gagal menerbitkan produk')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server.')
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  // Stepper Header Data
  const stepsList = [
    { num: 1, label: 'Mulai' },
    { num: 2, label: 'Info Toko' },
    { num: 3, label: 'Jasa Kirim' },
    { num: 4, label: 'Rekening' },
    { num: 5, label: 'Verifikasi' },
    { num: 6, label: 'Produk #1' },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden transition-all">
      {/* 1. PROGRESS STEPPER HEADER */}
      <div className="bg-muted/40 border-b border-border/80 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#00a699] uppercase tracking-wider">
            Langkah {currentStep} dari 6
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {currentStep === 1 && 'Selamat Datang Calon Vendor'}
            {currentStep === 2 && 'Informasi & Alamat Toko'}
            {currentStep === 3 && 'Pengaturan Jasa Kirim'}
            {currentStep === 4 && 'Rekening Bank Pencairan'}
            {currentStep === 5 && 'Menunggu Verifikasi Moderator'}
            {currentStep === 6 && 'Unggah Produk Pertama Anda'}
          </span>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {stepsList.map((s) => {
            const isCompleted = s.num < currentStep
            const isCurrent = s.num === currentStep
            return (
              <div key={s.num} className="flex flex-col gap-1 items-center">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#00a699]'
                      : isCurrent
                      ? 'bg-[#00a699] ring-2 ring-[#00a699]/30'
                      : 'bg-muted-foreground/20'
                  }`}
                />
                <span
                  className={`text-[10px] hidden sm:block truncate ${
                    isCurrent
                      ? 'font-bold text-[#00a699]'
                      : isCompleted
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 1: MULAI PENDAFTARAN */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00a699]/10 text-[#00a699] flex items-center justify-center shrink-0 shadow-inner">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Mulai Buka Toko di Krafita
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Proses pendaftaran cepat dan terstruktur dalam 6 langkah mudah.
                </p>
              </div>
            </div>

            {/* Checklist Overview Alur */}
            <div className="p-5 rounded-xl border border-border/70 bg-muted/20 space-y-3.5 text-xs text-foreground/90">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00a699]/20 text-[#00a699] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="block text-foreground font-semibold">Atur Informasi Toko</strong>
                  <span className="text-muted-foreground">Nama toko, alamat pengambilan barang (gudang/rumah), dan nomor telepon.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00a699]/20 text-[#00a699] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="block text-foreground font-semibold">Atur Jasa Kirim</strong>
                  <span className="text-muted-foreground">Pilih ekspedisi pengiriman favorit Anda (J&T, SPX Express, JNE, SiCepat, Anteraja).</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00a699]/20 text-[#00a699] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="block text-foreground font-semibold">Masukkan Rekening Bank</strong>
                  <span className="text-muted-foreground">Informasi rekening bank untuk keperluan pencairan hasil penjualan Anda.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00a699]/20 text-[#00a699] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="block text-foreground font-semibold">Verifikasi Moderator</strong>
                  <span className="text-muted-foreground">Tinjauan cepat oleh tim moderator Krafita untuk menjamin keamanan marketplace.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00a699]/20 text-[#00a699] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  5
                </div>
                <div>
                  <strong className="block text-foreground font-semibold">Unggah Produk Pertama</strong>
                  <span className="text-muted-foreground">Unggah minimal 1 produk untuk mengaktifkan toko Anda dan mulai jualan.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Mulai Pendaftaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 2: ATUR INFORMASI TOKO */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <Store className="w-5 h-5 text-[#00a699]" />
                Atur Informasi & Lokasi Toko
              </h2>
              <p className="text-xs text-muted-foreground">
                Masukkan detail toko serta alamat penjemputan barang kurir ekspedisi.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Nama Toko <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={appForm.name}
                    onChange={handleStoreNameChange}
                    placeholder="Contoh: Toko Kerajinan Berkah"
                    className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Slug URL Toko <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={appForm.slug}
                    onChange={(e) =>
                      setAppForm((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      }))
                    }
                    placeholder="toko-kerajinan-berkah"
                    className="w-full h-10 px-3 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00a699]" />
                  Nomor Telepon / WhatsApp Toko <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={appForm.phone}
                  onChange={(e) => setAppForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Contoh: 081234567890"
                  className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00a699]" />
                  Alamat Pengambilan Barang (Gudang/Rumah Anda) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={appForm.pickup_address}
                  onChange={(e) => setAppForm((prev) => ({ ...prev, pickup_address: e.target.value }))}
                  placeholder="Masukkan nama jalan, nomor rumah/gudang, RT/RW, dan patokan alamat penjemputan barang..."
                  className="w-full p-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Kota/Kabupaten <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={appForm.city}
                    onChange={(e) => setAppForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Jakarta Barat"
                    className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Provinsi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={appForm.province}
                    onChange={(e) => setAppForm((prev) => ({ ...prev, province: e.target.value }))}
                    placeholder="DKI Jakarta"
                    className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Kode Pos <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={appForm.postal_code}
                    onChange={(e) => setAppForm((prev) => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="11480"
                    className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border/80">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3)
                }}
                className="inline-flex items-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <span>Lanjut: Atur Jasa Kirim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 3: ATUR JASA KIRIM (EKSPEDISI) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#00a699]" />
                Atur Jasa Kirim (Ekspedisi)
              </h2>
              <p className="text-xs text-muted-foreground">
                Pilih ekspedisi pengiriman yang ingin Anda aktifkan untuk melayani pengiriman pesanan pembeli (pilih minimal 1).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {POPULAR_COURIERS.map((c) => {
                const isSelected = appForm.couriers.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCourier(c.id)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00a699] bg-[#00a699]/5 ring-1 ring-[#00a699]/30'
                        : 'border-border/80 hover:border-foreground/30 bg-card'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#00a699] border-[#00a699] text-white'
                          : 'border-border bg-background'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{c.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.badgeColor}`}>
                          Reguler
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border/80">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep3()) setCurrentStep(4)
                }}
                className="inline-flex items-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <span>Lanjut: Rekening Bank</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 4: MASUKKAN REKENING BANK & KIRIM PENDAFTARAN */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmitApplication} className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#00a699]" />
                Rekening Bank Pencairan Dana
              </h2>
              <p className="text-xs text-muted-foreground">
                Tambahkan nomor rekening bank Anda untuk keperluan pencairan dana hasil penjualan pesanan secara berkala.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#00a699]" />
                  Nama Bank <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={appForm.bank_name}
                  onChange={(e) => setAppForm((prev) => ({ ...prev, bank_name: e.target.value }))}
                  className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] cursor-pointer"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Nomor Rekening Bank <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={appForm.bank_account_number}
                  onChange={(e) => setAppForm((prev) => ({ ...prev, bank_account_number: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Contoh: 1234567890"
                  className="w-full h-10 px-3 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Nama Pemilik Rekening (Sesuai Buku Tabungan) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={appForm.bank_account_holder}
                  onChange={(e) => setAppForm((prev) => ({ ...prev, bank_account_holder: e.target.value }))}
                  placeholder="Contoh: BUDI SANTOSO"
                  className="w-full h-10 px-3 text-xs uppercase bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>

              {/* Syarat & Ketentuan */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={appForm.agreedToTerms}
                    onChange={(e) => setAppForm((prev) => ({ ...prev, agreedToTerms: e.target.checked }))}
                    className="w-4 h-4 rounded-xs border-border text-[#00a699] focus:ring-[#00a699] mt-0.5 cursor-pointer"
                  />
                  <span className="text-foreground/90 leading-relaxed">
                    Saya menyatakan data toko, alamat pengambilan, dan rekening bank di atas adalah benar serta menyetujui Ketentuan Penjual Krafita.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border/80">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim Pendaftaran...
                  </>
                ) : (
                  <>
                    <span>Kirim Pendaftaran Toko</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 5: MENUNGGU VERIFIKASI MODERATOR */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 text-center sm:text-left">
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                  Status: Menunggu Verifikasi Moderator
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Pendaftaran Toko Sedang Ditinjau
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Terima kasih telah mendaftar! Tim moderator Krafita sedang meninjau kelengkapan informasi toko Anda. Setelah disetujui, Anda dapat langsung mengunggah produk pertama.
                </p>
              </div>
            </div>

            {/* Ringkasan Data Pengajuan Toko */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-left">
                Ringkasan Pendaftaran Toko
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                  <span className="text-muted-foreground font-medium block">Nama & Kontak Toko</span>
                  <p className="font-bold text-foreground text-sm">{shop?.name || appForm.name}</p>
                  <p className="text-muted-foreground font-mono">{shop?.phone || appForm.phone}</p>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                  <span className="text-muted-foreground font-medium block">Alamat Pengambilan (Gudang)</span>
                  <p className="font-semibold text-foreground truncate">{shopMeta.pickup_address || appForm.pickup_address}</p>
                  <p className="text-muted-foreground">{shop?.city || appForm.city}, {shop?.province || appForm.province} {shopMeta.postal_code || appForm.postal_code}</p>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                  <span className="text-muted-foreground font-medium block">Ekspedisi Aktif</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(shopMeta.couriers || appForm.couriers).map((cId) => (
                      <span key={cId} className="px-2 py-0.5 rounded-full bg-[#00a699]/15 text-[#00a699] font-bold text-[10px] uppercase">
                        {cId}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                  <span className="text-muted-foreground font-medium block">Rekening Bank Pencairan</span>
                  <p className="font-semibold text-foreground">{shopMeta.bank_name || appForm.bank_name}</p>
                  <p className="font-mono text-muted-foreground">{shopMeta.bank_account_number || appForm.bank_account_number} a.n {shopMeta.bank_account_holder || appForm.bank_account_holder}</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/80">
              <Link
                href="/moderator/vendors"
                className="text-xs font-semibold text-[#00a699] hover:underline flex items-center gap-1"
              >
                <span>Buka Panel Moderator</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                className="inline-flex items-center justify-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
                <span>{checkingStatus ? 'Memeriksa...' : 'Periksa Status Terkini'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 6: UPLOAD PRODUK PERTAMA (STATUS APPROVED) */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <form onSubmit={handleSubmitFirstProduct} className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Selamat! Toko Anda Telah Disetujui Moderator
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Untuk menyelesaikan pendaftaran dan mulai berjualan resmi, silakan unggah minimal 1 produk pertama toko Anda di bawah ini.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-left flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-[#00a699]" />
                Formulir Produk Pertama
              </h4>

              {/* Upload Foto Produk */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">
                  Foto Produk <span className="text-rose-500">*</span>
                </label>
                <ImageUploader
                  bucket="product-images"
                  multiple
                  maxFiles={5}
                  value={productForm.images}
                  onChange={(urls) =>
                    setProductForm((prev) => ({
                      ...prev,
                      images: Array.isArray(urls) ? urls : [urls],
                    }))
                  }
                  label="Unggah Foto Produk Pertama"
                  description="Format JPG, PNG, atau WebP. Foto cover yang menarik akan meningkatkan penjualan."
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">
                  Nama / Judul Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={handleProductTitleChange}
                  placeholder="Contoh: Kemeja Batik Katun Pria Lengan Panjang Premium"
                  className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Kategori Produk (12 Kategori) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] cursor-pointer"
                  >
                    {effectiveCategories.map((c) => (
                      <option key={c.id || c.slug} value={c.id || c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Slug Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.slug}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      }))
                    }
                    placeholder="kemeja-batik-katun-pria"
                    className="w-full h-10 px-3 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Harga Jual (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={productForm.price}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Stok Awal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={productForm.stock}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">
                  Deskripsi Produk <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Jelaskan bahan, ukuran, keunggulan, dan detail produk pertama Anda..."
                  className="w-full p-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end border-t border-border/80">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menerbitkan & Mengaktifkan Toko...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terbitkan Produk & Buka Toko</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
