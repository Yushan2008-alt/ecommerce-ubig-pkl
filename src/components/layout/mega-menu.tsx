import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChevronDown, Layers } from 'lucide-react'

interface CategoryItem {
  id: string
  parent_id: string | null
  name: string
  slug: string
  icon_url: string | null
  sort_order: number
}

interface CategoryTreeItem extends CategoryItem {
  children: (CategoryItem & {
    children: CategoryItem[]
  })[]
}

export async function MegaMenu() {
  const supabase = await createClient()

  // Ambil seluruh data kategori secara real-time dari Supabase
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  const items = (categories as CategoryItem[] | null) || []

  // Susun struktur pohon 3 tingkat
  const level1 = items.filter((c) => !c.parent_id)
  const categoryTree: CategoryTreeItem[] = level1.map((cat1) => {
    const childrenLevel2 = items
      .filter((c) => c.parent_id === cat1.id)
      .map((cat2) => ({
        ...cat2,
        children: items.filter((c) => c.parent_id === cat2.id),
      }))

    return {
      ...cat1,
      children: childrenLevel2,
    }
  })

  return (
    <nav className="border-b bg-background border-border/60 text-sm hidden md:block">
      <div className="container mx-auto px-4 flex items-center justify-between h-11">
        <div className="flex items-center space-x-1 lg:space-x-4">
          {/* Menu Dropdown Semua Kategori */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <Layers className="w-4 h-4 text-primary" />
              <span>Semua Kategori</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Panel Dropdown Mega Menu 3 Tingkat */}
            <div className="absolute top-full left-0 w-[800px] bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="grid grid-cols-3 gap-6">
                {categoryTree.map((lvl1) => (
                  <div key={lvl1.id} className="space-y-3">
                    <Link
                      href={`/products?category=${lvl1.slug}`}
                      className="font-semibold text-foreground text-sm hover:text-primary transition-colors flex items-center gap-1 border-b pb-1.5 border-border/80"
                    >
                      {lvl1.name}
                    </Link>

                    {lvl1.children.map((lvl2) => (
                      <div key={lvl2.id} className="space-y-1 pl-1">
                        <Link
                          href={`/products?category=${lvl2.slug}`}
                          className="font-medium text-xs text-muted-foreground hover:text-foreground transition-colors block"
                        >
                          {lvl2.name}
                        </Link>

                        {lvl2.children.length > 0 && (
                          <div className="pl-2 space-y-1 border-l border-border/50">
                            {lvl2.children.map((lvl3) => (
                              <Link
                                key={lvl3.id}
                                href={`/products?category=${lvl3.slug}`}
                                className="text-[11px] text-muted-foreground/80 hover:text-primary transition-colors block"
                              >
                                {lvl3.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick links kategori level 1 di bar atas */}
          {categoryTree.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Link Cepat Khusus */}
        <div className="flex items-center space-x-4 text-xs font-medium text-muted-foreground">
          <Link href="/products?type=digital" className="hover:text-primary transition-colors">
            Produk Digital
          </Link>
          <Link href="/products?discount=true" className="hover:text-primary transition-colors">
            Promo Spesial
          </Link>
          <Link href="/shops" className="hover:text-primary transition-colors">
            Daftar Toko
          </Link>
        </div>
      </div>
    </nav>
  )
}
