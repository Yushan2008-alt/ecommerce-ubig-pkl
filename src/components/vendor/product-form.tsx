'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUploader } from './image-uploader'
import { DigitalFileUploader } from './digital-file-uploader'
import { saveProductAction, type ProductFormInput } from '@/actions/vendor'
import {
  Package,
  FileCode,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers,
  HelpCircle,
  Info,
  DollarSign,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface ProductFormState {
  id?: string
  type: 'physical' | 'digital'
  title: string
  slug: string
  description: string
  categoryId: string
  brandId: string | null
  price: number
  comparePrice: number | null
  status: 'draft' | 'published' | 'archived'
  sku: string
  stock: number
  weight: number
  flatShippingCost: number
  productLocation: string
  attributes: Record<string, string>
  digitalFile: {
    path: string
    fileName: string
    fileSize: number
    format?: string | null
  } | null
  images: string[]
}

interface ProductFormProps {
  initialData?: any
  categories: { id: string; name: string; slug: string }[]
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Default initial values
  const [formData, setFormData] = useState<ProductFormState>({
    id: initialData?.id || undefined,
    type: (initialData?.type || 'physical') as 'physical' | 'digital',
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    categoryId: initialData?.category_id || categories[0]?.id || '',
    brandId: initialData?.brand_id || null,
    price: initialData?.price ? Number(initialData.price) : 50000,
    comparePrice: initialData?.compare_price ? Number(initialData.compare_price) : null,
    status: (initialData?.status || 'published') as 'draft' | 'published' | 'archived',
    // Khusus Fisik
    sku: initialData?.sku || '',
    stock: initialData?.stock !== undefined ? Number(initialData.stock) : 10,
    weight: initialData?.weight !== undefined ? Number(initialData.weight) : 500,
    flatShippingCost: initialData?.flat_shipping_cost !== undefined ? Number(initialData.flatShippingCost) : 0,
    productLocation: initialData?.product_location || '',
    attributes: (initialData?.attributes as Record<string, string>) || {
      Bahan: '',
      Warna: '',
    },
    // Khusus Digital
    digitalFile: initialData?.digital_files?.[0]
      ? {
          path: initialData.digital_files[0].path || '',
          fileName: initialData.digital_files[0].file_name || '',
          fileSize: initialData.digital_files[0].size ?? initialData.digital_files[0].file_size ?? 0,
          format: initialData.digital_files[0].format || '',
        }
      : null,
    // Galeri Foto
    images: (initialData?.product_images || []).map((img: any) => img.path || img),
  })

  // State untuk tambah atribut fisik dinamis
  const [attrKey, setAttrKey] = useState('')
  const [attrVal, setAttrVal] = useState('')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!initialData) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')

      setFormData((prev) => ({
        ...prev,
        title: val,
        slug: autoSlug,
      }))
    } else {
      setFormData((prev) => ({ ...prev, title: val }))
    }
  }

  const handleAddAttribute = () => {
    if (!attrKey.trim() || !attrVal.trim()) return
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attrKey.trim()]: attrVal.trim(),
      },
    }))
    setAttrKey('')
    setAttrVal('')
  }

  const handleRemoveAttribute = (key: string) => {
    setFormData((prev) => {
      const copy = { ...prev.attributes }
      delete copy[key]
      return { ...prev, attributes: copy }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.title.trim()) {
      toast.error('Judul produk wajib diisi.')
      return
    }

    if (!formData.categoryId) {
      toast.error('Kategori produk wajib dipilih.')
      return
    }

    if (formData.price < 0) {
      toast.error('Harga tidak boleh kurang dari 0.')
      return
    }

    if (formData.type === 'digital' && !formData.digitalFile?.path) {
      toast.error('Silakan unggah berkas file digital terlebih dahulu.')
      return
    }

    if (formData.images.length === 0) {
      toast.error('Minimal unggah 1 foto untuk cover produk.')
      return
    }

    setSubmitting(true)

    try {
      const payload: ProductFormInput = {
        id: formData.id,
        type: formData.type,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        price: Number(formData.price),
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : null,
        status: formData.status,
        sku: formData.type === 'physical' ? formData.sku.trim() || null : null,
        stock: formData.type === 'physical' ? Number(formData.stock) : 0,
        weight: formData.type === 'physical' ? Number(formData.weight) : 0,
        flatShippingCost: formData.type === 'physical' ? Number(formData.flatShippingCost) : 0,
        productLocation: formData.productLocation.trim() || null,
        attributes: formData.type === 'physical' ? formData.attributes : {},
        digitalFile: formData.type === 'digital' ? formData.digitalFile : null,
        images: formData.images,
      }

      const res = await saveProductAction(payload)

      if (res.success) {
        toast.success(
          initialData ? 'Perubahan produk berhasil disimpan!' : 'Produk baru berhasil dipublikasikan!'
        )
        router.push('/vendor/products')
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan produk.')
        toast.error(res.error || 'Gagal menyimpan produk')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server.')
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <Link
            href="/vendor/products"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar Produk
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {initialData ? `Edit Produk: ${initialData.title}` : 'Tambah Produk Baru'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Sistem Single-SKU terpadu untuk produk fisik dan karya digital siap unduh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/vendor/products"
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {initialData ? 'Simpan Perubahan' : 'Terbitkan Produk'}
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. PILIHAN TIPE PRODUK (FISIK VS DIGITAL) */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="space-y-0.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
            Tipe Produk <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-muted-foreground">
            Pilih jenis produk yang ingin Anda pasarkan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Opsi Fisik */}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: 'physical' }))}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              formData.type === 'physical'
                ? 'border-[#00a699] bg-[#00a699]/5 ring-2 ring-[#00a699]/20'
                : 'border-border hover:border-foreground/40 bg-muted/20'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                formData.type === 'physical'
                  ? 'bg-[#00a699] text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Package className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-bold text-foreground block">Produk Fisik</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Barang berwujud yang dikemas dan dikirimkan via kurir (pakaian, kerajinan, sepatu, dll).
              </p>
            </div>
          </button>

          {/* Opsi Digital */}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: 'digital' }))}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              formData.type === 'digital'
                ? 'border-[#00a699] bg-[#00a699]/5 ring-2 ring-[#00a699]/20'
                : 'border-border hover:border-foreground/40 bg-muted/20'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                formData.type === 'digital'
                  ? 'bg-[#00a699] text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <FileCode className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-bold text-foreground block">Produk Digital (Download)</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Berkas unduhan instan (source code, ebook, desain, audio) tanpa ongkir & tanpa stok fisik.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. INFORMASI UTAMA PRODUK */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5">
          Informasi Utama
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Judul Produk <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Contoh: Kemeja Flanel Katun Premium Lengan Panjang"
            className="w-full h-10 px-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Slug URL Produk <span className="text-rose-500">*</span>
            </label>
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
              placeholder="kemeja-flanel-katun-premium"
              className="w-full h-10 px-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Deskripsi Lengkap <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Jelaskan detail spesifikasi produk, kelebihan, bahan, petunjuk pemakaian/unduhan..."
            className="w-full p-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* 4. HARGA & STATUS */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5">
          Harga & Status Publikasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Harga Jual (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-muted-foreground">
                Rp
              </span>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))
                }
                className="w-full h-10 pl-10 pr-3.5 text-xs font-mono font-bold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Harga Coret / Diskon (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-muted-foreground">
                Rp
              </span>
              <input
                type="number"
                min={0}
                step={500}
                value={formData.comparePrice ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    comparePrice: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="Kosongkan jika tidak diskon"
                className="w-full h-10 pl-10 pr-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Status Etalase</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as 'draft' | 'published' | 'archived',
                }))
              }
              className="w-full h-10 px-3 text-xs font-semibold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] cursor-pointer"
            >
              <option value="published">Tayang Langsung (Published)</option>
              <option value="draft">Draf (Hanya Vendor yang melihat)</option>
              <option value="archived">Diarsipkan (Archived)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. KHUSUS PRODUK FISIK */}
      {formData.type === 'physical' && (
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
          <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#00a699]" />
            Inventaris & Pengiriman Fisik (Single-SKU)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Kode SKU Toko</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                placeholder="Mis. KRF-001"
                className="w-full h-10 px-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Stok Barang (Unit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stock: Number(e.target.value) || 0 }))
                }
                className="w-full h-10 px-3.5 text-xs font-mono font-bold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Berat Barang (Gram)</label>
              <input
                type="number"
                min={0}
                value={formData.weight}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, weight: Number(e.target.value) || 0 }))
                }
                placeholder="500"
                className="w-full h-10 px-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>

          {/* Atribut Spesifikasi Tambahan (Key-Value) */}
          <div className="pt-2 space-y-3">
            <label className="text-xs font-bold text-foreground block">
              Spesifikasi Tambahan (Bahan, Warna, Garansi, dll)
            </label>

            <div className="flex flex-wrap gap-2">
              {Object.entries(formData.attributes).map(([k, v]) => (
                <div
                  key={k}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs"
                >
                  <span className="font-bold text-foreground">{k}:</span>
                  <span className="text-muted-foreground">{v}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(k)}
                    className="ml-1 text-muted-foreground hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="Label (mis: Bahan)"
                value={attrKey}
                onChange={(e) => setAttrKey(e.target.value)}
                className="w-1/2 h-9 px-3 text-xs bg-background border border-border rounded-lg"
              />
              <input
                type="text"
                placeholder="Nilai (mis: Katun 100%)"
                value={attrVal}
                onChange={(e) => setAttrVal(e.target.value)}
                className="w-1/2 h-9 px-3 text-xs bg-background border border-border rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddAttribute}
                className="px-3 h-9 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg border border-border cursor-pointer shrink-0"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. KHUSUS PRODUK DIGITAL */}
      {formData.type === 'digital' && (
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
          <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#00a699]" />
            Berkas Unduhan Digital
          </h2>

          <DigitalFileUploader
            value={formData.digitalFile}
            onChange={(file) => setFormData((prev) => ({ ...prev, digitalFile: file }))}
          />
        </div>
      )}

      {/* 7. GALERI GAMBAR PRODUK */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5">
          Galeri Foto Produk
        </h2>

        <ImageUploader
          bucket="product-images"
          multiple={true}
          maxFiles={5}
          value={formData.images}
          onChange={(imgs) =>
            setFormData((prev) => ({ ...prev, images: Array.isArray(imgs) ? imgs : [imgs] }))
          }
          label="Foto Produk (Maks. 5 Foto)"
          description="Foto pertama akan menjadi foto sampul utama. WebP otomatis dikompresi ≤ 1600px."
        />
      </div>

      {/* 8. Bottom Submit Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
        <Link
          href="/vendor/products"
          className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {initialData ? 'Simpan Perubahan' : 'Terbitkan Produk'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
