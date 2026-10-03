import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { signOut } from '@/actions/auth'
import { createClient } from '@/lib/supabase/server'
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

  // Kategori horizontal bar sesuai referensi screenshot Modesy
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
          {/* Sisi Kiri: Contact | Sell on Modesy */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <span className="text-border" aria-hidden="true">|</span>
            <Link
              href="/sell"
              className="hover:text-primary transition-colors font-medium"
            >
              Sell on Modesy
            </Link>
          </div>

          {/* Sisi Kanan: Location, Currency, Language, Login/Register */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
              <MapPin className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
              <span>Location</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
              <span>IDR (Rp)</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" aria-hidden="true" />
            </div>

            <div className="hidden md:flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
              <Globe className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
              <span>Indonesia</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" aria-hidden="true" />
            </div>

            <span className="hidden sm:inline text-border" aria-hidden="true">|</span>

            {/* Status Login / Register */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-primary cursor-pointer font-medium focus-visible:outline-none">
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{profile?.display_name || user.email?.split('@')[0]}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 text-xs">
                  <DropdownMenuLabel>
                    <p className="font-semibold text-foreground">{profile?.display_name || 'Member'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profile?.role === 'vendor' ? (
                    <DropdownMenuItem>
                      <Link href="/vendor" className="flex items-center gap-2 w-full text-primary font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Dashboard Vendor
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <Link href="/sell" className="flex items-center gap-2 w-full">
                        <Store className="w-3.5 h-3.5" /> Buka Toko (Sell Now)
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Link href="/orders" className="flex items-center gap-2 w-full">
                      <Package className="w-3.5 h-3.5" /> Pesanan Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/downloads" className="flex items-center gap-2 w-full">
                      <Download className="w-3.5 h-3.5" /> Unduhan Digital
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/account" className="flex items-center gap-2 w-full">
                      <User className="w-3.5 h-3.5" /> Pengaturan Akun
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-0">
                    <form action={signOut} className="w-full">
                      <button
                        type="submit"
                        className="w-full text-left px-2 py-1.5 cursor-pointer text-destructive flex items-center gap-2 text-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Keluar
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 font-medium">
                <Link href="/login" className="hover:text-primary transition-colors">
                  Login
                </Link>
                <span>/</span>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
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
                  <span className="text-foreground">Modesy</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 mt-6 text-sm">
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Kategori</p>
                {topNavCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    className="font-medium text-foreground hover:text-primary py-1 transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
                <hr className="my-2 border-border" />
                <Link href="/sell" className="font-semibold text-primary flex items-center gap-2 py-1">
                  <Store className="w-4 h-4" /> Mulai Jual di Modesy
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo Minimalis Bersih Modesy */}
          <Link href="/" className="flex items-center gap-2 select-none group">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Modesy
            </span>
          </Link>
        </div>

        {/* Search Bar Minimalis di Tengah */}
        <form
          action="/products"
          method="GET"
          role="search"
          className="flex-1 max-w-2xl hidden md:block"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              name="q"
              placeholder="Search for products, categories or brands"
              aria-label="Cari produk, kategori, atau brand"
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

        {/* Aksi Kanan: Cart, Wishlist, Sell Now Button */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Cart Icon + Label + Badge */}
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors group relative"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
          </Link>

          {/* Wishlist Icon + Label + Badge */}
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors group relative"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Wishlist</span>
          </Link>

          {/* Tombol "Sell Now" Hijau/Teal Sesuai Gambar */}
          <Link
            href="/sell"
            className="bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-md transition-colors shadow-xs hover:shadow-sm shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Sell Now
          </Link>
        </div>
      </div>

      {/* 3. HORIZONTAL CATEGORY SUB-BAR (Persis seperti deretan kategori di bawah header gambar) */}
      <nav
        aria-label="Navigasi Kategori Utama"
        className="border-t border-border/50 bg-background hidden md:block"
      >
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between overflow-x-auto py-2.5 scrollbar-none">
          <div className="flex items-center space-x-6 lg:space-x-8 text-xs font-semibold text-foreground/80 whitespace-nowrap">
            {topNavCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="hover:text-primary transition-colors py-0.5"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
