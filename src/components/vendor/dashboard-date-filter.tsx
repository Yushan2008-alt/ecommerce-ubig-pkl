'use client'

import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Check,
  RotateCcw,
} from 'lucide-react'
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar, DateRange } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'

export type PeriodKey =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'thisMonth'
  | 'thisYear'
  | 'lastWeek'
  | 'lastMonth'
  | 'lastYear'
  | 'last7Days'
  | 'last30Days'
  | 'custom'

export interface PeriodSelection {
  key: PeriodKey
  label: string
  range: { from: Date; to: Date }
}

export function getPeriodRange(key: PeriodKey): { from: Date; to: Date } {
  const now = new Date()
  switch (key) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) }
    case 'yesterday': {
      const yesterday = subDays(now, 1)
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
    }
    case 'thisWeek':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfDay(now),
      }
    case 'thisMonth':
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
      }
    case 'thisYear':
      return {
        from: startOfYear(now),
        to: endOfDay(now),
      }
    case 'lastWeek': {
      const prevWeek = subWeeks(now, 1)
      return {
        from: startOfWeek(prevWeek, { weekStartsOn: 1 }),
        to: endOfWeek(prevWeek, { weekStartsOn: 1 }),
      }
    }
    case 'lastMonth': {
      const prevMonth = subMonths(now, 1)
      return {
        from: startOfMonth(prevMonth),
        to: endOfMonth(prevMonth),
      }
    }
    case 'lastYear': {
      const prevYear = subYears(now, 1)
      return {
        from: startOfYear(prevYear),
        to: endOfYear(prevYear),
      }
    }
    case 'last7Days':
      return {
        from: startOfDay(subDays(now, 6)),
        to: endOfDay(now),
      }
    case 'last30Days':
      return {
        from: startOfDay(subDays(now, 29)),
        to: endOfDay(now),
      }
    default:
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
      }
  }
}

interface DashboardDateFilterProps {
  value: PeriodSelection
  onChange: (val: PeriodSelection) => void
}

export function DashboardDateFilter({ value, onChange }: DashboardDateFilterProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'menu' | 'calendar'>('menu')
  const [tempRange, setTempRange] = useState<DateRange>({
    from: value.range.from,
    to: value.range.to,
  })

  const handleSelectQuick = (key: PeriodKey, label: string) => {
    const range = getPeriodRange(key)
    onChange({ key, label, range })
    setOpen(false)
    setView('menu')
  }

  const handleApplyCustom = () => {
    if (!tempRange.from) return
    const from = startOfDay(tempRange.from)
    const to = endOfDay(tempRange.to || tempRange.from)
    const label = `${format(from, 'd MMM', { locale: idLocale })} - ${format(to, 'd MMM yyyy', { locale: idLocale })}`
    onChange({ key: 'custom', label, range: { from, to } })
    setOpen(false)
    setView('menu')
  }

  const handleReset = () => {
    setTempRange({})
  }

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setView('menu')
      }}
    >
      <PopoverTrigger
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted/60 text-xs font-semibold text-foreground transition-all shadow-xs cursor-pointer"
        aria-label="Pilih Periode Waktu"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-[#00a699]" />
        <span>{value.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        className={cn(
          'p-0 overflow-hidden shadow-xl rounded-2xl border border-border/80 bg-popover transition-all max-h-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          view === 'menu' ? 'w-64' : 'w-76 sm:w-80'
        )}
      >
        {view === 'menu' ? (
          <div className="py-1 text-xs divide-y divide-border/50 max-h-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* 1. CEPAT */}
            <div className="py-0.5">
              <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Cepat
              </div>
              <button
                type="button"
                onClick={() => handleSelectQuick('today', 'Hari Ini')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/80 text-foreground text-left cursor-pointer transition-colors"
              >
                <span>Hari Ini</span>
                {value.key === 'today' && <Check className="w-3.5 h-3.5 text-[#00a699]" />}
              </button>
              <button
                type="button"
                onClick={() => handleSelectQuick('yesterday', 'Kemarin')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/80 text-foreground text-left cursor-pointer transition-colors"
              >
                <span>Kemarin</span>
                {value.key === 'yesterday' && <Check className="w-3.5 h-3.5 text-[#00a699]" />}
              </button>
            </div>

            {/* 2. PERIODE */}
            <div className="py-0.5">
              <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Periode
              </div>
              {[
                { key: 'thisWeek', label: 'Minggu Ini' },
                { key: 'thisMonth', label: 'Bulan Ini' },
                { key: 'thisYear', label: 'Tahun Ini' },
                { key: 'lastWeek', label: 'Minggu Lalu' },
                { key: 'lastMonth', label: 'Bulan Lalu' },
                { key: 'lastYear', label: 'Tahun Lalu' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelectQuick(item.key as PeriodKey, item.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/80 text-foreground text-left cursor-pointer transition-colors"
                >
                  <span>{item.label}</span>
                  {value.key === item.key && <Check className="w-3.5 h-3.5 text-[#00a699]" />}
                </button>
              ))}
            </div>

            {/* 3. HISTORIS */}
            <div className="py-0.5">
              <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Historis
              </div>
              <button
                type="button"
                onClick={() => handleSelectQuick('last7Days', '7 Hari Terakhir')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/80 text-foreground text-left cursor-pointer transition-colors"
              >
                <span>7 Hari Terakhir</span>
                {value.key === 'last7Days' && <Check className="w-3.5 h-3.5 text-[#00a699]" />}
              </button>
              <button
                type="button"
                onClick={() => handleSelectQuick('last30Days', '30 Hari Terakhir')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/80 text-foreground text-left cursor-pointer transition-colors"
              >
                <span>30 Hari Terakhir</span>
                {value.key === 'last30Days' && <Check className="w-3.5 h-3.5 text-[#00a699]" />}
              </button>
            </div>

            {/* 4. TANGGAL SPESIFIK */}
            <div className="py-0.5">
              <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Tanggal Spesifik
              </div>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/80 text-[#00a699] font-semibold text-left cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Pilih rentang tanggal...</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* View Calendar (Gambar 1) */
          <div className="p-3 space-y-3">
            {/* Header with Back button */}
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <span className="text-xs font-bold text-foreground">Rentang Tanggal</span>
            </div>

            {/* Shadcn Calendar Component */}
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={(range) => setTempRange(range || {})}
            />

            {/* Footer with Reset & Terapkan */}
            <div className="flex items-center justify-between pt-2 border-t border-border/70">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyCustom}
                disabled={!tempRange.from}
                className="bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-semibold px-4 cursor-pointer"
              >
                Terapkan
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
