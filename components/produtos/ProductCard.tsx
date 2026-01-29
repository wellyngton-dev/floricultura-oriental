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

  // ✅ Validação de preço
  const precoValido = typeof preco === 'number' && !isNaN(preco) ? preco : 0

  const imagemPrincipal =
    imagens.find((img) => img.principal)?.url ||
    imagens[0]?.url ||
    imagemUrl ||
    '/placeholder-flower.jpg'

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-floral-pink/20 hover:border-floral-coral/40 flex flex-col h-full">
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-gradient-soft">
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
              <p className="text-xs text-muted-foreground">Imagem indisponível</p>
            </div>
          </div>
        )}

        {/* Badge de Categoria */}
        <Badge className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-floral-pink border-floral-pink/30 hover:bg-white">
          {categoria}
        </Badge>

        {/* Botão Favorito */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(id)}
          className={`absolute top-3 right-3 rounded-full backdrop-blur-sm transition-all ${
            isFavorite
              ? 'bg-floral-pink text-white hover:bg-floral-pink/90'
              : 'bg-white/95 text-foreground hover:bg-white hover:text-floral-pink'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {/* Avaliação */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          <Star className="h-3 w-3 fill-floral-peach text-floral-peach" />
          <span className="text-xs font-semibold text-foreground">4.8</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        {/* Nome */}
        <h3 className="font-bold text-foreground mb-2 line-clamp-2 min-h-[3rem]">
          {nome}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
          {descricao}
        </p>

        {/* Espaçador */}
        <div className="flex-1" />

        {/* Preço e Botão */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-baseline gap-2">
            {/* ✅ NOVA COR: Terracota em vez de verde */}
            <span className="text-2xl font-bold text-floral-terracota">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(precoValido)}
            </span>
            <span className="text-xs text-muted-foreground">à vista</span>
          </div>

          {/* ✅ NOVO GRADIENTE: Mais suave */}
          <Button
            onClick={onAddToCart}
            className="w-full bg-gradient-floral hover:opacity-90 text-white shadow-lg shadow-floral-pink/30 hover:shadow-floral-pink/50 transition-all"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </Card>
  )
}
