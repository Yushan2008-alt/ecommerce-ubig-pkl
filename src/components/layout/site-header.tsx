import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { signOut } from '@/actions/auth'
import { createClient } from '@/lib/supabase/server'
import {
  Search,
  ShoppingCart,
  Heart,
  Store,
  User,
  LogOut,
  Package,
  Download,
  Menu,
  ShieldCheck,
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

  // Ambil jumlah item keranjang jika user sedang login
  let cartCount = 0
  if (user) {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)
    cartCount = count || 0
  }

  const userInitials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger */}
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'md:hidden cursor-pointer'
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Buka menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-left font-bold text-lg">Marketplace Ubig</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
                  Semua Produk
                </Link>
                <Link href="/products?type=digital" className="text-sm font-medium hover:text-primary transition-colors">
                  Produk Digital
                </Link>
                <Link href="/shops" className="text-sm font-medium hover:text-primary transition-colors">
                  Daftar Toko
                </Link>
                <Link href="/sell" className="text-sm font-medium text-primary flex items-center gap-2">
                  <Store className="w-4 h-4" /> Buka Toko Sekarang
                </Link>
                <hr className="my-2 border-border" />
                {!user ? (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
                      Masuk
                    </Link>
                    <Link href="/register" className={cn(buttonVariants(), 'w-full')}>
                      Daftar Akun
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/account" className="text-sm font-medium">
                      Pengaturan Akun
                    </Link>
                    <Link href="/orders" className="text-sm font-medium">
                      Pesanan Saya
                    </Link>
                    <Link href="/downloads" className="text-sm font-medium">
                      Unduhan Digital
                    </Link>
                    {profile?.role === 'vendor' && (
                      <Link href="/vendor" className="text-sm font-semibold text-primary">
                        Dashboard Vendor
                      </Link>
                    )}
                    <form action={signOut} className="mt-2">
                      <button
                        type="submit"
                        className={cn(buttonVariants({ variant: 'destructive', size: 'sm' }), 'w-full')}
                      >
                        Keluar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shadow-sm">
              U
            </span>
            <span className="hidden sm:inline">Marketplace Ubig</span>
          </Link>
        </div>

        {/* Form Pencarian Global */}
        <form action="/products" method="GET" className="flex-1 max-w-xl mx-2 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              placeholder="Cari produk fisik, digital, atau toko..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </form>

        {/* Aksi Sisi Kanan */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Tombol Buka Toko (Sell Now) */}
          <Link
            href="/sell"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'hidden lg:flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10'
            )}
          >
            <Store className="w-4 h-4" />
            <span>Buka Toko</span>
          </Link>

          {/* Ikon Wishlist */}
          <Link
            href="/wishlist"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative text-foreground')}
          >
            <Heart className="w-5 h-5" />
            <span className="sr-only">Wishlist</span>
          </Link>

          {/* Ikon Keranjang dengan Badge Counter */}
          <Link
            href="/cart"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative text-foreground')}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <span className="sr-only">Keranjang</span>
          </Link>

          {/* User Profile / Login Register */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'rounded-full cursor-pointer'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
                  <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.display_name || 'Member'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {profile?.role === 'vendor' ? (
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/vendor" className="font-medium text-primary flex items-center gap-2 w-full">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Dashboard Vendor</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/sell" className="flex items-center gap-2 w-full">
                      <Store className="w-4 h-4" />
                      <span>Buka Toko (Sell Now)</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/orders" className="flex items-center gap-2 w-full">
                    <Package className="w-4 h-4" />
                    <span>Pesanan Saya</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/downloads" className="flex items-center gap-2 w-full">
                    <Download className="w-4 h-4" />
                    <span>Unduhan Digital</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/account" className="flex items-center gap-2 w-full">
                    <User className="w-4 h-4" />
                    <span>Profil & Alamat</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <form action={signOut} className="w-full">
                    <button
                      type="submit"
                      className="w-full text-left px-2 py-1.5 cursor-pointer text-destructive flex items-center gap-2 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-sm font-medium')}>
                Masuk
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: 'sm' }), 'text-sm font-medium')}>
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
