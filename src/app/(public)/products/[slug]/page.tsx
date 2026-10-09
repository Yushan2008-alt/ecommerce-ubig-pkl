import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { getProductReviewsAction, getProductCommentsAction } from '@/actions/social'
import { ProductDetailView } from '@/components/product/product-detail-view'
import { CATALOG_PRODUCTS } from '@/lib/catalog-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: prod } = await supabase
    .from('products')
    .select('title, description')
    .eq('slug', slug)
    .maybeSingle()

  if (prod) {
    return {
      title: `${prod.title} — Krafita`,
      description: prod.description.slice(0, 160),
    }
  }

  const fallback = CATALOG_PRODUCTS.find((p) => p.slug === slug)
  if (fallback) {
    return {
      title: `${fallback.title_id} — Krafita`,
      description: `Beli ${fallback.title_id} berkualitas harga terbaik di Krafita.`,
    }
  }

  return {
    title: 'Detail Produk — Krafita',
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { user } = await getUser()

  // 1. Ambil data produk dari database Supabase
  const { data: dbProduct } = (await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, slug),
      shops (id, name, slug, logo_url, city, province, whatsapp, profile_id, flat_shipping_cost),
      brands (id, name),
      product_images (id, path, sort_order),
      digital_files (id, file_name, size, format)
    `)
    .eq('slug', slug)
    .maybeSingle()) as any

  let product: any = dbProduct

  // Fallback ke catalog mock jika belum ada di database
  if (!product) {
    const fallback = CATALOG_PRODUCTS.find((p) => p.slug === slug)
    if (!fallback) {
      notFound()
    }

    product = {
      id: fallback.id,
      title: fallback.title_id,
      slug: fallback.slug,
      description: `${fallback.title_id} merupakan produk pilihan premium di Krafita. Dibuat dengan material berkualitas tinggi ${
        fallback.fabric ? `(${fallback.fabric})` : ''
      } untuk kenyamanan dan kepuasan maksimal Anda.`,
      price: fallback.price,
      compare_price: fallback.comparePrice ?? null,
      status: 'published',
      type: 'physical',
      stock: 25,
      weight: 500,
      sku: `KRF-${fallback.id.slice(0, 6)}`,
      rating_avg: fallback.rating,
      rating_count: 5,
      categories: { id: fallback.category, name: fallback.category, slug: fallback.category },
      shops: {
        id: 'shop-mock',
        name: fallback.vendor,
        slug: 'toko-resmi',
        city: 'Bandung',
        province: 'Jawa Barat',
        whatsapp: '081234567890',
        profile_id: 'mock-vendor-id',
        flat_shipping_cost: 15000,
      },
      product_images: [{ id: '1', path: fallback.imageUrl, sort_order: 0 }],
      attributes: {
        Bahan: fallback.fabric || 'Katun Premium',
        Brand: fallback.brand,
      },
    }
  }

  if (!product) {
    notFound()
  }

  // 2. Ambil reviews & comments
  const [reviewRes, commentRes] = await Promise.all([
    getProductReviewsAction(product.id),
    getProductCommentsAction(product.id, product.shops?.profile_id),
  ])

  // 3. Cek apakah user berhak menulis ulasan (memiliki pesanan completed)
  let eligibleOrderItemId: string | null = null
  let isInWishlist = false

  if (user) {
    const { data: eligibleItems } = await supabase
      .from('order_items')
      .select('id, fulfilment_status, orders!inner(profile_id)')
      .eq('product_id', product.id)
      .eq('fulfilment_status', 'completed')
      .eq('orders.profile_id', user.id)

    if (eligibleItems && eligibleItems.length > 0) {
      for (const item of eligibleItems) {
        const { data: existingRev } = await supabase
          .from('reviews')
          .select('id')
          .eq('order_item_id', item.id)
          .maybeSingle()

        if (!existingRev) {
          eligibleOrderItemId = item.id
          break
        }
      }
    }

    const { data: wish } = await supabase
      .from('wishlists')
      .select('id')
      .eq('product_id', product.id)
      .eq('profile_id', user.id)
      .maybeSingle()

    isInWishlist = Boolean(wish)
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6 md:py-10">
      <ProductDetailView
        product={product}
        reviews={reviewRes.reviews || []}
        comments={commentRes.comments || []}
        ratingAvg={reviewRes.ratingAvg || Number(product.rating_avg) || 0}
        ratingCount={reviewRes.ratingCount || Number(product.rating_count) || 0}
        eligibleOrderItemId={eligibleOrderItemId}
        currentUserId={user?.id || null}
        isInWishlist={isInWishlist}
      />
    </div>
  )
}
