'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/contexts/CartContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <FavoritesProvider>
          {children}
          <Toaster position="top-right" richColors />
        </FavoritesProvider>
      </CartProvider>
    </SessionProvider>
  )
}
