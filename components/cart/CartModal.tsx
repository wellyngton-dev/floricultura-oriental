'use client'

import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Trash2, X, Plus, Minus } from 'lucide-react'
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

    // Fechar ao clicar fora
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

    const handleCheckout = () => {
        onOpenChange(false)
        router.push('/checkout')
    }

    if (!open) return null

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/20 z-50" onClick={() => onOpenChange(false)} />

            {/* Modal */}
            <div
                ref={modalRef}
                className="fixed top-[72px] right-4 z-50 w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-pink-600" />
                        MINHA SACOLA
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="h-8 w-8 rounded-full hover:bg-gray-100"
                    >
                    </Button>
                </div>

                {items.length === 0 ? (
                    <div className="py-12 text-center px-4">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Sua sacola está vazia</p>
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="mt-4"
                        >
                            Continuar Comprando
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Lista de Itens */}
                        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3 pb-4 border-b last:border-0">
                                    {/* Imagem */}
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {item.imagemUrl ? (
                                            <Image
                                                src={item.imagemUrl}
                                                alt={item.nome}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Informações */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
                                                {item.nome}
                                            </h4>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-gray-400 hover:text-red-600 flex-shrink-0"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <p className="text-sm font-semibold text-gray-900 mb-2">
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }).format(item.preco)}
                                        </p>

                                        {/* Controle de Quantidade */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Quantidade:</span>
                                            <div className="flex items-center gap-1 border rounded-md">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:bg-gray-100"
                                                    onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                                                    disabled={item.quantidade <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm font-medium w-8 text-center">
                                                    {item.quantidade}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:bg-gray-100"
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

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-600">
                                    Total ({totalItems} {totalItems === 1 ? 'item' : 'itens'}):
                                </span>
                                <span className="text-2xl font-bold text-green-700">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    }).format(totalPrice)}
                                </span>
                            </div>

                            <p className="text-xs text-gray-500 mb-3 text-center">
                                Valor sem frete
                            </p>

                            {/* Botões */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="w-full"
                                >
                                    Ver sacola
                                </Button>
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full bg-green-700 hover:bg-green-800 text-white"
                                >
                                    Fechar pedido
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* Botão X no canto superior direito (adicional) */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    <X className="h-4 w-4 text-gray-600" />
                </button>
            </div>
        </>
    )
}
