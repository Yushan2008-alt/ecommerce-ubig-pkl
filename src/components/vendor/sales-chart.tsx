'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface SalesChartProps {
  data: {
    date: string
    sales: number
    orders: number
  }[]
  periodLabel?: string
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const sales = Number(payload[0]?.value) || 0
    const orders = Number(payload[0]?.payload?.orders) || 0
    return (
      <div className="bg-popover/95 border border-border p-3 rounded-xl shadow-lg text-xs space-y-1 backdrop-blur-xs">
        <p className="font-bold text-foreground">Waktu: {label}</p>
        <p className="text-[#00a699] font-extrabold">
          Pendapatan: Rp {sales.toLocaleString('id-ID')}
        </p>
        <p className="text-muted-foreground font-medium">{orders} Transaksi</p>
      </div>
    )
  }
  return null
}

export function SalesChart({ data, periodLabel }: SalesChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatCurrency = (val: number) => {
    if (val === 0) return 'Rp 0'
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}jt`
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`
    return `Rp ${val}`
  }

  const chartData = data || []
  const totalSales = chartData.reduce((acc, d) => acc + (d.sales || 0), 0)
  const totalOrders = chartData.reduce((acc, d) => acc + (d.orders || 0), 0)
  const hasData = totalSales > 0 || totalOrders > 0

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Tren Penjualan</h2>
            {periodLabel && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Periode: {periodLabel}
              </p>
            )}
          </div>
        </div>
        <div className="w-full h-64 sm:h-72 rounded-xl bg-muted/10 animate-pulse flex items-center justify-center border border-border/40">
          <span className="text-xs text-muted-foreground">Memuat grafik penjualan...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Grafik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Tren Penjualan</h2>
           
          </div>
    
        </div>

        <Link
          href="/vendor/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#00a699] hover:underline transition-colors w-fit"
        >
          <span>Rincian Pesanan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00a699" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00a699" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#888888' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.15) : 100000)]}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: '#888888' }}
              width={68}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#00a699"
              strokeWidth={2.5}
              dot={(props: any) => {
                if (props.payload?.sales > 0 || chartData.length <= 7) {
                  return (
                    <circle
                      key={props.key || props.index}
                      cx={props.cx}
                      cy={props.cy}
                      r={props.payload?.sales > 0 ? 3.5 : 2}
                      fill={props.payload?.sales > 0 ? '#00a699' : '#88888840'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  )
                }
                return <React.Fragment key={props.key || props.index} />
              }}
              activeDot={{
                r: 6,
                fill: '#00a699',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-background/85 border border-border/70 backdrop-blur-xs text-[11px] text-muted-foreground shadow-xs">
              Belum ada penjualan tercatat pada periode ini
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
