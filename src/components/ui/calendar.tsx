"use client"

import * as React from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
} from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

export interface DateRange {
  from?: Date
  to?: Date
}

export interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date | DateRange
  onSelect?: (val: any) => void
  month?: Date
  onMonthChange?: (month: Date) => void
  className?: string
}

export function Calendar({
  mode = "range",
  selected,
  onSelect,
  month: controlledMonth,
  onMonthChange,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    controlledMonth ||
      (selected && "from" in (selected as any) && (selected as DateRange).from
        ? (selected as DateRange).from!
        : selected instanceof Date
        ? selected
        : new Date())
  )

  const activeMonth = controlledMonth || currentMonth

  const handleMonthChange = (newMonth: Date) => {
    if (onMonthChange) {
      onMonthChange(newMonth)
    } else {
      setCurrentMonth(newMonth)
    }
  }

  const range = (mode === "range" ? (selected as DateRange) : undefined) || {}
  const singleDate = mode === "single" ? (selected as Date) : undefined

  const monthStart = startOfMonth(activeMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Sen - Min
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const weekDayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

  const handleDayClick = (day: Date) => {
    if (!onSelect) return

    if (mode === "single") {
      onSelect(day)
      return
    }

    // Range mode
    if (!range.from || (range.from && range.to)) {
      onSelect({ from: day, to: undefined })
    } else if (range.from && !range.to) {
      if (isBefore(day, range.from)) {
        onSelect({ from: day, to: range.from })
      } else {
        onSelect({ from: range.from, to: day })
      }
    }
  }

  return (
    <div className={cn("p-3 space-y-3", className)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => handleMonthChange(subMonths(activeMonth, 1))}
          className="h-7 w-7 rounded-md cursor-pointer hover:bg-muted"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="sr-only">Bulan Sebelumnya</span>
        </Button>
        <div className="text-xs font-bold text-foreground capitalize">
          {format(activeMonth, "MMMM yyyy", { locale: idLocale })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => handleMonthChange(addMonths(activeMonth, 1))}
          className="h-7 w-7 rounded-md cursor-pointer hover:bg-muted"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="sr-only">Bulan Berikutnya</span>
        </Button>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDayLabels.map((d) => (
          <div
            key={d}
            className="text-[11px] font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, activeMonth)
          const isFrom = range.from && isSameDay(day, range.from)
          const isTo = range.to && isSameDay(day, range.to)
          const isSingle = singleDate && isSameDay(day, singleDate)
          const isSelected = isFrom || isTo || isSingle
          const isInRange =
            range.from &&
            range.to &&
            isWithinInterval(day, { start: range.from, end: range.to })

          return (
            <div
              key={idx}
              className={cn(
                "relative flex items-center justify-center py-0.5",
                isInRange &&
                  !isFrom &&
                  !isTo &&
                  "bg-[#00a699]/15 dark:bg-[#00a699]/25",
                isFrom && range.to && "rounded-l-lg bg-[#00a699]/15 dark:bg-[#00a699]/25",
                isTo && range.from && "rounded-r-lg bg-[#00a699]/15 dark:bg-[#00a699]/25"
              )}
            >
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  "w-7 h-7 text-xs rounded-lg flex items-center justify-center font-medium transition-colors cursor-pointer",
                  !isCurrentMonth && "text-muted-foreground/35 hover:text-muted-foreground",
                  isCurrentMonth && !isSelected && !isInRange && "text-foreground hover:bg-muted",
                  isInRange && !isSelected && "text-foreground font-semibold",
                  isSelected &&
                    "bg-[#00a699] text-white font-bold shadow-xs hover:bg-[#009286]"
                )}
              >
                {format(day, "d")}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
