import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/vendor/product-form'
import { DASHBOARD_12_CATEGORIES } from '@/lib/catalog-data'

export const metadata = {
  title: 'Tambah Produk Baru — Krafita Vendor Center',
}

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order')
    .order('sort_order', { ascending: true })

  // Fallback ke 12 kategori dashboard jika tabel categories belum memiliki data
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
      <ProductForm categories={categories} />
    </div>
  )
}
