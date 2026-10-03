import Link from 'next/link'
import { ShieldCheck, CreditCard, Lock, Sparkles } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30 border-border/80 text-muted-foreground mt-auto">
      {/* Keunggulan Layanan / Trust Badges */}
      <div className="border-b border-border/60">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Transaksi Aman</p>
              <p className="text-xs text-muted-foreground">Pembayaran terverifikasi otomatis via Midtrans</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Multi-Vendor Terpercaya</p>
              <p className="text-xs text-muted-foreground">Ribuan produk fisik & digital berkualitas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Metode Bayar Lengkap</p>
              <p className="text-xs text-muted-foreground">Virtual Account, QRIS, GoPay, dan Kartu Kredit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Aset Digital Instan</p>
              <p className="text-xs text-muted-foreground">Unduh file langsung setelah pembayaran lunas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasi Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Profil Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
              <span className="bg-primary text-primary-foreground w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-sm">
                U
              </span>
              <span>Marketplace Ubig</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Platform marketplace multi-vendor terpadu untuk jual beli produk fisik berkualitas dan aset digital resmi di Indonesia.
            </p>
          </div>

          {/* Kolom 2: Belanja & Kategori */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Jelajahi</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  Semua Produk
                </Link>
              </li>
              <li>
                <Link href="/products?type=digital" className="hover:text-primary transition-colors">
                  Produk Digital (Download)
                </Link>
              </li>
              <li>
                <Link href="/shops" className="hover:text-primary transition-colors">
                  Daftar Toko & Vendor
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-primary transition-colors font-medium text-primary">
                  Mulai Jualan (Buka Toko)
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Akun & Transaksi */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Pelanggan</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/orders" className="hover:text-primary transition-colors">
                  Riwayat Pesanan
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-primary transition-colors">
                  Unduhan Saya
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-primary transition-colors">
                  Wishlist Favorit
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-primary transition-colors">
                  Pengaturan Profil & Alamat
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Informasi & Kebijakan */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Bantuan & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/info/help" className="hover:text-primary transition-colors">
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link href="/info/terms" className="hover:text-primary transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/info/privacy" className="hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/info/about" className="hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Baris Bawah */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Marketplace Ubig. Hak cipta dilindungi undang-undang.</p>
          <p className="flex items-center gap-2">
            <span>Pembayaran Sandbox Didukung oleh</span>
            <span className="font-semibold text-foreground">Midtrans</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
