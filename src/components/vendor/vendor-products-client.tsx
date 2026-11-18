'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Archive,
  Trash2,
  RotateCcw,
  Loader2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  archiveProductAction,
  deleteProductAction,
  deleteMultipleProductsAction,
  getVendorProductsAction,
} from '@/actions/vendor'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface VendorProductsClientProps {
  initialProducts: any[]
}

const ITEMS_PER_PAGE = 10

const STATUS_ITEMS = {
  all: 'Semua Status',
  published: 'Tayang',
  draft: 'Draf',
  archived: 'Diarsipkan',
}

export function VendorProductsClient({ initialProducts }: VendorProductsClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>(initialProducts)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Seleksi Massal Checkbox
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  // Single delete target
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)

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

  // Handlers untuk filter status & search yang mereset page dan pilihan
  const handleFilterStatusChange = (val: string | null) => {
    setFilterStatus(val || 'all')
    setCurrentPage(1)
    setSelectedIds([])
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
    setSelectedIds([])
  }

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Filter list
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesStatus && matchesSearch
    })
  }, [products, filterStatus, searchQuery])

  // Client-side pagination (10 items per page)
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // Cek apakah semua produk yang difilter telah terseleksi (Select All)
  const isAllSelected =
    filtered.length > 0 &&
    filtered.every((p) => selectedIds.includes(p.id))

  const isSomeSelected =
    selectedIds.length > 0 && !isAllSelected

  // Toggle Select All untuk seluruh produk yang difilter
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((p) => p.id))
    }
  }

  // Toggle single item checkbox
  const handleToggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Arsipkan produk
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

  // Tampilkan kembali produk
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

  // Hapus produk individual
  const confirmDeleteAction = async () => {
    if (!deleteTarget) return
    const { id } = deleteTarget
    setLoadingId(id)
    try {
      const res = await deleteProductAction(id)
      if (res.success) {
        toast.success('Produk berhasil dihapus.')
        setProducts((prev) => prev.filter((item) => item.id !== id))
        setSelectedIds((prev) => prev.filter((item) => item !== id))
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

  // Hapus Massal Produk Terpilih
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsBulkDeleting(true)
    try {
      const res = await deleteMultipleProductsAction(selectedIds)
      if (res.success) {
        toast.success(`${res.deletedCount} produk berhasil dihapus.`)
        if (res.error) {
          toast.warning(res.error)
        }
        const deletedSet = new Set(res.deletedIds)
        setProducts((prev) => prev.filter((item) => !deletedSet.has(item.id)))
        setSelectedIds((prev) => prev.filter((id) => !deletedSet.has(id)))
        setBulkDeleteOpen(false)
      } else {
        toast.error(res.error || 'Gagal menghapus produk terpilih.')
      }
    } catch {
      toast.error('Gagal menghubungi server saat menghapus massal.')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar & Search */}
      <div className="flex items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            Produk Saya
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola katalog, stok, varian, dan etalase toko Anda
          </p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-1.5 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </Link>
      </div>

      {/* 2. Filter Status Dropdown (Shadcn UI Select) & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Shadcn UI Select untuk Filter Status */}
        <div className="w-full sm:w-52">
          <Select
            items={STATUS_ITEMS}
            value={filterStatus}
            onValueChange={handleFilterStatusChange}
          >
            <SelectTrigger className="w-full h-9 text-xs bg-background cursor-pointer">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="published">Publikasi</SelectItem>
              <SelectItem value="draft">Draf</SelectItem>
              <SelectItem value="archived">Diarsipkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00a699] placeholder:text-muted-foreground text-foreground"
          />
        </div>
      </div>

      {/* 3. Bar Aksi Massal saat Checkbox Aktif (Gambar 3) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#00a699]/10 border border-[#00a699]/30 text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#00a699]">
              {selectedIds.length} produk terpilih
            </span>
            <span className="text-muted-foreground text-[11px]">
              (dari total {filtered.length} produk)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs h-8 cursor-pointer"
            >
              Batalkan
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="text-xs h-8 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </Button>
          </div>
        </div>
      )}

      {/* 4. Tabel Produk */}
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
        <div className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                {/* Header Kolom dengan Checkbox Select All */}
                <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/80">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isAllSelected}
                          indeterminate={isSomeSelected}
                          onCheckedChange={handleToggleSelectAll}
                          aria-label="Pilih Semua Produk"
                          className="cursor-pointer"
                        />
                      </div>
                    </th>
                    <th className="py-3 px-4 min-w-[220px]">Produk</th>
                    <th className="py-3 px-4 min-w-[120px]">SKU</th>
                    <th className="py-3 px-4 min-w-[140px]">Kategori</th>
                    <th className="py-3 px-4 min-w-[120px]">Harga Dasar</th>
                    <th className="py-3 px-4 min-w-[100px] text-center">Status</th>
                    <th className="py-3 px-4 w-14 text-center">Aksi</th>
                  </tr>
                </thead>

                {/* Isi Baris Tabel: Seluruh Baris Bisa Diklik (Kriteria 4) */}
                <tbody className="divide-y divide-border/60">
                  {paginatedProducts.map((prod) => {
                    const coverImage =
                      prod.product_images?.[0]?.path || '/placeholder-product.jpg'
                    const categoryName = prod.categories?.name || 'Umum'
                    const isSelected = selectedIds.includes(prod.id)

                    return (
                      <tr
                        key={prod.id}
                        onClick={() => router.push(`/products/${prod.slug || prod.id}`)}
                        className={`hover:bg-muted/40 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                        }`}
                        title="Klik baris untuk melihat halaman detail produk"
                      >
                        {/* 1. Checkbox (stopPropagation agar tidak memicu onClick baris) */}
                        <td
                          className="py-3 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleSelectItem(prod.id)}
                              aria-label={`Pilih ${prod.title}`}
                              className="cursor-pointer"
                            />
                          </div>
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
                              <p className="font-bold text-foreground truncate max-w-xs group-hover:text-[#00a699] transition-colors">
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

                        {/* 6. Status Badge */}
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

                        {/* 7. Aksi Dropdown (Tombol Detail telah dihapus sesuai Kriteria 4) */}
                        <td
                          className="py-3 px-4 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Pilihan Aksi"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-36 text-xs shadow-md">
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

                              {/* Hapus Produk Individual */}
                              <DropdownMenuItem
                                onClick={() =>
                                  setDeleteTarget({ id: prod.id, title: prod.title })
                                }
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

          {/* 5. Pagination Bar Client-side (10 item per halaman) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground px-1">
            <div>
              Menampilkan{' '}
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{' '}
              -{' '}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
              </span>{' '}
              dari <span className="font-semibold text-foreground">{filtered.length}</span> produk
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {/* Tombol Previous */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>

              {/* Indikator Halaman */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true
                    if (page === 1 || page === totalPages) return true
                    return Math.abs(page - currentPage) <= 1
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1]
                    const showEllipsis = prev && page - prev > 1

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-1 text-muted-foreground">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            currentPage === page
                              ? 'bg-[#00a699] text-white shadow-xs'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    )
                  })}
              </div>

              {/* Tombol Next */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 text-xs cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Massal (Kriteria 3 - Shadcn AlertDialog & Alert) */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto sm:mx-0 mb-1">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <AlertDialogTitle>Hapus {selectedIds.length} Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus {selectedIds.length} produk yang dipilih?
            </AlertDialogDescription>

            {/* Komponen Alert Shadcn UI untuk peringatan integritas data */}
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <AlertDialogCancel
              disabled={isBulkDeleting}
              onClick={() => setBulkDeleteOpen(false)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isBulkDeleting}
              onClick={handleBulkDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
            >
              {isBulkDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Hapus Semua Terpilih</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Konfirmasi Hapus Single (Shadcn AlertDialog & Alert) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk <strong>"{deleteTarget?.title}"</strong>.
            </AlertDialogDescription>

            {/* Komponen Alert Shadcn UI untuk konfirmasi hapus */}
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <AlertDialogCancel
              disabled={!!loadingId}
              onClick={() => setDeleteTarget(null)}

            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!!loadingId}
              onClick={confirmDeleteAction}
              className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
            >
              {loadingId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Hapus Produk</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
