'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import {
  User,
  Mail,
  Phone,
  Camera,
  Loader2,
  Check,
  Shield,
  Calendar,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import {
  ProfileData,
  updateProfileAction,
  uploadAvatarAction,
} from '@/actions/account'

interface ProfileTabProps {
  initialProfile: ProfileData
}

export function ProfileTab({ initialProfile }: ProfileTabProps) {
  const { t, locale } = useLanguage()

  const [displayName, setDisplayName] = useState(
    initialProfile.displayName || ''
  )
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialProfile.avatarUrl
  )

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Format tanggal bergabung
  const memberSinceFormatted = initialProfile.createdAt
    ? new Date(initialProfile.createdAt).toLocaleDateString(
        locale === 'id' ? 'id-ID' : 'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : '-'

  const handleAvatarFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe berkas
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error(
        locale === 'id'
          ? 'Format berkas harus JPG, PNG, atau WebP'
          : 'File format must be JPG, PNG, or WebP'
      )
      return
    }

    // Validasi ukuran < 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        locale === 'id'
          ? 'Ukuran foto maksimal 2 MB'
          : 'Max photo size is 2 MB'
      )
      return
    }

    setIsUploadingAvatar(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await uploadAvatarAction(formData)
      if (res.success && res.avatarUrl) {
        setAvatarUrl(res.avatarUrl)
        toast.success(t.avatar_updated_success)
      } else {
        toast.error(res.error || 'Gagal mengunggah foto profil')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName.trim()) {
      toast.error(
        locale === 'id'
          ? 'Nama lengkap wajib diisi'
          : 'Full name is required'
      )
      return
    }

    setIsSavingProfile(true)
    try {
      const res = await updateProfileAction({
        displayName: displayName.trim(),
        phone: phone.trim(),
      })

      if (res.success) {
        toast.success(t.profile_updated_success)
      } else {
        toast.error(res.error || 'Gagal menyimpan profil')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner: Info Akun & Avatar Uploader */}
      <div className="bg-card border border-border/80 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Section */}
        <div className="relative group shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-border/80 bg-muted/30 shadow-xs">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName || 'Avatar'}
                fill
                className="object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#00a699]/10 text-[#00a699]">
                <User className="w-12 h-12" />
              </div>
            )}

            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-1">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          {/* Tombol Kamera Overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00a699] hover:bg-[#008f84] text-white flex items-center justify-center shadow-md transition-all cursor-pointer group-hover:scale-105"
            title={t.change_avatar}
            aria-label={t.change_avatar}
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />
        </div>

        {/* Akun Header Meta */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {displayName || initialProfile.email.split('@')[0]}
            </h2>
            <span className="inline-flex items-center gap-1 self-center sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00a699]/10 text-[#00a699] border border-[#00a699]/20 capitalize">
              <Shield className="w-3 h-3" />
              {initialProfile.role === 'vendor' ? t.role_vendor : t.role_member}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {initialProfile.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t.member_since}: {memberSinceFormatted}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground/80 pt-1">
            {t.avatar_upload_hint}
          </p>
        </div>
      </div>

      {/* Form Profil */}
      <form
        onSubmit={handleSubmitProfile}
        className="bg-card border border-border/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6"
      >
        <h3 className="text-sm sm:text-base font-bold text-foreground pb-3 border-b border-border/80">
          {locale === 'id' ? 'Informasi Pribadi' : 'Personal Information'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t.full_name} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Misal: John Doe"
                className="w-full h-10 px-3 pl-9 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Nomor HP */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t.phone_number}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Misal: 08123456789"
                className="w-full h-10 px-3 pl-9 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t.email_address}
              </label>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {t.email_readonly}
              </span>
            </div>
            <div className="relative">
              <input
                type="email"
                value={initialProfile.email}
                disabled
                className="w-full h-10 px-3 pl-9 text-xs bg-muted/40 border border-border/80 rounded-md text-muted-foreground cursor-not-allowed select-none"
              />
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="inline-flex items-center gap-1.5 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.saving}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{t.save_profile}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
