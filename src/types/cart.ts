export interface CartProductDetail {
  id: string
  productId: string
  title: string
  slug: string
  price: number
  comparePrice?: number | null
  type: 'physical' | 'digital'
  stock: number | null
  imageUrl: string
  qty: number
  buyerNote: string | null
  shopId: string
  shopName: string
  shopSlug: string
  shopCity: string | null
  flatShippingCost: number
}

export interface ShopCartGroup {
  shopId: string
  shopName: string
  shopSlug: string
  shopCity: string | null
  flatShippingCost: number
  hasPhysical: boolean
  effectiveShippingCost: number
  shopSubtotal: number
  items: CartProductDetail[]
}

export interface CartDetailsResult {
  groups: ShopCartGroup[]
  totalItems: number
  totalProductAmount: number
  totalShippingAmount: number
  grandTotal: number
}
