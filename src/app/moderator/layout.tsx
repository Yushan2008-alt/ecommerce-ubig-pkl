import React from 'react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

export const metadata = {
  title: 'Moderator Center — Krafita',
  description: 'Panel moderasi dan verifikasi toko marketplace Krafita.',
}

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 bg-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
