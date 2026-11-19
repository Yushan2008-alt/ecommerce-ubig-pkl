'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import { useAuthModal } from '@/context/auth-modal-context'
import { createClient } from '@/lib/supabase/client'
import {
  addToCartAction,
  updateCartQtyAction,
  updateBuyerNoteAction,
  removeFromCartAction,
  clearCartAction,
  mergeGuestCartAction,
  getCartWithDetails,
} from '@/actions/cart'
import {
  toggleWishlistAction,
  getWishlistAction,
  mergeGuestWishlistAction,
} from '@/actions/wishlist'

export interface CartItem {
  id: string
  title: string
  price: number
  comparePrice?: number | null
  imageUrl: string
  slug: string
  vendor?: string
  qty: number
  isDigital?: boolean
  stock?: number | null
  shopId?: string
  shopName?: string
  shopSlug?: string
  shopCity?: string | null
  flatShippingCost?: number
  buyerNote?: string
}

export interface WishlistItem {
  id: string
  productId?: string
  title: string
  price: number
  comparePrice?: number | null
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
  isAuthenticated: boolean
  userId: string | null
  addToCart: (product: Omit<CartItem, 'qty'>, qty?: number, buyerNote?: string) => Promise<boolean>
  removeFromCart: (id: string) => Promise<void>
  updateCartQty: (id: string, qty: number) => Promise<void>
  updateBuyerNote: (id: string, note: string) => Promise<void>
  clearCart: () => Promise<void>
  toggleWishlist: (product: WishlistItem) => Promise<boolean>
  isInWishlist: (id: string) => boolean
  isInCart: (id: string) => boolean
  refreshCart: () => Promise<void>
  refreshWishlist: () => Promise<void>
}

const CART_STORAGE_KEY = 'krafita_cart_v1'
const WISHLIST_STORAGE_KEY = 'krafita_wishlist_v1'

const CartWishlistContext = createContext<CartWishlistContextType | null>(null)

