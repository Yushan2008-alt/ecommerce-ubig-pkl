import { Metadata } from 'next';
import { requireUser } from '@/lib/auth'
import { getAddressesAction } from '@/actions/address';
import { AddressTab } from '@/components/account/address-tab'
import Link from 'next/link';
import React from "react";

export const metadata: Metadata = {
    title: 'Alamat Saya',
    description: 'Kelola alamat anda',
}

export default async function AddressPage() {
    await requireUser('/address')
    const addressesRes = await getAddressesAction()
    const addresses = addressesRes.data || []

    return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl">

        <nav className="flex items-center text-xs text-muted-foreground mb-6 gap-2">
          <Link href="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-primary transition-colors">
            Akun Saya
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Alamat Saya</span>
        </nav>

        <div className="bg-card border border-border/80 rounded-xl p-6 sm:p-8 shadow-xs">
          <AddressTab initialAddresses={addresses} />
        </div>
      </div>
    </div>
  )
}