'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { sendPasswordResetOtp, resetPasswordWithOtp } from '@/actions/auth'
import { useLanguage } from '@/context/language-context'
import { useAuthModal } from '@/context/auth-modal-context'
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, KeyRound, Lock, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const { openLoginModal } = useAuthModal()

  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Step 1: Kirim Kode OTP ke Email
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      const res = await sendPasswordResetOtp(email.trim())
      if (!res.success) {
        setErrorMessage(res.error || 'Gagal mengirimkan kode OTP')
        setLoading(false)
      } else {
        setSuccessMessage(res.message || t.otp_sent_to_email)
        setStep(2)
        setLoading(false)
        setResendCooldown(30)

        // Hitung mundur kirim ulang
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat memproses permintaan')
      setLoading(false)
    }
  }

  // Step 2: Verifikasi OTP & Simpan Password Baru
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (newPassword !== confirmPassword) {
      setErrorMessage(t.confirm_password + ' tidak cocok')
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage(locale === 'id' ? 'Kata sandi baru minimal 6 karakter' : 'New password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await resetPasswordWithOtp(
        email.trim(),
        otpCode.trim(),
        newPassword,
        confirmPassword
      )

      if (!res.success) {
        setErrorMessage(res.error || 'Gagal mengatur ulang kata sandi')
        setLoading(false)
      } else {
        setSuccessMessage(t.password_reset_success)
        setLoading(false)
      }
    } catch {
      setErrorMessage('Terjadi kesalahan sistem saat memperbarui kata sandi')
      setLoading(false)
    }
  }

  // Kirim ulang kode OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setErrorMessage(null)
    setLoading(true)

    try {
      const res = await sendPasswordResetOtp(email.trim())
      if (!res.success) {
        setErrorMessage(res.error || 'Gagal mengirim ulang kode OTP')
      } else {
        setSuccessMessage('Kode OTP baru telah berhasil dikirim ke email Anda.')
        setResendCooldown(30)
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat mengirim ulang kode OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8 sm:py-12 bg-slate-50/50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-muted-foreground mb-8 gap-2">
          <Link href="/" className="hover:text-primary transition-colors">
            {t.home}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t.forgot_password_title}</span>
        </nav>

        {/* Centered Stepper Card */}
        <div className="max-w-[460px] mx-auto bg-card rounded-xl border border-border/80 shadow-xs p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-foreground text-center mb-2 tracking-tight">
            {t.forgot_password_title}
          </h1>
          <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
            {step === 1
              ? t.forgot_password_subtitle
              : `Kode OTP 6 digit telah dikirim ke email ${email}. Masukkan kode tersebut beserta kata sandi baru Anda.`}
          </p>

          {errorMessage && (
            <div className="mb-5 p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && step === 2 && !newPassword && (
            <div className="mb-5 p-3 text-xs bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Jika kata sandi telah berhasil diatur ulang */}
          {successMessage && step === 2 && successMessage === t.password_reset_success ? (
            <div className="text-center space-y-4 pt-2">
              <div className="w-14 h-14 rounded-full bg-[#00a699]/10 text-[#00a699] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                {locale === 'id' ? 'Kata Sandi Berhasil Diperbarui' : 'Password Successfully Updated'}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.password_reset_success}
              </p>
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="w-full h-11 bg-[#00a699] hover:bg-[#008f84] text-white rounded-md font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>{locale === 'id' ? 'Masuk Sekarang' : 'Login Now'}</span>
              </button>
            </div>
          ) : step === 1 ? (
            /* TAHAP 1: INPUT EMAIL */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#00a699] hover:bg-[#008f84] text-white rounded-md font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>{t.send_reset_otp}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="text-xs text-[#00a699] hover:underline font-semibold cursor-pointer"
                >
                  {t.back_to_login}
                </button>
              </div>
            </form>
          ) : (
            /* TAHAP 2: INPUT OTP & PASSWORD BARU */
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  {t.otp_code_label}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  required
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-center tracking-widest text-base font-bold bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  {t.new_password_label}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.new_password_label}
                  required
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  {t.confirm_new_password_label}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirm_new_password_label}
                  required
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm bg-background border border-border/90 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Ganti Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-[#00a699] hover:underline font-semibold cursor-pointer disabled:opacity-50 disabled:no-underline"
                >
                  {resendCooldown > 0
                    ? `Kirim ulang (${resendCooldown}s)`
                    : 'Kirim Ulang OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#00a699] hover:bg-[#008f84] text-white rounded-md font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memperbarui Sandi...</span>
                  </>
                ) : (
                  <span>{t.save_new_password_btn}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
