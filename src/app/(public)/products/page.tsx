import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CatalogView } from '@/components/products/catalog-view'
import { CatalogProduct, CATALOG_PRODUCTS } from '@/lib/catalog-data'

export const metadata: Metadata = {
  title: 'Katalog Produk & Filter Kategori — Krafita Marketplace',
  description:
    'Jelajahi produk berkualitas pilihan: pakaian wanita, pria, furnitur, sepatu, aksesoris, dan karya digital terlengkap dengan penawaran terbaik di Krafita.',
}

export default async function ProductsPage() {
  const supabase = await createClient()

  // Ambil produk jika sudah ada yang berstatus 'published' di Supabase
  const { data: dbProducts } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      price,
      compare_price,
      status,
      categories(name, slug),
      shops(name)
    `)
    .eq('status', 'published')
    .limit(40)

  // Map data database jika tersedia
  let initialProducts: CatalogProduct[] = CATALOG_PRODUCTS

  if (dbProducts && dbProducts.length > 0) {
    const mappedDbProducts: CatalogProduct[] = dbProducts.map((p, idx) => {
      const fallback = CATALOG_PRODUCTS[idx % CATALOG_PRODUCTS.length]
      const categoryData = Array.isArray(p.categories) ? p.categories[0] : p.categories
      const shopData = Array.isArray(p.shops) ? p.shops[0] : p.shops

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: categoryData?.slug || fallback.category,
        subcategory: fallback.subcategory,
        brand: fallback.brand,
        fabric: fallback.fabric,
        price: Number(p.price) || fallback.price,
        comparePrice: p.compare_price ? Number(p.compare_price) : fallback.comparePrice,
        vendor: shopData?.name || fallback.vendor,
        rating: fallback.rating,
        wishlistCount: fallback.wishlistCount,
        featured: fallback.featured,
        imageUrl: fallback.imageUrl,
      }
    })

    // Gabungkan database products dengan mock catalog items
    initialProducts = [...mappedDbProducts, ...CATALOG_PRODUCTS]
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
