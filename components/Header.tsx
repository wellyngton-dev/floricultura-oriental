'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { ShoppingBag, Heart, User, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'

interface HeaderProps {
  onCartClick: () => void
  onFavoritesClick: () => void
}

export function Header({ onCartClick, onFavoritesClick }: HeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { totalItems } = useCart()
  const { favorites } = useFavorites()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="sm:hidden">
              <Logo size="sm" variant="light" priority />
            </div>
            <div className="hidden sm:block">
              <Logo size="md" variant="light" priority />
            </div>
          </Link>

          {/* Ações */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Favoritos */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 sm:h-10 sm:w-10"
              onClick={onFavoritesClick}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-semibold">
                  {favorites.length}
                </span>
              )}
            </Button>

            {/* Login/Perfil */}
            {session ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    router.push(session.user.role === 'admin' ? '/admin' : '/cliente/pedidos')
                  }}
                  className="hidden md:flex"
                >
                  <User className="h-4 w-4 mr-2" />
                  {session.user.name}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    router.push(session.user.role === 'admin' ? '/admin' : '/cliente/pedidos')
                  }}
                  title={session.user.role === 'admin' ? 'Painel Admin' : 'Meus Pedidos'}
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  title="Sair"
                  className="hidden sm:flex h-10 w-10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/login')}
                title="Entrar"
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <User className="h-4 w-4" />
              </Button>
            )}

            {/* Carrinho */}
            <Button
              onClick={onCartClick}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 relative h-9 sm:h-10 px-3 sm:px-4"
              size="sm"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Carrinho</span>
              {totalItems > 0 && (
                <span className="ml-1 sm:ml-2 bg-white text-pink-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
