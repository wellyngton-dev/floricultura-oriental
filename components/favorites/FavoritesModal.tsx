'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Heart, ShoppingCart, X, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'

interface Produto {
  id: string
  nome: string
  descricao: string
  categoria: string
  preco: number
  imagemUrl?: string
  imagens?: {
    id: string
    url: string
    ordem: number
    principal: boolean
  }[]
  ativo: boolean
}

interface FavoritesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FavoritesModal({ open, onOpenChange }: FavoritesModalProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const { addItem } = useCart()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && favorites.length > 0) {
      fetchFavoriteProducts()
    }
  }, [open, favorites])

  const fetchFavoriteProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/produtos')
      const allProducts = await response.json()
      const favoriteProducts = allProducts.filter((p: Produto) =>
        favorites.includes(p.id)
      )
      setProdutos(favoriteProducts)
    } catch (error) {
      console.error('Erro ao buscar produtos favoritos:', error)
      toast.error('Erro ao carregar favoritos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (produto: Produto) => {
    const imagemPrincipal =
      produto.imagens?.find((img) => img.principal)?.url ||
      produto.imagens?.[0]?.url ||
      produto.imagemUrl ||
      ''

    addItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagemUrl: imagemPrincipal,
    })

    toast.success(`${produto.nome} adicionado ao carrinho!`)
  }

  const handleRemoveFavorite = (id: string) => {
    toggleFavorite(id)
    toast.success('Removido dos favoritos')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
            Meus Favoritos
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando favoritos...</p>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-100 rounded-full mb-4">
              <Heart className="h-10 w-10 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Adicione produtos aos favoritos clicando no coração ❤️
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Explorar Produtos
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {produtos.map((produto) => {
                const imagemPrincipal =
                  produto.imagens?.find((img) => img.principal)?.url ||
                  produto.imagens?.[0]?.url ||
                  produto.imagemUrl

                return (
                  <div
                    key={produto.id}
                    className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Imagem */}
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {imagemPrincipal ? (
                        <Image
                          src={imagemPrincipal}
                          alt={produto.nome}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🌸
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {produto.nome}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {produto.descricao}
                      </p>
                      <p className="text-lg font-bold text-pink-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(produto.preco)}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(produto)}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFavorite(produto.id)}
                        className="text-gray-600 hover:text-red-600 hover:border-red-300"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer com estatísticas */}
        {favorites.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 text-center">
              {favorites.length} {favorites.length === 1 ? 'produto favorito' : 'produtos favoritos'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
