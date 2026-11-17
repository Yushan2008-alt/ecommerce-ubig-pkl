'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Cari...',
  disabled = false,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Otomatis menutup dropdown jika user klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filter opsi secara real-time saat user mengetik
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase().trim())
  )

  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Tombol Utama Dropdown */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev)
        }}
        className={`w-full h-10 px-3 flex items-center justify-between text-xs bg-background border border-border rounded-md transition-colors cursor-pointer text-left ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-muted/30'
            : 'hover:border-border/80 focus:ring-1 focus:ring-primary focus:outline-none'
        }`}
      >
        <span
          className={`truncate ${
            selectedOption ? 'text-foreground font-medium' : 'text-muted-foreground'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
      </button>

      {/* Popover Dropdown & Input Pencarian */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Kotak Input Search */}
          <div className="p-2 border-b border-border bg-muted/20">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* List Item yang Terfilter */}
          <div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Tidak ditemukan.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-2.5 py-1.5 flex items-center justify-between rounded text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#00a699]/10 text-[#00a699] font-medium'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#00a699] shrink-0 ml-2" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}