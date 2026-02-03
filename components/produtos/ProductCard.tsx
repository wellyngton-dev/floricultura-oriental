'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const precoValido = typeof preco === 'number' && !isNaN(preco) ? preco : 0

  // 🆕 Preparar array de imagens ordenadas
  const todasImagens = imagens.length > 0 
    ? [...imagens].sort((a, b) => a.ordem - b.ordem)
    : imagemUrl 
    ? [{ id: 'default', url: imagemUrl, ordem: 0, principal: true }]
    : []

  const imagemAtual = todasImagens[currentImageIndex]?.url || '/placeholder-flower.jpg'
  const temMultiplasImagens = todasImagens.length > 1

  // 🆕 Funções de navegação
  const proximaImagem = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % todasImagens.length)
  }

  const imagemAnterior = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + todasImagens.length) % todasImagens.length)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-floral-pink/20 hover:border-floral-coral/40 flex flex-col h-full">
      {/* Imagem com Carrossel */}
      <div className="relative aspect-square overflow-hidden bg-gradient-soft">
        {!imageError && imagemAtual ? (
          <>
            <Image
              src={imagemAtual}
              alt={`${nome} - imagem ${currentImageIndex + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />

            {/* 🆕 Controles do Carrossel */}
            {temMultiplasImagens && (
              <>
                {/* Botão Anterior */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={imagemAnterior}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 shadow-md z-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Botão Próxima */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={proximaImagem}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 shadow-md z-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Indicadores de Imagem */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {todasImagens.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'w-6 bg-white'
                          : 'w-1.5 bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Ver imagem ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🌸</div>
              <p className="text-xs text-muted-foreground">Imagem indisponível</p>
            </div>
          </div>
        )}

        <Badge className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-floral-pink border-floral-pink/30 hover:bg-white z-10">
          {categoria}
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(id)}
          className={`absolute top-3 right-3 rounded-full backdrop-blur-sm transition-all z-10 ${
            isFavorite
              ? 'bg-floral-pink text-white hover:bg-floral-pink/90'
              : 'bg-white/95 text-foreground hover:bg-white hover:text-floral-pink'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm z-10">
          <Star className="h-3 w-3 fill-floral-peach text-floral-peach" />
          <span className="text-xs font-semibold text-foreground">4.8</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-foreground mb-2 line-clamp-2 min-h-[3rem]">
          {nome}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
          {descricao}
        </p>

        <div className="flex-1" />

        <div className="space-y-3 mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-floral-terracota">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(precoValido)}
            </span>
            <span className="text-xs text-muted-foreground">à vista</span>
          </div>

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
