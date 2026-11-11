import type { Database, ShopMetadata } from '@/types/database'

type Shop = Database['public']['Tables']['shops']['Row']

export interface VendorApplicationItem {
  shop: Shop
  metadata: ShopMetadata
  applicant: {
    id: string
    displayName: string
    email: string | null
    role: string
  }
}
