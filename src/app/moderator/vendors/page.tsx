import React from 'react'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getPendingVendorsAction } from '@/actions/moderator'
import { ModeratorVendorList } from '@/components/moderator/moderator-vendor-list'
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Verifikasi Calon Vendor — Moderator Center Krafita',
}

export default async function ModeratorVendorsPage() {
  const { user, profile } = await getUser()

  if (!user) {
    redirect('/?auth=login&next=/moderator/vendors')
  }

  // Jika bukan role moderator, tampilkan kartu perizinan dengan tombol aktivasi role moderator untuk demo
  if (profile?.role !== 'moderator') {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Halaman Khusus Role Moderator</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Akun Anda saat ini memiliki role <strong className="text-foreground">({profile?.role || 'member'})</strong>. Untuk meninjau pendaftaran calon vendor, akun Anda perlu memiliki hak akses Moderator.
        </p>

        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <p className="text-xs text-muted-foreground">
            Ingin menguji alur verifikasi sekarang? Anda dapat mengalihkan role akun Anda menjadi <strong>Moderator</strong> secara instan:
          </p>
          <form
            action={async () => {
              'use server'
              const { toggleModeratorRoleAction } = await import('@/actions/moderator')
              await toggleModeratorRoleAction()
              redirect('/moderator/vendors')
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Beralih ke Role Moderator (Mode Pengujian)</span>
            </button>
          </form>
        </div>

        <div>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const res = await getPendingVendorsAction()
  const applications = res.applications || []

  return (
    <ModeratorVendorList
      initialApplications={applications}
      currentRole={profile.role}
      userName={profile.display_name || user.email?.split('@')[0] || 'Moderator'}
    />
  )
}
