'use client'

import React, { useState } from 'react'
import { ImageUploader } from './image-uploader'
import { updateShopSettingsAction, type ShopSettingsInput } from '@/actions/vendor'
import {
  Store,
  Truck,
  MessageCircle,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

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
}

interface VendorSettingsClientProps {
  initialShop: ShopSettingsData
}

export function VendorSettingsClient({ initialShop }: VendorSettingsClientProps) {
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: initialShop.name || '',
    slug: initialShop.slug || '',
    description: initialShop.description || '',
    logoUrl: initialShop.logo_url || '',
    flatShippingCost: Number(initialShop.flat_shipping_cost) || 0,
    whatsapp: initialShop.whatsapp || '',
    phone: initialShop.phone || '',
    city: initialShop.city || '',
    province: initialShop.province || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.name.trim() || formData.name.length < 2) {
      toast.error('Nama toko wajib diisi (minimal 2 karakter).')
      return
    }

    setSubmitting(true)

    try {
      const payload: ShopSettingsInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        logoUrl: formData.logoUrl || null,
        flatShippingCost: Number(formData.flatShippingCost) || 0,
        whatsapp: formData.whatsapp.trim() || null,
        phone: formData.phone.trim() || null,
        city: formData.city.trim() || null,
        province: formData.province.trim() || null,
      }

      const res = await updateShopSettingsAction(payload)

      if (res.success) {
        toast.success('Pengaturan profil toko berhasil diperbarui!')
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan pengaturan toko.')
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
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Pengaturan Toko
          </h1>
          <p className="text-xs text-muted-foreground">
            Perbarui informasi etalase toko, logo, kontak WhatsApp, dan tarif flat ongkir.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 self-start sm:self-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Profil Toko & Logo */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5 flex items-center gap-2">
          <Store className="w-4 h-4 text-[#00a699]" />
          Identitas & Etalase Toko
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Nama Toko <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full h-10 px-3.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Domain / Slug Toko</label>
            <div className="flex items-center">
              <span className="h-10 px-3 flex items-center text-xs font-mono bg-muted/60 text-muted-foreground border border-r-0 border-border rounded-l-lg select-none">
                krafita.com/shop/
              </span>
              <input
                type="text"
                disabled
                value={formData.slug}
                className="w-full h-10 px-3.5 text-xs font-mono bg-muted/40 text-muted-foreground border border-border rounded-r-lg cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              *Slug toko bersifat permanen untuk memastikan tautan etalase Anda tidak rusak.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Deskripsi Toko</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Jelaskan jenis karya dan produk yang Anda pasarkan..."
            className="w-full p-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] resize-none"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          <ImageUploader
            bucket="shop-assets"
            value={formData.logoUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url as string }))}
            label="Logo / Avatar Toko"
            description="Format WebP/PNG/JPG. Otomatis dikompresi ≤ 1600px."
          />
        </div>
      </div>

      {/* 3. Pengiriman & Kontak */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#00a699]" />
          Pengiriman & Komunikasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Tarif Flat Ongkir Toko (Rp) <span className="text-rose-500">*</span>
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
              Tarif flat per pesanan toko untuk produk fisik. Isi 0 jika gratis ongkir.
            </p>
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
                placeholder="08123456789"
                className="w-full h-10 pl-10 pr-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Kota Asal Pickup</label>
            <input
              type="text"
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
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </>
          )}
        </button>
      </div>
    </form>
  )
}
