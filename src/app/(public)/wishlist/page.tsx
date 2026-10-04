'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, ShoppingCart, Trash2, ArrowRight, Star } from 'lucide-react'
import { useCartWishlist } from '@/context/cart-wishlist-context'
import { useLanguage } from '@/context/language-context'

export default function WishlistPage() {
  const { t } = useLanguage()
  const { wishlistItems, toggleWishlist, addToCart, wishlistCount } = useCartWishlist()

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

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-muted-foreground mb-6 gap-2">
          <Link href="/" className="hover:text-primary transition-colors">
            {t.home}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t.wishlist_page_title}</span>
        </nav>

        {/* Page Title */}
        <div className="flex items-center justify-between pb-6 border-b border-border/80 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              {t.wishlist_page_title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {wishlistCount > 0
                ? `${wishlistCount} ${t.items_count}`
                : t.wishlist_empty_title}
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border/80 rounded-md p-10 sm:p-16 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground mb-1.5">
              {t.wishlist_empty_title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6">
              {t.wishlist_empty_desc}
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
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border/80 rounded-md overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Image & Remove from Wishlist button */}
                <div className="relative aspect-[3/4] w-full bg-muted/40">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                  />
                  <button
                    type="button"
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 text-rose-600 hover:bg-rose-50 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                    title={t.remove_item}
                    aria-label={t.remove_item}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                      <Link
                        href={`/products/${item.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    {item.vendor && (
                      <p className="text-[11px] text-muted-foreground">{item.vendor}</p>
                    )}
                  </div>

                  <div>
                    <div className="text-sm sm:text-base font-extrabold text-[#00a699] tabular-nums mb-3">
                      {formatPrice(item.price)}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          title: item.title,
                          price: item.price,
                          comparePrice: item.comparePrice,
                          imageUrl: item.imageUrl,
                          slug: item.slug,
                          vendor: item.vendor,
                        })
                      }
                      className="w-full bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {t.add_to_cart}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
