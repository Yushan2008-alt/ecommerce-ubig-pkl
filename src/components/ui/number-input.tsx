'use client'

import * as React from 'react'
import { formatNumberWithDots, unformatNumber } from '@/lib/utils'

export interface NumberInputProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  value: string | number | null | undefined
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onValueChange?: (formattedValue: string, numericValue: number) => void
}

/**
 * Reusable NumberInput component.
 * - Menggunakan type="text" dan inputMode="numeric" sesuai standar form nominal.
 * - Memformat angka secara otomatis dengan pemisah titik ribuan (contoh: 50.000).
 * - Menjaga posisi kursor user saat mengetik di tengah angka.
 * - Menangani tombol Backspace dan Delete pada pemisah titik sehingga user tidak terkunci.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, onValueChange, onKeyDown, className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement | null>(null)

    // Sync external ref
    React.useImperativeHandle(ref, () => internalRef.current as HTMLInputElement)

    const displayValue = formatNumberWithDots(value)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target
      const rawValue = input.value
      const cursorPos = input.selectionStart || 0

      // Hitung jumlah digit angka sebelum posisi kursor sebelum reformatting
      const digitsBeforeCursor = rawValue.slice(0, cursorPos).replace(/\D/g, '').length

      const formatted = formatNumberWithDots(rawValue)

      if (onValueChange) {
        onValueChange(formatted, unformatNumber(formatted))
      }

      if (onChange) {
        // Buat synthetic event dengan target.value terformat
        const syntheticEvent = {
          ...e,
          target: {
            ...input,
            value: formatted,
          },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }

      // Preservasi posisi kursor relatif terhadap jumlah digit
      requestAnimationFrame(() => {
        if (!internalRef.current) return
        if (digitsBeforeCursor === 0) {
          internalRef.current.setSelectionRange(0, 0)
          return
        }
        let count = 0
        let targetPos = formatted.length
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            count++
          }
          if (count === digitsBeforeCursor) {
            targetPos = i + 1
            break
          }
        }
        internalRef.current.setSelectionRange(targetPos, targetPos)
      })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget
      const start = input.selectionStart ?? 0
      const end = input.selectionEnd ?? 0

      // Tangani Backspace jika kursor berada tepat setelah tanda titik ribuan (contoh: "50.|000")
      if (e.key === 'Backspace' && start === end && start > 0) {
        if (input.value[start - 1] === '.') {
          e.preventDefault()
          const before = input.value.slice(0, Math.max(0, start - 2))
          const after = input.value.slice(start)
          const combined = before + after
          const formatted = formatNumberWithDots(combined)
          const digitsBefore = before.replace(/\D/g, '').length

          if (onValueChange) {
            onValueChange(formatted, unformatNumber(formatted))
          }
          if (onChange) {
            const syntheticEvent = {
              ...e,
              target: {
                ...input,
                value: formatted,
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
          }

          requestAnimationFrame(() => {
            if (!internalRef.current) return
            let count = 0
            let targetPos = 0
            for (let i = 0; i < formatted.length; i++) {
              if (/\d/.test(formatted[i])) {
                count++
              }
              if (count === digitsBefore) {
                targetPos = i + 1
                break
              }
            }
            internalRef.current.setSelectionRange(targetPos, targetPos)
          })
          return
        }
      }

      // Tangani Delete jika kursor berada tepat sebelum tanda titik ribuan (contoh: "50|.000")
      if (e.key === 'Delete' && start === end && start < input.value.length) {
        if (input.value[start] === '.') {
          e.preventDefault()
          const before = input.value.slice(0, start)
          const after = input.value.slice(start + 2)
          const combined = before + after
          const formatted = formatNumberWithDots(combined)
          const digitsBefore = before.replace(/\D/g, '').length

          if (onValueChange) {
            onValueChange(formatted, unformatNumber(formatted))
          }
          if (onChange) {
            const syntheticEvent = {
              ...e,
              target: {
                ...input,
                value: formatted,
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
          }

          requestAnimationFrame(() => {
            if (!internalRef.current) return
            let count = 0
            let targetPos = 0
            for (let i = 0; i < formatted.length; i++) {
              if (/\d/.test(formatted[i])) {
                count++
              }
              if (count === digitsBefore) {
                targetPos = i + 1
                break
              }
            }
            internalRef.current.setSelectionRange(targetPos, targetPos)
          })
          return
        }
      }

      onKeyDown?.(e)
    }

    return (
      <input
        ref={internalRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={className}
        {...props}
      />
    )
  }
)

NumberInput.displayName = 'NumberInput'