export function CartWishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const { openLoginModal } = useAuthModal()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // 1. Initial load & merge logic
  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const storedCartRaw = localStorage.getItem(CART_STORAGE_KEY)
        const localCart: CartItem[] = storedCartRaw ? JSON.parse(storedCartRaw) : []

        if (!isMounted) return

        setCartItems(localCart)

        const supabase = createClient()
        const { data: authData } = await supabase.auth.getUser()
        const currentUser = authData?.user

        if (currentUser) {
          setUserId(currentUser.id)

          // Jika ada data keranjang lokal saat login, merge ke database
          if (localCart.length > 0) {
            await mergeGuestCartAction(
              localCart.map((i) => ({
                id: i.id,
                qty: i.qty,
                buyerNote: i.buyerNote,
              }))
            )
          }

          // Sinkronisasi data terkini dari database
          const [cartRes, wishRes] = await Promise.all([
            getCartWithDetails(),
            getWishlistAction(),
          ])

          if (cartRes.success && cartRes.data) {
            const mappedCart: CartItem[] = cartRes.data.groups.flatMap((g) =>
              g.items.map((it) => ({
                id: it.productId,
                title: it.title,
                price: it.price,
                comparePrice: it.comparePrice,
                imageUrl: it.imageUrl,
                slug: it.slug,
                vendor: it.shopName,
                qty: it.qty,
                isDigital: it.type === 'digital',
                stock: it.stock,
                shopId: it.shopId,
                shopName: it.shopName,
                shopSlug: it.shopSlug,
                shopCity: it.shopCity,
                flatShippingCost: it.flatShippingCost,
                buyerNote: it.buyerNote || undefined,
              }))
            )
            if (isMounted) setCartItems(mappedCart)
          }

          if (wishRes.success && wishRes.data) {
            const mappedWishlist: WishlistItem[] = wishRes.data.map((w) => ({
              id: w.productId,
              productId: w.productId,
              title: w.title,
              price: w.price,
              comparePrice: w.comparePrice,
              imageUrl: w.imageUrl,
              slug: w.slug,
              vendor: w.shopName,
              rating: w.rating,
              wishlistCount: w.ratingCount,
            }))
            if (isMounted) setWishlistItems(mappedWishlist)
          }
        } else {
          // Mode guest: Bersihkan wishlist di state dan localStorage agar tidak ada produk ter-wishlist
          setUserId(null)
          setWishlistItems([])
          try {
            localStorage.removeItem(WISHLIST_STORAGE_KEY)
          } catch {}
        }
      } catch (e) {
        console.error('Failed to initialize cart/wishlist:', e)
      } finally {
        if (isMounted) setIsInitialized(true)
      }
    }

    init()

    // Listen to Supabase auth state change (e.g. login / logout)
    const supabase = createClient()
    const { data: authSub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id)
        // Auto merge on sign-in event
        try {
          const storedCartRaw = localStorage.getItem(CART_STORAGE_KEY)
          const cItems: CartItem[] = storedCartRaw ? JSON.parse(storedCartRaw) : []

          if (cItems.length > 0) {
            await mergeGuestCartAction(
              cItems.map((i) => ({ id: i.id, qty: i.qty, buyerNote: i.buyerNote }))
            )
          }

          const [cartRes, wishRes] = await Promise.all([
            getCartWithDetails(),
            getWishlistAction(),
          ])
          if (cartRes.success && cartRes.data) {
            setCartItems(
              cartRes.data.groups.flatMap((g) =>
                g.items.map((it) => ({
                  id: it.productId,
                  title: it.title,
                  price: it.price,
                  comparePrice: it.comparePrice,
                  imageUrl: it.imageUrl,
                  slug: it.slug,
                  vendor: it.shopName,
                  qty: it.qty,
                  isDigital: it.type === 'digital',
                  stock: it.stock,
                  shopId: it.shopId,
                  shopName: it.shopName,
                  shopSlug: it.shopSlug,
                  shopCity: it.shopCity,
                  flatShippingCost: it.flatShippingCost,
                  buyerNote: it.buyerNote || undefined,
                }))
              )
            )
          }
          if (wishRes.success && wishRes.data) {
            setWishlistItems(
              wishRes.data.map((w) => ({
                id: w.productId,
                productId: w.productId,
                title: w.title,
                price: w.price,
                comparePrice: w.comparePrice,
                imageUrl: w.imageUrl,
                slug: w.slug,
                vendor: w.shopName,
                rating: w.rating,
                wishlistCount: w.ratingCount,
              }))
            )
          }
        } catch (err) {
          console.error('Error merging on SIGNED_IN:', err)
        }
      } else if (event === 'SIGNED_OUT') {
        setUserId(null)
        setWishlistItems([])
        try {
          localStorage.removeItem(WISHLIST_STORAGE_KEY)
        } catch {}
      }
    })

    return () => {
      isMounted = false
      authSub.subscription.unsubscribe()
    }
  }, [])

  // 2. Persist to localStorage whenever state changes
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e)
    }
  }, [cartItems, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    try {
      if (userId && wishlistItems.length > 0) {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems))
      } else {
        localStorage.removeItem(WISHLIST_STORAGE_KEY)
      }
    } catch (e) {
      console.error('Failed to save wishlist to localStorage:', e)
    }
  }, [wishlistItems, isInitialized, userId])

  // Counts & totals
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0)
  }, [cartItems])

  const wishlistCount = userId ? wishlistItems.length : 0

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  }, [cartItems])

  // Refresh methods
  const refreshCart = useCallback(async () => {
    if (!userId) return
    const res = await getCartWithDetails()
    if (res.success && res.data) {
      setCartItems(
        res.data.groups.flatMap((g) =>
          g.items.map((it) => ({
            id: it.productId,
            title: it.title,
            price: it.price,
            comparePrice: it.comparePrice,
            imageUrl: it.imageUrl,
            slug: it.slug,
            vendor: it.shopName,
            qty: it.qty,
            isDigital: it.type === 'digital',
            stock: it.stock,
            shopId: it.shopId,
            shopName: it.shopName,
            shopSlug: it.shopSlug,
            shopCity: it.shopCity,
            flatShippingCost: it.flatShippingCost,
            buyerNote: it.buyerNote || undefined,
          }))
        )
      )
    }
  }, [userId])

  const refreshWishlist = useCallback(async () => {
    if (!userId) return
    const res = await getWishlistAction()
    if (res.success && res.data) {
      setWishlistItems(
        res.data.map((w) => ({
          id: w.productId,
          productId: w.productId,
          title: w.title,
          price: w.price,
          comparePrice: w.comparePrice,
          imageUrl: w.imageUrl,
          slug: w.slug,
          vendor: w.shopName,
          rating: w.rating,
          wishlistCount: w.ratingCount,
        }))
      )
    }
  }, [userId])

  // Add to Cart with server action validation if logged in
  const addToCart = async (
    product: Omit<CartItem, 'qty'>,
    qty: number = 1,
    buyerNote?: string
  ): Promise<boolean> => {
    // If logged in, execute Server Action first for backend constraints (self-buy, stock, digital)
    if (userId) {
      const res = await addToCartAction(product.id, qty, buyerNote)
      if (!res.success) {
        toast.error(res.error || (locale === 'id' ? 'Gagal menambahkan produk' : 'Failed to add item'))
        return false
      }
      await refreshCart()
    } else {
      // Guest mode
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === product.id)
        if (existingIndex > -1) {
          const next = [...prev]
          const cur = next[existingIndex]
          const finalQty = product.isDigital ? 1 : cur.qty + qty
          next[existingIndex] = {
            ...cur,
            qty: finalQty,
            buyerNote: buyerNote !== undefined ? buyerNote : cur.buyerNote,
          }
          return next
        } else {
          return [
            ...prev,
            {
              ...product,
              qty: product.isDigital ? 1 : qty,
              buyerNote: buyerNote || undefined,
            },
          ]
        }
      })
    }

    toast.success(t.added_to_cart, {
      description: product.title,
      action: {
        label: t.view_cart,
        onClick: () => {
          router.push('/cart')
        },
      },
    })
    return true
  }

  // Remove from cart
  const removeFromCart = async (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))

    if (userId) {
      await removeFromCartAction(id)
    }

    toast.info(locale === 'id' ? 'Produk dihapus dari keranjang' : 'Product removed from cart')
  }

  // Update Qty
  const updateCartQty = async (id: string, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(id)
      return
    }

    // Constraint: if item is digital, lock qty to 1
    const targetItem = cartItems.find((it) => it.id === id)
    if (targetItem?.isDigital && qty > 1) {
      toast.info(
        locale === 'id'
          ? 'Produk digital hanya dapat dibeli 1 per transaksi'
          : 'Digital products can only be purchased once per order'
      )
      return
    }

    if (targetItem?.stock !== null && targetItem?.stock !== undefined && qty > targetItem.stock) {
      toast.error(
        locale === 'id'
          ? `Jumlah melebihi stok yang tersedia (${targetItem.stock})`
          : `Quantity exceeds available stock (${targetItem.stock})`
      )
      return
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    )

    if (userId) {
      const res = await updateCartQtyAction(id, qty)
      if (!res.success) {
        toast.error(res.error || 'Gagal mengubah jumlah barang')
        await refreshCart()
      }
    }
  }

  // Update Buyer Note
  const updateBuyerNote = async (id: string, note: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, buyerNote: note } : item))
    )

    if (userId) {
      const res = await updateBuyerNoteAction(id, note)
      if (!res.success) {
        toast.error(res.error || 'Gagal menyimpan catatan')
      }
    }
  }

  // Clear Cart
  const clearCart = async () => {
    setCartItems([])
    if (userId) {
      await clearCartAction()
    }
  }

  // Toggle Wishlist (Wajib Login - Mode Guest diblokir & diarahkan untuk login)
  const toggleWishlist = async (product: WishlistItem): Promise<boolean> => {
    if (!userId) {
      toast.info(
        locale === 'id'
          ? 'Silakan masuk terlebih dahulu untuk menambahkan produk ke wishlist'
          : 'Please log in to add products to your wishlist',
        {
          action: {
            label: locale === 'id' ? 'Masuk' : 'Log In',
            onClick: () => {
              const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
              openLoginModal(currentPath)
            },
          },
        }
      )
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
      openLoginModal(currentPath)
      return false
    }

    const res = await toggleWishlistAction(product.id)
    if (!res.success) {
      toast.error(res.error || 'Gagal mengubah wishlist')
      return false
    }
    await refreshWishlist()
    if (res.isFavorited) {
      toast.success(t.added_to_wishlist, { description: product.title })
    } else {
      toast.info(t.removed_from_wishlist, { description: product.title })
    }
    return res.isFavorited
  }

  const isInWishlist = (id: string) => {
    if (!userId) return false
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
        isAuthenticated: Boolean(userId),
        userId,
        addToCart,
        removeFromCart,
        updateCartQty,
        updateBuyerNote,
        clearCart,
        toggleWishlist,
        isInWishlist,
        isInCart,
        refreshCart,
        refreshWishlist,
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
