import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { signOut } from '@/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { CategoryNav } from '@/components/layout/category-nav'
import {
  HeaderTopLeftLinks,
  HeaderTopRightControls,
  HeaderSearchBar,
  HeaderNavActions,
  HeaderMobileCategories,
} from '@/components/layout/header-client'
import {
  Search,
  ShoppingCart,
  Heart,
  MapPin,
  Globe,
  User,
  LogOut,
  Package,
  Download,
  Store,
  Menu,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export async function SiteHeader() {
  const { user, profile } = await getUser()
  const supabase = await createClient()

  // Ambil jumlah item keranjang jika user login
  let cartCount = 0
  let wishlistCount = 0

  if (user) {
    const { count: cCount } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)
    cartCount = cCount || 0

    const { count: wCount } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)
    wishlistCount = wCount || 0
  }

  // Ambil kategori dari database untuk sub-navbar
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .order('sort_order', { ascending: true })

  // Kategori horizontal bar sesuai referensi screenshot Krafita
  const topNavCategories = [
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Shoes', slug: 'shoes' },
    { name: 'Home & Living', slug: 'home-living' },
    { name: 'Jewelry & Accessories', slug: 'jewelry-accessories' },
    { name: 'Toys & Entertainment', slug: 'toys-entertainment' },
    { name: 'Graphics & Photos', slug: 'graphics' },
    { name: 'Video & Audio', slug: 'video-audio' },
    { name: 'Web Templates & Code', slug: 'template-source-code' },
  ]

  const userInitials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <header className="w-full bg-background border-b border-border/80 sticky top-0 z-40 shadow-xs">
      {/* 1. TOP UTILITY BAR (Persis seperti di baris teratas gambar referensi) */}
      <div className="bg-[#f8f9fa] dark:bg-card/40 border-b border-border/60 text-[11px] sm:text-[12px] text-muted-foreground py-1.5">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
          {/* Sisi Kiri: Contact | Sell on Krafita (Bilingual) */}
          <HeaderTopLeftLinks />

          {/* Sisi Kanan: Location, Currency, Language Switcher, Login/Register */}
          <HeaderTopRightControls
            user={user}
            profile={profile}
            signOutAction={signOut}
          />
        </div>
      </div>

      {/* 2. MAIN NAVBAR: Logo, Search Bar Minimalis, Cart, Wishlist, Sell Now */}
      <div className="container mx-auto px-4 max-w-7xl h-18 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger Mobile */}
          <Sheet>
            <SheetTrigger
              aria-label="Buka menu navigasi"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'md:hidden cursor-pointer'
              )}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left font-bold text-xl tracking-tight">
                  <span className="text-foreground">Krafita</span>
                </SheetTitle>
              </SheetHeader>
              <HeaderMobileCategories />
            </SheetContent>
          </Sheet>

          {/* Logo Minimalis Bersih Krafita */}
          <Link href="/" className="flex items-center gap-2 select-none group">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Krafita
            </span>
          </Link>
        </div>

        {/* Search Bar Minimalis & Cerdas di Tengah (Bilingual) */}
        <HeaderSearchBar />

        {/* Aksi Kanan: Cart, Wishlist, Sell Now Button (Bilingual) */}
        <HeaderNavActions cartCount={cartCount} wishlistCount={wishlistCount} />
      </div>

      {/* 3. INTERACTIVE CATEGORY SUB-BAR & MEGA MENU (Persis seperti Gambar 1 dan Gambar 2) */}
      <CategoryNav />
    </header>
  )
}
