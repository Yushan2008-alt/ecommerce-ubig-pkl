import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Download, Package, Sparkles, Store, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-primary/10 via-muted/40 to-background border-b border-border/60 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Marketplace Multi-Vendor Produk Fisik & Digital</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
            Temukan Produk Impian & Aset Digital Terbaik dalam Satu Platform
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Belanja ribuan produk fisik pilihan dengan pengiriman terjamin, atau unduh aset digital resmi secara instan dengan pembayaran otomatis Midtrans.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/products"
              className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-8 font-semibold shadow-md')}
            >
              <span>Mulai Belanja</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/sell"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-full px-8 font-semibold')}
            >
              <Store className="w-4 h-4 mr-2" />
              <span>Buka Toko Vendor</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Fitur Utama Banner */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Produk Fisik Berkualitas</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pilihan produk fashion, gadget, dan kebutuhan harian dari vendor tepercaya dengan tarif flat per toko.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Aset Digital Instan</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  E-book, template grafis, dan source code resmi dengan tautan unduhan langsung aktif seketika setelah pembayaran.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Pembayaran Midtrans Aman</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dukungan pembayaran lengkap Virtual Account, QRIS, GoPay, dan Kartu Kredit dengan verifikasi server terenkripsi.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Belanja */}
      <section className="container mx-auto px-4">
        <div className="bg-muted/40 border border-border/80 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">Siap Menjelajahi Katalog Lengkap?</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Lihat koleksi produk fisik dan aset digital terbaru dari ratusan toko yang terdaftar di Marketplace Ubig.
            </p>
          </div>
          <Link
            href="/products"
            className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-8 shrink-0 font-semibold')}
          >
            <span>Lihat Semua Produk</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}
