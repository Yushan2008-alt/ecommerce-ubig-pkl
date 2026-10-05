'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/language-context'

// =========================================================================
// PENGATURAN WARNA TOMBOL SLIDESHOW (EDIT DI SINI)
// Anda dapat mengubah kode warna HEX di bawah ini untuk mengubah warna
// tombol CTA slideshow secara global untuk semua slide:
// =========================================================================
export const SLIDER_BUTTON_THEME = {
  // Warna latar belakang tombol (Default: Teal Krafita '#00a699')
  bgColor: '#00a699',
  // Warna latar belakang saat tombol di-hover (Default: '#008f84')
  hoverBgColor: '#008f84',
  // Warna teks tombol (Default: '#ffffff')
  textColor: '#ffffff',
}

export interface SlideItem {
  id: number
  badge_id: string
  badge_en: string
  title_id: string
  title_en: string
  subtitle_id: string
  subtitle_en: string
  ctaText_id: string
  ctaText_en: string
  ctaLink: string
  image: string
  alt_id: string
  alt_en: string
  // Opsi warna tombol khusus jika ingin beda warna per slide
  customButtonBg?: string
  customButtonHoverBg?: string
  customButtonText?: string
}

const slides: SlideItem[] = [
  {
    id: 1,
    badge_id: 'Koleksi Fashion Terbaru 2026',
    badge_en: 'New Fashion Collection 2026',
    title_id: 'Pakaian Unik & Elegan untuk Gaya Sehari-hari',
    title_en: 'Buy Nice and Unique Clothes Everyday',
    subtitle_id:
      'Temukan pakaian kasual premium dan tren busana terkini dengan bahan berkualitas dan harga terjangkau.',
    subtitle_en:
      'Discover quality premium basics and trendy aesthetics at affordable prices from verified boutiques.',
    ctaText_id: 'Belanja Sekarang',
    ctaText_en: 'Shop Now',
    ctaLink: '/products?category=clothing',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85',
    alt_id: 'Model pakaian trendi dengan tas anyaman jerami di bawah sinar matahari pantai',
    alt_en: 'Trendy fashion model with straw woven bag in natural daylight',
  },
  {
    id: 2,
    badge_id: 'Produk Digital & Kreatif',
    badge_en: 'Digital & Creative Assets',
    title_id: 'Aset Digital Resmi, Template & Source Code',
    title_en: 'Official Digital Assets, Templates & Code',
    subtitle_id:
      'Unduh ribuan template website modern, UI kit, ilustrasi grafis, dan aset digital siap pakai langsung.',
    subtitle_en:
      'Download thousands of modern website templates, UI kits, graphic illustrations, and ready-to-use digital assets.',
    ctaText_id: 'Jelajahi Produk Digital',
    ctaText_en: 'Explore Digital Products',
    ctaLink: '/products?category=template-code',
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85',
    alt_id: 'Meja kerja kreatif desainer modern dengan monitor dan perangkat digital',
    alt_en: 'Modern designer workstation with digital gadgets and dual screens',
  },
  {
    id: 3,
    badge_id: 'Dekorasi & Kerajinan Tangan',
    badge_en: 'Handcrafted Home Decor',
    title_id: 'Dekorasi Rumah & Perlengkapan Estetik',
    title_en: 'Modern Living & Handcrafted Decor',
    subtitle_id:
      'Sentuhan hangat perabotan estetik dan dekorasi rumah buatan tangan dari pengrajin terbaik Indonesia.',
    subtitle_en:
      'Warm touches of aesthetic furniture and handcrafted home decor from the finest artisan creators.',
    ctaText_id: 'Koleksi Rumah & Living',
    ctaText_en: 'Browse Home & Living',
    ctaLink: '/products?category=home-living',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=85',
    alt_id: 'Ruang tamu modern estetik dengan perabotan kayu dan dekorasi minimalis',
    alt_en: 'Aesthetic modern living room with natural wooden furniture and clean minimal decor',
  },
]

/**
 * Generator kelas animasi dinamis dengan konsep yang berbeda untuk setiap slide:
 * - Slide 1 (Fashion): Vertical Lift (meluncur dari bawah saat IN, meluncur ke atas saat OUT)
 * - Slide 2 (Digital): Kinetic Horizontal Slide & Blur (meluncur dari kiri dengan blur saat IN, meluncur ke kanan dengan blur saat OUT)
 * - Slide 3 (Home Living): Gentle Scale & Zoom Float (skala 90% mengembang ke 100% saat IN, mengembang membesar ke 105% saat OUT)
 */
