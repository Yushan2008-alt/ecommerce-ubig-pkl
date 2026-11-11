import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { HeroSlider } from '@/components/home/hero-slider'
import { CategoryGrid } from '@/components/home/category-grid'
import { RecommendedProducts, RecommendedProductItem } from '@/components/home/recommended-products'

export default async function HomePage() {
  const { user } = await getUser()
  const isMember = Boolean(user)

  let mappedProducts: RecommendedProductItem[] = []

  try {
    const supabase = await createClient()
    const { data: dbProducts } = await supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        price,
        compare_price,
        type,
        rating_avg,
        rating_count,
        shops (name, slug),
        product_images (path, sort_order)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(18)

    if (dbProducts && dbProducts.length > 0) {
      mappedProducts = dbProducts.map((p: any, idx: number) => {
        const images = Array.isArray(p.product_images) ? [...p.product_images] : []
        images.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        const imageUrl =
          images[0]?.path ||
          'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80'

        let discountPercent: number | undefined
        if (p.compare_price && p.compare_price > p.price) {
          discountPercent = Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
        }

        const sellerTypes: Array<'Star' | 'Star+' | 'Mall'> = ['Mall', 'Star+', 'Star']
        const sellerType = sellerTypes[idx % sellerTypes.length]

        let tag = 'Garansi Harga Terbaik'
        if (p.type === 'digital') {
          tag = 'Produk Digital'
        } else if (discountPercent && discountPercent >= 20) {
          tag = 'Diskon Spesial'
        }

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: Number(p.price),
          originalPrice: p.compare_price ? Number(p.compare_price) : undefined,
          discountPercent,
          sellerType,
          tag,
          imageUrl,
          alt: p.title,
          isDigital: p.type === 'digital',
        }
      })
    }
  } catch (err) {
    console.warn('[HomePage Fetch Products Warning]', err)
  }

  return (
    <div className="w-full flex flex-col bg-background">
      {/* 1. SLIDESHOW HERO BANNER: Hanya tampil untuk pengunjung tamu (guest), disembunyikan untuk member terdaftar */}
      {!isMember && <HeroSlider />}

      {/* 2. SHOP BY CATEGORY: Langsung tampil untuk member */}
      <CategoryGrid />

      {/* 3. REKOMENDASI PRODUK */}
      <RecommendedProducts
        initialProducts={mappedProducts.length > 0 ? mappedProducts : undefined}
        isLoggedIn={isMember}
      />
    </div>
  )
}
