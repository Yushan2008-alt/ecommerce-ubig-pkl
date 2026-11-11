import type { UserRole } from '@/types/database'

export interface ProfileData {
  id: string
  email: string
  role: UserRole
  displayName: string | null
  phone: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}
