import 'server-only'
import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })
}

export async function sendOtpEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('[Mail Warning] MAIL_USER atau MAIL_PASS belum dikonfigurasi di .env.local. Kode OTP pengujian:', code)
      return { success: true }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kode Verifikasi Akun Anda</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #09090b; margin: 0;">Krafita</h1>
              <p style="font-size: 14px; color: #71717a; margin-top: 6px;">Verifikasi Pendaftaran Akun Anda</p>
            </div>
            
            <p style="font-size: 15px; line-height: 24px; margin-bottom: 20px;">
              Halo, terima kasih telah mendaftar di Krafita. Gunakan kode OTP 6-digit berikut untuk menyelesaikan proses verifikasi pendaftaran akun Anda:
            </p>

            <div style="background-color: #f4f4f5; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #00a699;">
                ${code}
              </span>
            </div>

            <p style="font-size: 13px; color: #71717a; line-height: 20px; margin-bottom: 24px;">
              Kode ini berlaku selama <strong>10 menit</strong>. Jangan pernah membagikan kode rahasia ini kepada siapa pun, termasuk pihak yang mengatasnamakan Krafita.
            </p>

            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />

            <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin: 0;">
              Jika Anda tidak merasa mendaftar di platform kami, silakan abaikan email ini secara aman.
            </p>
          </div>
        </body>
      </html>
    `

    const transporter = getTransporter()
    await transporter.sendMail({
      from: process.env.MAIL_FROM || `"Krafita" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `[${code}] Kode Verifikasi Pendaftaran Krafita`,
      html: htmlContent,
    })

    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengirim email OTP'
    console.error('[Nodemailer Error]', errorMsg)
    return { success: false, error: errorMsg }
  }
}

export async function sendPasswordResetOtpEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn(
        '[Mail Warning] MAIL_USER atau MAIL_PASS belum dikonfigurasi di .env.local. Kode OTP Reset Password:',
        code
      )
      return { success: true }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kode Pemulihan Kata Sandi Anda</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #09090b; margin: 0;">Marketplace Ubig</h1>
              <p style="font-size: 14px; color: #71717a; margin-top: 6px;">Permintaan Atur Ulang Kata Sandi</p>
            </div>
            
            <p style="font-size: 15px; line-height: 24px; margin-bottom: 20px;">
              Halo, kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di Marketplace Ubig. Gunakan kode OTP 6-digit berikut untuk melanjutkan:
            </p>

            <div style="background-color: #f4f4f5; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #00a699;">
                ${code}
              </span>
            </div>

            <p style="font-size: 13px; color: #71717a; line-height: 20px; margin-bottom: 24px;">
              Kode ini berlaku selama <strong>10 menit</strong>. Jangan pernah membagikan kode rahasia ini kepada siapa pun.
            </p>

            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />

            <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin: 0;">
              Jika Anda tidak meminta pengaturan ulang kata sandi, akun Anda tetap aman dan Anda dapat mengabaikan email ini.
            </p>
          </div>
        </body>
      </html>
    `

    const transporter = getTransporter()
    await transporter.sendMail({
      from: process.env.MAIL_FROM || `"Krafita" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `[${code}] Kode Pemulihan Kata Sandi Krafita`,
      html: htmlContent,
    })

    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengirim email OTP'
    console.error('[Nodemailer Error]', errorMsg)
    return { success: false, error: errorMsg }
  }
}

