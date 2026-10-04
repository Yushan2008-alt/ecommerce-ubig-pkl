'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CATALOG_CATEGORIES, CategoryNavData } from '@/lib/catalog-data'
import { useLanguage } from '@/context/language-context'

export function CategoryNav() {
  const { locale } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<CategoryNavData | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (cat: CategoryNavData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveCategory(cat)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null)
    }, 180)
  }

  const handleDropdownEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  return (
    <nav
      aria-label="Navigasi Kategori Produk"
      className="relative border-t border-border/60 bg-background hidden md:block"
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Bar Kategori Horizontal (Sesuai Gambar 1) */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center space-x-6 lg:space-x-8 text-xs font-semibold whitespace-nowrap overflow-x-auto scrollbar-none">
          {CATALOG_CATEGORIES.map((cat) => {
            const isActive = activeCategory?.id === cat.id
            const catName = locale === 'id' ? cat.name_id : cat.name_en

            return (
              <div
                key={cat.id}
                className="relative py-2.5"
                onMouseEnter={() => handleMouseEnter(cat)}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`relative py-1 transition-colors select-none block ${
                    isActive
                      ? 'text-[#00a699] font-bold'
                      : 'text-foreground/80 hover:text-[#00a699]'
                  }`}
                >
                  {/* Indikator Bar Atas Teal Saat Aktif / Hover (Persis Gambar 2) */}
                  {isActive && (
                    <span
                      className="absolute -top-2.5 left-0 right-0 h-[2.5px] bg-[#00a699] transition-all"
                      aria-hidden="true"
                    />
                  )}
                  {catName}
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Dropdown Mega Menu Flyout (Persis Gambar 2) */}
      {activeCategory && (
        <div
          role="region"
          aria-label={`Subkategori ${locale === 'id' ? activeCategory.name_id : activeCategory.name_en}`}
          className="absolute top-full left-0 w-full bg-background border-b border-border shadow-xl z-50 animate-in fade-in-50 duration-150"
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container mx-auto px-4 max-w-7xl py-8">
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Sisi Kiri: Kolom-kolom Subkategori (Sesuai Gambar 2) */}
              <div className="col-span-8 grid grid-cols-3 gap-8">
                {activeCategory.subgroups.map((group) => {
                  const groupTitle = locale === 'id' ? group.title_id : group.title_en

                  return (
                    <div key={group.slug} className="space-y-3">
                      <Link
                        href={`/products?category=${activeCategory.slug}&subcategory=${group.slug}`}
                        onClick={() => setActiveCategory(null)}
                        className="font-bold text-sm text-foreground hover:text-[#00a699] transition-colors block pb-1 border-b border-border/40"
                      >
                        {groupTitle}
                      </Link>
                      <ul className="space-y-2">
                        {group.items.map((subItem) => {
                          const itemName = locale === 'id' ? subItem.name_id : subItem.name_en
                          return (
                            <li key={subItem.slug}>
                              <Link
                                href={`/products?category=${activeCategory.slug}&subcategory=${subItem.slug}`}
                                onClick={() => setActiveCategory(null)}
                                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors block py-0.5"
                              >
                                {itemName}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
              </div>

              {/* Sisi Kanan: 3 Visual Featured Cards (Persis Gambar 2) */}
              <div className="col-span-4 grid grid-cols-2 gap-3 pl-4 border-l border-border/50">
                {activeCategory.featuredCards.map((card, idx) => {
                  const cardTitle = locale === 'id' ? card.title_id : card.title_en

                  return (
                    <Link
                      key={card.title_en}
                      href={card.link}
                      onClick={() => setActiveCategory(null)}
                      className={`group relative rounded-xs overflow-hidden border border-border/80 shadow-2xs hover:shadow-md transition-all ${
                        idx === 2 ? 'col-span-2 aspect-[21/9]' : 'aspect-[4/3]'
                      }`}
                    >
                      <Image
                        src={card.imageUrl}
                        alt={cardTitle}
                        fill
                        sizes="220px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Gradient Overlay Gelap */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      {/* Label Teks di Bawah Gambar */}
                      <span className="absolute bottom-2 left-2.5 right-2.5 text-xs font-semibold text-white drop-shadow-xs truncate">
                        {cardTitle}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
