'use client'

import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { ShoppingBag, X, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

interface CartModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartModal({ open, onOpenChange }: CartModalProps) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onOpenChange])

  // Bloquear scroll do body quando modal estiver aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleCheckout = () => {
    onOpenChange(false)
    router.push('/checkout')
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" 
        onClick={() => onOpenChange(false)} 
      />

      {/* Modal - RESPONSIVIDADE CORRIGIDA */}
      <div
        ref={modalRef}
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-pink-50 to-purple-50">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
            MINHA SACOLA
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full hover:bg-white/80"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-pink-50 rounded-full p-6 mb-4">
              <ShoppingBag className="h-16 w-16 text-pink-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Sua sacola está vazia
            </h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Adicione produtos incríveis à sua sacola
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Continuar Comprando
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de Itens - Scrollável */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4 pb-4 border-b last:border-0">
                  {/* Imagem */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 flex-shrink-0 shadow-md">
                    {item.imagemUrl ? (
                      <Image
                        src={item.imagemUrl}
                        alt={item.nome}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-pink-300" />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
                        {item.nome}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 rounded-full"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-base sm:text-lg font-bold text-pink-600 mb-3">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.preco)}
                    </p>

                    {/* Controle de Quantidade */}
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-xs text-gray-500">Qtd:</span>
                      <div className="flex items-center gap-1 border-2 border-gray-200 rounded-lg bg-white shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-pink-50 hover:text-pink-600 rounded-l-lg"
                          onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold w-10 text-center">
                          {item.quantidade}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-pink-50 hover:text-pink-600 rounded-r-lg"
                          onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Fixo no bottom */}
            <div className="p-4 sm:p-6 border-t bg-gradient-to-br from-gray-50 to-white shadow-inner">
              <div className="bg-white rounded-lg p-4 border-2 border-gray-100 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Total ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totalPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Sem frete</p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                >
                  Finalizar Pedido
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full border-2"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
