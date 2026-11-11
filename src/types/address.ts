export interface AddressItem {
  id: string
  profileId: string
  recipientName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
  createdAt: string
}

export interface AddressFormData {
  recipientName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
  isDefault?: boolean
}
