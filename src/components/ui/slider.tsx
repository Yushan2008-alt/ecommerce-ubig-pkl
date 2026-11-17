"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

export function Slider({
  className,
  value,
  min = 1,
  max = 3,
  step = 0.1,
  onValueChange,
  ...props
}: {
  className?: string
  value?: number | number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
  disabled?: boolean
}) {
  const numValue = Array.isArray(value) ? value[0] : (value ?? min)

  return (
    <SliderPrimitive.Root
      value={numValue}
      min={min}
      max={max}
      step={step}
      onValueChange={(val: any) => {
        if (typeof val === 'number') onValueChange?.(val)
        else if (Array.isArray(val) && typeof val[0] === 'number') onValueChange?.(val[0])
      }}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Indicator className="absolute h-full bg-[#00a699]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#00a699] bg-background shadow-xs transition-colors hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00a699] cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

