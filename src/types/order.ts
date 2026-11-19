export interface CheckoutItemPayload {
  productId: string
  title: string
  slug?: string
  price: number
  qty: number
  imageUrl?: string
  shopId?: string
}

export interface ShippingAddressPayload {
  recipientName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
}

export interface ShippingOptionPayload {
  name: string
  courier: string
  cost: number
  estimatedDays: string
}

export interface ServiceOrderPayload {
  customerName: string
  customerPhone: string
  customerEmail: string
  division: string
  serviceName: string
  complexity?: string
  projectTitle: string
  deadline: string
  description?: string
  basePrice: number
  taxAmount: number
  serviceFee: number
  totalAmount: number
  productId?: string
  items?: CheckoutItemPayload[]
}

export interface MarketplaceOrderItemPayload {
  productId: string
  title: string
  price: number
  qty: number
  imageUrl?: string
  shopId?: string
  shopName?: string
  shopCity?: string
  type: 'physical' | 'digital'
  buyerNote?: string
}

export interface MarketplaceOrderPayload {
  items: MarketplaceOrderItemPayload[]
  shippingAddress?: {
    recipientName: string
    phone: string
    addressLine: string
    city: string
    province: string
    postalCode: string
  } | null
  shippingOption?: {
    name: string
    courier: string
    cost: number
    estimatedDays: string
  } | null
  hasPhysicalItems: boolean
  customerEmail?: string
}