function getElementAnimationClasses(
  slideIndex: number,
  element: 'badge' | 'title' | 'subtitle' | 'button',
  isActive: boolean,
  isExiting: boolean
): { className: string; style: React.CSSProperties } {
  // Transisi dasar: durasi & kurva easing
  const baseTransition = isExiting
    ? 'transition-all duration-350 ease-in transform'
    : 'transition-all duration-700 ease-out transform'

  // Waktu jeda (stagger delay) saat IN dan saat OUT
  let delayStyle: React.CSSProperties = {}
  if (isActive && !isExiting) {
    // Stagger Masuk (IN): Badge -> Judul -> Subtitle -> Tombol
    const inDelays = {
      badge: '100ms',
      title: '250ms',
      subtitle: '400ms',
      button: '550ms',
    }
    delayStyle = { transitionDelay: inDelays[element] }
  } else if (isActive && isExiting) {
    // Stagger Keluar (OUT): Tombol & Subtitle bergerak duluan, lalu Judul & Badge
    const outDelays = {
      button: '0ms',
      subtitle: '60ms',
      title: '120ms',
      badge: '180ms',
    }
    delayStyle = { transitionDelay: outDelays[element] }
  } else {
    delayStyle = { transitionDelay: '0ms' }
  }

  // =========================================================================
  // KONSEP 1: SLIDE 0 (FASHION) -> Elegant Vertical Lift (Naik Masuk & Naik Keluar)
  // =========================================================================
  if (slideIndex === 0) {
    if (isActive && !isExiting) {
      return {
        className: `${baseTransition} opacity-100 translate-y-0 scale-100`,
        style: delayStyle,
      }
    }
    if (isActive && isExiting) {
      return {
        className: `${baseTransition} opacity-0 -translate-y-8 scale-95 pointer-events-none`,
        style: delayStyle,
      }
    }
    return {
      className: `${baseTransition} opacity-0 translate-y-8 scale-95 pointer-events-none`,
      style: delayStyle,
    }
  }

  // =========================================================================
  // KONSEP 2: SLIDE 1 (DIGITAL & CODE) -> Kinetic Lateral Slide & Tech Blur
  // =========================================================================
  if (slideIndex === 1) {
    if (isActive && !isExiting) {
      return {
        className: `${baseTransition} opacity-100 translate-x-0 blur-none scale-100`,
        style: delayStyle,
      }
    }
    if (isActive && isExiting) {
      return {
        className: `${baseTransition} opacity-0 translate-x-12 blur-sm scale-95 pointer-events-none`,
        style: delayStyle,
      }
    }
    return {
      className: `${baseTransition} opacity-0 -translate-x-12 blur-sm scale-95 pointer-events-none`,
      style: delayStyle,
    }
  }

  // =========================================================================
  // KONSEP 3: SLIDE 2 (HOME & LIVING) -> Warm Scale Zoom & Soft Glow Float
  // =========================================================================
  if (isActive && !isExiting) {
    return {
      className: `${baseTransition} opacity-100 translate-y-0 scale-100`,
      style: delayStyle,
    }
  }
  if (isActive && isExiting) {
    return {
      className: `${baseTransition} opacity-0 -translate-y-4 scale-105 pointer-events-none`,
      style: delayStyle,
    }
  }
  return {
    className: `${baseTransition} opacity-0 translate-y-6 scale-90 pointer-events-none`,
    style: delayStyle,
  }
}

