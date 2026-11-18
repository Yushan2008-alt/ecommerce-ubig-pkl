'use client'

import React, { useState, useRef, useEffect, useId } from 'react'
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
  triggerClassName?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Cari...',
  disabled = false,
  className = '',
  triggerClassName = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const listboxId = useId()

  // Otomatis menutup dropdown jika user klik di luar area atau tekan Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearch('')
        setHighlightedIndex(-1)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSearch('')
        setHighlightedIndex(-1)
        triggerRef.current?.focus()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Scroll otomatis item yang sedang di-highlight ke dalam viewport list
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [isOpen, highlightedIndex])

  // Filter opsi secara real-time saat user mengetik (cocokkan label atau value)
  const query = search.toLowerCase().trim()
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
  )

  const valLower = typeof value === 'string' ? value.trim().toLowerCase() : ''
  const selectedOption = valLower
    ? options.find((opt) => opt.value === value) ||
      options.find((opt) => opt.value.toLowerCase() === valLower) ||
      options.find((opt) => opt.label.toLowerCase() === valLower)
    : undefined

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearch('')
    setHighlightedIndex(-1)
    triggerRef.current?.focus()
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? 'z-30' : ''} ${className}`}
    >
      {/* Tombol Utama Dropdown */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={placeholder}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => {
              if (prev) {
                setSearch('')
                setHighlightedIndex(-1)
                return false
              }
              const idx = options.findIndex((opt) => opt.value === value)
              setHighlightedIndex(idx >= 0 ? idx : 0)
              return true
            })
          }
        }}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            if (!isOpen) {
              const idx = options.findIndex((opt) => opt.value === value)
              setHighlightedIndex(idx >= 0 ? idx : 0)
              setIsOpen(true)
            }
          }
        }}
        className={`w-full h-10 px-3 flex items-center justify-between text-xs bg-background border border-border rounded-lg transition-colors cursor-pointer text-left ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-muted/30'
            : 'hover:border-[#00a699]/60 focus:ring-1 focus:ring-[#00a699] focus:border-[#00a699] focus:outline-none'
        } ${triggerClassName}`}
      >
        <span
          className={`truncate ${
            selectedOption ? 'text-foreground font-medium' : 'text-muted-foreground'
          }`}
        >
          {selectedOption ? selectedOption.label : value || placeholder}
        </span>
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
      </button>

      {/* Popover Dropdown & Input Pencarian */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Kotak Input Search */}
          <div className="p-2 border-b border-border bg-muted/20">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={search}
                role="searchbox"
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-activedescendant={
                  highlightedIndex >= 0 && filteredOptions[highlightedIndex]
                    ? `${listboxId}-option-${highlightedIndex}`
                    : undefined
                }
                onChange={(e) => {
                  setSearch(e.target.value)
                  setHighlightedIndex(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setHighlightedIndex((prev) =>
                      filteredOptions.length === 0
                        ? -1
                        : prev < filteredOptions.length - 1
                        ? prev + 1
                        : 0
                    )
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setHighlightedIndex((prev) =>
                      filteredOptions.length === 0
                        ? -1
                        : prev > 0
                        ? prev - 1
                        : filteredOptions.length - 1
                    )
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    const target =
                      highlightedIndex >= 0 &&
                      highlightedIndex < filteredOptions.length
                        ? filteredOptions[highlightedIndex]
                        : filteredOptions[0]
                    if (target) {
                      handleSelect(target.value)
                    }
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setIsOpen(false)
                    setSearch('')
                    setHighlightedIndex(-1)
                    triggerRef.current?.focus()
                  } else if (e.key === 'Tab') {
                    setIsOpen(false)
                    setSearch('')
                    setHighlightedIndex(-1)
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-[#00a699] focus:border-[#00a699]"
              />
            </div>
          </div>

          {/* List Item yang Terfilter */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={placeholder}
            className="max-h-60 overflow-y-auto p-1 space-y-0.5"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Tidak ditemukan.
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected =
                  Boolean(valLower) &&
                  (opt.value === value ||
                    opt.value.toLowerCase() === valLower ||
                    opt.label.toLowerCase() === valLower)
                const isHighlighted = idx === highlightedIndex
                return (
                  <button
                    key={opt.value}
                    ref={(el) => {
                      itemRefs.current[idx] = el
                    }}
                    id={`${listboxId}-option-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-2.5 py-2 flex items-center justify-between rounded-md text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#00a699]/15 text-[#00a699] font-bold'
                        : isHighlighted
                        ? 'bg-muted text-foreground font-medium'
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
