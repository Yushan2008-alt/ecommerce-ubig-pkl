import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CatalogView } from '@/components/products/catalog-view'
import { CatalogProduct, CATALOG_PRODUCTS } from '@/lib/catalog-data'

export const metadata: Metadata = {
  title: 'Katalog Produk & Filter Kategori — Krafita',
  description:
    'Jelajahi produk berkualitas pilihan: pakaian wanita, pria, furnitur, sepatu, aksesoris, dan karya digital terlengkap dengan penawaran terbaik di Krafita.',
}

export default async function ProductsPage() {
  const supabase = await createClient()

  // Ambil produk berstatus 'published' langsung dari Supabase
  const { data: dbProducts } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      price,
      compare_price,
      status,
      type,
      rating_avg,
      rating_count,
      categories(name, slug),
      shops(name),
      brands(name),
      product_images(path, sort_order)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(100)

  // Map data database jika tersedia
  let initialProducts: CatalogProduct[] = CATALOG_PRODUCTS

  if (dbProducts && dbProducts.length > 0) {
    const mappedDbProducts: CatalogProduct[] = dbProducts.map((p, idx) => {
      const fallback = CATALOG_PRODUCTS[idx % CATALOG_PRODUCTS.length]
      const categoryData = Array.isArray(p.categories) ? p.categories[0] : p.categories
      const shopData = Array.isArray(p.shops) ? p.shops[0] : p.shops
      const brandData = Array.isArray(p.brands) ? p.brands[0] : p.brands
      
      // Ambil path gambar cover dari tabel product_images Supabase
      const imagesList = Array.isArray(p.product_images)
        ? [...p.product_images].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        : []
      const coverImage = imagesList.length > 0 ? imagesList[0]?.path : null
      const finalImage = coverImage || fallback.imageUrl

      return {
        id: p.id,
        title_id: p.title,
        title_en: p.title, // Judul resmi dari database
        slug: p.slug,
        category: categoryData?.slug || fallback.category,
        subcategory: categoryData?.slug || fallback.subcategory,
        brand: brandData?.name || fallback.brand,
        fabric: fallback.fabric,
        price: Number(p.price) || fallback.price,
        comparePrice: p.compare_price ? Number(p.compare_price) : fallback.comparePrice,
        vendor: shopData?.name || fallback.vendor,
        rating: Number(p.rating_avg) || fallback.rating,
        wishlistCount: 0,
        featured: true,
        imageUrl: finalImage,
        tags_id: [p.title.toLowerCase(), categoryData?.name?.toLowerCase() || '', brandData?.name?.toLowerCase() || ''],
        tags_en: [p.title.toLowerCase(), categoryData?.name?.toLowerCase() || '', brandData?.name?.toLowerCase() || ''],
      }
    })

    // Tampilkan database products yang terhubung ke vendor akun, dan cegah duplikasi slug
    const seenSlugs = new Set(mappedDbProducts.map((p) => p.slug))
    const uniqueFallbacks = CATALOG_PRODUCTS.filter((p) => !seenSlugs.has(p.slug))
    initialProducts = [...mappedDbProducts, ...uniqueFallbacks]
  }

  return (
    <main className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 max-w-7xl py-12 text-center text-xs text-muted-foreground animate-pulse">
            Memuat katalog produk Krafita...
          </div>
        }
      >
        <CatalogView initialProducts={initialProducts} />
      </Suspense>
    </main>
  )
}
