'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Locale, translations } from '@/lib/i18n'
import { Globe, Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (typeof translations)['id']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')

  useEffect(() => {
    // Baca preferensi tersimpan di localStorage atau cookie
    const saved = localStorage.getItem('krafita_lang') as Locale | null
    if (saved === 'id' || saved === 'en') {
      setLocaleState(saved)
    } else {
      // Default: Indonesia
      setLocaleState('id')
      localStorage.setItem('krafita_lang', 'id')
      document.cookie = 'krafita_lang=id; path=/; max-age=31536000'
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('krafita_lang', newLocale)
    document.cookie = `krafita_lang=${newLocale}; path=/; max-age=31536000`
  }

  const t = translations[locale]

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Fallback safe defaults jika di luar provider
    return {
      locale: 'id' as Locale,
      setLocale: () => {},
      t: translations.id,
    }
  }
  return context
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors focus-visible:outline-none"
        aria-label="Pilih Bahasa / Select Language"
      >
        <Globe className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{locale === 'id' ? 'Indonesia' : 'English'}</span>
        <ChevronDown className="w-2.5 h-2.5 opacity-60" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 text-xs shadow-md">
        <DropdownMenuItem
          onClick={() => setLocale('id')}
          className="flex items-center justify-between cursor-pointer py-1.5 font-medium"
        >
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">🇮🇩</span>
            <span>Indonesia (ID)</span>
          </div>
          {locale === 'id' && <Check className="w-3.5 h-3.5 text-[#00a699]" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className="flex items-center justify-between cursor-pointer py-1.5 font-medium"
        >
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">🇺🇸</span>
            <span>English (EN)</span>
          </div>
          {locale === 'en' && <Check className="w-3.5 h-3.5 text-[#00a699]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
