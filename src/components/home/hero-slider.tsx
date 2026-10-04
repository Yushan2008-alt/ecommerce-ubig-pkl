'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SlideItem {
  id: number
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
  alt: string
}

const slides: SlideItem[] = [
  {
    id: 1,
    title: 'Buy Nice and Unique Clothes',
    subtitle: 'Discover quality premium basics and trendy aesthetics at affordable prices',
    ctaText: 'Belanja Sekarang',
    ctaLink: '/products?category=fashion-pakaian',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85',
    alt: 'Model pakaian trendi dengan tas anyaman jerami di bawah sinar matahari pantai',
  },
  {
    id: 2,
    title: 'Aset Digital, Desain & Source Code',
    subtitle: 'Unduh ribuan template website, UI kit, ilustrasi grafis, dan e-book berkualitas tinggi',
    ctaText: 'Jelajahi Produk Digital',
    ctaLink: '/products?type=digital',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85',
    alt: 'Meja kerja kreatif desainer modern dengan monitor dan perangkat digital',
  },
  {
    id: 3,
    title: 'Modern Living & Handcrafted Decor',
    subtitle: 'Sentuhan hangat perabotan estetik dan dekorasi rumah buatan tangan dari pengrajin terbaik',
    ctaText: 'Koleksi Rumah & Living',
    ctaLink: '/products?category=rumah-living',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=85',
    alt: 'Ruang tamu modern estetik dengan perabotan kayu dan dekorasi minimalis',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  // Auto-play timer berulang dengan animasi sliding halus
  useEffect(() => {
    if (isPaused) return

    // Cek prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    const timer = setInterval(() => {
      nextSlide()
    }, 4500)

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
      className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] lg:h-[540px] overflow-hidden bg-neutral-900 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none select-none"
    >
      {/* Sliding Track dengan Animasi translateX */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => {
          const isActive = index === current
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} dari ${slides.length}`}
              aria-hidden={!isActive}
              className="relative w-full h-full shrink-0 overflow-hidden"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
                {/* Overlay Gradient halus agar teks selalu terbaca kontras */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />
              </div>

              {/* Slide Content (Kiri sesuai referensi gambar) */}
              <div className="relative z-20 container mx-auto px-6 sm:px-12 md:px-16 h-full flex flex-col justify-center max-w-7xl">
                <div className="max-w-xl text-white space-y-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-balance drop-shadow-sm">
                    {slide.title}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-white/90 font-normal leading-relaxed drop-shadow-sm max-w-lg">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#00a699] hover:bg-[#008f84] text-white font-medium text-sm transition-colors shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tombol Panah Kiri (<) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Slide sebelumnya"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>

      {/* Tombol Panah Kanan (>) */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Slide berikutnya"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>
    </div>
  )
}
