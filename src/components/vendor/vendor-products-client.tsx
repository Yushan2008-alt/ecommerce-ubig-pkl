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
  RotateCcw,
  Loader2,
  MoreHorizontal,
  Radio,
} from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
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

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

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

    const formatDate = (dateString: string) => {
        if (!dateString) return '-'
        return new
        Date(dateString).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      }

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

  const handleUnarchive = async (id: string) => {
    setLoadingId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', id)
      if (!error) {
        toast.success('Produk berhasil diaktifkan kembali ke etalase!')
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'published' } : item))
        )
      } else {
        toast.error('Gagal mengaktifkan produk')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoadingId(null)
    }
  }

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return
    const { id } = deleteTarget
    setLoadingId(id)
    try {
      const res = await deleteProductAction(id)
      if (res.success) {
        toast.success('Produk berhasil dihapus.')
        setProducts((prev) => prev.filter((item) => item.id !== id))
        setDeleteTarget(null)
      } else {
        toast.error(res.error || 'Gagal menghapus produk')
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
      <div className="flex items-center justify-between gap-4 pb-1">
        <h1 className="text-base sm:text-lg font-bold text-foreground">
          Produk Saya
        </h1>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-1.5 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </Link>
      </div>

            {/* 2. Filter Status Dropdown & Search Bar (Tanpa Card Pembungkus) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Dropdown Filter Status */}
        <div className="w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-9 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00a699] text-foreground cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="published">Tayang</option>
            <option value="draft">Draf</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00a699] placeholder:text-muted-foreground"
          />
        </div>
      </div>

                  {/* 3. Tampilan Tabel Produk Sesuai Referensi Gambar */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-card border border-border/80 space-y-3">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Tidak Ada Produk</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? 'Tidak ada produk yang cocok dengan pencarian atau filter Anda.'
                : 'Belum ada produk. Mulai dengan menambahkan produk pertama Anda.'}
            </p>
          </div>

        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              {/* Header Kolom Sesuai Gambar */}
              <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/80">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-border text-[#00a699] w-4 h-4 cursor-pointer focus:ring-primary"
                    />
                  </th>
                  <th className="py-3 px-4 min-w-[220px]">Produk</th>
                  <th className="py-3 px-4 min-w-[120px]">SKU</th>
                  <th className="py-3 px-4 min-w-[140px]">Kategori</th>
                  <th className="py-3 px-4 min-w-[120px]">Harga Dasar</th>
                  <th className="py-3 px-4 min-w-[100px] text-center">Status</th>
                  <th className="py-3 px-4 w-14 text-center">Aksi</th>
                </tr>
              </thead>

              {/* Isi Baris Tabel Sesuai Gambar */}
              <tbody className="divide-y divide-border/60">
                {filtered.map((prod) => {
                  const coverImage = prod.product_images?.[0]?.path || '/placeholder-product.jpg'
                  const categoryName = prod.categories?.name || 'Umum'
                  const isCurrentLoading = loadingId === prod.id

                  return (
                    <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                      {/* 1. Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-border text-[#00a699] w-4 h-4 cursor-pointer focus:ring-primary"
                        />
                      </td>

                      {/* 2. Produk: Foto + Nama (Bold) + Tanggal Dibuat */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                            <Image
                              src={coverImage}
                              alt={prod.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate max-w-xs">
                              {prod.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatDate(prod.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 3. SKU */}
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {prod.sku || '-'}
                      </td>

                      {/* 4. Kategori */}
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {categoryName}
                      </td>

                      {/* 5. Harga Dasar */}
                      <td className="py-3 px-4 text-xs font-semibold text-foreground whitespace-nowrap">
                        {formatPrice(prod.price)}
                      </td>

                      {/* 6. Status (Badge Oval Minimalis Persis Gambar) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {prod.status === 'published' ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Publikasi
                          </span>
                        ) : prod.status === 'archived' ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                            Arsip
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            Draf
                          </span>
                        )}
                      </td>

                                            {/* 7. Aksi (Tombol Titik Tiga '...') */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <DropdownMenu>
                          {/* Trigger langsung menjadi tombol tanpa 'asChild' */}
                          <DropdownMenuTrigger
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Pilihan Aksi"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-36 text-xs shadow-md">
                            {/* Lihat Produk */}
                            <DropdownMenuItem className="p-0">
                              <Link
                                href={`/products/${prod.slug}`}
                                target="_blank"
                                className="flex items-center gap-2 w-full px-2.5 py-1.5 cursor-pointer text-foreground"
                              >
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>Lihat</span>
                              </Link>
                            </DropdownMenuItem>

                            {/* Edit Produk */}
                            <DropdownMenuItem className="p-0">
                              <Link
                                href={`/vendor/products/${prod.id}/edit`}
                                className="flex items-center gap-2 w-full px-2.5 py-1.5 cursor-pointer text-foreground"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#00a699]" />
                                <span>Edit</span>
                              </Link>
                            </DropdownMenuItem>

                            {/* Arsipkan / Aktifkan Kembali */}
                            {prod.status === 'archived' ? (
                              <DropdownMenuItem
                                onClick={() => handleUnarchive(prod.id)}
                                className="flex items-center gap-2 cursor-pointer text-emerald-600 px-2.5 py-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Tampilkan</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleArchive(prod.id)}
                                className="flex items-center gap-2 cursor-pointer text-amber-600 px-2.5 py-1.5"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                <span>Arsipkan</span>
                              </DropdownMenuItem>
                            )}

                            {/* Hapus Produk */}
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget({ id: prod.id, title: prod.title })}
                              className="flex items-center gap-2 cursor-pointer text-rose-600 px-2.5 py-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
       <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk <strong>"{deleteTarget?.title}"</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!!loadingId}
              onClick={confirmDeleteAction}
              className="px-4 py-2 text-xs font-medium rounded-md bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {loadingId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Hapus Produk</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
