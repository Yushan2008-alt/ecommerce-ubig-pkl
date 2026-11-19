'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, MapPin, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import {
  addAddressAction,
  updateAddressAction,
} from '@/actions/address'
import { extractAddressLineDetails } from '@/lib/address-helper'
import type { AddressItem, AddressFormData } from '@/types/address'
import {
  INDONESIA_PROVINCES,
  getCitiesByProvinceName,
  getDistrictsByCityName,
  getVillagesByDistrictName,
  getPostalCodeByDistrictAndVillage,
  getPostalCodeByCityName,
} from '@/data/indonesia-regions'
import { SearchableSelect } from '@/components/ui/searchSelect'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  addressToEdit?: AddressItem | null
  onSuccess: () => void
}

function cleanPhoneDigits(value: string, country = '+62'): string {
  let digits = value.replace(/\D/g, '')

  if (country === '+62') {
    while (digits.startsWith('62') || digits.startsWith('0')) {
      if (digits.startsWith('62')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  } else if (country === '+60') {
    while (digits.startsWith('60') || digits.startsWith('0')) {
      if (digits.startsWith('60')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  } else if (country === '+65') {
    while (digits.startsWith('65') || digits.startsWith('0')) {
      if (digits.startsWith('65')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  }

  return digits
}

function formatPhoneNumber(value: string, country = '+62'): string {
  let digits = cleanPhoneDigits(value, country)
  digits = digits.slice(0, 15)

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11)}`
}

export function AddressModal({
  isOpen,
  onClose,
  addressToEdit,
  onSuccess,
}: AddressModalProps) {
  const { t, locale } = useLanguage()

  const [formData, setFormData] = useState<AddressFormData>({
    recipientName: '',
    phone: '',
    addressLine: '',
    province: '',
    city: '',
    district: '',
    village: '',
    postalCode: '',
    isDefault: false,
  })

  const [countryCode, setCountryCode] = useState('+62')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [prevAddressToEdit, setPrevAddressToEdit] = useState(addressToEdit)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (prevAddressToEdit !== addressToEdit || prevIsOpen !== isOpen) {
    setPrevAddressToEdit(addressToEdit)
    setPrevIsOpen(isOpen)
    if (addressToEdit) {
      const rawPhone = addressToEdit.phone || ''
      let editCountry = '+62'
      if (rawPhone.startsWith('+60') || rawPhone.startsWith('60')) editCountry = '+60'
      else if (rawPhone.startsWith('+65') || rawPhone.startsWith('65')) editCountry = '+65'
      setCountryCode(editCountry)

      const { cleanAddressLine, district: extractedDist, village: extractedVil } =
        extractAddressLineDetails(addressToEdit.addressLine)

      const district = addressToEdit.district || extractedDist || ''
      const village = addressToEdit.village || extractedVil || ''

      setFormData({
        recipientName: addressToEdit.recipientName,
        phone: formatPhoneNumber(rawPhone, editCountry),
        addressLine: cleanAddressLine,
        province: addressToEdit.province,
        city: addressToEdit.city,
        district,
        village,
        postalCode: addressToEdit.postalCode,
        isDefault: addressToEdit.isDefault,
      })
    } else {
      setCountryCode('+62')
      setFormData({
        recipientName: '',
        phone: '',
        addressLine: '',
        province: '',
        city: '',
        district: '',
        village: '',
        postalCode: '',
        isDefault: false,
      })
    }
    setErrorMessage(null)
  }

  if (!isOpen) return null

  const handleCancel = () => {
    if (addressToEdit) {
      const isConfirmed = window.confirm("Apakah anda yakin?")
      if (!isConfirmed) return
    }
    onClose()
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }
  
  const handleProvinceSelect = (selectedProv: string) => {
    setFormData((prev) => ({
      ...prev,
      province: selectedProv,
      city: '',
      district: '',
      village: '',
      postalCode: '',
    }))
  }

  const handleCitySelect = (selectedCity: string) => {
    const autoPostalCode = getPostalCodeByCityName(selectedCity)
    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
      district: '',
      village: '',
      postalCode: autoPostalCode || prev.postalCode,
    }))
  }

  const handleDistrictSelect = (selectedDistrict: string) => {
    setFormData((prev) => ({
      ...prev,
      district: selectedDistrict,
      village: '',
    }))
  }

  const handleVillageSelect = (selectedVillage: string) => {
    const postal = getPostalCodeByDistrictAndVillage(formData.district || '', selectedVillage, formData.city)
    setFormData((prev) => ({
      ...prev,
      village: selectedVillage,
      postalCode: postal || prev.postalCode,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validasi sederhana
    if (!formData.recipientName.trim()) {
      setErrorMessage(locale === 'id' ? 'Nama wajib diisi' : 'Recipient name is required')
      return
    }
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!formData.phone.trim()) {
      setErrorMessage('Nomor Wajib diisi')
      return
    }
    const minDigits = countryCode === '+65' ? 8 : 9
    if (cleanPhone.length < minDigits || cleanPhone.length > 15) {
      setErrorMessage(`Nomor tidak valid (${minDigits}-15 digit)`)
      return
    }
    if (!formData.province.trim()) {
      setErrorMessage(locale === 'id' ? 'Provinsi wajib diisi' : 'Province is required')
      return
    }
    if (!formData.city.trim()) {
      setErrorMessage(locale === 'id' ? 'Kota / Kabupaten wajib diisi' : 'City is required')
      return
    }
    if (!formData.district?.trim()) {
      setErrorMessage(locale === 'id' ? 'Kecamatan wajib dipilih' : 'District is required')
      return
    }
    if (!formData.village?.trim()) {
      setErrorMessage(locale === 'id' ? 'Desa / Kelurahan wajib dipilih' : 'Village is required')
      return
    }
    if (!formData.postalCode.trim()) {
      setErrorMessage(locale === 'id' ? 'Kode pos wajib diisi' : 'Postal code is required')
      return
    }
    if (!formData.addressLine.trim()) {
      setErrorMessage(locale === 'id' ? 'Alamat lengkap wajib diisi' : 'Address line is required')
      return
    }

    const payload = {
      ...formData,
      phone: `${
        countryCode
      } ${formData.phone.trim()}`
    }

    setIsSubmitting(true)
    try {
      if (addressToEdit) {
        const res = await updateAddressAction(addressToEdit.id, payload)
        if (!res.success) {
          setErrorMessage(res.error || 'Gagal memperbarui alamat')
          setIsSubmitting(false)
          return
        }
        toast.success(t.address_saved_success)
      } else {
        const res = await addAddressAction(payload)
        if (!res.success) {
          setErrorMessage(res.error || 'Gagal menambahkan alamat')
          setIsSubmitting(false)
          return
        }
        toast.success(t.address_saved_success)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-card rounded-xl border border-border shadow-xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {addressToEdit ? t.edit_address : t.add_new_address}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          {/* Penerima & No HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
             <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {t.recipient_name} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Misal: Budi Santoso"
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nomor HP <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-md border border-border bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary overflow-hidden h-10 transition-all">
                {/* Dropdown Kode Negara (Default +62) */}
                <select
                  value={countryCode}
                  onChange={(e) => {
                    const newCode = e.target.value
                    setCountryCode(newCode)
                    setFormData((prev) => ({
                      ...prev,
                      phone: formatPhoneNumber(prev.phone, newCode),
                    }))
                  }}
                  className="bg-muted/40 px-2.5 text-xs text-foreground font-semibold border-r border-border focus:outline-none cursor-pointer"
                >
                  <option value="+62">🇮🇩 +62</option>
                  <option value="+60">🇲🇾 +60</option>
                  <option value="+65">🇸🇬 +65</option>
                </select>
                {/* Input Nomor Telepon dengan otomatis tanda '-' & maks 15 digit */}
                <input
                  type="tel"
                  inputMode="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: formatPhoneNumber(e.target.value, countryCode),
                    }))
                  }
                  placeholder={
                    countryCode === '+62'
                      ? '812-3456-7890'
                      : countryCode === '+60'
                      ? '12-345-6789'
                      : '8123-4567'
                  }
                  className="w-full px-3 text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground/60"
                  required
                />
              </div>
            </div>
          </div>

          {/* Master Data Wilayah Bertingkat: Provinsi -> Kota/Kabupaten -> Kecamatan -> Desa/Kelurahan */}
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Provinsi */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Provinsi <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={INDONESIA_PROVINCES.map((prov) => ({
                    value: prov.name,
                    label: prov.name,
                  }))}
                  value={formData.province}
                  onChange={handleProvinceSelect}
                  placeholder="Pilih Provinsi"
                  searchPlaceholder="Cari provinsi..."
                />
              </div>

              {/* 2. Kota / Kabupaten */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kota / Kabupaten <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={getCitiesByProvinceName(formData.province).map((city) => ({
                    value: city.name,
                    label: city.name,
                  }))}
                  value={formData.city}
                  onChange={handleCitySelect}
                  disabled={!formData.province}
                  placeholder={formData.province ? 'Pilih Kota / Kabupaten' : 'Pilih Provinsi Dulu'}
                  searchPlaceholder="Cari kota/kabupaten..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 3. Kecamatan */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kecamatan <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={getDistrictsByCityName(formData.city).map((dist) => ({
                    value: dist.name,
                    label: dist.name,
                  }))}
                  value={formData.district || ''}
                  onChange={handleDistrictSelect}
                  disabled={!formData.city}
                  placeholder={formData.city ? 'Pilih Kecamatan' : 'Pilih Kota Dulu'}
                  searchPlaceholder="Cari kecamatan..."
                  allowCustom
                />
              </div>

              {/* 4. Desa / Kelurahan */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Desa / Kelurahan <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={getVillagesByDistrictName(formData.district || '', formData.city).map((vil) => ({
                    value: vil.name,
                    label: vil.name,
                  }))}
                  value={formData.village || ''}
                  onChange={handleVillageSelect}
                  disabled={!formData.district}
                  placeholder={formData.district ? 'Pilih Desa / Kelurahan' : 'Pilih Kecamatan Dulu'}
                  searchPlaceholder="Cari desa/kelurahan..."
                  allowCustom
                />
              </div>
            </div>

            {/* 5. Kode Pos */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Kode Pos <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Contoh: 60111"
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                required
              />
            </div>
          </div>

          {/* 6. Alamat Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t.full_address} <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              rows={2}
              placeholder={t.full_address_placeholder}
              className="w-full p-2.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Checkbox Jadikan Utama */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border text-[#00a699] focus:ring-primary"
              />
              <span className="text-xs font-medium text-foreground">
                {t.set_as_default}
              </span>
            </label>
          </div>

          {/* Tombol Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {t.cancel_note}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-md bg-[#00a699] hover:bg-[#008f84] text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.saving}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{addressToEdit ? t.save_profile : t.add_new_address}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
