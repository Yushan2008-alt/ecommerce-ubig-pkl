import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/vendor/product-form'
import { DASHBOARD_12_CATEGORIES } from '@/lib/catalog-data'

export const metadata = {
  title: 'Edit Produk — Krafita Vendor Center',
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Ambil data produk
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (id, path, sort_order),
      digital_files (id, path, file_name, size, format)
    `)
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Ambil 12 data kategori terurut
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order')
    .order('sort_order', { ascending: true })

  const categories =
    dbCategories && dbCategories.length > 0
      ? dbCategories
      : DASHBOARD_12_CATEGORIES.map((c) => ({
          id: c.slug,
          name: c.name_id,
          slug: c.slug,
        }))

  return (
    <div className="max-w-4xl mx-auto py-2">
      <ProductForm initialData={product} categories={categories} />
    </div>
  )
}
