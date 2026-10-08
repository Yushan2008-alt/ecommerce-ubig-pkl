'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage, LanguageSwitcher } from '@/context/language-context'
import { useCartWishlist } from '@/context/cart-wishlist-context'
import { useAuthModal } from '@/context/auth-modal-context'
import {
  Search,
  ShoppingCart,
  Heart,
  MapPin,
  ChevronDown,
  Store,
  User,
  LogOut,
} from 'lucide-react'
import { CATALOG_CATEGORIES } from '@/lib/catalog-data'

export function HeaderTopLeftLinks() {
  const { t } = useLanguage()

  return (
    <div className="flex items-center space-x-3 sm:space-x-4">
      <Link href="/contact" className="hover:text-foreground transition-colors">
        {t.contact}
      </Link>
      <span className="text-border" aria-hidden="true">
        |
      </span>
      <Link
        href="/sell"
        className="hover:text-primary transition-colors font-medium"
      >
        {t.sell_on_krafita}
      </Link>
    </div>
  )
}

export function HeaderTopRightControls({
  user,
  profile,
  signOutAction,
}: {
  user: any
  profile: any
  signOutAction: () => Promise<void>
}) {
  const { t, locale } = useLanguage()
  const { openLoginModal } = useAuthModal()

  return (
    <div className="flex items-center space-x-3 sm:space-x-4">
      <div className="hidden sm:flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
        <MapPin className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
        <span>{t.location}</span>
      </div>

      <div className="hidden sm:flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
        <span>IDR (Rp)</span>
        <ChevronDown className="w-2.5 h-2.5 opacity-60" aria-hidden="true" />
      </div>

      {/* Language Switcher Interaktif */}
      <LanguageSwitcher />

      <span className="hidden sm:inline text-border" aria-hidden="true">
        |
      </span>

      {/* User Login/Register State */}
      {user ? (
        <div className="relative group">
          <Link
            href="/account"
            className="flex items-center gap-1.5 font-semibold text-foreground text-xs hover:text-primary transition-colors py-1 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
            <span className="max-w-[120px] truncate">
              {profile?.display_name || user.email?.split('@')[0]}
            </span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </Link>

          {/* Quick Menu Popover on Hover */}
          <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
            <div className="w-44 bg-card rounded-md border border-border shadow-lg p-1.5 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              <Link
                href="/account"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-muted text-foreground transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#00a699]" />
                <span>{t.my_account}</span>
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-muted text-foreground transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t.address_book}</span>
              </Link>
              <hr className="my-1 border-border" />
              <button
                type="button"
                onClick={() => signOutAction()}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{locale === 'id' ? 'Keluar' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 font-medium">
          <button
            type="button"
            onClick={() => openLoginModal()}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            {t.login}
          </button>
          <span>/</span>
          <Link href="/register" className="hover:text-primary transition-colors">
            {t.register}
          </Link>
        </div>
      )}
    </div>
  )
}

export function HeaderSearchBar() {
  const { t, locale } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const trimmed = query.trim().toLowerCase()

    // Cek apakah query cocok dengan kategori dalam bahasa saat ini
    const matchedCategory = CATALOG_CATEGORIES.find((cat) => {
      const catName = (locale === 'id' ? cat.name_id : cat.name_en).toLowerCase()
      if (catName === trimmed || cat.slug === trimmed) return true
      // Periksa subkategori
      return cat.subgroups.some((g) => {
        const groupTitle = (locale === 'id' ? g.title_id : g.title_en).toLowerCase()
        return (
          groupTitle === trimmed ||
          g.items.some(
            (i) => (locale === 'id' ? i.name_id : i.name_en).toLowerCase() === trimmed
          )
        )
      })
    })

    if (matchedCategory) {
      router.push(`/products?category=${matchedCategory.slug}`)
    } else {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="flex-1 max-w-2xl hidden md:block"
    >
      <div className="relative flex items-center">
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search_placeholder}
          aria-label={t.search_placeholder}
          className="w-full h-11 pl-4 pr-11 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
        <button
          type="submit"
          aria-label="Lakukan pencarian"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}

export function HeaderNavActions({
  cartCount: initialCartCount = 0,
  wishlistCount: initialWishlistCount = 0,
}: {
  cartCount?: number
  wishlistCount?: number
}) {
  const { t } = useLanguage()
  const { cartCount, wishlistCount } = useCartWishlist()

  // Use live client context counts if available, otherwise fallback to server initial
  const activeCartCount = cartCount !== undefined ? cartCount : initialCartCount
  const activeWishlistCount = wishlistCount !== undefined ? wishlistCount : initialWishlistCount

  return (
    <div className="flex items-center gap-3 sm:gap-6">
      {/* Cart */}
      <Link
        href="/cart"
        className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors group relative"
      >
        <div className="relative">
          <ShoppingCart
            className="w-5 h-5 text-foreground group-hover:text-primary transition-colors"
            aria-hidden="true"
          />
          {activeCartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in-75 duration-200">
              {activeCartCount > 99 ? '99+' : activeCartCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline">{t.cart}</span>
      </Link>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors group relative"
      >
        <div className="relative">
          <Heart
            className="w-5 h-5 text-foreground group-hover:text-primary transition-colors"
            aria-hidden="true"
          />
          {activeWishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in-75 duration-200">
              {activeWishlistCount > 99 ? '99+' : activeWishlistCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline">{t.wishlist}</span>
      </Link>

      {/* Sell Now Button */}
      <Link
        href="/sell"
        className="bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-md transition-colors shadow-xs hover:shadow-sm shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        {t.sell_now}
      </Link>
    </div>
  )
}

export function HeaderMobileCategories() {
  const { t, locale } = useLanguage()

  return (
    <div className="flex flex-col gap-3 mt-6 text-sm">
      <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
        {t.category}
      </p>
      {CATALOG_CATEGORIES.map((c) => {
        const catName = locale === 'id' ? c.name_id : c.name_en
        return (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="font-medium text-foreground hover:text-primary py-1 transition-colors"
          >
            {catName}
          </Link>
        )
      })}
      <hr className="my-2 border-border" />
      <Link
        href="/sell"
        className="font-semibold text-primary flex items-center gap-2 py-1"
      >
        <Store className="w-4 h-4" /> {t.sell_now}
      </Link>
    </div>
  )
}
