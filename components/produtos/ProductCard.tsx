'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'

interface ProdutoImagem {
  id: string
  url: string
  ordem: number
  principal: boolean
}

interface ProductCardProps {
  id: string
  nome: string
  descricao: string
  categoria: string
  preco: number
  imagemUrl?: string
  imagens?: ProdutoImagem[]
  onAddToCart: () => void
}

export function ProductCard({
  id,
  nome,
  descricao,
  categoria,
  preco,
  imagemUrl,
  imagens = [],
  onAddToCart,
}: ProductCardProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const isFavorite = favorites.includes(id)
  const [imageError, setImageError] = useState(false)

  const imagemPrincipal =
    imagens.find((img) => img.principal)?.url ||
    imagens[0]?.url ||
    imagemUrl ||
    '/placeholder-flower.jpg'

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-pink-100 hover:border-pink-300 flex flex-col h-full">
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
        {!imageError && imagemPrincipal ? (
          <Image
            src={imagemPrincipal}
            alt={nome}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🌸</div>
              <p className="text-xs text-gray-400">Imagem indisponível</p>
            </div>
          </div>
        )}

        {/* Badge de Categoria */}
        <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-pink-600 border-pink-200">
          {categoria}
        </Badge>

        {/* Botão Favorito */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(id)}
          className={`absolute top-3 right-3 rounded-full backdrop-blur-sm transition-all ${
            isFavorite
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-pink-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {/* Avaliação */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-gray-700">4.8</span>
        </div>
      </div>

      {/* Conteúdo - flex-1 para preencher espaço disponível */}
      <div className="p-4 flex flex-col flex-1">
        {/* Nome - altura fixa com line-clamp */}
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
          {nome}
        </h3>

        {/* Descrição - altura fixa com line-clamp */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
          {descricao}
        </p>

        {/* Espaçador flexível para empurrar preço e botão para baixo */}
        <div className="flex-1" />

        {/* Preço e Botão - sempre no final */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-700">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(preco)}
            </span>
            <span className="text-xs text-gray-500">à vista</span>
          </div>

          <Button
            onClick={onAddToCart}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 transition-all"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </Card>
  )
}
