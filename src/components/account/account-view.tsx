'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { User, MapPin, Settings } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import type { ProfileData } from '@/types/account'
import type { AddressItem } from '@/types/address'
import { ProfileTab } from '@/components/account/profile-tab'


interface AccountViewProps {
  profile: ProfileData
  addresses: AddressItem[]
}

export function AccountView({ profile, addresses }: AccountViewProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile')

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-muted-foreground mb-6 gap-2">
          <Link href="/" className="hover:text-primary transition-colors">
            {t.home}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t.my_account}</span>
        </nav>


        <div className="pb-6 border-b border-border/80 mb-6">
        <h1 className="text-x1 sm:text-2x1 font-bold text-foreground tracking-tight">
          {t.my_account}
        </h1>
        </div>


        <div>
          <ProfileTab initialProfile={profile}/>
        </div>
      </div>
    </div>
  )
}
