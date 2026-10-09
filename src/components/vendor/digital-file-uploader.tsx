'use client'

import React, { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileUp, FileCheck, X, Loader2, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DigitalFileUploaderProps {
  value?: {
    path: string
    fileName: string
    fileSize: number
    format?: string | null
  } | null
  onChange: (file: { path: string; fileName: string; fileSize: number; format?: string | null } | null) => void
}

export function DigitalFileUploader({ value, onChange }: DigitalFileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Batas maks 50MB sesuai skema storage Supabase
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran berkas digital maksimal 50 MB.')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Silakan login untuk mengunggah berkas digital.')
      setUploading(false)
      return
    }

    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
      const storagePath = `${user.id}/${Date.now()}-${cleanName}`

      const { error: uploadError } = await supabase.storage
        .from('digital-files')
        .upload(storagePath, file, {
          upsert: true,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'

      onChange({
        path: storagePath,
        fileName: file.name,
        fileSize: file.size,
        format: ext,
      })

      toast.success('Berkas digital berhasil diunggah ke penyimpanan cloud privat!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah berkas'
      toast.error(`Gagal unggah: ${msg}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          Aset Berkas Digital (Terenkripsi Privat)
        </label>
        <span className="text-[10px] text-muted-foreground font-mono">Maks. 50 MB</span>
      </div>

      {value ? (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{value.fileName}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatBytes(value.fileSize)} • Format {value.format || 'ZIP/PDF'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            title="Hapus berkas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border/80 hover:border-[#00a699] bg-muted/20 hover:bg-muted/40 rounded-xl transition-colors cursor-pointer text-center disabled:opacity-60"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-[#00a699]">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-semibold">Mengunggah berkas digital privat...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FileUp className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    Unggah Berkas Digital (ZIP, PDF, PSD, MP3, MP4, dll)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Berkas ini aman dan hanya dapat diunduh oleh pembeli setelah pembayaran lunas.
                  </p>
                </div>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
