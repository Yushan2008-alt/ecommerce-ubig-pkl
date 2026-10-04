'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CATALOG_CATEGORIES,
  CATALOG_BRANDS,
  CATALOG_FABRICS,
  CATALOG_PRODUCTS,
  CatalogProduct,
} from '@/lib/catalog-data'
import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  Heart,
  Star,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react'

interface CatalogViewProps {
  initialProducts?: CatalogProduct[]
}

export function CatalogView({ initialProducts }: CatalogViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Ambil state dari URL query params
  const currentCategorySlug = searchParams.get('category') || 'clothing'
  const currentSubcategory = searchParams.get('subcategory') || ''
  const currentQuery = searchParams.get('q') || ''
  const currentSort = searchParams.get('sort') || 'recent'

  // Filter state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [brandSearch, setBrandSearch] = useState('')
  const [priceMin, setPriceMin] = useState<string>('')
  const [priceMax, setPriceMax] = useState<string>('')
  const [sortOption, setSortOption] = useState(currentSort)
  const [isBrandOpen, setIsBrandOpen] = useState(true)
  const [isFabricOpen, setIsFabricOpen] = useState(true)
  const [isPriceOpen, setIsPriceOpen] = useState(true)
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({})
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Scroll to top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Data Kategori Aktif
  const activeCategory = useMemo(() => {
    return (
      CATALOG_CATEGORIES.find((c) => c.slug === currentCategorySlug) ||
      CATALOG_CATEGORIES[0]
    )
  }, [currentCategorySlug])

  // Gabungkan produk database dengan catalog mock
  const allProducts = useMemo(() => {
    const base = initialProducts && initialProducts.length > 0 ? initialProducts : CATALOG_PRODUCTS
    return base
  }, [initialProducts])

  // Filter Brand berdasarkan input pencarian brand
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return CATALOG_BRANDS
    return CATALOG_BRANDS.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase().trim())
    )
  }, [brandSearch])

  // Toggle filter brand
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  // Toggle filter fabric
  const toggleFabric = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    )
  }

  // Toggle Wishlist
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlistedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Reset semua filter
  const resetFilters = () => {
    setSelectedBrands([])
    setSelectedFabrics([])
    setPriceMin('')
    setPriceMax('')
    setBrandSearch('')
  }

  // Filter dan Sort Produk
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Filter Kategori (Jika user memilih kategori tertentu)
      if (currentCategorySlug && currentCategorySlug !== 'all') {
        if (product.category !== currentCategorySlug) {
          // Check if category matches
          return false
        }
      }

      // Filter Subkategori
      if (currentSubcategory) {
        if (
          product.subcategory !== currentSubcategory &&
          !product.slug.includes(currentSubcategory)
        ) {
          return false
        }
      }

      // Filter Search Query
      if (currentQuery) {
        const q = currentQuery.toLowerCase()
        const matchesTitle = product.title.toLowerCase().includes(q)
        const matchesBrand = product.brand.toLowerCase().includes(q)
        if (!matchesTitle && !matchesBrand) return false
      }

      // Filter Brands
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(product.brand)) return false
      }

      // Filter Fabrics
      if (selectedFabrics.length > 0) {
        if (!product.fabric || !selectedFabrics.includes(product.fabric)) return false
      }

      // Filter Min Price
      if (priceMin && !product.isQuote) {
        const min = Number(priceMin)
        if (!isNaN(min) && product.price < min) return false
      }

      // Filter Max Price
      if (priceMax && !product.isQuote) {
        const max = Number(priceMax)
        if (!isNaN(max) && product.price > max) return false
      }

      return true
    }).sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price
      if (sortOption === 'price_desc') return b.price - a.price
      if (sortOption === 'rating') return b.rating - a.rating
      return 0 // default recent
    })
  }, [
    allProducts,
    currentCategorySlug,
    currentSubcategory,
    currentQuery,
    selectedBrands,
    selectedFabrics,
    priceMin,
    priceMax,
    sortOption,
  ])

  // Format Rupiah
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace(/\s+/g, ' ')
  }

  // Handle Sort Change
  const handleSortChange = (newSort: string) => {
    setSortOption(newSort)
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSort)
    router.replace(`/products?${params.toString()}`, { scroll: false })
  }

  const activeFiltersCount =
    selectedBrands.length +
    selectedFabrics.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0)

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      {/* 1. Breadcrumbs (Persis Gambar 3: Home / Products / Clothing) */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
          </li>
          {activeCategory && (
            <>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-foreground">{activeCategory.name}</li>
            </>
          )}
          {currentSubcategory && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-primary font-medium capitalize">
                {currentSubcategory.replace(/-/g, ' ')}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-xs font-semibold bg-background hover:bg-muted/50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span>Filter Produk ({activeFiltersCount})</span>
        </button>

        {/* Mobile Sort Dropdown */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-transparent border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Urutkan produk"
          >
            <option value="recent">Most Recent</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
            <option value="rating">Rating Tertinggi</option>
          </select>
        </div>
      </div>

      {/* 2. Main Content Grid: Sidebar Kiri (1/4) + Katalog Kanan (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR FILTER (Persis Sesuai Gambar 3) */}
        <aside
          className={`lg:col-span-3 bg-background border border-border/80 rounded-md p-5 space-y-6 ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 overflow-y-auto bg-background p-6 lg:static lg:p-5'
              : 'hidden lg:block'
          }`}
        >
          {/* Header Mobile Drawer */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-border">
            <h3 className="font-bold text-base text-foreground">Filter Produk</h3>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Tutup filter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reset Filter Button if active */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="text-xs font-semibold text-muted-foreground">
                {activeFiltersCount} Filter Aktif
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-destructive hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Semua
              </button>
            </div>
          )}

          {/* SECTION 1: CATEGORY (Persis Gambar 3: ← Clothing + Subkategori) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Category
            </h4>
            <div className="space-y-2">
              <Link
                href={`/products?category=${activeCategory.slug}`}
                className="flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-[#00a699] transition-colors"
              >
                <span>←</span>
                <span>{activeCategory.name}</span>
              </Link>

              {/* Subkategori Indented */}
              <div className="pl-4 space-y-1.5 border-l-2 border-border/60">
                {activeCategory.subgroups.map((group) => {
                  const isSubActive = currentSubcategory === group.slug
                  return (
                    <Link
                      key={group.slug}
                      href={`/products?category=${activeCategory.slug}&subcategory=${group.slug}`}
                      onClick={() => setMobileFilterOpen(false)}
                      className={`block text-xs py-0.5 transition-colors ${
                        isSubActive
                          ? 'font-bold text-[#00a699]'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {group.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* SECTION 2: BRAND FILTER (Persis Gambar 3: Search Brand input + Checkboxes scrollable) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsBrandOpen(!isBrandOpen)}
              className="w-full flex items-center justify-between text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer select-none"
            >
              <span>Brand</span>
              {isBrandOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {isBrandOpen && (
              <div className="space-y-3 pt-1">
                {/* Search Brand Input (Persis Gambar 3) */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Brand"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    aria-label="Cari Brand"
                    className="w-full h-8 pl-3 pr-8 text-xs bg-background border border-border rounded-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
                  />
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>

                {/* Checkbox List Scrollable */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {filteredBrands.map((brand) => {
                    const isChecked = selectedBrands.includes(brand)
                    return (
                      <label
                        key={brand}
                        className="flex items-center gap-2.5 text-xs text-foreground/80 hover:text-foreground cursor-pointer select-none py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brand)}
                          className="w-3.5 h-3.5 rounded-2xs border-border text-[#00a699] focus:ring-[#00a699] cursor-pointer"
                        />
                        <span className={isChecked ? 'font-semibold text-[#00a699]' : ''}>
                          {brand}
                        </span>
                      </label>
                    )
                  })}
                  {filteredBrands.length === 0 && (
                    <p className="text-[11px] text-muted-foreground py-1">Brand tidak ditemukan</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <hr className="border-border/60" />

          {/* SECTION 3: FABRIC FILTER (Persis Gambar 3: Checkboxes Bamboo, Cotton, etc.) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsFabricOpen(!isFabricOpen)}
              className="w-full flex items-center justify-between text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer select-none"
            >
              <span>Fabric</span>
              {isFabricOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {isFabricOpen && (
              <div className="space-y-2 pt-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {CATALOG_FABRICS.map((fabric) => {
                  const isChecked = selectedFabrics.includes(fabric)
                  return (
                    <label
                      key={fabric}
                      className="flex items-center gap-2.5 text-xs text-foreground/80 hover:text-foreground cursor-pointer select-none py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFabric(fabric)}
                        className="w-3.5 h-3.5 rounded-2xs border-border text-[#00a699] focus:ring-[#00a699] cursor-pointer"
                      />
                      <span className={isChecked ? 'font-semibold text-[#00a699]' : ''}>
                        {fabric}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <hr className="border-border/60" />

          {/* SECTION 4: PRICE FILTER */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              className="w-full flex items-center justify-between text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer select-none"
            >
              <span>Price</span>
              {isPriceOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {isPriceOpen && (
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Min (Rp)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full h-8 px-2 text-xs bg-background border border-border rounded-xs focus:outline-none focus:border-[#00a699]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Max (Rp)</label>
                    <input
                      type="number"
                      placeholder="Maks"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full h-8 px-2 text-xs bg-background border border-border rounded-xs focus:outline-none focus:border-[#00a699]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {mobileFilterOpen && (
            <div className="pt-4 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-[#00a699] text-white py-2.5 rounded-md text-xs font-semibold"
              >
                Terapkan Filter ({filteredProducts.length} Produk)
              </button>
            </div>
          )}
        </aside>

        {/* RIGHT MAIN CATALOG CONTENT (Persis Sesuai Gambar 3) */}
        <section className="lg:col-span-9 space-y-5">
          {/* Top Control Bar: Total produk + Sorting Dropdown */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="text-xs text-muted-foreground">
              Menampilkan{' '}
              <span className="font-semibold text-foreground">{filteredProducts.length}</span> produk
              {currentQuery && (
                <span>
                  {' '}
                  untuk kata kunci &ldquo;<strong className="text-foreground">{currentQuery}</strong>&rdquo;
                </span>
              )}
            </div>

            {/* Sorting Dropdown (Persis Gambar 3: ⇅ Most Recent) */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative inline-flex items-center">
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                  aria-label="Urutkan produk"
                  className="appearance-none h-9 pl-8 pr-8 text-xs font-semibold bg-background border border-border rounded-xs hover:border-foreground/40 focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699] cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price_asc">Harga: Terendah ke Tertinggi</option>
                  <option value="price_desc">Harga: Tertinggi ke Terendah</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 4-Column Product Grid (Persis Sesuai Gambar 3) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((prod) => {
                const isFavorited = wishlistedIds[prod.id]

                return (
                  <article
                    key={prod.id}
                    className="group bg-card border border-border/80 hover:border-[#00a699]/60 hover:shadow-lg transition-all rounded-xs overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-[#00a699]"
                  >
                    {/* Media Gambar Produk */}
                    <div className="relative aspect-[3/4] w-full bg-muted/30 overflow-hidden">
                      <Image
                        src={prod.imageUrl}
                        alt={prod.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />

                      {/* Badge "Featured" Hijau di Pojok Kiri Atas (Persis Gambar 3) */}
                      {prod.featured && (
                        <div className="absolute top-2.5 left-2.5 bg-[#10b981] text-white text-[10px] font-bold px-2 py-0.5 rounded-2xs shadow-xs tracking-wide">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Informasi Produk (Persis Gambar 3) */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        {/* Judul Produk */}
                        <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-[#00a699] transition-colors">
                          <Link href={`/products/${prod.slug}`} className="focus:outline-none">
                            {prod.title}
                          </Link>
                        </h3>

                        {/* Nama Toko / Vendor (Persis Gambar 3: Trendshop / Admin) */}
                        <p className="text-[11px] text-muted-foreground">{prod.vendor}</p>

                        {/* Rating Bintang & Wishlist Count (Persis Gambar 3) */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3 h-3 ${
                                  starIdx <= Math.floor(prod.rating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : starIdx - 0.5 <= prod.rating
                                    ? 'text-amber-400 fill-amber-400/50'
                                    : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Heart Wishlist Icon + Count (Persis Gambar 3: ♡ 0) */}
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(prod.id, e)}
                            aria-label={`Sukai ${prod.title}`}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer select-none"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isFavorited
                                  ? 'text-rose-500 fill-rose-500'
                                  : 'text-muted-foreground hover:text-rose-500'
                              }`}
                            />
                            <span>{prod.wishlistCount + (isFavorited ? 1 : 0)}</span>
                          </button>
                        </div>
                      </div>

                      {/* Baris Harga (Persis Gambar 3: Green Price + Strikethrough atau Request a Quote) */}
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        {prod.isQuote ? (
                          <span className="text-xs font-bold text-foreground">
                            Request a Quote
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-extrabold text-[#00a699] tabular-nums">
                              {formatIDR(prod.price)}
                            </span>
                            {prod.comparePrice && prod.comparePrice > prod.price && (
                              <span className="text-xs text-muted-foreground line-through tabular-nums">
                                {formatIDR(prod.comparePrice)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            /* State Kosong */
            <div className="bg-card border border-border rounded-lg p-12 text-center space-y-3">
              <p className="text-base font-semibold text-foreground">
                Tidak ada produk yang cocok dengan filter yang dipilih.
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Coba sesuaikan pencarian brand, bahan fabric, atau rentang harga untuk melihat lebih banyak produk.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 px-4 py-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </section>
      </div>

      {/* 3. Floating Scroll-to-Top Button (Persis Gambar 3 di Pojok Kanan Bawah: Black square with chevron up) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 w-10 h-10 bg-black/90 hover:bg-black text-white rounded-xs shadow-lg flex items-center justify-center transition-all duration-300 z-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a699] focus-visible:outline-none"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </div>
  )
}
