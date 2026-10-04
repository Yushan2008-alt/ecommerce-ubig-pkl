'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'

export function SiteFooter() {
  const { t, locale } = useLanguage()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    toast.success(
      locale === 'id'
        ? 'Terima kasih! Anda berhasil berlangganan newsletter Krafita.'
        : 'Thank you! You have successfully subscribed to Krafita newsletter.'
    )
  }
  return (
    <footer className="w-full bg-[#fdfdfd] dark:bg-card/40 border-t border-border/80 text-muted-foreground mt-auto">
      {/* Container Utama 4 Kolom Sesuai Gambar Referensi */}
      <div className="container mx-auto px-4 max-w-7xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* KOLOM 1: Logo Brand, Deskripsi Singkat & 10 Ikon Media Sosial */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
                Kr<span className="text-primary">a</span>fita
              </span>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {locale === 'id'
                ? 'Krafita adalah marketplace e-commerce modern tempat bertemunya pembeli dan penjual dengan mudah. Baik untuk berbelanja produk unik maupun mengembangkan bisnis Anda secara online, Krafita siap mendampingi setiap langkah Anda.'
                : 'Krafita is a modern e-commerce marketplace where buyers and sellers connect with ease. Whether you are looking to shop for unique items or grow your business by selling online, Krafita is here to help you every step of the way.'}
            </p>

            {/* Deretan 10 Ikon Media Sosial (2 Baris x 5 Ikon Sesuai Gambar) */}
            <div className="pt-2 space-y-2">
              {/* Baris 1: Facebook, X/Twitter, Instagram, TikTok, WhatsApp */}
              <div className="flex items-center gap-2">
                <Link
                  href="#"
                  aria-label="Facebook Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <span className="font-bold text-[13px]">f</span>
                </Link>

                <Link
                  href="#"
                  aria-label="X / Twitter Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <span className="font-bold text-[11px]">𝕏</span>
                </Link>

                <Link
                  href="#"
                  aria-label="Instagram Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>

                <Link
                  href="#"
                  aria-label="TikTok Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c-.03 2.12-.76 4.29-2.21 5.89-1.57 1.74-3.93 2.65-6.26 2.51-2.48-.13-4.83-1.48-6.19-3.57-1.48-2.25-1.71-5.26-.6-7.66 1.09-2.39 3.44-4.04 6.04-4.27.42-.03.85-.03 1.27.01v4.06c-.46-.07-.94-.06-1.39.04-1.19.26-2.2 1.16-2.6 2.32-.47 1.34-.14 2.92.83 3.94 1.03 1.08 2.69 1.4 4.09.8 1.11-.47 1.83-1.61 1.86-2.81V.02h.02z" />
                  </svg>
                </Link>

                <Link
                  href="#"
                  aria-label="WhatsApp Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </Link>
              </div>

              {/* Baris 2: YouTube, Discord, Telegram, Pinterest, LinkedIn */}
              <div className="flex items-center gap-2">
                <Link
                  href="#"
                  aria-label="YouTube Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </Link>

                <Link
                  href="#"
                  aria-label="Discord Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </Link>

                <Link
                  href="#"
                  aria-label="Telegram Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.942z" />
                  </svg>
                </Link>

                <Link
                  href="#"
                  aria-label="Pinterest Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <span className="font-bold text-[13px]">P</span>
                </Link>

                <Link
                  href="#"
                  aria-label="LinkedIn Krafita"
                  className="w-8 h-8 rounded-full border border-border/80 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background"
                >
                  <span className="font-bold text-[11px]">in</span>
                </Link>
              </div>
            </div>
          </div>

          {/* KOLOM 2: CATEGORIES (Bilingual) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">
              {locale === 'id' ? 'KATEGORI' : 'CATEGORIES'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/products?category=clothing" className="hover:text-primary transition-colors">
                  {t.clothing}
                </Link>
              </li>
              <li>
                <Link href="/products?category=shoes" className="hover:text-primary transition-colors">
                  {t.shoes}
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-living" className="hover:text-primary transition-colors">
                  {t.home_living}
                </Link>
              </li>
              <li>
                <Link href="/products?category=jewelry-accessories" className="hover:text-primary transition-colors">
                  {t.jewelry_accessories}
                </Link>
              </li>
              <li>
                <Link href="/products?category=toys-entertainment" className="hover:text-primary transition-colors">
                  {t.toys_entertainment}
                </Link>
              </li>
              <li>
                <Link href="/products?category=graphics" className="hover:text-primary transition-colors">
                  {t.graphics}
                </Link>
              </li>
              <li>
                <Link href="/products?category=video-audio" className="hover:text-primary transition-colors">
                  {t.video_audio}
                </Link>
              </li>
              <li>
                <Link href="/products?category=template-source-code" className="hover:text-primary transition-colors">
                  {t.template_code}
                </Link>
              </li>
            </ul>
          </div>

          {/* KOLOM 3: QUICK LINKS & INFORMATION */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">
                {locale === 'id' ? 'TAUTAN CEPAT' : 'QUICK LINKS'}
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    {t.home}
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-primary transition-colors">
                    {t.products}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    {t.contact}
                  </Link>
                </li>
                <li>
                  <Link href="/sell" className="hover:text-primary transition-colors">
                    {t.sell_on_krafita}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">
                {locale === 'id' ? 'INFORMASI' : 'INFORMATION'}
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    {t.terms_conditions}
                  </Link>
                </li>
                <li>
                  <Link href="/sell" className="hover:text-primary transition-colors">
                    {t.why_sell_title}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* KOLOM 4: NEWSLETTER & METODE PEMBAYARAN */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">
              NEWSLETTER
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'id'
                ? 'Dapatkan berita terkini, pembaruan katalog, dan diskon spesial langsung di email Anda.'
                : 'Join our subscribers list to get the latest news, updates and special offers directly in your inbox.'}
            </p>

            {/* Form Input Email & Tombol Subscribe Teal */}
            {subscribed ? (
              <div className="p-3 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
                {locale === 'id'
                  ? '✓ Terima kasih! Anda telah terdaftar dalam newsletter Krafita.'
                  : '✓ Thank you! You have subscribed to Krafita newsletter.'}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={locale === 'id' ? 'Masukkan email Anda' : 'Enter your email'}
                  aria-label="Enter your email for newsletter"
                  autoComplete="email"
                  spellCheck={false}
                  className="w-full h-10 px-3.5 text-xs bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
                <button
                  type="submit"
                  className="w-full h-10 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  {locale === 'id' ? 'Langganan' : 'Subscribe'}
                </button>
              </form>
            )}

            {/* Logo Provider Pembayaran (Visa, Mastercard, Maestro, Amex, Discover) Sesuai Gambar */}
            <div className="pt-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Visa Badge */}
                <div className="px-2 py-1 bg-white border border-border/80 rounded-xs flex items-center justify-center h-6 shadow-2xs">
                  <span className="text-[11px] font-black italic tracking-tighter text-[#1a1f71]">VISA</span>
                </div>

                {/* Mastercard Badge */}
                <div className="px-2 py-1 bg-white border border-border/80 rounded-xs flex items-center justify-center h-6 shadow-2xs">
                  <div className="flex -space-x-1.5 items-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block opacity-90" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] inline-block opacity-90" />
                  </div>
                </div>

                {/* Maestro Badge */}
                <div className="px-2 py-1 bg-white border border-border/80 rounded-xs flex items-center justify-center h-6 shadow-2xs">
                  <div className="flex -space-x-1.5 items-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0099df] inline-block opacity-90" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block opacity-90" />
                  </div>
                </div>

                {/* American Express Badge */}
                <div className="px-2 py-1 bg-[#006fcf] text-white rounded-xs flex items-center justify-center h-6 shadow-2xs">
                  <span className="text-[9px] font-black tracking-tight uppercase">AMEX</span>
                </div>

                {/* Discover Badge */}
                <div className="px-2 py-1 bg-white border border-border/80 rounded-xs flex items-center justify-center h-6 shadow-2xs">
                  <span className="text-[9px] font-bold text-[#f58220] tracking-tight">DISCOVER</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Baris Bawah / Copyright Strip */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Krafita. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-xs">
            <span>Powered by</span>
            <span className="font-semibold text-foreground">Krafita Multi-Vendor</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
