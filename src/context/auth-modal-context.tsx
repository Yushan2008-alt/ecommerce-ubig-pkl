'use client'

import React, { createContext, useContext, useState, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { LoginModal } from '@/components/auth/login-modal'

interface AuthModalContextType {
  isLoginModalOpen: boolean
  openLoginModal: (next?: string) => void
  closeLoginModal: () => void
  nextUrl: string
}

const defaultAuthModalContext: AuthModalContextType = {
  isLoginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  nextUrl: '/',
}

const AuthModalContext = createContext<AuthModalContextType>(defaultAuthModalContext)

function AuthModalInner({ children }: { children: React.ReactNode }) {
  const [manualOpen, setManualOpen] = useState(false)
  const [manualNextUrl, setManualNextUrl] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isQueryLogin = searchParams.get('auth') === 'login'
  const isLoginModalOpen = manualOpen || isQueryLogin
  const nextUrl = manualNextUrl ?? searchParams.get('next') ?? '/'

  const openLoginModal = (next?: string) => {
    if (next) {
      setManualNextUrl(next)
    } else {
      setManualNextUrl(pathname || '/')
    }
    setManualOpen(true)
  }

  const closeLoginModal = () => {
    setManualOpen(false)
    setManualNextUrl(null)
    if (searchParams.get('auth') === 'login') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('auth')
      const newQuery = params.toString() ? `?${params.toString()}` : ''
      router.replace(`${pathname}${newQuery}`)
    }
  }

  return (
    <AuthModalContext.Provider
      value={{
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        nextUrl,
      }}
    >
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        next={nextUrl}
      />
    </AuthModalContext.Provider>
  )
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AuthModalInner>{children}</AuthModalInner>
    </Suspense>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  return context || defaultAuthModalContext
}
