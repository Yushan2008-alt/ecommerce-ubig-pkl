'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Archive,
  Trash2,
  FileCode,
  Star,
  Eye,
  Radio,
} from 'lucide-react'
import { archiveProductAction, deleteProductAction, getVendorProductsAction } from '@/actions/vendor'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface VendorProductsClientProps {
  initialProducts: any[]
}

export function VendorProductsClient({ initialProducts }: VendorProductsClientProps) {
  const [products, setProducts] = useState<any[]>(initialProducts)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Supabase Realtime Subscription untuk tabel products
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('vendor-products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const res = await getVendorProductsAction(filterStatus)
          if (res.success && res.products) {
            setProducts(res.products)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filterStatus])

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // Filter list
  const filtered = products.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const handleArchive = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await archiveProductAction(id)
      if (res.success) {
        toast.success('Produk berhasil diarsipkan.')
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'archived' } : item))
        )
      } else {
        toast.error(res.error || 'Gagal mengarsipkan produk')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${title}" secara permanen?`)) return

    setLoadingId(id)
    try {
      const res = await deleteProductAction(id)
      if (res.success) {
        toast.success('Produk berhasil dihapus.')
        setProducts((prev) => prev.filter((item) => item.id !== id))
      } else {
        toast.error(res.error || 'Gagal menghapus produk')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Katalog Produk Toko
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Kelola stok produk fisik dan aset produk digital toko Anda ({products.length} produk).
          </p>
        </div>

        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-1.5 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Link>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'published', label: 'Tayang (Published)' },
            { id: 'draft', label: 'Draf (Draft)' },
            { id: 'archived', label: 'Diarsipkan (Archived)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#00a699] text-white shadow-xs'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau SKU..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
          />
        </div>
      </div>

      {/* 3. Product Cards / Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Tidak Ada Produk Ditemukan</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? 'Tidak ada produk yang cocok dengan kriteria filter atau pencarian Anda.'
                : 'Mulai etalase toko Anda dengan mengunggah produk pertama.'}
            </p>
          </div>
          <Link
            href="/vendor/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00a699] text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((prod) => {
            const coverImage = prod.product_images?.[0]?.path || '/placeholder-product.jpg'
            const isPhysical = prod.type === 'physical'

            return (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-card border border-border/80 hover:border-[#00a699]/50 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Info Produk Kiri */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                    <Image
                      src={coverImage}
                      alt={prod.title}
                      fill
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPhysical
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                        }`}
                      >
                        {isPhysical ? (
                          <>
                            <Package className="w-3 h-3" /> Fisik
                          </>
                        ) : (
                          <>
                            <FileCode className="w-3 h-3" /> Digital
                          </>
                        )}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : prod.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {prod.status === 'published' && 'Tayang'}
                        {prod.status === 'draft' && 'Draf'}
                        {prod.status === 'archived' && 'Diarsipkan'}
                      </span>

                      {prod.sku && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          SKU: {prod.sku}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-md">
                      {prod.title}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-extrabold text-[#00a699]">
                        {formatPrice(prod.price)}
                      </span>
                      {prod.compare_price && prod.compare_price > prod.price && (
                        <span className="line-through text-[11px]">
                          {formatPrice(prod.compare_price)}
                        </span>
                      )}
                      <span>•</span>
                      <span>
                        {isPhysical ? `Stok: ${prod.stock} unit` : 'Unduhan Aset Digital'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {prod.rating_avg || 0} ({prod.rating_count || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Kanan */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Link
                    href={`/products/${prod.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Lihat halaman produk publik"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/vendor/products/${prod.id}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-[#00a699]" />
                    Edit
                  </Link>

                  {prod.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={loadingId === prod.id}
                      onClick={() => handleArchive(prod.id)}
                      className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-amber-600 transition-colors cursor-pointer"
                      title="Arsipkan produk"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={loadingId === prod.id}
                    onClick={() => handleDelete(prod.id, prod.title)}
                    className="p-2 rounded-lg border border-border hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus produk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
