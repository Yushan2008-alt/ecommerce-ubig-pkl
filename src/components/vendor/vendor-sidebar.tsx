'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  Settings,
  Store,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/actions/auth'

interface VendorSidebarProps {
  shop: {
    name: string
    slug: string
    logo_url?: string | null
    status: string
  }
  user: {
    email?: string | null
  }
  profile: {
    display_name?: string | null
    avatar_url?: string | null
  }
}

const NAV_ITEMS = [
  {
    href: '/vendor',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/vendor/products',
    label: 'Produk Saya',
    icon: Package,
    exact: false,
  },
  {
    href: '/vendor/orders',
    label: 'Pesanan Masuk',
    icon: ShoppingBag,
    exact: false,
  },
  {
    href: '/vendor/balance',
    label: 'Saldo & Payout',
    icon: Wallet,
    exact: false,
  },
  {
    href: '/vendor/settings',
    label: 'Pengaturan Toko',
    icon: Settings,
    exact: false,
  },
]

export function VendorSidebar({ shop, user, profile }: VendorSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const navContent = (
    <div className="flex flex-col h-full bg-card border-r border-border/80">
      {/* 1. Header Toko Info */}
      <div className="p-5 border-b border-border/70 space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#00a699] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
            K
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-foreground block">
              Krafita
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a699]">
              Vendor Center
            </span>
          </div>
        </Link>

        {/* Profil Mini Toko */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center overflow-hidden shrink-0 border border-border">
            {shop.logo_url ? (
              <Image
                src={shop.logo_url}
                alt={shop.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <Store className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <h2 className="text-xs font-bold text-foreground truncate">{shop.name}</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Toko Aktif
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigasi Menu */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-[#00a699] text-white shadow-xs'
                  : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
            </Link>
          )
        })}
      </nav>

      {/* 3. Footer Links & User */}
      <div className="p-4 border-t border-border/70 space-y-3 bg-muted/20">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Lihat Marketplace
          </span>
        </Link>

        <div className="pt-2 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
              {profile.display_name?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                {profile.display_name || 'Vendor'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email || ''}</p>
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              title="Keluar"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-card border-b border-border/80 px-4 h-14 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-xs font-bold text-foreground truncate">{shop.name}</span>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-[#00a699] flex items-center gap-1 hover:underline"
        >
          <span>Marketplace</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Fixed left) */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>
    </>
  )
}
