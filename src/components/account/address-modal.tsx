'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, MapPin, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import {
  AddressItem,
  AddressFormData,
  addAddressAction,
  updateAddressAction,
} from '@/actions/address'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  addressToEdit?: AddressItem | null
  onSuccess: () => void
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
    city: '',
    province: '',
    postalCode: '',
    isDefault: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        recipientName: addressToEdit.recipientName,
        phone: addressToEdit.phone,
        addressLine: addressToEdit.addressLine,
        city: addressToEdit.city,
        province: addressToEdit.province,
        postalCode: addressToEdit.postalCode,
        isDefault: addressToEdit.isDefault,
      })
    } else {
      setFormData({
        recipientName: '',
        phone: '',
        addressLine: '',
        city: '',
        province: '',
        postalCode: '',
        isDefault: false,
      })
    }
    setErrorMessage(null)
  }, [addressToEdit, isOpen])

  if (!isOpen) return null

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validasi sederhana
    if (!formData.recipientName.trim()) {
      setErrorMessage(locale === 'id' ? 'Nama penerima wajib diisi' : 'Recipient name is required')
      return
    }
    if (!formData.phone.trim()) {
      setErrorMessage(locale === 'id' ? 'Nomor telepon wajib diisi' : 'Phone number is required')
      return
    }
    if (!formData.addressLine.trim()) {
      setErrorMessage(locale === 'id' ? 'Alamat lengkap wajib diisi' : 'Address line is required')
      return
    }
    if (!formData.city.trim()) {
      setErrorMessage(locale === 'id' ? 'Kota / Kabupaten wajib diisi' : 'City is required')
      return
    }
    if (!formData.province.trim()) {
      setErrorMessage(locale === 'id' ? 'Provinsi wajib diisi' : 'Province is required')
      return
    }
    if (!formData.postalCode.trim()) {
      setErrorMessage(locale === 'id' ? 'Kode pos wajib diisi' : 'Postal code is required')
      return
    }

    setIsSubmitting(true)
    try {
      if (addressToEdit) {
        const res = await updateAddressAction(addressToEdit.id, formData)
        if (!res.success) {
          setErrorMessage(res.error || 'Gagal memperbarui alamat')
          setIsSubmitting(false)
          return
        }
        toast.success(t.address_saved_success)
      } else {
        const res = await addAddressAction(formData)
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
        className="relative w-full max-w-lg bg-card rounded-xl border border-border shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {addressToEdit ? t.edit_address : t.add_new_address}
              </h2>
              <p className="text-xs text-muted-foreground">
                {locale === 'id'
                  ? 'Pastikan alamat tujuan dan nomor kontak akurat'
                  : 'Ensure delivery address and contact number are accurate'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
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
                {t.recipient_phone} <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Misal: 08123456789"
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Alamat Lengkap */}
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

          {/* Kota, Provinsi, Kode Pos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {t.city} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Misal: Surabaya"
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {t.province} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Misal: Jawa Timur"
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {t.postal_code} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Misal: 60119"
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
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
              onClick={onClose}
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
