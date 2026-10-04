import { HeroSlider } from '@/components/home/hero-slider'
import { CategoryGrid } from '@/components/home/category-grid'
import { RecommendedProducts } from '@/components/home/recommended-products'

export default function HomePage() {
  return (
    <div className="w-full flex flex-col bg-background">
      {/* 1. SLIDESHOW HERO BANNER (Di bawah Navbar & Bar Kategori) */}
      <HeroSlider />

      {/* 2. SHOP BY CATEGORY (12 Lingkaran Kategori) */}
      <CategoryGrid />

      {/* 3. REKOMENDASI PRODUK (Grid 6 Kolom + Tombol 'Login Untuk Lihat Lainnya') */}
      <RecommendedProducts />
    </div>
  )
}