export function HeroSlider() {
  const { locale } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const isTransitioningRef = useRef(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Fungsi pergantian slide dengan siklus Animasi OUT terlebih dahulu, lalu pindah slide & Animasi IN
  const changeSlide = useCallback((nextIndex: number) => {
    if (isTransitioningRef.current) return
    isTransitioningRef.current = true

    // 1. Mulai animasi OUT untuk teks slide yang aktif saat ini
    setIsExiting(true)

    // 2. Setelah durasi animasi OUT selesai (350ms), ganti index slide
    setTimeout(() => {
      setCurrent(nextIndex)
      setIsExiting(false)

      // 3. Kunci transisi dibuka kembali setelah track bergeser penuh (700ms)
      setTimeout(() => {
        isTransitioningRef.current = false
      }, 700)
    }, 350)
  }, [])

  const nextSlide = useCallback(() => {
    changeSlide((current + 1) % slides.length)
  }, [changeSlide, current])

  const prevSlide = useCallback(() => {
    changeSlide((current - 1 + slides.length) % slides.length)
  }, [changeSlide, current])

  // Auto-play timer berulang dengan animasi sliding halus
  useEffect(() => {
    if (isPaused) return

    // Cek prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    const timer = setInterval(() => {
      nextSlide()
    }, 5500)

    return () => clearInterval(timer)
  }, [isPaused, nextSlide])

  // Navigasi keyboard (Arrow Left & Arrow Right)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide()
    } else if (e.key === 'ArrowRight') {
      nextSlide()
    }
  }

  return (
    <div
      ref={sliderRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Banner Pilihan Marketplace"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[380px] sm:h-[460px] md:h-[510px] lg:h-[550px] overflow-hidden bg-neutral-950 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none select-none group/slider"
    >
      {/* Sliding Track dengan Animasi translateX murni tanpa zoom pada gambar */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => {
          const isActive = index === current

          const badgeText = locale === 'id' ? slide.badge_id : slide.badge_en
          const titleText = locale === 'id' ? slide.title_id : slide.title_en
          const subtitleText = locale === 'id' ? slide.subtitle_id : slide.subtitle_en
          const ctaText = locale === 'id' ? slide.ctaText_id : slide.ctaText_en
          const altText = locale === 'id' ? slide.alt_id : slide.alt_en

          // Mengambil warna tombol (custom per slide jika ada, atau menggunakan default global)
          const buttonBg = slide.customButtonBg || SLIDER_BUTTON_THEME.bgColor
          const buttonHoverBg = slide.customButtonHoverBg || SLIDER_BUTTON_THEME.hoverBgColor
          const buttonTextColor = slide.customButtonText || SLIDER_BUTTON_THEME.textColor

          // Animasi berbeda untuk masing-masing slide (IN & OUT)
          const badgeAnim = getElementAnimationClasses(index, 'badge', isActive, isExiting)
          const titleAnim = getElementAnimationClasses(index, 'title', isActive, isExiting)
          const subtitleAnim = getElementAnimationClasses(index, 'subtitle', isActive, isExiting)
          const buttonAnim = getElementAnimationClasses(index, 'button', isActive, isExiting)

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} dari ${slides.length}`}
              aria-hidden={!isActive}
              className="relative w-full h-full shrink-0 overflow-hidden"
            >
              {/* Background Image MURNI (Tanpa Efek Zoom / Ken Burns Sesuai Request) */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={slide.image}
                  alt={altText}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
                {/* Overlay Gradient halus agar teks selalu terbaca sangat kontras dan tajam */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
              </div>

              {/* Slide Content: Teks Terpisah dari Gambar dengan Animasi IN & OUT Bertahap */}
              <div className="relative z-20 container mx-auto px-6 sm:px-12 md:px-16 h-full flex flex-col justify-center max-w-7xl">
                <div className="max-w-xl text-white space-y-4">
                  {/* 1. Badge Pill Animasi IN & OUT */}
                  <div className={badgeAnim.className} style={badgeAnim.style}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 tracking-wide shadow-sm">
                      {badgeText}
                    </span>
                  </div>

                  {/* 2. Judul Utama Slide Animasi IN & OUT */}
                  <h1
                    className={`text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-balance drop-shadow-md ${titleAnim.className}`}
                    style={titleAnim.style}
                  >
                    {titleText}
                  </h1>

                  {/* 3. Deskripsi / Subtitle Slide Animasi IN & OUT */}
                  <p
                    className={`text-xs sm:text-base md:text-lg text-white/90 font-normal leading-relaxed drop-shadow-sm max-w-lg ${subtitleAnim.className}`}
                    style={subtitleAnim.style}
                  >
                    {subtitleText}
                  </p>

                  {/* 4. Tombol Aksi (CTA Button) Animasi IN & OUT dengan Warna yang Mudah Diedit */}
                  <div className={`pt-2 ${buttonAnim.className}`} style={buttonAnim.style}>
                    <Link
                      href={slide.ctaLink}
                      style={{
                        backgroundColor: buttonBg,
                        color: buttonTextColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = buttonHoverBg
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = buttonBg
                      }}
                      className="group/btn inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-md font-semibold text-xs sm:text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      <span>{ctaText}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tombol Panah Kiri (<) dengan Efek Hover Halus */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Slide sebelumnya"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/75 hover:bg-white text-neutral-800 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>

      {/* Tombol Panah Kanan (>) dengan Efek Hover Halus */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Slide berikutnya"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/75 hover:bg-white text-neutral-800 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>
    </div>
  )
}
