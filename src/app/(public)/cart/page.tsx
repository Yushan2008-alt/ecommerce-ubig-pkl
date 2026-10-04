'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { useCartWishlist } from '@/context/cart-wishlist-context'
import { useLanguage } from '@/context/language-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function CartPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const { cartItems, updateCartQty, removeFromCart, clearCart, cartSubtotal, cartCount } =
    useCartWishlist()

  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

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

  const handleProceedToCheckout = async () => {
    setIsCheckingAuth(true)
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
    setIsCheckingAuth(false)
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
                ? `${cartCount} ${t.items_count}`
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
            {/* Daftar Produk di Keranjang */}
            <div className="lg:col-span-8 bg-card border border-border/80 rounded-md overflow-hidden shadow-xs divide-y divide-border/60">
              {/* Header List */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground bg-muted/30">
                <div className="col-span-6">{t.products}</div>
                <div className="col-span-2 text-right">{t.unit_price}</div>
                <div className="col-span-2 text-center">{t.quantity}</div>
                <div className="col-span-2 text-right">{t.subtotal}</div>
              </div>

              {/* Items */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center"
                >
                  {/* Info Produk & Gambar */}
                  <div className="w-full sm:col-span-6 flex items-center gap-3.5">
                    <Link
                      href={`/products/${item.slug}`}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted/40 rounded-sm overflow-hidden shrink-0 border border-border/60"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover object-center"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                      >
                        {item.title}
                      </Link>
                      {item.vendor && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.vendor}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 mt-2 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t.remove_item}
                      </button>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="w-full sm:w-auto sm:col-span-2 sm:text-right flex justify-between sm:block text-xs text-muted-foreground">
                    <span className="sm:hidden font-medium">{t.unit_price}:</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="w-full sm:w-auto sm:col-span-2 flex justify-between sm:justify-center items-center">
                    <span className="sm:hidden text-xs text-muted-foreground font-medium">
                      {t.quantity}:
                    </span>
                    <div className="inline-flex items-center border border-border rounded-md bg-background overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, item.qty - 1)}
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, item.qty + 1)}
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="w-full sm:w-auto sm:col-span-2 sm:text-right flex justify-between sm:block text-xs">
                    <span className="sm:hidden text-muted-foreground font-medium">
                      {t.subtotal}:
                    </span>
                    <span className="text-sm font-extrabold text-[#00a699] tabular-nums">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ringkasan Belanja / Order Summary */}
            <div className="lg:col-span-4 bg-card border border-border/80 rounded-md p-5 sm:p-6 shadow-xs space-y-5 sticky top-24">
              <h2 className="text-sm sm:text-base font-bold text-foreground pb-3 border-b border-border/60">
                {t.order_summary}
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.estimated_tax}</span>
                  <span className="text-emerald-600 font-medium">Gratis / Rp0</span>
                </div>
                <div className="pt-3 border-t border-border/60 flex justify-between items-baseline">
                  <span className="font-bold text-foreground">{t.total_payment}</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#00a699] tabular-nums">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={isCheckingAuth}
                  className="w-full bg-[#00a699] hover:bg-[#008f84] text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-md transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {isCheckingAuth ? 'Memeriksa...' : t.proceed_to_checkout}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/products"
                  className="w-full inline-flex items-center justify-center text-xs text-muted-foreground hover:text-primary transition-colors py-2"
                >
                  {t.continue_shopping}
                </Link>
              </div>

              {/* Keamanan Transaksi */}
              <div className="pt-4 border-t border-border/40 flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {locale === 'id'
                    ? 'Pembayaran aman & bergaransi via Midtrans'
                    : 'Secure payment guaranteed via Midtrans'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
