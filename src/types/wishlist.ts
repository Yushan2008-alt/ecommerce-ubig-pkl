export interface WishlistProductItem {
  id: string
  productId: string
  title: string
  slug: string
  price: number
  comparePrice?: number | null
  imageUrl: string
  rating: number
  ratingCount: number
  shopName: string
  shopSlug: string
  createdAt: string
}
