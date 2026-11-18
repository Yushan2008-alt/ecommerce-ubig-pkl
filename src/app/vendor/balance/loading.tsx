import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function VendorBalanceLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <Skeleton className="h-6 w-44 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3"
          >
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-3 w-44 rounded" />
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  )
}
