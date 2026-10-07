'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  LogIn,
  Store,
  MapPin,
  Truck,
  FileText,
  Check,
  Sparkles,
} from 'lucide-react'
import { useCartWishlist, CartItem } from '@/context/cart-wishlist-context'
import { useLanguage } from '@/context/language-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface GroupedShop {
  shopId: string
  shopName: string
  shopSlug: string
  shopCity: string | null
  flatShippingCost: number
  hasPhysical: boolean
  effectiveShippingCost: number
  subtotal: number
  items: CartItem[]
}

export default function CartPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const {
    cartItems,
    updateCartQty,
    updateBuyerNote,
    removeFromCart,
    clearCart,
    cartCount,
  } = useCartWishlist()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState<string>('')
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null)
    })
  }, [])

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace(/\s+/g, '')
  }

  // Pengelompokan cart items berdasarkan toko (shopId / vendor)
  const shopGroups = useMemo<GroupedShop[]>(() => {
    const map = new Map<string, GroupedShop>()

    for (const item of cartItems) {
      const shopKey = item.shopId || item.vendor || 'krafita-default'
      const shopName = item.shopName || item.vendor || 'Toko Krafita'
      const shopSlug = item.shopSlug || ''
      const shopCity = item.shopCity || null
      const flatShippingCost = item.flatShippingCost || 0

      if (!map.has(shopKey)) {
        map.set(shopKey, {
          shopId: shopKey,
          shopName,
          shopSlug,
          shopCity,
          flatShippingCost,
          hasPhysical: false,
          effectiveShippingCost: 0,
          subtotal: 0,
          items: [],
        })
      }

      const grp = map.get(shopKey)!
      grp.items.push(item)
      grp.subtotal += item.price * item.qty
      if (!item.isDigital) {
        grp.hasPhysical = true
      }
    }

    // Hitung ongkir efektif: 0 jika semua digital, flatShippingCost jika ada fisik
    const groups: GroupedShop[] = []
    for (const grp of map.values()) {
      grp.effectiveShippingCost = grp.hasPhysical ? grp.flatShippingCost : 0
      groups.push(grp)
    }

    return groups
  }, [cartItems])

  // Ringkasan total
  const totalProductsPrice = useMemo(() => {
    return shopGroups.reduce((acc, g) => acc + g.subtotal, 0)
  }, [shopGroups])

  const totalShippingFee = useMemo(() => {
    return shopGroups.reduce((acc, g) => acc + g.effectiveShippingCost, 0)
  }, [shopGroups])

  const grandTotal = totalProductsPrice + totalShippingFee

  // Handler Note Modal/Inline
  const handleOpenNote = (item: CartItem) => {
    setEditingNoteId(item.id)
    setNoteText(item.buyerNote || '')
  }

  const handleSaveNote = async (item: CartItem) => {
    setIsSavingNote(true)
    await updateBuyerNote(item.id, noteText.trim())
    setIsSavingNote(false)
    setEditingNoteId(null)
    toast.success(t.note_saved)
  }

  const handleProceedToCheckout = async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()

    if (!data?.user) {
      toast.info(t.login_required_checkout, {
        description: t.login_required_checkout_desc,
        duration: 4000,
      })
      router.push(`/login?next=${encodeURIComponent('/checkout')}`)
    } else {
      router.push('/checkout')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-muted-foreground mb-6 gap-2">
          <Link href="/" className="hover:text-primary transition-colors">
            {t.home}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t.cart_page_title}</span>
        </nav>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/80 gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <ShoppingCart className="w-6 h-6 text-[#00a699]" />
              {t.cart_page_title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {cartCount > 0
                ? `${cartCount} ${t.items_count} • ${shopGroups.length} ${t.shop_badge}`
                : t.cart_empty_title}
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-rose-600 transition-colors self-start sm:self-auto flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.clear_cart}
            </button>
          )}
        </div>

        {/* Guest Info Alert: Menjelaskan guest bisa menambah produk, login saat checkout */}
        {!currentUser && cartItems.length > 0 && (
          <div className="mb-6 p-4 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <LogIn className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{t.login_required_checkout}</span>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                {t.login_required_checkout_desc}
              </p>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border/80 rounded-md p-10 sm:p-16 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#00a699]/10 text-[#00a699] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground mb-1.5">
              {t.cart_empty_title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6">
              {t.cart_empty_desc}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-md shadow-xs transition-colors"
            >
              {t.shop_now}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Cart Content: Two Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Daftar Produk Dikelompokkan Per Toko */}
            <div className="lg:col-span-8 space-y-6">
              {shopGroups.map((group) => (
                <div
                  key={group.shopId}
                  className="bg-card border border-border/80 rounded-md overflow-hidden shadow-xs divide-y divide-border/60"
                >
                  {/* Shop Group Header */}
                  <div className="p-4 sm:px-5 sm:py-3.5 bg-muted/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#00a699]" />
                      <span className="font-semibold text-xs sm:text-sm text-foreground">
                        {group.shopName}
                      </span>
                      {group.shopCity && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/60">
                          <MapPin className="w-3 h-3" />
                          {group.shopCity}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Truck className="w-3.5 h-3.5 text-muted-foreground/80" />
                      {group.hasPhysical ? (
                        <span>
                          {t.flat_shipping}:{' '}
                          <span className="font-semibold text-foreground">
                            {formatPrice(group.flatShippingCost)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {t.free_shipping_digital}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Header Kolom */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-background/50">
                    <div className="col-span-6">{t.products}</div>
                    <div className="col-span-2 text-right">{t.unit_price}</div>
                    <div className="col-span-2 text-center">{t.quantity}</div>
                    <div className="col-span-2 text-right">{t.subtotal}</div>
                  </div>

                  {/* Items dalam toko */}
                  {group.items.map((item) => (
                    <div key={item.id} className="p-4 sm:px-5 sm:py-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {/* Info Produk & Thumbnail */}
                        <div className="sm:col-span-6 flex items-start gap-3.5">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-muted/40 shrink-0 border border-border/60">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover object-center"
                            />
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                              <Link
                                href={`/products/${item.slug}`}
                                className="hover:text-primary transition-colors"
                              >
                                {item.title}
                              </Link>
                            </h3>

                            {/* Badge Tipe Produk */}
                            <div className="flex items-center gap-1.5 pt-0.5">
                              {item.isDigital ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                  Digital
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                  Fisik
                                </span>
                              )}

                              {item.stock !== null &&
                                item.stock !== undefined &&
                                item.stock <= 5 &&
                                !item.isDigital && (
                                  <span className="text-[10px] text-amber-600 font-medium">
                                    Sisa {item.stock}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Harga Satuan */}
                        <div className="sm:col-span-2 sm:text-right flex items-center justify-between sm:block">
                          <span className="sm:hidden text-xs text-muted-foreground">
                            {t.unit_price}:
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-foreground">
                              {formatPrice(item.price)}
                            </div>
                            {item.comparePrice && item.comparePrice > item.price && (
                              <div className="text-[11px] text-muted-foreground line-through">
                                {formatPrice(item.comparePrice)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pengatur Kuantitas */}
                        <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                          <span className="sm:hidden text-xs text-muted-foreground">
                            {t.quantity}:
                          </span>

                          {item.isDigital ? (
                            <div className="text-center">
                              <span className="text-xs font-semibold px-2.5 py-1 bg-muted/60 rounded border border-border/80">
                                1
                              </span>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                Maks. 1
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center border border-border rounded-md bg-background overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, item.qty - 1)}
                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                                aria-label="Kurangi kuantitas"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-medium text-foreground tabular-nums select-none">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, item.qty + 1)}
                                disabled={
                                  item.stock !== null &&
                                  item.stock !== undefined &&
                                  item.qty >= item.stock
                                }
                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Tambah kuantitas"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Subtotal Item & Hapus */}
                        <div className="sm:col-span-2 sm:text-right flex items-center justify-between sm:justify-end gap-3">
                          <span className="sm:hidden text-xs text-muted-foreground">
                            {t.subtotal}:
                          </span>
                          <div className="text-xs sm:text-sm font-bold text-[#00a699] tabular-nums">
                            {formatPrice(item.price * item.qty)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title={t.remove_item}
                            aria-label={t.remove_item}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Catatan Pembeli Per Item (Buyer Note) */}
                      <div className="pt-2 border-t border-border/40 text-xs">
                        {editingNoteId === item.id ? (
                          <div className="space-y-2 bg-muted/20 p-2.5 rounded-md border border-border/60">
                            <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-[#00a699]" />
                                {t.buyer_note}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="hover:text-foreground cursor-pointer"
                              >
                                {t.cancel_note}
                              </button>
                            </div>
                            <input
                              type="text"
                              maxLength={200}
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder={t.note_placeholder}
                              className="w-full text-xs bg-background border border-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveNote(item)}
                                disabled={isSavingNote}
                                className="inline-flex items-center gap-1 bg-[#00a699] hover:bg-[#008f84] text-white text-[11px] font-medium px-3 py-1 rounded transition-colors cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                {isSavingNote ? t.saving : t.save_note}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-muted-foreground">
                            <div className="flex items-center gap-1.5 truncate max-w-[85%]">
                              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              {item.buyerNote ? (
                                <span className="text-foreground italic truncate">
                                  &quot;{item.buyerNote}&quot;
                                </span>
                              ) : (
                                <span className="text-muted-foreground/70">
                                  {t.buyer_note}: -
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenNote(item)}
                              className="text-[11px] text-[#00a699] hover:underline font-medium cursor-pointer shrink-0 ml-2"
                            >
                              {item.buyerNote ? t.edit_note : t.write_note}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Shop Group Summary Footer */}
                  <div className="px-5 py-3 bg-muted/20 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
                    <div>
                      {t.subtotal_shop}:{' '}
                      <span className="font-semibold text-foreground">
                        {formatPrice(group.subtotal)}
                      </span>
                    </div>
                    <div>
                      {t.flat_shipping}:{' '}
                      <span className="font-semibold text-foreground">
                        {group.hasPhysical
                          ? formatPrice(group.flatShippingCost)
                          : formatPrice(0)}
                      </span>
                    </div>
                    <div className="font-medium text-foreground">
                      Total Toko:{' '}
                      <span className="font-bold text-[#00a699]">
                        {formatPrice(group.subtotal + group.effectiveShippingCost)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Ringkasan Belanja */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="bg-card border border-border/80 rounded-md p-5 sm:p-6 shadow-xs space-y-5">
                <h2 className="text-sm sm:text-base font-bold text-foreground pb-3 border-b border-border/80">
                  {t.order_summary}
                </h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {t.total_items} ({cartCount})
                    </span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatPrice(totalProductsPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {t.flat_shipping} ({shopGroups.length} Toko)
                    </span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatPrice(totalShippingFee)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border/80 flex justify-between items-baseline">
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {t.total_payment}
                    </span>
                    <span className="text-base sm:text-xl font-extrabold text-[#00a699] tabular-nums">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-md shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span>{t.proceed_to_checkout}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Trust Badge */}
                <div className="pt-2 flex items-center justify-center gap-2 text-muted-foreground text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.secure_checkout}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
