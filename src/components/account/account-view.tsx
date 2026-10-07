'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { User, MapPin, Settings } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { ProfileData } from '@/actions/account'
import { AddressItem } from '@/actions/address'
import { ProfileTab } from '@/components/account/profile-tab'
import { AddressTab } from '@/components/account/address-tab'

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

        {/* Page Title */}
        <div className="pb-6 border-b border-border/80 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#00a699]" />
            {t.my_account}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t.account_desc}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border mb-8 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#00a699] text-[#00a699]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.profile_tab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-[#00a699] text-[#00a699]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t.address_tab}</span>
            {addresses.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground font-bold">
                {addresses.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <ProfileTab initialProfile={profile} />
          )}

          {activeTab === 'addresses' && (
            <AddressTab initialAddresses={addresses} />
          )}
        </div>
      </div>
    </div>
  )
}
