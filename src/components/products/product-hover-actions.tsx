'use client'

import React from 'react'
import { ShoppingCart, Heart, Check } from 'lucide-react'
import { useCartWishlist, CartItem, WishlistItem } from '@/context/cart-wishlist-context'
import { useLanguage } from '@/context/language-context'

interface ProductHoverActionsProps {
  product: {
    id: string
    title: string
    price: number
    comparePrice?: number
    imageUrl: string
    slug: string
    vendor?: string
    isDigital?: boolean
    rating?: number
    wishlistCount?: number
  }
  className?: string
}

export function ProductHoverActions({ product, className = '' }: ProductHoverActionsProps) {
  const { addToCart, toggleWishlist, isInWishlist, isInCart } = useCartWishlist()
  const { t } = useLanguage()

  const isFavorited = isInWishlist(product.id)
  const isAdded = isInCart(product.id)

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      comparePrice: product.comparePrice,
      imageUrl: product.imageUrl,
      slug: product.slug,
      vendor: product.vendor,
      isDigital: product.isDigital,
    })
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      comparePrice: product.comparePrice,
      imageUrl: product.imageUrl,
      slug: product.slug,
      vendor: product.vendor,
      rating: product.rating,
      wishlistCount: product.wishlistCount,
    })
  }

  return (
    <div
      className={`absolute top-2 right-2 flex flex-col gap-1.5 z-20 pointer-events-none group-hover:pointer-events-auto transition-all ${className}`}
    >
      {/* 1. Cart Button */}
      <button
        type="button"
        onClick={handleCartClick}
        aria-label={t.add_to_cart}
        title={t.add_to_cart}
        className="w-8 h-8 sm:w-9 sm:h-9 bg-white/95 hover:bg-white text-slate-700 hover:text-primary rounded-full shadow-md flex items-center justify-center border border-slate-100/80 transition-all duration-300 transform opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 hover:scale-110 active:scale-95 pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {isAdded ? (
          <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" aria-hidden="true" />
        ) : (
          <ShoppingCart className="w-4 h-4 stroke-[1.8]" aria-hidden="true" />
        )}
      </button>

      {/* 2. Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label={isFavorited ? t.removed_from_wishlist : t.added_to_wishlist}
        title={isFavorited ? t.removed_from_wishlist : t.added_to_wishlist}
        className="w-8 h-8 sm:w-9 sm:h-9 bg-white/95 hover:bg-white text-slate-700 hover:text-rose-500 rounded-full shadow-md flex items-center justify-center border border-slate-100/80 transition-all duration-300 delay-75 transform opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 hover:scale-110 active:scale-95 pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        <Heart
          className={`w-4 h-4 transition-colors stroke-[1.8] ${
            isFavorited ? 'text-rose-500 fill-rose-500' : 'text-slate-700 hover:text-rose-500'
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
