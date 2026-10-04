'use client'

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import { createClient } from '@/lib/supabase/client'

export interface CartItem {
  id: string
  title: string
  price: number
  comparePrice?: number
  imageUrl: string
  slug: string
  vendor?: string
  qty: number
  isDigital?: boolean
}

export interface WishlistItem {
  id: string
  title: string
  price: number
  comparePrice?: number
  imageUrl: string
  slug: string
  vendor?: string
  rating?: number
  wishlistCount?: number
}

interface CartWishlistContextType {
  cartItems: CartItem[]
  wishlistItems: WishlistItem[]
  cartCount: number
  wishlistCount: number
  cartSubtotal: number
  addToCart: (product: Omit<CartItem, 'qty'>, qty?: number) => void
  removeFromCart: (id: string) => void
  updateCartQty: (id: string, qty: number) => void
  clearCart: () => void
  toggleWishlist: (product: WishlistItem) => void
  isInWishlist: (id: string) => boolean
  isInCart: (id: string) => boolean
}

const CART_STORAGE_KEY = 'krafita_cart_v1'
const WISHLIST_STORAGE_KEY = 'krafita_wishlist_v1'

const CartWishlistContext = createContext<CartWishlistContextType | null>(null)

export function CartWishlistProvider({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLanguage()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 1. Initial load from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }

      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (storedWishlist) {
        setWishlistItems(JSON.parse(storedWishlist))
      }
    } catch (e) {
      console.error('Failed to load cart/wishlist from localStorage:', e)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // 2. Persist to localStorage whenever cartItems change
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e)
    }
  }, [cartItems, isInitialized])

  // 3. Persist to localStorage whenever wishlistItems change
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems))
    } catch (e) {
      console.error('Failed to save wishlist to localStorage:', e)
    }
  }, [wishlistItems, isInitialized])

  // Derived counts & totals
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0)
  }, [cartItems])

  const wishlistCount = wishlistItems.length

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  }, [cartItems])

  // Actions
  const addToCart = (product: Omit<CartItem, 'qty'>, qty: number = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id)
      if (existingIndex > -1) {
        const next = [...prev]
        next[existingIndex] = {
          ...next[existingIndex],
          qty: next[existingIndex].qty + qty,
        }
        return next
      } else {
        return [...prev, { ...product, qty }]
      }
    })

    // Background sync if logged in
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          supabase
            .from('cart_items')
            .upsert({
              profile_id: data.user.id,
              product_id: product.id,
              qty: qty,
            })
            .then()
        }
      })
    } catch {}

    // Toast feedback
    toast.success(t.added_to_cart, {
      description: product.title,
      action: {
        label: t.view_cart,
        onClick: () => {
          window.location.href = '/cart'
        },
      },
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))

    // Background sync if logged in
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          supabase
            .from('cart_items')
            .delete()
            .match({ profile_id: data.user.id, product_id: id })
            .then()
        }
      })
    } catch {}

    toast.info(locale === 'id' ? 'Produk dihapus dari keranjang' : 'Product removed from cart')
  }

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id)
      return
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    )

    // Background sync if logged in
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          supabase
            .from('cart_items')
            .update({ qty })
            .match({ profile_id: data.user.id, product_id: id })
            .then()
        }
      })
    } catch {}
  }

  const clearCart = () => {
    setCartItems([])
  }

  const toggleWishlist = (product: WishlistItem) => {
    const isCurrentlyWishlisted = wishlistItems.some((item) => item.id === product.id)

    if (isCurrentlyWishlisted) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== product.id))

      // Background sync if logged in
      try {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            supabase
              .from('wishlists')
              .delete()
              .match({ profile_id: data.user.id, product_id: product.id })
              .then()
          }
        })
      } catch {}

      toast.info(t.removed_from_wishlist, {
        description: product.title,
      })
    } else {
      setWishlistItems((prev) => [...prev, product])

      // Background sync if logged in
      try {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            supabase
              .from('wishlists')
              .insert({
                profile_id: data.user.id,
                product_id: product.id,
              })
              .then()
          }
        })
      } catch {}

      toast.success(t.added_to_wishlist, {
        description: product.title,
      })
    }
  }

  const isInWishlist = (id: string) => {
    return wishlistItems.some((item) => item.id === id)
  }

  const isInCart = (id: string) => {
    return cartItems.some((item) => item.id === id)
  }

  return (
    <CartWishlistContext.Provider
      value={{
        cartItems,
        wishlistItems,
        cartCount,
        wishlistCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        isInCart,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  )
}

export function useCartWishlist() {
  const context = useContext(CartWishlistContext)
  if (!context) {
    throw new Error('useCartWishlist must be used within a CartWishlistProvider')
  }
  return context
}
