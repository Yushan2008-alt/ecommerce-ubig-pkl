import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile: (profile as Profile | null) }
})

export async function requireUser(nextPath = '/') {
  const { user, profile } = await getUser()

  if (!user) {
    const encoded = encodeURIComponent(nextPath)
    redirect(`/?auth=login&next=${encoded}`)
  }

  return { user, profile }
}

export async function requireVendor(nextPath = '/vendor') {
  const { user, profile } = await requireUser(nextPath)

  if (profile?.role !== 'vendor') {
    redirect('/sell')
  }

  return { user, profile }
}
