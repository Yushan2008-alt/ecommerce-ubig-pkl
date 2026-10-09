'use client'

import React from 'react'
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
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const sales = payload[0].value
    const orders = payload[0].payload.orders
    return (
      <div className="bg-popover/95 border border-border p-3 rounded-xl shadow-lg text-xs space-y-1 backdrop-blur-xs">
        <p className="font-bold text-foreground">Tanggal: {label}</p>
        <p className="text-[#00a699] font-extrabold">
          Pendapatan: Rp {sales.toLocaleString('id-ID')}
        </p>
        <p className="text-muted-foreground font-medium">{orders} Transaksi</p>
      </div>
    )
  }
  return null
}

export function SalesChart({ data }: SalesChartProps) {
  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`
    return `Rp ${val}`
  }

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00a699" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00a699" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#888888' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: '#888888' }}
            width={65}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#00a699"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
