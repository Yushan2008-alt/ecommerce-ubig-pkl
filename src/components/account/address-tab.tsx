'use client'

import React, { useState } from 'react'
import {
  MapPin,
  Plus,
  Star,
  Edit2,
  Trash2,
  CheckCircle2,
  Phone,
  Home,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import {
  AddressItem,
  getAddressesAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from '@/actions/address'
import { AddressModal } from '@/components/account/address-modal'

interface AddressTabProps {
  initialAddresses: AddressItem[]
}

export function AddressTab({ initialAddresses }: AddressTabProps) {
  const { t, locale } = useLanguage()
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const reloadAddresses = async () => {
    const res = await getAddressesAction()
    if (res.success) {
      setAddresses(res.data)
    }
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  const handleEdit = (addr: AddressItem) => {
    setEditingAddress(addr)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t.delete_address_confirm)
    if (!confirmed) return

    setActionLoadingId(id)
    try {
      const res = await deleteAddressAction(id)
      if (res.success) {
        toast.success(t.address_deleted_success)
        await reloadAddresses()
      } else {
        toast.error(res.error || 'Gagal menghapus alamat')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    setActionLoadingId(id)
    try {
      const res = await setDefaultAddressAction(id)
      if (res.success) {
        toast.success(t.default_address_updated)
        await reloadAddresses()
      } else {
        toast.error(res.error || 'Gagal menjadikan alamat utama')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/80 gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Home className="w-5 h-5 text-[#00a699]" />
            {t.address_book}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.address_book_desc}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-1.5 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.add_new_address}</span>
        </button>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#00a699]/10 text-[#00a699] flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">
            {t.no_addresses_yet}
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            {t.no_addresses_desc}
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-semibold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add_new_address}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isLoadingCurrent = actionLoadingId === addr.id

            return (
              <div
                key={addr.id}
                className={`relative bg-card rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  addr.isDefault
                    ? 'border-[#00a699] bg-[#00a699]/5 dark:bg-[#00a699]/10 ring-1 ring-[#00a699]'
                    : 'border-border/80 hover:border-border'
                }`}
              >
                <div>
                  {/* Top Bar: Recipient Name & Default Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {addr.recipientName}
                      </span>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#00a699] text-white">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.default_address_badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{addr.phone}</span>
                  </div>

                  {/* Address Text */}
                  <p className="text-xs text-foreground/90 leading-relaxed mb-1">
                    {addr.addressLine}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {addr.city}, {addr.province} {addr.postalCode}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
                  <div>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={isLoadingCurrent}
                        className="text-[#00a699] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Star className="w-3 h-3" />
                        <span>{t.set_as_default}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(addr)}
                      disabled={isLoadingCurrent}
                      className="text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{t.edit_address}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      disabled={isLoadingCurrent}
                      className="text-muted-foreground hover:text-rose-600 font-medium inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingCurrent ? (
                        <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>{t.delete_address}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Interactive Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={editingAddress}
        onSuccess={reloadAddresses}
      />
    </div>
  )
}
