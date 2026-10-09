import { getUser } from '@/lib/auth'
import { HeroSlider } from '@/components/home/hero-slider'
import { CategoryGrid } from '@/components/home/category-grid'
import { RecommendedProducts } from '@/components/home/recommended-products'

export default async function HomePage() {
  const { user } = await getUser()
  const isMember = Boolean(user)

  return (
    <div className="w-full flex flex-col bg-background">
      {/* 1. SLIDESHOW HERO BANNER: Hanya tampil untuk pengunjung tamu (guest), disembunyikan untuk member terdaftar */}
      {!isMember && <HeroSlider />}

      {/* 2. SHOP BY CATEGORY: Langsung tampil untuk member */}
      <CategoryGrid />

      {/* 3. REKOMENDASI PRODUK */}
      <RecommendedProducts isLoggedIn={isMember} />
    </div>
  )
}
