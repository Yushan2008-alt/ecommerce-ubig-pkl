'use client'

import React, { useState, useCallback } from 'react'
import Cropper, { Point, Area } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react'

interface AvatarCropDialogProps {
  isOpen: boolean
  imageSrc: string | null
  onClose: () => void
  onCropCompleteConfirm: (croppedBlob: Blob) => Promise<void>
}

// Helper untuk menghasilkan Blob gambar hasil crop dari canvas
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new window.Image()
  image.src = imageSrc
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Gagal memproses kanvas gambar')
  }

  // Tentukan ukuran kanvas sesuai area crop
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Gambar bagian foto yang di-crop ke kanvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Gagal menghasilkan file gambar terpotong'))
        return
      }
      resolve(blob)
    }, 'image/jpeg', 0.95)
  })
}

export function AvatarCropDialog({
  isOpen,
  imageSrc,
  onClose,
  onCropCompleteConfirm,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setIsSaving(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      await onCropCompleteConfirm(croppedBlob)
      onClose()
    } catch (err) {
      console.error('Crop image error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sesuaikan Foto Profil</DialogTitle>
          <DialogDescription>
            Geser dan sesuaikan posisi foto agar pas di dalam lingkaran profil.
          </DialogDescription>
        </DialogHeader>

        {/* Area Pemotong Gambar react-easy-crop */}
        <div className="relative w-full h-64 sm:h-72 bg-black/90 rounded-lg overflow-hidden my-2">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        {/* Kontrol Zoom dengan Komponen Slider */}
        <div className="space-y-1.5 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <ZoomOut className="w-3.5 h-3.5" /> Perkecil
            </span>
            <span className="flex items-center gap-1">
              Perbesar <ZoomIn className="w-3.5 h-3.5" />
            </span>
          </div>

          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            onValueChange={(val) => setZoom(val)}
            disabled={isSaving}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted text-foreground transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-[#00a699] hover:bg-[#008f84] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Terapkan Foto</span>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

