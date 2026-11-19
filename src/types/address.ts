export interface AddressItem {
  id: string
  profileId: string
  recipientName: string
  phone: string
  addressLine: string
  province: string
  city: string
  district?: string
  village?: string
  postalCode: string
  isDefault: boolean
  createdAt: string
}

export interface AddressFormData {
  recipientName: string
  phone: string
  addressLine: string
  province: string
  city: string
  district?: string
  village?: string
  postalCode: string
  isDefault?: boolean
}
