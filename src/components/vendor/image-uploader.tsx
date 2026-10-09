'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploaderProps {
  bucket?: 'product-images' | 'shop-assets'
  value?: string[] | string
  onChange: (url: string[] | string) => void
  multiple?: boolean
  maxFiles?: number
  label?: string
  description?: string
  aspectRatio?: 'square' | 'wide'
}

export function ImageUploader({
  bucket = 'product-images',
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  label = 'Unggah Gambar',
  description = 'Format WebP/JPG/PNG maks. 2MB. Otomatis dikompresi ≤ 1600px.',
  aspectRatio = 'square',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const images: string[] = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === 'string' && value
    ? [value]
    : []

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (multiple && images.length + files.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} gambar yang diperbolehkan.`)
      return
    }

    setUploading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk mengunggah gambar.')
      setUploading(false)
      return
    }

    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Kompresi WebP sisi klien
        const compressionOptions = {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.8,
        }

        let processedFile: File = file
        try {
          processedFile = await imageCompression(file, compressionOptions)
        } catch {
          // Fallback jika kompresi browser tidak didukung
          processedFile = file
        }

        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 40)
        const fileName = `${Date.now()}-${cleanName}.webp`
        const storagePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, processedFile, {
            contentType: 'image/webp',
            upsert: true,
          })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(storagePath)

        uploadedUrls.push(publicUrlData.publicUrl)
      }

      if (multiple) {
        onChange([...images, ...uploadedUrls])
      } else {
        onChange(uploadedUrls[0] || '')
      }

      toast.success('Gambar berhasil diunggah dan dikompresi!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah gambar'
      toast.error(`Gagal unggah: ${msg}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = (indexToRemove: number) => {
    if (multiple) {
      const next = images.filter((_, idx) => idx !== indexToRemove)
      onChange(next)
    } else {
      onChange('')
    }
  }

  return (
    <div className="space-y-3">
      {label && <label className="block text-xs font-bold text-foreground">{label}</label>}

      {/* Grid Thumbnail Gambar yang Sudah Ada */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className={`relative group rounded-lg overflow-hidden border border-border/80 bg-muted/40 shadow-xs ${
                aspectRatio === 'square' ? 'w-24 h-24' : 'w-40 h-24'
              }`}
            >
              <Image
                src={url}
                alt="Gambar Unggahan"
                fill
                sizes="160px"
                className="object-cover object-center"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full p-1 opacity-90 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                title="Hapus gambar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && multiple && (
                <span className="absolute bottom-1 left-1 bg-[#00a699] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  Cover Utama
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Box Upload Area (Jika masih bisa upload) */}
      {(!images.length || (multiple && images.length < maxFiles)) && (
        <div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-border/80 hover:border-[#00a699] bg-muted/20 hover:bg-muted/40 rounded-xl transition-colors cursor-pointer text-center disabled:opacity-60"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-[#00a699]">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-semibold">Mengompresi & mengunggah WebP...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    Klik untuk memilih gambar
                  </p>
                  <p className="text-[11px] text-muted-foreground">{description}</p>
                </div>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
