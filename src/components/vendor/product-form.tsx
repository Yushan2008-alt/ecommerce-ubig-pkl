'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUploader } from './image-uploader'
import { DigitalFileUploader } from './digital-file-uploader'
import { saveProductAction } from '@/actions/vendor'
import type { ProductFormInput } from '@/lib/validators'
import { SearchableSelect } from '@/components/ui/searchSelect'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Package,
  FileCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
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
  price: string
  comparePrice: string
  status: 'draft' | 'published' | 'archived'
  sku: string
  stock: string
  weight: string
  flatShippingCost: string
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

const STATUS_OPTIONS: Record<string, string> = {
  published: 'Publikasi',
  draft: 'Draf',
  archived: 'Arsip',
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
    categoryId: initialData?.category_id || '',
    brandId: initialData?.brand_id || null,
    price: initialData?.price !== undefined && initialData?.price !== null ? String(initialData.price) : '',
    comparePrice:
      initialData?.compare_price !== undefined && initialData?.compare_price !== null
        ? String(initialData.compare_price)
        : '',
    status: (initialData?.status || 'published') as 'draft' | 'published' | 'archived',
    // Khusus Fisik
    sku: initialData?.sku || '',
    stock: initialData?.stock !== undefined && initialData?.stock !== null ? String(initialData.stock) : '',
    weight: initialData?.weight !== undefined && initialData?.weight !== null ? String(initialData.weight) : '',
    flatShippingCost:
      initialData?.flat_shipping_cost !== undefined && initialData?.flat_shipping_cost !== null
        ? String(initialData.flat_shipping_cost)
        : '',
    productLocation: initialData?.product_location || '',
    attributes: (initialData?.attributes as Record<string, string>) || {},
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

    if (!formData.price.trim()) {
      toast.error('Harga wajib diisi.')
      return
    }

    const parsedPrice = Number(formData.price) || 0
    const parsedComparePrice =
      formData.comparePrice.trim() && Number(formData.comparePrice) > 0
        ? Number(formData.comparePrice)
        : null
    const parsedStock = formData.stock.trim() ? Number(formData.stock) : 0
    const parsedWeight = formData.weight.trim() ? Number(formData.weight) : 0
    const parsedFlatShippingCost = formData.flatShippingCost.trim() ? Number(formData.flatShippingCost) : 0

    if (parsedPrice < 0) {
      toast.error('Harga tidak boleh kurang dari 0.')
      return
    }

    if (formData.type === 'physical' && !formData.stock.trim()) {
      toast.error('Stok produk wajib diisi.')
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
        price: parsedPrice,
        comparePrice: parsedComparePrice,
        status: formData.status,
        sku: formData.type === 'physical' ? formData.sku.trim() || null : null,
        stock: formData.type === 'physical' ? parsedStock : 0,
        weight: formData.type === 'physical' ? parsedWeight : 0,
        flatShippingCost: formData.type === 'physical' ? parsedFlatShippingCost : 0,
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
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {initialData ? `Edit Produk: ${initialData.title}` : 'Tambah Produk'}
          </h1>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. INFORMASI UTAMA PRODUK */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5">
          Informasi Produk
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Judul <span className="text-rose-500">*</span>
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
              Slug <span className="text-rose-500">*</span>
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
            <SearchableSelect
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              value={formData.categoryId}
              onChange={(val) => setFormData((prev) => ({ ...prev, categoryId: val }))}
              placeholder="Pilih Kategori"
              searchPlaceholder="Cari kategori..."
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Deskripsi <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Tuliskan deskripsi lengkap produk..."
            className="w-full p-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* 3. HARGA & STATUS */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5">
          Harga & Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Harga <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-muted-foreground">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formData.price}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData((prev) => ({ ...prev, price: val }))
                }}
                placeholder="0"
                className="w-full h-10 pl-10 pr-3.5 text-xs font-mono font-bold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Diskon</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-muted-foreground">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formData.comparePrice}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData((prev) => ({ ...prev, comparePrice: val }))
                }}
                placeholder="Kosongkan jika tidak diskon"
                className="w-full h-10 pl-10 pr-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Status</label>
            <Select
              items={STATUS_OPTIONS}
              value={formData.status}
              onValueChange={(val) => {
                if (val) {
                  setFormData((prev) => ({
                    ...prev,
                    status: val as 'draft' | 'published' | 'archived',
                  }))
                }
              }}
            >
              <SelectTrigger className="w-full data-[size=default]:h-10 !h-10 px-3 text-xs font-semibold bg-background border border-border rounded-lg">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Publikasi</SelectItem>
                <SelectItem value="draft">Draf</SelectItem>
                <SelectItem value="archived">Arsip</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. KHUSUS PRODUK FISIK */}
      {formData.type === 'physical' && (
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
          <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#00a699]" />
            Inventaris
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">SKU</label>
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
                Stok <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formData.stock}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData((prev) => ({ ...prev, stock: val }))
                }}
                placeholder="0"
                className="w-full h-10 px-3.5 text-xs font-mono font-bold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Berat (Gram)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.weight}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData((prev) => ({ ...prev, weight: val }))
                }}
                placeholder="0"
                className="w-full h-10 px-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>

          {/* Atribut Spesifikasi Tambahan (Key-Value) */}
          <div className="pt-2 space-y-3">
            <label className="text-xs font-bold text-foreground block">
              Spesifikasi Tambahan
            </label>

            {Object.keys(formData.attributes).length > 0 && (
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
            )}

            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="Label"
                value={attrKey}
                onChange={(e) => setAttrKey(e.target.value)}
                className="w-1/2 h-9 px-3 text-xs bg-background border border-border rounded-lg"
              />
              <input
                type="text"
                placeholder="Nilai"
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

      {/* 5. KHUSUS PRODUK DIGITAL */}
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

      {/* 6. GALERI PRODUK */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5">
          Galeri Produk
        </h2>

        <ImageUploader
          bucket="product-images"
          multiple={true}
          maxFiles={5}
          value={formData.images}
          onChange={(imgs) =>
            setFormData((prev) => ({ ...prev, images: Array.isArray(imgs) ? imgs : [imgs] }))
          }
          label=""
          description="Foto pertama menjadi sampul utama."
        />
      </div>

      {/* 7. Bottom Submit Bar */}
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
              Simpan
            </>
          )}
        </button>
      </div>
    </form>
  )
}
