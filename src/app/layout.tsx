import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/context/language-context'
import { CartWishlistProvider } from '@/context/cart-wishlist-context'
import { AuthModalProvider } from '@/context/auth-modal-context'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Tempatnya Segala Kebutuhan | Krafita',
  description:
    'Marketplace multi-vendor terpadu untuk produk fisik berkualitas dan aset digital resmi dengan pembayaran Midtrans.',
    icons: {
      icon: '/icon.png',
      apple: '/icon.png',
    },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${geistMono.variable} font-sans min-h-screen w-full max-w-full overflow-x-hidden antialiased`}
    >
      <body className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-background text-foreground font-sans" suppressHydrationWarning>
        <LanguageProvider>
          <AuthModalProvider>
            <CartWishlistProvider>
              {children}
              <Toaster position="top-right" />
            </CartWishlistProvider>
          </AuthModalProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
