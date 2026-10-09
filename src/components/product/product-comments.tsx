'use client'

import React, { useState } from 'react'
import {
  MessageSquare,
  CornerDownRight,
  Send,
  Loader2,
  Store,
  ShieldCheck,
  Flag,
  User,
} from 'lucide-react'
import { submitCommentAction, type CommentInput } from '@/actions/social'
import { ReportModal } from './report-modal'
import { toast } from 'sonner'

interface CommentItem {
  id: string
  parentId?: string | null
  body: string
  createdAt: string
  isVendor: boolean
  user: {
    id: string
    name: string
    avatar?: string | null
    role?: string
  }
  replies?: CommentItem[]
}

interface ProductCommentsProps {
  productId: string
  comments: CommentItem[]
  currentUserId?: string | null
  vendorProfileId?: string
}

export function ProductComments({
  productId,
  comments,
  currentUserId,
  vendorProfileId,
}: ProductCommentsProps) {
  const [commentList, setCommentList] = useState<CommentItem[]>(comments)
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Report Modal
  const [reportTarget, setReportTarget] = useState<{ id: string; title: string } | null>(null)

  const handlePostComment = async (parentId?: string) => {
    const text = parentId ? replyText.trim() : newCommentText.trim()
    if (!text || text.length < 2) {
      toast.error('Pertanyaan atau komentar minimal 2 karakter.')
      return
    }

    if (!currentUserId) {
      toast.error('Silakan login terlebih dahulu untuk mengajukan pertanyaan.')
      return
    }

    setSubmitting(true)

    try {
      const res = await submitCommentAction({
        productId,
        parentId: parentId || null,
        body: text,
      })

      if (res.success && res.comment) {
        toast.success(parentId ? 'Balasan berhasil dikirim!' : 'Pertanyaan berhasil diposting!')

        const isUserVendor = vendorProfileId === currentUserId

        const newCommentObj: CommentItem = {
          id: res.comment.id,
          parentId: parentId || null,
          body: text,
          createdAt: new Date().toISOString(),
          isVendor: isUserVendor,
          user: {
            id: currentUserId,
            name: isUserVendor ? 'Penjual (Toko)' : 'Anda',
            avatar: null,
          },
          replies: [],
        }

        if (parentId) {
          setCommentList((prev) =>
            prev.map((parent) =>
              parent.id === parentId
                ? { ...parent, replies: [...(parent.replies || []), newCommentObj] }
                : parent
            )
          )
          setReplyingToId(null)
          setReplyText('')
        } else {
          setCommentList((prev) => [...prev, newCommentObj])
          setNewCommentText('')
        }
      } else {
        toast.error(res.error || 'Gagal mengirim komentar')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Form Pertanyaan Baru */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#00a699]" />
            Diskusi & Tanya Jawab Produk
          </h3>
          <p className="text-xs text-muted-foreground">
            Punya pertanyaan seputar ukuran, stok, format digital, atau pengiriman? Tanyakan langsung di sini.
          </p>
        </div>

        <div className="flex gap-2.5 items-start">
          <textarea
            rows={2}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={
              currentUserId
                ? 'Tulis pertanyaan Anda tentang produk ini...'
                : 'Silakan login untuk bertanya kepada penjual...'
            }
            disabled={!currentUserId || submitting}
            className="flex-1 p-3 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-[#00a699] resize-none leading-relaxed disabled:opacity-60"
          />
          <button
            type="button"
            disabled={!currentUserId || submitting || !newCommentText.trim()}
            onClick={() => handlePostComment()}
            className="px-4 py-3 bg-[#00a699] hover:bg-[#008f84] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5"
          >
            {submitting && !replyingToId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>
      </div>

      {/* 2. Daftar Diskusi Komentar */}
      <div className="space-y-3">
        {commentList.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-2xl border border-border/80 text-xs text-muted-foreground space-y-1">
            <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p>Belum ada diskusi untuk produk ini.</p>
            <p className="text-[11px]">Tanyakan sesuatu kepada penjual sekarang!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {commentList.map((comm) => (
              <div
                key={comm.id}
                className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3"
              >
                {/* Top User Info */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                      {comm.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground">{comm.user.name}</span>
                      {comm.isVendor && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          <Store className="w-3 h-3" /> Penjual
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>
                      {new Date(comm.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setReportTarget({
                          id: comm.id,
                          title: `Komentar oleh ${comm.user.name}`,
                        })
                      }
                      className="text-muted-foreground/60 hover:text-rose-500 cursor-pointer"
                      title="Laporkan komentar"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-foreground leading-relaxed pl-9">{comm.body}</p>

                {/* Tombol Balas */}
                <div className="pl-9 flex items-center gap-3">
                  {currentUserId && (
                    <button
                      type="button"
                      onClick={() =>
                        setReplyingToId(replyingToId === comm.id ? null : comm.id)
                      }
                      className="text-[11px] font-bold text-[#00a699] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      {replyingToId === comm.id ? 'Batal Balas' : 'Balas'}
                    </button>
                  )}
                </div>

                {/* Form Input Balasan */}
                {replyingToId === comm.id && (
                  <div className="ml-9 mt-2 p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tulis balasan Anda..."
                      className="w-full p-2.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={submitting || !replyText.trim()}
                        onClick={() => handlePostComment(comm.id)}
                        className="px-4 py-1.5 rounded-lg bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? 'Mengirim...' : 'Kirim Balasan'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies */}
                {comm.replies && comm.replies.length > 0 && (
                  <div className="ml-9 mt-3 pl-3 border-l-2 border-border/80 space-y-3">
                    {comm.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3 rounded-xl space-y-1.5 ${
                          reply.isVendor
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30'
                            : 'bg-muted/30 border border-border/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground">
                              {reply.user.name}
                            </span>
                            {reply.isVendor && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                                <Store className="w-3 h-3" /> Penjual
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL LAPORAN KOMENTAR */}
      {reportTarget && (
        <ReportModal
          targetType="comment"
          targetId={reportTarget.id}
          title={reportTarget.title}
          isOpen={true}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  )
}
