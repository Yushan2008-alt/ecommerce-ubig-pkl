'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, CheckCircle2, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Mohon lengkapi semua kolom formulir pesan.')
      return
    }
    if (!agreed) {
      toast.error('Anda harus menyetujui Syarat & Ketentuan terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      toast.success('Pesan Anda berhasil dikirim! Tim Krafita akan segera merespons.')
      setName('')
      setEmail('')
      setMessage('')
      setAgreed(false)
    }, 800)
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6 md:py-8">
      {/* 1. Breadcrumbs (Persis Gambar Referensi 1: Home / Contact) */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-foreground">Contact</li>
        </ol>
      </nav>

      {/* 2. Judul Halaman Contact & Paragraf Penjelasan (Persis Gambar 1) */}
      <div className="space-y-4 mb-10 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Contact
        </h1>
        <div className="space-y-3 text-xs md:text-sm text-muted-foreground leading-relaxed">
          <p>
            We are here to help you with any questions, concerns, or feedback you may have about our platform. Whether you are a buyer or a seller, our team is dedicated to providing you with the best possible support. If you need assistance with an order, have questions about our platform, or simply want to provide feedback, please don&apos;t hesitate to contact us. You can reach us through our contact form, located on this page. Simply fill out the form with your details and a brief message, and we will get back to you as soon as possible.
          </p>
          <p>
            Alternatively, you can also reach us through our social media channels or email. Our team is available to assist you with any questions or concerns you may have.
          </p>
        </div>
      </div>

      {/* 3. Section Dua Kolom: Form (Kiri) & Info Kontak + Sosial Media (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* KOLOM KIRI: Formulir Leave Message */}
        <div className="lg:col-span-7 bg-background">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground mb-4">
            Leave Message
          </h2>

          {submitted && (
            <div className="mb-5 p-4 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Pesan Anda telah berhasil kami terima. Kami akan menghubungi Anda melalui email dalam waktu 1x24 jam kerja.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Input Name */}
            <div>
              <label htmlFor="contact-name" className="sr-only">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699] transition-all"
              />
            </div>

            {/* Input Email Address */}
            <div>
              <label htmlFor="contact-email" className="sr-only">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border rounded-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699] transition-all"
              />
            </div>

            {/* Input Message Textarea */}
            <div>
              <label htmlFor="contact-message" className="sr-only">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message"
                required
                className="w-full p-3.5 text-xs sm:text-sm bg-background border border-border rounded-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699] transition-all resize-y"
              />
            </div>

            {/* Checkbox Terms & Conditions */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="terms-agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded-2xs border-border text-[#00a699] focus:ring-[#00a699] cursor-pointer"
              />
              <label
                htmlFor="terms-agree"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                I have read and agree to the{' '}
                <Link
                  href="/terms"
                  className="text-foreground underline hover:text-[#00a699] transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </label>
            </div>

            {/* Cloudflare Captcha Verification Widget (Persis Gambar 1) */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-3 px-3.5 py-2.5 rounded-sm border border-border/90 bg-muted/20 shadow-2xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Success!</span>
                  <span className="text-[10px] text-muted-foreground">Verification completed</span>
                </div>
                <div className="pl-4 ml-auto border-l border-border/60 flex flex-col items-end">
                  <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                    CLOUDFLARE
                  </span>
                  <div className="text-[8px] text-muted-foreground/70 flex gap-1">
                    <span className="hover:underline cursor-pointer">Privacy</span>
                    <span>•</span>
                    <span className="hover:underline cursor-pointer">Terms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Submit Teal (Persis Gambar 1) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-8 py-2.5 rounded-xs transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#00a699] focus-visible:outline-none cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* KOLOM KANAN: Detail Informasi Kontak & 12 Ikon Sosial Media (Persis Gambar 1) */}
        <div className="lg:col-span-5 lg:pl-8 space-y-6 pt-2">
          {/* Info Kontak */}
          <div className="space-y-4 text-xs sm:text-sm text-foreground/80">
            {/* Telepon */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <a
                href="tel:54175430103"
                className="hover:text-[#00a699] transition-colors"
              >
                (541) 754-30103
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <a
                href="mailto:edward_test@domain.com"
                className="hover:text-[#00a699] transition-colors"
              >
                edward_test@domain.com
              </a>
            </div>

            {/* Lokasi Alamat */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="leading-snug">
                3111 Camino Del Rio N Suite 400 San Diego
              </span>
            </div>
          </div>

          {/* Deretan 12 Ikon Media Sosial Bundar (Persis Gambar 1) */}
          <div className="pt-4 border-t border-border/60">
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              Connect With Us
            </p>
            <div className="flex flex-wrap gap-2">
              {/* 1. Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <span className="font-bold text-[13px]">f</span>
              </a>

              {/* 2. X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X Twitter"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <span className="font-bold text-[11px]">𝕏</span>
              </a>

              {/* 3. Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* 4. TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c0 1.61-.41 3.23-1.28 4.59-1.27 2.01-3.58 3.3-5.97 3.39-2.7.1-5.38-1.07-7-3.08-1.61-2.01-2.07-4.78-1.26-7.23.81-2.45 2.87-4.27 5.43-4.77.62-.12 1.25-.18 1.88-.18v4.06c-.63.02-1.27.17-1.83.47-.94.51-1.6 1.41-1.78 2.45-.18 1.04.14 2.12.83 2.9.69.78 1.72 1.22 2.76 1.17 1.34-.06 2.54-.93 2.94-2.21.14-.45.21-.92.21-1.39V.02z" />
                </svg>
              </a>

              {/* 5. WhatsApp */}
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* 6. YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* 7. Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <span className="font-bold text-[10px]">DC</span>
              </a>

              {/* 8. Telegram */}
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <span className="font-bold text-[10px]">TG</span>
              </a>

              {/* 9. Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <span className="font-bold text-[12px]">P</span>
              </a>

              {/* 10. LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <span className="font-bold text-[11px]">in</span>
              </a>

              {/* 11. Twitch */}
              <a
                href="https://twitch.tv"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitch"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <span className="font-bold text-[10px]">TW</span>
              </a>

              {/* 12. VK */}
              <a
                href="https://vk.com"
                target="_blank"
                rel="noreferrer"
                aria-label="VK"
                className="w-8 h-8 rounded-full border border-border/90 hover:border-[#00a699] hover:text-[#00a699] flex items-center justify-center text-xs transition-colors bg-background"
              >
                <span className="font-bold text-[10px]">VK</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
