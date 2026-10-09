'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

const ReviewSchema = z.object({
  orderItemId: z.string().uuid(),
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(1000).optional().nullable(),
})

export type ReviewInput = z.infer<typeof ReviewSchema>

/**
 * 1. SUBMIT REVIEW ACTION (Verified Buyer)
 * Database RLS enforces: profile_id = auth.uid() & order_item completed & order belongs to user.
 */
export async function submitReviewAction(payload: ReviewInput): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk menulis ulasan.' }
    }

    const parsed = ReviewSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Data ulasan tidak valid' }
    }

    const supabase = await createClient()

    // 1. Cek apakah pesanan item ini memang milik user dan sudah completed
    const { data: item, error: itemErr } = await supabase
      .from('order_items')
      .select('id, fulfilment_status, orders(profile_id)')
      .eq('id', parsed.data.orderItemId)
      .single()

    if (itemErr || !item) {
      return { success: false, error: 'Item pesanan tidak ditemukan.' }
    }

    const order = Array.isArray(item.orders) ? item.orders[0] : item.orders
    if (order?.profile_id !== user.id) {
      return { success: false, error: 'Anda hanya dapat mengulas pesanan milik Anda sendiri.' }
    }

    if (item.fulfilment_status !== 'completed') {
      return {
        success: false,
        error: 'Ulasan hanya dapat diberikan setelah pesanan berstatus Selesai (Completed).',
      }
    }

    // 2. Simpan ulasan ke tabel reviews
    const { error: insertError } = await supabase.from('reviews').insert({
      product_id: parsed.data.productId,
      profile_id: user.id,
      order_item_id: parsed.data.orderItemId,
      rating: parsed.data.rating,
      body: parsed.data.body?.trim() || null,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: false, error: 'Anda sudah pernah memberikan ulasan untuk pesanan ini.' }
      }
      return { success: false, error: insertError.message || 'Gagal menyimpan ulasan.' }
    }

    revalidatePath(`/products`)
    revalidatePath(`/orders`)

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

/**
 * 2. GET PRODUCT REVIEWS
 */
export async function getProductReviewsAction(productId: string): Promise<{
  success: boolean
  reviews?: any[]
  ratingAvg?: number
  ratingCount?: number
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        body,
        created_at,
        profiles (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    const items = (reviews || []).map((r: any) => {
      const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
      return {
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.created_at,
        userName: prof?.display_name || 'Pembeli Terverifikasi',
        userAvatar: prof?.avatar_url,
      }
    })

    const count = items.length
    const avg = count > 0 ? items.reduce((acc, i) => acc + i.rating, 0) / count : 0

    return {
      success: true,
      reviews: items,
      ratingAvg: Math.round(avg * 10) / 10,
      ratingCount: count,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat ulasan produk'
    return { success: false, error: msg }
  }
}

const CommentSchema = z.object({
  productId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  body: z.string().min(2, 'Pertanyaan minimal 2 karakter').max(1000, 'Maksimal 1000 karakter'),
})

export type CommentInput = z.infer<typeof CommentSchema>

/**
 * 3. SUBMIT COMMENT ACTION (Member / Vendor Reply)
 */
export async function submitCommentAction(payload: CommentInput): Promise<{
  success: boolean
  comment?: any
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk berdiskusi.' }
    }

    const parsed = CommentSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Data komentar tidak valid' }
    }

    const supabase = await createClient()

    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({
        product_id: parsed.data.productId,
        profile_id: user.id,
        parent_id: parsed.data.parentId || null,
        body: parsed.data.body.trim(),
      })
      .select(`
        id,
        body,
        parent_id,
        created_at,
        profiles (
          id,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return { success: false, error: error.message || 'Gagal mengirim pesan diskusi.' }
    }

    revalidatePath(`/products`)

    return { success: true, comment: newComment }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

/**
 * 4. GET PRODUCT COMMENTS
 */
export async function getProductCommentsAction(
  productId: string,
  vendorProfileId?: string
): Promise<{
  success: boolean
  comments?: any[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        body,
        parent_id,
        created_at,
        profiles (
          id,
          display_name,
          avatar_url,
          role
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    // Format komentar dan tandai balasan vendor
    const raw = (comments || []).map((c: any) => {
      const prof = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
      const isVendor = vendorProfileId ? prof?.id === vendorProfileId : prof?.role === 'vendor'
      return {
        id: c.id,
        parentId: c.parent_id,
        body: c.body,
        createdAt: c.created_at,
        isVendor,
        user: {
          id: prof?.id,
          name: prof?.display_name || 'Pengguna',
          avatar: prof?.avatar_url,
          role: prof?.role,
        },
      }
    })

    // Susun hirarki thread (top-level + replies)
    const topLevel = raw.filter((c) => !c.parentId)
    const repliesMap = new Map<string, any[]>()

    raw
      .filter((c) => c.parentId)
      .forEach((reply) => {
        const existing = repliesMap.get(reply.parentId) || []
        existing.push(reply)
        repliesMap.set(reply.parentId, existing)
      })

    const threaded = topLevel.map((parent) => ({
      ...parent,
      replies: repliesMap.get(parent.id) || [],
    }))

    return { success: true, comments: threaded }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat diskusi komentar'
    return { success: false, error: msg }
  }
}

const ReportSchema = z.object({
  targetType: z.enum(['product', 'comment']),
  targetId: z.string().uuid(),
  reason: z.string().min(5, 'Alasan pelaporan minimal 5 karakter').max(500, 'Alasan maksimal 500 karakter'),
})

export type ReportInput = z.infer<typeof ReportSchema>

/**
 * 5. SUBMIT REPORT ACTION
 */
export async function submitReportAction(payload: ReportInput): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk melaporkan pelanggaran.' }
    }

    const parsed = ReportSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Data laporan tidak valid' }
    }

    const supabase = await createClient()

    const { error } = await supabase.from('reports').insert({
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      reporter_id: user.id,
      reason: parsed.data.reason.trim(),
      status: 'open',
    })

    if (error) {
      return { success: false, error: error.message || 'Gagal mengirimkan laporan.' }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}
