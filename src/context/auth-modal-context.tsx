'use client'

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react'
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [nextUrl, setNextUrl] = useState('/')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Buka modal secara otomatis jika URL memiliki query parameter ?auth=login
  useEffect(() => {
    if (searchParams.get('auth') === 'login') {
      const next = searchParams.get('next') || '/'
      setNextUrl(next)
      setIsLoginModalOpen(true)
    }
  }, [searchParams])

  const openLoginModal = (next?: string) => {
    if (next) {
      setNextUrl(next)
    } else {
      setNextUrl(pathname || '/')
    }
    setIsLoginModalOpen(true)
  }

  const closeLoginModal = () => {
    setIsLoginModalOpen(false)
    // Jika URL memiliki parameter auth=login, bersihkan dari URL tanpa reload
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
